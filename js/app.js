/* 画面の動き。ビルド不要。index.html を開くだけで動く。 */
(function () {
  'use strict';

  var KEY = 'ainyumon.progress.v1';
  var C = window.COURSE;
  var app = document.getElementById('app');
  var pager = document.getElementById('pager');
  var crumb = document.getElementById('crumb');
  var fill = document.getElementById('progress-fill');
  var mem = {};
  var storageOK = true;

  /* ---------- 進み具合の保存 ---------- */
  function load() {
    try {
      var s = localStorage.getItem(KEY);
      mem = s ? JSON.parse(s) : {};
    } catch (e) { storageOK = false; mem = {}; }
    if (!mem.lessons) mem.lessons = {};
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(mem)); }
    catch (e) { storageOK = false; }
  }
  function lp(id) {
    if (!mem.lessons[id]) mem.lessons[id] = { step: 1, done: false, checks: [], form: null, chips: [] };
    return mem.lessons[id];
  }

  /* ---------- ふりがな（各画面で最初の1回だけ） ---------- */
  var RUBY = [
    ['個人情報', 'こじんじょうほう'], ['予定表', 'よていひょう'], ['入力欄', 'にゅうりょくらん'],
    ['注文書', 'ちゅうもんしょ'], ['貼り付け', 'はりつけ'], ['作り話', 'つくりばなし'],
    ['予算', 'よさん'], ['条件', 'じょうけん'], ['完了', 'かんりょう'], ['旅行', 'りょこう'],
    ['荷物', 'にもつ'], ['会話', 'かいわ'], ['送信', 'そうしん']
  ];
  var SKIP = /^(PRE|TEXTAREA|INPUT|SELECT|OPTION|BUTTON|RUBY|RT|SCRIPT)$/;

  function skipNode(n) {
    for (var p = n.parentNode; p && p !== document.body; p = p.parentNode) {
      if (SKIP.test(p.nodeName)) return true;
      if (p.classList && p.classList.contains('noruby')) return true;
    }
    return false;
  }
  function rubyNode(node, seen) {
    var text = node.nodeValue, best = -1, term = null, i;
    for (i = 0; i < RUBY.length; i++) {
      if (seen[RUBY[i][0]]) continue;
      var at = text.indexOf(RUBY[i][0]);
      if (at >= 0 && (best < 0 || at < best)) { best = at; term = RUBY[i]; }
    }
    if (!term) return;
    seen[term[0]] = true;
    var r = document.createElement('ruby');
    r.appendChild(document.createTextNode(term[0]));
    var rt = document.createElement('rt');
    rt.textContent = term[1];
    r.appendChild(rt);
    var after = document.createTextNode(text.slice(best + term[0].length));
    var parent = node.parentNode;
    parent.insertBefore(document.createTextNode(text.slice(0, best)), node);
    parent.insertBefore(r, node);
    parent.insertBefore(after, node);
    parent.removeChild(node);
    rubyNode(after, seen);
  }
  function applyRuby(root) {
    var seen = {}, nodes = [];
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    while (w.nextNode()) { if (!skipNode(w.currentNode)) nodes.push(w.currentNode); }
    nodes.forEach(function (n) { rubyNode(n, seen); });
  }

  /* ---------- コピー ---------- */
  function copyText(text, msg) {
    function ok() {
      msg.textContent = 'コピーしました';
      setTimeout(function () { msg.textContent = ''; }, 2500);
    }
    function ng() { msg.textContent = '自動でコピーできませんでした。文を長押しして選んでください。'; }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      var done = false;
      try { done = document.execCommand('copy'); } catch (e) { done = false; }
      document.body.removeChild(ta);
      if (done) ok(); else ng();
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else {
      fallback();
    }
  }

  /* ---------- 部品 ---------- */
  function lessonById(id) {
    for (var i = 0; i < C.lessons.length; i++) if (C.lessons[i].id === id) return C.lessons[i];
    return null;
  }
  function setProgress(n, total) { fill.style.width = (total ? Math.round(n / total * 100) : 0) + '%'; }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function storageNote() {
    return storageOK ? '' : '<p class="note warn">このブラウザでは、進み具合を保存できません。ページを閉じると、はじめからになります。</p>';
  }

  function widgetForm(L) {
    var st = lp(L.id);
    var f = st.form || { dest: '', days: '1泊2日', budget: '', who: '2人で' };
    var dest = document.getElementById('f-dest'), days = document.getElementById('f-days'),
        budget = document.getElementById('f-budget'), who = document.getElementById('f-who');
    var box = document.getElementById('gen-form');
    var pre = box.querySelector('pre'), btn = box.querySelector('[data-copy]');
    dest.value = f.dest; days.value = f.days; budget.value = f.budget; who.value = f.who;
    function update() {
      var d = dest.value.trim(), b = budget.value.trim();
      st.form = { dest: d, days: days.value, budget: b, who: who.value };
      save();
      pre.textContent = 'あなたは旅行プランナーです。' + who.value + '行く' +
        (d || '（行き先を入れてください）') + 'の' + days.value + 'の旅行の予定表を作ってください。予算は全部で' +
        (b || '（予算を入れてください）') + 'です。時間ごとの表にしてください。';
      btn.disabled = !(d && b);
    }
    [dest, days, budget, who].forEach(function (el) { el.addEventListener('input', update); });
    update();
  }

  function widgetChips(L, step) {
    var st = lp(L.id);
    var list = document.getElementById('chip-list');
    var box = document.getElementById('gen-chips');
    var pre = box.querySelector('pre'), btn = box.querySelector('[data-copy]');
    var on = st.chips || [];
    step.chips.forEach(function (text, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = text;
      b.setAttribute('aria-pressed', on.indexOf(i) >= 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        var at = on.indexOf(i);
        if (at >= 0) on.splice(at, 1); else on.push(i);
        on.sort();
        st.chips = on;
        save();
        b.setAttribute('aria-pressed', at >= 0 ? 'false' : 'true');
        update();
      });
      list.appendChild(b);
    });
    function update() {
      if (!on.length) {
        pre.textContent = '上のボタンを1つ以上えらんでください。';
        btn.disabled = true;
        return;
      }
      pre.textContent = 'ありがとうございます。次の条件を足して、予定表を作り直してください。\n' +
        on.map(function (i) { return '・' + step.chips[i]; }).join('\n');
      btn.disabled = false;
    }
    update();
  }

  function widgetChecks(L, step) {
    var st = lp(L.id);
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<ul class="checks"></ul>' +
      '<button type="button" class="primary" id="done-btn">完了にする</button>' +
      '<div id="done-msg" aria-live="polite"></div>' +
      '<p class="note">これは、自分で確認する方式です。アプリが自動でチェックしているわけではありません。</p>';
    app.appendChild(wrap);
    var ul = wrap.querySelector('ul'), btn = wrap.querySelector('#done-btn'), msg = wrap.querySelector('#done-msg');
    var boxes = step.checks.map(function (text, i) {
      var li = document.createElement('li');
      var label = document.createElement('label');
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = !!(st.checks && st.checks[i]);
      var span = document.createElement('span');
      span.textContent = text;
      label.appendChild(cb);
      label.appendChild(span);
      li.appendChild(label);
      ul.appendChild(li);
      cb.addEventListener('change', function () {
        st.checks = boxes.map(function (b) { return b.checked; });
        save();
        refresh();
      });
      return cb;
    });
    function showDone() {
      msg.innerHTML = '<div class="card goal"><b>レッスン0　完了です。おつかれさまでした。</b><br>' +
        '次は、レッスン1（準備中）です。ここから先は、PCが必要になります。</div>' +
        '<button type="button" id="to-toc">目次にもどる</button>';
      msg.querySelector('#to-toc').addEventListener('click', function () { go('#/'); });
      applyRuby(msg);
    }
    function refresh() {
      var all = boxes.every(function (b) { return b.checked; });
      btn.disabled = !all || st.done;
      btn.textContent = st.done ? '完了しました' : '完了にする';
      if (st.done) showDone();
    }
    btn.addEventListener('click', function () {
      st.done = true;
      save();
      refresh();
    });
    refresh();
  }

  /* ---------- 画面 ---------- */
  function renderToc() {
    crumb.textContent = C.title;
    setProgress(0, 1);
    var html = '<h1>' + C.title + '</h1><p>' + C.subtitle + '</p>' + storageNote();
    var l0 = lp('l0');
    if (mem.last && !l0.done && l0.step > 1) {
      html += '<div class="banner"><span>前回のつづきがあります（ステップ ' + l0.step + '）</span>' +
        '<button type="button" class="primary" data-go="#/l0/' + l0.step + '">つづきから</button></div>';
    }
    html += '<ul class="toc-list">';
    C.lessons.forEach(function (L) {
      if (L.ready === false) {
        html += '<li><div class="toc-item off"><span class="state">準備中</span>' +
          '<span class="tag pc">PCが必要（予定）</span><br>レッスン' + L.no + '　' + L.title +
          '<small>仮の題名です</small></div></li>';
      } else {
        var label = l0.done ? '完了' : (l0.step > 1 ? '進行中 ' + l0.step + '/' + L.steps.length : 'はじめる');
        html += '<li><button type="button" class="toc-item" data-go="#/' + L.id + '/' + (l0.done ? 1 : l0.step) + '">' +
          '<span class="state">' + label + '</span>' +
          '<span class="tag real">' + L.devices + 'でOK</span><br>レッスン' + L.no + '　' + L.title +
          '<small>約' + L.minutes + '分　' + L.short + '</small></button></li>';
      }
    });
    html += '</ul>';
    app.innerHTML = html;
    pager.innerHTML = '';
    applyRuby(app);
  }

  function renderStep(id, n) {
    var L = lessonById(id);
    if (!L || !L.steps) { go('#/'); return; }
    var total = L.steps.length;
    n = Math.max(1, Math.min(total, n || 1));
    var step = L.steps[n - 1];
    var st = lp(L.id);
    st.step = n;
    mem.last = { lesson: L.id, step: n };
    save();

    crumb.textContent = 'レッスン' + L.no + '　' + n + ' / ' + total;
    setProgress(n, total);

    var tagClass = step.kind === 'real' ? 'real' : (step.kind === 'sample' ? 'sample' : '');
    var html = storageNote() + '<span class="tag ' + tagClass + '">' + step.tag + '</span>' +
      '<h1>' + step.title + '</h1>' + step.html;
    if (step.help && step.help.length) {
      html += '<div class="helpwrap"><h2>困ったとき</h2>' + step.help.map(function (h) {
        return '<details class="help"><summary>' + h.q + '</summary><div>' + h.a + '</div></details>';
      }).join('') + '</div>';
    }
    app.innerHTML = html;

    if (step.widget === 'form') widgetForm(L);
    if (step.widget === 'chips') widgetChips(L, step);
    if (step.widget === 'checks') {
      /* チェックは「困ったとき」より上に置く */
      var help = app.querySelector('.helpwrap');
      widgetChecks(L, step);
      var wrap = app.lastElementChild;
      if (help) app.insertBefore(wrap, help);
    }

    pager.innerHTML =
      (n > 1 ? '<button type="button" data-go="#/' + L.id + '/' + (n - 1) + '">← 前へ</button>'
             : '<button type="button" data-go="#/">← 目次</button>') +
      (n < total ? '<button type="button" class="primary" data-go="#/' + L.id + '/' + (n + 1) + '">次へ →</button>'
                 : '<button type="button" data-go="#/">目次へ</button>');

    applyRuby(app);
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  function route() {
    var m = /^#\/(l\d+)\/(\d+)$/.exec(location.hash);
    if (m) renderStep(m[1], parseInt(m[2], 10)); else renderToc();
  }

  /* ---------- イベント ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-go]') : null;
    if (t) { go(t.getAttribute('data-go')); return; }
    var c = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (c && !c.disabled) {
      var box = c.closest('.copybox');
      copyText(box.querySelector('pre').textContent, box.querySelector('.msg'));
    }
  });
  document.getElementById('btn-toc').addEventListener('click', function () { go('#/'); });
  window.addEventListener('hashchange', route);
  document.addEventListener('keydown', function (e) {
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.nodeName)) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var b = pager.querySelectorAll('button');
    if (!b.length) return;
    (e.key === 'ArrowLeft' ? b[0] : b[b.length - 1]).click();
  });

  load();
  route();
})();
