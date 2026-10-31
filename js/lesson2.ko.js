/* 레슨2 한국어판(한국인 학습자용). 부탁하는 글과 예시도 한국어로 쓴다. */
(function () {
  'use strict';
  var C = window.COURSE;
  var cmd = function (t) { return C.cmd(t, '복사'); };
  var box = function (t) { return C.copybox(t, null, '복사'); };
  var term = C.term;
  var os = C.os, osBlock = C.osBlock;
  var cmdOs = function (w, m) { return C.cmdOs(w, m, '복사'); };
  var termOs = C.termOs;
  function mean() { return ''; }

  var HELP_APPROVE = {
    q: 'AI가 "허락하시겠습니까?"라고 물어요',
    a: 'AI가 파일을 만들거나 고치거나 명령어를 실행할 때 "해도 될까요?"라고 묻습니다. 연습용 agent1 폴더 안의 일이라면 "예(Yes)"를 고릅니다. 화살표 키(↑↓)로 고르고 Enter 키를 누릅니다. 잘 모르겠으면 "아니요(No)"도 괜찮습니다.'
  };
  var HELP_ENG = { q: '터미널 글자가 영어예요', a: '괜찮습니다. 표시가 영어여도 하는 일은 같습니다.' };
  var HELP_NOFILE = {
    q: 'VS Code 왼쪽에 파일이 안 늘어나요',
    a: 'VS Code 왼쪽 표시가 옛날 그대로일 때가 있습니다. 잠시 기다리거나 폴더 이름 위에서 마우스를 천천히 움직여 보세요. AI가 다른 이름으로 만들었다면 그 이름으로 진행하세요.'
  };

  var steps = {
    a1: {
      tag: '오늘의 목표', title: '레슨2에서 할 수 있게 되는 것',
      html:
        '<p class="note warn"><b>이 레슨은 Windows나 Mac 컴퓨터가 필요합니다.</b> 레슨1이 끝난 사람용입니다. 화면 오른쪽 위의 "Windows／Mac" 버튼으로 내 컴퓨터 쪽을 고르세요.</p>' +
        '<p>앞 레슨에서는 AI에게 파일과 폴더를 만들게 했습니다. 오늘은 다음 2가지를 배웁니다.</p>' +
        '<div class="card goal"><b>목표</b><br>① AI에게 이름과 규칙을 <b>기억하게</b> 한다(CLAUDE.md)<br>② AI의 4가지 "손"(읽기·쓰기·고치기·실행)을 <b>구분해서</b> 부탁할 수 있다</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>걸리는 시간</dt><dd>약 2시간(쉬엄쉬엄 해도 OK)</dd>' +
        '<dt>쓰는 것</dt><dd>레슨1에서 준비한 VS Code, agent1 폴더, Claude Code</dd>' +
        '<dt>연습 내용</dt><dd>일정표, 가계부, 여행 짐 목록, 메일 초안, 계산기 프로그램(일정표 등은 가상의 내용입니다). 내 사진 1장과 고양이 그림도 씁니다</dd>' +
        '</dl></div>' +
        '<p class="note warn">연습은 <b>agent1 폴더 안에서만</b> 합니다. 진짜 개인정보는 넣지 않습니다.</p>',
      help: [
        { q: '레슨1이 끝나지 않았어요', a: '먼저 레슨1을 끝내세요. VS Code, agent1 폴더, Claude Code가 필요합니다.' }
      ]
    },
    a2: {
      tag: 'PC에서 조작', title: '복습: Claude Code 실행하기',
      html:
        '<p>앞 레슨의 복습입니다. 다음 순서로 Claude Code를 실행합니다.</p>' +
        '<ol>' +
        '<li>VS Code를 엽니다.</li>' +
        '<li>"파일"→"폴더 열기"로 <b>agent1</b>을 엽니다(최근 연 것에서 고를 수 있습니다).</li>' +
        '<li>"터미널"→"새 터미널"을 고릅니다.</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '</ol>' +
        cmd('claude') +
        '<p>글자를 넣는 칸이 나오면 준비 완료입니다.</p>' +
        '<p class="note">Claude Code는 <b>열어 둔 폴더</b> 안에서 일합니다. 다른 폴더를 열고 실행하면 그 폴더가 대상이 됩니다. CLAUDE.md(나중에 만듭니다)도 폴더마다 둡니다.</p>',
      help: [
        { os: 'win', q: '"인식되지 않습니다"라고 나와요', a: 'VS Code를 완전히 닫았다가 다시 열고 새 터미널에서 시도하세요. 그래도 안 되면 레슨1의 설치 확인 화면을 보세요.' },
        { os: 'mac', q: '"command not found"라고 나와요', a: 'VS Code를 ⌘(Command) 키와 Q 키로 종료했다가 다시 열고 새 터미널에서 시도하세요. 그래도 안 되면 레슨1의 설치 확인 화면을 보세요.' },
        C.HELP_MAC_DESKTOP_KO,
        { q: '"로그인하세요"라고 나와요', a: '레슨1의 로그인 화면처럼 브라우저에서 Claude에 로그인합니다. 비밀번호는 브라우저 화면에만 입력합니다.' },
        { q: '"이 폴더를 신뢰하시겠습니까?"라고 나와요', a: '화살표 키 ↓로 "Yes, I trust this folder"를 고른 뒤 Enter 키를 누릅니다. 처음 선택된 것이 "No, exit"일 수 있으니 주의하세요.' },
        HELP_ENG
      ]
    },
    a3: {
      tag: '알아 두기', title: 'AI는 대화가 끝나면 잊어버린다',
      html:
        '<p>Claude Code는 <b>대화를 시작할 때마다 백지 상태</b>에서 시작합니다. 앞 대화에서 말한 것은 그대로는 기억하지 못합니다.</p>' +
        '<ul class="parts">' +
        '<li><b>매일 처음 만나는 도우미</b>어제 일을 기억 못 함<br><span>매번 같은 설명이 필요</span></li>' +
        '<li><b>책상에 "메모"가 있는 도우미</b>매일 아침 메모를 읽고 시작<br><span>설명은 메모에 적어 두면 OK</span></li>' +
        '</ul>' +
        '<p>이 "메모"에 해당하는 것이 <b>CLAUDE.md(클로드 엠디)</b>라는 파일입니다.</p>',
      help: [
        { q: '정말 잊어버리나요?', a: '공식 안내에서도 대화마다 새로운 상태에서 시작한다고 설명합니다. 그래서 기억해 두었으면 하는 것은 CLAUDE.md에 적습니다.' }
      ]
    },
    a4: {
      tag: '알아 두기', title: 'CLAUDE.md가 뭔가요?',
      html:
        '<p>CLAUDE.md는 AI를 위한 <b>"사용 설명서"</b> 같은 파일입니다.</p>' +
        '<ul class="parts">' +
        '<li><b>어디에 두나요?</b>작업 폴더의 맨 위<br><span>오늘은 agent1 안</span></li>' +
        '<li><b>언제 읽히나요?</b>대화를 시작할 때<br><span>그때마다 자동으로 읽힙니다</span></li>' +
        '<li><b>무엇을 적나요?</b>이름, 말투, 역할, 규칙<br><span>평범한 문장으로 OK</span></li>' +
        '<li><b>얼마나 지키나요?</b>대체로 지켜 줍니다<br><span>100%는 아닙니다</span></li>' +
        '</ul>' +
        '<p class="note">공식 안내에서 CLAUDE.md의 내용은 "강제하는 규칙"이 아니라 AI가 참고하는 "문맥"으로 다뤄집니다. 구체적이고 짧게 쓸수록 잘 지켜집니다.</p>',
      help: [
        { q: '파일 이름은 정해져 있나요?', a: '정해져 있습니다. <b>CLAUDE.md</b>라고 대문자로 씁니다. 이름이 다르면 읽히지 않습니다.' }
      ]
    },
    a5: {
      tag: 'PC에서 조작', title: 'CLAUDE.md 만들게 하기',
      html:
        '<p>AI에게 "하나"라는 이름을 붙이고, 말투 규칙을 CLAUDE.md에 적게 합니다.</p>' +
        '<ol>' +
        '<li>"복사"를 눌러 Claude Code 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 "예(Yes)"를 고릅니다.</li>' +
        '<li>VS Code 왼쪽에 <b>CLAUDE.md</b>가 늘어나면 성공입니다.</li>' +
        '</ol>' +
        box('CLAUDE.md라는 이름의 파일을 만들고, 다음 내용을 적어 주세요.\n・당신의 이름은 "하나"입니다.\n・쉬운 말로 존댓말(~입니다/합니다)로 말합니다.\n・첫인사는 "하나입니다. 무엇을 할까요?"입니다.\n・제가 부탁한 파일은 agent1 폴더 안에서만 만듭니다.') +
        mean('"CLAUDE.md라는 이름의 파일을 만들어 다음을 적어 주세요. ·당신의 이름은 \'하나\'입니다. ·쉬운 말로 \'~입니다/합니다\'체로 말합니다. ·첫인사는 \'하나입니다. 무엇을 할까요?\'입니다. ·제가 부탁한 파일은 agent1 폴더 안에서만 만듭니다."'),
      help: [HELP_APPROVE, HELP_NOFILE]
    },
    a6: {
      tag: 'PC에서 조작', title: 'VS Code에서 CLAUDE.md 보기',
      html:
        '<p>CLAUDE.md는 평범한 문장 파일입니다. 직접 열어서 읽거나 고칠 수 있습니다.</p>' +
        '<ol>' +
        '<li>VS Code 왼쪽에서 <b>CLAUDE.md</b>를 클릭합니다.</li>' +
        '<li>아까 부탁한 내용이 적혀 있는지 봅니다.</li>' +
        '<li>고치고 싶은 곳이 있으면 직접 고칩니다.</li>' +
        '<li>고쳤으면 ' + os('Ctrl 키와 S 키', '⌘(Command) 키와 S 키') + '를 동시에 눌러 저장합니다.</li>' +
        '</ol>' +
        '<p class="note">AI가 쓴 것을 사람이 고친다. 사람이 쓴 것을 AI에게 고치게 한다. 둘 다 할 수 있습니다.</p>',
      help: [
        { q: '내용이 달라요', a: 'AI가 말을 조금 바꿔서 쓸 때가 있습니다. 뜻이 맞으면 괜찮습니다. 마음에 걸리는 곳은 직접 고치세요.' },
        { q: '저장하는 법을 모르겠어요', a: '위쪽 메뉴의 "파일"→"저장"으로도 할 수 있습니다.' }
      ]
    },
    a7: {
      tag: 'PC에서 조작', title: '새 대화에서 기억하는지 확인하기',
      html:
        '<p>대화를 일단 끝내고 새로 시작해도 "하나"가 기억하는지 확인합니다.</p>' +
        '<ol>' +
        '<li>Claude Code 입력란에 <b>/exit</b>를 입력하고 Enter 키를 누릅니다(대화를 끝냅니다).</li>' +
        '<li>아래 "복사"를 눌러 터미널에 붙여 넣고 Enter 키를 누릅니다(새 대화를 시작합니다).</li>' +
        '<li>입력란에 "당신의 이름은 무엇인가요?"를 입력하고 Enter 키를 누릅니다.</li>' +
        '</ol>' +
        cmd('claude') +
        '<p>"하나"라고 답하면 성공입니다.</p>',
      help: [
        {
          q: '"하나"라고 답하지 않아요',
          a: '다음을 확인하세요.<br>① CLAUDE.md가 agent1 폴더의 <b>맨 위</b>에 있는지(<b>CLAUDE.md</b>, 대문자).<br>② 터미널 끝이 ' + os('<b>agent1&gt;</b>', '<b>agent1 %</b>') + '인지.<br>③ 한 번 <b>/exit</b>로 끝내고 다시 <b>claude</b>로 시작했는지.<br>④ CLAUDE.md의 내용은 "강제"가 아니라 "참고"로 읽히므로 드물게 지켜지지 않을 수도 있습니다. 한 번 더 물어보세요.'
        },
        HELP_ENG
      ]
    },
    a8: {
      tag: '알아 두기', title: '편리한 "/" 명령어',
      html:
        '<p>Claude Code 입력란에서는 <b>/(슬래시)</b>로 시작하는 특별한 명령어를 쓸 수 있습니다. 오늘은 3개만 기억합니다.</p>' +
        '<ul class="parts">' +
        '<li><b>/exit</b><span>대화를 끝낸다</span></li>' +
        '<li><b>/clear</b><span>지금 대화를 백지로 만들고 새로 시작한다</span></li>' +
        '<li><b>/context</b><span>지금 AI가 읽고 있는 내용을 본다</span></li>' +
        '</ul>' +
        '<p>CLAUDE.md가 제대로 읽혔는지 확인하려면 <b>/context</b>를 입력하고 Enter 키를 누릅니다. "Memory files"라는 목록에 CLAUDE.md가 나와 있으면 읽힌 것입니다(공식 안내).</p>' +
        '<p class="note">그 밖에 <b>/help</b>로 쓸 수 있는 명령어 목록을 볼 수 있습니다. 자세한 것은 뒤의 수업에서 배웁니다.</p>',
      help: [
        { q: '/context에서 아무것도 안 나와요', a: '대화 시작 직후 아직 아무 말도 안 했으면 적게 표시될 수 있습니다. "안녕하세요"라고 한 번 말한 뒤 다시 해 보세요.' },
        { q: '/clear와 /exit는 뭐가 다른가요?', a: '/exit는 Claude Code를 끝냅니다. /clear는 Claude Code는 끝내지 않고 대화 내용만 백지로 만듭니다.' }
      ]
    },
    a9: {
      tag: 'PC에서 조작', title: '규칙을 더하고 시험해 보기',
      html:
        '<ol>' +
        '<li>"복사"를 눌러 Claude Code 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 "예(Yes)"를 고릅니다.</li>' +
        '<li><b>/exit</b>로 끝내고 다시 <b>claude</b>를 실행합니다(CLAUDE.md는 대화를 시작할 때 읽히기 때문입니다).</li>' +
        '<li>"test1.txt라는 이름으로 빈 파일을 만들어 주세요"라고 부탁합니다.</li>' +
        '<li>파일을 만든 뒤 "만들었습니다"라고 한마디 하면 성공입니다.</li>' +
        '</ol>' +
        box('CLAUDE.md에 다음 규칙을 더해 주세요.\n・파일을 만들면 마지막에 "만들었습니다"라고 한마디 한다.') +
        mean('"CLAUDE.md에 다음 규칙을 더해 주세요. ·파일을 만들면 마지막에 \'만들었습니다\'라고 한마디 한다."') +
        '<p class="note">더한 규칙은 <b>새 대화부터</b> 쓰입니다.</p>',
      help: [
        HELP_APPROVE,
        { q: '"만들었습니다"라고 말하지 않아요', a: 'CLAUDE.md는 "참고"로 읽히므로 드물게 지켜지지 않을 수도 있습니다. 한 번 더 부탁해 보세요. 그래도 안 하면 CLAUDE.md 안에 규칙이 적혀 있는지 VS Code에서 확인하세요.' }
      ]
    },
    a10: {
      tag: '알아 두기', title: 'AI의 4가지 "손"',
      html:
        '<p>AI는 파일을 만질 때 4가지 "손(도구)"을 구분해서 씁니다.</p>' +
        '<ul class="parts">' +
        '<li><b>Read(읽기)</b>파일의 내용을 읽는다<br><span>허락이 필요 없습니다</span></li>' +
        '<li><b>Write(쓰기)</b>새 파일을 만든다<br><span>같은 이름이 있으면 덮어쓰기. 허락 필요</span></li>' +
        '<li><b>Edit(고치기)</b>파일의 일부만 고친다<br><span>허락 필요</span></li>' +
        '<li><b>Bash(실행)</b>명령어를 실행한다<br><span>허락 필요</span></li>' +
        '</ul>' +
        '<div class="card"><b>AI의 작업 흐름</b><br>① <b>본다</b>(Read) → ② <b>생각한다</b> → ③ <b>손을 쓴다</b>(Write／Edit／Bash) → ④ <b>결과를 본다</b> → ⑤ 부족하면 <b>되풀이한다</b></div>' +
        '<p class="note">허락이 필요한지는 공식 안내로 확인했습니다. Read 외에는 "해도 될까요?"라고 묻습니다.</p>',
      help: [
        { q: '"Bash"가 뭔가요?', a: 'PC에 명령하는 글자 명령(커맨드)을 실행하는 손입니다. 파일 목록 보기, 복사 등을 할 수 있습니다. 오늘은 안전한 것만 시험합니다.' }
      ]
    },
    a11: {
      tag: 'PC에서 조작', title: '연습용 파일 만들게 하기',
      html:
        '<p>이제부터 "읽기" 연습을 하기 위해 연습용 파일을 2개 만듭니다. 내용은 모두 <b>가상</b>입니다.</p>' +
        '<ol>' +
        '<li>"복사"를 눌러 Claude Code 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 "예(Yes)"를 고릅니다(2번 물을 수도 있습니다).</li>' +
        '<li>VS Code 왼쪽에 <b>schedule.txt</b>와 <b>budget.txt</b>가 늘어나면 성공입니다.</li>' +
        '</ol>' +
        box('다음 2개의 파일을 만들어 주세요. 내용은 가상으로 해 주세요.\n1) schedule.txt: 이번 주 일정(월요일부터 금요일)을 하루 한 줄로 쓴다.\n2) budget.txt: 가계부 예시를 쓴다. 식비·교통비·생활용품·취미·기타 5줄로, 금액도 붙인다.') +
        mean('"다음 2개의 파일을 만들어 주세요. 내용은 가상으로. 1) schedule.txt: 이번 주 일정(월~금)을 하루 한 줄로. 2) budget.txt: 가계부 예시. 식비·교통비·생활용품·취미·기타 5줄로, 금액도 붙여서."'),
      help: [HELP_APPROVE, HELP_NOFILE]
    },
    a12: {
      tag: 'PC에서 조작', title: '【읽기】파일을 읽고 정리하게 하기',
      html:
        '<p>AI의 "Read(읽기)"를 씁니다. "Read"는 허락을 묻지 않는 경우가 많습니다(공식 안내).</p>' +
        '<ol>' +
        '<li>아래 2개를 순서대로 "복사"→ Claude Code 입력란에 붙여 넣기 → Enter 키.</li>' +
        '<li>파일 내용을 읽고 답해 주면 성공입니다.</li>' +
        '</ol>' +
        '<h2>① 일정 정리하기</h2>' +
        box('schedule.txt를 읽고 이번 주 일정을 3줄로 정리해 주세요.') +
        mean('"schedule.txt를 읽고 이번 주 일정을 3줄로 정리해 주세요."') +
        '<h2>② 금액 알아보기</h2>' +
        box('budget.txt를 읽고 가장 돈을 많이 쓴 항목과 합계 금액을 알려 주세요.') +
        mean('"budget.txt를 읽고 가장 돈을 많이 쓴 항목과 합계 금액을 알려 주세요."') +
        '<p class="note warn">AI의 계산은 틀릴 때가 있습니다. 중요한 숫자는 직접도 확인합시다.</p>',
      help: [
        { q: '"파일을 찾을 수 없습니다"라고 나와요', a: 'VS Code 왼쪽에 schedule.txt와 budget.txt가 있는지 확인하세요. 없으면 앞 화면에서 다시 하세요.' },
        { q: '합계가 맞는지 모르겠어요', a: 'budget.txt를 VS Code에서 열어 직접 더해 보세요. 틀렸다면 "합계가 틀렸습니다. 다시 계산해 주세요"라고 전합니다.' }
      ]
    },
    a12b: {
      tag: 'PC에서 조작', title: '【읽기】사진이나 PDF도 읽게 하기',
      html:
        '<p>"Read(읽기)"는 글자 파일만 읽는 것이 아닙니다. <b>사진(이미지)이나 PDF</b>도 읽고 설명해 줍니다.</p>' +
        '<p class="note warn"><b>사진의 내용은 AI 서비스로 전송됩니다.</b> 사람 얼굴이나 주소 같은 개인정보가 찍히지 않은 사진을 고르세요. 화면을 찍은 "스크린샷"도 괜찮습니다.</p>' +
        '<ol>' +
        '<li>컴퓨터 안에서 사진을 <b>1장</b> 고릅니다(jpg나 png 형식을 권합니다).</li>' +
        '<li>그 사진을 VS Code 왼쪽 파일 목록의 <b>agent1</b> 위로 마우스로 끌어다 놓습니다.</li>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>사진에 무엇이 찍혀 있는지 설명해 주면 성공입니다.</li>' +
        '</ol>' +
        box('agent1 폴더에 있는 사진을 보고, 무엇이 찍혀 있는지 3줄로 설명해 주세요.') +
        '<p class="note">다른 부탁 방법: VS Code 왼쪽의 파일을 아래 터미널(Claude Code 입력란)까지 <b>끌어다 놓으면</b> 그 파일의 위치(경로)가 입력란에 들어갑니다. 이어서 "이 사진을 3줄로 설명해 주세요"라고 쓰고 Enter 키를 눌러도 똑같이 부탁할 수 있습니다. 잘 안 들어가면 파일 이름을 쓰면 됩니다.</p>' +
        '<p class="note os-mac">Mac에서는 ⌘(Command) 키와 Shift 키와 4 키를 동시에 누르고 화면 일부를 둘러싸면 스크린샷을 찍을 수 있습니다. 찍은 사진은 데스크탑에 저장됩니다. "사진" 앱의 사진은 먼저 데스크탑으로 끌어다 놓은 뒤 씁니다.</p>' +
        '<h2>PDF가 있을 때(안 해도 됩니다)</h2>' +
        '<p>개인정보가 없는 PDF가 있으면 같은 방법으로 agent1에 넣고 다음처럼 부탁합니다.</p>' +
        box('agent1 폴더에 있는 PDF를 읽고, 중요한 내용을 3가지로 정리해 주세요.'),
      help: [
        { q: '사진을 파일 목록에 넣을 수 없어요', a: '끌어다 놓기가 잘 안 되면 ' + os('탐색기에서 사진을 복사하고, agent1 폴더를 열어 붙여 넣으세요.', 'Finder에서 사진을 복사합니다(⌘(Command) 키와 C 키). Finder 왼쪽의 "데스크탑"을 열면 agent1이 있습니다. agent1을 열고 붙여 넣습니다(⌘(Command) 키와 V 키).') },
        { q: '"이미지를 읽을 수 없습니다"라고 나와요', a: '사진 형식에 따라 읽지 못할 때가 있습니다. jpg나 png 사진으로 다시 해 보세요. 스크린샷을 쓰는 것도 좋습니다.' },
        { q: '사진이 여러 장 들어 있어요', a: '1장만 남기세요. 여러 장이면 AI가 어느 것인지 헷갈립니다. 사진 이름을 넣어 "○○.jpg를 보고…"라고 부탁해도 됩니다.' }
      ]
    },
    a12c: {
      tag: 'PC에서 조작', title: '【실행】사진 이름을 내용에 맞게 바꾸게 하기',
      html:
        '<p>읽은 내용에 맞게 파일 이름을 <b>정리</b>하게 합니다. 이름을 바꾸는 것은 "실행(Bash)"이라서 허락을 묻습니다.</p>' +
        '<ol>' +
        '<li>"복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 <b>화면에 나온 바꾸기 전 이름과 바꾼 뒤 이름</b>을 보고 "예(Yes)"를 고릅니다.</li>' +
        '<li>VS Code 왼쪽에서 사진 이름이 바뀌어 있으면 성공입니다.</li>' +
        '</ol>' +
        box('agent1 폴더의 사진 이름을 내용을 알 수 있는 이름으로 바꿔 주세요. .jpg나 .png 같은 끝부분은 그대로 두세요.') +
        '<p class="note">이름 끝의 ".jpg" 등은 파일의 종류를 나타냅니다. 이 부분을 바꾸면 열리지 않을 수 있어서 "그대로 두라"고 전하는 것입니다.</p>',
      help: [
        HELP_APPROVE,
        { q: '이름이 생각한 것과 달라요', a: '"더 짧은 이름으로 해 주세요", "한글 말고 영어 이름으로 해 주세요"처럼 고치고 싶은 점을 전하면 다시 바꿔 줍니다.' }
      ]
    },
    a13: {
      tag: 'PC에서 조작', title: '【쓰기】새 글 쓰게 하기',
      html:
        '<p>AI의 "Write(쓰기)"를 씁니다. 새 파일을 만들게 합니다.</p>' +
        '<ol>' +
        '<li>아래 2개를 순서대로 "복사"→ 입력란에 붙여 넣기 → Enter 키.</li>' +
        '<li>허락을 물으면 "예(Yes)"를 고릅니다.</li>' +
        '<li>VS Code 왼쪽에 <b>packing.txt</b>와 <b>mail-draft.txt</b>가 늘어나면 성공입니다.</li>' +
        '</ol>' +
        '<h2>① 짐 목록</h2>' +
        box('여행 짐 목록을 packing.txt라는 이름으로 만들어 주세요. 2박 3일 교토 여행입니다.') +
        mean('"여행 짐 목록을 packing.txt라는 이름으로 만들어 주세요. 2박 3일 교토 여행입니다."') +
        '<h2>② 메일 초안</h2>' +
        box('친구에게 여행 일정을 상의하는 메일 초안을 mail-draft.txt에 써 주세요.') +
        mean('"친구에게 여행 일정을 상의하는 메일 초안을 mail-draft.txt에 써 주세요."') +
        '<p class="note">같은 이름의 파일이 있으면 Write는 <b>덮어씁니다</b>. 그래서 허락을 묻는 것입니다.</p>',
      help: [HELP_APPROVE, HELP_NOFILE]
    },
    a13b: {
      tag: 'PC에서 조작', title: '【쓰기】그림 그리게 하기',
      html:
        '<p>그림도 "Write(쓰기)"로 만들 수 있습니다. AI는 <b>SVG(에스브이지)</b>라는 "글자로 쓴 그림" 파일을 만듭니다. 도형을 조합한 간단한 그림이 됩니다.</p>' +
        '<ol>' +
        '<li>아래 ①을 "복사"→ 입력란에 붙여 넣기 → Enter 키. 허락을 물으면 "예(Yes)"를 고릅니다.</li>' +
        '<li>VS Code 왼쪽에 <b>cat.svg</b>가 늘어나면 다음으로 갑니다.</li>' +
        '<li>②로 브라우저에서 열게 합니다. 허락을 물으면 명령어를 보고 "예(Yes)"를 고릅니다.</li>' +
        '</ol>' +
        '<h2>① 그림 만들게 하기</h2>' +
        box('동그란 얼굴의 고양이 그림을 cat.svg라는 이름으로 만들어 주세요. 간단한 그림이면 됩니다.') +
        '<h2>② 브라우저로 보기</h2>' +
        box('cat.svg를 브라우저에서 열어 주세요.') +
        '<p class="note">사진 같은 그림이 아니라 동그라미와 삼각형을 조합한 그림이 됩니다. 그래도 "말로 부탁하면 그림이 만들어진다"는 것만 알면 충분합니다.</p>',
      help: [
        HELP_APPROVE,
        HELP_NOFILE,
        { q: '브라우저로 안 열려요', a: os('탐색기에서 agent1 폴더의 cat.svg를 더블클릭해 보세요.', 'Finder 왼쪽의 "데스크탑"→"agent1"을 열고 cat.svg를 더블클릭해 보세요.') + ' 다른 앱으로 열려도 그 앱에서 보이면 괜찮습니다.' }
      ]
    },
    a14: {
      tag: 'PC에서 조작', title: '【고치기】일부만 고치게 하기',
      html:
        '<p>AI의 "Edit(고치기)"를 씁니다. 파일을 새로 다시 만드는 것이 아니라 <b>일부만</b> 고칩니다.</p>' +
        '<ol>' +
        '<li>"복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 <b>화면에 나온 고치기 전과 후를 보고</b> "예(Yes)"를 고릅니다.</li>' +
        '<li>VS Code에서 <b>mail-draft.txt</b>를 열어 첫인사가 바뀌어 있으면 성공입니다.</li>' +
        '</ol>' +
        box('mail-draft.txt의 첫인사를 더 정중한 말로 고쳐 주세요. 다른 부분은 바꾸지 마세요.') +
        mean('"mail-draft.txt의 첫인사를 더 정중한 말로 고쳐 주세요. 다른 부분은 바꾸지 마세요."') +
        '<p class="note"><b>Write</b>는 "통째로 새로", <b>Edit</b>는 "여기만 고치기". 이 차이를 기억해 둡시다.</p>',
      help: [
        HELP_APPROVE,
        { q: '전체가 바뀌어 버렸어요', a: '"다른 부분은 바꾸지 마세요"라고 전하는 것이 중요합니다. 바뀌어 버렸다면 "아까 내용으로 되돌려 주세요"라고 부탁해 보세요.' }
      ]
    },
    a15: {
      tag: 'PC에서 조작', title: '【실행】파일 목록 보여 달라고 하기',
      html:
        '<p>AI의 "Bash(실행)"를 씁니다. 명령어를 실행하게 합니다.</p>' +
        '<ol>' +
        '<li>"복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 <b>화면에 나온 명령어를 보고</b> "예(Yes)"를 고릅니다.</li>' +
        '<li>파일 이름 목록이 나오면 성공입니다.</li>' +
        '</ol>' +
        box('지금 폴더(agent1)에 있는 파일 이름을 목록으로 보여 주세요.') +
        mean('"지금 폴더(agent1)에 있는 파일 이름을 목록으로 보여 주세요."') +
        '<p class="note">레슨1에서 직접 입력한 <b>' + os('dir', 'ls') + '</b>와 같은 종류의 명령어를 AI가 대신 실행해 줍니다.</p>',
      help: [HELP_APPROVE]
    },
    a16: {
      tag: 'PC에서 조작', title: '【실행】파일 복사하게 하기',
      html:
        '<ol>' +
        '<li>"복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 명령어를 보고 "예(Yes)"를 고릅니다.</li>' +
        '<li>VS Code 왼쪽에 <b>budget-backup.txt</b>가 늘어나면 성공입니다.</li>' +
        '</ol>' +
        box('budget.txt를 budget-backup.txt라는 이름으로 복사해 주세요.') +
        mean('"budget.txt를 budget-backup.txt라는 이름으로 복사해 주세요."') +
        '<p class="note warn">오늘 연습에서는 <b>파일을 지우는 부탁은 하지 않습니다.</b> Bash는 강한 손이므로 다음 화면의 "허락 화면 보는 법"을 잘 읽으세요.</p>',
      help: [HELP_APPROVE, HELP_NOFILE]
    },
    a17: {
      tag: '알아 두기', title: '허락 화면 보는 법(안전을 위해)',
      html:
        '<p>AI가 "해도 될까요?"라고 물을 때 <b>무엇을 하려는지</b> 보고 나서 답합니다.</p>' +
        '<ul class="parts">' +
        '<li><b>"예"로 OK</b><span>agent1 폴더 안의 파일을 만들기·고치기·목록 보기·복사</span></li>' +
        '<li><b>"아니요"로 한다</b><span>agent1 밖의 파일을 건드리기／파일 지우기(rm, del, Remove 등)／' + os('', '<b>sudo</b>로 시작하는 명령어(Mac 비밀번호를 묻습니다)／') + '뜻을 모르는 명령어</span></li>' +
        '</ul>' +
        '<p>모를 때는 <b>"아니요"</b>를 고르고 AI에게 "그것은 무엇을 위한 것입니까?"라고 물어봅시다.</p>' +
        '<p class="note">안전 규칙은 레슨1의 "3가지 규칙"과 같습니다. 비밀번호는 AI에게 입력하지 않습니다.</p>',
      help: [
        { q: '"아니요"를 고르면 어떻게 되나요?', a: 'AI는 그 작업을 멈추고 다른 방법을 제안하거나 이유를 묻습니다. 그대로 대화를 이어갈 수 있습니다.' }
      ]
    },
    a18: {
      tag: '알아 두기', title: '좋은 부탁의 3가지 요령',
      html:
        '<p>AI는 부탁하는 방식에 따라 결과가 달라집니다. 다음 3가지를 기억해 둡시다.</p>' +
        '<ul class="parts">' +
        '<li><b>① 파일 이름을 말한다</b><span>"budget.txt를 읽어 줘"</span></li>' +
        '<li><b>② 바꾸고 싶지 않은 곳을 말한다</b><span>"다른 부분은 바꾸지 마"</span></li>' +
        '<li><b>③ 결과의 형태를 말한다</b><span>"3줄로" "표로"</span></li>' +
        '</ul>' +
        '<h2>비교해 보자</h2>' +
        '<div class="card"><b>알기 어려운 부탁</b><br>"일정을 고쳐 줘"</div>' +
        '<div class="card goal"><b>알기 쉬운 부탁</b><br>"schedule.txt의 수요일 일정을 목요일로 옮겨 주세요. 다른 요일은 바꾸지 마세요."</div>',
      help: [
        { q: '쓰기가 어려워요', a: '완벽하게 쓰지 않아도 됩니다. 부족한 부분은 나중에 더해서 부탁할 수 있습니다.' }
      ]
    },
    a19: {
      tag: 'PC에서 조작', title: '스스로 생각해서 부탁해 보기',
      html:
        '<p>지금까지 배운 것을 써서 <b>스스로</b> 부탁을 생각해 해 봅니다. 다음 중 1개를 고르세요(직접 생각한 내용도 OK입니다).</p>' +
        '<ul class="parts">' +
        '<li><b>A</b>budget.txt에 "다음 주 식비" 줄을 더하고 합계를 계산하게 한다<span>(Edit와 Read)</span></li>' +
        '<li><b>B</b>schedule.txt의 수요일 일정을 목요일로 옮기게 한다<span>(Edit)</span></li>' +
        '<li><b>C</b>여행 짐 목록에 "비 오는 날의 짐"을 더하게 한다<span>(Edit)</span></li>' +
        '</ul>' +
        '<p>앞 화면의 "3가지 요령"을 써 봅시다.</p>' +
        '<p class="note">부탁하는 글은 직접 씁니다. 모르겠으면 AI에게 "어떻게 부탁하면 좋을까요?"라고 물어도 괜찮습니다.</p>',
      help: [
        HELP_APPROVE,
        { q: '무엇을 부탁해야 할지 모르겠어요', a: 'A, B, C 중 1개를 골라서 "이 내용을 부탁하려면 어떻게 쓰면 좋을까요?"라고 AI에게 물어보세요.' }
      ]
    },
    p1: {
      tag: '알아 두기', title: '왜 Python을 설치할까요?',
      html:
        '<p>AI는 <b>프로그램</b>도 만들 수 있습니다(버튼을 누르면 계산한다, 등). 하지만 프로그램을 "실행"하려면 컴퓨터에 그 말을 읽는 <b>"도구"</b>가 필요합니다. 그 도구가 <b>Python(파이썬)</b>입니다.</p>' +
        '<ul class="parts">' +
        '<li><b>DVD</b>프로그램(내용)<br><span>AI가 써 줍니다(Write)</span></li>' +
        '<li><b>DVD 플레이어</b>Python(실행하는 도구)<br><span>컴퓨터에 한 번 설치해 둡니다</span></li>' +
        '</ul>' +
        '<p>흐름은 이렇습니다. <b>① AI가 프로그램을 쓴다(Write) → ② Python이 실행한다(Bash) → ③ 창이나 결과가 나온다</b></p>' +
        '<div class="card goal"><b>설치하는 이유</b><br>·이 레슨의 "계산기"를 실행하기 위해<br>·앞으로의 수업에서도 Python을 쓰기 때문에(사진 가공이나 반복 작업 자동화 등)<br>·<b>무료</b>이고 <b>한 번 설치하면 계속 쓸 수 있습니다</b></div>' +
        os('<p>Windows에서는 <b>Microsoft Store</b>에서 설치합니다(다다음 화면). 몇 분이면 끝납니다.</p>',
           '<p>Mac에서는 <b>python.org</b>의 공식 설치 프로그램을 내려받아 설치합니다(다다음 화면). 비밀번호 입력이 필요합니다.</p>') +
        '<p class="note">Python 설치 방법은 2026년 10월 30일에 Python 공식 안내로 확인했습니다.</p>',
      help: [
        { q: '프로그램은 어려울 것 같아요', a: '프로그램은 AI가 씁니다. 여러분은 "무엇을 하고 싶은지"를 평범한 말로 부탁하기만 하면 됩니다. Python은 그냥 "설치해 두기"만 하면 됩니다.' },
        { q: '설치하면 컴퓨터가 느려지지 않나요?', a: 'Python은 쓸 때만 동작하는 작은 도구입니다. 설치해 두어도 평소 동작은 달라지지 않습니다.' }
      ]
    },
    p2: {
      tag: 'PC에서 조작', title: 'Python이 들어 있는지 확인하기',
      html:
        '<p>터미널에서 확인합니다(' + os('맨 앞이 <b>PS</b>인 것', '끝이 <b>%</b>인 것') + '). Claude Code 대화 안이 아니라 일반 터미널입니다.</p>' +
        '<ol>' +
        '<li>Claude Code를 쓰고 있었다면 <b>/exit</b>로 끝냅니다.</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '</ol>' +
        cmdOs('python --version', 'python3 --version') +
        termOs(['PS C:\\Users\\(내이름)\\Desktop\\agent1> python --version', 'Python 3.(숫자)'],
               ['(내이름)@MacBook agent1 % python3 --version', 'Python 3.(숫자)'], '견본(들어 있는 경우)') +
        '<p><b>어느 결과여도 괜찮습니다.</b> 숫자가 나오면 들어 있는 것입니다. 안 나오면 다음 화면에서 설치합니다.</p>',
      help: [
        { os: 'win', q: 'Microsoft Store(스토어) 화면이 열렸어요', a: 'Python이 없을 때 Windows가 스토어를 열 때가 있습니다. 그 화면은 닫아도 됩니다. 다음 화면에서 설치합니다.' },
        { os: 'win', q: '"인식되지 않습니다"라고 나와요', a: 'Python이 아직 없다는 뜻입니다. 다음 화면에서 설치합니다.' },
        { os: 'mac', q: '"명령줄 개발자 도구" 설치를 권하는 화면이 나왔어요', a: 'Mac에 Python 같은 도구가 없을 때 나올 수 있습니다. 여기서는 "나중에"나 "취소"로 닫아도 됩니다. 다음 화면의 공식 설치 프로그램으로 Python을 설치합니다.' },
        { os: 'mac', q: '"command not found: python3"라고 나와요', a: 'Python이 아직 없다는 뜻입니다. 다음 화면에서 설치합니다.' },
        { q: '숫자가 나왔어요', a: 'Python이 들어 있습니다. ' + os('다음 화면(설치)은 건너뛰고 그다음 화면으로 진행해도 됩니다.', 'Mac에서는 숫자가 나와도 다음 화면에서 python.org의 Python을 설치하세요. Mac에 처음부터 들어 있는 Python 등으로는 계산기 창을 만드는 부품(tkinter)이 동작하지 않을 수 있기 때문입니다.') }
      ]
    },
    p2w: {
      tag: 'PC에서 조작', title: 'Windows에 Python 설치하기(공식 방법)',
      html:
        '<p>2단계로 설치합니다. <b>① 설치 도구(Python Install Manager)를 설치</b> → <b>② Python 본체를 설치</b></p>' +
        '<h2>① Python Install Manager 설치</h2>' +
        '<ol>' +
        '<li>아래 링크를 엽니다(Microsoft Store의 공식 페이지입니다).<br><a href="https://apps.microsoft.com/detail/9NQ7512CXL7T" target="_blank" rel="noopener noreferrer">Python Install Manager (Microsoft Store)</a></li>' +
        '<li>"받기" 또는 "설치"를 누릅니다.</li>' +
        '<li>끝날 때까지 기다립니다.</li>' +
        '</ol>' +
        '<h2>② Python 본체 설치</h2>' +
        '<ol>' +
        '<li>VS Code 터미널을 <b>새로</b> 엽니다(맨 앞이 <b>PS</b>).</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>Python이 하나도 없을 때는 <b>최신 Python이 자동으로 설치됩니다</b>(공식 안내). 몇 분 걸립니다. 화면 안내에 따라 진행합니다.</li>' +
        '<li>"&gt;&gt;&gt;"가 나오면 Python 안에 있는 것입니다. <b>exit()</b>를 입력하고 Enter 키를 누르면 돌아옵니다.</li>' +
        '<li>다시 <b>python --version</b>으로 숫자가 나오는지 확인합니다.</li>' +
        '</ol>' +
        cmd('python') +
        '<p class="note">중간에 "PATH에 추가할까요?" 같은 질문이 나오면 어느 쪽을 골라도 괜찮습니다(공식 안내에서는 선택 사항입니다).</p>' +
        '<p class="note warn">다운로드는 반드시 Microsoft Store나 python.org의 공식 것으로 하세요.</p>',
      help: [
        { q: 'Microsoft Store를 쓸 수 없어요(회사 컴퓨터 등)', a: 'python.org의 Windows용 다운로드 페이지에서 "Latest Python install manager"를 내려받아 더블클릭합니다.<br><a href="https://www.python.org/downloads/windows/" target="_blank" rel="noopener noreferrer">python.org/downloads/windows</a>' },
        { q: '명령어로 설치하고 싶어요', a: '맨 앞이 "PS"인 터미널에 다음 명령어를 붙여 넣고 Enter 키를 누릅니다(공식 안내).' + box('winget install 9NQ7512CXL7T -e --accept-package-agreements --disable-interactivity') },
        { q: '"python"을 입력해도 스토어가 열려요', a: 'Windows의 "앱 실행 별칭" 설정이 원인일 수 있습니다. 시작 메뉴에서 "앱 실행 별칭 관리"를 입력하고 "Python(기본)"이 켜져 있는지 확인합니다. 켜져 있으면 한 번 껐다가 다시 켜 봅니다(Python 공식 안내).' },
        { q: '"인식되지 않습니다"라고 나와요', a: 'VS Code를 완전히 닫았다가 다시 열고 새 터미널에서 다시 시험하세요. 그래도 안 되면 스크린샷을 저장해서 상담하세요.' },
        { q: '시간이 오래 걸려요', a: '몇 분 걸릴 수 있습니다. 화면이 멈춘 것처럼 보여도 기다립니다. 10분 이상 변화가 없으면 일단 멈추고(Ctrl 키와 C 키) 다시 시도하세요.' }
      ]
    },
    p2m: {
      tag: 'PC에서 조작', title: 'Mac에 Python 설치하기(공식 설치 프로그램)',
      html:
        '<p>Mac의 Python은 <b>python.org</b>의 공식 설치 프로그램으로 설치합니다. <b>비밀번호 입력</b>이 필요합니다.</p>' +
        '<ol>' +
        '<li>브라우저에서 <a href="https://www.python.org/downloads/macos/" target="_blank" rel="noopener noreferrer">python.org/downloads/macos</a>를 엽니다.</li>' +
        '<li>맨 위의 "<b>Latest Python 3 Release</b>"(가장 새 버전)의 <b>macOS</b>용 설치 프로그램(<b>.pkg</b>)을 내려받습니다.</li>' +
        '<li>내려받은 .pkg를 더블클릭합니다.</li>' +
        '<li>"계속"을 눌러 갑니다. 사용 허락 화면에서는 내용을 읽고 동의하면 "동의"를 누릅니다.</li>' +
        '<li>"설치"를 누릅니다. <b>Mac 로그인 비밀번호</b>를 물으면 <b>Mac 화면에만</b> 직접 입력합니다.</li>' +
        '<li>끝나면 "응용 프로그램" 안의 "Python 3.x" 폴더가 열립니다. 그 안의 <b>Install Certificates.command</b>를 더블클릭합니다.</li>' +
        '<li>작은 터미널 창이 열리고 <b>"Successfully installed certifi"</b>와 <b>"update complete"</b>가 나오면 완료입니다. 창을 닫습니다.</li>' +
        '<li>VS Code를 ⌘(Command) 키와 Q 키로 종료했다가 다시 열고 터미널을 <b>새로</b> 엽니다. <b>python3 --version</b>으로 숫자가 나오는지 확인합니다.</li>' +
        '</ol>' +
        '<p class="note warn">비밀번호는 Mac 화면에만 입력합니다. 터미널이나 AI 대화에는 넣지 않습니다.</p>' +
        '<p class="note">여기까지의 절차는 Python 공식 안내(Using Python on macOS)로 확인했습니다.</p>',
      help: [
        { q: '"확인되지 않은 개발자"라고 나와요', a: '공식 사이트(python.org)에서 내려받은 파일인지 확인하세요. 공식 파일은 서명되어 있습니다(공식 안내). 불안하면 여기서 멈춰도 됩니다.' },
        { q: 'Install Certificates.command가 안 보여요', a: 'Finder에서 "응용 프로그램" 폴더의 "Python 3.x" 폴더를 열면 있습니다.' },
        { q: '비밀번호를 모르겠어요', a: 'Mac에 평소 로그인할 때 쓰는 비밀번호입니다. 관리자(Administrator) 계정이 필요합니다. 모르겠으면 여기서 멈추고 상담하세요.' },
        { q: '어느 것을 내려받아야 하나요?', a: 'python.org macOS 페이지 맨 위의 "Latest Python 3 Release"(가장 새 버전)입니다. Intel Mac도 Apple 실리콘 Mac도 같은 설치 프로그램으로 동작합니다(공식 안내).' }
      ]
    },
    p3: {
      tag: 'PC에서 조작', title: '계산기 프로그램 만들게 하기',
      html:
        '<p>AI에게 <b>계산기</b> 프로그램을 만들게 합니다. Python은 앞 화면에서 설치한 것을 씁니다.</p>' +
        '<ol>' +
        '<li>터미널에서 <b>claude</b>를 실행해 대화를 시작합니다.</li>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>허락을 물으면 <b>화면에 나온 명령어를 보고</b> "예(Yes)"를 고릅니다.</li>' +
        '<li>작은 계산기 창이 열리면 성공입니다.</li>' +
        '</ol>' +
        osBlock(
          box('Python의 tkinter를 써서 간단한 계산기 프로그램을 calc.py라는 이름으로 만들어 주세요. 덧셈·뺄셈·곱셈·나눗셈이 되는 버튼 달린 작은 창으로요. 만들었으면 python으로 실행해서 보여 주세요.'),
          box('Python의 tkinter를 써서 간단한 계산기 프로그램을 calc.py라는 이름으로 만들어 주세요. 덧셈·뺄셈·곱셈·나눗셈이 되는 버튼 달린 작은 창으로요. 만들었으면 python3로 실행해서 보여 주세요.')
        ) +
        '<p class="note">Python을 AI에게 설치하게 할 필요는 없습니다. 만약 AI가 설치 명령어(' + os('winget', 'brew, sudo') + ' 등)를 내놓으면 "아니요(No)"를 고르고 "Python은 이미 설치되어 있습니다"라고 전하세요.</p>',
      help: [
        HELP_APPROVE,
        { os: 'win', q: '창이 안 열려요／실행이 안 돼요', a: 'Python을 설치한 뒤 터미널이 아직 새 설정을 모를 때가 있습니다. <b>VS Code를 닫았다가 다시 열고</b>, 다시 <b>claude</b>를 실행해서 "calc.py를 실행해 주세요"라고 부탁하세요.' },
        { os: 'win', q: '"No module named tkinter"라고 나와요', a: '창을 만드는 부품(tkinter)을 쓸 수 없을 때 나옵니다. 앞 화면의 공식 방법(Python Install Manager)으로 설치한 Python을 쓰고 있는지 확인하세요. 모르겠으면 화면을 저장(스크린샷)해서 상담하세요.' },
        { os: 'mac', q: '창이 안 열려요／"No module named tkinter"라고 나와요', a: '창을 만드는 부품(tkinter)을 쓸 수 없는 버전의 Python을 쓰고 있을 수 있습니다. 앞 화면의 <b>python.org 공식 설치 프로그램</b>으로 설치한 Python을 쓰세요. 앞 화면부터 다시 해 보세요.' },
        { os: 'mac', q: '"python3"로 다른 Python이 실행되는 것 같아요', a: 'Mac에는 Apple이 준비한 python3도 들어 있습니다. 공식 안내에서는 python.org의 Python을 설치하면 보통 그쪽이 쓰입니다. 터미널을 새로 열고 다시 시험해 보세요.' },
        { os: 'mac', q: '계산기 창이 안 보여요', a: '창이 VS Code 뒤에 열려 있을 수 있습니다. 화면 아래(Dock)에 나와 있는 Python 아이콘을 클릭해 보세요.' }
      ]
    },
    p4: {
      tag: 'PC에서 조작', title: '계산기를 쓰고 고치게 하자',
      html:
        '<ol>' +
        '<li>나온 계산기 창에서 <b>12 + 34</b> 등을 계산해 봅니다.</li>' +
        '<li>창을 닫으면 Claude Code 화면으로 돌아옵니다(안 돌아오면 잠시 기다립니다).</li>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다. 허락을 물으면 "예(Yes)"를 고릅니다.</li>' +
        '<li>다시 계산기를 열어 바뀌었는지 확인합니다.</li>' +
        '</ol>' +
        box('calc.py의 버튼 색을 파란색으로 하고, 0으로 나눴을 때 "0으로는 나눌 수 없습니다"라고 표시되게 해 주세요. 다른 부분은 바꾸지 마세요. 그다음 한 번 더 실행해서 보여 주세요.') +
        '<p class="note">이것은 <b>Edit(고치기)</b>와 <b>Bash(실행)</b>의 조합입니다. AI가 프로그램을 고치고 실행해 줍니다.</p>' +
        '<p class="note">지금 설치한 Python은 <b>앞으로의 수업에서도 씁니다</b>.</p>',
      help: [
        HELP_APPROVE,
        { q: '창을 닫아도 Claude Code로 안 돌아와요', a: '잠시 기다리세요. 그래도 안 돌아오면 터미널에서 ' + os('Ctrl 키', 'Control 키(⌘ 키가 아닙니다)') + '와 C 키를 동시에 누릅니다.' },
        { q: '색이 안 바뀌어요', a: '"calc.py를 실행해서 보여 주세요"라고 다시 부탁하세요. 옛날 창이 열려 있을 수 있습니다. 닫고 시험하세요.' }
      ]
    },
    a20: {
      tag: '퀴즈', title: '4가지 "손"과 CLAUDE.md 퀴즈',
      quiz: [
        { q: '파일 내용을 읽기만 하고 바꾸지 않는다. 어느 "손"?', options: ['Read(읽기)', 'Write(쓰기)', 'Edit(고치기)', 'Bash(실행)'], answer: 0, explain: 'Read는 읽기만 합니다. 허락도 필요 없습니다.' },
        { q: '완전히 새 파일을 만든다. 어느 "손"?', options: ['Read(읽기)', 'Write(쓰기)', 'Edit(고치기)', 'Bash(실행)'], answer: 1, explain: 'Write는 새로 만듭니다. 같은 이름이 있으면 덮어씁니다.' },
        { q: '파일의 일부만 고친다. 어느 "손"?', options: ['Read(읽기)', 'Write(쓰기)', 'Edit(고치기)', 'Bash(실행)'], answer: 2, explain: 'Edit는 여기만 고치는 손입니다.' },
        { q: '파일을 복사한다(명령어를 실행한다). 어느 "손"?', options: ['Read(읽기)', 'Write(쓰기)', 'Edit(고치기)', 'Bash(실행)'], answer: 3, explain: 'Bash는 명령어를 실행하는 손입니다.' },
        { q: 'CLAUDE.md는 언제 읽히나요?', options: ['대화를 시작할 때', 'AI가 답할 때마다 반드시', '읽히지 않는다'], answer: 0, explain: '공식 안내에서는 대화를 시작할 때 읽힙니다.' },
        { q: '프로그램을 "실행"하기 위해 컴퓨터에 설치해 두는 도구는?', options: ['Python(프로그램을 실행하는 도구)', 'Word', '프린터'], answer: 0, explain: 'DVD를 보려면 DVD 플레이어가 필요하듯, Python 프로그램을 실행하려면 Python이 필요합니다.' },
        { q: 'AI에게 프로그램을 만들어 실행하게 한다. 쓰는 "손"은?', options: ['Read만', 'Write와 Bash', 'Edit만'], answer: 1, explain: '프로그램 파일을 만드는 것이 Write, 실행하는 것이 Bash입니다.' }
      ],
      html: '<p>배운 것을 퀴즈로 확인해 봅시다. 고르면 바로 답이 나옵니다. 점수는 매기지 않습니다.</p>',
      help: [
        { q: '틀렸어요', a: '괜찮습니다. 앞 화면을 다시 보고 돌아와 보세요. 몇 번이든 다시 할 수 있습니다.' }
      ]
    },
    a21: {
      tag: '확인', title: '마지막 확인',
      checks: [
        'CLAUDE.md를 만들고 AI에게 이름(하나)을 붙였다',
        '새 대화에서 AI가 이름을 기억하는지 확인했다',
        'AI에게 파일을 읽게 해서 정리하게 했다(Read)',
        'AI에게 새 파일을 쓰게 하고 일부만 고치게 했다(Write·Edit)',
        'AI에게 파일 목록 보기와 복사를 실행하게 했다(Bash)',
        'AI에게 계산기 프로그램을 만들게 하고 실행해서 고치게 했다(한 사람만)'
      ],
      required: 5,
      html: '<p>할 수 있었던 것에 체크를 넣으세요. <b>위의 5개</b>에 체크가 들어가면 "완료로 하기"를 누를 수 있습니다. 맨 아래 1개는 PC 환경에 따라 못 하는 사람도 있으므로 한 사람만 체크합니다.</p>',
      help: [
        { q: '못 한 부분이 있어요', a: '그 단계로 돌아가서 "곤란할 때"를 보세요. 몇 번이든 다시 할 수 있습니다.' }
      ]
    }
  };

  window.COURSE_KO.lessons.l2 = {
    title: 'AI가 기억하게 하기·파일 움직이게 하기',
    short: 'CLAUDE.md로 AI에게 이름과 규칙을 기억하게 하고, 4가지 "손"을 구분해서 쓴다',
    devices: 'PC',
    doneCard: '<b>레슨2　완료입니다. 수고하셨습니다.</b><br>AI에게 기억하게 하는 것과 파일을 읽기·쓰기·고치기·실행하게 하는 것을 할 수 있게 되었습니다. 다음은 레슨3입니다.',
    steps: steps
  };
})();
