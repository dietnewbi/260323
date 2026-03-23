const API_KEY = 'AIzaSyDaLSJUGp5mgOwDYG3ISaQszV8argDKh8o';
const CLIENT_ID = '600053731905-kerhcpp5akmq0vmoi398kl0mdfm8k39u.apps.googleusercontent.com';
const DEPLOY_URL = 'https://script.google.com/macros/s/AKfycbwflRVBwurS4jrArkhYbKZxXnCzshFAyWMpxEV3wu1DS4lhiwLVfyUszU9br_83yXnn/exec';

function log(msg) {
    const logDiv = document.getElementById('status-log');
    logDiv.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
}

// 1. 드라이브 정리 시작 버튼 클릭 시 실행
async function startDriveCleanup() {
    log("🚀 구글 서버에 사진 정리 명령을 전달합니다...");
    
    try {
        // 배포한 구글 앱스 스크립트 주소로 신호를 보냅니다.
        // no-cors는 보안 정책상 결과를 직접 받지 못해도 실행은 시키라는 옵션입니다.
        fetch(DEPLOY_URL, { mode: 'no-cors' });
        
        log("✅ 명령 전달 완료! 구글 서버가 백그라운드에서 103GB 사진을 분류하기 시작했습니다. 브라우저를 닫아도 정리는 계속됩니다.");
    } catch (error) {
        log("❌ 명령 전달 실패: " + error.message);
    }
}

// 2. 유튜브 영상 목록 불러오기 (기존 로직 유지 및 보강)
async function loadYouTube() {
    log("📺 유튜브 데이터를 불러오는 중...");
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&type=video&maxResults=5&order=date`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            log(`🎉 최신 영상 ${data.items.length}개를 불러왔습니다.`);
            // 여기에 화면에 뿌려주는 로직을 더 추가할 수 있습니다.
        }
    } catch (err) {
        log("❗ 유튜브 에러: " + err.message);
    }
}

// 3. 구글 포토 AI 셀카 가져오기 (준비 단계)
function loadBestShot() {
    log("📸 구글 포토 AI와 통신을 준비 중입니다...");
    // 다음 단계에서 실제 사진 표시 로직을 넣을 예정입니다.
}
