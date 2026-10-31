/* レッスン5：作業を分ける（サブエージェント）・自動のルール（フック）・Office（任意）
   内容は2026-10-31に公式の案内で確認：
   Claude Code：sub-agents、hooks、hooks-guide、commands、costs ／ Claude for Microsoft 365：claude.com/docs/office-agents
   ・サブエージェント＝自分の机（コンテキスト）で作業して、結果だけ返す助手。組み込みは Explore（読むだけ・調べもの）、Plan、general-purpose など
   ・名前を書いてお願いすれば使われる。いくつも同時に動かせる。メインの会話から始めたものは、ふつう裏（バックグラウンド）で動く
   ・サブエージェントは、さらにサブエージェントを使える（標準で、メインの会話から3段まで）
   ・動いているものは入力欄の下の一覧に出る（↑↓で選んでEnter＝中を見る・話しかける、Esc＝もどる）。終わると一覧から消え、30秒のあいだ /tasks から開ける
   ・自分のサブエージェント＝ .claude/agents/名前.md（name と description が必須。tools などは任意）。/agents は、いまは作り方の案内を出すだけ
   ・新しく agents フォルダを作ったときは、Claude Codeを起動しなおすと読みこまれる
   ・サブエージェントの作業も、使用量に数えられる
   ・フック＝決まったときに、かならず動くコマンド。settings.json の "hooks" に書く。/hooks は見るだけ
   ・args を書く形（exec form）は、シェルを通さずにプログラムを直接動かす → Windows（PowerShell）でもMacでも同じ書き方にできる
   ・UserPromptSubmit（お願いを送ったとき）、PostToolUse（道具を使ったあと）、Stop（答え終わったとき）
   ・{"decision":"block","reason":…}：UserPromptSubmit はお願いを止める。Stop は終わらせずに続けさせる（stop_hook_active で1回だけにする）
   ・フックは、あなたの権限で、なんでも実行できる。中身を確かめたものだけ入れる
   ・Claude for Excel・Word・PowerPoint：Pro・Max・Team・Enterprise。Windows（Microsoft 365）、Mac（16.46以上。Wordは16.61以上）、Web。2016・2019の買い切り版とiPadは対象外 */
(function () {
  'use strict';
  var C = window.COURSE;
  var cmd = C.cmd, box = C.copybox, os = C.os, osBlock = C.osBlock;

  var HELP_APPROVE = {
    q: 'AIが「許可しますか？」と聞いてきました',
    a: 'AIが、ファイルを作る・直す・コマンドを実行するなどの前に、「やってもいいですか？」と聞いてきます。画面に出ている内容を読んで、練習用の agent1 フォルダの中のことなら、「はい(Yes)」を選びます。矢印キー（↑↓）で選んで、Enterキーを押します。'
  };
  var HELP_ENG = { q: 'ターミナルの文字が英語です', a: '大丈夫です。表示が英語でも、やることは同じです。' };
  var HELP_RESTART = {
    q: '起動しなおすには？',
    a: 'Claude Codeの入力欄に <b>/exit</b> と入れて、Enterキーを押します。ターミナルの行（「PS …&gt;」や「… %」）にもどったら、<b>claude</b> と入れて、Enterキーを押します。'
  };
  var HELP_NOFILE = {
    q: 'schedule.txt などのファイルがありません',
    a: 'レッスン2で作ったファイルです。ないときは、「schedule.txt、budget.txt、packing.txt を、練習用に、短い内容で作ってください」とお願いしてから、もう一度やってみてください。'
  };

  /* フックの道具（Python）。中身は、学ぶ人が目で確かめられるように、短くしてある */
  var HOOK_PY =
    '# レッスン5の練習用のフック（agent1 の中だけで使います）\n' +
    'import sys, json, os, datetime\n' +
    '\n' +
    'mode = sys.argv[1] if len(sys.argv) > 1 else \'\'\n' +
    'data = json.loads(sys.stdin.buffer.read() or b\'{}\')\n' +
    '\n' +
    'if mode == \'prompt\':\n' +
    '    # お願いの文に「パスワード」があったら、AIに届く前に止める\n' +
    '    if \'パスワード\' in data.get(\'prompt\', \'\'):\n' +
    '        print(json.dumps({\'decision\': \'block\', \'reason\': \'パスワードは、AIに書きません。このお願いは、フックが止めました。\'}))\n' +
    'elif mode == \'log\':\n' +
    '    # AIがファイルを作った・直したら、tool-log.txt に1行書く\n' +
    '    name = os.path.basename(data.get(\'tool_input\', {}).get(\'file_path\', \'\'))\n' +
    '    folder = os.environ.get(\'CLAUDE_PROJECT_DIR\') or data.get(\'cwd\') or \'.\'\n' +
    '    with open(os.path.join(folder, \'tool-log.txt\'), \'a\', encoding=\'utf-8\') as f:\n' +
    '        f.write(datetime.datetime.now().strftime(\'%H:%M:%S\') + \' \' + data.get(\'tool_name\', \'\') + \' \' + name + \'\\n\')\n' +
    'elif mode == \'stop\':\n' +
    '    # 答え終わる前に、1回だけ、ひとことのまとめを頼む\n' +
    '    if not data.get(\'stop_hook_active\'):\n' +
    '        print(json.dumps({\'decision\': \'block\', \'reason\': \'終わる前に、いまの答えを、1行でまとめてください。\'}))\n';

  /* settings.json の中身（レッスン3の内容＋フック）。Windowsは python、Macは python3 */
  function settings(isMac, parts) {
    function hook(mode) {
      return { type: 'command', command: isMac ? 'python3' : 'python', args: ['${CLAUDE_PROJECT_DIR}/.claude/hooks/lesson5.py', mode] };
    }
    var h = {};
    if (parts.indexOf('prompt') >= 0) h.UserPromptSubmit = [{ hooks: [hook('prompt')] }];
    if (parts.indexOf('log') >= 0) h.PostToolUse = [{ matcher: 'Write|Edit', hooks: [hook('log')] }];
    if (parts.indexOf('stop') >= 0) h.Stop = [{ hooks: [hook('stop')] }];
    return JSON.stringify({ permissions: { defaultMode: 'manual', deny: ['Read(./secret.txt)'] }, hooks: h }, null, 2);
  }
  function settingsBox(parts) {
    return osBlock(box(settings(false, parts)), box(settings(true, parts)));
  }
  function REPLACE(parts) {
    return '<li>VS Codeの左側で、<b>.claude</b> フォルダの中の <b>settings.json</b> をクリックして開きます（レッスン3で作ったファイルです）。</li>' +
    '<li>中身を全部えらんで（' + os('Ctrlキー', '⌘（Command）キー') + 'とAキー）、下の「コピー」で写したものを、貼り付けます（' + os('Ctrlキー', '⌘（Command）キー') + 'とVキー）。<b>中身が、まるごと入れかわります。</b>' + settingsBox(parts) + '</li>' +
    '<li>' + os('Ctrlキー', '⌘（Command）キー') + 'とSキーで、保存します。</li>' +
    '<li>Claude Codeを、<b>起動しなおします</b>（<b>/exit</b> → <b>claude</b>）。</li>';
  }

  var WORD_CHECKER =
    '---\n' +
    'name: word-checker\n' +
    'description: 文章が、やさしい言葉で書かれているか確かめる係。文章のチェックを頼まれたときに使う。\n' +
    'tools: Read, Glob, Grep\n' +
    '---\n' +
    'あなたは、文章のチェック係です。\n' +
    '・頼まれたファイルを読んで、むずかしい言葉や、長すぎる文を見つけます。\n' +
    '・見つけたものを、多くても5つ、「元の言葉 → やさしい言いかえ」の形で、箇条書きにします。\n' +
    '・ファイルは、直しません。読むだけです。\n';

  var steps = [
    {
      id: 'e1', kind: 'sample', tag: '今日のゴール', title: 'レッスン5で、できるようになること',
      html:
        '<p class="note warn"><b>このレッスンは、WindowsかMacのパソコンが必要です。</b>レッスン4が終わっている人向けです。画面の右上の「Windows／Mac」ボタンで、ご自分のパソコンのほうを選んでください。</p>' +
        '<p>これまでは、AIが1人で、全部の作業をしていました。今日は、AIに<b>手分け</b>をしてもらう方法と、「こうなったら、かならずこうする」という<b>自動のルール</b>を、学びます。</p>' +
        '<div class="card goal"><b>ゴール</b><br>① 作業を、<b>サブエージェント</b>（手伝いのAI）に任せる・同時に動かす・自分で作る<br>② <b>フック</b>（決まったときに、かならず動く仕組み）を、3つ動かす<br>③ （任意）エクセル・ワード・パワーポイントの中で、Claudeを使う</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>かかる時間</dt><dd>約1時間30分（休みながらでOK）</dd>' +
        '<dt>つかうもの</dt><dd>VS Code、agent1フォルダ、Claude Code、Python（レッスン2で入れたもの）</dd>' +
        '<dt>おまけ（任意）</dt><dd>Microsoft Office（エクセル・ワード・パワーポイント）がある人だけ</dd>' +
        '</dl></div>' +
        '<p class="note">サブエージェントも、AIとして動くので、<b>使用量（プランの上限）に数えられます</b>（公式の案内）。今日の練習は、小さな作業だけにしています。</p>' +
        '<p class="note warn">練習は、<b>agent1 フォルダの中だけ</b>で行います。本当の個人情報は、会話に入れません。</p>',
      help: [
        { q: 'レッスン4が終わっていません', a: '先に、レッスン4を終わらせてください。裏で動かす作業（バックグラウンド）と /tasks を、このレッスンでも使います。' },
        { q: 'Pythonが入っていません', a: 'レッスン2の「Pythonを入れる」の画面で、入れてください。フックの練習で使います。' }
      ]
    },
    {
      id: 'e2', kind: 'pc', tag: 'PCで操作', title: 'おさらい：Claude Codeを、起動する',
      html:
        '<ol>' +
        '<li>VS Codeで、<b>agent1</b> フォルダを開きます。</li>' +
        '<li>「ターミナル」→「新しいターミナル」を選びます。</li>' +
        '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。' + cmd('claude') + '</li>' +
        '<li>画面の下の行が <b>manual mode on</b> になっているか、見ます。ちがうときは、Shift+Tabを押して、<b>manual</b> にします。</li>' +
        '</ol>' +
        '<p class="note">このレッスンでも、何回か起動しなおします。起動するたびに、下の行を見る習慣を、つづけましょう。</p>',
      help: [
        { os: 'win', q: '「認識されません」と出ました', a: 'VS Codeを、いったん完全に閉じて、もう一度開いて、新しいターミナルで試してください。' },
        { os: 'mac', q: '「command not found」と出ました', a: 'VS Codeを、⌘（Command）キーとQキーで、いったん完全に終了して、もう一度開いて、新しいターミナルで試してください。' },
        HELP_ENG
      ]
    },
    {
      id: 'e3', kind: 'know', tag: '知っておこう', title: '「サブエージェント」って、なに？',
      html:
        '<p><b>サブエージェント</b>は、メインのAIが、仕事を<b>手分け</b>するときに呼ぶ、<b>手伝いのAI</b>です。</p>' +
        '<ul class="parts">' +
        '<li><b>自分の机で、作業する</b>サブエージェントは、<b>別の机</b>（コンテキスト）を使います。<br><span>調べるときに読んだ、たくさんの資料は、メインの机に、広がらない</span></li>' +
        '<li><b>結果だけを、返す</b>終わったら、まとめだけを、メインのAIに渡します。<br><span>メインの机が、すっきりしたまま（レッスン4の「机の広さ」の話です）</span></li>' +
        '<li><b>同時に、動ける</b>いくつかの調べものを、同時に進められます。<br><span>ふつうは、裏（バックグラウンド）で動きます</span></li>' +
        '</ul>' +
        '<p>Claude Codeには、はじめから、何人かの「手伝い」がいます。たとえば、<b>Explore</b>（エクスプロア）は、ファイルを<b>読むだけ</b>で、調べものをする係です。</p>' +
        '<p class="note">サブエージェントの作業も、使用量に数えられます。たくさん同時に動かすと、そのぶん多く使います（公式の案内）。「手分けすると、得になる」とは、かぎりません。</p>',
      help: [
        { q: 'どんなときに使いますか？', a: '「たくさん読まないといけない調べもの」や、「おたがいに関係ない作業が、いくつかある」ときに、向いています。すぐ終わる、かんたんなお願いは、ふつうに頼むほうが速いです。' }
      ]
    },
    {
      id: 'e4', kind: 'pc', tag: 'PCで操作', title: '調べものを、サブエージェントに任せる',
      html:
        '<p>名前を書いて頼むと、そのサブエージェントが使われます（公式の案内）。読むだけの係、<b>Explore</b> に、agent1 フォルダの中を調べてもらいます。</p>' +
        '<ol>' +
        '<li>下の「コピー」を押して、入力欄に貼り付けて、Enterキーを押します。</li>' +
        '<li>画面に、<b>Explore(…)</b> のような行が出たら、サブエージェントが動いています。</li>' +
        '<li>少し待つと、まとめが届きます。5行のまとめが出たら、成功です。</li>' +
        '</ol>' +
        box('Explore サブエージェントを使って、agent1 フォルダの中に、どんなファイルがあるかを調べてください。結果は、5行でまとめてください。') +
        '<p class="note">サブエージェントは、ふつう、裏（バックグラウンド）で動きます。待っているあいだも、入力欄は使えます。</p>',
      help: [
        { q: 'Explore の行が出ません', a: 'AIが、自分で読むほうが早い、と判断することもあります。まとめが出れば、大丈夫です。もう一度、「かならず、Explore サブエージェントを使ってください」と頼んでみても、かまいません。' },
        HELP_APPROVE
      ]
    },
    {
      id: 'e5', kind: 'pc', tag: 'PCで操作', title: 'サブエージェントを、3つ同時に動かす',
      html:
        '<p>おたがいに関係ない作業は、<b>同時に</b>進められます。レッスン2で作った3つのファイルを、3つのサブエージェントで、同時に読んでもらいます。</p>' +
        '<ol>' +
        '<li>下の「コピー」を押して、入力欄に貼り付けて、Enterキーを押します。</li>' +
        '<li>サブエージェントの行が、<b>3つ</b>出るのを、見ます。</li>' +
        '<li>最後に、3つのまとめの表が出たら、成功です。</li>' +
        '</ol>' +
        box('サブエージェントを3つ同時に使って、schedule.txt、budget.txt、packing.txt を、1つずつ読んでください。それぞれの中身を1行でまとめて、最後に表にしてください。') +
        '<p class="note">公式の案内では、たくさん同時に動かしすぎると、上限で止まります（標準で20まで）。今日は3つだけです。</p>',
      help: [HELP_NOFILE, HELP_APPROVE]
    },
    {
      id: 'e6', kind: 'pc', tag: 'PCで操作', title: 'サブエージェントの「中」を見る',
      html:
        '<p>サブエージェントが、何を読んで、どう考えたかは、<b>中の記録</b>（作業の記録）を開くと、見られます。</p>' +
        '<ol>' +
        '<li>もう一度、前の画面のお願いを、貼り付けて、Enterキーを押します。</li>' +
        '<li>動いているあいだ、入力欄の<b>下</b>に、サブエージェントの一覧が出ます。<b>↓</b>キーで1つ選んで、Enterキーを押すと、その中の記録が開きます。</li>' +
        '<li>開いた画面で、話しかけることもできます。たとえば「読んだファイルの名前を、もう一度教えてください」と入れて、Enterキーを押します。</li>' +
        '<li><b>Esc</b>キーで、メインの会話にもどります。</li>' +
        '</ol>' +
        '<h2>もう終わってしまったときは</h2>' +
        '<p>サブエージェントは、終わると一覧から消えます。公式の案内では、終わってから<b>30秒のあいだ</b>は、<b>/tasks</b> で開けます。</p>' +
        cmd('/tasks') +
        '<p class="note">画面の見た目は、版によって、少しちがいます。中の記録が見られたら、成功です。</p>',
      help: [
        { q: '一覧が出ません／すぐ消えます', a: '読むファイルが短いので、すぐ終わることがあります。終わったら、すぐに /tasks を入れてみてください。それでも見られないときは、この画面は、読むだけでかまいません。' },
        { q: '話しかけた言葉は、どこに行きますか？', a: '記録を開いているあいだは、その<b>サブエージェント</b>に届きます。「/」で始まる命令は、メインの会話に届きます（公式の案内）。' },
        { q: '画面を閉じたいです', a: 'Escキー（キーボードの左上）を押すと、メインの会話にもどります。' }
      ]
    },
    {
      id: 'e7', kind: 'pc', tag: 'PCで操作', title: 'サブエージェントが、さらに手分けする',
      html:
        '<p>サブエージェントは、自分も、サブエージェントを呼べます。公式の案内では、標準で、メインの会話から<b>3段</b>まで、つなげられます。</p>' +
        '<ol>' +
        '<li>下の「コピー」を押して、入力欄に貼り付けて、Enterキーを押します。</li>' +
        '<li>入力欄の下の一覧に、サブエージェントが<b>木の枝のように</b>並んで出ることがあります。</li>' +
        '<li>最後に、2つのファイルのまとめが出たら、成功です。</li>' +
        '</ol>' +
        box('サブエージェントを1つ使ってください。そのサブエージェントには、さらにサブエージェントを2つ使わせて、CLAUDE.md と packing.txt を1つずつ読ませてください。最後に、それぞれの中身を1行でまとめて、教えてください。') +
        '<p class="note">AIが、「手分けしなくても、すぐ読める」と判断して、段を作らないこともあります。まとめが出れば、大丈夫です。手分けを重ねるほど、使用量も増えます。</p>',
      help: [HELP_NOFILE, HELP_APPROVE]
    },
    {
      id: 'e8', kind: 'know', tag: '知っておこう', title: '自分だけの、サブエージェント',
      html:
        '<p>決まった仕事を、いつも同じやり方でしてほしいときは、<b>自分のサブエージェント</b>を作れます。中身は、<b>1つのファイル</b>です。</p>' +
        '<ul class="parts">' +
        '<li><b>置き場所</b>agent1 の中の <b>.claude/agents</b> フォルダ<br><span>このフォルダの中だけで使えます</span></li>' +
        '<li><b>上の部分</b>「---」で、はさんだところ<br><span>name（名前）と description（いつ使うか）が、必要です。AIは description を読んで、どの係を使うか決めます。tools（使ってよい道具）は、書かなくても大丈夫です</span></li>' +
        '<li><b>下の部分</b>ふつうの文章<br><span>その係への、仕事の説明（取扱説明書）</span></li>' +
        '</ul>' +
        '<p>今日は、文章を読んで、<b>むずかしい言葉を見つける係</b>を作ります。ファイルを直さないように、道具は「読む」系（Read など）だけにします。</p>' +
        '<p class="note">公式の案内では、/agents と入れると、いまの版では、作り方の案内が出ます。今日は、自分でファイルを作ります。</p>',
      help: [
        { q: 'CLAUDE.md と、何がちがいますか？', a: 'CLAUDE.mdは、メインのAIが、毎回読む「取扱説明書」です。サブエージェントのファイルは、その<b>係だけ</b>が読む、仕事の説明です。' }
      ]
    },
    {
      id: 'e9', kind: 'pc', tag: 'PCで操作', title: '「言葉のチェック係」を作る',
      html:
        '<ol>' +
        '<li>VS Code左側のファイル一覧の、<b>何もないところ</b>で、' + os('右クリック', 'Controlキーを押しながらクリック（または2本指でクリック）') + 'して、「新しいファイル」を選びます。</li>' +
        '<li>名前の欄に、次のとおり入力して、Enterキーを押します（英字の入力で。下の「コピー」で写して、貼り付けてもOKです）。' + cmd('.claude/agents/word-checker.md') + '</li>' +
        '<li>空のファイルが開きます。下の「コピー」を押して、中に貼り付けます。</li>' +
        '<li>' + os('Ctrlキー', '⌘（Command）キー') + 'とSキーで、保存します。</li>' +
        '<li>新しいフォルダ（agents）を作ったので、Claude Codeを<b>起動しなおします</b>（<b>/exit</b> → <b>claude</b>）。公式の案内では、新しく作ったフォルダは、起動しなおすと読みこまれます。</li>' +
        '</ol>' +
        box(WORD_CHECKER) +
        '<p class="note">「tools: Read, Glob, Grep」は、「読む・さがす」道具だけを使ってよい、という意味です。この係は、ファイルを書きかえられません。</p>',
      help: [
        { q: '.claude フォルダが、見えません', a: 'VS Codeの左側に、出ているはずです。ない場合は、名前の欄に <b>.claude/agents/word-checker.md</b> と入れると、フォルダもいっしょに作られます。' },
        { q: '「---」の行は、消してもいいですか？', a: '消さないでください。「---」ではさんだ部分が、名前と使いどころの設定です。' },
        HELP_RESTART
      ]
    },
    {
      id: 'e10', kind: 'pc', tag: 'PCで操作', title: '「言葉のチェック係」に、頼む',
      html:
        '<ol>' +
        '<li>まず、<b>名前を言って</b>頼みます。下の「コピー」を押して、入力欄に貼り付けて、Enterキーを押します。' + box('word-checker サブエージェントを使って、mail-draft.txt に、むずかしい言葉がないか、チェックしてください。') + '</li>' +
        '<li><b>word-checker</b> の行が出て、「元の言葉 → やさしい言いかえ」のリストが出たら、成功です。</li>' +
        '<li>次に、<b>名前を言わずに</b>頼みます。' + box('packing.txt に、むずかしい言葉がないか、見てください。') + '</li>' +
        '<li>また <b>word-checker</b> の行が出たら、AIが、係のファイルの description（文章のチェックを頼まれたときに使う）を読んで、<b>自分で係を選んだ</b>ということです。</li>' +
        '</ol>' +
        '<p class="note">AIが、係を使わずに、自分で答えることもあります。そのときは、description を「文章のチェックを頼まれたら、かならず使う」のように、はっきり書くと、選ばれやすくなります。</p>' +
        '<p class="note">入力欄で <b>@</b> と打つと、使える係の一覧が出ます。そこから word-checker を選ぶと、その係が、かならず使われます（公式の案内）。</p>' +
        '<p class="note">直すかどうかは、<b>自分で</b>決めます。直したいときは、ふつうに「この言いかえで、mail-draft.txt を直してください」と頼みます。</p>',
      help: [
        { q: 'mail-draft.txt がありません', a: 'レッスン2で作ったファイルです。ないときは、ほかの文章のファイル（packing.txt など）の名前に、変えて頼んでください。' },
        { q: 'word-checker が見つからない、と言われます', a: 'ファイルの場所（.claude/agents/word-checker.md）と、いちばん上の「---」の部分を、確かめてください。そのあと、Claude Codeを起動しなおします。' },
        HELP_RESTART
      ]
    },
    {
      id: 'e11', kind: 'know', tag: '知っておこう', title: '「フック」って、なに？',
      html:
        '<p><b>フック</b>は、「<b>〇〇のときは、かならず、△△する</b>」という、<b>自動のルール</b>です。決まったときに、決まったプログラムが、かならず動きます。</p>' +
        '<ul class="parts">' +
        '<li><b>CLAUDE.md</b>AIへの「お願い」<br><span>だいたい守るが、100%ではない（レッスン2）</span></li>' +
        '<li><b>フック</b>パソコンが、かならず動かすルール<br><span>AIが忘れても、動く</span></li>' +
        '</ul>' +
        '<h2>今日つかう、3つの「とき」</h2>' +
        '<ul class="parts">' +
        '<li><b>UserPromptSubmit</b>お願いを送ったとき<br><span>①「パスワード」という言葉を、止める</span></li>' +
        '<li><b>PostToolUse</b>AIが道具を使ったあと<br><span>② ファイルを作った・直した記録を、残す</span></li>' +
        '<li><b>Stop</b>AIが答え終わったとき<br><span>③ 終わる前に、ひとことのまとめを頼む</span></li>' +
        '</ul>' +
        '<p class="note">ほかにも、「会話を始めたとき」「道具を使う前」など、たくさんの「とき」があります（公式の案内）。</p>',
      help: [
        { q: 'なぜ「フック」と言うのですか？', a: '「引っかける」という意味です。決まった「とき」に、自分のプログラムを、引っかけておくイメージです。' }
      ]
    },
    {
      id: 'e12', kind: 'know', tag: '知っておこう', title: 'フックを使うときの、安全のルール',
      html:
        '<p class="note warn">公式の案内では、フックは、<b>あなたのパソコンの権限で、なんでも実行できます</b>。ファイルを消すことも、できてしまいます。</p>' +
        '<ul class="parts">' +
        '<li><b>① 中身を確かめたものだけ</b>この教材のものか、自分で読んで、意味がわかったものだけ<br><span>ネットで見つけたフックを、そのまま入れない</span></li>' +
        '<li><b>② 練習は agent1 の中だけ</b>今日は、agent1 の .claude フォルダに書きます<br><span>ほかのフォルダには、効きません</span></li>' +
        '<li><b>③ 終わったら、片づける</b>練習用のフックは、最後に外します<br><span>残すのは、「パスワード」を止めるものだけ</span></li>' +
        '</ul>' +
        '<p>どんなフックが入っているかは、Claude Codeの入力欄に <b>/hooks</b> と入れると、<b>見るだけ</b>の一覧で確かめられます。</p>',
      help: [
        { q: 'フックは、AIが勝手に作りますか？', a: 'このレッスンでは、自分でファイルに書きます。AIに頼んで作ってもらうこともできますが、そのときも、中身を自分で確かめてから使います。' }
      ]
    },
    {
      id: 'e13', kind: 'pc', tag: 'PCで操作', title: 'フックの「道具」を、用意する',
      html:
        '<p>3つのフックは、同じ1つの小さなプログラム（Python）を使います。中を読むと、何をするか、わかるように書いてあります（「#」の行は、説明です）。</p>' +
        '<ol>' +
        '<li>VS Code左側のファイル一覧の、<b>何もないところ</b>で、' + os('右クリック', 'Controlキーを押しながらクリック') + 'して、「新しいファイル」を選びます。</li>' +
        '<li>名前の欄に、次のとおり入れて、Enterキーを押します。' + cmd('.claude/hooks/lesson5.py') + '</li>' +
        '<li>空のファイルが開きます。下の「コピー」を押して、中に貼り付けて、' + os('Ctrlキー', '⌘（Command）キー') + 'とSキーで保存します。</li>' +
        '</ol>' +
        box(HOOK_PY) +
        '<p class="note">このプログラムがするのは、①お願いの文に「パスワード」があれば止める、②作った・直したファイルの名前を tool-log.txt に書く、③答え終わる前に1回だけ、まとめを頼む、の3つだけです。</p>',
      help: [
        { q: '貼り付けたら、字下げ（左の空白）が、ずれました', a: 'Pythonは、左の空白も、大事な意味を持ちます。全部消して、もう一度「コピー」から貼り付けてください。' },
        { q: 'VS Codeが、「Pythonの拡張機能」をすすめてきます', a: '入れなくても、大丈夫です。右下の知らせは、閉じてかまいません。' }
      ]
    },
    {
      id: 'e14', kind: 'pc', tag: 'PCで操作', title: 'フック①「パスワード」を、止める',
      html:
        '<p>お願いを送ったとき（<b>UserPromptSubmit</b>）に、文の中に「パスワード」があれば、<b>AIに届く前に止める</b>フックです。</p>' +
        '<ol>' + REPLACE(['prompt']) +
        '<li>次のお願いを、送ってみます。<b>本物のパスワードは、入れません。</b>' + box('練習です。パスワードという言葉が入った文を、送ってみます。') + '</li>' +
        '<li>「パスワードは、AIに書きません。このお願いは、フックが止めました。」と出て、AIが答えなければ、成功です。</li>' +
        '</ol>' +
        '<p class="note">settings.json の新しい中身には、レッスン3で書いた「Manual で始める」と「secret.txt を読まない」も、そのまま入っています。<b>"hooks"</b> の部分が、今回ふえたところです。</p>' +
        '<p class="note warn">公式の案内では、止めたお願いの文も、パソコンの中の会話の記録には残ります。このフックは、「うっかり送るのを止める」ためのもので、秘密を守る金庫ではありません。</p>',
      help: [
        { q: '止まりません', a: '① settings.json を保存したか ② 起動しなおしたか ③ lesson5.py の場所が .claude/hooks/ か、を確かめてください。それでもだめなら、/hooks と入れて、UserPromptSubmit が一覧にあるか見てください。' },
        { q: '「hook error」のような表示が出ました', a: 'Pythonが動かなかったときに出ます。ターミナルで ' + os('<b>python --version</b>', '<b>python3 --version</b>') + ' が動くか、確かめてください（レッスン2）。lesson5.py の中身を、もう一度貼り付けなおすのも、ためしてください。' },
        { q: 'settings.json が、ありません', a: 'レッスン3で作ったファイルです。ないときは、レッスン3の「設定ファイルを、自分で書く」の画面と同じやり方で、.claude/settings.json を作って、上の中身を貼り付けます。' },
        HELP_RESTART
      ]
    },
    {
      id: 'e15', kind: 'pc', tag: 'PCで操作', title: 'フック② 道具の記録を、残す',
      html:
        '<p>AIが道具を使ったあと（<b>PostToolUse</b>）に動くフックです。ファイルを作った（Write）・直した（Edit）ときだけ、<b>tool-log.txt</b> に、時刻と、道具と、ファイル名を1行書きます。</p>' +
        '<ol>' + REPLACE(['prompt', 'log']) +
        '<li>次のお願いを送ります。許可を聞かれたら、内容を見て「はい(Yes)」を選びます。' + box('hook-test.txt という名前のファイルを作って、「フックの練習です」と1行だけ書いてください。') + '</li>' +
        '<li>VS Codeの左側に、<b>tool-log.txt</b> がふえます。開いて、「（時刻） Write hook-test.txt」のような行があれば、成功です。</li>' +
        '</ol>' +
        '<p class="note">"PostToolUse" の部分が、ふえました。"matcher": "Write|Edit" は、「Write か Edit のときだけ」という意味です。</p>',
      help: [
        { q: 'tool-log.txt が、できません', a: '起動しなおしたか、確かめてください。そのあと、もう一度、ファイルを作るお願いをしてみてください。' },
        { q: 'tool-log.txt は、AIが書いたのですか？', a: 'いいえ。フック（パソコン）が書きました。AIは、このファイルのことを知りません。だから、AIが忘れても、記録は残ります。' },
        HELP_APPROVE,
        HELP_RESTART
      ]
    },
    {
      id: 'e16', kind: 'pc', tag: 'PCで操作', title: 'フック③ 終わる前に、ひとこと',
      html:
        '<p>AIが答え終わったとき（<b>Stop</b>）に動くフックです。AIが終わろうとすると、「<b>終わる前に、1行でまとめてください</b>」と頼み返して、もう少しだけ続けさせます。</p>' +
        '<ol>' + REPLACE(['prompt', 'log', 'stop']) +
        '<li>次のお願いを送ります。' + box('秋においしい果物を、3つ教えてください。') + '</li>' +
        '<li>答えのあとに、<b>Stop hook</b> のような表示が出て、AIが<b>1行のまとめ</b>を書き足したら、成功です。</li>' +
        '</ol>' +
        '<p class="note">プログラムの中の <b>stop_hook_active</b> は、「もう1回続けたあとか」を表します。これを見て、<b>1回だけ</b>にしています。見ないと、AIが、いつまでも終われなくなります（公式の案内）。</p>' +
        '<p class="note">答えるたびに、まとめが1回ふえるので、使用量も少しふえます。次の画面で、外します。</p>',
      help: [
        { q: 'まとめが、出ません', a: '起動しなおしたか、確かめてください。/hooks と入れて、Stop が一覧にあるかも、見てください。' },
        { q: 'いつまでも、終わりません', a: 'Escキーを押して、止めます。lesson5.py の中身を、もう一度「コピー」から貼り付けなおしてください（stop_hook_active の行が、大事です）。' },
        HELP_RESTART
      ]
    },
    {
      id: 'e17', kind: 'pc', tag: 'PCで操作', title: 'フックを、見て、片づける',
      html:
        '<ol>' +
        '<li>Claude Codeの入力欄に、<b>/hooks</b> と入れて、Enterキーを押します。' + cmd('/hooks') + '</li>' +
        '<li>UserPromptSubmit、PostToolUse、Stop の3つが、一覧にあるのを見ます。<b>Esc</b>キーで閉じます。</li>' +
        '<li>練習用の②と③を、外します。settings.json の中身を、下のもの（①だけ）に、まるごと入れかえて、保存します。' + settingsBox(['prompt']) + '</li>' +
        '<li>Claude Codeを、起動しなおします（<b>/exit</b> → <b>claude</b>）。</li>' +
        '<li>もう一度 <b>/hooks</b> を見て、<b>UserPromptSubmit だけ</b>になっていれば、成功です。</li>' +
        '</ol>' +
        '<p class="note">「パスワード」を止めるフック①は、残しておきます。いらなくなったら、settings.json から "hooks" の部分を消せば、外れます。</p>',
      help: [
        { q: '/hooks の画面で、追加や削除ができません', a: '公式の案内では、/hooks は<b>見るだけ</b>の画面です。追加や削除は、settings.json を直して行います。' },
        { q: 'tool-log.txt や hook-test.txt は、どうしますか？', a: '練習で作ったファイルです。残しておいても、消してもかまいません。' },
        HELP_RESTART
      ]
    },
    {
      id: 'e18', kind: 'pc', tag: '任意', title: 'エクセル・ワード・パワーポイントで、Claudeを使う（Officeがある人だけ）',
      html:
        '<p class="note"><b>この画面は、「任意」です。</b>Microsoft Office がない人は、「次へ」で、飛ばしてください。</p>' +
        '<p>エクセル・ワード・パワーポイントの<b>中</b>で、Claudeに話しかけられる「アドイン」（追加の部品）があります。公式の名前は、<b>Claude for Microsoft 365</b> です。</p>' +
        '<div class="card goal"><b>使える条件（公式の案内）</b><br>・Claudeの有料プラン（Pro・Max・Team・Enterprise）<br>・' + os('Windowsの、Microsoft 365（サブスクリプション）のOffice', 'Macの、新しいOffice（エクセル・パワーポイントは16.46以上、ワードは16.61以上）') + '、または、ブラウザのOffice（Web版）<br>・2016年版・2019年版の買い切りのOfficeと、iPadは、使えません</div>' +
        '<ol>' +
        '<li>ブラウザで、Microsoftの公式のページ <a href="https://marketplace.microsoft.com/en-us/product/office/WA200010725" target="_blank" rel="noopener noreferrer">Claude for Microsoft 365</a> を開きます。</li>' +
        '<li>「Get it now」（今すぐ入手）を押します。Microsoftへのログインは、<b>ご自分で</b>行います。</li>' +
        '<li>エクセルを開いて、' + os('「ホーム」タブの「アドイン」', '上のメニューの「ツール」→「アドイン」') + 'から、Claudeを開きます。</li>' +
        '<li>Claudeのアカウントで、<b>ご自分で</b>ログインします。</li>' +
        '<li>新しいシートで、次のお願いを送ってみます。表とグラフができたら、成功です。' + box('1月から6月までの、架空のお店の売上の表を作って、合計と、棒グラフも作ってください。') + '</li>' +
        '</ol>' +
        '<p class="note">ワード・パワーポイントも、同じアドインで使えます（公式の案内）。ワードなら「この文章を、やさしい言葉に直して」、パワーポイントなら「この内容で、3枚のスライドを作って」のように頼めます。</p>' +
        '<p class="note warn">会社のパソコンでは、アドインを入れられないことがあります。そのときは、無理をしないで、飛ばしてください。</p>',
      help: [
        { q: 'アドインのボタンが、見つかりません', a: 'Officeの版や、表示の言語によって、場所や名前がちがいます。英語の表示では、' + os('「Home」→「Add-ins」', '「Tools」→「Add-ins」') + 'です。見つからないときは、この画面は飛ばしてかまいません。' },
        { q: '無料プランです', a: '公式の案内では、有料プラン向けです。この画面は、飛ばしてください。' },
        { q: '会話の記録が、消えてしまいました', a: '公式の案内に、2026年9月・10月のWindowsのMicrosoft 365の更新のあと、アドインの会話の記録が見えなくなることがある、と書かれています。大事な内容は、ファイルに残しておきましょう。' }
      ]
    },
    {
      id: 'e19', kind: 'know', tag: 'クイズ', title: '手分けと、自動のルールのクイズ',
      widget: 'quiz',
      quiz: [
        { q: 'サブエージェントの、いちばんの特ちょうは？', options: ['パスワードを、おぼえてくれる', '自分の机（コンテキスト）で作業して、結果だけを返す', 'パソコンを、速くしてくれる'], answer: 1, explain: '読んだ資料は、サブエージェントの机にだけ広がります。メインの机は、すっきりしたままです。' },
        { q: 'サブエージェントを、たくさん同時に動かすと、使用量は？', options: ['そのぶん、多く使う', 'かならず、ゼロになる', '半分になる'], answer: 0, explain: '公式の案内では、サブエージェントの作業も、使用量に数えられます。' },
        { q: '自分のサブエージェントのファイルは、どこに置く？', options: ['デスクトップ', 'CLAUDE.md の中', 'agent1 の .claude/agents フォルダ'], answer: 2, explain: '.claude/agents/名前.md に置くと、そのフォルダで使えます。' },
        { q: 'CLAUDE.md と、フックのちがいは？', options: ['CLAUDE.mdは「お願い」、フックは「かならず動くルール」', 'どちらも、同じ', 'フックは、AIが気分で守る'], answer: 0, explain: 'CLAUDE.mdは、だいたい守られるお願いです。フックは、決まったときに、パソコンが、かならず動かします。' },
        { q: '「お願いを送ったとき」に動くフックは？', options: ['Stop', 'UserPromptSubmit', 'PostToolUse'], answer: 1, explain: 'UserPromptSubmit は、お願いがAIに届く前に動きます。だから、止めることもできます。' },
        { q: 'フックを入れるときの、安全のルールは？', options: ['ネットで見つけたものは、何でも入れる', 'AIに任せて、中は見ない', '中身を確かめて、意味がわかったものだけ入れる'], answer: 2, explain: 'フックは、あなたの権限で、なんでも実行できます。中身を確かめたものだけにします。' },
        { q: '動いているサブエージェントの中を見るには？', options: ['入力欄の下の一覧で選んで、Enter（終わったら /tasks）', '/clear と入れる', 'パソコンを再起動する'], answer: 0, explain: '↓で選んでEnterで開き、Escでもどります。終わってすぐなら /tasks から開けます。' },
        { q: 'Stop フックが動くのは、いつ？', options: ['ファイルを読む前', 'AIが答え終わったとき', 'パソコンを起動したとき'], answer: 1, explain: 'AIが答え終わったときに動きます。stop_hook_active を見て、1回だけにするのが大事です。' }
      ],
      html: '<p>おぼえたことを、クイズで確かめましょう。選ぶと、答えが出ます。点数は、つけません。</p>',
      help: [
        { q: 'まちがえました', a: '大丈夫です。もう一度、前の画面を見て、もどってみてください。何度でも、やりなおせます。' }
      ]
    },
    {
      id: 'e20', kind: 'check', tag: '確認', title: 'おわりの確認',
      widget: 'checks',
      checks: [
        'Explore サブエージェントに、調べものを任せた',
        'サブエージェントを、3つ同時に動かした',
        'サブエージェントの中（作業の記録）を見た（/tasks からでもOK）',
        '自分のサブエージェント（word-checker）を作って、使った',
        'フックの道具（lesson5.py）を作った',
        '「パスワード」を止めるフックが、動いた',
        '練習用のフック②③を動かして、片づけた（/hooks で確かめた）',
        'Office の中で、Claudeを使った（できた人だけ）'
      ],
      required: 7,
      html:
        '<p>できたことに、チェックを入れてください。<b>上の7つ</b>に入ると、「完了にする」を押せます。いちばん下の1つは、Officeがある人だけです。</p>' +
        '<p class="note">練習で作った tool-log.txt、hook-test.txt は、残しておいても、消してもかまいません。word-checker と、フック①は、このあとも使えます。</p>',
      help: [
        { q: 'できなかったところがあります', a: 'そのステップに戻って、「困ったとき」を見てください。何度でもやり直せます。' }
      ]
    }
  ];

  var lesson5 = {
    id: 'l5', no: 5, needsPc: true, ready: true, minutes: 90,
    title: '作業を分ける・自動のルール・Office',
    short: 'サブエージェントに手分けしてもらう・自分の係を作る。フックで「かならず動くルール」を作る。（任意）OfficeでClaudeを使う',
    devices: 'PC',
    doneCard: '<b>レッスン5　完了です。おつかれさまでした。</b><br>AIに手分けしてもらったり、かならず動くルールを作ったりできるようになりました。次は、レッスン6です。',
    steps: steps
  };

  for (var i = 0; i < C.lessons.length; i++) {
    if (C.lessons[i].id === 'l5') { C.lessons[i] = lesson5; break; }
  }
})();
