/* 레슨1 한국어판(한국인 학습자용). 부탁하는 글과 예시도 한국어로 쓴다. */
(function () {
  'use strict';
  var C = window.COURSE;
  var cmd = C.cmd, term = C.term, link = C.link, box = C.copybox;
  var os = C.os, osBlock = C.osBlock, termOs = C.termOs;
  function c(text) { return cmd(text, '복사'); }
  function cOs(win, mac) { return C.cmdOs(win, mac, '복사'); }
  var TERM = '견본(이런 화면이 됩니다)';
  var ENTER = os('Enter 키', 'Return 키');
  var PASTE = os('Ctrl 키를 누른 채 V 키', '⌘(Command) 키를 누른 채 V 키');

  var CMD_AGY = 'irm https://antigravity.google/cli/install.ps1 | iex';
  var CMD_CODEX = 'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"';
  var CMD_CLAUDE = 'irm https://claude.ai/install.ps1 | iex';
  var CMD_CLAUDE_MAC = 'curl -fsSL https://claude.ai/install.sh | bash';
  var CMD_AGY_MAC = 'curl -fsSL https://antigravity.google/cli/install.sh | bash';
  var CMD_CODEX_MAC = 'curl -fsSL https://chatgpt.com/codex/install.sh | sh';
  var PATH_MAC_1 = 'echo \'export PATH="$HOME/.local/bin:$PATH"\' >> ~/.zshrc';
  var PATH_MAC_2 = 'source ~/.zshrc';

  /* AI에게 하는 부탁글(한국어). 도구마다 파일·폴더 이름을 달리해서 나중에 비교할 수 있게 한다. */
  function four(suffix) {
    return [
      '안녕하세요. 당신은 무엇을 할 수 있나요? 쉬운 말로 3가지 알려 주세요.',
      'intro-' + suffix + '.txt라는 이름의 파일을 만들고, 가상 인물의 자기소개를 3줄로 써 주세요.',
      'memo-' + suffix + '라는 이름의 폴더를 만들어 주세요.',
      'intro-' + suffix + '.txt를 memo-' + suffix + ' 폴더 안으로 옮겨 주세요.'
    ];
  }
  var KO_NAMES = ['① 말 걸기', '② 파일 만들기', '③ 폴더 만들기', '④ 파일 옮기기'];
  function fourBoxes(suffix) {
    return four(suffix).map(function (t, i) {
      return '<h2>' + KO_NAMES[i] + '</h2>' + box(t, null, '복사');
    }).join('');
  }

  var HELP_NOTFOUND = {
    q: '"인식되지 않습니다" "command not found"라고 나왔어요',
    a: '명령어를 찾지 못했다는 뜻입니다. 이 순서로 해 보세요.<br>' +
       '① VS Code를 완전히 닫았다가 다시 엽니다.<br>' +
       '② 터미널을 새로 열어서 다시 입력합니다.<br>' +
       '③ 그래도 안 되면 설치 명령어를 한 번 더 실행합니다.<br>' +
       os('※ 한국어 Windows에서는 "\'○○\' 용어가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않습니다"와 같은 문장이 나옵니다.',
          '※ Mac에서는 "zsh: command not found: ○○"와 같은 문장이 나옵니다.')
  };
  var HELP_ENG = { q: '터미널 글자가 영어예요', a: '괜찮습니다. 표시가 영어여도 하는 일은 같습니다.' };
  var HELP_APPROVE_C = {
    q: 'AI가 "허락하시겠습니까?"라고 물어요',
    a: 'Claude Code는 파일을 만들 때 등에 "해도 될까요?"라고 묻습니다. 연습용 agent1 폴더 안의 일이라면 "예(Yes)"를 고릅니다. 화살표 키(↑↓)로 고르고 Enter 키를 누릅니다. 잘 모르겠으면 "아니요(No)"도 괜찮습니다.'
  };
  var HELP_APPROVE = {
    q: 'AI가 "허락하시겠습니까?"라고 물어요',
    a: 'AI가 파일을 만들 때 등에 "해도 될까요?"라고 묻습니다. 연습용 agent1 폴더 안의 일이라면 <b>Y</b>(예)를 누릅니다. 잘 모르겠으면 <b>N</b>(아니요)도 괜찮습니다.'
  };

  var steps = {
    s1: {
      tag: '오늘의 목표', title: '레슨1에서 할 수 있게 되는 것',
      html:
        '<p class="note warn"><b>이 레슨은 Windows나 Mac 컴퓨터가 필요합니다.</b> 폰이나 태블릿만으로는 진행할 수 없습니다. 화면 오른쪽 위의 "Windows／Mac" 버튼으로 내 컴퓨터 쪽을 고르세요.</p>' +
        '<p>이 레슨에서는 컴퓨터에 "AI 도우미"를 1개(Claude Code) 설치해서 쓸 수 있게 만듭니다.</p>' +
        '<div class="card goal"><b>목표</b><br>컴퓨터 안에서 AI에게 "파일 만들기" "폴더 만들기" "파일 옮기기"를 부탁해서 해내게 할 수 있게 된다.</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>걸리는 시간</dt><dd>약 1시간 30분(쉬엄쉬엄 해도 OK)</dd>' +
        '<dt>컴퓨터</dt><dd>Windows 10(1809 이상)·Windows 11, 또는 macOS 13 이상</dd>' +
        '<dt>그 밖에</dt><dd>메모리 4GB 이상, 인터넷 연결</dd>' +
        '<dt>사용 가능한 나라</dt><dd>한국과 일본은 사용 가능한 나라입니다(Anthropic 공식 지원 국가 목록)</dd>' +
        '<dt>계정</dt><dd>Claude(유료 요금제가 필요합니다)</dd>' +
        '<dt>돈</dt><dd>Claude Code를 쓰려면 Claude 유료 요금제가 필요합니다. 금액은 공식 화면에서 확인하세요.</dd>' +
        '</dl></div>' +
        '<p>유료 요금제를 원하지 않는 사람은 먼저 "보너스"의 Antigravity(무료 Google 계정)로 시험해 볼 수 있습니다.</p>' +
        '<p>전부 한 번에 하지 않아도 됩니다. 중간에 그만둬도 "이어서 하기"로 다시 시작할 수 있습니다.</p>' +
        '<p class="note warn">결제와 비밀번호 입력은 반드시 <b>본인이 직접</b> 하세요. 이 교재가 대신 입력하는 일은 없습니다.</p>' +
        '<p class="note">이 절차는 2026년 10월에 각 서비스의 공식 안내로 확인했습니다. 화면은 예고 없이 바뀔 수 있습니다.</p>',
      help: [
        { q: '컴퓨터가 서툴러요', a: '이 교재는 "무엇을 누를지"를 하나씩 안내합니다. 막히면 각 화면의 "곤란할 때"를 열어 보세요.' },
        { q: 'Windows인지 Mac인지 모르겠어요', a: 'Windows는 화면 왼쪽 아래에 Windows 로고(네모난 창)가 있습니다. Mac은 화면 왼쪽 위에 사과 로고가 있습니다.' },
        { q: '오래된 컴퓨터도 되나요?', a: '공식 안내에서는 Windows 10(1809 이상)·Windows 11, 또는 macOS 13 이상이 필요합니다. 오래되었다면 먼저 OS를 업데이트하세요(Windows Update, 또는 Mac의 "시스템 설정"의 "소프트웨어 업데이트").' }
      ]
    },
    s2: {
      tag: '알아 두기', title: 'AI 에이전트가 뭔가요?',
      html:
        '<p>보통의 AI 채팅은 "질문에 답해 주는 상담 상대"입니다.</p>' +
        '<p>"AI 에이전트"는 부탁하면 PC 안의 작업을 <b>대신 해 주는 도우미</b>입니다.</p>' +
        '<ul class="parts">' +
        '<li><b>채팅 AI</b>글로 답해 줌<br><span>예: "교토 관광지를 알려 줘"</span></li>' +
        '<li><b>AI 에이전트</b>작업을 해 줌<br><span>예: "메모용 파일을 만들어 줘"</span></li>' +
        '</ul>' +
        '<p class="note warn">에이전트는 PC 안의 파일을 바꿀 수 있습니다. 그래서 이 레슨에서는 연습용 <b>"agent1" 폴더 안에서만</b> 씁니다.</p>',
      help: [
        { q: '위험하지 않나요?', a: 'AI는 파일을 만들거나 옮기기 전에 "해도 될까요?"라고 묻습니다. 연습용 폴더 안에서만 쓰면 중요한 파일은 건드리지 않습니다.' }
      ]
    },
    s3: {
      tag: '알아 두기', title: '"설치형" AI가 뭔가요?',
      html:
        '<p>브라우저에서 쓰는 AI는 인터넷 저편에 있습니다. "설치형"은 <b>PC 안에 넣어서</b> 쓰는 AI입니다. 그래서 PC 안의 파일을 직접 만질 수 있습니다.</p>' +
        '<p>오늘은 이 1개를 설치합니다.</p>' +
        '<ul class="parts">' +
        '<li><b>Claude Code</b>Anthropic의 에이전트<br><span>(부르는 이름: claude)</span></li>' +
        '</ul>' +
        '<p>이 코스의 다음 수업에서도 Claude Code를 씁니다.</p>' +
        '<p class="note">다른 AI(Google의 Antigravity, OpenAI의 Codex)는 "보너스"에서 시험해 볼 수 있습니다. 하지 않아도 괜찮습니다.</p>',
      help: [
        { q: '1개만으로 괜찮나요?', a: '괜찮습니다. 1개를 확실히 쓸 수 있게 되는 것이 가장 중요합니다.' }
      ]
    },
    s4: {
      tag: 'PC에서 조작', title: 'VS Code 내려받기',
      html:
        '<p>"VS Code"는 글과 파일을 다루는 도구에, AI에게 말을 거는 "터미널"이 붙어 있는 것입니다. 오늘 작업은 모두 여기서 합니다.</p>' +
        '<ol>' +
        '<li>브라우저에서 공식 사이트를 엽니다.<br>' + link('https://code.visualstudio.com/', 'code.visualstudio.com') + '</li>' +
        '<li>' + os('Windows용 다운로드 버튼을 누릅니다.', 'Mac용 다운로드 버튼을 누릅니다.') + '</li>' +
        '<li>내려받기가 끝날 때까지 기다립니다.</li>' +
        '</ol>' +
        os('<p class="note">공식 안내에서는 <b>"User Installer(사용자용)"</b>를 추천합니다. 관리자 허락이 필요 없기 때문입니다.</p>',
           '<p class="note">Intel Mac에서도 Apple 실리콘 Mac에서도 동작하는 <b>"Universal"</b> 버전을 쓸 수 있습니다(공식 안내).</p>') +
        '<p class="note warn">다운로드는 반드시 공식 사이트에서 하세요.</p>',
      help: [
        { q: '버튼이 여러 개예요', a: '보통 "다운로드" 버튼을 누르세요. Windows에서는 "User"라고 적힌 것이 있으면 그쪽을 추천합니다. Mac에서는 "Universal"이 있으면 그것을 고르세요.' },
        { q: '어디에 내려받아졌나요?', a: '보통은 "다운로드" 폴더입니다. 브라우저 오른쪽 위에도 내려받은 파일이 표시됩니다.' }
      ]
    },
    s5: {
      tag: 'PC에서 조작', title: 'VS Code 설치하기',
      html:
        osBlock(
          '<ol>' +
          '<li>내려받은 파일(<b>VSCodeUserSetup</b>으로 시작하는 이름)을 더블클릭합니다.</li>' +
          '<li>사용 허락 화면이 나오면 내용을 읽고, 동의하면 "동의합니다"를 선택하고 "다음".</li>' +
          '<li>그다음은 "다음"을 눌러 갑니다.</li>' +
          '<li>"GitHub Copilot CLI"라는 화면이 나오면 <b>"Don\'t add the copilot command"</b>(copilot 명령어를 추가하지 않음)를 고릅니다.</li>' +
          '<li>마지막에 "설치"를 누르고 끝날 때까지 기다립니다.</li>' +
          '<li>"완료"를 누릅니다.</li>' +
          '</ol>' +
          '<p class="note">"Don\'t add…"를 고르는 이유는 오늘은 쓰지 않기 때문입니다. 공식 안내에 나오는 화면입니다.</p>',
          '<ol>' +
          '<li>내려받은 파일을 엽니다(<b>.dmg</b>는 더블클릭. <b>.zip</b>은 더블클릭하면 압축이 풀립니다).</li>' +
          '<li>"Visual Studio Code" 아이콘을 <b>"응용 프로그램(Applications)" 폴더</b>로 끌어다 놓습니다.</li>' +
          '<li>"응용 프로그램" 폴더에서 Visual Studio Code를 <b>더블클릭</b>해서 엽니다.</li>' +
          '<li>"인터넷에서 내려받은 응용 프로그램입니다" 같은 확인이 나오면 "열기"를 누릅니다.</li>' +
          '</ol>' +
          '<p class="note">계속 쓸 거라면 Dock의 아이콘을 Control 키를 누른 채 클릭해서 "옵션"→"Dock에 유지"를 고르면 바로 열 수 있습니다(공식 안내).</p>'
        ),
      help: [
        { os: 'win', q: '관리자 비밀번호를 물어요', a: 'User용(사용자용) 설치 파일이라면 보통 묻지 않습니다. 물으면 일단 멈추고, 공식 사이트에서 User용을 다시 내려받으세요.' },
        { os: 'win', q: '"Windows에서 PC를 보호했습니다"라고 나와요', a: '공식 사이트에서 내려받은 파일인지 확인하세요. 공식 파일이라면 화면 안내에 따라 진행합니다. 불안하면 여기서 멈추고 그만둬도 됩니다.' },
        { os: 'win', q: 'Copilot CLI 화면이 안 나와요', a: '안 나올 수도 있습니다. 그대로 진행하세요.' },
        { os: 'mac', q: '"확인되지 않은 개발자라서 열 수 없습니다"라고 나와요', a: '공식 사이트에서 내려받은 것인지 확인하세요. 공식 파일이라면 아이콘을 <b>Control 키를 누른 채 클릭</b>(또는 오른쪽 클릭)해서 "열기"를 고르면 열릴 수 있습니다.' },
        { os: 'mac', q: '"캘린더나 사진 접근"을 물어요', a: 'VS Code에는 필요 없습니다. "허용 안 함"을 골라도 됩니다(공식 안내).' }
      ]
    },
    s6: {
      tag: 'PC에서 조작', title: '연습용 폴더 만들기',
      html:
        '<p>AI가 작업할 연습용 폴더를 만듭니다.</p>' +
        '<ol>' +
        '<li>바탕화면의 빈 곳에서 마우스 오른쪽 버튼을 누릅니다' + os('', '(Mac은 손가락 2개로 탭하거나 Control 키를 누른 채 클릭)') + '.</li>' +
        '<li>' + os('"새로 만들기"→"폴더"를 고릅니다.', '"새로운 폴더"를 고릅니다.') + '</li>' +
        '<li>이름을 <b>agent1</b>로 합니다(영문 숫자로 입력).</li>' +
        '<li>' + ENTER + '를 누릅니다.</li>' +
        '</ol>' +
        '<p class="note">이름을 한글로 하지 않는 것은 문제를 피하기 위해서입니다.</p>',
      help: [
        { q: '오른쪽 클릭을 모르겠어요', a: os('마우스의 오른쪽 버튼을 누릅니다. 터치패드라면 손가락 2개로 가볍게 탭합니다.', '마우스의 오른쪽 버튼을 누릅니다. 없으면 Control 키를 누른 채 클릭합니다. 트랙패드는 손가락 2개로 가볍게 탭합니다.') },
        { q: '이름을 잘못 썼어요', a: os('폴더를 오른쪽 클릭해서 "이름 바꾸기"를 고르면 고칠 수 있습니다.', '폴더를 Control 키를 누른 채 클릭해서 "이름 변경"을 고르면 고칠 수 있습니다.') }
      ]
    },
    s7: {
      tag: 'PC에서 조작', title: 'VS Code에서 폴더 열기',
      html:
        '<ol>' +
        '<li>VS Code를 엽니다(' + os('시작 메뉴에서 "Visual Studio Code"를 찾습니다', 'Dock이나 "응용 프로그램" 폴더에서 엽니다') + ').</li>' +
        '<li>위쪽 메뉴의 "파일(File)"→"폴더 열기(Open Folder)"를 고릅니다.</li>' +
        '<li>바탕화면의 <b>agent1</b>을 골라 "' + os('폴더 선택', '열기(Open)') + '"을 누릅니다.</li>' +
        '<li>"이 폴더 안 파일의 작성자를 신뢰하시겠습니까?"가 나오면 직접 만든 폴더이므로 "예, 작성자를 신뢰합니다(Yes, I trust the authors)"를 누릅니다.</li>' +
        '</ol>' +
        term(['탐색기', '▾ AGENT1', '   (아직 아무것도 없습니다)'], '견본(왼쪽이 이런 표시가 됩니다)'),
      help: [
        HELP_ENG,
        { q: '메뉴가 안 보여요', a: os('VS Code 화면 맨 위 왼쪽에 "파일" "편집" 등이 나열되어 있습니다. 안 보이면 키보드의 Alt 키를 한 번 눌러 보세요.', 'Mac에서는 화면 맨 위(Mac의 위쪽 막대)에 "파일" "편집" 등이 나옵니다. VS Code 화면을 클릭한 뒤 보세요.') },
        { os: 'mac', q: '"폴더 열기"가 없어요', a: '"파일"→"열기(Open…)"를 골라 agent1을 선택하고 "열기"를 눌러도 같습니다.' }
      ]
    },
    v1: {
      tag: '알아 두기', title: 'VS Code 화면 보는 법',
      html:
        '<p>VS Code 화면은 크게 4곳으로 나뉩니다. 이름과 위치를 봐 둡시다.</p>' +
        '<div class="vsmock noruby">' +
        '<div class="vs-menu"><b>① 위: 메뉴</b>파일　편집　보기　…　터미널</div>' +
        '<div class="vs-side"><b>② 왼쪽: 파일 목록</b>(탐색기)<br>AGENT1<br>　├ 파일<br>　└ 폴더</div>' +
        '<div class="vs-edit"><b>③ 가운데: 편집하는 곳</b>파일을 열면 내용이 여기에 나옵니다</div>' +
        '<div class="vs-term"><b>④ 아래: 터미널</b>글자로 명령을 넣는 곳. Claude Code도 여기서 씁니다</div>' +
        '</div>' +
        '<p class="note">터미널은 아직 안 나와 있을 수 있습니다. 다음 화면에서 엽니다.</p>' +
        '<p class="note">화면 오른쪽 등에 "채팅"이나 "Copilot" 같은 AI 칸이 나와 있을 수 있습니다. 이 레슨에서는 <b>쓰지 않습니다</b>. 그대로 두어도 됩니다.</p>',
      help: [
        { q: '모양이 달라요', a: 'VS Code는 업데이트로 모양이 조금 바뀝니다. 곳의 이름이 같으면 괜찮습니다.' },
        { q: '왼쪽 목록이 안 보여요', a: '왼쪽 끝에 아이콘이 세로로 나열되어 있습니다. 맨 위의 "파일 2장이 겹친" 모양을 클릭하면 파일 목록이 나옵니다.' }
      ]
    },
    v2: {
      tag: '선택', title: 'VS Code 표시를 한국어로 바꾸기(안 해도 OK)',
      html:
        '<p>VS Code는 처음에는 영어 표시입니다. 이 교재는 <b>영어 그대로도</b> 진행할 수 있습니다. 한국어로 바꾸고 싶은 사람만 다음 순서를 해 보세요.</p>' +
        '<p class="note">VS Code는 컴퓨터의 언어를 확인해서 한국어 "언어 팩" 설치를 화면 오른쪽 아래에서 권할 때가 있습니다(공식 안내). "Install and Restart" 같은 버튼이 나오면 그것을 누르기만 해도 OK입니다.</p>' +
        '<ol>' +
        '<li>' + os('Ctrl 키와 Shift 키와 P 키를 동시에 누릅니다.', '⌘(Command) 키와 Shift 키와 P 키를 동시에 누릅니다.') + '(명령어를 넣는 칸이 위에 나옵니다)</li>' +
        '<li><b>display</b>라고 입력합니다.</li>' +
        '<li><b>Configure Display Language</b>를 고릅니다.</li>' +
        '<li><b>한국어(ko)</b>를 고릅니다(아직 없으면 VS Code가 설치해 줍니다).</li>' +
        '<li>"다시 시작(Restart)"을 누릅니다.</li>' +
        '</ol>' +
        '<p class="note">한국어로 바뀌지 않아도 괜찮습니다. 영어 그대로 진행하세요. 메뉴 이름은 이 교재에 영어를 함께 적어 두었습니다.</p>',
      help: [
        { q: '한국어를 고를 수 없어요', a: '인터넷에 연결되어 있는지 확인하세요. 연결되어 있는데도 안 나오면 영어 그대로 진행해도 됩니다.' },
        { q: '영어로 되돌리고 싶어요', a: '같은 순서로 <b>English</b>를 고르고 다시 시작하세요.' }
      ]
    },
    s8: {
      tag: 'PC에서 조작', title: '터미널 열기',
      html:
        '<p>"터미널"은 <b>글자로 컴퓨터에 명령하는 곳</b>입니다.</p>' +
        '<ol>' +
        '<li>VS Code 위쪽 메뉴에서 "터미널(Terminal)"→"새 터미널(New Terminal)"을 고릅니다.</li>' +
        '<li>화면 아래에 글자를 넣는 곳이 나옵니다.</li>' +
        '</ol>' +
        termOs(['PS C:\\Users\\(내이름)\\Desktop\\agent1> _'], ['(내이름)@MacBook agent1 % _'], TERM) +
        os('<p>맨 앞에 <b>PS</b>가 나와 있으면 "PowerShell"입니다. 오늘은 이것을 씁니다.</p>',
           '<p>끝이 <b>%</b>로 되어 있으면 Mac의 기본 터미널입니다. 오늘은 이것을 씁니다.</p>'),
      help: [
        { os: 'win', q: '"PS"가 안 나와요', a: '맨 앞이 "C:\\"뿐이라면 다른 종류의 터미널입니다. 터미널 오른쪽 위 "＋" 옆의 "▾"를 눌러 "PowerShell"을 고르세요.' },
        { os: 'mac', q: '끝이 "%"가 아니라 "$"예요', a: '괜찮습니다. "$"는 다른 종류의 터미널(bash)이지만 오늘의 명령은 똑같이 쓸 수 있습니다.' },
        HELP_ENG
      ]
    },
    s9: {
      tag: 'PC에서 조작', title: '터미널에 글자 넣어 보기',
      html:
        '<ol>' +
        '<li>아래 "복사"를 누릅니다.</li>' +
        '<li>터미널의 글자 넣는 곳을 클릭합니다.</li>' +
        '<li>붙여 넣고(' + PASTE + ') ' + ENTER + '를 누릅니다.</li>' +
        '</ol>' +
        c('echo 안녕하세요') +
        termOs(['PS C:\\Users\\(내이름)\\Desktop\\agent1> echo 안녕하세요', '안녕하세요'],
               ['(내이름)@MacBook agent1 % echo 안녕하세요', '안녕하세요'], TERM) +
        '<p>"안녕하세요"가 돌아오면 성공입니다. 화면을 깨끗이 하고 싶을 때는 <b>clear</b>를 입력하고 ' + ENTER + '를 누릅니다.</p>',
      help: [
        { q: '붙여넣기가 안 돼요', a: os('Ctrl+V로 붙여넣기가 안 되면 터미널 위에서 마우스 오른쪽 클릭을 하면 붙여넣어지는 경우가 있습니다.', '⌘+V로 붙여넣기가 안 되면 터미널 위에서 손가락 2개로 탭(또는 Control 키를 누른 채 클릭)해서 "붙여넣기"를 고르세요.') },
        { q: '아무 일도 안 일어나요', a: ENTER + '를 눌렀나요? 글자를 넣은 뒤에는 ' + ENTER + '로 실행됩니다.' }
      ]
    },
    s10: {
      tag: '알아 두기', title: '안전을 위한 3가지 규칙',
      html:
        '<p>터미널은 PC에 직접 명령할 수 있는 강력한 도구입니다. 이 3가지를 지켜 주세요.</p>' +
        '<ul class="parts">' +
        '<li><b>① 교재의 명령어만</b>이 교재가 안내한 것 외에는 붙여 넣지 않는다</li>' +
        '<li><b>② 모르는 사이트의 명령어는 붙이지 않는다</b><span>뜻을 모르는 것은 실행하지 않는다</span></li>' +
        '<li><b>③ 비밀번호는 브라우저 화면에만</b><span>터미널이나 AI 대화에는 쓰지 않는다</span></li>' +
        '</ul>',
      help: [
        { q: '실수로 뭔가 실행해 버렸어요', a: '당황하지 않아도 됩니다. 일단 멈추고, 화면을 그대로 저장(스크린샷)한 뒤 잘 아는 사람에게 상담하세요.' }
      ]
    },
    s11: {
      tag: 'PC에서 조작', title: 'Antigravity CLI 설치하기',
      html:
        '<p>Google의 "Antigravity(앤티그래비티)"를 설치합니다. 터미널에서는 <b>agy</b>라고 부릅니다. Google 계정이 필요합니다.</p>' +
        '<ol>' +
        '<li>' + os('맨 앞이 <b>PS</b>인 터미널을 엽니다.', '터미널을 엽니다(끝이 <b>%</b>인 것).') + '</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 ' + ENTER + '를 누릅니다.</li>' +
        '<li>끝날 때까지 잠시 기다립니다. 진행 상황이 안 나올 수도 있습니다.</li>' +
        '</ol>' +
        cOs(CMD_AGY, CMD_AGY_MAC) +
        '<p class="note">1줄입니다. 중간에 줄바꿈하지 말고 그대로 붙여 넣으세요.</p>',
      help: [
        { os: 'win', q: '"irm"이 인식되지 않는다고 나와요', a: '맨 앞이 "PS"가 아닌 다른 터미널을 쓰고 있습니다. 앞 화면으로 돌아가 PowerShell을 다시 여세요.' },
        { q: '오류가 나왔어요', a: '화면의 글자를 스크린샷으로 저장하세요. 인터넷에 연결되어 있는지도 확인하세요.' }
      ]
    },
    s12: {
      tag: 'PC에서 조작', title: 'VS Code를 다시 열고 확인하기',
      html:
        '<p>설치한 뒤에는 터미널을 <b>새로</b> 열어야 쓸 수 있게 됩니다.</p>' +
        '<ol>' +
        '<li>VS Code를 일단 닫습니다.</li>' +
        '<li>다시 열고 "터미널"→"새 터미널"을 고릅니다.</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 ' + ENTER + '를 누릅니다.</li>' +
        '</ol>' +
        c('agy --version') +
        termOs(['PS C:\\Users\\(내이름)\\Desktop\\agent1> agy --version', '(숫자 버전이 나옵니다)'],
               ['(내이름)@MacBook agent1 % agy --version', '(숫자 버전이 나옵니다)'], TERM) +
        '<p>숫자가 나오면 성공입니다.</p>',
      help: [HELP_NOTFOUND, HELP_ENG]
    },
    s13: {
      tag: 'PC에서 조작', title: 'agy를 처음 실행하기',
      html:
        '<ol>' +
        '<li>아래 "복사"를 눌러 터미널에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>처음 설정 화면이 나옵니다. 이렇게 답합니다.<ul>' +
        '<li><b>색 설정:</b> 좋아하는 것으로 OK입니다.</li>' +
        '<li><b>표시 방식:</b> 어느 쪽이든 OK입니다.</li>' +
        '<li><b>폴더를 신뢰하시겠습니까:</b> agent1은 직접 만든 연습용 폴더이므로 신뢰합니다.</li>' +
        '</ul></li>' +
        '</ol>' +
        c('agy'),
      help: [
        { q: '선택지를 고르는 법을 모르겠어요', a: '화살표 키(↑↓)로 움직이고 Enter 키로 정합니다.' },
        HELP_ENG
      ]
    },
    s14: {
      tag: 'PC에서 조작', title: 'Google 계정으로 로그인하기',
      html:
        '<ol>' +
        '<li>브라우저가 자동으로 열립니다.</li>' +
        '<li>본인의 Google 계정으로 로그인합니다.</li>' +
        '<li>끝나면 터미널 화면으로 돌아옵니다.</li>' +
        '</ol>' +
        '<p class="note warn"><b>비밀번호는 브라우저 로그인 화면에만</b> 입력하세요. 터미널이나 AI 대화에는 넣지 않습니다.</p>',
      help: [
        { q: '브라우저가 안 열려요', a: '터미널에 로그인용 주소가 나와 있는지 확인하세요. 나와 있다면 직접 브라우저에 붙여 넣어 엽니다.' },
        { q: 'Google 계정이 없어요', a: '먼저 Google 계정을 만드세요. 계정 만들기는 본인이 직접 합니다.' }
      ]
    },
    s15: {
      tag: 'PC에서 조작', title: '실습① agy에게 말 걸기',
      html:
        '<p>agy 화면 아래의 글자 넣는 곳에 부탁을 붙여 넣습니다.</p>' +
        '<ol>' +
        '<li>"복사"를 누릅니다.</li>' +
        '<li>agy 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '</ol>' +
        box(four('agy')[0], null, '복사') +
        '<p>답이 오면 성공입니다.</p>',
      help: [HELP_APPROVE]
    },
    s16: {
      tag: 'PC에서 조작', title: '실습② 파일 만들어 달라고 하기',
      html:
        '<ol>' +
        '<li>"복사"를 눌러 agy 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 <b>Y</b>를 누릅니다.</li>' +
        '<li>VS Code 왼쪽에 <b>intro-agy.txt</b>가 늘어나면 성공입니다.</li>' +
        '</ol>' +
        box(four('agy')[1], null, '복사'),
      help: [HELP_APPROVE]
    },
    s17: {
      tag: 'PC에서 조작', title: '실습③ 폴더 만들어 달라고 하기',
      html:
        '<ol>' +
        '<li>"복사"를 눌러 agy 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 <b>Y</b>를 누릅니다.</li>' +
        '<li>VS Code 왼쪽에 <b>memo-agy</b> 폴더가 늘어나면 성공입니다.</li>' +
        '</ol>' +
        box(four('agy')[2], null, '복사'),
      help: [HELP_APPROVE]
    },
    s18: {
      tag: 'PC에서 조작', title: '실습④ 파일 옮겨 달라고 하기',
      html:
        '<ol>' +
        '<li>"복사"를 눌러 agy 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 <b>Y</b>를 누릅니다.</li>' +
        '<li>intro-agy.txt가 <b>memo-agy</b> 폴더 안에 들어가면 성공입니다.</li>' +
        '</ol>' +
        box(four('agy')[3], null, '복사') +
        '<p>끝나면 agy에 <b>/exit</b>를 입력하고 Enter 키를 누르면 종료됩니다.</p>',
      help: [
        HELP_APPROVE,
        { q: '폴더가 늘어나지 않았어요', a: 'VS Code 왼쪽 표시가 옛날 그대로일 때가 있습니다. 폴더 이름 위에서 마우스를 천천히 움직여 보세요. 그래도 안 나오면 agy에게 "지금 파일과 폴더는 어떻게 되어 있나요?"라고 물어보세요.' }
      ]
    },
    b19: {
      tag: 'PC에서 조작', title: 'agy에게 Codex를 설치해 달라고 하기',
      html:
        '<p>여기가 에이전트의 "대단한 점"입니다. AI에게 다른 AI를 설치하게 합니다.</p>' +
        '<ol>' +
        '<li>터미널에서 <b>agy</b>를 실행합니다.</li>' +
        '<li>아래 "복사"를 눌러 agy 입력란에 붙여 넣고 ' + ENTER + '를 누릅니다.</li>' +
        '<li>허락을 물으면 <b>Y</b>를 누릅니다.</li>' +
        '<li>끝나면 <b>/exit</b>로 종료합니다.</li>' +
        '</ol>' +
        osBlock(
          box('이 PC에 Codex를 설치해 주세요. PowerShell에서 다음 명령어를 실행해 주세요.\n' + CMD_CODEX + '\n끝나면 codex --version으로 동작하는지 확인해 주세요.', null, '복사'),
          box('이 Mac에 Codex를 설치해 주세요. 터미널에서 다음 명령어를 실행해 주세요.\n' + CMD_CODEX_MAC + '\n끝나면 codex --version으로 동작하는지 확인해 주세요.', null, '복사')
        ) +
        '<p class="note">잘 안 되면 "곤란할 때"에 직접 터미널에 붙여 넣는 방법이 있습니다.</p>',
      help: [
        {
          q: 'agy가 잘 못 했어요(직접 설치하는 방법)',
          a: os('맨 앞이 "PS"인 터미널에 붙여 넣고 Enter 키를 누릅니다.<br><b>Codex:</b>' + box(CMD_CODEX, null, '복사'),
                '터미널에 붙여 넣고 Return 키를 누릅니다.<br><b>Codex:</b>' + box(CMD_CODEX_MAC, null, '복사'))
        },
        HELP_APPROVE
      ]
    },
    s21: {
      tag: 'PC에서 조작', title: 'Codex에 로그인하기',
      html:
        '<p>Codex는 OpenAI(ChatGPT 회사)의 에이전트입니다. ChatGPT 계정이 필요합니다.</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 터미널에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>로그인 방법을 물으면 <b>"Sign in with ChatGPT"</b>를 고릅니다.</li>' +
        '<li>브라우저가 열리면 본인 계정으로 로그인합니다.</li>' +
        '</ol>' +
        c('codex') +
        '<p class="note warn">비밀번호는 브라우저 화면에만 입력합니다.</p>' +
        '<p class="note">ChatGPT 요금제에 따라서는 쓸 수 없을 수 있습니다. 쓸 수 없다고 나오면 이 절차는 건너뛰어도 됩니다.</p>',
      help: [
        { q: '로그인이 안 돼요', a: '먼저 ChatGPT 계정이 있는지 확인하세요. 계정 만들기는 본인이 직접 합니다. 요금제 사정으로 쓸 수 없을 때는 이 절차를 건너뛰세요.' },
        { q: '브라우저가 안 열려요', a: '터미널에 나온 주소를 직접 브라우저에 붙여 넣어 열어 보세요.' }
      ]
    },
    s22: {
      tag: 'PC에서 조작', title: 'Codex로 같은 4가지 해 보기',
      html:
        '<p>agy와 같은 4가지를 순서대로 부탁합니다. 각각 "복사"→ Codex 입력란에 붙여 넣기 → Enter 키. 허락을 물으면 <b>Y</b>(또는 화면의 "예")를 고릅니다.</p>' +
        fourBoxes('codex') +
        '<p>끝나면 VS Code 왼쪽에 <b>memo-codex</b> 폴더가 생기고 그 안에 <b>intro-codex.txt</b>가 들어 있으면 성공입니다.</p>',
      help: [HELP_APPROVE, { q: 'Codex 끝내는 법', a: 'Ctrl 키를 누른 채 C를 2번 누르거나, 화면 안내에 따라 종료합니다.' }]
    },
    s23: {
      tag: '알아 두기', title: 'Claude 요금제 확인하기',
      html:
        '<p>Claude Code를 쓰려면 Claude의 <b>유료 요금제</b>가 필요합니다. 공식 안내에서는 무료 요금제로는 Claude Code를 쓸 수 없습니다.</p>' +
        '<ol>' +
        '<li>브라우저에서 <b>claude.ai</b>를 열고 로그인합니다.</li>' +
        '<li>계정이나 요금제 화면에서 현재 요금제를 확인합니다. 화면의 이름은 바뀔 수 있습니다.</li>' +
        '</ol>' +
        '<p class="note warn">결제 입력은 <b>반드시 본인이 직접</b> 공식 화면에서 하세요. 금액과 내용은 그 화면에서 확인하세요. 이 교재는 대신 입력하지 않습니다.</p>' +
        '<p>오늘은 결제하지 않기로 해도 괜찮습니다. 여기서 멈추고, 먼저 "보너스"의 Antigravity(무료 Google 계정)로 같은 연습을 시험해 볼 수 있습니다.</p>' +
        '<p class="note">이 코스의 다음 수업은 Claude Code를 씁니다. 언제든 돌아와서 이어갈 수 있습니다.</p>',
      help: [
        { q: '무료 요금제 그대로면 어떻게 되나요?', a: 'Claude Code에 로그인해도 쓸 수 없습니다. 유료 요금제로 바꾸거나 "보너스"에서 무료 AI를 시험하세요.' },
        { q: '그만두고 싶어지면?', a: '요금제를 해지하는 방법도 공식 화면에서 확인할 수 있습니다. 계약하기 전에 해지 방법도 봐 두면 안심입니다.' }
      ]
    },
    b20: {
      tag: 'PC에서 조작', title: 'VS Code를 다시 열고 Codex 확인하기',
      html:
        '<ol>' +
        '<li>VS Code를 일단 닫았다가 다시 엽니다.</li>' +
        '<li>새 터미널을 엽니다.</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '</ol>' +
        c('codex --version') +
        '<p>숫자가 나오면 성공입니다.</p>',
      help: [HELP_NOTFOUND]
    },
    c12: {
      tag: 'PC에서 조작', title: 'Claude Code 설치하기',
      html:
        '<p>Claude Code는 Anthropic(앤트로픽)의 에이전트입니다. 터미널에서는 <b>claude</b>라고 부릅니다.</p>' +
        '<ol>' +
        '<li>' + os('맨 앞이 <b>PS</b>인 터미널을 엽니다.', '터미널을 엽니다(끝이 <b>%</b>인 것).') + '</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 ' + ENTER + '를 누릅니다.</li>' +
        '<li>끝날 때까지 잠시 기다립니다. <b>진행 상황은 나오지 않습니다.</b> 화면이 멈춘 것처럼 보여도 기다립니다.</li>' +
        '</ol>' +
        cOs(CMD_CLAUDE, CMD_CLAUDE_MAC) +
        '<p class="note">1줄입니다. 중간에 줄바꿈하지 말고 그대로 붙여 넣으세요.</p>' +
        os('<p class="note">공식 안내에서 Git이라는 소프트웨어는 "있으면 편리"하지만 없어도 쓸 수 있습니다. 오늘은 설치하지 않아도 됩니다.</p>', ''),
      help: [
        { os: 'win', q: '"irm"이 인식되지 않는다고 나와요', a: '맨 앞이 "PS"가 아닌 다른 터미널을 쓰고 있습니다. 앞 화면으로 돌아가 PowerShell을 다시 여세요.' },
        { os: 'win', q: '"&&" 오류가 나왔어요', a: '이 명령어는 PowerShell용입니다. 맨 앞이 "PS"인 터미널에서 다시 해 보세요.' },
        { os: 'mac', q: '"syntax error near unexpected token"이라고 나와요', a: '공식 안내에서는 설치용 스크립트 대신 오류 페이지가 돌아왔을 때 나옵니다. 인터넷 연결을 확인하고 잠시 뒤에 다시 시도하세요. 다른 네트워크(휴대폰 테더링 등)로도 시험해 볼 수 있습니다.' },
        { os: 'mac', q: '"permission denied"라고 나와요', a: '파일을 쓸 권한이 없다는 뜻입니다. "sudo"는 쓰지 마세요. 화면을 저장(스크린샷)해서 상담하세요.' },
        { q: '오류가 나왔어요', a: '화면의 글자를 스크린샷으로 저장하세요. 인터넷에 연결되어 있는지도 확인하세요.' }
      ]
    },
    c13: {
      tag: 'PC에서 조작', title: 'VS Code를 다시 열고 확인하기',
      html:
        '<p>설치한 뒤에는 터미널을 <b>새로</b> 열어야 쓸 수 있게 됩니다.</p>' +
        '<ol>' +
        '<li>VS Code를 일단 닫습니다.</li>' +
        '<li>다시 열고 "터미널"→"새 터미널"을 고릅니다.</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 ' + ENTER + '를 누릅니다.</li>' +
        '</ol>' +
        c('claude --version') +
        termOs(['PS C:\\Users\\(내이름)\\Desktop\\agent1> claude --version', '(숫자 버전이 나옵니다)'],
               ['(내이름)@MacBook agent1 % claude --version', '(숫자 버전이 나옵니다)'], TERM) +
        '<p>숫자가 나오면 성공입니다.</p>',
      help: [
        HELP_NOTFOUND,
        {
          os: 'win',
          q: 'VS Code를 다시 열어도 "인식되지 않습니다"라고 나와요',
          a: '설치할 때의 표시에 <b>"Setup notes"</b>와 <b>"…is not in your PATH"</b>(위치가 등록되지 않음)라는 문장이 나왔다면 직접 등록해야 합니다. 공식 안내에서 claude의 위치는 <b>C:\\Users\\내이름\\.local\\bin</b>입니다.<br>' +
             '① 시작 메뉴에서 "환경 변수"를 입력해 "시스템 환경 변수 편집"을 엽니다.<br>' +
             '② "환경 변수(N)…"를 누릅니다.<br>' +
             '③ 위쪽 "사용자 변수"의 "Path"를 선택하고 "편집"을 누릅니다.<br>' +
             '④ "새로 만들기"를 누르고 위의 위치(내 이름이 들어간 것)를 입력합니다.<br>' +
             '⑤ 모든 창을 "확인"으로 닫습니다.<br>' +
             '⑥ <b>VS Code를 완전히 닫았다가</b> 다시 열고, 새 터미널에서 <b>claude --version</b>을 확인합니다.'
        },
        {
          os: 'mac',
          q: 'VS Code를 다시 열어도 "command not found"라고 나와요',
          a: '설치할 때의 표시에 <b>"Setup notes"</b>와 <b>"…is not in your PATH"</b>(위치가 등록되지 않음)라는 문장이 나왔다면 직접 등록합니다. 공식 안내에서 claude의 위치는 <b>~/.local/bin</b>입니다. 다음 2줄을 순서대로 붙여 넣고 ' + ENTER + '를 누릅니다.' +
             box(PATH_MAC_1, null, '복사') + box(PATH_MAC_2, null, '복사') +
             '그다음 <b>VS Code를 완전히 닫았다가</b> 다시 열고, 새 터미널에서 <b>claude --version</b>을 확인합니다.'
        },
        {
          q: '어디가 문제인지 모르겠어요',
          a: 'claude가 동작할 때는 다음 명령어로 설치 상태를 점검할 수 있습니다.' + box('claude doctor', null, '복사')
        },
        HELP_ENG
      ]
    },
    c15: {
      tag: 'PC에서 조작', title: '실습① Claude Code에게 말 걸기',
      html:
        '<p>Claude Code 화면 아래의 글자 넣는 곳에 부탁을 붙여 넣습니다.</p>' +
        '<ol>' +
        '<li>"복사"를 누릅니다.</li>' +
        '<li>입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '</ol>' +
        box(four('claude')[0], null, '복사') +
        '<p>답이 오면 성공입니다.</p>',
      help: [HELP_APPROVE_C]
    },
    c16: {
      tag: 'PC에서 조작', title: '실습② 파일 만들어 달라고 하기',
      html:
        '<ol>' +
        '<li>"복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 "예(Yes)"를 고릅니다.</li>' +
        '<li>VS Code 왼쪽에 <b>intro-claude.txt</b>가 늘어나면 성공입니다.</li>' +
        '</ol>' +
        box(four('claude')[1], null, '복사'),
      help: [HELP_APPROVE_C]
    },
    c17: {
      tag: 'PC에서 조작', title: '실습③ 폴더 만들어 달라고 하기',
      html:
        '<ol>' +
        '<li>"복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 "예(Yes)"를 고릅니다.</li>' +
        '<li>VS Code 왼쪽에 <b>memo-claude</b> 폴더가 늘어나면 성공입니다.</li>' +
        '</ol>' +
        box(four('claude')[2], null, '복사'),
      help: [HELP_APPROVE_C]
    },
    c18: {
      tag: 'PC에서 조작', title: '실습④ 파일 옮겨 달라고 하기',
      html:
        '<ol>' +
        '<li>"복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 "예(Yes)"를 고릅니다.</li>' +
        '<li>intro-claude.txt가 <b>memo-claude</b> 폴더 안에 들어가면 성공입니다.</li>' +
        '</ol>' +
        box(four('claude')[3], null, '복사') +
        '<p>Claude Code는 <b>종료하지 말고</b> 이대로 다음 화면으로 진행합니다.</p>',
      help: [
        HELP_APPROVE_C,
        { q: '폴더가 늘어나지 않았어요', a: 'VS Code 왼쪽 표시가 옛날 그대로일 때가 있습니다. 폴더 이름 위에서 마우스를 천천히 움직여 보세요. 그래도 안 나오면 Claude Code에게 "지금 파일과 폴더는 어떻게 되어 있나요?"라고 물어보세요.' }
      ]
    },
    f1: {
      tag: 'PC에서 조작', title: 'Claude Code를 처음 실행하기',
      html:
        '<p>처음 실행하면 공식 안내에서는 브라우저에서 로그인하는 안내가 나옵니다. 그 밖의 선택 화면도 순서대로 나올 수 있습니다. 하나씩 진행합니다.</p>' +
        '<ol>' +
        '<li>터미널의 끝이 <b>agent1&gt;</b>' + os('(맨 앞이 <b>PS</b>)', '(Mac은 <b>agent1 %</b>)') + '로 되어 있는지 확인합니다.</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 ' + ENTER + '를 누릅니다.</li>' +
        '<li>선택 화면에서는 화살표 키(↑↓)로 고르고 ' + ENTER + '로 정합니다.</li>' +
        '</ol>' +
        c('claude') +
        '<h2>① 글자 모양(테마)</h2>' +
        '<p>나오면 어느 것을 골라도 괜찮습니다. 좋아하는 것을 골라 ' + ENTER + '를 누릅니다.</p>' +
        '<h2>② 로그인 방법</h2>' +
        '<p>다음처럼 선택지가 3개 나오면 <b>1번</b>(Claude 계정으로 로그인하는 방법)을 고릅니다.</p>' +
        term(['Select login method:', '', '❯ 1. Claude account with subscription · Pro, Max, Team, or Enterprise', '  2. Anthropic Console account · API usage billing', '  3. 3rd-party platform · Amazon Bedrock, Microsoft Foundry, or Vertex AI'], TERM) +
        '<p class="note">화면의 순서나 말은 버전에 따라 바뀔 수 있습니다. 다르면 화면의 안내에 따라 진행하세요.</p>',
      help: [
        { q: '선택 화면이 안 나와요', a: '안 나올 수도 있습니다. 그대로 다음 화면으로 진행하세요.' },
        { q: '"요금제가 필요합니다"라고 나와요', a: '무료 요금제일 때의 표시입니다. 앞 화면에서 요금제를 확인하세요.' },
        HELP_NOTFOUND,
        HELP_ENG
      ]
    },
    f2: {
      tag: 'PC에서 조작', title: '브라우저에서 로그인하고 돌아오기',
      html:
        '<ol>' +
        '<li>브라우저가 자동으로 열립니다. 본인의 Claude 계정으로 로그인합니다.</li>' +
        '<li>터미널로 돌아오면 로그인이 끝났다는 표시가 나옵니다("Login successful" 같은 문장입니다). Enter 키를 눌러 진행합니다.</li>' +
        '<li>"터미널 설정(terminal setup)" 화면이 나오면, <b>"Yes, use recommended settings"</b>(추천 설정 사용)가 선택되어 있으면 그대로 Enter 키를 누릅니다.</li>' +
        '</ol>' +
        term(['Use Claude Code\'s terminal setup?', '', '❯ 1. Yes, use recommended settings', '  2. No, maybe later with /terminal-setup'], TERM) +
        '<p class="note warn"><b>비밀번호는 브라우저 로그인 화면에만</b> 입력하세요. 터미널에는 넣지 않습니다.</p>',
      help: [
        { q: '브라우저가 안 열려요', a: '터미널에 나온 주소를 직접 브라우저에 붙여 넣어 여세요.' },
        { q: '로그인했는데 또 "로그인하세요"라고 나와요', a: 'Claude Code 입력란에 <b>/logout</b>을 입력하고 Enter 키. 일단 종료한 뒤 다시 <b>claude</b>를 실행해서 로그인을 다시 합니다.' },
        HELP_ENG
      ]
    },
    f3: {
      tag: 'PC에서 조작', title: '폴더를 신뢰하기(여기는 주의!)',
      html:
        '<p>다음처럼 "이 폴더를 신뢰하시겠습니까?"라고 묻습니다. agent1은 직접 만든 연습용 폴더이므로 <b>신뢰해도 OK</b>입니다.</p>' +
        term(['Is this a project you created or one you trust?', '', '❯ No, exit', '  Yes, I trust this folder'], TERM) +
        '<p class="note warn"><b>처음 선택되어 있는 것이 "No, exit"(종료)일 때가 있습니다.</b> 그대로 Enter 키를 누르면 끝나 버립니다. 화살표 키 <b>↓</b>로 <b>"Yes, I trust this folder"</b>로 옮긴 다음 Enter 키를 누릅니다.</p>' +
        '<p>그다음 "Welcome to Claude Code for VS Code" 같은 환영 화면이 나오면 Enter 키로 닫습니다.</p>' +
        '<p>글자를 넣는 칸이 나오면 준비 완료입니다. 여기까지의 선택 화면은 <b>처음 한 번만</b> 나옵니다. 다음부터는 바로 입력란이 나옵니다.</p>',
      help: [
        { q: '종료되어 버렸어요', a: '터미널에서 <b>claude</b>를 다시 실행하세요. 이번에는 ↓로 "Yes, I trust this folder"를 고릅니다.' },
        { q: '모르는 화면이 나왔어요', a: '화면 아래에 "Enter to confirm" 같은 안내가 나와 있는 경우가 많습니다. 그것에 따라 진행하세요. 잘 모르겠으면 화면을 저장(스크린샷)해서 상담하세요.' },
        { q: '"Auto mode" 같은 모르는 표시가 나왔어요', a: '설정 이름이 화면에 나와 있을 뿐일 수 있습니다. 허락을 물으면 내용을 보고 지금까지처럼 "예(Yes)"를 고릅니다. 모르겠으면 화면을 저장(스크린샷)해서 상담하세요.' }
      ]
    },
    t1: {
      tag: 'PC에서 조작', title: '터미널 기초① 지금 어디? 안에 뭐가 있나?',
      html:
        '<p>터미널은 폴더 안을 "돌아다니듯" 씁니다. 먼저 "지금 어느 폴더에 있나"와 "그 안에 뭐가 있나"를 봅니다.</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 ' + ENTER + '를 누릅니다.</li>' +
        '<li>이어서 나머지 하나도 같은 방법으로 합니다.</li>' +
        '</ol>' +
        '<h2>지금 있는 곳</h2>' +
        c('pwd') +
        '<h2>안에 있는 것의 목록</h2>' +
        cOs('dir', 'ls') +
        termOs(['PS C:\\Users\\(내이름)\\Desktop\\agent1> pwd', '', 'Path', '----', 'C:\\Users\\(내이름)\\Desktop\\agent1', '', 'PS C:\\Users\\(내이름)\\Desktop\\agent1> dir', '(아직 아무것도 만들지 않아서 아무것도 안 나옵니다)'],
               ['(내이름)@MacBook agent1 % pwd', '/Users/(내이름)/Desktop/agent1', '(내이름)@MacBook agent1 % ls', '(아직 아무것도 만들지 않아서 아무것도 안 나옵니다)'], TERM) +
        '<p class="note"><b>pwd</b>는 "지금 있는 곳", <b>' + os('dir', 'ls') + '</b>는 "안에 있는 것의 목록"입니다.</p>',
      help: [
        { q: '목록에 아무것도 안 나와요', a: '맞습니다. agent1에는 아직 아무것도 들어 있지 않습니다.' },
        { q: '"인식되지 않습니다"라고 나와요', a: '글자를 잘못 입력하지 않았는지 확인하세요. "복사" 버튼으로 붙여 넣으면 틀리지 않습니다.' },
        HELP_ENG
      ]
    },
    t2: {
      tag: 'PC에서 조작', title: '터미널 기초② 폴더 만들고, 들어가고, 돌아오기',
      html:
        '<p>다음 4줄을 붙여 넣습니다. 한 줄씩 차례로 실행됩니다.</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 ' + ENTER + '를 누릅니다.</li>' +
        '<li>실행이 끝날 때까지 잠시 기다립니다.</li>' +
        '<li>마지막 줄의 끝이 <b>agent1&gt;</b>' + os('', '(Mac은 <b>agent1 %</b>)') + '로 돌아와 있으면 성공입니다.</li>' +
        '</ol>' +
        cOs('mkdir renshu\ncd renshu\ndir\ncd ..', 'mkdir renshu\ncd renshu\nls\ncd ..') +
        termOs(['PS ...\\agent1> mkdir renshu', 'PS ...\\agent1> cd renshu', 'PS ...\\agent1\\renshu> dir', '(아무것도 안 나옵니다)', 'PS ...\\agent1\\renshu> cd ..', 'PS ...\\agent1>'],
               ['...agent1 % mkdir renshu', '...agent1 % cd renshu', '...renshu % ls', '(아무것도 안 나옵니다)', '...renshu % cd ..', '...agent1 %'], '견본(이런 흐름이 됩니다)') +
        '<p class="note">뜻: renshu(연습)라는 폴더를 만들고 → 그 안으로 들어가고 → 내용을 보고 → 한 단계 위로 돌아옵니다.</p>' +
        '<h2>자주 쓰는 6가지 명령어</h2>' +
        '<ul class="parts">' +
        '<li><b>pwd</b><span>지금 있는 곳</span></li>' +
        '<li><b>' + os('dir', 'ls') + '</b><span>안에 있는 것의 목록</span></li>' +
        '<li><b>cd 이름</b><span>그 폴더로 들어가기</span></li>' +
        '<li><b>cd ..</b><span>한 단계 위로 돌아가기</span></li>' +
        '<li><b>mkdir 이름</b><span>폴더 만들기</span></li>' +
        '<li><b>clear</b><span>화면 깨끗이 하기</span></li>' +
        '</ul>',
      help: [
        { q: '아직 renshu 안에 있어요', a: '터미널에 <b>cd ..</b>를 입력하고 ' + ENTER + '를 누르면 한 단계 위로 돌아옵니다.' },
        { q: '"이미 존재합니다"라고 나와요', a: 'renshu 폴더가 이미 있다는 뜻입니다. 그대로 다음으로 진행해도 괜찮습니다.' },
        HELP_ENG
      ]
    },
    w1: {
      tag: 'PC에서 조작', title: '말로 부탁해서 웹페이지 만들게 하기',
      html:
        '<p>지금까지는 파일과 폴더를 만들게 했습니다. 이번에는 <b>눈에 보이는 것</b>을 만들게 합니다.</p>' +
        '<ol>' +
        '<li>"복사"를 눌러 Claude Code 입력란에 붙여 넣고 ' + ENTER + '를 누릅니다.</li>' +
        '<li>허락을 물으면 "예(Yes)"를 고릅니다.</li>' +
        '<li>VS Code 왼쪽에 <b>my-page.html</b>이 늘어나면 성공입니다.</li>' +
        '</ol>' +
        box('my-page.html이라는 이름으로 아주 간단한 자기소개 웹페이지를 만들어 주세요. 이름은 "민지", 한마디는 "처음 뵙겠습니다, AI를 공부 중입니다"로 해 주세요. 배경은 흰색으로, 이름과 한마디만 화면 가운데에 크게 표시해 주세요.', null, '복사') +
        '<p class="note">이름과 한마디는 가상의 것입니다. 진짜 개인정보는 넣지 않습니다.</p>',
      help: [
        HELP_APPROVE_C,
        { q: 'my-page.html이 안 늘어나요', a: 'VS Code 왼쪽 표시가 옛날 그대로일 때가 있습니다. 잠시 기다리거나 폴더 이름 위에서 마우스를 움직여 보세요. AI가 다른 이름으로 만들었다면 그 이름으로 진행하세요.' }
      ]
    },
    w2: {
      tag: 'PC에서 조작', title: '브라우저에서 열어서 보자',
      html:
        '<ol>' +
        '<li>VS Code 왼쪽에서 <b>my-page.html</b>을 오른쪽 클릭합니다' + os('', '(Mac은 Control 키를 누른 채 클릭)') + '.</li>' +
        '<li>' + os('"탐색기에서 표시(Reveal in File Explorer)"', '"Finder에서 보기(Reveal in Finder)"') + '를 고릅니다.</li>' +
        '<li>나온 화면에서 <b>my-page.html</b>을 더블클릭합니다.</li>' +
        '<li>브라우저에서 페이지가 열립니다.</li>' +
        '</ol>' +
        '<h2><span class="tag sample">견본</span>이런 화면이 됩니다</h2>' +
        '<div class="card sample-box" style="text-align:center;padding:36px 16px;"><div style="font-size:30px;font-weight:700;">민지</div><div style="font-size:18px;">처음 뵙겠습니다, AI를 공부 중입니다</div></div>' +
        '<p class="note">모양은 AI에 따라 조금 다를 수 있습니다.</p>',
      help: [
        { q: '더블클릭해도 안 열려요', a: '파일을 오른쪽 클릭해서 "연결 프로그램"(Mac은 "다음으로 열기")으로 브라우저(Chrome, Edge, Safari 등)를 고르세요.' },
        { q: '글자가 이상한 글자로 나와요', a: 'Claude Code에게 "my-page.html의 글자 깨짐을 고쳐 주세요"라고 부탁하세요.' },
        { q: '파일을 찾을 수 없어요', a: 'VS Code 왼쪽에 my-page.html이 있는지 확인하세요. 없으면 한 화면 앞에서 다시 하세요.' }
      ]
    },
    w3: {
      tag: 'PC에서 조작', title: '페이지를 고쳐 달라고 하자',
      html:
        '<p>새로 만드는 것이 아니라 <b>지금 페이지를 고치게</b> 합니다. Claude Code의 같은 화면에 이어서 부탁합니다.</p>' +
        '<ol>' +
        '<li>"복사"를 눌러 Claude Code 입력란에 붙여 넣고 ' + ENTER + '를 누릅니다.</li>' +
        '<li>허락을 물으면 "예(Yes)"를 고릅니다.</li>' +
        '<li>브라우저로 돌아가 ' + os('<b>F5</b> 키', '<b>⌘(Command) 키와 R 키</b>') + '를 누릅니다(페이지를 다시 불러옵니다).</li>' +
        '</ol>' +
        box('my-page.html의 글자 색을 파란색으로, 배경을 연한 노란색으로 해 주세요.', null, '복사') +
        '<p>색이 바뀌어 있으면 성공입니다.</p>' +
        '<p>시간이 있으면 직접 색이나 말을 바꿔서 한 번 더 부탁해 보세요. "부탁하는 말을 바꾸면 결과도 바뀐다"는 것을 알 수 있습니다.</p>' +
        '<p>끝나면 Claude Code에 <b>/exit</b>를 입력하고 ' + ENTER + '를 누르면 종료됩니다.</p>',
      help: [
        HELP_APPROVE_C,
        { q: '색이 안 바뀌어요', a: '브라우저에서 페이지를 다시 불러왔나요(' + os('F5 키', '⌘ 키와 R 키') + ')? 그래도 안 바뀌면 Claude Code에게 "my-page.html은 바뀌었나요?"라고 물어보세요.' }
      ]
    },
    c19: {
      tag: '확인', title: '마지막 확인',
      checks: [
        'VS Code를 설치하고 agent1 폴더를 열었다',
        '터미널에서 echo, pwd, cd, mkdir 등의 명령이 동작했다',
        'Claude Code에게 4가지 부탁(말하기, 파일 만들기, 폴더 만들기, 옮기기)을 했다',
        '말로 부탁해서 웹페이지를 만들게 하고 고치게 했다'
      ],
      html:
        '<p>할 수 있었던 것에 체크를 넣으세요. 4개 모두 넣으면 "완료로 하기"를 누를 수 있습니다.</p>' +
        '<p class="note">다른 AI도 시험해 보고 싶은 사람은 목차의 "보너스"로 갈 수 있습니다(하지 않아도 괜찮습니다).</p>',
      help: [
        { q: '못 한 부분이 있어요', a: '그 단계로 돌아가서 "곤란할 때"를 보세요. 몇 번이든 다시 할 수 있습니다.' }
      ]
    },
    b1: {
      tag: '보너스', title: '다른 AI도 시험해 보자(선택)',
      html:
        '<p class="note warn"><b>이 "보너스"는 하지 않아도 괜찮습니다.</b> 레슨1 앞부분(VS Code 준비와 agent1 폴더)이 끝난 사람용입니다.</p>' +
        '<p>여기서는 다음 2가지를 시험해 볼 수 있습니다.</p>' +
        '<ul class="parts">' +
        '<li><b>Antigravity(agy)</b>Google의 에이전트<br><span>무료 Google 계정으로 쓸 수 있습니다</span></li>' +
        '<li><b>Codex</b>OpenAI의 에이전트<br><span>ChatGPT 계정이 필요합니다</span></li>' +
        '</ul>' +
        '<p>같은 부탁을 순서대로 해서 비교해 봅니다.</p>' +
        '<p class="note">유료 요금제를 원하지 않는 사람은 먼저 Antigravity만 시험해도 OK입니다.</p>',
      help: [
        { q: '보너스는 꼭 해야 하나요?', a: '하지 않아도 괜찮습니다. AI별 차이를 알고 싶은 사람이나 무료로 시험하고 싶은 사람용입니다.' }
      ]
    },
    b26: {
      tag: '알아 두기', title: '비교해 보자',
      html:
        '<p>같은 부탁을 여러 AI에게 했습니다. 다음을 떠올려 보세요.</p>' +
        '<ul>' +
        '<li>어느 것이 가장 <b>알기 쉽다</b>고 느꼈나요?</li>' +
        '<li>허락을 묻는 방식은 어떻게 달랐나요?</li>' +
        '<li>답의 길이나 말투는 어떻게 달랐나요?</li>' +
        '</ul>' +
        '<p>정답은 없습니다. "나에게는 어느 것이 쓰기 편한가"가 중요합니다. 메모해 두면 나중에 도움이 됩니다.</p>' +
        '<p>VS Code 왼쪽을 보면 <b>intro-</b> 파일이 사용한 개수만큼(agy, codex, claude) 있을 것입니다. 열어서 내용을 비교해 보세요.</p>',
      help: [
        { q: '1개밖에 못 썼어요', a: '괜찮습니다. 쓸 수 있었던 것만으로 비교하세요.' }
      ]
    }
  };

  window.COURSE_KO.lessons.l1 = {
    title: 'AI 에이전트 이해와 작업 환경 준비',
    short: 'PC에 AI 도우미(Claude Code)를 설치하고 파일을 만들게 한다',
    devices: 'PC',
    doneCard: '<b>레슨1　완료입니다. 수고하셨습니다.</b><br>PC 안에서 AI에게 작업을 부탁할 수 있게 되었습니다. 다음은 레슨2(준비 중)입니다.',
    steps: steps
  };
  window.COURSE_KO.lessons.l1b = {
    title: '다른 AI도 시험해 보자(보너스·선택)',
    short: 'Antigravity(무료 Google 계정)와 Codex로 같은 4가지를 해 본다',
    devices: 'PC',
    doneCard: '<b>보너스　수고하셨습니다.</b>',
    steps: steps
  };
})();
