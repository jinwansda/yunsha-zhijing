/* ==========================================================================
   莨珠记 · 云纱智境 —— 应用核心
   存储 / 工具 / 音效 / 提示 / 导航 / 启动 / 登录 / 引导 / 签到 / 成就
   ========================================================================== */
"use strict";

/* ---------------------------------------------------------------- 快捷工具 */
function $(s, root) { return (root || document).querySelector(s); }
function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }
function el(tag, cls, html) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function pad2(n) { return n < 10 ? "0" + n : "" + n; }
function nowTs() { return Date.now(); }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function ds(d) {
  d = d || new Date();
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}
function parseDS(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function addDays(s, n) { var d = parseDS(s); d.setDate(d.getDate() + n); return ds(d); }

/* ---------------------------------------------------------------- 存储层
   手机号版：每个手机号一份独立存档（互不串号），另有注册表记录所有手机号。
   - 手机号注册表:  yunsha_phones_v1  { 手机号: { joined, last } }
   - 每手机号存档:  yunsha_p_<手机号>
   - 上次账号:     yunsha_last_phone
   - 极旧单键 yunsha_v1 会在首次启动时清理（旧 username 分档数据已不再使用）。 */
var Store = {
  KEY: "yunsha_v1",                // 极旧单键（仅用于一次性清理）
  PHONES_KEY: "yunsha_phones_v1",  // 手机号注册表
  LAST_KEY: "yunsha_last_phone",   // 上次登录的手机号
  PREFIX: "yunsha_p_",             // 每手机号数据键前缀
  data: null,
  phones: {},                      // { 手机号: { joined, last } }
  cur: "",                         // 当前手机号（空 = 未登录/无档）

  keyFor: function (phone) {
    return this.PREFIX + String(phone);
  },

  loadPhones: function () {
    try {
      var u = JSON.parse(localStorage.getItem(this.PHONES_KEY));
      return (u && typeof u === "object") ? u : {};
    } catch (e) { return {}; }
  },
  savePhones: function () {
    try { localStorage.setItem(this.PHONES_KEY, JSON.stringify(this.phones)); } catch (e) {}
  },

  /** 登录/切换到指定手机号：老账号恢复其原有进度，新账号从零开始。返回是否新账号。 */
  loginAs: function (phone) {
    phone = String(phone || "").trim();
    this.phones = this.loadPhones();
    var isNew = !this.phones[phone];
    if (isNew) this.phones[phone] = { joined: ds(), last: Date.now() };
    else this.phones[phone].last = Date.now();
    this.savePhones();

    this.cur = phone;
    try { localStorage.setItem(this.LAST_KEY, JSON.stringify(phone)); } catch (e) {}

    // 读该手机号自己的存档（没有则空白档）
    var raw = null;
    try { raw = localStorage.getItem(this.keyFor(phone)); } catch (e) {}
    var d = null;
    if (raw) { try { d = JSON.parse(raw); } catch (e) { d = null; } }
    var base = this.blank();
    if (d && typeof d === "object" && d.version >= 1) {
      for (var k in base) { if (d[k] === undefined) d[k] = base[k]; }
      this.data = d;
    } else {
      this.data = base;
    }
    this.data.user.phone = phone;
    if (!this.data.user.name) this.data.user.name = "学员" + phone.slice(-4);
    this.save();
    return isNew;
  },

  /** 当前所有已注册手机号（登录页快速选择用） */
  listPhones: function () {
    var u = this.loadPhones();
    return Object.keys(u).map(function (p) { return { phone: p }; });
  },

  /** 只读地读取某手机号的存档（不切换当前账号），用于登录前判断账号是否存在。无则返回 null。 */
  peekData: function (phone) {
    var raw = null;
    try { raw = localStorage.getItem(this.keyFor(phone)); } catch (e) {}
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  },

  blank: function () {
    return {
      version: 1,
      user: { name: "", role: "student", school: "", joined: ds(), xp: 0, coins: 0, phone: "" },
      settings: { sound: true, vibrate: true, dark: false, bigFont: false, voice: false, eyeCare: false, checkinRemind: true, notifyTask: true, notifyAch: true, notifyUe: true },
      guideDone: false,
      homeTourDone: false,
      loggedIn: false,
      checkin: { last: "", streak: 0, total: 0, dates: [] },
      /* 奖励系统 */
      inventory: [],          // 已购商品 id
      ownedFrames: [],        // 已拥有头像框
      ownedTitles: ["ti_none", "ti_apprentice"],
      avatar: "av_cloud",     // 当前头像
      customAvatar: "",       // 自定义头像(base64)
      frame: "fr_none",       // 当前头像框
      title: "ti_none",       // 当前称号
      equippedTheme: "",      // 当前主题
      boxLeft: 1,             // 剩余开盒次数
      boxOpened: 0,           // 累计开盒
      coinsEarned: 0,         // 累计获得传承币
      shareCount: 0,          // 分享次数
      tasksDone: {},       // { task_id: true }
      taskScores: {},      // { task_id: score }
      pointsDone: {},      // { point_id: true } 打卡
      knowRead: {},        // { knowledge_id: true }
      achievements: {},    // { ach_id: true }
      games: { quiz: [], mud: [], rhythm: [], sort: [], memory: [], lane: [] },
      ueEvents: [],        // UE4 联动记录
      classRoster: [],     // 老师端导入的真实学生记录（不自动生成）
      certGenerated: false,
      radar: { "工艺认知": 0, "实践操作": 0, "文化理解": 0, "知识掌握": 0, "安全素养": 0 },

      /* 传承成长体系 */
      mastersRead: {},        // { master_id: true } 图鉴·匠心传承
      patternsSeen: {},       // { pattern_id: true } 图鉴·纱品纹样
      codexSets: {},          // { set_id: true } 已集齐并领奖的套系
      seasonId: "spring",     // 当前研学季
      seasonXp: {},           // { season_id: number } 各季研习值
      seasonClaimed: {},      // { season_id + ':' + tierIndex + ':' + track: true } 已领奖
      seasonPro: {},          // { season_id: true } 已解锁匠心轨
      dailyDate: "",          // 每日研习的日期
      daily: {},              // { task_id: count } 今日进度
      dailyClaimed: {},       // { task_id: true } 今日已领奖
      streakMiles: {},        // { days: true } 已领取的连续研习里程碑
      ownedSkins: [],         // 已拥有的限定皮肤 id
      equippedSkin: ""        // 当前穿戴的限定皮肤 id（叠加在主题之上）
    };
  },

  load: function () {
    // ① 清理极旧单键 yunsha_v1（旧 username 分档数据 yunsha_u_* 保留不删，避免误删进度）
    try { if (localStorage.getItem(this.KEY)) localStorage.removeItem(this.KEY); } catch (e) {}

    // ② 记下上次手机号用于登录页预填，启动时停在登录页由用户选择/输入手机号进入
    var lastPhone = null;
    try { lastPhone = JSON.parse(localStorage.getItem(this.LAST_KEY)); } catch (e) {}
    var known = this.loadPhones();
    this.prefillPhone = (lastPhone && known[lastPhone]) ? lastPhone : "";
    this.data = this.blank();
    this.cur = "";
    return this.data;
  },

  save: function () {
    // 归一化数值，杜绝浮点误差（如 153.80000000000005）污染显示
    try {
      var u = this.data && this.data.user;
      if (u) {
        u.xp = Math.round(u.xp || 0);
        u.coins = Math.round(u.coins || 0);
      }
      if (this.data) this.data.coinsEarned = Math.round(this.data.coinsEarned || 0);
    } catch (e) {}
    // 写入当前账号自己的键；未登录时写全局键兜底
    var key = this.cur ? this.keyFor(this.cur) : this.keyFor("__guest");
    try { localStorage.setItem(key, JSON.stringify(this.data)); }
    catch (e) { console.warn("存储失败", e); }
  },

  /* 取整显示用：对 xp / coins 做安全四舍五入 */
  roundNum: function (v) { return Math.round(v || 0); },

  reset: function () {
    this.data = this.blank();
    this.save();
  }
};

/* ---------------------------------------------------------------- 等级计算 */
function levelInfo(xp) {
  var cur = YS_LEVELS[0], next = null;
  for (var i = 0; i < YS_LEVELS.length; i++) {
    if (xp >= YS_LEVELS[i].xp) { cur = YS_LEVELS[i]; next = YS_LEVELS[i + 1] || null; }
  }
  return { cur: cur, next: next };
}

/* 累计积分 = 经验值 + 签到奖励 */
function totalScore() {
  var d = Store.data;
  return d.user.xp + (d.checkin.total * 0); // 经验即主积分
}

/* 连续签到 */
function checkinStreak() {
  return Store.data.checkin.streak;
}

/* 任务完成数（只统计 4 个主任务，实时情境题不计入） */
function tasksCompleted() {
  var d = Store.data.tasksDone;
  return YS_TASKS.filter(function (t) { return !!d[t.id]; }).length;
}

/* 研学证书是否可生成（与「我的」页、研学服务网格统一口径） */
function certReady() {
  return tasksCompleted() >= YS_TASKS.length;
}

/* 雷达图各维度得分 */
function calcRadar() {
  var d = Store.data;
  var done = tasksCompleted();
  var know = Object.keys(d.knowRead).filter(function (k) { return d.knowRead[k]; }).length;
  var ach = Object.keys(d.achievements).length;
  return {
    "工艺认知": Math.round(clamp(done / YS_TASKS.length * 100, 0, 100)),
    "实践操作": Math.round(clamp((d.games.mud.length + d.games.rhythm.length) / 8 * 100, 0, 100)),
    "文化理解": Math.round(clamp(know / YS_KNOWLEDGE.length * 100, 0, 100)),
    "知识掌握": Math.round(clamp((d.games.quiz.length * 10) / 100 * 100, 0, 100)),
    "安全素养": d.pointsDone["RIVER"] ? 90 : 40
  };
}

/* ---------------------------------------------------------------- 音效引擎 */
var Sound = {
  ctx: null,
  on: function () { return !!Store.data.settings.sound; },
  ensure: function () {
    try {
      if (!this.ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    } catch (e) { return null; }
  },
  tone: function (freq, dur, type, vol, delay) {
    if (!this.on()) return;
    var c = this.ensure();
    if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol || 0.08, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  },
  tick: function () { this.tone(1200, 0.03, "sine", 0.03); },
  rep: function () { this.tone(680, 0.09, "sine", 0.07); },
  success: function () {
    var self = this;
    [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { self.tone(f, 0.26, "sine", 0.07, i * 0.085); });
  },
  fail: function () { this.tone(220, 0.2, "sawtooth", 0.05); },
  coin: function () { this.tone(988, 0.07, "square", 0.04); this.tone(1319, 0.14, "square", 0.035, 0.06); },
  unlock: function () {
    var self = this;
    [392, 523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { self.tone(f, 0.4, "triangle", 0.06, i * 0.1); });
  }
};

function vibrate(pattern) {
  if (!Store.data.settings.vibrate) return;
  try { if (navigator.vibrate) navigator.vibrate(pattern || 12); } catch (e) {}
}

/* ---------------------------------------------------------------- Toast */
var Toast = {
  show: function (msg, opt) {
    opt = opt || {};
    var wrap = $("#toastWrap");
    var n = el("div", "toast");
    n.innerHTML = (opt.ico ? '<span class="ti">' + opt.ico + "</span>" : "") + "<span>" + esc(msg) + "</span>";
    wrap.appendChild(n);
    setTimeout(function () { n.classList.add("out"); setTimeout(function () { n.remove(); }, 320); }, opt.dur || 2000);
  }
};
function toast(msg, opt) { Toast.show(msg, opt); }

/* ---------------------------------------------------------------- 底部弹层 */
var Sheet = {
  isOpen: false,
  open: function (opt) {
    $("#sheetTitle").textContent = opt.title || "";
    $("#sheetBody").innerHTML = opt.body || "";
    var foot = $("#sheetFoot");
    if (opt.foot) { foot.innerHTML = opt.foot; foot.style.display = "flex"; }
    else { foot.innerHTML = ""; foot.style.display = "none"; }
    $("#sheetMask").classList.add("show");
    $("#sheet").classList.add("show");
    Sheet.isOpen = true;
    if (opt.onMount) { try { opt.onMount(); } catch (e) { console.warn(e); } }
  },
  close: function () {
    $("#sheetMask").classList.remove("show");
    $("#sheet").classList.remove("show");
    try {
      $("#sheetTitle").textContent = "";
      $("#sheetBody").innerHTML = "";
      var f = $("#sheetFoot"); f.innerHTML = ""; f.style.display = "none";
    } catch (e) {}
    Sheet.isOpen = false;
  }
};

/* ---------------------------------------------------------------- 视频播放 */
function playVideo(src, poster) {
  var ov = document.getElementById("videoOverlay");
  if (!ov) {
    ov = document.createElement("div");
    ov.id = "videoOverlay";
    ov.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(20,12,8,.95);display:none;align-items:center;justify-content:center;flex-direction:column";
    ov.innerHTML =
      '<div id="videoClose" style="position:absolute;top:14px;right:18px;color:#fff;font-size:26px;cursor:pointer;line-height:1">✕</div>' +
      '<video id="videoPlayer" controls playsinline style="max-width:100%;max-height:82%;border-radius:12px;background:#000"></video>' +
      '<div id="videoErr" style="color:#e9d8c2;font-size:13px;margin-top:14px;display:none;text-align:center;padding:0 24px">视频加载失败，请确认素材路径或网络连接后重试。</div>';
    document.body.appendChild(ov);
    ov.addEventListener("click", function (e) {
      if (e.target === ov || e.target.id === "videoClose") closeVideo();
    });
    var v0 = ov.querySelector("#videoPlayer");
    v0.addEventListener("error", function () { var e = document.getElementById("videoErr"); if (e) e.style.display = "block"; });
  }
  var v = ov.querySelector("#videoPlayer");
  v.poster = poster || "";
  v.removeAttribute("src");
  v.src = src;
  try { v.load(); } catch (e) {}
  ov.style.display = "flex";
  var p = v.play();
  if (p && p.catch) p.catch(function () { /* 自动播放被拦截时，用户手动点击播放 */ });
}
function closeVideo() {
  var ov = document.getElementById("videoOverlay");
  if (!ov) return;
  var v = ov.querySelector("#videoPlayer");
  try { v.pause(); v.removeAttribute("src"); v.load(); } catch (e) {}
  ov.style.display = "none";
}

/* ---------------------------------------------------------------- 彩带 */
function confetti(n, opt) {
  opt = opt || {};
  var layer = $("#confettiLayer");
  var colors = opt.colors || ["#D9AD71", "#83533B", "#667B55", "#9E3B2F", "#E8C68C", "#4C7A78"];
  n = n || 40;
  for (var i = 0; i < n; i++) {
    var p = el("i", "confetti-piece");
    p.style.left = Math.random() * 100 + "%";
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.width = (5 + Math.random() * 7) + "px";
    p.style.height = (6 + Math.random() * 9) + "px";
    p.style.animationDuration = (2 + Math.random() * 1.5) + "s";
    p.style.animationDelay = (Math.random() * 0.4) + "s";
    layer.appendChild(p);
    (function (node) { setTimeout(function () { node.remove(); }, 3600); })(p);
  }
}

/* ---------------------------------------------------------------- 导航 */
var Nav = {
  current: "v-home",
  stack: [],
  go: function (id, opt) {
    opt = opt || {};
    if (typeof Sheet !== "undefined") Sheet.close(); /* 切换视图时关闭任何残留底部弹层，避免跨页面残留 */
    var cur = $("#" + Nav.current);
    var next = $("#" + id);
    if (!next) return;
    if (opt.push !== false && id !== Nav.current) Nav.stack.push(Nav.current);
    if (cur) cur.classList.remove("active");
    next.classList.add("active");
    next.scrollTop = 0;
    Nav.current = id;
    $$("#tabbar [data-nav]").forEach(function (b) {
      b.classList.toggle("on", b.dataset.nav === id);
    });
    var isMain = ["v-home", "v-map", "v-task", "v-know", "v-me"].indexOf(id) >= 0;
    $("#tabbar").style.display = isMain ? "flex" : "none";
    next.style.paddingBottom = isMain ? "118px" : "40px";
    if (id === "v-home") renderHome();
    if (id === "v-map") renderMap();
    if (id === "v-task") renderTasks();
    if (id === "v-know") renderKnow();
    if (id === "v-me") renderMe();
    if (id === "v-teacher") renderTeacher();
    // 兜底：设置页若被直接切换进来且尚无内容，主动渲染一次
    if (id === "v-settings") {
      var sBody = $("#settingsBody");
      if (sBody && !sBody.innerHTML.trim() && typeof renderSettings === "function") renderSettings();
    }
    if (typeof opt.after === "function") opt.after();
  },
  back: function () {
    var prev = Nav.stack.pop() || "v-home";
    if (prev === Nav.current) prev = "v-home";
    Nav.go(prev, { push: false });
  },
  /* 彻底复位：移除所有视图的 active，清空导航栈，回到首页（不渲染） */
  resetAll: function () {
    Nav.stack = [];
    Nav.current = "v-home";
    $$(".view").forEach(function (v) { v.classList.remove("active"); });
    var tb = $("#tabbar");
    if (tb) tb.style.display = "none";
  }
};

/* ---------------------------------------------------------------- 设置应用 */
function applySettings() {
  var s = Store.data.settings;
  document.body.classList.toggle("big-font", !!s.bigFont);
  document.body.setAttribute("data-theme", s.dark ? "dark" : "light");
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute("content", s.dark ? "#17110C" : "#83533B");
  try { applyTheme(); } catch (e) { console.warn("applyTheme", e); }
}

/* ---------------------------------------------------------------- 主题皮肤 */
/* 商店购买的主题（equippedTheme）→ body[data-skin]，由 CSS 变量接管整站配色 */
function currentSkin() {
  var id = Store.data.equippedTheme || "";
  var t = (window.YS_THEMES || []).filter(function (x) { return x.id === id; })[0];
  return t ? t.skin : "default";
}
function applyTheme() {
  var skin = currentSkin();
  if (skin && skin !== "default") document.body.setAttribute("data-skin", skin);
  else document.body.removeAttribute("data-skin");
  var m = document.querySelector('meta[name="theme-color"]');
  if (m) {
    var s = Store.data.settings || {};
    var colors = {
      gold: "#A9742B", grass: "#5E7A4B", ocean: "#2E5E96", violet: "#6E4BA8",
      ink: "#2C4A46", sunset: "#B0432F", celadon: "#3E8078", sakura: "#C25C7E",
      default: "#83533B"
    };
    m.setAttribute("content", s.dark ? "#17110C" : (colors[skin] || colors.default));
  }
}
/* 切换主题（仅允许已拥有，默认主题永远可用） */
function useTheme(id) {
  var d = Store.data;
  id = id || "";
  if (id && (d.inventory || []).indexOf(id) < 0) {
    toast("尚未拥有该主题，去传承商店看看吧", { ico: "🔒" });
    return false;
  }
  d.equippedTheme = id;
  Store.save();
  applyTheme();
  Sound.tick();
  var name = ((window.YS_THEMES || []).filter(function (x) { return x.id === id; })[0] || {}).name || "默认";
  toast("主题已切换 · " + name, { ico: "🎨" });
  return true;
}

/* ---------------------------------------------------------------- 状态栏 */
function renderStatus() {
  var d = Store.data;
  var c = $("#sbCoins");
  if (c) c.textContent = (d.user.coins || 0) + " / " + d.user.xp;
  var s = $("#sbStreakN");
  if (s) s.textContent = checkinStreak();
}

/* ---------------------------------------------------------------- 启动 */
var App = { booted: false };

/* 进入函数在脚本加载后立即绑定，不等后端探测、不等 three，保证封面按钮随时可点 */
window.startFromSplash = function() {
  var splash = $("#splash");
  if (splash) {
    splash.classList.add("hide");
    setTimeout(function(){ if (splash) splash.remove(); }, 700);
  }
  var aw = $("#authWrap");
  if (aw) aw.classList.add("hide");
  try {
    var loggedIn = !!(Store.data && Store.data.loggedIn);
    if (!loggedIn) {
      showAuth();
    } else {
      if (!Store.data.guideDone) openGuide();
      else if (Store.data.user && Store.data.user.role === "teacher") Nav.go("v-teacher", { push: false });
      else Nav.go("v-home", { push: false });
      unlockAchievement("first_login");
    }
  } catch (e) {
    console.warn("start view", e);
    try { Nav.go("v-home", { push: false }); } catch (_) {}
  }
};

async function boot() {
  // 关键：先绑定全局事件，确保后续任何异常都不会让页面"点不动"
  Store.load();
  try { applySettings(); } catch (e) { console.warn("applySettings", e); }
  try { bindGlobalEvents(); } catch (e) { console.warn("bindGlobalEvents", e); }
  try { renderStatus(); } catch (e) { console.warn("renderStatus", e); }

  var bar = $("#splashBar");
  var tip = $("#splashTip");
  var splash = $("#splash");
  var steps = ["正在唤醒香云纱记忆", "正在连接研学基地", "正在准备寻纱之旅"];
  for (var i = 0; i < 3; i++) {
    if (tip) tip.textContent = steps[i];
    if (bar) bar.style.width = (i + 1) * 30 + "%";
    await sleep(160);
  }

  // 探测后端（失败也不影响主流程）
  try {
    var apiOnline = await API.init();
    if (apiOnline && !API.session_id) {
      try { await API.createSession(); } catch (e) {}
    }
  } catch (e) { API.online = false; }

  if (bar) bar.style.width = "100%";
  await sleep(220);
  App.booted = true;
  try {
    var fb = document.getElementById("bootFallback");
    if (fb) fb.style.display = "none";
  } catch (e) {}
}

/* ---------------------------------------------------------------- 登录页 */
function showAuth() {
  var wrap = $("#authWrap");
  wrap.classList.remove("hide");
  renderAuth();
}

/* 手机号验证码（前端模拟发送，仅用于本机区分账号；非真实短信） */
function genCode() { return String(Math.floor(100000 + Math.random() * 900000)); }
function maskPhone(p) { p = String(p || ""); return p.length === 11 ? p.slice(0, 3) + "****" + p.slice(7) : p; }
var loginState = { code: "", phone: "", cooldown: 0, timer: null };
function sendLoginCode() {
  var p = ($("#authPhone") && $("#authPhone").value.trim()) || "";
  if (!/^1\d{10}$/.test(p)) { toast("请输入正确的 11 位手机号", { ico: "⚠️" }); return; }
  loginState.code = genCode();
  loginState.phone = p;
  toast("（演示）验证码已发送至 " + maskPhone(p) + "：" + loginState.code, { ico: "📱", ms: 6000 });
  startCodeCooldown();
}
function startCodeCooldown() {
  loginState.cooldown = 60;
  var btn = $("#authSendCode");
  if (loginState.timer) clearInterval(loginState.timer);
  if (btn) { btn.textContent = "重新发送 (60s)"; btn.disabled = true; }
  loginState.timer = setInterval(function () {
    loginState.cooldown--;
    if (loginState.cooldown <= 0) {
      clearInterval(loginState.timer); loginState.timer = null;
      if (btn) { btn.textContent = "获取验证码"; btn.disabled = false; }
    } else if (btn) { btn.textContent = "重新发送 (" + loginState.cooldown + "s)"; btn.disabled = true; }
  }, 1000);
}

function renderAuth() {
  var p = $("#authPhone");
  // 预填上次手机号，方便直接续登
  if (p && !p.value) p.value = Store.prefillPhone || "";

  // 已有手机号快速选择（每个手机号独立存档，互不串号）
  var box = $("#authAccounts");
  if (box) {
    var phones = Store.listPhones();
    if (phones.length) {
      box.innerHTML =
        '<div style="font-size:11px;color:var(--ink-3);margin:14px 0 8px;text-align:center">本机已有手机号（点击获取验证码）</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">' +
        phones.map(function (u) {
          var isCur = Store.prefillPhone === u.phone;
          return '<button class="chip ' + (isCur ? "chip-brand on" : "") + '" data-phone="' + esc(u.phone) + '" style="padding:6px 14px">' + esc(maskPhone(u.phone)) + '</button>';
        }).join("") +
        '</div>';
      $$("#authAccounts .chip").forEach(function (c) {
        c.addEventListener("click", function () {
          var pEl = $("#authPhone");
          if (pEl) pEl.value = c.dataset.phone;
          sendLoginCode();
        });
      });
    } else {
      box.innerHTML = "";
    }
  }
}

function doLogin() {
  var pEl = $("#authPhone"), cEl = $("#authCode");
  var phone = (pEl && pEl.value.trim()) || "";
  var code = (cEl && cEl.value.trim()) || "";
  if (!/^1\d{10}$/.test(phone)) { toast("请输入正确的 11 位手机号", { ico: "⚠️" }); return; }
  if (!code) { toast("请先获取并输入验证码", { ico: "⚠️" }); return; }
  if (loginState.phone !== phone || loginState.code === "" || loginState.code !== code) {
    toast("验证码错误，请重新获取", { ico: "⚠️" }); return;
  }
  attemptLogin(phone);
}

/* 登录入口：直接登录（每个手机号独立存档，互不串号） */
function attemptLogin(phone) {
  var existing = Store.peekData(phone);
  reallyLogin(phone, !existing);
}

/* 真正完成登录并进入首页（isNew=新账号） */
function reallyLogin(phone, isNew) {
  Store.loginAs(phone);
  Store.data.loggedIn = true;
  Store.save();
  try { applyTheme(); } catch (e) { console.warn("applyTheme", e); }
  var wrap = $("#authWrap");
  if (wrap) wrap.classList.add("hide");
  renderStatus();
  Sound.success();
  if (isNew) { Store.data.guideDone = false; Store.save(); }
  unlockAchievement("first_login");
  if (!Store.data.guideDone) openGuide();
  else Nav.go("v-home", { push: false });
  var nm = Store.data.user.name || phone;
  toast(isNew ? "新账号创建成功，欢迎 " + nm + "！" : "欢迎回来，" + nm + "！", { ico: isNew ? "🎉" : "👋" });
}

/* 进入教学管理端（老师端，从设置页进入） */
function enterTeacherMode() {
  Store.data.user.role = "teacher";
  Store.save();
  Nav.go("v-teacher", { push: false });
  toast("已进入研学数据看板", { ico: "📊" });
}
function exitTeacherMode() {
  Store.data.user.role = "student";
  Store.save();
  Nav.go("v-home", { push: false });
  toast("已返回研学平台", { ico: "🎒" });
}

/* ---------------------------------------------------------------- 引导页 */
var Gate = { slides: 0 };

function openGuide() {
  $("#gate").classList.remove("hide");
  Gate.slides = 0;
  renderIntro();
}

function renderIntro() {
  $("#introTrack").style.transform = "translateX(" + (-Gate.slides * 100) + "%)";
  $$("#introDots i").forEach(function (d, i) { d.classList.toggle("on", i === Gate.slides); });
  $("#introNext").textContent = Gate.slides >= 2 ? "开始寻纱" : "继续";
  $("#introSkip").style.visibility = Gate.slides >= 2 ? "hidden" : "visible";
}

function finishGuide() {
  Store.data.guideDone = true;
  Store.save();
  $("#gate").classList.add("hide");
  Nav.go("v-home", { push: false });
  toast("研学之旅开始啦！", { ico: "🧭" });
}

/* ---------------------------------------------------------------- 全局事件 */
function bindGlobalEvents() {
  // 登录：获取验证码 + 进入
  var loginBtn = $("#authLoginBtn");
  if (loginBtn) loginBtn.addEventListener("click", doLogin);
  var sendBtn = $("#authSendCode");
  if (sendBtn) sendBtn.addEventListener("click", sendLoginCode);

  // 引导
  $("#introNext").addEventListener("click", function () {
    if (Gate.slides >= 2) { finishGuide(); return; }
    Gate.slides++;
    renderIntro();
  });
  $("#introSkip").addEventListener("click", finishGuide);
  var track = $("#introTrack"), sx = 0, dx = 0;
  track.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; dx = 0; }, { passive: true });
  track.addEventListener("touchmove", function (e) { dx = e.touches[0].clientX - sx; }, { passive: true });
  track.addEventListener("touchend", function () {
    if (Math.abs(dx) > 50) {
      Gate.slides = clamp(Gate.slides + (dx < 0 ? 1 : -1), 0, 2);
      renderIntro();
    }
  });

  // 底部导航
  $$("#tabbar [data-nav]").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.dataset.nav;
      if (Nav.current === id) { $("#" + id).scrollTo({ top: 0, behavior: "smooth" }); return; }
      vibrate(8);
      Sound.tick();
      Nav.go(id);
    });
  });

  // 弹层
  $("#sheetMask").addEventListener("click", Sheet.close);
  $("#sheetClose").addEventListener("click", Sheet.close);

  // 全局返回按钮（二级页）
  $$(".back-btn").forEach(function (b) {
    b.addEventListener("click", Nav.back);
  });

  // 前台回来刷新
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && Store.data) {
      renderStatus();
      if (Nav.current === "v-home") renderHome();
    }
  });

  // 全局按钮手势
  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.classList.contains("quiz-opt") || b.classList.contains("chip")) return;
    b.style.transition = "transform .12s cubic-bezier(.22,.61,.36,1)";
  }, true);

  // 等级徽章：点击任意 Lv.X 打开全部等级面板（事件委托，覆盖所有页面/动态重绘）
  document.addEventListener("click", function (e) {
    var lv = e.target.closest('[data-act="levelPanel"]');
    if (lv) { e.preventDefault(); e.stopPropagation(); try { showLevelPanel(); } catch (err) { console.warn("levelPanel", err); } return; }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var lv = e.target && e.target.closest && e.target.closest('[data-act="levelPanel"]');
    if (lv) { e.preventDefault(); try { showLevelPanel(); } catch (err) { console.warn("levelPanel", err); } }
  });
}

/* ---------------------------------------------------------------- 成就系统 */
function unlockAchievement(id) {
  var d = Store.data;
  if (d.achievements[id]) return; // 已解锁
  var a = YS_ACHIEVEMENTS.filter(function (x) { return x.id === id; })[0];
  if (!a) return;
  d.achievements[id] = true;
  d.user.xp += 20; // 每个成就奖励 20 经验
  d.user.coins = (d.user.coins || 0) + 5; // 附赠 5 传承币
  d.coinsEarned = (d.coinsEarned || 0) + 5;
  Store.save();
  renderStatus();
  showUnlock(a);
  // 集齐所有成就（除 all_done 自身）
  var total = YS_ACHIEVEMENTS.filter(function (x) { return x.id !== "all_done"; }).length;
  var got = Object.keys(d.achievements).filter(function (k) { return k !== "all_done"; }).length;
  if (got >= total && !d.achievements["all_done"]) {
    d.achievements["all_done"] = true;
    Store.save();
  }
}

function showUnlock(a) {
  var ico = $("#unlockIco"), nm = $("#unlockName"), ds = $("#unlockDesc"), mask = $("#unlockMask");
  if (ico) ico.textContent = a.ico;
  if (nm) nm.textContent = a.name;
  if (ds) ds.textContent = a.desc;
  if (mask) mask.classList.add("show");
  Sound.unlock();
  vibrate([10, 40, 10]);
}

/* ---------------------------------------------------------------- 签到 */
function doCheckin() {
  var d = Store.data;
  var today = ds();
  if (d.checkin.last === today) {
    toast("今天已经签到过啦", { ico: "✅" });
    return;
  }
  var yesterday = addDays(today, -1);
  var streak = (d.checkin.last === yesterday) ? d.checkin.streak + 1 : 1;
  d.checkin.last = today;
  d.checkin.streak = streak;
  d.checkin.total += 1;
  if (d.checkin.dates.indexOf(today) < 0) d.checkin.dates.push(today);

  // 7 日递增奖励（按连续天数循环）
  var dayIdx = (streak - 1) % 7;
  var r = YS_SIGN_REWARDS[dayIdx] || YS_SIGN_REWARDS[0];
  d.user.coins += r.coins;
  d.user.xp += r.xp;
  d.coinsEarned = (d.coinsEarned || 0) + r.coins;
  if (r.box) d.boxLeft = (d.boxLeft || 0) + r.box;

  Store.save();
  renderStatus();
  Sound.coin();
  confetti(30);

  /* 传承成长：推进今日研习（晒莨签到）与研习值 */
  if (typeof window.Growth !== "undefined") Growth.onAction("sign");

  // 刷新当前页
  if (Nav.current === "v-sign") renderSignCalendar();
  else if (Nav.current === "v-home") renderHome();
  else renderHome();

  var extra = r.box ? " · 额外获得 1 次开盒机会" : "";
  toast("签到成功！🪙 +" + r.coins + " ✨ +" + r.xp + extra + " · 连续 " + streak + " 天", { ico: "🎁" });
  if (streak === 1) unlockAchievement("first_sign");
  if (streak >= 7) unlockAchievement("sign_7");
  if (d.checkin.total >= 30) unlockAchievement("sign_30");
  if (d.coinsEarned >= 500) unlockAchievement("coins_500");
}

/* 统一加币 / 加经验 */
function addCoins(n) {
  Store.data.user.coins += n;
  Store.data.coinsEarned = (Store.data.coinsEarned || 0) + n;
  Store.save();
  renderStatus();
}
function addXp(n) {
  Store.data.user.xp += n;
  Store.save();
  renderStatus();
  if (Store.data.user.xp >= 1000) unlockAchievement("xp_1000");
}

/* 头像 / 头像框 / 称号 查询 */
/* 全部可用头像 = 预设头像 + 商店「头像装饰」类商品（需购买解锁） */
function allAvatarDefs() {
  var list = YS_AVATARS.slice();
  (typeof YS_SHOP !== "undefined" ? YS_SHOP : []).forEach(function (it) {
    if (it.type === "decor" && it.av) {
      list.push({ id: it.id, ico: it.av.ico, bg: it.av.bg, shop: true, name: it.name, price: it.price });
    }
  });
  return list;
}
function getAvatar() {
  var id = Store.data.avatar;
  var a = allAvatarDefs().filter(function (x) { return x.id === id; })[0];
  return a || YS_AVATARS[0];
}
function getFrame() {
  var id = Store.data.frame;
  var f = YS_FRAMES.filter(function (x) { return x.id === id; })[0];
  return f || YS_FRAMES[0];
}
function getTitle() {
  var id = Store.data.title;
  var t = YS_TITLES.filter(function (x) { return x.id === id; })[0];
  return t || YS_TITLES[0];
}

/* ---------------------------------------------------------------- 等级/称号 炫彩徽章
   tier 越高特效越炫：0 普通 → 1 精良 → 2 稀有 → 3 史诗 → 4 传说(炫彩流光)
   所有身份展示统一走这里，保证各页面视觉一致。 */

/* 取称号档位（兼容未定义 tier 的旧数据） */
function titleTier(t) {
  if (!t) return 0;
  if (typeof t.tier === "number") return t.tier;
  return 0;
}
/* 等级徽章：Lv.N，class 带档位；点击弹出全部等级面板（游戏段位式）
   opts.tag=紧凑标签 / opts.glow=加强光晕 / opts.noClick=不可点(面板内展示用) */
function levelBadgeHTML(lv, opts) {
  opts = opts || {};
  var tier = (typeof titleTierOfLevel === "function") ? titleTierOfLevel(lv) : 0;
  var cls = "rk rk-lv rank-t" + tier + (opts.tag ? " rk-tag" : "") + (opts.glow ? " rk-glow" : "");
  if (!opts.noClick) cls += " rk-clickable";
  var attr = opts.noClick ? "" : ' data-act="levelPanel" role="button" tabindex="0"';
  /* 高档等级加星辉装饰：史诗✨ / 传说👑 */
  var deco = !opts.noClick && tier >= 4 ? '<span class="rk-deco">👑</span>' : (!opts.noClick && tier === 3 ? '<span class="rk-deco">✨</span>' : '');
  var badge = '<span class="' + cls + '"' + attr + ' aria-label="查看全部等级">' + deco + 'Lv.' + lv + '</span>';

  /* 传说档最后三级逐级增强：13 炫彩 / 14 少量随机轨道粒子 / 15 更多随机轨道粒子
     每颗粒子的半径、周期、方向、大小、色相都不同——像自由飞舞的彩色光点，而非规则圆环 */
  if (tier >= 4) {
    var eliteCls = "rk-elite rk-elite-" + lv;
    var eliteAttr = opts.noClick ? "" : ' data-act="levelPanel" role="button" tabindex="0"';
    var aura = "";
    if (lv >= 14) {
      /* 确定性伪随机参数表：[起始角deg, 半径px, 周期s, 方向(1顺/-1逆), 大小px, 色相] */
      var ORB = [
        [12, 30, 5.2, 1, 6, 352], [73, 22, 7.8, -1, 5, 28],
        [141, 34, 6.1, 1, 7, 52], [198, 19, 9.3, -1, 4, 142],
        [257, 27, 4.7, 1, 5, 195], [310, 24, 8.4, -1, 6, 268],
        [46, 32, 5.9, 1, 4, 315], [175, 21, 7.1, -1, 5, 168]
      ];
      var count = lv >= 15 ? 8 : 4;
      var orbs = "";
      for (var i = 0; i < count; i++) {
        var o = ORB[i];
        orbs += '<span class="rk-orb" style="--rot:' + o[2] + 's;--delay:' + (-i * 0.9).toFixed(1) + 's;--dir:' + (o[3] > 0 ? 'normal' : 'reverse') + '" aria-hidden="true">' +
                  '<span class="rk-dot" style="--a:' + o[0] + 'deg;--r:' + o[1] + 'px;--s:' + o[4] + 'px;--h:' + o[5] + '"></span>' +
                '</span>';
      }
      aura += '<span class="rk-particles" aria-hidden="true">' + orbs + '</span>';
    }
    return '<span class="' + eliteCls + '"' + eliteAttr + ' aria-label="查看全部等级">' + aura + badge + '</span>';
  }
  return badge;
}
/* 称号徽章：文字按稀有度上色，传说档为炫彩流光字 */
function titleBadgeHTML(title, opts) {
  opts = opts || {};
  var t = title || getTitle();
  var tier = titleTier(t);
  var name = t && t.name ? t.name : "无称号";
  var cls = "rk rk-title rank-t" + tier + (opts.block ? " rk-block" : "") + (opts.big ? " rk-big" : "");
  /* 高档称号加装饰：史诗✨、传说👑+流光，越高级越显赫 */
  var deco = tier >= 4 ? '<span class="rk-deco">👑</span>' : tier === 3 ? '<span class="rk-deco">✨</span>' : '';
  return '<span class="' + cls + '">' + deco + esc(name) + '</span>';
}
/* 稀有度中文名（用于称号列表标注） */
function tierName(tier) {
  return ["普通", "精良", "稀有", "史诗", "传说"][tier] || "普通";
}

/* 全部等级面板（游戏段位式）：点击任意 Lv.X 徽章打开 */
function showLevelPanel() {
  var d = Store.data;
  var li = levelInfo(d.user.xp);
  var curLv = li.cur.lv;
  var xp = d.user.xp;

  /* 顶部当前段位大卡 */
  var head =
    '<div class="lvp-hero rank-bg-t' + titleTierOfLevel(curLv) + '">' +
      '<div class="lvp-hero-crown">' + (curLv >= 13 ? '👑' : curLv >= 10 ? '✨' : '🎖️') + '</div>' +
      '<div class="lvp-hero-lv">' + levelBadgeHTML(curLv, { glow: true, noClick: true }) + '</div>' +
      '<div class="lvp-hero-name">' + esc(li.cur.name) + '</div>' +
      '<div class="lvp-hero-xp">当前 ' + xp + ' 积分' + (li.next ? ' · 距下一级还需 ' + (li.next.xp - xp) + ' 分' : ' · 已达最高等级') + '</div>' +
      '<div class="lvp-bar"><i style="width:' +
        (li.next ? Math.max(0, Math.min(100, (xp - li.cur.xp) / (li.next.xp - li.cur.xp) * 100)) : 100) + '%"></i></div>' +
    '</div>';

  /* 全部等级阶梯（从高到低，像段位表） */
  var rows = YS_LEVELS.slice().reverse().map(function (L) {
    var tier = titleTierOfLevel(L.lv);
    var reached = xp >= L.xp;
    var isCur = L.lv === curLv;
    var cls = "lvp-row lvp-t" + tier + (reached ? " reached" : " locked") + (isCur ? " current" : "");
    var status = isCur ? '<span class="lvp-now">当前</span>'
      : reached ? '<span class="lvp-ok">✓ 已达成</span>'
      : '<span class="lvp-lock">' + L.xp + ' 分</span>';
    return '<div class="' + cls + '">' +
      '<div class="lvp-badge">' + levelBadgeHTML(L.lv, { tag: true, noClick: true }) + '</div>' +
      '<div class="lvp-info"><b>' + esc(L.name) + '</b><span>' + tierName(tier) + ' · ' + L.xp + ' 积分</span></div>' +
      status + '</div>';
  }).join("");

  Sheet.open({
    title: "研学等级",
    body: head +
      '<div class="lvp-section-title">🏅 全部等级 · 共 ' + YS_LEVELS.length + ' 级</div>' +
      '<div class="lvp-list">' + rows + '</div>' +
      '<div class="lvp-tip">完成任务、玩游戏、每日签到都能获得积分，等级越高徽章越炫彩！</div>',
    foot: '<button class="btn btn-primary btn-block" id="lvpClose">继续研学</button>',
    onMount: function () { var b = $("#lvpClose"); if (b) b.onclick = Sheet.close; }
  });
}
function avatarDisplayHTML(size) {
  var s = size || 54;
  var d = Store.data;
  var inner = (d.avatar === "custom" && d.customAvatar)
    ? '<img src="' + d.customAvatar + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover">'
    : getAvatar().ico;
  var fr = getFrame();
  var pad = fr.id !== "fr_none" ? "padding:5px;background:" + fr.color + ";" : "";
  return '<div style="width:' + s + 'px;height:' + s + 'px;border-radius:' + Math.round(s * 0.33) + 'px;' +
    'background:' + getAvatar().bg + ';' + pad + 'display:flex;align-items:center;justify-content:center;' +
    'font-size:' + Math.round(s * 0.44) + 'px;font-weight:800;color:#fff;flex-shrink:0;overflow:hidden">' + inner + '</div>';
}

window.addEventListener("DOMContentLoaded", boot);
