/* レッスン8：作品の保存と公開、スマホで続きを見る（GitHub・デスクトップアプリ・クラウドセッション）
   内容は2026-10-31に公式の案内で確認：
   GitHub CLI：cli.github.com manual（auth login・auth status・repo create・repo edit）、docs/install_windows.md・install_macos.md
   GitHub Docs：アカウント作成、デバイスフロー、メールアドレスの設定、clone、Pages（作成・プラン）、Trending、Star
   Git：git-scm.com（Windows・Mac）、Apple TN2339（xcode-select --install）
   Claude Code：desktop・desktop-quickstart、claude-code-on-the-web・web-quickstart・cloud-environments、remote-control、permission-modes、setup（Windows）
   markitdown：github.com/microsoft/markitdown
   ・gh auth login は、ターミナルで「Gitの認証もするか」を聞いてくる → Y。コードは「8文字・まん中にハイフン」、github.com/login/device に入れる
   ・gh repo create --source . --push は、git init とコミットが先に必要
   ・gh repo edit --visibility public には --accept-visibility-change-consequences が必要
   ・GitHub Free では、Pages は公開（public）リポジトリだけ。反映まで最大10分。URLは ユーザー名.github.io/リポジトリ名
   ・noreply のメール：ID+ユーザー名@users.noreply.github.com。「Keep my email addresses private」「Block command line pushes that expose my email」
   ・Mac の gh：公式は Homebrew か、リリースの universal のインストーラー（.pkg は署名なし）。git は xcode-select --install
   ・Windows：Git for Windows は入れなくても Claude Code は動く。入れても、ふだんの中心は PowerShell のまま
   ・デスクトップアプリ：claude.com/download。Codeタブ → Local → Open folder…。モードは Manual・Accept edits・Plan・Auto・Bypass permissions（Bypass は設定で許可しないと出ない）。プロジェクトのスキルも / に出る
   ・クラウドセッション：claude.ai/code。GitHubの接続が必要。非公開リポジトリには Claude GitHub App。閉じても動き続ける。ブランチを push → 差分を見る → Create PR
   ・Remote Control：/remote-control（/rc）。はじめに「Enable Remote Control」。/rc をもう一度で切る。/mobile でアプリのQR。APIキーでは使えない。ターミナルを閉じるとオフライン。スリープからは自動で再接続 */
(function () {
  'use strict';
  var C = window.COURSE;
  var cmd = C.cmd, box = C.copybox, os = C.os, osBlock = C.osBlock, cmdOs = C.cmdOs;

  var HELP_APPROVE = {
    q: 'AIに「許可しますか？」と聞かれました',
    a: 'git や gh のコマンドを実行する前に、AIが許可を求めます。内容を読み、<b>cafe-landing に関する操作</b>であれば<b>1番目の「Yes」</b>を選びます。「次から聞かない」の選択肢は選びません。判断できないときは「いいえ(No)」を選んでください。'
  };
  var HELP_ENG = { q: '画面の表示が英語です', a: '問題ありません。表示が英語でも操作は同じです。' };
  var HELP_USER = {
    q: '「ユーザー名」がわかりません',
    a: 'GitHubの画面右上にある丸いアイコンを押すと表示されます。Claude Codeに「GitHubのユーザー名を教えてください」と頼めば、gh で調べてくれます。'
  };
  var HELP_INSTALL_AI = {
    q: 'AIが何かをインストールしようとします',
    a: '「いいえ(No)」を選び、「インストールは自分で行います」と伝えます。何を、なぜ入れるのかを聞いてから、自分で判断します。'
  };

  var steps = [
    {
      id: 'i1', kind: 'sample', tag: '目標', title: 'レッスン8で学ぶこと',
      html:
        '<p class="note warn"><b>このレッスンにはWindowsかMacのパソコンが必要です。</b>スマホは最後の画面で使います（なくても進められます）。画面右上の「Windows／Mac」ボタンで、自分のパソコンを選んでください。</p>' +
        '<p>作ったものを<b>インターネット上の保管場所（GitHub）</b>に保存し、<b>誰でも見られるページ</b>として公開します。そのあと、VS Code 以外の場所（<b>デスクトップアプリ・ブラウザ・スマホ</b>）からもClaudeに作業を頼めるようにします。</p>' +
        '<div class="card goal"><b>目標</b><br>① GitHubにカフェのページを<b>保存</b>し、別のフォルダに<b>取り出せる</b>（復元できる）ことを確認する<br>② GitHub Pagesでページを<b>インターネットに公開</b>する<br>③ <b>デスクトップアプリ</b>と<b>クラウドセッション</b>でClaudeに作業を頼む<br>④ <b>スマホ</b>からパソコンの会話の続きを見る（任意）</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>所要時間</dt><dd>約2時間半（途中で休憩できます。「ひと休みポイント」が2か所あります）</dd>' +
        '<dt>使うもの</dt><dd>VS Code、agent1フォルダ、Claude Code、Claudeの有料プラン、GitHubのアカウント（無料。作成方法はこのあと説明します）</dd>' +
        '</dl></div>' +
        '<p class="note warn">今日は<b>インターネットに公開</b>する作業があります。公開するページには、<b>名前・住所・電話番号・パスワードなどの個人情報を入れないでください</b>。</p>',
      help: [
        { q: 'レッスン7が終わっていません', a: 'このレッスンはレッスン7のスキルがなくても進められます。デスクトップアプリの画面にスキルが表示されないだけです。' },
        { q: 'スマホを持っていません', a: '問題ありません。スマホの画面は読むだけにして、先へ進んでください。' }
      ]
    },
    {
      id: 'i2', kind: 'know', tag: '基礎知識', title: 'GitHubとは',
      html:
        '<p><b>GitHub</b>（ギットハブ）は、フォルダをインターネット上に保存しておける、<b>クラウドの共有フォルダ</b>のような場所です。Googleドライブにフォルダを置くのと似ています。</p>' +
        '<h2>GitHubでできること</h2>' +
        '<ul class="parts">' +
        '<li><b>バックアップ</b>フォルダを丸ごと保存する<br><span>パソコンのフォルダが壊れても、GitHubに残る</span></li>' +
        '<li><b>取り出す</b>ほかのパソコンでも同じフォルダを取り出せる<br><span>新しいパソコンでも続きから始められる</span></li>' +
        '<li><b>戻す</b>前の状態に戻せる<br><span>保存するたびに記録が残る</span></li>' +
        '<li><b>変更の記録</b>「なぜ直したか」のメモが残る<br><span>あとでAIもそのメモを読み、経緯を把握できる</span></li>' +
        '</ul>' +
        '<h2>覚える用語は4つだけ</h2>' +
        '<ul class="parts">' +
        '<li><b>リポジトリ</b>GitHub上のフォルダ1つ分<br><span>略して「リポ」とも呼ぶ</span></li>' +
        '<li><b>コミット</b>現在の状態をメモ付きで記録すること<br><span>ゲームの「セーブ」のようなもの</span></li>' +
        '<li><b>プッシュ</b>記録をGitHubに送ること<br><span>パソコン → GitHub</span></li>' +
        '<li><b>クローン</b>リポジトリを丸ごと取り出すこと<br><span>GitHub → パソコン</span></li>' +
        '</ul>' +
        '<p class="note">道具の名前は<b>Git</b>（ギット：記録をとる道具）と<b>GitHub</b>（記録を保存する場所）です。名前は似ていますが、別のものです。</p>',
      help: [
        { q: '全部覚えないといけませんか？', a: 'いいえ。作業はAIが手伝います。「コミット」「プッシュ」という言葉が出てきたら、この画面に戻って確認すれば十分です。' }
      ]
    },
    {
      id: 'i3', kind: 'pc', tag: 'PCで操作', title: 'GitHubのアカウントを自分で作る',
      html:
        '<p>アカウントは<b>自分で</b>作ります。パスワードや確認コードは<b>自分だけ</b>が入力し、AIには教えません。</p>' +
        '<ol>' +
        '<li>ブラウザで <b>github.com/signup</b> を開きます。<br><a href="https://github.com/signup" target="_blank" rel="noopener">github.com/signup を開く</a></li>' +
        '<li>Googleアカウントを使う場合は、<b>「Continue with Google」</b>を押して、普段使っているアカウントを選びます（公式の案内）。メールアドレスで作成することもできます。</li>' +
        '<li>画面の案内に従って進みます。<b>メールに届いた確認コード</b>をそのまま入力します。</li>' +
        '<li>右上に丸いアイコンが表示されたら完了です。アイコンを押して、<b>ユーザー名</b>（英字の名前）をメモします。</li>' +
        '</ol>' +
        '<p class="note">新しいパソコンでログインするときも、メールに確認コードが届くことがあります（公式の案内。有効期間は1時間）。</p>' +
        '<p class="note warn">ユーザー名は<b>公開するページのアドレス</b>にも使われます。本名を使いたくない場合は、本名以外の名前にしてください。</p>',
      help: [
        { q: 'すでにアカウントがあります', a: 'そのアカウントでログインしておき、次へ進んでください。' },
        { q: 'パズルや「人間ですか？」の確認が表示されました', a: '画面の案内に従って自分で答えてください。AIにはやらせません。' },
        { q: '確認コードが届きません', a: '迷惑メールのフォルダを確認してください。学校やお店などの共用Wi-Fiでうまくいかない場合は、スマホのテザリングなど別の接続方法で試してください。' },
        { q: '二段階認証は必要ですか？', a: '公式の案内では、作成時に必須ではありませんが、強く推奨されています。あとで GitHub から「二段階認証を設定してください」というメールが届いたら、案内にある期限（45日）までに自分で設定します。' }
      ]
    },
    {
      id: 'i4', kind: 'pc', tag: 'PCで操作', title: 'GitとGitHub CLIを自分で入れる',
      html:
        '<p>GitHubをコマンドで操作する道具 <b>GitHub CLI</b>（コマンドは <b>gh</b>）と、記録をとる道具 <b>Git</b> を<b>自分で</b>インストールします。CLIの形であれば、AIもそのまま使えます（レッスン7）。</p>' +
        '<div class="os-win">' +
        '<ol>' +
        '<li>Claude Codeが動いている場合は、入力欄に <b>/exit</b> と入力してEnterキーを押します。</li>' +
        '<li>VS Codeのターミナル（先頭が「PS」）に、下の「コピー」を押して貼り付け、Enterキーを押します。<b>Git</b> がインストールされます（git-scm.com の公式の案内にある方法です。最新版より少し古い場合がありますが、このレッスンでは問題ありません）。' + box('winget install --id Git.Git -e --source winget') + '</li>' +
        '<li>終わったら次のコマンドを貼り付け、Enterキーを押します。<b>GitHub CLI</b> がインストールされます（GitHub CLIの公式の案内）。' + box('winget install --id GitHub.cli --source winget') + '</li>' +
        '<li>どちらのコマンドでも、途中で「このアプリがデバイスに変更を加えることを許可しますか？」と表示されたら「はい」を押します（2回表示されることがあります）。</li>' +
        '<li><b>VS Codeをいったん完全に閉じて、もう一度開きます</b>（新しい道具をターミナルが認識できるようにするためです）。</li>' +
        '</ol>' +
        '</div>' +
        '<div class="os-mac">' +
        '<ol>' +
        '<li>Claude Codeが動いている場合は、入力欄に <b>/exit</b> と入力してReturnキーを押します。</li>' +
        '<li><b>Git</b>：VS Codeのターミナルに、下の「コピー」を押して貼り付け、Returnキーを押します。' + box('git --version') + '「git version 2.…」と数字が表示されたら、すでにインストールされています（公式の案内では、多くのMacに最初から入っています）。<br>入っていない場合は、すぐにインストール用のウインドウが表示されることがあります。表示されない場合は、次のコマンドを貼り付けます（Appleの公式の案内）。' + box('xcode-select --install') + 'ウインドウが表示されたら「インストール」を押し、使用許諾を読んで「同意する」を押して、完了するまで待ちます（数分かかります）。終わったら、もう一度 git --version で確認します。</li>' +
        '<li><b>GitHub CLI</b>：ブラウザで、GitHub CLIの公式リリースページを開きます。<br><a href="https://github.com/cli/cli/releases/latest" target="_blank" rel="noopener">github.com/cli/cli/releases/latest を開く</a></li>' +
        '<li>ページ下部の「Assets」から、<b>gh_（数字）_macOS_universal.pkg</b> という名前のファイルを押してダウンロードします。見つからない場合は「Show all … assets」を押して、すべて表示します。</li>' +
        '<li>ダウンロードしたファイルをダブルクリックし、案内に従ってインストールします。「開けません」と表示された場合は、下の「困ったとき」を見てください。</li>' +
        '<li><b>⌘（Command）キーとQキーでVS Codeをいったん完全に終了し、もう一度開きます。</b></li>' +
        '</ol>' +
        '</div>' +
        '<p>最後に、インストールできたか確認します。ターミナルに次のコマンドを貼り付け、' + os('Enter', 'Return') + 'キーを押します。</p>' + box('gh --version') + '<p>「gh version …」と表示されたら成功です。</p>',
      help: [
        { os: 'win', q: '「契約条件に同意しますか？」（Y/N）と聞かれました', a: 'winget を初めて使うときに表示されることがあります。内容を読んでから Y を入力し、Enterキーを押します。' },
        { os: 'win', q: '許可のウインドウが表示されません', a: 'VS Codeの後ろに隠れていることがあります。画面下のタスクバーで点滅しているアイコンを押してください。' },
        { os: 'win', q: '「winget」が「認識されません」と表示されました', a: 'Microsoft Storeで「アプリ インストーラー」を更新してから、VS Codeを開き直して試してください。' },
        { os: 'win', q: 'gh や git が「認識されません」と表示されました', a: 'VS Codeを完全に閉じて、もう一度開いてください。それでも解決しない場合は、パソコンを再起動します。' },
        { os: 'win', q: 'Gitを入れると、Claude Codeは変わりますか？', a: '公式の案内では、Gitがなくても Claude Code は動きます。Gitを入れても、普段の中心はこれまでどおり PowerShell です。Bash（バッシュ）という別の方法も使えるようになります。' },
        { os: 'mac', q: '「開けません」「開いていません」のようなウインドウが表示されました', a: 'まず、ウインドウの文を読みます。<br>・<b>「壊れているため開けません」「Macに損害を与えます」「マルウェアが含まれています」</b>のような文の場合は、<b>開かないでください</b>。「ゴミ箱に入れる」を押し、作業をここで止めて相談してください。<br>・<b>「Appleは…を検証できませんでした」「開発元を確認できません」</b>のような文で、ファイルが <b>github.com/cli/cli のリリースページから自分でダウンロードした gh_（数字）_macOS_universal.pkg</b> の場合に限り、例外として開けます。GitHub CLIの公式の案内に、Mac用のインストーラーは「署名がない」と書かれているためです。ウインドウの「完了」を押し（「ゴミ箱に入れる」は押しません）、アップルメニュー →「システム設定」→「プライバシーとセキュリティ」を開いて下へスクロールし、そのファイル名の横にある「このまま開く」を押します。<br>・この例外は<b>このファイルだけ</b>です。ほかのアプリやファイルには使いません（レッスン1のとおり、開かずに止めます）。不安な場合、Homebrewを使っている人は brew install gh でもインストールできます（下の「困ったとき」）。' },
        { os: 'mac', q: 'Macのパスワードを聞かれました', a: 'Macにログインするときのパスワードを自分で入力します。入力しても画面に文字が表示されないことがありますが、そのまま入力して問題ありません。' },
        { os: 'mac', q: 'Homebrew（ホームブルー）を使っています', a: 'Homebrewを使っている場合は、brew install gh でもインストールできます（公式の案内）。' },
        HELP_INSTALL_AI
      ]
    },
    {
      id: 'i5', kind: 'pc', tag: 'PCで操作', title: 'GitHub CLIでログインする',
      html:
        '<p>ログインも<b>自分で</b>行います。</p>' +
        '<ol>' +
        '<li>VS Codeで <b>agent1</b> フォルダを開き、新しいターミナルを開きます。</li>' +
        '<li>下の「コピー」を押し、貼り付けて' + os('Enter', 'Return') + 'キーを押します。' + box('gh auth login --hostname github.com --git-protocol https --web') + '</li>' +
        '<li>「Authenticate Git with your GitHub credentials?」（GitHubのログイン情報をGitでも使いますか？）と表示されたら、<b>Y</b> を入力して' + os('Enter', 'Return') + 'キーを押します（公式の案内）。</li>' +
        '<li>「First copy your one-time code: <b>XXXX-XXXX</b>」と、<b>8文字のコード</b>が表示されます。メモしておきます（公式の案内では、15分で無効になります）。</li>' +
        '<li>「Press Enter to open…」と表示されたら、' + os('Enter', 'Return') + 'キーを押します。ブラウザが開きます。開かない場合は、<b>github.com/login/device</b> を自分で開きます。</li>' +
        '<li>ブラウザでGitHubにログインし、<b>8文字のコード</b>を入力して「Continue」→「Authorize github」を押します。</li>' +
        '<li>ターミナルに戻り、「<b>Logged in as</b> （あなたのユーザー名）」と表示されたら成功です。</li>' +
        '</ol>' +
        '<p>状態を確認するときは、次のコマンドを貼り付けます。「Logged in to github.com account （ユーザー名）」と表示されれば、ログインできています。</p>' + box('gh auth status') +
        '<p class="note warn">コードを入力する画面は、<b>自分でコマンドを実行したときだけ</b>使います。他人から「このコードを入力して」と頼まれても、入力しないでください。</p>',
      help: [
        { q: 'コードの期限が切れました', a: 'gh auth login のコマンドからやり直してください。新しいコードが表示されます。' },
        { q: '「Token」の行に文字が表示されています', a: '重要な「鍵」なので、一部が「*」で隠されています。全部を表示する方法は使いません。他人にも見せないでください。' },
        HELP_ENG
      ]
    },
    {
      id: 'i6', kind: 'pc', tag: 'PCで操作', title: 'メールアドレスを守る設定',
      html:
        '<p>コミット（記録）には<b>名前とメールアドレス</b>が付き、公開すると誰でも見られます。そのため、GitHubが用意している<b>公開用のアドレス（noreply）</b>を使います。この画面では、GitHubの設定と<b>アドレスの確認</b>までを行います。パソコン側の設定は、次の画面で<b>cafe-landing のリポジトリだけ</b>に行います。</p>' +
        '<ol>' +
        '<li>ブラウザで GitHubの <b>Settings（設定）→ Emails</b> を開きます。<br><a href="https://github.com/settings/emails" target="_blank" rel="noopener">github.com/settings/emails を開く</a></li>' +
        '<li><b>「Keep my email addresses private」</b>と<b>「Block command line pushes that expose my email」</b>にチェックを入れます（公式の案内）。</li>' +
        '<li>VS Codeのターミナルで Claude Code を起動します。' + cmd('claude') + '</li>' +
        '<li>画面下の行が <b>manual mode on</b> になっているか確認します。違う場合は、Shift+Tabを押して <b>manual</b> にします。</li>' +
        '<li>次の文をコピーして送ります。' +
        box('gh api user で私のGitHubのIDとユーザー名を調べ、「ID+ユーザー名@users.noreply.github.com」の形式で公開用のメールアドレスを教えてください。設定はまだ何もしないでください。') +
        '</li>' +
        '<li>教えてもらったアドレスが<b>「@users.noreply.github.com」で終わっている</b>ことを確認し、ユーザー名と一緒に<b>メモ</b>します（次の画面で使います）。GitHubの Emails の画面にも、同じ形式のアドレスが表示されています。</li>' +
        '</ol>' +
        '<p class="note"><b>git config --global</b>（パソコン全体の設定）は使いません。ほかのリポジトリやこれからの作業にも影響するためです。</p>',
      help: [
        HELP_APPROVE,
        { q: 'AIが git config --global で設定しようとします', a: '「いいえ(No)」を選び、「まだ設定しないでください。アドレスを教えるだけにしてください」と伝えます。' },
        HELP_USER
      ]
    },
    {
      id: 'i7', kind: 'pc', tag: 'PCで操作', title: 'カフェのページを作ってGitHubに保存する',
      html:
        '<p>練習用に架空のカフェの紹介ページを作り、<b>非公開（private）</b>のリポジトリに保存します。この時点では、まだ誰にも見えません。</p>' +
        '<ol>' +
        '<li>次の文をコピーして送ります。ページを作り、<b>このフォルダだけ</b>を記録する準備をします。' +
        box('agent1 の中に cafe-landing というフォルダを作り、その中に架空のカフェを紹介する1ページのWebページ（index.html）を日本語で作ってください。写真は使わず、文字と色だけで作ってください。個人情報は入れないでください。.DS_Store のようにパソコンが自動で作るファイルは .gitignore に入れて、記録の対象から外してください。完成したら、cafe-landing フォルダの中だけで git init -b main を実行してください。agent1 フォルダ自体はリポジトリにしないでください。コミットはまだしないでください。') +
        '</li>' +
        '<li>次の文の「ユーザー名」と「メモしたアドレス」を、前の画面でメモしたものに書き換えて送ります。' +
        box('cafe-landing のリポジトリの中だけの設定として（--global は使わずに）、git config user.name を「ユーザー名」に、git config user.email を「メモしたアドレス」に設定してください。そのあと、cafe-landing の中で git config user.name と git config user.email を実行して、2つの値を見せてください。') +
        '</li>' +
        '<li>表示されたメールアドレスが<b>「@users.noreply.github.com」で終わっている</b>ことを確認します。</li>' +
        '<li>確認できたら、次の文をコピーして送ります。' +
        box('cafe-landing で、メモを付けて最初のコミットをしてください。そのあと gh repo create で cafe-landing という名前の非公開（private）リポジトリを作り、プッシュしてください。') +
        '</li>' +
        '<li>許可を求められたら内容を読み、cafe-landing に関する操作であれば「Yes」を選びます。</li>' +
        '<li>最後に <b>github.com/（ユーザー名）/cafe-landing</b> のようなアドレスが示されたら完了です。</li>' +
        '</ol>' +
        '<p class="note">AIは Git の記録（git add・git commit）をしてから、gh repo create でリポジトリを作り、プッシュします。先にコミットがないとプッシュできません。</p>' +
        '<p class="note"><b>-b main</b> は、記録の置き場所（ブランチ）の名前をGitHubと同じ <b>main</b> にする指定です。名前とメールの設定は<b>cafe-landing の中だけ</b>に適用されます。ほかのフォルダで Git を使うときは、その都度設定します。</p>' +
        '<p class="note"><b>.gitignore</b>（ギット・イグノア）は、「このファイルは記録しない」という一覧のファイルです。パソコンが自動で作るファイルをGitHubに送らないようにします。</p>',
      help: [
        HELP_APPROVE,
        { q: 'agent1 フォルダで git init をしようとします', a: '「いいえ(No)」を選び、「cafe-landing の中だけで実行してください」と伝えます。agent1 には CLAUDE.md やスキルなど、保存する必要のないものも入っているためです。' },
        { q: 'git config --global を使おうとします', a: '「いいえ(No)」を選び、「--global は使わずに、cafe-landing の中だけに設定してください」と伝えます。' },
        { q: '普段のメールアドレスが表示されました', a: '「user.email を、メモした noreply のアドレスに直してください」と頼みます。前の画面で2つ目のチェックを入れていれば、普段のアドレスのままではプッシュが拒否されます（公式の案内）。' },
        { q: '「-b」がわからない、というエラーが出ました', a: 'Gitが古い場合に表示されます。「git init のあとで、ブランチ名を main にしてください」と頼みます。' },
        { q: '「public（公開）」で作ろうとします', a: '「いいえ(No)」を選び、「private（非公開）で作ってください」と伝えます。公開は、あとで中身を確認してから行います。' },
        { q: 'ページをブラウザで見たいです', a: 'VS Codeの左の一覧で cafe-landing の index.html を' + os('右クリック', '右クリック（または、Controlキーを押しながらクリック）') + 'し、' + os('「エクスプローラーで表示」', '「Finder で表示」') + 'を選びます。表示された index.html をダブルクリックします。' }
      ]
    },
    {
      id: 'i8', kind: 'pc', tag: 'PCで操作', title: 'リポジトリの画面を確認し、説明書を追加する',
      html:
        '<ol>' +
        '<li>ブラウザで <b>github.com/（ユーザー名）/cafe-landing</b> を開きます。</li>' +
        '<li>次の3点を確認します。<br>・名前の横に <b>Private</b>（非公開）と表示されている<br>・<b>index.html</b> が入っている<br>・ファイルの横に、コミット時の<b>メモ</b>が表示されている</li>' +
        '<li>Claude Codeに戻り、次の文をコピーして送ります。' +
        box('cafe-landing フォルダに README.md を作り、このフォルダの内容を日本語で短く説明してください。完成したら、コミットしてプッシュしてください。') +
        '</li>' +
        '<li>ブラウザのページを再読み込みします（' + os('F5キー', '⌘（Command）キーとRキー') + '）。ファイル一覧の下に<b>README の説明</b>が表示されたら成功です。</li>' +
        '<li>ファイル一覧の上にある<b>時計のマーク（Commits）</b>を押すと、これまでのコミットの記録をメモと一緒に確認できます。</li>' +
        '</ol>' +
        '<p class="note">README（リードミー）は「最初に読んでほしい」説明書です。リポジトリのページに自動で表示されます。</p>',
      help: [
        HELP_APPROVE,
        { q: 'ページが「404」になります', a: 'GitHubにログインしているか確認してください。非公開のリポジトリは、自分がログインしているときだけ見られます。' },
        HELP_USER
      ]
    },
    {
      id: 'i9', kind: 'pc', tag: 'PCで操作', title: 'GitHubから別のフォルダに取り出して確認する',
      html:
        '<p>パソコンのフォルダがなくなっても、GitHubから<b>復元できる</b>ことを確認します。もとの cafe-landing は<b>そのまま残し</b>、GitHubから<b>別の名前のフォルダ</b>に取り出します（クローン）。</p>' +
        '<ol>' +
        '<li>Claude Codeで <b>/clear</b> と入力し、会話をリセットします（AIが前の会話を覚えていない状態で試すためです）。</li>' +
        '<li>次の文の「ユーザー名」を自分のものに書き換えて送ります。' +
        box('https://github.com/ユーザー名/cafe-landing のリポジトリを、agent1 の中に cafe-landing-copy という名前のフォルダでクローンしてください。もとの cafe-landing フォルダには触れないでください。') +
        '</li>' +
        '<li>左の一覧に <b>cafe-landing-copy</b> ができ、中に <b>index.html</b> と <b>README.md</b> があれば成功です。index.html を' + os('右クリック', '右クリック（または、Controlキーを押しながらクリック）') + 'して' + os('「エクスプローラーで表示」', '「Finder で表示」') + 'を選び、ダブルクリックで開くと、同じカフェのページが表示されます。</li>' +
        '<li>確認が済んだら、<b>cafe-landing-copy</b> は不要であれば自分で削除してかまいません（' + os('右クリック', '右クリック（または、Controlキーを押しながらクリック）') + ' →「削除」→ ' + os('「ごみ箱に移動」', '「ゴミ箱に移動」') + '）。<b>もとの cafe-landing は削除しません</b>。このあとも使います。</li>' +
        '</ol>' +
        '<p class="note">新しいパソコンでも、同じ依頼で続きから始められます。</p>' +
        '<div class="card goal"><b>ひと休みポイント①：保存と取り出し（復元）まで完了</b><br>ここで休憩してもかまいません。次にこの教材を開いたら、目次の「続きから」ボタンでこの続きから再開できます。次はページの公開です。</div>',
      help: [
        HELP_APPROVE,
        { q: 'もとの cafe-landing に取り出そうとします', a: '「いいえ(No)」を選び、「cafe-landing-copy という新しいフォルダにクローンしてください」と伝えます。' },
        { q: 'クローンでエラーが出ました', a: 'アドレスのユーザー名が正しいか確認してください。「gh auth status でログインを確認してから、もう一度クローンしてください」と頼むのも有効です。' },
        HELP_USER
      ]
    },
    {
      id: 'i10', kind: 'pc', tag: 'PCで操作', title: '中身を確認してから公開する',
      html:
        '<p><b>GitHub Pages</b>（ギットハブ・ページズ）を使うと、リポジトリのページをインターネットに公開できます。公式の案内では、無料プランでは<b>リポジトリを公開（public）にする</b>必要があります。公開すると、<b>ファイルもすべて誰でも見られます</b>。</p>' +
        '<div class="card goal"><b>公開する前に自分で確認する</b><br>□ ファイルは index.html・README.md・.gitignore（記録しないファイルの一覧）だけ<br>□ 名前・住所・電話番号・メールアドレスが入っていない<br>□ パスワードや「鍵」が入っていない<br>□ 公開しても困らない内容である<br>□ <b>過去のコミット（Commits）</b>にも、個人情報が入ったことがない</div>' +
        '<p class="note warn">公開すると、<b>現在のファイルだけでなく、過去のコミットの記録もすべて</b>見られます。あとで直しても、過去の記録には残ります。個人情報が一度でも入っていた場合は、公開せずにリポジトリを作り直してください。</p>' +
        '<ol>' +
        '<li>リポジトリのページと時計のマーク（Commits）の記録で、上の5項目を確認します。気になる点があれば、先にAIに直してもらいます。</li>' +
        '<li>問題がなければ、次の文をコピーして送ります。' +
        box('gh を使って、cafe-landing のリポジトリを公開（public）に変更し、GitHub Pages で公開してください。コマンドでは、リポジトリ名を「ユーザー名/cafe-landing」の形式で指定してください。公開元は main ブランチのルート（/）にしてください。公開作業が完了したことを確認してから、公開アドレスを教えてください。') +
        '</li>' +
        '<li>「公開に変更する」コマンドの許可を求められたら、<b>リポジトリ名が cafe-landing であること</b>を確認して「Yes」を選びます。</li>' +
        '</ol>' +
        '<p class="note">「公開にする」「Pagesを作る」のように外部から見えるようになる作業は、<b>自分で確認してから</b>許可します。今後も同じです。</p>',
      help: [
        { q: 'ほかのリポジトリの名前が表示されました', a: '「いいえ(No)」を選び、「cafe-landing だけを公開にしてください」と伝えます。' },
        { q: '公開をやめたくなりました', a: 'リポジトリのページの「Settings」→「Pages」で、「Your site is live at」の横の「…」→「Unpublish site」を押すと公開を停止できます。リポジトリ自体を非公開に戻すには、「Settings」の一番下にある「Change visibility」を使います。公式の案内では、無料プランで非公開に戻すと、ページの公開も自動で停止します。' },
        HELP_ENG
      ]
    },
    {
      id: 'i11', kind: 'pc', tag: 'PCで操作', title: '公開されたページを見る',
      html:
        '<ol>' +
        '<li>AIが教えてくれたアドレスをブラウザで開きます。</li>' +
        '<li>カフェのページが表示されたら成功です。<b>このアドレスを知っている人なら、誰でもどこからでも</b>見られます。</li>' +
        '</ol>' +
        '<h2>アドレスの仕組み</h2>' +
        '<p><code>https://<b>ユーザー名</b>.github.io/<b>cafe-landing</b>/</code></p>' +
        '<ul class="parts">' +
        '<li><b>ユーザー名.github.io</b>前半<br><span>あなたのGitHubのユーザー名</span></li>' +
        '<li><b>/cafe-landing/</b>後半<br><span>リポジトリの名前</span></li>' +
        '</ul>' +
        '<p class="note">公式の案内では、公開されるまで<b>最大10分</b>かかることがあります。</p>',
      help: [
        { q: '「404」と表示されます', a: '数分待ってから再読み込みします。10分たっても表示されない場合は、「GitHub Pages の状態を確認してください」とAIに頼みます。' },
        { q: '古いページのままです', a: 'ブラウザが古いページを記憶していることがあります。' + os('Ctrlキーと F5キー', '⌘（Command）キーとShiftキーとRキー') + 'で再読み込みしてください。' }
      ]
    },
    {
      id: 'i12', kind: 'pc', tag: 'PCで操作', title: '作る前に既存のものを探す',
      html:
        '<p>GitHubには、世界中の人が作った道具がたくさんあります。何かを作りたくなったら、<b>まず既存のものがないか探す</b>のが近道です（レッスン7のライブラリと同じ考え方）。</p>' +
        '<ol>' +
        '<li>ブラウザで<b>GitHubのトレンド</b>（その日に人気のリポジトリ）を開いて眺めてみます。上部の「Date range」で期間を、「Language」で言語を絞り込めます。<br><a href="https://github.com/trending" target="_blank" rel="noopener">github.com/trending を開く</a></li>' +
        '<li>気になるものがあれば、<b>Star（☆）</b>を押してみます。公式の案内では、Starは「あとで見つけやすくする」しおりで、作者への感謝を示すことにもなります。押したものは github.com/stars で確認できます。</li>' +
        '<li>Claude Codeに戻り、次の文をコピーして送ります。' +
        box('PDFの資料を要点だけのまとめノートに変換する道具を作りたいと考えています。作る前に、使えるライブラリやオープンソースがすでにないか、WebとGitHubで調べてください。インストールはしないでください。候補を3つ、作成者・スター数・最近の更新・できることと一緒に表にまとめて教えてください。') +
        '</li>' +
        '<li>調べるための許可（WebSearch・gh search など）を求められたら、内容を読んで「Yes」を選びます。</li>' +
        '<li>候補が出たら、インストールする前に<b>説明書（README）を読んでもらいます</b>。次の文をコピーして送ります（何もインストールしません）。' +
        box('gh repo view microsoft/markitdown で README を読み、どのような道具か、使い方、注意点をわかりやすく説明してください。インストールはしないでください。') +
        '</li>' +
        '</ol>' +
        '<p class="note">他人の公開リポジトリは、<b>読んで学ぶ</b>ためにも使えます。気になるリポジトリがあれば、同じように README の説明を頼んでみてください。</p>' +
        '<div class="card goal"><b>他人が作ったものを入れる前に確認すること</b><br>・<b>作成者</b>（企業や有名な開発者か）<br>・<b>スター数</b>と、<b>最近も更新されているか</b><br>・<b>README</b> に使い方とできることが書かれているか<br>・怪しいと感じたら<b>入れない</b></div>',
      help: [
        { q: 'トレンドが英語ばかりです', a: '問題ありません。眺めるだけで十分です。わからないものは、AIに「このリポジトリは何ですか？」と聞けます。' },
        HELP_INSTALL_AI
      ]
    },
    {
      id: 'i13', kind: 'pc', tag: '任意', title: '見つけた道具を使ってみる（markitdown）',
      html:
        '<p>前の画面で、Microsoftが作った <b>markitdown</b>（マークイットダウン）が候補に出てきたかもしれません。PDF・Word・Excel・PowerPointなどを、AIが読みやすいテキスト（Markdown）に変換する道具です。<b>この画面は任意です</b>。</p>' +
        '<ol>' +
        '<li>練習用のファイルを1つ用意し、agent1 に入れます。<b>個人情報が含まれていない、文字のある</b>PDFやWordファイルを使います（たとえば、自分で作ったメモや公開されている案内文）。</li>' +
        '<li>Claude Codeに <b>/exit</b> と入力して終了し、Pythonのバージョンを確認します。' + cmdOs('python --version', 'python3 --version') + '<b>3.10〜3.14</b> の場合だけ続けます。それ以外（3.15 以上、3.9 以下）の場合は markitdown が対応していないため、<b>この画面は飛ばします</b>（公式の案内では、3.10〜3.14 で使えます）。</li>' +
        '<li>3.10〜3.14 の場合は、次のコマンドを貼り付けて' + os('Enter', 'Return') + 'キーを押します（公式の案内にある名前のまま、自分でインストールします）。' + cmdOs('python -m pip install "markitdown[all]"', 'python3 -m pip install "markitdown[all]"') + '</li>' +
        '<li><b>claude -c</b> で Claude Code に戻ります。' + cmd('claude -c') + '</li>' +
        '<li>次の文の「ファイル名」を書き換えて送ります。' +
        box('markitdown はインストール済みです。markitdown を使って ファイル名 を Markdown に変換してください。そのあと、重要な部分だけをまとめノート（まとめ.md）にしてください。') +
        '</li>' +
        '</ol>' +
        '<p class="note">レッスン2で最新のPythonを入れた場合は、3.15 以上になっていることがあります。その場合は、この画面を飛ばしてください。</p>' +
        '<div class="card goal"><b>ひと休みポイント②：公開アドレスの確認まで完了</b><br>この画面を飛ばした人も、ここで休憩できます。目次の「続きから」ボタンで再開できます。次はClaudeのデスクトップアプリです。</div>',
      help: [
        { q: 'インストールでエラーが出ました', a: 'Pythonのバージョンが合っていない可能性があります。この画面は任意なので、飛ばしてかまいません。' },
        { q: '「markitdown が見つからない」と言われました', a: '「python -m で markitdown を実行してください」と頼みます。' },
        { q: '中身がほとんど空でした', a: '画像だけのPDF（たとえば、レッスン7で作ったカードのPDF）からは、文字を取り出せないことがあります。文字のあるファイルで試してください。' },
        HELP_APPROVE
      ]
    },
    {
      id: 'i14', kind: 'pc', tag: 'PCで操作', title: 'Claudeのデスクトップアプリを入れる',
      html:
        '<p>VS Codeのほかに、<b>Claudeのデスクトップアプリ</b>からも Claude Code を使えます。ボタンで操作できるので、ちょっとした作業に便利です。</p>' +
        '<ul class="parts">' +
        '<li><b>ブラウザの claude.ai（チャット）</b>会話のみ<br><span>安全のため、自分のパソコンのフォルダには入れない</span></li>' +
        '<li><b>デスクトップアプリの「Code」</b>ボタンで操作<br><span>自分のフォルダを選んで作業を頼める</span></li>' +
        '<li><b>VS Code＋Claude Code（CLI）</b>文字で操作<br><span>ファイルを見ながら作業を頼める</span></li>' +
        '</ul>' +
        '<ol>' +
        '<li>ブラウザで <b>claude.com/download</b> を開きます。<br><a href="https://claude.com/download" target="_blank" rel="noopener">claude.com/download を開く</a></li>' +
        '<li>' + os('<b>Windows</b> のダウンロードを押します。ダウンロードしたファイルをダブルクリックし、案内に従ってインストールします。', '<b>macOS</b> のダウンロードを押します。ダウンロードしたファイル（.dmg）を開き、Claudeのアイコンを「アプリケーション」フォルダに入れます。') + '</li>' +
        '<li>Claudeのアプリを開き、<b>Claude Codeで使っているのと同じアカウント</b>でログインします（パスワードなどは自分で入力します）。</li>' +
        '<li>ブラウザでログインしたあと、「Claude を開きますか？」のようなウインドウが表示されたら<b>開く</b>を押します。表示されない場合は、ページにある同じ名前のボタンを押します。</li>' +
        '<li>アプリの左の列の上のほうにある <b>「Code」</b>（コード）を押します（公式の案内）。アイコンだけの場合は、マウスを乗せると名前が表示されます。Claude Code の画面に切り替わります。</li>' +
        '</ol>' +
        '<p class="note">公式の案内では、Codeの画面はClaudeの有料プラン（Pro・Maxなど）で使えます。Claude Code を別にインストールする必要はありません。</p>',
      help: [
        { q: 'Claudeのアプリはすでに入っています', a: '最新版に更新してから、そのまま使ってください。' },
        { q: 'クッキー（Cookie）の確認が表示されました', a: '選べる場合は「必要なものだけ」のほうを選びます。' },
        { os: 'win', q: 'どちらのWindows版を選べばいいですか？', a: '通常は「Windows」（x64）です。「ARM64」は一部の薄型ノートパソコン用です。' },
        { os: 'mac', q: '「インターネットからダウンロードされたアプリケーションです」と表示されました', a: 'claude.com からダウンロードしたものであれば、「開く」を押します。' },
        { os: 'mac', q: 'IntelのMacでも使えますか？', a: '公式の案内では、Mac版はIntelとApple シリコンのどちらでも使えます。' },
        HELP_ENG
      ]
    },
    {
      id: 'i15', kind: 'pc', tag: 'PCで操作', title: 'フォルダを開いてモードを選ぶ',
      html:
        '<ol>' +
        '<li>Codeの画面の入力欄の近くにある、場所を選ぶ項目で <b>Local</b>（ローカル＝自分のパソコン）を選びます。</li>' +
        '<li>その隣の、フォルダを選ぶ項目（「フォルダなし」のように表示されています）を押し、<b>「Open folder…」</b>（フォルダを開く）を選びます（公式の案内）。</li>' +
        '<li><b>agent1</b> フォルダを選んで開きます。「このフォルダを信頼するか」を聞かれたら、agent1 であれば「信頼する」を選びます。</li>' +
        '<li>入力欄の近くにある<b>モード</b>のボタンを押し、<b>Manual</b>（手動。変更の前に毎回確認する）を選びます。VS Codeの「manual mode」と同じです。</li>' +
        '</ol>' +
        '<h2>モードは5種類（公式の案内）</h2>' +
        '<ul class="parts">' +
        '<li><b>Manual</b>変更の前に毎回確認する<br><span>この教材で使うモード</span></li>' +
        '<li><b>Accept edits</b>ファイルの編集は確認せずに行う<br><span>慣れた人向け</span></li>' +
        '<li><b>Plan</b>変更の前に計画を立てて見せる<br><span>大きな作業の前に便利</span></li>' +
        '<li><b>Auto</b>Claudeが危険かどうかを判断して進める<br><span>危険な操作は止める</span></li>' +
        '<li><b>Bypass permissions</b>一切確認しない<br><span>設定で許可しないと表示されない。<b>この教材では使わない</b></span></li>' +
        '</ul>' +
        '<p class="note">モデル（AIの種類）を選ぶボタンもあります。チェックが付いているのが、現在使っているモデルです。この教材では、初期設定のままでかまいません。</p>',
      help: [
        { q: '画面の表記が少し違います', a: 'アプリが日本語表示の場合は、「手動」のように日本語の名前で表示されることがあります。バージョンによっても名前が少し異なります（以前のバージョンでは「Ask permissions」などでした）。「変更の前に確認する」モードを選んでください。' },
        { q: '「Bypass permissions」を使ってもいいですか？', a: 'この教材では使いません。公式の案内でも、設定で特別に許可しないと表示されないモードです。' }
      ]
    },
    {
      id: 'i16', kind: 'pc', tag: 'PCで操作', title: 'デスクトップアプリで作業を頼む',
      html:
        '<ol>' +
        '<li>入力欄に、次の文をコピーして送ります。' + box('あなたは誰ですか？ 今いるフォルダの中身を簡単に説明してください。') + '</li>' +
        '<li>回答を読みます。VS Codeのときと同じように、agent1 の中身を説明してくれます。</li>' +
        '<li>入力欄に <b>/</b>（スラッシュ）を入力します。使えるコマンドの一覧が表示されます。</li>' +
        '<li>続けて <b>card</b> と入力し、<b>/card</b> にします。レッスン7で作った <b>cardnews</b> が表示されれば、スキルもそのまま使えることがわかります（公式の案内）。</li>' +
        '</ol>' +
        '<p class="note">入力欄の「＋」から、ファイルや写真を添えて依頼したり、コネクタ（レッスン6）やプラグイン（レッスン7）を確認したりできます。</p>' +
        '<h2>どちらを使うか</h2>' +
        '<ul class="parts">' +
        '<li><b>デスクトップアプリ</b>ボタン操作でわかりやすい。左の列は<b>会話の一覧</b>で、ファイルの一覧は表示されない<br><span>1回で終わるちょっとした作業に向く</span></li>' +
        '<li><b>VS Code</b>ファイルを見ながら作業できる<br><span>ファイルが増える長い作業に向く</span></li>' +
        '</ul>',
      help: [
        { q: '/card で cardnews が表示されません', a: 'レッスン7を行っていない場合は表示されません。それで問題ありません。' },
        { q: '許可を求められました', a: 'VS Codeのときと同じです。内容を読み、agent1 の中の操作であれば1回だけ許可します。' }
      ]
    },
    {
      id: 'i17', kind: 'pc', tag: 'PCで操作', title: 'クラウドセッションとGitHubを接続する',
      html:
        '<p><b>クラウドセッション</b>は、Claudeが用意した<b>インターネット上のパソコン</b>で作業してもらう方法です。公式の案内では、<b>ブラウザを閉じても、パソコンの電源を切っても、作業は続きます</b>。</p>' +
        '<ul class="parts">' +
        '<li><b>できる</b>GitHubのリポジトリの作業<br><span>長い作業を任せておける</span></li>' +
        '<li><b>できない</b>自分のパソコンのフォルダ<br><span>agent1 の中は見えない</span></li>' +
        '</ul>' +
        '<ol>' +
        '<li>ブラウザで <b>claude.ai/code</b> を開き、ログインします。<br><a href="https://claude.ai/code" target="_blank" rel="noopener">claude.ai/code を開く</a></li>' +
        '<li>GitHubとの接続の案内が表示されたら、それに従って<b>GitHubでログインし、許可</b>します（公式の案内）。入力欄の近くにある「Default」は、作業環境の名前です。そのままでかまいません。</li>' +
        '<li><b>Claude GitHub App</b> をインストールする画面になったら、アドレスが <b>github.com/apps/claude</b> で、作成者が <b>anthropics</b>（Anthropic）であることを確認します。この画面が表示されない場合（「Skip」で進んだ場合など）は、次のリンクを自分で開きます。<br><a href="https://github.com/apps/claude/installations/new" target="_blank" rel="noopener">github.com/apps/claude/installations/new を開く</a></li>' +
        '<li>リポジトリを選ぶ項目で<b>「Only select repositories」</b>（選択したリポジトリのみ）を選び、<b>cafe-landing</b> だけを選んで「Install」を押します。</li>' +
        '</ol>' +
        '<p class="note warn">接続する範囲は<b>使うリポジトリだけ</b>にします。「All repositories」（すべて）は選びません。</p>',
      help: [
        { q: 'GitHubとの接続の案内が表示されません', a: 'リポジトリを選ぶ項目を押すと、接続の案内が表示されることがあります。' },
        { q: 'あとで接続を解除したいです', a: 'このレッスンの「後片付け」の画面を見てください。' },
        { q: '無料プランです', a: '公式の案内では、クラウドセッションは有料プラン（Pro・Maxなど）で使えます。' },
        HELP_ENG
      ]
    },
    {
      id: 'i18', kind: 'pc', tag: 'PCで操作', title: 'クラウドで修正を依頼する',
      html:
        '<ol>' +
        '<li>claude.ai/code の入力欄の近くにある、リポジトリを選ぶ項目を押して <b>cafe-landing</b> を選びます。</li>' +
        '<li>次の文をコピーして送ります。' + box('このリポジトリの内容を簡単に説明してください。') + '</li>' +
        '<li>説明が表示されたら、次の文をコピーして送ります。' +
        box('ページの一番上に「クラウドで直しました」という1行を追加してください。終わったら、変更箇所を見せてください。マージはしないでください。main ブランチには直接プッシュせず、新しいブランチで作業してください。') +
        '</li>' +
        '<li>作業が終わると、変更箇所（<b>差分</b>）を確認できます。変更したファイルや数字（+1 など）の部分を押すと開きます。赤い行が削除した部分、緑の行が追加した部分です。</li>' +
        '<li>問題がなければ、<b>「Create PR」</b>（変更の提案を作る）を押します（公式の案内）。</li>' +
        '</ol>' +
        '<p class="note"><b>PR</b>（プルリクエスト）は「このように変更したい」という<b>提案</b>です。この時点では、まだページは変わっていません。<b>マージする（まとめる）かどうかは自分で決めます</b>。</p>' +
        '<p class="note">クラウドセッションのモードは Auto・Accept edits・Plan から選べます（公式の案内）。インターネット上の別のパソコンで動くため、自分のパソコンのファイルは変わりません。</p>',
      help: [
        { q: 'cafe-landing が表示されません', a: '前の画面で、Claude GitHub App に cafe-landing を選んだか確認してください。' },
        { q: '「Create PR」を押したあと、GitHubの画面が開いた場合は？', a: '通常は、そのまま提案（PR）が作成されます。GitHubの画面が開いた場合は、その画面で緑の「Create pull request」を押すと提案が作成されます。すでに提案（PR）が作成されていれば、そのまま次の画面へ進みます。' },
        { q: 'main に直接プッシュしたと言われました', a: '公開ページがPRなしで変更されている可能性があります。まず公開ページを開き、問題がないか確認します。そのうえで、PRの練習のために、もう1つ小さな変更を依頼します。' + box('今度は main には直接プッシュしないでください。新しいブランチを作り、そこでページの一番下に「PRの練習」という1行を追加してください。マージはしないでください。終わったら、変更箇所を見せてください。') + 'そのあと、この画面の4〜5番（差分を確認して「Create PR」）を行い、次の画面で自分でマージします。' },
        { q: 'ブラウザを閉じてしまいました', a: '大丈夫です。公式の案内では、作業は続いています。claude.ai/code を開き直すと、左の一覧に残っています。' },
        { q: '使用量はかかりますか？', a: 'はい。公式の案内では、普段のClaudeと同じく、プランの使用量から消費されます。' }
      ]
    },
    {
      id: 'i19', kind: 'pc', tag: 'PCで操作', title: '提案を確認して自分でマージする',
      html:
        '<ol>' +
        '<li>ブラウザで <b>github.com/（ユーザー名）/cafe-landing</b> を開き、上部の <b>「Pull requests」</b> を押します。</li>' +
        '<li>Claudeが作った提案を開き、<b>「Files changed」</b>で変更箇所を確認します。</li>' +
        '<li>問題がなければ、<b>「Merge pull request」</b> →<b>「Confirm merge」</b>を押します。これで main に反映されます。</li>' +
        '<li>数分待ってから、公開ページ（<b>ユーザー名.github.io/cafe-landing/</b>）を再読み込みします。一番上に<b>「クラウドで直しました」</b>が表示されたら成功です（main に直接反映されてしまい、2つ目の変更を依頼した人は、一番下の<b>「PRの練習」</b>を確認します）。</li>' +
        '<li>デスクトップアプリを開き、左の一覧も確認します。今のクラウドの会話が、ここにも表示されていることがあります。</li>' +
        '<li>最後に、パソコンの cafe-landing も最新の状態にします。VS Code の Claude Code で（止まっていれば <b>claude -c</b> で起動して）、次の文を送ります。' + box('cafe-landing で git pull を実行して、GitHubの最新の状態にしてください。') + '</li>' +
        '</ol>' +
        '<p class="note">「プッシュ」がパソコン → GitHub なら、<b>プル（pull）</b>は GitHub → パソコンです。クラウドで修正した内容を手元に取り込みます。</p>',
      help: [
        { q: '「Merge pull request」が押せません', a: '少し待ってから、ページを再読み込みしてください。それでも押せない場合は、提案の画面の一番下に表示されているメッセージをAIに見せて相談してください。' },
        { q: 'マージしたくありません', a: '「Close pull request」で提案を閉じられます。ページは変わりません。' },
        { q: 'claude -c で、想定と違う会話が表示されました', a: 'そのまま使ってもかまいません。気になる場合は、/exit してから claude で新しく始めます。' },
        HELP_APPROVE
      ]
    },
    {
      id: 'i20', kind: 'phone', tag: 'スマホ', title: 'スマホでパソコンの会話の続きを見る',
      html:
        '<p><b>リモートコントロール</b>を使うと、<b>パソコンで動いている Claude Code</b> の会話を、スマホから見たり続きを依頼したりできます。作業はパソコンの中で行われます。<b>スマホがない場合は、読むだけで</b>かまいません。</p>' +
        '<ol>' +
        '<li>VS Code の Claude Code を用意します（止まっていれば <b>claude -c</b> で起動します）。</li>' +
        '<li>スマホに<b>Claudeのアプリ</b>を入れ、同じアカウントでログインします。Claude Code で <b>/mobile</b> と入力すると、アプリをインストールするためのQRコードが表示されます（公式の案内）。</li>' +
        '<li>Claude Code で <b>/rc</b> と入力し、' + os('Enter', 'Return') + 'キーを押します（/remote-control と同じです）。' + cmd('/rc') + '</li>' +
        '<li>初回は確認が表示されます。<b>「Enable Remote Control」</b>を選びます。接続されると、画面下部に <b>/rc active</b> と表示されます（公式の案内）。ターミナルが狭いと表示されないので、その場合はターミナルを広げます。</li>' +
        '<li>スマホから接続します。最も簡単なのは、パソコンで <b>/rc</b> をもう一度入力し、表示された<b>QRコードをスマホのカメラで読み取る</b>方法です。または、Claudeのアプリで「Code」を開きます（画面下部のタブか、左上のメニュー≡の中にあります）。<b>パソコンのアイコンに緑の点</b>が付いている会話が、今のパソコンの会話です（公式の案内）。</li>' +
        '<li>スマホから「cafe-landing の中に、どんなファイルがあるか教えてください」と送ってみます。パソコンの画面にも同じ会話が表示されます。パソコンは Manual モードなので、許可が必要な場合はスマホでも確認を求められます。</li>' +
        '<li>終わったら、パソコンで <b>/rc</b> をもう一度入力し、表示された画面で<b>接続を切る</b>項目（Disconnect など）を選びます。Claude Code の会話はそのまま残ります。</li>' +
        '</ol>' +
        '<div class="card goal"><b>覚えておくこと（公式の案内）</b><br>・<b>パソコンは起動したまま</b>にしておく。ターミナルを閉じると、スマホからも使えなくなる<br>・パソコンがスリープしたりWi-Fiが切れたりしても、復帰すれば<b>自動で再接続する</b><br>・Claudeの有料プランでログインしているときに使える（APIキーでは使えない）</div>' +
        '<p class="note">クラウドセッション（前の画面）も、スマホのアプリの「Code」から見られます。こちらはパソコンの電源を切っていても見られます。</p>',
      help: [
        { q: '「Code」が見つかりません', a: 'アプリを最新版に更新してください。ブラウザで claude.ai/code を開いても同じ会話を見られます。' },
        { q: '緑の点が付きません', a: 'パソコンの Claude Code が動いたままになっているか確認してください。ターミナルを閉じていた場合は、もう一度 claude -c で起動して /rc を入力します。' },
        { q: 'スマホで許可を求められました', a: 'パソコンのときと同じです。内容を読み、理解できるものだけ許可します。' }
      ]
    },
    {
      id: 'i21', kind: 'know', tag: '基礎知識', title: '使い分けと後片付け',
      html:
        '<h2>使い分け</h2>' +
        '<ul class="parts">' +
        '<li><b>VS Code＋Claude Code</b>自分のフォルダ：使える／パソコンの電源を切ると：止まる<br><span>ファイルが増える、長く続ける作業に</span></li>' +
        '<li><b>デスクトップアプリ</b>自分のフォルダ：使える／パソコンの電源を切ると：止まる<br><span>1回で終わるちょっとした作業に</span></li>' +
        '<li><b>クラウドセッション</b>自分のフォルダ：使えない／パソコンの電源を切っても：続く<br><span>時間のかかる作業を任せておくときに</span></li>' +
        '<li><b>スマホ</b>/rc 中はパソコンの会話を見られる／クラウドの会話も見られる<br><span>外出先での確認に</span></li>' +
        '</ul>' +
        '<p class="note">「自分のパソコンのフォルダを使える」と「パソコンの電源を切っても続く」は、ちょうど反対の関係です。</p>' +
        '<p class="note">今日は練習用の cafe-landing だけを保存しましたが、作ったスキル（.claude/skills）なども<b>非公開のリポジトリ</b>に保存すれば、バックアップになります。その場合も、個人情報や「鍵」が入っていないかを先に確認します。</p>' +
        '<h2>後片付け</h2>' +
        '<ul class="parts">' +
        '<li><b>/rc</b>使わないときは接続を切っておく<br><span>/rc をもう一度入力して、接続を切る</span></li>' +
        '<li><b>Claude GitHub App</b>使わなくなったら外す<br><span>GitHubの「Settings」→「Applications」→「Installed GitHub Apps」→ Claude の「Configure」→ 一番下の「Uninstall」。同じ画面の「Authorized GitHub Apps」でも、Claude を「Revoke」</span></li>' +
        '<li><b>claude.ai とGitHubの接続</b>使わなくなったら切る<br><span>claude.ai/customize/connectors で GitHub の接続を切る（公式の案内）</span></li>' +
        '<li><b>公開ページ</b>公開をやめたくなったら停止する<br><span>リポジトリの「Settings」→「Pages」→「Unpublish site」</span></li>' +
        '<li><b>GitHub CLIのログイン</b>パソコンを人に譲るときはログアウトする<br><span>ターミナルで gh auth logout</span></li>' +
        '</ul>',
      help: [
        { q: 'cafe-landing を削除してもいいですか？', a: 'はい。練習用なので、不要であればリポジトリの「Settings」の一番下で削除できます。削除するとすぐに見えなくなります（公式の案内では、90日以内なら復元できる場合もあります）。よく確認してから、自分で行います。' }
      ]
    },
    {
      id: 'i22', kind: 'know', tag: 'クイズ', title: 'GitHubと作業場所のクイズ',
      widget: 'quiz',
      quiz: [
        { q: '「コミット」とは？', options: ['現在の状態をメモ付きで記録すること', 'ファイルを削除すること', 'パスワードを変更すること'], answer: 0, explain: 'ゲームの「セーブ」のようなものです。メモが付くので、あとで経緯がわかります。' },
        { q: 'パソコンの記録をGitHubに送る操作は？', options: ['クローン', 'プッシュ', 'スター'], answer: 1, explain: 'パソコン → GitHub がプッシュ、GitHub → パソコンに取り出すのがクローンです。' },
        { q: 'パソコンのフォルダが壊れても、GitHubに保存してあれば？', options: ['もう復元できない', 'クローンで取り出せる', 'パソコンを買い替える'], answer: 1, explain: 'GitHubに残っているので、クローンで取り出せます。今日は別の名前のフォルダに取り出して確認しました。新しいパソコンでも同じです。' },
        { q: 'コミットに使うメールアドレスは？', options: ['普段のアドレスをそのまま使う', 'GitHubの noreply のアドレスを使う', '友人のアドレスを使う'], answer: 1, explain: '公開すると誰でも見られます。GitHubが用意した公開用のアドレスを使います。' },
        { q: 'GitHub Pagesで公開する前にすることは？', options: ['個人情報や鍵が入っていないか自分で確認する', '何も見ずに公開する', 'AIにすべて任せる'], answer: 0, explain: '公開すると、ファイルもすべて誰でも見られます。' },
        { q: 'クラウドセッションの特徴は？', options: ['自分のパソコンのフォルダを直接使う', 'インターネット上のパソコンで動き、ブラウザを閉じても続く', 'スマホでしか使えない'], answer: 1, explain: '公式の案内では、ブラウザを閉じても、パソコンの電源を切っても作業は続きます。その代わり、自分のパソコンのフォルダは見えません。' },
        { q: 'Claude GitHub Appをインストールするときに選ぶのは？', options: ['All repositories（すべて）', 'Only select repositories で、使うものだけ', '何も読まずに Install'], answer: 1, explain: '接続する範囲は、使うリポジトリだけにします。' },
        { q: 'PR（プルリクエスト）とは？', options: ['「このように変更したい」という提案', 'ページを削除するボタン', 'パスワードの別名'], answer: 0, explain: 'マージするかどうかは、中身を確認して自分で決めます。' },
        { q: 'リモートコントロール（/rc）でスマホから使うときは？', options: ['パソコンの電源を切っておく', 'パソコンの Claude Code を動かしたままにする', 'ターミナルを閉じる'], answer: 1, explain: '作業はパソコンの中で行われるため、ターミナルを閉じるとスマホからも使えなくなります。' }
      ],
      html: '<p>学んだ内容をクイズで確認します。選択肢を選ぶと答えが表示されます。採点はしません。</p>',
      help: [
        { q: '間違えました', a: '問題ありません。前の画面に戻って確認してから、もう一度挑戦してください。何度でもやり直せます。' }
      ]
    },
    {
      id: 'i23', kind: 'check', tag: '確認', title: '最終確認',
      widget: 'checks',
      checks: [
        'GitHubのアカウントを作り、gh でログインした',
        'cafe-landing だけに noreply のメールアドレスを設定した',
        'カフェのページを非公開のリポジトリに保存した',
        'GitHubから別の名前のフォルダにクローンし、中身を確認した',
        '中身を確認してから GitHub Pages で公開した',
        'デスクトップアプリで agent1 を開いて作業を頼めた',
        'クラウドセッションで修正を依頼し、自分でマージした',
        'スマホから /rc でパソコンの会話を見た（任意）',
        'markitdown を試した（任意）'
      ],
      required: 7,
      html:
        '<p>できた項目にチェックを入れてください。<b>上の7項目</b>にチェックが入ると、「完了にする」を押せます。下の2項目は任意です。</p>' +
        '<h2>振り返り：ここまでにできるようになったこと</h2>' +
        '<ul class="parts">' +
        '<li><b>レッスン1〜2</b>道具を入れて、AIにファイルを作ってもらう<br><span>CLAUDE.md で指示を覚えてもらう</span></li>' +
        '<li><b>レッスン3〜4</b>安全な設定と会話の管理<br><span>許可・/clear・バックグラウンドで動かす作業</span></li>' +
        '<li><b>レッスン5〜6</b>作業の分担・自動のルール・外部サービス<br><span>サブエージェント・フック・コネクタ</span></li>' +
        '<li><b>レッスン7〜8</b>繰り返しの作業をスキルに、作品の保存と公開<br><span>スキル・プラグイン・GitHub・クラウド・スマホ</span></li>' +
        '</ul>' +
        '<p class="note">これで、この教材のレッスンはすべて終了です。わからなくなったときは、いつでも前のレッスンに戻って見直してください。</p>',
      help: [
        { q: 'できなかったところがあります', a: 'そのステップに戻り、「困ったとき」を確認してください。何度でもやり直せます。' }
      ]
    }
  ];

  var lesson8 = {
    id: 'l8', no: 8, needsPc: true, ready: true, minutes: 150,
    title: '作品の保存と公開、スマホで続きを見る',
    short: 'GitHubにページを保存し、別のフォルダにクローンして取り出す。中身を確認してから公開する。デスクトップアプリ・クラウドセッション・スマホからも作業を依頼する',
    devices: 'PC＋スマホ（スマホは任意）',
    doneCard: '<b>レッスン8　完了です。お疲れさまでした。</b><br>作ったものをGitHubに保存して公開し、デスクトップアプリ・クラウド・スマホからもClaudeに作業を頼めるようになりました。<b>これで、すべてのレッスンが終了です。</b>',
    steps: steps
  };

  for (var i = 0; i < C.lessons.length; i++) {
    if (C.lessons[i].id === 'l8') { C.lessons[i] = lesson8; break; }
  }
})();
