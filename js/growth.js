/* ==========================================================================
   莨珠记 · 云纱智境 —— 传承成长体系
   --------------------------------------------------------------------------
   用香云纱文化语境承载「像游戏一样上瘾」的机制，不用游戏术语：
   · 传承图鉴  —— 收集（匠心传承/工序密码/寻纱足迹/纱品纹样）
   · 研学季    —— 进度（春染/夏晒/秋织/冬藏，传承轨+匠心轨）
   · 每日研习  —— 连续（每日小目标 + 晒莨历里程碑）
   · 限定皮肤  —— 稀缺（稀有度/限定/来源展示）
   ========================================================================== */
(function (global) {
  "use strict";

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function data() { return global.Store && Store.data ? Store.data : null; }
  function save() { try { Store.save(); } catch (e) {} }
  function refresh() { try { renderStatus(); } catch (e) {} }

  /* ---------------------------------------------------------------- 奖励发放 */
  function grant(rw) {
    if (!rw) return;
    var d = data(); if (!d) return;
    if (rw.coins) { d.user.coins = (d.user.coins || 0) + rw.coins; d.coinsEarned = (d.coinsEarned || 0) + rw.coins; }
    if (rw.xp) d.user.xp = (d.user.xp || 0) + rw.xp;
    if (rw.seasonXp) addSeasonXp(rw.seasonXp);
    if (rw.title && d.ownedTitles.indexOf(rw.title) < 0) d.ownedTitles.push(rw.title);
    if (rw.frame && d.ownedFrames.indexOf(rw.frame) < 0) d.ownedFrames.push(rw.frame);
    if (rw.skin) unlockSkin(rw.skin, true);
    save(); refresh();
  }
  function grantText(rw) {
    var parts = [];
    if (rw.coins) parts.push("🪙 " + rw.coins);
    if (rw.xp) parts.push("✨ " + rw.xp);
    if (rw.skin) { var s = skinById(rw.skin); parts.push("皮肤「" + (s ? s.name : rw.skin) + "」"); }
    if (rw.title) parts.push("称号");
    if (rw.frame) parts.push("头像框");
    return parts.join(" · ");
  }
  function toast(msg, ico) { try { global.toast(msg, { ico: ico || "🎁", ms: 3200 }); } catch (e) {} }

  /* ================================================================
     传承图鉴
     ================================================================ */
  function cardUnlocked(card) {
    var d = data(); if (!d) return false;
    var rule = (global.YS_CODEX_UNLOCK || {})[card.kind];
    if (!rule) return false;
    var store = d[rule.store];
    return !!(store && store[card.id]);
  }
  function setProgress(set) {
    var got = set.cards.filter(cardUnlocked).length;
    return { got: got, total: set.cards.length, done: got >= set.cards.length };
  }
  /* 点亮一张图鉴卡片（供各页面阅读/打卡/观看时调用） */
  function lightCard(kind, id) {
    var d = data(); if (!d) return;
    var rule = (global.YS_CODEX_UNLOCK || {})[kind];
    if (!rule) return;
    if (!d[rule.store]) d[rule.store] = {};
    if (d[rule.store][id]) return;   // 已点亮
    d[rule.store][id] = true;
    // 检查所属套系是否集齐
    (global.YS_CODEX || []).forEach(function (set) {
      var has = set.cards.some(function (c) { return c.kind === kind && c.id === id; });
      if (has) {
        var pr = setProgress(set);
        if (pr.done && !d.codexSets[set.id]) {
          d.codexSets[set.id] = true;
          save();
          grant(set.reward);
          toast("图鉴「" + set.name + "」集齐！获得 " + grantText(set.reward), "📖");
        }
      }
    });
    save();
  }

  function renderCodex() {
    var d = data();
    Nav.go("v-codex", { push: false });
    var body = $("#codexBody"); if (!body) return;
    var totalGot = 0, totalCards = 0;
    (global.YS_CODEX || []).forEach(function (s) { var p = setProgress(s); totalGot += p.got; totalCards += p.total; });

    var html =
      '<div class="subhead"><button class="back-btn" data-act="back"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>传承图鉴</h2></div>' +
      '<div class="card" style="background:linear-gradient(135deg,var(--brand-soft),var(--card));border:none">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div><div style="font-size:16px;font-weight:850">📖 香云纱传承图鉴</div>' +
          '<div style="font-size:11.5px;color:var(--ink-3);margin-top:4px">阅读、打卡、观展，点亮每一张卡片</div></div>' +
          '<div style="font-size:26px;font-weight:850;color:var(--brand)">' + totalGot + '<span style="font-size:13px;color:var(--ink-3)">/' + totalCards + '</span></div>' +
        '</div>' +
        '<div class="xp-bar" style="margin-top:12px"><i style="width:' + (totalCards ? (totalGot / totalCards * 100) : 0) + '%"></i></div>' +
      '</div>';

    (global.YS_CODEX || []).forEach(function (set) {
      var pr = setProgress(set);
      html += '<div class="card" style="margin-top:12px">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<div style="width:42px;height:42px;border-radius:12px;background:var(--brand-soft);display:flex;align-items:center;justify-content:center;font-size:22px">' + set.icon + '</div>' +
          '<div style="flex:1"><b style="font-size:14.5px">' + esc(set.name) + '</b>' +
          '<div style="font-size:11px;color:var(--ink-3);margin-top:2px">' + esc(set.desc) + '</div></div>' +
          '<span class="tag ' + (pr.done ? 'tag-gold' : 'tag-gray') + '">' + pr.got + '/' + pr.total + '</span>' +
        '</div>' +
        '<div class="codex-grid" style="margin-top:12px">' +
          set.cards.map(function (c) {
            var on = cardUnlocked(c);
            return '<div class="codex-card ' + (on ? 'on' : 'off') + '" data-codex="' + esc(c.kind) + ':' + esc(c.id) + '">' +
              '<div class="codex-card-icon">' + (on ? '✦' : '?') + '</div>' +
              '<div class="codex-card-name">' + (on ? esc(c.name) : "未点亮") + '</div>' +
            '</div>';
          }).join("") +
        '</div>' +
        '<div style="font-size:11.5px;color:var(--ink-3);margin-top:12px;line-height:1.6">' +
          (pr.done ? '✅ 已集齐，奖励已领取：' + esc(grantText(set.reward))
                   : '集齐奖励：' + esc(grantText(set.reward))) +
        '</div>' +
      '</div>';
    });
    html += '<div style="font-size:11px;color:var(--ink-3);text-align:center;margin-top:16px">点亮方式：阅读传承人故事 / 工艺知识、实地打卡点位、浏览纹样</div>';
    body.innerHTML = html;

    bindBack(body);
    $$("[data-codex]", body).forEach(function (el) {
      el.onclick = function () {
        var parts = el.getAttribute("data-codex").split(":");
        var kind = parts[0], id = parts[1];
        var rule = (global.YS_CODEX_UNLOCK || {})[kind];
        if (!cardUnlocked({ kind: kind, id: id }) && kind === "craft") {
          /* 纹样卡：在图鉴中观察即可点亮（其它类需去对应页面研习） */
          lightCard("craft", id);
          toast("已记录纹样，图鉴点亮", "🧶");
          renderCodex();
        } else {
          toast(rule ? rule.hint : "继续研习即可点亮", "💡");
        }
      };
    });
  }

  /* ================================================================
     研学季（赛季通行证）
     ================================================================ */
  function curSeason() {
    var d = data();
    var id = (d && d.seasonId) || "spring";
    var s = (global.YS_SEASONS || []).filter(function (x) { return x.id === id; })[0];
    return s || (global.YS_SEASONS || [])[0];
  }
  function seasonXp(sid) { var d = data(); return (d && d.seasonXp && d.seasonXp[sid]) || 0; }
  function addSeasonXp(n) {
    var d = data(); if (!d) return;
    var s = curSeason();
    if (!d.seasonXp) d.seasonXp = {};
    d.seasonXp[s.id] = (d.seasonXp[s.id] || 0) + n;
    save();
  }
  function claimKey(sid, idx, track) { return sid + ":" + idx + ":" + track; }

  function renderSeason() {
    var d = data();
    Nav.go("v-season", { push: false });
    var body = $("#seasonBody"); if (!body) return;
    var s = curSeason();
    var xp = seasonXp(s.id);
    var isPro = !!(d.seasonPro && d.seasonPro[s.id]);
    var tiers = s.tiers || [];
    var reached = 0;
    tiers.forEach(function (t) { if (xp >= t.need) reached++; });
    var nextTier = tiers[reached] || tiers[tiers.length - 1];

    var html =
      '<div class="subhead"><button class="back-btn" data-act="back"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>研学季</h2></div>' +
      '<div class="lvp-hero" style="background:linear-gradient(150deg,' + s.color + ',#3A2A1C)">' +
        '<div class="lvp-hero-crown">' + s.icon + '</div>' +
        '<div class="lvp-hero-name">' + esc(s.name) + '</div>' +
        '<div class="lvp-hero-xp">' + esc(s.sub) + '</div>' +
        '<div class="lvp-hero-xp" style="margin-top:8px">研习值 ' + xp + (nextTier ? ' · 距下一阶还需 ' + Math.max(0, nextTier.need - xp) : ' · 已抵达最高阶') + '</div>' +
        '<div class="lvp-bar"><i style="width:' + Math.min(100, xp / ((tiers[tiers.length - 1] || {}).need || 1) * 100) + '%"></i></div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
        '<button class="chip ' + (isPro ? 'chip-brand on' : '') + '" id="seasonPro" style="flex:1">' + (isPro ? '✓ 匠心轨已开启' : '✦ 开启匠心轨 · 🪙' + YS_SEASON_PRO_COST) + '</button>' +
        '<button class="chip" id="seasonSwitch" style="flex:1">🔄 切换研学季</button>' +
      '</div>' +
      '<div class="lvp-section-title">🎖️ 传承阶 rewards</div>' +
      '<div class="season-list">';

    tiers.forEach(function (t, i) {
      var unlocked = xp >= t.need;
      var claimedFree = !!(d.seasonClaimed && d.seasonClaimed[claimKey(s.id, i, "free")]);
      var claimedPro = !!(d.seasonClaimed && d.seasonClaimed[claimKey(s.id, i, "pro")]);
      html += '<div class="season-row ' + (unlocked ? 'reached' : 'locked') + '">' +
        '<div class="season-tier">第 ' + (i + 1) + ' 阶<div style="font-size:10px;color:var(--ink-3)">' + t.need + ' 研习值</div></div>' +
        '<div class="season-tracks">' +
          '<div class="season-track ' + (claimedFree ? 'claimed' : '') + '">' +
            '<div class="season-track-label">传承</div>' +
            '<div class="season-track-rw">' + esc(grantText(t.free)) + '</div>' +
            '<button class="btn btn-sm ' + (claimedFree ? 'btn-ghost' : unlocked ? 'btn-gold' : 'btn-ghost') + '" data-claim="' + i + ':free" ' + (claimedFree || !unlocked ? 'disabled' : '') + '>' + (claimedFree ? '已领' : unlocked ? '领取' : '未达') + '</button>' +
          '</div>' +
          '<div class="season-track ' + (!isPro ? 'pro-lock' : '') + ' ' + (claimedPro ? 'claimed' : '') + '">' +
            '<div class="season-track-label">匠心</div>' +
            '<div class="season-track-rw">' + esc(grantText(t.pro)) + '</div>' +
            '<button class="btn btn-sm ' + (claimedPro ? 'btn-ghost' : (isPro && unlocked) ? 'btn-primary' : 'btn-ghost') + '" data-claim="' + i + ':pro" ' + (claimedPro || !isPro || !unlocked ? 'disabled' : '') + '>' + (claimedPro ? '已领' : !isPro ? '未开启' : unlocked ? '领取' : '未达') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
    html += '<div class="lvp-tip">完成每日研习、打卡、答题都会积累研习值。匠心轨含限定皮肤与称号，开启一次长期有效。</div>';
    body.innerHTML = html;

    bindBack(body);
    var proBtn = $("#seasonPro");
    if (proBtn) proBtn.onclick = function () {
      if (isPro) { toast("匠心轨已开启", "✓"); return; }
      if ((d.user.coins || 0) < YS_SEASON_PRO_COST) { toast("传承币不足，先去完成研学任务吧", "😅"); return; }
      d.user.coins -= YS_SEASON_PRO_COST;
      if (!d.seasonPro) d.seasonPro = {};
      d.seasonPro[s.id] = true;
      save(); refresh(); renderSeason();
      toast("匠心轨已开启，限定奖励等你来领！", "✦");
    };
    var swBtn = $("#seasonSwitch");
    if (swBtn) swBtn.onclick = function () {
      var items = (global.YS_SEASONS || []).map(function (x) {
        return { id: x.id, name: x.icon + " " + x.name + " · " + x.sub };
      });
      openPicker("切换研学季", items, function (id) { d.seasonId = id; save(); renderSeason(); });
    };
    $$("[data-claim]", body).forEach(function (b) {
      b.onclick = function () {
        var parts = b.getAttribute("data-claim").split(":");
        var i = parseInt(parts[0], 10), track = parts[1];
        var t = tiers[i];
        if (!t || xp < t.need) return;
        if (track === "pro" && !isPro) return;
        var ck = claimKey(s.id, i, track);
        if (d.seasonClaimed && d.seasonClaimed[ck]) return;
        if (!d.seasonClaimed) d.seasonClaimed = {};
        d.seasonClaimed[ck] = true;
        grant(t[track]);
        toast("领取成功：" + grantText(t[track]), "🎁");
        renderSeason();
      };
    });
  }

  /* 通用选择器（Sheet 列表） */
  function openPicker(title, items, onPick) {
    var body = items.map(function (it) {
      return '<div class="list-row" data-pick="' + esc(it.id) + '" style="cursor:pointer"><div class="lr-main"><b>' + esc(it.name) + '</b></div></div>';
    }).join("");
    Sheet.open({
      title: title, body: body,
      onMount: function () {
        $$("#sheetBody [data-pick]").forEach(function (el) {
          el.onclick = function () { Sheet.close(); onPick(el.getAttribute("data-pick")); };
        });
      }
    });
  }

  /* ================================================================
     每日研习 · 晒莨历
     ================================================================ */
  function ensureDaily() {
    var d = data(); if (!d) return;
    var t = today();
    if (d.dailyDate !== t) {
      d.dailyDate = t;
      d.daily = {};
      d.dailyClaimed = {};
      save();
    }
  }
  /* 记录一次研习行为：action = read / point / quiz / sign */
  function track(action) {
    var d = data(); if (!d) return;
    ensureDaily();
    var task = (global.YS_DAILY || []).filter(function (x) { return x.id === action; })[0];
    if (!task) return;
    d.daily[action] = (d.daily[action] || 0) + 1;
    save();
  }
  function renderDaily() {
    var d = data();
    Nav.go("v-daily", { push: false });
    var body = $("#dailyBody"); if (!body) return;
    ensureDaily();
    var streak = (d.checkin && d.checkin.streak) || 0;

    var html =
      '<div class="subhead"><button class="back-btn" data-act="back"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>每日研习 · 晒莨历</h2></div>' +
      '<div class="card" style="background:linear-gradient(135deg,var(--brand-soft),var(--card));border:none">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<div><div style="font-size:16px;font-weight:850">☀️ 连续晒莨 ' + streak + ' 天</div>' +
          '<div style="font-size:11.5px;color:var(--ink-3);margin-top:4px">坚持每日研习，像晒莨一样沉淀手艺</div></div>' +
          '<div style="font-size:30px">🌾</div>' +
        '</div>' +
      '</div>' +
      '<div class="lvp-section-title">📋 今日研习（' + today() + '）</div>' +
      '<div class="card flush">';

    (global.YS_DAILY || []).forEach(function (t) {
      var cnt = d.daily[t.id] || 0;
      var done = cnt >= t.goal;
      var claimed = !!(d.dailyClaimed && d.dailyClaimed[t.id]);
      html += '<div class="list-row" data-daily="' + t.id + '" style="cursor:pointer">' +
        '<div class="lr-ico">' + t.icon + '</div>' +
        '<div class="lr-main"><b>' + esc(t.name) + '</b><span>今日 ' + Math.min(cnt, t.goal) + '/' + t.goal + ' · 🪙' + t.coins + ' ✨' + t.xp + '</span></div>' +
        '<span class="tag ' + (claimed ? 'tag-gray' : done ? 'tag-green' : 'tag-gold') + '">' + (claimed ? '已领' : done ? '领奖' : '进行中') + '</span>' +
      '</div>';
    });
    html += '</div>' +
      '<div class="lvp-section-title">🌾 晒莨里程碑（连续 ' + streak + ' 天）</div>' +
      '<div class="card">';

    (global.YS_STREAK_MILES || []).forEach(function (m) {
      var reached = streak >= m.days;
      var claimed = !!(d.streakMiles && d.streakMiles[m.days]);
      html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line-2)">' +
        '<div style="font-size:24px;width:34px;text-align:center">' + (reached ? m.icon : "🔒") + '</div>' +
        '<div style="flex:1"><b style="font-size:13.5px">' + esc(m.name) + '</b>' +
        '<div style="font-size:11px;color:var(--ink-3);margin-top:2px">连续 ' + m.days + ' 天 · 🪙' + m.coins + ' ✨' + m.xp + (m.skin || m.frame ? ' + 特别奖励' : '') + '</div></div>' +
        '<button class="btn btn-sm ' + (claimed ? 'btn-ghost' : reached ? 'btn-gold' : 'btn-ghost') + '" data-mile="' + m.days + '" ' + (claimed || !reached ? 'disabled' : '') + '>' + (claimed ? '已领' : reached ? '领取' : '未达') + '</button>' +
      '</div>';
    });
    html += '</div>' +
      '<div class="lvp-tip">每日研习在零点自动刷新；连续签到天数可在「每日签到」查看。研习值会同步累积到当前研学季。</div>';
    body.innerHTML = html;

    bindBack(body);
    $$("[data-daily]", body).forEach(function (el) {
      el.onclick = function () {
        var id = el.getAttribute("data-daily");
        var t = (global.YS_DAILY || []).filter(function (x) { return x.id === id; })[0];
        if (!t) return;
        var done = (d.daily[id] || 0) >= t.goal;
        var claimed = !!(d.dailyClaimed && d.dailyClaimed[id]);
        if (claimed) { toast("今日已领取", "✓"); return; }
        if (!done) { Nav.go(t.act); return; }
        if (!d.dailyClaimed) d.dailyClaimed = {};
        d.dailyClaimed[id] = true;
        grant({ coins: t.coins, xp: t.xp, seasonXp: t.seasonXp });
        toast("研习奖励：" + grantText({ coins: t.coins, xp: t.xp }), "🎁");
        renderDaily();
      };
    });
    $$("[data-mile]", body).forEach(function (b) {
      b.onclick = function () {
        var days = parseInt(b.getAttribute("data-mile"), 10);
        var m = (global.YS_STREAK_MILES || []).filter(function (x) { return x.days === days; })[0];
        if (!m) return;
        if (!d.streakMiles) d.streakMiles = {};
        if (d.streakMiles[days]) return;
        d.streakMiles[days] = true;
        save();
        grant({ coins: m.coins, xp: m.xp, skin: m.skin, frame: m.frame });
        toast("里程碑「" + m.name + "」：" + grantText(m), "🌾");
        renderDaily();
      };
    });
  }

  /* ================================================================
     限定皮肤
     ================================================================ */
  function skinById(id) { return (global.YS_SKINS || []).filter(function (s) { return s.id === id; })[0]; }
  function unlockSkin(id, silent) {
    var d = data(); if (!d) return;
    if (!d.ownedSkins) d.ownedSkins = [];
    if (d.ownedSkins.indexOf(id) >= 0) return;
    d.ownedSkins.push(id);
    save();
    if (!silent) toast("获得限定皮肤：" + (skinById(id) || {}).name, "✨");
  }
  function skinOwned(id) {
    var d = data();
    return !!(d && d.ownedSkins && d.ownedSkins.indexOf(id) >= 0);
  }
  function wearSkin(id) {
    var d = data(); if (!d) return;
    var s = skinById(id);
    if (!s || !skinOwned(id)) return;
    d.equippedSkin = id;
    // 皮肤映射到已有主题 skin，直接穿戴
    if (typeof global.useTheme === "function") {
      var theme = (global.YS_THEMES || []).filter(function (t) { return t.skin === s.skin && t.id; })[0];
      if (theme) {
        if ((d.inventory || []).indexOf(theme.id) < 0) d.inventory.push(theme.id);
        useTheme(theme.id);
      }
    }
    save(); refresh();
    toast("已穿戴皮肤「" + s.name + "」", "✨");
  }
  function renderSkins() {
    var d = data();
    Nav.go("v-skins", { push: false });
    var body = $("#skinsBody"); if (!body) return;
    var owned = (d && d.ownedSkins) || [];

    var html =
      '<div class="subhead"><button class="back-btn" data-act="back"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>限定皮肤</h2></div>' +
      '<div class="card" style="background:linear-gradient(135deg,var(--brand-soft),var(--card));border:none">' +
        '<div style="font-size:15px;font-weight:850">✨ 香云纱纹样皮肤</div>' +
        '<div style="font-size:11.5px;color:var(--ink-3);margin-top:4px;line-height:1.6">已收藏 ' + owned.length + '/' + (global.YS_SKINS || []).length + ' 款 · 稀有皮肤来自研学季、图鉴集齐与连续研习</div>' +
      '</div>' +
      '<div class="skin-grid">';

    (global.YS_SKINS || []).forEach(function (s) {
      var has = skinOwned(s.id);
      var wearing = d && d.equippedSkin === s.id;
      var theme = (global.YS_THEMES || []).filter(function (t) { return t.skin === s.skin && t.sw; })[0] || { sw: ["#83533B", "#D9AD71"] };
      var rarity = (global.YS_RARITY || [])[s.rarity] || "";
      html += '<div class="skin-card ' + (has ? 'owned' : 'locked') + '">' +
        '<div class="skin-swatch" style="background:linear-gradient(135deg,' + theme.sw[0] + ',' + theme.sw[1] + ')">' +
          (has ? (wearing ? '<span class="skin-badge">穿戴中</span>' : '') : '<span class="skin-lock">🔒</span>') +
        '</div>' +
        '<div class="skin-name">' + esc(s.name) + '</div>' +
        '<div class="skin-rarity r-' + s.rarity + '">' + (s.limited ? '限定 · ' : '') + esc(rarity) + '</div>' +
        '<div class="skin-desc">' + esc(s.desc) + '</div>' +
        '<div class="skin-from">' + esc(s.from) + '</div>' +
        (has ? '<button class="btn btn-sm ' + (wearing ? 'btn-ghost' : 'btn-soft') + '" data-wear="' + s.id + '" style="margin-top:8px" ' + (wearing ? 'disabled' : '') + '>' + (wearing ? '✓ 使用中' : '穿戴') + '</button>'
             : '<button class="btn btn-sm btn-ghost" data-hint="' + s.id + '" style="margin-top:8px">获取途径</button>') +
      '</div>';
    });
    html += '</div>' +
      '<div class="lvp-tip">限定皮肤一旦错过当期研学季/活动，将难以再次获得。穿戴皮肤会同步应用对应的整站配色。</div>';
    body.innerHTML = html;

    bindBack(body);
    $$("[data-wear]", body).forEach(function (b) {
      b.onclick = function () { wearSkin(b.getAttribute("data-wear")); renderSkins(); };
    });
    $$("[data-hint]", body).forEach(function (b) {
      b.onclick = function () {
        var s = skinById(b.getAttribute("data-hint"));
        if (s) toast("获取途径：" + s.from, "💡");
      };
    });
  }

  function bindBack(root) {
    var b = $("[data-act='back']", root);
    if (b) b.onclick = function () { Nav.back(); };
  }

  /* 行为挂钩：各页面在对应行为发生时调用 */
  function onAction(action, id) {
    track(action);
    if (action === "read" && id) lightCard("know", id);
    if (action === "master" && id) { track("read"); lightCard("master", id); }
    if (action === "point" && id) lightCard("point", id);
    if (action === "craft" && id) { lightCard("craft", id); }
  }

  global.Growth = {
    renderCodex: renderCodex, renderSeason: renderSeason, renderDaily: renderDaily, renderSkins: renderSkins,
    onAction: onAction, lightCard: lightCard, track: track, grant: grant,
    unlockSkin: unlockSkin, skinOwned: skinOwned, wearSkin: wearSkin,
    setProgress: setProgress, cardUnlocked: cardUnlocked,
    seasonName: function () { var s = curSeason(); return s ? s.name : "研学季"; }
  };
})(window);
