/* 레슨5 한국어판(한국인 학습자용). 부탁하는 글과 예시도 한국어로 쓴다.
   내용은 2026-10-31에 공식 안내로 확인(Claude Code: sub-agents, hooks, hooks-guide, commands, costs / Claude for Microsoft 365: claude.com/docs/office-agents). */
(function () {
  'use strict';
  var C = window.COURSE;
  var cmd = function (t) { return C.cmd(t, '복사'); };
  var box = function (t) { return C.copybox(t, null, '복사'); };
  var os = C.os, osBlock = C.osBlock;

  var HELP_APPROVE = {
    q: 'AI가 "허락하시겠습니까?"라고 물어요',
    a: 'AI가 파일을 만들거나 고치거나 명령어를 실행하기 전에 "해도 될까요?"라고 묻습니다. 화면에 나온 내용을 읽고, 연습용 agent1 폴더 안의 일이라면 "예(Yes)"를 고릅니다. 화살표 키(↑↓)로 고르고 Enter 키를 누릅니다.'
  };
  var HELP_ENG = { q: '터미널 글자가 영어예요', a: '괜찮습니다. 표시가 영어여도 하는 일은 같습니다.' };
  var HELP_RESTART = {
    q: '다시 실행하려면?',
    a: 'Claude Code 입력란에 <b>/exit</b>를 넣고 Enter 키를 누릅니다. 터미널 줄("PS …&gt;"나 "… %")로 돌아오면 <b>claude</b>를 넣고 Enter 키를 누릅니다.'
  };
  var HELP_NOFILE = {
    q: 'schedule.txt 같은 파일이 없어요',
    a: '레슨2에서 만든 파일입니다. 없으면 "schedule.txt, budget.txt, packing.txt를 연습용으로 짧게 만들어 주세요"라고 부탁한 뒤 다시 해 보세요.'
  };

  var HOOK_PY =
    '# 레슨5 연습용 훅(agent1 안에서만 씁니다)\n' +
    'import sys, json, os, datetime\n' +
    '\n' +
    'mode = sys.argv[1] if len(sys.argv) > 1 else \'\'\n' +
    'data = json.loads(sys.stdin.buffer.read() or b\'{}\')\n' +
    '\n' +
    'if mode == \'prompt\':\n' +
    '    # 부탁하는 글에 "비밀번호"가 있으면 AI에게 가기 전에 막는다\n' +
    '    if \'비밀번호\' in data.get(\'prompt\', \'\'):\n' +
    '        print(json.dumps({\'decision\': \'block\', \'reason\': \'비밀번호는 AI에게 쓰지 않습니다. 이 부탁은 훅이 막았습니다.\'}))\n' +
    'elif mode == \'log\':\n' +
    '    # AI가 파일을 만들거나 고치면 tool-log.txt에 한 줄 쓴다\n' +
    '    name = os.path.basename(data.get(\'tool_input\', {}).get(\'file_path\', \'\'))\n' +
    '    folder = os.environ.get(\'CLAUDE_PROJECT_DIR\') or data.get(\'cwd\') or \'.\'\n' +
    '    with open(os.path.join(folder, \'tool-log.txt\'), \'a\', encoding=\'utf-8\') as f:\n' +
    '        f.write(datetime.datetime.now().strftime(\'%H:%M:%S\') + \' \' + data.get(\'tool_name\', \'\') + \' \' + name + \'\\n\')\n' +
    'elif mode == \'stop\':\n' +
    '    # 답을 끝내기 전에 한 번만 한 줄 요약을 부탁한다\n' +
    '    if not data.get(\'stop_hook_active\'):\n' +
    '        print(json.dumps({\'decision\': \'block\', \'reason\': \'끝내기 전에 지금 답을 한 줄로 요약해 주세요.\'}))\n';

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
    return '<li>VS Code 왼쪽에서 <b>.claude</b> 폴더 안의 <b>settings.json</b>을 클릭해 엽니다(레슨3에서 만든 파일입니다).</li>' +
    '<li>내용을 전부 고르고(' + os('Ctrl 키', '⌘(Command) 키') + '와 A 키) 아래 "복사"로 복사한 것을 붙여 넣습니다(' + os('Ctrl 키', '⌘(Command) 키') + '와 V 키). <b>내용이 통째로 바뀝니다.</b>' + settingsBox(parts) + '</li>' +
    '<li>' + os('Ctrl 키', '⌘(Command) 키') + '와 S 키로 저장합니다.</li>' +
    '<li>Claude Code를 <b>다시 실행합니다</b>(<b>/exit</b> → <b>claude</b>).</li>';
  }

  var WORD_CHECKER =
    '---\n' +
    'name: word-checker\n' +
    'description: 글이 쉬운 말로 쓰여 있는지 확인하는 담당. 글 점검을 부탁받았을 때 쓴다.\n' +
    'tools: Read, Glob, Grep\n' +
    '---\n' +
    '당신은 글 점검 담당입니다.\n' +
    '- 부탁받은 파일을 읽고 어려운 말이나 너무 긴 문장을 찾습니다.\n' +
    '- 찾은 것을 많아도 5개까지 "원래 말 → 쉬운 말" 형태로 목록을 만듭니다.\n' +
    '- 파일은 고치지 않습니다. 읽기만 합니다.\n';

  var steps = {
    e1: {
      tag: '오늘의 목표', title: '레슨5에서 할 수 있게 되는 것',
      html:
        '<p class="note warn"><b>이 레슨은 Windows나 Mac 컴퓨터가 필요합니다.</b> 레슨4가 끝난 사람용입니다. 화면 오른쪽 위의 "Windows/Mac" 버튼으로 내 컴퓨터 쪽을 고르세요.</p>' +
        '<p>지금까지는 AI 혼자서 모든 작업을 했습니다. 오늘은 AI에게 <b>일을 나눠 맡기는</b> 방법과, "이렇게 되면 반드시 이렇게 한다"는 <b>자동 규칙</b>을 배웁니다.</p>' +
        '<div class="card goal"><b>목표</b><br>① 작업을 <b>서브에이전트</b>(돕는 AI)에게 맡기고, 동시에 돌리고, 직접 만든다<br>② <b>훅</b>(정해진 때 반드시 동작하는 장치)을 3개 돌려 본다<br>③ (선택) 엑셀·워드·파워포인트 안에서 Claude를 쓴다</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>걸리는 시간</dt><dd>약 1시간 30분(쉬어 가며 해도 됩니다)</dd>' +
        '<dt>쓰는 것</dt><dd>VS Code, agent1 폴더, Claude Code, Python(레슨2에서 설치한 것)</dd>' +
        '<dt>보너스(선택)</dt><dd>Microsoft Office(엑셀·워드·파워포인트)가 있는 사람만</dd>' +
        '</dl></div>' +
        '<p class="note">서브에이전트도 AI로 동작하므로 <b>사용량(요금제 한도)에 포함됩니다</b>(공식 안내). 오늘의 연습은 작은 작업만 합니다.</p>' +
        '<p class="note warn">연습은 <b>agent1 폴더 안에서만</b> 합니다. 진짜 개인정보는 대화에 넣지 않습니다.</p>',
      help: [
        { q: '레슨4를 아직 못 끝냈어요', a: '먼저 레슨4를 끝내 주세요. 뒤에서 돌리는 작업(백그라운드)과 /tasks를 이 레슨에서도 씁니다.' },
        { q: 'Python이 없어요', a: '레슨2의 "Python 설치" 화면에서 설치하세요. 훅 연습에서 씁니다.' }
      ]
    },
    e2: {
      tag: 'PC에서 조작', title: '복습: Claude Code 실행하기',
      html:
        '<ol>' +
        '<li>VS Code에서 <b>agent1</b> 폴더를 엽니다.</li>' +
        '<li>"터미널"→"새 터미널"을 고릅니다.</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다.' + cmd('claude') + '</li>' +
        '<li>화면 아래 줄이 <b>manual mode on</b>인지 봅니다. 다르면 Shift+Tab을 눌러 <b>manual</b>로 바꿉니다.</li>' +
        '</ol>' +
        '<p class="note">이 레슨에서도 몇 번 다시 실행합니다. 실행할 때마다 아래 줄을 보는 습관을 이어 갑시다.</p>',
      help: [
        { os: 'win', q: '"인식되지 않습니다"라고 나와요', a: 'VS Code를 완전히 닫았다가 다시 열고 새 터미널에서 해 보세요.' },
        { os: 'mac', q: '"command not found"라고 나와요', a: 'VS Code를 ⌘(Command) 키와 Q 키로 완전히 끝내고 다시 열어서 새 터미널에서 해 보세요.' },
        HELP_ENG
      ]
    },
    e3: {
      tag: '알아 두기', title: '"서브에이전트"가 뭔가요?',
      html:
        '<p><b>서브에이전트</b>는 메인 AI가 일을 <b>나눠 맡길</b> 때 부르는 <b>돕는 AI</b>입니다.</p>' +
        '<ul class="parts">' +
        '<li><b>자기 책상에서 일한다</b>서브에이전트는 <b>다른 책상</b>(컨텍스트)을 씁니다.<br><span>조사하면서 읽은 많은 자료가 메인 책상에 펼쳐지지 않는다</span></li>' +
        '<li><b>결과만 돌려준다</b>끝나면 요약만 메인 AI에게 넘깁니다.<br><span>메인 책상이 깔끔하게 유지된다(레슨4의 "책상 넓이" 이야기입니다)</span></li>' +
        '<li><b>동시에 움직일 수 있다</b>여러 조사를 동시에 진행할 수 있습니다.<br><span>보통은 뒤(백그라운드)에서 돌아간다</span></li>' +
        '</ul>' +
        '<p>Claude Code에는 처음부터 몇 명의 "도우미"가 있습니다. 예를 들어 <b>Explore</b>(익스플로어)는 파일을 <b>읽기만</b> 하면서 조사하는 담당입니다.</p>' +
        '<p class="note">서브에이전트의 작업도 사용량에 포함됩니다. 많이 동시에 돌리면 그만큼 많이 씁니다(공식 안내). "나눠 맡기면 무조건 이득"은 아닙니다.</p>',
      help: [
        { q: '어떨 때 쓰나요?', a: '"많이 읽어야 하는 조사"나 "서로 관계없는 작업이 여러 개" 있을 때 알맞습니다. 금방 끝나는 간단한 부탁은 그냥 부탁하는 편이 빠릅니다.' }
      ]
    },
    e4: {
      tag: 'PC에서 조작', title: '조사를 서브에이전트에게 맡기기',
      html:
        '<p>이름을 적어서 부탁하면 그 서브에이전트가 쓰입니다(공식 안내). 읽기만 하는 담당 <b>Explore</b>에게 agent1 폴더 안을 조사하게 합니다.</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>화면에 <b>Explore(…)</b> 같은 줄이 나오면 서브에이전트가 일하고 있는 것입니다.</li>' +
        '<li>잠시 기다리면 요약이 옵니다. 5줄 요약이 나오면 성공입니다.</li>' +
        '</ol>' +
        box('Explore 서브에이전트를 써서 agent1 폴더 안에 어떤 파일이 있는지 조사해 주세요. 결과는 5줄로 정리해 주세요.') +
        '<p class="note">서브에이전트는 보통 뒤(백그라운드)에서 돌아갑니다. 기다리는 동안에도 입력란을 쓸 수 있습니다.</p>',
      help: [
        { q: 'Explore 줄이 안 나와요', a: 'AI가 직접 읽는 편이 빠르다고 판단할 때도 있습니다. 요약이 나오면 괜찮습니다. "반드시 Explore 서브에이전트를 써 주세요"라고 다시 부탁해 봐도 됩니다.' },
        HELP_APPROVE
      ]
    },
    e5: {
      tag: 'PC에서 조작', title: '서브에이전트 3개를 동시에 돌리기',
      html:
        '<p>서로 관계없는 작업은 <b>동시에</b> 진행할 수 있습니다. 레슨2에서 만든 파일 3개를 서브에이전트 3개로 동시에 읽게 합니다.</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>서브에이전트 줄이 <b>3개</b> 나오는 것을 봅니다.</li>' +
        '<li>마지막에 3개를 정리한 표가 나오면 성공입니다.</li>' +
        '</ol>' +
        box('서브에이전트 3개를 동시에 써서 schedule.txt, budget.txt, packing.txt를 하나씩 읽어 주세요. 각각의 내용을 한 줄로 요약하고, 마지막에 표로 만들어 주세요.') +
        '<p class="note">공식 안내에 따르면 너무 많이 동시에 돌리면 한도에 걸려 멈춥니다(기본 20개까지). 오늘은 3개만 씁니다.</p>',
      help: [HELP_NOFILE, HELP_APPROVE]
    },
    e6: {
      tag: 'PC에서 조작', title: '서브에이전트의 "안"을 보기',
      html:
        '<p>서브에이전트가 무엇을 읽고 어떻게 생각했는지는 <b>안의 기록</b>(작업 기록)을 열면 볼 수 있습니다.</p>' +
        '<ol>' +
        '<li>앞 화면의 부탁을 한 번 더 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>돌아가는 동안 입력란 <b>아래</b>에 서브에이전트 목록이 나옵니다. <b>↓</b> 키로 하나를 고르고 Enter 키를 누르면 그 안의 기록이 열립니다.</li>' +
        '<li>열린 화면에서 말을 걸 수도 있습니다. 예를 들어 "읽은 파일 이름을 다시 알려 주세요"라고 넣고 Enter 키를 누릅니다.</li>' +
        '<li><b>Esc</b> 키로 메인 대화로 돌아갑니다.</li>' +
        '</ol>' +
        '<h2>벌써 끝나 버렸다면</h2>' +
        '<p>서브에이전트는 끝나면 목록에서 사라집니다. 공식 안내에 따르면 끝난 뒤 <b>30초 동안</b>은 <b>/tasks</b>로 열 수 있습니다.</p>' +
        cmd('/tasks') +
        '<p class="note">화면 모양은 버전에 따라 조금 다릅니다. 안의 기록을 볼 수 있었다면 성공입니다.</p>',
      help: [
        { q: '목록이 안 나와요 / 바로 사라져요', a: '읽는 파일이 짧아서 금방 끝날 수 있습니다. 끝나면 바로 /tasks를 넣어 보세요. 그래도 볼 수 없으면 이 화면은 읽기만 해도 됩니다.' },
        { q: '건 말은 어디로 가나요?', a: '기록을 열어 둔 동안에는 그 <b>서브에이전트</b>에게 갑니다. "/"로 시작하는 명령은 메인 대화로 갑니다(공식 안내).' },
        { q: '화면을 닫고 싶어요', a: 'Esc 키(키보드 왼쪽 위)를 누르면 메인 대화로 돌아갑니다.' }
      ]
    },
    e7: {
      tag: 'PC에서 조작', title: '서브에이전트가 다시 일을 나누기',
      html:
        '<p>서브에이전트도 자기 서브에이전트를 부를 수 있습니다. 공식 안내에 따르면 기본으로 메인 대화에서 <b>3단계</b>까지 이어집니다.</p>' +
        '<ol>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li>입력란 아래 목록에 서브에이전트가 <b>나뭇가지처럼</b> 늘어서 나올 수 있습니다.</li>' +
        '<li>마지막에 두 파일의 요약이 나오면 성공입니다.</li>' +
        '</ol>' +
        box('서브에이전트를 하나 써 주세요. 그 서브에이전트가 다시 서브에이전트 2개를 써서 CLAUDE.md와 packing.txt를 하나씩 읽게 해 주세요. 마지막에 각각의 내용을 한 줄로 요약해서 알려 주세요.') +
        '<p class="note">AI가 "나누지 않아도 바로 읽을 수 있다"고 판단해서 단계를 만들지 않을 수도 있습니다. 요약이 나오면 괜찮습니다. 나눔을 겹칠수록 사용량도 늘어납니다.</p>',
      help: [HELP_NOFILE, HELP_APPROVE]
    },
    e8: {
      tag: '알아 두기', title: '나만의 서브에이전트',
      html:
        '<p>정해진 일을 늘 같은 방식으로 해 주길 바랄 때는 <b>나만의 서브에이전트</b>를 만들 수 있습니다. 내용은 <b>파일 하나</b>입니다.</p>' +
        '<ul class="parts">' +
        '<li><b>두는 곳</b>agent1 안의 <b>.claude/agents</b> 폴더<br><span>이 폴더 안에서만 쓸 수 있습니다</span></li>' +
        '<li><b>위쪽 부분</b>"---"로 감싼 곳<br><span>name(이름)과 description(언제 쓰는지)이 필요합니다. tools(써도 되는 도구)는 안 써도 됩니다</span></li>' +
        '<li><b>아래쪽 부분</b>보통 글<br><span>그 담당에게 주는 일 설명(사용 설명서)</span></li>' +
        '</ul>' +
        '<p>오늘은 글을 읽고 <b>어려운 말을 찾는 담당</b>을 만듭니다. 파일을 고치지 않도록 도구는 "읽기" 계열(Read 등)만 줍니다.</p>' +
        '<p class="note">공식 안내에 따르면 /agents를 넣으면 지금 버전에서는 만드는 방법 안내가 나옵니다. 오늘은 직접 파일을 만듭니다.</p>',
      help: [
        { q: 'CLAUDE.md와 뭐가 다른가요?', a: 'CLAUDE.md는 메인 AI가 매번 읽는 "사용 설명서"입니다. 서브에이전트 파일은 그 <b>담당만</b> 읽는 일 설명입니다.' }
      ]
    },
    e9: {
      tag: 'PC에서 조작', title: '"말 점검 담당" 만들기',
      html:
        '<ol>' +
        '<li>VS Code 왼쪽 파일 목록의 <b>빈 곳</b>에서 ' + os('오른쪽 클릭', 'Control 키를 누른 채 클릭(또는 두 손가락 클릭)') + '하고 "새 파일"을 고릅니다.</li>' +
        '<li>이름 칸에 다음처럼 입력하고 Enter 키를 누릅니다(영문 입력으로. 아래 "복사"로 복사해서 붙여 넣어도 됩니다).' + cmd('.claude/agents/word-checker.md') + '</li>' +
        '<li>빈 파일이 열립니다. 아래 "복사"를 눌러 안에 붙여 넣습니다.</li>' +
        '<li>' + os('Ctrl 키', '⌘(Command) 키') + '와 S 키로 저장합니다.</li>' +
        '<li>새 폴더(agents)를 만들었으므로 Claude Code를 <b>다시 실행합니다</b>(<b>/exit</b> → <b>claude</b>). 공식 안내에 따르면 새로 만든 폴더는 다시 실행하면 읽힙니다.</li>' +
        '</ol>' +
        box(WORD_CHECKER) +
        '<p class="note">"tools: Read, Glob, Grep"은 "읽기·찾기" 도구만 써도 된다는 뜻입니다. 이 담당은 파일을 고칠 수 없습니다.</p>',
      help: [
        { q: '.claude 폴더가 안 보여요', a: 'VS Code 왼쪽에 나와 있을 것입니다. 없으면 이름 칸에 <b>.claude/agents/word-checker.md</b>라고 넣으면 폴더도 함께 만들어집니다.' },
        { q: '"---" 줄은 지워도 되나요?', a: '지우지 마세요. "---"로 감싼 부분이 이름과 쓰는 때를 정하는 설정입니다.' },
        HELP_RESTART
      ]
    },
    e10: {
      tag: 'PC에서 조작', title: '"말 점검 담당"에게 부탁하기',
      html:
        '<ol>' +
        '<li>아래 "복사"를 눌러 입력란에 붙여 넣고 Enter 키를 누릅니다.</li>' +
        '<li><b>word-checker</b> 줄이 나오고 "원래 말 → 쉬운 말" 목록이 나오면 성공입니다.</li>' +
        '</ol>' +
        box('word-checker 서브에이전트를 써서 mail-draft.txt에 어려운 말이 없는지 점검해 주세요.') +
        '<p class="note">입력란에 <b>@</b>를 치면 쓸 수 있는 담당 목록이 나옵니다. 거기서 word-checker를 고르면 그 담당이 반드시 쓰입니다(공식 안내).</p>' +
        '<p class="note">고칠지 말지는 <b>내가</b> 정합니다. 고치고 싶으면 평소처럼 "이 쉬운 말로 mail-draft.txt를 고쳐 주세요"라고 부탁합니다.</p>',
      help: [
        { q: 'mail-draft.txt가 없어요', a: '레슨2에서 만든 파일입니다. 없으면 다른 글 파일(packing.txt 등) 이름으로 바꿔서 부탁하세요.' },
        { q: 'word-checker를 찾을 수 없다고 해요', a: '파일 위치(.claude/agents/word-checker.md)와 맨 위의 "---" 부분을 확인하세요. 그다음 Claude Code를 다시 실행합니다.' },
        HELP_RESTART
      ]
    },
    e11: {
      tag: '알아 두기', title: '"훅"이 뭔가요?',
      html:
        '<p><b>훅</b>은 "<b>○○일 때는 반드시 △△한다</b>"는 <b>자동 규칙</b>입니다. 정해진 때에 정해진 프로그램이 반드시 돌아갑니다.</p>' +
        '<ul class="parts">' +
        '<li><b>CLAUDE.md</b>AI에게 하는 "부탁"<br><span>대체로 지키지만 100%는 아니다(레슨2)</span></li>' +
        '<li><b>훅</b>컴퓨터가 반드시 돌리는 규칙<br><span>AI가 잊어도 돌아간다</span></li>' +
        '</ul>' +
        '<h2>오늘 쓰는 3가지 "때"</h2>' +
        '<ul class="parts">' +
        '<li><b>UserPromptSubmit</b>부탁을 보냈을 때<br><span>① "비밀번호"라는 말을 막는다</span></li>' +
        '<li><b>PostToolUse</b>AI가 도구를 쓴 뒤<br><span>② 파일을 만들고 고친 기록을 남긴다</span></li>' +
        '<li><b>Stop</b>AI가 답을 끝냈을 때<br><span>③ 끝내기 전에 한 줄 요약을 부탁한다</span></li>' +
        '</ul>' +
        '<p class="note">그 밖에도 "대화를 시작할 때", "도구를 쓰기 전" 등 많은 "때"가 있습니다(공식 안내).</p>',
      help: [
        { q: '왜 "훅"이라고 하나요?', a: '"걸다"라는 뜻입니다. 정해진 "때"에 내 프로그램을 걸어 두는 느낌입니다.' }
      ]
    },
    e12: {
      tag: '알아 두기', title: '훅을 쓸 때의 안전 규칙',
      html:
        '<p class="note warn">공식 안내에 따르면 훅은 <b>내 컴퓨터의 권한으로 무엇이든 실행할 수 있습니다</b>. 파일을 지우는 것도 할 수 있습니다.</p>' +
        '<ul class="parts">' +
        '<li><b>① 내용을 확인한 것만</b>이 교재의 것이나, 직접 읽고 뜻을 안 것만<br><span>인터넷에서 찾은 훅을 그대로 넣지 않는다</span></li>' +
        '<li><b>② 연습은 agent1 안에서만</b>오늘은 agent1의 .claude 폴더에 씁니다<br><span>다른 폴더에는 효과가 없습니다</span></li>' +
        '<li><b>③ 끝나면 정리한다</b>연습용 훅은 마지막에 뺍니다<br><span>남기는 것은 "비밀번호"를 막는 것뿐</span></li>' +
        '</ul>' +
        '<p>어떤 훅이 들어 있는지는 Claude Code 입력란에 <b>/hooks</b>를 넣으면 <b>보기만</b> 하는 목록으로 확인할 수 있습니다.</p>',
      help: [
        { q: '훅은 AI가 알아서 만드나요?', a: '이 레슨에서는 직접 파일에 씁니다. AI에게 부탁해서 만들 수도 있지만, 그때도 내용을 직접 확인한 뒤에 씁니다.' }
      ]
    },
    e13: {
      tag: 'PC에서 조작', title: '훅의 "도구" 준비하기',
      html:
        '<p>3개의 훅은 같은 작은 프로그램(Python) 하나를 씁니다. 안을 읽으면 무엇을 하는지 알 수 있게 써 두었습니다("#" 줄은 설명입니다).</p>' +
        '<ol>' +
        '<li>VS Code 왼쪽 파일 목록의 <b>빈 곳</b>에서 ' + os('오른쪽 클릭', 'Control 키를 누른 채 클릭') + '하고 "새 파일"을 고릅니다.</li>' +
        '<li>이름 칸에 다음처럼 넣고 Enter 키를 누릅니다.' + cmd('.claude/hooks/lesson5.py') + '</li>' +
        '<li>빈 파일이 열립니다. 아래 "복사"를 눌러 안에 붙여 넣고 ' + os('Ctrl 키', '⌘(Command) 키') + '와 S 키로 저장합니다.</li>' +
        '</ol>' +
        box(HOOK_PY) +
        '<p class="note">이 프로그램이 하는 일은 ① 부탁하는 글에 "비밀번호"가 있으면 막기, ② 만들거나 고친 파일 이름을 tool-log.txt에 쓰기, ③ 답을 끝내기 전에 한 번만 요약을 부탁하기, 이 3가지뿐입니다.</p>',
      help: [
        { q: '붙여 넣었더니 들여쓰기(왼쪽 공백)가 어긋났어요', a: 'Python은 왼쪽 공백도 중요한 뜻이 있습니다. 전부 지우고 다시 "복사"에서 붙여 넣으세요.' },
        { q: 'VS Code가 "Python 확장"을 권해요', a: '설치하지 않아도 괜찮습니다. 오른쪽 아래 알림은 닫아도 됩니다.' }
      ]
    },
    e14: {
      tag: 'PC에서 조작', title: '훅① "비밀번호"를 막기',
      html:
        '<p>부탁을 보냈을 때(<b>UserPromptSubmit</b>) 글 안에 "비밀번호"가 있으면 <b>AI에게 가기 전에 막는</b> 훅입니다.</p>' +
        '<ol>' + REPLACE(['prompt']) +
        '<li>다음 부탁을 보내 봅니다. <b>진짜 비밀번호는 넣지 않습니다.</b>' + box('연습입니다. 비밀번호라는 말이 들어간 글을 보내 봅니다.') + '</li>' +
        '<li>"비밀번호는 AI에게 쓰지 않습니다. 이 부탁은 훅이 막았습니다."라고 나오고 AI가 답하지 않으면 성공입니다.</li>' +
        '</ol>' +
        '<p class="note">settings.json의 새 내용에는 레슨3에서 쓴 "Manual로 시작"과 "secret.txt를 읽지 않기"도 그대로 들어 있습니다. <b>"hooks"</b> 부분이 이번에 늘어난 곳입니다.</p>' +
        '<p class="note warn">공식 안내에 따르면 막은 부탁의 글도 컴퓨터 안의 대화 기록에는 남습니다. 이 훅은 "실수로 보내는 것을 막는" 장치이지, 비밀을 지키는 금고가 아닙니다.</p>',
      help: [
        { q: '막히지 않아요', a: '① settings.json을 저장했는지 ② 다시 실행했는지 ③ lesson5.py 위치가 .claude/hooks/인지 확인하세요. 그래도 안 되면 /hooks를 넣어 UserPromptSubmit가 목록에 있는지 보세요.' },
        { q: '"hook error" 같은 표시가 나와요', a: 'Python이 돌지 않았을 때 나옵니다. 터미널에서 ' + os('<b>python --version</b>', '<b>python3 --version</b>') + '이 되는지 확인하세요(레슨2). lesson5.py 내용을 다시 붙여 넣는 것도 해 보세요.' },
        { q: 'settings.json이 없어요', a: '레슨3에서 만든 파일입니다. 없으면 레슨3의 "설정 파일을 직접 쓰기" 화면과 같은 방법으로 .claude/settings.json을 만들고 위 내용을 붙여 넣습니다.' },
        HELP_RESTART
      ]
    },
    e15: {
      tag: 'PC에서 조작', title: '훅② 도구 기록 남기기',
      html:
        '<p>AI가 도구를 쓴 뒤(<b>PostToolUse</b>)에 돌아가는 훅입니다. 파일을 만들었을(Write) 때와 고쳤을(Edit) 때만 <b>tool-log.txt</b>에 시각, 도구, 파일 이름을 한 줄 씁니다.</p>' +
        '<ol>' + REPLACE(['prompt', 'log']) +
        '<li>다음 부탁을 보냅니다. 허락을 물으면 내용을 보고 "예(Yes)"를 고릅니다.' + box('hook-test.txt라는 이름의 파일을 만들고 "훅 연습입니다"라고 한 줄만 써 주세요.') + '</li>' +
        '<li>VS Code 왼쪽에 <b>tool-log.txt</b>가 생깁니다. 열어서 "(시각) Write hook-test.txt" 같은 줄이 있으면 성공입니다.</li>' +
        '</ol>' +
        '<p class="note">"PostToolUse" 부분이 늘었습니다. "matcher": "Write|Edit"는 "Write나 Edit일 때만"이라는 뜻입니다.</p>',
      help: [
        { q: 'tool-log.txt가 안 생겨요', a: '다시 실행했는지 확인하세요. 그다음 파일을 만드는 부탁을 한 번 더 해 보세요.' },
        { q: 'tool-log.txt는 AI가 쓴 건가요?', a: '아닙니다. 훅(컴퓨터)이 썼습니다. AI는 이 파일을 모릅니다. 그래서 AI가 잊어도 기록은 남습니다.' },
        HELP_APPROVE,
        HELP_RESTART
      ]
    },
    e16: {
      tag: 'PC에서 조작', title: '훅③ 끝내기 전에 한마디',
      html:
        '<p>AI가 답을 끝냈을 때(<b>Stop</b>) 돌아가는 훅입니다. AI가 끝내려고 하면 "<b>끝내기 전에 한 줄로 요약해 주세요</b>"라고 되돌려 부탁해서 조금만 더 이어 가게 합니다.</p>' +
        '<ol>' + REPLACE(['prompt', 'log', 'stop']) +
        '<li>다음 부탁을 보냅니다.' + box('가을에 맛있는 과일을 3가지 알려 주세요.') + '</li>' +
        '<li>답 뒤에 <b>Stop hook</b> 같은 표시가 나오고 AI가 <b>한 줄 요약</b>을 덧붙이면 성공입니다.</li>' +
        '</ol>' +
        '<p class="note">프로그램 안의 <b>stop_hook_active</b>는 "이미 한 번 이어 간 뒤인지"를 나타냅니다. 이것을 보고 <b>한 번만</b> 하게 했습니다. 보지 않으면 AI가 끝없이 끝내지 못하게 됩니다(공식 안내).</p>' +
        '<p class="note">답할 때마다 요약이 한 번 늘어나서 사용량도 조금 늘어납니다. 다음 화면에서 뺍니다.</p>',
      help: [
        { q: '요약이 안 나와요', a: '다시 실행했는지 확인하세요. /hooks를 넣어 Stop이 목록에 있는지도 보세요.' },
        { q: '끝없이 안 끝나요', a: 'Esc 키를 눌러 멈춥니다. lesson5.py 내용을 다시 "복사"에서 붙여 넣으세요(stop_hook_active 줄이 중요합니다).' },
        HELP_RESTART
      ]
    },
    e17: {
      tag: 'PC에서 조작', title: '훅을 보고 정리하기',
      html:
        '<ol>' +
        '<li>Claude Code 입력란에 <b>/hooks</b>를 넣고 Enter 키를 누릅니다.' + cmd('/hooks') + '</li>' +
        '<li>UserPromptSubmit, PostToolUse, Stop 3개가 목록에 있는 것을 봅니다. <b>Esc</b> 키로 닫습니다.</li>' +
        '<li>연습용 ②와 ③을 뺍니다. settings.json 내용을 아래 것(①만)으로 통째로 바꾸고 저장합니다.' + settingsBox(['prompt']) + '</li>' +
        '<li>Claude Code를 다시 실행합니다(<b>/exit</b> → <b>claude</b>).</li>' +
        '<li>다시 <b>/hooks</b>를 보고 <b>UserPromptSubmit만</b> 남아 있으면 성공입니다.</li>' +
        '</ol>' +
        '<p class="note">"비밀번호"를 막는 훅①은 남겨 둡니다. 필요 없어지면 settings.json에서 "hooks" 부분을 지우면 빠집니다.</p>',
      help: [
        { q: '/hooks 화면에서 추가나 삭제가 안 돼요', a: '공식 안내에 따르면 /hooks는 <b>보기만</b> 하는 화면입니다. 추가와 삭제는 settings.json을 고쳐서 합니다.' },
        { q: 'tool-log.txt나 hook-test.txt는 어떻게 하나요?', a: '연습으로 만든 파일입니다. 남겨 두어도 지워도 괜찮습니다.' },
        HELP_RESTART
      ]
    },
    e18: {
      tag: '선택', title: '엑셀·워드·파워포인트에서 Claude 쓰기(Office가 있는 사람만)',
      html:
        '<p class="note"><b>이 화면은 "선택"입니다.</b> Microsoft Office가 없는 사람은 "다음"으로 건너뛰세요.</p>' +
        '<p>엑셀·워드·파워포인트 <b>안</b>에서 Claude에게 말을 걸 수 있는 "추가 기능(애드인)"이 있습니다. 공식 이름은 <b>Claude for Microsoft 365</b>입니다.</p>' +
        '<div class="card goal"><b>쓸 수 있는 조건(공식 안내)</b><br>·Claude 유료 요금제(Pro·Max·Team·Enterprise)<br>·' + os('Windows의 Microsoft 365(구독) Office', 'Mac의 새 Office(엑셀·파워포인트는 16.46 이상, 워드는 16.61 이상)') + ', 또는 브라우저의 Office(웹판)<br>·2016년판·2019년판 영구 구매 Office와 iPad는 쓸 수 없습니다</div>' +
        '<ol>' +
        '<li>브라우저에서 Microsoft 공식 페이지 <a href="https://marketplace.microsoft.com/en-us/product/office/WA200010725" target="_blank" rel="noopener noreferrer">Claude for Microsoft 365</a>를 엽니다.</li>' +
        '<li>"Get it now"(지금 받기)를 누릅니다. Microsoft 로그인은 <b>본인이 직접</b> 합니다.</li>' +
        '<li>엑셀을 열고 ' + os('"홈" 탭의 "추가 기능"', '위쪽 메뉴의 "도구"→"추가 기능"') + '에서 Claude를 엽니다.</li>' +
        '<li>Claude 계정으로 <b>본인이 직접</b> 로그인합니다.</li>' +
        '<li>새 시트에서 다음 부탁을 보내 봅니다. 표와 그래프가 생기면 성공입니다.' + box('1월부터 6월까지 가상의 가게 매출 표를 만들고, 합계와 막대그래프도 만들어 주세요.') + '</li>' +
        '</ol>' +
        '<p class="note">워드·파워포인트도 같은 애드인으로 쓸 수 있습니다(공식 안내). 워드라면 "이 글을 쉬운 말로 고쳐 줘", 파워포인트라면 "이 내용으로 슬라이드 3장을 만들어 줘"처럼 부탁할 수 있습니다.</p>' +
        '<p class="note warn">회사 컴퓨터에서는 애드인을 설치할 수 없을 때가 있습니다. 그때는 무리하지 말고 건너뛰세요.</p>',
      help: [
        { q: '애드인 버튼을 못 찾겠어요', a: 'Office 버전이나 표시 언어에 따라 위치와 이름이 다릅니다. 영어 표시에서는 ' + os('"Home"→"Add-ins"', '"Tools"→"Add-ins"') + '입니다. 못 찾으면 이 화면은 건너뛰어도 됩니다.' },
        { q: '무료 요금제예요', a: '공식 안내에 따르면 유료 요금제용입니다. 이 화면은 건너뛰세요.' },
        { q: '대화 기록이 사라졌어요', a: '공식 안내에 2026년 9월·10월 Windows Microsoft 365 업데이트 뒤 애드인의 대화 기록이 안 보일 수 있다고 적혀 있습니다. 중요한 내용은 파일로 남겨 둡시다.' }
      ]
    },
    e19: {
      tag: '퀴즈', title: '일 나누기와 자동 규칙 퀴즈',
      quiz: [
        { q: '서브에이전트의 가장 큰 특징은?', options: ['비밀번호를 기억해 준다', '자기 책상(컨텍스트)에서 일하고 결과만 돌려준다', '컴퓨터를 빠르게 해 준다'], answer: 1, explain: '읽은 자료는 서브에이전트의 책상에만 펼쳐집니다. 메인 책상은 깔끔하게 유지됩니다.' },
        { q: '서브에이전트를 많이 동시에 돌리면 사용량은?', options: ['그만큼 많이 쓴다', '반드시 0이 된다', '반으로 줄어든다'], answer: 0, explain: '공식 안내에 따르면 서브에이전트의 작업도 사용량에 포함됩니다.' },
        { q: '나만의 서브에이전트 파일은 어디에 두나요?', options: ['바탕화면', 'CLAUDE.md 안', 'agent1의 .claude/agents 폴더'], answer: 2, explain: '.claude/agents/이름.md에 두면 그 폴더에서 쓸 수 있습니다.' },
        { q: 'CLAUDE.md와 훅의 차이는?', options: ['CLAUDE.md는 "부탁", 훅은 "반드시 돌아가는 규칙"', '둘 다 같다', '훅은 AI가 기분에 따라 지킨다'], answer: 0, explain: 'CLAUDE.md는 대체로 지켜지는 부탁입니다. 훅은 정해진 때에 컴퓨터가 반드시 돌립니다.' },
        { q: '"부탁을 보냈을 때" 돌아가는 훅은?', options: ['Stop', 'UserPromptSubmit', 'PostToolUse'], answer: 1, explain: 'UserPromptSubmit는 부탁이 AI에게 가기 전에 돌아갑니다. 그래서 막을 수도 있습니다.' },
        { q: '훅을 넣을 때의 안전 규칙은?', options: ['인터넷에서 찾은 것은 뭐든 넣는다', 'AI에게 맡기고 안은 보지 않는다', '내용을 확인하고 뜻을 안 것만 넣는다'], answer: 2, explain: '훅은 내 권한으로 무엇이든 실행할 수 있습니다. 내용을 확인한 것만 씁니다.' },
        { q: '돌아가는 서브에이전트의 안을 보려면?', options: ['입력란 아래 목록에서 골라 Enter(끝났으면 /tasks)', '/clear를 넣는다', '컴퓨터를 다시 시작한다'], answer: 0, explain: '↓로 골라 Enter로 열고 Esc로 돌아옵니다. 막 끝났다면 /tasks에서 열 수 있습니다.' },
        { q: 'Stop 훅이 돌아가는 때는?', options: ['파일을 읽기 전', 'AI가 답을 끝냈을 때', '컴퓨터를 켰을 때'], answer: 1, explain: 'AI가 답을 끝냈을 때 돌아갑니다. stop_hook_active를 보고 한 번만 하게 하는 것이 중요합니다.' }
      ],
      html: '<p>배운 것을 퀴즈로 확인해 봅시다. 고르면 답이 나옵니다. 점수는 매기지 않습니다.</p>',
      help: [
        { q: '틀렸어요', a: '괜찮습니다. 앞 화면을 다시 보고 돌아와 보세요. 몇 번이든 다시 할 수 있습니다.' }
      ]
    },
    e20: {
      tag: '확인', title: '마지막 확인',
      checks: [
        'Explore 서브에이전트에게 조사를 맡겼다',
        '서브에이전트 3개를 동시에 돌렸다',
        '서브에이전트의 안(작업 기록)을 봤다(/tasks로 봐도 OK)',
        '나만의 서브에이전트(word-checker)를 만들어서 썼다',
        '훅의 도구(lesson5.py)를 만들었다',
        '"비밀번호"를 막는 훅이 돌아갔다',
        '연습용 훅②③을 돌려 보고 정리했다(/hooks로 확인했다)',
        'Office 안에서 Claude를 썼다(할 수 있었던 사람만)'
      ],
      required: 7,
      html:
        '<p>할 수 있었던 것에 체크를 넣으세요. <b>위의 7개</b>에 체크가 들어가면 "완료로 하기"를 누를 수 있습니다. 맨 아래 1개는 Office가 있는 사람만 합니다.</p>' +
        '<p class="note">연습으로 만든 tool-log.txt, hook-test.txt는 남겨 두어도 지워도 괜찮습니다. word-checker와 훅①은 앞으로도 쓸 수 있습니다.</p>',
      help: [
        { q: '못 한 부분이 있어요', a: '그 단계로 돌아가서 "곤란할 때"를 보세요. 몇 번이든 다시 할 수 있습니다.' }
      ]
    }
  };

  window.COURSE_KO.lessons.l5 = {
    title: '작업 나누기·자동 규칙·오피스',
    short: '서브에이전트에게 일을 나눠 맡기고, 나만의 담당을 만든다. 훅으로 "반드시 돌아가는 규칙"을 만든다. (선택) Office에서 Claude를 쓴다',
    devices: 'PC',
    doneCard: '<b>레슨5 완료입니다. 수고하셨습니다.</b><br>AI에게 일을 나눠 맡기고, 반드시 돌아가는 규칙을 만들 수 있게 되었습니다. 다음은 레슨6(준비 중)입니다.',
    steps: steps
  };
})();
