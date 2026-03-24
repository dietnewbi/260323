// app.js 수정 부분

// 🚨 주의: 아까 복사한 '새 배포 주소'를 여기에 넣으세요!
const ORGANIZER_URL = 'https://script.google.com/macros/s/방금_복사한_새_주소/exec';

async function startDriveCleanup() {
    log('log-drive', "🚀 103GB 사진 입주 작전을 시작합니다...");
    
    try {
        // 새로 만든 입주 스크립트 주소로 신호를 보냅니다.
        fetch(ORGANIZER_URL, { mode: 'no-cors' });
        
        log('log-drive', "✅ 서버에 명령 전달 완료! 이제 구글 서버가 이름에 맞춰 폴더에 사진을 넣기 시작합니다.");
        log('log-drive', "💡 양이 많으니 5~10분 뒤에 드라이브를 확인해 보시고, 아직 남았다면 버튼을 한 번 더 눌러주세요.");
    } catch (error) {
        log('log-drive', "❌ 서버 연결 실패: " + error.message);
    }
}
