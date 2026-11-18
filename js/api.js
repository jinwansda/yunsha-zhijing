/* ==========================================================================
   莨珠记 · 云纱智境 —— API 层
   --------------------------------------------------------------------------
   · REST：会话 / 判题 / 报告 / UE 事件
   · WebSocket：/ws/ue/{session_id} 与 UE 虚拟引擎双向实时通信
   · RAG 问答：/api/ask 支持多轮 history、引用来源、自动降级
   后端不可达时全部降级为本地离线模式，保证演示不中断。
   ========================================================================== */
"use strict";

var API = {
  base: "",             // REST 基址，默认同源；打包后可填 http://局域网IP:8000
  wsBase: "",           // WS 基址，留空时由 base 自动推导
  session_id: null,
  online: false,
  llmEnabled: false,

  /* 实时状态 */
  telemetry: null,      // 最近一帧 UE 环境参数
  wsState: "closed",    // closed | connecting | open | error
  _ws: null,
  _reconnect: 0,
  _heartbeat: null,
  _listeners: {},       // 事件总线：telemetry / ack / presence / status / command_sent

  /* ---------------------------------------------------------------- 事件总线 */
  on: function (evt, cb) {
    (this._listeners[evt] || (this._listeners[evt] = [])).push(cb);
    return this;
  },
  emit: function (evt, data) {
    (this._listeners[evt] || []).forEach(function (cb) {
      try { cb(data); } catch (e) { console.warn("WS listener", evt, e); }
    });
  },

  /* ---------------------------------------------------------------- 初始化 */
  /* 自动寻找后端：无论你是"双击 index.html 打开"、"用后端地址打开(http://127.0.0.1:8000)"
     还是"用其它本地服务器打开"，都能连上本机 8000 端口的后端。 */
  init: function (base) {
    var self = this;
    var conf = (typeof APP_CONFIG !== "undefined" && APP_CONFIG) || {};
    var LOCAL = conf.LOCAL_FALLBACK || "http://127.0.0.1:8000";
    var FIXED = String(conf.SERVER || "").replace(/\/+$/, "");   // 手动指定的服务器
    var candidates;

    if (base) {
      candidates = [base];
    } else if (FIXED) {
      // ① 配置了固定地址（局域网 IP / 公网域名）：只认它，打包成 APK 也靠这个
      candidates = [FIXED];
    } else if (typeof location !== "undefined" && (location.protocol === "file:" || location.protocol === "app:")) {
      // ② 双击文件 / APK 内运行：没有服务端，去找本机后端
      candidates = [LOCAL];
      if (typeof console !== "undefined") {
        console.info("[API] 当前以本地文件/APP 方式运行，正在尝试 " + LOCAL +
          "；若要在手机 APP 里连电脑后端，请在 js/config.js 里把 SERVER 填成电脑局域网地址。");
      }
    } else if (typeof location !== "undefined" && location.port === "8000") {
      // ③ 由后端自己托管整站（推荐）：同源即可
      candidates = [""];
    } else if (typeof location !== "undefined" && location.hostname &&
               location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
      // ④ 手机/别的电脑通过「http://192.168.x.x:其它端口」打开：
      //    先试同源（可能被反向代理到后端），再试同主机的 8000 端口
      candidates = conf.AUTO_TRY_8000 === false
        ? [""]
        : ["", "http://" + location.hostname + ":8000"];
    } else {
      // ⑤ 其它本地服务器：先试同源，不行再退回本机后端
      candidates = ["", LOCAL];
    }

    function tryOne(i) {
      if (i >= candidates.length) {
        self.base = "";
        self.online = false;
        self.llmEnabled = false;
        return Promise.resolve(false);
      }
      var b = candidates[i];
      self.base = b;
      self.wsBase = self._deriveWsBase(b);
      return self.fetch("/api/health", { timeout: 2000 })
        .then(function (r) {
          self.online = true;
          self.llmEnabled = !!r.llm_enabled;
          return true;
        })
        .catch(function () { return tryOne(i + 1); });
    }
    return tryOne(0);
  },

  /* 健壮性：如果页面是在后端启动之前打开的，online 会一直停在 false。
     这里在真正要用后端时再探一次（带 3 秒冷却，避免频繁请求），
     后端一旦起来就能自动恢复，不需要用户刷新页面。 */
  ensureOnline: function () {
    if (this.online) return Promise.resolve(true);
    if (this._probing) return this._probing;
    var now = Date.now();
    if (now - (this._lastProbe || 0) < 3000) return Promise.resolve(false);
    this._lastProbe = now;
    var self = this;
    this._probing = this.init(this.base || "").then(function (ok) {
      self._probing = null;
      if (ok && typeof window !== "undefined" && typeof renderStatus === "function") {
        try { renderStatus(); } catch (e) {}
      }
      return ok;
    }).catch(function () { self._probing = null; return false; });
    return this._probing;
  },

  _deriveWsBase: function (base) {
    if (!base) {
      // 同源：按当前页面协议推导
      var proto = location.protocol === "https:" ? "wss://" : "ws://";
      return proto + location.host;
    }
    return base.replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://").replace(/\/$/, "");
  },

  fetch: function (path, opt) {
    opt = opt || {};
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, opt.timeout || 6000);
    return fetch(this.base + path, {
      method: opt.method || "GET",
      headers: Object.assign({ "Content-Type": "application/json" }, opt.headers || {}),
      body: opt.body ? JSON.stringify(opt.body) : undefined,
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  },

  /* ---------------------------------------------------------------- WebSocket */
  /** 连接实时房间。sessionId 必须与 UE 端一致，才能收到对方的数据。 */
  connectWS: function (sessionId) {
    var self = this;
    if (typeof WebSocket === "undefined") { this._setState("error"); return false; }
    if (!sessionId) sessionId = this.session_id;
    if (!sessionId) return false;

    // 已连接同一会话则不重复建连
    if (this._ws && this.wsState === "open" && this._wsSession === sessionId) return true;
    if (this._ws) { try { this._ws.close(); } catch (e) {} }

    this._wsSession = sessionId;
    this._setState("connecting");
    var url = this.wsBase + "/ws/ue/" + encodeURIComponent(sessionId) + "?role=h5";
    var ws;
    try { ws = new WebSocket(url); } catch (e) { this._setState("error"); return false; }
    this._ws = ws;

    ws.onopen = function () {
      self._reconnect = 0;
      self._setState("open");
      // 心跳：20s 一次，防止 NAT / 代理断开长连接
      clearInterval(self._heartbeat);
      self._heartbeat = setInterval(function () {
        if (self._ws && self._ws.readyState === 1) {
          self._ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
        }
      }, 20000);
    };

    ws.onmessage = function (ev) {
      var msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      switch (msg.type) {
        case "telemetry":
          self.telemetry = Object.assign({}, msg.payload, { _ts: msg.ts || Date.now() });
          self.emit("telemetry", self.telemetry);
          break;
        case "ack":
          self.emit("ack", msg);
          break;
        case "presence":
          self.emit("presence", msg.payload);
          break;
        case "command_sent":
          self.emit("command_sent", msg);
          break;
        case "pong":
          break;
        default:
          self.emit("raw", msg);
      }
    };

    ws.onerror = function () { self._setState("error"); };

    ws.onclose = function () {
      clearInterval(self._heartbeat);
      self._setState("closed");
      // 指数退避自动重连（最多 6 次，间隔 1s→2s→4s…上限 20s）
      if (self._reconnect < 6 && self.online) {
        var delay = Math.min(20000, 1000 * Math.pow(2, self._reconnect++));
        setTimeout(function () { self.connectWS(sessionId); }, delay);
      }
    };
    return true;
  },

  _setState: function (s) {
    this.wsState = s;
    this.emit("status", s);
  },

  disconnectWS: function () {
    this._reconnect = 99; // 阻止自动重连
    clearInterval(this._heartbeat);
    if (this._ws) { try { this._ws.close(); } catch (e) {} }
    this._ws = null;
    this._setState("closed");
  },

  /** H5 → UE 下发指令（数字孪生反向控制） */
  sendCommand: function (action, payload) {
    var msgId = "h5-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    var msg = { type: "command", action: action, payload: payload || {}, msg_id: msgId, ts: Date.now() };
    if (this._ws && this._ws.readyState === 1) {
      this._ws.send(JSON.stringify(msg));
      return Promise.resolve({ ok: true, channel: "ws", msg_id: msgId });
    }
    // WS 不可用时走 REST 降级通道，仍能留下指令记录
    if (this.online && this.session_id) {
      return this.fetch("/api/ue/command/" + encodeURIComponent(this.session_id), {
        method: "POST", body: { action: action, payload: payload || {} }
      }).then(function (r) { return { ok: true, channel: "rest", msg_id: r.sent && r.sent.msg_id }; })
        .catch(function () { return { ok: false, offline: true }; });
    }
    return Promise.resolve({ ok: false, offline: true });
  },

  /** 读取最近一帧遥测；WS 未推送时尝试 REST 拉取一次 */
  getTelemetry: function () {
    var self = this;
    if (this.telemetry) return Promise.resolve(this.telemetry);
    if (!this.online || !this.session_id) return Promise.resolve(null);
    return this.fetch("/api/ue/telemetry/" + encodeURIComponent(this.session_id))
      .then(function (r) {
        if (r.telemetry) { self.telemetry = r.telemetry; self.emit("telemetry", r.telemetry); }
        return r.telemetry || null;
      }).catch(function () { return null; });
  },

  /* ---------------------------------------------------------------- 会话 / 记录 */
  createSession: function () {
    var self = this;
    if (!this.online) {
      this.session_id = "YS-OFFLINE-" + Math.random().toString(36).slice(2, 10).toUpperCase();
      return Promise.resolve(this.session_id);
    }
    return this.fetch("/api/sessions", { method: "POST" })
      .then(function (r) {
        self.session_id = r.session_id;
        self.connectWS(r.session_id);   // 建会话即连实时通道
        return r.session_id;
      })
      .catch(function () { self.online = false; return self.createSession(); });
  },

  submitRecord: function (task_id, answer) {
    if (!this.online) return Promise.resolve({ correct: answer === this.localAnswer(task_id), offline: true });
    var event_id = "h5-" + task_id + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    return this.fetch("/api/records", {
      method: "POST",
      body: { event_id: event_id, session_id: this.session_id, task_id: task_id, answer: answer }
    }).catch(function () { return { correct: false, offline: true }; });
  },

  localAnswer: function (task_id) {
    var t = YS_TASKS.filter(function (x) { return x.id === task_id; })[0];
    return t ? t.answer : null;
  },

  /* ---------------------------------------------------------------- RAG 问答 */
  /** @param history 多轮上下文 [{role:'user'|'assistant', content:'...'}] */
  ask: function (question, point_id, history) {
    var self = this;
    // 先确认后端在线（可能刚启动完），在线才走大模型，否则用本地知识兜底
    return this.ensureOnline().then(function (ok) {
      if (!ok) return self.localAsk(question, point_id);
      return self.fetch("/api/ask", {
        method: "POST",
        timeout: 25000,
        body: { question: question, point_id: point_id || null, history: history || [] }
      }).catch(function (err) {
        self.online = false;   // 掉线了，下次提问会自动重连
        return self.localAsk(question, point_id);
      });
    });
  },

  localAsk: function (question, point_id) {
    var q = question.trim();
    var candidates = YS_KNOWLEDGE.filter(function (k) { return !point_id || k.point_id === point_id; });
    var best = null, score = 0;
    var keys = [
      ["香云纱", ["香云纱", "莨绸", "莨纱", "非遗"]],
      ["主馆", ["主馆", "镬耳屋", "莨珠记", "展陈"]],
      ["工坊", ["工坊", "工作坊", "车间", "湿作业", "卷布"]],
      ["晒场", ["晒场", "晒莨", "草地", "晒布"]],
      ["河泥", ["河泥", "涂泥", "泥料", "河涌", "过泥"]],
      ["薯莨", ["薯莨", "浸染", "染料"]],
      ["安全", ["安全", "河岸", "靠近"]],
      ["工序", ["三蒸", "九煮", "十八晒", "工序"]]
    ];
    candidates.forEach(function (item) {
      var source = item.title + item.text;
      var s = 0;
      keys.forEach(function (kv) {
        if (kv[1].some(function (w) { return q.indexOf(w) >= 0; }) &&
            kv[1].some(function (w) { return source.indexOf(w) >= 0; })) s += 2;
      });
      for (var i = 0; i < q.length - 1; i++) {
        if (source.indexOf(q.slice(i, i + 2)) >= 0) s += 0.3;
      }
      if (s > score) { score = s; best = item; }
    });
    if (score < 1.5 || !best) {
      return {
        answer: "现在连不上后端 AI 服务，只能回答研学资料里有的内容。\n" +
                "请确认电脑上已经双击 start_backend.bat 并在运行（黑色窗口别关），然后重新问一次。",
        found: false, mode: "offline", sources: [], offline: true
      };
    }
    return { answer: best.text, title: best.title, found: true, mode: "offline", sources: [{ id: best.id, title: best.title }], offline: true };
  },

  /* ---------------------------------------------------------------- UE 事件 / 报告 */
  ueEvent: function (event) {
    if (!this.online) return Promise.resolve({ ok: true, offline: true });
    return this.fetch("/api/ue/events", {
      method: "POST", body: event,
      headers: { "X-UE-Key": "CHANGE_ME_FOR_DEPLOYMENT" }
    }).catch(function () { return { ok: false, offline: true }; });
  },

  getReport: function () {
    if (!this.online) return Promise.resolve(this.localReport());
    return this.fetch("/api/sessions/" + this.session_id + "/report").catch(function () { return null; });
  },

  localReport: function () {
    var done = Store.data.tasksDone || {};
    var completed = Object.keys(done).filter(function (k) { return done[k]; }).length;
    return {
      completed: completed, total_tasks: YS_TASKS.length,
      score: completed * 25, max_score: YS_TASKS.length * 25,
      status: completed === YS_TASKS.length ? "完成" : "研学中"
    };
  }
};
