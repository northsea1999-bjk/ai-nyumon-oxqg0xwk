/* レッスン1：AIエージェントの理解と、作業環境のじゅんび
   手順は2026-10-30に公式の案内で確認：
   VS Code（code.visualstudio.com/docs/setup/windows）、Antigravity CLI（antigravity.google/docs）、
   Codex CLI（learn.chatgpt.com/docs/codex/cli）、Claude Code（code.claude.com/docs/en/setup） */
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  /* コマンド用のコピー箱（等幅の文字） */
  function cmd(text, label) {
    return window.COURSE.copybox(text, null, label).replace('class="copybox noruby"', 'class="copybox noruby cmd"');
  }
  /* 画面の見本（実際の画面の例。文字だけで作った見本） */
  function term(lines, label) {
    return '<div class="term noruby"><div class="term-label">' + (label || '見本（こんな画面になります）') + '</div><pre>' +
      esc(lines.join('\n')) + '</pre></div>';
  }
  function link(url, text) {
    return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + (text || url) + '</a>';
  }
  window.COURSE.cmd = cmd;
  window.COURSE.term = term;
  window.COURSE.link = link;

  /* OSで内容を分ける部品。Windows用とMac用を両方書いて、見えるほうだけが表示される。 */
  var os = window.COURSE.os, osBlock = window.COURSE.osBlock;
  function cmdOs(win, mac, label) {
    return cmd(win, label).replace('class="copybox noruby cmd"', 'class="copybox noruby cmd os-win"') +
           cmd(mac, label).replace('class="copybox noruby cmd"', 'class="copybox noruby cmd os-mac"');
  }
  function termOs(winLines, macLines, label) {
    return '<div class="os-win">' + term(winLines, label) + '</div><div class="os-mac">' + term(macLines, label) + '</div>';
  }
  window.COURSE.cmdOs = cmdOs;
  window.COURSE.termOs = termOs;
  var ENTER = os('Enterキー', 'Returnキー');
  var PASTE = os('Ctrlキーを押しながらVキー', '⌘（Command）キーを押しながらVキー');
  var PROMPT_MARK = os('<b>PS</b>', '<b>%</b>');
  var CMD_CLAUDE_MAC = 'curl -fsSL https://claude.ai/install.sh | bash';
  var CMD_AGY_MAC = 'curl -fsSL https://antigravity.google/cli/install.sh | bash';
  var CMD_CODEX_MAC = 'curl -fsSL https://chatgpt.com/codex/install.sh | sh';
  var PATH_MAC_1 = 'echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.zshrc';
  var PATH_MAC_2 = 'source ~/.zshrc';

  var CMD_AGY = 'irm https://antigravity.google/cli/install.ps1 | iex';
  var CMD_CODEX = 'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"';
  var CMD_CLAUDE = 'irm https://claude.ai/install.ps1 | iex';

  /* 3つのAIに、同じ4つをお願いする文（道具ごとに名前を変えて、あとで見くらべられるようにする） */
  function four(suffix) {
    return [
      'こんにちは。あなたは何ができますか？ やさしい言葉で、3つ教えてください。',
      'jikoshokai-' + suffix + '.txt という名前のファイルを作って、架空の人物の自己紹介を3行で書いてください。',
      'memo-' + suffix + ' という名前のフォルダを作ってください。',
      'jikoshokai-' + suffix + '.txt を、memo-' + suffix + ' フォルダの中に移動してください。'
    ];
  }
  function fourBoxes(suffix) {
    var f = four(suffix);
    var names = ['① 話しかける', '② ファイルを作る', '③ フォルダを作る', '④ ファイルを動かす'];
    return f.map(function (t, i) { return '<h2>' + names[i] + '</h2>' + window.COURSE.copybox(t); }).join('');
  }

  var HELP_NOTFOUND = {
    q: '「認識されません」「command not found」と出ました',
    a: 'コマンドが見つからない、という意味です。次の順番で試してください。<br>' +
       '① VS Codeを、いったん完全に閉じて、もう一度開く。<br>' +
       '② ターミナルを新しく開きなおして、もう一度入力する。<br>' +
       '③ それでもだめなら、インストールのコマンドをもう一度実行する。<br>' +
       os('※ 日本語のWindowsでは、「用語 ‘〇〇’ は、コマンドレット、関数、スクリプト ファイル、または操作可能なプログラムの名前として認識されません」のように出ます。', '※ Macでは、「zsh: command not found: 〇〇」のように出ます。')
  };
  var HELP_ENG = { q: 'ターミナルの文字が英語です', a: '大丈夫です。表示が英語でも、やることは同じです。' };
  var HELP_APPROVE = {
    q: 'AIが「許可しますか？」と聞いてきました',
    a: 'AIがファイルを作るときなどに、「やってもいいですか？」と聞いてきます。内容が練習用の agent1 フォルダの中のことなら、<b>Y</b>（はい）を押します。わからないときは<b>N</b>（いいえ）でも大丈夫です。'
  };

  var HELP_APPROVE_C = {
    q: 'AIが「許可しますか？」と聞いてきました',
    a: 'Claude Codeは、ファイルを作るときなどに、「やってもいいですか？」と聞いてきます。練習用の agent1 フォルダの中のことなら、「はい(Yes)」を選びます。矢印キー（↑↓）で選んで、Enterキーを押します。わからないときは、「いいえ(No)」でも大丈夫です。'
  };

  /* 全ステップ。レッスン1本体と「おまけ」は、この中から選んで並べる（下の方で組み立てる） */
  var ALL = [
      {
        id: 's1', kind: 'sample', tag: '今日のゴール', title: 'レッスン1で、できるようになること',
        html:
          '<p class="note warn"><b>このレッスンは、WindowsかMacのパソコンが必要です。</b>スマホやタブレットだけでは、進められません。画面の右上の「Windows／Mac」ボタンで、ご自分のパソコンのほうを選んでください。</p>' +
          '<p>このレッスンでは、パソコンに「AIの助手」を1つ（Claude Code）入れて、使えるようにします。</p>' +
          '<div class="card goal"><b>ゴール</b><br>パソコンの中で、AIに「ファイルを作る」「フォルダを作る」「ファイルを動かす」をお願いして、やってもらえるようになる。</div>' +
          '<div class="card"><dl class="facts">' +
          '<dt>かかる時間</dt><dd>約1時間半（休みながらでOK）</dd>' +
          '<dt>パソコン</dt><dd>Windows 10（1809以上）・Windows 11、またはmacOS 13以上</dd>' +
          '<dt>そのほか</dt><dd>メモリ4GB以上、インターネットにつながること</dd>' +
          '<dt>使える国</dt><dd>日本と韓国は、使える国です（Anthropicの公式の対応国リスト）</dd>' +
          '<dt>アカウント</dt><dd>Claude（有料プランが必要です）</dd>' +
          '<dt>お金</dt><dd>Claude Codeを使うには、Claudeの有料プランが必要です。金額は、公式の画面で確認してください。</dd>' +
          '</dl></div>' +
          '<p>有料プランにしたくない人は、先に「おまけ」の、Antigravity（無料のGoogleアカウント）で試せます。</p>' +
          '<p>全部を一度にやらなくて大丈夫です。途中でやめても、「つづきから」で再開できます。</p>' +
          '<p class="note warn">お支払いやパスワードの入力は、必ず<b>ご自分で</b>してください。この教材が、代わりに入力することはありません。</p>' +
          '<p class="note">この手順は、2026年10月に、各サービスの公式の案内で確認しました。画面は、予告なく変わることがあります。</p>',
        help: [
          { q: 'パソコンが苦手です', a: 'この教材は、「何を押すか」を1つずつ案内します。わからなくなったら、各画面の「困ったとき」を開いてください。' },
          { q: 'WindowsかMacか、わかりません', a: 'Windowsは、画面の左下に、Windowsのマーク（四角い窓）があります。Macは、画面の左上に、リンゴのマークがあります。' },
          { q: '古いパソコンでも、使えますか？', a: '公式の案内では、Windows 10（1809以上）・Windows 11、またはmacOS 13以上が必要です。古いときは、先にOSの更新（Windows Update、またはMacの「システム設定」の「ソフトウェアアップデート」）をしてください。' }
        ]
      },
      {
        id: 's2', kind: 'know', tag: '知っておこう', title: 'AIエージェントって、なに？',
        html:
          '<p>ふつうのAIチャットは、「質問に答えてくれる相談相手」です。</p>' +
          '<p>「AIエージェント」は、お願いすると、パソコンの中の作業を<b>代わりにやってくれる助手</b>です。</p>' +
          '<ul class="parts">' +
          '<li><b>チャットのAI</b>文章で答えてくれる<br><span>例：「京都の観光地を教えて」</span></li>' +
          '<li><b>AIエージェント</b>作業をやってくれる<br><span>例：「メモ用のファイルを作って」</span></li>' +
          '</ul>' +
          '<h2>どんなふうに、動くの？</h2>' +
          '<div class="card">① <b>見る</b>（フォルダやファイルを調べる）→ ② <b>考える</b>（何をすればいいか、自分で決める）→ ③ <b>道具を使う</b>（ファイルを作る・直す、コマンドを実行する）→ ④ <b>結果を見る</b> → ⑤ 足りなければ、<b>くり返す</b></div>' +
          '<h2>これまでの方法と、なにがちがう？</h2>' +
          '<ul class="parts">' +
          '<li><b>① ネットで検索</b>コマンドを探して、<b>自分で</b>実行する</li>' +
          '<li><b>② AIチャットに質問</b>コマンドを教えてもらって、<b>自分で</b>実行する</li>' +
          '<li><b>③ AIエージェント</b>コマンドを考えて、<b>AIが自分で</b>実行する（許可を聞きながら）</li>' +
          '</ul>' +
          '<p class="note warn">エージェントは、パソコンの中のファイルを変えることができます。だから、このレッスンでは、練習用の<b>「agent1」フォルダの中だけ</b>で使います。</p>',
        help: [
          { q: '危なくないですか？', a: 'AIは、ファイルを作ったり動かしたりする前に、「やってもいいですか？」と聞いてきます。練習用のフォルダの中だけで使えば、大事なファイルには、さわりません。' }
        ]
      },
      {
        id: 's3', kind: 'know', tag: '知っておこう', title: '「インストール型」のAIって、なに？',
        html:
          '<p>ブラウザで使うAIは、ネットの向こうにあります。「インストール型」は、<b>パソコンの中に入れて</b>使うAIです。だから、パソコンの中のファイルを直接さわれます。</p>' +
          '<p>今日は、この1つを入れます。</p>' +
          '<ul class="parts">' +
          '<li><b>Claude Code</b>Anthropicのエージェント<br><span>（呼び出す名前：claude）</span></li>' +
          '</ul>' +
          '<p>このコースの、このあとの授業でも、Claude Codeを使います。</p>' +
          '<p class="note">ほかのAI（GoogleのAntigravity、OpenAIのCodex）は、「おまけ」で、試せます。しなくても大丈夫です。</p>',
        help: [
          { q: '1つだけで大丈夫ですか？', a: '大丈夫です。1つをしっかり使えるようになることが、いちばん大事です。' }
        ]
      },
      {
        id: 's4', kind: 'pc', tag: 'PCで操作', title: 'VS Codeをダウンロードする',
        html:
          '<p>「VS Code」は、文章やファイルを扱う道具に、AIへ話しかける「ターミナル」がついたものです。今日の作業は、すべてここで行います。</p>' +
          '<ol>' +
          '<li>ブラウザで、公式サイトを開きます。<br>' + link('https://code.visualstudio.com/', 'code.visualstudio.com') + '</li>' +
          '<li>' + os('Windows用の、ダウンロードのボタンを押します。', 'Mac用の、ダウンロードのボタンを押します。') + '</li>' +
          '<li>ダウンロードが終わるのを待ちます。</li>' +
          '</ol>' +
          os('<p class="note">公式の案内では、<b>「User Installer（ユーザー用）」</b>が、おすすめです。管理者の許可がいらないからです。</p>',
             '<p class="note">IntelのMacでも、AppleシリコンのMacでも、動く<b>「Universal」</b>版が使えます（公式の案内）。</p>') +
          '<p class="note warn">ダウンロードは、必ず公式サイトからにしてください。</p>',
        help: [
          { q: 'ボタンがいくつもあります', a: 'ふつうの「ダウンロード」ボタンを押してください。Windowsでは、「User」と書いてあるものがあれば、そちらがおすすめです。Macでは、「Universal」があれば、それを選びます。' },
          { q: 'どこにダウンロードされましたか？', a: 'ふつうは「ダウンロード」フォルダです。ブラウザの右上にも、ダウンロードしたファイルが出ます。' }
        ]
      },
      {
        id: 's5', kind: 'pc', tag: 'PCで操作', title: 'VS Codeをインストールする',
        html:
          osBlock(
            '<ol>' +
            '<li>ダウンロードしたファイル（<b>VSCodeUserSetup</b>で始まる名前）をダブルクリックします。</li>' +
            '<li>使用許諾の画面が出たら、内容を読んで、同意するなら「同意する」を選んで「次へ」。</li>' +
            '<li>あとは、「次へ」を押していきます。</li>' +
            '<li>「GitHub Copilot CLI」という画面が出たら、<b>「Don\'t add the copilot command」</b>（copilotコマンドを追加しない）を選びます。</li>' +
            '<li>最後に「インストール」を押して、終わるまで待ちます。</li>' +
            '<li>「完了」を押します。</li>' +
            '</ol>' +
            '<p class="note">「Don\'t add…」を選ぶのは、今日は使わないからです。公式の案内に出てくる画面です。</p>',
            '<ol>' +
            '<li>ダウンロードしたファイルを開きます（<b>.dmg</b>はダブルクリック。<b>.zip</b>は、ダブルクリックで、解凍されます）。</li>' +
            '<li>「Visual Studio Code」のアイコンを、<b>「アプリケーション」フォルダ</b>に、ドラッグして入れます。</li>' +
            '<li>「アプリケーション」フォルダで、Visual Studio Codeを<b>ダブルクリック</b>して、開きます。</li>' +
            '<li>「インターネットからダウンロードされたアプリケーションです」のような確認が出たら、「開く」を押します。</li>' +
            '</ol>' +
            '<p class="note">ずっと使うなら、Dockの中のアイコンを、Controlキーを押しながらクリックして、「オプション」→「Dockに追加」を選ぶと、すぐ開けます（公式の案内）。</p>'
          ),
        help: [
          { os: 'win', q: '管理者のパスワードを聞かれました', a: 'User用（ユーザー用）のインストーラーなら、ふつうは聞かれません。聞かれたら、いったんやめて、公式サイトからUser用をダウンロードしなおしてください。' },
          { os: 'win', q: '「Windowsによって PC が保護されました」と出ました', a: '公式サイトからダウンロードしたファイルかを確認してください。公式のファイルなら、画面の案内にそって進めます。不安なときは、ここで止めて、やめてかまいません。' },
          { os: 'win', q: 'Copilot CLIの画面が出ません', a: '出ないことも、あります。そのまま進めてください。' },
          { os: 'mac', q: '「開発元を確認できないため開けません」と出ました', a: '公式サイトからダウンロードしたものか、確認してください。公式のものなら、アイコンを、<b>Controlキーを押しながらクリック</b>（または右クリック）して、「開く」を選ぶと、開けることがあります。' },
          { os: 'mac', q: '「カレンダーや写真へのアクセス」を聞かれました', a: 'VS Codeには、必要ありません。「許可しない」を選んで大丈夫です（公式の案内）。' }
        ]
      },
      {
        id: 's6', kind: 'pc', tag: 'PCで操作', title: '練習用のフォルダを作る',
        html:
          '<p>AIに作業をしてもらう、練習用のフォルダを作ります。</p>' +
          '<div class="card goal"><b>なぜ、フォルダを作るの？</b><br>このフォルダが、AIの「作業机」になります。AIは、あとで、このフォルダの中で、ファイルを作ったり、読んだりします。大事なファイルを、さわらせないための、安全な場所でもあります。</div>' +
          '<ol>' +
          '<li>デスクトップの何もないところで、右クリックします' + os('', '（Macは、2本指でタップ、またはControlキーを押しながらクリック）') + '。</li>' +
          '<li>' + os('「新規作成」→「フォルダー」を選びます。', '「新規フォルダ」を選びます。') + '</li>' +
          '<li>名前を <b>agent1</b> にします（半角の英数字で入力）。</li>' +
          '<li>' + ENTER + 'を押します。</li>' +
          '</ol>' +
          '<p class="note">名前を日本語にしないのは、トラブルをさけるためです。</p>',
        help: [
          { q: '右クリックがわかりません', a: os('マウスの右のボタンを押します。タッチパッドの場合は、2本の指で、軽くタップします。', 'マウスの右のボタンを押します。ないときは、Controlキーを押しながら、クリックします。タッチパッドは、2本の指で、軽くタップします。') },
          { q: '名前をまちがえました', a: os('フォルダを右クリックして「名前の変更」を選ぶと、直せます。', 'フォルダを、Controlキーを押しながらクリックして、「名称変更」を選ぶと、直せます。') }
        ]
      },
      {
        id: 's7', kind: 'pc', tag: 'PCで操作', title: 'VS Codeで、フォルダを開く',
        html:
          '<ol>' +
          '<li>VS Codeを開きます（' + os('スタートメニューで「Visual Studio Code」を探します', 'Dockや、「アプリケーション」フォルダから、開きます') + '）。</li>' +
          '<li>上のメニューの「ファイル(File)」→「フォルダーを開く(Open Folder)」を選びます。</li>' +
          '<li>デスクトップの <b>agent1</b> を選んで、「' + os('フォルダーの選択', '開く(Open)') + '」を押します。</li>' +
          '<li>「このフォルダー内のファイルの作成者を信頼しますか？」と出たら、自分で作ったフォルダなので、「はい、作成者を信頼します(Yes, I trust the authors)」を押します。</li>' +
          '</ol>' +
          term(['エクスプローラー', '▾ AGENT1', '   （まだ何もありません）'], '見本（左側が、こんな表示になります）'),
        help: [
          HELP_ENG,
          { q: 'メニューが見つかりません', a: os('VS Codeの画面の、いちばん上の左側に、「ファイル」「編集」などが並んでいます。見えないときは、キーボードの Alt キーを一度押してみてください。', 'Macでは、画面のいちばん上（Macの上のバー）に、「ファイル」「編集」などが出ます。VS Codeの画面を、クリックしてから、見てください。') },
          { os: 'mac', q: '「フォルダーを開く」がありません', a: '「ファイル」→「開く(Open…)」を選んで、agent1 を選んで、「開く」を押しても、同じです。' }
        ]
      },
      {
        id: 'v1', kind: 'know', tag: '知っておこう', title: 'VS Codeの画面の見かた',
        html:
          '<p>VS Codeの画面は、大きく4つの場所に分かれています。名前と場所を、見ておきましょう。</p>' +
          '<div class="vsmock noruby">' +
          '<div class="vs-menu"><b>① 上：メニュー</b>ファイル　編集　表示　…　ターミナル</div>' +
          '<div class="vs-side"><b>② 左：ファイル一覧</b>（エクスプローラー）<br>AGENT1<br>　├ ファイル<br>　└ フォルダ</div>' +
          '<div class="vs-edit"><b>③ 真ん中：編集する場所</b>ファイルを開くと、中身がここに出ます</div>' +
          '<div class="vs-term"><b>④ 下：ターミナル</b>文字で、命令を入れる場所。Claude Codeも、ここで使います</div>' +
          '</div>' +
          '<p class="note">ターミナルは、まだ出ていないことがあります。次の画面で、開きます。</p>' +
          '<p class="note">画面の右がわなどに、「チャット」や「Copilot」のような、AIの欄が出ていることがあります。このレッスンでは、<b>使いません</b>。そのままで大丈夫です。</p>',
        help: [
          { q: '見た目が、ちがいます', a: 'VS Codeは、更新で、見た目が少し変わります。場所の名前が同じなら、大丈夫です。' },
          { q: '左の一覧が、見えません', a: '左端に、アイコンが縦にならんでいます。いちばん上の、「ファイルが2枚かさなった」ような形を、クリックすると、ファイル一覧が出ます。' }
        ]
      },
      {
        id: 'v2', kind: 'pc', tag: '任意', title: 'VS Codeの表示を、日本語にする（しなくてもOK）',
        html:
          '<p>VS Codeは、はじめは、英語の表示です。この教材は、<b>英語のままでも</b>進められます。日本語にしたい人だけ、次の手順をしてください。</p>' +
          '<p class="note">VS Codeは、パソコンの言語を調べて、日本語の「言語パック」のインストールを、画面の右下ですすめてくることがあります（公式の案内）。「Install and Restart」のようなボタンが出たら、それを押すだけでOKです。</p>' +
          '<ol>' +
          '<li>' + os('CtrlキーとShiftキーとPキーを、同時に押します。', '⌘（Command）キーとShiftキーとPキーを、同時に押します。') + '（コマンドを入れる欄が、上に出ます）</li>' +
          '<li><b>display</b> と入力します。</li>' +
          '<li><b>Configure Display Language</b> を選びます。</li>' +
          '<li><b>日本語（ja）</b>を選びます（まだ入っていなければ、VS Codeが、入れてくれます）。</li>' +
          '<li>「再起動(Restart)」を押します。</li>' +
          '</ol>' +
          '<p class="note">日本語にならなくても、大丈夫です。英語のまま、進めてください。メニューの名前は、この教材に、英語を一緒に書いています。</p>',
        help: [
          { q: '日本語が、選べません', a: 'インターネットにつながっているか、確認してください。つながっているのに出ないときは、英語のままで、進めて大丈夫です。' },
          { q: '元の英語に、もどしたいです', a: '同じ手順で、<b>English</b>を選んで、再起動します。' }
        ]
      },
      {
        id: 's8', kind: 'pc', tag: 'PCで操作', title: 'ターミナルを開く',
        html:
          '<p>「ターミナル」は、<b>文字で、パソコンに命令する場所</b>です。命令は、VS Codeの上の「検索バー」ではなく、<b>下のターミナル</b>に入れます。</p>' +
          '<p class="note">ターミナルを出したり、しまったりするには、' + os('CtrlキーとJキー', '⌘（Command）キーとJキー') + 'を、同時に押します（便利なショートカット）。</p>' +
          '<ol>' +
          '<li>VS Codeの上のメニューで「ターミナル(Terminal)」→「新しいターミナル(New Terminal)」を選びます。</li>' +
          '<li>画面の下に、文字を入れる場所が出ます。</li>' +
          '</ol>' +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> _'],
                 ['（あなたの名前）@MacBook agent1 % _']) +
          os('<p>先頭に <b>PS</b> と出ていれば、「PowerShell」です。今日は、これを使います。</p>',
             '<p>終わりが <b>%</b> になっていれば、Macの標準のターミナルです。今日は、これを使います。</p>'),
        help: [
          { os: 'win', q: '「PS」が出ていません', a: '先頭が「C:\\」だけのときは、別の種類のターミナルです。ターミナルの右上の「＋」の横の「▾」を押して、「PowerShell」を選んでください。' },
          { os: 'mac', q: '終わりが「%」ではなく「$」です', a: '大丈夫です。「$」は、別の種類のターミナル（bash）ですが、今日の命令は、同じように使えます。' },
          HELP_ENG
        ]
      },
      {
        id: 's9', kind: 'pc', tag: 'PCで操作', title: 'ターミナルに、文字を入れてみる',
        html:
          '<ol>' +
          '<li>下の「コピー」を押します。</li>' +
          '<li>ターミナルの文字を入れる場所を、クリックします。</li>' +
          '<li>貼り付けて（' + PASTE + '）、' + ENTER + 'を押します。</li>' +
          '</ol>' +
          cmd('echo こんにちは') +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> echo こんにちは', 'こんにちは'],
                 ['（あなたの名前）@MacBook agent1 % echo こんにちは', 'こんにちは']) +
          '<p>「こんにちは」と返ってきたら成功です。画面をきれいにしたいときは、<b>clear</b> と入力して' + ENTER + 'を押します。</p>',
        help: [
          { q: '貼り付けられません', a: os('Ctrl+Vで貼り付けられないときは、ターミナルの上で、マウスの右クリックをすると、貼り付けられることがあります。', '⌘+Vで貼り付けられないときは、ターミナルの上で、2本指でタップ（または、Controlキーを押しながらクリック）して、「ペースト」を選んでください。') },
          { q: '何も起きません', a: ENTER + 'を押しましたか？ 文字を入れたあとは、' + ENTER + 'で実行されます。' }
        ]
      },
      {
        id: 's10', kind: 'know', tag: '知っておこう', title: '安全のための、3つのルール',
        html:
          '<p>ターミナルは、パソコンに直接命令できる、強い道具です。この3つを守ってください。</p>' +
          '<ul class="parts">' +
          '<li><b>① 教材のコマンドだけ</b>この教材が案内したもの以外は、貼り付けない</li>' +
          '<li><b>② 知らないサイトのコマンドは貼らない</b><span>意味がわからないものは、実行しない</span></li>' +
          '<li><b>③ パスワードは、ブラウザの画面だけ</b><span>ターミナルやAIの会話には、書かない</span></li>' +
          '</ul>',
        help: [
          { q: '間違えて何か実行してしまいました', a: 'あわてなくて大丈夫です。ここで一度止めて、画面を、そのままの状態で保存（スクリーンショット）してから、詳しい人に相談してください。' }
        ]
      },
      {
        id: 's11', kind: 'pc', tag: 'PCで操作', title: 'Antigravity CLI を入れる',
        html:
          '<p>Googleの「Antigravity（アンチグラビティ）」を入れます。ターミナルでは <b>agy</b> と呼びます。Googleのアカウントが必要です。</p>' +
          '<ol>' +
          '<li>' + os('先頭が <b>PS</b> のターミナルを開きます。', 'ターミナルを開きます（終わりが <b>%</b> のもの）。') + '</li>' +
          '<li>下の「コピー」を押して、貼り付けて、' + ENTER + 'を押します。</li>' +
          '<li>終わるまで、しばらく待ちます。進み具合が出ないこともあります。</li>' +
          '</ol>' +
          cmdOs(CMD_AGY, CMD_AGY_MAC) +
          '<p class="note">1行です。途中で改行しないで、そのまま貼り付けてください。</p>',
        help: [
          { q: '「irm」が認識されません、と出ました', a: '先頭が「PS」ではない、別のターミナルを使っています。前の画面にもどって、PowerShellを開きなおしてください。' },
          { q: 'エラーが出ました', a: '画面の文字を、スクリーンショットで保存してください。インターネットにつながっているかも、確認してください。' }
        ]
      },
      {
        id: 's12', kind: 'pc', tag: 'PCで操作', title: 'VS Codeを開きなおして、確かめる',
        html:
          '<p>インストールしたあとは、ターミナルを<b>新しく</b>開かないと、使えるようになりません。</p>' +
          '<ol>' +
          '<li>VS Codeを、いったん閉じます。</li>' +
          '<li>もう一度開いて、「ターミナル」→「新しいターミナル」を選びます。</li>' +
          '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。</li>' +
          '</ol>' +
          cmd('agy --version') +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> agy --version', '（数字のバージョンが出ます）'], ['（あなたの名前）@MacBook agent1 % agy --version', '（数字のバージョンが出ます）']) +
          '<p>数字が出れば、成功です。</p>',
        help: [HELP_NOTFOUND, HELP_ENG]
      },
      {
        id: 's13', kind: 'pc', tag: 'PCで操作', title: 'agy を、はじめて起動する',
        html:
          '<ol>' +
          '<li>下の「コピー」を押して、ターミナルに貼り付けて、Enterキーを押します。</li>' +
          '<li>はじめての設定の画面が出ます。次のように答えます。<ul>' +
          '<li><b>色の設定：</b>好きなものでOKです。</li>' +
          '<li><b>表示のしかた：</b>どちらでもOKです。</li>' +
          '<li><b>フォルダを信頼しますか：</b>agent1 は自分で作った練習用フォルダなので、信頼します。</li>' +
          '</ul></li>' +
          '</ol>' +
          cmd('agy'),
        help: [
          { q: '選択肢の選びかたがわかりません', a: '矢印キー（↑↓）で動かして、Enterキーで決めます。' },
          HELP_ENG
        ]
      },
      {
        id: 's14', kind: 'pc', tag: 'PCで操作', title: 'Googleアカウントでログインする',
        html:
          '<ol>' +
          '<li>ブラウザが、自動で開きます。</li>' +
          '<li>ご自分のGoogleアカウントで、ログインします。</li>' +
          '<li>終わったら、ターミナルの画面にもどります。</li>' +
          '</ol>' +
          '<p class="note warn"><b>パスワードは、ブラウザのログイン画面にだけ</b>入力してください。ターミナルやAIの会話には、入れません。</p>',
        help: [
          { q: 'ブラウザが開きません', a: 'ターミナルに、ログイン用のアドレスが出ていないか確認してください。出ていれば、自分でブラウザに貼り付けて開きます。' },
          { q: 'Googleアカウントがありません', a: '先に、Googleのアカウントを作ってください。アカウントの作成は、ご自分で行います。' }
        ]
      },
      {
        id: 's15', kind: 'pc', tag: 'PCで操作', title: '実習① agyに、話しかける',
        html:
          '<p>agyの画面の下の、文字を入れる場所に、お願いを貼り付けます。</p>' +
          '<ol>' +
          '<li>「コピー」を押します。</li>' +
          '<li>agyの入力欄に貼り付けて、Enterキーを押します。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('agy')[0]) +
          '<p>返事が来たら、成功です。</p>',
        help: [HELP_APPROVE]
      },
      {
        id: 's16', kind: 'pc', tag: 'PCで操作', title: '実習② ファイルを作ってもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押して、agyの入力欄に貼り付けて、Enterキーを押します。</li>' +
          '<li>許可を聞かれたら、<b>Y</b>を押します。</li>' +
          '<li>VS Codeの左側に、<b>jikoshokai-agy.txt</b> が増えたら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('agy')[1]),
        help: [HELP_APPROVE]
      },
      {
        id: 's17', kind: 'pc', tag: 'PCで操作', title: '実習③ フォルダを作ってもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押して、agyの入力欄に貼り付けて、Enterキーを押します。</li>' +
          '<li>許可を聞かれたら、<b>Y</b>を押します。</li>' +
          '<li>VS Codeの左側に、<b>memo-agy</b> フォルダが増えたら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('agy')[2]),
        help: [HELP_APPROVE]
      },
      {
        id: 's18', kind: 'pc', tag: 'PCで操作', title: '実習④ ファイルを動かしてもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押して、agyの入力欄に貼り付けて、Enterキーを押します。</li>' +
          '<li>許可を聞かれたら、<b>Y</b>を押します。</li>' +
          '<li>jikoshokai-agy.txt が、<b>memo-agy</b>フォルダの中に入ったら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('agy')[3]) +
          '<p>終わったら、agyに <b>/exit</b> と入力して、Enterキーを押すと、終了できます。</p>',
        help: [
          HELP_APPROVE,
          { q: 'フォルダが増えていません', a: 'VS Codeの左側の表示が、古いままのことがあります。フォルダの名前の上で、ゆっくり動かしてみてください。それでも出ないときは、agyに「いま、ファイルとフォルダは、どうなっていますか？」と聞いてみてください。' }
        ]
      },
      {
        id: 'b19', kind: 'pc', tag: 'PCで操作', title: 'agyに、Codexを入れてもらう',
        html:
          '<p>ここが、エージェントの「すごいところ」です。AIに、ほかのAIをインストールしてもらいます。</p>' +
          '<ol>' +
          '<li>ターミナルで <b>agy</b> を起動します。</li>' +
          '<li>下の「コピー」を押して、agyの入力欄に貼り付けて、Enterキーを押します。</li>' +
          '<li>許可を聞かれたら、<b>Y</b>を押します。</li>' +
          '<li>終わったら、<b>/exit</b> で終了します。</li>' +
          '</ol>' +
          osBlock(
            window.COURSE.copybox('このPCに、Codexをインストールしてください。PowerShellで、次のコマンドを実行してください。\n' + CMD_CODEX + '\n終わったら、codex --version で、動くかどうか確認してください。'),
            window.COURSE.copybox('このMacに、Codexをインストールしてください。ターミナルで、次のコマンドを実行してください。\n' + CMD_CODEX_MAC + '\n終わったら、codex --version で、動くかどうか確認してください。')
          ) +
          '<p class="note">うまくいかないときは、「困ったとき」に、自分でターミナルに貼り付ける方法があります。</p>',
        help: [
          {
            q: 'agyがうまくできませんでした（自分でインストールする方法）',
            a: os('先頭が「PS」のターミナルに貼り付けて、Enterキーを押します。<br><b>Codex：</b>' + window.COURSE.copybox(CMD_CODEX),
                  'ターミナルに貼り付けて、Returnキーを押します。<br><b>Codex：</b>' + window.COURSE.copybox(CMD_CODEX_MAC))
          },
          { os: 'win', q: 'エラー（StrictModeなど）が出ました', a: '原本の案内では、コマンドの <b>powershell</b> のあとに <b>-NoProfile</b> を足すと、防げます。次のコマンドで、もう一度試してください。' + window.COURSE.copybox('powershell -NoProfile -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"') },
          { q: '「Start Codex now? [y/N]」と出ました', a: '今は、起動しないので、<b>n</b> と入力して、' + ENTER + 'を押します。' },
          HELP_APPROVE
        ]
      },
      {
        id: 'b20', kind: 'pc', tag: 'PCで操作', title: 'VS Codeを開きなおして、Codexを確かめる',
        html:
          '<ol>' +
          '<li>VS Codeを、いったん閉じて、もう一度開きます。</li>' +
          '<li>新しいターミナルを開きます。</li>' +
          '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。</li>' +
          '</ol>' +
          cmd('codex --version') +
          '<p>数字が出れば成功です。</p>',
        help: [HELP_NOTFOUND]
      },
      {
        id: 's21', kind: 'pc', tag: 'PCで操作', title: 'Codexにログインする',
        html:
          '<p>Codexは、OpenAI（ChatGPTの会社）のエージェントです。ChatGPTのアカウントが必要です。</p>' +
          '<ol>' +
          '<li>下の「コピー」を押して、ターミナルに貼り付けて、Enterキーを押します。</li>' +
          '<li>ログインの方法を聞かれたら、<b>「Sign in with ChatGPT」</b>を選びます。</li>' +
          '<li>ブラウザが開くので、ご自分のアカウントでログインします。</li>' +
          '</ol>' +
          cmd('codex') +
          '<p class="note warn">パスワードは、ブラウザの画面にだけ入力します。</p>' +
          '<p class="note">ChatGPTのプランによっては、使えないことがあります。使えないと出たときは、この手順を飛ばして大丈夫です。</p>',
        help: [
          { q: 'ログインできません', a: '先に、ChatGPTのアカウントがあるか、確認してください。アカウントの作成は、ご自分で行います。プランの都合で使えないときは、この手順を飛ばしてください。' },
          { q: 'ブラウザが開きません', a: 'ターミナルに出ているアドレスを、自分でブラウザに貼り付けて開いてみてください。' }
        ]
      },
      {
        id: 's22', kind: 'pc', tag: 'PCで操作', title: 'Codexで、同じ4つをやってみる',
        html:
          '<p>agyとおなじ4つを、順番にお願いします。それぞれ、「コピー」→ Codexの入力欄に貼り付け → Enterキー。許可を聞かれたら、<b>Y</b>（または画面の「はい」）を選びます。</p>' +
          fourBoxes('codex') +
          '<p>終わったら、VS Codeの左側に <b>memo-codex</b> フォルダができて、その中に <b>jikoshokai-codex.txt</b> が入っていれば成功です。</p>',
        help: [HELP_APPROVE, { q: 'Codexの終わりかた', a: 'Ctrl キーを押しながら C を2回押す、または画面の案内にそって終了します。' }]
      },
      {
        id: 's23', kind: 'know', tag: '知っておこう', title: 'Claudeのプランを確認する',
        html:
          '<p>Claude Codeを使うには、Claudeの<b>有料プラン</b>が必要です。公式の案内では、無料のプランでは、Claude Codeを使えません。</p>' +
          '<ol>' +
          '<li>ブラウザで、<b>claude.ai</b> を開いて、ログインします。</li>' +
          '<li>アカウントやプランの画面で、いまのプランを確認します。画面の名前は、変わることがあります。</li>' +
          '</ol>' +
          '<p class="note warn">お支払いの入力は、<b>必ずご自分で</b>、公式の画面で行ってください。金額や内容は、その画面で確認してください。この教材は、代わりに入力しません。</p>' +
          '<p>今日は払わないことにしても大丈夫です。ここで止めて、先に「おまけ」の、Antigravity（無料のGoogleアカウント）で、同じ練習を試せます。</p>' +
          '<p class="note">このコースの、このあとの授業は、Claude Codeを使います。いつでも、戻ってつづけられます。</p>',
        help: [
          { q: '無料プランのままだと、どうなりますか？', a: 'Claude Codeにログインしても、使えません。有料プランにするか、「おまけ」で、無料のAIを試してください。' },
          { q: 'やめたくなったら？', a: 'プランをやめる方法も、公式の画面で確認できます。契約する前に、やめ方も見ておくと安心です。' }
        ]
      },
      {
        id: 'f1', kind: 'pc', tag: 'PCで操作', title: 'Claude Codeを、はじめて起動する',
        html:
          '<p>はじめて起動すると、公式の案内では、ブラウザでログインする案内が出ます。そのほかの選択の画面も、順番に出ることがあります。1つずつ進めます。</p>' +
          '<ol>' +
          '<li>ターミナルの終わりが <b>agent1&gt;</b>' + os('（先頭が <b>PS</b>）', '（Macは、<b>agent1 %</b>）') + ' になっているか、確認します。</li>' +
          '<li>下の「コピー」を押して、貼り付けて、' + ENTER + 'を押します。</li>' +
          '<li>選択の画面では、矢印キー（↑↓）で選んで、' + ENTER + 'で決めます。</li>' +
          '</ol>' +
          cmd('claude') +
          '<h2>① 文字の見た目（テーマ）</h2>' +
          '<p>出たら、どれを選んでも大丈夫です。好きなものを選んで、' + ENTER + 'を押します。</p>' +
          '<h2>② ログインの方法</h2>' +
          '<p>次のように、3つの選択肢が出たら、<b>1番</b>（Claudeのアカウントで、ログインする方法）を選びます。</p>' +
          term(['Select login method:', '', '❯ 1. Claude account with subscription · Pro, Max, Team, or Enterprise', '  2. Anthropic Console account · API usage billing', '  3. 3rd-party platform · Amazon Bedrock, Microsoft Foundry, or Vertex AI']) +
          '<p class="note">画面の順番や言葉は、バージョンで変わることがあります。ちがうときは、画面の案内にそって進めてください。</p>',
        help: [
          { q: '選択の画面が出ません', a: '出ないことも、あります。そのまま、次の画面へ進んでください。' },
          { q: '「プランが必要です」と出ました', a: '無料プランのときの表示です。前の画面でプランを確認してください。' },
          HELP_NOTFOUND,
          HELP_ENG
        ]
      },
      {
        id: 'f2', kind: 'pc', tag: 'PCで操作', title: 'ブラウザでログインして、もどる',
        html:
          '<ol>' +
          '<li>ブラウザが、自動で開きます。ご自分のClaudeアカウントで、ログインします。</li>' +
          '<li>「許可（Authorize）」のようなボタンが出たら、内容を確認して、押します。接続が完了します。</li>' +
          '<li>ターミナルにもどると、ログインが終わったという表示が出ます（「Login successful」のような文です）。Enterキーを押して、進みます。</li>' +
          '<li>「ターミナルの設定（terminal setup）」の画面が出たら、<b>「Yes, use recommended settings」</b>（おすすめの設定を使う）が選ばれていれば、そのままEnterキーを押します。</li>' +
          '</ol>' +
          term(['Use Claude Code\'s terminal setup?', '', '❯ 1. Yes, use recommended settings', '  2. No, maybe later with /terminal-setup']) +
          '<p class="note warn"><b>パスワードは、ブラウザのログイン画面にだけ</b>入力してください。ターミナルには、入れません。</p>',
        help: [
          { q: 'ブラウザが開きません', a: 'ターミナルに出ているアドレスを、自分でブラウザに貼り付けて開いてください。' },
          { q: 'ログインしたのに、また「ログインしてください」と出ます', a: 'Claude Codeの入力欄に <b>/logout</b> と入力してEnterキー。いったん終了して、もう一度 <b>claude</b> を実行して、ログインしなおします。' },
          HELP_ENG
        ]
      },
      {
        id: 'f3', kind: 'pc', tag: 'PCで操作', title: 'フォルダを信頼する（ここは、ちゅうい！）',
        html:
          '<p>次のように、「このフォルダを信頼しますか？」と聞かれます。agent1 は、自分で作った練習用のフォルダなので、<b>信頼してOK</b>です。</p>' +
          term(['Is this a project you created or one you trust?', '', '❯ No, exit', '  Yes, I trust this folder']) +
          '<p class="note warn"><b>はじめに選ばれているのが、「No, exit」（終了）のことがあります。</b>そのままEnterキーを押すと、終わってしまいます。矢印キーの<b>↓</b>で、<b>「Yes, I trust this folder」</b>に動かしてから、Enterキーを押します。</p>' +
          '<p>「セキュリティに関する案内」のような画面が出ることがあります。読んで、Enterキーで進みます。Claude Codeは、ファイルを読み書きしたり、コマンドを実行したりできるので、<b>内容を確認しながら使う</b>ことが大切、という案内です。</p>' +
          '<p>そのあと、「Welcome to Claude Code for VS Code」のような歓迎の画面が出たら、Enterキーで閉じます。</p>' +
          '<p>文字を入れる欄が出れば、準備完了です。ここまでの選択画面は、<b>はじめの1回だけ</b>です。次からは、すぐに入力欄が出ます。</p>',
        help: [
          { q: '終了してしまいました', a: 'もう一度、ターミナルで <b>claude</b> を実行してください。今度は、↓で「Yes, I trust this folder」を選びます。' },
          { q: '知らない画面が出ました', a: '画面の下に、「Enter to confirm」のような案内が出ていることが多いです。それにそって進めてください。わからないときは、画面を保存（スクリーンショット）して、相談してください。' },
          { q: '「Auto mode」などの、知らない表示が出ました', a: '設定の名前が、画面に出ているだけのことがあります。許可を聞かれたら、内容を見て、これまでどおり「はい(Yes)」を選びます。わからないときは、画面を保存（スクリーンショット）して、相談してください。' }
        ]
      },
      {
        id: 'c12', kind: 'pc', tag: 'PCで操作', title: 'Claude Code を入れる',
        html:
          '<p>Claude Codeは、Anthropic（アンソロピック）のエージェントです。ターミナルでは <b>claude</b> と呼びます。</p>' +
          '<ol>' +
          '<li>' + os('先頭が <b>PS</b> のターミナルを開きます。', 'ターミナルを開きます（終わりが <b>%</b> のもの）。') + '</li>' +
          '<li>下の「コピー」を押して、貼り付けて、' + ENTER + 'を押します。</li>' +
          '<li>終わるまで、しばらく待ちます。<b>進み具合は、出ません。</b>画面が止まって見えても、待ちます。</li>' +
          '</ol>' +
          cmdOs(CMD_CLAUDE, CMD_CLAUDE_MAC) +
          '<p class="note">1行です。途中で改行しないで、そのまま貼り付けてください。</p>' +
          os('<p class="note">公式の案内では、Gitというソフトは「あると便利」ですが、なくても使えます。今日は、入れなくて大丈夫です。</p>', ''),
        help: [
          { os: 'win', q: '「irm」が認識されません、と出ました', a: '先頭が「PS」ではない、別のターミナルを使っています。前の画面にもどって、PowerShellを開きなおしてください。' },
          { os: 'win', q: '「&&」というエラーが出ました', a: 'このコマンドは、PowerShell用です。先頭が「PS」のターミナルで、やりなおしてください。' },
          { os: 'mac', q: '「syntax error near unexpected token」と出ました', a: '公式の案内では、インストール用のスクリプトのかわりに、エラーのページが返ってきたときに出ます。インターネットの接続を確認して、少し待ってから、もう一度試してください。別のネットワーク（スマホのテザリングなど）でも、試せます。' },
          { os: 'mac', q: '「permission denied」と出ました', a: 'ファイルを書き込む権限がない、という意味です。「sudo」は、使わないでください。画面を保存（スクリーンショット）して、相談してください。' },
          { q: 'エラーが出ました', a: '画面の文字を、スクリーンショットで保存してください。インターネットにつながっているかも、確認してください。' }
        ]
      },
      {
        id: 'c13', kind: 'pc', tag: 'PCで操作', title: 'VS Codeを開きなおして、確かめる',
        html:
          '<p>インストールしたあとは、ターミナルを<b>新しく</b>開かないと、使えるようになりません。</p>' +
          '<ol>' +
          '<li>VS Codeを、いったん閉じます。</li>' +
          '<li>もう一度開いて、「ターミナル」→「新しいターミナル」を選びます。</li>' +
          '<li>下の「コピー」を押して、貼り付けて、' + ENTER + 'を押します。</li>' +
          '</ol>' +
          cmd('claude --version') +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> claude --version', '（数字のバージョンが出ます）'],
                 ['（あなたの名前）@MacBook agent1 % claude --version', '（数字のバージョンが出ます）']) +
          '<p>数字が出れば、成功です。</p>',
        help: [
          HELP_NOTFOUND,
          {
            os: 'win',
            q: 'VS Codeを開きなおしても、「認識されません」と出ます',
            a: 'インストールのときの表示に、<b>「Setup notes」</b>と、<b>「…is not in your PATH」</b>（場所が、登録されていない）という文が出ていたら、自分で登録する必要があります。公式の案内では、claudeの場所は <b>C:\\Users\\あなたの名前\\.local\\bin</b> です。<br>' +
               '① スタートメニューで「環境変数」と入力して、「システム環境変数の編集」を開く。<br>' +
               '② 「環境変数(N)…」を押す。<br>' +
               '③ 上の「ユーザー環境変数」の「Path」を選んで、「編集」を押す。<br>' +
               '④ 「新規」を押して、上の場所（自分の名前の入ったもの）を入力する。<br>' +
               '⑤ すべての画面を「OK」で閉じる。<br>' +
               '⑥ <b>VS Codeを完全に閉じて</b>、もう一度開き、新しいターミナルで <b>claude --version</b> を確かめる。'
          },
          {
            os: 'mac',
            q: 'VS Codeを開きなおしても、「command not found」と出ます',
            a: 'インストールのときの表示に、<b>「Setup notes」</b>と、<b>「…is not in your PATH」</b>（場所が、登録されていない）という文が出ていたら、自分で登録します。公式の案内では、claudeの場所は <b>~/.local/bin</b> です。次の2行を、順番に貼り付けて、' + ENTER + 'を押します。' +
               window.COURSE.copybox(PATH_MAC_1) + window.COURSE.copybox(PATH_MAC_2) +
               'そのあと、<b>VS Codeを完全に閉じて</b>、もう一度開き、新しいターミナルで <b>claude --version</b> を確かめます。'
          },
          {
            q: 'どこが悪いのか、わかりません',
            a: 'claudeが動くときは、次のコマンドで、インストールの状態を点検できます。' + window.COURSE.copybox('claude doctor')
          },
          HELP_ENG
        ]
      },
      {
        id: 'm1', kind: 'know', tag: '知っておこう', title: 'いま、どっちの画面？',
        html:
          '<p>ターミナルには、<b>2つの状態</b>があります。どちらにいるのかを、見分けましょう。</p>' +
          '<h2>① ふつうのターミナル</h2>' +
          '<p>「命令（コマンド）」を入れる場所です。' + os('先頭が <b>PS</b>', '終わりが <b>%</b>') + 'で終わる行が出ています。</p>' +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> _'], ['（あなたの名前）@MacBook agent1 % _'], '見本（ふつうのターミナル）') +
          '<h2>② Claude Codeの中</h2>' +
          '<p>ふつうの言葉で、お願いを入れる場所です。入力欄が出て、AIが答えてくれます。</p>' +
          term(['> （ここに、お願いを入れます）', '', '? for shortcuts'], '見本（Claude Codeの中。細かい表示は、バージョンで変わります）') +
          '<div class="card"><b>見分けかた</b><br>・<b>命令</b>（pwd、claude など）を入れる → ①ふつうのターミナル<br>・<b>お願いの文</b>（「ファイルを作って」など）を入れる → ②Claude Codeの中<br>・②から①にもどるには、<b>/exit</b> と入力して、' + ENTER + 'を押します。</div>',
        help: [
          { q: 'どちらにいるのか、わかりません', a: '<b>/exit</b> と入力して、' + ENTER + 'を押してみてください。②にいたときは、①にもどります。①にいたときは、「認識されません」と出るだけで、害はありません。' },
          { q: '「claude」と入力したら、変な画面になりました', a: '①で <b>claude</b> と入力すると、②（Claude Codeの中）に入ります。それが、ふつうの動きです。' }
        ]
      },
      {
        id: 'c15', kind: 'pc', tag: 'PCで操作', title: '実習① Claude Codeに、話しかける',
        html:
          '<p>Claude Codeの画面の下の、文字を入れる場所に、お願いを貼り付けます。</p>' +
          '<ol>' +
          '<li>「コピー」を押します。</li>' +
          '<li>入力欄に貼り付けて、Enterキーを押します。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('claude')[0]) +
          '<p>返事が来たら、成功です。</p>',
        help: [HELP_APPROVE_C]
      },
      {
        id: 'c16', kind: 'pc', tag: 'PCで操作', title: '実習② ファイルを作ってもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押して、入力欄に貼り付けて、Enterキーを押します。</li>' +
          '<li>許可を聞かれたら、「はい(Yes)」を選びます。</li>' +
          '<li>VS Codeの左側に、<b>jikoshokai-claude.txt</b> が増えたら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('claude')[1]),
        help: [HELP_APPROVE_C]
      },
      {
        id: 'c17', kind: 'pc', tag: 'PCで操作', title: '実習③ フォルダを作ってもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押して、入力欄に貼り付けて、Enterキーを押します。</li>' +
          '<li>許可を聞かれたら、「はい(Yes)」を選びます。</li>' +
          '<li>VS Codeの左側に、<b>memo-claude</b> フォルダが増えたら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('claude')[2]),
        help: [HELP_APPROVE_C]
      },
      {
        id: 'c18', kind: 'pc', tag: 'PCで操作', title: '実習④ ファイルを動かしてもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押して、入力欄に貼り付けて、Enterキーを押します。</li>' +
          '<li>許可を聞かれたら、「はい(Yes)」を選びます。</li>' +
          '<li>jikoshokai-claude.txt が、<b>memo-claude</b>フォルダの中に入ったら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('claude')[3]) +
          '<p>Claude Codeは、<b>終了しないで</b>、このまま次の画面へ進みます。</p>',
        help: [
          HELP_APPROVE_C,
          { q: 'フォルダが増えていません', a: 'VS Codeの左側の表示が、古いままのことがあります。フォルダの名前の上で、ゆっくり動かしてみてください。それでも出ないときは、Claude Codeに「いま、ファイルとフォルダは、どうなっていますか？」と聞いてみてください。' }
        ]
      },
      {
        id: 't1', kind: 'pc', tag: 'PCで操作', title: 'ターミナルの基本① いまどこ？ 中に何がある？',
        html:
          '<p>ターミナルは、フォルダの中を「歩きまわる」ように使います。まず、「いま、どのフォルダにいるか」と「その中に何があるか」を見てみます。</p>' +
          '<ol>' +
          '<li>下の「コピー」を押して、貼り付けて、' + ENTER + 'を押します。</li>' +
          '<li>つづけて、もう1つも、同じようにします。</li>' +
          '</ol>' +
          '<h2>いま、いる場所</h2>' +
          cmd('pwd') +
          '<h2>中にあるものの、一覧</h2>' +
          cmdOs('dir', 'ls') +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> pwd', '', 'Path', '----', 'C:\\Users\\（あなたの名前）\\Desktop\\agent1', '', 'PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> dir', '（まだ何も作っていないので、何も出ません）'],
                 ['（あなたの名前）@MacBook agent1 % pwd', '/Users/（あなたの名前）/Desktop/agent1', '（あなたの名前）@MacBook agent1 % ls', '（まだ何も作っていないので、何も出ません）']) +
          '<p class="note"><b>pwd</b> は「いまいる場所」、<b>' + os('dir', 'ls') + '</b> は「中身の一覧」です。</p>',
        help: [
          { q: '一覧に、何も出ません', a: '正しいです。agent1 には、まだ何も入っていません。' },
          { q: '「認識されません」と出ました', a: '文字を、まちがえて入力していないか、確認してください。「コピー」ボタンで貼り付けると、まちがえません。' },
          HELP_ENG
        ]
      },
      {
        id: 't2', kind: 'pc', tag: 'PCで操作', title: 'ターミナルの基本② フォルダを作って、入って、もどる',
        html:
          '<p>次の4行を、貼り付けます。1行ずつ、順番に実行されます。</p>' +
          '<ol>' +
          '<li>下の「コピー」を押して、貼り付けて、' + ENTER + 'を押します。</li>' +
          '<li>実行が終わるまで、少し待ちます。</li>' +
          '<li>最後の行の、終わりが <b>agent1&gt;</b>' + os('', '（Macは、<b>agent1 %</b>）') + ' にもどっていれば成功です。</li>' +
          '</ol>' +
          cmdOs('mkdir renshu\ncd renshu\ndir\ncd ..', 'mkdir renshu\ncd renshu\nls\ncd ..') +
          termOs(['PS ...\\agent1> mkdir renshu', 'PS ...\\agent1> cd renshu', 'PS ...\\agent1\\renshu> dir', '（何も出ません）', 'PS ...\\agent1\\renshu> cd ..', 'PS ...\\agent1>'],
                 ['...agent1 % mkdir renshu', '...agent1 % cd renshu', '...renshu % ls', '（何も出ません）', '...renshu % cd ..', '...agent1 %'], '見本（こんな流れになります）') +
          '<h2>よく使う、6つのコマンド</h2>' +
          '<ul class="parts">' +
          '<li><b>pwd</b><span>いまいる場所</span></li>' +
          '<li><b>' + os('dir', 'ls') + '</b><span>中身の一覧</span></li>' +
          '<li><b>cd 名前</b><span>そのフォルダに入る</span></li>' +
          '<li><b>cd ..</b><span>ひとつ上にもどる</span></li>' +
          '<li><b>mkdir 名前</b><span>フォルダを作る</span></li>' +
          '<li><b>clear</b><span>画面をきれいにする</span></li>' +
          '</ul>',
        help: [
          { q: 'まだ renshu の中にいます', a: 'ターミナルに <b>cd ..</b> と入力して、' + ENTER + 'を押すと、ひとつ上にもどります。' },
          { q: '「すでに存在します」と出ました', a: 'renshu フォルダが、もうあるという意味です。そのまま、次へ進んで大丈夫です。' },
          HELP_ENG
        ]
      },
      {
        id: 'w1', kind: 'pc', tag: 'PCで操作', title: 'ことばで頼んで、ウェブページを作ってもらう',
        html:
          '<p>ここまでは、ファイルとフォルダを作ってもらいました。次は、<b>目で見えるもの</b>を作ってもらいます。</p>' +
          '<ol>' +
          '<li>「コピー」を押して、Claude Codeの入力欄に貼り付けて、Enterキーを押します。</li>' +
          '<li>許可を聞かれたら、「はい(Yes)」を選びます。</li>' +
          '<li>VS Codeの左側に、<b>my-page.html</b> が増えたら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox('my-page.html という名前で、とても簡単な自己紹介のウェブページを作ってください。名前は「さくら」、ひとことは「はじめまして、AIを勉強中です」にしてください。背景は白で、名前とひとことだけを、画面の真ん中に大きく表示してください。') +
          '<p class="note">名前やひとことは、架空のものです。本当の個人情報は、入れません。</p>',
        help: [
          HELP_APPROVE_C,
          { q: 'my-page.html が増えません', a: 'VS Codeの左側の表示が、古いままのことがあります。少し待つか、フォルダの名前の上でマウスを動かしてみてください。AIが、ちがう名前で作ったときは、その名前で進めてください。' }
        ]
      },
      {
        id: 'w2', kind: 'pc', tag: 'PCで操作', title: 'ブラウザで開いて、見てみよう',
        html:
          '<ol>' +
          '<li>VS Codeの左側で、<b>my-page.html</b> を右クリックします' + os('', '（Macは、Controlキーを押しながらクリック）') + '。</li>' +
          '<li>' + os('「エクスプローラーで表示(Reveal in File Explorer)」', '「Finderで表示(Reveal in Finder)」') + 'を選びます。</li>' +
          '<li>出てきた画面で、<b>my-page.html</b> をダブルクリックします。</li>' +
          '<li>ブラウザで、ページが開きます。</li>' +
          '</ol>' +
          '<h2><span class="tag sample">見本</span>こんな画面になります</h2>' +
          '<div class="card sample-box" style="text-align:center;padding:36px 16px;"><div style="font-size:30px;font-weight:700;">さくら</div><div style="font-size:18px;">はじめまして、AIを勉強中です</div></div>' +
          '<p class="note">見た目は、AIによって、少しちがうことがあります。</p>',
        help: [
          { q: 'ダブルクリックしても、開きません', a: 'ファイルを右クリックして、「プログラムから開く」（Macは「このアプリケーションで開く」）で、ブラウザ（ChromeやEdge、Safariなど）を選んでください。' },
          { q: '文字が、おかしな文字になっています', a: 'Claude Codeに、「my-page.html の文字化けを直してください」とお願いしてください。' },
          { q: 'ファイルが見つかりません', a: 'VS Codeの左側に、my-page.html があるか、確認してください。なければ、1つ前の画面から、やりなおしてください。' }
        ]
      },
      {
        id: 'w3', kind: 'pc', tag: 'PCで操作', title: 'ページを直してもらおう',
        html:
          '<p>新しく作るのではなく、<b>いまのページを、直してもらいます</b>。Claude Codeの、同じ画面に続けてお願いします。</p>' +
          '<ol>' +
          '<li>「コピー」を押して、Claude Codeの入力欄に貼り付けて、Enterキーを押します。</li>' +
          '<li>許可を聞かれたら、「はい(Yes)」を選びます。</li>' +
          '<li>ブラウザにもどって、' + os('<b>F5</b>キー', '<b>⌘（Command）キーとRキー</b>') + 'を押します（ページを読みこみなおします）。</li>' +
          '</ol>' +
          window.COURSE.copybox('my-page.html の、文字の色を青にして、背景をうすい黄色にしてください。') +
          '<p>色が変わっていれば、成功です。</p>' +
          '<p>時間があれば、自分で、色や言葉を変えて、もう一度お願いしてみましょう。「頼む言葉を変えると、結果も変わる」ことが、わかります。</p>' +
          '<p>終わったら、Claude Codeに <b>/exit</b> と入力して、Enterキーを押すと、終了できます。</p>',
        help: [
          HELP_APPROVE_C,
          { q: '色が変わりません', a: 'ブラウザで、ページを読みこみなおしましたか（' + os('F5キー', '⌘キーとRキー') + '）？ それでも変わらないときは、Claude Codeに「my-page.html は、変わりましたか？」と聞いてみてください。' }
        ]
      },
      {
        id: 'c19', kind: 'check', tag: '確認', title: 'おわりの確認',
        widget: 'checks',
        checks: [
          'VS Codeを入れて、agent1フォルダを開けた',
          'ターミナルで、echoやpwd、cd、mkdirなどの命令が動いた',
          'Claude Codeに、4つのお願い（話す、ファイルを作る、フォルダを作る、動かす）をできた',
          'ことばで頼んで、ウェブページを作ってもらい、直してもらえた'
        ],
        html:
          '<p>できたことに、チェックを入れてください。4つとも入ると、「完了にする」を押せます。</p>' +
          '<p class="note">ほかのAIも試したい人は、目次の「おまけ」へ進めます（しなくても大丈夫です）。</p>',
        help: [
          { q: 'できなかったところがあります', a: 'そのステップに戻って、「困ったとき」を見てください。何度でもやり直せます。' }
        ]
      },
      {
        id: 'b1', kind: 'sample', tag: 'おまけ', title: 'ほかのAIも、試してみよう（任意）',
        html:
          '<p class="note warn"><b>この「おまけ」は、しなくても大丈夫です。</b>レッスン1の前半（VS Codeの準備と、agent1フォルダ）が終わっている人向けです。</p>' +
          '<p>ここでは、次の2つを試せます。</p>' +
          '<ul class="parts">' +
          '<li><b>Antigravity（agy）</b>Googleのエージェント<br><span>無料のGoogleアカウントで使えます</span></li>' +
          '<li><b>Codex</b>OpenAIのエージェント<br><span>ChatGPTのアカウントが必要です</span></li>' +
          '</ul>' +
          '<p>同じお願いを、順番にして、くらべてみます。</p>' +
          '<p class="note">有料プランにしたくない人は、まず、Antigravityだけ試してもOKです。</p>',
        help: [
          { q: 'おまけは、やるべきですか？', a: 'しなくて大丈夫です。AIによる違いを知りたい人や、無料で試したい人向けです。' }
        ]
      },
      {
        id: 'b26', kind: 'know', tag: '知っておこう', title: 'くらべてみよう',
        html:
          '<p>同じお願いを、いくつかのAIにしました。次のことを、思い出してみてください。</p>' +
          '<ul>' +
          '<li>どれが、いちばん<b>わかりやすい</b>と感じましたか？</li>' +
          '<li>許可の聞きかたは、どう違いましたか？</li>' +
          '<li>返事の長さや、言葉づかいは、どう違いましたか？</li>' +
          '</ul>' +
          '<p>正解はありません。「自分には、どれが使いやすいか」が、大事です。メモしておくと、あとで役に立ちます。</p>' +
          '<p>VS Codeの左側を見ると、<b>jikoshokai-</b> のファイルが、使った数だけ（agy、codex、claude）あるはずです。開いて、中身をくらべてみましょう。</p>',
        help: [
          { q: '1つしか使えませんでした', a: '大丈夫です。使えたものだけで、くらべてください。' }
        ]
      }
  ];

  function pick(ids) {
    return ids.map(function (id) {
      for (var k = 0; k < ALL.length; k++) { if (ALL[k].id === id) return ALL[k]; }
      throw new Error('step not found: ' + id);
    });
  }

  var lesson1 = {
    id: 'l1', no: 1, needsPc: true, ready: true, minutes: 90,
    title: 'AIエージェントの理解と、作業環境のじゅんび',
    short: 'パソコンにAIの助手（Claude Code）を入れて、ファイルを作ってもらう',
    devices: 'PC',
    doneCard: '<b>レッスン1　完了です。おつかれさまでした。</b><br>パソコンの中で、AIに作業をお願いできるようになりました。次は、レッスン2（準備中）です。',
    steps: pick(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 'v1', 'v2', 's8', 's9', 't1', 't2', 's10',
                 's23', 'c12', 'c13', 'f1', 'f2', 'f3',
                 'm1', 'c15', 'c16', 'c17', 'c18', 'w1', 'w2', 'w3', 'c19'])
  };

  /* おまけ（任意）：ほかのAIも試す */
  var bonus = {
    id: 'l1b', no: '1B', needsPc: true, ready: true, optional: true, minutes: 60,
    title: 'ほかのAIも試してみよう（おまけ・任意）',
    short: 'Antigravity（無料のGoogleアカウント）とCodexで、同じ4つをやってみる',
    devices: 'PC',
    doneCard: '<b>おまけ　おつかれさまでした。</b>',
    steps: pick(['b1', 's11', 's12', 's13', 's14', 's15', 's16', 's17', 's18',
                 'b19', 'b20', 's21', 's22', 'b26'])
  };

  /* 予定の1番(仮題)を、本物のレッスン1に置きかえ、すぐ後ろにおまけを入れる */
  var C = window.COURSE;
  for (var i = 0; i < C.lessons.length; i++) {
    if (C.lessons[i].id === 'l1') { C.lessons.splice(i, 1, lesson1, bonus); break; }
  }
})();
