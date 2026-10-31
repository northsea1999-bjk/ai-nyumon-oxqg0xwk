/* レッスン7：くり返しをまとめる「スキル」（ライブラリ・CLI・プラグイン）
   内容は2026-10-31に公式の案内で確認：
   Claude Code：skills、commands、features-overview、permission-modes、plugins（install・security・anthropic-marketplaces）
   Python：docs.python.org（installing・windows・mac）、packaging.python.org、Pillow（installation・ImageFont・PDF）、Microsoft Windows 11 font list
   ・スキル＝ .claude/skills/名前/SKILL.md。description はいつも読まれ、中身は使うときだけ読まれる。/名前 で呼ぶ。AIが自分で使うこともある
   ・スキルのフォルダに、スクリプトを入れて動かせる
   ・スキルは、作ったり直したりすると、その場で読みこまれる。ただし、起動したときに無かった skills フォルダを新しく作ったときは /reload-skills
   ・CLAUDE.md はいつも読まれるルール。スキルは必要なときに読まれる資料（features-overview）
   ・プラグイン：/plugin（Discover・Installed・Marketplaces）。公式のマーケットプレイス claude-plugins-official は自動で入る。範囲は user・project・local
   ・skill-creator は Anthropic の公式プラグイン。/plugin install skill-creator@claude-plugins-official。/reload-plugins もある
   ・プラグインは、あなたの権限でどんなコードも動かせる。マーケットプレイスの名前は、中身の安全を保証しない
   ・Pillow：python -m pip install Pillow（MacはPython公式のインストーラー版の python3）。標準のフォントは使える文字が少ない → 日本語は truetype でフォントを指定
   ・Windowsの標準フォント：游ゴシック（YuGothB.ttc など）。メイリオは、日本語版以外のWindowsには入っていないことがある
   ・Pillowで、複数の画像を1つのPDFに保存できる（save_all・append_images） */
(function () {
  'use strict';
  var C = window.COURSE;
  var cmd = C.cmd, box = C.copybox, os = C.os, osBlock = C.osBlock, cmdOs = C.cmdOs;

  function boxOs(win, mac) { return osBlock(box(win), box(mac)); }
  var FONT_WIN = '日本語の文字には、C:\\Windows\\Fonts\\YuGothB.ttc（游ゴシック）のフォントを使ってください。';
  var FONT_MAC = '日本語の文字には、/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc（ヒラギノ角ゴシック）のフォントを使ってください。見つからない場合は、同じフォルダの中から日本語に対応したフォントを探してください。';

  var HELP_APPROVE = {
    q: 'AIが「許可しますか？」と聞いてきました',
    a: 'スクリプトの作成（Write）や実行（' + os('Bash／PowerShell', 'Bash') + '）の前に確認が表示されます。内容を読み、agent1 の中での操作であれば<b>1番目の「Yes」</b>を選びます。フォントのフォルダ（' + os('C:\\Windows\\Fonts', '/System/Library/Fonts') + '）を<b>読むだけ</b>の場合も「Yes」で問題ありません。Webの検索やページの読み込み（WebSearch・Fetch）も、内容を確認して「Yes」を選んでかまいません。.claude フォルダ（スキルの保存場所）に書き込むときは毎回確認されます。その場合も1番目の「Yes」を選びます。「次から聞かない」の選択肢は選びません。判断できないときは「いいえ(No)」を選んでください。'
  };
  var HELP_ENG = { q: '画面の文字が英語です', a: '問題ありません。表示が英語でも操作は同じです。' };
  var HELP_RESTART = {
    q: '起動し直すには？',
    a: 'Claude Codeの入力欄に <b>/exit</b> と入力し、Enterキーを押します。ターミナルの行に戻ったら <b>claude -c</b> と入力すると、前の会話の続きから再開できます（レッスン4）。'
  };
  var HELP_TOFU = {
    q: '文字が「□」になりました',
    a: 'フォントが日本語に対応していません。「日本語を表示できるフォントを使って作り直してください」と依頼します。' + os('Windowsでは、C:\\Windows\\Fonts の YuGothB.ttc（游ゴシック）が使えます。', 'Macでは、ヒラギノ角ゴシックが使えます。')
  };
  var HELP_INSTALL_AI = {
    q: 'AIが「pip install」をしようとします',
    a: 'Pillowはすでに自分でインストールしています。「いいえ(No)」を選び、「Pillowはインストール済みです」と伝えます。ほかのものをインストールしようとした場合も、名前と理由を聞いてから判断します。'
  };

  var steps = [
    {
      id: 'h1', kind: 'sample', tag: '目標', title: 'レッスン7でできるようになること',
      html:
        '<p class="note warn"><b>このレッスンにはWindowsかMacのパソコンが必要です。</b>レッスン6を終えた人向けです。画面右上の「Windows／Mac」ボタンで、自分のパソコンを選んでください。</p>' +
        '<p>同じ依頼を毎回長い文で書くのは手間がかかります。このレッスンでは、決まった作業を<b>道具（スクリプト）</b>にして<b>スキル</b>として保存し、<b>「/名前」だけで呼び出せる</b>ようにします。</p>' +
        '<div class="card goal"><b>目標</b><br>① <b>ライブラリ</b>（他の人が作った部品）でカードニュースの画像を作る<br>② 画像を作る道具を<b>CLI</b>（オプションで動かす形式）にする<br>③ <b>スキル</b>にまとめ、<b>/cardnews</b>・<b>/img2pdf</b> で呼び出す<br>④ <b>プラグイン</b>（skill-creator）をインストールし、写真補正のスキルを作る</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>所要時間</dt><dd>約2時間（途中で休憩してかまいません）</dd>' +
        '<dt>使うもの</dt><dd>VS Code、agent1フォルダ、Claude Code、Python（レッスン2でインストールしたもの）、Pillow（このあと自分でインストールします）</dd>' +
        '</dl></div>' +
        '<p class="note warn">写真の練習には、<b>個人情報が写っていない画像</b>だけを使います。このレッスンで作るカードニュースの画像を使えば安心です。</p>',
      help: [
        { q: 'Pythonがインストールされていません', a: 'レッスン2の、Pythonをインストールする画面の手順でインストールしてください。' },
        { q: 'レッスン6が終わっていません', a: 'このレッスンではレッスン6のコネクタを使わないため、レッスン5まで終えていれば進められます。' }
      ]
    },
    {
      id: 'h2', kind: 'pc', tag: 'PCで操作', title: 'おさらい：Claude Codeを起動する',
      html:
        '<ol>' +
        '<li>VS Codeで <b>agent1</b> フォルダを開きます。</li>' +
        '<li>「ターミナル」→「新しいターミナル」を選びます。</li>' +
        '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。' + cmd('claude') + '</li>' +
        '<li>画面下部の行が <b>manual mode on</b> になっているか確認します。なっていない場合は、Shift+Tabを押して <b>manual</b> にします。</li>' +
        '</ol>',
      help: [
        { os: 'win', q: '「認識されません」と表示されました', a: 'VS Codeをいったん完全に閉じてから開き直し、新しいターミナルで試してください。' },
        { os: 'mac', q: '「command not found」と表示されました', a: 'VS Codeを⌘（Command）キー＋Qキーでいったん完全に終了してから開き直し、新しいターミナルで試してください。' },
        HELP_ENG
      ]
    },
    {
      id: 'h3', kind: 'know', tag: '基礎知識', title: 'スキルとは',
      html:
        '<p><b>スキル</b>は、<b>必要なときだけ取り出す手引き書</b>です。</p>' +
        '<ul class="parts">' +
        '<li><b>CLAUDE.md</b>常に全体が読まれる<br><span>書く内容が増えると、AIの作業机（コンテキスト）がいっぱいになる</span></li>' +
        '<li><b>スキル</b>普段は「名前と説明」だけが読まれる<br><span>使うときに中身を読む（公式の案内）。たくさん作っても作業机が散らからない</span></li>' +
        '</ul>' +
        '<h2>スキルを使う利点</h2>' +
        '<ul class="parts">' +
        '<li><b>スキルなし</b>毎回、長い依頼文を書く<br><span>書き方が違うと、結果もばらばらになる</span></li>' +
        '<li><b>スキルあり</b>「/cardnews 桜」のように短く呼び出す<br><span>いつも同じ手順で作ってくれる</span></li>' +
        '</ul>' +
        '<div class="card goal"><b>いつスキルにするか</b><br>1回だけの作業なら、その場で依頼すれば十分です。<b>同じ依頼を3回以上する</b>なら、スキルにまとめる目安です。</div>' +
        '<p class="note">公式の案内では、スキルは自分で「/名前」と入力して呼び出せるほか、AIが説明を読んで<b>自分で使う</b>こともあります。</p>',
      help: [
        { q: 'サブエージェント（レッスン5）とは何が違いますか？', a: '公式の案内では、スキルはどの会話にも読み込める「手引き書」、サブエージェントは別の作業机で働く「助手」です。' }
      ]
    },
    {
      id: 'h4', kind: 'know', tag: '基礎知識', title: 'ライブラリとは',
      html:
        '<p><b>ライブラリ</b>は、誰かが作って誰でも使えるように公開した、<b>プログラムの部品のセット</b>です。</p>' +
        '<ul class="parts">' +
        '<li><b>AIの動き方</b>依頼 → スクリプトを書く（Write） → 実行する（' + os('Bash／PowerShell', 'Bash') + '）<br><span>レッスン2の計算機と同じ流れ</span></li>' +
        '<li><b>部品を組み立てる</b>「文字を書く部品」「色を塗る部品」をつないで画像を作る<br><span>中の仕組みを知らなくても、使い方がわかれば使える</span></li>' +
        '</ul>' +
        '<p>必要な部品は、たいていすでに存在します。<b>人は「何を作るか」を考え、組み立てはAIに任せる</b>のがこれからのやり方です。どんな部品があるかを知っていると、①発想が広がる ②間違いが減る ③時間と使用量を節約できる、という利点があります。</p>' +
        '<p class="note">人が作って共有する部品には、<b>ライブラリ</b>のほかに、<b>オープンソース</b>（中身が公開されたプログラム）や、このレッスンで作る<b>スキル</b>もあります。どれも「入れると決まった仕事をしてくれる箱」のようなものです。</p>' +
        '<p>このレッスンでは、画像を作るライブラリ <b>Pillow</b>（ピロー）を使います。</p>' +
        '<p class="note warn">ライブラリは<b>正しい名前</b>でインストールします。よく似た名前の偽物が存在することもあります。知らない名前のライブラリを、AIにインストールさせないでください。</p>',
      help: [
        { q: 'スクリプトとは？', a: 'パソコンにさせる作業の手順を書いた小さなプログラムです。このレッスンでは、AIが Python で書きます。' }
      ]
    },
    {
      id: 'h6', kind: 'pc', tag: 'PCで操作', title: 'ライブラリを提案してもらう',
      html:
        '<p>まず、どの部品を使えばよいかをAIに聞きます。</p>' +
        '<ol>' +
        '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。' + box('SNS用のカードニュース（文字入りの画像）を作りたいです。どのPythonライブラリを使うとよいですか？ わかりやすい言葉で教えてください。インストールはせず、ライブラリの名前と選ぶ理由だけを教えてください。') + '</li>' +
        '<li>候補にPillowが含まれていれば成功です。</li>' +
        '</ol>' +
        '<p class="note">ほかのライブラリを提案されることもあります。このレッスンでは、日本語の文字も扱えて広く使われている <b>Pillow</b> を使います。インストールは次の画面で自分で行います。</p>',
      help: [{ q: 'AIが「pip install」をしようとします', a: '「いいえ(No)」を選びます。<b>この時点ではまだインストールしません。</b>「今はインストールせず、名前と勧める理由だけを教えてください」と伝えます。インストールは次の画面で自分で行います。' }]
    },
    {
      id: 'h5', kind: 'pc', tag: 'PCで操作', title: 'Pillowを自分でインストールする',
      html:
        '<p>ライブラリは<b>通常のターミナル</b>で<b>自分で</b>インストールします（レッスン2のPythonと同じ考え方です）。</p>' +
        '<ol>' +
        '<li>Claude Codeの入力欄に <b>/exit</b> と入力し、Enterキーを押します。</li>' +
        '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。' + cmdOs('python -m pip install Pillow', 'python3 -m pip install Pillow') + '</li>' +
        '<li>「Successfully installed」のような文が表示されたら、インストールは完了です。次のコマンドで確認します。' + cmdOs('python -c "import PIL; print(PIL.__version__)"', 'python3 -c "import PIL; print(PIL.__version__)"') + '</li>' +
        '<li>数字（バージョン）が表示されたら成功です。<b>claude -c</b> でClaude Codeに戻ります。' + cmd('claude -c') + '</li>' +
        '</ol>' +
        '<p class="note">Pillowの公式の案内でも、<b>-m pip</b> の形式でインストールする方法が紹介されています。</p>',
      help: [
        { q: '「Requirement already satisfied」と表示されました', a: 'すでにインストールされている、という意味です。そのまま次へ進んでください。' },
        { q: '「Failed building wheel」など、長いエラーが表示されました', a: 'Pythonが新しすぎて、Pillowがまだ対応していない場合があります。' + os('python --version', 'python3 --version') + ' で表示された数字をメモして、相談してください（2026年10月時点で、Pillowは Python 3.15 にも対応しています）。' },
        { os: 'mac', q: '「externally-managed-environment」と表示されました', a: 'Homebrew などでインストールした別のPythonが動いている可能性があります。レッスン2で python.org の公式インストーラーからインストールした python3 を使います。わからない場合は、画面を保存して相談してください。<b>sudo は使いません。</b>' },
        { q: '「Permission denied」などの権限エラーが表示されました', a: '自分のユーザーだけにインストールする方法があります（pip の公式の案内）。' + cmdOs('python -m pip install --user Pillow', 'python3 -m pip install --user Pillow') },
        { os: 'win', q: '「認識されません」と表示されました', a: 'Pythonが見つかっていません。レッスン2の、Pythonがインストールされているかを確認する画面で確かめてください。' },
        { os: 'mac', q: '「command not found」と表示されました', a: 'Pythonが見つかっていません。レッスン2の、Pythonがインストールされているかを確認する画面で確かめてください。' }
      ]
    },
    {
      id: 'h7', kind: 'pc', tag: 'PCで操作', title: 'カードニュースの表紙を作ってもらう',
      html:
        '<ol>' +
        '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。許可を求められたら、内容を読んで選びます。' +
        boxOs('Pillow を使って、「日本の桜の名所」というタイトルのSNS用カードニュースの表紙（横1080×縦1350ピクセル）を作るスクリプトを、cardnews フォルダの中に cover.py という名前で作成してください。' + FONT_WIN + '作成したら python で実行し、cover.png を作ってください。Pillowはインストール済みです。',
              'Pillow を使って、「日本の桜の名所」というタイトルのSNS用カードニュースの表紙（横1080×縦1350ピクセル）を作るスクリプトを、cardnews フォルダの中に cover.py という名前で作成してください。' + FONT_MAC + '作成したら python3 で実行し、cover.png を作ってください。Pillowはインストール済みです。') + '</li>' +
        '<li>VS Codeの左側で、<b>cardnews</b> フォルダの <b>cover.png</b> をクリックします。VS Codeの中で画像を確認できます。</li>' +
        '<li>タイトルが<b>日本語で正しく</b>表示されていれば成功です。</li>' +
        '</ol>' +
        '<p class="note">フォントを指定するのは、Pillowの標準フォントでは日本語が「□」になることがあるためです（公式の案内によると、標準フォントで使える文字は限られています）。</p>',
      help: [HELP_APPROVE, HELP_TOFU, HELP_INSTALL_AI]
    },
    {
      id: 'h8', kind: 'pc', tag: 'PCで操作', title: '表紙のデザインを修正してもらう',
      html:
        '<ol>' +
        '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。' + box('cover.py の配色を緑中心に変更し、デザインをもう少し洗練させてください。そのあと再度実行して、cover.png を作り直してください。') + '</li>' +
        '<li>もう一度 cover.png を開き、変わっていれば成功です。</li>' +
        '</ol>' +
        '<p class="note">ここで注目してほしいのは、<b>修正のたびにAIがスクリプトの中身を書き換えている</b>ことです。「タイトルだけ変えたい」ときも、毎回中身を書き換えるのは手間がかかります。次の画面で、これを楽にします。</p>',
      help: [HELP_APPROVE, { q: '許可の画面に「Update」と表示されました', a: '「Write」は新規作成、「Update」は既存ファイルの修正という意味です。同じ名前のファイルの中身が書き換わります。' }, { q: '画像が変わっていません', a: 'VS Codeで cover.png のタブをいったん閉じて、開き直してください。古い画像が表示されている場合があります。' }]
    },
    {
      id: 'h9', kind: 'know', tag: '基礎知識', title: 'CLIとは',
      html:
        '<ul class="parts">' +
        '<li><b>GUI</b>（ジー・ユー・アイ）ボタンやメニューをマウスで操作する<br><span>人にとってわかりやすい</span></li>' +
        '<li><b>CLI</b>（シー・エル・アイ）文字のコマンドで操作する。変えたい部分は「オプション」で指定する<br><span>マウスを使えないAIには、こちらが扱いやすい</span></li>' +
        '</ul>' +
        '<h2>コマンドの形式</h2>' +
        '<div class="card"><code>' + os('python', 'python3') + ' cardnews_cli.py --title "京都の桜" --color green --output kyoto.png</code><br>・<b>cardnews_cli.py</b>：実行する道具<br>・<b>--title</b>、<b>--color</b>、<b>--output</b>：オプション（何を変えるか。--output は保存するファイル名）<br>・<b>"京都の桜"</b>、<b>green</b>、<b>kyoto.png</b>：それぞれの値<br>（形式の例です。自分で入力する必要はありません）</div>' +
        '<p>CLIにしておけば、AIは<b>中身を書き換えずに</b>、オプションを変えるだけで何枚でも作れます。</p>',
      help: [
        { q: '難しそうです', a: 'コマンドはAIが組み立てます。「オプションでタイトルや色を変えられる道具」と理解できれば十分です。' }
      ]
    },
    {
      id: 'h10', kind: 'pc', tag: 'PCで操作', title: '表紙の道具をCLIにしてもらう',
      html:
        '<ol>' +
        '<li>まず、変更できる項目を説明してもらいます。' + box('cover.py で変更できる項目（タイトル、色、文字の大きさなど）をすべて、わかりやすい言葉で説明してください。') + '</li>' +
        '<li>次に、CLIにしてもらいます。許可を求められたら、内容を読んで選びます。' + box('それらの項目をオプションで指定できる cardnews_cli.py を、cardnews フォルダの中に作成してください。タイトルと色を変えて3回試し、できた画像のファイル名を教えてください。') + '</li>' +
        '<li>画面の記録で、同じ cardnews_cli.py が<b>オプション（--title など）だけを変えて3回</b>実行されたことを確認します。</li>' +
        '<li>cardnews フォルダに新しい画像が3枚でき、タイトルや色が異なっていれば成功です。</li>' +
        '</ol>',
      help: [HELP_APPROVE, HELP_TOFU]
    },
    {
      id: 'h11', kind: 'know', tag: '基礎知識', title: 'スキルの中身：SKILL.md',
      html:
        '<p>スキルは<b>1つのフォルダ</b>です（公式の案内）。</p>' +
        '<div class="card"><code>.claude/skills/cardnews/</code><br>　├ <b>SKILL.md</b>（手引き書）<br>　└ <b>scripts/</b>（道具。cardnews_cli.py など）</div>' +
        '<ul class="parts">' +
        '<li><b>SKILL.md の上部</b>「---」で挟む<br><span>name（名前）と description（いつ使うか）</span></li>' +
        '<li><b>SKILL.md の下部</b>普通の文章<br><span>道具の使い方、フォント、保存先など。AIとの「取り決め」</span></li>' +
        '</ul>' +
        '<p class="note">公式の案内では、スキルの中のスクリプトは読み込まれるのではなく、<b>実行される</b>道具です。そのため、スキルを使うときも、manual では実行の前に許可を求められます。</p>',
      help: [
        { q: '自分で書く必要がありますか？', a: 'いいえ。このレッスンではAIに書いてもらいます。できたら自分で開いて、中身を読みます。' }
      ]
    },
    {
      id: 'h12', kind: 'pc', tag: 'PCで操作', title: '「/cardnews」スキルを作ってもらう',
      html:
        '<ol>' +
        '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。許可を求められたら、内容を読んで選びます。' +
        boxOs('cardnews_cli.py を、表紙だけでなく本文のページも作れるようにしてください（オプションで切り替え）。そのあと、このフォルダの .claude/skills/cardnews にスキルとしてまとめてください。スクリプトはスキルの scripts フォルダに置いてください。SKILL.md には、name（cardnews にしてください）と description、道具の使い方、フォント（C:\\Windows\\Fonts\\YuGothB.ttc）、保存先フォルダの決め方、実行には python を使うことを書いてください。allowed-tools の行は書かないでください。',
              'cardnews_cli.py を、表紙だけでなく本文のページも作れるようにしてください（オプションで切り替え）。そのあと、このフォルダの .claude/skills/cardnews にスキルとしてまとめてください。スクリプトはスキルの scripts フォルダに置いてください。SKILL.md には、name（cardnews にしてください）と description、道具の使い方、フォント（/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc）、保存先フォルダの決め方、実行には python3 を使うことを書いてください。allowed-tools の行は書かないでください。') + '</li>' +
        '<li>VS Codeの左側で <b>.claude/skills/cardnews/SKILL.md</b> を開き、中身を読みます。先頭部分に <b>allowed-tools</b> という行があったら、「allowed-tools の行を削除してください」と依頼します（この行があると、そのスキルの実行が許可なしで進むことがあります）。</li>' +
        '<li>Claude Codeを<b>起動し直します</b>（<b>/exit</b> → <b>claude -c</b>）。公式の案内によると、起動時に存在しなかった skills フォルダは、まだ監視の対象になっていないためです。起動し直すと、このあと作るスキルも自動で読み込まれます。</li>' +
        '<li>入力欄に <b>/card</b> まで入力すると、一覧に <b>/cardnews</b> が表示されます。表示されれば成功です（Escキーで閉じて、次の画面へ進みます）。</li>' +
        '</ol>' +
        '<p class="note">起動し直さずに読み込む <b>/reload-skills</b> というコマンドもあります（公式の案内）。その場合は、skills フォルダの中を変更するたびに入力し直します。</p>',
      help: [
        HELP_APPROVE,
        { q: '/cardnews が一覧に出ません', a: '① .claude/skills/cardnews/SKILL.md の場所 ② SKILL.md の先頭にある「---」の部分、を確認します。そのあと /reload-skills を入力します。' + cmd('/reload-skills') },
        HELP_RESTART
      ]
    },
    {
      id: 'h13', kind: 'pc', tag: 'PCで操作', title: '「/cardnews」で6枚まとめて作る',
      html:
        '<p>スキルだけで動くかを確かめるため、まず会話を<b>クリア</b>します。</p>' +
        '<ol>' +
        '<li>入力欄に <b>/clear</b> と入力し、Enterキーを押します（レッスン4）。' + cmd('/clear') + '</li>' +
        '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。Webの検索とスクリプトの実行で、何度か許可を求められます。' + box('/cardnews 日本の桜の名所についてWebで調べ、6枚のカードニュースを作ってください。保存先は sakura フォルダにしてください。最後の1枚には出典（URL）を記載してください。') + '</li>' +
        '<li>VS Codeの左側で、<b>sakura</b> フォルダの画像を1枚ずつ開いて確認します。</li>' +
        '<li>6枚そろっていて、日本語が正しく表示されていれば成功です。</li>' +
        '</ol>' +
        '<p class="note">/cardnews と入力した時点で、SKILL.md の中身が読み込まれます。そのため、前の会話がなくても、AIは作り方・フォント・保存先をすでに把握しています。スキルなしで同じ依頼をすると、AIは「どんなデザインにしますか？」などと聞き返すことが多くなります。</p>' +
        '<p class="note warn">調べた内容が間違っていることもあります。出典のページを開いて、自分でも確認します。</p>',
      help: [HELP_APPROVE, HELP_TOFU, { q: '6枚より少ないです', a: '「あと○枚作ってください」と、続けて依頼します。' }]
    },
    {
      id: 'h14', kind: 'pc', tag: 'PCで操作', title: '画像を1つのPDFにまとめてもらう',
      html:
        '<p>6枚の画像を、配布しやすい<b>PDF</b>（1つのファイル）にまとめます。Pillowだけで作成できるため（公式の案内）、変換サイトに画像をアップロードする必要はありません。</p>' +
        '<ol>' +
        '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。' + box('Pillow だけを使って、sakura フォルダの画像を名前順に1つのPDFにまとめるスクリプトを img2pdf.py という名前で作成し、実行してください。PDFは agent1 フォルダ（現在のフォルダ）の直下に、sakura.pdf という名前で保存してください。') + '</li>' +
        '<li>' + os('エクスプローラー', 'Finder') + 'で agent1 フォルダを開き、<b>sakura.pdf</b> をダブルクリックします。' + os('ブラウザ（Edgeなど）', '「プレビュー」') + 'で開きます。</li>' +
        '<li>6ページのPDFになっていれば成功です。</li>' +
        '</ol>',
      help: [HELP_APPROVE, HELP_INSTALL_AI, { q: 'agent1 フォルダの場所がわかりません', a: 'VS Codeの左側で sakura.pdf を' + os('右クリック', 'Controlキーを押しながらクリック') + 'し、' + os('「エクスプローラーで表示」', '「Finderで表示」') + 'を選ぶと開けます。' }]
    },
    {
      id: 'h15', kind: 'pc', tag: 'PCで操作', title: '「/img2pdf」スキルにまとめる',
      html:
        '<ol>' +
        '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。' +
        boxOs('img2pdf.py を、このフォルダの .claude/skills/img2pdf にスキルとしてまとめてください。どのフォルダの画像をどのPDFにまとめるかを、オプションで指定できるようにしてください。Pillow だけを使い、ほかのライブラリはインストールしないでください。SKILL.md には、name（img2pdf にしてください）、使い方、実行には python を使うことを書いてください。allowed-tools の行は書かないでください。',
              'img2pdf.py を、このフォルダの .claude/skills/img2pdf にスキルとしてまとめてください。どのフォルダの画像をどのPDFにまとめるかを、オプションで指定できるようにしてください。Pillow だけを使い、ほかのライブラリはインストールしないでください。SKILL.md には、name（img2pdf にしてください）、使い方、実行には python3 を使うことを書いてください。allowed-tools の行は書かないでください。') + '</li>' +
        '<li>入力欄に <b>/clear</b> と入力して会話をクリアしてから、スキルで試します。' + box('/img2pdf cardnews フォルダの画像を、agent1 フォルダ直下の cardnews.pdf にまとめてください。') + '</li>' +
        '<li><b>cardnews.pdf</b> ができていれば成功です。</li>' +
        '</ol>' +
        '<p class="note">「/cardnews」スキルを作った画面で起動し直したので、skills フォルダは監視されています。新しいスキルはその場で読み込まれます（公式の案内）。表示されない場合は /reload-skills を入力します。</p>',
      help: [HELP_APPROVE, { q: '/img2pdf が表示されません', a: '/reload-skills を入力してから、もう一度試します。' }]
    },
    {
      id: 'h16', kind: 'know', tag: '基礎知識', title: 'プラグインと安全のルール',
      html:
        '<p><b>プラグイン</b>は、スキル・MCP（レッスン6）・サブエージェント（レッスン5）などを<b>まとめて配布できる形にしたもの</b>です。アプリとアプリストアのような関係で、<b>マーケットプレイス</b>（プラグインが並ぶストア）からインストールします。</p>' +
        '<ul class="parts">' +
        '<li><b>公式のマーケットプレイス</b>claude-plugins-official。最初から登録されている<br><span>公式の案内によると、Anthropic製のものに加えて、<b>ほかの会社や個人が作ったもの</b>も並んでいます</span></li>' +
        '<li><b>ほかの人のマーケットプレイス</b>誰でも作れる<br><span>公式の案内によると、Anthropicはその中身を確認していません</span></li>' +
        '</ul>' +
        '<p class="note warn">公式の案内によると、プラグインは<b>あなたの権限で、どんなプログラムでも実行できます</b>。Claude Codeの許可の画面では、プラグイン自身が実行するプログラムまでは止められません。インストールする前に説明の画面で<b>作成者</b>を確認し、信頼できるものだけを入れます。</p>',
      help: [
        { q: 'マーケットプレイスの名前に「公式」とあれば安全ですか？', a: '公式の案内によると、マーケットプレイスの名前は「誰が並べているか」を示すだけで、中のプラグインが安全かどうかは示しません。公式のマーケットプレイスにも、ほかの会社や個人のプラグインがあります。' }
      ]
    },
    {
      id: 'h17', kind: 'pc', tag: 'PCで操作', title: '公式プラグイン「skill-creator」をインストールする',
      html:
        '<p>スキルを作ることも、実は「繰り返しの作業」です。それをスキルにしたのが <b>skill-creator</b>（スキルを作るスキル）です。作成者は Anthropic です。</p>' +
        '<ol>' +
        '<li>まず、ストアで探します。<b>/plugin</b> と入力し、Tabキーで「<b>Discover</b>」（探す）に切り替えて、<b>skill-creator</b> と入力します。作成者（Anthropic）と説明を読んだら、Escキーで閉じます。' + cmd('/plugin') + '</li>' +
        '<li>インストールします。下の「コピー」を押し、貼り付けてEnterキーを押します。' + cmd('/plugin install skill-creator@claude-plugins-official') + '</li>' +
        '<li>公式の案内によると、すぐにはインストールされず、<b>説明の画面</b>が開きます。作成者（Anthropic）と内容を読みます。</li>' +
        '<li>インストールする範囲を選びます。今回は<b>「Install for you, in this repo only (local scope)」</b>（このフォルダで自分だけ）を選びます。</li>' +
        '<li>「Plugin is now active.」または「Run /reload-plugins to apply.」と表示されたら、そのままで問題ありません（後者の場合も自動で読み込まれます）。どちらも表示されない場合は、次のコマンドを入力します。' + cmd('/reload-plugins') + '</li>' +
        '<li>入力欄に <b>/skill-</b> まで入力し、一覧に <b>/skill-creator:skill-creator</b> が表示されれば成功です（Escキーで閉じます）。</li>' +
        '</ol>' +
        '<p class="note"><b>/plugin</b> には「Discover」（探す）・「Installed」（インストール済み）・「Marketplaces」（マーケットプレイス）・「Errors」（エラー）などのタブがあり、Tabキーで切り替えます。ほかのプラグインも、Discover で<b>見るだけ</b>なら安全です。</p>',
      help: [
        { q: 'マーケットプレイスが見つからないと表示されます', a: '公式の案内によると、次のコマンドで公式のマーケットプレイスを追加できます。' + cmd('/plugin marketplace add anthropics/claude-plugins-official') },
        { q: '範囲の選び方がわかりません', a: '「user」はすべてのフォルダで自分だけ、「project」はこのフォルダを使う全員、「local」はこのフォルダで自分だけです。練習なので、最も狭い local にします。' },
        { q: 'プラグインを削除したいです', a: '/plugin を開き、「Installed」で skill-creator を選ぶと、削除（Uninstall）を選べます。' },
        { q: '/skill-creator:skill-creator が一覧に出ません', a: '/reload-plugins を入力してから、もう一度 /skill- まで入力します。警告が表示されて止まった場合は /reload-plugins --force を入力します。「couldn\'t be loaded」と表示された場合は、/plugin の「Errors」タブを確認します。' + cmd('/reload-plugins') },
        { q: '/anthropic-skills:… という名前も表示されます', a: 'claude.ai の設定から追加されたスキルの場合があります。この画面では <b>/skill-creator:skill-creator</b> のほうを使います。' },
        HELP_ENG
      ]
    },
    {
      id: 'h18', kind: 'pc', tag: 'PCで操作', title: 'skill-creatorで写真補正のスキルを作る',
      html:
        '<ol>' +
        '<li>念のため、元の画像をコピーしておきます。' + box('sakura フォルダを丸ごと、sakura-backup という名前でコピーしてください。') + '</li>' +
        '<li>skill-creator でスキルを作ってもらいます。下の「コピー」を押し、貼り付けてEnterキーを押します。質問されたら答えます。' +
        boxOs('/skill-creator:skill-creator 写真を補正する「ミニフォトショップ」のスキルを、photo-edit という名前で、このフォルダの .claude/skills に作成してください。機能：明るさ・コントラスト・鮮やかさ（彩度）の調整と、横:縦の比率の変更（1:1・4:5・9:16。4:5 と 9:16 は縦長。中央を切り抜く）。スマホの写真は、向きの情報（EXIF）に合わせて正しい向きにしてから処理してください。1枚だけでも、フォルダ内の画像すべてでも処理できるようにしてください。元の画像は上書きせず、edited フォルダに保存してください。Pillow を使い、実行には python を使ってください。テスト（評価）と説明の最適化は行わないでください。allowed-tools の行は書かないでください。',
              '/skill-creator:skill-creator 写真を補正する「ミニフォトショップ」のスキルを、photo-edit という名前で、このフォルダの .claude/skills に作成してください。機能：明るさ・コントラスト・鮮やかさ（彩度）の調整と、横:縦の比率の変更（1:1・4:5・9:16。4:5 と 9:16 は縦長。中央を切り抜く）。スマホの写真は、向きの情報（EXIF）に合わせて正しい向きにしてから処理してください。1枚だけでも、フォルダ内の画像すべてでも処理できるようにしてください。元の画像は上書きせず、edited フォルダに保存してください。Pillow を使い、実行には python3 を使ってください。テスト（評価）と説明の最適化は行わないでください。allowed-tools の行は書かないでください。') + '</li>' +
        '<li>skill-creator がどんなスキルにするかの<b>質問を始めたら</b>、プラグインが使われています。質問に答え、完成したら <b>.claude/skills/photo-edit/SKILL.md</b> を開いて読みます。</li>' +
        '<li>試します。' + box('/photo-edit sakura フォルダの画像すべての明るさを10%上げ、横:縦を1:1（中央を切り抜き）にしてください。') + '</li>' +
        '<li><b>edited</b> フォルダに正方形の画像ができていて、<b>sakura フォルダの元の画像が変わっていなければ</b>成功です。</li>' +
        '</ol>' +
        '<p class="note">skill-creator には、スキルの「テスト（評価）」機能もあります（公式の案内）。テストを行うと使用量が増えるため、今回は使いません。</p>',
      help: [
        HELP_APPROVE,
        { q: '/photo-edit が表示されません', a: '/reload-skills を入力してから、もう一度試します。' + cmd('/reload-skills') },
        { q: '「テストをしますか？」と聞かれました', a: '「しない」と答えてかまいません。' },
        { q: '元の画像が変わってしまいました', a: 'sakura-backup フォルダにコピーがあります。「元の画像は上書きしないでください」と SKILL.md に書き加えてもらいます。' }
      ]
    },
    {
      id: 'h19', kind: 'pc', tag: 'PCで操作', title: '同じ計算でスライダー付きのWebページを作る',
      html:
        '<p>CLIはAI向け、<b>スライダー付きのWebページ</b>は人向けです。<b>同じ計算</b>を使って、人が操作する画面も作れます。</p>' +
        '<div class="card"><b>使い分け</b><br>・<b>1枚</b>の画像でちょうどよい明るさを探す → 見ながら調整できる <b>Webページ</b><br>・<b>多数</b>の画像を同じように補正する → <b>/photo-edit</b>（スキル）</div>' +
        '<ol>' +
        '<li>下の「コピー」を押し、貼り付けてEnterキーを押します。' + box('photo-edit スキルのスクリプトと同じ計算で、ブラウザ上でスライダーを動かして明るさ・コントラスト・鮮やかさ（彩度）を調整できるWebページを、photo-edit.html という1つのファイルで作成してください。CSSのフィルターではなく、canvas で1ピクセルずつ、スクリプトと同じ式で計算してください。値の決め方も、スクリプトのオプションと同じにしてください。画像はパソコン内から選び、インターネットには送信しないようにしてください。現在の値を表示し、その値で /photo-edit を使うコマンドをコピーできるボタンも付けてください。コントラストは、Pillow の ImageEnhance.Contrast と同じく、画像全体をグレースケールにしたときの平均の明るさを基準にしてください。調整の順番（明るさ→コントラスト→鮮やかさ）と、平均を計算する画像（縮小前の元の画像）も、スクリプトとそろえてください。photo-edit.html は agent1 フォルダ（現在のフォルダ）の直下に置いてください。') + '</li>' +
        '<li>' + os('エクスプローラー', 'Finder') + 'で <b>photo-edit.html</b> をダブルクリックし、ブラウザで開きます。</li>' +
        '<li>sakura フォルダの画像を1枚選び、スライダーを動かしてちょうどよい値を探します。</li>' +
        '<li>「コピー」のボタンでコマンドをコピーし、Claude Codeの入力欄に貼り付けます。「sakura フォルダの画像すべて」と書き足して、Enterキーを押します。</li>' +
        '<li>edited フォルダの画像が、Webページで見た色と同じようになっていれば成功です。</li>' +
        '</ol>',
      help: [HELP_APPROVE, { q: 'photo-edit.html の場所がわかりません', a: 'VS Codeの左側で photo-edit.html を' + os('右クリック', 'Controlキーを押しながらクリック') + 'し、' + os('「エクスプローラーで表示」', '「Finderで表示」') + 'を選ぶと開けます。' }, { q: '画像が表示されません', a: 'ページの「ファイルを選択」などのボタンで、画像を選び直します。ブラウザを変える（' + os('EdgeやChrome', 'SafariやChrome') + 'など）と動く場合もあります。' }, { q: 'Webページと /photo-edit で色が少し違います', a: '計算方法がずれている可能性があります。「Webページとスクリプトの計算を同じ式にそろえてください」と依頼します。' }]
    },
    {
      id: 'h20', kind: 'know', tag: 'クイズ', title: 'スキルと道具作りのクイズ',
      widget: 'quiz',
      quiz: [
        { q: 'スキルの最大の特徴は？', options: ['常に全体が読まれる', '普段は名前と説明だけが読まれ、使うときに中身が読まれる', 'パスワードを記憶する'], answer: 1, explain: '公式の案内では、説明は常に読まれ、中身は使うときだけ読まれます。そのため、たくさん作っても作業机が散らかりません。' },
        { q: 'ライブラリとは？', options: ['誰かが作ったプログラムの部品のセット', '本を借りる場所（図書館）のことだけ', 'パソコンの電源'], answer: 0, explain: '人が作った部品を組み立てて、自分の道具を作ります。' },
        { q: 'Pillowで日本語が「□」になるときは？', options: ['あきらめる', 'パソコンを買い替える', '日本語に対応したフォントを指定する'], answer: 2, explain: '標準フォントで使える文字は限られているため、日本語のフォント（游ゴシック・ヒラギノなど）を指定します。' },
        { q: 'CLIにする利点は？', options: ['オプションを変えるだけで、中身を書き換えずに何枚でも作れる', 'マウスでしか使えなくなる', '画像がきれいになる'], answer: 0, explain: 'AIはオプションを組み立てるだけで、同じ道具を繰り返し使えます。' },
        { q: 'プロジェクトのスキルはどこに置く？', options: ['デスクトップ', '.claude/skills/名前/SKILL.md', 'CLAUDE.md の中'], answer: 1, explain: '公式の案内では、.claude/skills の中にスキル名のフォルダを作り、そこに SKILL.md を置きます。' },
        { q: 'skills フォルダを初めて作ったのに、/名前 が表示されません。どうする？', options: ['/reload-skills を入力する', 'スキルの名前を日本語にする', 'Pillowを入れ直す'], answer: 0, explain: '起動時に存在しなかった skills フォルダを作った場合は、/reload-skills で読み込みます。' },
        { q: 'プラグインをインストールするときの安全のルールは？', options: ['名前が公式らしければ何でも入れる', '入手元に関係なく、作成者と中身を確認し、信頼できるものだけを入れる', 'AIに任せて、中身は見ない'], answer: 1, explain: 'プラグインは、あなたの権限でどんなプログラムでも実行できます。' },
        { q: 'スキルにするとよいのはどんなとき？', options: ['1回しか使わないとき', '同じ依頼を3回以上するとき', 'パソコンを買ったとき'], answer: 1, explain: '1回だけなら、その場で依頼すれば十分です。繰り返す作業はスキルにまとめると、毎回同じ手順で、短い入力で呼び出せます。' },
        { q: '写真を補正するときに大事なことは？', options: ['元の画像にそのまま上書きする', '個人の写真を積極的に使う', '元の画像は残し、別のフォルダに保存する'], answer: 2, explain: '元の画像を残しておけば、失敗してもやり直せます。' }
      ],
      html: '<p>学んだ内容をクイズで確認します。選択すると答えが表示されます。採点はしません。</p>',
      help: [
        { q: '間違えました', a: '問題ありません。前の画面を見直してから、もう一度挑戦してください。何度でもやり直せます。' }
      ]
    },
    {
      id: 'h21', kind: 'check', tag: '確認', title: '最後の確認',
      widget: 'checks',
      checks: [
        'Pillowを自分でインストールし、バージョンを確認した',
        'カードニュースの表紙を作り、デザインを修正してもらった',
        '表紙の道具をCLIにして、3回試した',
        '/cardnews スキルを作り、6枚のカードを作った',
        '画像を1つのPDFにまとめ、/img2pdf スキルにした',
        '公式プラグイン skill-creator をインストールした',
        '/photo-edit で補正し、元の画像が残っていることを確認した',
        'スライダー付きのWebページで補正を試した（任意）'
      ],
      required: 7,
      html:
        '<div class="card goal"><b>このレッスンの流れ</b><br>① <b>ライブラリ</b>（人が作った部品）で道具を作る<br>② <b>CLI</b> にして、AIがオプションだけで使えるようにする<br>③ <b>スキル</b>にまとめ、「/名前」で呼び出す<br>④ <b>プラグイン</b>で、人と共有する（受け取る）</div>' +
        '<p>完了した項目にチェックを入れてください。<b>上の7つ</b>にチェックを入れると、「完了にする」を押せます。最後の1つは任意です。</p>' +
        '<p class="note">作ったスキル（cardnews・img2pdf・photo-edit）は、このフォルダで今後も使えます。不要になったら、.claude/skills の中の該当フォルダを削除すれば消えます。skill-creator は /plugin の「Installed」から削除できます。</p>',
      help: [
        { q: 'できなかったところがあります', a: 'そのステップに戻り、「困ったとき」を確認してください。何度でもやり直せます。' }
      ]
    }
  ];

  var lesson7 = {
    id: 'l7', no: 7, needsPc: true, ready: true, minutes: 120,
    title: '繰り返し作業をまとめる「スキル」',
    short: 'ライブラリ（Pillow）で画像を作る道具を作り、CLIにしてスキル（/cardnews・/img2pdf）にまとめる。公式プラグインで写真補正のスキルを作る',
    devices: 'PC',
    doneCard: '<b>レッスン7　完了です。お疲れさまでした。</b><br>決まった作業を道具とスキルにまとめ、「/名前」で呼び出せるようになりました。次はレッスン8です。',
    steps: steps
  };

  for (var i = 0; i < C.lessons.length; i++) {
    if (C.lessons[i].id === 'l7') { C.lessons[i] = lesson7; break; }
  }
})();
