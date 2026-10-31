/* 레슨7 한국어판(한국인 학습자용). 부탁하는 글과 예시도 한국어로 쓴다.
   내용은 2026-10-31에 공식 안내로 확인(Claude Code: skills, commands, features-overview, plugins / Python·Pillow 공식 문서 / Microsoft Windows 11 글꼴 목록). */
(function () {
  'use strict';
  var C = window.COURSE;
  var cmd = function (t) { return C.cmd(t, '복사'); };
  var box = function (t) { return C.copybox(t, null, '복사'); };
  var cmdOs = function (w, m) { return C.cmdOs(w, m, '복사'); };
  var os = C.os, osBlock = C.osBlock;

  function boxOs(win, mac) { return osBlock(box(win), box(mac)); }
  var FONT_WIN = '한글은 C:\\Windows\\Fonts\\malgunbd.ttf(맑은 고딕) 글꼴을 써 주세요.';
  var FONT_MAC = '한글은 /System/Library/Fonts/AppleSDGothicNeo.ttc(Apple SD 고딕 Neo) 글꼴을 써 주세요. 찾을 수 없으면 그 안에서 한글을 쓸 수 있는 글꼴을 찾아 주세요.';

  var HELP_APPROVE = {
    q: 'AI가 "허락하시겠습니까?"라고 물어요',
    a: '스크립트를 만들거나(Write) 실행하기(' + os('Bash/PowerShell', 'Bash') + ') 전에 묻습니다. 내용을 읽고 agent1 안의 일이라면 <b>첫 번째 "Yes"</b>를 고릅니다. 글꼴 폴더(' + os('C:\\Windows\\Fonts', '/System/Library/Fonts') + ')를 <b>읽기만</b> 할 때도 "Yes"로 괜찮습니다. 웹 검색이나 페이지 읽기(WebSearch·Fetch)도 내용을 보고 "Yes"로 괜찮습니다. .claude 폴더(스킬을 두는 곳)에 쓸 때는 매번 묻습니다. 첫 번째 "Yes"를 고릅니다. "다음부터 묻지 않기" 선택지는 고르지 않습니다. 모르겠으면 "아니요(No)"도 괜찮습니다.'
  };
  var HELP_ENG = { q: '화면 글자가 영어예요', a: '괜찮습니다. 표시가 영어여도 하는 일은 같습니다.' };
  var HELP_RESTART = {
    q: '다시 실행하려면?',
    a: 'Claude Code 입력란에 <b>/exit</b>를 넣고 Enter 키를 누릅니다. 터미널 줄로 돌아오면 <b>claude -c</b>를 넣으면 이전 대화에 이어서 시작합니다(레슨4).'
  };
  var HELP_TOFU = {
    q: '글자가 "□"로 나와요',
    a: '글꼴이 한글을 지원하지 않습니다. "한글이 나오는 글꼴로 다시 만들어 주세요"라고 부탁합니다. ' + os('Windows에서는 C:\\Windows\\Fonts의 malgunbd.ttf(맑은 고딕)를 쓸 수 있습니다.', 'Mac에서는 Apple SD 고딕 Neo를 쓸 수 있습니다.')
  };
  var HELP_INSTALL_AI = {
    q: 'AI가 "pip install"을 하려고 해요',
    a: 'Pillow는 직접 설치해 두었습니다. "아니요(No)"를 고르고 "Pillow는 이미 설치되어 있습니다"라고 전합니다. 다른 것을 설치하려고 할 때도 이름과 이유를 물어본 뒤 정합니다.'
  };

  var steps = {
    h1: {
      tag: '오늘의 목표', title: '레슨7에서 할 수 있게 되는 것',
      html:
        '<p class="note warn"><b>이 레슨은 Windows나 Mac 컴퓨터가 필요합니다.</b> 레슨6이 끝난 사람용입니다. 화면 오른쪽 위의 "Windows/Mac" 버튼으로 내 컴퓨터 쪽을 고르세요.</p>' +
        '<p>같은 부탁을 매번 긴 글로 쓰기는 힘듭니다. 오늘은 정해진 작업을 <b>도구(스크립트)</b>로 만들고, <b>스킬</b>로 넣어 두었다가 <b>"/이름" 하나로 불러낼 수 있게</b> 합니다.</p>' +
        '<div class="card goal"><b>목표</b><br>① <b>라이브러리</b>(남이 만든 부품)로 카드뉴스 이미지를 만든다<br>② 이미지를 만드는 도구를 <b>CLI</b>(옵션으로 움직이는 형식)로 만든다<br>③ <b>스킬</b>로 정리해서 <b>/cardnews</b>·<b>/img2pdf</b>로 불러낸다<br>④ <b>플러그인</b>(skill-creator)을 설치해서 사진 보정 스킬을 만든다</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>걸리는 시간</dt><dd>약 2시간(쉬어 가며 해도 됩니다)</dd>' +
        '<dt>쓰는 것</dt><dd>VS Code, agent1 폴더, Claude Code, Python(레슨2에서 설치한 것), Pillow(뒤에서 직접 설치합니다)</dd>' +
        '</dl></div>' +
        '<p class="note warn">사진 연습은 <b>개인정보가 찍히지 않은 것</b>으로만 합니다. 오늘 만드는 카드뉴스 이미지를 쓰면 안심입니다.</p>',
      help: [
        { q: 'Python이 없어요', a: '레슨2의 "Python 설치" 화면에서 설치하세요.' },
        { q: '레슨6을 아직 못 끝냈어요', a: '이 레슨은 레슨6의 연결(커넥터)을 쓰지 않으므로 레슨5까지 끝났으면 진행할 수 있습니다.' }
      ]
    },
    h2: {
      tag: 'PC에서 조작', title: '복습: Claude Code 실행하기',
      html:
        '<ol>' +
        '<li>VS Code에서 <b>agent1</b> 폴더를 엽니다.</li>' +
        '<li>"터미널"→"새 터미널"을 고릅니다.</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.' + cmd('claude') + '</li>' +
        '<li>화면 아래 줄이 <b>manual mode on</b>인지 봅니다. 다르면 Shift+Tab을 눌러 <b>manual</b>로 바꿉니다.</li>' +
        '</ol>',
      help: [
        { os: 'win', q: '"인식되지 않습니다"라고 나와요', a: 'VS Code를 완전히 닫았다가 다시 열고 새 터미널에서 해 보세요.' },
        { os: 'mac', q: '"command not found"라고 나와요', a: 'VS Code를 ⌘(Command) 키와 Q 키로 완전히 끝내고 다시 열어서 새 터미널에서 해 보세요.' },
        HELP_ENG
      ]
    },
    h3: {
      tag: '알아 두기', title: '"스킬"이 뭔가요?',
      html:
        '<p><b>스킬</b>은 <b>필요할 때만 꺼내 쓰는 안내서</b>입니다.</p>' +
        '<ul class="parts">' +
        '<li><b>CLAUDE.md</b>항상 전부 읽힌다<br><span>쓸 것이 늘어나면 AI의 책상(컨텍스트)이 꽉 찬다</span></li>' +
        '<li><b>스킬</b>평소에는 "이름과 설명"만 읽힌다<br><span>쓸 때 내용을 읽는다(공식 안내). 많이 만들어도 책상이 어지러워지지 않는다</span></li>' +
        '</ul>' +
        '<h2>스킬이 있으면 뭐가 좋을까요?</h2>' +
        '<ul class="parts">' +
        '<li><b>스킬 없이</b>매번 긴 부탁을 쓴다<br><span>쓰는 법이 다르면 결과도 제각각이 된다</span></li>' +
        '<li><b>스킬로</b>"/cardnews 벚꽃"처럼 짧게 부른다<br><span>늘 같은 방식으로 만들어 준다</span></li>' +
        '</ul>' +
        '<div class="card goal"><b>언제 스킬로 만들까요?</b><br>한 번만 할 일이면 그 자리에서 부탁하면 충분합니다. <b>같은 일을 3번 이상 부탁한다면</b> 스킬로 정리할 때입니다.</div>' +
        '<p class="note">공식 안내에 따르면 스킬은 직접 "/이름"을 넣어 부를 수 있고, AI가 설명을 읽고 <b>스스로 쓰기도</b> 합니다.</p>',
      help: [
        { q: '서브에이전트(레슨5)와 뭐가 다른가요?', a: '공식 안내에 따르면 스킬은 어느 대화에나 불러올 수 있는 "안내서"이고, 서브에이전트는 다른 책상에서 일하는 "도우미"입니다.' }
      ]
    },
    h4: {
      tag: '알아 두기', title: '"라이브러리"가 뭔가요?',
      html:
        '<p><b>라이브러리</b>는 누군가 만들어서 모두가 쓸 수 있게 한 <b>프로그램 부품 세트</b>입니다.</p>' +
        '<ul class="parts">' +
        '<li><b>AI가 일하는 방식</b>부탁 → 스크립트 쓰기(Write) → 실행(' + os('Bash/PowerShell', 'Bash') + ')<br><span>레슨2의 계산기와 같은 흐름</span></li>' +
        '<li><b>부품을 조립한다</b>"글자 쓰는 부품", "색칠하는 부품"을 이어서 이미지를 만든다<br><span>안의 구조를 몰라도 쓰는 법을 알면 쓸 수 있다</span></li>' +
        '</ul>' +
        '<p>부품은 대개 이미 세상에 있습니다. <b>사람은 "무엇을 만들지" 생각하고 조립은 AI에게 맡기는 것</b>이 앞으로의 방식입니다. 어떤 부품이 있는지 알면 ① 떠오르는 생각이 넓어지고 ② 실수가 줄고 ③ 시간과 사용량이 덜 듭니다.</p>' +
        '<p class="note">남이 만들어 나눠 쓰는 부품에는 <b>라이브러리</b> 말고도 <b>오픈소스</b>(내용이 공개된 프로그램)나 오늘 만들 <b>스킬</b>도 있습니다. 모두 "넣으면 정해진 일을 해 주는 상자" 같은 것입니다.</p>' +
        '<p>오늘은 이미지를 만드는 라이브러리 <b>Pillow</b>(필로)를 씁니다.</p>' +
        '<p class="note warn">라이브러리는 <b>정확한 이름</b>으로 설치합니다. 비슷한 이름의 가짜가 있을 때도 있습니다. 모르는 이름의 것을 AI가 설치하게 하지 마세요.</p>',
      help: [
        { q: '스크립트가 뭔가요?', a: '컴퓨터에 시킬 작업 순서를 적은 작은 프로그램입니다. 오늘은 AI가 Python으로 씁니다.' }
      ]
    },
    h6: {
      tag: 'PC에서 조작', title: '라이브러리 추천받기',
      html:
        '<p>먼저 AI에게 "어떤 부품을 쓰면 좋은지" 묻습니다.</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.' + box('SNS용 카드뉴스(글자가 들어간 이미지)를 만들고 싶어요. Python 라이브러리는 무엇을 쓰면 좋을까요? 쉬운 말로 알려 주세요. 설치는 하지 말고 이름과 고르는 이유만 알려 주세요.') + '</li>' +
        '<li>Pillow가 후보로 나오면 성공입니다.</li>' +
        '</ol>' +
        '<p class="note">다른 라이브러리를 추천받을 수도 있습니다. 오늘은 한글도 넣을 수 있고 많이 쓰이는 <b>Pillow</b>를 씁니다. 다음 화면에서 직접 설치합니다.</p>',
      help: [HELP_INSTALL_AI]
    },
    h5: {
      tag: 'PC에서 조작', title: 'Pillow를 직접 설치하기',
      html:
        '<p>라이브러리는 <b>일반 터미널</b>에서 <b>직접</b> 설치합니다(레슨2의 Python과 같은 생각입니다).</p>' +
        '<ol>' +
        '<li>Claude Code 입력란에 <b>/exit</b>를 넣고 Enter 키를 누릅니다.</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.' + cmdOs('python -m pip install Pillow', 'python3 -m pip install Pillow') + '</li>' +
        '<li>"Successfully installed" 같은 글이 나오면 설치된 것입니다. 다음으로 확인합니다.' + cmdOs('python -c "import PIL; print(PIL.__version__)"', 'python3 -c "import PIL; print(PIL.__version__)"') + '</li>' +
        '<li>숫자(버전)가 나오면 성공입니다. <b>claude -c</b>로 Claude Code로 돌아갑니다.' + cmd('claude -c') + '</li>' +
        '</ol>' +
        '<p class="note">Pillow 공식 안내에도 <b>-m pip</b> 형식으로 설치하는 방법이 적혀 있습니다.</p>',
      help: [
        { q: '"Requirement already satisfied"라고 나와요', a: '이미 설치되어 있다는 뜻입니다. 그대로 다음으로 진행해도 됩니다.' },
        { q: '"Failed building wheel" 같은 긴 오류가 나와요', a: 'Python이 너무 새로워서 Pillow 쪽 준비가 아직일 수 있습니다. ' + os('python --version', 'python3 --version') + '으로 나온 숫자를 메모해서 상담하세요(2026년 10월 기준 Pillow는 Python 3.15에도 대응합니다).' },
        { os: 'mac', q: '"externally-managed-environment"라고 나와요', a: 'Homebrew 등으로 설치한 다른 Python이 돌고 있을 수 있습니다. 레슨2에서 python.org 공식 설치 프로그램으로 설치한 python3를 씁니다. 모르겠으면 화면을 저장해서 상담하세요. <b>sudo는 쓰지 않습니다.</b>' },
        { q: '"Permission denied"나 권한 오류가 나와요', a: '내 계정에만 설치하는 방법이 있습니다(pip 공식 안내).' + cmdOs('python -m pip install --user Pillow', 'python3 -m pip install --user Pillow') },
        { os: 'win', q: '"인식되지 않습니다"라고 나와요', a: 'Python을 찾지 못했습니다. 레슨2의 "Python이 설치되어 있는지 확인하기" 화면에서 확인하세요.' },
        { os: 'mac', q: '"command not found"라고 나와요', a: 'Python을 찾지 못했습니다. 레슨2의 "Python이 설치되어 있는지 확인하기" 화면에서 확인하세요.' }
      ]
    },
    h7: {
      tag: 'PC에서 조작', title: '카드뉴스 표지 만들게 하기',
      html:
        '<ol>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다. 허락을 물으면 내용을 읽고 고릅니다.' +
        boxOs('Pillow를 써서 "한국의 벚꽃 명소"를 제목으로 한 SNS용 카드뉴스 표지(가로 1080·세로 1350픽셀)를 만드는 스크립트를 cardnews 폴더 안에 cover.py라는 이름으로 만들어 주세요. ' + FONT_WIN + ' 만들면 python으로 실행해서 cover.png를 만들어 주세요. Pillow는 이미 설치되어 있습니다.',
              'Pillow를 써서 "한국의 벚꽃 명소"를 제목으로 한 SNS용 카드뉴스 표지(가로 1080·세로 1350픽셀)를 만드는 스크립트를 cardnews 폴더 안에 cover.py라는 이름으로 만들어 주세요. ' + FONT_MAC + ' 만들면 python3로 실행해서 cover.png를 만들어 주세요. Pillow는 이미 설치되어 있습니다.') + '</li>' +
        '<li>VS Code 왼쪽에서 <b>cardnews</b> 폴더의 <b>cover.png</b>를 클릭합니다. VS Code 안에서 이미지를 볼 수 있습니다.</li>' +
        '<li>제목이 <b>한글로 제대로</b> 나오면 성공입니다.</li>' +
        '</ol>' +
        '<p class="note">글꼴을 정하는 것은 Pillow 기본 글꼴로는 한글이 "□"가 될 수 있기 때문입니다(공식 안내에 따르면 기본 글꼴은 쓸 수 있는 글자가 적습니다).</p>',
      help: [HELP_APPROVE, HELP_TOFU, HELP_INSTALL_AI]
    },
    h8: {
      tag: 'PC에서 조작', title: '표지 디자인 고치게 하기',
      html:
        '<ol>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.' + box('cover.py의 색을 초록색 중심으로 바꾸고 디자인을 조금 더 세련되게 해 주세요. 그다음 다시 실행해서 cover.png를 새로 만들어 주세요.') + '</li>' +
        '<li>cover.png를 다시 열어 바뀌었으면 성공입니다.</li>' +
        '</ol>' +
        '<p class="note">여기서 알아 둘 것은 <b>고칠 때마다 AI가 스크립트 내용을 고쳐 쓰고 있다</b>는 점입니다. "제목만 바꾸고 싶다"는 때도 매번 내용을 고치면 손이 많이 갑니다. 다음 화면에서 이것을 편하게 합니다.</p>',
      help: [HELP_APPROVE, { q: '허락 화면에 "Update"라고 나와요', a: '"Write"는 새로 만들기, "Update"는 이미 있는 파일 고치기라는 뜻입니다. 같은 이름의 파일 내용이 바뀝니다.' }, { q: '이미지가 안 바뀌었어요', a: 'VS Code에서 cover.png 탭을 한 번 닫았다가 다시 여세요. 예전 이미지가 보이고 있을 수 있습니다.' }]
    },
    h9: {
      tag: '알아 두기', title: '"CLI"가 뭔가요?',
      html:
        '<ul class="parts">' +
        '<li><b>GUI</b>(지유아이)버튼이나 메뉴를 마우스로 눌러서 쓴다<br><span>사람에게는 알기 쉽다</span></li>' +
        '<li><b>CLI</b>(시엘아이)글자 명령으로 쓴다. 바꾸고 싶은 곳은 "옵션"으로 전한다<br><span>마우스를 못 쓰는 AI에게는 이쪽이 쓰기 쉽다</span></li>' +
        '</ul>' +
        '<h2>명령의 형식</h2>' +
        '<div class="card"><code>' + os('python', 'python3') + ' cardnews_cli.py --title "경주 벚꽃" --color green --output gyeongju.png</code><br>·<b>cardnews_cli.py</b>: 움직일 도구<br>·<b>--title</b>, <b>--color</b>, <b>--output</b>: 옵션(무엇을 바꿀지. --output은 저장할 이름)<br>·<b>"경주 벚꽃"</b>, <b>green</b>, <b>gyeongju.png</b>: 그 값<br>(형식의 예입니다. 직접 넣지 않아도 됩니다)</div>' +
        '<p>CLI로 만들어 두면 AI는 <b>내용을 고쳐 쓰지 않고</b> 옵션만 바꿔서 몇 장이든 만들 수 있습니다.</p>',
      help: [
        { q: '어려워 보여요', a: '명령은 AI가 조립합니다. "옵션으로 제목이나 색을 바꿀 수 있는 도구"라는 것만 알면 충분합니다.' }
      ]
    },
    h10: {
      tag: 'PC에서 조작', title: '표지 도구를 CLI로 만들게 하기',
      html:
        '<ol>' +
        '<li>먼저 바꿀 수 있는 항목을 설명하게 합니다.' + box('cover.py에서 바꿀 수 있는 항목(제목, 색, 글자 크기 등)을 모두 쉬운 말로 설명해 주세요.') + '</li>' +
        '<li>다음으로 CLI로 만들게 합니다. 허락을 물으면 내용을 읽고 고릅니다.' + box('그 항목들을 옵션으로 지정할 수 있는 cardnews_cli.py를 cardnews 폴더 안에 만들어 주세요. 제목과 색을 바꿔서 3번 시험해 주세요. 만든 이미지 파일 이름을 알려 주세요.') + '</li>' +
        '<li>화면 기록에서 같은 cardnews_cli.py가 <b>옵션(--title 등)만 바뀌며 3번</b> 실행된 것을 확인합니다.</li>' +
        '<li>cardnews 폴더에 새 이미지 3장이 생기고 제목이나 색이 다르면 성공입니다.</li>' +
        '</ol>',
      help: [HELP_APPROVE, HELP_TOFU]
    },
    h11: {
      tag: '알아 두기', title: '스킬의 내용: SKILL.md',
      html:
        '<p>스킬은 <b>폴더 하나</b>입니다(공식 안내).</p>' +
        '<div class="card"><code>.claude/skills/cardnews/</code><br>　├ <b>SKILL.md</b>(안내서)<br>　└ <b>scripts/</b>(도구. cardnews_cli.py 등)</div>' +
        '<ul class="parts">' +
        '<li><b>SKILL.md 위쪽 부분</b>"---"로 감싼다<br><span>name(이름)과 description(언제 쓰는지)</span></li>' +
        '<li><b>SKILL.md 아래쪽 부분</b>보통 글<br><span>도구 쓰는 법, 글꼴, 저장할 곳 등. AI와의 "약속"</span></li>' +
        '</ul>' +
        '<p class="note">공식 안내에 따르면 스킬 안의 스크립트는 읽히는 것이 아니라 <b>실행되는</b> 도구입니다. 그래서 스킬을 쓸 때도 manual에서는 실행 전에 허락을 묻습니다.</p>',
      help: [
        { q: '직접 써야 하나요?', a: '아닙니다. 오늘은 AI에게 쓰게 합니다. 다 되면 직접 열어서 내용을 읽습니다.' }
      ]
    },
    h12: {
      tag: 'PC에서 조작', title: '"/cardnews" 스킬 만들게 하기',
      html:
        '<ol>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다. 허락을 물으면 내용을 읽고 고릅니다.' +
        boxOs('cardnews_cli.py를 표지뿐 아니라 본문 페이지도 만들 수 있게 해 주세요(옵션으로 바꾸기). 그다음 이 폴더의 .claude/skills/cardnews에 스킬로 정리해 주세요. 스크립트는 스킬의 scripts 폴더에 두어 주세요. SKILL.md에는 name(cardnews로 해 주세요)과 description, 도구 쓰는 법, 글꼴(C:\\Windows\\Fonts\\malgunbd.ttf), 저장할 폴더 정하는 법, 실행은 python으로 한다는 것을 적어 주세요. allowed-tools 줄은 쓰지 말아 주세요.',
              'cardnews_cli.py를 표지뿐 아니라 본문 페이지도 만들 수 있게 해 주세요(옵션으로 바꾸기). 그다음 이 폴더의 .claude/skills/cardnews에 스킬로 정리해 주세요. 스크립트는 스킬의 scripts 폴더에 두어 주세요. SKILL.md에는 name(cardnews로 해 주세요)과 description, 도구 쓰는 법, 글꼴(/System/Library/Fonts/AppleSDGothicNeo.ttc), 저장할 폴더 정하는 법, 실행은 python3로 한다는 것을 적어 주세요. allowed-tools 줄은 쓰지 말아 주세요.') + '</li>' +
        '<li>VS Code 왼쪽에서 <b>.claude/skills/cardnews/SKILL.md</b>를 열어 내용을 읽습니다. 맨 위에 <b>allowed-tools</b>라는 줄이 있으면 "allowed-tools 줄을 지워 주세요"라고 부탁합니다(이 줄이 있으면 그 스킬의 실행이 허락 없이 진행될 수 있습니다).</li>' +
        '<li>Claude Code를 <b>다시 실행합니다</b>(<b>/exit</b> → <b>claude -c</b>). 공식 안내에 따르면 실행할 때 없었던 skills 폴더는 아직 감시되지 않기 때문입니다. 다시 실행하면 이 뒤에 만드는 스킬도 자동으로 읽힙니다.</li>' +
        '<li>입력란에 <b>/card</b>까지 넣으면 목록에 <b>/cardnews</b>가 나옵니다. 나오면 성공입니다(Esc 키로 지우고 다음 화면으로).</li>' +
        '</ol>' +
        '<p class="note">다시 실행하지 않고 읽어 들이는 <b>/reload-skills</b>라는 명령도 있습니다(공식 안내). 그 경우에는 skills 폴더 안을 바꿀 때마다 다시 넣습니다.</p>',
      help: [
        HELP_APPROVE,
        { q: '/cardnews가 목록에 안 나와요', a: '① .claude/skills/cardnews/SKILL.md 위치 ② SKILL.md 맨 위의 "---" 부분을 확인합니다. 그다음 /reload-skills를 넣습니다.' + cmd('/reload-skills') },
        HELP_RESTART
      ]
    },
    h13: {
      tag: 'PC에서 조작', title: '"/cardnews"로 6장 한꺼번에 만들기',
      html:
        '<p>스킬만으로 움직이는지 확인하려고 먼저 대화를 <b>새것</b>으로 만듭니다.</p>' +
        '<ol>' +
        '<li>입력란에 <b>/clear</b>를 넣고 Enter 키를 누릅니다(레슨4).' + cmd('/clear') + '</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다. 웹 검색과 스크립트 실행으로 몇 번 허락을 묻습니다.' + box('/cardnews 한국의 벚꽃 명소에 대해 웹에서 조사해서 카드뉴스 6장을 만들어 주세요. 저장할 곳은 sakura 폴더로 해 주세요. 마지막 1장에는 출처(URL)를 적어 주세요.') + '</li>' +
        '<li>VS Code 왼쪽에서 <b>sakura</b> 폴더의 이미지를 한 장씩 열어 봅니다.</li>' +
        '<li>6장이 다 있고 한글이 제대로 나오면 성공입니다.</li>' +
        '</ol>' +
        '<p class="note">/cardnews를 넣는 순간 SKILL.md 내용이 읽힙니다. 그래서 이전 대화가 없어도 만드는 법·글꼴·저장할 곳을 AI가 이미 압니다. 스킬 없이 같은 일을 부탁하면 AI가 "어떤 디자인으로 할까요?" 같은 되묻기를 많이 합니다.</p>' +
        '<p class="note warn">조사한 내용은 틀릴 수 있습니다. 출처 페이지를 열어 직접 확인합니다.</p>',
      help: [HELP_APPROVE, HELP_TOFU, { q: '6장보다 적어요', a: '"○장 더 만들어 주세요"라고 이어서 부탁합니다.' }]
    },
    h14: {
      tag: 'PC에서 조작', title: '이미지를 PDF 하나로 묶게 하기',
      html:
        '<p>6장의 이미지를 나눠 주기 쉬운 <b>PDF</b>(파일 하나)로 묶습니다. Pillow만으로 할 수 있습니다(공식 안내). 변환 사이트에 이미지를 올리지 않아도 됩니다.</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.' + box('Pillow만 써서 sakura 폴더의 이미지를 이름 순서대로 PDF 하나로 묶는 스크립트를 img2pdf.py라는 이름으로 만들고 실행해 주세요. PDF는 agent1 폴더(지금 폴더) 바로 아래에 sakura.pdf라는 이름으로 저장해 주세요.') + '</li>' +
        '<li>' + os('탐색기', 'Finder') + '에서 agent1 폴더를 열고 <b>sakura.pdf</b>를 더블클릭합니다. ' + os('브라우저(Edge 등)', '"미리보기"') + '로 열립니다.</li>' +
        '<li>6쪽짜리 PDF가 되었으면 성공입니다.</li>' +
        '</ol>',
      help: [HELP_APPROVE, HELP_INSTALL_AI, { q: 'agent1 폴더가 어디인지 모르겠어요', a: 'VS Code 왼쪽에서 sakura.pdf를 ' + os('오른쪽 클릭', 'Control 키를 누른 채 클릭') + '하고 ' + os('"탐색기에서 표시"', '"Finder에서 보기"') + '를 고르면 열 수 있습니다.' }]
    },
    h15: {
      tag: 'PC에서 조작', title: '"/img2pdf" 스킬로 정리하기',
      html:
        '<ol>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.' +
        boxOs('img2pdf.py를 이 폴더의 .claude/skills/img2pdf에 스킬로 정리해 주세요. 어느 폴더의 이미지를 어떤 PDF로 묶을지 옵션으로 정할 수 있게 해 주세요. Pillow만 쓰고 다른 라이브러리는 설치하지 말아 주세요. SKILL.md에는 name(img2pdf로 해 주세요), 쓰는 법과 실행은 python으로 한다는 것을 적어 주세요. allowed-tools 줄은 쓰지 말아 주세요.',
              'img2pdf.py를 이 폴더의 .claude/skills/img2pdf에 스킬로 정리해 주세요. 어느 폴더의 이미지를 어떤 PDF로 묶을지 옵션으로 정할 수 있게 해 주세요. Pillow만 쓰고 다른 라이브러리는 설치하지 말아 주세요. SKILL.md에는 name(img2pdf로 해 주세요), 쓰는 법과 실행은 python3로 한다는 것을 적어 주세요. allowed-tools 줄은 쓰지 말아 주세요.') + '</li>' +
        '<li>입력란에 <b>/clear</b>를 넣어 대화를 새것으로 만든 뒤 스킬로 시험해 봅니다.' + box('/img2pdf cardnews 폴더의 이미지를 agent1 폴더 바로 아래의 cardnews.pdf로 묶어 주세요.') + '</li>' +
        '<li><b>cardnews.pdf</b>가 생겼으면 성공입니다.</li>' +
        '</ol>' +
        '<p class="note">"/cardnews" 스킬을 만든 화면에서 다시 실행했으므로 skills 폴더는 감시되고 있습니다. 새 스킬은 그 자리에서 읽힙니다(공식 안내). 안 나오면 /reload-skills를 넣습니다.</p>',
      help: [HELP_APPROVE, { q: '/img2pdf가 안 나와요', a: '/reload-skills를 넣고 다시 시험합니다.' }]
    },
    h16: {
      tag: '알아 두기', title: '"플러그인"과 안전 규칙',
      html:
        '<p><b>플러그인</b>은 스킬·MCP(레슨6)·서브에이전트(레슨5) 등을 <b>묶어서 나눠 줄 수 있게 만든 것</b>입니다. 앱과 앱 가게 같은 관계로, <b>마켓플레이스</b>(가게 목록)에서 설치합니다.</p>' +
        '<ul class="parts">' +
        '<li><b>공식 마켓플레이스</b>claude-plugins-official. 처음부터 들어 있다<br><span>공식 안내에 따르면 Anthropic 것에 더해 <b>다른 회사나 사람이 만든 것</b>도 있습니다</span></li>' +
        '<li><b>다른 사람의 마켓플레이스</b>누구나 만들 수 있다<br><span>공식 안내에 따르면 Anthropic은 그 내용을 검사하지 않습니다</span></li>' +
        '</ul>' +
        '<p class="note warn">공식 안내에 따르면 플러그인은 <b>내 권한으로 어떤 프로그램이든 돌릴 수 있습니다</b>. Claude Code의 허락 화면은 플러그인이 스스로 돌리는 프로그램까지는 막지 않습니다. 설치하기 전에 설명 화면에서 <b>만든 사람</b>을 보고 믿을 수 있는 것만 설치합니다.</p>',
      help: [
        { q: '마켓플레이스 이름이 "공식"이면 안전한가요?', a: '공식 안내에 따르면 마켓플레이스 이름은 "누가 늘어놓았는지"를 나타낼 뿐, 안의 플러그인이 안전한지는 나타내지 않습니다. 공식 마켓플레이스에도 다른 회사나 사람의 플러그인이 있습니다.' }
      ]
    },
    h17: {
      tag: 'PC에서 조작', title: '공식 플러그인 "skill-creator" 설치하기',
      html:
        '<p>스킬을 만드는 일도 사실은 "반복 작업"입니다. 그것을 스킬로 만든 것이 <b>skill-creator</b>(스킬을 만드는 스킬)입니다. 만든 곳은 Anthropic입니다.</p>' +
        '<ol>' +
        '<li>먼저 가게에서 찾아봅니다. <b>/plugin</b>을 넣고 Tab 키로 "<b>Discover</b>"(찾기)로 바꾼 뒤 <b>skill-creator</b>를 넣습니다. 만든 사람(Anthropic)과 설명을 읽었으면 Esc 키로 닫습니다.' + cmd('/plugin') + '</li>' +
        '<li>설치합니다. 아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.' + cmd('/plugin install skill-creator@claude-plugins-official') + '</li>' +
        '<li>공식 안내에 따르면 바로 설치되지 않고 <b>설명 화면</b>이 열립니다. 만든 사람(Anthropic)과 내용을 읽습니다.</li>' +
        '<li>설치할 범위를 고릅니다. 오늘은 <b>"Install for you, in this repo only (local scope)"</b>(이 폴더에서 나만)를 고릅니다.</li>' +
        '<li>"Plugin is now active." 또는 "Run /reload-plugins to apply."가 나오면 그대로 괜찮습니다(뒤의 것은 자동으로 읽힙니다). 둘 다 아니면 다음을 넣습니다.' + cmd('/reload-plugins') + '</li>' +
        '<li>입력란에 <b>/skill-</b>까지 넣어서 목록에 <b>/skill-creator:skill-creator</b>가 나오면 성공입니다(Esc 키로 지웁니다).</li>' +
        '</ol>' +
        '<p class="note"><b>/plugin</b>에는 "Discover"(찾기)·"Installed"(설치된 것)·"Marketplaces"(가게)·"Errors"(오류) 등의 탭이 있고 Tab 키로 바꿉니다. 다른 플러그인도 Discover에서 <b>보기만</b> 하는 것은 안전합니다.</p>',
      help: [
        { q: '마켓플레이스를 찾을 수 없다고 해요', a: '공식 안내에 따르면 다음 명령으로 공식 마켓플레이스를 추가할 수 있습니다.' + cmd('/plugin marketplace add anthropics/claude-plugins-official') },
        { q: '범위 고르는 법을 모르겠어요', a: '"user"는 모든 폴더에서 나만, "project"는 이 폴더를 쓰는 모두, "local"은 이 폴더에서 나만입니다. 연습이므로 가장 좁은 local로 합니다.' },
        { q: '플러그인을 지우고 싶어요', a: '/plugin을 열어 "Installed"에서 skill-creator를 고르면 지우기(Uninstall)를 고를 수 있습니다.' },
        { q: '/skill-creator:skill-creator가 목록에 안 나와요', a: '/reload-plugins를 넣은 뒤 다시 /skill-까지 넣습니다. 경고가 나와 멈추면 /reload-plugins --force를 넣습니다. "couldn\'t be loaded"가 나오면 /plugin의 "Errors" 탭을 봅니다.' + cmd('/reload-plugins') },
        { q: '/anthropic-skills:… 라는 이름도 나와요', a: 'claude.ai 설정에서 들어오는 스킬일 수 있습니다. 이 화면에서는 <b>/skill-creator:skill-creator</b> 쪽을 씁니다.' },
        HELP_ENG
      ]
    },
    h18: {
      tag: 'PC에서 조작', title: 'skill-creator로 사진 보정 스킬 만들기',
      html:
        '<ol>' +
        '<li>만일을 위해 원래 이미지를 복사해 둡니다.' + box('sakura 폴더를 통째로 sakura-backup이라는 이름으로 복사해 주세요.') + '</li>' +
        '<li>skill-creator로 스킬을 만들게 합니다. 아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다. 질문하면 답합니다.' +
        boxOs('/skill-creator:skill-creator 사진을 보정하는 "미니 포토샵" 스킬을 photo-edit라는 이름으로 이 폴더의 .claude/skills에 만들어 주세요. 할 수 있는 일: 밝기·대비·채도(색의 진하기) 조절과 가로:세로 비율 바꾸기(1:1·4:5·9:16, 4:5와 9:16은 세로로 긴 모양, 가운데를 잘라 내기). 스마트폰 사진은 방향 정보(EXIF)에 맞춰 바른 방향으로 돌린 뒤 처리해 주세요. 한 장이든 폴더의 이미지 전부든 처리할 수 있게 해 주세요. 원래 이미지는 덮어쓰지 말고 edited 폴더에 저장해 주세요. Pillow를 쓰고 실행은 python으로 해 주세요. 테스트(평가)와 설명 최적화는 하지 말아 주세요. allowed-tools 줄은 쓰지 말아 주세요.',
              '/skill-creator:skill-creator 사진을 보정하는 "미니 포토샵" 스킬을 photo-edit라는 이름으로 이 폴더의 .claude/skills에 만들어 주세요. 할 수 있는 일: 밝기·대비·채도(색의 진하기) 조절과 가로:세로 비율 바꾸기(1:1·4:5·9:16, 4:5와 9:16은 세로로 긴 모양, 가운데를 잘라 내기). 스마트폰 사진은 방향 정보(EXIF)에 맞춰 바른 방향으로 돌린 뒤 처리해 주세요. 한 장이든 폴더의 이미지 전부든 처리할 수 있게 해 주세요. 원래 이미지는 덮어쓰지 말고 edited 폴더에 저장해 주세요. Pillow를 쓰고 실행은 python3로 해 주세요. 테스트(평가)와 설명 최적화는 하지 말아 주세요. allowed-tools 줄은 쓰지 말아 주세요.') + '</li>' +
        '<li>skill-creator가 어떤 스킬로 할지 <b>질문을 시작하면</b> 플러그인이 쓰이고 있는 것입니다. 답해서 다 만들어지면 <b>.claude/skills/photo-edit/SKILL.md</b>를 열어 읽습니다.</li>' +
        '<li>시험해 봅니다.' + box('/photo-edit sakura 폴더의 이미지를 전부 밝기 10% 올리고 가로:세로를 1:1(가운데 잘라 내기)로 해 주세요.') + '</li>' +
        '<li><b>edited</b> 폴더에 정사각형이 된 이미지가 생기고 <b>sakura 폴더의 원래 이미지는 그대로</b>면 성공입니다.</li>' +
        '</ol>' +
        '<p class="note">skill-creator에는 스킬 "테스트(평가)" 기능도 있습니다(공식 안내). 오늘은 쓰지 않습니다. 테스트를 하면 사용량이 늘어납니다.</p>',
      help: [
        HELP_APPROVE,
        { q: '/photo-edit가 안 나와요', a: '/reload-skills를 넣고 다시 시험합니다.' + cmd('/reload-skills') },
        { q: '"테스트를 할까요?"라고 물어요', a: '"안 함"이라고 답해도 됩니다.' },
        { q: '원래 이미지가 바뀌어 버렸어요', a: 'sakura-backup 폴더에 복사본이 있습니다. "원래 이미지는 덮어쓰지 말아 주세요"라고 SKILL.md에 적게 합니다.' }
      ]
    },
    h19: {
      tag: 'PC에서 조작', title: '같은 계산으로 슬라이더 웹페이지 만들기',
      html:
        '<p>CLI는 AI용, <b>슬라이더 웹페이지</b>는 사람용입니다. <b>같은 계산</b>으로 사람이 쓰는 화면도 만들 수 있습니다.</p>' +
        '<div class="card"><b>나눠 쓰기</b><br>·<b>한 장</b>의 "딱 좋은 밝기"를 찾는다 → 눈으로 보며 움직일 수 있는 <b>웹페이지</b><br>·<b>여러 장</b>을 똑같이 고친다 → <b>/photo-edit</b>(스킬)</div>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.' + box('photo-edit 스킬의 스크립트와 같은 계산으로, 브라우저에서 슬라이더를 움직여 밝기·대비·채도(색의 진하기)를 조절할 수 있는 웹페이지를 photo-edit.html이라는 파일 하나로 만들어 주세요. CSS 필터가 아니라 canvas로 점 하나하나를 스크립트와 같은 식으로 계산해 주세요. 값을 정하는 방식도 스크립트 옵션과 같게 해 주세요. 이미지는 컴퓨터 안에서 고르고 인터넷으로 보내지 않게 해 주세요. 지금 값을 보여 주고, 그 값으로 /photo-edit를 쓰는 명령을 복사할 수 있는 버튼도 달아 주세요. 대비는 Pillow의 ImageEnhance.Contrast처럼 이미지 전체를 회색으로 바꿨을 때의 평균 밝기를 중심으로 해 주세요. 조절 순서(밝기→대비→채도)와 평균을 계산하는 이미지(줄이기 전의 원래 이미지)도 스크립트와 맞춰 주세요. photo-edit.html은 agent1 폴더(지금 폴더) 바로 아래에 두어 주세요.') + '</li>' +
        '<li>' + os('탐색기', 'Finder') + '에서 <b>photo-edit.html</b>을 더블클릭해서 브라우저로 엽니다.</li>' +
        '<li>sakura 폴더의 이미지를 1장 골라 슬라이더를 움직여 딱 좋은 값을 찾습니다.</li>' +
        '<li>"복사" 버튼으로 명령을 복사해서 Claude Code 입력란에 붙여 넣습니다. "sakura 폴더의 이미지 전부"라고 덧붙이고 Enter 키를 누릅니다.</li>' +
        '<li>edited 폴더의 이미지가 웹페이지에서 본 색과 같아졌으면 성공입니다.</li>' +
        '</ol>',
      help: [HELP_APPROVE, { q: 'photo-edit.html이 어디 있는지 모르겠어요', a: 'VS Code 왼쪽에서 photo-edit.html을 ' + os('오른쪽 클릭', 'Control 키를 누른 채 클릭') + '하고 ' + os('"파일 탐색기에 표시"', '"Finder에서 보기"') + '를 고르면 열 수 있습니다.' }, { q: '이미지가 안 보여요', a: '페이지의 "파일 선택" 같은 버튼으로 이미지를 다시 고릅니다. 브라우저를 바꾸면(' + os('Edge나 Chrome', 'Safari나 Chrome') + ' 등) 될 때도 있습니다.' }, { q: '웹페이지와 /photo-edit의 색이 조금 달라요', a: '계산 방식이 어긋났을 수 있습니다. "웹페이지와 스크립트의 계산을 같은 식으로 맞춰 주세요"라고 부탁합니다.' }]
    },
    h20: {
      tag: '퀴즈', title: '스킬과 도구 만들기 퀴즈',
      quiz: [
        { q: '스킬의 가장 큰 특징은?', options: ['항상 전부 읽힌다', '평소에는 이름과 설명만 읽히고 쓸 때 내용이 읽힌다', '비밀번호를 기억한다'], answer: 1, explain: '공식 안내에 따르면 설명은 늘 읽히고 내용은 쓸 때만 읽힙니다. 그래서 많이 만들어도 책상이 어지러워지지 않습니다.' },
        { q: '라이브러리란?', options: ['누군가 만든 프로그램 부품 세트', '책 빌리는 곳만', '컴퓨터 전원'], answer: 0, explain: '남이 만든 부품을 조립해서 내 도구를 만듭니다.' },
        { q: 'Pillow에서 한글이 "□"가 될 때는?', options: ['포기한다', '컴퓨터를 바꾼다', '한글을 쓸 수 있는 글꼴을 지정한다'], answer: 2, explain: '기본 글꼴은 쓸 수 있는 글자가 적어서 한글 글꼴(맑은 고딕·Apple SD 고딕 Neo 등)을 지정합니다.' },
        { q: 'CLI로 만들면 뭐가 좋나요?', options: ['옵션만 바꿔서 내용을 고치지 않고 몇 장이든 만들 수 있다', '마우스로만 쓸 수 있게 된다', '이미지가 예뻐진다'], answer: 0, explain: 'AI는 옵션을 조립하기만 하면 같은 도구를 되풀이해 쓸 수 있습니다.' },
        { q: '프로젝트 스킬은 어디에 두나요?', options: ['바탕화면', '.claude/skills/이름/SKILL.md', 'CLAUDE.md 안'], answer: 1, explain: '공식 안내에 따르면 .claude/skills 안의 스킬 이름 폴더에 SKILL.md를 둡니다.' },
        { q: 'skills 폴더를 처음 만들었는데 /이름이 안 나와요. 어떻게 하나요?', options: ['/reload-skills를 넣는다', '스킬 이름을 한글로 바꾼다', 'Pillow를 다시 설치한다'], answer: 0, explain: '실행할 때 없었던 skills 폴더를 만들었을 때는 /reload-skills로 읽어 들입니다.' },
        { q: '플러그인을 설치할 때의 안전 규칙은?', options: ['이름이 공식 같으면 뭐든 설치한다', '어디 것이든 만든 사람과 내용을 확인해서 믿을 수 있는 것만 설치한다', 'AI에게 맡기고 안은 보지 않는다'], answer: 1, explain: '플러그인은 내 권한으로 어떤 프로그램이든 돌릴 수 있습니다.' },
        { q: '어떨 때 스킬로 만들면 좋나요?', options: ['한 번만 쓸 때', '같은 일을 3번 이상 부탁할 때', '컴퓨터를 샀을 때'], answer: 1, explain: '한 번이면 그 자리에서 부탁하면 충분합니다. 되풀이한다면 스킬로 정리하면 매번 같은 방식으로 짧게 부를 수 있습니다.' },
        { q: '사진을 보정할 때 중요한 것은?', options: ['원래 이미지에 그대로 덮어쓴다', '개인 사진을 마구 쓴다', '원래 이미지는 남기고 다른 폴더에 저장한다'], answer: 2, explain: '원래 이미지를 남겨 두면 실패해도 다시 할 수 있습니다.' }
      ],
      html: '<p>배운 것을 퀴즈로 확인해 봅시다. 고르면 답이 나옵니다. 점수는 매기지 않습니다.</p>',
      help: [
        { q: '틀렸어요', a: '괜찮습니다. 앞 화면을 다시 보고 돌아와 보세요. 몇 번이든 다시 할 수 있습니다.' }
      ]
    },
    h21: {
      tag: '확인', title: '마지막 확인',
      checks: [
        'Pillow를 직접 설치하고 버전을 확인했다',
        '카드뉴스 표지를 만들고 디자인을 고치게 했다',
        '표지 도구를 CLI로 만들어 3번 시험했다',
        '/cardnews 스킬을 만들어 카드 6장을 만들었다',
        '이미지를 PDF 하나로 묶고 /img2pdf 스킬로 만들었다',
        '공식 플러그인 skill-creator를 설치했다',
        '/photo-edit로 보정하고 원래 이미지가 남아 있는지 확인했다',
        '슬라이더 웹페이지로 보정을 시험했다(할 수 있었던 사람만)'
      ],
      required: 7,
      html:
        '<div class="card goal"><b>오늘의 흐름</b><br>① <b>라이브러리</b>(남이 만든 부품)로 도구를 만든다<br>② <b>CLI</b>로 만들어 AI가 옵션만으로 쓸 수 있게 한다<br>③ <b>스킬</b>로 정리해서 "/이름"으로 부른다<br>④ <b>플러그인</b>으로 남과 나눈다(받는다)</div>' +
        '<p>할 수 있었던 것에 체크를 넣으세요. <b>위의 7개</b>에 체크가 들어가면 "완료로 하기"를 누를 수 있습니다. 맨 아래 1개는 할 수 있었던 사람만 합니다.</p>' +
        '<p class="note">만든 스킬(cardnews·img2pdf·photo-edit)은 이 폴더에서 앞으로도 쓸 수 있습니다. 필요 없어지면 .claude/skills 안의 그 폴더를 지우면 없어집니다. skill-creator는 /plugin의 "Installed"에서 지울 수 있습니다.</p>',
      help: [
        { q: '못 한 부분이 있어요', a: '그 단계로 돌아가서 "곤란할 때"를 보세요. 몇 번이든 다시 할 수 있습니다.' }
      ]
    }
  };

  window.COURSE_KO.lessons.l7 = {
    title: '반복 작업을 묶는 "스킬"',
    short: '라이브러리(Pillow)로 이미지를 만드는 도구를 만들고, CLI로 바꾸고, 스킬(/cardnews·/img2pdf)로 정리한다. 공식 플러그인으로 사진 보정 스킬을 만든다',
    devices: 'PC',
    doneCard: '<b>레슨7 완료입니다. 수고하셨습니다.</b><br>정해진 작업을 도구와 스킬로 묶어서 "/이름"으로 불러낼 수 있게 되었습니다. 다음은 레슨8입니다.',
    steps: steps
  };
})();
