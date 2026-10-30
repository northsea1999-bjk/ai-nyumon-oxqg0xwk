/* 画面の動き。ビルド不要。index.html を開くだけで動く。 */
(function () {
  'use strict';

  var KEY = 'ainyumon.progress.v1';
  var LANG_KEY = 'ainyumon.lang.v1';
  var C = window.COURSE;
  var K = window.COURSE_KO || { lessons: {} };
  var app = document.getElementById('app');
  var pager = document.getElementById('pager');
  var crumb = document.getElementById('crumb');
  var fill = document.getElementById('progress-fill');
  var langBtn = document.getElementById('btn-lang');
  var mem = {};
  var storageOK = true;

  /* 言語ボタンは常に表示。はじめは日本語。選んだ言語はこの端末のブラウザに覚えておく。
     古い ?ko=1 のアドレスで開いたときは、はじめから韓国語にする。 */
  var koAllowed = true;
  var lang = 'ja';
  var saved = null;
  try { saved = localStorage.getItem(LANG_KEY); } catch (e) { saved = null; }
  if (saved === 'ko' || saved === 'ja') lang = saved;
  else if (/[?&]ko=1(&|$)/.test(location.search)) lang = 'ko';

  /* 画面まわりの短い文言 */
  var UI = {
    ja: {
      toc: '目次', tocBack: '← 目次', tocTo: '目次へ', tocReturn: '目次にもどる',
      prev: '← 前へ', next: '次へ →', help: '困ったとき',
      lesson: 'レッスン', ready: '準備中', pc: 'PCが必要（予定）', temp: '仮の題名です',
      start: 'はじめる', done: '完了',
      doing: function (n, t) { return '進行中 ' + n + '/' + t; },
      resume: function (n, no) { return '前回のつづきがあります（レッスン' + no + '・ステップ ' + n + '）'; },
      pcNeed: 'PCが必要',
      resumeBtn: 'つづきから',
      okOn: 'でOK', about: '約', min: '分',
      copied: 'コピーしました',
      copyFail: '自動でコピーできませんでした。文を長押しして選んでください。',
      noStore: 'このブラウザでは、進み具合を保存できません。ページを閉じると、はじめからになります。',
      chipNone: '上のボタンを1つ以上えらんでください。',
      quizOk: '正解です！', quizNg: 'おしい！ もう一度、選んでみましょう。',
      doneBtn: '完了にする', doneDone: '完了しました',
      checkNote: 'これは、自分で確認する方式です。アプリが自動でチェックしているわけではありません。',
      doneCard: '<b>レッスン0　完了です。おつかれさまでした。</b><br>次は、レッスン1に進みます。レッスン1からは、PCが必要になります。',
      langBtn: '한국어', koBanner: ''
    },
    ko: {
      toc: '목차', tocBack: '← 목차', tocTo: '목차로', tocReturn: '목차로 돌아가기',
      prev: '← 이전', next: '다음 →', help: '곤란할 때',
      lesson: '레슨', ready: '준비 중', pc: 'PC 필요(예정)', temp: '임시 제목입니다',
      start: '시작하기', done: '완료',
      doing: function (n, t) { return '진행 중 ' + n + '/' + t; },
      resume: function (n, no) { return '지난번 이어서 하기가 있습니다(레슨' + no + ' · 단계 ' + n + ')'; },
      pcNeed: 'PC 필요',
      resumeBtn: '이어서 하기',
      okOn: ' 모두 OK', about: '약 ', min: '분',
      copied: '복사했습니다',
      copyFail: '자동으로 복사하지 못했습니다. 문장을 길게 눌러 선택하세요.',
      noStore: '이 브라우저에서는 진행 상황을 저장할 수 없습니다. 페이지를 닫으면 처음부터 시작합니다.',
      chipNone: '위 버튼을 1개 이상 고르세요.',
      quizOk: '정답입니다!', quizNg: '아쉬워요! 다시 골라 보세요.',
      doneBtn: '완료로 하기', doneDone: '완료했습니다',
      checkNote: '이것은 스스로 확인하는 방식입니다. 앱이 자동으로 검사하는 것은 아닙니다.',
      doneCard: '<b>레슨0　완료입니다. 수고하셨습니다.</b><br>다음은 레슨1로 진행합니다. 레슨1부터는 PC가 필요합니다.',
      langBtn: '日本語',
      koBanner: '<p class="note dev">한국어 보기입니다. 일본어 화면의 뜻을 옮긴 것이며, 기준은 일본어입니다. 부탁하는 글은 AI에 붙여 넣을 때 일본어 그대로 쓰입니다.</p>'
    }
  };
  function t(key) { return UI[lang][key]; }

  var KO_WHO = { 'ひとりで': '혼자', '2人で': '둘이서', '家族で': '가족과', '友だちと': '친구와' };
  var KO_DAYS = { '日帰り': '당일치기', '1泊2日': '1박 2일', '2泊3日': '2박 3일' };

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

  /* ---------- ふりがな（日本語表示のとき、各画面で最初の1回だけ） ---------- */
  var RUBY = [
    ['個人情報', 'こじんじょうほう'], ['予定表', 'よていひょう'], ['入力欄', 'にゅうりょくらん'],
    ['注文書', 'ちゅうもんしょ'], ['貼り付け', 'はりつけ'], ['作り話', 'つくりばなし'],
    ['自己紹介', 'じこしょうかい'], ['再起動', 'さいきどう'], ['管理者', 'かんりしゃ'],
    ['使用許諾', 'しようきょだく'], ['作業環境', 'さぎょうかんきょう'], ['有料', 'ゆうりょう'],
    ['予算', 'よさん'], ['条件', 'じょうけん'], ['完了', 'かんりょう'], ['旅行', 'りょこう'],
    ['荷物', 'にもつ'], ['会話', 'かいわ'], ['送信', 'そうしん'], ['実行', 'じっこう'],
    ['起動', 'きどう'], ['許可', 'きょか'], ['移動', 'いどう'], ['保存', 'ほぞん'],
    ['設定', 'せってい'], ['確認', 'かくにん'], ['手順', 'てじゅん'], ['作業', 'さぎょう'],
    ['料金', 'りょうきん'], ['信頼', 'しんらい'], ['架空', 'かくう'], ['支払い', 'しはらい'],
    ['取扱説明書', 'とりあつかいせつめいしょ'], ['家計簿', 'かけいぼ'], ['合計', 'ごうけい'],
    ['金額', 'きんがく'], ['一覧', 'いちらん'], ['上書き', 'うわがき'], ['予定', 'よてい'],
    ['電卓', 'でんたく'], ['計算', 'けいさん']
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
    if (lang !== 'ja') return;
    var seen = {}, nodes = [];
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    while (w.nextNode()) { if (!skipNode(w.currentNode)) nodes.push(w.currentNode); }
    nodes.forEach(function (n) { rubyNode(n, seen); });
  }

  /* ---------- コピー ---------- */
  function copyText(text, msg) {
    function ok() {
      msg.textContent = t('copied');
      setTimeout(function () { msg.textContent = ''; }, 2500);
    }
    function ng() { msg.textContent = t('copyFail'); }
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
  /* いまの言語の表示内容（韓国語がなければ日本語のまま） */
  function koLesson(id) { return (K.lessons && K.lessons[id]) || {}; }
  function view(L, step) {
    if (lang !== 'ko') return step;
    var k = (koLesson(L.id).steps || {})[step.id];
    if (!k) return step;
    return {
      id: step.id, kind: step.kind, widget: step.widget, tag: k.tag, title: k.title, html: k.html,
      help: k.help || step.help, chips: step.chips, chipsKo: k.chips, checks: k.checks || step.checks,
      required: k.required || step.required, quiz: k.quiz || step.quiz
    };
  }
  function doneCardOf(L) {
    if (lang === 'ko') return koLesson(L.id).doneCard || t('doneCard');
    return L.doneCard || t('doneCard');
  }
  function lessonTitle(L) { return (lang === 'ko' && koLesson(L.id).title) || L.title; }
  function lessonShort(L) { return (lang === 'ko' && koLesson(L.id).short) || L.short; }
  function lessonDevices(L) { return (lang === 'ko' && koLesson(L.id).devices) || L.devices; }

  function setProgress(n, total) { fill.style.width = (total ? Math.round(n / total * 100) : 0) + '%'; }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  function storageNote() {
    return storageOK ? '' : '<p class="note warn">' + t('noStore') + '</p>';
  }

  function widgetForm(L) {
    var st = lp(L.id);
    var f = st.form || { dest: '', days: '1泊2日', budget: '', who: '2人で' };
    var dest = document.getElementById('f-dest'), days = document.getElementById('f-days'),
        budget = document.getElementById('f-budget'), who = document.getElementById('f-who');
    var box = document.getElementById('gen-form');
    var pre = box.querySelector('pre'), btn = box.querySelector('[data-copy]');
    var gloss = document.getElementById('gloss');
    dest.value = f.dest; days.value = f.days; budget.value = f.budget; who.value = f.who;
    function update() {
      var d = dest.value.trim(), b = budget.value.trim();
      st.form = { dest: d, days: days.value, budget: b, who: who.value };
      save();
      pre.textContent = 'あなたは旅行プランナーです。' + who.value + '行く' +
        (d || '（行き先を入れてください）') + 'の' + days.value + 'の旅行の予定表を作ってください。予算は全部で' +
        (b || '（予算を入れてください）') + 'です。時間ごとの表にしてください。';
      btn.disabled = !(d && b);
      if (gloss) {
        gloss.textContent = '↑ 일본어 부탁글입니다. 뜻: "당신은 여행 플래너입니다. ' + (KO_WHO[who.value] || '') +
          ' 가는 ' + (d || '(목적지)') + '의 ' + (KO_DAYS[days.value] || '') + ' 여행 일정표를 만들어 주세요. 예산은 전부 ' +
          (b || '(예산)') + '입니다. 시간대별 표로 만들어 주세요."';
      }
    }
    [dest, days, budget, who].forEach(function (el) { el.addEventListener('input', update); });
    update();
  }

  function widgetChips(L, step) {
    var st = lp(L.id);
    var list = document.getElementById('chip-list');
    var box = document.getElementById('gen-chips');
    var pre = box.querySelector('pre'), btn = box.querySelector('[data-copy]');
    var gloss = document.getElementById('gloss');
    var on = st.chips || [];
    step.chips.forEach(function (text, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.appendChild(document.createTextNode(text));
      if (step.chipsKo && step.chipsKo[i]) {
        var s = document.createElement('small');
        s.style.cssText = 'display:block;opacity:.8;';
        s.textContent = step.chipsKo[i];
        b.appendChild(s);
      }
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
        pre.textContent = t('chipNone');
        btn.disabled = true;
        if (gloss) gloss.textContent = '';
        return;
      }
      pre.textContent = 'ありがとうございます。次の条件を足して、予定表を作り直してください。\n' +
        on.map(function (i) { return '・' + step.chips[i]; }).join('\n');
      btn.disabled = false;
      if (gloss && step.chipsKo) {
        gloss.textContent = '↑ 일본어 부탁글입니다. 뜻: "감사합니다. 다음 조건을 더해서 일정표를 다시 만들어 주세요. ' +
          on.map(function (i) { return '· ' + step.chipsKo[i]; }).join(' ') + '"';
      }
    }
    update();
  }

  /* クイズ：選ぶとすぐ答えが出る。点数はつけない。保存もしない。 */
  function widgetQuiz(step) {
    var wrap = document.createElement('div');
    step.quiz.forEach(function (q, qi) {
      var card = document.createElement('div');
      card.className = 'card quiz';
      var head = document.createElement('p');
      var strong = document.createElement('b');
      strong.textContent = 'Q' + (qi + 1) + '. ';
      head.appendChild(strong);
      head.appendChild(document.createTextNode(q.q));
      card.appendChild(head);
      var opts = document.createElement('div');
      opts.className = 'chips';
      var fb = document.createElement('p');
      fb.className = 'note';
      fb.setAttribute('aria-live', 'polite');
      fb.hidden = true;
      q.options.forEach(function (o, oi) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.textContent = o;
        b.addEventListener('click', function () {
          var ok = oi === q.answer;
          b.setAttribute('data-state', ok ? 'ok' : 'ng');
          b.setAttribute('aria-pressed', ok ? 'true' : 'false');
          fb.hidden = false;
          fb.textContent = ok ? t('quizOk') + ' ' + q.explain : t('quizNg');
        });
        opts.appendChild(b);
      });
      card.appendChild(opts);
      card.appendChild(fb);
      wrap.appendChild(card);
    });
    return wrap;
  }

  function widgetChecks(L, step) {
    var st = lp(L.id);
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<ul class="checks"></ul>' +
      '<button type="button" class="primary" id="done-btn"></button>' +
      '<div id="done-msg" aria-live="polite"></div>' +
      '<p class="note">' + t('checkNote') + '</p>';
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
      msg.innerHTML = '<div class="card goal">' + doneCardOf(L) + '</div>' +
        '<button type="button" id="to-toc">' + t('tocReturn') + '</button>';
      msg.querySelector('#to-toc').addEventListener('click', function () { go('#/'); });
      applyRuby(msg);
    }
    function refresh() {
      var need = step.required || boxes.length;
      var all = boxes.slice(0, need).every(function (b) { return b.checked; });
      btn.disabled = !all || st.done;
      btn.textContent = st.done ? t('doneDone') : t('doneBtn');
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
    var title = (lang === 'ko' && K.title) || C.title;
    var sub = (lang === 'ko' && K.subtitle) || C.subtitle;
    crumb.textContent = title;
    setProgress(0, 1);
    var html = t('koBanner') + '<h1>' + title + '</h1><p>' + sub + '</p>' + storageNote();
    var lastL = mem.last ? lessonById(mem.last.lesson) : null;
    var lastS = lastL ? lp(lastL.id) : null;
    if (lastL && lastL.steps && lastS && !lastS.done && lastS.step > 1) {
      html += '<div class="banner"><span>' + t('resume')(lastS.step, lastL.no) + '</span>' +
        '<button type="button" class="primary" data-go="#/' + lastL.id + '/' + lastS.step + '">' + t('resumeBtn') + '</button></div>';
    }
    html += '<ul class="toc-list">';
    C.lessons.forEach(function (L) {
      if (L.ready === false) {
        html += '<li><div class="toc-item off"><span class="state">' + t('ready') + '</span>' +
          '<span class="tag pc">' + t('pc') + '</span><br>' + t('lesson') + L.no + '　' + lessonTitle(L) +
          '<small>' + t('temp') + '</small></div></li>';
      } else {
        var ls = lp(L.id);
        var label = ls.done ? t('done') : (ls.step > 1 ? t('doing')(ls.step, L.steps.length) : t('start'));
        var devTag = L.needsPc ? '<span class="tag pc">' + t('pcNeed') + '</span>'
                               : '<span class="tag real">' + lessonDevices(L) + t('okOn') + '</span>';
        html += '<li><button type="button" class="toc-item" data-go="#/' + L.id + '/' + (ls.done ? 1 : ls.step) + '">' +
          '<span class="state">' + label + '</span>' +
          devTag + '<br>' + t('lesson') + L.no + '　' + lessonTitle(L) +
          '<small>' + t('about') + L.minutes + t('min') + '　' + lessonShort(L) + '</small></button></li>';
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
    var step = view(L, L.steps[n - 1]);
    var st = lp(L.id);
    st.step = n;
    mem.last = { lesson: L.id, step: n };
    save();

    crumb.textContent = t('lesson') + L.no + '　' + n + ' / ' + total;
    setProgress(n, total);

    var tagClass = step.kind === 'real' ? 'real' : (step.kind === 'sample' ? 'sample' : (step.kind === 'pc' ? 'pc' : ''));
    var html = t('koBanner') + storageNote() + '<span class="tag ' + tagClass + '">' + step.tag + '</span>' +
      '<h1>' + step.title + '</h1>' + step.html;
    if (step.help && step.help.length) {
      html += '<div class="helpwrap"><h2>' + t('help') + '</h2>' + step.help.map(function (h) {
        return '<details class="help"><summary>' + h.q + '</summary><div>' + h.a + '</div></details>';
      }).join('') + '</div>';
    }
    app.innerHTML = html;

    if (step.widget === 'form') widgetForm(L);
    if (step.widget === 'chips') widgetChips(L, step);
    if (step.widget === 'quiz') {
      var helpQ = app.querySelector('.helpwrap');
      var quizEl = widgetQuiz(step);
      if (helpQ) app.insertBefore(quizEl, helpQ); else app.appendChild(quizEl);
    }
    if (step.widget === 'checks') {
      /* チェックは「困ったとき」より上に置く */
      var help = app.querySelector('.helpwrap');
      widgetChecks(L, step);
      var wrap = app.lastElementChild;
      if (help) app.insertBefore(wrap, help);
    }

    pager.innerHTML =
      (n > 1 ? '<button type="button" data-go="#/' + L.id + '/' + (n - 1) + '">' + t('prev') + '</button>'
             : '<button type="button" data-go="#/">' + t('tocBack') + '</button>') +
      (n < total ? '<button type="button" class="primary" data-go="#/' + L.id + '/' + (n + 1) + '">' + t('next') + '</button>'
                 : '<button type="button" data-go="#/">' + t('tocTo') + '</button>');

    applyRuby(app);
    window.scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }

  function syncChrome() {
    document.documentElement.lang = lang === 'ko' ? 'ko' : 'ja';
    document.getElementById('btn-toc').textContent = t('toc');
    if (koAllowed) { langBtn.hidden = false; langBtn.textContent = t('langBtn'); }
  }

  function route() {
    syncChrome();
    var m = /^#\/(l\d+b?)\/(\d+)$/.exec(location.hash);
    if (m) renderStep(m[1], parseInt(m[2], 10)); else renderToc();
  }

  /* ---------- イベント ---------- */
  document.addEventListener('click', function (e) {
    var t0 = e.target.closest ? e.target.closest('[data-go]') : null;
    if (t0) { go(t0.getAttribute('data-go')); return; }
    var c = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (c && !c.disabled) {
      var box = c.closest('.copybox');
      copyText(box.querySelector('pre').textContent, box.querySelector('.msg'));
    }
  });
  document.getElementById('btn-toc').addEventListener('click', function () { go('#/'); });
  langBtn.addEventListener('click', function () {
    lang = lang === 'ko' ? 'ja' : 'ko';
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* 保存できなくても動く */ }
    route();
  });
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
