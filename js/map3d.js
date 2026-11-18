/* ==========================================================================
   莨珠记 · 云纱智境 —— 真实地图 + 3D 园区场景
   --------------------------------------------------------------------------
   1. 真实地图：使用 OpenStreetMap 瓦片（无需密钥），可缩放平移，
      标注四大点位真实坐标，点击进入点位详情。
   2. 3D 场景：使用 Three.js 构建镬耳屋主馆、工坊、晒场、河涌立体模型，
      可旋转/缩放/平移，点位标注可点击，预留 UE 虚拟引擎对接。
   ========================================================================== */
"use strict";

/* ---------------------------------------------------------------- 真实地图（Leaflet 风格，用 OSM 瓦片 + 纯 Canvas/SVG 实现，无需外部库）
   为保持离线可用，这里实现一个轻量地图视图：
   - 用 SVG/Canvas 绘制地图瓦片（OGC 风格的园区示意图）+ 真实坐标换算
   - 点击「切换到 3D」进入 Three.js 场景 */
var RealMap = {
  init: function () {
    this.tileUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
    this.center = YS_GEO.center;
    this.zoom = 16;
  }
};

/* three.js 体积约 633KB，首屏不加载；进入 3D 地图时才按需拉取，Promise 缓存避免重复请求 */
var threePromise = null;
function ensureThree() {
  if (typeof THREE !== "undefined") return Promise.resolve();
  if (threePromise) return threePromise;
  threePromise = new Promise(function (res, rej) {
    var s = document.createElement("script");
    s.src = "assets/vendor/three.min.js";
    s.async = true;
    s.onload = function () { res(); };
    s.onerror = function () { threePromise = null; rej(new Error("three load failed")); };
    document.head.appendChild(s);
  });
  return threePromise;
}

/* ---------------------------------------------------------------- 3D 园区场景 */
var Map3D = {
  scene: null, camera: null, renderer: null,
  controls: null, points: [], raf: null, inited: false,

  open: function () {
    $("#map3dBody").innerHTML =
      '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>3D 园区漫游</h2></div>' +
      '<div class="map3d-toolbar" style="display:flex;gap:8px;margin-bottom:12px">' +
        '<button class="chip chip-brand on" id="m3dReset">🔄 复位视角</button>' +
        '<button class="chip" id="m3dTop">⬆️ 俯视</button>' +
        '<button class="chip" id="m3dWalk">🚶 漫游视角</button>' +
      '</div>' +
      '<div class="map3d-hint" style="font-size:12px;color:var(--ink-3);text-align:center;margin-bottom:8px">🖐️ 单指旋转 · 双指缩放 · 拖动平移 · 点击建筑进入点位</div>' +
      '<div id="map3dCanvas" style="position:relative;border-radius:var(--r-xl);overflow:hidden;height:460px;background:linear-gradient(180deg,#87CEEB,#B9CBA4)"></div>' +
      '<div style="margin-top:12px;font-size:11px;color:var(--ink-3);text-align:center">🔗 本场景为香云纱园区数字孪生的轻量预览，完整场景由现场设备实时联动</div>';

    Nav.go("v-map3d", { after: function () {
      $("#map3dBody .back-btn").addEventListener("click", function () { Map3D.destroy(); Nav.back(); });
      $("#m3dReset").addEventListener("click", function () { Map3D.resetView(); });
      $("#m3dTop").addEventListener("click", function () { Map3D.setView("top"); });
      $("#m3dWalk").addEventListener("click", function () { Map3D.setView("walk"); });
      Map3D.build();
    }});
  },

  build: async function () {
    var container = $("#map3dCanvas");
    try { await ensureThree(); } catch (e) { /* 落到下方守卫提示 */ }
    if (!container || typeof THREE === "undefined") {
      var msg = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--ink-2)">' +
        '<div style="font-size:40px;margin-bottom:10px">🏗️</div>' +
        '<div>3D 引擎加载失败</div>' +
        '<div style="font-size:12px;color:var(--ink-3);margin-top:6px">请检查网络后重试，或使用数字孪生完整场景</div></div>';
      if (container) container.innerHTML = msg;
      return;
    }

    var w = container.clientWidth, h = container.clientHeight;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 60, 180);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 500);
    this.camera.position.set(28, 22, 38);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 光照
    var ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    var sun = new THREE.DirectionalLight(0xfff2e0, 1.2);
    sun.position.set(30, 40, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
    this.scene.add(sun);

    // 地面（草地）
    var groundGeo = new THREE.PlaneGeometry(100, 100);
    var groundMat = new THREE.MeshLambertMaterial({ color: 0x8FAE7B });
    var ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 河涌（蓝色长条）
    var riverGeo = new THREE.PlaneGeometry(14, 70);
    var riverMat = new THREE.MeshLambertMaterial({ color: 0x6FA8C4, transparent: true, opacity: 0.85 });
    var river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(-30, 0.02, 0);
    this.scene.add(river);

    // 晒场（深色长条布匹）
    this.buildDryingField();

    // 主馆（镬耳屋）
    this.buildHall(22, -18);

    // 工坊
    this.buildWorkshop(-14, -6);

    // 河涌泥料区标注
    this.buildRiverArea();

    // 交互
    this.bindControls();
    this.animate();
    this.inited = true;
  },

  buildHall: function (x, z) {
    var group = new THREE.Group();
    // 主体
    var bodyGeo = new THREE.BoxGeometry(10, 5, 7);
    var bodyMat = new THREE.MeshLambertMaterial({ color: 0xC9B99A });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 2.5;
    body.castShadow = true; body.receiveShadow = true;
    group.add(body);
    // 屋顶（三角）
    var roofShape = new THREE.Shape();
    roofShape.moveTo(-6, 0); roofShape.lineTo(0, 4); roofShape.lineTo(6, 0); roofShape.lineTo(-6, 0);
    var roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 7, bevelEnabled: false });
    var roofMat = new THREE.MeshLambertMaterial({ color: 0x5A4A3A });
    var roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.y = Math.PI / 2;
    roof.position.set(0, 5, -3.5);
    roof.castShadow = true;
    group.add(roof);
    // 镬耳墙
    var earGeo = new THREE.BoxGeometry(0.5, 3, 7);
    var earMat = new THREE.MeshLambertMaterial({ color: 0x6B4430 });
    var ear1 = new THREE.Mesh(earGeo, earMat); ear1.position.set(-5.2, 6.5, 0); group.add(ear1);
    var ear2 = new THREE.Mesh(earGeo, earMat); ear2.position.set(5.2, 6.5, 0); group.add(ear2);

    group.position.set(x, 0, z);
    group.userData = { point: "HALL", name: "莨珠记主馆" };
    this.scene.add(group);
    this.points.push(group);
    this.addPin(x, 8, z, "馆", "HALL");
  },

  buildWorkshop: function (x, z) {
    var group = new THREE.Group();
    var bodyGeo = new THREE.BoxGeometry(8, 4, 6);
    var bodyMat = new THREE.MeshLambertMaterial({ color: 0xB5A486 });
    var body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 2;
    body.castShadow = true; body.receiveShadow = true;
    group.add(body);
    var roofGeo = new THREE.ConeGeometry(5.5, 2.5, 4);
    var roofMat = new THREE.MeshLambertMaterial({ color: 0x5A4A3A });
    var roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 5.2; roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    group.position.set(x, 0, z);
    group.userData = { point: "WORKSHOP", name: "染整工作坊" };
    this.scene.add(group);
    this.points.push(group);
    this.addPin(x, 7, z, "坊", "WORKSHOP");
  },

  buildDryingField: function () {
    // 晒场区域：多排深色布匹
    var mat = new THREE.MeshLambertMaterial({ color: 0x4A3527 });
    for (var i = 0; i < 6; i++) {
      var geo = new THREE.BoxGeometry(3, 0.15, 14);
      var cloth = new THREE.Mesh(geo, mat);
      cloth.position.set(8 + i * 4, 0.1, 22);
      cloth.receiveShadow = true;
      cloth.userData = { point: "DRYING_FIELD", name: "草地晒莨场" };
      this.scene.add(cloth);
      this.points.push(cloth);
    }
    this.addPin(18, 7, 22, "晒", "DRYING_FIELD");
  },

  buildRiverArea: function () {
    // 河涌泥料区用泥色平面表示
    var geo = new THREE.PlaneGeometry(12, 10);
    var mat = new THREE.MeshLambertMaterial({ color: 0x6B4A32 });
    var mud = new THREE.Mesh(geo, mat);
    mud.rotation.x = -Math.PI / 2;
    mud.position.set(-28, 0.03, 24);
    mud.userData = { point: "RIVER", name: "河涌泥料区" };
    this.scene.add(mud);
    this.points.push(mud);
    this.addPin(-28, 6, 24, "涌", "RIVER");
  },

  addPin: function (x, y, z, icon, pointId) {
    // 用 Sprite 做标注
    var canvas = document.createElement("canvas");
    canvas.width = 64; canvas.height = 64;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#83533B";
    ctx.beginPath(); ctx.arc(32, 32, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "28px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(icon, 32, 34);
    var tex = new THREE.CanvasTexture(canvas);
    var mat = new THREE.SpriteMaterial({ map: tex });
    var sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.scale.set(6, 6, 1);
    sprite.userData = { point: pointId, isPin: true };
    this.scene.add(sprite);
  },

  bindControls: function () {
    var self = this;
    var container = $("#map3dCanvas");
    var dragState = { dragging: false, lastX: 0, lastY: 0, mode: "rotate" };

    container.addEventListener("pointerdown", function (e) {
      dragState.dragging = true;
      dragState.lastX = e.clientX;
      dragState.lastY = e.clientY;
      dragState.mode = (e.pointerType === "touch" && e.touches && e.touches.length > 1) ? "zoom" : "rotate";
      container.setPointerCapture(e.pointerId);
    });
    container.addEventListener("pointermove", function (e) {
      if (!dragState.dragging) return;
      var dx = e.clientX - dragState.lastX;
      var dy = e.clientY - dragState.lastY;
      dragState.lastX = e.clientX; dragState.lastY = e.clientY;
      if (dragState.mode === "rotate") {
        self.theta -= dx * 0.01;
        self.phi = clamp(self.phi - dy * 0.01, 0.2, 1.4);
      } else {
        self.camera.position.y += dy * 0.15;
      }
    });
    container.addEventListener("pointerup", function () { dragState.dragging = false; });
    container.addEventListener("wheel", function (e) {
      e.preventDefault();
      self.radius = clamp(self.radius + e.deltaY * 0.05, 15, 80);
    }, { passive: false });

    // 点击拾取
    var raycaster = new THREE.Raycaster();
    container.addEventListener("click", function (e) {
      var rect = container.getBoundingClientRect();
      var mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, self.camera);
      var intersects = raycaster.intersectObjects(self.points, true);
      for (var i = 0; i < intersects.length; i++) {
        var obj = intersects[i].object;
        var ud = obj.userData;
        while (obj && !ud.point) { obj = obj.parent; ud = obj ? obj.userData : {}; }
        if (ud && ud.point && !ud.isPin) {
          self.destroy();
          openPoint(ud.point);
          return;
        }
      }
      // 也检测 Sprite pin
      var pinIntersects = raycaster.intersectObjects(self.scene.children.filter(function (c) { return c.isSprite; }));
      for (var j = 0; j < pinIntersects.length; j++) {
        var sp = pinIntersects[j].object;
        if (sp.userData && sp.userData.point) {
          self.destroy();
          openPoint(sp.userData.point);
          return;
        }
      }
    });
  },

  animate: function () {
    var self = this;
    this.theta = this.theta || Math.PI / 4;
    this.phi = this.phi || 0.9;
    this.radius = this.radius || 55;
    function loop() {
      self.raf = requestAnimationFrame(loop);
      var r = self.radius;
      self.camera.position.x = Math.sin(self.theta) * Math.sin(self.phi) * r;
      self.camera.position.y = Math.cos(self.phi) * r;
      self.camera.position.z = Math.cos(self.theta) * Math.sin(self.phi) * r;
      self.camera.lookAt(0, 0, 0);
      self.renderer.render(self.scene, self.camera);
    }
    loop();
  },

  setView: function (mode) {
    if (mode === "top") { this.phi = 0.3; this.radius = 70; }
    else if (mode === "walk") { this.phi = 1.1; this.radius = 25; }
  },

  resetView: function () {
    this.theta = Math.PI / 4;
    this.phi = 0.9;
    this.radius = 55;
  },

  destroy: function () {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
    this.scene = null; this.camera = null; this.renderer = null;
    this.points = [];
    this.raf = null;
    this.inited = false;
  }
};

/* ---------------------------------------------------------------- 地图入口增强：在 renderMap 中增加按钮 */
function addMapViewButtons() {
  // 在渲染地图时，顶部增加「真实地图 / 3D 场景」切换按钮
  return '<div class="dual-entry" style="margin-bottom:14px">' +
    '<button class="de-item" id="map3dBtn">' +
      '<span class="de-ico">🏗️</span>' +
      '<span class="de-txt"><b>3D 园区漫游</b><i>可旋转缩放 · 点击建筑</i></span>' +
    '</button>' +
    '<button class="de-item" id="mapRealBtn">' +
      '<span class="de-ico">🗺️</span>' +
      '<span class="de-txt"><b>真实地图</b><i>' + YS_GEO.region + '</i></span>' +
    '</button>' +
  '</div>';
}
