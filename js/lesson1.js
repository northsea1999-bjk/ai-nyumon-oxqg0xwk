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
    return '<div class="term noruby"><div class="term-label">' + (label || '見本（表示される画面の例）') + '</div><pre>' +
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
  var PATH_BASH_1 = 'echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.bash_profile';
  var PATH_BASH_2 = 'source ~/.bash_profile';

  var CMD_AGY = 'irm https://antigravity.google/cli/install.ps1 | iex';
  var CMD_CODEX = 'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"';
  var CMD_CLAUDE = 'irm https://claude.ai/install.ps1 | iex';

  /* 3つのAIに、同じ4つをお願いする文（道具ごとに名前を変えて、あとで見くらべられるようにする） */
  function four(suffix) {
    return [
      'こんにちは。あなたにできることを、わかりやすい言葉で3つ教えてください。',
      'jikoshokai-' + suffix + '.txt という名前のファイルを作成し、架空の人物の自己紹介を3行で書いてください。',
      'memo-' + suffix + ' という名前のフォルダを作成してください。',
      'jikoshokai-' + suffix + '.txt を memo-' + suffix + ' フォルダの中に移動してください。'
    ];
  }
  function fourBoxes(suffix) {
    var f = four(suffix);
    var names = ['① 話しかける', '② ファイルを作る', '③ フォルダを作る', '④ ファイルを移動する'];
    return f.map(function (t, i) { return '<h2>' + names[i] + '</h2>' + window.COURSE.copybox(t); }).join('');
  }

  var HELP_NOTFOUND = {
    q: os('「認識されません」と出ました', '「command not found」と出ました'),
    a: 'コマンドが見つからないという意味です。次の順番で試してください。<br>' +
       '① ' + os('VS Codeをいったん完全に閉じて、もう一度開きます。', 'VS Codeを⌘（Command）キーとQキーで終了し、もう一度開きます（赤い丸のボタンでウインドウを閉じるだけでは終了しません）。') + '<br>' +
       '② ターミナルを新しく開き直して、もう一度入力します。<br>' +
       '③ それでも解決しない場合は、インストールのコマンドをもう一度実行します。<br>' +
       os('※ 日本語のWindowsでは「用語 ‘〇〇’ は、コマンドレット、関数、スクリプト ファイル、または操作可能なプログラムの名前として認識されません」のように表示されます。', '※ Macでは「zsh: command not found: 〇〇」のように表示されます。')
  };
  var HELP_ENG = { q: 'ターミナルの文字が英語です', a: '問題ありません。表示が英語でも、操作は同じです。' };
  var HELP_MAC_DESKTOP = {
    os: 'mac', q: '「Operation not permitted」と出ます／ファイルが見えません',
    a: 'MacがVS Codeに、デスクトップのファイルへのアクセスを許可していない状態です。アップルメニュー →「システム設定」→「プライバシーとセキュリティ」→「ファイルとフォルダ」で、「Visual Studio Code」の「デスクトップフォルダ」をオンにします。そのあと、VS Codeを⌘（Command）キーとQキーで終了し、開き直します。'
  };
  window.COURSE.HELP_MAC_DESKTOP = HELP_MAC_DESKTOP;
  var HELP_APPROVE = {
    q: 'AIが「許可しますか？」と聞いてきました',
    a: 'AIはファイルを作成するときやコマンドを実行するときに、実行してよいか確認を求めます。<b>何を・どこで</b>するのかを読み、練習用の agent1 フォルダの中の作業であれば<b>Y</b>（はい）を押します。コマンドは agent1 の外にも影響することがあるため、agent1 以外の場所が表示されていたら<b>N</b>（いいえ）を押します。判断できないときも<b>N</b>を押してください。'
  };

  var HELP_APPROVE_C = {
    q: 'AIが「許可しますか？」と聞いてきました',
    a: 'Claude Codeは、ファイルを作成するときやコマンドを実行するときに、実行してよいか確認を求めます。<b>何を・どこで</b>するのかを読み、練習用の agent1 フォルダの中の作業であれば「はい(Yes)」を選びます。コマンドは agent1 の外にも影響することがあるため、agent1 以外の場所が表示されていたら「いいえ(No)」を選びます。矢印キー（↑↓）で選んで、Enterキーを押します。判断できないときも「いいえ(No)」を選んでください。'
  };

  /* Mac：「command not found」のときだけ、場所（PATH）を1回だけ登録する。% や $ ではなく、いま開いているシェル（ps -p $$ -o comm=）で決める */
  function macPathFix(name) {
    var box = window.COURSE.copybox;
    return '<div class="os-mac"><h2>「command not found」と表示された場合のみ：場所を登録する（1回だけ）</h2>' +
      '<p>バージョン番号が表示された場合は、ここを飛ばして次の画面へ進みます。</p>' +
      '<ol>' +
      '<li>' + name + ' がインストールされた場所を確認します。下のコマンドを貼り付けて、Returnキーを押します。' + box('ls ~/.local/bin') + '<b>' + name + '</b> という名前が表示されたら、次へ進みます。表示されない場合は、インストールの最後に表示された文（インストール先が書かれています）のスクリーンショットを保存して、相談してください。推測で別の場所を登録しないでください。</li>' +
      '<li>今開いているターミナルのシェル（種類）を確認します。' + box('ps -p $$ -o comm=') + '<b>zsh</b> を含むか（-zsh、zsh、/bin/zsh など）、<b>bash</b> を含むか（-bash、/bin/bash など）を確認します。行末の「%」や「$」の記号だけでは判断しません。</li>' +
      '<li>場所を登録します。<b>zsh の場合</b>は、次の2行を1行ずつ貼り付けて、Returnキーを押します。' + box(PATH_MAC_1) + box(PATH_MAC_2) + '<b>bash の場合</b>は、こちらの2行です（公式の案内）。' + box(PATH_BASH_1) + box(PATH_BASH_2) + '</li>' +
      '<li>VS Codeを⌘（Command）キーとQキーで終了し、開き直します。新しいターミナルで、もう一度 <b>' + name + ' --version</b> を確認します。</li>' +
      '</ol>' +
      '<p class="note">この登録は<b>1回だけ</b>です。すでに登録した場合（レッスン1Bで agy のときに登録した場合など）は、繰り返さずにVS Codeを開き直して確認します。</p></div>';
  }

  /* 全ステップ。レッスン1本体と「おまけ」は、この中から選んで並べる（下の方で組み立てる） */
  var ALL = [
      {
        id: 's1', kind: 'sample', tag: '目標', title: 'レッスン1でできるようになること',
        html:
          '<p class="note warn"><b>このレッスンにはWindowsかMacのパソコンが必要です。</b>スマホやタブレットだけでは進められません。画面右上の「Windows／Mac」ボタンで、自分のパソコンに合うほうを選んでください。</p>' +
          '<p>このレッスンでは、パソコンにAIの助手（Claude Code）を1つインストールして、使える状態にします。</p>' +
          '<div class="card goal"><b>目標</b><br>パソコンの中で、AIに「ファイルを作る」「フォルダを作る」「ファイルを移動する」を依頼し、実行してもらえるようになる。</div>' +
          '<div class="card"><dl class="facts">' +
          '<dt>所要時間</dt><dd>約1時間半（休憩を挟んでもかまいません）</dd>' +
          '<dt>パソコン</dt><dd>Windows 10（1809以上）・Windows 11、またはmacOS 13以上</dd>' +
          '<dt>そのほか</dt><dd>メモリ4GB以上、インターネット接続</dd>' +
          '<dt>利用できる国</dt><dd>日本と韓国は対象国です（Anthropicの公式の対応国リスト）</dd>' +
          '<dt>アカウント</dt><dd>Claude（有料プランが必要）</dd>' +
          '<dt>料金</dt><dd>Claude Codeを使うには、Claudeの有料プランが必要です。金額は公式の画面で確認してください。</dd>' +
          '</dl></div>' +
          '<p>有料プランを契約したくない場合は、先にレッスン1B（任意）で、Antigravity（無料のGoogleアカウントで利用可能）を試せます。</p>' +
          '<p>一度にすべて終わらせる必要はありません。途中でやめても、「続きから」で再開できます。</p>' +
          '<p class="note warn">支払いやパスワードの入力は、必ず<b>自分で</b>行ってください。この教材が代わりに入力することはありません。</p>' +
          '<p class="note">この手順は、2026年10月に各サービスの公式の案内で確認しました。画面は予告なく変わることがあります。</p>',
        help: [
          { q: 'パソコンが苦手です', a: 'この教材では、何を押すかを1つずつ案内します。わからなくなったら、各画面の「困ったとき」を開いてください。' },
          { q: 'WindowsかMacか、わかりません', a: 'Windowsは画面の左下にWindowsのマーク（四角い窓）があります。Macは画面の左上にリンゴのマークがあります。' },
          { q: '古いパソコンでも使えますか？', a: '公式の案内では、Windows 10（1809以上）・Windows 11、またはmacOS 13以上が必要です。古い場合は、先にOSを更新（Windows Update、またはMacの「システム設定」の「ソフトウェアアップデート」）してください。' }
        ]
      },
      {
        id: 's2', kind: 'know', tag: '基礎知識', title: 'AIエージェントとは',
        html:
          '<p>一般的なAIチャットは、質問に答える相談相手です。</p>' +
          '<p>「AIエージェント」は、依頼するとパソコンの中の作業を<b>代わりに実行する助手</b>です。</p>' +
          '<ul class="parts">' +
          '<li><b>チャットのAI</b>文章で答える<br><span>例：「京都の観光地を教えて」</span></li>' +
          '<li><b>AIエージェント</b>作業を実行する<br><span>例：「メモ用のファイルを作って」</span></li>' +
          '</ul>' +
          '<h2>AIエージェントの動き方</h2>' +
          '<div class="card">① <b>見る</b>（フォルダやファイルを調べる）→ ② <b>考える</b>（何をすべきか自分で決める）→ ③ <b>道具を使う</b>（ファイルを作成・修正する、コマンドを実行する）→ ④ <b>結果を確認する</b> → ⑤ 不十分なら<b>繰り返す</b></div>' +
          '<h2>検索やAIチャットとどう違うのか</h2>' +
          '<ul class="parts">' +
          '<li><b>① ネットで検索</b>コマンドを探して、<b>自分で</b>実行する</li>' +
          '<li><b>② AIチャットに質問</b>コマンドを教えてもらい、<b>自分で</b>実行する</li>' +
          '<li><b>③ AIエージェント</b>AIがコマンドを考え、<b>AI自身が</b>実行する（許可を確認しながら）</li>' +
          '</ul>' +
          '<p class="note warn">エージェントはパソコンの中のファイルを変更できます。そのため、このレッスンでは練習用の<b>「agent1」フォルダ</b>で作業を始めます。</p>' +
          '<p class="note warn"><b>ただし、フォルダは「柵」ではありません。</b>agent1 で始めても、AIが実行するコマンドを<b>許可すると、agent1 の外</b>（ほかのフォルダのファイルやパソコンの設定）にも影響することがあります。そのため、許可を求められたら<b>「何を」「どこで」</b>するのかを読んでから答えます。判断できないときは「いいえ(No)」を選びます。</p>',
        help: [
          { q: '危なくないですか？', a: 'AIは、ファイルを作成したりコマンドを実行したりする前に、実行してよいか確認を求めます。そのたびに、agent1 の中の作業か、何をするのかを確認してから答えれば、大事なファイルを守れます。内容がわからないものは許可しません。' }
        ]
      },
      {
        id: 's3', kind: 'know', tag: '基礎知識', title: '「インストール型」のAIとは',
        html:
          '<p>ブラウザで使うAIは、インターネットの向こう側にあります。「インストール型」は、<b>パソコンにインストールして</b>使うAIです。そのため、パソコンの中のファイルを直接操作できます。</p>' +
          '<p>このレッスンでは、次の1つをインストールします。</p>' +
          '<ul class="parts">' +
          '<li><b>Claude Code</b>Anthropicのエージェント<br><span>（呼び出す名前：claude）</span></li>' +
          '</ul>' +
          '<p>このコースの以降のレッスンでも、Claude Codeを使います。</p>' +
          '<p class="note">ほかのAI（GoogleのAntigravity、OpenAIのCodex）は、レッスン1B（任意）で試せます。</p>',
        help: [
          { q: '1つだけで大丈夫ですか？', a: '大丈夫です。まず1つを確実に使えるようになることが最も大切です。' }
        ]
      },
      {
        id: 's4', kind: 'pc', tag: 'PCで操作', title: 'VS Codeをダウンロードする',
        html:
          '<p>「VS Code」は、文章やファイルを扱う道具に、AIに話しかけるための「ターミナル」が付いたものです。このレッスンの作業は、すべてVS Codeで行います。</p>' +
          '<ol>' +
          '<li>ブラウザで公式サイトを開きます。<br>' + link('https://code.visualstudio.com/', 'code.visualstudio.com') + '</li>' +
          '<li>' + os('Windows用のダウンロードボタンを押します。', 'Mac用のダウンロードボタンを押します。') + '</li>' +
          '<li>ダウンロードが終わるまで待ちます。</li>' +
          '</ol>' +
          os('<p class="note">公式の案内では、<b>「User Installer（ユーザー用）」</b>が推奨されています。管理者の許可が不要なためです。</p>',
             '<p class="note">IntelのMacとAppleシリコンのMacの両方で動く<b>「Universal」</b>版が使えます（公式の案内）。</p>') +
          '<p class="note warn">ダウンロードは、必ず公式サイトから行ってください。</p>',
        help: [
          { q: 'ボタンがいくつもあります', a: '通常の「ダウンロード」ボタンを押してください。Windowsでは「User」と書かれたものがあれば、そちらを選びます。Macでは「Universal」があれば、それを選びます。' },
          { q: 'どこにダウンロードされましたか？', a: '通常は「ダウンロード」フォルダです。ブラウザの右上にも、ダウンロードしたファイルが表示されます。' }
        ]
      },
      {
        id: 's5', kind: 'pc', tag: 'PCで操作', title: 'VS Codeをインストールする',
        html:
          osBlock(
            '<ol>' +
            '<li>ダウンロードしたファイル（<b>VSCodeUserSetup</b>で始まる名前）をダブルクリックします。</li>' +
            '<li>使用許諾の画面が表示されたら、内容を読み、同意する場合は「同意する」を選んで「次へ」を押します。</li>' +
            '<li>以降は「次へ」を押して進めます。</li>' +
            '<li>「GitHub Copilot CLI」という画面が表示されたら、<b>「Don\'t add the copilot command」</b>（copilotコマンドを追加しない）を選びます。</li>' +
            '<li>最後に「インストール」を押して、終わるまで待ちます。</li>' +
            '<li>「完了」を押します。</li>' +
            '</ol>' +
            '<p class="note">「Don\'t add…」を選ぶのは、このレッスンでは使わないためです。公式の案内にも出てくる画面です。</p>',
            '<ol>' +
            '<li>ダウンロードしたファイルを開きます（<b>.dmg</b>はダブルクリックします。<b>.zip</b>はダブルクリックすると解凍されます）。</li>' +
            '<li>「Visual Studio Code」のアイコンを<b>「アプリケーション」フォルダ</b>にドラッグします（ダウンロードしたファイルは、Finderの左側の「ダウンロード」にあります。「アプリケーション」もFinderの左側にあります）。</li>' +
            '<li>「アプリケーション」フォルダで、Visual Studio Codeを<b>ダブルクリック</b>して開きます。</li>' +
            '<li>「“Visual Studio Code”はインターネットからダウンロードされたアプリケーションです。開いてもよろしいですか？」のような<b>通常の確認</b>が表示されたら、自分でダウンロードしたものなので「開く」を押します（初めて開くときだけ表示されます）。</li>' +
            '</ol>' +
            '<p class="note warn">「開発元を確認できない」「…を検証できませんでした」「壊れているため開けません」「マルウェア」のような<b>警告</b>が表示された場合は、<b>開かないでください</b>。下の「困ったとき」を確認します。</p>' +
            '<p class="note">今後も使う場合は、Dockの中のアイコンをControlキーを押しながらクリックし、「オプション」→「Dockに追加」を選ぶと、すぐに開けます（公式の案内）。</p>'
          ),
        help: [
          { os: 'win', q: '管理者のパスワードを聞かれました', a: 'User用（ユーザー用）のインストーラーであれば、通常は聞かれません。聞かれた場合はいったん中止し、公式サイトからUser用をダウンロードし直してください。' },
          { os: 'win', q: '「Windowsによって PC が保護されました」と出ました', a: '公式サイトからダウンロードしたファイルかどうかを確認してください。公式のファイルであれば、画面の案内に沿って進めます。不安な場合は、ここで中止してかまいません。' },
          { os: 'win', q: 'Copilot CLIの画面が出ません', a: '表示されない場合もあります。そのまま進めてください。' },
          { os: 'mac', q: '「開発元を確認できない」「壊れている」「マルウェア」のような警告が出ました', a: '<b>開かないでください。</b>「完了」や「キャンセル」で閉じます。設定の「このまま開く」を押して無理に開くことはしません。① ダウンロードしたファイルをゴミ箱に入れます。② ブラウザで <b>code.visualstudio.com</b> を自分で開き、もう一度ダウンロードします。③ それでも同じ警告が表示される場合は、ここで中止して相談してください。公式サイトのVS Codeであれば、通常この警告は表示されません。' },
          { os: 'mac', q: '「カレンダーや写真へのアクセス」を聞かれました', a: 'VS Codeには必要ありません。「許可しない」を選んで問題ありません（公式の案内）。ただし、<b>「デスクトップ」フォルダ</b>へのアクセスは「許可」を押します（次の画面）。' }
        ]
      },
      {
        id: 's6', kind: 'pc', tag: 'PCで操作', title: '練習用のフォルダを作る',
        html:
          '<p>AIに作業をしてもらうための、練習用のフォルダを作ります。</p>' +
          '<div class="card goal"><b>フォルダを作る理由</b><br>AIはこのフォルダを作業場所として使います。このあと、AIはこのフォルダの中でファイルを作成したり読んだりします。大事なファイルにAIを触れさせないための、安全な場所でもあります。</div>' +
          '<ol>' +
          '<li>デスクトップの何もないところを右クリックします' + os('', '（Macでは2本指でタップ、またはControlキーを押しながらクリック）') + '。</li>' +
          '<li>' + os('「新規作成」→「フォルダー」を選びます。', '「新規フォルダ」を選びます。') + '</li>' +
          '<li>名前を <b>agent1</b> にします（半角英数字で入力）。</li>' +
          '<li>' + ENTER + 'を押します。</li>' +
          '</ol>' +
          '<p class="note">名前を日本語にしないのは、トラブルを避けるためです。</p>',
        help: [
          { q: '右クリックがわかりません', a: os('マウスの右ボタンを押します。タッチパッドの場合は、2本の指で軽くタップします。', 'マウスの右ボタンを押します。右ボタンがない場合は、Controlキーを押しながらクリックします。タッチパッドでは、2本の指で軽くタップします。') },
          { q: '名前を間違えました', a: os('フォルダを右クリックして「名前の変更」を選ぶと修正できます。', 'フォルダをControlキーを押しながらクリックし、「名称変更」を選ぶと修正できます。') }
        ]
      },
      {
        id: 's7', kind: 'pc', tag: 'PCで操作', title: 'VS Codeでフォルダを開く',
        html:
          '<ol>' +
          '<li>VS Codeを開きます（' + os('スタートメニューで「Visual Studio Code」を探します', 'Dockまたは「アプリケーション」フォルダから開きます') + '）。</li>' +
          '<li>上部のメニューで「ファイル(File)」→「フォルダーを開く(Open Folder)」を選びます。</li>' +
          '<li>デスクトップの <b>agent1</b> を選んで、「' + os('フォルダーの選択', '開く(Open)') + '」を押します。</li>' +
          '<li>「このフォルダー内のファイルの作成者を信頼しますか？」と表示されたら、自分で作ったフォルダなので「はい、作成者を信頼します(Yes, I trust the authors)」を押します。</li>' +
          '</ol>' +
          '<p class="note os-mac">「“Visual Studio Code”が“デスクトップ”フォルダ内のファイルにアクセスしようとしています」のような確認が表示されたら、<b>「許可」</b>を押します。agent1 はデスクトップにあるためです。</p>' +
          term(['エクスプローラー', '▾ AGENT1', '   （まだ何もありません）'], '見本（左側の表示）'),
        help: [
          HELP_ENG,
          { q: 'メニューが見つかりません', a: os('VS Codeのウインドウの最上部の左側に、「ファイル」「編集」などが並んでいます。表示されない場合は、キーボードの Alt キーを一度押してください。', 'Macでは、まずVS Codeのウインドウをクリックします。画面上部のメニューバーに「ファイル」「編集」などが表示されます。') },
          { os: 'mac', q: '「フォルダーを開く」がありません', a: '「ファイル」→「開く(Open…)」を選び、agent1 を選んで「開く」を押しても同じです。' },
          HELP_MAC_DESKTOP
        ]
      },
      {
        id: 'v1', kind: 'know', tag: '基礎知識', title: 'VS Codeの画面構成',
        html:
          '<p>VS Codeの画面は、大きく4つの領域に分かれています。それぞれの名前と位置を確認しておきます。</p>' +
          '<div class="vsmock noruby">' +
          '<div class="vs-menu"><b>① 上：メニュー</b>ファイル　編集　表示　…　ターミナル</div>' +
          '<div class="vs-side"><b>② 左：ファイル一覧</b>（エクスプローラー）<br>AGENT1<br>　├ ファイル<br>　└ フォルダ</div>' +
          '<div class="vs-edit"><b>③ 中央：編集領域</b>ファイルを開くと、中身がここに表示されます</div>' +
          '<div class="vs-term"><b>④ 下：ターミナル</b>文字で命令を入力する場所。Claude Codeもここで使います</div>' +
          '</div>' +
          '<p class="note">ターミナルはまだ表示されていない場合があります。次の画面で開きます。</p>' +
          '<p class="note">画面の右側などに、「チャット」や「Copilot」のようなAIの欄が表示されていることがあります。このレッスンでは<b>使いません</b>。そのままにしておいてください。</p>',
        help: [
          { q: '見た目が違います', a: 'VS Codeは更新によって見た目が少し変わります。各領域の名前が同じであれば問題ありません。' },
          { q: '左の一覧が見えません', a: '左端にアイコンが縦に並んでいます。いちばん上の、ファイルが2枚重なったような形のアイコンをクリックすると、ファイル一覧が表示されます。' }
        ]
      },
      {
        id: 'v2', kind: 'pc', tag: '任意', title: 'VS Codeの表示を日本語にする（任意）',
        html:
          '<p>VS Codeの表示は、最初は英語です。この教材は<b>英語のままでも</b>進められます。日本語にしたい場合のみ、次の手順を行ってください。</p>' +
          '<p class="note">VS Codeは、パソコンの言語設定に合わせて、日本語の「言語パック」のインストールを画面の右下で勧めてくることがあります（公式の案内）。「Install and Restart」のようなボタンが表示されたら、それを押すだけで完了します。</p>' +
          '<ol>' +
          '<li>' + os('CtrlキーとShiftキーとPキーを同時に押します。', '⌘（Command）キーとShiftキーとPキーを同時に押します。') + '（コマンドを入力する欄が上部に表示されます）</li>' +
          '<li><b>display</b> と入力します。</li>' +
          '<li><b>Configure Display Language</b> を選びます。</li>' +
          '<li><b>日本語（ja）</b>を選びます（まだインストールされていなければ、VS Codeがインストールします）。</li>' +
          '<li>「再起動(Restart)」を押します。</li>' +
          '</ol>' +
          '<p class="note">日本語にならなくても問題ありません。英語のまま進めてください。この教材では、メニュー名に英語も併記しています。</p>',
        help: [
          { q: '日本語が選べません', a: 'インターネットに接続されているか確認してください。接続されているのに表示されない場合は、英語のまま進めてかまいません。' },
          { q: '元の英語に戻したいです', a: '同じ手順で<b>English</b>を選び、再起動します。' }
        ]
      },
      {
        id: 's8', kind: 'pc', tag: 'PCで操作', title: 'ターミナルを開く',
        html:
          '<p>「ターミナル」は、<b>文字でパソコンに命令する場所</b>です。命令は、VS Code上部の「検索バー」ではなく、<b>下のターミナル</b>に入力します。</p>' +
          '<p class="note">ターミナルの表示・非表示を切り替えるには、' + os('CtrlキーとJキー', '⌘（Command）キーとJキー') + 'を同時に押します（便利なショートカット）。</p>' +
          '<ol>' +
          '<li>VS Code上部のメニューで「ターミナル(Terminal)」→「新しいターミナル(New Terminal)」を選びます。</li>' +
          '<li>画面の下に、文字を入力する場所が表示されます。</li>' +
          '</ol>' +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> _'],
                 ['（あなたの名前）@MacBook agent1 % _']) +
          os('<p>先頭に <b>PS</b> と表示されていれば「PowerShell」です。このレッスンではこれを使います。</p>',
             '<p>行末が <b>%</b> または <b>$</b> の行が表示されていれば、準備完了です。このレッスンではこれを使います。</p>'),
        help: [
          { os: 'win', q: '「PS」が出ていません', a: '先頭が「C:\\」だけの場合は、別の種類のターミナルです。ターミナルの右上にある「＋」の横の「▾」を押して、「PowerShell」を選んでください。' },
          { os: 'mac', q: '終わりが「%」ではなく「$」です', a: '問題ありません。「%」でも「$」でも、このレッスンの命令は同じように使えます。ターミナルの種類（zsh か bash か）は、あとで必要になったときだけ <b>ps -p $$ -o comm=</b> で確認します。記号だけで判断する必要はありません。' },
          HELP_ENG
        ]
      },
      {
        id: 's9', kind: 'pc', tag: 'PCで操作', title: 'ターミナルに文字を入力する',
        html:
          '<ol>' +
          '<li>下の「コピー」を押します。</li>' +
          '<li>ターミナルの入力欄をクリックします。</li>' +
          '<li>貼り付けて（' + PASTE + '）、' + ENTER + 'を押します。</li>' +
          '</ol>' +
          cmd('echo こんにちは') +
          '<p class="note">ターミナルに自分で文字を入力するときは、<b>英字入力</b>に切り替えます（日本語入力のままだと全角文字になり、動きません）。' + os('「半角/全角」キーで切り替えます。', '「英数」キーで切り替えます（「英数」キーがないキーボードでは、Controlキーとスペースバー）。') + '</p>' +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> echo こんにちは', 'こんにちは'],
                 ['（あなたの名前）@MacBook agent1 % echo こんにちは', 'こんにちは']) +
          '<p>「こんにちは」と表示されたら成功です。画面の表示を消したいときは、<b>clear</b> と入力して' + ENTER + 'を押します。</p>',
        help: [
          { q: '貼り付けられません', a: os('Ctrl+Vで貼り付けられない場合は、ターミナルの上でマウスを右クリックすると貼り付けられることがあります。', '⌘+Vで貼り付けられない場合は、ターミナルの上で2本指でタップ（またはControlキーを押しながらクリック）して、「ペースト」を選んでください。') },
          { q: '何も起きません', a: ENTER + 'を押したか確認してください。文字を入力したあと、' + ENTER + 'を押すと実行されます。' },
          { q: '文字が全角やひらがなになります', a: '日本語入力がオンのままです。' + os('「半角/全角」キー', '「英数」キー') + 'を押してから入力し直してください。「コピー」ボタンで貼り付ければ、入力ミスを防げます。' }
        ]
      },
      {
        id: 's10', kind: 'know', tag: '基礎知識', title: '安全のための3つのルール',
        html:
          '<p>ターミナルは、パソコンに直接命令できる強力な道具です。次の3つを守ってください。</p>' +
          '<ul class="parts">' +
          '<li><b>① 教材のコマンドだけ</b>この教材が案内したもの以外は貼り付けない</li>' +
          '<li><b>② 知らないサイトのコマンドは貼らない</b><span>意味がわからないものは実行しない</span></li>' +
          '<li><b>③ パスワードはブラウザの画面だけ</b><span>ターミナルやAIとの会話には書かない</span></li>' +
          '</ul>',
        help: [
          { q: '間違えて何か実行してしまいました', a: '慌てる必要はありません。ここで一度作業を止め、画面をそのままの状態で保存（スクリーンショット）してから、詳しい人に相談してください。' }
        ]
      },
      {
        id: 's11', kind: 'pc', tag: 'PCで操作', title: 'Antigravity CLI をインストールする',
        html:
          '<p>Googleの「Antigravity（アンチグラビティ）」をインストールします。ターミナルでは <b>agy</b> という名前で呼び出します。Googleアカウントが必要です。</p>' +
          '<ol>' +
          '<li>' + os('先頭が <b>PS</b> のターミナルを開きます。', 'ターミナルを開きます（行末が <b>%</b> または <b>$</b>）。') + '</li>' +
          '<li>下の「コピー」を押し、貼り付けて' + ENTER + 'を押します。</li>' +
          '<li>終わるまでしばらく待ちます。進行状況が表示されないこともあります。</li>' +
          '</ol>' +
          cmdOs(CMD_AGY, CMD_AGY_MAC) +
          '<p class="note">1行のコマンドです。途中で改行せず、そのまま貼り付けてください。</p>' +
          '<p class="note os-mac">Macでは、インストールの最後に「not in your PATH」のような文が表示されることがあります。ここでは何もしません。次の画面でまず <b>agy --version</b> を試します。「command not found」と表示された場合のみ、場所を登録します。</p>',
        help: [
          { os: 'win', q: '「irm」が認識されません、と出ました', a: '先頭が「PS」ではない、別のターミナルを使っています。前の画面に戻って、PowerShellを開き直してください。' },
          { q: 'エラーが出ました', a: '画面の文字をスクリーンショットで保存してください。インターネットに接続されているかも確認してください。' }
        ]
      },
      {
        id: 's12', kind: 'pc', tag: 'PCで操作', title: 'VS Codeを開き直して確認する',
        html:
          '<p>インストールしたあとは、ターミナルを<b>新しく</b>開かないと使えるようになりません。</p>' +
          '<ol>' +
          '<li>VS Codeをいったん' + os('閉じます', '終了します（⌘（Command）キーとQキー。赤い丸のボタンでは終了しません）') + '。</li>' +
          '<li>もう一度開いて、「ターミナル」→「新しいターミナル」を選びます。</li>' +
          '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。</li>' +
          '</ol>' +
          cmd('agy --version') +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> agy --version', '（数字のバージョンが出ます）'], ['（あなたの名前）@MacBook agent1 % agy --version', '（数字のバージョンが出ます）']) +
          '<p>バージョン番号が表示されれば成功です。次の画面へ進みます。</p>' +
          macPathFix('agy'),
        help: [HELP_NOTFOUND, HELP_ENG]
      },
      {
        id: 's13', kind: 'pc', tag: 'PCで操作', title: 'agy を初めて起動する',
        html:
          '<ol>' +
          '<li>下の「コピー」を押し、ターミナルに貼り付けてEnterキーを押します。</li>' +
          '<li>初回設定の画面が表示されます。次のように答えます。<ul>' +
          '<li><b>色の設定：</b>好きなものを選んでかまいません。</li>' +
          '<li><b>表示方法：</b>どちらでもかまいません。</li>' +
          '<li><b>フォルダを信頼しますか：</b>agent1 は自分で作った練習用フォルダなので、信頼します。</li>' +
          '</ul></li>' +
          '</ol>' +
          cmd('agy'),
        help: [
          { q: '選択肢の選び方がわかりません', a: '矢印キー（↑↓）で移動し、Enterキーで決定します。' },
          HELP_ENG
        ]
      },
      {
        id: 's14', kind: 'pc', tag: 'PCで操作', title: 'Googleアカウントでログインする',
        html:
          '<ol>' +
          '<li>ブラウザが自動で開きます。</li>' +
          '<li>自分のGoogleアカウントでログインします。</li>' +
          '<li>ログインが終わったら、ターミナルの画面に戻ります。</li>' +
          '</ol>' +
          '<p class="note warn"><b>パスワードは、ブラウザのログイン画面にだけ</b>入力してください。ターミナルやAIとの会話には入力しません。</p>',
        help: [
          { q: 'ブラウザが開きません', a: 'ターミナルにログイン用のアドレスが表示されていないか確認してください。表示されていれば、そのアドレスを自分でブラウザに貼り付けて開きます。' },
          { q: 'Googleアカウントがありません', a: '先にGoogleアカウントを作成してください。アカウントの作成は自分で行います。' }
        ]
      },
      {
        id: 's15', kind: 'pc', tag: 'PCで操作', title: '実習① agyに話しかける',
        html:
          '<p>agyの画面下部の入力欄に、依頼文を貼り付けます。</p>' +
          '<ol>' +
          '<li>「コピー」を押します。</li>' +
          '<li>agyの入力欄に貼り付けて、Enterキーを押します。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('agy')[0]) +
          '<p>返答が表示されたら成功です。</p>',
        help: [HELP_APPROVE]
      },
      {
        id: 's16', kind: 'pc', tag: 'PCで操作', title: '実習② ファイルを作成してもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押し、agyの入力欄に貼り付けてEnterキーを押します。</li>' +
          '<li>許可を求められたら、<b>Y</b>を押します。</li>' +
          '<li>VS Codeの左側に <b>jikoshokai-agy.txt</b> が追加されたら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('agy')[1]),
        help: [HELP_APPROVE]
      },
      {
        id: 's17', kind: 'pc', tag: 'PCで操作', title: '実習③ フォルダを作成してもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押し、agyの入力欄に貼り付けてEnterキーを押します。</li>' +
          '<li>許可を求められたら、<b>Y</b>を押します。</li>' +
          '<li>VS Codeの左側に <b>memo-agy</b> フォルダが追加されたら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('agy')[2]),
        help: [HELP_APPROVE]
      },
      {
        id: 's18', kind: 'pc', tag: 'PCで操作', title: '実習④ ファイルを移動してもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押し、agyの入力欄に貼り付けてEnterキーを押します。</li>' +
          '<li>許可を求められたら、<b>Y</b>を押します。</li>' +
          '<li>jikoshokai-agy.txt が <b>memo-agy</b>フォルダの中に移動したら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('agy')[3]) +
          '<p>作業が終わったら、agyに <b>/exit</b> と入力してEnterキーを押すと、終了できます。</p>',
        help: [
          HELP_APPROVE,
          { q: 'フォルダが増えていません', a: 'VS Codeの左側の表示が更新されていないことがあります。フォルダ名の上にマウスポインタをゆっくり動かしてみてください。それでも表示されない場合は、agyに「今、ファイルとフォルダはどうなっていますか？」と聞いてください。' }
        ]
      },
      {
        id: 'b19', kind: 'pc', tag: 'PCで操作', title: 'agyにCodexをインストールしてもらう',
        html:
          '<p>ここがエージェントの便利なところです。AIに、ほかのAIをインストールしてもらいます。</p>' +
          '<ol>' +
          '<li>ターミナルで <b>agy</b> を起動します。</li>' +
          '<li>下の「コピー」を押し、agyの入力欄に貼り付けてEnterキーを押します。</li>' +
          '<li>許可を求められたら、<b>Y</b>を押します。</li>' +
          '<li>終わったら、<b>/exit</b> で終了します。</li>' +
          '</ol>' +
          osBlock(
            window.COURSE.copybox('このPCにCodexをインストールしてください。PowerShellで次のコマンドを実行してください。\n' + CMD_CODEX + '\n完了したら、codex --version で動作を確認してください。'),
            window.COURSE.copybox('このMacにCodexをインストールしてください。ターミナルで次のコマンドを実行してください。\n' + CMD_CODEX_MAC + '\n完了したら、codex --version で動作を確認してください。')
          ) +
          '<p class="note">うまくいかない場合は、「困ったとき」に、自分でターミナルに貼り付ける方法を載せています。</p>',
        help: [
          {
            q: 'agyでうまくインストールできませんでした（自分でインストールする方法）',
            a: os('先頭が「PS」のターミナルに貼り付けて、Enterキーを押します。<br><b>Codex：</b>' + window.COURSE.copybox(CMD_CODEX),
                  'ターミナルに貼り付けて、Returnキーを押します。<br><b>Codex：</b>' + window.COURSE.copybox(CMD_CODEX_MAC))
          },
          { os: 'win', q: 'エラー（StrictModeなど）が出ました', a: '公式の案内では、コマンドの <b>powershell</b> のあとに <b>-NoProfile</b> を追加すると防げます。次のコマンドでもう一度試してください。' + window.COURSE.copybox('powershell -NoProfile -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"') },
          { q: '「Start Codex now? [y/N]」と出ました', a: 'ここでは起動しないため、<b>n</b> と入力して' + ENTER + 'を押します。' },
          HELP_APPROVE
        ]
      },
      {
        id: 'b20', kind: 'pc', tag: 'PCで操作', title: 'VS Codeを開き直してCodexを確認する',
        html:
          '<ol>' +
          '<li>VS Codeをいったん' + os('閉じて', '⌘（Command）キーとQキーで終了して') + '、もう一度開きます。</li>' +
          '<li>新しいターミナルを開きます。</li>' +
          '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。</li>' +
          '</ol>' +
          cmd('codex --version') +
          '<p>バージョン番号が表示されれば成功です。</p>',
        help: [HELP_NOTFOUND]
      },
      {
        id: 's21', kind: 'pc', tag: 'PCで操作', title: 'Codexにログインする',
        html:
          '<p>Codexは、OpenAI（ChatGPTの開発元）のエージェントです。ChatGPTのアカウントが必要です。</p>' +
          '<ol>' +
          '<li>下の「コピー」を押し、ターミナルに貼り付けてEnterキーを押します。</li>' +
          '<li>ログイン方法を聞かれたら、<b>「Sign in with ChatGPT」</b>を選びます。</li>' +
          '<li>ブラウザが開くので、自分のアカウントでログインします。</li>' +
          '</ol>' +
          cmd('codex') +
          '<p class="note warn">パスワードは、ブラウザの画面にだけ入力します。</p>' +
          '<p class="note">ChatGPTのプランによっては、使えないことがあります。使えないと表示された場合は、この手順を飛ばしてかまいません。</p>',
        help: [
          { q: 'ログインできません', a: 'まず、ChatGPTのアカウントがあるか確認してください。アカウントの作成は自分で行います。プランの都合で使えない場合は、この手順を飛ばしてください。' },
          { q: 'ブラウザが開きません', a: 'ターミナルに表示されているアドレスを、自分でブラウザに貼り付けて開いてください。' }
        ]
      },
      {
        id: 's22', kind: 'pc', tag: 'PCで操作', title: 'Codexで同じ4つの作業を行う',
        html:
          '<p>agyと同じ4つの作業を、順番に依頼します。それぞれ「コピー」→ Codexの入力欄に貼り付け → Enterキーの順に操作します。許可を求められたら、<b>Y</b>（または画面の「はい」）を選びます。</p>' +
          fourBoxes('codex') +
          '<p>最後に、VS Codeの左側に <b>memo-codex</b> フォルダがあり、その中に <b>jikoshokai-codex.txt</b> が入っていれば成功です。</p>',
        help: [HELP_APPROVE, { q: 'Codexの終わり方', a: os('Ctrl キー', 'Controlキー（⌘キーではありません）') + 'を押しながら C を2回押すか、画面の案内に沿って終了します。' }]
      },
      {
        id: 's23', kind: 'know', tag: '基礎知識', title: 'Claudeのプランを確認する',
        html:
          '<p>Claude Codeを使うには、Claudeの<b>有料プラン</b>が必要です。公式の案内では、無料プランではClaude Codeを使えません。</p>' +
          '<ol>' +
          '<li>ブラウザで <b>claude.ai</b> を開いて、ログインします。</li>' +
          '<li>アカウントやプランの画面で、現在のプランを確認します。画面の名前は変わることがあります。</li>' +
          '</ol>' +
          '<p class="note warn">支払い情報の入力は、<b>必ず自分で</b>公式の画面から行ってください。金額や内容は、その画面で確認してください。この教材が代わりに入力することはありません。</p>' +
          '<p>ここで支払わないことにしてもかまいません。その場合はここで止めて、先にレッスン1B（任意）で、Antigravity（無料のGoogleアカウントで利用可能）を使って同じ練習を試せます。</p>' +
          '<p class="note">このコースの以降のレッスンでは、Claude Codeを使います。いつでもここに戻って続けられます。</p>',
        help: [
          { q: '無料プランのままだと、どうなりますか？', a: 'Claude Codeにログインしても使えません。有料プランに切り替えるか、レッスン1B（任意）で無料のAIを試してください。' },
          { q: '解約したくなったら？', a: 'プランの解約方法も、公式の画面で確認できます。契約する前に、解約方法も確認しておくと安心です。' }
        ]
      },
      {
        id: 'f1', kind: 'pc', tag: 'PCで操作', title: 'Claude Codeを初めて起動する',
        html:
          '<p>公式の案内では、初めて起動するとブラウザでログインするよう案内されます。そのほかの選択画面が順番に表示されることもあります。1つずつ進めます。</p>' +
          '<ol>' +
          '<li>ターミナルの行末が ' + os('<b>agent1&gt;</b>（先頭が <b>PS</b>）', '<b>agent1 %</b>') + ' になっているか確認します。</li>' +
          '<li>下の「コピー」を押し、貼り付けて' + ENTER + 'を押します。</li>' +
          '<li>選択画面では、矢印キー（↑↓）で選んで' + ENTER + 'で決定します。</li>' +
          '</ol>' +
          cmd('claude') +
          '<h2>① 文字の見た目（テーマ）</h2>' +
          '<p>この画面が表示されたら、どれを選んでもかまいません。好きなものを選んで' + ENTER + 'を押します。</p>' +
          '<h2>② ログイン方法</h2>' +
          '<p>次のような3つの選択肢が表示されたら、<b>1番</b>（Claudeのアカウントでログインする方法）を選びます。</p>' +
          term(['Select login method:', '', '❯ 1. Claude account with subscription · Pro, Max, Team, or Enterprise', '  2. Anthropic Console account · API usage billing', '  3. 3rd-party platform · Amazon Bedrock, Microsoft Foundry, or Vertex AI']) +
          '<p class="note">画面の順番や文言は、バージョンによって変わることがあります。異なる場合は、画面の案内に沿って進めてください。</p>',
        help: [
          { q: '選択の画面が出ません', a: '表示されないこともあります。そのまま次の画面へ進んでください。' },
          { q: '「プランが必要です」と出ました', a: '無料プランの場合に表示されるメッセージです。前の画面でプランを確認してください。' },
          HELP_NOTFOUND,
          HELP_ENG
        ]
      },
      {
        id: 'f2', kind: 'pc', tag: 'PCで操作', title: 'ブラウザでログインしてターミナルに戻る',
        html:
          '<ol>' +
          '<li>ブラウザが自動で開きます。自分のClaudeアカウントでログインします。</li>' +
          '<li>「許可（Authorize）」のようなボタンが表示されたら、内容を確認して押します。これで接続が完了します。</li>' +
          '<li>ターミナルに戻ると、ログイン完了の表示（「Login successful」のような文）が出ています。Enterキーを押して進みます。</li>' +
          '<li>「ターミナルの設定（terminal setup）」の画面が表示されたら、<b>「Yes, use recommended settings」</b>（推奨設定を使う）が選択されていることを確認し、そのままEnterキーを押します。</li>' +
          '</ol>' +
          term(['Use Claude Code\'s terminal setup?', '', '❯ 1. Yes, use recommended settings', '  2. No, maybe later with /terminal-setup']) +
          '<p class="note warn"><b>パスワードは、ブラウザのログイン画面にだけ</b>入力してください。ターミナルには入力しません。</p>',
        help: [
          { q: 'ブラウザが開きません', a: 'ターミナルに表示されているアドレスを、自分でブラウザに貼り付けて開いてください。ログイン画面で <b>c</b> キーを押すと、アドレスがコピーされます（公式の案内）。' },
          { q: 'ログインしたのに、また「ログインしてください」と出ます', a: 'Claude Codeの入力欄に <b>/logout</b> と入力してEnterキーを押します。いったん終了し、もう一度 <b>claude</b> を実行してログインし直します。' },
          HELP_ENG
        ]
      },
      {
        id: 'f3', kind: 'pc', tag: 'PCで操作', title: 'フォルダを信頼する（注意が必要な操作）',
        html:
          '<p>次のように「このフォルダを信頼しますか？」と聞かれます。信頼すると、Claude Codeがこのフォルダのファイルを読んだり、許可を確認しながら書き込んだり、コマンドを実行したりできるようになります。自分で作った練習用の agent1 であれば、<b>信頼してかまいません</b>。</p>' +
          term(['Is this a project you created or one you trust?', '', '❯ No, exit', '  Yes, I trust this folder']) +
          '<div class="card"><b>Enterキーを押す前に、2つ確認します</b><br>① <b>今開いているフォルダが、自分で作った agent1 か。</b>ターミナルの行（' + os('「PS」で始まり「agent1&gt;」で終わる行', '「agent1 %」のように agent1 が表示されている行') + '）や、画面に表示されている場所の名前で確認します。違うフォルダの場合は、「No, exit」で終了し、VS Codeで agent1 を開き直します。<br>② <b>今選択されている項目（❯ の付いた行）はどれか。</b>agent1 であれば、❯ を「Yes, I trust this folder」に合わせて（矢印キー ↑↓ で移動します）、Enterキーを押します。最初は「No, exit」（終了）に ❯ が付いていることがあります。</div>' +
          '<p>「セキュリティに関する案内」のような画面が表示されることがあります。内容を読んで、Enterキーで進みます。Claude Codeはファイルの読み書きやコマンドの実行ができるため、<b>内容を確認しながら使う</b>ことが大切だという案内です。</p>' +
          '<p>そのあと、「Welcome to Claude Code for VS Code」のような歓迎画面が表示されたら、Enterキーで閉じます。</p>' +
          '<p>文字を入力する欄が表示されれば、準備完了です。ここまでの選択画面は<b>最初の1回だけ</b>です。次回からは、すぐに入力欄が表示されます。</p>',
        help: [
          { q: '終了してしまいました', a: 'もう一度ターミナルで <b>claude</b> を実行してください。開いているのが agent1 かを確認してから、❯ が「Yes, I trust this folder」に付いていることを確かめて、Enterキーを押します。' },
          { q: '知らない画面が出ました', a: '画面の下に「Enter to confirm」のような案内が表示されていることが多いです。' + os('', 'Macでは、Enter はReturnキーのことです。') + 'その案内に沿って進めてください。判断できない場合は、画面を保存（スクリーンショット）して相談してください。' },
          { q: '「Auto mode」などの、知らない表示が出ました', a: '設定の名前が画面に表示されているだけの場合があります。許可を求められたら、内容を確認して、これまでどおり「はい(Yes)」を選びます。判断できない場合は、画面を保存（スクリーンショット）して相談してください。' }
        ]
      },
      {
        id: 'c12', kind: 'pc', tag: 'PCで操作', title: 'Claude Code をインストールする',
        html:
          '<p>Claude Codeは、Anthropic（アンソロピック）のエージェントです。ターミナルでは <b>claude</b> という名前で呼び出します。</p>' +
          '<ol>' +
          '<li>' + os('先頭が <b>PS</b> のターミナルを開きます。', 'ターミナルを開きます（行末が <b>%</b> または <b>$</b>）。') + '</li>' +
          '<li>下の「コピー」を押し、貼り付けて' + ENTER + 'を押します。</li>' +
          '<li>終わるまでしばらく待ちます。<b>進行状況は表示されません。</b>画面が止まっているように見えても、そのまま待ちます。</li>' +
          '</ol>' +
          cmdOs(CMD_CLAUDE, CMD_CLAUDE_MAC) +
          '<p class="note">1行のコマンドです。途中で改行せず、そのまま貼り付けてください。</p>' +
          os('<p class="note">公式の案内では、Gitというソフトは「あると便利」とされていますが、なくても使えます。このレッスンではインストールしなくてかまいません。</p>', '') +
          '<p class="note os-mac">Macでは、インストールの最後に「not in your PATH」のような文が表示されることがあります。ここでは何もしません。次の画面でまず <b>claude --version</b> を試します。「command not found」と表示された場合のみ、場所を登録します。</p>',
        help: [
          { os: 'win', q: '「irm」が認識されません、と出ました', a: '先頭が「PS」ではない、別のターミナルを使っています。前の画面に戻って、PowerShellを開き直してください。' },
          { os: 'win', q: '「&&」というエラーが出ました', a: 'このコマンドはPowerShell用です。先頭が「PS」のターミナルでやり直してください。' },
          { os: 'mac', q: '「syntax error near unexpected token」と出ました', a: '公式の案内によると、インストール用のスクリプトの代わりにエラーページが返ってきたときに表示されます。インターネット接続を確認し、少し待ってからもう一度試してください。別のネットワーク（スマホのテザリングなど）でも試せます。' },
          { os: 'mac', q: '「permission denied」と出ました', a: 'ファイルを書き込む権限がないという意味です。「sudo」は使わないでください。画面を保存（スクリーンショット）して相談してください。' },
          { q: 'エラーが出ました', a: '画面の文字をスクリーンショットで保存してください。インターネットに接続されているかも確認してください。' }
        ]
      },
      {
        id: 'c13', kind: 'pc', tag: 'PCで操作', title: 'VS Codeを開き直して確認する',
        html:
          '<p>インストールしたあとは、ターミナルを<b>新しく</b>開かないと使えるようになりません。</p>' +
          '<ol>' +
          '<li>VS Codeをいったん' + os('閉じます', '終了します（⌘（Command）キーとQキー。赤い丸のボタンでは終了しません）') + '。</li>' +
          '<li>もう一度開いて、「ターミナル」→「新しいターミナル」を選びます。</li>' +
          '<li>下の「コピー」を押し、貼り付けて' + ENTER + 'を押します。</li>' +
          '</ol>' +
          cmd('claude --version') +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> claude --version', '（数字のバージョンが出ます）'],
                 ['（あなたの名前）@MacBook agent1 % claude --version', '（数字のバージョンが出ます）']) +
          '<p>バージョン番号が表示されれば成功です。次の画面へ進みます。</p>' +
          macPathFix('claude'),
        help: [
          HELP_NOTFOUND,
          {
            os: 'win',
            q: 'VS Codeを開き直しても、「認識されません」と出ます',
            a: 'インストール時の表示に<b>「Setup notes」</b>と<b>「…is not in your PATH」</b>（場所が登録されていない）という文が出ていた場合は、自分で登録する必要があります。公式の案内では、claudeの場所は <b>C:\\Users\\あなたの名前\\.local\\bin</b> です。<br>' +
               '① スタートメニューで「環境変数」と入力し、「システム環境変数の編集」を開きます。<br>' +
               '② 「環境変数(N)…」を押します。<br>' +
               '③ 上の「ユーザー環境変数」の「Path」を選んで、「編集」を押します。<br>' +
               '④ 「新規」を押して、上の場所（自分の名前が入ったもの）を入力します。<br>' +
               '⑤ すべての画面を「OK」で閉じます。<br>' +
               '⑥ <b>VS Codeを完全に閉じて</b>もう一度開き、新しいターミナルで <b>claude --version</b> を確認します。'
          },
          {
            os: 'mac',
            q: 'VS Codeを開き直しても、「command not found」と出ます',
            a: 'この画面の「command not found と表示された場合のみ」の手順を、上から順に行ってください。登録は1回だけです。それでも表示される場合は、画面を保存（スクリーンショット）して相談してください。'
          },
          {
            q: 'どこが悪いのか、わかりません',
            a: 'claudeが起動する場合は、次のコマンドでインストールの状態を点検できます。' + window.COURSE.copybox('claude doctor')
          },
          HELP_ENG
        ]
      },
      {
        id: 'm1', kind: 'know', tag: '基礎知識', title: '今どちらの画面にいるかを見分ける',
        html:
          '<p>ターミナルには<b>2つの状態</b>があります。今どちらの状態にいるのかを見分けられるようにします。</p>' +
          '<h2>① 通常のターミナル</h2>' +
          '<p>「命令（コマンド）」を入力する場所です。' + os('先頭が <b>PS</b>', '終わりが <b>%</b>') + 'で終わる行が表示されています。</p>' +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> _'], ['（あなたの名前）@MacBook agent1 % _'], '見本（通常のターミナル）') +
          '<h2>② Claude Codeの中</h2>' +
          '<p>普通の言葉で依頼を入力する場所です。入力欄が表示され、AIが答えます。</p>' +
          term(['> （ここに、お願いを入れます）', '', '? for shortcuts'], '見本（Claude Codeの中。細部の表示はバージョンによって異なります）') +
          '<div class="card"><b>見分け方</b><br>・<b>命令</b>（pwd、claude など）を入力する → ①通常のターミナル<br>・<b>依頼の文</b>（「ファイルを作って」など）を入力する → ②Claude Codeの中<br>・②から①に戻るには、<b>/exit</b> と入力して' + ENTER + 'を押します。</div>',
        help: [
          { q: 'どちらにいるのか、わかりません', a: '<b>/exit</b> と入力して' + ENTER + 'を押してください。②にいた場合は①に戻ります。①にいた場合は' + os('「認識されません」', '「no such file or directory」') + 'と表示されるだけで、害はありません。' },
          { q: '「claude」と入力したら、変な画面になりました', a: '①で <b>claude</b> と入力すると、②（Claude Codeの中）に入ります。これは正常な動作です。' }
        ]
      },
      {
        id: 'c15', kind: 'pc', tag: 'PCで操作', title: '実習① Claude Codeに話しかける',
        html:
          '<p>Claude Codeの画面下部の入力欄に、依頼文を貼り付けます。</p>' +
          '<ol>' +
          '<li>「コピー」を押します。</li>' +
          '<li>入力欄に貼り付けて、Enterキーを押します。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('claude')[0]) +
          '<p>返答が表示されたら成功です。</p>',
        help: [HELP_APPROVE_C]
      },
      {
        id: 'c16', kind: 'pc', tag: 'PCで操作', title: '実習② ファイルを作成してもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押し、入力欄に貼り付けてEnterキーを押します。</li>' +
          '<li>許可を求められたら、「はい(Yes)」を選びます。</li>' +
          '<li>VS Codeの左側に <b>jikoshokai-claude.txt</b> が追加されたら、<b>クリックして開きます</b>。</li>' +
          '<li>自己紹介が3行書かれていれば成功です。AIが「完了しました」と答えても、<b>自分の目で確認する</b>ことが大切です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('claude')[1]),
        help: [HELP_APPROVE_C]
      },
      {
        id: 'c17', kind: 'pc', tag: 'PCで操作', title: '実習③ フォルダを作成してもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押し、入力欄に貼り付けてEnterキーを押します。</li>' +
          '<li>許可を求められたら、「はい(Yes)」を選びます。</li>' +
          '<li>VS Codeの左側に <b>memo-claude</b> フォルダが追加されたら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('claude')[2]),
        help: [HELP_APPROVE_C]
      },
      {
        id: 'c18', kind: 'pc', tag: 'PCで操作', title: '実習④ ファイルを移動してもらう',
        html:
          '<ol>' +
          '<li>「コピー」を押し、入力欄に貼り付けてEnterキーを押します。</li>' +
          '<li>許可を求められたら、「はい(Yes)」を選びます。</li>' +
          '<li>VS Codeの左側で <b>memo-claude</b> フォルダの名前をクリックして開き、中に jikoshokai-claude.txt があるか確認します。</li>' +
          '<li>agent1 の直下（memo-claude の外）から jikoshokai-claude.txt が<b>なくなっている</b>ことも確認します。両方を満たしていれば成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox(four('claude')[3]) +
          '<p>Claude Codeは<b>終了せずに</b>、このまま次の画面へ進みます。</p>',
        help: [
          HELP_APPROVE_C,
          { q: 'フォルダが増えていません', a: 'VS Codeの左側の表示が更新されていないことがあります。フォルダ名の上にマウスポインタをゆっくり動かしてみてください。それでも表示されない場合は、Claude Codeに「今、ファイルとフォルダはどうなっていますか？」と聞いてください。' }
        ]
      },
      {
        id: 't1', kind: 'pc', tag: 'PCで操作', title: 'ターミナルの基本① 現在地と中身を確認する',
        html:
          '<p>ターミナルでは、フォルダの間を移動しながら作業します。まず、今どのフォルダにいるかと、その中に何があるかを確認します。</p>' +
          '<ol>' +
          '<li>下の「コピー」を押し、貼り付けて' + ENTER + 'を押します。</li>' +
          '<li>続けて、もう1つのコマンドも同じように実行します。</li>' +
          '</ol>' +
          '<h2>現在いる場所</h2>' +
          cmd('pwd') +
          '<h2>中にあるものの一覧</h2>' +
          cmdOs('dir', 'ls') +
          termOs(['PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> pwd', '', 'Path', '----', 'C:\\Users\\（あなたの名前）\\Desktop\\agent1', '', 'PS C:\\Users\\（あなたの名前）\\Desktop\\agent1> dir', '（まだ何も作っていないので、何も出ません）'],
                 ['（あなたの名前）@MacBook agent1 % pwd', '/Users/（あなたの名前）/Desktop/agent1', '（あなたの名前）@MacBook agent1 % ls', '（まだ何も作っていないので、何も出ません）']) +
          '<p class="note"><b>pwd</b> は「現在いる場所」、<b>' + os('dir', 'ls') + '</b> は「中身の一覧」を表示します。</p>',
        help: [
          { q: '一覧に何も出ません', a: 'それで正常です。agent1 にはまだ何も入っていません。' },
          { q: os('「認識されません」と出ました', '「command not found」と出ました'), a: '入力ミスがないか確認してください。「コピー」ボタンで貼り付ければ、入力ミスを防げます。' },
          HELP_MAC_DESKTOP,
          HELP_ENG
        ]
      },
      {
        id: 't2', kind: 'pc', tag: 'PCで操作', title: 'ターミナルの基本② フォルダを作成して出入りする',
        html:
          '<p>次の4行を貼り付けます。1行ずつ順番に実行されます。</p>' +
          '<ol>' +
          '<li>下の「コピー」を押し、貼り付けて' + ENTER + 'を押します。</li>' +
          '<li>実行が終わるまで少し待ちます。</li>' +
          '<li>最後の行の末尾が ' + os('<b>agent1&gt;</b>', '<b>agent1 %</b>') + ' に戻っていれば成功です。</li>' +
          '</ol>' +
          cmdOs('mkdir renshu\ncd renshu\ndir\ncd ..', 'mkdir renshu\ncd renshu\nls\ncd ..') +
          termOs(['PS ...\\agent1> mkdir renshu', 'PS ...\\agent1> cd renshu', 'PS ...\\agent1\\renshu> dir', '（何も出ません）', 'PS ...\\agent1\\renshu> cd ..', 'PS ...\\agent1>'],
                 ['...agent1 % mkdir renshu', '...agent1 % cd renshu', '...renshu % ls', '（何も出ません）', '...renshu % cd ..', '...agent1 %'], '見本（実行の流れ）') +
          '<h2>よく使う6つのコマンド</h2>' +
          '<ul class="parts">' +
          '<li><b>pwd</b><span>現在いる場所</span></li>' +
          '<li><b>' + os('dir', 'ls') + '</b><span>中身の一覧</span></li>' +
          '<li><b>cd 名前</b><span>そのフォルダに入る</span></li>' +
          '<li><b>cd ..</b><span>1つ上のフォルダに戻る</span></li>' +
          '<li><b>mkdir 名前</b><span>フォルダを作る</span></li>' +
          '<li><b>clear</b><span>画面の表示を消す</span></li>' +
          '</ul>',
        help: [
          { q: 'まだ renshu の中にいます', a: 'ターミナルに <b>cd ..</b> と入力して' + ENTER + 'を押すと、1つ上のフォルダに戻ります。' },
          { q: '「すでに存在します」と出ました', a: 'renshu フォルダがすでにあるという意味です。そのまま次へ進んでかまいません。' },
          HELP_ENG
        ]
      },
      {
        id: 'w1', kind: 'pc', tag: 'PCで操作', title: '文章で依頼してウェブページを作成してもらう',
        html:
          '<p>ここまでは、ファイルとフォルダを作成してもらいました。次は、<b>画面で見て確認できるもの</b>を作ってもらいます。</p>' +
          '<ol>' +
          '<li>「コピー」を押し、Claude Codeの入力欄に貼り付けてEnterキーを押します。</li>' +
          '<li>許可を求められたら、「はい(Yes)」を選びます。</li>' +
          '<li>VS Codeの左側に <b>my-page.html</b> が追加されたら成功です。</li>' +
          '</ol>' +
          window.COURSE.copybox('my-page.html という名前で、シンプルな自己紹介のウェブページを作成してください。名前は「さくら」、ひとことは「はじめまして、AIを勉強中です」としてください。背景は白にし、名前とひとことだけを画面の中央に大きく表示してください。') +
          '<p class="note">名前とひとことは架空のものです。実際の個人情報は入力しないでください。</p>',
        help: [
          HELP_APPROVE_C,
          { q: 'my-page.html が増えません', a: 'VS Codeの左側の表示が更新されていないことがあります。少し待つか、フォルダ名の上でマウスを動かしてみてください。AIが別の名前でファイルを作成した場合は、その名前で進めてください。' }
        ]
      },
      {
        id: 'w2', kind: 'pc', tag: 'PCで操作', title: 'ブラウザで開いて確認する',
        html:
          '<ol>' +
          '<li>VS Codeの左側で <b>my-page.html</b> を右クリックします' + os('', '（Macでは、Controlキーを押しながらクリック）') + '。</li>' +
          '<li>' + os('「エクスプローラーで表示(Reveal in File Explorer)」', '「Finderで表示(Reveal in Finder)」') + 'を選びます。</li>' +
          '<li>表示されたウインドウで、<b>my-page.html</b> をダブルクリックします。</li>' +
          '<li>ブラウザでページが開きます。</li>' +
          '</ol>' +
          '<h2><span class="tag sample">見本</span>表示される画面の例</h2>' +
          '<div class="card sample-box" style="text-align:center;padding:36px 16px;"><div style="font-size:30px;font-weight:700;">さくら</div><div style="font-size:18px;">はじめまして、AIを勉強中です</div></div>' +
          '<p class="note">見た目は、AIによって多少異なることがあります。</p>',
        help: [
          { q: 'ダブルクリックしても開きません', a: os('ファイルを右クリックし、「プログラムから開く」でブラウザ（ChromeやEdgeなど）を選んでください。', 'ファイルをControlキーを押しながらクリックし、「このアプリケーションで開く」でブラウザ（SafariやChromeなど）を選んでください。') },
          { q: '文字が、おかしな文字になっています', a: 'Claude Codeに「my-page.html の文字化けを直してください」と依頼してください。' },
          { q: 'ファイルが見つかりません', a: 'VS Codeの左側に my-page.html があるか確認してください。ない場合は、1つ前の画面からやり直してください。' }
        ]
      },
      {
        id: 'w3', kind: 'pc', tag: 'PCで操作', title: 'ページを修正してもらう',
        html:
          '<p>新しく作るのではなく、<b>今あるページの修正を依頼します</b>。Claude Codeの同じ画面で、続けて依頼します。</p>' +
          '<ol>' +
          '<li>「コピー」を押し、Claude Codeの入力欄に貼り付けてEnterキーを押します。</li>' +
          '<li>許可を求められたら、「はい(Yes)」を選びます。</li>' +
          '<li>ブラウザに戻って、' + os('<b>F5</b>キー', '<b>⌘（Command）キーとRキー</b>') + 'を押します（ページを再読み込みします）。</li>' +
          '</ol>' +
          window.COURSE.copybox('my-page.html の文字の色を青に、背景を薄い黄色に変更してください。') +
          '<p>色が変わっていれば成功です。</p>' +
          '<p>時間があれば、色や文言を自分で変えて、もう一度依頼してみてください。依頼の言葉を変えると結果も変わることがわかります。</p>' +
          '<p>作業が終わったら、Claude Codeに <b>/exit</b> と入力してEnterキーを押すと、終了できます。</p>',
        help: [
          HELP_APPROVE_C,
          { q: '色が変わりません', a: 'ブラウザでページを再読み込み（' + os('F5キー', '⌘キーとRキー') + '）したか確認してください。それでも変わらない場合は、Claude Codeに「my-page.html は変更されましたか？」と聞いてください。' }
        ]
      },
      {
        id: 'c19', kind: 'check', tag: '確認', title: '最後の確認',
        widget: 'checks',
        checks: [
          'VS Codeをインストールし、agent1フォルダを開けた',
          'ターミナルで、echoやpwd、cd、mkdirなどの命令を実行できた',
          'Claude Codeに4つの作業（話しかける、ファイルを作る、フォルダを作る、ファイルを移動する）を依頼できた',
          '文章で依頼してウェブページを作成してもらい、修正してもらえた'
        ],
        html:
          '<p>できた項目にチェックを入れてください。4つすべてにチェックが入ると、「完了にする」を押せます。</p>' +
          '<p class="note">ほかのAIも試したい場合は、目次のレッスン1B（任意）へ進めます。</p>',
        help: [
          { q: 'できなかったところがあります', a: 'そのステップに戻って、「困ったとき」を確認してください。何度でもやり直せます。' }
        ]
      },
      {
        id: 'b1', kind: 'sample', tag: '任意', title: 'ほかのAIを試す（任意）',
        html:
          '<p class="note warn"><b>このレッスン1Bは任意です。</b>レッスン1の前半（VS Codeの準備とagent1フォルダの作成）を終えた人が対象です。</p>' +
          '<p>ここでは、次の2つを試せます。</p>' +
          '<ul class="parts">' +
          '<li><b>Antigravity（agy）</b>Googleのエージェント<br><span>無料のGoogleアカウントで使えます</span></li>' +
          '<li><b>Codex</b>OpenAIのエージェント<br><span>ChatGPTのアカウントが必要です</span></li>' +
          '</ul>' +
          '<p>同じ依頼を順番に行い、結果を比較します。</p>' +
          '<p class="note">有料プランを契約したくない場合は、まずAntigravityだけを試してもかまいません。</p>',
        help: [
          { q: 'レッスン1Bは必要ですか？', a: '必須ではありません。AIごとの違いを知りたい人や、無料で試したい人向けです。' }
        ]
      },
      {
        id: 'b26', kind: 'know', tag: '基礎知識', title: 'AIごとの違いを比較する',
        html:
          '<p>同じ依頼を、複数のAIに行いました。次の点を振り返ってみてください。</p>' +
          '<ul>' +
          '<li>どれが最も<b>わかりやすい</b>と感じましたか？</li>' +
          '<li>許可の求め方はどう違いましたか？</li>' +
          '<li>返答の長さや言葉づかいはどう違いましたか？</li>' +
          '</ul>' +
          '<p>正解はありません。自分にとってどれが使いやすいかが大切です。メモしておくと、あとで役に立ちます。</p>' +
          '<p>VS Codeの左側には、<b>jikoshokai-</b> で始まるファイルが、使ったAIの数だけ（agy、codex、claude）あるはずです。開いて中身を比べてみてください。</p>',
        help: [
          { q: '1つしか使えませんでした', a: '問題ありません。使えたものだけで比べてください。' }
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
    title: 'AIエージェントの理解と作業環境の準備',
    short: 'パソコンにAIの助手（Claude Code）をインストールし、ファイルを作成してもらう',
    devices: 'PC',
    doneCard: '<b>レッスン1　完了です。おつかれさまでした。</b><br>パソコンの中で、AIに作業を依頼できるようになりました。次はレッスン2です。',
    steps: pick(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 'v1', 'v2', 's8', 's9', 't1', 't2', 's10',
                 's23', 'c12', 'c13', 'f1', 'f2', 'f3',
                 'm1', 'c15', 'c16', 'c17', 'c18', 'w1', 'w2', 'w3', 'c19'])
  };

  /* おまけ（任意）：ほかのAIも試す */
  var bonus = {
    id: 'l1b', no: '1B', needsPc: true, ready: true, optional: true, minutes: 60,
    title: 'ほかのAIを試す（任意）',
    short: 'Antigravity（無料のGoogleアカウントで利用可能）とCodexで、同じ4つの作業を行う',
    devices: 'PC',
    doneCard: '<b>レッスン1B　完了です。おつかれさまでした。</b>',
    steps: pick(['b1', 's11', 's12', 's13', 's14', 's15', 's16', 's17', 's18',
                 'b19', 'b20', 's21', 's22', 'b26'])
  };

  /* 予定の1番(仮題)を、本物のレッスン1に置きかえ、すぐ後ろにおまけを入れる */
  var C = window.COURSE;
  for (var i = 0; i < C.lessons.length; i++) {
    if (C.lessons[i].id === 'l1') { C.lessons.splice(i, 1, lesson1, bonus); break; }
  }
})();
