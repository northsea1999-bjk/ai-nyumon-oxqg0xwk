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
    q: 'AIが「許可しますか？」と聞いてきました',
    a: 'git や gh のコマンドを動かす前に聞いてきます。内容を読んで、<b>cafe-landing のこと</b>なら、<b>1番目の「Yes」</b>を選びます。「次から聞かない」の選択肢は選びません。わからないときは「いいえ(No)」で大丈夫です。'
  };
  var HELP_ENG = { q: '画面の文字が英語です', a: '大丈夫です。表示が英語でも、やることは同じです。' };
  var HELP_USER = {
    q: '「ユーザー名」がわかりません',
    a: 'GitHubの右上の、丸いアイコンを押すと出ます。または、Claude Codeで「GitHubのユーザー名を教えて」と聞けば、gh で調べてくれます。'
  };
  var HELP_INSTALL_AI = {
    q: 'AIが、なにかをインストールしようとします',
    a: '「いいえ(No)」を選んで、「インストールは、自分でします」と伝えます。名前と理由を聞いてから、自分で決めます。'
  };

  var steps = [
    {
      id: 'i1', kind: 'sample', tag: '今日のゴール', title: 'レッスン8で、できるようになること',
      html:
        '<p class="note warn"><b>このレッスンは、WindowsかMacのパソコンが必要です。</b>スマホは、最後の画面で使います（なくても進められます）。画面の右上の「Windows／Mac」ボタンで、ご自分のパソコンのほうを選んでください。</p>' +
        '<p>作ったものを、<b>インターネットの保管庫（GitHub）</b>にしまって、<b>だれでも見られるページ</b>にします。そのあと、VS Code 以外の場所（<b>デスクトップアプリ・ブラウザ・スマホ</b>）からも、Claudeに続きを頼めるようにします。</p>' +
        '<div class="card goal"><b>ゴール</b><br>① GitHubに、カフェのページを<b>保存</b>して、消しても<b>もどせる</b>ことを確かめる<br>② GitHub Pagesで、ページを<b>インターネットに公開</b>する<br>③ <b>デスクトップアプリ</b>と<b>クラウドセッション</b>で、Claudeに頼む<br>④ <b>スマホ</b>から、パソコンの会話の続きを見る（できる人だけ）</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>かかる時間</dt><dd>約2時間半（休みながらでOK）</dd>' +
        '<dt>つかうもの</dt><dd>VS Code、agent1フォルダ、Claude Code、Claudeの有料プラン、GitHubのアカウント（無料。作り方は、このあと）</dd>' +
        '</dl></div>' +
        '<p class="note warn">今日は、<b>インターネットに公開</b>する作業があります。公開するページには、<b>名前・住所・電話番号・パスワードなど、個人の情報を入れません</b>。</p>',
      help: [
        { q: 'レッスン7が終わっていません', a: 'このレッスンは、レッスン7のスキルがなくても進められます。デスクトップアプリの画面で、スキルが出ないだけです。' },
        { q: 'スマホを持っていません', a: '大丈夫です。スマホの画面は、読むだけにして、進んでください。' }
      ]
    },
    {
      id: 'i2', kind: 'know', tag: '知っておこう', title: '「GitHub」って、なに？',
      html:
        '<p><b>GitHub</b>（ギットハブ）は、フォルダをインターネットにしまっておける、<b>クラウドの共有フォルダ</b>のような場所です。Googleドライブにフォルダを置くのと、にています。</p>' +
        '<h2>GitHubで、できること</h2>' +
        '<ul class="parts">' +
        '<li><b>バックアップ</b>フォルダを、まるごとしまっておく<br><span>パソコンのフォルダがこわれても、GitHubに残っている</span></li>' +
        '<li><b>よびだす</b>ほかのパソコンでも、同じフォルダを取り出せる<br><span>新しいパソコンでも、続きから始められる</span></li>' +
        '<li><b>もどす</b>前の状態に、もどせる<br><span>しまうたびに、記録が残る</span></li>' +
        '<li><b>直した記録</b>「なぜ直したか」のメモが残る<br><span>あとで、AIも、そのメモを読んで流れがわかる</span></li>' +
        '</ul>' +
        '<h2>おぼえる言葉は、4つだけ</h2>' +
        '<ul class="parts">' +
        '<li><b>リポジトリ</b>GitHubの中の、フォルダ1つ分<br><span>短く「リポ」とも呼ぶ</span></li>' +
        '<li><b>コミット</b>いまの状態を、メモをつけて記録すること<br><span>ゲームの「セーブ」のようなもの</span></li>' +
        '<li><b>プッシュ</b>記録を、GitHubに送ること<br><span>パソコン → GitHub</span></li>' +
        '<li><b>クローン</b>リポジトリを、まるごと取り出すこと<br><span>GitHub → パソコン</span></li>' +
        '</ul>' +
        '<p class="note">道具の名前は、<b>Git</b>（ギット：記録をとる道具）と、<b>GitHub</b>（記録をしまう場所）です。似ていますが、別のものです。</p>',
      help: [
        { q: '全部おぼえないといけませんか？', a: 'いいえ。作業はAIが手伝います。「コミット」「プッシュ」と言われたら、この画面にもどって見れば大丈夫です。' }
      ]
    },
    {
      id: 'i3', kind: 'pc', tag: 'PCで操作', title: 'GitHubのアカウントを、自分で作る',
      html:
        '<p>アカウントは、<b>自分で</b>作ります。パスワードや確認のコードは、<b>自分だけ</b>が入れます。AIには教えません。</p>' +
        '<ol>' +
        '<li>ブラウザで、<b>github.com/signup</b> を開きます。<br><a href="https://github.com/signup" target="_blank" rel="noopener">github.com/signup を開く</a></li>' +
        '<li>Googleのアカウントを使うなら、<b>「Continue with Google」</b>を押して、いつも使っているアカウントを選びます（公式の案内）。メールアドレスで作ることもできます。</li>' +
        '<li>画面の案内にそって進みます。<b>メールに届いた確認のコード</b>を、そのまま入れます。</li>' +
        '<li>右上に、丸いアイコンが出たら、できあがりです。アイコンを押して、<b>ユーザー名</b>（英語の名前）をメモします。</li>' +
        '</ol>' +
        '<p class="note">新しいパソコンでログインするときも、メールに確認のコードが届くことがあります（公式の案内。1時間有効）。</p>' +
        '<p class="note warn">ユーザー名は、<b>公開するページのアドレス</b>にも使われます。本名を使いたくない人は、本名ではない名前にしてください。</p>',
      help: [
        { q: 'もうアカウントがあります', a: 'そのアカウントで、ログインしておいてください。次へ進んで大丈夫です。' },
        { q: 'パズルや「人間ですか？」の確認が出ました', a: '画面の案内にしたがって、自分で答えてください。AIには、やらせません。' },
        { q: '確認のコードがとどきません', a: '迷惑メールのフォルダを見てください。学校やお店の、みんなで使うWi-Fiでうまくいかないときは、スマホのテザリングなど、別のつなぎ方で試してください。' },
        { q: '二段階認証は、必要ですか？', a: '公式の案内では、作るときに必須ではありませんが、つよくすすめられています。あとで GitHub から「二段階認証を設定してください」というメールが来たら、案内の期限（45日）までに、自分で設定します。' }
      ]
    },
    {
      id: 'i4', kind: 'pc', tag: 'PCで操作', title: 'GitとGitHub CLIを、自分で入れる',
      html:
        '<p>GitHubを、文字の命令で使う道具 <b>GitHub CLI</b>（コマンドは <b>gh</b>）と、記録をとる道具 <b>Git</b> を、<b>自分で</b>入れます。CLIの形なら、AIも、そのまま使えます（レッスン7）。</p>' +
        '<div class="os-win">' +
        '<ol>' +
        '<li>Claude Codeが動いていたら、入力欄に <b>/exit</b> と入れて、Enterキーを押します。</li>' +
        '<li>VS Codeのターミナル（先頭が「PS」）に、下の「コピー」を押して、貼り付けて、Enterキーを押します。<b>Git</b> が入ります（git-scm.com の公式の案内にある方法。いちばん新しい版より少し古いことがありますが、このレッスンでは問題ありません）。' + box('winget install --id Git.Git -e --source winget') + '</li>' +
        '<li>終わったら、次を貼り付けて、Enterキーを押します。<b>GitHub CLI</b> が入ります（GitHub CLIの公式の案内）。' + box('winget install --id GitHub.cli --source winget') + '</li>' +
        '<li>それぞれのコマンドの途中で「このアプリがデバイスに変更を加えることを許可しますか？」と出たら、「はい」を押します（2回出ることがあります）。</li>' +
        '<li><b>VS Codeを、いったん完全に閉じて、もう一度開きます</b>（新しい道具を、ターミナルが見つけられるようにするためです）。</li>' +
        '</ol>' +
        '</div>' +
        '<div class="os-mac">' +
        '<ol>' +
        '<li>Claude Codeが動いていたら、入力欄に <b>/exit</b> と入れて、Returnキーを押します。</li>' +
        '<li><b>Git</b>：VS Codeのターミナルに、下の「コピー」を押して、貼り付けて、Returnキーを押します。' + box('git --version') + '「git version 2.…」と数字が出たら、もう入っています（公式の案内では、多くのMacに最初から入っています）。<br>入っていないときは、インストールの窓が、すぐに出ることがあります。出ないときは、次を貼り付けます（Appleの公式の案内）。' + box('xcode-select --install') + '窓が出たら、「インストール」→ 使用許諾を読んで「同意する」を押して、終わるまで待ちます（数分かかります）。終わったら、もう一度 git --version で確かめます。</li>' +
        '<li><b>GitHub CLI</b>：ブラウザで、GitHub CLIの公式のリリースのページを開きます。<br><a href="https://github.com/cli/cli/releases/latest" target="_blank" rel="noopener">github.com/cli/cli/releases/latest を開く</a></li>' +
        '<li>下のほうの「Assets」から、名前が <b>gh_（数字）_macOS_universal.pkg</b> のファイルを押して、ダウンロードします。見つからないときは、「Show all … assets」を押して、全部を出します。</li>' +
        '<li>ダウンロードしたファイルを、ダブルクリックして、案内にそって入れます。「開けません」と出たら、下の「困ったとき」を見てください。</li>' +
        '<li><b>VS Codeを、⌘（Command）キーとQキーで、いったん完全に終了して、もう一度開きます。</b></li>' +
        '</ol>' +
        '</div>' +
        '<p>最後に、入ったか確かめます。ターミナルに、次を貼り付けて、' + os('Enter', 'Return') + 'キーを押します。</p>' + box('gh --version') + '<p>「gh version …」と出たら、成功です。</p>',
      help: [
        { os: 'win', q: '「契約条件に同意しますか？」（Y/N）と聞かれました', a: 'winget をはじめて使うときに出ることがあります。読んでから、Y を入れて、Enterキーを押します。' },
        { os: 'win', q: '許可の窓が出てきません', a: 'VS Codeのうしろにかくれていることがあります。画面の下のタスクバーで、点滅しているものを押してください。' },
        { os: 'win', q: '「winget」が「認識されません」と出ました', a: 'Microsoft Storeで「アプリ インストーラー」を更新してから、VS Codeを開きなおして、試してください。' },
        { os: 'win', q: 'gh や git が「認識されません」と出ました', a: 'VS Codeを完全に閉じて、もう一度開いてください。それでもだめなら、パソコンを再起動します。' },
        { os: 'win', q: 'Gitを入れると、Claude Codeは変わりますか？', a: '公式の案内では、Gitは入れなくてもClaude Codeは動き、入れても、ふだんの中心は今までどおり PowerShell です。Bash（バッシュ）という別のやり方も使えるようになります。' },
        { os: 'mac', q: '「開けません」「開いていません」という窓が出ました', a: 'GitHub CLIの公式の案内でも、Mac用のインストーラーには「署名がない」と書かれています。まず、窓の「完了」を押します（「ゴミ箱に入れる」は押しません）。<b>github.com/cli/cli の公式のページからダウンロードしたもの</b>なら、アップルメニュー →「システム設定」→「プライバシーとセキュリティ」を開いて、下へスクロールして、<b>「このまま開く」</b>を押します（レッスン1と同じやり方）。ほかの場所からダウンロードしたものは、開かないでください。' },
        { os: 'mac', q: 'Macのパスワードを聞かれました', a: 'Macにログインするときのパスワードを、自分で入れます。入れても、画面に文字が出ないことがありますが、そのまま入れて大丈夫です。' },
        { os: 'mac', q: 'Homebrew（ホームブルー）を使っています', a: 'Homebrewを使っている人は、brew install gh でも入れられます（公式の案内）。' },
        HELP_INSTALL_AI
      ]
    },
    {
      id: 'i5', kind: 'pc', tag: 'PCで操作', title: 'GitHub CLIで、ログインする',
      html:
        '<p>ログインも、<b>自分で</b>行います。</p>' +
        '<ol>' +
        '<li>VS Codeで <b>agent1</b> フォルダを開いて、新しいターミナルを開きます。</li>' +
        '<li>下の「コピー」を押して、貼り付けて、' + os('Enter', 'Return') + 'キーを押します。' + box('gh auth login --hostname github.com --git-protocol https --web') + '</li>' +
        '<li>「Authenticate Git with your GitHub credentials?」（GitHubのログインを、Gitでも使いますか？）と出たら、<b>Y</b> を入れて、' + os('Enter', 'Return') + 'キーを押します（公式の案内）。</li>' +
        '<li>「First copy your one-time code: <b>XXXX-XXXX</b>」と、<b>8文字のコード</b>が出ます。メモします（公式の案内では、15分で使えなくなります）。</li>' +
        '<li>「Press Enter to open…」と出たら、' + os('Enter', 'Return') + 'キーを押します。ブラウザが開きます。開かないときは、<b>github.com/login/device</b> を自分で開きます。</li>' +
        '<li>ブラウザで、GitHubにログインして、<b>8文字のコード</b>を入れて、「Continue」→「Authorize github」を押します。</li>' +
        '<li>ターミナルにもどって、「<b>Logged in as</b> （あなたのユーザー名）」と出たら、成功です。</li>' +
        '</ol>' +
        '<p>確かめるときは、次を貼り付けます。「Logged in to github.com account （ユーザー名）」と出れば、ログインできています。</p>' + box('gh auth status') +
        '<p class="note warn">コードを入れる画面は、<b>自分でコマンドを動かしたときだけ</b>使います。だれかに「このコードを入れて」と頼まれても、入れません。</p>',
      help: [
        { q: 'コードの期限が切れました', a: 'もう一度、gh auth login のコマンドから、やりなおしてください。新しいコードが出ます。' },
        { q: '「Token」の行に、文字が出ています', a: '大事な「かぎ」なので、一部が「*」でかくされています。全部を表示する方法は、使いません。人にも見せません。' },
        HELP_ENG
      ]
    },
    {
      id: 'i6', kind: 'pc', tag: 'PCで操作', title: 'メールアドレスを守る設定',
      html:
        '<p>コミット（記録）には、<b>名前とメールアドレス</b>がつきます。公開すると、だれでも見られます。そこで、GitHubが用意している<b>公開用のアドレス（noreply）</b>を使います。</p>' +
        '<ol>' +
        '<li>ブラウザで、GitHubの <b>Settings（設定）→ Emails</b> を開きます。<br><a href="https://github.com/settings/emails" target="_blank" rel="noopener">github.com/settings/emails を開く</a></li>' +
        '<li><b>「Keep my email addresses private」</b>と、<b>「Block command line pushes that expose my email」</b>に、チェックを入れます（公式の案内）。</li>' +
        '<li>VS Codeのターミナルで、Claude Codeを起動します。' + cmd('claude') + '</li>' +
        '<li>画面の下の行が <b>manual mode on</b> になっているか、見ます。ちがうときは、Shift+Tabを押して、<b>manual</b> にします。</li>' +
        '<li>次の文を、コピーして、送ります。' +
        box('gh api user で、わたしのGitHubのIDとユーザー名を調べてください。そのあと、git config --global で、user.name をユーザー名に、user.email を「ID+ユーザー名@users.noreply.github.com」の形のアドレスに、init.defaultBranch を main に設定してください。ほかの設定は、変えないでください。終わったら、設定した3つを見せてください。') +
        '</li>' +
        '<li>見せてくれたメールアドレスが、<b>「@users.noreply.github.com」で終わっている</b>ことを確かめます。</li>' +
        '</ol>' +
        '<p class="note">「init.defaultBranch を main に」は、記録の置き場所（ブランチ）の名前を、GitHubと同じ <b>main</b> にそろえる設定です。</p>',
      help: [
        HELP_APPROVE,
        { q: 'ふつうのメールアドレスが出ました', a: '「user.email を、noreply のアドレスに直してください」と頼みます。2つめのチェックを入れていれば、ふつうのアドレスのままでは、プッシュが止められます（公式の案内）。' },
        HELP_USER
      ]
    },
    {
      id: 'i7', kind: 'pc', tag: 'PCで操作', title: 'カフェのページを作って、GitHubにしまう',
      html:
        '<p>練習用に、架空のカフェの紹介ページを作って、<b>非公開（private）</b>のリポジトリにしまいます。まだ、だれにも見えません。</p>' +
        '<ol>' +
        '<li>次の文を、コピーして、送ります。' +
        box('agent1 の中に cafe-landing というフォルダを作って、その中に、架空のカフェを紹介する1ページのWebページ（index.html）を、日本語で作ってください。写真は使わず、文字と色だけで作ってください。個人の情報は入れないでください。できたら、cafe-landing フォルダの中だけで git init をして、メモをつけてコミットしてください。そのあと gh repo create で、cafe-landing という名前の、非公開（private）のリポジトリを作って、プッシュしてください。agent1 フォルダそのものは、リポジトリにしないでください。.DS_Store のような、パソコンが自動で作るファイルは、.gitignore に入れて、しまわないでください。') +
        '</li>' +
        '<li>許可を聞かれたら、内容を読んで、cafe-landing のことなら「Yes」を選びます。</li>' +
        '<li>最後に、<b>github.com/（ユーザー名）/cafe-landing</b> のようなアドレスを教えてくれたら、できあがりです。</li>' +
        '</ol>' +
        '<p class="note">AIは、Git の記録（git init・git add・git commit）をしてから、gh repo create でリポジトリを作り、プッシュします。先にコミットがないと、プッシュできません。</p>' +
        '<p class="note"><b>.gitignore</b>（ギット・イグノア）は、「このファイルは、しまわない」という一覧のファイルです。パソコンが自動で作るファイルを、GitHubに送らないようにします。</p>',
      help: [
        HELP_APPROVE,
        { q: 'agent1 フォルダで git init をしようとします', a: '「いいえ(No)」を選んで、「cafe-landing の中だけでしてください」と伝えます。agent1 には、CLAUDE.md やスキルなど、しまわなくていいものも入っているからです。' },
        { q: '「public（公開）」で作ろうとします', a: '「いいえ(No)」を選んで、「private（非公開）で作ってください」と伝えます。公開は、あとで、中身を確かめてから行います。' },
        { q: 'ページを、ブラウザで見たいです', a: 'VS Codeの左の一覧で、cafe-landing の index.html を' + os('右クリック', '右クリック（または、Controlキーを押しながらクリック）') + 'して、' + os('「エクスプローラーで表示」', '「Finder で表示」') + 'を選びます。出てきた index.html を、ダブルクリックします。' }
      ]
    },
    {
      id: 'i8', kind: 'pc', tag: 'PCで操作', title: 'リポジトリの画面を見て、説明書をたす',
      html:
        '<ol>' +
        '<li>ブラウザで、<b>github.com/（ユーザー名）/cafe-landing</b> を開きます。</li>' +
        '<li>次の3つを、確かめます。<br>・名前の横に <b>Private</b>（非公開）と出ている<br>・<b>index.html</b> が入っている<br>・ファイルの横に、コミットのときの<b>メモ</b>が出ている</li>' +
        '<li>Claude Codeにもどって、次の文を、コピーして、送ります。' +
        box('cafe-landing フォルダに README.md を作って、このフォルダが何かを、日本語で短く説明してください。できたら、コミットして、プッシュしてください。') +
        '</li>' +
        '<li>ブラウザのページを、もう一度読みこみます（' + os('F5キー', '⌘（Command）キーとRキー') + '）。ファイルの下に、<b>README の説明</b>が出たら、成功です。</li>' +
        '<li>ファイルの上の、<b>時計のマーク（Commits）</b>を押すと、これまでのコミットの記録が、メモといっしょに見られます。</li>' +
        '</ol>' +
        '<p class="note">README（リードミー）は、「はじめに読んでね」という説明書です。リポジトリのページに、自動で表示されます。</p>',
      help: [
        HELP_APPROVE,
        { q: 'ページが「404」になります', a: 'GitHubに、ログインしているか確かめてください。非公開のリポジトリは、自分がログインしているときだけ見られます。' },
        HELP_USER
      ]
    },
    {
      id: 'i9', kind: 'pc', tag: 'PCで操作', title: 'わざと消して、クローンでもどす',
      html:
        '<p>パソコンのフォルダがなくなっても、GitHubから<b>もどせる</b>ことを、ためします。</p>' +
        '<ol>' +
        '<li>VS Codeの左の一覧で、<b>cafe-landing</b> フォルダを' + os('右クリック', '右クリック（または、Controlキーを押しながらクリック）') + 'して、「削除」を選びます。</li>' +
        '<li>確認が出たら、<b>' + os('「ごみ箱に移動」（Move to Recycle Bin）', '「ゴミ箱に移動」（Move to Trash）') + '</b>を押します。一覧から cafe-landing が消えます（' + os('ごみ箱', 'ゴミ箱') + 'にあるので、本当になくなったわけではありません）。</li>' +
        '<li>Claude Codeで、<b>/clear</b> と入れて、会話をまっさらにします（AIが、前の会話を覚えていない状態でためすためです）。</li>' +
        '<li>次の文の「ユーザー名」を、自分のものに書きかえて、送ります。' +
        box('https://github.com/ユーザー名/cafe-landing のリポジトリを、いまのフォルダ（agent1）にクローンしてください。') +
        '</li>' +
        '<li>左の一覧に、<b>cafe-landing</b> がもどってきて、中に index.html と README.md があれば、成功です。</li>' +
        '</ol>' +
        '<p class="note">新しいパソコンでも、同じお願いで、続きから始められます。</p>',
      help: [
        HELP_APPROVE,
        { q: '「削除」が見つかりません', a: os('フォルダを1回クリックして、Deleteキーを押しても、同じ確認が出ます。', 'フォルダを1回クリックして、⌘（Command）キーとDeleteキーを押しても、ゴミ箱に移せます。') },
        { q: 'クローンで、エラーが出ました', a: 'アドレスのユーザー名が合っているか、確かめてください。「gh auth status でログインを確かめてから、もう一度クローンしてください」と頼むのも、よい方法です。' },
        HELP_USER
      ]
    },
    {
      id: 'i10', kind: 'pc', tag: 'PCで操作', title: '中身を確かめてから、公開する',
      html:
        '<p><b>GitHub Pages</b>（ギットハブ・ページズ）を使うと、リポジトリのページを、インターネットに公開できます。公式の案内では、無料のプランでは、<b>リポジトリを公開（public）にする</b>必要があります。公開すると、<b>ファイルもすべて、だれでも見られます</b>。</p>' +
        '<div class="card goal"><b>公開する前に、自分で確かめる</b><br>□ ファイルは、index.html・README.md・.gitignore（しまわないファイルの一覧）だけ<br>□ 名前・住所・電話番号・メールアドレスが入っていない<br>□ パスワードや「かぎ」が入っていない<br>□ 公開して、はずかしくない内容<br>□ <b>前のコミット（Commits）</b>にも、個人の情報が入ったことがない</div>' +
        '<p class="note warn">公開すると、<b>いまのファイルだけでなく、前のコミットの記録も全部</b>見られます。あとで直しても、前の記録には残ります。個人の情報が一度でも入っていたら、公開しないで、リポジトリを作りなおしてください。</p>' +
        '<ol>' +
        '<li>リポジトリのページと、時計のマーク（Commits）の記録で、上の5つを確かめます。気になるところがあったら、先にAIに直してもらいます。</li>' +
        '<li>大丈夫なら、次の文を、コピーして、送ります。' +
        box('gh を使って、cafe-landing のリポジトリを、公開（public）に変えて、GitHub Pages で公開してください。コマンドには、リポジトリの名前を「ユーザー名/cafe-landing」の形で入れてください。公開する元は、main ブランチの、いちばん上（/）にしてください。公開の作業が終わったか確かめてから、公開のアドレスを教えてください。') +
        '</li>' +
        '<li>「公開に変える」コマンドの許可を聞かれたら、<b>リポジトリの名前が cafe-landing であること</b>を確かめて、「Yes」を選びます。</li>' +
        '</ol>' +
        '<p class="note">「公開にする」「Pagesを作る」のように、外から見えるようになる作業は、<b>自分で確かめてから</b>許可します。これからも、同じです。</p>',
      help: [
        { q: 'ほかのリポジトリの名前が出ました', a: '「いいえ(No)」を選んで、「cafe-landing だけを公開にしてください」と伝えます。' },
        { q: 'やっぱり、公開をやめたいです', a: 'リポジトリのページの「Settings」→「Pages」で、「Your site is live at」の横の「…」→「Unpublish site」を押すと、公開をやめられます。リポジトリそのものを非公開にもどすには、「Settings」のいちばん下の「Change visibility」を使います。公式の案内では、無料のプランで非公開にもどすと、ページの公開も自動で止まります。' },
        HELP_ENG
      ]
    },
    {
      id: 'i11', kind: 'pc', tag: 'PCで操作', title: '公開されたページを見る',
      html:
        '<ol>' +
        '<li>AIが教えてくれたアドレスを、ブラウザで開きます。</li>' +
        '<li>カフェのページが出たら、成功です。<b>このアドレスを知っている人なら、だれでも、どこからでも</b>見られます。</li>' +
        '</ol>' +
        '<h2>アドレスのしくみ</h2>' +
        '<p><code>https://<b>ユーザー名</b>.github.io/<b>cafe-landing</b>/</code></p>' +
        '<ul class="parts">' +
        '<li><b>ユーザー名.github.io</b>前の半分<br><span>あなたのGitHubのユーザー名</span></li>' +
        '<li><b>/cafe-landing/</b>うしろの半分<br><span>リポジトリの名前</span></li>' +
        '</ul>' +
        '<p class="note">公式の案内では、公開されるまで、<b>最大10分</b>かかることがあります。</p>',
      help: [
        { q: '「404」と出ます', a: '数分待ってから、もう一度読みこみます。10分たってもだめなら、「GitHub Pages の状態を確かめてください」とAIに頼みます。' },
        { q: '古いページのままです', a: 'ブラウザが、古いページを覚えていることがあります。' + os('Ctrlキーと F5キー', '⌘（Command）キーとShiftキーとRキー') + 'で、読みこみなおしてください。' }
      ]
    },
    {
      id: 'i12', kind: 'pc', tag: 'PCで操作', title: '作る前に、まず探す',
      html:
        '<p>GitHubには、世界中の人が作った道具が、たくさんあります。何かを作りたくなったら、<b>まず「もうないか」探す</b>のが近道です（レッスン7のライブラリと同じ考え方）。</p>' +
        '<ol>' +
        '<li>ブラウザで、<b>GitHubのトレンド</b>（その日に人気のリポジトリ）を開いて、ながめてみます。上の「Date range」で期間を、「Language」で言語をしぼれます。<br><a href="https://github.com/trending" target="_blank" rel="noopener">github.com/trending を開く</a></li>' +
        '<li>気になるものがあったら、<b>Star（☆）</b>を押してみます。公式の案内では、Starは「あとで見つけやすくする」しおりで、作った人への「ありがとう」にもなります。押したものは、github.com/stars で見られます。</li>' +
        '<li>Claude Codeにもどって、次の文を、コピーして、送ります。' +
        box('PDFの資料を、要点だけのまとめノートに変える道具を作りたいです。作る前に、使えるライブラリやオープンソースが、もうないか、WebとGitHubで調べてください。インストールはしないでください。候補を3つ、作った人・スターの数・最近の更新・何ができるかと一緒に、表で教えてください。') +
        '</li>' +
        '<li>調べるための許可（WebSearch・gh search など）を聞かれたら、内容を読んで「Yes」を選びます。</li>' +
        '</ol>' +
        '<li>候補が出たら、入れる前に、<b>説明書（README）を読んでもらいます</b>。次の文を、コピーして、送ります（何もインストールしません）。' +
        box('gh repo view microsoft/markitdown で README を読んで、何ができる道具か、どうやって使うか、注意することは何か、やさしく説明してください。インストールはしないでください。') +
        '</li>' +
        '<p class="note">人の公開リポジトリは、<b>読んで学ぶ</b>のにも使えます。気になるリポジトリがあったら、同じように README の説明を頼んでみてください。</p>' +
        '<div class="card goal"><b>人が作ったものを入れる前に、見るところ</b><br>・<b>だれが作ったか</b>（会社・よく知られた人か）<br>・<b>スターの数</b>と、<b>最近も直されているか</b><br>・<b>README</b> に、使い方と、できることが書いてあるか<br>・あやしいときは、<b>入れない</b></div>',
      help: [
        { q: 'トレンドが英語ばかりです', a: '大丈夫です。見るだけで、十分です。わからないものは、AIに「このリポジトリは何ですか？」と聞けます。' },
        HELP_INSTALL_AI
      ]
    },
    {
      id: 'i13', kind: 'pc', tag: 'できる人だけ', title: '見つけた道具を、使ってみる（markitdown）',
      html:
        '<p>前の画面で、Microsoftが作った <b>markitdown</b>（マークイットダウン）が出てきたかもしれません。PDF・ワード・エクセル・パワーポイントなどを、AIが読みやすい文字（Markdown）に変える道具です。<b>やってみたい人だけ</b>、ためします。</p>' +
        '<ol>' +
        '<li>練習用のファイルを、1つ用意して、agent1 に入れます。<b>個人の情報が入っていない、文字のある</b>PDFやワードにします（たとえば、自分で作ったメモや、公開されている案内）。</li>' +
        '<li>Claude Codeに <b>/exit</b> と入れて終わらせて、Pythonの版を確かめます。' + cmdOs('python --version', 'python3 --version') + '<b>3.10〜3.14</b> のときだけ、続けます。それ以外（3.15 以上、3.9 以下）なら、markitdown が対応していないので、<b>この画面は飛ばします</b>（公式の案内では、3.10〜3.14 で使えます）。</li>' +
        '<li>3.10〜3.14 なら、次を貼り付けて、' + os('Enter', 'Return') + 'キーを押します（公式の案内の名前のまま、自分で入れます）。' + cmdOs('python -m pip install "markitdown[all]"', 'python3 -m pip install "markitdown[all]"') + '</li>' +
        '<li><b>claude -c</b> で、Claude Codeにもどります。' + cmd('claude -c') + '</li>' +
        '<li>次の文の「ファイル名」を書きかえて、送ります。' +
        box('markitdown は、もう入れてあります。markitdown を使って、ファイル名 を Markdown に変えてください。そのあと、大事なところだけを、まとめノート（まとめ.md）にしてください。') +
        '</li>' +
        '</ol>' +
        '<p class="note">レッスン2で、いちばん新しいPythonを入れた人は、3.15 以上になっていることがあります。そのときは、飛ばして大丈夫です。</p>',
      help: [
        { q: 'インストールで、エラーが出ました', a: 'Pythonの版が、合っていないことがあります。この画面は、できる人だけなので、飛ばして大丈夫です。' },
        { q: '「markitdown が見つからない」と言われました', a: '「python -m で、markitdown を動かしてください」と頼みます。' },
        { q: '中身が、ほとんど空っぽでした', a: '写真だけのPDF（たとえば、レッスン7で作ったカードのPDF）は、文字が取り出せないことがあります。文字のあるファイルで、ためしてください。' },
        HELP_APPROVE
      ]
    },
    {
      id: 'i14', kind: 'pc', tag: 'PCで操作', title: 'Claudeのデスクトップアプリを入れる',
      html:
        '<p>VS Codeのほかに、<b>Claudeのデスクトップアプリ</b>からも、Claude Codeを使えます。ボタンで操作できるので、ちょっとした作業に便利です。</p>' +
        '<ul class="parts">' +
        '<li><b>ブラウザの claude.ai（チャット）</b>話すだけ<br><span>安全のため、自分のパソコンのフォルダには入れない</span></li>' +
        '<li><b>デスクトップアプリの「Code」</b>ボタンで操作<br><span>自分のフォルダを選んで、作業してもらえる</span></li>' +
        '<li><b>VS Code＋Claude Code（CLI）</b>文字で操作<br><span>ファイルを見ながら、作業してもらえる</span></li>' +
        '</ul>' +
        '<ol>' +
        '<li>ブラウザで、<b>claude.com/download</b> を開きます。<br><a href="https://claude.com/download" target="_blank" rel="noopener">claude.com/download を開く</a></li>' +
        '<li>' + os('<b>Windows</b> のダウンロードを押します。ダウンロードしたファイルを、ダブルクリックして、案内にそって入れます。', '<b>macOS</b> のダウンロードを押します。ダウンロードしたファイル（.dmg）を開いて、Claudeのアイコンを「アプリケーション」フォルダに入れます。') + '</li>' +
        '<li>Claudeのアプリを開いて、<b>Claude Codeで使っているのと同じアカウント</b>で、ログインします（パスワードなどは、自分で入れます）。</li>' +
        '<li>ブラウザでログインしたあと、「Claude を開きますか？」のような窓が出たら、<b>開く</b>を押します。出ないときは、ページにある同じ名前のボタンを押します。</li>' +
        '<li>アプリの左の列の、いちばん上のほうにある <b>「Code」</b>（コード）を押します（公式の案内）。マークだけのときは、マウスを乗せると名前が出ます。Claude Codeの画面になります。</li>' +
        '</ol>' +
        '<p class="note">公式の案内では、Codeの画面は、Claudeの有料プラン（Pro・Maxなど）で使えます。Claude Codeを別に入れる必要はありません。</p>',
      help: [
        { q: 'もう、Claudeのアプリが入っています', a: '新しい版に更新してから、そのまま使ってください。' },
        { q: 'クッキー（Cookie）の確認が出ました', a: '選べるときは、「必要なものだけ」のほうを選びます。' },
        { os: 'win', q: 'どちらのWindowsを選べばいいですか？', a: 'ふつうは「Windows」（x64）です。「ARM64」は、一部の薄いノートパソコン用です。' },
        { os: 'mac', q: '「インターネットからダウンロードされたアプリケーションです」と出ました', a: 'claude.com からダウンロードしたものなら、「開く」を押します。' },
        { os: 'mac', q: 'IntelのMacでも使えますか？', a: '公式の案内では、Mac版は、IntelとApple シリコンの、どちらでも使えます。' },
        HELP_ENG
      ]
    },
    {
      id: 'i15', kind: 'pc', tag: 'PCで操作', title: 'フォルダをつないで、モードを選ぶ',
      html:
        '<ol>' +
        '<li>Codeの画面の入力欄の近くで、まず、場所を選ぶところで <b>Local</b>（ローカル＝自分のパソコン）を選びます。</li>' +
        '<li>そのとなりの、フォルダを選ぶところ（「フォルダなし」のように出ています）を押して、<b>「Open folder…」</b>（フォルダを開く）を選びます（公式の案内）。</li>' +
        '<li><b>agent1</b> フォルダを選んで、開きます。「このフォルダを信頼するか」聞かれたら、agent1 なら「信頼する」を選びます。</li>' +
        '<li>入力欄の近くの<b>モード</b>のボタンを押して、<b>Manual</b>（手動。変える前に、毎回たずねる）を選びます。VS Codeの「manual mode」と同じです。</li>' +
        '</ol>' +
        '<h2>モードは、5つ（公式の案内）</h2>' +
        '<ul class="parts">' +
        '<li><b>Manual</b>変える前に、毎回たずねる<br><span>この教材は、これを使う</span></li>' +
        '<li><b>Accept edits</b>ファイルの書きかえは、たずねずに行う<br><span>慣れた人向け</span></li>' +
        '<li><b>Plan</b>変える前に、計画を立てて見せる<br><span>大きな作業の前に便利</span></li>' +
        '<li><b>Auto</b>Claudeが、危なくないか判断して進める<br><span>危ないものは止める</span></li>' +
        '<li><b>Bypass permissions</b>まったくたずねない<br><span>設定で許可しないと出ない。<b>この教材では使わない</b></span></li>' +
        '</ul>' +
        '<p class="note">モデル（AIの種類）を選ぶボタンもあります。チェックがついているのが、いま使っているモデルです。この教材では、最初のままで大丈夫です。</p>',
      help: [
        { q: '画面の言葉が、少しちがいます', a: 'アプリが日本語で表示されているときは、「手動」のように日本語の名前で出ることがあります。版によっても、名前が少しちがいます（前の版では「Ask permissions」などでした）。「変える前にたずねる」ものを選んでください。' },
        { q: '「Bypass permissions」を使ってもいいですか？', a: 'この教材では、使いません。公式の案内でも、設定で特別に許可しないと出ないものです。' }
      ]
    },
    {
      id: 'i16', kind: 'pc', tag: 'PCで操作', title: 'デスクトップアプリで、頼んでみる',
      html:
        '<ol>' +
        '<li>入力欄に、次の文を、コピーして、送ります。' + box('あなたはだれですか？ いまのフォルダの中身を、かんたんに説明してください。') + '</li>' +
        '<li>答えを読みます。VS Codeのときと同じように、agent1 の中身を説明してくれます。</li>' +
        '<li>入力欄に、<b>/</b>（スラッシュ）を入れます。使えるコマンドの一覧が出ます。</li>' +
        '<li>続けて <b>card</b> と入れて、<b>/card</b> にします。レッスン7で作った <b>cardnews</b> が出たら、スキルもそのまま使えることがわかります（公式の案内）。</li>' +
        '</ol>' +
        '<p class="note">入力欄の「＋」から、ファイルや写真を添えて頼んだり、コネクタ（レッスン6）やプラグイン（レッスン7）を見たりできます。</p>' +
        '<h2>どっちを使う？</h2>' +
        '<ul class="parts">' +
        '<li><b>デスクトップアプリ</b>ボタンで、わかりやすい。左の列は<b>会話の一覧</b>で、ファイルの一覧は出ない<br><span>1回で終わる、ちょっとした作業に向く</span></li>' +
        '<li><b>VS Code</b>ファイルを見ながら作業できる<br><span>ファイルがふえる、長い作業に向く</span></li>' +
        '</ul>',
      help: [
        { q: '/card で、cardnews が出ません', a: 'レッスン7をしていない人は、出ません。それで大丈夫です。' },
        { q: '許可を聞かれました', a: 'VS Codeのときと同じです。内容を読んで、agent1 の中のことなら、1回だけ許可します。' }
      ]
    },
    {
      id: 'i17', kind: 'pc', tag: 'PCで操作', title: '「クラウドセッション」と、GitHubをつなぐ',
      html:
        '<p><b>クラウドセッション</b>は、Claudeが用意した<b>インターネットの中のパソコン</b>で、作業をしてもらうやり方です。公式の案内では、<b>ブラウザを閉じても、パソコンを切っても、作業は続きます</b>。</p>' +
        '<ul class="parts">' +
        '<li><b>できる</b>GitHubのリポジトリの作業<br><span>長い作業を、たのんでおける</span></li>' +
        '<li><b>できない</b>自分のパソコンのフォルダ<br><span>agent1 の中は見えない</span></li>' +
        '</ul>' +
        '<ol>' +
        '<li>ブラウザで、<b>claude.ai/code</b> を開いて、ログインします。<br><a href="https://claude.ai/code" target="_blank" rel="noopener">claude.ai/code を開く</a></li>' +
        '<li>GitHubとつなぐ案内が出たら、それにそって、<b>GitHubでログインして、許可</b>します（公式の案内）。入力欄の近くの「Default」は、作業する環境の名前です。そのままで大丈夫です。</li>' +
        '<li><b>Claude GitHub App</b> を入れる画面になったら、アドレスが <b>github.com/apps/claude</b> で、作った人が <b>anthropics</b>（Anthropic）であることを確かめます。この画面が出ないとき（「Skip」で進んだときなど）は、次のリンクを自分で開きます。<br><a href="https://github.com/apps/claude/installations/new" target="_blank" rel="noopener">github.com/apps/claude/installations/new を開く</a></li>' +
        '<li>リポジトリを選ぶところで、<b>「Only select repositories」</b>（選んだリポジトリだけ）を選んで、<b>cafe-landing</b> だけを選び、「Install」を押します。</li>' +
        '</ol>' +
        '<p class="note warn">つなぐ範囲は、<b>使うリポジトリだけ</b>にします。「All repositories」（全部）は選びません。</p>',
      help: [
        { q: 'GitHubとつなぐ案内が出ません', a: 'リポジトリを選ぶところを押すと、つなぐ案内が出ることがあります。' },
        { q: 'あとで、つなぐのをやめたいです', a: 'このレッスンの「あと片づけ」の画面を見てください。' },
        { q: '無料のプランです', a: '公式の案内では、クラウドセッションは、有料のプラン（Pro・Maxなど）で使えます。' },
        HELP_ENG
      ]
    },
    {
      id: 'i18', kind: 'pc', tag: 'PCで操作', title: 'クラウドで直してもらう',
      html:
        '<ol>' +
        '<li>claude.ai/code の入力欄の近くで、リポジトリを選ぶところを押して、<b>cafe-landing</b> を選びます。</li>' +
        '<li>次の文を、コピーして、送ります。' + box('このリポジトリの中身を、かんたんに説明してください。') + '</li>' +
        '<li>説明が出たら、次の文を、コピーして、送ります。' +
        box('ページのいちばん上に「クラウドで直しました」という1行を入れてください。終わったら、どこを変えたか見せてください。マージはしないでください。main ブランチには直接プッシュせず、新しいブランチで作業してください。') +
        '</li>' +
        '<li>終わると、変えたところ（<b>差分</b>）が見られます。変えたファイルや、数字（+1 など）のところを押すと開きます。赤い行が消したところ、緑の行が足したところです。</li>' +
        '<li>よければ、<b>「Create PR」</b>（変更の提案を作る）を押します（公式の案内）。</li>' +
        '</ol>' +
        '<p class="note"><b>PR</b>（プルリクエスト）は、「こう変えたいです」という<b>提案</b>です。まだ、ページは変わっていません。<b>まとめる（マージ）かどうかは、あなたが決めます</b>。</p>' +
        '<p class="note">クラウドセッションのモードは、Auto・Accept edits・Plan から選べます（公式の案内）。インターネットの中の、別のパソコンで動くので、あなたのパソコンのファイルは変わりません。</p>',
      help: [
        { q: 'cafe-landing が出ません', a: '前の画面で、Claude GitHub App に cafe-landing を選んだか、確かめてください。' },
        { q: '「Create PR」を押したあと、GitHubの画面が開いたときは？', a: 'ふつうは、そのまま提案（PR）ができます。GitHubの画面が開いたときは、その画面で、緑の「Create pull request」を押すと、提案ができます。もう提案（PR）ができていたら、そのまま次の画面へ進みます。' },
        { q: 'main に直接プッシュしたと言われました', a: 'ページが、マージなしで変わっていることがあります。公開のページを見て、問題がなければ、そのまま次へ進みます。次からは、「新しいブランチで」と、もう一度伝えます。' },
        { q: 'ブラウザを閉じてしまいました', a: '大丈夫です。公式の案内では、作業は続いています。claude.ai/code を開きなおすと、左の一覧に残っています。' },
        { q: '使用量は、かかりますか？', a: 'はい。公式の案内では、ふだんのClaudeと同じ、プランの使用量から使われます。' }
      ]
    },
    {
      id: 'i19', kind: 'pc', tag: 'PCで操作', title: '提案を確かめて、自分でマージする',
      html:
        '<ol>' +
        '<li>ブラウザで、<b>github.com/（ユーザー名）/cafe-landing</b> を開いて、上の <b>「Pull requests」</b> を押します。</li>' +
        '<li>Claudeが作った提案を押して、<b>「Files changed」</b>で、変えたところを見ます。</li>' +
        '<li>よければ、<b>「Merge pull request」</b> →<b>「Confirm merge」</b>を押します。これで、main にまとまります。</li>' +
        '<li>数分待ってから、公開のページ（<b>ユーザー名.github.io/cafe-landing/</b>）を読みこみなおします。いちばん上に<b>「クラウドで直しました」</b>が出たら、成功です。</li>' +
        '<li>デスクトップアプリを開いて、左の一覧も見てみます。いまのクラウドの会話が、ここにも出ていることがあります。</li>' +
        '<li>最後に、パソコンの cafe-landing も、最新にします。VS CodeのClaude Codeで（止まっていたら、<b>claude -c</b> で起動して）、次の文を送ります。' + box('cafe-landing で git pull をして、GitHubの最新の状態にしてください。') + '</li>' +
        '</ol>' +
        '<p class="note">「プッシュ」がパソコン → GitHub なら、<b>プル（pull）</b>は GitHub → パソコンです。クラウドで直したものを、手元に持ってきます。</p>',
      help: [
        { q: '「Merge pull request」が押せません', a: '少し待って、ページを読みこみなおしてください。それでもだめなら、提案の画面のいちばん下のメッセージを、AIに見せて聞いてみてください。' },
        { q: 'マージしたくありません', a: '「Close pull request」で、提案を閉じられます。ページは変わりません。' },
        { q: 'claude -c で、思っていたのとちがう会話が出ました', a: 'そのまま使っても大丈夫です。気になるときは、/exit してから claude で、新しく始めます。' },
        HELP_APPROVE
      ]
    },
    {
      id: 'i20', kind: 'phone', tag: 'スマホ', title: 'スマホで、パソコンの会話の続きを見る',
      html:
        '<p><b>リモートコントロール</b>を使うと、<b>パソコンで動いている Claude Code</b> の会話を、スマホから見たり、続きを頼んだりできます。作業は、パソコンの中で行われます。<b>スマホがない人は、読むだけ</b>で大丈夫です。</p>' +
        '<ol>' +
        '<li>VS CodeのClaude Codeを用意します（止まっていたら、<b>claude -c</b> で起動します）。</li>' +
        '<li>スマホに、<b>Claudeのアプリ</b>を入れて、同じアカウントでログインします。Claude Codeで <b>/mobile</b> と入れると、アプリを入れるためのQRコードが出ます（公式の案内）。</li>' +
        '<li>Claude Codeで <b>/rc</b> と入れて、' + os('Enter', 'Return') + 'キーを押します（/remote-control と同じです）。' + cmd('/rc') + '</li>' +
        '<li>はじめてのときは、確認が出ます。<b>「Enable Remote Control」</b>を選びます。つながると、画面の下のほうに <b>/rc active</b> と出ます（公式の案内）。ターミナルがせまいと出ないので、そのときはターミナルを広げます。</li>' +
        '<li>スマホでつなぎます。いちばんかんたんなのは、パソコンで <b>/rc</b> をもう一度入れて、出てくる<b>QRコードを、スマホのカメラで読む</b>方法です。または、Claudeのアプリで「Code」を開きます（画面の下のタブや、左上のメニュー≡の中にあります）。<b>パソコンのマークに、緑の点</b>がついた会話が、いまのパソコンの会話です（公式の案内）。</li>' +
        '<li>スマホから、次の文を送ってみます。「cafe-landing の中に、どんなファイルがあるか教えてください」。パソコンの画面にも、同じ会話が出ます。パソコンは Manual モードなので、許可が必要なときは、スマホでも聞かれます。</li>' +
        '<li>終わったら、パソコンで <b>/rc</b> をもう一度入れて、出てくる画面で、<b>つなぐのをやめる</b>項目（Disconnect など）を選びます。Claude Codeの会話は、そのまま残ります。</li>' +
        '</ol>' +
        '<div class="card goal"><b>おぼえておくこと（公式の案内）</b><br>・<b>パソコンを開いたまま</b>にしておく。ターミナルを閉じると、スマホからも使えなくなる<br>・パソコンがスリープしたり、Wi-Fiが切れたりしても、もどれば<b>自動でつながりなおす</b><br>・Claudeの有料プランでログインしているときに使える（APIキーでは使えない）</div>' +
        '<p class="note">クラウドセッション（前の画面）も、スマホのアプリの「Code」から見られます。こちらは、パソコンを切っていても見られます。</p>',
      help: [
        { q: '「Code」が見つかりません', a: 'アプリを新しい版に更新してください。ブラウザで claude.ai/code を開いても、同じ会話を見られます。' },
        { q: '緑の点がつきません', a: 'パソコンの Claude Code が、動いたままか確かめてください。ターミナルを閉じていたら、もう一度 claude -c で起動して、/rc を入れます。' },
        { q: 'スマホで、許可を聞かれました', a: 'パソコンのときと同じです。内容を読んで、わかるものだけ許可します。' }
      ]
    },
    {
      id: 'i21', kind: 'know', tag: '知っておこう', title: 'どこで、何をする？ と、あと片づけ',
      html:
        '<h2>使い分け</h2>' +
        '<ul class="parts">' +
        '<li><b>VS Code＋Claude Code</b>自分のフォルダ：使える／パソコンを切ると：止まる<br><span>ファイルがふえる、長く続ける作業に</span></li>' +
        '<li><b>デスクトップアプリ</b>自分のフォルダ：使える／パソコンを切ると：止まる<br><span>1回で終わる、ちょっとした作業に</span></li>' +
        '<li><b>クラウドセッション</b>自分のフォルダ：使えない／パソコンを切っても：続く<br><span>時間のかかる作業を、たのんでおくときに</span></li>' +
        '<li><b>スマホ</b>/rc 中は、パソコンの会話を見られる／クラウドの会話も見られる<br><span>出かけた先での確認に</span></li>' +
        '</ul>' +
        '<p class="note">「自分のパソコンのフォルダを使える」と「パソコンを切っても続く」は、ちょうど反対になっています。</p>' +
        '<p class="note">今日は練習用の cafe-landing だけをしまいましたが、作ったスキル（.claude/skills）なども、<b>非公開のリポジトリ</b>にしまえば、バックアップになります。そのときも、個人の情報や「かぎ」が入っていないか、先に確かめます。</p>' +
        '<h2>あと片づけ</h2>' +
        '<ul class="parts">' +
        '<li><b>/rc</b>使わないときは、つなぐのをやめておく<br><span>/rc をもう一度入れて、つなぐのをやめる</span></li>' +
        '<li><b>Claude GitHub App</b>使わなくなったら、外す<br><span>GitHubの「Settings」→「Applications」→「Installed GitHub Apps」→ Claude の「Configure」→ いちばん下の「Uninstall」。同じ画面の「Authorized GitHub Apps」でも、Claude を「Revoke」</span></li>' +
        '<li><b>claude.ai とGitHubのつながり</b>使わなくなったら、切る<br><span>claude.ai/customize/connectors で、GitHub を切る（公式の案内）</span></li>' +
        '<li><b>公開のページ</b>やめたくなったら、止める<br><span>リポジトリの「Settings」→「Pages」→「Unpublish site」</span></li>' +
        '<li><b>GitHub CLIのログイン</b>パソコンを人にゆずるときは、ログアウト<br><span>ターミナルで gh auth logout</span></li>' +
        '</ul>',
      help: [
        { q: 'cafe-landing を、消してもいいですか？', a: 'はい。練習用なので、いらなければ、リポジトリの「Settings」のいちばん下で消せます。消すと、すぐに見えなくなります（公式の案内では、90日以内なら、もどせることもあります）。よく確かめてから、自分で行います。' }
      ]
    },
    {
      id: 'i22', kind: 'know', tag: 'クイズ', title: 'GitHubと、いろいろな場所のクイズ',
      widget: 'quiz',
      quiz: [
        { q: '「コミット」とは？', options: ['いまの状態を、メモをつけて記録すること', 'ファイルを消すこと', 'パスワードを変えること'], answer: 0, explain: 'ゲームの「セーブ」のようなものです。メモがつくので、あとで流れがわかります。' },
        { q: 'パソコンの記録を、GitHubに送ることは？', options: ['クローン', 'プッシュ', 'スター'], answer: 1, explain: 'パソコン → GitHub がプッシュ、GitHub → パソコンに取り出すのがクローンです。' },
        { q: 'フォルダを消してしまいました。GitHubにしまってあれば？', options: ['もう、もどせない', 'クローンで、もどせる', 'パソコンを買いかえる'], answer: 1, explain: 'GitHubに残っているので、クローンで取り出せます。新しいパソコンでも同じです。' },
        { q: 'コミットのメールアドレスは、どうする？', options: ['ふだんのアドレスをそのまま使う', 'GitHubの noreply のアドレスを使う', '友だちのアドレスを使う'], answer: 1, explain: '公開すると、だれでも見られます。GitHubが用意した公開用のアドレスを使います。' },
        { q: 'GitHub Pagesで公開する前に、することは？', options: ['個人の情報や、かぎが入っていないか、自分で確かめる', '何も見ずに公開する', 'AIに全部まかせる'], answer: 0, explain: '公開すると、ファイルもすべて、だれでも見られます。' },
        { q: 'クラウドセッションの、とくちょうは？', options: ['自分のパソコンのフォルダを直接使う', 'インターネットの中のパソコンで動き、ブラウザを閉じても続く', 'スマホでしか使えない'], answer: 1, explain: '公式の案内では、閉じても、パソコンを切っても、作業は続きます。そのかわり、自分のパソコンのフォルダは見えません。' },
        { q: 'Claude GitHub Appを入れるとき、選ぶのは？', options: ['All repositories（全部）', 'Only select repositories で、使うものだけ', '何も読まずに Install'], answer: 1, explain: 'つなぐ範囲は、使うリポジトリだけにします。' },
        { q: 'PR（プルリクエスト）とは？', options: ['「こう変えたいです」という提案', 'ページを消すボタン', 'パスワードの別名'], answer: 0, explain: 'マージするかどうかは、中身を見て、自分で決めます。' },
        { q: 'リモートコントロール（/rc）で、スマホから使うときは？', options: ['パソコンを切っておく', 'パソコンの Claude Code を動かしたままにする', 'ターミナルを閉じる'], answer: 1, explain: '作業はパソコンの中で行われるので、ターミナルを閉じると、スマホからも使えなくなります。' }
      ],
      html: '<p>おぼえたことを、クイズで確かめましょう。選ぶと、答えが出ます。点数は、つけません。</p>',
      help: [
        { q: 'まちがえました', a: '大丈夫です。もう一度、前の画面を見て、もどってみてください。何度でも、やりなおせます。' }
      ]
    },
    {
      id: 'i23', kind: 'check', tag: '確認', title: 'おわりの確認',
      widget: 'checks',
      checks: [
        'GitHubのアカウントを作って、gh でログインした',
        'コミットのメールアドレスを、noreply にした',
        'カフェのページを、非公開のリポジトリにしまった',
        'フォルダを消して、クローンでもどせた',
        '中身を確かめてから、GitHub Pagesで公開した',
        'デスクトップアプリで、agent1 をつないで頼めた',
        'クラウドセッションで直してもらい、自分でマージした',
        'スマホから、/rc でパソコンの会話を見た（できた人だけ）',
        'markitdown をためした（できた人だけ）'
      ],
      required: 7,
      html:
        '<p>できたことに、チェックを入れてください。<b>上の7つ</b>に入ると、「完了にする」を押せます。下の2つは、できた人だけです。</p>' +
        '<h2>ふりかえり：ここまでで、できるようになったこと</h2>' +
        '<ul class="parts">' +
        '<li><b>レッスン1〜2</b>道具を入れて、AIにファイルを作ってもらう<br><span>CLAUDE.md で、おぼえてもらう</span></li>' +
        '<li><b>レッスン3〜4</b>安全な設定と、会話の管理<br><span>許可・/clear・裏で動かす作業</span></li>' +
        '<li><b>レッスン5〜6</b>作業を分ける・自動のルール・外のサービス<br><span>サブエージェント・フック・コネクタ</span></li>' +
        '<li><b>レッスン7〜8</b>くり返しをスキルに、作品を保存して公開<br><span>スキル・プラグイン・GitHub・クラウド・スマホ</span></li>' +
        '</ul>' +
        '<p class="note">これで、この教材のレッスンは、すべておしまいです。わからなくなったら、いつでも、前のレッスンにもどって、見なおしてください。</p>',
      help: [
        { q: 'できなかったところがあります', a: 'そのステップに戻って、「困ったとき」を見てください。何度でもやり直せます。' }
      ]
    }
  ];

  var lesson8 = {
    id: 'l8', no: 8, needsPc: true, ready: true, minutes: 150,
    title: '作品の保存と公開、スマホで続きを見る',
    short: 'GitHubにページをしまって、消してもクローンでもどす。中身を確かめてから公開する。デスクトップアプリ・クラウドセッション・スマホからも頼む',
    devices: 'PC＋スマホ（スマホはなくてもOK）',
    doneCard: '<b>レッスン8　完了です。おつかれさまでした。</b><br>作ったものをGitHubにしまって公開し、デスクトップアプリ・クラウド・スマホからも、Claudeに頼めるようになりました。<b>これで、全部のレッスンが終わりです。</b>',
    steps: steps
  };

  for (var i = 0; i < C.lessons.length; i++) {
    if (C.lessons[i].id === 'l8') { C.lessons[i] = lesson8; break; }
  }
})();
