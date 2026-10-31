/* 레슨3 한국어판(한국인 학습자용). 부탁하는 글과 예시도 한국어로 쓴다.
   내용은 2026-10-31에 Claude Code 공식 안내로 확인(permission-modes, permissions, settings, model-config, commands, chrome). */
(function () {
  'use strict';
  var C = window.COURSE;
  var cmd = function (t) { return C.cmd(t, '복사'); };
  var box = function (t) { return C.copybox(t, null, '복사'); };
  var term = C.term;
  var os = C.os;

  var HELP_APPROVE = {
    q: 'AI가 "허락하시겠습니까?"라고 물어요',
    a: 'AI가 파일을 만들거나 고치거나 명령어를 실행하기 전에 "해도 될까요?"라고 묻습니다. 화면에 나온 내용을 읽고, 연습용 agent1 폴더 안의 일이라면 "예(Yes)"를 고릅니다. 화살표 키(↑↓)로 고르고 Enter 키를 누릅니다. 잘 모르겠으면 "아니요(No)"도 괜찮습니다.'
  };
  var HELP_ENG = { q: '터미널 글자가 영어예요', a: '괜찮습니다. 표시가 영어여도 하는 일은 같습니다.' };
  var HELP_ESC = { q: '화면을 닫고 싶어요', a: 'Esc 키(키보드 왼쪽 위의 "Esc")를 누르면 닫힙니다. 그래도 안 닫히면 Esc 키를 한 번 더 누르세요.' };
  var HELP_NOBAR = {
    q: '화면 아래에 mode 표시가 안 보여요',
    a: '터미널 창이 작으면 아래 줄이 안 보일 수 있습니다. VS Code 아래쪽(터미널)을 위로 끌어서 키우거나 창을 크게 해 보세요. 그래도 안 보이면 Shift+Tab을 눌렀을 때 화면 아래쪽 글자가 바뀌는지 보세요.'
  };

  var steps = {
    c1: {
      tag: '오늘의 목표', title: '레슨3에서 할 수 있게 되는 것',
      html:
        '<p class="note warn"><b>이 레슨은 Windows나 Mac 컴퓨터가 필요합니다.</b> 레슨2가 끝난 사람용입니다. 화면 오른쪽 위의 "Windows／Mac" 버튼으로 내 컴퓨터 쪽을 고르세요.</p>' +
        '<p>AI는 파일을 만들고 명령어를 실행할 수 있습니다. 편리한 만큼 <b>어디까지 맡길지</b>를 내가 정할 수 있으면 안심입니다. 오늘은 그 정하는 방법을 배웁니다.</p>' +
        '<div class="card goal"><b>목표</b><br>① 지금 상태를 <b>본다</b>(/status·/config·/usage)<br>② AI에게 맡기는 범위(<b>권한 모드</b>)를 내가 <b>바꾼다</b><br>③ "이 파일은 읽지 마"라는 <b>규칙</b>을 내가 쓴다<br>④ 모델을 보고, 인터넷으로 조사하게 한다(출처 확인)</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>걸리는 시간</dt><dd>약 1시간 30분(쉬어 가며 해도 됩니다)</dd>' +
        '<dt>쓰는 것</dt><dd>VS Code, agent1 폴더, Claude Code(레슨1·2에서 준비한 것)</dd>' +
        '<dt>덤(선택)</dt><dd>Claude in Chrome: AI에게 브라우저를 조작하게 합니다. Chrome이나 Edge가 필요합니다.</dd>' +
        '</dl></div>' +
        '<p class="note warn">연습은 <b>agent1 폴더 안에서만</b> 합니다. 진짜 개인정보나 중요한 파일은 넣지 않습니다.</p>',
      help: [
        { q: '레슨2가 끝나지 않았어요', a: '먼저 레슨2를 끝내 주세요. VS Code, agent1 폴더, Claude Code가 필요합니다.' }
      ]
    },
    c2: {
      tag: 'PC에서 조작', title: '복습: Claude Code 실행하기',
      html:
        '<p>지난번과 똑같이 Claude Code를 실행합니다.</p>' +
        '<ol>' +
        '<li>VS Code를 엽니다.</li>' +
        '<li>"파일"→"폴더 열기"로 <b>agent1</b>을 엽니다.</li>' +
        '<li>"터미널"→"새 터미널"을 고릅니다.</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '</ol>' +
        cmd('claude') +
        '<p>글자를 넣는 칸이 나오면 준비 완료입니다. <b>이 레슨은 계속 이 화면에서 진행합니다.</b></p>',
      help: [
        { q: '"인식되지 않습니다"라고 나와요', a: 'VS Code를 완전히 닫았다가 다시 열고, 새 터미널에서 해 보세요.' },
        { q: '"이 폴더를 신뢰하시겠습니까?"라고 나와요', a: '화살표 키 ↓로 "Yes, I trust this folder"를 고르고 Enter 키를 누릅니다. 처음에 "No, exit"가 선택되어 있을 수 있으니 주의하세요.' },
        HELP_ENG
      ]
    },
    c3: {
      tag: '알아 두기', title: 'AI를 지키는 3가지 장치',
      html:
        '<p>AI가 마음대로 무언가를 해 버리지 않도록 Claude Code에는 <b>3가지 장치</b>가 있습니다.</p>' +
        '<ul class="parts">' +
        '<li><b>① 모드</b>"지금 어디까지 자동으로 해도 되나"를 정한다<br><span>스위치 같은 것. Shift+Tab으로 바꿈</span></li>' +
        '<li><b>② 규칙</b>"이건 금지", "이건 매번 물어봐"를 정한다<br><span>settings.json에 씀. <b>Claude Code 자신이 지키게 함</b></span></li>' +
        '<li><b>③ CLAUDE.md</b>AI에게 하는 "부탁" 메모<br><span>AI가 읽지만 <b>지킨다는 보장은 없음</b></span></li>' +
        '</ul>' +
        '<div class="card">비유하면 <b>모드＝문지기의 엄격함</b>, <b>규칙＝문의 자물쇠</b>, <b>CLAUDE.md＝벽에 붙인 부탁 쪽지</b>입니다. 중요한 것을 지키는 것은 쪽지가 아니라 자물쇠입니다.</div>' +
        '<p class="note">공식 안내에서는 "규칙은 모델(AI)이 아니라 Claude Code가 지키게 한다. 글로 부탁하거나 CLAUDE.md에 써도 Claude Code가 허용하는 범위는 바뀌지 않는다"라고 설명합니다.</p>',
      help: [
        { q: 'CLAUDE.md에 쓰는 것만으로는 안 되나요?', a: 'CLAUDE.md는 AI가 읽는 "부탁"입니다. 대체로 지켜 주지만 보장은 없습니다. 절대 읽히고 싶지 않은 것은 뒤에 나오는 "규칙"으로 막습니다.' }
      ]
    },
    c4: {
      tag: 'PC에서 조작', title: '"지금 상태" 보기: /status',
      html:
        '<p>Claude Code 입력란에 <b>/status</b>를 입력하고 Enter 키를 누릅니다.</p>' +
        cmd('/status') +
        '<ol>' +
        '<li>"Status"라는 화면이 열립니다. 버전, 쓰고 있는 AI(모델), 계정 등이 나옵니다.</li>' +
        '<li><b>Setting sources</b>라는 줄이 있으면 봅니다. "어떤 설정 파일을 읽었는지"가 나옵니다(아직 설정 파일이 없는 사람은 안 나올 수도 있습니다).</li>' +
        '<li>다 봤으면 <b>Esc 키</b>로 닫습니다.</li>' +
        '</ol>' +
        '<p class="note warn">이 화면에는 <b>내 이메일 주소</b> 등이 나올 수 있습니다. 화면을 남에게 보여 주거나 사진을 보낼 때는 조심하세요.</p>',
      help: [
        HELP_ESC,
        { q: '"/status"를 입력했는데 화면이 안 열려요', a: '입력란(Claude Code 안)에 입력했는지 확인하세요. "PS …>"나 "… %" 줄(터미널)에 넣으면 동작하지 않습니다. 먼저 "claude"로 Claude Code를 실행합니다.' },
        { q: '영어라서 잘 모르겠어요', a: '버전(version), 모델(model), 계정(account)만 찾으면 충분합니다. 전부 읽을 필요는 없습니다.' }
      ]
    },
    c5: {
      tag: 'PC에서 조작', title: '"설정 메뉴" 보기: /config',
      html:
        '<p>다음은 <b>/config</b>를 입력하고 Enter 키를 누릅니다.</p>' +
        cmd('/config') +
        '<ol>' +
        '<li>"Config"라는 화면이 열립니다. 테마(색) 등 <b>내 설정</b>이 늘어서 있습니다.</li>' +
        '<li>↑↓ 키로 위아래로 움직일 수 있습니다. 오늘은 <b>보기만</b> 합니다. 아무것도 바꾸지 말고 <b>Esc 키</b>로 닫습니다.</li>' +
        '</ol>' +
        '<p class="note">여기서 설정을 바꾸면 Claude Code가 내 설정 파일(<b>~/.claude/settings.json</b>)에 저장해 줍니다. 공식 안내에서는 "처음 바꿀 때 파일이 만들어진다"고 설명합니다.</p>' +
        '<p class="note">이 메뉴는 <b>터미널판</b>(지금 쓰는 화면)의 기능입니다. VS Code의 "채팅 화면"에서는 열리지 않는다고 공식 안내에 있습니다.</p>',
      help: [
        HELP_ESC,
        { q: '실수로 뭔가 바꿔 버린 것 같아요', a: '괜찮습니다. /config를 다시 열어 원래 값으로 돌리면 됩니다. 색이나 테마만 바꿨다면 학습에는 영향이 없습니다.' }
      ]
    },
    c6: {
      tag: 'PC에서 조작', title: '"쓴 양" 보기: /usage',
      html:
        '<p>AI는 너무 많이 쓰면 <b>한동안 멈출</b> 수 있습니다(사용 한도). 얼마나 썼는지 봅시다.</p>' +
        '<ol>' +
        '<li><b>/usage</b>를 입력하고 Enter 키를 누릅니다.</li>' +
        '<li>이번 대화의 양이나 요금제별 한도가 나옵니다(요금제에 따라 나오는 내용이 다릅니다).</li>' +
        '<li>다 봤으면 <b>Esc 키</b>로 닫습니다.</li>' +
        '</ol>' +
        cmd('/usage') +
        '<h2>브라우저에서도 볼 수 있어요(보기만)</h2>' +
        '<p>브라우저에서 <b>claude.ai</b>에 로그인해서 내 아이콘이나 이름 근처의 "설정" 같은 항목에서 <b>사용량</b>이나 <b>결제</b> 같은 항목을 찾으면 비슷한 정보를 볼 수 있습니다. 메뉴 이름은 바뀔 수 있습니다. <b>보기만</b> 하고 아무것도 바꾸지 않습니다.</p>' +
        '<p class="note warn">결제 변경이나 요금제 변경은 <b>본인이 직접</b> 합니다. 이 교재에서는 하지 않습니다.</p>',
      help: [
        HELP_ESC,
        { q: '"한도에 도달했습니다"라고 나와요', a: '잠시 기다리면 다시 쓸 수 있게 됩니다. 급할 때는 공식 안내(요금제 설명)를 보고 본인이 판단하세요.' },
        { q: '/usage 내용을 잘 모르겠어요', a: '오늘은 "볼 수 있다"는 것만 알면 충분합니다. 숫자의 뜻은 나중에 조금씩 익히면 됩니다.' }
      ]
    },
    c7: {
      tag: '알아 두기', title: '"권한 모드"가 뭐예요?',
      html:
        '<p>권한 모드는 <b>"AI에게 어디까지 맡길지"</b>를 정하는 스위치입니다. 주요 모드는 4가지입니다.</p>' +
        '<ul class="parts">' +
        '<li><b>① Manual(매뉴얼)</b>대부분의 작업에서 매번 묻는다<br><span>가장 안심. 화면 아래에는 "manual mode on"</span></li>' +
        '<li><b>② Accept edits(편집은 자동 허락)</b>파일 만들기·고치기는 묻지 않고 한다<br><span>아래에는 "accept edits on"</span></li>' +
        '<li><b>③ Plan(계획만)</b>조사하고 <b>계획만 세운다</b>. 파일은 고치지 않는다<br><span>아래에는 "plan mode on"</span></li>' +
        '<li><b>④ Auto(알아서)</b>묻지 않고 진행한다. 대신 <b>다른 AI가 위험한 일을 하지 않는지 지켜본다</b><br><span>아래에는 "auto mode on"</span></li>' +
        '</ul>' +
        term(['⏸ manual mode on  (shift+tab to cycle)'], '예시: 화면 아래 줄(표시는 버전에 따라 조금 다릅니다)') +
        '<p class="note warn"><b>처음 모드는 사람마다 다릅니다.</b> 공식 안내에 따르면 최근 버전에서는 처음부터 <b>Auto</b>인 사람도 있습니다. 배우는 동안은 내가 무엇을 허락하는지 알 수 있는 <b>Manual</b>을 권합니다.</p>' +
        '<p class="note">"모두 허락(bypass)"이라는 모드도 있지만 <b>이 교재에서는 쓰지 않습니다</b>. 보통 쓸 때는 필요 없습니다.</p>',
      help: [
        { q: 'Auto는 위험하지 않나요?', a: 'Auto에서는 다른 AI가 위험한 일을 하지 않는지 확인합니다. 하지만 완벽하지는 않습니다. 먼저 Manual로 AI가 무엇을 하는지 보는 습관을 들이세요.' },
        { q: '나는 어떤 모드예요?', a: '다음 화면에서 확인합니다. Claude Code 화면의 맨 아래 줄을 봅니다.' }
      ]
    },
    c8: {
      tag: 'PC에서 조작', title: '지금 모드를 보고 바꾸기(Shift+Tab)',
      html:
        '<p>Claude Code 화면의 <b>맨 아래 줄</b>을 보세요. "manual mode on", "accept edits on", "plan mode on", "auto mode on" 같은 글자가 있습니다.</p>' +
        '<ol>' +
        '<li>지금 뭐라고 적혀 있나요? 확인합니다.</li>' +
        '<li>키보드의 <b>Shift 키를 누른 채 Tab 키</b>를 누릅니다(Shift+Tab).</li>' +
        '<li>아래 줄의 글자가 바뀝니다. 몇 번 눌러서 <b>4가지를 모두</b> 봅니다(빙글빙글 돕니다).</li>' +
        '<li>마지막에는 <b>manual mode on</b>이 되는 곳에서 멈춥니다.</li>' +
        '</ol>' +
        term(['⏸ manual mode on', '⏵⏵ accept edits on', '⏸ plan mode on', '⏵⏵ auto mode on', '(Shift+Tab을 누를 때마다 순서대로 바뀝니다)'], '예시: 누를 때마다 이런 순서로 바뀝니다') +
        '<p class="note">공식 안내에 따르면 Auto에서 시작한 사람은 첫 번째 누름에 Manual이 되고, 그다음 accept edits → plan → auto 순서입니다. Auto가 안 나오는 사람(쓸 수 없는 설정)은 3개로 돕니다.</p>',
      help: [
        HELP_NOBAR,
        { q: 'Shift+Tab을 눌러도 안 바뀌어요', a: 'Claude Code 입력란에 커서가 있는 상태에서 누르세요. Claude Code가 일하는 중(글자가 흐르는 중)에는 끝나기를 기다립니다.' },
        { q: '"manual"이 안 나와요', a: 'Claude Code 버전에 따라 표시가 조금 다를 수 있습니다. "default"나 "허락을 매번 묻는" 같은 표시여도 괜찮습니다. 이 화면에서 모드가 바뀌는 것이 보이면 OK입니다.' }
      ]
    },
    c9: {
      tag: 'PC에서 조작', title: 'Accept edits 해 보기',
      html:
        '<p>"편집은 자동 허락" 모드를 써 보고 Manual과의 차이를 봅니다.</p>' +
        '<ol>' +
        '<li>Shift+Tab으로 아래 줄을 <b>accept edits on</b>으로 만듭니다.</li>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>파일을 만드는데 <b>허락을 묻지 않고</b> 바로 만들어지면 성공입니다. VS Code 왼쪽에 <b>memo3.txt</b>가 늘어납니다.</li>' +
        '</ol>' +
        box('memo3.txt라는 이름으로 한 줄짜리 파일을 만들어 주세요. 내용은 "이것은 레슨3 연습입니다"로 해 주세요.') +
        '<p class="note warn">이 모드에서도 <b>삭제(rm) 같은 것이 자동으로 허락될 수 있습니다</b>(연습용 폴더 안일 때). 공식 안내로 확인했습니다. 중요한 파일이 있는 폴더에서는 쓰지 마세요.</p>' +
        '<p>끝나면 Shift+Tab으로 <b>plan mode on</b>을 만들고 다음으로 갑니다.</p>',
      help: [
        HELP_NOBAR,
        HELP_APPROVE,
        { q: '허락을 물었어요', a: '모드가 accept edits가 아닐 수도 있습니다. 아래 줄을 확인하고 Shift+Tab을 다시 누르세요. 물었다면 "예(Yes)"를 골라도 괜찮습니다.' },
        { q: '파일이 안 늘어나요', a: 'VS Code 왼쪽 표시가 옛날 그대로일 때가 있습니다. 잠시 기다리거나 폴더 이름 위에서 마우스를 천천히 움직여 보세요.' }
      ]
    },
    c10: {
      tag: 'PC에서 조작', title: 'Plan(계획만) 해 보기',
      html:
        '<p>아래 줄이 <b>plan mode on</b>인지 확인합니다. 이 모드에서 AI는 <b>조사하고 계획을 세우기만</b> 하고 파일은 고치지 않습니다.</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>AI가 계획을 내놓고 "어떻게 할까요?" 같은 선택지를 보여 줍니다.</li>' +
        '<li>이번에는 <b>"No, keep planning"</b>(계속 계획하기) 같은 <b>실행하지 않는</b> 쪽을 고릅니다(화살표 키＋Enter 키).</li>' +
        '<li>VS Code에서 memo3.txt를 열어 <b>내용이 바뀌지 않았는지</b> 확인합니다.</li>' +
        '</ol>' +
        box('memo3.txt의 내용을 5줄로 늘리는 계획을 세워 주세요. 아직 파일은 고치지 마세요.') +
        '<p class="note">계획이 마음에 들면 "실행"을 고르면 그다음 AI가 작업합니다. 선택지 이름은 버전에 따라 다를 수 있습니다(공식 안내에는 "Yes, and use auto mode", "Yes, manually approve edits", "No, keep planning" 예가 있습니다).</p>' +
        '<p>끝나면 Shift+Tab으로 <b>manual mode on</b>으로 돌려 놓습니다.</p>',
      help: [
        HELP_NOBAR,
        { q: '선택지가 안 나와요', a: 'AI가 아직 생각 중일 수 있습니다. 잠시 기다리세요. 선택지 없이 보통 답변만 나올 때도 있습니다. 그때는 계획이 글로 나왔다면 성공입니다.' },
        { q: '실수로 실행하는 쪽을 골랐어요', a: '괜찮습니다. memo3.txt는 연습용입니다. 내용이 바뀌었어도 "처음 1줄만 남기고 돌려 주세요"라고 부탁할 수 있습니다.' }
      ]
    },
    c11: {
      tag: '알아 두기', title: 'settings.json이 뭐예요?',
      html:
        '<p><b>settings.json</b>은 Claude Code의 <b>설정을 적어 두는 파일</b>입니다. 규칙(허락·금지)도 여기에 씁니다.</p>' +
        '<ul class="parts">' +
        '<li><b>내 것(모든 폴더)</b><br><span>~/.claude/settings.json</span></li>' +
        '<li><b>이 폴더용(같이 쓰는 것)</b><br><span>.claude/settings.json</span></li>' +
        '<li><b>이 폴더용(나만)</b><br><span>.claude/settings.local.json</span></li>' +
        '</ul>' +
        '<p class="note">"~"는 컴퓨터 안의 내 "홈" 폴더입니다. Windows에서는 <b>C:\\Users\\(내 이름)</b> 같은 곳입니다.</p>' +
        '<p>공식 안내에 따르면 <b>Claude Code를 설치만 해서는 이 파일들이 만들어지지 않습니다</b>. 설정을 바꿀 때 등에 만들어집니다.</p>' +
        '<h2>쓰는 규칙(JSON)</h2>' +
        '<p>이 파일은 "JSON(제이슨)"이라는 쓰는 방식입니다. <b>엄격한 규칙</b>이 있습니다.</p>' +
        '<ul class="parts">' +
        '<li><b>글자는 " (큰따옴표)로 감싼다</b></li>' +
        '<li><b>마지막 항목 뒤에 쉼표(,)를 붙이지 않는다</b></li>' +
        '<li><b>메모(// …)는 넣을 수 없다</b></li>' +
        '</ul>' +
        '<p class="note warn">규칙을 어기면 "Settings Error"가 나옵니다(공식 안내). 다음 화면에서는 복사해서 붙여 넣으니 안심하세요.</p>',
      help: [
        { q: '"홈" 폴더가 어디예요?', a: 'Windows는 C:\\Users\\(내 이름), Mac은 "Finder" 왼쪽에 있는 집 모양 이름의 폴더입니다. 오늘은 직접 찾을 필요가 없습니다.' },
        { q: 'JSON이 어려워요', a: '오늘은 복사한 글자를 붙여 넣기만 하면 됩니다. 뜻은 조금씩 알아 가면 충분합니다.' }
      ]
    },
    c12: {
      tag: 'PC에서 조작', title: '"비밀 메모" 만들고 읽히는지 보기',
      html:
        '<p>먼저 "읽히고 싶지 않은 파일" 역할을 할 연습용 파일을 만듭니다. 내용은 <b>가상</b>입니다.</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 "예(Yes)"를 고릅니다.</li>' +
        '<li>VS Code 왼쪽에 <b>secret.txt</b>가 늘어나면 다음으로 갑니다.</li>' +
        '</ol>' +
        box('secret.txt라는 이름으로 한 줄짜리 파일을 만들어 주세요. 내용은 "이것은 연습용 비밀 메모입니다(가상)"로 해 주세요.') +
        '<p>다음에는 AI가 읽을 수 있는지 확인합니다.</p>' +
        box('secret.txt를 읽고 내용을 알려 주세요.') +
        '<p>내용을 답해 주면 성공입니다. <b>이 시점에서는 읽히는 것이 맞습니다</b>.</p>',
      help: [HELP_APPROVE, { q: 'VS Code 왼쪽에 파일이 안 늘어나요', a: 'VS Code 왼쪽 표시가 옛날 그대로일 때가 있습니다. 잠시 기다리거나 폴더 이름 위에서 마우스를 천천히 움직여 보세요.' }]
    },
    c13: {
      tag: 'PC에서 조작', title: '규칙 쓰기: secret.txt를 읽지 못하게',
      html:
        '<p>VS Code에서 <b>settings.json</b>을 직접 만들어 "secret.txt는 읽지 마"라는 규칙을 씁니다.</p>' +
        '<ol>' +
        '<li>VS Code 왼쪽에서 <b>agent1</b> 위에서 ' + os('오른쪽 클릭', 'Control 키를 누른 채 클릭(또는 두 손가락 클릭)') + '하고 "새 파일"을 고릅니다.</li>' +
        '<li>이름 칸에 다음처럼 입력하고 Enter 키를 누릅니다(<b>맨 앞의 "."와 "/"도 그대로</b>).' +
        cmd('.claude/settings.json') + '</li>' +
        '<li>빈 파일이 열립니다. 아래 "복사"를 눌러 안에 붙여 넣습니다.</li>' +
        '<li>' + os('Ctrl 키와 S 키', 'Command 키와 S 키') + '로 저장합니다.</li>' +
        '</ol>' +
        box('{\n  "permissions": {\n    "deny": ["Read(./secret.txt)"]\n  }\n}') +
        '<p class="note">뜻: <b>deny</b>＝금지, <b>Read</b>＝읽기 손, <b>./secret.txt</b>＝지금 폴더의 secret.txt. 즉 "secret.txt를 읽는 것은 금지"입니다.</p>' +
        '<p class="note">공식 안내에 따르면 permissions(허락·금지)의 변경은 <b>다시 시작하지 않아도 바로 반영</b>됩니다.</p>',
      help: [
        { q: '"새 파일"이 안 보여요', a: 'VS Code 왼쪽(파일 목록)의 agent1 글자 위에서 오른쪽 클릭하세요. 메뉴 이름이 "New File"일 수도 있습니다. 또는 agent1 오른쪽에 나오는 작은 "새 파일" 아이콘을 누릅니다.' },
        { q: '.claude 폴더가 안 보여요', a: '"."로 시작하는 이름은 Windows나 Mac에서 보통 숨겨집니다. 하지만 VS Code 왼쪽에는 나옵니다. VS Code에서 보이면 괜찮습니다.' },
        { q: '저장했는데 빨간 물결선이 나와요', a: '복사할 때 글자가 빠졌을 수 있습니다. { 부터 } 까지 다 들어 있는지 확인하세요. 규칙(" 로 감싸기, 마지막에 쉼표 없음)을 지켰는지 보세요.' },
        { q: '잘 안 돼요', a: '만든 파일을 일단 삭제하고 처음부터 다시 해도 됩니다. 연습용 폴더 안이라 안전합니다.' }
      ]
    },
    c14: {
      tag: 'PC에서 조작', title: '읽지 못하게 됐는지 확인: /permissions',
      html:
        '<p>다시 똑같은 부탁을 합니다.</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>이번에는 <b>"읽을 수 없습니다", "허용되지 않았습니다"</b> 같은 답이 오면 성공입니다.</li>' +
        '</ol>' +
        box('secret.txt를 읽고 내용을 알려 주세요.') +
        '<p>다음으로 규칙 목록을 봅니다. <b>/permissions</b>를 입력하고 Enter 키를 누릅니다.</p>' +
        cmd('/permissions') +
        '<p>아까 쓴 <b>Read(./secret.txt)</b>가 금지(deny) 칸에 있으면 OK입니다. 다 봤으면 <b>Esc 키</b>로 닫습니다.</p>' +
        '<p class="note warn"><b>이것은 완벽한 금고가 아닙니다.</b> 공식 안내에서도 프로그램이 스스로 파일을 여는 경우 등은 이 규칙으로 막을 수 없다고 나와 있습니다. "실수"를 막기 위한 장치입니다. 정말 중요한 정보는 처음부터 연습용 폴더에 넣지 않습니다.</p>',
      help: [
        HELP_ESC,
        { q: '아직도 내용을 답해요', a: '다음 2가지를 확인하세요. ① 파일 이름이 secret.txt와 똑같은지, 저장했는지. ② settings.json의 { 와 } 가 다 있는지. 그래도 안 되면 Claude Code를 일단 종료(/exit)하고 다시 claude로 실행한 뒤 해 보세요.' },
        { q: 'AI가 "다른 방법으로 읽겠다"고 해요', a: '허락 화면이 나오면 "아니요(No)"를 고르세요. AI가 다른 방법으로 읽으려 할 수 있습니다. 규칙이 듣는 것은 "파일을 읽는 손"과 일부 명령어입니다.' }
      ]
    },
    c15: {
      tag: 'PC에서 조작', title: '모델 보기: /model',
      html:
        '<p>AI에는 <b>"모델"</b>이라는 종류가 있습니다. <b>빠르고 가벼운</b> 것, <b>차분히 생각하는</b> 것 등 여러 가지입니다.</p>' +
        '<ol>' +
        '<li><b>/model</b>을 입력하고 Enter 키를 누릅니다.</li>' +
        '<li>모델 목록이 나옵니다. 지금 쓰는 것에 표시가 있습니다.</li>' +
        '<li>오늘은 <b>보기만</b> 합니다. <b>Esc 키</b>로 닫습니다(Enter 키를 누르면 고른 모델이 "앞으로의 기본값"으로 저장됩니다).</li>' +
        '</ol>' +
        cmd('/model') +
        '<div class="card"><b>이름의 기준(공식 안내)</b><br>・<b>haiku</b>: 빠르고 가볍다. 간단한 작업용<br>・<b>sonnet</b>: 평소 작업용<br>・<b>opus</b>: 복잡한 생각용<br>※ 쓸 수 있는 모델은 요금제에 따라 다릅니다.</div>' +
        '<p class="note">목록에서 <b>s 키</b>를 누르면 "이번 대화만" 바뀝니다(기본값은 그대로).</p>',
      help: [
        HELP_ESC,
        { q: '실수로 모델을 골라 버렸어요', a: '/model을 다시 열어 원래 모델을 고르면 돌아갑니다. 쓸 수 없는 모델은 목록에 안 나오거나 고를 수 없을 수 있습니다.' },
        { q: '어느 것을 골라야 해요?', a: '지금은 그대로 두어도 됩니다. 고민되면 바꾸지 않는 것이 안전합니다.' }
      ]
    },
    c16: {
      tag: 'PC에서 조작', title: '인터넷으로 조사하게 하기(출처 확인!)',
      html:
        '<p>AI는 학습한 시점까지의 일만 압니다. 최신 일은 <b>웹에서 조사</b>하게 합니다(WebSearch).</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>"웹을 검색할까요?" 같은 허락이 나오면 내용을 보고 "예(Yes)"를 고릅니다.</li>' +
        '<li>답과 <b>조사한 사이트 주소(URL)</b>가 나오면 성공입니다.</li>' +
        '</ol>' +
        box('오늘 서울의 날씨를 웹에서 조사해서 알려 주세요. 어느 사이트를 봤는지 주소(URL)도 알려 주세요.') +
        '<p>마지막으로 <b>나온 주소를 브라우저로 열어서</b> AI의 답이 맞는지 내 눈으로 확인합니다.</p>' +
        '<p class="note warn">AI의 답은 틀릴 수 있습니다. 특히 돈·건강·법에 관한 것은 <b>반드시 공식 사이트에서 확인</b>하세요.</p>',
      help: [
        HELP_APPROVE,
        { q: 'URL이 안 나왔어요', a: '"본 사이트의 URL을 알려 주세요"라고 다시 부탁하세요.' },
        { q: '"검색할 수 없습니다"라고 나와요', a: '쓸 수 있는 조건이 내 계정이나 설정에 따라 다를 수 있습니다. 그때는 여기서 멈추고 화면을 저장(스크린샷)해서 상담하세요.' }
      ]
    },
    c17: {
      tag: '알아 두기(덤)', title: 'Claude in Chrome이 뭐예요?(선택)',
      html:
        '<p class="note"><b>이 두 화면은 "선택"입니다.</b> Chrome이나 Edge를 쓰는 사람만 해 보세요. 안 해도 레슨3은 끝낼 수 있습니다.</p>' +
        '<p><b>Claude in Chrome</b>은 Claude Code가 <b>내 브라우저를 조작</b>하게 하는 장치입니다. 페이지 열기·클릭·글자 넣기 등을 할 수 있습니다.</p>' +
        '<div class="card goal"><b>필요한 것(공식 안내)</b><br>・Google Chrome 또는 Microsoft Edge(다른 Chromium 계열도 가능)<br>・Claude in Chrome 확장 프로그램(브라우저에 추가하는 것)<br>・Claude Code와 유료 요금제<br>・<code>/login</code>으로 로그인(API 키로는 동작하지 않음)</div>' +
        '<h2>조심할 것</h2>' +
        '<ul class="parts">' +
        '<li><b>내 브라우저를 그대로 씁니다.</b> 로그인된 사이트도 AI가 만질 수 있습니다.</li>' +
        '<li><b>은행·신용카드·쇼핑몰·메일</b> 같은 화면에서는 쓰지 않습니다.</li>' +
        '<li>웹페이지 안에 "이걸 해"라고 적혀 있으면 AI가 따라 버릴 수 있습니다. <b>보지 않는 곳에서 계속 시키지 않습니다.</b></li>' +
        '</ul>' +
        '<p class="note">연습은 누구나 볼 수 있는 공개 페이지에서만 합니다.</p>',
      help: [
        { q: 'Chrome도 Edge도 안 써요', a: '이 두 화면은 건너뛰어도 됩니다. "다음"을 누르세요.' },
        { q: '회사나 학교 컴퓨터예요', a: '확장 프로그램을 설치할 권한이 없을 수 있습니다. 무리하지 말고 건너뛰세요.' }
      ]
    },
    c18: {
      tag: 'PC에서 조작(선택)', title: 'Claude in Chrome 연결해서 써 보기(선택)',
      html:
        '<p class="note">선택 화면입니다. 막히면 건너뛰어도 됩니다.</p>' +
        '<ol>' +
        '<li>지금의 Claude Code를 <b>/exit</b>로 종료합니다.</li>' +
        '<li>터미널에서 다음 명령어를 실행합니다.' +
        cmd('claude --chrome') + '</li>' +
        '<li>처음에는 설명 화면이 나옵니다. 읽고 Enter 키로 넘어갑니다.</li>' +
        '<li>"Claude wants to use your browser" 같은 화면이 나오면 <b>"Install extension"</b>(확장 프로그램 설치)을 고릅니다. 브라우저가 열리면 본인이 직접 확장 프로그램을 추가합니다. 로그인이 필요하면 <b>브라우저 화면에만</b> 본인이 직접 입력합니다.</li>' +
        '<li>연결되면 다음 "부탁"을 붙여 넣습니다(공개 페이지만 씁니다).</li>' +
        '</ol>' +
        box('code.claude.com/docs를 열어서 검색칸에 hooks를 입력하고 어떤 결과가 나왔는지 알려 주세요.') +
        '<p>"Claude in Chrome wants to…"라는 허락 화면이 나오면 내용을 읽고 고릅니다. 끝나면 <b>/chrome</b>을 입력해 연결되어 있는지(Status: Enabled 등) 볼 수 있습니다.</p>' +
        '<p class="note warn">AI가 브라우저에서 무엇을 하는지 지켜보세요. 이상한 일을 하면 바로 <b>Esc 키</b>로 멈춥니다.</p>',
      help: [
        { q: '확장 프로그램을 찾을 수 없다고 해요', a: '공식 안내에 따르면 먼저 Chrome을 닫았다가 다시 엽니다. 그래도 안 되면 /chrome을 열어 "Reconnect extension"을 고릅니다. 그래도 안 되면 Claude Code와 Chrome을 둘 다 다시 시작합니다.' },
        { q: '오류로 진행이 안 돼요', a: '여기서 멈춰도 됩니다. 이 화면은 선택입니다.' },
        HELP_APPROVE
      ]
    },
    c19: {
      tag: '퀴즈', title: '안전과 설정 퀴즈',
      html: '<p>배운 것을 퀴즈로 확인해 봅시다. 고르면 답이 나옵니다. 점수는 매기지 않습니다.</p>',
      quiz: [
        { q: '"이 파일은 절대 읽지 마"를 확실히 지키게 하고 싶다. 어떻게 할까?', options: ['CLAUDE.md에 세게 쓴다', 'settings.json에 금지(deny) 규칙을 쓴다', '아무것도 안 한다'], answer: 1, explain: '규칙은 Claude Code가 직접 지키게 합니다. CLAUDE.md는 AI에게 하는 부탁이라 보장이 없습니다.' },
        { q: '"대부분의 작업에서 매번 묻는" 모드는?', options: ['Manual', 'Accept edits', 'Plan'], answer: 0, explain: 'Manual은 매번 묻는 모드입니다. 화면 아래에는 "manual mode on"이라고 나옵니다.' },
        { q: 'Plan 모드에서 AI가 하는 일은?', options: ['계획을 세운다(파일은 고치지 않는다)', '파일을 전부 지운다', '아무 대답도 안 한다'], answer: 0, explain: 'Plan은 조사하고 계획만 세웁니다. 파일은 고치지 않습니다.' },
        { q: 'Auto 모드에 대해 맞는 것은?', options: ['아무 확인도 안 받는다', '다른 AI가 위험한 일을 하지 않는지 지켜본다', '컴퓨터가 자동으로 멈춘다'], answer: 1, explain: 'Auto는 묻지 않고 진행하지만 다른 AI(분류기)가 확인합니다. 완벽하지 않으니 처음에는 Manual을 권합니다.' },
        { q: '/model 목록에서 s 키를 누르면?', options: ['이번 대화만 바뀐다', '앞으로의 기본값이 바뀐다', '컴퓨터가 멈춘다'], answer: 0, explain: 's 키는 이번 대화만 바꿉니다. 기본값은 그대로입니다.' },
        { q: '규칙이 "금지"와 "허락"으로 부딪히면?', options: ['금지(deny)가 먼저 쓰인다', '허락(allow)이 먼저 쓰인다', '무작위'], answer: 0, explain: '순서는 deny → ask → allow입니다. 금지가 허락보다 먼저 쓰입니다.' },
        { q: 'AI가 인터넷에서 조사한 답. 어떻게 할까?', options: ['전부 맞으니 그대로 쓴다', '출처 URL을 열어서 확인한다', '무시한다'], answer: 1, explain: 'AI는 틀릴 수 있습니다. 특히 중요한 것은 출처를 내 눈으로 확인합니다.' },
        { q: 'Claude in Chrome을 써도 되는 때는?', options: ['공개 페이지를 지켜보면서 조작할 때', '은행 화면을 알아서 조작하게 할 때', '로그인된 메일을 보지 않고 계속 시킬 때'], answer: 0, explain: '내 브라우저를 조작합니다. 중요한 사이트에서는 쓰지 않고, 지켜볼 수 있을 때만 씁니다.' }
      ],
      widget: 'quiz',
      help: [
        { q: '틀렸어요', a: '괜찮습니다. 앞 화면을 다시 보고 돌아와 보세요. 몇 번이든 다시 할 수 있습니다.' }
      ]
    },
    c20: {
      tag: '확인', title: '마지막 확인',
      checks: [
        '/status와 /config를 열어 보고 닫았다',
        'Shift+Tab으로 권한 모드를 바꾸고 화면 아래 표시가 바뀌는 것을 봤다',
        'Accept edits와 Plan을 해 보고 Manual로 돌려 놓았다',
        'settings.json에 금지(deny) 규칙을 쓰고 secret.txt가 읽히지 않게 되었다',
        '/model을 열어 아무것도 바꾸지 않고 닫았다(/usage도 봤다)',
        'AI에게 인터넷으로 조사하게 하고 출처 URL을 내가 직접도 확인했다',
        'Claude in Chrome을 연결해서 써 봤다(한 사람만)'
      ],
      required: 6,
      html: '<p>할 수 있었던 것에 체크를 넣으세요. <b>위의 6개</b>에 체크가 들어가면 "완료로 하기"를 누를 수 있습니다. 맨 아래 1개는 브라우저 환경에 따라 못 할 수도 있으니 한 사람만 합니다.</p>',
      help: [
        { q: '못 한 부분이 있어요', a: '그 단계로 돌아가서 "곤란할 때"를 보세요. 몇 번이든 다시 할 수 있습니다.' }
      ]
    }
  };

  window.COURSE_KO.lessons.l3 = {
    title: '안전한 설정과 기본 명령어',
    short: 'AI에게 맡기는 범위를 내가 정한다(권한 모드·규칙). 상태를 보고 인터넷으로 조사하게 한다',
    devices: 'PC',
    doneCard: '<b>레슨3　완료입니다. 수고하셨습니다.</b><br>AI에게 맡기는 범위를 내가 바꾸고 규칙으로 지킬 수 있게 되었습니다. 다음은 레슨4입니다.',
    steps: steps
  };
})();
