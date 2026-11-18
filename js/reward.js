/* ==========================================================================
   莨珠记 · 云纱智境 —— 奖励系统页面
   商店 / 盲盒 / 签到日历 / 头像 / 头像框 / 称号 / 收藏 / 成就详情 / 分享卡
   ========================================================================== */
"use strict";

/* ---------------------------------------------------------------- 商店 */
var ShopTab = "all";

function renderShop() {
  var d = Store.data;
  var cats = [
    { k: "all", label: "全部" },
    { k: "decor", label: "头像装饰" },
    { k: "theme", label: "主题" },
    { k: "title", label: "称号" }
  ];
  var list = YS_SHOP.filter(function (it) { return ShopTab === "all" || it.type === ShopTab; });
  var cur = d.equippedTheme || "";

  // 主题类：额外提供「茶褐原色」默认主题卡（永远可用，用于恢复原样）
  var defaultCard = "";
  if (ShopTab === "all" || ShopTab === "theme") {
    defaultCard = '<div class="shop-item card" style="text-align:center;margin:0">' +
      '<div class="shop-sw" style="background:linear-gradient(135deg,#83533B,#D9AD71)"></div>' +
      '<b style="font-size:13px;display:block">主题·茶褐原色</b>' +
      '<div style="font-size:11px;color:var(--ink-3);margin:4px 0 10px">香云纱默认配色</div>' +
      '<button class="btn btn-sm ' + (cur === "" ? 'btn-ghost' : 'btn-soft') + ' btn-block" data-use="" ' + (cur === "" ? 'disabled' : '') + '>' +
        (cur === "" ? '✓ 使用中' : '点击使用') + '</button></div>';
  }

  $("#shopBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>传承商店</h2></div>' +
    '<div class="card" style="display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,var(--gold-soft),var(--brand-soft));border:none">' +
      '<span style="font-size:13px;color:var(--ink-2)">我的传承币</span>' +
      '<span style="font-weight:850;color:var(--amber);font-size:20px">🪙 ' + (d.user.coins || 0) + '</span></div>' +
    '<div class="know-cat-tabs">' +
      cats.map(function (c) { return '<button class="chip ' + (ShopTab === c.k ? 'chip-brand on' : '') + '" data-cat="' + c.k + '">' + c.label + '</button>'; }).join("") +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      defaultCard +
      list.map(function (it) {
        var owned = (d.inventory || []).indexOf(it.id) >= 0;
        var isTheme = it.type === "theme";
        var using = isTheme && owned && cur === it.id;
        // 主题类已拥有 → 变成「使用」开关；未拥有 → 购买
        var label, cls, dis = "", attr;
        if (isTheme && owned) {
          label = using ? "✓ 使用中" : "点击使用";
          cls = using ? "btn-ghost" : "btn-soft";
          dis = using ? "disabled" : "";
          attr = 'data-use="' + it.id + '"';
        } else {
          label = owned ? "已拥有" : "🪙 " + it.price;
          cls = owned ? "btn-ghost" : "btn-gold";
          dis = owned ? "disabled" : "";
          attr = 'data-buy="' + it.id + '"';
        }
        var thumb = (isTheme && it.sw)
          ? '<div class="shop-sw" style="background:linear-gradient(135deg,' + it.sw[0] + ',' + it.sw[1] + ')"></div>'
          : '<div style="font-size:40px;margin-bottom:8px">' + it.ico + '</div>';
        return '<div class="shop-item card" style="text-align:center;margin:0' + (using ? ';box-shadow:0 0 0 2px var(--gold) inset' : '') + '">' +
          thumb +
          '<b style="font-size:13px;display:block">' + it.name + '</b>' +
          '<div style="font-size:11px;color:var(--ink-3);margin:4px 0 10px">' + it.desc + '</div>' +
          '<button class="btn btn-sm ' + cls + ' btn-block" ' + attr + ' ' + dis + '>' + label + '</button></div>';
      }).join("") +
    '</div>' +
    (ShopTab === "all" || ShopTab === "theme"
      ? '<div class="card" style="margin-top:14px;background:var(--brand-soft);border:none"><div style="font-size:12px;color:var(--ink-2);line-height:1.75">🎨 主题会即时应用到整个 App（配色、卡片、按钮、状态栏）。也可以在「我的 → 设置 → 主题外观」里随时切换。</div></div>'
      : '') +
    '<button class="btn btn-ghost btn-block" id="shopInventoryBtn" style="margin-top:16px">查看我的收藏</button>';

  Nav.go("v-shop", { after: function () {
    $("#shopBody .back-btn").addEventListener("click", Nav.back);
    $$("#shopBody .chip").forEach(function (c) {
      c.addEventListener("click", function () { ShopTab = c.dataset.cat; renderShop(); });
    });
    $$("#shopBody [data-buy]").forEach(function (b) {
      b.addEventListener("click", function () { buyShopItem(b.dataset.buy); });
    });
    $$("#shopBody [data-use]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (useTheme(b.dataset.use)) renderShop();
      });
    });
    $("#shopInventoryBtn").addEventListener("click", renderInventory);
  }});
}

function buyShopItem(id) {
  var d = Store.data;
  var it = YS_SHOP.filter(function (x) { return x.id === id; })[0];
  if (!it) return;
  if ((d.inventory || []).indexOf(id) >= 0) { toast("已拥有该商品", { ico: "✅" }); return; }
  if ((d.user.coins || 0) < it.price) { toast("传承币不足，去完成任务或开盲盒吧", { ico: "😅" }); Sound.fail(); return; }
  d.user.coins -= it.price;
  d.inventory.push(id);
  if (it.type === "theme") { d.equippedTheme = id; }
  if (it.type === "decor") { d.avatar = id; d.customAvatar = ""; }
  if (it.type === "title") {
    var map = { title_master: "ti_master", title_legend: "ti_legend" };
    var tid = map[id] || "ti_none";
    if (d.ownedTitles.indexOf(tid) < 0) d.ownedTitles.push(tid);
    d.title = tid;
  }
  Store.save();
  renderStatus();
  if (it.type === "theme") { try { applyTheme(); } catch (e) { console.warn(e); } }
  Sound.coin();
  var msg = it.type === "decor" ? ("购买成功 · 已装备「" + it.name + "」")
          : it.type === "theme" ? ("购买成功 · 已应用「" + it.name + "」主题")
          : ("购买成功 · " + it.name);
  toast(msg, { ico: "🛒" });
  unlockAchievement("shop_1");
  renderShop();
}

/* ---------------------------------------------------------------- 主题外观选择 */
function renderThemePicker() {
  var d = Store.data;
  var cur = d.equippedTheme || "";
  var body = '<div style="font-size:12px;color:var(--ink-3);line-height:1.7;margin-bottom:12px">主题会即时应用整站配色，「泥金」「草绿」需在传承商店购买后解锁。</div>' +
    YS_THEMES.map(function (t) {
      var owned = !t.id || (d.inventory || []).indexOf(t.id) >= 0;
      var on = cur === t.id;
      return '<div class="theme-pick" data-theme-id="' + t.id + '" data-owned="' + (owned ? "1" : "0") + '" ' +
        'style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:16px;margin-bottom:10px;border:1px solid ' + (on ? 'var(--brand)' : 'var(--line)') + ';background:var(--card);' + (on ? 'box-shadow:0 0 0 2px var(--gold) inset;' : '') + (owned ? '' : 'opacity:.62;') + '">' +
        '<div style="width:52px;height:52px;border-radius:14px;flex:none;background:linear-gradient(135deg,' + t.sw[0] + ',' + t.sw[1] + ');box-shadow:inset 0 0 0 1px rgba(255,255,255,.35)"></div>' +
        '<div style="flex:1;min-width:0">' +
          '<b style="font-size:14px;display:block">' + t.name + (on ? ' <span style="font-size:10px;font-weight:700;color:#fff;background:var(--brand);padding:1px 7px;border-radius:8px;vertical-align:2px">使用中</span>' : '') + '</b>' +
          '<span style="font-size:11px;color:var(--ink-3)">' + t.desc + '</span>' +
        '</div>' +
        (owned
          ? (on ? '<span style="font-size:12px;color:var(--green);font-weight:800">✓</span>'
                : '<span style="font-size:12px;color:var(--brand);font-weight:800">使用 ›</span>')
          : '<span style="font-size:11px;color:var(--ink-3);font-weight:700">🔒 未解锁</span>') +
      '</div>';
    }).join("");

  Sheet.open({
    title: "🎨 主题外观",
    body: body,
    foot: '<button class="btn btn-ghost btn-block" id="themeGoShop">前往传承商店</button>',
    onMount: function () {
      $$(".theme-pick").forEach(function (el) {
        el.addEventListener("click", function () {
          var id = el.dataset.themeId;
          if (el.dataset.owned !== "1") { Sheet.close(); setTimeout(renderShop, 220); return; }
          if (cur === id) { Sheet.close(); return; }
          if (useTheme(id)) { Sheet.close(); setTimeout(renderSettings, 260); }
        });
      });
      var gs = $("#themeGoShop");
      if (gs) gs.onclick = function () { Sheet.close(); setTimeout(renderShop, 220); };
    }
  });
}
window.renderThemePicker = renderThemePicker;

/* ---------------------------------------------------------------- 盲盒 */
function renderBox() {
  var d = Store.data;
  $("#boxBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>非遗盲盒</h2></div>' +
    '<div class="card" style="text-align:center;background:linear-gradient(160deg,#6B4430,var(--brand-d));border:none;color:#fff;padding:30px 20px">' +
      '<div style="font-size:70px;animation:floatY 3s ease-in-out infinite">🎁</div>' +
      '<div style="font-size:20px;font-weight:800;margin-top:12px">香云纱非遗盲盒</div>' +
      '<div style="font-size:12px;opacity:.85;margin-top:8px;line-height:1.7">开启可获得传承币、限定头像、稀有称号与传世徽章</div>' +
      '<div style="margin-top:16px;font-size:14px;color:var(--gold)">剩余开盒机会：<b>' + (d.boxLeft || 0) + '</b> 次</div>' +
      '<button class="btn btn-gold" id="boxOpenBtn" style="margin-top:16px" ' + ((d.boxLeft || 0) <= 0 ? 'disabled' : '') + '>立即开启</button>' +
    '</div>' +
    '<div class="card"><div class="card-title"><span class="ct-left">🎊 奖池一览</span><span class="ct-right">概率权重</span></div>' +
      YS_BOX_PRIZES.map(function (p) {
        var total = YS_BOX_PRIZES.reduce(function (a, b) { return a + b.weight; }, 0);
        var pct = Math.round(p.weight / total * 100);
        return '<div class="list-row"><div class="lr-ico" style="font-size:24px">' + p.ico + '</div>' +
          '<div class="lr-main"><b>' + p.name + '</b><span>' + (p.weight >= 25 ? '常见' : p.weight >= 10 ? '稀有' : '传说') + '</span></div>' +
          '<span class="tag ' + (p.weight < 10 ? 'tag-gold' : 'tag-gray') + '">' + pct + '%</span></div>';
      }).join("") +
    '</div>' +
    '<div class="card"><div class="card-title"><span class="ct-left">📜 开盒记录</span><span class="ct-right">累计 ' + (d.boxOpened || 0) + ' 次</span></div>' +
      (d.boxLog && d.boxLog.length ? d.boxLog.slice().reverse().slice(0, 8).map(function (l) {
        return '<div class="list-row"><div class="lr-ico">' + l.ico + '</div><div class="lr-main"><b>' + l.name + '</b><span>' + l.time + '</span></div></div>';
      }).join("") : '<div class="empty" style="padding:16px"><div class="d">还没有开盒记录</div></div>') +
    '</div>' +
    '<button class="btn btn-ghost btn-block" id="boxEarnBtn">如何获得开盒机会？</button>';

  Nav.go("v-box", { after: function () {
    $("#boxBody .back-btn").addEventListener("click", Nav.back);
    $("#boxOpenBtn").addEventListener("click", doOpenBox);
    $("#boxEarnBtn").addEventListener("click", function () {
      Sheet.open({
        title: "获得开盒机会",
        body: '<div style="font-size:13px;color:var(--ink-2);line-height:1.9">' +
          '· 连续签到第 7 天可额外获得 1 次<br>' +
          '· 完成研学任务可获得开盒机会<br>' +
          '· 参与小游戏取得高分可获得奖励</div>',
        foot: '<button class="btn btn-primary btn-block" id="earnOk">知道了</button>',
        onMount: function () { $("#earnOk").onclick = Sheet.close; }
      });
    });
  }});
}

function doOpenBox() {
  var d = Store.data;
  if ((d.boxLeft || 0) <= 0) { toast("完成研学任务获得开盒机会", { ico: "🎁" }); return; }
  d.boxLeft -= 1;
  d.boxOpened = (d.boxOpened || 0) + 1;

  // 权重随机
  var total = YS_BOX_PRIZES.reduce(function (a, b) { return a + b.weight; }, 0);
  var r = Math.random() * total;
  var pick = YS_BOX_PRIZES[0];
  for (var i = 0; i < YS_BOX_PRIZES.length; i++) {
    r -= YS_BOX_PRIZES[i].weight;
    if (r <= 0) { pick = YS_BOX_PRIZES[i]; break; }
  }
  if (pick.coins) addCoins(pick.coins);
  if (pick.item && d.inventory.indexOf(pick.item) < 0) d.inventory.push(pick.item);

  if (!d.boxLog) d.boxLog = [];
  d.boxLog.push({ name: pick.name, ico: pick.ico, time: new Date().toLocaleString() });
  Store.save();
  renderStatus();
  unlockAchievement("box_1");
  Sound.unlock();
  confetti(50);

  $("#boxBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>开盒结果</h2></div>' +
    '<div style="text-align:center;padding:50px 20px">' +
      '<div style="font-size:80px;animation:pop .5s var(--ease-spring)">' + pick.ico + '</div>' +
      '<div style="font-size:14px;color:var(--ink-3);letter-spacing:.1em;margin-top:16px">恭喜获得</div>' +
      '<div style="font-size:26px;font-weight:850;color:var(--brand-d);margin-top:8px">' + pick.name + '</div>' +
      '<div style="display:flex;gap:10px;margin-top:30px">' +
        '<button class="btn btn-ghost" id="boxAgain" style="flex:1"' + ((d.boxLeft || 0) <= 0 ? ' disabled' : '') + '>再开一次</button>' +
        '<button class="btn btn-primary" id="boxDone" style="flex:1">完成</button>' +
      '</div>' +
    '</div>';
  Nav.go("v-box", { after: function () {
    $("#boxBody .back-btn").addEventListener("click", function () { renderBox(); });
    $("#boxAgain").onclick = doOpenBox;
    $("#boxDone").onclick = renderBox;
  }});
}

/* ---------------------------------------------------------------- 签到日历 */
function renderSignCalendar() {
  var d = Store.data;
  var now = new Date();
  var year = now.getFullYear(), month = now.getMonth();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var firstDay = new Date(year, month, 1).getDay();
  var wnames = ["日", "一", "二", "三", "四", "五", "六"];

  var cells = wnames.map(function (w) { return '<div style="text-align:center;font-size:11px;color:var(--ink-3);font-weight:700;padding:4px 0">' + w + '</div>'; }).join("");
  for (var i = 0; i < firstDay; i++) cells += '<div></div>';
  for (var dd = 1; dd <= daysInMonth; dd++) {
    var dateStr = year + "-" + (month + 1 < 10 ? "0" : "") + (month + 1) + "-" + (dd < 10 ? "0" : "") + dd;
    var signed = (d.checkin.dates || []).indexOf(dateStr) >= 0;
    var isToday = dd === now.getDate();
    cells += '<div style="aspect-ratio:1;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;' +
      (signed ? 'background:linear-gradient(135deg,#E8C68C,var(--gold));color:#5A3E1A;' : 'background:var(--bg);color:var(--ink-3);') +
      (isToday ? 'box-shadow:inset 0 0 0 2px var(--brand);' : '') + '">' + (signed ? '✓' : dd) + '</div>';
  }

  var signedToday = d.checkin.last === ds();
  var dayIdx = (d.checkin.streak - 1) % 7;

  $("#signBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>每日签到</h2></div>' +
    '<div class="card" style="text-align:center;background:linear-gradient(160deg,#6B4430,var(--brand-d));border:none;color:#fff">' +
      '<div style="font-size:40px">📅</div>' +
      '<div style="font-size:22px;font-weight:800;margin-top:8px">连续签到 <span style="color:var(--gold)">' + d.checkin.streak + '</span> 天</div>' +
      '<div style="font-size:12px;opacity:.85;margin-top:6px">累计 ' + d.checkin.total + ' 天 · 已获 🪙 ' + (d.coinsEarned || 0) + '</div>' +
      '<button class="btn btn-gold" id="signBtn2" style="margin-top:16px" ' + (signedToday ? 'disabled' : '') + '>' + (signedToday ? '今日已签到 ✓' : '立即签到') + '</button>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title"><span class="ct-left">🗓️ ' + (month + 1) + ' 月签到日历</span><span class="ct-right">' + (d.checkin.dates || []).filter(function (x) { return x.indexOf(year + "-" + (month + 1 < 10 ? "0" : "") + (month + 1)) === 0; }).length + ' 天</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">' + cells + '</div>' +
    '</div>' +

    '<div class="card">' +
      '<div class="card-title"><span class="ct-left">🎁 7 日签到奖励</span><span class="ct-right">循环发放</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">' +
        YS_SIGN_REWARDS.map(function (r, idx) {
          var active = idx === dayIdx;
          return '<div style="text-align:center;padding:8px 2px;border-radius:12px;' + (active ? 'background:var(--gold-soft);box-shadow:inset 0 0 0 1.5px var(--gold);' : 'background:var(--bg);') + '">' +
            '<div style="font-size:20px">' + r.ico + '</div>' +
            '<div style="font-size:11px;font-weight:800;color:var(--amber);margin-top:3px">+' + r.coins + '</div>' +
            '<div style="font-size:9px;color:var(--ink-3)">第' + r.day + '天</div></div>';
        }).join("") +
      '</div>' +
      '<div style="font-size:11px;color:var(--ink-3);margin-top:10px;line-height:1.6">每连续签到 7 天为一个循环，第 7 天额外赠送 1 次盲盒机会。断签后重新从第 1 天计算。</div>' +
    '</div>' +

    '<div class="card"><div class="card-title"><span class="ct-left">🏆 签到成就</span></div>' +
      achievementRow("first_sign", "📅", "坚持开始", "完成第一次签到") +
      achievementRow("sign_7", "🔥", "七日之约", "连续签到 7 天") +
      achievementRow("sign_30", "🏆", "持之以恒", "累计签到 30 天") +
    '</div>';

  Nav.go("v-sign", { after: function () {
    $("#signBody .back-btn").addEventListener("click", Nav.back);
    $("#signBtn2").addEventListener("click", doCheckin);
  }});
}

function achievementRow(id, ico, name, desc) {
  var got = !!Store.data.achievements[id];
  return '<div class="list-row"><div class="lr-ico" style="' + (got ? '' : 'filter:grayscale(1);opacity:.5') + '">' + ico + '</div>' +
    '<div class="lr-main"><b>' + name + '</b><span>' + desc + '</span></div>' +
    '<span class="tag ' + (got ? 'tag-green' : 'tag-gray') + '">' + (got ? '已达成' : '未达成') + '</span></div>';
}

/* ---------------------------------------------------------------- 头像选择 */
function renderAvatarPicker() {
  var d = Store.data;
  $("#avatarBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>我的头像</h2></div>' +
    '<div class="card" style="text-align:center;padding:26px 16px">' +
      '<div style="display:flex;justify-content:center">' + avatarDisplayHTML(88) + '</div>' +
      '<div style="font-size:13px;color:var(--ink-3);margin-top:12px">点击选择预设头像，或导入照片</div></div>' +
    '<div class="card"><div class="card-title"><span class="ct-left">📷 导入照片</span></div>' +
      '<button class="btn btn-primary btn-block" id="importPhotoBtn">从相册选择照片</button>' +
      '<input type="file" id="photoInput" accept="image/*" style="display:none">' +
      '<div style="font-size:11px;color:var(--ink-3);margin-top:8px">支持 jpg/png，2MB 以内，照片仅保存在本机</div></div>' +
    '<div class="card"><div class="card-title"><span class="ct-left">🎨 头像款式</span><span class="ct-right">' + allAvatarDefs().length + ' 款</span></div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">' +
        allAvatarDefs().map(function (a) {
          var owned = a.shop ? (d.inventory || []).indexOf(a.id) >= 0 : true;
          var active = d.avatar === a.id;
          return '<div class="avatar-item' + (owned ? '' : ' locked') + '" data-avatar="' + a.id + '" data-owned="' + (owned ? '1' : '0') + '" ' +
            'style="position:relative;aspect-ratio:1;border-radius:16px;background:' + a.bg + ';display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800;color:#fff;cursor:pointer;' + (active ? 'box-shadow:0 0 0 3px var(--gold);' : '') + '">' +
            a.ico + (owned ? '' : '<span class="av-lock">🔒</span>') + '</div>';
        }).join("") +
      '</div>' +
      '<div style="font-size:11px;color:var(--ink-3);margin-top:10px">带 🔒 的头像需在传承商店购买后使用</div></div>' +
    '<button class="btn btn-ghost btn-block" id="goFrameBtn">前往头像框装扮 ›</button>';

  Nav.go("v-avatar", { after: function () {
    $("#avatarBody .back-btn").addEventListener("click", Nav.back);
    $$("#avatarBody .avatar-item").forEach(function (it) {
      it.addEventListener("click", function () {
        if (it.dataset.owned === "0") {
          toast("该头像尚未解锁，去传承商店购买后即可使用", { ico: "🔒" });
          renderShop();
          return;
        }
        d.avatar = it.dataset.avatar;
        d.customAvatar = "";
        Store.save();
        renderAvatarPicker();
        Sound.tick();
        toast("头像已更换", { ico: "🖼️" });
      });
    });
    $("#importPhotoBtn").addEventListener("click", function () { $("#photoInput").click(); });
    $("#photoInput").addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { toast("图片太大，请选择 2MB 以内的照片", { ico: "⚠️" }); return; }
      var reader = new FileReader();
      reader.onload = function (ev) {
        d.customAvatar = ev.target.result;
        d.avatar = "custom";
        Store.save();
        renderAvatarPicker();
        toast("照片已设为头像", { ico: "✅" });
      };
      reader.readAsDataURL(file);
    });
    $("#goFrameBtn").addEventListener("click", renderFramePicker);
  }});
}

/* ---------------------------------------------------------------- 头像框 */
function renderFramePicker() {
  var d = Store.data;
  $("#frameBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>头像框</h2></div>' +
    '<div class="card" style="text-align:center;padding:26px 16px">' +
      '<div style="display:flex;justify-content:center">' + avatarDisplayHTML(88) + '</div>' +
      '<div style="font-size:13px;color:var(--ink-3);margin-top:12px">当前：' + getFrame().name + '　🪙 ' + (d.user.coins || 0) + '</div></div>' +
    '<div class="card flush">' +
      YS_FRAMES.map(function (f) {
        var owned = f.id === "fr_none" || (d.ownedFrames || []).indexOf(f.id) >= 0;
        var wearing = d.frame === f.id;
        return '<div class="list-row" data-frame="' + f.id + '" style="cursor:pointer;padding:14px 18px">' +
          '<div style="width:44px;height:44px;border-radius:14px;background:' + (f.id === "fr_none" ? "var(--bg)" : f.color) + ';padding:' + (f.id === "fr_none" ? "0" : "5px") + ';display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
            '<div style="width:100%;height:100%;border-radius:10px;background:' + getAvatar().bg + ';display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800">' + getAvatar().ico + '</div></div>' +
          '<div class="lr-main"><b>' + f.name + '</b><span>' + f.desc + '</span></div>' +
          '<button class="btn btn-sm ' + (wearing ? 'btn-soft' : owned ? 'btn-ghost' : 'btn-gold') + '">' +
            (wearing ? '佩戴中' : owned ? '佩戴' : '🪙 ' + f.price) + '</button></div>';
      }).join("") +
    '</div>';

  Nav.go("v-frame", { after: function () {
    $("#frameBody .back-btn").addEventListener("click", Nav.back);
    $$("#frameBody [data-frame]").forEach(function (row) {
      row.addEventListener("click", function () { buyOrEquipFrame(row.dataset.frame); });
    });
  }});
}

function buyOrEquipFrame(id) {
  var d = Store.data;
  var f = YS_FRAMES.filter(function (x) { return x.id === id; })[0];
  if (!f) return;
  if (id !== "fr_none" && (d.ownedFrames || []).indexOf(id) < 0) {
    if ((d.user.coins || 0) < f.price) { toast("传承币不足", { ico: "😅" }); Sound.fail(); return; }
    d.user.coins -= f.price;
    d.ownedFrames.push(id);
    toast("购买成功 · " + f.name, { ico: "⭕" });
    Sound.coin();
  }
  d.frame = id;
  Store.save();
  renderStatus();
  unlockAchievement("frame_1");
  renderFramePicker();
}

/* ---------------------------------------------------------------- 称号 */
function renderTitlePicker() {
  var d = Store.data;
  $("#titleBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>我的称号</h2></div>' +
    '<div class="card" style="text-align:center;padding:24px">' +
      '<div style="font-size:12px;color:var(--ink-3)">当前佩戴</div>' +
      '<div style="font-size:22px;font-weight:800;color:var(--brand-d);margin-top:8px">' + (getTitle().id === "ti_none" ? "未佩戴称号" : getTitle().name) + '</div></div>' +
    '<div class="card flush">' +
      YS_TITLES.map(function (t) {
        var owned = (d.ownedTitles || []).indexOf(t.id) >= 0;
        var wearing = d.title === t.id;
        return '<div class="list-row" data-title="' + t.id + '" style="cursor:pointer;padding:14px 18px">' +
          '<div class="lr-ico">🎖️</div>' +
          '<div class="lr-main"><b>' + t.name + '</b><span>' + t.desc + '</span></div>' +
          '<span class="tag ' + (wearing ? 'tag-gold' : owned ? 'tag-green' : 'tag-gray') + '">' +
            (wearing ? '佩戴中' : owned ? '佩戴' : '未解锁') + '</span></div>';
      }).join("") +
    '</div>';

  Nav.go("v-title", { after: function () {
    $("#titleBody .back-btn").addEventListener("click", Nav.back);
    $$("#titleBody [data-title]").forEach(function (row) {
      row.addEventListener("click", function () {
        var id = row.dataset.title;
        if ((d.ownedTitles || []).indexOf(id) < 0) { toast("该称号需在商店购买或完成任务解锁", { ico: "🔒" }); return; }
        d.title = id;
        Store.save();
        renderTitlePicker();
        toast("已佩戴「" + getTitle().name + "」", { ico: "✅" });
      });
    });
  }});
}

/* ---------------------------------------------------------------- 我的收藏 */
function renderInventory() {
  var d = Store.data;
  var items = (d.inventory || []).map(function (id) {
    return YS_SHOP.filter(function (x) { return x.id === id; })[0];
  }).filter(Boolean);

  $("#inventoryBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>我的收藏</h2></div>' +
    (items.length ?
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        items.map(function (it) {
          var isTheme = it.type === "theme";
          var using = isTheme && (d.equippedTheme || "") === it.id;
          var thumb = (isTheme && it.sw)
            ? '<div class="shop-sw" style="background:linear-gradient(135deg,' + it.sw[0] + ',' + it.sw[1] + ')"></div>'
            : '<div style="font-size:40px">' + it.ico + '</div>';
          return '<div class="card" style="text-align:center;margin:0">' + thumb +
            '<b style="font-size:13px;display:block;margin-top:8px">' + it.name + '</b>' +
            '<div style="font-size:11px;color:var(--ink-3);margin-top:4px">' + it.desc + '</div>' +
            (isTheme
              ? '<button class="btn btn-sm ' + (using ? 'btn-ghost' : 'btn-soft') + ' btn-block" data-inv-use="' + it.id + '" style="margin-top:8px" ' + (using ? 'disabled' : '') + '>' + (using ? '✓ 使用中' : '使用') + '</button>'
              : '') +
            '</div>';
        }).join("") + '</div>'
      : '<div class="empty"><div class="ico">🗃️</div><div class="t">还没有收藏</div><div class="d">去传承商店逛逛，或开启盲盒获取限定物品</div></div>') +
    '<button class="btn btn-primary btn-block" id="invGoShop" style="margin-top:16px">前往商店</button>';

  Nav.go("v-inventory", { after: function () {
    $("#inventoryBody .back-btn").addEventListener("click", Nav.back);
    $("#invGoShop").addEventListener("click", renderShop);
    $$("#inventoryBody [data-inv-use]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (useTheme(b.dataset.invUse)) renderInventory();
      });
    });
  }});
}

/* ---------------------------------------------------------------- 成就详情 */
function openAchDetail(id) {
  var a = YS_ACHIEVEMENTS.filter(function (x) { return x.id === id; })[0];
  if (!a) return;
  var got = !!Store.data.achievements[id];
  var hint = {
    first_login: "首次进入应用即可解锁", first_sign: "完成一次每日签到", sign_7: "连续签到 7 天",
    sign_30: "累计签到 30 天", first_task: "完成任意一个研学任务", task_all: "完成全部 4 个研学任务",
    perfect_task: "单次任务获得满分", map_all: "打卡全部 4 个研学点位", know_5: "阅读 5 条工艺知识",
    story_1: "阅读一篇非遗故事", quiz_1: "完成一次知识问答", quiz_90: "知识问答超过 90 分",
    mud_1: "完成一次涂河泥体验", mud_100: "涂河泥完成度达到 100%", rhythm_1: "完成一次煮绸节拍",
    sort_1: "完成一次工序排序", memory_1: "完成一次翻牌记忆", ue_link: "接收一次 UE 联动事件",
    cert: "生成研学证书", xp_1000: "累计积分达到 1000", all_games: "玩过全部 5 个小游戏",
    box_1: "开启第一个盲盒", shop_1: "在商店购买第一件商品", frame_1: "佩戴一个头像框",
    coins_500: "累计获得 500 传承币", share_1: "生成一张研学分享卡", all_done: "解锁全部成就"
  }[id] || "完成对应条件即可解锁";

  Sheet.open({
    title: "成就详情",
    body: '<div style="text-align:center;padding:14px 0">' +
      '<div style="font-size:64px;' + (got ? '' : 'filter:grayscale(1);opacity:.5') + '">' + a.ico + '</div>' +
      '<div style="font-size:20px;font-weight:800;margin-top:12px">' + a.name + '</div>' +
      '<div style="font-size:13px;color:var(--ink-2);margin-top:6px">' + a.desc + '</div>' +
      '<span class="tag ' + (got ? 'tag-green' : 'tag-gray') + '" style="margin-top:12px">' + (got ? '✓ 已解锁' : '尚未解锁') + '</span>' +
      '</div>' +
      '<div class="card" style="background:var(--brand-soft)"><b style="font-size:13px">解锁条件</b><div style="font-size:13px;color:var(--ink-2);margin-top:6px">' + hint + '</div></div>',
    foot: '<button class="btn btn-primary btn-block" id="achOk">知道了</button>',
    onMount: function () { $("#achOk").onclick = Sheet.close; }
  });
}

/* ---------------------------------------------------------------- 分享卡片（Canvas 生成） */
function renderShare() {
  var d = Store.data;
  var li = levelInfo(d.user.xp);
  $("#shareBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>研学分享卡</h2></div>' +
    '<canvas id="shareCanvas" width="640" height="900" style="width:100%;border-radius:var(--r-xl);box-shadow:var(--sh-2)"></canvas>' +
    '<button class="btn btn-primary btn-block" id="saveShareBtn" style="margin-top:16px">保存分享卡到相册</button>' +
    '<div style="font-size:11px;color:var(--ink-3);text-align:center;margin-top:10px">生成的图片仅保存在本机，不含任何个人敏感信息</div>';

  Nav.go("v-share", { after: function () {
    $("#shareBody .back-btn").addEventListener("click", Nav.back);
    drawShareCard();
    $("#saveShareBtn").addEventListener("click", function () {
      try {
        var c = $("#shareCanvas");
        var url = c.toDataURL("image/png");
        var a = document.createElement("a");
        a.href = url; a.download = "云纱智境-研学分享卡.png";
        a.click();
        d.shareCount = (d.shareCount || 0) + 1;
        Store.save();
        unlockAchievement("share_1");
        toast("分享卡已保存", { ico: "📤" });
      } catch (e) { toast("保存失败，请长按图片保存", { ico: "⚠️" }); }
    });
  }});
}

function drawShareCard() {
  var c = $("#shareCanvas");
  if (!c) return;
  var g = c.getContext("2d");
  var d = Store.data;
  var li = levelInfo(d.user.xp);

  // 背景渐变
  var grad = g.createLinearGradient(0, 0, 0, 900);
  grad.addColorStop(0, "#C08A5B"); grad.addColorStop(0.55, "#83533B"); grad.addColorStop(1, "#40291F");
  g.fillStyle = grad; g.fillRect(0, 0, 640, 900);

  // 装饰圆
  g.fillStyle = "rgba(255,255,255,.12)";
  g.beginPath(); g.arc(540, 130, 160, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(80, 780, 120, 0, Math.PI * 2); g.fill();

  // 顶部印章
  g.strokeStyle = "#D9AD71"; g.lineWidth = 3;
  g.strokeRect(60, 70, 90, 90);
  g.fillStyle = "#D9AD71";
  g.font = "bold 56px KaiTi, serif";
  g.textAlign = "center"; g.textBaseline = "middle";
  g.fillText("纱", 105, 116);

  // 标题
  g.fillStyle = "#F8F2E8";
  g.font = "bold 44px KaiTi, serif";
  g.fillText("云纱智境 · 莨珠记", 320, 220);
  g.fillStyle = "#D9AD71";
  g.font = "22px sans-serif";
  g.fillText("香云纱非遗数字研学平台", 320, 268);

  // 分隔线
  g.strokeStyle = "rgba(217,173,113,.5)"; g.lineWidth = 1;
  g.beginPath(); g.moveTo(120, 310); g.lineTo(520, 310); g.stroke();

  // 学员信息
  g.fillStyle = "#F8F2E8";
  g.font = "bold 34px sans-serif";
  g.fillText(d.user.name || "研学学员", 320, 380);
  g.fillStyle = "#C3B3A2";
  g.font = "20px sans-serif";
  g.fillText("Lv." + li.cur.lv + " · " + li.cur.name + (getTitle().id !== "ti_none" ? " · " + getTitle().name : ""), 320, 420);

  // 数据卡片
  var stats = [
    { label: "积分", val: d.user.xp },
    { label: "传承币", val: d.user.coins || 0 },
    { label: "任务", val: tasksCompleted() + "/" + YS_TASKS.length },
    { label: "成就", val: Object.keys(d.achievements).length }
  ];
  stats.forEach(function (s, i) {
    var x = 70 + i * 130;
    g.fillStyle = "rgba(255,255,255,.08)";
    g.beginPath();
    if (g.roundRect) { g.roundRect(x, 470, 110, 110, 18); g.fill(); }
    else g.fillRect(x, 470, 110, 110);
    g.fillStyle = "#D9AD71";
    g.font = "bold 30px sans-serif";
    g.fillText(String(s.val), x + 55, 515);
    g.fillStyle = "#C3B3A2";
    g.font = "16px sans-serif";
    g.fillText(s.label, x + 55, 552);
  });

  // 研学结语
  g.fillStyle = "#F8F2E8";
  g.font = "24px KaiTi, serif";
  g.fillText("「一两黄金一两纱」", 320, 660);
  g.fillStyle = "#C3B3A2";
  g.font = "18px sans-serif";
  g.fillText("走进香云纱的染整世界，感受岭南匠心", 320, 700);

  // 底部
  g.strokeStyle = "rgba(217,173,113,.5)";
  g.beginPath(); g.moveTo(120, 770); g.lineTo(520, 770); g.stroke();
  g.fillStyle = "#A49486";
  g.font = "16px sans-serif";
  g.fillText("非遗传承 · 数字体验 · 工匠育人", 320, 810);
  g.fillText(new Date().toLocaleDateString(), 320, 842);
}
