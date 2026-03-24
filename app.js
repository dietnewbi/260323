// [설정] 새 배포 주소와 API 키
const ORGANIZER_URL = 'https://script.google.com/macros/s/AKfycbxzOMxafpyTfJM-TYa6edvBN3mKX8d3ppVgPmVHJ8Vs4iNG9i2oPd6tZOvCUWJwvlly/exec';
const API_KEY = 'AIzaSyDaLSJUGp5mgOwDYG3ISaQszV8argDKh8o';

function log(targetId, msg) {
    const logDiv = document.getElementById(targetId);
    if (logDiv) {
        logDiv.innerText += `\n[${new Date().toLocaleTimeString()}] ${msg}`;
        logDiv.scrollTop = logDiv.scrollHeight;
    }
}

// 1. 드라이브 정리 (이름 1순위 분석 버전 실행)
async function startDriveCleanup() {
    log('log-drive', "🚀 [이름 우선 분석] 사진 입주 작전을 시작합니다...");
    try {
        await fetch(ORGANIZER_URL, { method: 'GET', mode: 'no-cors' });
        log('log-drive', "✅ 서버 전송 성공! 이름에 날짜가 있으면 그 폴더로, 없으면 생성일 폴더로 들어갑니다.");
    } catch (err) {
        log('log-drive', "❌ 연결 실패: " + err.message);
    }
}

// 2. 유튜브 실제 영상 띄우기
async function loadYouTube() {
    log('log-yt', "📺 최신 영상을 가져와 화면에 띄웁니다...");
    try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&type=video&maxResults=1&order=date&q=BurBie`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const videoId = data.items.id.videoId;
            // index.html의 youtube-player 구역에 실제 영상 삽입
            document.getElementById('youtube-player').innerHTML = `
                <iframe width="100%" height="200" src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" allowfullscreen style="border-radius:8px;"></iframe>
            `;
            log('log-yt', "🎉 최신 영상 로드 완료!");
        }
    } catch (err) {
        log('log-yt', "❗ 유튜브 에러: " + err.message);
    }
}

// 3. 구글 포토 최신 사진 연동 (getPhoto 액션 호출)
async function loadBestShot() {
    log('log-photo', "📸 구글 서버에서 최신 눈바디 사진을 가져옵니다...");
    try {
        const response = await fetch(ORGANIZER_URL + "?action=getPhoto");
        const photoUrl = await response.text();

        if (photoUrl && photoUrl.startsWith('http')) {
            document.getElementById('photo-display').innerHTML = `
                <img src="${photoUrl}" style="width:100%; border-radius:8px; border:1px solid #fbbc05;">
            `;
            log('log-photo', "✅ 오늘의 사진 로드 성공!");
        } else {
            log('log-photo', "❓ 아직 정리된 사진이 없거나 주소를 찾지 못했습니다.");
        }
    } catch (err) {
        log('log-photo', "❌ 사진 로드 실패: " + err.message);
    }
}
