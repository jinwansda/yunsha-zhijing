"""云纱智境 · 数字孪生实时通信层（WebSocket）

协议（全部 JSON，UTF-8）：
  H5  --> Server --> UE   {"type":"command", "action":"...", "payload":{...}, "msg_id":"..."}
  UE  --> Server --> H5   {"type":"telemetry", "payload":{"lux":..., "humidity":..., ...}, "ts":...}
  UE  --> Server --> H5   {"type":"ack", "ref":"<msg_id>", "ok":true, "payload":{...}}
  either                  {"type":"ping"} / {"type":"pong"}
  Server --> all          {"type":"presence", "payload":{"h5":N,"ue":N}}

连接：ws(s)://<host>/ws/ue/{session_id}?role=h5|ue
同一 session_id 构成一个「房间」，H5 下发的指令只广播给该房间的 UE，
UE 上报的遥测只广播给该房间的 H5，实现真正的双向、按会话隔离。
"""
from __future__ import annotations
import asyncio
import json
import time
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter()


class Room:
    """一个研学会话的实时房间"""

    def __init__(self, sid: str):
        self.sid = sid
        self.h5: Set[WebSocket] = set()
        self.ue: Set[WebSocket] = set()
        self.latest: dict = {}          # 最近一次 UE 遥测
        self.command_log: list = []     # 最近 50 条指令（供大屏/回放）
        self.created = time.time()

    def all(self):
        return list(self.h5) + list(self.ue)


class Hub:
    def __init__(self):
        self.rooms: Dict[str, Room] = {}
        self.lock = asyncio.Lock()

    async def room(self, sid: str) -> Room:
        async with self.lock:
            if sid not in self.rooms:
                self.rooms[sid] = Room(sid)
            return self.rooms[sid]

    async def broadcast(self, room: Room, message: dict, targets=None):
        """向目标连接集合广播；自动剔除已断开的连接"""
        conns = targets if targets is not None else room.all()
        dead = []
        payload = json.dumps(message, ensure_ascii=False)
        for ws in list(conns):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            room.h5.discard(ws)
            room.ue.discard(ws)

    async def presence(self, room: Room):
        await self.broadcast(room, {
            "type": "presence",
            "payload": {"h5": len(room.h5), "ue": len(room.ue), "session_id": room.sid},
            "ts": int(time.time() * 1000),
        })


hub = Hub()


def _now_ms():
    return int(time.time() * 1000)


@router.websocket("/ws/ue/{session_id}")
async def ws_room(websocket: WebSocket, session_id: str, role: str = Query("h5")):
    """H5 与 UE 共用的实时通道。role=h5（研学端）或 role=ue（虚拟引擎端）。"""
    if role not in ("h5", "ue"):
        await websocket.close(code=4400, reason="role 必须是 h5 或 ue")
        return
    await websocket.accept()
    room = await hub.room(session_id)
    bucket = room.h5 if role == "h5" else room.ue
    bucket.add(websocket)
    await hub.presence(room)

    # 新接入的 H5 立刻拿到最近的 UE 环境参数，避免「连上后要等下一帧」
    if role == "h5" and room.latest:
        await websocket.send_text(json.dumps({
            "type": "telemetry", "payload": room.latest, "ts": _now_ms(), "replay": True
        }, ensure_ascii=False))

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"type": "error", "reason": "invalid json"}))
                continue

            mtype = msg.get("type")

            # ---- 心跳 ----
            if mtype == "ping":
                await websocket.send_text(json.dumps({"type": "pong", "ts": _now_ms()}))
                continue

            # ---- H5 下发指令给 UE ----
            if mtype == "command" and role == "h5":
                envelope = {
                    "type": "command",
                    "action": str(msg.get("action", "")),
                    "payload": msg.get("payload") or {},
                    "msg_id": msg.get("msg_id") or f"h5-{_now_ms()}",
                    "session_id": session_id,
                    "ts": _now_ms(),
                }
                room.command_log.append(envelope)
                room.command_log = room.command_log[-50:]
                await hub.broadcast(room, envelope, targets=list(room.ue))
                # 回执给发起方，便于 UI 显示「指令已下发」
                await hub.broadcast(room, {
                    "type": "command_sent", "ref": envelope["msg_id"],
                    "action": envelope["action"], "ts": envelope["ts"],
                }, targets=[websocket])
                continue

            # ---- UE 上报遥测（光照 / 湿度 / 温度 / 风速 / 降雨 / 点位） ----
            if mtype == "telemetry" and role == "ue":
                payload = msg.get("payload") or {}
                room.latest = {**payload, "_ts": _now_ms()}
                await hub.broadcast(room, {
                    "type": "telemetry", "payload": payload, "ts": _now_ms(),
                }, targets=list(room.h5))
                continue

            # ---- UE 对指令的确认 / 工艺操作结果 ----
            if mtype == "ack" and role == "ue":
                await hub.broadcast(room, {
                    "type": "ack", "ref": msg.get("ref"),
                    "ok": bool(msg.get("ok", True)),
                    "payload": msg.get("payload") or {}, "ts": _now_ms(),
                }, targets=list(room.h5))
                continue

            # 未知类型：原样回显，便于调试
            await websocket.send_text(json.dumps({"type": "echo", "received": msg}))

    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        bucket.discard(websocket)
        await hub.presence(room)


# ---------------------------------------------------------------- REST 兜底 / 演示注入
class TelemetryIn(BaseModel):
    lux: float | None = None          # 光照 lx
    humidity: float | None = None     # 相对湿度 %
    temp: float | None = None         # 气温 ℃
    wind: float | None = None         # 风速 m/s
    rain: bool = False                # 是否降雨
    point: str | None = None          # 当前点位
    note: str | None = None


@router.get("/api/realtime/status")
def realtime_status():
    """实时通道总览：房间数、在线连接、最近遥测（供老师端大屏 / 运维）"""
    return {
        "rooms": [
            {
                "session_id": r.sid,
                "h5": len(r.h5), "ue": len(r.ue),
                "latest": r.latest,
                "commands": len(r.command_log),
            }
            for r in hub.rooms.values()
        ],
        "total_h5": sum(len(r.h5) for r in hub.rooms.values()),
        "total_ue": sum(len(r.ue) for r in hub.rooms.values()),
    }


@router.get("/api/ue/telemetry/{session_id}")
def get_telemetry(session_id: str):
    r = hub.rooms.get(session_id)
    if not r or not r.latest:
        return {"ok": True, "telemetry": None, "hint": "尚无 UE 遥测数据"}
    return {"ok": True, "telemetry": r.latest}


@router.post("/api/ue/telemetry/{session_id}")
async def push_telemetry(session_id: str, data: TelemetryIn,
                         x_ue_key: str | None = Query(default=None)):
    """演示用：无 UE 引擎时，用 REST 注入一帧遥测，效果等同 UE 通过 WS 上报。

    生产环境应由 UE 直接走 WebSocket；此接口便于命令行 / Postman 联调。
    """
    room = await hub.room(session_id)
    payload = data.model_dump(exclude_none=True)
    room.latest = {**payload, "_ts": _now_ms()}
    await hub.broadcast(room, {"type": "telemetry", "payload": payload, "ts": _now_ms()},
                        targets=list(room.h5))
    return {"ok": True, "telemetry": room.latest, "h5_receivers": len(room.h5)}


@router.post("/api/ue/command/{session_id}")
async def rest_command(session_id: str, body: dict):
    """演示用：H5 未连 WS 时仍可下发指令（REST 降级通道）"""
    action = str(body.get("action", ""))
    if not action:
        raise HTTPException(422, "action 不能为空")
    room = await hub.room(session_id)
    envelope = {
        "type": "command", "action": action, "payload": body.get("payload") or {},
        "msg_id": f"rest-{_now_ms()}", "session_id": session_id, "ts": _now_ms(),
    }
    room.command_log.append(envelope)
    await hub.broadcast(room, envelope, targets=list(room.ue))
    return {"ok": True, "sent": envelope, "ue_receivers": len(room.ue)}
