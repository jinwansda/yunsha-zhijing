/* ==========================================================================
   莨珠记 · 云纱智境 —— 真实地图（腾讯地图 2D API）
   --------------------------------------------------------------------------
   · 境内地图合规：使用腾讯地图，坐标 GCJ-02
   · 用 2D API（qq.maps）而非 GL JS：DOM 图片瓦片渲染，不依赖 WebGL，
     兼容性更好（低端机、内嵌浏览器、软件渲染环境都能正常出底图）。
   · 零配置：index.html 已注入合规密钥代理（占位符由运行环境替换），学员无需任何 Key。
   · 离线/代理不可用：静默回落手绘园区图，一句轻提示，不白屏、不弹引导。
   · 高级可选项：正式部署到公网可在 config.js 填 TMAP_KEY 走直连（部署方一次性配置）。
   ========================================================================== */
(function (global) {
  "use strict";

  var KEY_PLACEHOLDER = "请到腾讯位置服务申请Key并替换此占位符";
  var SDK_SRC_DIRECT = "https://map.qq.com/api/js?v=2.exp&key=";
  var SDK_SRC = "https://map.qq.com/api/js?v=2.exp";
  var sdkLoading = null;
  var mapObj = null;
  var markers = [];
  var tileTimer = null;

  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function configuredKey() {
    var k = (global.APP_CONFIG && APP_CONFIG.TMAP_KEY) || "";
    return (k && k !== KEY_PLACEHOLDER && k.indexOf("请到") < 0) ? k : "";
  }
  function sdkReady() { return !!(global.qq && global.qq.maps && global.qq.maps.Map); }
  function proxyReady() {
    var cfg = global._TMapSecurityConfig;
    var host = cfg && cfg.serviceHost ? String(cfg.serviceHost) : "";
    return host.indexOf("__WB_") < 0 && host.indexOf("127.0.0.1") >= 0 && host.length > 20;
  }
  function toast(msg, ico) { try { global.toast(msg, { ico: ico || "🗺️", ms: 3000 }); } catch (e) {} }

  function waitSDK(timeout) {
    timeout = timeout || 2500;
    if (sdkReady()) return Promise.resolve(true);
    return new Promise(function (resolve) {
      var t0 = Date.now();
      var iv = setInterval(function () {
        if (sdkReady()) { clearInterval(iv); resolve(true); }
        else if (Date.now() - t0 > timeout) { clearInterval(iv); resolve(false); }
      }, 120);
    });
  }
  function loadSDK(url) {
    if (sdkReady()) return Promise.resolve(true);
    return new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = url; s.async = true;
      s.onload = function () { resolve(sdkReady()); };
      s.onerror = function () { resolve(false); };
      document.head.appendChild(s);
      setTimeout(function () { if (!sdkReady()) resolve(false); }, 10000);
    });
  }
  function ensureSDK() {
    if (sdkReady()) return Promise.resolve(true);
    if (sdkLoading) return sdkLoading;
    var url = proxyReady() ? SDK_SRC : (configuredKey() ? SDK_SRC_DIRECT + encodeURIComponent(configuredKey()) : "");
    if (!url) return Promise.resolve(false);
    sdkLoading = loadSDK(url);
    return sdkLoading;
  }

  function destroy() {
    if (tileTimer) { clearTimeout(tileTimer); tileTimer = null; }
    markers.forEach(function (m) { try { m.setMap(null); } catch (e) {} });
    markers = [];
    mapObj = null;
  }
  function fallback(msg) {
    destroy();
    if (global.Nav && Nav.current === "v-realmap") Nav.go("v-map", { push: false });
    if (msg) toast(msg, "🗺️");
  }

  /* 自定义标记：用 DOM 元素做 label（2D API 支持），避免外部图片 */
  function markerLabel(glyph, base) {
    var el = document.createElement("div");
    el.style.cssText = "display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;padding:0 7px;" +
      "border-radius:15px;background:" + (base ? "#C98A2E" : "#83533B") + ";color:#fff;font-size:13px;font-weight:800;" +
      "border:2.5px solid #fff;box-shadow:0 3px 10px rgba(51,35,26,.35);white-space:nowrap;";
    el.textContent = glyph;
    return el;
  }

  function open() {
    var body = $("#realmapBody");
    if (!body) return;
    Nav.go("v-realmap", { push: false });
    body.innerHTML = '<div class="subhead"><button class="back-btn" id="rmBack"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>真实地图</h2></div>' +
      '<div style="height:70vh;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--ink-3)">' +
      '<div style="font-size:40px;margin-bottom:12px">🗺️</div><div style="font-size:13px">地图加载中…</div></div>';
    $("#rmBack").onclick = function () { destroy(); Nav.back(); };

    ensureSDK().then(function (ok) {
      if (ok) renderMap(body);
      else fallback("当前环境暂无法加载在线地图，已为你切换到园区图");
    });
  }

  function renderMap(body) {
    var geo = global.YS_GEO;
    var d = global.Store && Store.data ? Store.data : { pointsDone: {} };
    var done = d.pointsDone || {};
    var center = new qq.maps.LatLng(geo.center.lat, geo.center.lng);

    body.innerHTML =
      '<div class="subhead"><button class="back-btn" id="rmBack2"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>真实地图 · ' + esc(geo.region) + '</h2></div>' +
      '<div style="position:relative;border-radius:16px;overflow:hidden;border:1px solid var(--line)">' +
        '<div id="rmCanvas" style="width:100%;height:66vh;min-height:420px"></div>' +
        '<div id="rmInfo" class="rm-info" style="display:none"></div>' +
      '</div>' +
      '<div class="card" style="margin-top:12px;padding:12px 14px">' +
        '<div style="font-size:12px;color:var(--ink-3);line-height:1.7">🖐️ 双指缩放 / 拖动平移 · 点击标记查看点位 · 地图数据来自腾讯地图</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
        '<button class="chip" id="rmHand2" style="flex:1">🗺️ 手绘地图</button>' +
        '<button class="chip chip-brand on" id="rmAll" style="flex:1">📍 查看全部点位</button>' +
      '</div>';

    $("#rmBack2").onclick = function () { destroy(); Nav.back(); };
    $("#rmHand2").onclick = function () { destroy(); Nav.go("v-map", { push: false }); };

    try {
      mapObj = new qq.maps.Map($("#rmCanvas"), {
        center: center, zoom: 14,
        mapTypeControl: false, panControl: false, zoomControl: true,
        zoomControlOptions: { position: qq.maps.ControlPosition.RIGHT_CENTER }
      });
    } catch (e) { fallback("地图初始化失败，已切换到园区图"); return; }

    /* 出图检测：确认底图瓦片已渲染，否则静默回落 */
    tileTimer = setTimeout(function () {
      var imgs = document.querySelectorAll("#rmCanvas img");
      if (!imgs.length && Nav.current === "v-realmap") fallback("地图加载较慢，已切换到园区图");
    }, 6000);

    Object.keys(geo.points).forEach(function (k) {
      var p = geo.points[k];
      var pdef = (global.YS_POINTS || []).filter(function (x) { return x.id === k; })[0] || {};
      var glyph = pdef.icon || (p.name || "点").slice(0, 1);
      var mk = new qq.maps.Marker({
        position: new qq.maps.LatLng(p.lat, p.lng), map: mapObj,
        label: markerLabel(glyph, false), title: p.name
      });
      qq.maps.event.addListener(mk, "click", function () { showInfo(k, p.name); });
      markers.push(mk);
    });
    var baseMk = new qq.maps.Marker({ position: center, map: mapObj, label: markerLabel("基", true), title: "研学基地" });
    markers.push(baseMk);

    $("#rmAll").onclick = function () {
      var b = new qq.maps.LatLngBounds();
      Object.keys(geo.points).forEach(function (k) { b.extend(new qq.maps.LatLng(geo.points[k].lat, geo.points[k].lng)); });
      b.extend(center);
      mapObj.fitBounds(b);
    };
    /* 注：鉴权提示条由 index.html 的全局清理器处理（只清空叶子节点文字，不隐藏容器）。
       切勿在此用 display:none + textContent 包含匹配——会误伤整个地图视图容器导致白屏。 */
  }

  function showInfo(key, name) {
    var box = $("#rmInfo"); if (!box) return;
    var d = Store.data || {};
    if (key === "BASE") {
      box.innerHTML = '<div class="rm-info-head"><b>莨珠记研学基地</b><span onclick="RealMap.closeInfo()">✕</span></div>' +
        '<div class="rm-info-body">' + esc((global.YS_GEO || {}).region || "") + ' · 香云纱非遗数字研学基地</div>';
      box.style.display = "block"; return;
    }
    var p = (global.YS_POINTS || []).filter(function (x) { return x.id === key; })[0];
    if (!p) return;
    var isDone = !!(d.pointsDone && d.pointsDone[key]);
    box.innerHTML =
      '<div class="rm-info-head"><b>' + esc(p.name) + '</b><span onclick="RealMap.closeInfo()">✕</span></div>' +
      '<div class="rm-info-body">' +
        '<div style="font-size:11.5px;color:var(--ink-3);margin-bottom:6px">' + esc(p.subtitle || "研学点位") + ' · ' + (isDone ? '✅ 已打卡' : '⬜ 未打卡') + '</div>' +
        '<div style="font-size:12.5px;line-height:1.65;color:var(--ink-2)">' + esc(p.description || "") + '</div>' +
        '<button class="btn btn-primary btn-sm btn-block" id="rmGoPoint" style="margin-top:12px">' + (isDone ? '查看点位详情' : '前往打卡') + '</button>' +
      '</div>';
    box.style.display = "block";
    $("#rmGoPoint").onclick = function () { closeInfo(); if (global.openPoint) openPoint(key); };
  }
  function closeInfo() { var b = $("#rmInfo"); if (b) b.style.display = "none"; }

  global.RealMap = { open: open, destroy: destroy, closeInfo: closeInfo, configuredKey: configuredKey };
})(window);
