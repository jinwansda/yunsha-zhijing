/* ================================================================
   莨珠记 · 云纱智境 —— 首页玩法指引（游戏式分步引导）
   聚光灯高亮框 + 指向箭头 + 气泡说明卡，像游戏新手教程一样
   一步步告诉用户「这个 APP 怎么玩、有什么功能」。

   · 新用户首次进入首页自动播放一次（Store.data.homeTourDone）
   · 设置 → 玩法指引 可随时重看（HomeTour.start(true)）
   ================================================================ */
(function (global) {
  "use strict";

  var $ = function (s) { return document.querySelector(s); };

  /* 指引步骤：sel=目标元素选择器  pad=高亮框外扩像素 */
  var STEPS = [
    { sel: "#homeBody .s3d-userbar",  pad: 6, title: "👋 这是你的研学档案",
      txt: "昵称、等级、传承币与积分都在这一条。做任务、玩游戏、每日签到都会涨，攒够成就还能解锁研学证书。" },
    { sel: "#s3dHero",                pad: 6, title: "🎡 活动轮播",
      txt: "每 1.5 秒自动切换，也可左右拖动。点击海报可直接进入对应玩法，比如「晒莨抢晴」小游戏。" },
    { sel: "#s3dNotice",              pad: 6, title: "📢 研学公告",
      txt: "重要通知像跑马灯一样滚动播放；点右侧「更多」可查看数字孪生联动详情。" },
    { sel: "#homeBody .s3d-trio",     pad: 6, title: "⚡ 三大快捷入口",
      txt: "香云纱百科、园区导览、游戏中心——最常用的三个功能在这里一键直达。" },
    { sel: "#realtimeCard",           pad: 6, title: "📡 晒场实况 · 数字孪生",
      txt: "光照、湿度、温度实时同步，还能一键「开始晒莨 / 模拟降雨 / 放晴」，看晒场环境怎么变化。" },
    { sel: "#homeBody .s3d-section",  pad: 6, title: "🗂 功能宫格",
      txt: "平台的全部功能都在这里：研学地图、研学任务、工艺知识、AI 问答、扫码打卡、3D 园区……点击图标即可进入。" },
    { sel: "#homeBody .s3d-progress", pad: 6, title: "🌱 我的研学历程",
      txt: "任务、成就、打卡、签到的成长汇总。完成全部 4 项研学任务，就能生成你的专属研学证书！" },
    { sel: "#tabbar",                 pad: 4, title: "🧭 底部导航",
      txt: "五个页面随时切换：首页、地图、任务、知识、我的。指引到此结束，开始你的寻纱之旅吧！" }
  ];

  var HomeTour = {
    i: 0,
    active: false,
    _cur: null,   /* {el, step} 当前步骤，供滚动/缩放时重新定位 */
    _onScroll: null,
    _onResize: null,
    _savedScroll: null,  /* 引导开始前的各容器 scrollTop，结束时原样恢复 */

    /* 是否处于「已登录、无任何全屏遮罩」的稳定首页态。
       Nav.current 默认就是 v-home，启动页阶段也会因 visibilitychange 触发 renderHome，
       若不校验遮罩，指引层(z-index 10001)会盖住启动页并挡住「登录即入」按钮导致卡死。 */
    canShow: function () {
      if (!global.Store || !Store.data || !Store.data.loggedIn) return false; // 游客/启动页阶段不弹
      var splash = document.getElementById("splash");
      if (splash && !splash.classList.contains("hide")) return false;          // 启动页还在
      var auth = document.getElementById("authWrap");
      if (auth && !auth.classList.contains("hide")) return false;              // 登录卡还在
      var gate = document.getElementById("gate");
      if (gate && !gate.classList.contains("hide")) return false;              // 新手引导还在
      if (typeof global.Nav !== "undefined" && Nav.current !== "v-home") return false;
      return true;
    },

    /* 首页渲染后调用：仅新用户自动播放一次 */
    maybe: function () {
      var self = this;
      if (this.active) return;
      if (global.Store && Store.data && Store.data.homeTourDone) return;
      setTimeout(function () {
        if (self.active) return;
        if (global.Store && Store.data && Store.data.homeTourDone) return;
        if (!self.canShow()) return; // 遮罩未退场 / 未真正进入首页时不弹（稍后其它 renderHome 会再触发）
        self.start();
      }, 700);
    },

    /* force=true 时无视「已看过」标记（设置页重看） */
    start: function (force) {
      if (this.active) return;
      if (!force && global.Store && Store.data && Store.data.homeTourDone) return;
      if (!this.canShow()) return; // 兜底：任何路径都不得在遮罩未退场时弹出
      /* 记录引导前的滚动位置：scrollIntoView 会连带滚动 .app 等祖先容器，
         若不在结束时恢复，会把固定布局的底部导航滚到屏幕中间（重看引导后的错位 BUG）。 */
      this._savedScroll = [];
      var self = this;
      var nodes = [document.querySelector(".app"), document.getElementById("v-home")];
      nodes.forEach(function (n) { if (n) self._savedScroll.push({ el: n, top: n.scrollTop }); });
      this.active = true;
      this.i = 0;
      this.build();
      this.show();
    },

    build: function () {
      this.destroy();
      var mask = document.createElement("div");
      mask.id = "tourMask";
      mask.className = "tour-mask";
      mask.innerHTML =
        '<div class="tour-box" id="tourBox"></div>' +
        '<div class="tour-arrow up" id="tourArrow"></div>' +
        '<div class="tour-card" id="tourCard">' +
          '<div class="tc-step" id="tourStep"></div>' +
          '<h4 id="tourTitle"></h4>' +
          '<p id="tourTxt"></p>' +
          '<div class="tc-btns">' +
            '<button class="tc-btn tc-skip" id="tourSkip">跳过指引</button>' +
            '<button class="tc-btn tc-prev" id="tourPrev">上一步</button>' +
            '<button class="tc-btn tc-next" id="tourNext">下一步</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(mask);

      var self = this;
      $("#tourNext").addEventListener("click", function () { self.next(); });
      $("#tourPrev").addEventListener("click", function () { self.prev(); });
      $("#tourSkip").addEventListener("click", function () { self.end(true); });

      /* 滚动 / 缩放时让高亮框跟着目标走（capture 捕获任意容器滚动） */
      this._onScroll = function () { if (self._cur) self.place(self._cur.el, self._cur.step); };
      this._onResize = this._onScroll;
      document.addEventListener("scroll", this._onScroll, true);
      window.addEventListener("resize", this._onResize);
    },

    show: function () {
      if (!this.active || !document.getElementById("tourMask")) return;
      var step = STEPS[this.i];
      var el = step && document.querySelector(step.sel);
      if (!el) { /* 目标尚未渲染：跳到下一步 */
        if (this.i < STEPS.length - 1) { this.i++; this.show(); return; }
        this.end(true); return;
      }

      $("#tourStep").textContent = "步骤 " + (this.i + 1) + " / " + STEPS.length;
      $("#tourTitle").textContent = step.title;
      $("#tourTxt").textContent = step.txt;
      $("#tourNext").textContent = this.i >= STEPS.length - 1 ? "开始探索 🎉" : "下一步";
      $("#tourPrev").style.display = this.i <= 0 ? "none" : "";

      this._cur = { el: el, step: step };
      /* 让目标进入视野：只滚动它所在的 .view 容器，绝不用 scrollIntoView——
        后者会连带滚动 .app 祖先，把底部导航滚到屏幕中间，结束引导后布局错位。 */
      this.scrollTargetIntoView(el);
      var self = this;
      setTimeout(function () {
        if (self.active && self._cur && self._cur.el === el) self.place(el, step);
      }, 280);
      this.place(el, step); /* 先立即摆一次，滚动中由监听器持续校正 */
    },

    /* 仅滚动目标所在的 .view 容器，使其进入视野中部。
       绝不触碰 .app / body 的滚动（它们是固定布局，滚动会导致导航条错位）。 */
    scrollTargetIntoView: function (el) {
      if (!el || el.id === "tabbar") return; // 底部导航固定在视口，无需滚动
      var scroller = null, p = el.parentElement;
      while (p) {
        if (p.classList && p.classList.contains("view")) { scroller = p; break; }
        p = p.parentElement;
      }
      if (!scroller) return;
      try {
        var er = el.getBoundingClientRect(), sr = scroller.getBoundingClientRect();
        var delta = (er.top + er.height / 2) - (sr.top + sr.height / 2);
        scroller.scrollTop += delta;
      } catch (e) {}
    },

    /* 计算并摆放高亮框 / 箭头 / 气泡卡 */
    place: function (el, step) {
      if (!this.active || !document.getElementById("tourMask")) return;
      var pad = step && step.pad != null ? step.pad : 6;
      var r = el.getBoundingClientRect();
      var vw = window.innerWidth, vh = window.innerHeight;
      var box = $("#tourBox"), card = $("#tourCard"), arrow = $("#tourArrow");

      /* 高亮框：罩住目标（box-shadow 大扩散把四周压暗，形成聚光灯效果） */
      box.style.left = (r.left - pad) + "px";
      box.style.top = (r.top - pad) + "px";
      box.style.width = (r.width + pad * 2) + "px";
      box.style.height = (r.height + pad * 2) + "px";

      /* 气泡卡：目标在上半屏 → 卡片放下方；否则放上方 */
      var below = r.top + r.height / 2 < vh / 2;
      var cw = Math.min(320, vw - 24);
      var cx = Math.min(Math.max(12, r.left + r.width / 2 - cw / 2), vw - cw - 12);
      card.style.width = cw + "px";
      card.style.left = cx + "px";
      card.style.visibility = "hidden";
      card.style.top = "0px";
      var realH = card.offsetHeight || 150;
      var top;
      if (below) {
        top = r.bottom + pad + 26;
        if (top + realH > vh - 12) top = Math.max(12, vh - realH - 12);
      } else {
        top = r.top - pad - 26 - realH;
        if (top < 12) top = 12;
        if (top + realH > r.top - pad - 4) top = Math.max(12, r.top - pad - realH - 4);
      }
      card.style.top = top + "px";
      card.style.visibility = "";

      /* 箭头：夹在气泡与高亮框之间，指向目标 */
      var ax = Math.min(Math.max(r.left + r.width / 2, cx + 26), cx + cw - 26);
      arrow.style.left = (ax - 9) + "px";
      if (below) {
        arrow.style.top = (top - 12) + "px";
        arrow.className = "tour-arrow up";     /* 三角朝上：指向头顶的目标 */
      } else {
        arrow.style.top = (top + realH) + "px";
        arrow.className = "tour-arrow down";   /* 三角朝下：指向脚下的目标 */
      }
    },

    next: function () {
      if (this.i >= STEPS.length - 1) { this.end(true); return; }
      this.i++;
      this.show();
    },

    prev: function () {
      if (this.i <= 0) return;
      this.i--;
      this.show();
    },

    end: function (save) {
      this.active = false;
      this._cur = null;
      this.destroy();
      /* 恢复引导开始前的滚动位置，确保 .app / 首页视图回到原样，导航条归位 */
      if (this._savedScroll) {
        this._savedScroll.forEach(function (s) {
          try { s.el.scrollTop = s.top; } catch (e) {}
        });
        this._savedScroll = null;
      }
      if (save && global.Store && Store.data) {
        Store.data.homeTourDone = true;
        try { Store.save(); } catch (e) {}
      }
      try { global.toast("指引完成！随时可在「设置 → 玩法指引」重看", { ico: "🧭" }); } catch (e) {}
    },

    destroy: function () {
      if (this._onScroll) {
        document.removeEventListener("scroll", this._onScroll, true);
        window.removeEventListener("resize", this._onResize);
        this._onScroll = this._onResize = null;
      }
      var m = document.getElementById("tourMask");
      if (m && m.parentNode) m.parentNode.removeChild(m);
    }
  };

  global.HomeTour = HomeTour;
})(window);
