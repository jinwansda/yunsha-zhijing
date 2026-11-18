/* ==========================================================================
   莨珠记 · 云纱智境 —— 数字孪生实时层
   --------------------------------------------------------------------------
   把 UE 通过 WebSocket 上报的环境参数（光照/湿度/温度/风速/降雨）接入 UI，
   并据此「动态生成研学情境题」，实现真实的环境数据影响前端业务逻辑。
   ========================================================================== */
"use strict";

var Realtime = {
  data: null,
  _cbs: [],

  init: function () {
    var self = this;

    API.on("telemetry", function (t) {
      self.data = t;
      self._cbs.forEach(function (cb) { try { cb(t); } catch (e) {} });
      self.mount();
    });
    API.on("status", function (s) { self.renderBadge(s); });
    API.on("presence", function (p) {
      self.presence = p;
      self.mount();
    });
    API.on("ack", function (m) {
      toast("UE 已响应：" + (m.ok ? "操作成功" : "操作失败"), { ico: m.ok ? "✅" : "⚠️" });
    });
    API.on("command_sent", function (m) {
      toast("指令已下发至虚拟引擎：" + m.action, { ico: "📡" });
    });

    // 视图切换后重新挂载实时卡片
    var origGo = Nav.go;
    Nav.go = function (id, opt) {
      origGo.call(Nav, id, opt);
      setTimeout(function () { self.mount(); }, 40);
    };

    this.renderBadge(API.wsState);
    this.mount();
  },

  onChange: function (cb) { this._cbs.push(cb); },
  get: function () { return this.data; },

  /** 状态栏 WS 连接指示（用 CSS 圆点，避免 emoji，保持全 3D 风格统一） */
  renderBadge: function (state) {
    var el = document.getElementById("wsBadge");
    if (!el) return;
    var map = {
      open: ["var(--green)", "孪生在线"], connecting: ["var(--amber)", "连接中"],
      closed: ["var(--ink-3)", "离线"], error: ["var(--red)", "连接异常"]
    };
    var m = map[state] || map.closed;
    el.innerHTML = '<i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' +
      m[0] + ';margin-right:4px;vertical-align:middle;box-shadow:0 0 0 2px rgba(0,0,0,.04)"></i>' + m[1];
    el.style.color = state === "open" ? "var(--green)" : "var(--ink-3)";
  },

  /** 把实时卡片挂到首页 / 任务页 */
  mount: function () {
    var card = document.getElementById("realtimeCard");
    if (card) card.innerHTML = this.cardHTML();
    var q = document.getElementById("realtimeQuestion");
    if (q) q.innerHTML = this.questionHTML();
  },

  cardHTML: function () {
    var d = this.data;
    var ws = API.wsState === "open";
    var onlineUE = this.presence && this.presence.ue > 0;
    if (!d) {
      return '<div class="card" style="background:linear-gradient(135deg,var(--blue-soft),var(--card));border:none">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<span style="width:34px;height:34px;display:inline-flex">' + (typeof Icon3D!=="undefined"?Icon3D.box("signal",34):"📡") + '</span>' +
          '<div style="flex:1"><b style="font-size:14px">数字孪生实时通道</b>' +
          '<div style="font-size:11.5px;color:var(--ink-3);margin-top:3px">' +
            (ws ? 'WebSocket 已连接，等待 UE 虚拟引擎上报环境参数…' : '未连接后端，使用离线模拟数据') + '</div></div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:12px">' +
          '<button class="btn btn-sm btn-soft" id="rtCmdStart" style="flex:1">' + (typeof Icon3D!=="undefined"?Icon3D.box("play",16):"▶") + ' 开始晒莨</button>' +
          '<button class="btn btn-sm btn-ghost" id="rtCmdRain" style="flex:1">' + (typeof Icon3D!=="undefined"?Icon3D.box("rain",16):"🌧") + ' 模拟降雨</button>' +
          '<button class="btn btn-sm btn-ghost" id="rtCmdReset" style="flex:1">' + (typeof Icon3D!=="undefined"?Icon3D.box("sun",16):"☀") + ' 放晴</button>' +
        '</div></div>';
    }
    var lux = d.lux == null ? "--" : Math.round(d.lux).toLocaleString();
    var hum = d.humidity == null ? "--" : Math.round(d.humidity);
    var temp = d.temp == null ? "--" : Number(d.temp).toFixed(1);
    var wind = d.wind == null ? "--" : Number(d.wind).toFixed(1);
    var rain = !!d.rain;
    var fit = this.assess();

    return '<div class="card" style="background:linear-gradient(135deg,' +
      (rain ? 'var(--blue-soft)' : 'var(--green-soft)') + ',var(--card));border:none">' +
      '<div class="card-title"><span class="ct-left">' + (typeof Icon3D!=="undefined"?Icon3D.box("signal",18):"📡") + ' UE 实时环境 · 数字孪生</span>' +
        '<span class="tag ' + (onlineUE ? 'tag-green' : 'tag-gray') + '">' + (onlineUE ? 'UE 在线' : '演示数据') + '</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' +
        this.metric("☀️", "光照", lux + " lx") +
        this.metric("💧", "湿度", hum + " %") +
        this.metric("🌡️", "气温", temp + " ℃") +
        this.metric("🍃", "风速", wind + " m/s") +
      '</div>' +
      '<div style="margin-top:12px;padding:10px 12px;border-radius:12px;background:' +
        (fit.ok ? 'var(--green-soft)' : 'var(--red-soft)') + ';font-size:12.5px;color:var(--ink-2);line-height:1.7">' +
        '<b style="color:' + (fit.ok ? 'var(--green)' : 'var(--red)') + '">' + (fit.ok ? '✓ 适宜晒莨' : '⚠ ' + fit.reason) + '</b>　' + fit.advice +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
        '<button class="btn btn-sm btn-soft" id="rtCmdStart" style="flex:1">▶ 开始晒莨</button>' +
        '<button class="btn btn-sm btn-ghost" id="rtCmdRain" style="flex:1">🌧 模拟降雨</button>' +
        '<button class="btn btn-sm btn-ghost" id="rtCmdReset" style="flex:1">☀ 放晴</button>' +
      '</div>' +
      '<div style="font-size:10px;color:var(--ink-3);margin-top:8px">数据来自 UE 场景遥测帧 · 已联动生成情境题</div>' +
    '</div>';
  },

  metric: function (ico, label, val) {
    return '<div style="background:var(--card);border-radius:12px;padding:9px 4px;text-align:center">' +
      '<div style="font-size:17px">' + ico + '</div>' +
      '<div style="font-size:12px;font-weight:800;color:var(--brand-d);margin-top:3px">' + val + '</div>' +
      '<div style="font-size:10px;color:var(--ink-3)">' + label + '</div></div>';
  },

  /** 依据实时环境判断晒莨条件 */
  assess: function () {
    var d = this.data || {};
    if (d.rain) return { ok: false, reason: "正在降雨", advice: "应立即收布，雨水会冲掉薯莨汁液、破坏固色。" };
    if (d.humidity != null && d.humidity > 80) return { ok: false, reason: "湿度过高 " + Math.round(d.humidity) + "%", advice: "布面难干、易生霉斑，建议暂缓摊晒。" };
    if (d.lux != null && d.lux < 30000) return { ok: false, reason: "光照不足", advice: "紫外线太弱，单宁氧化不充分，需等待日照增强。" };
    return { ok: true, reason: "", advice: "光照与湿度适宜，可将布匹平铺草地、拉直绷紧进行晒莨。" };
  },

  /** 根据实时参数动态生成一道情境题（供任务页使用） */
  dynamicQuestion: function () {
    var d = this.data;
    if (!d) return null;
    var fit = this.assess();
    if (!fit.ok) {
      return {
        id: "RT_QUESTION", title: "实时情境题 · 天时判断", score: 20,
        question: "UE 场景实时上报：" + (d.rain ? "正在降雨" : "光照 " + Math.round(d.lux || 0) + " lx、湿度 " + Math.round(d.humidity || 0) + "%") +
          "。作为晒场工匠，此时最合理的操作是？",
        options: [
          { id: "A", text: "继续平铺摊晒，靠自然风干即可" },
          { id: "B", text: fit.reason === "正在降雨" ? "立即组织收布，避免雨水冲刷染液" : "暂缓摊晒，等待光照与湿度转好" },
          { id: "C", text: "加大薯莨汁浓度后继续晒" }
        ],
        answer: "B",
        explanation: fit.advice
      };
    }
    return {
      id: "RT_QUESTION", title: "实时情境题 · 天时判断", score: 20,
      question: "UE 场景实时上报：光照 " + Math.round(d.lux || 0) + " lx、湿度 " + Math.round(d.humidity || 0) +
        "%，天气晴好。晒莨工序的正确做法是？",
      options: [
        { id: "A", text: "直接平铺草地、拉直绷紧并固定防风" },
        { id: "B", text: "叠放于室内阴干，避免阳光直射" },
        { id: "C", text: "先涂河泥再摊晒" }
      ],
      answer: "A",
      explanation: "晴天是晒莨的黄金条件，布匹需平铺草地均匀受晒，并用竹竿、锥子固定防止被风掀起。"
    };
  },

  questionHTML: function () {
    var q = this.dynamicQuestion();
    if (!q) return '';
    return '<div class="card" style="border-left:4px solid var(--brand)">' +
      '<div class="card-title"><span class="ct-left">' + (typeof Icon3D!=="undefined"?Icon3D.box("signal",18):"📡") + ' 实时情境题（由 UE 环境数据生成）</span><span class="tag tag-blue">+' + q.score + ' 分</span></div>' +
      '<div style="font-size:14px;font-weight:700;line-height:1.6;margin-bottom:10px">' + esc(q.question) + '</div>' +
      '<button class="btn btn-primary btn-block" id="rtStartQuestion">开始作答</button></div>';
  },

  /** 下发指令给 UE；离线时本地模拟一帧遥测，保证现场演示也能看到联动效果 */
  command: function (action, payload) {
    var self = this;
    var p = API.sendCommand(action, payload);
    var localFrame = null;
    if (action === "set_weather" && payload.rain) {
      localFrame = { lux: 8000, humidity: 92, temp: 26.5, wind: 4.2, rain: true, point: "DRYING_FIELD" };
    } else if (action === "set_weather") {
      localFrame = { lux: 85000, humidity: 58, temp: 31.2, wind: 1.8, rain: false, point: "DRYING_FIELD" };
    } else if (action === "start_drying") {
      localFrame = { lux: 72000, humidity: 63, temp: 30.4, wind: 2.1, rain: false, point: "DRYING_FIELD" };
    }
    // 只有没连上 UE（或指令走的是离线通道）才注入模拟帧，避免覆盖真实遥测
    return Promise.resolve(p).then(function (r) {
      if (localFrame && (!r || r.offline || r.channel === "rest")) {
        self.data = Object.assign({}, localFrame, { _ts: Date.now(), _simulated: true });
        self._cbs.forEach(function (cb) { try { cb(self.data); } catch (e) {} });
        self.mount();
        toast("离线模拟：已生成一帧环境遥测", { ico: "🧪" });
      }
    });
  },

  /* 绑定首页/任务页里的指令按钮（事件委托，兼容视图重绘） */
  bindDelegates: function () {
    var self = this;
    document.addEventListener("click", function (e) {
      var t = e.target.closest("#rtCmdStart, #rtCmdRain, #rtCmdReset, #rtStartQuestion");
      if (!t) return;
      if (t.id === "rtCmdStart") self.command("start_drying", { point: "DRYING_FIELD" });
      else if (t.id === "rtCmdRain") self.command("set_weather", { rain: true, lux: 8000, humidity: 92 });
      else if (t.id === "rtCmdReset") self.command("set_weather", { rain: false, lux: 85000, humidity: 58 });
      else if (t.id === "rtStartQuestion") {
        var q = self.dynamicQuestion();
        if (q && typeof QuizFlow !== "undefined") QuizFlow.start(q);
        else toast("等待 UE 上报环境参数后生成情境题", { ico: "⏳" });
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", function () {
  if (typeof API === "undefined" || typeof Nav === "undefined") return;
  Realtime.init();
  Realtime.bindDelegates();
});
