/* ==========================================================================
   莨珠记 · 云纱智境 —— 交互特效层
   --------------------------------------------------------------------------
   点击涟漪 / 卡片 3D 倾斜 / 滚动进入动画 / 下拉刷新 / 粒子彩带
   全部为渐进增强：不支持时功能照常可用。
   ========================================================================== */
"use strict";

var FX = {
  revealIO: null,

  init: function () {
    this.bindRipple();
    this.bindTilt();
    this.initReveal();
    this.bindPullRefresh();
  },

  /* 1. 点击涟漪 */
  bindRipple: function () {
    document.addEventListener("pointerdown", function (e) {
      var b = e.target.closest(".btn, .tab, .quick, .game-card, .task-card, .know-card, .grid-entry, .de-item, .story-card, .master-card, .point-card, .shop-item, .map-building");
      if (!b || b.disabled) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var r = b.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 1.1;
      var n = document.createElement("span");
      n.className = "ripple-el";
      n.style.width = n.style.height = size + "px";
      n.style.left = (e.clientX - r.left - size / 2) + "px";
      n.style.top = (e.clientY - r.top - size / 2) + "px";
      if (getComputedStyle(b).position === "static") b.style.position = "relative";
      b.appendChild(n);
      setTimeout(function () { if (n.parentNode) n.remove(); }, 620);
    }, { passive: true });
  },

  /* 2. 卡片 3D 倾斜 */
  bindTilt: function () {
    var sel = ".hero-banner, .profile-hero, .game-hero";
    document.addEventListener("pointermove", function (e) {
      var card = e.target.closest(sel);
      if (!card) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var r = card.getBoundingClientRect();
      var cx = (e.clientX - r.left) / r.width - 0.5;
      var cy = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = "perspective(900px) rotateX(" + (-cy * 4).toFixed(2) +
        "deg) rotateY(" + (cx * 5).toFixed(2) + "deg)";
    }, { passive: true });
    document.addEventListener("pointerout", function (e) {
      var card = e.target.closest(sel);
      if (card) card.style.transform = "";
    }, { passive: true });
  },

  /* 3. 滚动进入动画 */
  initReveal: function () {
    if (!window.IntersectionObserver) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          FX.revealIO.unobserve(en.target);
        }
      });
    }, { root: document.getElementById("viewport"), threshold: 0.06, rootMargin: "0px 0px -20px" });
  },

  revealView: function (viewId) {
    // 只对首页做进入动画；二级页面一律不加透明类，避免"整页空白"
    if (viewId !== "v-home") return;
    if (!this.revealIO) return;
    var root = document.getElementById(viewId);
    if (!root) return;
    var nodes = root.querySelectorAll(".card, .grid-entry, .story-mini");
    var i = 0;
    Array.prototype.forEach.call(nodes, function (n) {
      if (n.classList.contains("reveal")) return;
      n.classList.add("reveal");
      n.style.transitionDelay = Math.min(i++ * 25, 160) + "ms";
      FX.revealIO.observe(n);
    });
    // 兜底：无论观察器是否触发，1 秒内一定恢复可见
    clearTimeout(this._fallback);
    this._fallback = setTimeout(function () {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add("in"); });
    }, 1000);
  },

  /* 4. 下拉刷新（首页） */
  bindPullRefresh: function () {
    var view = document.getElementById("v-home");
    if (!view) return;
    var startY = 0, pulling = false, dist = 0;
    var ind = document.createElement("div");
    ind.className = "pull-indicator";
    ind.textContent = "↓";
    view.insertBefore(ind, view.firstChild);
    view.addEventListener("touchstart", function (e) {
      if (view.scrollTop <= 0) { startY = e.touches[0].clientY; pulling = true; }
    }, { passive: true });
    view.addEventListener("touchmove", function (e) {
      if (!pulling) return;
      dist = e.touches[0].clientY - startY;
      if (dist > 0) {
        var h = Math.min(60, dist * 0.5);
        ind.style.height = h + "px";
        ind.style.opacity = Math.min(1, h / 36);
        ind.style.transform = "rotate(" + (dist * 1.6) + "deg)";
      }
    }, { passive: true });
    view.addEventListener("touchend", function () {
      if (!pulling) return;
      pulling = false;
      ind.style.height = "0px";
      ind.style.opacity = "0";
      ind.style.transform = "rotate(0deg)";
      if (dist > 80) {
        Sound.tick();
        toast("已刷新研学数据", { ico: "🔄" });
        renderHome();
      }
      dist = 0;
    });
  }
};

/* 视图切换后补挂动画 */
(function () {
  var origGo = Nav.go;
  Nav.go = function (id, opt) {
    origGo.call(Nav, id, opt);
    setTimeout(function () { FX.revealView(id); }, 60);
  };
})();

(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { FX.init(); });
  } else {
    setTimeout(function () { FX.init(); }, 0);
  }
})();
