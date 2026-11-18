/* ==========================================================================
   莨珠记 · 云纱智境 —— 游戏中心
   香云纱知识问答 / 晒莨抢晴 / 莨水配比 / 工序排序 / 翻牌记忆
   ========================================================================== */
"use strict";

var GameHub = {
  open: function () {
    Nav.go("v-game");
    this.render();
  },

  render: function () {
    var d = Store.data;
    var qBest = this.best("quiz");
    var qCount = d.games.quiz.length;
    var mBest = this.best("mud");
    var rBest = this.best("rhythm");
    var mCount = d.games.mud.length;
    var rCount = d.games.rhythm.length;
    var sCount = d.games.sort.length;
    var memCount = d.games.memory.length;

    $("#gameBody").innerHTML =
      '<div class="subhead"><button class="back-btn"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button><h2>游戏中心</h2></div>' +
      '<div class="game-hero">' +
        '<div class="gh-tag">PLAY & LEARN</div>' +
        '<h3>边玩边学，<br>成为香云纱小达人</h3>' +
        '<p>六个游戏都能赚积分，成绩全部来自你的真实操作。</p>' +
      '</div>' +

      '<button class="game-card" data-game="quiz">' +
        '<div class="gc-ico">🧠</div>' +
        '<div class="gc-main"><h4>香云纱知识问答</h4><p>10 道题 · 12 秒/题 · 连击倍率</p>' +
        '<div class="gc-meta"><span>最佳 ' + (qBest ? qBest + ' 分' : '--') + '</span><i></i><span>玩过 ' + qCount + ' 次</span></div></div>' +
        '<div class="gc-go">开始</div></button>' +

      '<button class="game-card" data-game="mud">' +
        '<div class="gc-ico">☀️</div>' +
        '<div class="gc-main"><h4>晒莨抢晴</h4><p>拖动竹匾接阳光 · 躲雨滴 · 30 秒街机</p>' +
        '<div class="gc-meta"><span>最佳 ' + (mBest ? mBest + ' 分' : '--') + '</span><i></i><span>玩过 ' + mCount + ' 次</span></div></div>' +
        '<div class="gc-go">开始</div></button>' +

      '<button class="game-card" data-game="rhythm">' +
        '<div class="gc-ico">🎨</div>' +
        '<div class="gc-main"><h4>莨水配比</h4><p>调薯莨汁与河泥 · 复原目标布色 · 3 匹布</p>' +
        '<div class="gc-meta"><span>最佳 ' + (rBest ? rBest + ' 分' : '--') + '</span><i></i><span>玩过 ' + rCount + ' 次</span></div></div>' +
        '<div class="gc-go">开始</div></button>' +

      '<button class="game-card" data-game="sort">' +
        '<div class="gc-ico">🔀</div>' +
        '<div class="gc-main"><h4>工序排序</h4><p>拖拽排序 · 还原香云纱工艺流程</p>' +
        '<div class="gc-meta"><span>玩过 ' + sCount + ' 次</span><i></i><span>全对得高分</span></div></div>' +
        '<div class="gc-go">开始</div></button>' +

      '<button class="game-card" data-game="memory">' +
        '<div class="gc-ico">🃏</div>' +
        '<div class="gc-main"><h4>翻牌记忆</h4><p>配对香云纱图案 · 考验记忆力</p>' +
        '<div class="gc-meta"><span>玩过 ' + memCount + ' 次</span><i></i><span>步数越少分越高</span></div></div>' +
        '<div class="gc-go">开始</div></button>' +

      '<button class="game-card" data-game="lane">' +
        '<div class="gc-ico">🍂</div>' +
        '<div class="gc-main"><h4>晒莨节奏</h4><p>4 轨道下落式 · 30 秒挑战 · 点击命中</p>' +
        '<div class="gc-meta"><span>玩过 ' + d.games.lane.length + ' 次</span><i></i><span>连击加分</span></div></div>' +
        '<div class="gc-go">开始</div></button>' +

      '<div class="card"><div class="card-title"><span class="ct-left">📊 我的游戏记录</span></div>' +
        this.renderHistory() + '</div>';

    $("#gameBody .back-btn").addEventListener("click", Nav.back);
    $$("#gameBody .game-card").forEach(function (b) {
      b.addEventListener("click", function () {
        var g = b.dataset.game;
        if (g === "quiz") QuizGame.start();
        else if (g === "mud") MudGame.start();
        else if (g === "rhythm") RhythmGame.start();
        else if (g === "sort") SortGame.start();
        else if (g === "memory") MemoryGame.start();
        else LaneGame.start();
      });
    });
  },

  best: function (type) {
    var b = 0;
    Store.data.games[type].forEach(function (g) { b = Math.max(b, g.score || 0); });
    return b;
  },

  renderHistory: function () {
    var all = [];
    Store.data.games.quiz.forEach(function (g) { all.push({ t: "quiz", name: "知识问答", date: g.date, score: g.score, extra: g.correct + "/" + g.total }); });
    Store.data.games.mud.forEach(function (g) {
      var extra = g.hits != null ? g.hits + " 阳光 · " + g.rains + " 淋湿" : (g.pct != null ? g.pct + "% 覆盖" : "");
      all.push({ t: "mud", name: "晒莨抢晴", date: g.date, score: g.score, extra: extra });
    });
    Store.data.games.rhythm.forEach(function (g) {
      var extra = g.rounds ? "配色 " + g.rounds.join("/") : (g.perfect != null ? g.perfect + " 完美" : "");
      all.push({ t: "rhythm", name: "莨水配比", date: g.date, score: g.score, extra: extra });
    });
    Store.data.games.sort.forEach(function (g) { all.push({ t: "sort", name: "工序排序", date: g.date, score: g.score, extra: g.correct + "/" + g.total }); });
    Store.data.games.memory.forEach(function (g) { all.push({ t: "memory", name: "翻牌记忆", date: g.date, score: g.score, extra: g.steps + " 步" }); });
    Store.data.games.lane.forEach(function (g) { all.push({ t: "lane", name: "晒莨节奏", date: g.date, score: g.score, extra: g.hits + " 命中" }); });
    if (!all.length) {
      return '<div class="empty" style="padding:22px 0"><div class="ico">🎮</div><div class="t">还没有游戏记录</div><div class="d">玩一局，这里会记录你真实的成绩</div></div>';
    }
    all.sort(function (a, b) { return b.score - a.score; });
    return all.slice(0, 8).map(function (g) {
      return '<div class="list-row"><div class="lr-ico">' + (g.t === "quiz" ? "🧠" : g.t === "mud" ? "☀️" : g.t === "rhythm" ? "🎨" : g.t === "sort" ? "🔀" : g.t === "memory" ? "🃏" : "🍂") + '</div>' +
        '<div class="lr-main"><b>' + g.name + '</b><span>' + g.date + ' · ' + g.extra + '</span></div>' +
        '<div style="font-weight:800;color:var(--amber)">' + g.score + '</div></div>';
    }).join("");
  },

  /* 检查是否玩过所有游戏 */
  checkAllGames: function () {
    var d = Store.data;
    var types = ["quiz", "mud", "rhythm", "sort", "memory", "lane"];
    var all = types.every(function (t) { return d.games[t].length > 0; });
    if (all) unlockAchievement("all_games");
  }
};

/* 通用结算 HTML */
function resultHTML(ico, title, sub, vals, labels, reward, prefix) {
  return '<div style="text-align:center;padding-top:30px">' +
    '<div style="font-size:60px">' + ico + '</div>' +
    '<div style="font-size:32px;font-weight:850;color:var(--brand-d);margin-top:10px">' + title + '</div>' +
    '<div style="font-size:13px;color:var(--ink-2);margin-top:6px">' + sub + '</div>' +
    '<div class="rs-stats">' + vals.map(function (v, i) { return '<div class="rs-stat"><b>' + v + '</b><span>' + labels[i] + '</span></div>'; }).join("") + '</div>' +
    '<div class="rs-reward">' + reward + '</div>' +
    '<div class="rs-actions"><button class="btn btn-ghost" id="' + prefix + 'Again">再来一局</button><button class="btn btn-primary" id="' + prefix + 'Done">完成</button></div>' +
  '</div>';
}

/* ---------------------------------------------------------------- 1. 知识问答 */
var QuizGame = {
  list: [], idx: 0, score: 0, combo: 0, bestCombo: 0, correct: 0, timeLeft: 12, timer: null, locked: false,

  start: function () {
    var pool = YS_QUIZ.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    this.list = pool.slice(0, 10);
    this.idx = 0; this.score = 0; this.combo = 0; this.bestCombo = 0; this.correct = 0; this.locked = false;
    $("#gameMask").classList.add("show");
    this.renderQ();
  },

  renderQ: function () {
    var q = this.list[this.idx];
    if (!q) return this.finish();
    var self = this;
    this.locked = false;
    this.timeLeft = 12;
    var C = 2 * Math.PI * 26;
    $("#gameStage").innerHTML =
      '<div class="quiz-top" style="margin-bottom:16px">' +
        '<div class="pbar gold" style="margin-bottom:10px"><i style="width:' + (this.idx / this.list.length * 100) + '%"></i></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-3)">' +
          '<span>第 ' + (this.idx + 1) + ' / ' + this.list.length + ' 题</span>' +
          '<span style="color:var(--amber);font-weight:700">🔥 ' + this.combo + ' 连击</span>' +
        '</div>' +
      '</div>' +
      '<div class="quiz-timer">' +
        '<div class="qt-ring"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" fill="none" stroke="var(--line)" stroke-width="4"/><circle id="qzRing" cx="30" cy="30" r="26" fill="none" stroke="var(--brand)" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="0" transform="rotate(-90 30 30)"/></svg><b id="qzTime">12</b></div>' +
        '<span style="font-size:13px;color:var(--ink-3)">答得越快，得分越高</span>' +
      '</div>' +
      '<h2 style="font-size:19px;font-weight:800;line-height:1.5;margin-bottom:16px">' + esc(q.q) + '</h2>' +
      '<div id="qzOpts">' +
        q.opts.map(function (o, i) {
          return '<button class="quiz-opt" data-i="' + i + '"><span class="k">' + "ABCD"[i] + '</span><span>' + esc(o) + '</span></button>';
        }).join("") +
      '</div>' +
      '<div id="qzExp" style="margin-top:14px"></div>';

    $$("#qzOpts .quiz-opt").forEach(function (b) {
      b.addEventListener("click", function () { self.answer(+b.dataset.i); });
    });

    var total = 12;
    var ring = $("#qzRing");
    this.timer = setInterval(function () {
      self.timeLeft -= 0.1;
      if (self.timeLeft <= 0) { clearInterval(self.timer); self.answer(-1); return; }
      var tl = Math.max(0, self.timeLeft);
      var t2 = $("#qzTime"); if (t2) t2.textContent = Math.ceil(tl);
      if (ring) ring.setAttribute("stroke-dashoffset", (C * (1 - tl / total)).toFixed(1));
    }, 100);
  },

  answer: function (i) {
    if (this.locked) return;
    this.locked = true;
    clearInterval(this.timer);
    var q = this.list[this.idx];
    var ok = i === q.a;
    var opts = $$("#qzOpts .quiz-opt");
    opts.forEach(function (b, k) {
      b.disabled = true;
      if (k === q.a) b.classList.add("right");
      else if (k === i) b.classList.add("wrong");
    });

    if (ok) {
      var mult = Math.min(2, 1 + this.combo * 0.1);
      var gain = Math.round((100 + Math.max(0, this.timeLeft) * 5) * mult);
      this.score += gain;
      this.combo++; this.correct++;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      Sound.success(); vibrate(12);
      this.showExp("+" + gain + " 分 · " + this.combo + " 连击", true, q.exp);
    } else {
      this.combo = 0;
      Sound.fail(); vibrate([20, 50, 20]);
      this.showExp("答错了", false, q.exp);
    }

    var self = this;
    setTimeout(function () {
      self.idx++;
      if (self.idx >= self.list.length) self.finish();
      else self.renderQ();
    }, 1750);
  },

  showExp: function (head, ok, exp) {
    var box = $("#qzExp");
    if (!box) return;
    box.innerHTML = '<div class="card" style="background:' + (ok ? 'var(--green-soft)' : 'var(--red-soft)') + '">' +
      '<b style="color:' + (ok ? 'var(--green)' : 'var(--red)') + '">' + head + '</b>' +
      '<div style="font-size:13px;color:var(--ink-2);margin-top:6px">' + esc(exp) + '</div></div>';
  },

  finish: function () {
    clearInterval(this.timer);
    var coins = Math.round(this.score / 8);
    var d = Store.data;
    d.user.xp += coins;
    d.user.coins = (d.user.coins || 0) + Math.max(3, Math.round(coins / 2));
    d.coinsEarned = (d.coinsEarned || 0) + Math.max(3, Math.round(coins / 2));
    d.games.quiz.push({ date: ds(), score: this.score, correct: this.correct, total: this.list.length, bestCombo: this.bestCombo });
    if (d.games.quiz.length > 50) d.games.quiz.shift();
    Store.save();
    renderStatus();
    /* 传承成长：推进今日研习（答一组研学题） */
    if (typeof window.Growth !== "undefined") Growth.track("quiz");
    unlockAchievement("quiz_1");
    if (this.score >= 90) unlockAchievement("quiz_90");
    GameHub.checkAllGames();

    var self = this;
    $("#gameStage").innerHTML = resultHTML(
      this.correct >= 8 ? "🏆" : this.correct >= 5 ? "🎉" : "💪",
      this.score + " 分",
      "答对 " + this.correct + " / " + this.list.length + " 题 · 最高 " + this.bestCombo + " 连击",
      [this.correct, this.bestCombo, Math.round(this.correct / this.list.length * 100) + "%"],
      ["答对", "最高连击", "正确率"],
      "✨ +" + coins + " 积分",
      "qz"
    );
    if (this.correct >= 8) confetti(40);
    $("#qzAgain").onclick = function () { self.start(); };
    $("#qzDone").onclick = function () { $("#gameMask").classList.remove("show"); GameHub.render(); };
  }
};

/* ------------------------------------------------ 2. 晒莨抢晴（接阳光 · 躲雨滴 · 30 秒限时街机） */
var MudGame = {
  score: 0, combo: 0, bestCombo: 0, hits: 0, rains: 0,
  items: [], floats: [], timeLeft: 30, elapsed: 0,
  raf: null, ended: true, timer: null, lastSpawn: 0, basketX: 0, basketTX: 0, W: 0, H: 0,

  start: function () {
    this.stopAll();
    this.score = 0; this.combo = 0; this.bestCombo = 0; this.hits = 0; this.rains = 0;
    this.items = []; this.floats = []; this.timeLeft = 30; this.elapsed = 0;
    this.ended = false; this.finished = false; this.lastSpawn = 0;
    $("#gameMask").classList.add("show");
    $("#gameStage").innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
        '<b style="font-size:18px">晒莨抢晴</b>' +
        '<button class="btn btn-sm btn-ghost" id="mudQuit">退出</button>' +
      '</div>' +
      '<div class="mud-stage" style="background:linear-gradient(180deg,#BFDDE8,#EAF2DC)">' +
        '<canvas class="mud-canvas" id="sunCanvas"></canvas>' +
        '<div class="mud-hud">' +
          '<span class="mh-chip" id="sunScore">☀️ 0</span>' +
          '<span class="mh-chip" id="sunTime">⏱ 30s</span>' +
          '<span class="mh-chip" id="sunCombo">🔥 0</span>' +
        '</div>' +
        '<div class="mud-hint"><span>左右拖动竹匾：接住 ☀️ 阳光 +10 分，淋到 🌧️ 雨滴 −20 分并断连击！</span></div>' +
      '</div>' +
      '<div style="font-size:13px;color:var(--ink-2);text-align:center">晒莨靠天吃饭，抢在下雨前多接几束阳光！<br><span style="font-size:11px;color:var(--ink-3)">阳光越接越快 · 300 分以上解锁「晴天大师」</span></div>';

    var self = this;
    $("#mudQuit").onclick = function () {
      self.stopAll();
      $("#gameMask").classList.remove("show");
      GameHub.render();
    };

    var canvas = $("#sunCanvas");
    var stage = $(".mud-stage");
    var ctx = canvas.getContext("2d");
    canvas.width = this.W = stage.clientWidth;
    canvas.height = this.H = stage.clientHeight;
    this.basketX = this.basketTX = this.W / 2;

    function basketY() { return self.H - 34; }

    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      self.basketTX = Math.max(52, Math.min(self.W - 52, e.clientX - r.left));
    }
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointermove", function (e) {
      if (e.buttons || e.pointerType === "touch") onMove(e);
    });

    /* 生成掉落物 */
    this.spawn = function () {
      var isSun = Math.random() < 0.74;
      var speed = (110 + Math.random() * 90) * (1 + self.elapsed / 55);
      self.items.push({
        x: 30 + Math.random() * (self.W - 60),
        y: -24,
        vy: speed,
        kind: isSun ? "sun" : "rain",
        r: isSun ? 13 + Math.random() * 5 : 10,
        sway: Math.random() * Math.PI * 2
      });
    };

    this.loop = function (ts) {
      if (self.ended) return;
      if (!self.lastSpawn) self.lastSpawn = ts;
      var dt = Math.min(50, ts - (self.lastTs || ts));
      self.lastTs = ts;
      self.elapsed += dt / 1000;

      /* 生成节奏随时间加快 */
      var gap = Math.max(330, 640 - self.elapsed * 11);
      if (ts - self.lastSpawn > gap) { self.lastSpawn = ts; self.spawn(); }

      /* 竹匾平滑跟随手指 */
      self.basketX += (self.basketTX - self.basketX) * Math.min(1, dt / 90);

      /* 更新与碰撞 */
      var by = basketY();
      for (var i = self.items.length - 1; i >= 0; i--) {
        var it = self.items[i];
        it.y += (it.vy * dt) / 1000;
        it.x += Math.sin(ts / 500 + it.sway) * 0.5;
        if (it.y > by - 8 && it.y < by + 26 && Math.abs(it.x - self.basketX) < 54) {
          self.items.splice(i, 1);
          if (it.kind === "sun") {
            self.combo++; self.hits++;
            self.bestCombo = Math.max(self.bestCombo, self.combo);
            var gain = Math.round(10 * Math.min(2, 1 + self.combo * 0.06));
            self.score += gain;
            self.floats.push({ x: it.x, y: by - 10, txt: "+" + gain, color: "#E8A33D", life: 700 });
            Sound.coin(); vibrate(8);
          } else {
            self.rains++; self.combo = 0;
            self.score = Math.max(0, self.score - 20);
            self.floats.push({ x: it.x, y: by - 10, txt: "淋湿 −20", color: "#6C8FB5", life: 800 });
            Sound.fail(); vibrate([25, 40, 25]);
          }
          self.hud();
        } else if (it.y > self.H + 30) {
          self.items.splice(i, 1);
        }
      }

      /* 飘字 */
      for (var j = self.floats.length - 1; j >= 0; j--) {
        self.floats[j].life -= dt;
        self.floats[j].y -= dt / 22;
        if (self.floats[j].life <= 0) self.floats.splice(j, 1);
      }

      /* —— 绘制 —— */
      var g = ctx.createLinearGradient(0, 0, 0, self.H);
      g.addColorStop(0, "#BFDDE8"); g.addColorStop(1, "#EAF2DC");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, self.W, self.H);

      /* 远处云朵 */
      ctx.fillStyle = "rgba(255,255,255,.55)";
      for (var c2 = 0; c2 < 3; c2++) {
        var cx0 = ((ts / 90 + c2 * 160) % (self.W + 120)) - 60;
        var cy0 = 34 + c2 * 16;
        ctx.beginPath();
        ctx.arc(cx0, cy0, 17, 0, Math.PI * 2);
        ctx.arc(cx0 + 20, cy0 + 3, 13, 0, Math.PI * 2);
        ctx.arc(cx0 - 19, cy0 + 4, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      /* 掉落物 */
      for (var k = 0; k < self.items.length; k++) {
        var it2 = self.items[k];
        if (it2.kind === "sun") {
          var rg = ctx.createRadialGradient(it2.x, it2.y, 2, it2.x, it2.y, it2.r + 9);
          rg.addColorStop(0, "#FFE9A8"); rg.addColorStop(0.6, "#F5C542"); rg.addColorStop(1, "rgba(245,197,66,0)");
          ctx.fillStyle = rg;
          ctx.beginPath(); ctx.arc(it2.x, it2.y, it2.r + 9, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#F5B933";
          ctx.beginPath(); ctx.arc(it2.x, it2.y, it2.r, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = "#7FA6C9";
          ctx.beginPath();
          ctx.moveTo(it2.x, it2.y - it2.r);
          ctx.quadraticCurveTo(it2.x + it2.r, it2.y, it2.x, it2.y + it2.r);
          ctx.quadraticCurveTo(it2.x - it2.r, it2.y, it2.x, it2.y - it2.r);
          ctx.fill();
        }
      }

      /* 草地 */
      ctx.fillStyle = "#A9C486";
      ctx.fillRect(0, self.H - 16, self.W, 16);
      ctx.fillStyle = "#98B574";
      for (var gy = 0; gy < self.W; gy += 22) ctx.fillRect(gy, self.H - 16, 11, 16);

      /* 竹匾 + 纱布 */
      ctx.fillStyle = "#C8A05A";
      ctx.beginPath();
      ctx.ellipse(self.basketX, by + 10, 54, 15, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#E8DCC8";
      ctx.beginPath();
      ctx.ellipse(self.basketX, by + 9, 44, 10, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "#A67F3F";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(self.basketX, by + 10, 54, 15, 0, Math.PI, 0);
      ctx.stroke();

      /* 飘字 */
      ctx.textAlign = "center";
      ctx.font = "800 15px sans-serif";
      for (var f2 = 0; f2 < self.floats.length; f2++) {
        var fl = self.floats[f2];
        ctx.globalAlpha = Math.min(1, fl.life / 400);
        ctx.fillStyle = fl.color;
        ctx.fillText(fl.txt, fl.x, fl.y);
      }
      ctx.globalAlpha = 1;

      self.raf = requestAnimationFrame(self.loop);
    };
    this.lastTs = 0;
    this.raf = requestAnimationFrame(this.loop);

    /* 倒计时 */
    this.timer = setInterval(function () {
      self.timeLeft--;
      var t = $("#sunTime");
      if (t) {
        t.textContent = "⏱ " + Math.max(0, self.timeLeft) + "s";
        t.classList.toggle("urgent", self.timeLeft <= 8);
      }
      if (self.timeLeft <= 0) { self.stopAll(); self.finish(); }
    }, 1000);
  },

  hud: function () {
    var s = $("#sunScore"); if (s) s.textContent = "☀️ " + this.score;
    var c = $("#sunCombo"); if (c) c.textContent = "🔥 " + this.combo;
  },

  stopAll: function () {
    this.ended = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  },

  finish: function () {
    if (this.finished) return;
    this.finished = true;
    this.stopAll();
    var coins = Math.max(3, Math.round(this.score / 10) + 3);
    var d = Store.data;
    d.user.xp += coins;
    d.user.coins = (d.user.coins || 0) + Math.max(3, Math.round(coins / 2));
    d.coinsEarned = (d.coinsEarned || 0) + Math.max(3, Math.round(coins / 2));
    d.games.mud.push({ date: ds(), score: this.score, hits: this.hits, rains: this.rains, bestCombo: this.bestCombo });
    if (d.games.mud.length > 50) d.games.mud.shift();
    Store.save();
    renderStatus();
    unlockAchievement("mud_1");
    if (this.score >= 300) unlockAchievement("mud_100");
    GameHub.checkAllGames();

    var self = this;
    $("#gameStage").innerHTML = resultHTML(
      this.score >= 300 ? "🏆" : this.score >= 150 ? "☀️" : "🌤️",
      this.score + " 分",
      "接住 " + this.hits + " 束阳光 · 淋湿 " + this.rains + " 次<br>最高连击 " + this.bestCombo,
      [this.hits, this.bestCombo, this.score >= 300 ? "满分" : this.score + ""],
      ["接住阳光", "最高连击", "总分"],
      "✨ +" + coins + " 积分",
      "mud"
    );
    if (this.score >= 300) confetti(45);
    $("#mudAgain").onclick = function () { self.start(); };
    $("#mudDone").onclick = function () { $("#gameMask").classList.remove("show"); GameHub.render(); };
  }
};

/* ------------------------------------------ 3. 莨水配比（调色谜题 · 3 匹布 · 复原目标布色） */
var RhythmGame = {
  round: 0, total: 0, rounds: [], target: null, recipe: null, ended: true,
  MIX: { base: [232, 220, 200], dye: [166, 74, 48], mud: [56, 44, 40] },

  /* 配色模型：胚布 → 薯莨汁染红棕 → 河泥压深，浸染次数决定吃色深度 */
  mixColor: function (t, m, n) {
    var B = this.MIX.base, D = this.MIX.dye, M = this.MIX.mud;
    var k = 0.3 + 0.18 * n;
    var c = [];
    for (var i = 0; i < 3; i++) {
      var v = B[i] + (D[i] - B[i]) * Math.min(1, (t / 100) * k);
      v = v + (M[i] - v) * Math.min(1, (m / 100) * k);
      c.push(Math.round(v));
    }
    return c;
  },

  css: function (c) { return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"; },

  start: function () {
    this.ended = false;
    this.round = 0; this.total = 0; this.rounds = [];
    $("#gameMask").classList.add("show");
    this.next();
  },

  next: function () {
    if (this.round >= 3) return this.finish();
    this.round++;
    /* 每匹布的目标配方随机生成 */
    this.recipe = {
      t: 20 + Math.round(Math.random() * 60),   /* 薯莨汁浓度 */
      m: 10 + Math.round(Math.random() * 50),   /* 河泥浓度 */
      n: 1 + Math.floor(Math.random() * 4)      /* 浸染次数 */
    };
    this.target = this.mixColor(this.recipe.t, this.recipe.m, this.recipe.n);

    $("#gameStage").innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
        '<b style="font-size:18px">莨水配比</b>' +
        '<button class="btn btn-sm btn-ghost" id="rhQuit">退出</button>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;padding:0 4px">' +
        '<span style="font-size:12px;color:var(--ink-3)">第 <b style="color:var(--brand)">' + this.round + '</b> / 3 匹 · 总分 ' + this.total + '</span>' +
        '<span style="font-size:11px;color:var(--ink-3)">师傅说：照着这块布的颜色配莨水</span>' +
      '</div>' +
      '<div style="display:flex;gap:12px;margin-bottom:16px">' +
        '<div style="flex:1;text-align:center">' +
          '<div id="dyTarget" style="height:104px;border-radius:16px;border:3px solid var(--line-2);background:' + this.css(this.target) + ';box-shadow:var(--sh-1)"></div>' +
          '<div style="font-size:11px;color:var(--ink-3);margin-top:6px;font-weight:700">🎯 目标布色</div>' +
        '</div>' +
        '<div style="flex:1;text-align:center">' +
          '<div id="dyPrev" style="height:104px;border-radius:16px;border:3px dashed var(--brand);background:' + this.css(this.mixColor(0, 0, 1)) + ';box-shadow:var(--sh-1)"></div>' +
          '<div style="font-size:11px;color:var(--ink-3);margin-top:6px;font-weight:700">🪣 你的配比</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:14px;padding:0 6px">' +
        '<label style="display:flex;align-items:center;gap:10px"><span style="width:72px;font-size:12px;font-weight:800;color:var(--brand)">🪷 薯莨汁</span>' +
          '<input type="range" id="dyT" min="0" max="100" value="0" style="flex:1;accent-color:#A64A30"><b id="dyTv" style="width:36px;font-size:12px">0%</b></label>' +
        '<label style="display:flex;align-items:center;gap:10px"><span style="width:72px;font-size:12px;font-weight:800;color:#4A3B36">🟤 河泥</span>' +
          '<input type="range" id="dyM" min="0" max="100" value="0" style="flex:1;accent-color:#6B5648"><b id="dyMv" style="width:36px;font-size:12px">0%</b></label>' +
        '<label style="display:flex;align-items:center;gap:10px"><span style="width:72px;font-size:12px;font-weight:800;color:var(--amber)">🔁 浸染次数</span>' +
          '<input type="range" id="dyN" min="1" max="4" value="1" style="flex:1;accent-color:#D9AD71"><b id="dyNv" style="width:36px;font-size:12px">1 次</b></label>' +
      '</div>' +
      '<div id="dyHint" style="text-align:center;font-size:12px;color:var(--ink-3);margin:14px 0 6px;min-height:18px">拖动滑杆调出和目标一样的颜色，越接近分越高</div>' +
      '<button class="btn btn-primary btn-block" id="dyGo">确认浸染 ✓</button>';

    var self = this;
    $("#rhQuit").onclick = function () {
      self.ended = true;
      $("#gameMask").classList.remove("show");
      GameHub.render();
    };
    function upd() {
      var t = +$("#dyT").value, m = +$("#dyM").value, n = +$("#dyN").value;
      $("#dyTv").textContent = t + "%";
      $("#dyMv").textContent = m + "%";
      $("#dyNv").textContent = n + " 次";
      $("#dyPrev").style.background = self.css(self.mixColor(t, m, n));
    }
    ["dyT", "dyM", "dyN"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", upd);
    });
    $("#dyGo").onclick = function () { self.confirm(); };
  },

  confirm: function () {
    var t = +$("#dyT").value, m = +$("#dyM").value, n = +$("#dyN").value;
    var mine = this.mixColor(t, m, n);
    var dist = 0;
    for (var i = 0; i < 3; i++) dist += (mine[i] - this.target[i]) * (mine[i] - this.target[i]);
    dist = Math.sqrt(dist);
    var sc = Math.round(Math.max(0, 100 - dist / 4.4));
    this.total += sc;
    this.rounds.push(sc);

    /* 给一句调色方向提示 */
    var dl = (mine[0] + mine[1] + mine[2]) - (this.target[0] + this.target[1] + this.target[2]);
    var hint;
    if (sc >= 95) hint = "🏆 师傅点头：和目标几乎一模一样！";
    else if (Math.abs(dl) > 60) hint = dl > 0 ? "偏浅了，试试多浸染几次或加点河泥" : "偏深了，减一点河泥或浸染次数";
    else if (mine[0] - this.target[0] > 14) hint = "红过头了，薯莨汁放多了";
    else if (this.target[0] - mine[0] > 14) hint = "还不够红，再加点薯莨汁";
    else if (mine[2] - this.target[2] > 12) hint = "偏灰蓝，河泥可以少一点";
    else hint = "接近了，再微调一下滑杆";

    var self = this;
    $("#gameStage").innerHTML =
      '<div style="text-align:center;padding-top:26px">' +
        '<div style="font-size:56px">' + (sc >= 95 ? "🏆" : sc >= 80 ? "🎨" : "🫙") + '</div>' +
        '<div style="font-size:28px;font-weight:850;color:var(--brand-d);margin-top:8px">' + sc + ' 分</div>' +
        '<div style="font-size:12px;color:var(--ink-3);margin-top:6px">第 ' + this.round + ' 匹布 · 相似度 ' + sc + '% · 色差 Δ' + Math.round(dist) + '</div>' +
        '<div style="margin:14px auto 4px;max-width:280px;background:var(--green-soft);border-radius:12px;padding:10px 14px;font-size:13px;color:var(--ink-2)">' + hint + '</div>' +
        '<div style="font-size:12px;color:var(--ink-3);margin-top:10px">累计 ' + this.total + ' 分' + (this.round < 3 ? " · 还有 " + (3 - this.round) + " 匹" : "") + '</div>' +
        '<div class="rs-actions" style="margin-top:16px"><button class="btn btn-primary" id="dyNext">' + (this.round < 3 ? "下一匹布 →" : "查看成绩") + '</button></div>' +
      '</div>';
    if (sc >= 95) confetti(20);
    Sound.success();
    $("#dyNext").onclick = function () { self.next(); };
  },

  finish: function () {
    this.ended = true;
    var coins = Math.max(3, Math.round(this.total / 30) + 4);
    var d = Store.data;
    d.user.xp += coins;
    d.user.coins = (d.user.coins || 0) + Math.max(3, Math.round(coins / 2));
    d.coinsEarned = (d.coinsEarned || 0) + Math.max(3, Math.round(coins / 2));
    d.games.rhythm.push({ date: ds(), score: this.total, rounds: this.rounds, bestRound: Math.max.apply(null, this.rounds.concat([0])) });
    if (d.games.rhythm.length > 50) d.games.rhythm.shift();
    Store.save();
    renderStatus();
    unlockAchievement("rhythm_1");
    GameHub.checkAllGames();

    var grade = this.total >= 270 ? "S" : this.total >= 225 ? "A" : this.total >= 165 ? "B" : "C";
    var self = this;
    $("#gameStage").innerHTML = resultHTML(
      grade === "S" ? "🏆" : grade === "A" ? "🎉" : "🎨",
      grade + " 级 · " + this.total + " 分",
      "三匹布相似度：" + this.rounds.join("% / ") + "%",
      [this.rounds[0], this.rounds[1] || 0, this.rounds[2] || 0],
      ["第 1 匹", "第 2 匹", "第 3 匹"],
      "✨ +" + coins + " 积分",
      "rh"
    );
    if (grade === "S") confetti(36);
    $("#rhAgain").onclick = function () { self.start(); };
    $("#rhDone").onclick = function () { $("#gameMask").classList.remove("show"); GameHub.render(); };
  }
};

/* ---------------------------------------------------------------- 4. 工序排序 */
var SortGame = {
  order: [], current: 0, correct: 0, wrong: 0, score: 0,

  start: function () {
    this.current = 0; this.correct = 0; this.wrong = 0; this.score = 0;
    this.order = YS_SORT_STEPS.slice(); // 正确答案顺序
    $("#gameMask").classList.add("show");
    this.renderStep();
  },

  renderStep: function () {
    if (this.current >= this.order.length) return this.finish();
    var self = this;
    var target = this.order[this.current];
    // 生成选项：当前正确 + 干扰项
    var opts = [target];
    var pool = this.order.filter(function (s) { return s.id !== target.id; });
    for (var i = 0; i < 3 && i < pool.length; i++) opts.push(pool[i]);
    // 洗牌
    for (var j = opts.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = opts[j]; opts[j] = opts[k]; opts[k] = t;
    }

    $("#gameStage").innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
        '<b style="font-size:18px">工序排序</b>' +
        '<button class="btn btn-sm btn-ghost" id="sortQuit">退出</button>' +
      '</div>' +
      '<div class="pbar gold" style="margin-bottom:10px"><i style="width:' + (this.current / this.order.length * 100) + '%"></i></div>' +
      '<div style="font-size:12px;color:var(--ink-3);text-align:center;margin-bottom:20px">第 ' + (this.current + 1) + ' 步：选择正确的工序</div>' +
      '<div class="sort-target" style="text-align:center;margin-bottom:24px">' +
        '<div style="font-size:12px;color:var(--ink-3);margin-bottom:8px">接下来应该做什么？</div>' +
        '<div style="font-size:48px">' + target.ico + '</div>' +
      '</div>' +
      '<div id="sortOpts" style="display:flex;flex-direction:column;gap:10px">' +
        opts.map(function (o) {
          return '<button class="quiz-opt" data-id="' + o.id + '"><span class="k">' + o.ico + '</span><span>' + esc(o.name) + '<span class="sub" style="display:block;font-size:11px;color:var(--ink-3)">' + esc(o.desc) + '</span></span></button>';
        }).join("") +
      '</div>' +
      '<div id="sortFeedback" style="margin-top:14px"></div>';

    $("#sortQuit").onclick = function () { $("#gameMask").classList.remove("show"); GameHub.render(); };
    $$("#sortOpts .quiz-opt").forEach(function (b) {
      b.addEventListener("click", function () {
        var chosen = b.dataset.id;
        var ok = chosen === target.id;
        var opts2 = $$("#sortOpts .quiz-opt");
        opts2.forEach(function (o) {
          o.disabled = true;
          if (o.dataset.id === target.id) o.classList.add("right");
          else if (o.dataset.id === chosen && !ok) o.classList.add("wrong");
        });
        if (ok) {
          self.correct++; self.score += 20;
          Sound.success(); vibrate(10);
          $("#sortFeedback").innerHTML = '<div class="card" style="background:var(--green-soft)"><b style="color:var(--green)">✓ 正确！</b><span style="font-size:13px;color:var(--ink-2)"> ' + esc(target.desc) + '</span></div>';
        } else {
          self.wrong++;
          Sound.fail(); vibrate([20,50,20]);
          $("#sortFeedback").innerHTML = '<div class="card" style="background:var(--red-soft)"><b style="color:var(--red)">✗ 答错了</b><span style="font-size:13px;color:var(--ink-2)"> 正确是「' + esc(target.name) + '」</span></div>';
        }
        setTimeout(function () {
          self.current++;
          self.renderStep();
        }, 1500);
      });
    });
  },

  finish: function () {
    var coins = Math.round(this.score / 6);
    var d = Store.data;
    d.user.xp += coins;
    d.user.coins = (d.user.coins || 0) + Math.max(3, Math.round(coins / 2));
    d.coinsEarned = (d.coinsEarned || 0) + Math.max(3, Math.round(coins / 2));
    d.games.sort.push({ date: ds(), score: this.score, correct: this.correct, total: this.order.length });
    if (d.games.sort.length > 50) d.games.sort.shift();
    Store.save();
    renderStatus();
    unlockAchievement("sort_1");
    GameHub.checkAllGames();

    var self = this;
    $("#gameStage").innerHTML = resultHTML(
      this.correct === this.order.length ? "🏆" : this.correct >= 4 ? "🎉" : "💪",
      this.score + " 分",
      "正确 " + this.correct + " / " + this.order.length + " 步 · 错误 " + this.wrong + " 次",
      [this.correct, this.wrong, Math.round(this.correct / this.order.length * 100) + "%"],
      ["正确", "错误", "正确率"],
      "✨ +" + coins + " 积分",
      "sort"
    );
    if (this.correct === this.order.length) confetti(40);
    $("#sortAgain").onclick = function () { self.start(); };
    $("#sortDone").onclick = function () { $("#gameMask").classList.remove("show"); GameHub.render(); };
  }
};

/* ---------------------------------------------------------------- 5. 翻牌记忆 */
var MemoryGame = {
  cards: [], first: null, second: null, matched: 0, steps: 0, score: 0, locked: false,

  start: function () {
    this.first = null; this.second = null; this.matched = 0; this.steps = 0; this.score = 0; this.locked = false;
    // 8 张牌（4 对香云纱图案）
    var emojis = ["🧵", "🫙", "☀️", "🖐️", "💧", "📦"];
    var chosen = emojis.slice(0, 4);
    var pairs = chosen.concat(chosen);
    // 洗牌
    for (var i = pairs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pairs[i]; pairs[i] = pairs[j]; pairs[j] = t;
    }
    this.cards = pairs.map(function (e, idx) { return { id: idx, emoji: e, flipped: false, matched: false }; });

    $("#gameMask").classList.add("show");
    this.render();
  },

  render: function () {
    var self = this;
    var grid = this.cards.map(function (c, i) {
      var cls = "memory-card";
      if (c.flipped || c.matched) cls += " flipped";
      if (c.matched) cls += " matched";
      return '<div class="memory-card ' + cls + '" data-i="' + i + '" style="aspect-ratio:1;border-radius:14px;background:var(--brand);display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;transition:all .3s;box-shadow:var(--sh-1)">' +
        (c.flipped || c.matched ? c.emoji : '❓') +
      '</div>';
    }).join("");

    $("#gameStage").innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
        '<b style="font-size:18px">翻牌记忆</b>' +
        '<button class="btn btn-sm btn-ghost" id="memQuit">退出</button>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-around;margin-bottom:16px">' +
        '<div style="text-align:center"><div style="font-size:20px;font-weight:800" id="memSteps">0</div><div style="font-size:11px;color:var(--ink-3)">步数</div></div>' +
        '<div style="text-align:center"><div style="font-size:20px;font-weight:800;color:var(--amber)" id="memMatched">0/4</div><div style="font-size:11px;color:var(--ink-3)">已配对</div></div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">' + grid + '</div>';

    $("#memQuit").onclick = function () { $("#gameMask").classList.remove("show"); GameHub.render(); };
    $$("#gameStage .memory-card").forEach(function (card) {
      card.addEventListener("click", function () { self.flip(+card.dataset.i); });
    });
  },

  flip: function (i) {
    if (this.locked) return;
    var c = this.cards[i];
    if (c.flipped || c.matched) return;

    c.flipped = true;

    if (this.first === null) {
      this.first = i;
      this.render();
    } else {
      this.second = i;
      this.steps++;
      this.render();
      // 检查是否匹配
      var a = this.cards[this.first], b = this.cards[this.second];
      if (a.emoji === b.emoji) {
        a.matched = true; b.matched = true;
        this.matched++;
        this.score += 50;
        this.first = null; this.second = null;
        Sound.success(); vibrate(10);
        if (this.matched === 4) { setTimeout(this.finish.bind(this), 600); }
        else { this.render(); }
      } else {
        this.locked = true;
        Sound.fail();
        var self = this;
        setTimeout(function () {
          a.flipped = false; b.flipped = false;
          self.first = null; self.second = null;
          self.locked = false;
          self.render();
        }, 800);
      }
    }
  },

  finish: function () {
    // 步数越少分越高：基准 200 + 剩余步数奖励（理想 4 步，多一步扣 10）
    var bonus = Math.max(0, 200 - (this.steps - 4) * 20);
    this.score = 200 + bonus;
    var coins = Math.round(this.score / 8);
    var d = Store.data;
    d.user.xp += coins;
    d.user.coins = (d.user.coins || 0) + Math.max(3, Math.round(coins / 2));
    d.coinsEarned = (d.coinsEarned || 0) + Math.max(3, Math.round(coins / 2));
    d.games.memory.push({ date: ds(), score: this.score, steps: this.steps });
    if (d.games.memory.length > 50) d.games.memory.shift();
    Store.save();
    renderStatus();
    unlockAchievement("memory_1");
    GameHub.checkAllGames();

    var self = this;
    $("#gameStage").innerHTML = resultHTML(
      this.steps <= 6 ? "🏆" : "🎉",
      this.score + " 分",
      "用 " + this.steps + " 步完成全部配对",
      [this.steps, this.score, coins],
      ["步数", "总分", "获得积分"],
      "✨ +" + coins + " 积分",
      "mem"
    );
    if (this.steps <= 6) confetti(40);
    $("#memAgain").onclick = function () { self.start(); };
    $("#memDone").onclick = function () { $("#gameMask").classList.remove("show"); GameHub.render(); };
  }
};

/* ---------------------------------------------------------------- 6. 晒莨节奏（4 轨道下落式） */
var LaneGame = {
  score: 0, combo: 0, hits: 0, miss: 0, running: false,
  time: 30, notes: [], timers: [], raf: null, spawnId: null,
  /* 判定几何：舞台高 340，判定线 bottom:56 → 线中心 y≈282；
     音符 top:-40 + translateY(y) + 半高20 → 中心 y-20；故音符到线需 y≈302。
     命中规则：点对该轨道、且音符仍在场上即命中（休闲玩法，不苛求精准时机）；
     越接近判定线(HIT_Y)得分越高；只有该轨道此刻没有音符(乱按)才算错。 */
  HIT_Y: 302, HIT_MIN_Y: -45, MISS_Y: 358,

  start: function () {
    this.score = 0; this.combo = 0; this.hits = 0; this.miss = 0;
    this.running = true; this.notes = []; this.timers = []; this.time = 30;
    $("#gameMask").classList.add("show");
    $("#gameStage").innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
        '<b style="font-size:18px">晒莨节奏</b>' +
        '<button class="btn btn-sm btn-ghost" id="laneQuit">退出</button></div>' +
      '<div style="display:flex;justify-content:space-around;margin-bottom:12px">' +
        '<div style="text-align:center"><div style="font-size:20px;font-weight:800" id="laneScore">0</div><div style="font-size:11px;color:var(--ink-3)">分数</div></div>' +
        '<div style="text-align:center"><div style="font-size:20px;font-weight:800;color:var(--amber)" id="laneCombo">0</div><div style="font-size:11px;color:var(--ink-3)">连击</div></div>' +
        '<div style="text-align:center"><div style="font-size:20px;font-weight:800" id="laneTime">30</div><div style="font-size:11px;color:var(--ink-3)">剩余秒</div></div>' +
      '</div>' +
      '<div id="laneStage" style="position:relative;height:340px;border-radius:20px;overflow:hidden;background:linear-gradient(180deg,#B9CBA4,#8FAE7B);border:1px solid var(--line)">' +
        // 4 条轨道
        '<div style="position:absolute;inset:0;display:grid;grid-template-columns:repeat(4,1fr)">' +
          [0,1,2,3].map(function (i) { return '<div style="border-right:' + (i<3?'1px dashed rgba(255,255,255,.4)':'none') + '"></div>'; }).join("") +
        '</div>' +
        // 判定线
        '<div style="position:absolute;left:0;right:0;bottom:56px;height:3px;background:rgba(217,173,113,.9)"></div>' +
        '<div id="laneNotes"></div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px">' +
        ["🍃","☀️","💧","🧵"].map(function (ico, i) {
          var c = ["#667B55","#D9A23B","#4C7A78","#83533B"][i];
          return '<button class="lane-btn btn" data-lane="' + i + '" style="height:60px;font-size:24px;padding:0;background:' + c + ';color:#fff;border:none;box-shadow:0 3px 8px rgba(0,0,0,.18)">' + ico + '</button>';
        }).join("") +
      '</div>';

    var self = this;
    $("#laneQuit").onclick = function () { self.stop(); $("#gameMask").classList.remove("show"); GameHub.render(); };
    $$("#gameStage .lane-btn").forEach(function (b) {
      b.addEventListener("pointerdown", function (e) { e.preventDefault(); self.hit(+b.dataset.lane); });
    });
    this.spawnLoop();
    this.tick();
  },

  spawnLoop: function () {
    var self = this;
    var laneIcons = ["🍃", "☀️", "💧", "🧵"];
    var laneColors = ["#667B55", "#D9A23B", "#4C7A78", "#83533B"];
    this.spawnId = setInterval(function () {
      if (!self.running) return;
      var lane = Math.floor(Math.random() * 4);
      var n = el("div", "lane-note", laneIcons[lane]);
      n.dataset.lane = lane;
      n.style.cssText = "position:absolute;top:-40px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:26px;" +
        "left:calc(" + lane + " * 25% + 12.5% - 20px);transition:none;z-index:2;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25));" +
        "background:" + laneColors[lane] + ";border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.2)";
      $("#laneNotes").appendChild(n);
      self.notes.push({ el: n, lane: lane, y: -40, hit: false });
      self.moveNote(self.notes[self.notes.length - 1]);
    }, 560);
  },

  moveNote: function (note) {
    var self = this;
    var t0 = performance.now();
    function step() {
      if (!self.running || note.hit || !note.el.parentNode) return;
      var dt = (performance.now() - t0) / 1000;
      note.y = -40 + dt * 170; // 下落速度 170px/s
      note.el.style.transform = "translateY(" + note.y + "px)";
      // 音符越过判定线（线中心 y≈282，音符中心 y-20）后才算错过，避免"没到线就消失"
      if (note.y > self.MISS_Y) {
        note.hit = true;
        if (note.el.parentNode) note.el.remove();
        self.combo = 0; self.miss++;
        self.updateHud();
      } else {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  },

  hit: function (lane) {
    if (!this.running) return;
    var self = this;
    // 找该轨道仍在场上、且最靠近判定线的音符
    var best = null, bestDist = 1e9;
    this.notes.forEach(function (n) {
      if (n.hit || n.lane !== lane) return;
      if (n.y < self.HIT_MIN_Y || n.y > self.MISS_Y) return; // 还没出现/已越过判定线
      var d = Math.abs(n.y - self.HIT_Y);
      if (d < bestDist) { bestDist = d; best = n; }
    });
    if (best) {
      // 点对图标即命中；越接近判定线分越高（精准 150，普通 100）
      var base = bestDist <= 45 ? 150 : 100;
      best.hit = true;
      if (best.el.parentNode) best.el.remove();
      this.combo++; this.hits++;
      this.score += base + this.combo * 10;
      Sound.rep();
      vibrate(8);
      this.flashLane(bestDist <= 45 ? "完美!" : "✓", "var(--green)");
    } else {
      this.combo = 0; this.miss++;
      Sound.fail();
      this.flashLane("✗", "var(--red)");
    }
    this.updateHud();
  },

  flashLane: function (txt, color) {
    var st = $("#laneStage");
    if (!st) return;
    var n = el("div", "", txt);
    n.style.cssText = "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:34px;font-weight:800;color:" + color + ";pointer-events:none;z-index:5;animation:pop .3s";
    st.appendChild(n);
    setTimeout(function () { if (n.parentNode) n.remove(); }, 400);
  },

  updateHud: function () {
    var s = $("#laneScore"); if (s) s.textContent = this.score;
    var c = $("#laneCombo"); if (c) c.textContent = this.combo;
  },

  tick: function () {
    var self = this;
    var t0 = performance.now();
    this.raf = setInterval(function () {
      if (!self.running) return;
      var left = Math.max(0, 30 - Math.floor((performance.now() - t0) / 1000));
      self.time = left;
      var el2 = $("#laneTime"); if (el2) el2.textContent = left;
      if (left <= 0) self.finish();
    }, 200);
  },

  stop: function () {
    this.running = false;
    if (this.spawnId) clearInterval(this.spawnId);
    if (this.raf) clearInterval(this.raf);
    this.notes.forEach(function (n) { if (n.el && n.el.parentNode) n.el.remove(); });
  },

  finish: function () {
    this.stop();
    var coins = Math.round(this.score / 12) + 5;
    var d = Store.data;
    d.user.xp += coins;
    d.user.coins = (d.user.coins || 0) + Math.max(3, Math.round(coins / 2));
    d.coinsEarned = (d.coinsEarned || 0) + Math.max(3, Math.round(coins / 2));
    d.games.lane.push({ date: ds(), score: this.score, hits: this.hits, miss: this.miss });
    if (d.games.lane.length > 50) d.games.lane.shift();
    Store.save();
    renderStatus();
    unlockAchievement("lane_1");

    var self = this;
    $("#gameStage").innerHTML = resultHTML(
      this.hits >= 20 ? "🏆" : "🍂",
      this.score + " 分",
      "命中 " + this.hits + " · 错过 " + this.miss,
      [this.hits, this.miss, Math.round(this.hits / (this.hits + this.miss || 1) * 100) + "%"],
      ["命中", "错过", "命中率"],
      "✨ +" + coins + " 积分",
      "lane"
    );
    if (this.hits >= 20) confetti(40);
    $("#laneAgain").onclick = function () { self.start(); };
    $("#laneDone").onclick = function () { $("#gameMask").classList.remove("show"); GameHub.render(); };
  }
};

/* 供首页 Banner「去晒莨抢晴」深链直达 */
window.MudGameStart = function () { try { MudGame.start(); } catch (e) { console.warn("MudGameStart", e); } };
