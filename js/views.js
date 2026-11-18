/* ==========================================================================
   莨珠记 · 云纱智境 —— 页面渲染层
   首页 / 地图 / 任务 / 知识 / 非遗故事 / 传承人 / 我的 / 设置 / 证书
   ========================================================================== */
"use strict";

/* ---------------------------------------------------------------- 首页 */
function renderHome() {
  var d = Store.data;
  var li = levelInfo(d.user.xp);
  var name = d.user.name || "研学学员";

  var greet = "早上好";
  var h = new Date().getHours();
  if (h < 6) greet = "夜深了";
  else if (h < 12) greet = "早上好";
  else if (h < 18) greet = "下午好";
  else greet = "晚上好";

  var signed = d.checkin.last === ds();
  var nextXp = li.next ? li.next.xp : li.cur.xp;
  var curXp = li.cur.xp;
  var xpPct = li.next ? clamp((d.user.xp - curXp) / (nextXp - curXp) * 100, 0, 100) : 100;

  $("#homeBody").innerHTML =
    '<div class="greet-row" style="display:flex;align-items:center;justify-content:space-between;padding:6px 2px 14px">' +
      '<div><div class="t-xs" style="color:var(--ink-3);font-size:12px">' + greet + '</div>' +
      '<div style="font-size:20px;font-weight:800">' + esc(name) + ' <span style="font-size:14px;color:var(--ink-3)">的寻纱之旅</span></div></div>' +
      '<div class="streak-pill" style="display:flex;align-items:center;gap:4px;background:var(--card);border:1px solid var(--line-2);border-radius:20px;padding:6px 12px;font-size:12px;font-weight:700;color:var(--amber)">🔥 连续 ' + checkinStreak() + ' 天</div>' +
    '</div>' +

    '<div class="hero-banner" style="background-image:linear-gradient(160deg, rgba(64,41,31,.85), rgba(44,27,19,.92)), url(' + IMG.hall + ');background-size:cover;background-position:center">' +
      '<div class="hb-tag">非遗传承 · 数字体验 · 工匠育人</div>' +
      '<h2>云纱智境 · 莨珠记</h2>' +
      '<p>走进香云纱的染整世界，体验「三蒸九煮十八晒」的岭南匠心。</p>' +
      '<button class="hb-btn" id="homeStartBtn">开始研学 <span>→</span></button>' +
    '</div>' +

    '<div class="grid-4">' +
      gridEntry("🗺️", "研学地图", "四大点位 · 扫码导览", "v-map") +
      gridEntry("🎯", "研学任务", "工艺闯关 · 答题解锁", "v-task") +
      gridEntry("📚", "工艺知识", "非遗文化 · 图文视频", "v-know") +
      gridEntry("🏅", "我的学习", "成绩报告 · 成就证书", "v-me") +
    '</div>' +

    // 数字孪生实时环境卡片（由 realtime.js 填充）
    '<div id="realtimeCard"></div>' +

    // 香云纱百科主入口（真实照片横幅）
    '<button class="enc-home-entry" id="homeEncycBtn" style="width:100%;display:block;text-align:left;border-radius:var(--r-xl);overflow:hidden;margin-bottom:16px;position:relative;box-shadow:var(--sh-2)">' +
      '<img src="' + YS_ENCYC_IMG.dryingMaster + '" style="width:100%;height:130px;object-fit:cover;display:block">' +
      '<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(44,27,19,.9),rgba(44,27,19,.35))"></div>' +
      '<div style="position:absolute;left:18px;top:22px">' +
        '<div style="color:var(--gold);font-size:10px;letter-spacing:.12em">ENCYCLOPEDIA · 香云纱百科</div>' +
        '<div style="color:#fff;font-size:19px;font-weight:800;margin-top:6px;font-family:KaiTi,serif">一匹纱，六百年</div>' +
        '<div style="color:rgba(248,242,232,.85);font-size:11px;margin-top:5px">历史来源 · 原料 · 工艺 · 传承 · 文化，一次读懂</div>' +
      '</div>' +
      '<div style="position:absolute;right:16px;bottom:16px;color:#fff;font-size:20px">→</div>' +
    '</button>' +

    '<div class="checkin-card">' +
      '<div class="ci-ico">🎁</div>' +
      '<div class="ci-main"><b>每日签到</b><span>' + (signed ? '今日已签到，连续 ' + d.checkin.streak + ' 天' : '签到领取积分，连续签到奖励更多') + '</span></div>' +
      '<button class="btn btn-sm ' + (signed ? 'btn-ghost' : 'btn-gold') + '" id="homeCheckinBtn" ' + (signed ? 'disabled' : '') + '>' + (signed ? '已签到' : '签到') + '</button>' +
    '</div>' +

    '<div class="card-title" style="padding:2px 2px 12px">' +
      '<span class="ct-left">📖 非遗故事</span>' +
      '<span class="ct-right" id="homeStoryMore" style="cursor:pointer">全部 ›</span>' +
    '</div>' +
    '<div class="story-scroll" id="storyScroll" style="display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;margin-bottom:16px">' +
      YS_STORIES.map(function (s) {
        return '<div class="story-mini" data-story="' + s.id + '" style="flex:0 0 200px;border-radius:16px;overflow:hidden;background:var(--card);box-shadow:var(--sh-1);border:1px solid var(--line-2);cursor:pointer">' +
          '<div style="height:110px;background-image:url(' + s.image + ');background-size:cover;background-position:center"></div>' +
          '<div style="padding:10px 12px"><b style="font-size:13px">' + esc(s.title) + '</b></div>' +
        '</div>';
      }).join("") +
    '</div>' +

    '<div class="dual-entry">' +
      '<button class="de-item" id="homeGameBtn">' +
        '<span class="de-ico">🎮</span>' +
        '<span class="de-txt"><b>游戏中心</b><i>问答 · 涂泥 · 节拍 · 排序 · 记忆</i></span>' +
      '</button>' +
      '<button class="de-item" id="homeUeBtn">' +
        '<span class="de-ico">🔗</span>' +
        '<span class="de-txt"><b>UE 虚实联动</b><i>虚拟引擎数据</i></span>' +
      '</button>' +
    '</div>' +

    '<button class="card" id="homeMasterBtn" style="width:100%;display:flex;align-items:center;gap:14px;text-align:left;cursor:pointer">' +
      '<div style="font-size:34px">👨‍🦳</div>' +
      '<div style="flex:1"><b style="font-size:15px">传承人风采</b><div style="font-size:12px;color:var(--ink-3);margin-top:3px">认识坚守非遗的老工匠们</div></div>' +
      '<span style="color:var(--ink-4)">›</span>' +
    '</button>' +

    // 奖励中心
    '<div class="card-title" style="padding:6px 2px 12px"><span class="ct-left">🎁 奖励中心</span>' +
      '<span class="ct-right">🪙 ' + (d.user.coins || 0) + ' 传承币</span></div>' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">' +
      quickReward("🛒", "商店", "renderShop()") +
      quickReward("🎁", "盲盒", "renderBox()") +
      quickReward("📅", "签到", "renderSignCalendar()") +
      quickReward("📤", "分享", "renderShare()") +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title"><span class="ct-left">✨ 我的研学历程</span><span class="ct-right">Lv.' + li.cur.lv + ' · ' + li.cur.name + '</span></div>' +
      '<div class="pbar gold"><i style="width:' + xpPct + '%"></i></div>' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ink-3);margin-top:8px">' +
        '<span>' + d.user.xp + ' 积分</span><span>' + (li.next ? '距离 ' + li.next.name + ' 还需 ' + (nextXp - d.user.xp) + ' 分' : '已满级') + '</span>' +
      '</div>' +
      '<div style="display:flex;margin-top:14px;padding-top:14px;border-top:1px solid var(--line-2)">' +
        statItem(tasksCompleted() + "/" + YS_TASKS.length, "任务完成") +
        statItem(Object.keys(d.achievements).length, "成就") +
        statItem(Object.keys(d.pointsDone).length, "点位打卡") +
      '</div>' +
    '</div>';

  $("#homeStartBtn").addEventListener("click", function () { Nav.go("v-map"); });
  $("#homeEncycBtn").addEventListener("click", function () {
    if (typeof window.renderEncyclopedia === "function") window.renderEncyclopedia();
    else toast("百科正在加载，请稍后重试", { ico: "⏳" });
  });
  $("#homeCheckinBtn").addEventListener("click", doCheckin);
  $("#homeGameBtn").addEventListener("click", openGames);
  $("#homeUeBtn").addEventListener("click", openUePanel);
  $("#homeMasterBtn").addEventListener("click", renderMasters);
  $("#homeStoryMore").addEventListener("click", renderStories);
  $$("#homeBody .quick-reward").forEach(function (q) {
    q.addEventListener("click", function () {
      var names = { shop: "renderShop", box: "renderBox", sign: "renderSignCalendar", share: "renderShare" };
      var fn = window[names[q.dataset.reward]];
      if (typeof fn === "function") fn();
      else toast("该功能正在加载，请稍后重试", { ico: "⏳" });
    });
  });
  $$("#homeBody .grid-entry").forEach(function (g) {
    g.addEventListener("click", function () { Nav.go(g.dataset.nav); });
  });
  $$("#homeBody .story-mini").forEach(function (s) {
    s.addEventListener("click", function () { openStory(s.dataset.story); });
  });
  // 同步挂载实时环境卡片（避免依赖异步 mount 造成首帧空白）
  if (typeof Realtime !== "undefined") Realtime.mount();
}

function quickReward(ico, label, key) {
  var keys = { "商店": "shop", "盲盒": "box", "签到": "sign", "分享": "share" };
  return '<button class="quick-reward" data-reward="' + keys[label] + '" style="background:var(--card);border:1px solid var(--line-2);border-radius:16px;padding:14px 4px;box-shadow:var(--sh-1);text-align:center">' +
    '<div style="font-size:26px">' + ico + '</div>' +
    '<div style="font-size:12px;font-weight:700;margin-top:6px">' + label + '</div></button>';
}

function quickDress(ico, label, key) {
  return '<button class="quick-dress" data-dress="' + key + '" style="background:var(--card);border:1px solid var(--line-2);border-radius:16px;padding:14px 4px;box-shadow:var(--sh-1);text-align:center">' +
    '<div style="font-size:26px">' + ico + '</div>' +
    '<div style="font-size:12px;font-weight:700;margin-top:6px">' + label + '</div></button>';
}

function gridEntry(ico, title, sub, nav) {
  return '<button class="grid-entry" data-nav="' + nav + '">' +
    '<span class="ge-ico">' + ico + '</span>' +
    '<b>' + title + '</b><span>' + sub + '</span></button>';
}

function statItem(val, label) {
  return '<div style="flex:1;text-align:center"><div style="font-size:18px;font-weight:800;color:var(--brand-d)">' + val + '</div><div style="font-size:11px;color:var(--ink-3)">' + label + '</div></div>';
}

/* ---------------------------------------------------------------- 研学地图 */

/* 精细 SVG 手绘园区图：草地纹理 / 蜿蜒河涌 / 石桥 / 道路 / 晒场布匹 / 镬耳屋 / 工坊 / 树丛 */
function mapSvg(pins) {
  return '<svg viewBox="0 0 320 400" style="width:100%;height:100%;display:block" aria-label="莨珠记园区示意地图">' +
    '<defs>' +
      '<pattern id="grass" width="18" height="18" patternUnits="userSpaceOnUse">' +
        '<circle cx="4" cy="4" r="1.1" fill="#82a376" opacity=".35"/><circle cx="12" cy="12" r=".9" fill="#96b489" opacity=".3"/></pattern>' +
      '<pattern id="dryfield" width="46" height="18" patternUnits="userSpaceOnUse">' +
        '<rect width="46" height="14" rx="3" fill="#b76449"/><rect width="46" height="14" rx="3" fill="#a8523a" y="2"/></pattern>' +
      '<linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#8fb8c4"/><stop offset="100%" stop-color="#bfdde0"/></linearGradient>' +
    '</defs>' +
    // 草地底
    '<rect width="320" height="400" fill="#d5ddc3"/><rect width="320" height="400" fill="url(#grass)"/>' +
    // 蜿蜒河涌
    '<path d="M-10 60 C 50 40, 70 90, 40 120 C 10 150, 30 190, 60 210 C 90 230, 110 280, 90 320 C 70 360, 120 390, 180 410" fill="none" stroke="#8fb8c4" stroke-width="42" stroke-linecap="round"/>' +
    '<path d="M-10 60 C 50 40, 70 90, 40 120 C 10 150, 30 190, 60 210 C 90 230, 110 280, 90 320 C 70 360, 120 390, 180 410" fill="none" stroke="#bfdde0" stroke-width="22" stroke-linecap="round"/>' +
    '<path d="M-10 60 C 50 40, 70 90, 40 120 C 10 150, 30 190, 60 210 C 90 230, 110 280, 90 320 C 70 360, 120 390, 180 410" fill="none" stroke="#e3f1f2" stroke-width="6" stroke-linecap="round" opacity=".8"/>' +
    // 石桥
    '<path d="M48 128 Q 60 116 72 128" fill="none" stroke="#8a6f55" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M48 128 L48 138 M72 128 L72 138" stroke="#8a6f55" stroke-width="4"/>' +
    '<path d="M50 126 L70 126" stroke="#a89070" stroke-width="3" stroke-linecap="round"/>' +
    // 参观道路
    '<path d="M120 0 Q150 80 160 160 T190 400" fill="none" stroke="#ece0c0" stroke-width="16"/>' +
    '<path d="M120 0 Q150 80 160 160 T190 400" fill="none" stroke="#cdb98a" stroke-width="1.5" stroke-dasharray="5 4"/>' +
    '<path d="M0 300 Q80 310 320 290" fill="none" stroke="#ece0c0" stroke-width="12"/>' +
    // 晒场（右下）
    '<rect x="185" y="250" width="120" height="130" rx="8" fill="#c89060"/>' +
    '<rect x="190" y="255" width="110" height="120" rx="6" fill="url(#dryfield)"/>' +
    '<text x="245" y="392" fill="#5a4636" font-size="9" text-anchor="middle" font-weight="bold">草地晒莨场</text>' +
    // 主馆（镬耳屋，中央）
    '<g transform="translate(128,205)">' +
      '<rect x="0" y="20" width="62" height="40" rx="3" fill="#9c775f" stroke="#5e5547" stroke-width="2"/>' +
      '<path d="M-2 22 L30 -8 L64 22 Z" fill="#715346" stroke="#5e5547" stroke-width="2"/>' +
      '<path d="M8 22 L8 6 Q8 0 14 0 L14 22" fill="#6a4c3c"/>' +
      '<path d="M52 22 L52 6 Q52 0 46 0 L46 22" fill="#6a4c3c"/>' +
      '<rect x="26" y="32" width="12" height="28" rx="1" fill="#5e4a3a"/>' +
      '<text x="31" y="78" fill="#5a4636" font-size="9" text-anchor="middle" font-weight="bold">莨珠记主馆</text>' +
    '</g>' +
    // 工坊（左中）
    '<g transform="translate(20,165)">' +
      '<rect x="0" y="12" width="52" height="34" rx="3" fill="#b29f82" stroke="#736858" stroke-width="2"/>' +
      '<path d="M-2 14 L24 -4 L52 14 Z" fill="#8a7a60" stroke="#736858" stroke-width="2"/>' +
      '<rect x="22" y="22" width="10" height="24" rx="1" fill="#6a5a44"/>' +
      '<text x="26" y="62" fill="#5a4636" font-size="9" text-anchor="middle" font-weight="bold">染整工作坊</text>' +
    '</g>' +
    // 薯莨染料缸（右上）
    '<g transform="translate(215,25)">' +
      '<rect x="0" y="10" width="52" height="30" rx="3" fill="#a87a52" stroke="#6a5040" stroke-width="2"/>' +
      '<path d="M-2 12 L26 -6 L54 12 Z" fill="#8a5e3a" stroke="#6a5040" stroke-width="2"/>' +
      '<circle cx="16" cy="26" r="6" fill="#c89060"/><circle cx="36" cy="26" r="6" fill="#c89060"/>' +
      '<text x="26" y="56" fill="#5a4636" font-size="9" text-anchor="middle" font-weight="bold">染料区</text>' +
    '</g>' +
    // 河涌泥料区
    '<g transform="translate(255,110)">' +
      '<circle cx="0" cy="0" r="17" fill="#8fb8c4" opacity=".55"/>' +
      '<circle cx="0" cy="0" r="9" fill="#6b4a32" opacity=".8"/>' +
      '<text x="0" y="32" fill="#4a6b7a" font-size="9" text-anchor="middle" font-weight="bold">河涌泥料区</text>' +
    '</g>' +
    // 树丛
    '<g fill="#73905c">' +
      '<circle cx="60" cy="70" r="16"/><circle cx="72" cy="60" r="12"/><circle cx="48" cy="62" r="12"/>' +
      '<circle cx="285" cy="200" r="18"/><circle cx="298" cy="192" r="12"/>' +
      '<circle cx="110" cy="345" r="18"/><circle cx="126" cy="337" r="12"/>' +
      '<circle cx="250" cy="175" r="13"/>' +
    '</g>' +
    '<text x="308" y="392" fill="#759066" font-size="8" letter-spacing="2" text-anchor="end">莨珠记 · 概念园区</text>' +
    // 点位热区（透明可点击）
    pins +
  '</svg>';
}

function renderMap() {
  var d = Store.data;
  // SVG 点位热区
  var pins = YS_POINTS.map(function (p) {
    var done = !!d.pointsDone[p.id];
    return '<g class="map-hot" data-point="' + p.id + '" style="cursor:pointer">' +
      '<rect x="' + (p.x * 3.2 - 30) + '" y="' + (p.y * 4 - 30) + '" width="60" height="60" fill="transparent"/>' +
      '<circle cx="' + (p.x * 3.2) + '" cy="' + (p.y * 4) + '" r="15" fill="' + (done ? "#667B55" : "#83533B") + '" stroke="#fff" stroke-width="2.5"/>' +
      '<text x="' + (p.x * 3.2) + '" y="' + (p.y * 4 + 5) + '" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">' + p.icon + '</text>' +
      (done ? '<text x="' + (p.x * 3.2 + 10) + '" y="' + (p.y * 4 - 10) + '" fill="#fff" font-size="12">✓</text>' : '') +
    '</g>';
  }).join("");

  $("#mapBody").innerHTML =
    '<div class="page-head"><div><h1>研学地图</h1><div class="sub">手绘园区 · 四大研学点位</div></div>' +
    '<button class="icon-btn" id="mapScanBtn">📷</button></div>' +

    '<div class="dual-entry">' +
      '<button class="de-item" id="map3dBtn">' +
        '<span class="de-ico">🏗️</span>' +
        '<span class="de-txt"><b>3D 园区漫游</b><i>可旋转缩放 · 点击建筑</i></span>' +
      '</button>' +
      '<button class="de-item" id="mapRealBtn">' +
        '<span class="de-ico">📍</span>' +
        '<span class="de-txt"><b>真实地图定位</b><i>' + YS_GEO.region + '</i></span>' +
      '</button>' +
    '</div>' +

    '<div class="dual-entry">' +
      '<button class="de-item" id="mapOverviewBtn">' +
        '<span class="de-ico">🗺️</span>' +
        '<span class="de-txt"><b>园区总览</b><i>四大点位一键看</i></span>' +
      '</button>' +
      '<button class="de-item" id="mapRouteBtn">' +
        '<span class="de-ico">🚶</span>' +
        '<span class="de-txt"><b>路线推荐</b><i>半日 / 深度研学</i></span>' +
      '</button>' +
    '</div>' +

    '<div class="map-canvas" style="padding:0">' + mapSvg(pins) + '</div>' +

    '<div class="map-legend">' +
      '<span class="lg">🟤 已打卡</span><span class="lg">⚪ 未打卡</span><span class="lg">📷 扫码进入点位</span><span class="lg">🏗️ 3D 漫游</span>' +
    '</div>' +

    YS_POINTS.map(function (p) {
      var done = !!d.pointsDone[p.id];
      return '<div class="point-card" data-point="' + p.id + '" style="background:var(--card);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh-1);border:1px solid var(--line-2);margin-bottom:12px;cursor:pointer">' +
        '<div style="height:120px;background-image:url(' + p.image + ');background-size:cover;background-position:center;position:relative">' +
          '<span class="tag ' + (done ? 'tag-green' : 'tag-gray') + '" style="position:absolute;top:10px;right:10px">' + (done ? '已打卡' : '未打卡') + '</span>' +
        '</div>' +
        '<div style="padding:14px 16px;display:flex;align-items:center;gap:12px">' +
          '<div style="font-size:26px;font-family:KaiTi,serif;color:var(--brand)">' + p.icon + '</div>' +
          '<div style="flex:1"><b style="font-size:15px">' + p.name + '</b><div style="font-size:12px;color:var(--ink-3);margin-top:3px">' + p.subtitle + '</div></div>' +
          '<span style="color:var(--ink-4)">›</span>' +
        '</div>' +
      '</div>';
    }).join("");

  $$("#mapBody .map-hot").forEach(function (b) {
    b.addEventListener("click", function () { openPoint(b.dataset.point); });
  });
  $$("#mapBody .point-card").forEach(function (r) {
    r.addEventListener("click", function () { openPoint(r.dataset.point); });
  });
  $("#mapScanBtn").addEventListener("click", function () { Scan.open(); });
  $("#map3dBtn").addEventListener("click", function () { Map3D.open(); });
  $("#mapRealBtn").addEventListener("click", function () { openRealMap(); });
  $("#mapOverviewBtn").addEventListener("click", renderOverview);
  $("#mapRouteBtn").addEventListener("click", renderRoute);
}

/* ---------------------------------------------------------------- 园区总览 */
function renderOverview() {
  var d = Store.data;
  var done = YS_POINTS.filter(function (p) { return d.pointsDone[p.id]; }).length;

  $("#overviewBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>园区总览</h2></div>' +
    '<div class="card" style="background:linear-gradient(135deg,var(--brand),var(--brand-d));color:#fff;border:none">' +
      '<div style="font-size:13px;opacity:.9">莨珠记 · 香云纱数字研学基地</div>' +
      '<div style="font-size:22px;font-weight:800;margin:6px 0 2px;font-family:KaiTi,serif">一匹纱，六百年</div>' +
      '<div style="font-size:12px;opacity:.85">历史来源 · 原料 · 工艺 · 传承 · 文化，一次读懂</div>' +
      '<div class="ov-progress"><div class="pbar gold" style="margin-top:12px"><i style="width:' + (done / YS_POINTS.length * 100) + '%"></i></div>' +
      '<div style="font-size:12px;margin-top:6px;opacity:.9">已打卡 ' + done + ' / ' + YS_POINTS.length + ' 个研学点位</div></div>' +
    '</div>' +
    YS_POINTS.map(function (p) {
      var isDone = !!d.pointsDone[p.id];
      var kc = YS_KNOWLEDGE.filter(function (k) { return k.point_id === p.id; }).length;
      return '<div class="card point-card" data-point="' + p.id + '" style="cursor:pointer">' +
        '<div style="display:flex;gap:12px;align-items:center">' +
          '<div style="font-size:30px;font-family:KaiTi,serif;color:var(--brand)">' + p.icon + '</div>' +
          '<div style="flex:1"><b style="font-size:15px">' + p.name + '</b><div style="font-size:12px;color:var(--ink-3);margin-top:3px">' + p.subtitle + '</div></div>' +
          '<span class="tag ' + (isDone ? 'tag-green' : 'tag-gray') + '">' + (isDone ? '已打卡' : '未打卡') + '</span>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--ink-2);margin-top:10px">📚 ' + kc + ' 条知识　·　' + (isDone ? '点击回顾' : '点击前往研学') + '</div>' +
      '</div>';
    }).join("") +
    '<button class="btn btn-primary btn-block" id="ovRouteBtn" style="margin-top:4px">查看推荐研学路线 ›</button>';

  Nav.go("v-overview", { after: function () {
    $("#overviewBody .back-btn").addEventListener("click", Nav.back);
    $$("#overviewBody .point-card").forEach(function (c) {
      c.addEventListener("click", function () { openPoint(c.dataset.point); });
    });
    var rb = $("#ovRouteBtn");
    if (rb) rb.addEventListener("click", renderRoute);
  }});
}

/* ---------------------------------------------------------------- 路线推荐 */
function renderRoute() {
  var routes = [
    { id: "R1", ico: "🌿", name: "半日精华路线", time: "约 2 小时",
      desc: "主馆入门 → 工作坊看染整 → 晒场观晒莨 → 河涌识泥料，适合初次到访。",
      stops: [
        { id: "HALL", name: "莨珠记主馆", sub: "理论研学 · 布匹展陈" },
        { id: "WORKSHOP", name: "染整工作坊", sub: "原料处理 · 工艺学习" },
        { id: "DRYING_FIELD", name: "草地晒莨场", sub: "平铺晒莨 · 场地观察" },
        { id: "RIVER", name: "河涌泥料区", sub: "水乡环境 · 泥料知识" }
      ] },
    { id: "R2", ico: "🧭", name: "深度研学路线", time: "约 4 小时",
      desc: "在精华路线基础上，重点完成四项研学任务与互动实践，深度理解「三蒸九煮十八晒」。",
      stops: [
        { id: "HALL", name: "莨珠记主馆", sub: "完成：认识研学主馆" },
        { id: "WORKSHOP", name: "染整工作坊", sub: "完成：认识工作坊 + 涂泥实践" },
        { id: "DRYING_FIELD", name: "草地晒莨场", sub: "完成：观察草地晒场" },
        { id: "RIVER", name: "河涌泥料区", sub: "完成：认识河涌与泥料" }
      ] }
  ];

  $("#routeBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>路线推荐</h2></div>' +
    '<div style="font-size:12px;color:var(--ink-3);margin:-4px 2px 12px">按推荐顺序研学，可依次点亮四大点位并解锁任务。</div>' +
    routes.map(function (r) {
      return '<div class="route-card">' +
        '<div class="route-head"><span class="ri-ico">' + r.ico + '</span><div><b>' + r.name + '</b></div></div>' +
        '<div class="route-meta">⏱ ' + r.time + '　·　' + r.desc + '</div>' +
        r.stops.map(function (s, i) {
          return '<div class="route-step" data-point="' + s.id + '"><span class="route-idx">' + (i + 1) + '</span>' +
            '<div style="flex:1"><div class="rs-name">' + s.name + '</div><div class="rs-sub">' + s.sub + '</div></div>' +
            '<span class="rs-go">›</span></div>';
        }).join("") +
        '<button class="btn btn-gold btn-block" style="margin-top:12px" data-start="' + r.stops[0].id + '">开始此路线</button>' +
      '</div>';
    }).join("");

  Nav.go("v-route", { after: function () {
    $("#routeBody .back-btn").addEventListener("click", Nav.back);
    $$("#routeBody .route-step").forEach(function (s) {
      s.addEventListener("click", function () { openPoint(s.dataset.point); });
    });
    $$("#routeBody [data-start]").forEach(function (b) {
      b.addEventListener("click", function () { openPoint(b.dataset.start); });
    });
  }});
}

function simulateScan() {
  // 兼容旧调用：统一转发到真实扫码模块
  if (window.Scan) Scan.open();
}

function openPoint(id) {
  var p = YS_POINTS.filter(function (x) { return x.id === id; })[0];
  if (!p) return;
  var d = Store.data;
  if (!d.pointsDone[p.id]) {
    d.pointsDone[p.id] = true;
    d.user.xp += 10;
    Store.save();
    renderStatus();
  }
  var done = d.pointsDone[p.id];
  var task = YS_TASKS.filter(function (t) { return t.point_id === p.id; })[0];
  var taskDone = task && d.tasksDone[task.id];
  var know = YS_KNOWLEDGE.filter(function (k) { return k.point_id === p.id; });

  $("#pointBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>' + p.name + '</h2></div>' +

    '<div style="border-radius:var(--r-xl);overflow:hidden;margin-bottom:14px;position:relative">' +
      '<img src="' + p.image + '" style="width:100%;height:200px;object-fit:cover">' +
      '<div style="position:absolute;bottom:0;left:0;right:0;padding:20px 16px;background:linear-gradient(transparent,rgba(64, 41, 31,.88))">' +
        '<div style="color:var(--gold);font-size:12px;letter-spacing:.08em">' + p.subtitle + '</div>' +
        '<div style="color:#fff;font-size:20px;font-weight:800;font-family:KaiTi,serif">' + p.icon + ' ' + p.name + '</div>' +
      '</div>' +
    '</div>' +

    '<div class="card"><div class="know-body">' + esc(p.description) + '</div></div>' +

    '<div class="card"><div class="card-title"><span class="ct-left">🖼️ 点位图库</span><span class="ct-right">' + p.gallery.length + ' 张</span></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
        p.gallery.map(function (img) {
          return '<div style="height:90px;border-radius:12px;overflow:hidden;background-image:url(' + img + ');background-size:cover;background-position:center"></div>';
        }).join("") +
      '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title"><span class="ct-left">📖 点位知识</span><span class="ct-right">' + know.length + ' 条</span></div>' +
      know.map(function (k) {
        return '<div class="list-row" data-know="' + k.id + '" style="cursor:pointer">' +
          '<div class="lr-ico" style="width:40px;height:40px;border-radius:10px;background-size:cover;background-position:center;background-image:url(' + k.image + ')"></div>' +
          '<div class="lr-main"><b>' + k.title + '</b><span>' + k.category + '</span></div>' +
          '<span class="lr-arrow">›</span></div>';
      }).join("") +
    '</div>' +

    (task ? '<div class="card">' +
      '<div class="card-title"><span class="ct-left">🎯 点位任务</span><span class="ct-right">' + (taskDone ? '已完成' : '未完成') + '</span></div>' +
      '<div class="task-card ' + (taskDone ? 'done' : '') + '" data-task="' + task.id + '" style="cursor:pointer">' +
        '<div class="tc-img" style="background-image:url(' + task.image + ');background-size:cover;background-position:center"></div>' +
        '<div class="tc-main"><b>' + task.title + '</b><div class="tc-sub">' + task.score + ' 分 · 单选题</div></div>' +
        '<span class="tc-score">' + (taskDone ? '✓' : '›') + '</span>' +
      '</div></div>' : '') +

    '<button class="btn btn-primary btn-block" id="pointDoneBtn" ' + (done ? 'disabled' : '') + '>' + (done ? '已打卡 ✓' : '打卡此点位 (+10 积分)') + '</button>';

  Nav.go("v-point", { after: function () {
    $("#pointDoneBtn").addEventListener("click", function () {
      if (!d.pointsDone[p.id]) {
        d.pointsDone[p.id] = true;
        d.user.xp += 10;
        Store.save();
        renderStatus();
        Sound.coin();
        confetti(20);
        toast("打卡成功！+10 积分", { ico: "📍" });
      }
      $("#pointDoneBtn").disabled = true;
      $("#pointDoneBtn").textContent = "已打卡 ✓";
    });
    $$("#pointBody .list-row").forEach(function (r) {
      r.addEventListener("click", function () {
        if (r.dataset.know) openKnowDetail(r.dataset.know);
        if (r.dataset.task) startTask(r.dataset.task);
      });
    });
    $$("#pointBody .task-card").forEach(function (t) {
      t.addEventListener("click", function () { startTask(t.dataset.task); });
    });
    $("#pointBody .back-btn").addEventListener("click", Nav.back);
    if (Object.keys(d.pointsDone).length >= YS_POINTS.length) unlockAchievement("map_all");
  }});
}

/* ---------------------------------------------------------------- 研学任务 */
var TaskFilter = "all";

function renderTasks() {
  var d = Store.data;
  var done = YS_TASKS.filter(function (t) { return d.tasksDone[t.id]; });
  var pending = YS_TASKS.filter(function (t) { return !d.tasksDone[t.id]; });

  var tabs = [
    { k: "all", label: "全部(" + YS_TASKS.length + ")" },
    { k: "pending", label: "未完成(" + pending.length + ")" },
    { k: "done", label: "已完成(" + done.length + ")" }
  ];

  $("#taskBody").innerHTML =
    '<div class="page-head"><div><h1>研学任务</h1><div class="sub">工艺闯关 · 三蒸九煮十八晒</div></div></div>' +

    '<div class="card" style="background:linear-gradient(135deg,var(--brand-soft),var(--gold-soft));border:none">' +
      '<div class="card-title"><span class="ct-left">🏆 闯关进度</span><span class="ct-right">' + done.length + '/' + YS_TASKS.length + '</span></div>' +
      '<div class="pbar gold"><i style="width:' + (done.length / YS_TASKS.length * 100) + '%"></i></div>' +
      '<div style="margin-top:10px;font-size:12px;color:var(--ink-2)">累计获得 ' + (done.length * 25) + ' 分，全部完成可生成研学证书</div>' +
    '</div>' +

    // 实时情境题（由 UE 环境参数动态生成）
    '<div id="realtimeQuestion"></div>' +

    '<div class="task-status-tabs">' +
      tabs.map(function (t) {
        return '<button class="chip ' + (TaskFilter === t.k ? 'chip-brand on' : '') + '" data-filter="' + t.k + '">' + t.label + '</button>';
      }).join("") +
    '</div>' +

    '<div id="taskListBox"></div>';

  $$("#taskBody .chip").forEach(function (c) {
    c.addEventListener("click", function () {
      TaskFilter = c.dataset.filter;
      renderTasks();
    });
  });
  renderTaskList();
  // 同步挂载实时情境题
  if (typeof Realtime !== "undefined") Realtime.mount();
}

function renderTaskList() {
  var d = Store.data;
  var list = YS_TASKS.filter(function (t) {
    if (TaskFilter === "done") return !!d.tasksDone[t.id];
    if (TaskFilter === "pending") return !d.tasksDone[t.id];
    return true;
  });
  var box = $("#taskListBox");
  if (!list.length) {
    box.innerHTML = '<div class="empty"><div class="ico">🎉</div><div class="t">全部完成！</div><div class="d">太棒了，去生成研学证书吧</div></div>';
    return;
  }
  box.innerHTML = list.map(function (t) {
    var isDone = !!d.tasksDone[t.id];
    var score = d.taskScores[t.id] || 0;
    return '<div class="task-card ' + (isDone ? 'done' : '') + '" data-task="' + t.id + '">' +
      '<div class="tc-img" style="background-image:url(' + t.image + ');background-size:cover;background-position:center"></div>' +
      '<div class="tc-main">' +
        '<b>' + t.title + '</b>' +
        '<div class="tc-sub">第 ' + t.order + ' 关 · ' + YS_POINTS.filter(function(p){return p.id===t.point_id;})[0].name + '</div>' +
        '<div class="tc-prog"><div class="pbar ' + (isDone ? 'green' : 'gold') + '"><i style="width:' + (isDone ? 100 : 0) + '%"></i></div></div>' +
      '</div>' +
      '<div class="tc-score">' + (isDone ? score + '分' : '+25') + '</div>' +
    '</div>';
  }).join("");
  $$("#taskListBox .task-card").forEach(function (c) {
    c.addEventListener("click", function () { startTask(c.dataset.task); });
  });
}

/* 答题流程 */
var QuizFlow = {
  task: null, score: 0, correct: 0, timeLeft: 20, timer: null, locked: false,
  LIMIT: 20,

  /* 统一停止计时，任何离开/作答/重做都必须调用，杜绝计时器残留 */
  stopTimer: function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  },

  start: function (task) {
    this.stopTimer();
    this.task = task;
    this.score = 0; this.correct = 0; this.locked = false; this.timeLeft = this.LIMIT;
    // 关键：答题界面写在 #taskBody，必须先把「研学任务」视图激活，
    // 否则从点位详情/首页进入时内容会被写进隐藏视图，表现为「点了没反应」。
    Nav.go("v-task", { push: false });
    $("#taskBody").innerHTML = this.render();
    this.bind();
    this.startTimer();
  },

  render: function () {
    var t = this.task;
    var isDynamic = !t.order;                       // 实时情境题没有 order/image
    var img = t.image || (typeof IMG !== "undefined" ? IMG.dryingField : "");
    return '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>' + t.title + '</h2></div>' +
      '<div style="border-radius:16px;overflow:hidden;margin-bottom:14px;height:120px;background-image:url(' + img + ');background-size:cover;background-position:center"></div>' +
      '<div class="quiz-timer">' +
        '<div class="qt-ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" fill="none" stroke="var(--line)" stroke-width="4"/><circle id="taskRing" cx="22" cy="22" r="19" fill="none" stroke="var(--brand)" stroke-width="4" stroke-linecap="round" stroke-dasharray="119.4" stroke-dashoffset="0"/></svg><b id="taskTime">20</b></div>' +
        '<span style="font-size:13px;color:var(--ink-3)">剩余 <b id="taskTimeTip" style="color:var(--brand-d)">20</b> 秒 · 答对即得 ' + t.score + ' 分（不按速度扣分）</span>' +
      '</div>' +
      '<div class="card" style="margin-bottom:16px">' +
        '<div class="t-xs" style="color:var(--brand);font-weight:700;margin-bottom:10px">' + (isDynamic ? '实时情境 · 单选题' : '第 ' + t.order + ' 关 · 单选题') + '</div>' +
        '<div style="font-size:18px;font-weight:800;line-height:1.5;margin-bottom:16px">' + esc(t.question) + '</div>' +
        t.options.map(function (o, i) {
          return '<button class="quiz-opt" data-i="' + i + '"><span class="k">' + "ABC"[i] + '</span><span>' + esc(o.text) + '</span></button>';
        }).join("") +
      '</div>' +
      '<div id="taskFeedback"></div>';
  },

  bind: function () {
    var self = this;
    $$("#taskBody .quiz-opt").forEach(function (b) {
      b.addEventListener("click", function () { self.answer(+b.dataset.i); });
    });
    $("#taskBody .back-btn").addEventListener("click", function () {
      self.stopTimer();
      Nav.go("v-task");
    });
  },

  /* 单一计时器：从 20 秒平滑递减，圆圈内始终只显示整数秒 */
  startTimer: function () {
    var self = this;
    this.stopTimer();
    this.timeLeft = this.LIMIT;
    var C = 2 * Math.PI * 19;
    this.timer = setInterval(function () {
      self.timeLeft -= 0.1;
      var tl = Math.max(0, self.timeLeft);
      var sec = Math.ceil(tl);
      var t = $("#taskTime"); if (t) t.textContent = sec;
      var tip = $("#taskTimeTip"); if (tip) tip.textContent = sec;
      var ring = $("#taskRing"); if (ring) ring.setAttribute("stroke-dashoffset", (C * (1 - tl / self.LIMIT)).toFixed(1));
      if (tl <= 0) { self.stopTimer(); self.answer(-1); }
    }, 100);
  },

  answer: function (i) {
    if (this.locked) return;
    this.locked = true;
    this.stopTimer();
    var t = this.task;
    var correctIdx = t.options.map(function(o){return o.id;}).indexOf(t.answer);
    var ok = i === correctIdx;
    var opts = $$("#taskBody .quiz-opt");
    opts.forEach(function (b, k) {
      b.disabled = true;
      if (k === correctIdx) b.classList.add("right");
      else if (k === i) b.classList.add("wrong");
    });

    var self = this;
    if (ok) {
      // 分数与任务卡片标注一致（+25 分），不再按答题速度浮动，避免"说好 25 分却给 65 分"
      this.score = t.score;
      this.correct = 1;
      Sound.success(); vibrate(12);
      $("#taskFeedback").innerHTML = '<div class="card" style="background:var(--green-soft)"><b style="color:var(--green)">✓ 回答正确！</b><p style="font-size:13px;margin-top:6px;color:var(--ink-2)">' + esc(t.explanation) + '</p></div>';
    } else {
      this.score = 0;
      Sound.fail(); vibrate([20, 50, 20]);
      $("#taskFeedback").innerHTML = '<div class="card" style="background:var(--red-soft)"><b style="color:var(--red)">✗ ' + (i < 0 ? '超时了' : '回答错误') + '</b><p style="font-size:13px;margin-top:6px;color:var(--ink-2)">正确答案：' + "ABC"[correctIdx] + '。' + esc(t.explanation) + '</p></div>';
    }
    setTimeout(function () { self.finish(); }, 1800);
  },

  finish: function () {
    this.stopTimer();
    var t = this.task;
    var d = Store.data;
    var coinGain = 0;
    if (this.score > 0 && !d.tasksDone[t.id]) {
      d.tasksDone[t.id] = true;
      d.taskScores[t.id] = this.score;
      d.user.xp += this.score;
      coinGain = 20;
      d.user.coins = (d.user.coins || 0) + coinGain;
      d.coinsEarned = (d.coinsEarned || 0) + coinGain;
      d.boxLeft = (d.boxLeft || 0) + 1; // 完成任务获得开盒机会
      d.radar["工艺认知"] = calcRadar()["工艺认知"];
      if (d.ownedTitles.indexOf("ti_apprentice") < 0) d.ownedTitles.push("ti_apprentice");
      Store.save();
      renderStatus();
      unlockAchievement("first_task");
      if (this.score >= t.score) unlockAchievement("perfect_task");
      if (tasksCompleted() >= YS_TASKS.length) unlockAchievement("task_all");
      if (d.user.xp >= 1000) unlockAchievement("xp_1000");
      if (d.coinsEarned >= 500) unlockAchievement("coins_500");
      confetti(30);
    } else {
      Store.save();
    }

    $("#taskFeedback").innerHTML +=
      '<div class="card" style="text-align:center">' +
        '<div style="font-size:34px">' + (this.correct ? '🎉' : '💪') + '</div>' +
        (this.correct
          ? '<div style="font-size:26px;font-weight:850;color:var(--brand-d)">+' + this.score + ' 分</div>'
          : '<div style="font-size:20px;font-weight:800;color:var(--ink-2)">本次未得分</div>') +
        (coinGain ? '<div style="font-size:13px;color:var(--amber);margin-top:4px">🪙 +' + coinGain + ' 传承币　🎁 +1 开盒机会</div>' : '') +
        '<div style="font-size:13px;color:var(--ink-2);margin-top:6px">' + (this.correct ? '回答正确，奖励已入账' : '题目不限次数，读懂解析后再试一次吧') + '</div>' +
        '<div class="rs-actions" style="margin-top:16px">' +
          '<button class="btn btn-ghost" id="taskRetry">重做一次</button>' +
          '<button class="btn btn-primary" id="taskBack">返回任务</button>' +
        '</div>' +
      '</div>';
    var self = this;
    $("#taskRetry").onclick = function () { self.start(self.task); };
    $("#taskBack").onclick = function () { Nav.go("v-task"); };
  }
};

function startTask(id) {
  var t = YS_TASKS.filter(function (x) { return x.id === id; })[0];
  if (!t) return;
  QuizFlow.start(t);
}

/* ---------------------------------------------------------------- 工艺知识 */
var KnowCat = "全部";

function renderKnow() {
  var cats = ["全部", "非遗认知", "空间认知", "工坊观察", "晒场观察", "地域环境", "安全认知", "数字场景"];

  $("#knowBody").innerHTML =
    '<div class="page-head"><div><h1>工艺知识</h1><div class="sub">非遗文化 · 图文并茂</div></div></div>' +

    '<div class="know-cat-tabs">' +
      cats.map(function (c) {
        return '<button class="chip ' + (KnowCat === c ? 'chip-brand on' : '') + '" data-cat="' + c + '">' + c + '</button>';
      }).join("") +
    '</div>' +

    '<button class="game-card" id="knowEncycBtn" style="margin-bottom:12px">' +
      '<div class="gc-ico">📚</div>' +
      '<div class="gc-main"><h4>香云纱百科</h4><p>10 个章节 · 历史来源 / 原料 / 工艺 / 传承 · 全部配图</p>' +
      '<div class="gc-meta"><span>专题长文</span><i></i><span>真实工序照片</span></div></div>' +
      '<div class="gc-go">进入</div></button>' +

    '<div class="dual-entry">' +
      '<button class="de-item" id="knowStoryBtn">' +
        '<span class="de-ico">📖</span>' +
        '<span class="de-txt"><b>非遗故事</b><i>' + YS_STORIES.length + ' 篇 · 匠心往事</i></span>' +
      '</button>' +
      '<button class="de-item" id="knowMasterBtn">' +
        '<span class="de-ico">👨‍🦳</span>' +
        '<span class="de-txt"><b>传承人</b><i>' + YS_MASTERS.length + ' 位 · 守艺人生</i></span>' +
      '</button>' +
    '</div>' +

    '<button class="game-card" id="knowAiBtn" style="margin-bottom:14px;position:relative;overflow:hidden;border:none;text-align:left;padding:0">' +
      '<img src="assets/real/real_22.jpg" alt="薯莨：香云纱的天然植物染料" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">' +
      '<div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(44,27,19,.88),rgba(44,27,19,.5))"></div>' +
      '<div style="position:relative;display:flex;align-items:center;gap:12px;padding:16px">' +
        '<div style="font-size:28px">🤖</div>' +
        '<div style="flex:1;min-width:0"><h4 style="color:#fff;font-size:15px;margin:0">AI 知识问答</h4>' +
          '<p style="color:rgba(255,255,255,.85);font-size:12px;margin:4px 0 0">关于香云纱，你想问什么？大模型 + 本地知识检索</p></div>' +
        '<div style="color:var(--gold);font-size:12px;font-weight:800;white-space:nowrap">去提问 ›</div>' +
      '</div></button>' +

    '<div style="margin-bottom:6px"><div class="card-title" style="padding:2px 2px 10px"><span class="ct-left">🎬 工艺视频</span><span class="ct-right" style="color:var(--ink-3)">' + YS_VIDEOS.length + ' 部</span></div>' +
      '<div class="video-reel">' +
        YS_VIDEOS.map(function (v) {
          return '<div class="vr-item" data-video="' + v.id + '">' +
            '<div class="vr-cover" style="background-image:url(' + v.poster + ')"><div class="vr-play">▶</div><div class="vr-dur">' + v.duration + '</div></div>' +
            '<div class="vr-title">' + v.title + '</div></div>';
        }).join("") +
      '</div>' +
    '</div>' +

    '<div id="knowListBox"></div>';

  $$("#knowBody .vr-item").forEach(function (it) {
    it.addEventListener("click", function () {
      var v = YS_VIDEOS.filter(function (x) { return x.id === it.dataset.video; })[0];
      if (v) playVideo(v.src, v.poster);
    });
  });
  $$("#knowBody .chip").forEach(function (c) {
    c.addEventListener("click", function () {
      KnowCat = c.dataset.cat;
      renderKnow();
    });
  });
  $("#knowAiBtn").addEventListener("click", openAiChat);
  var knowEncyc = $("#knowEncycBtn");
  if (knowEncyc) knowEncyc.addEventListener("click", function () {
    if (typeof window.renderEncyclopedia === "function") window.renderEncyclopedia();
    else toast("百科正在加载", { ico: "⏳" });
  });
  $("#knowStoryBtn").addEventListener("click", renderStories);
  $("#knowMasterBtn").addEventListener("click", renderMasters);
  renderKnowList();
}

function renderKnowList() {
  var list = YS_KNOWLEDGE.filter(function (k) { return KnowCat === "全部" || k.category === KnowCat; });
  var d = Store.data;
  var box = $("#knowListBox");
  box.innerHTML = list.map(function (k) {
    var read = d.knowRead[k.id];
    return '<div class="know-card" data-know="' + k.id + '" style="overflow:hidden">' +
      '<div style="height:120px;background-image:url(' + k.image + ');background-size:cover;background-position:center;margin:-18px -18px 14px"></div>' +
      '<div class="kc-top"><div class="kc-ico">📄</div><div><b>' + k.title + '</b><span class="kc-cat">' + k.category + (read ? ' · 已读' : '') + '</span></div></div>' +
      '<p>' + esc(k.text) + '</p>' +
    '</div>';
  }).join("");
  $$("#knowListBox .know-card").forEach(function (c) {
    c.addEventListener("click", function () { openKnowDetail(c.dataset.know); });
  });
}

function openKnowDetail(id) {
  var k = YS_KNOWLEDGE.filter(function (x) { return x.id === id; })[0];
  if (!k) return;
  Store.data.knowRead[k.id] = true;
  Store.save();
  var readCount = Object.keys(Store.data.knowRead).length;
  if (readCount >= 5) unlockAchievement("know_5");

  var point = YS_POINTS.filter(function (p) { return p.id === k.point_id; })[0];

  $("#knowDetailBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>知识详情</h2></div>' +

    '<div style="border-radius:var(--r-xl);overflow:hidden;margin-bottom:14px">' +
      '<img src="' + k.image + '" style="width:100%;height:200px;object-fit:cover">' +
    '</div>' +

    (k.video ? '<div class="vcard" id="knowVideoCard">' +
      '<img src="' + k.video.poster + '" alt="' + esc(k.video.title) + '">' +
      '<div class="vc-mask"><div class="vc-title">' + k.video.title + '</div><div class="vc-sub">点击播放 · ' + k.video.duration + '</div></div>' +
      '<div class="vc-play">▶</div></div>' : '') +

    '<div class="know-detail-hero">' +
      '<div class="kd-tag">' + k.category + (point ? ' · ' + point.name : '') + '</div>' +
      '<h2>' + k.title + '</h2>' +
    '</div>' +

    '<div class="card"><div class="know-body">' + esc(k.detail) + '</div></div>' +

    (k.steps.length ? '<div class="card"><div class="card-title"><span class="ct-left">🔢 工艺步骤</span></div>' +
      '<div style="display:flex;flex-direction:column;gap:10px">' +
        k.steps.map(function (s, i) {
          return '<div style="display:flex;align-items:center;gap:12px">' +
            '<div style="width:28px;height:28px;border-radius:50%;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex-shrink:0">' + (i + 1) + '</div>' +
            '<div style="font-size:14px;font-weight:650">' + s + '</div>' +
          '</div>';
        }).join("") +
      '</div></div>' : '') +

    '<button class="btn btn-primary btn-block" id="knowAskBtn">就这个知识点提问</button>';

  Nav.go("v-know-detail", { after: function () {
    $("#knowDetailBody .back-btn").addEventListener("click", Nav.back);
    $("#knowAskBtn").addEventListener("click", function () { openAiChat(k.point_id); });
    var vc = $("#knowVideoCard");
    if (vc && k.video) vc.addEventListener("click", function () { playVideo(k.video.src, k.video.poster); });
  }});
}

/* ---------------------------------------------------------------- 非遗故事 */
function renderStories() {
  $("#storiesBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>非遗故事</h2></div>' +
    '<div style="font-size:12px;color:var(--ink-3);margin-bottom:14px;text-align:center">匠心往事 · 香云纱背后的故事</div>' +
    YS_STORIES.map(function (s) {
      return '<div class="story-card" data-story="' + s.id + '" style="background:var(--card);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh-1);border:1px solid var(--line-2);margin-bottom:14px;cursor:pointer">' +
        '<div style="height:160px;background-image:url(' + s.image + ');background-size:cover;background-position:center"></div>' +
        '<div style="padding:16px"><b style="font-size:16px;font-family:KaiTi,serif">' + esc(s.title) + '</b>' +
        '<p style="font-size:13px;color:var(--ink-2);line-height:1.7;margin-top:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + esc(s.text) + '</p></div>' +
      '</div>';
    }).join("");

  Nav.go("v-stories", { after: function () {
    $("#storiesBody .back-btn").addEventListener("click", Nav.back);
    $$("#storiesBody .story-card").forEach(function (c) {
      c.addEventListener("click", function () { openStory(c.dataset.story); });
    });
  }});
}

function openStory(id) {
  var s = YS_STORIES.filter(function (x) { return x.id === id; })[0];
  if (!s) return;
  unlockAchievement("story_1");

  $("#storyDetailBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>非遗故事</h2></div>' +
    '<div style="border-radius:var(--r-xl);overflow:hidden;margin-bottom:16px">' +
      '<img src="' + s.image + '" style="width:100%;height:220px;object-fit:cover">' +
    '</div>' +
    '<h2 style="font-size:22px;font-weight:800;font-family:KaiTi,serif;margin-bottom:12px">' + esc(s.title) + '</h2>' +
    (s.video ? '<div class="vcard" id="storyVideoCard" style="margin-bottom:16px">' +
      '<img src="' + s.video.poster + '" alt="' + esc(s.video.title) + '">' +
      '<div class="vc-mask"><div class="vc-title">' + s.video.title + '</div><div class="vc-sub">点击播放 · ' + s.video.duration + '</div></div>' +
      '<div class="vc-play">▶</div></div>' : '') +
    '<div class="card"><div class="know-body" style="font-size:15px">' + esc(s.text) + '</div></div>';

  Nav.go("v-story-detail", { after: function () {
    $("#storyDetailBody .back-btn").addEventListener("click", Nav.back);
    var vc = $("#storyVideoCard");
    if (vc && s.video) vc.addEventListener("click", function () { playVideo(s.video.src, s.video.poster); });
  }});
}

/* ---------------------------------------------------------------- 传承人 */
function renderMasters() {
  $("#mastersBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>传承人风采</h2></div>' +
    '<div style="font-size:12px;color:var(--ink-3);margin-bottom:14px;text-align:center">守艺人生 · 认识坚守非遗的匠人（实景配图）</div>' +
    YS_MASTERS.map(function (m) {
      return '<div class="master-card" data-master="' + m.id + '" style="background:var(--card);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh-1);border:1px solid var(--line-2);margin-bottom:14px;cursor:pointer">' +
        '<div style="height:140px;background-image:url(' + m.image + ');background-size:cover;background-position:center"></div>' +
        '<div style="padding:14px 16px">' +
          '<div style="display:flex;align-items:center;gap:8px"><b style="font-size:17px">' + m.name + '</b>' +
            '<span class="tag tag-gold" style="margin-left:auto">' + m.years + '</span></div>' +
          '<div style="font-size:12px;color:var(--ink-3);margin-top:5px">' + m.title + ' · ' + m.region + '</div>' +
          '<p style="font-size:13px;color:var(--ink-2);line-height:1.7;margin-top:8px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + esc(m.desc) + '</p>' +
        '</div>' +
      '</div>';
    }).join("");

  Nav.go("v-masters", { after: function () {
    $("#mastersBody .back-btn").addEventListener("click", Nav.back);
    $$("#mastersBody .master-card").forEach(function (c) {
      c.addEventListener("click", function () { openMaster(c.dataset.master); });
    });
  }});
}

function openMaster(id) {
  var m = YS_MASTERS.filter(function (x) { return x.id === id; })[0];
  if (!m) return;
  var gallery = (m.gallery || []).map(function (src) {
    return '<img src="' + src + '" style="width:100%;height:80px;object-fit:cover;border-radius:12px" alt="工艺实景">';
  }).join("");

  $("#masterDetailBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>传承人风采</h2></div>' +
    '<div style="height:180px;background-image:url(' + m.image + ');background-size:cover;background-position:center;position:relative;border-radius:0 0 18px 18px;margin:0 -16px 16px">' +
      '<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(44,27,19,.05),rgba(44,27,19,.78))"></div>' +
      '<div style="position:absolute;left:18px;bottom:16px;color:#fff"><div style="font-size:26px;font-weight:800;font-family:KaiTi,serif">' + m.name + '</div>' +
        '<div style="font-size:13px;opacity:.9;margin-top:4px">' + m.title + '</div></div>' +
    '</div>' +

    '<div class="card" style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<div style="flex:1;min-width:90px;text-align:center"><div style="font-size:14px;font-weight:800;color:var(--brand-d)">' + m.years + '</div><div style="font-size:11px;color:var(--ink-3)">从艺年限</div></div>' +
      '<div style="flex:1;min-width:90px;text-align:center"><div style="font-size:14px;font-weight:800;color:var(--brand-d)">' + m.region + '</div><div style="font-size:11px;color:var(--ink-3)">传承地</div></div>' +
      '<div style="flex:1;min-width:90px;text-align:center"><div style="font-size:14px;font-weight:800;color:var(--brand-d)">' + m.skill + '</div><div style="font-size:11px;color:var(--ink-3)">擅长技艺</div></div>' +
    '</div>' +

    '<div class="card"><div class="card-title"><span class="ct-left">👤 从艺经历</span></div><div class="know-body" style="font-size:14px;line-height:1.8">' + esc(m.bio) + '</div></div>' +

    '<div class="card"><div class="card-title"><span class="ct-left">🛠️ 技艺要点</span></div>' +
      (m.craft || []).map(function (c) {
        return '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line-2)"><b style="font-size:14px;color:var(--brand-d);flex-shrink:0;width:64px">' + esc(c.t) + '</b>' +
          '<span style="font-size:13px;color:var(--ink-2);line-height:1.6">' + esc(c.d) + '</span></div>';
      }).join("") +
    '</div>' +

    '<div class="card" style="background:linear-gradient(135deg,var(--brand-soft),var(--gold-soft));border:none;text-align:center">' +
      '<div style="font-size:12px;color:var(--ink-2);margin-bottom:8px">匠人寄语</div>' +
      '<div style="font-size:18px;font-weight:700;font-family:KaiTi,serif;color:var(--brand-d)">「' + esc(m.quote) + '」</div>' +
    '</div>' +

    '<div class="card"><div class="card-title"><span class="ct-left">📷 工艺实景</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' + gallery + '</div>' +
    '</div>';

  Nav.go("v-master-detail", { after: function () {
    $("#masterDetailBody .back-btn").addEventListener("click", Nav.back);
  }});
}

/* ---------------------------------------------------------------- AI 问答 */
function openAiChat(point_id) {
  // 大模型 RAG 问答：多轮上下文 + 引用来源 + 模式标识
  var history = [];
  var modeLabel = API.llmEnabled ? "大模型已接入 · 知识库增强" : "未配置大模型密钥（仅本地检索）";
  var modeTag = API.llmEnabled ? "tag-green" : "tag-amber";

  $("#aiBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>AI 知识问答</h2></div>' +
    '<div style="border-radius:var(--r-lg);overflow:hidden;margin-bottom:12px;position:relative">' +
      '<img src="assets/real/real_09.jpg" alt="顺德伦教香云纱晒莨场实景" style="width:100%;height:110px;object-fit:cover;display:block">' +
      '<div style="position:absolute;left:0;right:0;bottom:0;padding:16px 12px 8px;background:linear-gradient(transparent,rgba(44,27,19,.85));color:#fff;font-size:11px">' +
        '📷 顺德伦教香云纱晒莨场实景 · 公开报道资料图</div>' +
    '</div>' +
    '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px">' +
      '<span class="tag ' + modeTag + '" id="aiModeTag">' + modeLabel + '</span>' +
      '<button class="btn btn-sm btn-ghost" id="aiClear" style="height:26px;padding:0 10px;font-size:11px">清空对话</button>' +
    '</div>' +
    '<div class="ai-chat" id="aiChat">' +
      '<div class="ai-bubble bot">你好！我是云纱智境的 AI 助手。香云纱相关的问题我会查研学资料再回答（带引用来源），其他问题也可以随便问我。<br><br>可以试试：香云纱为什么是黑色的？三蒸九煮十八晒指什么？为什么产地在顺德？</div>' +
    '</div>' +
    '<div class="ai-input-bar">' +
      '<input id="aiInput" type="text" placeholder="输入你的问题…" />' +
      '<button class="send" id="aiSend">➤</button>' +
    '</div>';

  Nav.go("v-ai", { after: function () {
    $("#aiBody .back-btn").addEventListener("click", Nav.back);
    var chat = $("#aiChat");
    var input = $("#aiInput");
    var sending = false;

    $("#aiClear").addEventListener("click", function () {
      history = [];
      chat.innerHTML = '<div class="ai-bubble bot">对话已清空，我们重新开始吧。</div>';
    });

    var send = function () {
      if (sending) return;
      var q = input.value.trim();
      if (!q) return;
      sending = true;
      chat.innerHTML += '<div class="ai-bubble user">' + esc(q) + '</div>';
      input.value = "";
      var loading = el("div", "ai-bubble bot", "正在思考…");
      chat.appendChild(loading);
      chat.scrollTop = chat.scrollHeight;

      API.ask(q, point_id, history).then(function (r) {
        loading.remove();
        var ans = r.answer || "暂时没想好怎么回答，换个说法再试试？";
        // 模式徽标：知识库增强 / 通用对话 / 本地检索 / 未接通
        var badge;
        if (r.mode === "llm") {
          badge = '<span class="tag tag-green" style="margin-bottom:6px">🤖 ' + esc(r.model || "大模型") + ' · 知识库增强</span>';
        } else if (r.mode === "chat") {
          badge = '<span class="tag tag-green" style="margin-bottom:6px">🤖 ' + esc(r.model || "大模型") + '</span>';
        } else if (r.mode === "fallback") {
          badge = '<span class="tag tag-amber" style="margin-bottom:6px">📚 本地检索（大模型暂不可用）</span>';
        } else {
          badge = '<span class="tag tag-amber" style="margin-bottom:6px">⚠️ 大模型未接通</span>';
        }
        // 顶部模式徽标随真实返回动态更新（避免静态显示"已接入"导致误解）
        var tag = $("#aiModeTag");
        if (tag) {
          if (r.offline || r.mode === "fallback") {
            tag.className = "tag tag-amber";
            tag.textContent = "📚 离线资料问答模式（未连接 AI 后端）";
          } else {
            tag.className = "tag tag-green";
            tag.textContent = "🤖 AI 智能问答已连接";
          }
        }
        // 引用来源
        var src = (r.sources && r.sources.length)
          ? '<div style="font-size:10.5px;color:var(--ink-3);margin-top:8px;border-top:1px solid var(--line-2);padding-top:6px">引用资料：' +
              r.sources.map(function (s) { return esc(s.title); }).join(" · ") +
              (r.elapsed_ms ? '　·　' + r.elapsed_ms + 'ms' : '') + '</div>'
          : '';
        var body = esc(ans).replace(/\n/g, "<br>");
        chat.innerHTML += '<div class="ai-bubble bot">' + badge + '<div style="line-height:1.75">' + body + '</div>' + src + '</div>';
        // 维护多轮上下文（只保留最近 6 条）
        history.push({ role: "user", content: q });
        history.push({ role: "assistant", content: ans });
        history = history.slice(-6);
        chat.scrollTop = chat.scrollHeight;
        sending = false;
      }).catch(function () {
        loading.remove();
        chat.innerHTML += '<div class="ai-bubble bot">网络异常，已切换为本地检索，请重试。</div>';
        sending = false;
      });
    };
    $("#aiSend").addEventListener("click", send);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });
  }});
}

/* ---------------------------------------------------------------- 我的学习 */
function renderMe() {
  var d = Store.data;
  var li = levelInfo(d.user.xp);
  var nextXp = li.next ? li.next.xp : li.cur.xp;
  var xpPct = li.next ? clamp((d.user.xp - li.cur.xp) / (nextXp - li.cur.xp) * 100, 0, 100) : 100;
  var radar = calcRadar();
  var achCount = Object.keys(d.achievements).length;

  $("#meBody").innerHTML =
    '<div class="page-head"><div><h1>我的学习</h1><div class="sub">' + esc(d.user.name || "研学学员") + ' · ' + (d.user.role === "teacher" ? "指导老师" : "研学学员") + '</div></div>' +
    '<button class="icon-btn" id="meSettingsBtn">⚙️</button></div>' +

    '<div class="profile-hero">' +
      '<div class="ph-top">' +
        avatarDisplayHTML(62) +
        '<div class="ph-info">' +
          '<div class="ph-name">' + esc(d.user.name || "研学学员") + '<span class="ph-lvl">Lv.' + li.cur.lv + '</span></div>' +
          '<div class="ph-title">' + li.cur.name + (getTitle().id !== "ti_none" ? ' · ' + getTitle().name : '') + '</div>' +
          '<div style="font-size:11px;color:var(--gold);margin-top:4px">🪙 ' + (d.user.coins || 0) + ' 传承币</div>' +
        '</div>' +
      '</div>' +
      '<div class="ph-xp">' +
        '<div class="xp-bar"><i style="width:' + xpPct + '%"></i></div>' +
        '<div class="xp-txt"><span>' + d.user.xp + ' 积分</span><span>' + (li.next ? nextXp - d.user.xp + ' 分升级' : '已满级') + '</span></div>' +
      '</div>' +
      '<div class="ph-stats">' +
        '<div><b>' + tasksCompleted() + '</b><span>完成任务</span></div>' +
        '<div><b>' + achCount + '</b><span>成就</span></div>' +
        '<div><b>' + d.checkin.streak + '</b><span>连续签到</span></div>' +
      '</div>' +
    '</div>' +

    // 装扮快捷入口
    '<div class="card-title" style="padding:2px 2px 12px"><span class="ct-left">✨ 我的装扮</span>' +
      '<span class="ct-right" id="meAllDress" style="cursor:pointer;color:var(--brand)">管理 ›</span></div>' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px">' +
      quickDress("🖼️", "头像", "avatar") +
      quickDress("⭕", "头像框", "frame") +
      quickDress("🎖️", "称号", "title") +
      quickDress("🗃️", "收藏", "inventory") +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title"><span class="ct-left">📊 学习报告</span><span class="ct-right">' + tasksCompleted() + '/' + YS_TASKS.length + ' 任务</span></div>' +
      '<div class="radar-box"><div class="radar-svg" id="radarSvg"></div></div>' +
      '<button class="btn btn-primary btn-block" id="meReportBtn" style="margin-top:14px">查看完整报告</button>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title"><span class="ct-left">🏅 成就墙</span><span class="ct-right">' + achCount + '/' + YS_ACHIEVEMENTS.length + ' · 点击查看详情</span></div>' +
      '<div class="badge-grid">' +
        YS_ACHIEVEMENTS.map(function (a) {
          var unlocked = !!d.achievements[a.id];
          return '<div class="badge-item ' + (unlocked ? 'unlocked' : 'locked') + '" data-ach="' + a.id + '" style="cursor:pointer"><div class="bi-box">' + a.ico + '</div><div class="bi-name">' + a.name + '</div></div>';
        }).join("") +
      '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title"><span class="ct-left">📜 研学证书</span><span class="ct-right">' + (certReady() ? '可生成' : '完成全部任务后解锁') + '</span></div>' +
      '<button class="btn btn-gold btn-block" id="meCertBtn" ' + (certReady() ? '' : 'disabled') + '>生成研学证书</button>' +
    '</div>' +

    '<div class="dual-entry">' +
      '<button class="de-item" id="meGameBtn"><span class="de-ico">🎮</span><span class="de-txt"><b>游戏中心</b><i>5 个小游戏</i></span></button>' +
      '<button class="de-item" id="meUeBtn"><span class="de-ico">🔗</span><span class="de-txt"><b>UE 联动</b><i>虚实结合</i></span></button>' +
    '</div>' +
    '<div class="dual-entry">' +
      '<button class="de-item" id="meShopBtn"><span class="de-ico">🛒</span><span class="de-txt"><b>传承商店</b><i>装扮与称号</i></span></button>' +
      '<button class="de-item" id="meShareBtn"><span class="de-ico">📤</span><span class="de-txt"><b>分享成果</b><i>生成研学卡片</i></span></button>' +
    '</div>';

  $("#meSettingsBtn").addEventListener("click", renderSettings);
  $("#meReportBtn").addEventListener("click", openReport);
  $("#meCertBtn").addEventListener("click", openCert);
  $("#meGameBtn").addEventListener("click", openGames);
  $("#meUeBtn").addEventListener("click", openUePanel);
  var meShop = $("#meShopBtn"), meShare = $("#meShareBtn");
  if (meShop) meShop.addEventListener("click", function () {
    if (typeof window.renderShop === "function") window.renderShop(); else toast("商店加载中", { ico: "⏳" });
  });
  if (meShare) meShare.addEventListener("click", function () {
    if (typeof window.renderShare === "function") window.renderShare(); else toast("分享功能加载中", { ico: "⏳" });
  });
  var allDress = $("#meAllDress");
  if (allDress) allDress.addEventListener("click", function () {
    if (typeof window.renderAvatarPicker === "function") window.renderAvatarPicker();
    else toast("装扮功能加载中", { ico: "⏳" });
  });
  $$("#meBody .quick-dress").forEach(function (q) {
    q.addEventListener("click", function () {
      var names = { avatar: "renderAvatarPicker", frame: "renderFramePicker", title: "renderTitlePicker", inventory: "renderInventory" };
      var fn = window[names[q.dataset.dress]];
      if (typeof fn === "function") fn();
      else toast("该功能正在加载，请稍后重试", { ico: "⏳" });
    });
  });
  $$("#meBody .badge-item").forEach(function (b) {
    b.addEventListener("click", function () {
      if (typeof window.openAchDetail === "function") window.openAchDetail(b.dataset.ach);
      else toast("成就详情加载中", { ico: "⏳" });
    });
  });

  renderRadar($("#radarSvg"), radar);
}

function renderRadar(container, data) {
  var dims = YS_RADAR_DIMS;
  var cx = 130, cy = 120, R = 80;
  var N = dims.length;
  var angle = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / N; };
  var pt = function (i, r) { return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))]; };

  var grid = "";
  for (var ring = 1; ring <= 4; ring++) {
    var rr = R * ring / 4;
    var pts = "";
    for (var i = 0; i < N; i++) { var p = pt(i, rr); pts += p[0] + "," + p[1] + " "; }
    grid += '<polygon points="' + pts + '" fill="none" stroke="var(--line)" stroke-width="1"/>';
  }
  var axes = "";
  for (var i2 = 0; i2 < N; i2++) { var p2 = pt(i2, R); axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="var(--line)" stroke-width="1"/>'; }

  var dataPts = "";
  for (var i3 = 0; i3 < N; i3++) {
    var val = data[dims[i3]] || 0;
    var p3 = pt(i3, R * val / 100);
    dataPts += p3[0] + "," + p3[1] + " ";
  }

  var labels = "";
  for (var i4 = 0; i4 < N; i4++) {
    var p4 = pt(i4, R + 22);
    labels += '<text x="' + p4[0] + '" y="' + p4[1] + '" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="var(--ink-2)">' + dims[i4] + '</text>';
  }

  container.innerHTML =
    '<svg viewBox="0 0 260 250">' + grid + axes +
    '<polygon points="' + dataPts + '" fill="rgba(217,173,113,.35)" stroke="var(--brand)" stroke-width="2.5"/>' +
    dims.map(function (dim, i5) {
      var val = data[dim] || 0;
      var dp = pt(i5, R * val / 100);
      return '<circle cx="' + dp[0] + '" cy="' + dp[1] + '" r="3.5" fill="var(--brand)"/>';
    }).join("") +
    labels + '</svg>';
}

/* ---------------------------------------------------------------- 积分排名榜（本地演示榜） */
var LB_KEY = "yunsha_leaderboard_v1";
function seedLeaderboard() {
  var names = ["竹隐", "兰因", "青禾", "砚秋", "墨白", "拾光", "听涛", "南风", "知夏", "晚晴",
    "疏影", "归雁", "清欢", "如初", "望舒", "采薇", "行云", "一诺", "半夏", "向晚", "初晴", "凌霄", "映雪", "枕书"];
  var arr = names.map(function (n, i) {
    var xp = 24 + ((i * 53) % 170) + (i % 4) * 6;
    return { name: "学员·" + n, xp: xp };
  });
  try { localStorage.setItem(LB_KEY, JSON.stringify(arr)); } catch (e) {}
  return arr;
}
function getLeaderboard() {
  var d = Store.data;
  var pool = null;
  try { pool = JSON.parse(localStorage.getItem(LB_KEY) || "null"); } catch (e) { pool = null; }
  if (!pool || !pool.length) pool = seedLeaderboard();
  var me = { name: d.user.name || "我", xp: d.user.xp || 0, me: true };
  var all = pool.concat([me]);
  all.sort(function (a, b) { return b.xp - a.xp; });
  var rank = all.findIndex(function (x) { return x.me; }) + 1;
  var total = all.length;
  var pct = total > 1 ? Math.round((total - rank) / (total - 1) * 100) : 0;
  return { rows: all, myRank: rank, total: total, pct: pct };
}

function openReport() {
  var d = Store.data;
  var radar = calcRadar();
  var done = tasksCompleted();
  var score = done * 25;
  var grade = score >= 90 ? "优秀" : score >= 60 ? "良好" : "继续努力";

  $("#reportBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>学习报告</h2></div>' +
    '<div class="card" style="text-align:center">' +
      '<div style="font-size:11px;color:var(--ink-3);letter-spacing:.1em">研学综合成绩</div>' +
      '<div style="font-size:52px;font-weight:850;color:var(--brand-d)">' + score + '</div>' +
      '<div class="tag tag-gold" style="font-size:13px">' + grade + '</div>' +
    '</div>' +
    '<div class="card"><div class="card-title"><span class="ct-left">🧭 能力雷达</span></div><div class="radar-box"><div class="radar-svg" id="reportRadar"></div></div></div>' +
    '<div class="card"><div class="card-title"><span class="ct-left">📋 任务明细</span><span class="ct-right">' + done + '/' + YS_TASKS.length + '</span></div>' +
      YS_TASKS.map(function (t) {
        var isDone = d.tasksDone[t.id];
        return '<div class="list-row"><div class="lr-ico">' + (isDone ? '✅' : '⬜') + '</div>' +
          '<div class="lr-main"><b>' + t.title + '</b><span>' + (isDone ? d.taskScores[t.id] + ' 分' : '未完成') + '</span></div></div>';
      }).join("") +
    '</div>' +
    '<div class="card"><div class="card-title"><span class="ct-left">🔗 UE 虚实联动记录</span></div>' +
      (d.ueEvents.length ? d.ueEvents.map(function (e) {
        return '<div class="list-row"><div class="lr-ico">🔗</div><div class="lr-main"><b>' + e.task_id + '</b><span>' + e.operation_result + ' · ' + e.time + '</span></div></div>';
      }).join("") : '<div class="empty" style="padding:16px"><div class="d">暂无记录 · 本功能需接入 UE 虚实引擎（教学端）后生效</div></div>') +
    '</div>' +

    '<div class="card"><div class="card-title"><span class="ct-left">🏆 研学积分排名</span><span class="ct-right" id="lbMyRank"></span></div>' +
      '<div id="lbList"></div>' +
      '<div class="lb-foot" id="lbFoot"></div>' +
    '</div>';

  Nav.go("v-report", { after: function () {
    $("#reportBody .back-btn").addEventListener("click", Nav.back);
    renderRadar($("#reportRadar"), radar);
    var lb = getLeaderboard();
    $("#lbList").innerHTML = lb.rows.slice(0, 12).map(function (r, i) {
      var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1);
      var meCls = r.me ? " lb-me" : "";
      return '<div class="lb-row' + meCls + '"><span class="lb-rank">' + medal + '</span>' +
        '<span class="lb-name">' + esc(r.name) + (r.me ? "（我）" : "") + '</span>' +
        '<span class="lb-xp">' + r.xp + ' 分</span></div>';
    }).join("");
    $("#lbMyRank").textContent = "第 " + lb.myRank + " 名 / " + lb.total;
    $("#lbFoot").innerHTML = '🎯 你已超越 <b>' + lb.pct + '%</b> 的研学伙伴　·　完成更多任务可提升排名';
  }});
}

function openCert() {
  var d = Store.data;
  var done = tasksCompleted();
  var total = YS_TASKS.length;

  // 未达成解锁条件：展示进度，不生成虚假证书
  if (!certReady()) {
    $("#certBody").innerHTML =
      '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>研学证书</h2></div>' +
      '<div class="empty" style="padding:36px 18px">' +
        '<div class="ico">📜</div>' +
        '<div class="t">还差一点点</div>' +
        '<div class="d">完成全部 ' + total + ' 项研学任务后即可生成结业证书。<br>当前进度 ' + done + ' / ' + total + '。</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title"><span class="ct-left">🎯 待完成任务</span><span class="ct-right">' + done + '/' + total + '</span></div>' +
        '<div class="pbar gold"><i style="width:' + (done / total * 100) + '%"></i></div>' +
        '<div style="margin-top:12px">' +
          YS_TASKS.map(function (t) {
            var isDone = !!d.tasksDone[t.id];
            return '<div class="list-row"><div class="lr-ico">' + (isDone ? "✅" : "🔓") + '</div>' +
              '<div class="lr-main"><b>' + t.title + '</b><span>' + (isDone ? '已完成' : '待完成 · 第 ' + t.order + ' 关') + '</span></div></div>';
          }).join("") +
        '</div>' +
      '</div>';
    Nav.go("v-cert", { after: function () {
      $("#certBody .back-btn").addEventListener("click", Nav.back);
    }});
    return;
  }

  var date = new Date();
  var dateStr = date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日";
  d.certGenerated = true;
  Store.save();
  unlockAchievement("cert");

  $("#certBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>研学证书</h2></div>' +
    '<div class="cert-wrap"><div class="cert-card">' +
      '<div class="cc-seal">莨</div>' +
      '<div class="cc-title">研学结业证书</div>' +
      '<div class="cc-sub">云纱智境 · 香云纱数字研学平台</div>' +
      '<div class="cc-name">' + esc(d.user.name || "研学学员") + '</div>' +
      '<div class="cc-desc">完成了「' + YS_COURSE.name + '」全部研学任务，<br>深入学习了香云纱「三蒸九煮十八晒」非遗技艺。</div>' +
      '<div style="display:flex;justify-content:space-around;margin-top:14px;font-size:12px;color:var(--ink-2)">' +
        '<span>积分 ' + Store.roundNum(d.user.xp) + '</span><span>成就 ' + Object.keys(d.achievements).length + ' 项</span><span>等级 Lv.' + levelInfo(d.user.xp).cur.lv + '</span>' +
      '</div>' +
      '<div class="cc-meta">颁发日期 ' + dateStr + ' · 莨珠记研学基地</div>' +
    '</div></div>' +
    '<button class="btn btn-primary btn-block" id="certSaveBtn" style="margin-top:16px">保存证书到相册</button>';

  Nav.go("v-cert", { after: function () {
    $("#certBody .back-btn").addEventListener("click", Nav.back);
    $("#certSaveBtn").addEventListener("click", function () {
      toast("证书已保存（演示）", { ico: "📜" });
    });
    confetti(50);
  }});
}

/* ---------------------------------------------------------------- 设置 */
function renderSettings() {
  var s = Store.data.settings;
  var d = Store.data;
  $("#settingsBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>设置</h2></div>' +

    // 账号概览（含装扮）
    '<div class="card"><div class="card-title"><span class="ct-left">👤 个人信息</span><span class="ct-right" id="setEditProfile" style="cursor:pointer;color:var(--brand)">编辑</span></div>' +
      '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">' +
        avatarDisplayHTML(56) +
        '<div><b style="font-size:16px">' + esc(d.user.name || "研学学员") + '</b>' +
        '<div style="font-size:12px;color:var(--ink-3);margin-top:3px">' + levelInfo(d.user.xp).cur.name + (getTitle().id !== "ti_none" ? ' · ' + getTitle().name : '') + '</div></div>' +
      '</div>' +
      '<div class="list-row"><div class="lr-ico">🏫</div><div class="lr-main"><b>' + (d.user.school || "未填写") + '</b><span>学校 / 班级</span></div></div>' +
      '<div class="list-row"><div class="lr-ico">🎭</div><div class="lr-main"><b>' + (d.user.role === "teacher" ? "指导老师" : "研学学员") + '</b><span>身份角色</span></div></div>' +
      '<div class="list-row"><div class="lr-ico">🪙</div><div class="lr-main"><b>' + (d.user.coins || 0) + ' 传承币 / ' + d.user.xp + ' 积分</b><span>累计获得 🪙 ' + (d.coinsEarned || 0) + '</span></div></div>' +
      '<div class="list-row"><div class="lr-ico">📅</div><div class="lr-main"><b>' + d.user.joined + '</b><span>加入日期</span></div></div>' +
      // 三个最常用快捷按钮（大按钮，绝对好点）
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:14px">' +
        '<button class="btn btn-sm btn-soft" id="setQuickEdit">✎ 改信息</button>' +
        '<button class="btn btn-sm btn-soft" id="setQuickAvatar">🖼️ 换头像</button>' +
        '<button class="btn btn-sm btn-ghost" id="setQuickLogout" style="color:var(--red)">🚪 退出</button>' +
      '</div>' +
    '</div>' +

    // 装扮与奖励
    '<div class="card"><div class="card-title"><span class="ct-left">✨ 装扮与奖励</span></div>' +
      '<div class="list-row" id="setAvatarRow"><div class="lr-ico">🖼️</div><div class="lr-main"><b>我的头像</b><span>更换头像 / 导入照片</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setThemeRow"><div class="lr-ico">🎨</div><div class="lr-main"><b>主题外观</b><span>当前：' + (((window.YS_THEMES || []).filter(function (t) { return t.id === (d.equippedTheme || ""); })[0] || {}).name || "茶褐原色") + '</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setFrameRow"><div class="lr-ico">⭕</div><div class="lr-main"><b>头像框</b><span>当前：' + getFrame().name + '</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setTitleRow"><div class="lr-ico">🎖️</div><div class="lr-main"><b>我的称号</b><span>佩戴荣誉称号</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setShopRow"><div class="lr-ico">🛒</div><div class="lr-main"><b>传承商店</b><span>购买装扮与称号</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setBoxRow"><div class="lr-ico">🎁</div><div class="lr-main"><b>非遗盲盒</b><span>剩余 ' + (d.boxLeft || 0) + ' 次机会</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setSignRow"><div class="lr-ico">📅</div><div class="lr-main"><b>签到日历</b><span>连续 ' + d.checkin.streak + ' 天</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setShareRow"><div class="lr-ico">📤</div><div class="lr-main"><b>研学分享卡</b><span>生成成果海报</span></div><span class="lr-arrow">›</span></div>' +
    '</div>' +

    // 通用设置
    '<div class="card"><div class="card-title"><span class="ct-left">🔊 通用设置</span></div>' +
      toggleRow("🔊", "音效", "答题、签到与结算音效", "sound", s.sound) +
      toggleRow("📳", "震动反馈", "答题达标时轻微震动", "vibrate", s.vibrate) +
      toggleRow("🗣️", "语音提示", "任务节点播报与鼓励", "voice", s.voice) +
      toggleRow("🌙", "深色模式", "夜间使用更护眼", "dark", s.dark) +
      toggleRow("🔍", "大字体", "适合视力较弱时使用", "bigFont", s.bigFont) +
      toggleRow("👁️", "护眼模式", "降低蓝光，减少视觉疲劳", "eyeCare", s.eyeCare) +
      toggleRow("🎨", "自动签到提醒", "每天提醒完成研学签到", "checkinRemind", s.checkinRemind) +
    '</div>' +

    // 通知管理
    '<div class="card"><div class="card-title"><span class="ct-left">🔔 通知管理</span></div>' +
      toggleRow("📢", "任务提醒", "新任务与任务截止提醒", "notifyTask", s.notifyTask) +
      toggleRow("🏆", "成就通知", "解锁成就时弹窗提醒", "notifyAch", s.notifyAch) +
      toggleRow("🔗", "UE 联动通知", "虚拟引擎事件实时推送", "notifyUe", s.notifyUe) +
    '</div>' +

    // 数据与存储
    '<div class="card"><div class="card-title"><span class="ct-left">💾 数据与存储</span></div>' +
      '<div class="list-row" id="setClearCache"><div class="lr-ico">🧹</div><div class="lr-main"><b>清除缓存</b><span>清理本地临时数据</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setExportData"><div class="lr-ico">📤</div><div class="lr-main"><b>导出学习数据</b><span>导出 JSON 格式学习记录</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setResetData"><div class="lr-ico">🗑️</div><div class="lr-main"><b style="color:var(--red)">重置所有数据</b><span>清空学习进度与成就</span></div><span class="lr-arrow">›</span></div>' +
    '</div>' +

    // 后端与联动
    '<div class="card"><div class="card-title"><span class="ct-left">🔗 后端与联动</span></div>' +
      '<div class="list-row" id="setUeRow"><div class="lr-ico">🔗</div><div class="lr-main"><b>UE 虚实联动</b><span>查看 UE4 虚拟引擎对接状态</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setApiRow"><div class="lr-ico">🌐</div><div class="lr-main"><b>后端服务</b><span>' + (API.online ? '已连接在线后端' : '离线本地模式') + '</span></div><span class="tag ' + (API.online ? 'tag-green' : 'tag-gray') + '">' + (API.online ? '在线' : '离线') + '</span></div>' +
      '<div class="list-row" id="setMapRow"><div class="lr-ico">🗺️</div><div class="lr-main"><b>地图服务</b><span>OpenStreetMap · 开源地图</span></div><span class="tag tag-blue">已启用</span></div>' +
    '</div>' +

    // 隐私与安全
    '<div class="card"><div class="card-title"><span class="ct-left">🛡 隐私与安全</span></div>' +
      '<div class="list-row" id="setPrivacyRow"><div class="lr-ico">🔒</div><div class="lr-main"><b>隐私政策</b><span>查看数据使用说明</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setPermissionRow"><div class="lr-ico">📋</div><div class="lr-main"><b>权限管理</b><span>相机 · 震动 · 网络</span></div><span class="lr-arrow">›</span></div>' +
    '</div>' +

    // 帮助与关于
    '<div class="card"><div class="card-title"><span class="ct-left">❓ 帮助与关于</span></div>' +
      '<div class="list-row" id="setHelpRow"><div class="lr-ico">💬</div><div class="lr-main"><b>帮助与反馈</b><span>常见问题与意见反馈</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setAboutRow"><div class="lr-ico">ℹ️</div><div class="lr-main"><b>关于应用</b><span>版本信息与团队介绍</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setUpdateRow"><div class="lr-ico">🔄</div><div class="lr-main"><b>检查更新</b><span>当前 v1.2.0</span></div><span class="tag tag-green">最新</span></div>' +
    '</div>' +

    // 账号
    '<div class="card"><div class="card-title"><span class="ct-left">👤 账号与身份</span></div>' +
      '<div class="list-row" id="setEditRow"><div class="lr-ico">✎</div><div class="lr-main"><b>更换个人信息</b><span>修改昵称与学校 / 班级</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setAvatarRow2"><div class="lr-ico">🖼️</div><div class="lr-main"><b>更换头像</b><span>预设头像或相册导入</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setPhoneRow"><div class="lr-ico">📱</div><div class="lr-main"><b>登录手机号</b><span>' + (d.user.phone ? maskPhone(d.user.phone) : "未绑定") + '</span></div></div>' +
      '<div class="list-row" id="setTeacherRow"><div class="lr-ico">📊</div><div class="lr-main"><b>' + (d.user.role === "teacher" ? "返回研学平台" : "进入研学数据看板") + '</b><span>查看本机真实记录 · 导出 / 汇总</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="setLogoutRow"><div class="lr-ico">🚪</div><div class="lr-main"><b style="color:var(--red)">退出登录</b><span>切换账号，本地数据保留</span></div><span class="lr-arrow">›</span></div>' +
    '</div>' +

    '<div style="text-align:center;padding:16px 0 30px;font-size:11px;color:var(--ink-3);line-height:1.9">' +
      '莨珠记 · 云纱智境 v1.2.0<br>香云纱非遗数字研学平台<br>非遗传承 · 数字体验 · 工匠育人' +
    '</div>';

  Nav.go("v-settings", { after: function () {
    $("#settingsBody .back-btn").addEventListener("click", Nav.back);
    // 账号与身份
    var editRow = $("#setEditRow");
    if (editRow) editRow.addEventListener("click", function () {
      var ep = $("#setEditProfile");
      if (ep) ep.click();
    });
    var avatarRow2 = $("#setAvatarRow2");
    if (avatarRow2) avatarRow2.addEventListener("click", function () {
      if (typeof window.renderAvatarPicker === "function") window.renderAvatarPicker();
      else toast("头像功能加载中", { ico: "⏳" });
    });
    var teacherRow = $("#setTeacherRow");
    if (teacherRow) teacherRow.addEventListener("click", function () {
      if (Store.data.user.role === "teacher") exitTeacherMode();
      else enterTeacherMode();
    });

    // 三个快捷按钮
    var quickEdit = $("#setQuickEdit");
    if (quickEdit) quickEdit.addEventListener("click", function () {
      var ep = $("#setEditProfile");
      if (ep) ep.click();
    });
    var quickAvatar = $("#setQuickAvatar");
    if (quickAvatar) quickAvatar.addEventListener("click", function () {
      if (typeof window.renderAvatarPicker === "function") window.renderAvatarPicker();
      else toast("头像功能加载中", { ico: "⏳" });
    });
    var quickLogout = $("#setQuickLogout");
    if (quickLogout) quickLogout.addEventListener("click", function () {
      var lo = $("#setLogoutRow");
      if (lo) lo.click();
    });

    // 装扮与奖励入口（安全分发：即使某个模块未加载也不会整体崩溃）
    var rewardRoutes = {
      setAvatarRow: "renderAvatarPicker", setFrameRow: "renderFramePicker", setTitleRow: "renderTitlePicker",
      setShopRow: "renderShop", setBoxRow: "renderBox", setSignRow: "renderSignCalendar", setShareRow: "renderShare",
      setThemeRow: "renderThemePicker"
    };
    Object.keys(rewardRoutes).forEach(function (rowId) {
      var row = $("#" + rowId);
      if (!row) return;
      row.addEventListener("click", function () {
        var fn = window[rewardRoutes[rowId]];
        if (typeof fn === "function") fn();
        else toast("该功能正在加载，请稍后重试", { ico: "⏳" });
      });
    });
    // 所有开关
    ["sound", "vibrate", "voice", "dark", "bigFont", "eyeCare", "checkinRemind", "notifyTask", "notifyAch", "notifyUe"].forEach(function (key) {
      $("#tg_" + key).addEventListener("click", function () {
        Store.data.settings[key] = !Store.data.settings[key];
        Store.save();
        applySettings();
        renderSettings();
        Sound.tick();
      });
    });
    // 个人信息编辑
    $("#setEditProfile").addEventListener("click", function () {
      Sheet.open({
        title: "编辑个人信息",
        body: '<div class="field"><label>昵称 / 姓名</label><input id="editName" type="text" value="' + esc(d.user.name) + '"></div>' +
              '<div class="field"><label>学校 / 班级</label><input id="editSchool" type="text" value="' + esc(d.user.school) + '"></div>',
        foot: '<button class="btn btn-ghost" id="cancelEdit">取消</button><button class="btn btn-primary" id="saveEdit">保存</button>',
        onMount: function () {
          $("#cancelEdit").onclick = Sheet.close;
          $("#saveEdit").onclick = function () {
            d.user.name = $("#editName").value.trim() || d.user.name;
            d.user.school = $("#editSchool").value.trim();
            Store.save();
            Sheet.close();
            renderSettings();
            toast("个人信息已更新", { ico: "✅" });
          };
        }
      });
    });
    // 清除缓存
    $("#setClearCache").addEventListener("click", function () {
      toast("缓存已清理（演示）", { ico: "🧹" });
    });
    // 导出数据
    $("#setExportData").addEventListener("click", function () {
      var json = JSON.stringify(d, null, 2);
      Sheet.open({
        title: "导出学习数据",
        body: '<div style="font-size:12px;color:var(--ink-2);margin-bottom:10px">以下是你的学习数据 JSON，可复制保存：</div>' +
              '<textarea style="width:100%;height:200px;border-radius:12px;border:1px solid var(--line);padding:10px;font-size:11px;font-family:monospace" readonly>' + esc(json) + '</textarea>',
        foot: '<button class="btn btn-primary btn-block" id="copyData">复制数据</button>',
        onMount: function () {
          $("#copyData").onclick = function () {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(json);
              toast("已复制到剪贴板", { ico: "📋" });
            } else {
              toast("复制功能不可用", { ico: "⚠️" });
            }
          };
        }
      });
    });
    // 重置数据
    $("#setResetData").addEventListener("click", function () {
      Sheet.open({
        title: "确认重置所有数据？",
        body: '<div class="empty" style="padding:10px"><div class="ico">⚠️</div><div class="t">此操作不可恢复</div><div class="d">将清空所有学习进度、成就、积分与游戏记录。</div></div>',
        foot: '<button class="btn btn-ghost" id="cancelReset">取消</button><button class="btn btn-danger" id="confirmReset">确认重置</button>',
        onMount: function () {
          $("#cancelReset").onclick = Sheet.close;
          $("#confirmReset").onclick = function () {
            Store.reset();
            Store.data.loggedIn = true;
            Store.data.user = { name: d.user.name, role: d.user.role, school: d.user.school, joined: ds(), xp: 0, coins: 0 };
            Store.save();
            Sheet.close();
            renderStatus();
            renderSettings();
            toast("已重置数据", { ico: "🗑️" });
          };
        }
      });
    });
    // 隐私政策
    $("#setPrivacyRow").addEventListener("click", function () {
      Sheet.open({
        title: "隐私政策",
        body: '<div style="font-size:13px;color:var(--ink-2);line-height:1.9">' +
          '本应用为香云纱非遗研学演示平台，遵循以下隐私原则：<br><br>' +
          '1. 不采集姓名、手机号等敏感个人信息；<br>' +
          '2. 学习数据默认保存在本地设备；<br>' +
          '3. 会话编号为匿名标识，不用于身份追踪；<br>' +
          '4. 正式上线前将落实隐私告知与数据清理策略。' +
          '</div>',
        foot: '<button class="btn btn-primary btn-block" id="privacyOk">我知道了</button>',
        onMount: function () { $("#privacyOk").onclick = Sheet.close; }
      });
    });
    // 权限管理
    $("#setPermissionRow").addEventListener("click", function () {
      Sheet.open({
        title: "权限管理",
        body: '<div class="list-row"><div class="lr-ico">📷</div><div class="lr-main"><b>相机</b><span>扫码进入研学点位</span></div><div class="toggle on"></div></div>' +
              '<div class="list-row"><div class="lr-ico">📳</div><div class="lr-main"><b>震动</b><span>答题与签到反馈</span></div><div class="toggle on"></div></div>' +
              '<div class="list-row"><div class="lr-ico">🌐</div><div class="lr-main"><b>网络</b><span>后端与地图服务</span></div><div class="toggle on"></div></div>',
        foot: '<button class="btn btn-primary btn-block" id="permOk">关闭</button>',
        onMount: function () { $("#permOk").onclick = Sheet.close; }
      });
    });
    // 帮助与反馈
    $("#setHelpRow").addEventListener("click", function () {
      Sheet.open({
        title: "帮助与反馈",
        body: '<div style="font-size:13px;color:var(--ink-2);line-height:1.9">' +
          '<b>常见问题</b><br>' +
          '· 如何完成研学任务？前往「研学任务」页答题闯关<br>' +
          '· 如何生成证书？完成全部 4 个任务后在「我的学习」生成<br>' +
          '· 如何对接 UE？前往「UE 虚实联动」页查看会话编号<br><br>' +
          '<b>意见反馈</b><br>如有问题请联系竞赛小组指导老师。' +
          '</div>',
        foot: '<button class="btn btn-primary btn-block" id="helpOk">知道了</button>',
        onMount: function () { $("#helpOk").onclick = Sheet.close; }
      });
    });
    // 关于
    $("#setAboutRow").addEventListener("click", function () {
      Sheet.open({
        title: "关于应用",
        body: '<div style="text-align:center;padding:10px 0">' +
          '<div style="font-size:50px">纱</div>' +
          '<div style="font-size:20px;font-weight:800;margin-top:8px">莨珠记 · 云纱智境</div>' +
          '<div style="font-size:12px;color:var(--ink-3);margin-top:4px">香云纱非遗数字研学平台 v1.2.0</div>' +
          '<div style="font-size:12px;color:var(--ink-2);margin-top:14px;line-height:1.9">' +
          '非遗传承 · 数字体验 · 工匠育人<br>' +
          '由职中竞赛小组 + 代码组 + UE 虚拟引擎组共建' +
          '</div></div>',
        foot: '<button class="btn btn-primary btn-block" id="aboutOk">关闭</button>',
        onMount: function () { $("#aboutOk").onclick = Sheet.close; }
      });
    });
    // 检查更新
    $("#setUpdateRow").addEventListener("click", function () {
      toast("已是最新版本 v1.2.0", { ico: "✅" });
    });
    // 后端/UE/地图
    $("#setUeRow").addEventListener("click", openUePanel);
    $("#setApiRow").addEventListener("click", function () {
      toast(API.online ? "后端在线" : "离线模式（数据保存在本地）", { ico: "🌐" });
    });
    $("#setMapRow").addEventListener("click", function () { Nav.go("v-map"); });
    // 退出登录
    $("#setLogoutRow").addEventListener("click", function () {
      Sheet.open({
        title: "确认退出登录？",
        body: '<div class="empty" style="padding:10px"><div class="t">退出后将返回登录页</div><div class="d">本地学习数据会保留，重新登录即可恢复。</div></div>',
        foot: '<button class="btn btn-ghost" id="cancelLogout">取消</button><button class="btn btn-danger" id="confirmLogout">退出</button>',
        onMount: function () {
          $("#cancelLogout").onclick = Sheet.close;
          $("#confirmLogout").onclick = function () {
            Store.data.loggedIn = false;
            Store.save();
            Sheet.close();
            Nav.resetAll();
            showAuth();
          };
        }
      });
    });
  }});
}

function toggleRow(ico, title, sub, key, on) {
  return '<div class="list-row"><div class="lr-ico">' + ico + '</div>' +
    '<div class="lr-main"><b>' + title + '</b><span>' + sub + '</span></div>' +
    '<div class="toggle ' + (on ? 'on' : '') + '" id="tg_' + key + '"></div></div>';
}

/* ---------------------------------------------------------------- UE 联动面板 */
function openUePanel() {
  var d = Store.data;
  $("#ueBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>UE 虚实联动</h2></div>' +
    '<div class="card" style="text-align:center;background:linear-gradient(160deg,#4C7A78,#35524F);border:none;color:#fff">' +
      '<div style="font-size:40px">🔗</div>' +
      '<div style="font-size:16px;font-weight:800;margin-top:8px">香云纱数字孪生联动</div>' +
      '<div style="font-size:12px;opacity:.85;margin-top:6px">与 UE 虚拟引擎同学共建的虚实结合研学体验</div>' +
    '</div>' +
    '<div class="card"><div class="card-title"><span class="ct-left">📡 对接状态</span></div>' +
      '<div class="list-row"><div class="lr-ico">🖥️</div><div class="lr-main"><b>会话编号</b><span>' + (API.session_id || "未创建") + '</span></div></div>' +
      '<div class="list-row"><div class="lr-ico">🌐</div><div class="lr-main"><b>后端服务</b><span>' + (API.online ? "在线" : "离线") + '</span></div></div>' +
      '<div class="list-row"><div class="lr-ico">🎮</div><div class="lr-main"><b>UE4 虚拟引擎</b><span>通过 /api/ue/events 接口对接</span></div></div>' +
    '</div>' +
    '<div class="card"><div class="card-title"><span class="ct-left">🔁 已接收的联动事件</span><span class="ct-right">' + d.ueEvents.length + ' 条</span></div>' +
      (d.ueEvents.length ? d.ueEvents.map(function (e) {
        return '<div class="list-row"><div class="lr-ico">' + (e.operation_result === "correct" ? "✅" : "⚠️") + '</div>' +
          '<div class="lr-main"><b>' + e.task_id + '</b><span>' + e.operation_result + ' · ' + e.time + '</span></div></div>';
      }).join("") : '<div class="empty" style="padding:16px"><div class="d">暂无联动记录，等待 UE 虚拟引擎同学提交工艺操作结果</div></div>') +
    '</div>' +
    '<button class="btn btn-primary btn-block" id="ueSimulateBtn">模拟接收 UE 事件（演示）</button>';

  Nav.go("v-ue", { after: function () {
    $("#ueBody .back-btn").addEventListener("click", Nav.back);
    $("#ueSimulateBtn").addEventListener("click", function () {
      var taskIds = ["UE_CRAFT_001", "UE_CRAFT_002", "UE_CRAFT_003"];
      var t = taskIds[Math.floor(Math.random() * taskIds.length)];
      var result = Math.random() > 0.3 ? "correct" : "incorrect";
      var event = {
        event_id: "ue-demo-" + Date.now(),
        session_id: API.session_id || "YS-OFFLINE",
        task_id: t,
        point_id: "WORKSHOP",
        course_id: "YS_COURSE_001",
        operation_result: result
      };
      API.ueEvent(event).then(function () {
        d.ueEvents.push({ task_id: t, operation_result: result, time: new Date().toLocaleTimeString() });
        Store.save();
        unlockAchievement("ue_link");
        if (result === "correct") { d.user.xp += 15; Store.save(); renderStatus(); }
        Sound.success();
        confetti(30);
        toast("已接收 UE 联动事件", { ico: "🔗" });
        openUePanel();
      });
    });
  }});
}

/* ---------------------------------------------------------------- 游戏中心入口（由 game.js 实现） */
function openGames() {
  if (typeof GameHub !== "undefined") GameHub.open();
}

/* ---------------------------------------------------------------- 真实地图视图 */
function openRealMap() {
  Nav.go("v-map");            // 先切到地图视图（会触发 renderMap 重建，下方再覆盖为真实地图）
  var geo = YS_GEO;
  var ps = geo.points, keys = Object.keys(ps);

  // 投影：把所有点位（含基地中心）按真实经纬度映射到 1000x750 画布，留边距
  var lats = keys.map(function (k) { return ps[k].lat; }).concat([geo.center.lat]);
  var lngs = keys.map(function (k) { return ps[k].lng; }).concat([geo.center.lng]);
  var minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats);
  var minLng = Math.min.apply(null, lngs), maxLng = Math.max.apply(null, lngs);
  var padLat = (maxLat - minLat) * 0.34 || 0.001, padLng = (maxLng - minLng) * 0.34 || 0.001;
  minLat -= padLat; maxLat += padLat; minLng -= padLng; maxLng += padLng;

  var X0 = 70, X1 = 930, Y0 = 60, Y1 = 690;
  function proj(lat, lng) {
    var fx = (lng - minLng) / (maxLng - minLng);
    var fy = (maxLat - lat) / (maxLat - minLat);
    return { x: X0 + fx * (X1 - X0), y: Y0 + fy * (Y1 - Y0), fx: fx, fy: fy };
  }
  function at(lat, lng) { var p = proj(lat, lng); return { left: p.fx * 100, top: p.fy * 100 }; }

  var P = {}; keys.forEach(function (k) { P[k] = proj(ps[k].lat, ps[k].lng); });
  var C = proj(geo.center.lat, geo.center.lng);
  var r = P.RIVER, d = P.DRYING_FIELD, h = P.HALL, w = P.WORKSHOP, ct = C;

  // —— 景区手绘导览图（纯 SVG，离线可用，高精度绘制）——

  function treeAt(x, y, s) {
    s = s || 1;
    return '<g>' +
      '<ellipse cx="' + x + '" cy="' + (y + 11 * s) + '" rx="' + (14 * s) + '" ry="' + (6 * s) + '" fill="rgba(55,45,25,.16)"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (13 * s) + '" fill="#93A86B"/>' +
      '<circle cx="' + (x - 6 * s) + '" cy="' + (y - 4 * s) + '" r="' + (9 * s) + '" fill="#A6BA7C"/>' +
      '<circle cx="' + (x + 6 * s) + '" cy="' + (y - 3 * s) + '" r="' + (8 * s) + '" fill="#84995C"/>' +
      '<circle cx="' + (x) + '" cy="' + (y - 8 * s) + '" r="' + (6 * s) + '" fill="#B4C88B"/>' +
      '</g>';
  }

  function hallComplex(x, y) {
    var g = '<g filter="url(#softG)">';
    g += '<ellipse cx="' + x + '" cy="' + (y + 56) + '" rx="84" ry="26" fill="rgba(55,42,25,.18)"/>';
    g += '<rect x="' + (x - 76) + '" y="' + (y - 46) + '" width="152" height="104" rx="12" fill="#EEE2CB" stroke="#D8C7A6" stroke-width="2"/>';
    g += '<rect x="' + (x - 64) + '" y="' + (y - 34) + '" width="128" height="80" rx="7" fill="#E7D9BC"/>';
    g += '<rect x="' + (x - 46) + '" y="' + (y - 24) + '" width="92" height="54" rx="4" fill="url(#wallG)" stroke="#C9B48D" stroke-width="1.5"/>';
    g += '<path d="M ' + (x - 60) + ' ' + (y - 24) + ' L ' + (x - 46) + ' ' + (y - 50) + ' L ' + (x + 46) + ' ' + (y - 50) + ' L ' + (x + 60) + ' ' + (y - 24) + ' Z" fill="url(#roofG)" stroke="#7E2E23" stroke-width="1.5"/>';
    g += '<path d="M ' + (x - 46) + ' ' + (y - 50) + ' L ' + x + ' ' + (y - 66) + ' L ' + (x + 46) + ' ' + (y - 50) + ' Z" fill="#B5543E" stroke="#7E2E23" stroke-width="1.5"/>';
    g += '<line x1="' + (x - 48) + '" y1="' + (y - 50) + '" x2="' + (x + 48) + '" y2="' + (y - 50) + '" stroke="#F0D9B5" stroke-width="1.6"/>';
    g += '<rect x="' + (x - 12) + '" y="' + (y + 4) + '" width="24" height="26" rx="2" fill="#7E4A32"/>';
    g += '<rect x="' + (x - 37) + '" y="' + (y - 6) + '" width="15" height="15" rx="2" fill="#F6EAD6" stroke="#B99B6E"/>';
    g += '<rect x="' + (x + 22) + '" y="' + (y - 6) + '" width="15" height="15" rx="2" fill="#F6EAD6" stroke="#B99B6E"/>';
    g += '<circle cx="' + (x - 32) + '" cy="' + (y - 18) + '" r="3.6" fill="#D24B3A"/>';
    g += '<circle cx="' + (x + 32) + '" cy="' + (y - 18) + '" r="3.6" fill="#D24B3A"/>';
    g += '</g>';
    return g;
  }

  function workshopComplex(x, y) {
    var g = '<g filter="url(#softG)">';
    g += '<ellipse cx="' + x + '" cy="' + (y + 44) + '" rx="62" ry="20" fill="rgba(55,42,25,.18)"/>';
    g += '<rect x="' + (x - 50) + '" y="' + (y - 4) + '" width="100" height="44" rx="4" fill="#DFD0B4" stroke="#BFA979" stroke-width="1.5"/>';
    var n = 4, ww = 100 / n;
    for (var i = 0; i < n; i++) {
      var x0 = x - 50 + i * ww;
      g += '<path d="M ' + x0 + ' ' + (y - 4) + ' L ' + (x0 + ww) + ' ' + (y - 4) + ' L ' + (x0 + ww) + ' ' + (y - 18) + ' Z" fill="#8A6A48"/>';
    }
    g += '<rect x="' + (x + 28) + '" y="' + (y - 40) + '" width="11" height="28" rx="2" fill="#9E3B2F"/>';
    g += '<rect x="' + (x + 26) + '" y="' + (y - 42) + '" width="15" height="4" rx="1" fill="#7E2E23"/>';
    g += '<rect x="' + (x - 44) + '" y="' + (y + 52) + '" width="88" height="32" rx="13" fill="url(#waterG)" stroke="#6E9AA8" stroke-width="1.5"/>';
    g += '<path d="M ' + (x - 28) + ' ' + (y + 68) + ' q 9 -6 18 0 t 18 0" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.6"/>';
    g += '</g>';
    return g;
  }

  function fieldComplex(x, y) {
    var g = '<g filter="url(#softG)">';
    g += '<rect x="' + (x - 116) + '" y="' + (y - 84) + '" width="232" height="168" rx="26" fill="url(#lawnG)" stroke="#7E9358" stroke-width="1.5"/>';
    g += '<rect x="' + (x - 116) + '" y="' + (y - 84) + '" width="232" height="168" rx="26" fill="none" stroke="#6E8350" stroke-width="3" opacity=".28"/>';
    for (var rr = 0; rr < 4; rr++) {
      for (var cc2 = 0; cc2 < 2; cc2++) {
        var bx = x - 92 + cc2 * 102, by = y - 62 + rr * 36;
        g += '<rect x="' + bx + '" y="' + by + '" width="84" height="18" rx="4" fill="#C8A97E"/>';
        g += '<rect x="' + bx + '" y="' + by + '" width="84" height="6" rx="3" fill="#DBC29A"/>';
        g += '<line x1="' + (bx + 4) + '" y1="' + (by + 3) + '" x2="' + (bx + 80) + '" y2="' + (by + 3) + '" stroke="#A9805A" stroke-width="1"/>';
        g += '<line x1="' + (bx + 4) + '" y1="' + (by + 12) + '" x2="' + (bx + 80) + '" y2="' + (by + 12) + '" stroke="#B9976E" stroke-width=".8" opacity=".7"/>';
      }
    }
    g += '</g>';
    return g;
  }

  function pathD(pts) {
    var dd = 'M ' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      dd += ' Q ' + mx + ' ' + (my - 16) + ' ' + b[0] + ' ' + b[1];
    }
    return dd;
  }

  var roadDefs = [
    [[ct.x, ct.y], [h.x, h.y]],
    [[ct.x, ct.y], [w.x, w.y]],
    [[w.x, w.y], [r.x, r.y]],
    [[h.x, h.y], [d.x, d.y]],
    [[w.x, w.y], [d.x, d.y]]
  ];
  var roads = roadDefs.map(function (pts) {
    var pd = pathD(pts);
    return '<path d="' + pd + '" fill="none" stroke="#DCCBA6" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + pd + '" fill="none" stroke="#F0E6CD" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path class="road-dash" d="' + pd + '" fill="none" stroke="#C9B48D" stroke-width="1.6" stroke-dasharray="5 11" stroke-linecap="round"/>';
  }).join("");

  var riverP = 'M -30 ' + (r.y - 96) + ' C ' + (r.x - 150) + ' ' + (r.y - 80) + ', ' + (r.x - 96) + ' ' + (r.y + 4) + ', ' + r.x + ' ' + r.y +
    ' C ' + (r.x + 150) + ' ' + (r.y - 4) + ', ' + (r.x + 250) + ' ' + (r.y + 120) + ', 1030 ' + (r.y + 84);
  var river = '<path d="' + riverP + '" fill="none" stroke="#9BBDC6" stroke-width="58" stroke-linecap="round"/>' +
    '<path d="' + riverP + '" fill="none" stroke="url(#waterG)" stroke-width="46" stroke-linecap="round"/>' +
    '<path d="' + riverP + '" fill="none" stroke="rgba(255,255,255,.38)" stroke-width="2.2" stroke-dasharray="16 24" stroke-linecap="round"/>' +
    '<g transform="translate(' + r.x + ',' + r.y + ')">' +
    '<rect x="-30" y="-9" width="60" height="18" rx="7" fill="#CBA97B" stroke="#9A7A4E" stroke-width="1.5"/>' +
    '<line x1="-30" y1="0" x2="30" y2="0" stroke="#B08D5E" stroke-width="2"/>' +
    '<line x1="-22" y1="-9" x2="-22" y2="9" stroke="#B08D5E" stroke-width="1.5"/>' +
    '<line x1="22" y1="-9" x2="22" y2="9" stroke="#B08D5E" stroke-width="1.5"/>' +
    '</g>';

  var paddies =
    '<g opacity=".55">' +
    '<polygon points="20,70 210,46 262,168 60,196" fill="#E2E6C2" stroke="#C4CF98" stroke-width="1.5"/>' +
    '<polygon points="250,60 420,40 470,150 300,172" fill="#DDE2B8" stroke="#BFCB92" stroke-width="1.5"/>' +
    '<polygon points="760,560 980,520 1000,700 800,720" fill="#E2E6C2" stroke="#C4CF98" stroke-width="1.5"/>' +
    '<polygon points="30,560 200,540 240,700 50,720" fill="#DDE2B8" stroke="#BFCB92" stroke-width="1.5"/>' +
    '</g>' +
    '<g stroke="#CBD3A6" stroke-width="1" opacity=".5">' +
    '<line x1="20" y1="110" x2="240" y2="90"/><line x1="40" y1="140" x2="255" y2="120"/>' +
    '<line x1="760" y1="620" x2="995" y2="590"/><line x1="780" y1="660" x2="1000" y2="640"/>' +
    '</g>';

  var trees = [
    treeAt(120, 150, 1.15), treeAt(175, 205, .95), treeAt(95, 300, 1.2), treeAt(150, 350, .9),
    treeAt(300, 120, 1.0), treeAt(360, 210, .85), treeAt(880, 330, 1.1), treeAt(820, 400, .95),
    treeAt(150, 470, 1.0), treeAt(560, 500, .9), treeAt(650, 470, 1.05), treeAt(700, 540, .85),
    treeAt(430, 300, .8), treeAt(560, 220, .85), treeAt(320, 560, .9), treeAt(880, 560, .95)
  ].join("");

  var svg =
    '<svg viewBox="0 0 1000 750" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">' +
    '<defs>' +
    '<linearGradient id="terrG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5EFDD"/><stop offset=".55" stop-color="#EDE3CC"/><stop offset="1" stop-color="#E2D3B6"/></linearGradient>' +
    '<radialGradient id="vigG" cx="50%" cy="46%" r="72%"><stop offset="55%" stop-color="rgba(60,42,25,0)"/><stop offset="100%" stop-color="rgba(60,42,25,.22)"/></radialGradient>' +
    '<linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A7CBD4"/><stop offset="1" stop-color="#7BA6B4"/></linearGradient>' +
    '<linearGradient id="lawnG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B7CB8C"/><stop offset="1" stop-color="#9DB675"/></linearGradient>' +
    '<linearGradient id="roofG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C05A44"/><stop offset="1" stop-color="#8E3226"/></linearGradient>' +
    '<linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7EEDB"/><stop offset="1" stop-color="#E9DABE"/></linearGradient>' +
    '<filter id="softG" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#3A2A19" flood-opacity=".18"/></filter>' +
    '</defs>' +
    '<rect x="0" y="0" width="1000" height="750" fill="url(#terrG)"/>' +
    '<g opacity=".5">' +
    '<circle cx="140" cy="90" r="1.4" fill="#D9C9A6"/><circle cx="320" cy="64" r="1.2" fill="#D9C9A6"/><circle cx="520" cy="110" r="1.3" fill="#D9C9A6"/>' +
    '<circle cx="720" cy="70" r="1.2" fill="#D9C9A6"/><circle cx="900" cy="120" r="1.4" fill="#D9C9A6"/><circle cx="240" cy="300" r="1.2" fill="#D9C9A6"/>' +
    '<circle cx="660" cy="330" r="1.3" fill="#D9C9A6"/><circle cx="120" cy="600" r="1.4" fill="#D9C9A6"/><circle cx="500" cy="690" r="1.2" fill="#D9C9A6"/>' +
    '<circle cx="860" cy="660" r="1.4" fill="#D9C9A6"/>' +
    '</g>' +
    paddies +
    river +
    roads +
    fieldComplex(d.x, d.y) +
    hallComplex(h.x, h.y) +
    workshopComplex(w.x, w.y) +
    trees +
    '<g transform="translate(928,664)">' +
    '<circle r="30" fill="rgba(255,255,255,.9)" stroke="#C9B79A" stroke-width="2"/>' +
    '<circle r="23" fill="none" stroke="#E0D3B8" stroke-width="1"/>' +
    '<path d="M0 -19 L6 3 L0 -2 L-6 3 Z" fill="#9E3B2F"/>' +
    '<path d="M0 19 L4 1 L0 4 L-4 1 Z" fill="#C0AF90"/>' +
    '<text y="-36" text-anchor="middle" font-size="12" font-weight="800" fill="#7E2E23">N</text>' +
    '</g>' +
    '<g transform="translate(72,716)">' +
    '<rect x="-8" y="-14" width="186" height="20" rx="6" fill="rgba(255,255,255,.78)"/>' +
    '<line x1="0" y1="0" x2="166" y2="0" stroke="#83533B" stroke-width="2.6"/>' +
    '<line x1="0" y1="-5" x2="0" y2="5" stroke="#83533B" stroke-width="2.6"/>' +
    '<line x1="83" y1="-5" x2="83" y2="5" stroke="#83533B" stroke-width="2.4"/>' +
    '<line x1="166" y1="-5" x2="166" y2="5" stroke="#83533B" stroke-width="2.6"/>' +
    '<text x="0" y="-6" font-size="11" fill="#6B574A">0</text>' +
    '<text x="150" y="-6" font-size="11" fill="#6B574A">约200米</text>' +
    '</g>' +
    '<rect x="0" y="0" width="1000" height="750" fill="url(#vigG)" pointer-events="none"/>' +
    '</svg>';

  // 点位标记（圆形徽章，按真实经纬度定位）
  var PMETA = {
    HALL: { ch: "馆", pc: "#9E3B2F" },
    WORKSHOP: { ch: "坊", pc: "#83533B" },
    DRYING_FIELD: { ch: "场", pc: "#6E8B4E" },
    RIVER: { ch: "河", pc: "#5F93A6" }
  };
  var markers = keys.map(function (k) {
    var p = ps[k], c = at(p.lat, p.lng), m = PMETA[k] || { ch: "点", pc: "#83533B" };
    return '<div class="map-pin' + (c.left > 72 ? ' flip' : '') + '" data-point="' + k + '" style="left:' + c.left + '%;top:' + c.top + '%;--pc:' + m.pc + '">' +
      '<div class="mp-badge">' + m.ch + '</div>' +
      '<div class="mp-label">' + p.name + '</div></div>';
  }).join("");
  var cc = at(geo.center.lat, geo.center.lng);
  var centerMark = '<div class="map-center" style="left:' + cc.left + '%;top:' + cc.top + '%"><div class="mc-pulse"></div><div class="mc-dot"></div><div class="mc-label">基地中心</div></div>';

  $("#mapBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>香云纱非遗园区</h2></div>' +
    '<div style="font-size:12px;color:var(--ink-3);margin-bottom:10px;text-align:center">' + geo.region + ' · 手绘导览图（点位按真实经纬度定位）</div>' +
    '<div class="map-stage" id="mapStage">' +
      '<div class="map-zoom" id="mapZoom">' + svg + markers + centerMark + '</div>' +
      '<div class="map-legend">' +
        '<span><i class="lg lg-hall"></i>主馆</span><span><i class="lg lg-work"></i>工作坊</span>' +
        '<span><i class="lg lg-field"></i>晒莨场</span><span><i class="lg lg-river"></i>河涌</span>' +
        '<span><i class="lg lg-route"></i>游览路线</span>' +
      '</div>' +
      '<div class="map-controls">' +
        '<button class="icon-btn" id="realZoomIn">＋</button>' +
        '<button class="icon-btn" id="realZoomOut">－</button>' +
        '<button class="icon-btn" id="realReset">⟲</button>' +
      '</div>' +
    '</div>' +
    '<div style="margin-top:14px" class="card">' +
      '<div class="card-title"><span class="ct-left">📍 点位坐标（真实经纬度）</span></div>' +
      keys.map(function (k) {
        var p = ps[k];
        return '<div class="list-row" data-point="' + k + '" style="cursor:pointer">' +
          '<div class="lr-ico">📍</div>' +
          '<div class="lr-main"><b>' + p.name + '</b><span>' + p.lat.toFixed(5) + '°N, ' + p.lng.toFixed(5) + '°E</span></div>' +
          '<span class="lr-arrow">›</span></div>';
      }).join("") +
    '</div>' +
    '<button class="btn btn-ghost btn-block" id="realBackToMap">返回手绘地图</button>';

  // 绑定事件
  $("#mapBody .back-btn").addEventListener("click", function () { Nav.back(); });
  $("#realBackToMap").addEventListener("click", function () { Nav.go("v-map"); });

  // 缩放 + 拖拽平移
  var stage = $("#mapStage"), zoomEl = $("#mapZoom");
  var scale = 1, tx = 0, ty = 0;
  function applyT() { zoomEl.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")"; zoomEl.style.setProperty("--z", scale); }
  function clampPan() {
    var b = stage.getBoundingClientRect();
    var mx = b.width * (scale - 1) / 2, my = b.height * (scale - 1) / 2;
    tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
  }
  $("#realZoomIn").addEventListener("click", function () { scale = Math.min(3, scale * 1.3); if (scale <= 1.01) { scale = 1; tx = 0; ty = 0; } clampPan(); applyT(); });
  $("#realZoomOut").addEventListener("click", function () { scale = Math.max(1, scale / 1.3); if (scale <= 1.01) { scale = 1; tx = 0; ty = 0; } clampPan(); applyT(); });
  $("#realReset").addEventListener("click", function () { scale = 1; tx = 0; ty = 0; applyT(); });

  var down = false, moved = false, sx = 0, sy = 0, stx = 0, sty = 0;
  stage.addEventListener("pointerdown", function (e) { if (scale <= 1.01) return; down = true; moved = false; sx = e.clientX; sy = e.clientY; stx = tx; sty = ty; });
  stage.addEventListener("pointermove", function (e) {
    if (!down) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) { moved = true; try { stage.setPointerCapture(e.pointerId); } catch (_) {} stage.classList.add("grabbing"); }
    if (moved) { tx = stx + dx; ty = sty + dy; clampPan(); applyT(); }
  });
  function endDrag() { if (moved) stage.classList.remove("grabbing"); down = false; moved = false; }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  $$("#mapBody .map-pin").forEach(function (m) {
    m.addEventListener("click", function () { openPoint(m.dataset.point); });
  });
  $$("#mapBody .list-row").forEach(function (r) {
    r.addEventListener("click", function () { if (r.dataset.point) openPoint(r.dataset.point); });
  });
}

/* ---------------------------------------------------------------- 老师端（教学管理）
   说明：本应用为本地单机版，仅记录「当前登录账号」的真实进度。
   班级级数据（全班学员、校级统计）需接入教学管理系统后才有，
   因此一律以真实本地数据呈现，不编造任何学员或统计。 */
/* ---------------------------------------------------------------- 研学数据看板（教学管理端）
   定位：单机版的数据查看与汇总工具，不模拟班级、不生成任何虚构学员。
   数据仅来自：① 本机账号真实学习记录 ② 老师主动导入的真实导出文件。
   多机数据可通过「导出 → 导入」真实汇总成班级视图。
   ---------------------------------------------------------------- */
var TeacherTab = "overview";

/* 当前账号的可导出记录：只包含真实产生的字段 */
function teacherOwnRecord() {
  var d = Store.data;
  var games = 0, g = d.games || {};
  Object.keys(g).forEach(function (k) { games += (g[k] || []).length; });
  return {
    kind: "yunsha_record_v1",
    exportedAt: new Date().toISOString(),
    name: d.user.name || "研学学员",
    school: d.user.school || "",
    joined: d.user.joined || "",
    xp: Store.roundNum(d.user.xp),
    coins: Store.roundNum(d.user.coins),
    level: levelInfo(d.user.xp).cur.lv,
    tasksDone: tasksCompleted(),
    taskTotal: YS_TASKS.length,
    taskScores: d.taskScores || {},
    pointsDone: Object.keys(d.pointsDone || {}).length,
    knowRead: Object.keys(d.knowRead || {}).length,
    achievements: Object.keys(d.achievements || {}).length,
    checkinTotal: d.checkin.total,
    checkinStreak: d.checkin.streak,
    games: games
  };
}

function teacherRoster() { return (Store.data.classRoster || []).slice(); }

function renderTeacher() {
  var d = Store.data;
  var tabs = ["数据总览", "学习明细", "成绩记录", "内容清单", "数据工具"];
  var li = levelInfo(d.user.xp);
  var roster = teacherRoster();

  $("#teacherBody").innerHTML =
    '<div class="page-head"><div><h1>研学数据看板</h1><div class="sub">本机真实记录 · 可导出汇总</div></div>' +
    '<button class="icon-btn" id="teacherSettingsBtn">⚙️</button></div>' +

    '<div class="card" style="background:linear-gradient(160deg,#6B4430,var(--brand-d));border:none;color:#fff">' +
      '<div style="display:flex;align-items:center;gap:14px">' +
        '<div style="font-size:36px">📊</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:16px;font-weight:800">' + esc(d.user.name || "研学学员") + '</div>' +
          '<div style="font-size:12px;opacity:.85;margin-top:4px">' + (d.user.school || "未填写学校/班级") + ' · 加入 ' + esc(d.user.joined || "—") + '</div>' +
        '</div>' +
        '<span class="tag" style="background:rgba(255,255,255,.18);color:#fff;border:none">Lv.' + li.cur.lv + '</span>' +
      '</div>' +
      '<div style="display:flex;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.15)">' +
        '<div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:800">' + Store.roundNum(d.user.xp) + '</div><div style="font-size:11px;opacity:.8">累计积分</div></div>' +
        '<div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:800">' + tasksCompleted() + '/' + YS_TASKS.length + '</div><div style="font-size:11px;opacity:.8">研学任务</div></div>' +
        '<div style="flex:1;text-align:center"><div style="font-size:20px;font-weight:800">' + roster.length + '</div><div style="font-size:11px;opacity:.8">已导入记录</div></div>' +
      '</div>' +
    '</div>' +

    '<div class="know-cat-tabs">' +
      tabs.map(function (t) {
        return '<button class="chip ' + (TeacherTab === t ? 'chip-brand on' : '') + '" data-tab="' + t + '">' + t + '</button>';
      }).join("") +
    '</div>' +
    '<div id="teacherPanelBody"></div>';

  $("#teacherSettingsBtn").addEventListener("click", renderSettings);
  $$("#teacherBody .chip").forEach(function (c) {
    c.addEventListener("click", function () { TeacherTab = c.dataset.tab; renderTeacher(); });
  });
  renderTeacherPanel();
}

function renderTeacherPanel() {
  var box = $("#teacherPanelBody");
  var d = Store.data;
  var li = levelInfo(d.user.xp);
  var done = tasksCompleted();
  var readIds = Object.keys(d.knowRead || {}).filter(function (k) { return !!d.knowRead[k]; });
  var achIds = Object.keys(d.achievements || {});
  var lvPct = li.next ? Math.round((d.user.xp - li.cur.xp) / (li.next.xp - li.cur.xp) * 100) : 100;

  if (TeacherTab === "数据总览") {
    var gamesTotal = 0;
    Object.keys(d.games || {}).forEach(function (k) { gamesTotal += (d.games[k] || []).length; });
    box.innerHTML =
      '<div class="card"><div class="card-title"><span class="ct-left">📊 本机学习数据</span><span class="ct-right">实时</span></div>' +
        '<div style="font-size:12px;color:var(--ink-3);line-height:1.7;margin-bottom:12px">以下数字全部取自本机真实学习记录，不做任何推测或补全。</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">' +
          '<div class="rs-stat"><b>' + done + '/' + YS_TASKS.length + '</b><span>任务完成</span></div>' +
          '<div class="rs-stat"><b>' + Object.keys(d.pointsDone || {}).length + '/' + YS_POINTS.length + '</b><span>点位打卡</span></div>' +
          '<div class="rs-stat"><b>' + readIds.length + '/' + YS_KNOWLEDGE.length + '</b><span>知识已读</span></div>' +
          '<div class="rs-stat"><b>' + achIds.length + '</b><span>成就解锁</span></div>' +
          '<div class="rs-stat"><b>' + d.checkin.total + '</b><span>累计签到</span></div>' +
          '<div class="rs-stat"><b>' + gamesTotal + '</b><span>游戏局数</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="card"><div class="card-title"><span class="ct-left">🎯 等级进度</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px"><span>Lv.' + li.cur.lv + ' ' + li.cur.name + '</span><span style="color:var(--ink-3)">' + Store.roundNum(d.user.xp) + ' 积分 · 🪙 ' + Store.roundNum(d.user.coins) + '</span></div>' +
        '<div class="pbar gold"><i style="width:' + lvPct + '%"></i></div>' +
      '</div>' +
      teacherClassSummary();
  } else if (TeacherTab === "学习明细") {
    box.innerHTML =
      '<div class="card"><div class="card-title"><span class="ct-left">📋 研学任务明细</span><span class="ct-right">' + done + '/' + YS_TASKS.length + '</span></div>' +
        YS_TASKS.map(function (t) {
          var ok = !!d.tasksDone[t.id];
          return '<div class="list-row"><div class="lr-ico">' + (ok ? '✅' : '⏳') + '</div>' +
            '<div class="lr-main"><b>' + esc(t.title) + '</b><span>' + (ok ? '已完成 · ' + (d.taskScores[t.id] || t.score) + ' 分' : '未完成') + '</span></div></div>';
        }).join("") +
      '</div>' +
      '<div class="card"><div class="card-title"><span class="ct-left">📍 点位打卡</span></div>' +
        YS_POINTS.map(function (p) {
          var ok = !!d.pointsDone[p.id];
          return '<div class="list-row"><div class="lr-ico">' + (ok ? '✅' : '⏳') + '</div>' +
            '<div class="lr-main"><b>' + esc(p.name) + '</b><span>' + (ok ? '已打卡' : '未打卡') + '</span></div></div>';
        }).join("") +
      '</div>' +
      '<div class="card"><div class="card-title"><span class="ct-left">📖 知识阅读</span><span class="ct-right">' + readIds.length + ' 条</span></div>' +
        (readIds.length
          ? readIds.map(function (id) {
              var k = YS_KNOWLEDGE.filter(function (x) { return x.id === id; })[0];
              return '<div class="list-row"><div class="lr-ico">📄</div><div class="lr-main"><b>' + esc(k ? k.title : id) + '</b><span>已阅读</span></div></div>';
            }).join("")
          : '<div class="empty" style="padding:16px"><div class="d">还没有阅读记录</div></div>') +
      '</div>' +
      '<div class="card"><div class="card-title"><span class="ct-left">📅 签到记录</span><span class="ct-right">' + (d.checkin.dates || []).length + ' 天</span></div>' +
        ((d.checkin.dates || []).length
          ? '<div style="font-size:12px;color:var(--ink-2);line-height:1.9">' + d.checkin.dates.slice(-14).map(esc).join('　') + '</div>'
          : '<div class="empty" style="padding:16px"><div class="d">还没有签到记录</div></div>') +
      '</div>';
  } else if (TeacherTab === "成绩记录") {
    var all = [];
    var names = { quiz: "知识问答", mud: "涂河泥", rhythm: "煮绸节拍", sort: "工序排序", memory: "翻牌记忆", lane: "晒莨节奏" };
    Object.keys(d.games || {}).forEach(function (k) {
      (d.games[k] || []).forEach(function (g) {
        all.push({ name: names[k] || k, date: g.date || "—", score: g.score || 0 });
      });
    });
    all.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    var radar = calcRadar();
    box.innerHTML =
      '<div class="card"><div class="card-title"><span class="ct-left">📈 能力维度（按真实记录计算）</span></div>' +
        Object.keys(radar).map(function (k) {
          return '<div style="margin-top:10px"><div style="display:flex;justify-content:space-between;font-size:12px"><span>' + k + '</span><span style="color:var(--ink-3)">' + radar[k] + '%</span></div>' +
            '<div class="pbar gold"><i style="width:' + radar[k] + '%"></i></div></div>';
        }).join("") +
      '</div>' +
      '<div class="card"><div class="card-title"><span class="ct-left">🎮 游戏成绩</span><span class="ct-right">' + all.length + ' 局</span></div>' +
        (all.length
          ? all.slice(0, 20).map(function (g) {
              return '<div class="list-row"><div class="lr-ico">🎮</div><div class="lr-main"><b>' + g.name + '</b><span>' + esc(g.date) + '</span></div>' +
                '<div style="font-weight:800;color:var(--amber)">' + g.score + '</div></div>';
            }).join("")
          : '<div class="empty" style="padding:20px"><div class="ico">🎮</div><div class="t">暂无游戏记录</div><div class="d">完成小游戏后，成绩会真实记录在这里</div></div>') +
      '</div>';
  } else if (TeacherTab === "内容清单") {
    var counts = [
      ["研学点位", YS_POINTS.length], ["研学任务", YS_TASKS.length], ["工艺知识", YS_KNOWLEDGE.length],
      ["百科章节", YS_ENCYCLOPEDIA.length], ["知识题库", YS_QUIZ.length], ["非遗故事", YS_STORIES.length],
      ["传承人", YS_MASTERS.length], ["成就徽章", YS_ACHIEVEMENTS.length]
    ];
    box.innerHTML =
      '<div class="card"><div class="card-title"><span class="ct-left">📚 本地内置内容</span></div>' +
        '<div style="font-size:12px;color:var(--ink-3);line-height:1.7;margin-bottom:12px">以下数量来自程序内置数据文件，均为真实条目，可直接核对。</div>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">' +
          counts.map(function (c) { return '<div class="rs-stat"><b>' + c[1] + '</b><span>' + c[0] + '</span></div>'; }).join("") +
        '</div>' +
      '</div>' +
      '<div class="card"><div class="card-title"><span class="ct-left">📖 知识条目</span></div>' +
        YS_KNOWLEDGE.map(function (k) {
          return '<div class="list-row"><div class="lr-ico">📄</div><div class="lr-main"><b>' + esc(k.title) + '</b><span>' + esc(k.category) + '</span></div></div>';
        }).join("") +
      '</div>';
  } else if (TeacherTab === "数据工具") {
    box.innerHTML =
      '<div class="card"><div class="card-title"><span class="ct-left">🧰 数据导出与汇总</span></div>' +
        '<div style="font-size:12px;color:var(--ink-2);line-height:1.8;margin-bottom:14px">' +
          '本机为单机版，数据保存在当前浏览器。老师可让每位学生点「导出我的研学记录」得到 JSON 文件，' +
          '再在本端逐份导入，即可真实汇总成班级数据——不会凭空生成任何学员。' +
        '</div>' +
        '<button class="btn btn-primary btn-block" id="teacherExportBtn" style="margin-bottom:10px">⬇ 导出我的研学记录（JSON）</button>' +
        '<button class="btn btn-ghost btn-block" id="teacherImportBtn">⬆ 导入学生记录（可多份）</button>' +
        '<input type="file" id="teacherImportFile" accept="application/json,.json" multiple style="display:none">' +
      '</div>' +
      teacherClassSummary() +
      '<div class="card"><div class="card-title"><span class="ct-left">ℹ️ 数据说明</span></div>' +
        '<div style="font-size:12px;color:var(--ink-2);line-height:1.9">' +
          '· 积分、任务、打卡、签到、成就、游戏成绩均来自本机实际操作。<br>' +
          '· 班级视图只显示你导入的真实文件，未导入时为空。<br>' +
          '· 照片来自公开报道的纪实摄影，仅用于教学演示。<br>' +
          '· 清除浏览器数据会同时清除本机学习记录，建议先导出备份。' +
        '</div>' +
      '</div>';

    $("#teacherExportBtn").addEventListener("click", teacherExportRecord);
    $("#teacherImportBtn").addEventListener("click", function () { $("#teacherImportFile").click(); });
    $("#teacherImportFile").addEventListener("change", teacherImportFiles);
  }
}

/* 班级汇总：只展示真实导入的记录 */
function teacherClassSummary() {
  var roster = teacherRoster();
  if (!roster.length) {
    return '<div class="card" style="background:linear-gradient(135deg,var(--brand-soft),var(--gold-soft));border:none">' +
      '<div style="font-size:13px;color:var(--ink-2);line-height:1.8">📌 暂无班级汇总数据。本端不会自动编造学员名单；导入学生导出的记录后，这里才会出现真实的班级表格。</div></div>';
  }
  var totalXp = roster.reduce(function (a, r) { return a + (r.xp || 0); }, 0);
  return '<div class="card"><div class="card-title"><span class="ct-left">👥 班级汇总（来自导入文件）</span><span class="ct-right">' + roster.length + ' 份</span></div>' +
    '<div style="display:flex;gap:10px;margin-bottom:12px">' +
      '<div class="rs-stat"><b>' + roster.length + '</b><span>学生记录</span></div>' +
      '<div class="rs-stat"><b>' + Math.round(totalXp / roster.length) + '</b><span>平均积分</span></div>' +
      '<div class="rs-stat"><b>' + roster.filter(function (r) { return r.tasksDone >= r.taskTotal; }).length + '</b><span>全任务完成</span></div>' +
    '</div>' +
    roster.map(function (r) {
      return '<div class="list-row"><div class="lr-ico">👤</div>' +
        '<div class="lr-main"><b>' + esc(r.name) + '</b><span>' + esc(r.school || "未填写学校") + ' · ' + (r.tasksDone || 0) + '/' + (r.taskTotal || YS_TASKS.length) + ' 任务</span></div>' +
        '<div style="font-weight:800;color:var(--amber)">' + (r.xp || 0) + '</div></div>';
    }).join("") +
    '<button class="btn btn-ghost btn-block" id="teacherClearRoster" style="margin-top:12px;color:var(--red)">清空已导入记录</button>' +
    '</div>';
}

function teacherExportRecord() {
  var rec = teacherOwnRecord();
  try {
    var blob = new Blob([JSON.stringify(rec, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "研学记录_" + (rec.name || "学员") + "_" + ds() + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
    toast("已导出研学记录", { ico: "⬇" });
  } catch (e) { toast("导出失败：" + e.message, { ico: "⚠️" }); }
}

function teacherImportFiles(e) {
  var files = Array.prototype.slice.call(e.target.files || []);
  if (!files.length) return;
  var pending = files.length, ok = 0;
  files.forEach(function (f) {
    var fr = new FileReader();
    fr.onload = function () {
      try {
        var obj = JSON.parse(fr.result);
        if (obj && obj.kind === "yunsha_record_v1" && typeof obj.name === "string") {
          var roster = Store.data.classRoster || (Store.data.classRoster = []);
          var dup = roster.some(function (r) { return r.name === obj.name && r.exportedAt === obj.exportedAt; });
          if (!dup) { roster.push(obj); ok++; }
        }
      } catch (err) {}
      pending--;
      if (pending === 0) {
        Store.save();
        e.target.value = "";
        toast(ok ? ("成功导入 " + ok + " 份真实记录") : "未识别到有效的研学记录文件", { ico: ok ? "✅" : "⚠️" });
        renderTeacher();
      }
    };
    fr.onerror = function () {
      pending--;
      if (pending === 0) { e.target.value = ""; renderTeacher(); }
    };
    fr.readAsText(f, "utf-8");
  });
}

/* 事件委托：清空已导入记录（列表是动态生成的） */
document.addEventListener("click", function (e) {
  if (e.target && e.target.id === "teacherClearRoster") {
    Store.data.classRoster = [];
    Store.save();
    renderTeacher();
    toast("已清空导入记录", { ico: "🗑" });
  }
});
/* ---------------------------------------------------------------- 地图3D入口（map3d.js 中实现 Map3D.open） */
function openMap3D() {
  if (typeof Map3D !== "undefined") Map3D.open();
}
