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
  var FONT_WIN = '日本語の文字は、C:\\Windows\\Fonts\\YuGothB.ttc（游ゴシック）のフォントを使ってください。';
  var FONT_MAC = '日本語の文字は、/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc（ヒラギノ角ゴシック）のフォントを使ってください。見つからないときは、その中から日本語が使えるフォントを探してください。';

  var HELP_APPROVE = {
    q: 'AIが「許可しますか？」と聞いてきました',
    a: 'スクリプトを作る（Write）・動かす（' + os('Bash／PowerShell', 'Bash') + '）前に聞いてきます。内容を読んで、agent1 の中のことなら、<b>1番目の「Yes」</b>を選びます。フォントのフォルダ（' + os('C:\\Windows\\Fonts', '/System/Library/Fonts') + '）を<b>読むだけ</b>のときも、「Yes」で大丈夫です。Webの検索やページの読みこみ（WebSearch・Fetch）も、内容を見て「Yes」で大丈夫です。.claude フォルダ（スキルの置き場所）に書きこむときは、毎回聞かれます。1番目の「Yes」を選びます。「次から聞かない」の選択肢は選びません。わからないときは「いいえ(No)」で大丈夫です。'
  };
  var HELP_ENG = { q: '画面の文字が英語です', a: '大丈夫です。表示が英語でも、やることは同じです。' };
  var HELP_RESTART = {
    q: '起動しなおすには？',
    a: 'Claude Codeの入力欄に <b>/exit</b> と入れて、Enterキーを押します。ターミナルの行にもどったら、<b>claude -c</b> と入れると、前の会話の続きから始まります（レッスン4）。'
  };
  var HELP_TOFU = {
    q: '文字が「□」になりました',
    a: 'フォントが、日本語に対応していません。「日本語が表示できるフォントを使って、作りなおしてください」と頼みます。' + os('Windowsでは、C:\\Windows\\Fonts の YuGothB.ttc（游ゴシック）が使えます。', 'Macでは、ヒラギノ角ゴシックが使えます。')
  };
  var HELP_INSTALL_AI = {
    q: 'AIが「pip install」をしようとします',
    a: 'Pillowは、自分で入れてあります。「いいえ(No)」を選んで、「Pillowは、もう入っています」と伝えます。ほかのものを入れようとしたときも、名前と理由を聞いてから決めます。'
  };

  var steps = [
    {
      id: 'h1', kind: 'sample', tag: '今日のゴール', title: 'レッスン7で、できるようになること',
      html:
        '<p class="note warn"><b>このレッスンは、WindowsかMacのパソコンが必要です。</b>レッスン6が終わっている人向けです。画面の右上の「Windows／Mac」ボタンで、ご自分のパソコンのほうを選んでください。</p>' +
        '<p>同じお願いを、毎回、長い文で書くのは大変です。今日は、決まった作業を<b>道具（スクリプト）</b>にして、<b>スキル</b>としてしまっておき、<b>「/名前」ひとつで呼び出せる</b>ようにします。</p>' +
        '<div class="card goal"><b>ゴール</b><br>① <b>ライブラリ</b>（人が作った部品）で、カードニュースの画像を作る<br>② 画像を作る道具を、<b>CLI</b>（オプションで動かす形）にする<br>③ <b>スキル</b>にまとめて、<b>/cardnews</b>・<b>/img2pdf</b> で呼び出す<br>④ <b>プラグイン</b>（skill-creator）を入れて、写真補正のスキルを作る</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>かかる時間</dt><dd>約2時間（休みながらでOK）</dd>' +
        '<dt>つかうもの</dt><dd>VS Code、agent1フォルダ、Claude Code、Python（レッスン2で入れたもの）、Pillow（このあと、自分で入れます）</dd>' +
        '</dl></div>' +
        '<p class="note warn">写真の練習は、<b>個人の情報が写っていないもの</b>だけで行います。今日作るカードニュースの画像を使えば、安心です。</p>',
      help: [
        { q: 'Pythonが入っていません', a: 'レッスン2の「Pythonを入れる」の画面で、入れてください。' },
        { q: 'レッスン6が終わっていません', a: 'このレッスンは、レッスン6のつなぎ（コネクタ）を使わないので、レッスン5まで終わっていれば、進められます。' }
      ]
    },
    {
      id: 'h2', kind: 'pc', tag: 'PCで操作', title: 'おさらい：Claude Codeを、起動する',
      html:
        '<ol>' +
        '<li>VS Codeで、<b>agent1</b> フォルダを開きます。</li>' +
        '<li>「ターミナル」→「新しいターミナル」を選びます。</li>' +
        '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。' + cmd('claude') + '</li>' +
        '<li>画面の下の行が <b>manual mode on</b> になっているか、見ます。ちがうときは、Shift+Tabを押して、<b>manual</b> にします。</li>' +
        '</ol>',
      help: [
        { os: 'win', q: '「認識されません」と出ました', a: 'VS Codeを、いったん完全に閉じて、もう一度開いて、新しいターミナルで試してください。' },
        { os: 'mac', q: '「command not found」と出ました', a: 'VS Codeを、⌘（Command）キーとQキーで、いったん完全に終了して、もう一度開いて、新しいターミナルで試してください。' },
        HELP_ENG
      ]
    },
    {
      id: 'h3', kind: 'know', tag: '知っておこう', title: '「スキル」って、なに？',
      html:
        '<p><b>スキル</b>は、<b>必要なときだけ取り出す、手引き書</b>です。</p>' +
        '<ul class="parts">' +
        '<li><b>CLAUDE.md</b>いつも、全部読まれる<br><span>書くことが増えると、AIの机（コンテキスト）が、いっぱいになる</span></li>' +
        '<li><b>スキル</b>ふだんは「名前と説明」だけ読まれる<br><span>使うときに、中身を読む（公式の案内）。たくさん作っても、机が散らからない</span></li>' +
        '</ul>' +
        '<h2>スキルがあると、何がうれしい？</h2>' +
        '<ul class="parts">' +
        '<li><b>スキルなし</b>毎回、長いお願いを書く<br><span>書き方がちがうと、結果もばらばらになる</span></li>' +
        '<li><b>スキルあり</b>「/cardnews 桜」のように、短く呼ぶ<br><span>いつも同じやり方で、作ってくれる</span></li>' +
        '</ul>' +
        '<div class="card goal"><b>いつ、スキルにする？</b><br>1回だけの作業なら、その場で頼めば十分です。<b>同じことを3回以上たのむ</b>なら、スキルにまとめる目安です。</div>' +
        '<p class="note">公式の案内では、スキルは、自分で「/名前」と入れて呼べるほか、AIが説明を読んで、<b>自分で使う</b>こともあります。</p>',
      help: [
        { q: 'サブエージェント（レッスン5）と、何がちがいますか？', a: '公式の案内では、スキルは、どの会話にも読みこめる「手引き書」、サブエージェントは、別の机で働く「助手」です。' }
      ]
    },
    {
      id: 'h4', kind: 'know', tag: '知っておこう', title: '「ライブラリ」って、なに？',
      html:
        '<p><b>ライブラリ</b>は、だれかが作って、みんなが使えるようにした、<b>プログラムの部品のセット</b>です。</p>' +
        '<ul class="parts">' +
        '<li><b>AIの動き方</b>お願い → スクリプトを書く（Write） → 動かす（' + os('Bash／PowerShell', 'Bash') + '）<br><span>レッスン2の計算機と、同じ流れ</span></li>' +
        '<li><b>部品を組み立てる</b>「文字を書く部品」「色をぬる部品」をつないで、画像を作る<br><span>中の仕組みを知らなくても、使い方がわかれば使える</span></li>' +
        '</ul>' +
        '<p>部品は、たいてい、もう世の中にあります。<b>人は「何を作るか」を考え、組み立てはAIにまかせる</b>のが、これからのやり方です。どんな部品があるかを知っていると、①思いつくことが広がる ②まちがいが減る ③時間と使用量が少なくてすむ、のがよいところです。</p>' +
        '<p class="note">人が作って分け合う部品には、<b>ライブラリ</b>のほかに、<b>オープンソース</b>（中身が公開されたプログラム）や、今日作る<b>スキル</b>もあります。どれも「入れると、決まった仕事をしてくれる箱」のようなものです。</p>' +
        '<p>今日は、画像を作るライブラリ <b>Pillow</b>（ピロー）を使います。</p>' +
        '<p class="note warn">ライブラリは、<b>正しい名前</b>で入れます。よく似た名前の、にせものがあることもあります。わからない名前のものを、AIに入れさせないでください。</p>',
      help: [
        { q: 'スクリプトとは？', a: 'パソコンにさせる作業の手順を書いた、小さなプログラムです。今日は、AIが Python で書きます。' }
      ]
    },
    {
      id: 'h6', kind: 'pc', tag: 'PCで操作', title: 'ライブラリを、すすめてもらう',
      html:
        '<p>まず、AIに「どの部品を使えばいいか」を聞きます。</p>' +
        '<ol>' +
        '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。' + box('SNS用のカードニュース（文字の入った画像）を作りたいです。Pythonのライブラリは、何を使うといいですか？ やさしい言葉で教えてください。インストールはしないで、名前と、えらぶ理由だけ教えてください。') + '</li>' +
        '<li>Pillowが、候補に出てきたら、成功です。</li>' +
        '</ol>' +
        '<p class="note">ほかのライブラリを、すすめられることもあります。今日は、日本語の文字も入れられて、よく使われている <b>Pillow</b> を使います。次の画面で、自分で入れます。</p>',
      help: [{ q: 'AIが「pip install」をしようとします', a: '「いいえ(No)」を選びます。<b>いまは、まだ入れません。</b>「いまはインストールしないで、名前と、すすめる理由だけ教えてください」と伝えます。入れるのは、次の画面で、自分で行います。' }]
    },
    {
      id: 'h5', kind: 'pc', tag: 'PCで操作', title: 'Pillowを、自分で入れる',
      html:
        '<p>ライブラリは、<b>ふつうのターミナル</b>で、<b>自分で</b>入れます（レッスン2のPythonと同じ考え方です）。</p>' +
        '<ol>' +
        '<li>Claude Codeの入力欄に <b>/exit</b> と入れて、Enterキーを押します。</li>' +
        '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。' + cmdOs('python -m pip install Pillow', 'python3 -m pip install Pillow') + '</li>' +
        '<li>「Successfully installed」のような文が出たら、入りました。次で、確かめます。' + cmdOs('python -c "import PIL; print(PIL.__version__)"', 'python3 -c "import PIL; print(PIL.__version__)"') + '</li>' +
        '<li>数字（バージョン）が出たら、成功です。<b>claude -c</b> で、Claude Codeにもどります。' + cmd('claude -c') + '</li>' +
        '</ol>' +
        '<p class="note">Pillowの公式の案内でも、<b>-m pip</b> の形で入れる方法が書かれています。</p>',
      help: [
        { q: '「Requirement already satisfied」と出ました', a: 'もう入っている、という意味です。そのまま、次へ進んで大丈夫です。' },
        { q: '「Failed building wheel」など、長いエラーが出ました', a: 'Pythonが新しすぎて、Pillowの準備がまだのことがあります。' + os('python --version', 'python3 --version') + ' で出た数字をメモして、相談してください（2026年10月の時点で、Pillowは Python 3.15 にも対応しています）。' },
        { os: 'mac', q: '「externally-managed-environment」と出ました', a: 'Homebrew などで入れた、別のPythonが動いていることがあります。レッスン2の、python.org の公式のインストーラーで入れた python3 を使います。わからないときは、画面を保存して、相談してください。<b>sudo は使いません。</b>' },
        { q: '「Permission denied」や、権限のエラーが出ました', a: '自分の分だけに入れる方法があります（pip の公式の案内）。' + cmdOs('python -m pip install --user Pillow', 'python3 -m pip install --user Pillow') },
        { os: 'win', q: '「認識されません」と出ました', a: 'Pythonが、見つかっていません。レッスン2の「Pythonが入っているか、確かめる」の画面で、確かめてください。' },
        { os: 'mac', q: '「command not found」と出ました', a: 'Pythonが、見つかっていません。レッスン2の「Pythonが入っているか、確かめる」の画面で、確かめてください。' }
      ]
    },
    {
      id: 'h7', kind: 'pc', tag: 'PCで操作', title: 'カードニュースの、表紙を作ってもらう',
      html:
        '<ol>' +
        '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。許可を聞かれたら、内容を読んで選びます。' +
        boxOs('Pillow を使って、「日本の桜の名所」を題名にした、SNS用のカードニュースの表紙（よこ1080・たて1350ピクセル）を作るスクリプトを、cardnews フォルダの中に cover.py という名前で作ってください。' + FONT_WIN + '作ったら、python で実行して、cover.png を作ってください。Pillowは、もう入っています。',
              'Pillow を使って、「日本の桜の名所」を題名にした、SNS用のカードニュースの表紙（よこ1080・たて1350ピクセル）を作るスクリプトを、cardnews フォルダの中に cover.py という名前で作ってください。' + FONT_MAC + '作ったら、python3 で実行して、cover.png を作ってください。Pillowは、もう入っています。') + '</li>' +
        '<li>VS Codeの左側で、<b>cardnews</b> フォルダの <b>cover.png</b> をクリックします。VS Codeの中で、画像が見られます。</li>' +
        '<li>題名が、<b>日本語で正しく</b>表示されていたら、成功です。</li>' +
        '</ol>' +
        '<p class="note">フォントを指定するのは、Pillowの標準のフォントだと、日本語が「□」になってしまうことがあるからです（公式の案内では、標準のフォントは使える文字が少ない、とあります）。</p>',
      help: [HELP_APPROVE, HELP_TOFU, HELP_INSTALL_AI]
    },
    {
      id: 'h8', kind: 'pc', tag: 'PCで操作', title: '表紙の、デザインを直してもらう',
      html:
        '<ol>' +
        '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。' + box('cover.py の色を、緑を中心にした色に変えて、デザインを、もう少しおしゃれにしてください。そのあと、もう一度実行して、cover.png を作りなおしてください。') + '</li>' +
        '<li>もう一度 cover.png を開いて、変わっていたら成功です。</li>' +
        '</ol>' +
        '<p class="note">ここで気づいてほしいのは、<b>直すたびに、AIがスクリプトの中身を書きかえている</b>ことです。「題名だけ変えたい」ときも、毎回、中身を書きかえるのは、手間がかかります。次の画面で、これを楽にします。</p>',
      help: [HELP_APPROVE, { q: '許可の画面に「Update」と出ました', a: '「Write」は新しく作る、「Update」はもうあるファイルを直す、という意味です。同じ名前のファイルの中身が、書きかわります。' }, { q: '画像が変わっていません', a: 'VS Codeで、cover.png のタブを一度閉じて、開きなおしてください。古い画像が見えていることがあります。' }]
    },
    {
      id: 'h9', kind: 'know', tag: '知っておこう', title: '「CLI」って、なに？',
      html:
        '<ul class="parts">' +
        '<li><b>GUI</b>（ジー・ユー・アイ）ボタンやメニューを、マウスで押して使う<br><span>人には、わかりやすい</span></li>' +
        '<li><b>CLI</b>（シー・エル・アイ）文字の命令で使う。変えたいところは「オプション」で伝える<br><span>マウスを使えないAIには、こちらが使いやすい</span></li>' +
        '</ul>' +
        '<h2>命令の形</h2>' +
        '<div class="card"><code>' + os('python', 'python3') + ' cardnews_cli.py --title "京都の桜" --color green --output kyoto.png</code><br>・<b>cardnews_cli.py</b>：動かす道具<br>・<b>--title</b>、<b>--color</b>、<b>--output</b>：オプション（何を変えるか。--output は保存する名前）<br>・<b>"京都の桜"</b>、<b>green</b>、<b>kyoto.png</b>：その値<br>（形の例です。自分で入力しなくて大丈夫です）</div>' +
        '<p>CLIにしておけば、AIは、<b>中身を書きかえずに</b>、オプションを変えるだけで、何枚でも作れます。</p>',
      help: [
        { q: 'むずかしそうです', a: '命令は、AIが組み立てます。「オプションで、題名や色を変えられる道具」と、わかれば十分です。' }
      ]
    },
    {
      id: 'h10', kind: 'pc', tag: 'PCで操作', title: '表紙の道具を、CLIにしてもらう',
      html:
        '<ol>' +
        '<li>まず、変えられる項目を、説明してもらいます。' + box('cover.py で変えられる項目（題名、色、文字の大きさなど）を、ぜんぶ、やさしい言葉で説明してください。') + '</li>' +
        '<li>次に、CLIにしてもらいます。許可を聞かれたら、内容を読んで選びます。' + box('その項目を、オプションで指定できる cardnews_cli.py を、cardnews フォルダの中に作ってください。題名と色を変えて、3回ためしてください。できた画像のファイル名を、教えてください。') + '</li>' +
        '<li>画面の記録で、同じ cardnews_cli.py が、<b>オプション（--title など）だけ変えて、3回</b>動いたことを確かめます。</li>' +
        '<li>cardnews フォルダに、新しい画像が3枚できて、題名や色がちがっていたら、成功です。</li>' +
        '</ol>',
      help: [HELP_APPROVE, HELP_TOFU]
    },
    {
      id: 'h11', kind: 'know', tag: '知っておこう', title: 'スキルの中身：SKILL.md',
      html:
        '<p>スキルは、<b>1つのフォルダ</b>です（公式の案内）。</p>' +
        '<div class="card"><code>.claude/skills/cardnews/</code><br>　├ <b>SKILL.md</b>（手引き書）<br>　└ <b>scripts/</b>（道具。cardnews_cli.py など）</div>' +
        '<ul class="parts">' +
        '<li><b>SKILL.md の上の部分</b>「---」ではさむ<br><span>name（名前）と description（いつ使うか）</span></li>' +
        '<li><b>SKILL.md の下の部分</b>ふつうの文章<br><span>道具の使い方、フォント、保存する場所など。AIとの「約束」</span></li>' +
        '</ul>' +
        '<p class="note">公式の案内では、スキルの中のスクリプトは、読みこまれるのではなく、<b>実行される</b>道具です。だから、スキルを使うときも、manual では、実行の前に許可を聞かれます。</p>',
      help: [
        { q: '自分で書かないといけませんか？', a: 'いいえ。今日は、AIに書いてもらいます。できたら、自分で開いて、中身を読みます。' }
      ]
    },
    {
      id: 'h12', kind: 'pc', tag: 'PCで操作', title: '「/cardnews」スキルを、作ってもらう',
      html:
        '<ol>' +
        '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。許可を聞かれたら、内容を読んで選びます。' +
        boxOs('cardnews_cli.py を、表紙だけでなく、本文のページも作れるようにしてください（オプションで切りかえ）。そのあと、このフォルダの .claude/skills/cardnews に、スキルとしてまとめてください。スクリプトは、スキルの scripts フォルダに置いてください。SKILL.md には、name（cardnews にしてください）と description、道具の使い方、フォント（C:\\Windows\\Fonts\\YuGothB.ttc）、保存先のフォルダの決め方、実行は python で行うことを書いてください。allowed-tools の行は、書かないでください。',
              'cardnews_cli.py を、表紙だけでなく、本文のページも作れるようにしてください（オプションで切りかえ）。そのあと、このフォルダの .claude/skills/cardnews に、スキルとしてまとめてください。スクリプトは、スキルの scripts フォルダに置いてください。SKILL.md には、name（cardnews にしてください）と description、道具の使い方、フォント（/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc）、保存先のフォルダの決め方、実行は python3 で行うことを書いてください。allowed-tools の行は、書かないでください。') + '</li>' +
        '<li>VS Codeの左側で、<b>.claude/skills/cardnews/SKILL.md</b> を開いて、中身を読みます。いちばん上に <b>allowed-tools</b> という行があったら、「allowed-tools の行を消してください」と頼みます（この行があると、そのスキルの実行が、許可なしで進むことがあります）。</li>' +
        '<li>Claude Codeを、<b>起動しなおします</b>（<b>/exit</b> → <b>claude -c</b>）。公式の案内では、起動したときに無かった skills フォルダは、まだ見張られていないからです。起動しなおすと、このあと作るスキルも、自動で読みこまれます。</li>' +
        '<li>入力欄に <b>/card</b> まで入れると、一覧に <b>/cardnews</b> が出ます。出たら、成功です（Escキーで消して、次の画面へ）。</li>' +
        '</ol>' +
        '<p class="note">起動しなおさずに読みこむ <b>/reload-skills</b> という命令もあります（公式の案内）。その場合は、skills フォルダの中を変えるたびに、入れなおします。</p>',
      help: [
        HELP_APPROVE,
        { q: '/cardnews が、一覧に出ません', a: '① .claude/skills/cardnews/SKILL.md の場所 ② SKILL.md のいちばん上の「---」の部分、を確かめます。そのあと /reload-skills を入れます。' + cmd('/reload-skills') },
        HELP_RESTART
      ]
    },
    {
      id: 'h13', kind: 'pc', tag: 'PCで操作', title: '「/cardnews」で、6枚まとめて作る',
      html:
        '<p>スキルだけで動くか確かめるために、まず会話を<b>まっさら</b>にします。</p>' +
        '<ol>' +
        '<li>入力欄に <b>/clear</b> と入れて、Enterキーを押します（レッスン4）。' + cmd('/clear') + '</li>' +
        '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。Webの検索と、スクリプトの実行で、何回か許可を聞かれます。' + box('/cardnews 日本の桜の名所について、Webで調べて、6枚のカードニュースを作ってください。保存先は sakura フォルダにしてください。最後の1枚には、出典（URL）を書いてください。') + '</li>' +
        '<li>VS Codeの左側で、<b>sakura</b> フォルダの画像を、1枚ずつ開いて見ます。</li>' +
        '<li>6枚そろって、日本語が正しく出ていたら、成功です。</li>' +
        '</ol>' +
        '<p class="note">/cardnews と入れた瞬間に、SKILL.md の中身が読まれます。だから、前の会話がなくても、作り方・フォント・保存先を、AIがもう知っています。スキルなしで同じことを頼むと、AIは「どんなデザインにしますか？」などと、聞き返すことが多くなります。</p>' +
        '<p class="note warn">調べた内容は、まちがえていることがあります。出典のページを開いて、自分でも確かめます。</p>',
      help: [HELP_APPROVE, HELP_TOFU, { q: '6枚より少ないです', a: '「あと○枚、作ってください」と、続けて頼みます。' }]
    },
    {
      id: 'h14', kind: 'pc', tag: 'PCで操作', title: '画像を、1つのPDFにまとめてもらう',
      html:
        '<p>6枚の画像を、配りやすい<b>PDF</b>（1つのファイル）にまとめます。Pillowだけで、できます（公式の案内）。変換のサイトに、画像をアップロードしなくてすみます。</p>' +
        '<ol>' +
        '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。' + box('Pillow だけを使って、sakura フォルダの画像を、名前の順に1つのPDFにまとめるスクリプトを、img2pdf.py という名前で作って、実行してください。PDFは、agent1 フォルダ（いまのフォルダ）のすぐ下に、sakura.pdf という名前で保存してください。') + '</li>' +
        '<li>' + os('エクスプローラー', 'Finder') + 'で agent1 フォルダを開いて、<b>sakura.pdf</b> をダブルクリックします。' + os('ブラウザ（Edgeなど）', '「プレビュー」') + 'で開きます。</li>' +
        '<li>6ページのPDFになっていたら、成功です。</li>' +
        '</ol>',
      help: [HELP_APPROVE, HELP_INSTALL_AI, { q: 'agent1 フォルダが、どこかわかりません', a: 'VS Codeの左側で、sakura.pdf を' + os('右クリック', 'Controlキーを押しながらクリック') + 'して、' + os('「エクスプローラーで表示」', '「Finderで表示」') + 'を選ぶと、開けます。' }]
    },
    {
      id: 'h15', kind: 'pc', tag: 'PCで操作', title: '「/img2pdf」スキルに、まとめる',
      html:
        '<ol>' +
        '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。' +
        boxOs('img2pdf.py を、このフォルダの .claude/skills/img2pdf に、スキルとしてまとめてください。どのフォルダの画像を、どのPDFにまとめるかを、オプションで指定できるようにしてください。Pillow だけを使い、ほかのライブラリは入れないでください。SKILL.md には、name（img2pdf にしてください）と、使い方と、実行は python で行うことを書いてください。allowed-tools の行は、書かないでください。',
              'img2pdf.py を、このフォルダの .claude/skills/img2pdf に、スキルとしてまとめてください。どのフォルダの画像を、どのPDFにまとめるかを、オプションで指定できるようにしてください。Pillow だけを使い、ほかのライブラリは入れないでください。SKILL.md には、name（img2pdf にしてください）と、使い方と、実行は python3 で行うことを書いてください。allowed-tools の行は、書かないでください。') + '</li>' +
        '<li>入力欄に <b>/clear</b> と入れて、会話をまっさらにしてから、スキルでためします。' + box('/img2pdf cardnews フォルダの画像を、agent1 フォルダのすぐ下の cardnews.pdf にまとめてください。') + '</li>' +
        '<li><b>cardnews.pdf</b> ができていたら、成功です。</li>' +
        '</ol>' +
        '<p class="note">「/cardnews」スキルを作った画面で起動しなおしたので、skills フォルダは見張られています。新しいスキルは、その場で読みこまれます（公式の案内）。出てこないときは /reload-skills を入れます。</p>',
      help: [HELP_APPROVE, { q: '/img2pdf が、出てきません', a: '/reload-skills を入れてから、もう一度ためします。' }]
    },
    {
      id: 'h16', kind: 'know', tag: '知っておこう', title: '「プラグイン」と、安全のルール',
      html:
        '<p><b>プラグイン</b>は、スキル・MCP（レッスン6）・サブエージェント（レッスン5）などを、<b>まとめて配れる形にしたもの</b>です。アプリと、アプリのお店のような関係で、<b>マーケットプレイス</b>（お店の一覧）から入れます。</p>' +
        '<ul class="parts">' +
        '<li><b>公式のマーケットプレイス</b>claude-plugins-official。はじめから入っている<br><span>公式の案内では、Anthropicのものに加えて、<b>ほかの会社や人が作ったもの</b>も並んでいます</span></li>' +
        '<li><b>ほかの人のマーケットプレイス</b>だれでも作れる<br><span>公式の案内では、Anthropicは、その中身を調べていません</span></li>' +
        '</ul>' +
        '<p class="note warn">公式の案内では、プラグインは、<b>あなたの権限で、どんなプログラムでも動かせます</b>。Claude Codeの許可の画面は、プラグインが自分で動かすプログラムまでは、止めません。入れる前に、説明の画面で<b>作った人</b>を見て、信頼できるものだけにします。</p>',
      help: [
        { q: 'マーケットプレイスの名前が「公式」なら、安全ですか？', a: '公式の案内では、マーケットプレイスの名前は「だれが並べているか」を示すだけで、中のプラグインが安全かどうかは、示しません。公式のマーケットプレイスにも、ほかの会社や人のプラグインがあります。' }
      ]
    },
    {
      id: 'h17', kind: 'pc', tag: 'PCで操作', title: '公式のプラグイン「skill-creator」を入れる',
      html:
        '<p>スキルを作ることも、じつは「くり返しの作業」です。それをスキルにしたのが、<b>skill-creator</b>（スキルを作るスキル）です。作ったのは Anthropic です。</p>' +
        '<ol>' +
        '<li>まず、お店で探してみます。<b>/plugin</b> と入れて、Tabキーで「<b>Discover</b>」（さがす）に切りかえ、<b>skill-creator</b> と入れます。作った人（Anthropic）と説明を読んだら、Escキーで閉じます。' + cmd('/plugin') + '</li>' +
        '<li>入れます。下の「コピー」を押して、貼り付けて、Enterキーを押します。' + cmd('/plugin install skill-creator@claude-plugins-official') + '</li>' +
        '<li>公式の案内では、すぐには入らず、<b>説明の画面</b>が開きます。作った人（Anthropic）と内容を読みます。</li>' +
        '<li>入れる範囲を選びます。今日は、<b>「Install for you, in this repo only (local scope)」</b>（このフォルダで、自分だけ）を選びます。</li>' +
        '<li>「Plugin is now active.」か「Run /reload-plugins to apply.」と出たら、そのままで大丈夫です（あとの方は、自動で読みこまれます）。どちらでもないときは、次を入れます。' + cmd('/reload-plugins') + '</li>' +
        '<li>入力欄に <b>/skill-</b> まで入れて、一覧に <b>/skill-creator:skill-creator</b> が出たら、成功です（Escキーで消します）。</li>' +
        '</ol>' +
        '<p class="note"><b>/plugin</b> には、「Discover」（さがす）・「Installed」（入っているもの）・「Marketplaces」（お店）・「Errors」（エラー）などのタブがあり、Tabキーで切りかえます。ほかのプラグインも、Discover で<b>見るだけ</b>なら、安全です。</p>',
      help: [
        { q: 'マーケットプレイスが、見つからないと言われます', a: '公式の案内では、次のコマンドで、公式のマーケットプレイスを追加できます。' + cmd('/plugin marketplace add anthropics/claude-plugins-official') },
        { q: '範囲の選び方が、わかりません', a: '「user」はすべてのフォルダで自分だけ、「project」はこのフォルダを使うみんな、「local」はこのフォルダで自分だけ、です。練習なので、いちばん狭い local にします。' },
        { q: 'プラグインを消したいです', a: '/plugin を開いて、「Installed」で skill-creator を選ぶと、消す（Uninstall）を選べます。' },
        { q: '/skill-creator:skill-creator が、一覧に出ません', a: '/reload-plugins を入れてから、もう一度 /skill- まで入れます。警告が出て止まったときは /reload-plugins --force を入れます。「couldn\'t be loaded」と出たときは、/plugin の「Errors」タブを見ます。' + cmd('/reload-plugins') },
        { q: '/anthropic-skills:… という名前も出ます', a: 'claude.ai の設定から入ってくるスキルのことがあります。この画面では、<b>/skill-creator:skill-creator</b> のほうを使います。' },
        HELP_ENG
      ]
    },
    {
      id: 'h18', kind: 'pc', tag: 'PCで操作', title: 'skill-creatorで、写真補正のスキルを作る',
      html:
        '<ol>' +
        '<li>念のため、元の画像をコピーしておきます。' + box('sakura フォルダを、まるごと sakura-backup という名前でコピーしてください。') + '</li>' +
        '<li>skill-creator で、スキルを作ってもらいます。下の「コピー」を押して、貼り付けて、Enterキーを押します。質問されたら、答えます。' +
        boxOs('/skill-creator:skill-creator 写真を補正する「ミニフォトショップ」のスキルを、photo-edit という名前で、このフォルダの .claude/skills に作ってください。できること：明るさ・コントラスト・あざやかさ（彩度）の調整と、よこ:たての比率の変更（1:1・4:5・9:16。4:5 と 9:16 はたて長。まん中を切りぬく）。スマホの写真は、向きの情報（EXIF）に合わせて、正しい向きにしてから処理してください。1枚でも、フォルダの画像全部でも処理できるようにしてください。元の画像は上書きしないで、edited フォルダに保存してください。Pillow を使って、実行は python で行ってください。テスト（評価）と説明の最適化は、しないでください。allowed-tools の行は、書かないでください。',
              '/skill-creator:skill-creator 写真を補正する「ミニフォトショップ」のスキルを、photo-edit という名前で、このフォルダの .claude/skills に作ってください。できること：明るさ・コントラスト・あざやかさ（彩度）の調整と、よこ:たての比率の変更（1:1・4:5・9:16。4:5 と 9:16 はたて長。まん中を切りぬく）。スマホの写真は、向きの情報（EXIF）に合わせて、正しい向きにしてから処理してください。1枚でも、フォルダの画像全部でも処理できるようにしてください。元の画像は上書きしないで、edited フォルダに保存してください。Pillow を使って、実行は python3 で行ってください。テスト（評価）と説明の最適化は、しないでください。allowed-tools の行は、書かないでください。') + '</li>' +
        '<li>skill-creator が、どんなスキルにするか<b>質問を始めたら</b>、プラグインが使われています。答えて、できあがったら、<b>.claude/skills/photo-edit/SKILL.md</b> を開いて、読みます。</li>' +
        '<li>ためします。' + box('/photo-edit sakura フォルダの画像を、全部、明るさを10%上げて、よこ:たてを1:1（まん中を切りぬき）にしてください。') + '</li>' +
        '<li><b>edited</b> フォルダに、正方形になった画像ができて、<b>sakura フォルダの元の画像は、そのまま</b>なら、成功です。</li>' +
        '</ol>' +
        '<p class="note">skill-creator には、スキルの「テスト（評価）」の機能もあります（公式の案内）。今日は使いません。テストをすると、使用量がふえます。</p>',
      help: [
        HELP_APPROVE,
        { q: '/photo-edit が、出てきません', a: '/reload-skills を入れてから、もう一度ためします。' + cmd('/reload-skills') },
        { q: '「テストをしますか？」と聞かれました', a: '「しない」と答えて大丈夫です。' },
        { q: '元の画像が、変わってしまいました', a: 'sakura-backup フォルダに、コピーがあります。「元の画像は、上書きしないでください」と、SKILL.md に書いてもらいます。' }
      ]
    },
    {
      id: 'h19', kind: 'pc', tag: 'PCで操作', title: '同じ計算で、スライダーのWebページを作る',
      html:
        '<p>CLIはAI向き、<b>スライダーのWebページ</b>は人向きです。<b>同じ計算</b>で、人が使う画面も作れます。</p>' +
        '<div class="card"><b>使いわけ</b><br>・<b>1枚</b>の「ちょうどいい明るさ」を探す → 目で見ながら動かせる <b>Webページ</b><br>・<b>たくさん</b>の画像を、同じように直す → <b>/photo-edit</b>（スキル）</div>' +
        '<ol>' +
        '<li>下の「コピー」を押して、貼り付けて、Enterキーを押します。' + box('photo-edit スキルのスクリプトと同じ計算で、ブラウザでスライダーを動かして、明るさ・コントラスト・あざやかさ（彩度）を調整できるWebページを、photo-edit.html という1つのファイルで作ってください。CSSのフィルターではなく、canvas で1つ1つの点を、スクリプトと同じ式で計算してください。値の決め方も、スクリプトのオプションと同じにしてください。画像は、パソコンの中から選んで、インターネットには送らないようにしてください。いまの値を表示して、その値で /photo-edit を使う命令をコピーできるボタンも、付けてください。コントラストは、Pillow の ImageEnhance.Contrast と同じく、画像全体を灰色にしたときの平均の明るさを中心にしてください。調整の順番（明るさ→コントラスト→あざやかさ）と、平均を計算する画像（縮小する前の元の画像）も、スクリプトとそろえてください。photo-edit.html は、agent1 フォルダ（いまのフォルダ）のすぐ下に置いてください。') + '</li>' +
        '<li>' + os('エクスプローラー', 'Finder') + 'で、<b>photo-edit.html</b> をダブルクリックして、ブラウザで開きます。</li>' +
        '<li>sakura フォルダの画像を1枚選んで、スライダーを動かして、ちょうどいい値を探します。</li>' +
        '<li>「コピー」のボタンで、命令をコピーして、Claude Codeの入力欄に貼り付けます。「sakura フォルダの画像を全部」と書き足して、Enterキーを押します。</li>' +
        '<li>edited フォルダの画像が、Webページで見た色と同じようになっていたら、成功です。</li>' +
        '</ol>',
      help: [HELP_APPROVE, { q: 'photo-edit.html が、どこにあるかわかりません', a: 'VS Codeの左側で、photo-edit.html を' + os('右クリック', 'Controlキーを押しながらクリック') + 'して、' + os('「エクスプローラーで表示」', '「Finderで表示」') + 'を選ぶと、開けます。' }, { q: '画像が表示されません', a: 'ページの「ファイルを選択」のようなボタンで、画像を選びなおします。ブラウザを変える（' + os('EdgeやChrome', 'SafariやChrome') + 'など）と、動くこともあります。' }, { q: 'Webページと、/photo-edit の色が、少しちがいます', a: '計算のしかたが、ずれている可能性があります。「Webページと、スクリプトの計算を、同じ式にそろえてください」と頼みます。' }]
    },
    {
      id: 'h20', kind: 'know', tag: 'クイズ', title: 'スキルと、道具づくりのクイズ',
      widget: 'quiz',
      quiz: [
        { q: 'スキルの、いちばんの特ちょうは？', options: ['いつも全部読まれる', 'ふだんは名前と説明だけ読まれて、使うときに中身が読まれる', 'パスワードを覚える'], answer: 1, explain: '公式の案内では、説明はいつも読まれ、中身は使うときだけ読まれます。だから、たくさん作っても、机が散らかりません。' },
        { q: 'ライブラリとは？', options: ['だれかが作った、プログラムの部品のセット', '本を借りる場所だけ', 'パソコンの電源'], answer: 0, explain: '人が作った部品を組み立てて、自分の道具を作ります。' },
        { q: 'Pillowで日本語が「□」になるとき、どうする？', options: ['あきらめる', 'パソコンを買いかえる', '日本語が使えるフォントを指定する'], answer: 2, explain: '標準のフォントは、使える文字が少ないので、日本語のフォント（游ゴシック・ヒラギノなど）を指定します。' },
        { q: 'CLIにすると、何がよい？', options: ['オプションを変えるだけで、中身を書きかえずに何枚でも作れる', 'マウスでしか使えなくなる', '画像がきれいになる'], answer: 0, explain: 'AIは、オプションを組み立てるだけで、同じ道具をくり返し使えます。' },
        { q: 'プロジェクトのスキルは、どこに置く？', options: ['デスクトップ', '.claude/skills/名前/SKILL.md', 'CLAUDE.md の中'], answer: 1, explain: '公式の案内では、.claude/skills の中の、スキルの名前のフォルダに、SKILL.md を置きます。' },
        { q: 'はじめて skills フォルダを作ったのに、/名前 が出ません。どうする？', options: ['/reload-skills を入れる', 'スキルの名前を日本語にする', 'Pillowを入れなおす'], answer: 0, explain: '起動したときに無かった skills フォルダを作ったときは、/reload-skills で読みこみます。' },
        { q: 'プラグインを入れるときの、安全のルールは？', options: ['名前が公式っぽければ、何でも入れる', 'どこのものでも、作った人と中身を確かめて、信頼できるものだけ入れる', 'AIにまかせて、中は見ない'], answer: 1, explain: 'プラグインは、あなたの権限で、どんなプログラムでも動かせます。' },
        { q: 'どんなときに、スキルにするとよい？', options: ['1回しか使わないとき', '同じことを3回以上たのむとき', 'パソコンを買ったとき'], answer: 1, explain: '1回だけなら、その場で頼めば十分です。くり返すなら、スキルにまとめると、毎回同じやり方で、短く呼べます。' },
        { q: '写真を補正するときに、大事なことは？', options: ['元の画像に、そのまま上書きする', '個人の写真を、どんどん使う', '元の画像は残して、別のフォルダに保存する'], answer: 2, explain: '元の画像を残しておけば、失敗しても、やりなおせます。' }
      ],
      html: '<p>おぼえたことを、クイズで確かめましょう。選ぶと、答えが出ます。点数は、つけません。</p>',
      help: [
        { q: 'まちがえました', a: '大丈夫です。もう一度、前の画面を見て、もどってみてください。何度でも、やりなおせます。' }
      ]
    },
    {
      id: 'h21', kind: 'check', tag: '確認', title: 'おわりの確認',
      widget: 'checks',
      checks: [
        'Pillowを、自分で入れて、バージョンを確かめた',
        'カードニュースの表紙を作って、デザインを直してもらった',
        '表紙の道具を、CLIにして、3回ためした',
        '/cardnews スキルを作って、6枚のカードを作った',
        '画像を1つのPDFにまとめて、/img2pdf スキルにした',
        '公式のプラグイン skill-creator を入れた',
        '/photo-edit で補正して、元の画像が残っていることを確かめた',
        'スライダーのWebページで、補正を試した（できた人だけ）'
      ],
      required: 7,
      html:
        '<div class="card goal"><b>今日の流れ</b><br>① <b>ライブラリ</b>（人が作った部品）で道具を作る<br>② <b>CLI</b> にして、AIがオプションだけで使えるようにする<br>③ <b>スキル</b>にまとめて、「/名前」で呼ぶ<br>④ <b>プラグイン</b>で、人と分け合う（もらう）</div>' +
        '<p>できたことに、チェックを入れてください。<b>上の7つ</b>に入ると、「完了にする」を押せます。いちばん下の1つは、できた人だけです。</p>' +
        '<p class="note">作ったスキル（cardnews・img2pdf・photo-edit）は、このフォルダで、これからも使えます。いらなくなったら、.claude/skills の中の、そのフォルダを消せば、なくなります。skill-creator は、/plugin の「Installed」から消せます。</p>',
      help: [
        { q: 'できなかったところがあります', a: 'そのステップに戻って、「困ったとき」を見てください。何度でもやり直せます。' }
      ]
    }
  ];

  var lesson7 = {
    id: 'l7', no: 7, needsPc: true, ready: true, minutes: 120,
    title: 'くり返しをまとめる「スキル」',
    short: 'ライブラリ（Pillow）で画像を作る道具を作り、CLIにして、スキル（/cardnews・/img2pdf）にまとめる。公式プラグインで写真補正のスキルを作る',
    devices: 'PC',
    doneCard: '<b>レッスン7　完了です。おつかれさまでした。</b><br>決まった作業を、道具とスキルにまとめて、「/名前」で呼び出せるようになりました。次は、レッスン8です。',
    steps: steps
  };

  for (var i = 0; i < C.lessons.length; i++) {
    if (C.lessons[i].id === 'l7') { C.lessons[i] = lesson7; break; }
  }
})();
