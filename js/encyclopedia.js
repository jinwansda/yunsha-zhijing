/* ==========================================================================
   莨珠记 · 云纱智境 —— 香云纱百科专题页
   集中呈现香云纱的全部知识：溯源 / 地理 / 原料 / 工艺 / 成品 / 传承 / 文化
   ========================================================================== */
"use strict";

var EncycTab = "全部";

/* 简单的 **加粗** 转 HTML（仅处理我们自己的数据） */
function encFmt(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}

/* ---------------------------------------------------------------- 百科首页 */
function renderEncyclopedia() {
  var list = YS_ENCYCLOPEDIA.filter(function (e) { return EncycTab === "全部" || e.cat === EncycTab; });

  $("#encycBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>香云纱百科</h2></div>' +

    // 头部主视觉
    '<div style="border-radius:var(--r-xl);overflow:hidden;margin-bottom:16px;position:relative">' +
      '<img src="' + YS_ENCYC_IMG.dryingMaster + '" style="width:100%;height:180px;object-fit:cover">' +
      '<div style="position:absolute;inset:0;background:linear-gradient(transparent,rgba(64, 41, 31,.9));display:flex;flex-direction:column;justify-content:flex-end;padding:18px">' +
        '<div style="color:var(--gold);font-size:11px;letter-spacing:.1em">THE ENCYCLOPEDIA</div>' +
        '<div style="color:#fff;font-size:22px;font-weight:800;font-family:KaiTi,serif">一匹纱，六百年</div>' +
        '<div style="color:rgba(248,242,232,.85);font-size:12px;margin-top:4px">10 个章节 · 从历史来源到工艺成品，一次读懂香云纱</div>' +
      '</div>' +
    '</div>' +

    // 快速数据条
    '<div class="card" style="display:flex;justify-content:space-around;padding:14px 8px">' +
      '<div style="text-align:center"><div style="font-size:18px;font-weight:850;color:var(--brand-d)">' + YS_ENCYCLOPEDIA.length + '</div><div style="font-size:10px;color:var(--ink-3)">专题章节</div></div>' +
      '<div style="text-align:center"><div style="font-size:18px;font-weight:850;color:var(--brand-d)">30+</div><div style="font-size:10px;color:var(--ink-3)">道工序</div></div>' +
      '<div style="text-align:center"><div style="font-size:18px;font-weight:850;color:var(--brand-d)">2008</div><div style="font-size:10px;color:var(--ink-3)">国家级非遗</div></div>' +
      '<div style="text-align:center"><div style="font-size:18px;font-weight:850;color:var(--brand-d)">' + YS_TIMELINE.length + '</div><div style="font-size:10px;color:var(--ink-3)">历史节点</div></div>' +
    '</div>' +

    // 分类
    '<div class="know-cat-tabs">' +
      YS_ENCYC_CATS.map(function (c) {
        return '<button class="chip ' + (EncycTab === c ? 'chip-brand on' : '') + '" data-ecat="' + c + '">' + c + '</button>';
      }).join("") +
    '</div>' +

    // 章节卡片（每张带图）
    list.map(function (e) {
      return '<div class="enc-card" data-enc="' + e.id + '" style="background:var(--card);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh-1);border:1px solid var(--line-2);margin-bottom:14px;cursor:pointer">' +
        '<div style="height:140px;background-image:url(' + e.image + ');background-size:cover;background-position:center;position:relative">' +
          '<span class="tag tag-gold" style="position:absolute;top:10px;left:10px">' + e.cat + '</span>' +
          '<span style="position:absolute;bottom:8px;right:10px;font-size:26px">' + e.ico + '</span>' +
        '</div>' +
        '<div style="padding:14px 16px">' +
          '<b style="font-size:16px">' + esc(e.title) + '</b>' +
          '<p style="font-size:12.5px;color:var(--ink-2);line-height:1.7;margin-top:7px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + esc(e.summary) + '</p>' +
          '<div style="font-size:11px;color:var(--brand);margin-top:9px">阅读全文 ›</div>' +
        '</div>' +
      '</div>';
    }).join("") +

    // 时间线入口
    '<button class="card" id="encTimelineBtn" style="width:100%;display:flex;align-items:center;gap:14px;text-align:left;cursor:pointer">' +
      '<div style="font-size:30px">⏳</div>' +
      '<div style="flex:1"><b style="font-size:15px">香云纱历史时间线</b><div style="font-size:12px;color:var(--ink-3);margin-top:3px">从唐代到今天，' + YS_TIMELINE.length + ' 个关键节点</div></div>' +
      '<span style="color:var(--ink-4)">›</span>' +
    '</button>' +

    // 图片来源
    '<div style="font-size:10.5px;color:var(--ink-3);line-height:1.7;padding:4px 4px 20px">' + YS_IMG_CREDIT + '</div>';

  Nav.go("v-encyc", { after: function () {
    $("#encycBody .back-btn").addEventListener("click", Nav.back);
    $$("#encycBody .chip").forEach(function (c) {
      c.addEventListener("click", function () { EncycTab = c.dataset.ecat; renderEncyclopedia(); });
    });
    $$("#encycBody .enc-card").forEach(function (c) {
      c.addEventListener("click", function () { openEncycChapter(c.dataset.enc); });
    });
    $("#encTimelineBtn").addEventListener("click", openTimeline);
  }});
}

/* ---------------------------------------------------------------- 章节详情（长文 + 图库） */
function openEncycChapter(id) {
  var e = YS_ENCYCLOPEDIA.filter(function (x) { return x.id === id; })[0];
  if (!e) return;

  $("#encycDetailBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>' + e.cat + ' · 详情</h2></div>' +

    // 主图
    '<div style="border-radius:var(--r-xl);overflow:hidden;margin-bottom:14px">' +
      '<img src="' + e.image + '" style="width:100%;height:210px;object-fit:cover">' +
    '</div>' +

    '<div class="know-detail-hero">' +
      '<div class="kd-tag">' + e.ico + ' ' + e.cat + '</div>' +
      '<h2>' + esc(e.title) + '</h2>' +
      '<p style="font-size:13px;opacity:.9;margin-top:8px;line-height:1.7">' + esc(e.summary) + '</p>' +
    '</div>' +

    // 关键数据
    '<div class="card">' +
      '<div class="card-title"><span class="ct-left">📌 关键档案</span></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        e.facts.map(function (f) {
          return '<div style="background:var(--bg);border-radius:12px;padding:10px 12px">' +
            '<div style="font-size:10px;color:var(--ink-3)">' + esc(f.k) + '</div>' +
            '<div style="font-size:13px;font-weight:750;color:var(--brand-d);margin-top:3px">' + esc(f.v) + '</div></div>';
        }).join("") +
      '</div>' +
    '</div>' +

    // 正文
    '<div class="card">' +
      '<div class="card-title"><span class="ct-left">📖 详细解读</span><span class="ct-right">' + e.paras.length + ' 段</span></div>' +
      e.paras.map(function (p, i) {
        return '<div style="display:flex;gap:10px;margin-bottom:14px">' +
          '<div style="width:22px;height:22px;border-radius:50%;background:var(--brand-soft);color:var(--brand-d);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0">' + (i + 1) + '</div>' +
          '<div style="font-size:14px;line-height:1.9;color:var(--ink-2)">' + encFmt(p) + '</div>' +
        '</div>';
      }).join("") +
    '</div>' +

    // 图库
    '<div class="card">' +
      '<div class="card-title"><span class="ct-left">🖼️ 本章图集</span><span class="ct-right">' + e.gallery.length + ' 张</span></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
        e.gallery.map(function (img) {
          return '<div class="enc-shot" data-img="' + img + '" style="height:110px;border-radius:12px;overflow:hidden;background-image:url(' + img + ');background-size:cover;background-position:center;cursor:pointer"></div>';
        }).join("") +
      '</div>' +
    '</div>' +

    // 相关跳转
    '<div class="card"><div class="card-title"><span class="ct-left">🔗 继续探索</span></div>' +
      '<div class="list-row" id="encGoPoints" style="cursor:pointer"><div class="lr-ico">🗺️</div><div class="lr-main"><b>前往研学地图</b><span>实地打卡四大点位</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="encGoKnow" style="cursor:pointer"><div class="lr-ico">📚</div><div class="lr-main"><b>工艺知识库</b><span>分类知识点与 AI 问答</span></div><span class="lr-arrow">›</span></div>' +
      '<div class="list-row" id="encGoStories" style="cursor:pointer"><div class="lr-ico">📖</div><div class="lr-main"><b>非遗故事</b><span>香云纱背后的匠心往事</span></div><span class="lr-arrow">›</span></div>' +
    '</div>' +

    // 上下章
    '<div style="display:flex;gap:10px;margin-bottom:20px">' +
      '<button class="btn btn-ghost" id="encPrev" style="flex:1">‹ 上一章</button>' +
      '<button class="btn btn-primary" id="encNext" style="flex:1">下一章 ›</button>' +
    '</div>' +

    '<div style="font-size:10.5px;color:var(--ink-3);line-height:1.7;padding:0 4px 20px">' + YS_IMG_CREDIT + '</div>';

  var idx = YS_ENCYCLOPEDIA.indexOf(e);

  Nav.go("v-encyc-detail", { after: function () {
    $("#encycDetailBody .back-btn").addEventListener("click", Nav.back);
    $$("#encycDetailBody .enc-shot").forEach(function (s) {
      s.addEventListener("click", function () {
        Sheet.open({
          title: "图片查看",
          body: '<img src="' + s.dataset.img + '" style="width:100%;border-radius:14px">' +
                '<div style="font-size:11px;color:var(--ink-3);margin-top:10px;line-height:1.7">' + YS_IMG_CREDIT + '</div>',
          foot: '<button class="btn btn-primary btn-block" id="imgOk">关闭</button>',
          onMount: function () { $("#imgOk").onclick = Sheet.close; }
        });
      });
    });
    $("#encGoPoints").addEventListener("click", function () { Nav.go("v-map"); });
    $("#encGoKnow").addEventListener("click", function () { Nav.go("v-know"); });
    $("#encGoStories").addEventListener("click", function () { renderStories(); });
    $("#encPrev").addEventListener("click", function () {
      var p = YS_ENCYCLOPEDIA[idx - 1];
      if (p) openEncycChapter(p.id); else toast("已经是第一章了", { ico: "📖" });
    });
    $("#encNext").addEventListener("click", function () {
      var n = YS_ENCYCLOPEDIA[idx + 1];
      if (n) openEncycChapter(n.id); else toast("已经是最后一章了", { ico: "🎉" });
    });
  }});
}

/* ---------------------------------------------------------------- 历史时间线 */
function openTimeline() {
  $("#timelineBody").innerHTML =
    '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>历史时间线</h2></div>' +
    '<div class="card" style="text-align:center;background:linear-gradient(160deg,#6B4430,var(--brand-d));border:none;color:#fff">' +
      '<div style="font-size:34px">⏳</div>' +
      '<div style="font-size:20px;font-weight:800;margin-top:8px;font-family:KaiTi,serif">从唐代到今天</div>' +
      '<div style="font-size:12px;opacity:.85;margin-top:6px">' + YS_TIMELINE.length + ' 个关键节点 · 一部香云纱的起落史</div>' +
    '</div>' +
    '<div class="card">' +
      YS_TIMELINE.map(function (t, i) {
        var last = i === YS_TIMELINE.length - 1;
        return '<div style="display:flex;gap:14px">' +
          '<div style="display:flex;flex-direction:column;align-items:center;width:34px;flex-shrink:0">' +
            '<div style="width:30px;height:30px;border-radius:50%;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">' + t.ico + '</div>' +
            (last ? '' : '<div style="width:2px;flex:1;background:var(--line);margin:4px 0"></div>') +
          '</div>' +
          '<div style="flex:1;padding-bottom:' + (last ? '4' : '20') + 'px">' +
            '<div style="font-size:14px;font-weight:800;color:var(--brand-d)">' + esc(t.year) + '</div>' +
            '<div style="font-size:13px;color:var(--ink-2);line-height:1.7;margin-top:4px">' + esc(t.text) + '</div>' +
          '</div>' +
        '</div>';
      }).join("") +
    '</div>' +
    '<button class="btn btn-primary btn-block" id="tlBack">返回百科</button>';

  Nav.go("v-timeline", { after: function () {
    $("#timelineBody .back-btn").addEventListener("click", Nav.back);
    $("#tlBack").addEventListener("click", Nav.back);
  }});
}
