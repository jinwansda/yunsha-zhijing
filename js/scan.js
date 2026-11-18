/* ==========================================================================
   Scan —— 扫码进入点位（真实可用）
   --------------------------------------------------------------------------
   设计目标：在 H5 演示环境里「扫码功能」真正能用，而不是占位提示。
   实现三条路径：
     1) 实时相机扫码：getUserMedia + jsQR（环境摄像头），对准即自动识别；
     2) 相册/图片扫码：<input type=file> 选图 → canvas 解码（无相机/无 HTTPS 也能用）；
     3) 手动选择点位：兜底，跳到研学地图手要点位。
   QR 内容识别规则（任一即可）：
     · 标准格式  YUNSHA:POINT:<ID>
     · 简写      YS:<ID>
     · 网页链接  含 ?point=<ID> 或 #point=<ID>
     · 纯点位码  直接是 <ID>（如 HALL / WORKSHOP / DRYING_FIELD / RIVER）
   识别成功后调用 openPoint(id) 自动定位点位并解锁打卡，与地图手点完全等价。
   ========================================================================== */
(function (global) {
  "use strict";

  var overlay = null, video = null, canvas = null, cctx = null, fileInput = null;
  var acanvas = null, actx = null;
  var stream = null, raf = 0, running = false, lastText = "";

  function $(sel, root) { return (root || document).querySelector(sel); }

  function ensureDom() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.id = "scanOverlay";
    overlay.innerHTML =
      '<div class="scan-top">' +
        '<button class="scan-close" id="scanClose" aria-label="关闭">✕</button>' +
        '<div class="scan-title">扫码进入点位</div>' +
      '</div>' +
      '<div class="scan-stage">' +
        '<video id="scanVideo" playsinline autoplay muted></video>' +
        '<div class="scan-nocam" id="scanNoCam">' +
          '<div class="nc-ico">📷</div>' +
          '<div class="nc-t">相机不可用</div>' +
          '<div class="nc-d">可用「从相册选择二维码」或「手动选择点位」进入</div>' +
        '</div>' +
        '<div class="scan-frame">' +
          '<span class="c tl"></span><span class="c tr"></span>' +
          '<span class="c bl"></span><span class="c br"></span>' +
          '<div class="scan-line"></div>' +
        '</div>' +
        '<div class="scan-status" id="scanStatus">将园区二维码放入框内，即可自动定位点位</div>' +
      '</div>' +
      '<div class="scan-actions">' +
        '<button class="scan-btn" id="scanAlbum">🖼️ 从相册选择二维码</button>' +
        '<button class="scan-btn ghost" id="scanManual">📍 手动选择点位</button>' +
        '<input type="file" id="scanFile" accept="image/*" style="display:none">' +
      '</div>';

    document.body.appendChild(overlay);
    video = $("#scanVideo", overlay);
    canvas = document.createElement("canvas");
    cctx = canvas.getContext("2d", { willReadFrequently: true });
    acanvas = document.createElement("canvas");
    actx = acanvas.getContext("2d", { willReadFrequently: true });
    fileInput = $("#scanFile", overlay);

    $("#scanClose", overlay).addEventListener("click", close);
    $("#scanAlbum", overlay).addEventListener("click", function () { fileInput.click(); });
    $("#scanManual", overlay).addEventListener("click", function () {
      close();
      if (global.Nav) global.Nav.go("v-map");
    });
    fileInput.addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      if (f) decodeFile(f);
      fileInput.value = "";
    });
  }

  function setStatus(t) { var el = overlay && $("#scanStatus", overlay); if (el) el.textContent = t; }
  function showNoCam(on) {
    if (!overlay) return;
    overlay.classList.toggle("no-cam", !!on);
    var v = $("#scanVideo", overlay); if (v) v.style.visibility = on ? "hidden" : "visible";
  }

  function open() {
    ensureDom();
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
    lastText = "";
    startCamera();
  }

  function close() {
    stopCamera();
    if (overlay) overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  function startCamera() {
    showNoCam(false);
    setStatus("正在启动相机…");
    var md = global.navigator && global.navigator.mediaDevices;
    if (!md || !md.getUserMedia) { onCamError(); return; }
    md.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then(function (s) {
        stream = s;
        video.srcObject = s;
        video.play().catch(function () {});
        running = true;
        lastText = "";
        setStatus("将园区二维码放入框内，即可自动定位点位");
        loop();
      })
      .catch(function (err) { onCamError(err); });
  }

  function onCamError() {
    stopCamera();
    showNoCam(true);
    setStatus("相机不可用或未被授权，请用「从相册选择二维码」或「手动选择点位」");
  }

  function stopCamera() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (stream) { stream.getTracks().forEach(function (t) { try { t.stop(); } catch (e) {} }); stream = null; }
    if (video && video.srcObject) { try { video.srcObject = null; } catch (e) {} }
  }

  function loop() {
    if (!running) return;
    raf = global.requestAnimationFrame(loop);
    if (video.readyState < video.HAVE_ENOUGH_DATA) return;
    var w = video.videoWidth, h = video.videoHeight;
    if (!w || !h) return;
    canvas.width = w; canvas.height = h;
    cctx.drawImage(video, 0, 0, w, h);
    var img = cctx.getImageData(0, 0, w, h);
    var res = decode(img.data, w, h);
    if (res) handleResult(res);
  }

  function decode(data, w, h) {
    if (!global.jsQR) return null;
    try {
      var r = global.jsQR(data, w, h, { inversionAttempts: "attemptBoth" });
      return r && r.data ? r.data : null;
    } catch (e) { return null; }
  }

  function decodeFile(file) {
    stopCamera();           // 相册解码与相机互不干扰，先停相机释放共享资源
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        acanvas.width = img.width; acanvas.height = img.height;
        actx.drawImage(img, 0, 0);
        var d = actx.getImageData(0, 0, img.width, img.height);
        var res = decode(d.data, img.width, img.height);
        if (res) handleResult(res);
        else setStatus("未能从图片中识别二维码，请换一张清晰的二维码图片");
      };
      img.onerror = function () { setStatus("图片加载失败，请重试"); };
      img.src = fr.result;
    };
    fr.onerror = function () { setStatus("文件读取失败，请重试"); };
    fr.readAsDataURL(file);
  }

  function parsePoint(text) {
    text = (text || "").trim();
    if (!text) return null;
    var m;
    if ((m = text.match(/point[=:]([A-Za-z0-9_]+)/i))) return valid(m[1]);
    if ((m = text.match(/^ys:([A-Za-z0-9_]+)$/i))) return valid(m[1]);
    if ((m = text.match(/^yunsha:point:([A-Za-z0-9_]+)$/i))) return valid(m[1]);
    return valid(text);
  }

  function valid(id) {
    id = String(id || "").trim();
    var pts = global.YS_POINTS || [];
    for (var i = 0; i < pts.length; i++) if (pts[i].id === id) return id;
    return null;
  }

  function pointName(id) {
    var pts = global.YS_POINTS || [];
    for (var i = 0; i < pts.length; i++) if (pts[i].id === id) return pts[i].name;
    return id;
  }

  function handleResult(text) {
    if (!text || text === lastText) return;
    lastText = text;
    var pid = parsePoint(text);
    if (!pid) {
      setStatus("这不是园区点位二维码，请扫描正确的点位码");
      return;
    }
    var name = pointName(pid);
    stopCamera();
    close();
    if (global.openPoint) {
      global.openPoint(pid);
      if (global.toast) global.toast("已定位点位：" + name + "，打卡成功", { ico: "✅" });
    } else if (global.Nav) {
      global.Nav.go("v-map");
    }
  }

  global.Scan = {
    open: open,
    close: close,
    _parsePoint: parsePoint,
    _decodeFile: decodeFile
  };
})(window);
