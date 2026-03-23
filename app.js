const API_KEY = 'AIzaSyDaLSJUGp5mgOwDYG3ISaQszV8argDKh8o';
const DEPLOY_URL = 'https://script.google.com/macros/s/AKfycbwflRVBwurS4jrArkhYbKZxXnCzshFAyWMpxEV3wu1DS4lhiwLVfyUszU9br_83yXnn/exec';

// 특정 구역(targetId)에만 로그를 찍어주는 전용 함수
function log(targetId, msg) {
    const logDiv = document.getElementById(targetId);
    logDiv.innerText += `\n[${new Date().toLocaleTimeString()}] ${msg}`;
    logDiv.scrollTop = logDiv.scrollHeight; // 항상 최신 스크롤 유지
}

// 1. 유튜브 기능
async function loadYouTube() {
    log('log-yt', "📺 유튜브 데이터를 당겨오는 중...");
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&type=video&maxResults=5&order=date`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.items) {
            log('log-yt', `🎉 최신 영상 ${data.items.length}개 로드 완료!`);
        }
    } catch (err) {
        log('log-yt', "❗ 에러 발생: " + err.message);
    }
}

// 2. 포토 기능 (현재 뼈대만)
function loadBestShot() {
    log('log-photo', "📸 구글 포토 API 연결을 시도합니다...");
    log('log-photo', "❗ 현재 권한이 없습니다. 다음 단계에서 API 연동 작업이 필요합니다.");
}

// 3. 드라이브 정리 기능
function startDriveCleanup() {
    log('log-drive', "🚀 서버에 '103GB 사진 정리' 명령을 전송합니다.");
    try {
        fetch(DEPLOY_URL, { mode: 'no-cors' });
        log('log-drive', "✅ 서버 전송 완료! 백그라운드 작업이 시작되었습니다. (진행 상황은 드라이브 MyArchive_Sorted 폴더에서 확인 가능)");
    } catch (err) {
        log('log-drive', "❌ 명령 전송 실패: " + err.message);
    }
}
