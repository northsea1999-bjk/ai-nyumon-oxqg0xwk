/* 레슨8 한국어판(한국인 학습자용). 부탁하는 글과 예시도 한국어로 쓴다.
   내용은 2026-10-31에 공식 안내로 확인(GitHub CLI 매뉴얼·설치 안내, GitHub Docs, git-scm.com, Apple TN2339,
   Claude Code: desktop·claude-code-on-the-web·cloud-environments·remote-control·permission-modes, markitdown). */
(function () {
  'use strict';
  var C = window.COURSE;
  var cmd = function (t) { return C.cmd(t, '복사'); };
  var box = function (t) { return C.copybox(t, null, '복사'); };
  var cmdOs = function (w, m) { return C.cmdOs(w, m, '복사'); };
  var os = C.os;

  var HELP_APPROVE = {
    q: 'AI가 "허락하시겠습니까?"라고 물어요',
    a: 'git이나 gh 명령어를 실행하기 전에 묻습니다. 내용을 읽고 <b>cafe-landing에 관한 일</b>이라면 <b>첫 번째 "Yes"</b>를 고릅니다. "다음부터 묻지 않기" 선택지는 고르지 않습니다. 모르겠으면 "아니요(No)"도 괜찮습니다.'
  };
  var HELP_ENG = { q: '화면 글자가 영어예요', a: '괜찮습니다. 표시가 영어여도 하는 일은 같습니다.' };
  var HELP_USER = {
    q: '"사용자 이름"을 모르겠어요',
    a: 'GitHub 오른쪽 위의 동그란 아이콘을 누르면 나옵니다. 또는 Claude Code에 "GitHub 사용자 이름을 알려 주세요"라고 물으면 gh로 찾아 줍니다.'
  };
  var HELP_INSTALL_AI = {
    q: 'AI가 무언가를 설치하려고 해요',
    a: '"아니요(No)"를 고르고 "설치는 제가 직접 하겠습니다"라고 전합니다. 이름과 이유를 물어본 뒤 직접 정합니다.'
  };

  var steps = {
    i1: {
      tag: '오늘의 목표', title: '레슨8에서 할 수 있게 되는 것',
      html:
        '<p class="note warn"><b>이 레슨은 Windows나 Mac 컴퓨터가 필요합니다.</b> 스마트폰은 마지막 화면에서 씁니다(없어도 진행할 수 있습니다). 화면 오른쪽 위의 "Windows/Mac" 버튼으로 내 컴퓨터 쪽을 고르세요.</p>' +
        '<p>만든 것을 <b>인터넷 보관함(GitHub)</b>에 넣어 두고, <b>누구나 볼 수 있는 페이지</b>로 만듭니다. 그다음 VS Code가 아닌 곳(<b>데스크톱 앱·브라우저·스마트폰</b>)에서도 Claude에게 이어서 부탁할 수 있게 합니다.</p>' +
        '<div class="card goal"><b>목표</b><br>① GitHub에 카페 페이지를 <b>저장</b>하고, 다른 폴더로 <b>꺼낼 수 있는</b>(되살릴 수 있는) 것을 확인한다<br>② GitHub Pages로 페이지를 <b>인터넷에 공개</b>한다<br>③ <b>데스크톱 앱</b>과 <b>클라우드 세션</b>으로 Claude에게 부탁한다<br>④ <b>스마트폰</b>에서 컴퓨터 대화를 이어 본다(할 수 있는 사람만)</div>' +
        '<div class="card"><dl class="facts">' +
        '<dt>걸리는 시간</dt><dd>약 2시간 30분(쉬어 가며 해도 됩니다. 중간에 "쉬어 가는 곳"이 2군데 있습니다)</dd>' +
        '<dt>쓰는 것</dt><dd>VS Code, agent1 폴더, Claude Code, Claude 유료 요금제, GitHub 계정(무료. 만드는 법은 뒤에서)</dd>' +
        '</dl></div>' +
        '<p class="note warn">오늘은 <b>인터넷에 공개</b>하는 작업이 있습니다. 공개하는 페이지에는 <b>이름·주소·전화번호·비밀번호 같은 개인정보를 넣지 않습니다</b>.</p>',
      help: [
        { q: '레슨7을 아직 못 끝냈어요', a: '이 레슨은 레슨7의 스킬이 없어도 진행할 수 있습니다. 데스크톱 앱 화면에서 스킬이 나오지 않을 뿐입니다.' },
        { q: '스마트폰이 없어요', a: '괜찮습니다. 스마트폰 화면은 읽기만 하고 넘어가세요.' }
      ]
    },
    i2: {
      tag: '알아 두기', title: '"GitHub"란 무엇일까?',
      html:
        '<p><b>GitHub</b>(깃허브)는 폴더를 인터넷에 넣어 둘 수 있는 <b>클라우드 공유 폴더</b> 같은 곳입니다. 구글 드라이브에 폴더를 올려 두는 것과 비슷합니다.</p>' +
        '<h2>GitHub로 할 수 있는 일</h2>' +
        '<ul class="parts">' +
        '<li><b>백업</b>폴더를 통째로 넣어 둔다<br><span>컴퓨터 폴더가 망가져도 GitHub에 남아 있다</span></li>' +
        '<li><b>불러오기</b>다른 컴퓨터에서도 같은 폴더를 꺼낼 수 있다<br><span>새 컴퓨터에서도 이어서 시작할 수 있다</span></li>' +
        '<li><b>되돌리기</b>예전 상태로 되돌릴 수 있다<br><span>넣을 때마다 기록이 남는다</span></li>' +
        '<li><b>고친 기록</b>"왜 고쳤는지" 메모가 남는다<br><span>나중에 AI도 그 메모를 읽고 흐름을 안다</span></li>' +
        '</ul>' +
        '<h2>외울 말은 4개뿐</h2>' +
        '<ul class="parts">' +
        '<li><b>저장소(리포지토리)</b>GitHub 안의 폴더 하나<br><span>줄여서 "레포"라고도 부른다</span></li>' +
        '<li><b>커밋</b>지금 상태를 메모와 함께 기록하는 것<br><span>게임의 "세이브" 같은 것</span></li>' +
        '<li><b>푸시</b>기록을 GitHub로 보내는 것<br><span>컴퓨터 → GitHub</span></li>' +
        '<li><b>클론</b>저장소를 통째로 꺼내 오는 것<br><span>GitHub → 컴퓨터</span></li>' +
        '</ul>' +
        '<p class="note">도구 이름은 <b>Git</b>(깃: 기록을 남기는 도구)과 <b>GitHub</b>(기록을 넣어 두는 곳)입니다. 비슷하지만 다른 것입니다.</p>',
      help: [
        { q: '전부 외워야 하나요?', a: '아니요. 작업은 AI가 도와줍니다. "커밋", "푸시"라는 말이 나오면 이 화면으로 돌아와서 보면 됩니다.' }
      ]
    },
    i3: {
      tag: 'PC에서 조작', title: 'GitHub 계정을 직접 만들기',
      html:
        '<p>계정은 <b>직접</b> 만듭니다. 비밀번호나 확인 코드는 <b>나만</b> 넣습니다. AI에게 알려 주지 않습니다.</p>' +
        '<ol>' +
        '<li>브라우저에서 <b>github.com/signup</b>을 엽니다.<br><a href="https://github.com/signup" target="_blank" rel="noopener">github.com/signup 열기</a></li>' +
        '<li>구글 계정을 쓴다면 <b>"Continue with Google"</b>을 누르고 평소 쓰는 계정을 고릅니다(공식 안내). 이메일 주소로 만들 수도 있습니다.</li>' +
        '<li>화면 안내를 따라갑니다. <b>메일로 온 확인 코드</b>를 그대로 넣습니다.</li>' +
        '<li>오른쪽 위에 동그란 아이콘이 나오면 완성입니다. 아이콘을 눌러 <b>사용자 이름</b>(영어 이름)을 메모합니다.</li>' +
        '</ol>' +
        '<p class="note">새 컴퓨터에서 로그인할 때도 메일로 확인 코드가 올 수 있습니다(공식 안내. 1시간 동안 유효).</p>' +
        '<p class="note warn">사용자 이름은 <b>공개하는 페이지의 주소</b>에도 쓰입니다. 실명을 쓰고 싶지 않은 사람은 실명이 아닌 이름으로 정하세요.</p>',
      help: [
        { q: '이미 계정이 있어요', a: '그 계정으로 로그인해 두세요. 다음으로 넘어가도 됩니다.' },
        { q: '퍼즐이나 "사람인가요?" 확인이 나와요', a: '화면 안내에 따라 직접 답하세요. AI에게는 시키지 않습니다.' },
        { q: '확인 코드가 안 와요', a: '스팸 메일함을 보세요. 학원이나 가게처럼 여럿이 쓰는 와이파이에서 잘 안 되면 스마트폰 핫스팟 등 다른 연결로 해 보세요.' },
        { q: '2단계 인증은 필요한가요?', a: '공식 안내에 따르면 만들 때 꼭 해야 하는 것은 아니지만 강하게 권장됩니다. 나중에 GitHub에서 "2단계 인증을 설정하세요"라는 메일이 오면 안내된 기한(45일) 안에 직접 설정합니다.' }
      ]
    },
    i4: {
      tag: 'PC에서 조작', title: 'Git과 GitHub CLI를 직접 설치하기',
      html:
        '<p>GitHub를 글자 명령으로 쓰는 도구 <b>GitHub CLI</b>(명령어는 <b>gh</b>)와 기록을 남기는 도구 <b>Git</b>을 <b>직접</b> 설치합니다. CLI 형식이라면 AI도 그대로 쓸 수 있습니다(레슨7).</p>' +
        '<div class="os-win">' +
        '<ol>' +
        '<li>Claude Code가 실행 중이면 입력란에 <b>/exit</b>를 넣고 Enter 키를 누릅니다.</li>' +
        '<li>VS Code 터미널(맨 앞이 "PS")에 아래 "복사"를 눌러 붙여 넣고 Enter 키를 누릅니다. <b>Git</b>이 설치됩니다(git-scm.com 공식 안내에 있는 방법. 가장 새 버전보다 조금 오래된 것일 수 있지만 이 레슨에서는 문제없습니다).' + box('winget install --id Git.Git -e --source winget') + '</li>' +
        '<li>끝나면 다음을 붙여 넣고 Enter 키를 누릅니다. <b>GitHub CLI</b>가 설치됩니다(GitHub CLI 공식 안내).' + box('winget install --id GitHub.cli --source winget') + '</li>' +
        '<li>각 명령어 도중에 "이 앱이 디바이스를 변경할 수 있도록 허용하시겠어요?"가 나오면 "예"를 누릅니다(두 번 나올 수 있습니다).</li>' +
        '<li><b>VS Code를 완전히 닫았다가 다시 엽니다</b>(새 도구를 터미널이 찾을 수 있게 하기 위해서입니다).</li>' +
        '</ol>' +
        '</div>' +
        '<div class="os-mac">' +
        '<ol>' +
        '<li>Claude Code가 실행 중이면 입력란에 <b>/exit</b>를 넣고 Return 키를 누릅니다.</li>' +
        '<li><b>Git</b>: VS Code 터미널에 아래 "복사"를 눌러 붙여 넣고 Return 키를 누릅니다.' + box('git --version') + '"git version 2.…"처럼 숫자가 나오면 이미 설치되어 있습니다(공식 안내에 따르면 대부분의 Mac에 처음부터 들어 있습니다).<br>설치되어 있지 않으면 설치 창이 바로 뜰 수 있습니다. 안 뜨면 다음을 붙여 넣습니다(Apple 공식 안내).' + box('xcode-select --install') + '창이 뜨면 "설치" → 사용권 계약을 읽고 "동의"를 누르고 끝날 때까지 기다립니다(몇 분 걸립니다). 끝나면 git --version으로 다시 확인합니다.</li>' +
        '<li><b>GitHub CLI</b>: 브라우저에서 GitHub CLI 공식 릴리스 페이지를 엽니다.<br><a href="https://github.com/cli/cli/releases/latest" target="_blank" rel="noopener">github.com/cli/cli/releases/latest 열기</a></li>' +
        '<li>아래쪽 "Assets"에서 이름이 <b>gh_(숫자)_macOS_universal.pkg</b>인 파일을 눌러 내려받습니다. 안 보이면 "Show all … assets"를 눌러 전부 펼칩니다.</li>' +
        '<li>내려받은 파일을 더블클릭하고 안내에 따라 설치합니다. "열 수 없습니다"가 나오면 아래 "곤란할 때"를 보세요.</li>' +
        '<li><b>VS Code를 ⌘(Command) 키와 Q 키로 완전히 종료했다가 다시 엽니다.</b></li>' +
        '</ol>' +
        '</div>' +
        '<p>마지막으로 설치됐는지 확인합니다. 터미널에 다음을 붙여 넣고 ' + os('Enter', 'Return') + ' 키를 누릅니다.</p>' + box('gh --version') + '<p>"gh version …"이 나오면 성공입니다.</p>',
      help: [
        { os: 'win', q: '"약관에 동의하십니까?"(Y/N)라고 물어요', a: 'winget을 처음 쓸 때 나올 수 있습니다. 읽어 본 뒤 Y를 넣고 Enter 키를 누릅니다.' },
        { os: 'win', q: '허락 창이 안 나와요', a: 'VS Code 뒤에 숨어 있을 수 있습니다. 화면 아래 작업 표시줄에서 깜빡이는 것을 눌러 보세요.' },
        { os: 'win', q: '"winget"이 "인식되지 않습니다"라고 나와요', a: 'Microsoft Store에서 "앱 설치 관리자"를 업데이트한 뒤 VS Code를 다시 열고 해 보세요.' },
        { os: 'win', q: 'gh나 git이 "인식되지 않습니다"라고 나와요', a: 'VS Code를 완전히 닫았다가 다시 여세요. 그래도 안 되면 컴퓨터를 다시 시작합니다.' },
        { os: 'win', q: 'Git을 설치하면 Claude Code가 달라지나요?', a: '공식 안내에 따르면 Git이 없어도 Claude Code는 움직이고, 설치해도 평소 중심은 지금처럼 PowerShell입니다. Bash(배시)라는 다른 방식도 쓸 수 있게 됩니다.' },
        { os: 'mac', q: '"열 수 없습니다", "열리지 않음" 같은 창이 나와요', a: '먼저 창의 글을 읽습니다.<br>· <b>"손상되었기 때문에 열 수 없습니다", "Mac에 손상을 입힙니다", "악성 코드가 포함되어 있습니다"</b> 같은 글이면 <b>열지 마세요</b>. "휴지통으로 이동"을 누르고 여기서 멈춘 뒤 상담하세요.<br>· <b>"Apple은 …을(를) 확인할 수 없습니다", "확인되지 않은 개발자"</b> 같은 글이고, 파일이 <b>github.com/cli/cli 릴리스 페이지에서 직접 내려받은 gh_(숫자)_macOS_universal.pkg</b>일 때만 예외로 열 수 있습니다. GitHub CLI 공식 안내에 Mac용 설치 파일은 "서명이 없다"고 적혀 있기 때문입니다. 창의 "완료"를 누르고("휴지통으로 이동"은 누르지 않습니다) Apple 메뉴 → "시스템 설정" → "개인정보 보호 및 보안"을 열어 아래로 스크롤한 뒤 그 파일 이름 옆의 "그래도 열기"를 누릅니다.<br>· 이 예외는 <b>이 파일만</b>입니다. 다른 앱이나 파일에는 쓰지 않습니다(레슨1처럼 열지 않고 멈춥니다). 불안하면 Homebrew를 쓰는 사람은 brew install gh로도 설치할 수 있습니다(아래 "곤란할 때").' },
        { os: 'mac', q: 'Mac 비밀번호를 물어요', a: 'Mac에 로그인할 때 쓰는 비밀번호를 직접 넣습니다. 넣어도 화면에 글자가 나오지 않을 수 있지만 그대로 넣으면 됩니다.' },
        { os: 'mac', q: 'Homebrew(홈브루)를 쓰고 있어요', a: 'Homebrew를 쓰는 사람은 brew install gh로도 설치할 수 있습니다(공식 안내).' },
        HELP_INSTALL_AI
      ]
    },
    i5: {
      tag: 'PC에서 조작', title: 'GitHub CLI로 로그인하기',
      html:
        '<p>로그인도 <b>직접</b> 합니다.</p>' +
        '<ol>' +
        '<li>VS Code에서 <b>agent1</b> 폴더를 열고 새 터미널을 엽니다.</li>' +
        '<li>아래 "복사"를 눌러 붙여 넣고 ' + os('Enter', 'Return') + ' 키를 누릅니다.' + box('gh auth login --hostname github.com --git-protocol https --web') + '</li>' +
        '<li>"Authenticate Git with your GitHub credentials?"(GitHub 로그인을 Git에서도 쓸까요?)가 나오면 <b>Y</b>를 넣고 ' + os('Enter', 'Return') + ' 키를 누릅니다(공식 안내).</li>' +
        '<li>"First copy your one-time code: <b>XXXX-XXXX</b>"처럼 <b>8자리 코드</b>가 나옵니다. 메모합니다(공식 안내에 따르면 15분이 지나면 쓸 수 없습니다).</li>' +
        '<li>"Press Enter to open…"이 나오면 ' + os('Enter', 'Return') + ' 키를 누릅니다. 브라우저가 열립니다. 안 열리면 <b>github.com/login/device</b>를 직접 엽니다.</li>' +
        '<li>브라우저에서 GitHub에 로그인하고 <b>8자리 코드</b>를 넣은 뒤 "Continue" → "Authorize github"를 누릅니다.</li>' +
        '<li>터미널로 돌아와서 "<b>Logged in as</b> (내 사용자 이름)"이 나오면 성공입니다.</li>' +
        '</ol>' +
        '<p>확인할 때는 다음을 붙여 넣습니다. "Logged in to github.com account (사용자 이름)"이 나오면 로그인된 것입니다.</p>' + box('gh auth status') +
        '<p class="note warn">코드를 넣는 화면은 <b>내가 직접 명령어를 실행했을 때만</b> 씁니다. 누가 "이 코드를 넣어 주세요"라고 부탁해도 넣지 않습니다.</p>',
      help: [
        { q: '코드 기한이 지났어요', a: 'gh auth login 명령어부터 다시 해 보세요. 새 코드가 나옵니다.' },
        { q: '"Token" 줄에 글자가 나와요', a: '중요한 "열쇠"라서 일부가 "*"로 가려져 있습니다. 전부 보이게 하는 방법은 쓰지 않습니다. 남에게도 보여 주지 않습니다.' },
        HELP_ENG
      ]
    },
    i6: {
      tag: 'PC에서 조작', title: '이메일 주소를 지키는 설정',
      html:
        '<p>커밋(기록)에는 <b>이름과 이메일 주소</b>가 붙습니다. 공개하면 누구나 볼 수 있습니다. 그래서 GitHub가 마련한 <b>공개용 주소(noreply)</b>를 씁니다. 이 화면에서는 GitHub 설정과 <b>주소를 알아보는 것</b>까지만 합니다. 컴퓨터 쪽 설정은 다음 화면에서 <b>cafe-landing 저장소에만</b> 합니다.</p>' +
        '<ol>' +
        '<li>브라우저에서 GitHub의 <b>Settings(설정) → Emails</b>를 엽니다.<br><a href="https://github.com/settings/emails" target="_blank" rel="noopener">github.com/settings/emails 열기</a></li>' +
        '<li><b>"Keep my email addresses private"</b>와 <b>"Block command line pushes that expose my email"</b>에 체크를 넣습니다(공식 안내).</li>' +
        '<li>VS Code 터미널에서 Claude Code를 실행합니다.' + cmd('claude') + '</li>' +
        '<li>화면 아래 줄이 <b>manual mode on</b>인지 봅니다. 다르면 Shift+Tab을 눌러 <b>manual</b>로 바꿉니다.</li>' +
        '<li>다음 글을 복사해서 보냅니다.' +
        box('gh api user로 제 GitHub ID와 사용자 이름을 알아보고, "ID+사용자이름@users.noreply.github.com" 형식의 공개용 이메일 주소를 알려 주세요. 아직 아무것도 설정하지 마세요.') +
        '</li>' +
        '<li>알려 준 주소가 <b>"@users.noreply.github.com"으로 끝나는지</b> 확인하고, 사용자 이름과 함께 <b>메모</b>합니다(다음 화면에서 씁니다). GitHub의 Emails 화면에도 같은 형식의 주소가 나와 있습니다.</li>' +
        '</ol>' +
        '<p class="note"><b>git config --global</b>(컴퓨터 전체 설정)은 쓰지 않습니다. 다른 저장소나 앞으로의 작업에도 영향을 주기 때문입니다.</p>',
      help: [
        HELP_APPROVE,
        { q: 'AI가 git config --global로 설정하려고 해요', a: '"아니요(No)"를 고르고 "아직 설정하지 마세요. 주소만 알려 주세요"라고 전합니다.' },
        HELP_USER
      ]
    },
    i7: {
      tag: 'PC에서 조작', title: '카페 페이지를 만들어 GitHub에 넣기',
      html:
        '<p>연습용으로 가상의 카페를 소개하는 페이지를 만들어 <b>비공개(private)</b> 저장소에 넣습니다. 아직 아무에게도 보이지 않습니다.</p>' +
        '<ol>' +
        '<li>다음 글을 복사해서 보냅니다. 페이지를 만들고 <b>이 폴더만</b>의 기록을 준비합니다.' +
        box('agent1 안에 cafe-landing이라는 폴더를 만들고, 그 안에 가상의 카페를 소개하는 한 페이지짜리 웹페이지(index.html)를 한국어로 만들어 주세요. 사진은 쓰지 말고 글자와 색만으로 만들어 주세요. 개인정보는 넣지 마세요. .DS_Store처럼 컴퓨터가 자동으로 만드는 파일은 .gitignore에 넣어서 넣지 않게 해 주세요. 다 되면 cafe-landing 폴더 안에서만 git init -b main을 해 주세요. agent1 폴더 자체는 저장소로 만들지 마세요. 아직 커밋은 하지 마세요.') +
        '</li>' +
        '<li>다음 글의 "사용자이름"과 "메모한주소"를 앞 화면에서 메모한 것으로 바꿔서 보냅니다.' +
        box('cafe-landing 저장소 안에서만 쓰는 설정으로(--global은 쓰지 말고) git config user.name을 "사용자이름"으로, git config user.email을 "메모한주소"로 설정해 주세요. 그다음 cafe-landing 안에서 git config user.name과 git config user.email을 실행해서 2가지를 보여 주세요.') +
        '</li>' +
        '<li>보여 준 이메일 주소가 <b>"@users.noreply.github.com"으로 끝나는지</b> 확인합니다.</li>' +
        '<li>확인했으면 다음 글을 복사해서 보냅니다.' +
        box('cafe-landing에서 메모를 붙여 첫 커밋을 해 주세요. 그다음 gh repo create로 cafe-landing이라는 이름의 비공개(private) 저장소를 만들어 푸시해 주세요.') +
        '</li>' +
        '<li>허락을 물으면 내용을 읽고 cafe-landing에 관한 일이면 "Yes"를 고릅니다.</li>' +
        '<li>마지막에 <b>github.com/(사용자 이름)/cafe-landing</b> 같은 주소를 알려 주면 완성입니다.</li>' +
        '</ol>' +
        '<p class="note">AI는 Git 기록(git add·git commit)을 한 뒤 gh repo create로 저장소를 만들고 푸시합니다. 먼저 커밋이 없으면 푸시할 수 없습니다.</p>' +
        '<p class="note"><b>-b main</b>은 기록을 두는 곳(브랜치)의 이름을 GitHub와 같은 <b>main</b>으로 하는 지정입니다. 이름과 이메일 설정은 <b>cafe-landing 안에서만</b> 효과가 있습니다. 다른 폴더에서 Git을 쓸 때는 그때 다시 설정합니다.</p>' +
        '<p class="note"><b>.gitignore</b>(깃이그노어)는 "이 파일은 넣지 않는다"는 목록 파일입니다. 컴퓨터가 자동으로 만드는 파일을 GitHub로 보내지 않게 합니다.</p>',
      help: [
        HELP_APPROVE,
        { q: 'agent1 폴더에서 git init을 하려고 해요', a: '"아니요(No)"를 고르고 "cafe-landing 안에서만 해 주세요"라고 전합니다. agent1에는 CLAUDE.md나 스킬처럼 넣지 않아도 되는 것도 들어 있기 때문입니다.' },
        { q: 'git config --global을 쓰려고 해요', a: '"아니요(No)"를 고르고 "--global은 쓰지 말고 cafe-landing 안에만 설정해 주세요"라고 전합니다.' },
        { q: '평소 쓰는 이메일 주소가 나왔어요', a: '"user.email을 메모한 noreply 주소로 고쳐 주세요"라고 부탁합니다. 앞 화면에서 두 번째 체크를 넣었다면 평소 주소로는 푸시가 막힙니다(공식 안내).' },
        { q: '"-b"를 모른다는 오류가 나왔어요', a: 'Git이 오래된 버전일 때 나옵니다. "git init 다음에 브랜치 이름을 main으로 해 주세요"라고 부탁합니다.' },
        { q: '"public(공개)"으로 만들려고 해요', a: '"아니요(No)"를 고르고 "private(비공개)으로 만들어 주세요"라고 전합니다. 공개는 나중에 내용을 확인한 뒤에 합니다.' },
        { q: '페이지를 브라우저로 보고 싶어요', a: 'VS Code 왼쪽 목록에서 cafe-landing의 index.html을 ' + os('오른쪽 클릭', '오른쪽 클릭(또는 Control 키를 누른 채 클릭)') + '하고 ' + os('"파일 탐색기에 표시"', '"Finder에서 표시"') + '를 고릅니다. 나온 index.html을 더블클릭합니다.' }
      ]
    },
    i8: {
      tag: 'PC에서 조작', title: '저장소 화면을 보고 설명서 더하기',
      html:
        '<ol>' +
        '<li>브라우저에서 <b>github.com/(사용자 이름)/cafe-landing</b>을 엽니다.</li>' +
        '<li>다음 3가지를 확인합니다.<br>· 이름 옆에 <b>Private</b>(비공개)이 나온다<br>· <b>index.html</b>이 들어 있다<br>· 파일 옆에 커밋할 때의 <b>메모</b>가 나온다</li>' +
        '<li>Claude Code로 돌아와서 다음 글을 복사해서 보냅니다.' +
        box('cafe-landing 폴더에 README.md를 만들어 이 폴더가 무엇인지 한국어로 짧게 설명해 주세요. 다 되면 커밋하고 푸시해 주세요.') +
        '</li>' +
        '<li>브라우저 페이지를 다시 읽어 들입니다(' + os('F5 키', '⌘(Command) 키와 R 키') + '). 파일 아래에 <b>README 설명</b>이 나오면 성공입니다.</li>' +
        '<li>파일 위의 <b>시계 표시(Commits)</b>를 누르면 지금까지의 커밋 기록을 메모와 함께 볼 수 있습니다.</li>' +
        '</ol>' +
        '<p class="note">README(리드미)는 "먼저 읽어 주세요"라는 설명서입니다. 저장소 페이지에 자동으로 표시됩니다.</p>',
      help: [
        HELP_APPROVE,
        { q: '페이지가 "404"가 돼요', a: 'GitHub에 로그인되어 있는지 확인하세요. 비공개 저장소는 내가 로그인했을 때만 볼 수 있습니다.' },
        HELP_USER
      ]
    },
    i9: {
      tag: 'PC에서 조작', title: 'GitHub에서 다른 폴더로 꺼내서 확인하기',
      html:
        '<p>컴퓨터의 폴더가 없어져도 GitHub에서 <b>되살릴 수 있는</b> 것을 시험합니다. 원래 cafe-landing은 <b>그대로 두고</b>, GitHub에서 <b>다른 이름의 폴더</b>로 꺼냅니다(클론).</p>' +
        '<ol>' +
        '<li>Claude Code에서 <b>/clear</b>를 넣어 대화를 깨끗이 비웁니다(AI가 이전 대화를 기억하지 않는 상태에서 시험하기 위해서입니다).</li>' +
        '<li>다음 글의 "사용자이름"을 내 것으로 바꿔서 보냅니다.' +
        box('https://github.com/사용자이름/cafe-landing 저장소를 agent1 안에 cafe-landing-copy라는 이름의 폴더로 클론해 주세요. 원래 cafe-landing 폴더는 건드리지 마세요.') +
        '</li>' +
        '<li>왼쪽 목록에 <b>cafe-landing-copy</b>가 생기고 안에 <b>index.html</b>과 <b>README.md</b>가 있으면 성공입니다. index.html을 ' + os('오른쪽 클릭', '오른쪽 클릭(또는 Control 키를 누른 채 클릭)') + '하고 ' + os('"파일 탐색기에 표시"', '"Finder에서 표시"') + '를 골라 더블클릭으로 열면 같은 카페 페이지가 나옵니다.</li>' +
        '<li>확인했으면 <b>cafe-landing-copy</b>는 필요 없으면 직접 지워도 됩니다(' + os('오른쪽 클릭', '오른쪽 클릭(또는 Control 키를 누른 채 클릭)') + ' → "삭제" → "휴지통으로 이동"). <b>원래 cafe-landing은 지우지 않습니다.</b> 뒤에서도 씁니다.</li>' +
        '</ol>' +
        '<p class="note">새 컴퓨터에서도 같은 부탁으로 이어서 시작할 수 있습니다.</p>' +
        '<div class="card goal"><b>쉬어 가는 곳 ①: 저장과 꺼내기(복원)까지 완료</b><br>여기서 쉬어도 괜찮습니다. 다음에 이 교재를 열면 목차의 "이어서 하기" 버튼으로 여기부터 이어서 할 수 있습니다. 다음은 페이지 공개입니다.</div>',
      help: [
        HELP_APPROVE,
        { q: '원래 cafe-landing으로 꺼내려고 해요', a: '"아니요(No)"를 고르고 "cafe-landing-copy라는 새 폴더로 클론해 주세요"라고 전합니다.' },
        { q: '클론할 때 오류가 났어요', a: '주소의 사용자 이름이 맞는지 확인하세요. "gh auth status로 로그인을 확인한 뒤 다시 클론해 주세요"라고 부탁하는 것도 좋은 방법입니다.' },
        HELP_USER
      ]
    },
    i10: {
      tag: 'PC에서 조작', title: '내용을 확인하고 나서 공개하기',
      html:
        '<p><b>GitHub Pages</b>(깃허브 페이지스)를 쓰면 저장소의 페이지를 인터넷에 공개할 수 있습니다. 공식 안내에 따르면 무료 요금제에서는 <b>저장소를 공개(public)로 해야</b> 합니다. 공개하면 <b>파일도 전부 누구나 볼 수 있습니다</b>.</p>' +
        '<div class="card goal"><b>공개하기 전에 직접 확인하기</b><br>□ 파일은 index.html·README.md·.gitignore(넣지 않을 파일 목록)뿐<br>□ 이름·주소·전화번호·이메일 주소가 들어 있지 않다<br>□ 비밀번호나 "열쇠"가 들어 있지 않다<br>□ 공개해도 부끄럽지 않은 내용<br>□ <b>예전 커밋(Commits)</b>에도 개인정보가 들어간 적이 없다</div>' +
        '<p class="note warn">공개하면 <b>지금 파일뿐 아니라 예전 커밋 기록도 전부</b> 보입니다. 나중에 고쳐도 예전 기록에는 남습니다. 개인정보가 한 번이라도 들어갔다면 공개하지 말고 저장소를 새로 만드세요.</p>' +
        '<ol>' +
        '<li>저장소 페이지와 시계 표시(Commits)의 기록에서 위의 5가지를 확인합니다. 마음에 걸리는 곳이 있으면 먼저 AI에게 고치게 합니다.</li>' +
        '<li>괜찮으면 다음 글을 복사해서 보냅니다.' +
        box('gh를 써서 cafe-landing 저장소를 공개(public)로 바꾸고 GitHub Pages로 공개해 주세요. 명령어에는 저장소 이름을 "사용자이름/cafe-landing" 형식으로 넣어 주세요. 공개하는 곳은 main 브랜치의 맨 위(/)로 해 주세요. 공개 작업이 끝났는지 확인한 뒤 공개 주소를 알려 주세요.') +
        '</li>' +
        '<li>"공개로 바꾸는" 명령어의 허락을 물으면 <b>저장소 이름이 cafe-landing인지</b> 확인하고 "Yes"를 고릅니다.</li>' +
        '</ol>' +
        '<p class="note">"공개로 바꾸기", "Pages 만들기"처럼 밖에서 보이게 되는 작업은 <b>직접 확인한 뒤에</b> 허락합니다. 앞으로도 같습니다.</p>',
      help: [
        { q: '다른 저장소 이름이 나왔어요', a: '"아니요(No)"를 고르고 "cafe-landing만 공개로 해 주세요"라고 전합니다.' },
        { q: '역시 공개를 그만두고 싶어요', a: '저장소 페이지의 "Settings" → "Pages"에서 "Your site is live at" 옆의 "…" → "Unpublish site"를 누르면 공개를 그만둘 수 있습니다. 저장소 자체를 비공개로 되돌리려면 "Settings" 맨 아래의 "Change visibility"를 씁니다. 공식 안내에 따르면 무료 요금제에서 비공개로 되돌리면 페이지 공개도 자동으로 멈춥니다.' },
        HELP_ENG
      ]
    },
    i11: {
      tag: 'PC에서 조작', title: '공개된 페이지 보기',
      html:
        '<ol>' +
        '<li>AI가 알려 준 주소를 브라우저로 엽니다.</li>' +
        '<li>카페 페이지가 나오면 성공입니다. <b>이 주소를 아는 사람이라면 누구나, 어디서든</b> 볼 수 있습니다.</li>' +
        '</ol>' +
        '<h2>주소의 구조</h2>' +
        '<p><code>https://<b>사용자이름</b>.github.io/<b>cafe-landing</b>/</code></p>' +
        '<ul class="parts">' +
        '<li><b>사용자이름.github.io</b>앞쪽 절반<br><span>내 GitHub 사용자 이름</span></li>' +
        '<li><b>/cafe-landing/</b>뒤쪽 절반<br><span>저장소 이름</span></li>' +
        '</ul>' +
        '<p class="note">공식 안내에 따르면 공개될 때까지 <b>최대 10분</b> 걸릴 수 있습니다.</p>',
      help: [
        { q: '"404"가 나와요', a: '몇 분 기다린 뒤 다시 읽어 들입니다. 10분이 지나도 안 되면 "GitHub Pages 상태를 확인해 주세요"라고 AI에게 부탁합니다.' },
        { q: '예전 페이지 그대로예요', a: '브라우저가 예전 페이지를 기억하고 있을 수 있습니다. ' + os('Ctrl 키와 F5 키', '⌘(Command) 키와 Shift 키와 R 키') + '로 다시 읽어 들이세요.' }
      ]
    },
    i12: {
      tag: 'PC에서 조작', title: '만들기 전에 먼저 찾기',
      html:
        '<p>GitHub에는 세계 여러 사람이 만든 도구가 아주 많습니다. 무언가를 만들고 싶어지면 <b>먼저 "이미 있지 않은지" 찾는</b> 것이 지름길입니다(레슨7의 라이브러리와 같은 생각).</p>' +
        '<ol>' +
        '<li>브라우저에서 <b>GitHub 트렌딩</b>(그날 인기 있는 저장소)을 열고 둘러봅니다. 위쪽 "Date range"로 기간을, "Language"로 언어를 좁힐 수 있습니다.<br><a href="https://github.com/trending" target="_blank" rel="noopener">github.com/trending 열기</a></li>' +
        '<li>마음에 드는 것이 있으면 <b>Star(☆)</b>를 눌러 봅니다. 공식 안내에 따르면 Star는 "나중에 찾기 쉽게 하는" 책갈피이고, 만든 사람에게 "고마워요"를 전하는 뜻도 됩니다. 누른 것은 github.com/stars에서 볼 수 있습니다.</li>' +
        '<li>Claude Code로 돌아와서 다음 글을 복사해서 보냅니다.' +
        box('PDF 자료를 핵심만 정리한 요약 노트로 바꾸는 도구를 만들고 싶습니다. 만들기 전에 쓸 수 있는 라이브러리나 오픈소스가 이미 있는지 웹과 GitHub에서 조사해 주세요. 설치는 하지 마세요. 후보 3개를 만든 사람·스타 수·최근 업데이트·할 수 있는 일과 함께 표로 알려 주세요.') +
        '</li>' +
        '<li>조사하기 위한 허락(WebSearch·gh search 등)을 물으면 내용을 읽고 "Yes"를 고릅니다.</li>' +
        '<li>후보가 나오면 설치하기 전에 <b>설명서(README)를 읽게 합니다</b>. 다음 글을 복사해서 보냅니다(아무것도 설치하지 않습니다).' +
        box('gh repo view microsoft/markitdown으로 README를 읽고 어떤 도구인지, 어떻게 쓰는지, 주의할 점은 무엇인지 쉽게 설명해 주세요. 설치는 하지 마세요.') +
        '</li>' +
        '</ol>' +
        '<p class="note">남의 공개 저장소는 <b>읽으며 배우는</b> 데도 쓸 수 있습니다. 마음에 드는 저장소가 있으면 같은 방법으로 README 설명을 부탁해 보세요.</p>' +
        '<div class="card goal"><b>남이 만든 것을 설치하기 전에 볼 곳</b><br>· <b>누가 만들었는지</b>(회사·잘 알려진 사람인지)<br>· <b>스타 수</b>와 <b>최근에도 고쳐지고 있는지</b><br>· <b>README</b>에 사용법과 할 수 있는 일이 적혀 있는지<br>· 수상하면 <b>설치하지 않는다</b></div>',
      help: [
        { q: '트렌딩이 온통 영어예요', a: '괜찮습니다. 보기만 해도 충분합니다. 모르는 것은 AI에게 "이 저장소는 무엇인가요?"라고 물을 수 있습니다.' },
        HELP_INSTALL_AI
      ]
    },
    i13: {
      tag: '할 수 있는 사람만', title: '찾은 도구를 써 보기(markitdown)',
      html:
        '<p>앞 화면에서 Microsoft가 만든 <b>markitdown</b>(마크잇다운)이 나왔을지도 모릅니다. PDF·워드·엑셀·파워포인트 등을 AI가 읽기 쉬운 글자(Markdown)로 바꾸는 도구입니다. <b>해 보고 싶은 사람만</b> 시험합니다.</p>' +
        '<ol>' +
        '<li>연습용 파일을 하나 준비해서 agent1에 넣습니다. <b>개인정보가 없고 글자가 있는</b> PDF나 워드로 합니다(예: 내가 만든 메모, 공개된 안내문).</li>' +
        '<li>Claude Code에 <b>/exit</b>를 넣어 끝내고 Python 버전을 확인합니다.' + cmdOs('python --version', 'python3 --version') + '<b>3.10~3.14</b>일 때만 계속합니다. 그 밖(3.15 이상, 3.9 이하)이면 markitdown이 지원하지 않으므로 <b>이 화면은 건너뜁니다</b>(공식 안내에 따르면 3.10~3.14에서 쓸 수 있습니다).</li>' +
        '<li>3.10~3.14라면 다음을 붙여 넣고 ' + os('Enter', 'Return') + ' 키를 누릅니다(공식 안내의 이름 그대로 직접 설치합니다).' + cmdOs('python -m pip install "markitdown[all]"', 'python3 -m pip install "markitdown[all]"') + '</li>' +
        '<li><b>claude -c</b>로 Claude Code로 돌아갑니다.' + cmd('claude -c') + '</li>' +
        '<li>다음 글의 "파일이름"을 바꿔서 보냅니다.' +
        box('markitdown은 이미 설치해 두었습니다. markitdown을 써서 파일이름 을 Markdown으로 바꿔 주세요. 그다음 중요한 부분만 요약 노트(요약.md)로 만들어 주세요.') +
        '</li>' +
        '</ol>' +
        '<p class="note">레슨2에서 가장 새로운 Python을 설치한 사람은 3.15 이상일 수 있습니다. 그때는 건너뛰어도 됩니다.</p>' +
        '<div class="card goal"><b>쉬어 가는 곳 ②: 공개 주소 확인까지 완료</b><br>이 화면을 건너뛴 사람도 여기서 쉬어도 괜찮습니다. 목차의 "이어서 하기" 버튼으로 다시 시작할 수 있습니다. 다음은 Claude 데스크톱 앱입니다.</div>',
      help: [
        { q: '설치할 때 오류가 났어요', a: 'Python 버전이 맞지 않을 수 있습니다. 이 화면은 할 수 있는 사람만 하는 것이므로 건너뛰어도 됩니다.' },
        { q: '"markitdown을 찾을 수 없다"고 해요', a: '"python -m으로 markitdown을 실행해 주세요"라고 부탁합니다.' },
        { q: '내용이 거의 비어 있었어요', a: '사진만 있는 PDF(예: 레슨7에서 만든 카드 PDF)는 글자를 꺼내지 못할 수 있습니다. 글자가 있는 파일로 시험하세요.' },
        HELP_APPROVE
      ]
    },
    i14: {
      tag: 'PC에서 조작', title: 'Claude 데스크톱 앱 설치하기',
      html:
        '<p>VS Code 말고 <b>Claude 데스크톱 앱</b>에서도 Claude Code를 쓸 수 있습니다. 버튼으로 조작할 수 있어서 간단한 작업에 편리합니다.</p>' +
        '<ul class="parts">' +
        '<li><b>브라우저의 claude.ai(채팅)</b>이야기만 한다<br><span>안전을 위해 내 컴퓨터 폴더에는 들어가지 못한다</span></li>' +
        '<li><b>데스크톱 앱의 "Code"</b>버튼으로 조작<br><span>내 폴더를 골라 작업을 맡길 수 있다</span></li>' +
        '<li><b>VS Code+Claude Code(CLI)</b>글자로 조작<br><span>파일을 보면서 작업을 맡길 수 있다</span></li>' +
        '</ul>' +
        '<ol>' +
        '<li>브라우저에서 <b>claude.com/download</b>를 엽니다.<br><a href="https://claude.com/download" target="_blank" rel="noopener">claude.com/download 열기</a></li>' +
        '<li>' + os('<b>Windows</b> 다운로드를 누릅니다. 내려받은 파일을 더블클릭하고 안내에 따라 설치합니다.', '<b>macOS</b> 다운로드를 누릅니다. 내려받은 파일(.dmg)을 열고 Claude 아이콘을 "응용 프로그램" 폴더에 넣습니다.') + '</li>' +
        '<li>Claude 앱을 열고 <b>Claude Code에서 쓰는 것과 같은 계정</b>으로 로그인합니다(비밀번호 등은 직접 넣습니다).</li>' +
        '<li>브라우저에서 로그인한 뒤 "Claude를 열까요?" 같은 창이 나오면 <b>열기</b>를 누릅니다. 안 나오면 페이지에 있는 같은 이름의 버튼을 누릅니다.</li>' +
        '<li>앱 왼쪽 줄의 맨 위쪽에 있는 <b>"Code"</b>(코드)를 누릅니다(공식 안내). 표시만 보이면 마우스를 올리면 이름이 나옵니다. Claude Code 화면이 됩니다.</li>' +
        '</ol>' +
        '<p class="note">공식 안내에 따르면 Code 화면은 Claude 유료 요금제(Pro·Max 등)에서 쓸 수 있습니다. Claude Code를 따로 설치할 필요는 없습니다.</p>',
      help: [
        { q: '이미 Claude 앱이 있어요', a: '새 버전으로 업데이트한 뒤 그대로 쓰세요.' },
        { q: '쿠키(Cookie) 확인이 나와요', a: '고를 수 있으면 "필요한 것만" 쪽을 고릅니다.' },
        { os: 'win', q: '어느 Windows를 고르면 되나요?', a: '보통은 "Windows"(x64)입니다. "ARM64"는 일부 얇은 노트북용입니다.' },
        { os: 'mac', q: '"인터넷에서 다운로드한 앱입니다"라고 나와요', a: 'claude.com에서 내려받은 것이라면 "열기"를 누릅니다.' },
        { os: 'mac', q: 'Intel Mac에서도 쓸 수 있나요?', a: '공식 안내에 따르면 Mac판은 Intel과 Apple 실리콘 어느 쪽에서도 쓸 수 있습니다.' },
        HELP_ENG
      ]
    },
    i15: {
      tag: 'PC에서 조작', title: '폴더를 연결하고 모드 고르기',
      html:
        '<ol>' +
        '<li>Code 화면 입력란 근처에서 먼저 장소를 고르는 곳에서 <b>Local</b>(로컬=내 컴퓨터)을 고릅니다.</li>' +
        '<li>그 옆의 폴더를 고르는 곳("폴더 없음"처럼 나와 있습니다)을 누르고 <b>"Open folder…"</b>(폴더 열기)를 고릅니다(공식 안내).</li>' +
        '<li><b>agent1</b> 폴더를 골라서 엽니다. "이 폴더를 신뢰할지" 물으면 agent1이라면 "신뢰"를 고릅니다.</li>' +
        '<li>입력란 근처의 <b>모드</b> 버튼을 누르고 <b>Manual</b>(수동. 바꾸기 전에 매번 묻는다)을 고릅니다. VS Code의 "manual mode"와 같습니다.</li>' +
        '</ol>' +
        '<h2>모드는 5가지(공식 안내)</h2>' +
        '<ul class="parts">' +
        '<li><b>Manual</b>바꾸기 전에 매번 묻는다<br><span>이 교재는 이것을 쓴다</span></li>' +
        '<li><b>Accept edits</b>파일 고치기는 묻지 않고 한다<br><span>익숙한 사람용</span></li>' +
        '<li><b>Plan</b>바꾸기 전에 계획을 세워 보여 준다<br><span>큰 작업 전에 편리</span></li>' +
        '<li><b>Auto</b>Claude가 위험하지 않은지 판단해서 진행한다<br><span>위험한 것은 막는다</span></li>' +
        '<li><b>Bypass permissions</b>전혀 묻지 않는다<br><span>설정에서 허락하지 않으면 나오지 않는다. <b>이 교재에서는 쓰지 않는다</b></span></li>' +
        '</ul>' +
        '<p class="note">모델(AI 종류)을 고르는 버튼도 있습니다. 체크 표시가 붙은 것이 지금 쓰는 모델입니다. 이 교재에서는 처음 그대로 두면 됩니다.</p>',
      help: [
        { q: '화면의 말이 조금 달라요', a: '앱이 한국어로 표시되어 있으면 "수동"처럼 한국어 이름으로 나올 수 있습니다. 버전에 따라서도 이름이 조금 다릅니다(예전 버전에서는 "Ask permissions" 등이었습니다). "바꾸기 전에 묻는" 것을 고르세요.' },
        { q: '"Bypass permissions"를 써도 되나요?', a: '이 교재에서는 쓰지 않습니다. 공식 안내에서도 설정에서 특별히 허락하지 않으면 나오지 않는 것입니다.' }
      ]
    },
    i16: {
      tag: 'PC에서 조작', title: '데스크톱 앱으로 부탁해 보기',
      html:
        '<ol>' +
        '<li>입력란에 다음 글을 복사해서 보냅니다.' + box('당신은 누구인가요? 지금 폴더의 내용을 간단히 설명해 주세요.') + '</li>' +
        '<li>답을 읽습니다. VS Code에서처럼 agent1의 내용을 설명해 줍니다.</li>' +
        '<li>입력란에 <b>/</b>(슬래시)를 넣습니다. 쓸 수 있는 명령어 목록이 나옵니다.</li>' +
        '<li>이어서 <b>card</b>를 넣어 <b>/card</b>로 만듭니다. 레슨7에서 만든 <b>cardnews</b>가 나오면 스킬도 그대로 쓸 수 있다는 것을 알 수 있습니다(공식 안내).</li>' +
        '</ol>' +
        '<p class="note">입력란의 "+"에서 파일이나 사진을 붙여서 부탁하거나, 커넥터(레슨6)나 플러그인(레슨7)을 볼 수 있습니다.</p>' +
        '<h2>어느 쪽을 쓸까?</h2>' +
        '<ul class="parts">' +
        '<li><b>데스크톱 앱</b>버튼으로 알기 쉽다. 왼쪽 줄은 <b>대화 목록</b>이라 파일 목록은 나오지 않는다<br><span>한 번에 끝나는 간단한 작업에 맞다</span></li>' +
        '<li><b>VS Code</b>파일을 보면서 작업할 수 있다<br><span>파일이 늘어나는 긴 작업에 맞다</span></li>' +
        '</ul>',
      help: [
        { q: '/card에서 cardnews가 안 나와요', a: '레슨7을 하지 않은 사람은 나오지 않습니다. 그래도 괜찮습니다.' },
        { q: '허락을 물어요', a: 'VS Code 때와 같습니다. 내용을 읽고 agent1 안의 일이라면 한 번만 허락합니다.' }
      ]
    },
    i17: {
      tag: 'PC에서 조작', title: '"클라우드 세션"과 GitHub 연결하기',
      html:
        '<p><b>클라우드 세션</b>은 Claude가 마련한 <b>인터넷 속의 컴퓨터</b>에서 작업을 맡기는 방식입니다. 공식 안내에 따르면 <b>브라우저를 닫아도, 컴퓨터를 꺼도 작업은 계속됩니다</b>.</p>' +
        '<ul class="parts">' +
        '<li><b>할 수 있다</b>GitHub 저장소 작업<br><span>긴 작업을 맡겨 둘 수 있다</span></li>' +
        '<li><b>할 수 없다</b>내 컴퓨터의 폴더<br><span>agent1 안은 보이지 않는다</span></li>' +
        '</ul>' +
        '<ol>' +
        '<li>브라우저에서 <b>claude.ai/code</b>를 열고 로그인합니다.<br><a href="https://claude.ai/code" target="_blank" rel="noopener">claude.ai/code 열기</a></li>' +
        '<li>GitHub와 연결하는 안내가 나오면 그에 따라 <b>GitHub로 로그인하고 허락</b>합니다(공식 안내). 입력란 근처의 "Default"는 작업하는 환경의 이름입니다. 그대로 두면 됩니다.</li>' +
        '<li><b>Claude GitHub App</b>을 설치하는 화면이 되면 주소가 <b>github.com/apps/claude</b>이고 만든 곳이 <b>anthropics</b>(Anthropic)인지 확인합니다. 이 화면이 안 나오면("Skip"으로 넘어갔을 때 등) 다음 링크를 직접 엽니다.<br><a href="https://github.com/apps/claude/installations/new" target="_blank" rel="noopener">github.com/apps/claude/installations/new 열기</a></li>' +
        '<li>저장소를 고르는 곳에서 <b>"Only select repositories"</b>(고른 저장소만)를 고르고 <b>cafe-landing</b>만 골라 "Install"을 누릅니다.</li>' +
        '</ol>' +
        '<p class="note warn">연결하는 범위는 <b>쓰는 저장소만</b>으로 합니다. "All repositories"(전부)는 고르지 않습니다.</p>',
      help: [
        { q: 'GitHub와 연결하는 안내가 안 나와요', a: '저장소를 고르는 곳을 누르면 연결 안내가 나올 수 있습니다.' },
        { q: '나중에 연결을 끊고 싶어요', a: '이 레슨의 "뒷정리" 화면을 보세요.' },
        { q: '무료 요금제예요', a: '공식 안내에 따르면 클라우드 세션은 유료 요금제(Pro·Max 등)에서 쓸 수 있습니다.' },
        HELP_ENG
      ]
    },
    i18: {
      tag: 'PC에서 조작', title: '클라우드에서 고치게 하기',
      html:
        '<ol>' +
        '<li>claude.ai/code 입력란 근처에서 저장소를 고르는 곳을 누르고 <b>cafe-landing</b>을 고릅니다.</li>' +
        '<li>다음 글을 복사해서 보냅니다.' + box('이 저장소의 내용을 간단히 설명해 주세요.') + '</li>' +
        '<li>설명이 나오면 다음 글을 복사해서 보냅니다.' +
        box('페이지 맨 위에 "클라우드에서 고쳤습니다"라는 한 줄을 넣어 주세요. 끝나면 어디를 바꿨는지 보여 주세요. 머지는 하지 마세요. main 브랜치에는 직접 푸시하지 말고 새 브랜치에서 작업해 주세요.') +
        '</li>' +
        '<li>끝나면 바뀐 곳(<b>차이</b>)을 볼 수 있습니다. 바뀐 파일이나 숫자(+1 등)를 누르면 열립니다. 빨간 줄은 지운 곳, 초록 줄은 더한 곳입니다.</li>' +
        '<li>괜찮으면 <b>"Create PR"</b>(변경 제안 만들기)을 누릅니다(공식 안내).</li>' +
        '</ol>' +
        '<p class="note"><b>PR</b>(풀 리퀘스트)은 "이렇게 바꾸고 싶습니다"라는 <b>제안</b>입니다. 아직 페이지는 바뀌지 않았습니다. <b>합칠지(머지) 말지는 내가 정합니다</b>.</p>' +
        '<p class="note">클라우드 세션의 모드는 Auto·Accept edits·Plan 중에서 고를 수 있습니다(공식 안내). 인터넷 속의 다른 컴퓨터에서 움직이므로 내 컴퓨터의 파일은 바뀌지 않습니다.</p>',
      help: [
        { q: 'cafe-landing이 안 나와요', a: '앞 화면에서 Claude GitHub App에 cafe-landing을 골랐는지 확인하세요.' },
        { q: '"Create PR"을 누른 뒤 GitHub 화면이 열렸을 때는?', a: '보통은 그대로 제안(PR)이 만들어집니다. GitHub 화면이 열렸을 때는 그 화면에서 초록색 "Create pull request"를 누르면 제안이 만들어집니다. 이미 제안(PR)이 만들어져 있다면 그대로 다음 화면으로 넘어갑니다.' },
        { q: 'main에 직접 푸시했다고 해요', a: '공개 페이지가 PR 없이 바뀌었을 수 있습니다. 먼저 공개 페이지를 보고 문제가 없는지 확인합니다. 그다음 PR 연습을 위해 작은 변경을 하나 더 부탁합니다.' + box('이번에는 main에 직접 푸시하지 마세요. 새 브랜치를 만들어 거기서 페이지 맨 아래에 "PR 연습"이라는 한 줄을 더해 주세요. 머지는 하지 마세요. 끝나면 바꾼 곳을 보여 주세요.') + ' 그다음 이 화면의 4~5번(차이를 보고 "Create PR")을 하고, 다음 화면에서 직접 머지합니다.' },
        { q: '브라우저를 닫아 버렸어요', a: '괜찮습니다. 공식 안내에 따르면 작업은 계속되고 있습니다. claude.ai/code를 다시 열면 왼쪽 목록에 남아 있습니다.' },
        { q: '사용량이 드나요?', a: '네. 공식 안내에 따르면 평소 Claude와 같은 요금제 사용량에서 쓰입니다.' }
      ]
    },
    i19: {
      tag: 'PC에서 조작', title: '제안을 확인하고 직접 머지하기',
      html:
        '<ol>' +
        '<li>브라우저에서 <b>github.com/(사용자 이름)/cafe-landing</b>을 열고 위쪽의 <b>"Pull requests"</b>를 누릅니다.</li>' +
        '<li>Claude가 만든 제안을 누르고 <b>"Files changed"</b>에서 바뀐 곳을 봅니다.</li>' +
        '<li>괜찮으면 <b>"Merge pull request"</b> → <b>"Confirm merge"</b>를 누릅니다. 이것으로 main에 합쳐집니다.</li>' +
        '<li>몇 분 기다린 뒤 공개 페이지(<b>사용자이름.github.io/cafe-landing/</b>)를 다시 읽어 들입니다. 맨 위에 <b>"클라우드에서 고쳤습니다"</b>가 나오면 성공입니다(main에 직접 들어가 버려서 두 번째 변경을 부탁한 사람은 맨 아래의 <b>"PR 연습"</b>을 봅니다).</li>' +
        '<li>데스크톱 앱을 열고 왼쪽 목록도 봅니다. 지금의 클라우드 대화가 여기에도 나와 있을 수 있습니다.</li>' +
        '<li>마지막으로 컴퓨터의 cafe-landing도 최신으로 만듭니다. VS Code의 Claude Code에서(멈춰 있으면 <b>claude -c</b>로 실행해서) 다음 글을 보냅니다.' + box('cafe-landing에서 git pull을 해서 GitHub의 최신 상태로 맞춰 주세요.') + '</li>' +
        '</ol>' +
        '<p class="note">"푸시"가 컴퓨터 → GitHub라면 <b>풀(pull)</b>은 GitHub → 컴퓨터입니다. 클라우드에서 고친 것을 내 쪽으로 가져옵니다.</p>',
      help: [
        { q: '"Merge pull request"가 안 눌려요', a: '조금 기다렸다가 페이지를 다시 읽어 들이세요. 그래도 안 되면 제안 화면 맨 아래의 메시지를 AI에게 보여 주고 물어보세요.' },
        { q: '머지하고 싶지 않아요', a: '"Close pull request"로 제안을 닫을 수 있습니다. 페이지는 바뀌지 않습니다.' },
        { q: 'claude -c로 생각과 다른 대화가 나왔어요', a: '그대로 써도 괜찮습니다. 신경 쓰이면 /exit한 뒤 claude로 새로 시작합니다.' },
        HELP_APPROVE
      ]
    },
    i20: {
      tag: '스마트폰', title: '스마트폰에서 컴퓨터 대화 이어 보기',
      html:
        '<p><b>리모트 컨트롤</b>을 쓰면 <b>컴퓨터에서 실행 중인 Claude Code</b>의 대화를 스마트폰에서 보거나 이어서 부탁할 수 있습니다. 작업은 컴퓨터 안에서 이루어집니다. <b>스마트폰이 없는 사람은 읽기만</b> 해도 됩니다.</p>' +
        '<ol>' +
        '<li>VS Code의 Claude Code를 준비합니다(멈춰 있으면 <b>claude -c</b>로 실행합니다).</li>' +
        '<li>스마트폰에 <b>Claude 앱</b>을 설치하고 같은 계정으로 로그인합니다. Claude Code에서 <b>/mobile</b>을 넣으면 앱 설치용 QR 코드가 나옵니다(공식 안내).</li>' +
        '<li>Claude Code에서 <b>/rc</b>를 넣고 ' + os('Enter', 'Return') + ' 키를 누릅니다(/remote-control과 같습니다).' + cmd('/rc') + '</li>' +
        '<li>처음에는 확인 창이 나옵니다. <b>"Enable Remote Control"</b>을 고릅니다. 연결되면 화면 아래쪽에 <b>/rc active</b>가 나옵니다(공식 안내). 터미널이 좁으면 안 나오므로 그때는 터미널을 넓힙니다.</li>' +
        '<li>스마트폰으로 연결합니다. 가장 쉬운 방법은 컴퓨터에서 <b>/rc</b>를 한 번 더 넣고, 나오는 <b>QR 코드를 스마트폰 카메라로 찍는</b> 것입니다. 또는 Claude 앱에서 "Code"를 엽니다(화면 아래 탭이나 왼쪽 위 메뉴 ≡ 안에 있습니다). <b>컴퓨터 표시에 초록 점</b>이 붙은 대화가 지금 컴퓨터의 대화입니다(공식 안내).</li>' +
        '<li>스마트폰에서 다음 글을 보내 봅니다. "cafe-landing 안에 어떤 파일이 있는지 알려 주세요". 컴퓨터 화면에도 같은 대화가 나옵니다. 컴퓨터가 Manual 모드이므로 허락이 필요할 때는 스마트폰에서도 묻습니다.</li>' +
        '<li>끝나면 컴퓨터에서 <b>/rc</b>를 한 번 더 넣고, 나오는 화면에서 <b>연결을 끊는</b> 항목(Disconnect 등)을 고릅니다. Claude Code 대화는 그대로 남습니다.</li>' +
        '</ol>' +
        '<div class="card goal"><b>기억해 둘 것(공식 안내)</b><br>· <b>컴퓨터를 켜 둔 채로</b> 둔다. 터미널을 닫으면 스마트폰에서도 쓸 수 없게 된다<br>· 컴퓨터가 잠자기에 들어가거나 와이파이가 끊겨도 돌아오면 <b>자동으로 다시 연결</b>된다<br>· Claude 유료 요금제로 로그인했을 때 쓸 수 있다(API 키로는 쓸 수 없다)</div>' +
        '<p class="note">클라우드 세션(앞 화면)도 스마트폰 앱의 "Code"에서 볼 수 있습니다. 이쪽은 컴퓨터를 꺼 두어도 볼 수 있습니다.</p>',
      help: [
        { q: '"Code"가 안 보여요', a: '앱을 새 버전으로 업데이트하세요. 브라우저로 claude.ai/code를 열어도 같은 대화를 볼 수 있습니다.' },
        { q: '초록 점이 안 붙어요', a: '컴퓨터의 Claude Code가 계속 실행 중인지 확인하세요. 터미널을 닫았다면 claude -c로 다시 실행하고 /rc를 넣습니다.' },
        { q: '스마트폰에서 허락을 물어요', a: '컴퓨터에서와 같습니다. 내용을 읽고 아는 것만 허락합니다.' }
      ]
    },
    i21: {
      tag: '알아 두기', title: '어디서 무엇을 할까? 그리고 뒷정리',
      html:
        '<h2>나눠 쓰기</h2>' +
        '<ul class="parts">' +
        '<li><b>VS Code+Claude Code</b>내 폴더: 쓸 수 있다 / 컴퓨터를 끄면: 멈춘다<br><span>파일이 늘어나는 긴 작업에</span></li>' +
        '<li><b>데스크톱 앱</b>내 폴더: 쓸 수 있다 / 컴퓨터를 끄면: 멈춘다<br><span>한 번에 끝나는 간단한 작업에</span></li>' +
        '<li><b>클라우드 세션</b>내 폴더: 쓸 수 없다 / 컴퓨터를 꺼도: 계속된다<br><span>시간이 걸리는 작업을 맡겨 둘 때</span></li>' +
        '<li><b>스마트폰</b>/rc 중에는 컴퓨터 대화를 볼 수 있다 / 클라우드 대화도 볼 수 있다<br><span>밖에서 확인할 때</span></li>' +
        '</ul>' +
        '<p class="note">"내 컴퓨터 폴더를 쓸 수 있다"와 "컴퓨터를 꺼도 계속된다"는 딱 반대입니다.</p>' +
        '<p class="note">오늘은 연습용 cafe-landing만 넣었지만, 만든 스킬(.claude/skills) 등도 <b>비공개 저장소</b>에 넣어 두면 백업이 됩니다. 그때도 개인정보나 "열쇠"가 들어 있지 않은지 먼저 확인합니다.</p>' +
        '<h2>뒷정리</h2>' +
        '<ul class="parts">' +
        '<li><b>/rc</b>쓰지 않을 때는 연결을 끊어 둔다<br><span>/rc를 한 번 더 넣고 연결 끊기</span></li>' +
        '<li><b>Claude GitHub App</b>쓰지 않게 되면 뺀다<br><span>GitHub의 "Settings" → "Applications" → "Installed GitHub Apps" → Claude의 "Configure" → 맨 아래 "Uninstall". 같은 화면의 "Authorized GitHub Apps"에서도 Claude를 "Revoke"</span></li>' +
        '<li><b>claude.ai와 GitHub의 연결</b>쓰지 않게 되면 끊는다<br><span>claude.ai/customize/connectors에서 GitHub 연결 끊기(공식 안내)</span></li>' +
        '<li><b>공개 페이지</b>그만두고 싶어지면 멈춘다<br><span>저장소의 "Settings" → "Pages" → "Unpublish site"</span></li>' +
        '<li><b>GitHub CLI 로그인</b>컴퓨터를 남에게 넘길 때는 로그아웃<br><span>터미널에서 gh auth logout</span></li>' +
        '</ul>',
      help: [
        { q: 'cafe-landing을 지워도 되나요?', a: '네. 연습용이므로 필요 없으면 저장소 "Settings" 맨 아래에서 지울 수 있습니다. 지우면 바로 보이지 않게 됩니다(공식 안내에 따르면 90일 안에는 되살릴 수 있는 경우도 있습니다). 잘 확인한 뒤 직접 합니다.' }
      ]
    },
    i22: {
      tag: '퀴즈', title: 'GitHub와 여러 장소 퀴즈',
      quiz: [
        { q: '"커밋"이란?', options: ['지금 상태를 메모와 함께 기록하는 것', '파일을 지우는 것', '비밀번호를 바꾸는 것'], answer: 0, explain: '게임의 "세이브" 같은 것입니다. 메모가 붙어서 나중에 흐름을 알 수 있습니다.' },
        { q: '컴퓨터의 기록을 GitHub로 보내는 것은?', options: ['클론', '푸시', '스타'], answer: 1, explain: '컴퓨터 → GitHub가 푸시, GitHub → 컴퓨터로 꺼내 오는 것이 클론입니다.' },
        { q: '컴퓨터의 폴더가 망가져도 GitHub에 넣어 두었다면?', options: ['이제 되살릴 수 없다', '클론으로 꺼낼 수 있다', '컴퓨터를 바꾼다'], answer: 1, explain: 'GitHub에 남아 있으므로 클론으로 꺼낼 수 있습니다. 오늘은 다른 이름의 폴더로 꺼내서 확인했습니다. 새 컴퓨터에서도 같습니다.' },
        { q: '커밋의 이메일 주소는 어떻게 하나요?', options: ['평소 주소를 그대로 쓴다', 'GitHub의 noreply 주소를 쓴다', '친구 주소를 쓴다'], answer: 1, explain: '공개하면 누구나 볼 수 있습니다. GitHub가 마련한 공개용 주소를 씁니다.' },
        { q: 'GitHub Pages로 공개하기 전에 할 일은?', options: ['개인정보나 열쇠가 들어 있지 않은지 직접 확인한다', '아무것도 보지 않고 공개한다', 'AI에게 전부 맡긴다'], answer: 0, explain: '공개하면 파일도 전부 누구나 볼 수 있습니다.' },
        { q: '클라우드 세션의 특징은?', options: ['내 컴퓨터 폴더를 직접 쓴다', '인터넷 속의 컴퓨터에서 움직이고 브라우저를 닫아도 계속된다', '스마트폰에서만 쓸 수 있다'], answer: 1, explain: '공식 안내에 따르면 닫아도, 컴퓨터를 꺼도 작업은 계속됩니다. 대신 내 컴퓨터의 폴더는 보이지 않습니다.' },
        { q: 'Claude GitHub App을 설치할 때 고르는 것은?', options: ['All repositories(전부)', 'Only select repositories로 쓰는 것만', '아무것도 읽지 않고 Install'], answer: 1, explain: '연결하는 범위는 쓰는 저장소만으로 합니다.' },
        { q: 'PR(풀 리퀘스트)이란?', options: ['"이렇게 바꾸고 싶습니다"라는 제안', '페이지를 지우는 버튼', '비밀번호의 다른 이름'], answer: 0, explain: '머지할지 말지는 내용을 보고 직접 정합니다.' },
        { q: '리모트 컨트롤(/rc)로 스마트폰에서 쓸 때는?', options: ['컴퓨터를 꺼 둔다', '컴퓨터의 Claude Code를 실행한 채로 둔다', '터미널을 닫는다'], answer: 1, explain: '작업은 컴퓨터 안에서 이루어지므로 터미널을 닫으면 스마트폰에서도 쓸 수 없게 됩니다.' }
      ],
      html: '<p>배운 것을 퀴즈로 확인해 봅시다. 고르면 답이 나옵니다. 점수는 매기지 않습니다.</p>',
      help: [
        { q: '틀렸어요', a: '괜찮습니다. 앞 화면을 다시 보고 돌아와 보세요. 몇 번이든 다시 할 수 있습니다.' }
      ]
    },
    i23: {
      tag: '확인', title: '마지막 확인',
      checks: [
        'GitHub 계정을 만들고 gh로 로그인했다',
        'cafe-landing에만 noreply 이메일 주소를 설정했다',
        '카페 페이지를 비공개 저장소에 넣었다',
        'GitHub에서 다른 이름의 폴더로 클론해서 내용을 확인했다',
        '내용을 확인한 뒤 GitHub Pages로 공개했다',
        '데스크톱 앱에서 agent1을 연결해 부탁했다',
        '클라우드 세션에서 고치게 하고 직접 머지했다',
        '스마트폰에서 /rc로 컴퓨터 대화를 봤다(할 수 있었던 사람만)',
        'markitdown을 시험했다(할 수 있었던 사람만)'
      ],
      required: 7,
      html:
        '<p>할 수 있었던 것에 체크를 넣으세요. <b>위의 7개</b>에 체크가 들어가면 "완료로 하기"를 누를 수 있습니다. 아래 2개는 할 수 있었던 사람만 합니다.</p>' +
        '<h2>돌아보기: 지금까지 할 수 있게 된 것</h2>' +
        '<ul class="parts">' +
        '<li><b>레슨1~2</b>도구를 설치하고 AI에게 파일을 만들게 한다<br><span>CLAUDE.md로 기억하게 한다</span></li>' +
        '<li><b>레슨3~4</b>안전한 설정과 대화 관리<br><span>허락·/clear·뒤에서 돌리는 작업</span></li>' +
        '<li><b>레슨5~6</b>작업 나누기·자동 규칙·바깥 서비스<br><span>서브에이전트·훅·커넥터</span></li>' +
        '<li><b>레슨7~8</b>반복을 스킬로, 작품을 저장하고 공개<br><span>스킬·플러그인·GitHub·클라우드·스마트폰</span></li>' +
        '</ul>' +
        '<p class="note">이것으로 이 교재의 레슨은 모두 끝입니다. 모르게 되면 언제든 앞 레슨으로 돌아가서 다시 보세요.</p>',
      help: [
        { q: '못 한 부분이 있어요', a: '그 단계로 돌아가서 "곤란할 때"를 보세요. 몇 번이든 다시 할 수 있습니다.' }
      ]
    }
  };

  window.COURSE_KO.lessons.l8 = {
    title: '작품 저장과 공개, 폰에서 이어 보기',
    short: 'GitHub에 페이지를 넣어 두고, 다른 폴더로 클론해서 꺼낸다. 내용을 확인한 뒤 공개한다. 데스크톱 앱·클라우드 세션·스마트폰에서도 부탁한다',
    devices: 'PC+스마트폰(스마트폰은 없어도 됨)',
    doneCard: '<b>레슨8 완료입니다. 수고하셨습니다.</b><br>만든 것을 GitHub에 넣어 공개하고, 데스크톱 앱·클라우드·스마트폰에서도 Claude에게 부탁할 수 있게 되었습니다. <b>이것으로 모든 레슨이 끝났습니다.</b>',
    steps: steps
  };
})();
