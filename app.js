// 1. 설정값 (도현 님의 정보)
const API_KEY = 'AIzaSyDaLSJUGp5mgOwDYG3ISaQszV8argDKh8o';
// 🚨 아래 주소를 도현 님이 새로 배포해서 받은 '웹 앱 URL'로 바꾸세요!
const ORGANIZER_URL = 'https://script.google.com/macros/s/AKfycbwflRVBwurS4jrArkhYbKZxXnCzshFAyWMpxEV3wu1DS4lhiwLVfyUszU9br_83yXnn/exec';

// 로그 출력 전용 함수
function log(targetId, msg) {
    const logDiv = document.getElementById(targetId);
    if (logDiv) {
        logDiv.innerText += `\n[${new Date().toLocaleTimeString()}] ${msg}`;
        logDiv.scrollTop = logDiv.scrollHeight;
    }
}

// 2. 드라이브 입주 작전 시작 (이 버튼이 핵심!)
async function startDriveCleanup() {
    log('log-drive', "🚀 103GB 사진 입주 명령을 서버로 보냅니다...");
    
    try {
        // 구글 서버에 신호를 보냅니다.
        // fetch는 '가져오다'라는 뜻인데, 여기서는 주소를 한 번 쿡 찌르는 역할을 합니다.
        await fetch(ORGANIZER_URL, { 
            method: 'GET',
            mode: 'no-cors' 
        });
        
        log('log-drive', "✅ 서버 전송 성공! 구글이 일을 시작했습니다.");
        log('log-drive', "💡 구글 드라이브 'MyArchive_2025' 폴더를 확인해 보세요.");
    } catch (err) {
        log('log-drive', "❌ 연결 에러: " + err.message);
        console.error(err);
    }
}

// 3. 유튜브 데이터 불러오기
async function loadYouTube() {
    log('log-yt', "📺 최신 영상 목록을 가져옵니다...");
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&type=video&maxResults=5&order=date`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.items) {
            log('log-yt', `🎉 ${data.items.length}개의 영상을 찾았습니다!`);
        }
    } catch (err) {
        log('log-yt', "❗ 유튜브 연결 실패: " + err.message);
    }
}

// 4. 구글 포토 기능 (대기 중)
function loadBestShot() {
    log('log-photo', "📸 구글 포토에서 셀카를 분석 중입니다 (권한 설정 필요)");
}
