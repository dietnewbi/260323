const API_KEY = 'AIzaSyDaLSJUGp5mgOwDYG3ISaQszV8argDKh8o';
const CLIENT_ID = '600053731905-kerhcpp5akmq0vmoi398kl0mdfm8k39u.apps.googleusercontent.com';

function log(msg) {
    document.getElementById('status-log').innerText = msg;
}

// 유튜브 목록 불러오기 함수
async function loadYouTube() {
    log("유튜브 데이터를 당겨오는 중...");
    // 여기에 유튜브 API 호출 로직 삽입
}

// 드라이브 정리 시작 함수 (외부 앱스 스크립트 호출용)
function startDriveCleanup() {
    log("구글 서버에 정리 명령을 보냈습니다. (백그라운드 진행)");
    // 여기에 앱스 스크립트 연결 주소 삽입
}

// 구글 포토 AI 셀카 가져오기 함수
function loadBestShot() {
    log("구글 포토 AI가 상탈 사진을 고르는 중...");
}
