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
    a: 'AIは、ファイルの作成・修正やコマンドの実行などの前に、実行してよいかを確認してきます。画面の内容を読み、練習用の agent1 フォルダの中の操作であれば「はい(Yes)」を選びます。矢印キー（↑↓）で選び、Enterキーを押します。'
  };
  var HELP_ENG = { q: 'ターミナルの文字が英語です', a: '大丈夫です。表示が英語でも操作は同じです。' };
  var HELP_RESTART = {
    q: '起動し直すには？',
    a: 'Claude Codeの入力欄に <b>/exit</b> と入力し、Enterキーを押します。ターミナルの行（「PS …&gt;」や「… %」）に戻ったら、<b>claude</b> と入力してEnterキーを押します。'
  };
  var HELP_NOFILE = {
    q: 'schedule.txt などのファイルがありません',
    a: 'レッスン2で作成したファイルです。ない場合は「schedule.txt、budget.txt、packing.txt を練習用に短い内容で作ってください」と依頼してから、もう一度実行してください。'
  };

  /* フックの道具（Python）。中身は、学ぶ人が目で確かめられるように、短くしてある */
  var HOOK_PY =
    '# レッスン5の練習用フック（agent1 の中だけで使います）\n' +
    'import sys, json, os, datetime\n' +
    '\n' +
    'mode = sys.argv[1] if len(sys.argv) > 1 else \'\'\n' +
    'data = json.loads(sys.stdin.buffer.read() or b\'{}\')\n' +
    '\n' +
    'if mode == \'prompt\':\n' +
    '    # 依頼文に「パスワード」が含まれていたら、AIに届く前に止める\n' +
    '    if \'パスワード\' in data.get(\'prompt\', \'\'):\n' +
    '        print(json.dumps({\'decision\': \'block\', \'reason\': \'パスワードはAIに送りません。この依頼はフックが止めました。\'}))\n' +
    'elif mode == \'log\':\n' +
    '    # AIがファイルを作成・修正したら、tool-log.txt に1行書く\n' +
    '    name = os.path.basename(data.get(\'tool_input\', {}).get(\'file_path\', \'\'))\n' +
    '    folder = os.environ.get(\'CLAUDE_PROJECT_DIR\') or data.get(\'cwd\') or \'.\'\n' +
    '    with open(os.path.join(folder, \'tool-log.txt\'), \'a\', encoding=\'utf-8\') as f:\n' +
    '        f.write(datetime.datetime.now().strftime(\'%H:%M:%S\') + \' \' + data.get(\'tool_name\', \'\') + \' \' + name + \'\\n\')\n' +
    'elif mode == \'stop\':\n' +
    '    # 回答を終える前に、1回だけ短いまとめを依頼する\n' +
    '    if not data.get(\'stop_hook_active\'):\n' +
    '        print(json.dumps({\'decision\': \'block\', \'reason\': \'終える前に、今の回答を1行でまとめてください。\'}))\n';

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
    return '<li>VS Codeの左側で <b>.claude</b> フォルダの中の <b>settings.json</b> をクリックして開きます（レッスン3で作成したファイルです）。</li>' +
    '<li>中身をすべて選択し（' + os('Ctrlキー', '⌘（Command）キー') + 'とAキー）、下の「コピー」で写した内容を貼り付けます（' + os('Ctrlキー', '⌘（Command）キー') + 'とVキー）。<b>中身がまるごと置き換わります。</b>' + settingsBox(parts) + '</li>' +
    '<li>' + os('Ctrlキー', '⌘（Command）キー') + 'とSキーで保存します。</li>' +
    '<li>Claude Codeを<b>起動し直します</b>（<b>/exit</b> → <b>claude</b>）。</li>';
  }

  var WORD_CHECKER =
    '---\n' +
    'name: word-checker\n' +
    'description: 文章がやさしい言葉で書かれているかを確認する係。文章のチェックを頼まれたときに使う。\n' +
    'tools: Read, Glob, Grep\n' +
    '---\n' +
    'あなたは文章のチェック係です。\n' +
    '・依頼されたファイルを読み、難しい言葉や長すぎる文を見つけます。\n' +
    '・見つけたものを最大5つ、「元の言葉 → やさしい言い換え」の形で箇条書きにします。\n' +
    '・ファイルは修正しません。読むだけです。\n';

  var steps = [
    {
      id: 'e1', kind: 'sample', tag: '目標', title: 'レッスン5で身につけること',
      html:
        '<p class="note warn"><b>このレッスンにはWindowsまたはMacのパソコンが必要です。</b>レッスン4を終えた人向けです。画面右上の「Windows／Mac」ボタンで、自分のパソコンを選んでください。</p>' +
        '<p>これまではAIが1人ですべての作業をしていました。今回は、作業をAIに<b>手分け</b>してもらう方法と、「この場合は必ずこうする」という<b>自動のルール</b>を学びます。</p>' +
        '<div class="card goal"><b>ゴール</b><br>① 作業を<b>サブエージェント</b>（補助役のAI）に任せる・同時に動かす・自分で作る<br>② <b>フック</b>（決まったタイミングで必ず動く仕組み）を3つ動かす<br>③ （任意）エクセル・ワード・パワーポイントの中でClaudeを使う</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>所要時間</dt><dd>約1時間30分（途中で休憩してかまいません）</dd>' +
        '<dt>使うもの</dt><dd>VS Code、agent1フォルダ、Claude Code、Python（レッスン2でインストールしたもの）</dd>' +
        '<dt>任意の実習</dt><dd>Microsoft Office（エクセル・ワード・パワーポイント）を持っている人向け</dd>' +
        '</dl></div>' +
        '<p class="note">サブエージェントもAIとして動くため、<b>使用量（プランの上限）に含まれます</b>（公式の案内）。今回の練習は小さな作業に限っています。</p>' +
        '<p class="note warn">練習は<b>agent1 フォルダの中だけ</b>で行います。実在の個人情報は会話に入力しないでください。</p>',
      help: [
        { q: 'レッスン4が終わっていません', a: '先にレッスン4を終えてください。バックグラウンドで動かす作業と /tasks を、このレッスンでも使います。' },
        { q: 'Pythonが入っていません', a: 'レッスン2のPythonをインストールする画面に戻って、インストールしてください。フックの練習で使います。' }
      ]
    },
    {
      id: 'e2', kind: 'pc', tag: 'PCで操作', title: 'おさらい：Claude Codeを起動する',
      html:
        '<ol>' +
        '<li>VS Codeで <b>agent1</b> フォルダを開きます。</li>' +
        '<li>「ターミナル」→「新しいターミナル」を選びます。</li>' +
        '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。' + cmd('claude') + '</li>' +
        '<li>画面下の行が <b>manual mode on</b> になっているか確認します。違う場合は Shift+Tab を押して <b>manual</b> にします。</li>' +
        '</ol>' +
        '<p class="note">このレッスンでは何度か起動し直します。起動するたびに、下の行を確認する習慣を続けてください。</p>',
      help: [
        { os: 'win', q: '「認識されません」と出ました', a: 'VS Codeをいったん完全に閉じてから開き直し、新しいターミナルで試してください。' },
        { os: 'mac', q: '「command not found」と出ました', a: 'VS Codeを⌘（Command）キーとQキーでいったん完全に終了してから開き直し、新しいターミナルで試してください。' },
        HELP_ENG
      ]
    },
    {
      id: 'e3', kind: 'know', tag: '基礎知識', title: 'サブエージェントとは',
      html:
        '<p><b>サブエージェント</b>は、メインのAIが仕事を<b>手分け</b>するときに呼び出す<b>補助役のAI</b>です。</p>' +
        '<ul class="parts">' +
        '<li><b>自分の机で作業する</b>サブエージェントは<b>別の机</b>（コンテキスト）を使います。<br><span>調べるときに読んだ大量の資料が、メインの机に広がらない</span></li>' +
        '<li><b>結果だけを返す</b>作業が終わると、まとめだけをメインのAIに渡します。<br><span>メインの机は整理されたまま（レッスン4の「机の広さ」の話です）</span></li>' +
        '<li><b>同時に動ける</b>複数の調べものを同時に進められます。<br><span>通常はバックグラウンドで動きます</span></li>' +
        '</ul>' +
        '<p>Claude Codeには、最初から何種類かの補助役が用意されています。たとえば <b>Explore</b>（エクスプロア）は、ファイルを<b>読むだけ</b>で調べものをする係です。</p>' +
        '<p class="note">サブエージェントの作業も使用量に含まれます。多数を同時に動かすと、その分多く消費します（公式の案内）。手分けすれば得になるとは限りません。</p>',
      help: [
        { q: 'どんなときに使いますか？', a: '大量の資料を読む必要がある調べものや、互いに関係のない作業が複数あるときに向いています。すぐ終わる簡単な依頼は、普通に頼むほうが速く済みます。' }
      ]
    },
    {
      id: 'e4', kind: 'pc', tag: 'PCで操作', title: '調べものをサブエージェントに任せる',
      html:
        '<p>名前を書いて依頼すると、そのサブエージェントが使われます（公式の案内）。読むだけの係である <b>Explore</b> に、agent1 フォルダの中を調べてもらいます。</p>' +
        '<ol>' +
        '<li>下の「コピー」を押し、入力欄に貼り付けてEnterキーを押します。</li>' +
        '<li>画面に <b>Explore(…)</b> のような行が表示されたら、サブエージェントが動いています。</li>' +
        '<li>しばらく待つとまとめが届きます。5行のまとめが表示されれば成功です。</li>' +
        '</ol>' +
        box('Explore サブエージェントを使って、agent1 フォルダの中にどんなファイルがあるかを調べてください。結果は5行でまとめてください。') +
        '<p class="note">サブエージェントは通常バックグラウンドで動きます。待っている間も入力欄は使えます。</p>',
      help: [
        { q: 'Explore の行が出ません', a: 'AIが、自分で読むほうが早いと判断することもあります。まとめが表示されれば問題ありません。「必ず Explore サブエージェントを使ってください」と、もう一度依頼してもかまいません。' },
        HELP_APPROVE
      ]
    },
    {
      id: 'e5', kind: 'pc', tag: 'PCで操作', title: 'サブエージェントを3つ同時に動かす',
      html:
        '<p>互いに関係のない作業は<b>同時に</b>進められます。レッスン2で作成した3つのファイルを、3つのサブエージェントで同時に読んでもらいます。</p>' +
        '<ol>' +
        '<li>下の「コピー」を押し、入力欄に貼り付けてEnterキーを押します。</li>' +
        '<li>サブエージェントの行が<b>3つ</b>表示されることを確認します。</li>' +
        '<li>最後に3つのまとめの表が表示されれば成功です。</li>' +
        '</ol>' +
        box('サブエージェントを3つ同時に使って、schedule.txt、budget.txt、packing.txt を1つずつ読んでください。それぞれの中身を1行でまとめ、最後に表にしてください。') +
        '<p class="note">公式の案内によると、同時に動かす数が多すぎると上限で止まります（標準では20まで）。今回は3つだけです。</p>',
      help: [HELP_NOFILE, HELP_APPROVE]
    },
    {
      id: 'e6', kind: 'pc', tag: 'PCで操作', title: 'サブエージェントの作業記録を見る',
      html:
        '<p>サブエージェントが何を読み、どう考えたかは、<b>中の記録</b>（作業の記録）を開くと確認できます。</p>' +
        '<ol>' +
        '<li>前の画面の依頼をもう一度貼り付けて、Enterキーを押します。</li>' +
        '<li>動いている間は、入力欄の<b>下</b>にサブエージェントの一覧が表示されます。<b>↓</b>キーで1つ選んでEnterキーを押すと、その記録が開きます。</li>' +
        '<li>開いた画面で話しかけることもできます。たとえば「読んだファイルの名前をもう一度教えてください」と入力し、Enterキーを押します。</li>' +
        '<li><b>Esc</b>キーでメインの会話に戻ります。</li>' +
        '</ol>' +
        '<h2>すでに終わっている場合</h2>' +
        '<p>サブエージェントは終わると一覧から消えます。公式の案内によると、終了後<b>30秒間</b>は <b>/tasks</b> から開けます。</p>' +
        cmd('/tasks') +
        '<p class="note">画面の見た目は版によって多少違います。記録を確認できれば成功です。</p>',
      help: [
        { q: '一覧が出ません／すぐ消えます', a: '読むファイルが短いため、すぐに終わることがあります。終わったらすぐに /tasks と入力してみてください。それでも見られない場合は、この画面は読むだけでかまいません。' },
        { q: '話しかけた言葉は、どこに届きますか？', a: '記録を開いている間は、その<b>サブエージェント</b>に届きます。「/」で始まる命令はメインの会話に届きます（公式の案内）。' },
        { q: '画面を閉じたいです', a: 'Escキー（キーボードの左上）を押すと、メインの会話に戻ります。' }
      ]
    },
    {
      id: 'e7', kind: 'pc', tag: 'PCで操作', title: 'サブエージェントがさらに手分けする',
      html:
        '<p>サブエージェント自身も、サブエージェントを呼び出せます。公式の案内によると、標準ではメインの会話から<b>3段</b>までつなげられます。</p>' +
        '<ol>' +
        '<li>下の「コピー」を押し、入力欄に貼り付けてEnterキーを押します。</li>' +
        '<li>入力欄の下の一覧に、サブエージェントが<b>木の枝のように</b>並んで表示されることがあります。</li>' +
        '<li>最後に2つのファイルのまとめが表示されれば成功です。</li>' +
        '</ol>' +
        box('サブエージェントを1つ使ってください。そのサブエージェントには、さらにサブエージェントを2つ使わせて、CLAUDE.md と packing.txt を1つずつ読ませてください。最後に、それぞれの中身を1行でまとめて教えてください。') +
        '<p class="note">AIが「手分けしなくてもすぐ読める」と判断し、段を作らないこともあります。まとめが表示されれば問題ありません。手分けを重ねるほど使用量も増えます。</p>',
      help: [HELP_NOFILE, HELP_APPROVE]
    },
    {
      id: 'e8', kind: 'know', tag: '基礎知識', title: '自分専用のサブエージェント',
      html:
        '<p>決まった仕事をいつも同じやり方で任せたいときは、<b>自分のサブエージェント</b>を作れます。中身は<b>1つのファイル</b>です。</p>' +
        '<ul class="parts">' +
        '<li><b>置き場所</b>agent1 の中の <b>.claude/agents</b> フォルダ<br><span>このフォルダの中だけで使えます</span></li>' +
        '<li><b>上の部分</b>「---」で挟んだところ<br><span>name（名前）と description（いつ使うか）が必須です。AIは description を読んで、どの係を使うかを決めます。tools（使ってよい道具）は省略できます</span></li>' +
        '<li><b>下の部分</b>普通の文章<br><span>その係に向けた仕事の説明（取扱説明書）</span></li>' +
        '</ul>' +
        '<p>今回は、文章を読んで<b>難しい言葉を見つける係</b>を作ります。ファイルを修正しないように、道具は読む系（Read など）だけにします。</p>' +
        '<p class="note">公式の案内によると、現在の版では /agents と入力すると作り方の案内が表示されます。今回は自分でファイルを作ります。</p>',
      help: [
        { q: 'CLAUDE.md と何が違いますか？', a: 'CLAUDE.md は、メインのAIが毎回読む「取扱説明書」です。サブエージェントのファイルは、その<b>係だけ</b>が読む仕事の説明です。' }
      ]
    },
    {
      id: 'e9', kind: 'pc', tag: 'PCで操作', title: '「言葉のチェック係」を作る',
      html:
        '<ol>' +
        '<li>VS Code左側のファイル一覧の<b>何もないところ</b>で' + os('右クリック', 'Controlキーを押しながらクリック（または2本指でクリック）') + 'し、「新しいファイル」を選びます。</li>' +
        '<li>名前の欄に次のとおり入力し、Enterキーを押します（半角英字で入力します。下の「コピー」で写して貼り付けてもかまいません）。' + cmd('.claude/agents/word-checker.md') + '</li>' +
        '<li>空のファイルが開きます。下の「コピー」を押し、中に貼り付けます。</li>' +
        '<li>' + os('Ctrlキー', '⌘（Command）キー') + 'とSキーで保存します。</li>' +
        '<li>新しいフォルダ（agents）を作ったので、Claude Codeを<b>起動し直します</b>（<b>/exit</b> → <b>claude</b>）。公式の案内によると、新しく作ったフォルダは起動し直すと読み込まれます。</li>' +
        '</ol>' +
        box(WORD_CHECKER) +
        '<p class="note">「tools: Read, Glob, Grep」は、読む・探す道具だけを使ってよいという意味です。この係はファイルを書き換えられません。</p>',
      help: [
        { q: '.claude フォルダが見えません', a: 'VS Codeの左側に表示されているはずです。ない場合でも、名前の欄に <b>.claude/agents/word-checker.md</b> と入力すれば、フォルダも一緒に作られます。' },
        { q: '「---」の行は消してもいいですか？', a: '消さないでください。「---」で挟んだ部分が、名前と使いどころの設定です。' },
        HELP_RESTART
      ]
    },
    {
      id: 'e10', kind: 'pc', tag: 'PCで操作', title: '「言葉のチェック係」に依頼する',
      html:
        '<ol>' +
        '<li>まず<b>名前を指定して</b>依頼します。下の「コピー」を押し、入力欄に貼り付けてEnterキーを押します。' + box('word-checker サブエージェントを使って、mail-draft.txt に難しい言葉がないかチェックしてください。') + '</li>' +
        '<li><b>word-checker</b> の行が表示され、「元の言葉 → やさしい言い換え」のリストが出れば成功です。</li>' +
        '<li>次に、<b>名前を指定せずに</b>依頼します。' + box('packing.txt に難しい言葉がないか確認してください。') + '</li>' +
        '<li>再び <b>word-checker</b> の行が表示されたら、AIが係のファイルの description（文章のチェックを頼まれたときに使う）を読み、<b>自分で係を選んだ</b>ということです。</li>' +
        '</ol>' +
        '<p class="note">AIが係を使わずに自分で答えることもあります。その場合は、description を「文章のチェックを頼まれたら必ず使う」のように明確に書くと、選ばれやすくなります。</p>' +
        '<p class="note">入力欄で <b>@</b> と入力すると、使える係の一覧が表示されます。そこから word-checker を選ぶと、その係が必ず使われます（公式の案内）。</p>' +
        '<p class="note">修正するかどうかは<b>自分で</b>決めます。修正したい場合は、普通に「この言い換えで mail-draft.txt を修正してください」と依頼します。</p>',
      help: [
        { q: 'mail-draft.txt がありません', a: 'レッスン2で作成したファイルです。ない場合は、ほかの文章ファイル（packing.txt など）の名前に変えて依頼してください。' },
        { q: 'word-checker が見つからないと言われます', a: 'ファイルの場所（.claude/agents/word-checker.md）と、先頭の「---」の部分を確認してください。そのあと Claude Code を起動し直します。' },
        HELP_RESTART
      ]
    },
    {
      id: 'e11', kind: 'know', tag: '基礎知識', title: 'フックとは',
      html:
        '<p><b>フック</b>は、「<b>〇〇のときは必ず△△する</b>」という<b>自動のルール</b>です。決まったタイミングで、決まったプログラムが必ず動きます。</p>' +
        '<ul class="parts">' +
        '<li><b>CLAUDE.md</b>AIへの「お願い」<br><span>おおむね守られるが、100%ではない（レッスン2）</span></li>' +
        '<li><b>フック</b>パソコンが必ず実行するルール<br><span>AIが忘れても動く</span></li>' +
        '</ul>' +
        '<h2>今回使う3つのタイミング</h2>' +
        '<ul class="parts">' +
        '<li><b>UserPromptSubmit</b>依頼を送ったとき<br><span>①「パスワード」という言葉を含む依頼を止める</span></li>' +
        '<li><b>PostToolUse</b>AIが道具を使ったあと<br><span>② ファイルを作成・修正した記録を残す</span></li>' +
        '<li><b>Stop</b>AIが回答を終えたとき<br><span>③ 終える前に短いまとめを依頼する</span></li>' +
        '</ul>' +
        '<p class="note">ほかにも「会話を始めたとき」「道具を使う前」など、多くのタイミングがあります（公式の案内）。</p>',
      help: [
        { q: 'なぜ「フック」と言うのですか？', a: '英語の hook（引っかける）から来ています。決まったタイミングに自分のプログラムを引っかけておくイメージです。' }
      ]
    },
    {
      id: 'e12', kind: 'know', tag: '基礎知識', title: 'フックを使うときの安全ルール',
      html:
        '<p class="note warn">公式の案内によると、フックは<b>あなたのパソコンの権限で何でも実行できます</b>。ファイルを削除することもできてしまいます。</p>' +
        '<ul class="parts">' +
        '<li><b>① 中身を確認したものだけ</b>この教材のものか、自分で読んで意味を理解したものだけ<br><span>ネットで見つけたフックをそのまま入れない</span></li>' +
        '<li><b>② 練習は agent1 の中だけ</b>今回は agent1 の .claude フォルダに書きます<br><span>ほかのフォルダには効きません</span></li>' +
        '<li><b>③ 終わったら片づける</b>練習用のフックは最後に外します<br><span>残すのは「パスワード」を止めるものだけ</span></li>' +
        '</ul>' +
        '<p>どのフックが入っているかは、Claude Codeの入力欄に <b>/hooks</b> と入力すると、<b>閲覧専用</b>の一覧で確認できます。</p>',
      help: [
        { q: 'フックはAIが勝手に作りますか？', a: 'このレッスンでは自分でファイルに書きます。AIに依頼して作ってもらうこともできますが、その場合も中身を自分で確認してから使います。' }
      ]
    },
    {
      id: 'e13', kind: 'pc', tag: 'PCで操作', title: 'フック用のプログラムを用意する',
      html:
        '<p>3つのフックは、同じ1つの小さなプログラム（Python）を使います。読めば何をするかがわかるように書いてあります（「#」で始まる行は説明です）。</p>' +
        '<ol>' +
        '<li>VS Code左側のファイル一覧の<b>何もないところ</b>で' + os('右クリック', 'Controlキーを押しながらクリック') + 'し、「新しいファイル」を選びます。</li>' +
        '<li>名前の欄に次のとおり入力し、Enterキーを押します。' + cmd('.claude/hooks/lesson5.py') + '</li>' +
        '<li>空のファイルが開きます。下の「コピー」を押して中に貼り付け、' + os('Ctrlキー', '⌘（Command）キー') + 'とSキーで保存します。</li>' +
        '</ol>' +
        box(HOOK_PY) +
        '<p class="note">このプログラムが行うのは、①依頼文に「パスワード」が含まれていれば止める、②作成・修正したファイルの名前を tool-log.txt に書く、③回答を終える前に1回だけまとめを依頼する、の3つだけです。</p>',
      help: [
        { q: '貼り付けたら字下げ（左の空白）がずれました', a: 'Pythonでは左の空白にも意味があります。すべて消してから、もう一度「コピー」から貼り付けてください。' },
        { q: 'VS Codeが「Pythonの拡張機能」を勧めてきます', a: 'インストールしなくても問題ありません。右下の通知は閉じてかまいません。' }
      ]
    },
    {
      id: 'e14', kind: 'pc', tag: 'PCで操作', title: 'フック①「パスワード」を含む依頼を止める',
      html:
        '<p>依頼を送ったとき（<b>UserPromptSubmit</b>）に、文の中に「パスワード」が含まれていれば、<b>AIに届く前に止める</b>フックです。</p>' +
        '<ol>' + REPLACE(['prompt']) +
        '<li>次の依頼を送ってみます。<b>本物のパスワードは入力しません。</b>' + box('練習です。パスワードという言葉が入った文を送ってみます。') + '</li>' +
        '<li>「パスワードはAIに送りません。この依頼はフックが止めました。」と表示され、AIが回答しなければ成功です。</li>' +
        '</ol>' +
        '<p class="note">settings.json の新しい中身には、レッスン3で書いた「Manual で始める」と「secret.txt を読まない」の設定もそのまま入っています。<b>"hooks"</b> の部分が今回追加したところです。</p>' +
        '<p class="note warn">公式の案内によると、止めた依頼の文も、パソコン内の会話の記録には残ります。このフックは、うっかり送信するのを防ぐためのもので、秘密を守る金庫ではありません。</p>',
      help: [
        { q: '止まりません', a: '① settings.json を保存したか ② 起動し直したか ③ lesson5.py の場所が .claude/hooks/ か、を確認してください。それでも止まらない場合は、/hooks と入力し、一覧に UserPromptSubmit があるか確認してください。' },
        { q: '「hook error」のような表示が出ました', a: 'Pythonが動かなかったときに表示されます。ターミナルで ' + os('<b>python --version</b>', '<b>python3 --version</b>') + ' が動くか確認してください（レッスン2）。lesson5.py の中身を貼り付け直すことも試してください。' },
        { q: 'settings.json がありません', a: 'レッスン3で作成したファイルです。ない場合は、レッスン3で設定ファイルを書いたときと同じ手順で .claude/settings.json を作り、上の中身を貼り付けます。' },
        HELP_RESTART
      ]
    },
    {
      id: 'e15', kind: 'pc', tag: 'PCで操作', title: 'フック② 道具の使用記録を残す',
      html:
        '<p>AIが道具を使ったあと（<b>PostToolUse</b>）に動くフックです。ファイルを作成（Write）・修正（Edit）したときだけ、<b>tool-log.txt</b> に時刻・道具・ファイル名を1行書きます。</p>' +
        '<ol>' + REPLACE(['prompt', 'log']) +
        '<li>次の依頼を送ります。許可を求められたら、内容を確認して「はい(Yes)」を選びます。' + box('hook-test.txt という名前のファイルを作って、「フックの練習です」と1行だけ書いてください。') + '</li>' +
        '<li>VS Codeの左側に <b>tool-log.txt</b> が追加されます。開いて「（時刻） Write hook-test.txt」のような行があれば成功です。</li>' +
        '</ol>' +
        '<p class="note">"PostToolUse" の部分が追加されました。"matcher": "Write|Edit" は「Write か Edit のときだけ」という意味です。</p>',
      help: [
        { q: 'tool-log.txt ができません', a: '起動し直したかを確認してください。そのあと、もう一度ファイルを作る依頼をしてみてください。' },
        { q: 'tool-log.txt はAIが書いたのですか？', a: 'いいえ。フック（パソコン）が書きました。AIはこのファイルのことを知りません。そのため、AIが忘れても記録は残ります。' },
        HELP_APPROVE,
        HELP_RESTART
      ]
    },
    {
      id: 'e16', kind: 'pc', tag: 'PCで操作', title: 'フック③ 終える前に1行でまとめる',
      html:
        '<p>AIが回答を終えたとき（<b>Stop</b>）に動くフックです。AIが終わろうとすると「<b>終える前に、1行でまとめてください</b>」と依頼を返し、もう少しだけ作業を続けさせます。</p>' +
        '<ol>' + REPLACE(['prompt', 'log', 'stop']) +
        '<li>次の依頼を送ります。' + box('秋においしい果物を3つ教えてください。') + '</li>' +
        '<li>回答のあとに <b>Stop hook</b> のような表示が出て、AIが<b>1行のまとめ</b>を書き足せば成功です。</li>' +
        '</ol>' +
        '<p class="note">プログラムの中の <b>stop_hook_active</b> は、「すでに1回続けたあとかどうか」を表します。これを見て<b>1回だけ</b>にしています。確認しないと、AIがいつまでも終われなくなります（公式の案内）。</p>' +
        '<p class="note">回答のたびにまとめが1回増えるため、使用量も少し増えます。次の画面で外します。</p>',
      help: [
        { q: 'まとめが出ません', a: '起動し直したかを確認してください。/hooks と入力して、一覧に Stop があるかも確認してください。' },
        { q: 'いつまでも終わりません', a: 'Escキーを押して止めます。lesson5.py の中身を、もう一度「コピー」から貼り付け直してください（stop_hook_active の行が重要です）。' },
        HELP_RESTART
      ]
    },
    {
      id: 'e17', kind: 'pc', tag: 'PCで操作', title: 'フックを確認して片づける',
      html:
        '<ol>' +
        '<li>Claude Codeの入力欄に <b>/hooks</b> と入力し、Enterキーを押します。' + cmd('/hooks') + '</li>' +
        '<li>UserPromptSubmit、PostToolUse、Stop の3つが一覧にあることを確認します。<b>Esc</b>キーで閉じます。</li>' +
        '<li>練習用の②と③を外します。settings.json の中身を、下の内容（①だけ）にまるごと置き換えて保存します。' + settingsBox(['prompt']) + '</li>' +
        '<li>Claude Codeを起動し直します（<b>/exit</b> → <b>claude</b>）。</li>' +
        '<li>もう一度 <b>/hooks</b> を開き、<b>UserPromptSubmit だけ</b>になっていれば成功です。</li>' +
        '</ol>' +
        '<p class="note">「パスワード」を止めるフック①は残しておきます。不要になったら、settings.json から "hooks" の部分を削除すれば外れます。</p>',
      help: [
        { q: '/hooks の画面で追加や削除ができません', a: '公式の案内によると、/hooks は<b>閲覧専用</b>の画面です。追加や削除は settings.json を修正して行います。' },
        { q: 'tool-log.txt や hook-test.txt はどうしますか？', a: '練習で作ったファイルです。残しても削除してもかまいません。' },
        HELP_RESTART
      ]
    },
    {
      id: 'e18', kind: 'pc', tag: '任意', title: 'エクセル・ワード・パワーポイントでClaudeを使う（Officeがある場合）',
      html:
        '<p class="note"><b>この画面は任意です。</b>Microsoft Office がない場合は「次へ」で飛ばしてください。</p>' +
        '<p>エクセル・ワード・パワーポイントの<b>中</b>でClaudeに話しかけられる「アドイン」（追加機能）があります。正式名称は <b>Claude for Microsoft 365</b> です。</p>' +
        '<div class="card goal"><b>使える条件（公式の案内）</b><br>・Claudeの有料プラン（Pro・Max・Team・Enterprise）<br>・' + os('WindowsのMicrosoft 365（サブスクリプション）版Office', 'Macの新しいOffice（エクセル・パワーポイントは16.46以上、ワードは16.61以上）') + '、またはブラウザ版のOffice（Web版）<br>・2016年版・2019年版の買い切り型Officeと、iPadでは使えません</div>' +
        '<ol>' +
        '<li>ブラウザで、Microsoftの公式ページ <a href="https://marketplace.microsoft.com/en-us/product/office/WA200010725" target="_blank" rel="noopener noreferrer">Claude for Microsoft 365</a> を開きます。</li>' +
        '<li>「Get it now」（今すぐ入手）を押します。Microsoftへのログインは<b>自分で</b>行います。</li>' +
        '<li>エクセルを開き、' + os('「ホーム」タブの「アドイン」', '上部メニューの「ツール」→「アドイン」') + 'からClaudeを開きます。</li>' +
        '<li>Claudeのアカウントで、<b>自分で</b>ログインします。</li>' +
        '<li>新しいシートで次の依頼を送ってみます。表とグラフができれば成功です。' + box('1月から6月までの架空の店舗の売上表を作り、合計と棒グラフも作ってください。') + '</li>' +
        '</ol>' +
        '<p class="note">ワード・パワーポイントでも同じアドインを使えます（公式の案内）。ワードなら「この文章をやさしい言葉に直してください」、パワーポイントなら「この内容で3枚のスライドを作ってください」のように依頼できます。</p>' +
        '<p class="note warn">会社のパソコンでは、アドインを追加できないことがあります。その場合は無理をせず、飛ばしてください。</p>',
      help: [
        { q: 'アドインのボタンが見つかりません', a: 'Officeの版や表示言語によって、場所や名前が違います。英語表示では' + os('「Home」→「Add-ins」', '「Tools」→「Add-ins」') + 'です。見つからない場合は、この画面は飛ばしてかまいません。' },
        { q: '無料プランです', a: '公式の案内によると、有料プラン向けの機能です。この画面は飛ばしてください。' },
        { q: '会話の記録が消えてしまいました', a: '公式の案内には、2026年9月・10月のWindows版Microsoft 365の更新後に、アドインの会話の記録が見えなくなることがあると書かれています。大事な内容はファイルに残しておいてください。' }
      ]
    },
    {
      id: 'e19', kind: 'know', tag: 'クイズ', title: 'クイズ：手分けと自動のルール',
      widget: 'quiz',
      quiz: [
        { q: 'サブエージェントの一番の特徴は？', options: ['パスワードを覚えてくれる', '自分の机（コンテキスト）で作業して、結果だけを返す', 'パソコンを速くしてくれる'], answer: 1, explain: '読んだ資料はサブエージェントの机にだけ広がります。メインの机は整理されたままです。' },
        { q: 'サブエージェントを多数同時に動かすと、使用量はどうなる？', options: ['その分多く消費する', '必ずゼロになる', '半分になる'], answer: 0, explain: '公式の案内によると、サブエージェントの作業も使用量に含まれます。' },
        { q: '自分のサブエージェントのファイルはどこに置く？', options: ['デスクトップ', 'CLAUDE.md の中', 'agent1 の .claude/agents フォルダ'], answer: 2, explain: '.claude/agents/名前.md に置くと、そのフォルダで使えます。' },
        { q: 'CLAUDE.md とフックの違いは？', options: ['CLAUDE.mdは「お願い」、フックは「必ず動くルール」', 'どちらも同じ', 'フックはAIが気分で守る'], answer: 0, explain: 'CLAUDE.md は、おおむね守られるお願いです。フックは、決まったタイミングでパソコンが必ず実行します。' },
        { q: '「依頼を送ったとき」に動くフックは？', options: ['Stop', 'UserPromptSubmit', 'PostToolUse'], answer: 1, explain: 'UserPromptSubmit は、依頼がAIに届く前に動きます。そのため、依頼を止めることもできます。' },
        { q: 'フックを入れるときの安全ルールは？', options: ['ネットで見つけたものは何でも入れる', 'AIに任せて中身は見ない', '中身を確認し、意味を理解したものだけ入れる'], answer: 2, explain: 'フックはあなたの権限で何でも実行できます。中身を確認したものだけにします。' },
        { q: '動いているサブエージェントの中を見るには？', options: ['入力欄の下の一覧で選んでEnter（終わったら /tasks）', '/clear と入力する', 'パソコンを再起動する'], answer: 0, explain: '↓で選んでEnterで開き、Escで戻ります。終わった直後なら /tasks から開けます。' },
        { q: 'Stop フックが動くのはいつ？', options: ['ファイルを読む前', 'AIが回答を終えたとき', 'パソコンを起動したとき'], answer: 1, explain: 'AIが回答を終えたときに動きます。stop_hook_active を見て1回だけにすることが重要です。' }
      ],
      html: '<p>学んだことをクイズで確認します。選択肢を選ぶと答えが表示されます。採点はしません。</p>',
      help: [
        { q: '間違えました', a: '大丈夫です。前の画面を見直してから、もう一度解いてみてください。何度でもやり直せます。' }
      ]
    },
    {
      id: 'e20', kind: 'check', tag: '確認', title: '最後の確認',
      widget: 'checks',
      checks: [
        'Explore サブエージェントに調べものを任せた',
        'サブエージェントを3つ同時に動かした',
        'サブエージェントの中（作業の記録）を見た（/tasks からでも可）',
        '自分のサブエージェント（word-checker）を作って使った',
        'フック用のプログラム（lesson5.py）を作った',
        '「パスワード」を止めるフックが動いた',
        '練習用のフック②③を動かし、片づけた（/hooks で確認した）',
        'Office の中でClaudeを使った（任意）'
      ],
      required: 7,
      html:
        '<p>できた項目にチェックを入れてください。<b>上の7つ</b>にチェックが入ると「完了にする」を押せます。一番下の1つは、Officeを持っている人向けの任意項目です。</p>' +
        '<p class="note">練習で作った tool-log.txt と hook-test.txt は、残しても削除してもかまいません。word-checker とフック①は、このあとも使えます。</p>',
      help: [
        { q: 'できなかったところがあります', a: 'そのステップに戻り、「困ったとき」を確認してください。何度でもやり直せます。' }
      ]
    }
  ];

  var lesson5 = {
    id: 'l5', no: 5, needsPc: true, ready: true, minutes: 90,
    title: '作業を分ける・自動のルール・Office',
    short: 'サブエージェントで作業を手分けし、自分専用の係を作る。フックで「必ず動くルール」を作る。（任意）OfficeでClaudeを使う',
    devices: 'PC',
    doneCard: '<b>レッスン5　完了です。お疲れさまでした。</b><br>AIに作業を手分けしてもらったり、必ず動くルールを作ったりできるようになりました。次はレッスン6です。',
    steps: steps
  };

  for (var i = 0; i < C.lessons.length; i++) {
    if (C.lessons[i].id === 'l5') { C.lessons[i] = lesson5; break; }
  }
})();
