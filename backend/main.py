"""莨珠记·云纱智境 H5 后端；Python 3.10+，FastAPI + SQLite。

复用云纱智境既有接口，并扩展 UE4 虚拟引擎联动接口。
"""
from __future__ import annotations
import os
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from contextlib import contextmanager, asynccontextmanager
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from realtime import router as realtime_router   # WebSocket 数字孪生通道
from rag import rag_answer                        # 大模型 RAG 问答

# 数据（与前端 js/data.js 保持一致）
POINTS = [
    {"id": "HALL", "name": "莨珠记主馆", "subtitle": "理论研学 · 布匹展陈", "icon": "馆", "x": 68, "y": 62},
    {"id": "WORKSHOP", "name": "染整工作坊", "subtitle": "原料处理 · 工艺学习", "icon": "坊", "x": 32, "y": 32},
    {"id": "DRYING_FIELD", "name": "草地晒莨场", "subtitle": "平铺晒莨 · 场地观察", "icon": "晒", "x": 62, "y": 22},
    {"id": "RIVER", "name": "河涌泥料区", "subtitle": "水乡环境 · 泥料知识", "icon": "涌", "x": 14, "y": 78},
]

COURSES = [
    {"id": "YS_COURSE_001", "name": "莨珠记·寻纱之旅", "subtitle": "四区研学任务", "duration": "约20分钟"},
]

TASKS = [
    {"id": "TASK_HALL", "point_id": "HALL", "title": "认识研学主馆", "type": "single_choice",
     "question": "莨珠记主馆在本项目中主要承担什么用途？",
     "options": [{"id": "A", "text": "香云纱理论研学与布匹展示"}, {"id": "B", "text": "河涌取泥作业"}, {"id": "C", "text": "露天大面积晒布"}],
     "answer": "A", "explanation": "本项目将主馆规划为理论学习、非遗展示和布匹展示的公共研学场所。", "score": 25},
    {"id": "TASK_WORKSHOP", "point_id": "WORKSHOP", "title": "认识工作坊", "type": "single_choice",
     "question": "在空间设计中，卷布整理与湿作业设施应该怎样安排？",
     "options": [{"id": "A", "text": "全部摆在同一张教学桌上"}, {"id": "B", "text": "按作业需求划分湿作业区与整理区"}, {"id": "C", "text": "全部安排在河涌水面"}],
     "answer": "B", "explanation": "工作坊按生产用途合理分区，具体工位由基地现场核实。", "score": 25},
    {"id": "TASK_DRYING", "point_id": "DRYING_FIELD", "title": "观察草地晒场", "type": "single_choice",
     "question": "根据传统晒莨场的特点，布匹的主要摆放方式是？",
     "options": [{"id": "A", "text": "直接平铺在草地上"}, {"id": "B", "text": "全部挂在高架上"}, {"id": "C", "text": "堆放在室内木箱中"}],
     "answer": "A", "explanation": "本项目重点还原直接铺草地的晒莨场景。", "score": 25},
    {"id": "TASK_RIVER", "point_id": "RIVER", "title": "认识河涌与泥料", "type": "single_choice",
     "question": "在数字场景中，河涌与泥料处理区应如何表达？",
     "options": [{"id": "A", "text": "河泥处理必定在河里直接完成"}, {"id": "B", "text": "河涌、取泥与实际过泥工位可分开表现"}, {"id": "C", "text": "无需设置任何泥料相关知识"}],
     "answer": "B", "explanation": "河涌、泥料来源和具体过泥工位存在联系，但不应未经调研就认定都在河里进行。", "score": 25},
]

KNOWLEDGE = [
    {"id": "K01", "point_id": "HALL", "title": "认识香云纱", "category": "非遗认知",
     "text": "香云纱是具有岭南地域特色的传统丝绸面料，以蚕丝坯绸为底，经薯莨汁液浸染、河泥媒染与反复晒莨而成。", "reviewed": False},
    {"id": "K02", "point_id": "HALL", "title": "主馆的研学功能", "category": "空间认知",
     "text": "莨珠记主馆设计为理论学习、布匹陈列和数字研学入口，镬耳屋风格体现岭南建筑特色。", "reviewed": False},
    {"id": "K03", "point_id": "WORKSHOP", "title": "工坊中的湿作业区", "category": "工坊观察",
     "text": "工坊需考虑材料处理、浸染、煮绸、过泥和清洗等工艺相关设施的空间组织。", "reviewed": False},
    {"id": "K04", "point_id": "WORKSHOP", "title": "卷布整理与仓储", "category": "工坊观察",
     "text": "工艺完成后的布匹需要检查、整理、卷布与存放等环节，是品质控制的最后一环。", "reviewed": False},
    {"id": "K05", "point_id": "DRYING_FIELD", "title": "草地晒场的空间特点", "category": "晒场观察",
     "text": "晒莨场是大面积开阔草地，成组平铺的长条布幅间留有作业通道。", "reviewed": False},
    {"id": "K06", "point_id": "DRYING_FIELD", "title": "为什么强调晒场尺度？", "category": "数字场景",
     "text": "草地晒场在基地视觉与生产空间中占据重要位置，UE4场景应优先表现其开阔尺度。", "reviewed": False},
    {"id": "K07", "point_id": "RIVER", "title": "河涌与泥料", "category": "地域环境",
     "text": "顺德水乡环境与香云纱工艺中的河泥使用有关，需区分河涌环境、取泥来源与过泥操作空间。", "reviewed": False},
    {"id": "K08", "point_id": "RIVER", "title": "泥料区的安全研学", "category": "安全认知",
     "text": "研学者应在安全观摩区域学习，不应未经工作人员许可接近河岸、取泥或生产操作设施。", "reviewed": False},
    {"id": "K09", "point_id": "HALL", "title": "薯莨：天然植物染料", "category": "非遗认知",
     "text": "薯莨是香云纱染色的核心原料，其块茎富含单宁，是天然的植物染料。", "reviewed": False},
    {"id": "K10", "point_id": "WORKSHOP", "title": "三蒸九煮十八晒", "category": "非遗认知",
     "text": "「三蒸九煮十八晒」概括了香云纱反复浸染、蒸煮与晾晒的繁复工序。", "reviewed": False},
    {"id": "K11", "point_id": "DRYING_FIELD", "title": "晒莨：阳光的魔法", "category": "晒场观察",
     "text": "晒莨是香云纱固色的关键，阳光与空气共同作用，让染料与纤维结合。", "reviewed": False},
    {"id": "K12", "point_id": "HALL", "title": "非遗传承的意义", "category": "非遗认知",
     "text": "香云纱染整技艺是国家级非物质文化遗产，承载着岭南的匠心与文化记忆。", "reviewed": False},
]

BASE = Path(__file__).resolve().parent
DATABASE_PATH = lambda: Path(os.getenv("YUNSHA_DB", str(BASE / "data" / "yunsha.db")))

UE_API_KEY = os.getenv("YUNSHA_UE_API_KEY", "CHANGE_ME_FOR_DEPLOYMENT")


@contextmanager
def db():
    db_path = DATABASE_PATH()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(db_path, timeout=15)
    c.row_factory = sqlite3.Row
    try:
        yield c
        c.commit()
    finally:
        c.close()


def init_db():
    with db() as c:
        c.execute("CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, created_at TEXT NOT NULL)")
        c.execute("""CREATE TABLE IF NOT EXISTS records (
            event_id TEXT PRIMARY KEY, session_id TEXT NOT NULL, task_id TEXT NOT NULL,
            answer TEXT NOT NULL, correct INTEGER NOT NULL, score INTEGER NOT NULL, created_at TEXT NOT NULL)""")
        c.execute("""CREATE TABLE IF NOT EXISTS ue_events (
            event_id TEXT PRIMARY KEY, session_id TEXT NOT NULL, task_id TEXT NOT NULL,
            point_id TEXT, course_id TEXT, operation_result TEXT NOT NULL, created_at TEXT NOT NULL)""")
        c.execute("CREATE INDEX IF NOT EXISTS idx_records_session ON records(session_id)")
        c.execute("CREATE INDEX IF NOT EXISTS idx_ue_session ON ue_events(session_id)")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="云纱智境 · 研学接口", version="1.3.0", lifespan=lifespan)

# HBuilderX 真机 / 局域网联调需要跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册 WebSocket / 实时遥测路由（数字孪生双向通道）
app.include_router(realtime_router)

# 幂等建表：既覆盖 uvicorn 的 lifespan，也保证 TestClient / 直接 import 时表已存在
init_db()


class SubmitRecord(BaseModel):
    event_id: str = Field(min_length=8, max_length=100)
    session_id: str = Field(min_length=8, max_length=100)
    task_id: str = Field(min_length=4, max_length=64)
    answer: str = Field(min_length=1, max_length=16)


class HistoryItem(BaseModel):
    role: str
    content: str


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)   # 允许单字提问，像正常 AI 一样不挑输入
    point_id: str | None = None
    history: list[HistoryItem] = []   # 多轮对话上下文


class UeEvent(BaseModel):
    event_id: str = Field(min_length=8, max_length=100)
    session_id: str = Field(min_length=8, max_length=100)
    task_id: str = Field(min_length=4, max_length=64)
    point_id: str = Field(min_length=2, max_length=64)
    course_id: str = Field(min_length=2, max_length=64)
    operation_result: str = Field(min_length=4, max_length=32)


@app.get("/api/health")
def health():
    from rag import LLM_API_KEY, LLM_MODEL
    return {
        "ok": True, "service": "云纱智境研学API", "version": "1.3.0",
        "websocket": "/ws/ue/{session_id}",
        "llm_enabled": bool(LLM_API_KEY),
        "llm_model": LLM_MODEL if LLM_API_KEY else None,
    }


@app.get("/api/points")
def points():
    return POINTS


@app.get("/api/courses")
def courses():
    return COURSES


@app.get("/api/tasks")
def tasks():
    return [{k: v for k, v in t.items() if k != "answer"} for t in TASKS]


@app.get("/api/knowledge")
def knowledge(point_id: str | None = None):
    if point_id and point_id not in {p["id"] for p in POINTS}:
        raise HTTPException(404, "点位不存在")
    return [k for k in KNOWLEDGE if not point_id or k["point_id"] == point_id]


@app.post("/api/sessions", status_code=201)
def create_session():
    sid = "YS-" + uuid.uuid4().hex[:16].upper()
    with db() as c:
        c.execute("INSERT INTO sessions(id, created_at) VALUES (?,?)", (sid, datetime.now(timezone.utc).isoformat()))
    return {"session_id": sid, "course_id": COURSES[0]["id"]}


def check_session(c, sid):
    if not c.execute("SELECT 1 FROM sessions WHERE id=?", (sid,)).fetchone():
        raise HTTPException(404, "体验编号不存在")


@app.post("/api/records")
def submit_record(data: SubmitRecord):
    task = next((t for t in TASKS if t["id"] == data.task_id), None)
    if not task:
        raise HTTPException(404, "任务不存在")
    if data.answer not in {o["id"] for o in task["options"]}:
        raise HTTPException(422, "答案选项无效")
    correct = data.answer == task["answer"]
    score = task["score"] if correct else 0
    with db() as c:
        check_session(c, data.session_id)
        old = c.execute("SELECT * FROM records WHERE event_id=?", (data.event_id,)).fetchone()
        if old:
            if old["session_id"] != data.session_id or old["task_id"] != data.task_id or old["answer"] != data.answer:
                raise HTTPException(409, "event_id已被其他事件使用")
            return {"event_id": data.event_id, "correct": bool(old["correct"]), "score_awarded": old["score"], "duplicate": True, "explanation": task["explanation"]}
        c.execute("INSERT INTO records VALUES(?,?,?,?,?,?,?)",
                  (data.event_id, data.session_id, data.task_id, data.answer, int(correct), score, datetime.now(timezone.utc).isoformat()))
    return {"event_id": data.event_id, "correct": correct, "score_awarded": score, "duplicate": False, "explanation": task["explanation"]}


@app.post("/api/ue/events")
def ue_event(data: UeEvent, x_ue_key: str | None = Header(default=None)):
    if x_ue_key != UE_API_KEY:
        raise HTTPException(401, "UE 认证失败")
    with db() as c:
        check_session(c, data.session_id)
        old = c.execute("SELECT 1 FROM ue_events WHERE event_id=?", (data.event_id,)).fetchone()
        if old:
            raise HTTPException(409, "事件重复")
        c.execute("INSERT INTO ue_events VALUES(?,?,?,?,?,?,?)",
                  (data.event_id, data.session_id, data.task_id, data.point_id, data.course_id,
                   data.operation_result, datetime.now(timezone.utc).isoformat()))
    return {"ok": True, "event_id": data.event_id, "operation_result": data.operation_result}


@app.get("/api/sessions/{sid}/progress")
def progress(sid: str):
    with db() as c:
        check_session(c, sid)
        rows = c.execute("SELECT * FROM records WHERE session_id=? ORDER BY created_at", (sid,)).fetchall()
    best = {}
    for r in rows:
        r = dict(r)
        if r["task_id"] not in best or r["score"] > best[r["task_id"]]["score"]:
            best[r["task_id"]] = r
    total = sum(r["score"] for r in best.values())
    return {"session_id": sid, "completed": len([r for r in best.values() if r["correct"]]),
            "total_tasks": len(TASKS), "score": total, "max_score": sum(t["score"] for t in TASKS),
            "records_count": len(rows)}


@app.get("/api/sessions/{sid}/report")
def report(sid: str):
    p = progress(sid)
    with db() as c:
        check_session(c, sid)
        ue = c.execute("SELECT * FROM ue_events WHERE session_id=? ORDER BY created_at", (sid,)).fetchall()
    return {**p, "course_name": COURSES[0]["name"],
            "status": "完成" if p["completed"] == len(TASKS) else "研学中",
            "ue_events": [dict(u) for u in ue],
            "note": "成绩为本演示课程规则计算的学习结果，工艺知识及题目待基地审核。"}


@app.post("/api/ask")
async def ask(data: AskRequest):
    """大模型 RAG 问答：知识库检索 + 国产大模型生成 + 自动降级。"""
    if data.point_id and data.point_id not in {p["id"] for p in POINTS}:
        raise HTTPException(404, "点位不存在")
    history = [{"role": h.role, "content": h.content} for h in data.history]
    return await rag_answer(data.question, data.point_id, history)


@app.get("/")
def home():
    index = BASE.parent / "index.html"
    if index.exists():
        return FileResponse(index)
    return {"ok": True, "message": "云纱智境后端已启动，请访问 /docs 查看接口文档"}


# —— 让后端直接托管前端静态资源 ——
# 这样只要打开 http://127.0.0.1:8000 就能运行整站，前端与接口同源，
# 不用改任何地址、也不会遇到跨域问题（最适合本地演示 / 答辩）。
_ROOT = BASE.parent
for _sub in ("js", "css", "assets"):
    _dir = _ROOT / _sub
    if _dir.exists():
        app.mount("/" + _sub, StaticFiles(directory=str(_dir)), name="static_" + _sub)
