/* ==========================================================================
   Home3D —— 新版首页（3D 图标网格门户）
   --------------------------------------------------------------------------
   参考「发现顺德 / 乐活顺德」小程序布局：
     搜索胶囊 → 大 Banner → 三张 CTA 小卡 → 资讯条 → 分区 3D 图标网格
     → 双图文卡 → 研学路线 → 研学历程
   通过覆盖 window.renderHome 接入原导航体系，不改动任何其它业务逻辑。
   ========================================================================== */
(function (global) {
  "use strict";

  function svg(name) {
    return (typeof Icon3D !== "undefined") ? Icon3D.svg(name) : "";
  }

  /* 安全调用：模块未加载时给提示，绝不让整页按钮崩掉 */
  function call(name, arg) {
    var fn = global[name];
    if (typeof fn === "function") { try { fn(arg); } catch (e) { toast("打开失败：" + e.message, { ico: "⚠️" }); } }
    else toast("该功能正在加载，请稍后重试", { ico: "⏳" });
  }
  function nav(id) { global.Nav.go(id); }

  /* ---------------------------------------------------------------- 动作表 */
  var ACT = {
    map:      function () { nav("v-map"); },
    task:     function () { nav("v-task"); },
    know:     function () { nav("v-know"); },
    me:       function () { nav("v-me"); },
    ai:       function () { call("openAiChat"); },
    scan:     function () { Scan.open(); },
    cert:     function () { call("openCert"); },
    ue:       function () { call("openUePanel"); },
    enc:      function () { call("renderEncyclopedia"); },
    story:    function () { call("renderStories"); },
    master:   function () { call("renderMasters"); },
    timeline: function () { call("openTimeline"); },
    map3d:    function () { call("openMap3D"); },
    realmap:  function () { call("openRealMap"); },
    report:   function () { call("openReport"); },
    ach:      function () { nav("v-me"); toast("成就墙在「我的」页面", { ico: "🏆" }); },
    sign:     function () { call("renderSignCalendar"); },
    shop:     function () { call("renderShop"); },
    box:      function () { call("renderBox"); },
    avatar:   function () { call("renderAvatarPicker"); },
    frame:    function () { call("renderFramePicker"); },
    title:    function () { call("renderTitlePicker"); },
    inventory: function () { call("renderInventory"); },
    share:    function () { call("renderShare"); },
    game:     function () { call("openGames"); },
    mudgame:  function () { call("openGames"); call("MudGameStart"); },
    settings: function () { call("renderSettings"); },
    teacher:  function () { nav("v-teacher"); },
    /* 章节 / 图文卡跳转 */
    chapter:  function (id) { call("openEncycChapter", id); },
    point:    function (id) { call("openPoint", id); },
    storyOpen: function (id) { call("openStory", id); }
  };

  /* ---------------------------------------------------------------- 分区数据 */
  var GROUPS = [
    {
      title: "研学服务", extra: "核心功能 · 8 项",
      items: [
        { ico: "map",   name: "研学地图", sub: "四大点位", act: "map" },
        { ico: "task",  name: "研学任务", sub: "闯关答题", act: "task" },
        { ico: "know",  name: "工艺知识", sub: "图文课程", act: "know" },
        { ico: "me",    name: "我的学习", sub: "报告成绩", act: "me" },
        { ico: "ai",    name: "AI 问答", sub: "大模型 RAG", act: "ai" },
        { ico: "scan",  name: "扫码打卡", sub: "点位签到", act: "scan" },
        { ico: "cert",  name: "研学证书", sub: "完成4项解锁", act: "cert" },
        { ico: "ue",    name: "数字孪生联动", sub: "虚实结合", act: "ue" }
      ]
    },
    {
      title: "知识宝库", extra: "非遗文化 · 8 项",
      items: [
        { ico: "enc",      name: "香云纱百科", sub: "10 章长文", act: "enc" },
        { ico: "story",    name: "非遗故事", sub: "匠心往事", act: "story" },
        { ico: "master",   name: "传承人", sub: "守艺风采", act: "master" },
        { ico: "timeline", name: "历史时间线", sub: "唐至今", act: "timeline" },
        { ico: "map3d",    name: "3D 园区", sub: "可旋转缩放", act: "map3d" },
        { ico: "realmap",  name: "真实地图", sub: "实景定位", act: "realmap" },
        { ico: "report",   name: "学习报告", sub: "雷达分析", act: "report" },
        { ico: "ach",      name: "成就墙", sub: "28 枚徽章", act: "ach" }
      ]
    },
    {
      title: "奖励中心", extra: "边学边玩 · 8 项",
      items: [
        { ico: "checkin",   name: "每日签到", sub: "7 日奖励", act: "sign" },
        { ico: "shop",      name: "传承商店", sub: "装扮兑换", act: "shop" },
        { ico: "box",       name: "非遗盲盒", sub: "概率抽奖", act: "box" },
        { ico: "avatar",    name: "我的装扮", sub: "头像头像框", act: "avatar" },
        { ico: "inventory", name: "我的收藏", sub: "已获得物品", act: "inventory" },
        { ico: "title",     name: "称号佩戴", sub: "身份展示", act: "title" },
        { ico: "share",     name: "分享卡片", sub: "成果海报", act: "share" },
        { ico: "game",      name: "游戏中心", sub: "6 个小游戏", act: "game" }
      ]
    }
  ];

  function item(it) {
    return '<button class="s3d-item" data-act="' + it.act + '"' + (it.arg ? ' data-arg="' + it.arg + '"' : '') + '>' +
      '<span class="s3d-ico">' + svg(it.ico) + '</span>' +
      '<span>' + it.name + '</span>' +
      (it.sub ? '<em>' + it.sub + '</em>' : '') +
    '</button>';
  }

  function section(g, idx) {
    return '<section class="s3d-section">' +
      '<div class="s3d-sec-head"><i class="sh-bar"></i><h3>' + g.title + '</h3>' +
        (idx === 2
          ? '<span class="sh-extra" id="homeCheckinBtn" style="color:var(--brand);font-weight:800;cursor:pointer">签到 ›</span>'
          : '<span class="sh-extra">' + g.extra + '</span>') +
      '</div>' +
      '<div class="s3d-grid">' + g.items.map(item).join("") + '</div>' +
    '</section>';
  }

  /* ---------------------------------------------------------------- 搜索 */
  function searchData() {
    var list = [];
    (global.YS_POINTS || []).forEach(function (p) {
      list.push({ ico: "map", name: p.name, desc: "研学点位 · " + (p.subtitle || ""), act: "point", arg: p.id });
    });
    (global.YS_KNOWLEDGE || []).forEach(function (k) {
      list.push({ ico: "know", name: k.title, desc: "工艺知识 · " + (k.category || ""), act: "chapter", arg: k.id });
    });
    (global.YS_ENCYCLOPEDIA || []).forEach(function (e) {
      list.push({ ico: "enc", name: e.title, desc: "香云纱百科 · " + e.cat, act: "chapter", arg: e.id });
    });
    (global.YS_STORIES || []).forEach(function (s) {
      list.push({ ico: "story", name: s.title, desc: "非遗故事", act: "storyOpen", arg: s.id });
    });
    return list;
  }

  function openSearch() {
    if (typeof global.Sheet === "undefined") return;
    var all = searchData();
    global.Sheet.open({
      title: "搜索工艺 · 点位 · 知识",
      body: '<div class="field" style="margin-bottom:12px"><input id="s3dSearchInput" type="text" placeholder="试试：晒莨、河泥、薯莨、主馆…" autocomplete="off" /></div>' +
            '<div class="s3d-search-list" id="s3dSearchList"></div>',
      onMount: function () {
        var box = document.getElementById("s3dSearchList");
        var input = document.getElementById("s3dSearchInput");
        function paint(q) {
          q = (q || "").trim();
          var arr = q ? all.filter(function (x) { return (x.name + x.desc).indexOf(q) >= 0; }) : all.slice(0, 8);
          box.innerHTML = arr.length
            ? arr.slice(0, 20).map(function (x) {
                return '<div class="sr" data-act="' + x.act + '" data-arg="' + (x.arg || "") + '">' +
                  '<span class="sr-ico">' + svg(x.ico) + '</span>' +
                  '<div style="flex:1;min-width:0"><b>' + esc(x.name) + '</b><i>' + esc(x.desc) + '</i></div>' +
                  '<span style="color:var(--ink-4)">›</span></div>';
              }).join("")
            : '<div class="empty"><div class="t">没有找到相关内容</div><div class="d">换个关键词试试，或前往香云纱百科浏览全部内容</div></div>';
        }
        paint("");
        input.addEventListener("input", function () { paint(input.value); });
        box.addEventListener("click", function (e) {
          var r = e.target.closest(".sr");
          if (!r) return;
          global.Sheet.close();
          setTimeout(function () { run(r.dataset.act, r.dataset.arg); }, 180);
        });
        setTimeout(function () { input.focus(); }, 260);
      }
    });
  }

  function run(act, arg) {
    var fn = ACT[act];
    if (fn) fn(arg);
    else toast("该功能正在加载，请稍后重试", { ico: "⏳" });
  }

  /* ---------------------------------------------------------------- 渲染 */
  function renderHome3D() {
    var host = document.getElementById("homeBody");
    if (!host) return;
    var d = global.Store.data;
    var li = global.levelInfo(d.user.xp);
    var name = d.user.name || "研学学员";
    var signed = d.checkin.last === global.ds();
    var nextXp = li.next ? li.next.xp : li.cur.xp;
    var xpPct = li.next ? global.clamp((d.user.xp - li.cur.xp) / (nextXp - li.cur.xp) * 100, 0, 100) : 100;
    var EI = global.YS_ENCYC_IMG || {};

    var html =
    '<div class="s3d-page">' +

      /* 搜索栏 */
      '<div class="s3d-searchbar" id="s3dSearchBar">' +
        '<span class="sb-ico">' + svg("search") + '</span>' +
        '<span>搜索景点、工艺、知识</span>' +
        '<span class="sb-hot"><span class="sb-3d" data-icon="flame"></span> 香云纱</span>' +
      '</div>' +

      /* 用户条 */
      '<div class="s3d-userbar" style="display:flex;align-items:center;gap:8px;margin:-2px 2px 12px">' +
        '<span style="width:30px;height:30px;display:inline-flex">' + svg("me") + '</span>' +
        '<b style="font-size:13px">' + esc(name) + '</b>' +
        (typeof levelBadgeHTML === "function" ? levelBadgeHTML(li.cur.lv, { tag: true }) : '<span style="font-size:11px;color:var(--ink-3)">Lv.' + li.cur.lv + '</span>') +
        (typeof titleBadgeHTML === "function" && getTitle().id !== "ti_none" ? titleBadgeHTML(getTitle()) : '') +
        '<span style="margin-left:auto;font-size:11px;font-weight:800;color:var(--amber);display:inline-flex;align-items:center;gap:3px">' + (typeof Icon3D!=="undefined"?Icon3D.box("coin",15):"🪙") + ' ' + (d.user.coins || 0) + ' 传承币 · ' + (typeof Icon3D!=="undefined"?Icon3D.box("ach",15):"✨") + ' ' + d.user.xp + ' 积分</span>' +
      '</div>' +

      /* 大 Banner（自动轮播：图片 + 活动，逐张滑入） */
      '<div class="s3d-hero" id="s3dHero">' +
        (global.YS_BANNERS || [{ img: (EI.drying || "assets/real/real_37.jpg"), badge: "国家级非遗", kicker: "YUNSHA · 云纱智境", title: "发现<em>香云纱</em><br>六百年岭南匠心", sub: "三蒸九煮十八晒 · 薯莨染整 · 数字研学" }])
          .map(function (bn, i) {
            return '<div class="h-slide' + (i === 0 ? ' on' : '') + '" data-hs="' + i + '"' +
              (bn.act ? ' data-act="' + bn.act + '"' + (bn.arg ? ' data-arg="' + bn.arg + '"' : '') : '') + '>' +
              '<img class="h-photo" src="' + bn.img + '" alt="" draggable="false">' +
              '<div class="h-badge">' + bn.badge + '</div>' +
              '<div class="h-inner">' +
                '<span class="h-kicker">' + bn.kicker + '</span>' +
                '<h2>' + bn.title + '</h2>' +
                '<div class="h-sub">' + bn.sub + '</div>' +
                '<div class="h-cta">' + (bn.cta || "开始寻纱之旅") + ' <span>→</span></div>' +
              '</div>' +
            '</div>';
          }).join("") +
        '<div class="h-cloud"></div>' +
        '<div class="h-dots" id="s3dHeroDots">' +
          (global.YS_BANNERS || [1]).map(function (_, i) { return '<i data-dot="' + i + '" class="' + (i === 0 ? 'on' : '') + '"></i>'; }).join("") +
        '</div>' +
      '</div>' +

      /* 三张小卡 */
      '<div class="s3d-trio">' +
        '<button class="t-card tint-a" data-act="enc">' +
          '<span class="t-ico">' + svg("enc") + '</span>' +
          '<b>香云纱百科</b><i>历史 · 原料 · 工艺</i>' +
          '<span class="t-cta">去看看 →</span>' +
        '</button>' +
        '<button class="t-card tint-b" data-act="map">' +
          '<span class="t-ico">' + svg("map") + '</span>' +
          '<b>园区导览</b><i>四大研学点位</i>' +
          '<span class="t-cta">去探索 →</span>' +
        '</button>' +
        '<button class="t-card tint-c" data-act="game">' +
          '<span class="t-ico">' + svg("game") + '</span>' +
          '<b>游戏中心</b><i>6 款工艺小游戏</i>' +
          '<span class="t-cta">去参与 →</span>' +
        '</button>' +
      '</div>' +

      /* 资讯条（跑马灯：文字从左往右滑过，滑到尽头停 1.5 秒再从头开始） */
      '<div class="s3d-notice" id="s3dNotice">' +
        '<span class="n-fire">' + Icon3D.box("notice", 22) + '</span>' +
        '<span class="n-txt"><span class="n-track"><b>研学公告</b>　香云纱染整技艺入选国家级非遗，晒莨场今日开放数字孪生联动，研学团队可预约匠人带教</span></span>' +
        '<span class="n-more">更多 ›</span>' +
      '</div>' +

      /* 实时数字孪生卡片（由 realtime.js 填充） */
      '<div id="realtimeCard"></div>' +

      /* 三大分区 */
      GROUPS.map(section).join("") +

      /* 双图文卡 */
      '<div class="s3d-plain-head"><i class="sh-bar"></i><h3>非遗影像</h3><span class="sh-extra">真实工序实拍</span></div>' +
      '<div class="s3d-dual">' +
        '<div class="d-card" data-act="chapter" data-arg="E06">' +
          '<img src="' + (EI.drying2 || "assets/real/real_03.jpg") + '" alt="晒莨场">' +
          '<div class="d-tit">晒莨场</div><div class="d-sub">阳光与草地的魔法</div>' +
          '<div class="d-cta">去看看 →</div>' +
        '</div>' +
        '<div class="d-card" data-act="chapter" data-arg="E08">' +
          '<img src="' + (EI.fabric || "assets/real/real_13.jpg") + '" alt="香云纱面料">' +
          '<div class="d-tit">一寸莨纱</div><div class="d-sub">会呼吸的丝绸</div>' +
          '<div class="d-cta">去看看 →</div>' +
        '</div>' +
      '</div>' +

      /* 研学路线 */
      '<div class="s3d-plain-head"><i class="sh-bar"></i><h3>研学路线推荐</h3><span class="sh-extra">4 站 · 约 90 分钟</span></div>' +
      '<div class="s3d-section" style="padding-top:12px">' +
        (global.YS_POINTS || []).map(function (p, i) {
          return '<div class="s3d-item" style="flex-direction:row;justify-content:flex-start;gap:10px;width:100%;padding:8px 6px;border-bottom:1px solid var(--line-2)" data-act="point" data-arg="' + p.id + '">' +
            '<span class="s3d-ico" style="width:38px;height:38px">' + svg(["enc", "craft", "sun", "river"][i % 4]) + '</span>' +
            '<span style="flex:1;text-align:left"><b style="font-size:13px">' + esc(p.name) + '</b>' +
              '<em style="display:block;margin-top:2px">第 ' + (i + 1) + ' 站 · ' + esc(p.subtitle || "研学点位") + '</em></span>' +
            '<span style="color:var(--ink-4);font-size:18px">›</span>' +
          '</div>';
        }).join("") +
      '</div>' +

      /* 研学历程 */
      '<div class="s3d-progress">' +
        '<div class="p-head"><b>✨ 我的研学历程</b>' +
          '<span style="display:inline-flex;align-items:center;gap:6px">' +
            (typeof levelBadgeHTML === "function" ? levelBadgeHTML(li.cur.lv, { tag: true }) : '<span>Lv.' + li.cur.lv + '</span>') +
            (typeof titleBadgeHTML === "function" && getTitle().id !== "ti_none" ? titleBadgeHTML(getTitle()) : '') +
          '</span></div>' +
        '<div class="pbar"><i style="width:' + xpPct + '%"></i></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--ink-3);margin-top:7px">' +
          '<span>' + d.user.xp + ' 积分</span><span>' + (li.next ? "距 " + li.next.name + " 还需 " + (nextXp - d.user.xp) + " 分" : "已满级") + '</span></div>' +
        '<div class="p-stats">' +
          '<div><b>' + global.tasksCompleted() + '/' + (global.YS_TASKS || []).length + '</b><span>任务完成</span></div>' +
          '<div><b>' + Object.keys(d.achievements).length + '</b><span>成就解锁</span></div>' +
          '<div><b>' + Object.keys(d.pointsDone).length + '</b><span>点位打卡</span></div>' +
          '<div><b>' + d.checkin.streak + '</b><span>连续签到</span></div>' +
        '</div>' +
      '</div>' +

      '<div style="text-align:center;font-size:10.5px;color:var(--ink-3);padding:22px 0 10px;line-height:1.9">' +
        '莨珠记 · 云纱智境　|　香云纱非遗数字研学平台<br>非遗传承 · 数字体验 · 工匠育人</div>' +
    '</div>';

    host.innerHTML = html;

    /* 研学公告跑马灯：文字从右侧外滑入 → 一直滑到左侧外（尽头）→ 停 1.5 秒 → 从头再滑 */
    try {
      if (global.__noticeT) { clearTimeout(global.__noticeT); global.__noticeT = null; }
      var ntBox = host.querySelector("#s3dNotice .n-txt");
      var ntTrack = ntBox && ntBox.querySelector(".n-track");
      if (ntBox && ntTrack) {
        var ntRun = function () {
          var tw = ntTrack.scrollWidth || ntTrack.offsetWidth || 0;
          var cw = ntBox.clientWidth || 0;
          if (!tw || !cw) return;
          ntTrack.style.transition = "none";
          ntTrack.style.transform = "translateX(" + cw + "px)";      /* 起点：整段文字完全在框右侧外 */
          void ntTrack.offsetWidth;                                 /* 强制重排，让归位立即生效 */
          var dur = Math.max(4200, Math.round((tw + cw) / 80 * 1000)); /* 约 80px/s，匀速偏慢 */
          ntTrack.style.transition = "transform " + dur + "ms linear";
          ntTrack.style.transform = "translateX(" + (-tw) + "px)";     /* 终点：完全滑出框左侧 */
          global.__noticeT = setTimeout(ntRun, dur + 1500);           /* 到尽头停 1.5 秒再重头开始 */
        };
        ntRun();
      }
    } catch (e) { console.warn("noticeMarquee", e); }

    /* 大 Banner 轮播：每 1.5 秒自动滑动 + 长按拖拽自由滑动；圆点可点击跳转 */
    try {
      if (global.__heroTimer) { clearInterval(global.__heroTimer); global.__heroTimer = null; }
      if (global.__heroClean) { clearTimeout(global.__heroClean); global.__heroClean = null; }
      var hero = host.querySelector("#s3dHero");
      var slides = host.querySelectorAll("#s3dHero .h-slide");
      var dots = host.querySelectorAll("#s3dHeroDots i");

      var startAuto = function () {
        if (global.__heroTimer) clearInterval(global.__heroTimer);
        global.__heroTimer = setInterval(function () {
          if (document.hidden) return;
          heroGo(hi + 1);
        }, 1500);
      };

      /* 把下标 n 的相邻两页摆到拖拽位置两侧（火车式预备位） */
      var setEdge = function (idx, style) {
        var prevI = (idx - 1 + slides.length) % slides.length;
        var nextI = (idx + 1) % slides.length;
        var pn = slides[prevI], nx = slides[nextI];
        [pn, nx].forEach(function (s) {
          s.style.transition = "none";
          s.style.visibility = "visible";
          s.style.zIndex = "1";
          void s.offsetWidth;
          s.style.transition = "";
        });
        pn.style.transform = "translateX(calc(-100% + " + style + "))";
        nx.style.transform = "translateX(calc(100% + " + style + "))";
        for (var i = 0; i < slides.length; i++) {
          if (i !== idx && i !== prevI && i !== nextI) {
            slides[i].style.transition = "none";
            slides[i].style.visibility = "hidden";
            slides[i].style.transform = "translateX(100%)";
            slides[i].style.zIndex = "0";
            void slides[i].offsetWidth;
            slides[i].style.transition = "";
          }
        }
      };

      if (slides.length > 1 && hero) {
        var hi = 0;
        var heroGo = function (n) {
          var prev = hi;
          hi = ((n % slides.length) + slides.length) % slides.length;
          if (hi === prev) return;
          var next = slides[hi], old = slides[prev];
          /* 关键：先把新页“瞬移”到右侧入画起点，再开动画——保证永远是火车式右进左出，杜绝交叉重叠 */
          next.style.transition = "none";
          next.style.transform = "translateX(100%)";
          next.style.visibility = "visible";
          next.style.zIndex = "2";
          void next.offsetWidth; /* 强制重排，让瞬移生效 */
          next.style.transition = "";
          next.style.transform = "translateX(0)";
          old.style.zIndex = "1";
          old.style.transform = "translateX(-100%)";
          /* 其余页隐藏归位 */
          for (var i = 0; i < slides.length; i++) {
            if (i !== hi && i !== prev) {
              slides[i].style.transition = "none";
              slides[i].style.visibility = "hidden";
              slides[i].style.transform = "translateX(100%)";
              slides[i].style.zIndex = "0";
              void slides[i].offsetWidth;
              slides[i].style.transition = "";
            }
          }
          /* 过渡结束后收起旧页 */
          if (global.__heroClean) clearTimeout(global.__heroClean);
          global.__heroClean = setTimeout(function () {
            old.style.transition = "none";
            old.style.visibility = "hidden";
            old.style.transform = "translateX(100%)";
            void old.offsetWidth;
            old.style.transition = "";
          }, 620);
          for (var j = 0; j < dots.length; j++) dots[j].classList.toggle("on", j === hi);
        };
        global.__heroGo = heroGo;
        startAuto();

        /* —— 长按 / 触摸拖拽自由滑动 —— */
        var drag = null; /* {x0, y0, dx, swiping} */
        var w = function () { return hero.clientWidth || 390; };

        hero.addEventListener("pointerdown", function (e) {
          if (e.target.closest("#s3dHeroDots")) return;
          drag = { x0: e.clientX, y0: e.clientY, dx: 0, swiping: false };
          hero.classList.add("dragging");
          if (global.__heroTimer) { clearInterval(global.__heroTimer); global.__heroTimer = null; }
          if (global.__heroClean) { clearTimeout(global.__heroClean); global.__heroClean = null; }
          try { hero.setPointerCapture(e.pointerId); } catch (err) {}
        });

        hero.addEventListener("pointermove", function (e) {
          if (!drag) return;
          var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
          if (!drag.swiping) {
            if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) + 4) {
              drag.swiping = true;
              for (var i = 0; i < slides.length; i++) slides[i].style.transition = "none";
            } else if (Math.abs(dy) > 14) {
              drag = null; startAuto(); return; /* 纵向手势：交还页面滚动 */
            } else return;
          }
          drag.dx = dx;
          slides[hi].style.visibility = "visible";
          slides[hi].style.zIndex = "2";
          slides[hi].style.transform = "translateX(" + dx + "px)";
          setEdge(hi, dx + "px");
        });

        var finishDrag = function (e) {
          if (!drag) return;
          hero.classList.remove("dragging");
          var dx = drag.dx || 0, wasSwipe = drag.swiping;
          drag = null;
          /* pointer capture 会把 click 重定向到 hero——本次按压后的点击一律在下面手动分发 */
          global.__heroSwipeT = Date.now();
          var W = w();
          var target = null; /* -1 上一页 / 1 下一页 / 0 弹回 */
          if (dx < -Math.min(W * 0.22, 90) || dx < -W * 0.4) target = 1;
          else if (dx > Math.min(W * 0.22, 90) || dx > W * 0.4) target = -1;
          for (var i = 0; i < slides.length; i++) slides[i].style.transition = "";
          if (target === 1 || target === -1) {
            var dir = target;                       /* 1=左滑出  -1=右滑出 */
            var old = slides[hi];
            var ni = ((hi + dir) % slides.length + slides.length) % slides.length;
            var nx = slides[ni];
            nx.style.visibility = "visible";
            nx.style.zIndex = "2";
            nx.style.transform = "translateX(0)";   /* 从当前拖拽位置吸附到 0 */
            old.style.zIndex = "1";
            old.style.transform = dir === 1 ? "translateX(-100%)" : "translateX(100%)";
            hi = ni;
            for (var j = 0; j < dots.length; j++) dots[j].classList.toggle("on", j === hi);
            if (global.__heroClean) clearTimeout(global.__heroClean);
            global.__heroClean = setTimeout(function () {
              old.style.transition = "none";
              old.style.visibility = "hidden";
              old.style.transform = "translateX(100%)";
              void old.offsetWidth;
              old.style.transition = "";
            }, 620);
          } else if (wasSwipe) {
            /* 弹回原位，隐藏两侧预备页 */
            slides[hi].style.transform = "translateX(0)";
            setEdge(hi, "0px");
            setTimeout(function () {
              var prevI = (hi - 1 + slides.length) % slides.length;
              var nextI = (hi + 1) % slides.length;
              [prevI, nextI].forEach(function (k) {
                slides[k].style.transition = "none";
                slides[k].style.visibility = "hidden";
                slides[k].style.transform = "translateX(100%)";
                slides[k].style.zIndex = "0";
                void slides[k].offsetWidth;
                slides[k].style.transition = "";
              });
            }, 60);
          }
          /* 无滑动的点按：手动分发（capture 使 click 落在 hero 上，host.onclick 已被抑制） */
          if (!wasSwipe && e && typeof e.clientX === "number") {
            var el = document.elementFromPoint(e.clientX, e.clientY);
            var t = el && el.closest("[data-act]");
            if (t && hero.contains(t)) { run(t.dataset.act, t.dataset.arg); startAuto(); return; }
            if (el && hero.contains(el)) { ACT.map(); startAuto(); return; }
          }
          startAuto();
        };

        hero.addEventListener("pointerup", finishDrag);
        hero.addEventListener("pointercancel", finishDrag);
        hero.addEventListener("pointerleave", function (e) { if (drag) finishDrag(e); });

        for (var k = 0; k < dots.length; k++) {
          (function (idx) {
            dots[idx].addEventListener("click", function (e) {
              e.stopPropagation();
              heroGo(idx);
            });
          })(k);
        }
      }
    } catch (e) { console.warn("heroCarousel", e); }

    /* 事件委托：用 onclick 赋值避免每次重绘重复叠加监听器 */
    host.onclick = function (e) {
      /* 刚完成拖拽滑动时抑制误触点击（否则松手瞬间会触发跳转） */
      if (Date.now() - (global.__heroSwipeT || 0) < 400) return;
      var t = e.target.closest("[data-act]");
      if (t) { run(t.dataset.act, t.dataset.arg); return; }
      if (e.target.closest("#s3dSearchBar")) { openSearch(); return; }
      if (e.target.closest("#s3dHero")) { ACT.map(); return; }
      if (e.target.closest("#s3dNotice .n-more")) { ACT.ue(); return; }
      if (e.target.closest("#homeCheckinBtn")) { global.doCheckin(); return; }
    };

    /* 同步挂载实时环境卡片，避免首帧空白 */
    if (typeof global.Realtime !== "undefined") {
      try { global.Realtime.mount(); } catch (e) {}
    }
    /* 主动升级本页 3D 图标 */
    if (typeof global.Icon3D !== "undefined") {
      try { global.Icon3D.upgrade(host); } catch (e) {}
    }

    /* 新用户：自动开启首页玩法指引（仅首次，之后可在设置里重看） */
    if (typeof global.HomeTour !== "undefined") {
      try { global.HomeTour.maybe(); } catch (e) { console.warn("homeTour", e); }
    }
  }

  /* 覆盖原首页渲染（在 views.js 之后加载） */
  global.renderHome = renderHome3D;
  global.renderHome3D = renderHome3D;

})(window);
