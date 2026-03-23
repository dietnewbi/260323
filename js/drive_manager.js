const folderCache = {};

// 로그 띄우는 함수 (화면에 실시간으로 뿌림)
function log(msg, cls = '') {
    const win = document.getElementById('log-window');
    if (!win) return;
    win.innerHTML += `<div class="${cls}">${msg}</div>`;
    win.scrollTop = win.scrollHeight;
}

// 1. [핵심] 파일명에서 무조건 날짜 먼저 뽑고, 딱 10자리만 남김
function getStrictDate(file) {
    let dateStr = "";
    try {
        const name = file.name;

        // 1순위: 파일명에서 숫자 추출 (예: 20260202 또는 260202)
        // 8자리 매칭 (20260202)
        const match8 = name.match(/(20\d{2})(0[1-9]|1[0-2])(0[1-9]|\d|3)/);
        if (match8) {
            dateStr = `${match8}.${match8}.${match8}`;
        } 
        // 6자리 매칭 (260202)
        else {
            const match6 = name.match(/(\d{2})(0[1-9]|1[0-2])(0[1-9]|\d|3)/);
            if (match6) {
                dateStr = `20${match6}.${match6}.${match6}`;
            }
        }

        // 2순위: 파일명에 날짜가 없으면 사진 메타데이터(찍힌 시간) 사용
        if (!dateStr && file.imageMediaMetadata && file.imageMediaMetadata.time) {
            dateStr = file.imageMediaMetadata.time.split(' ').replace(/:/g, '.');
        }

        // 3순위: 다 없으면 드라이브에 업로드된 생성일 사용
        if (!dateStr) {
            const dt = new Date(file.createdTime);
            const yy = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const dd = String(dt.getDate()).padStart(2, '0');
            dateStr = `${yy}.${mm}.${dd}`;
        }

        // [절대 규칙] 무조건 10자리 커트 (예: 2026.02.02)
        return dateStr.substring(0, 10);

    } catch (e) {
        return "2099.99.99"; // 에러 나면 임시 폴더로 빼버림
    }
}

// 2. 10자리 폴더 만들기 또는 찾기
async function getOrCreateFolder(name) {
    const cleanName = name.substring(0, 10); // 여기서도 10자리 강제 확인
    if (folderCache[cleanName]) return folderCache[cleanName];
    
    const r = await gapi.client.drive.files.list({ 
        q: `name='${cleanName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`, 
        fields: "files(id)" 
    });
    
    if (r.result.files && r.result.files.length > 0) { 
        folderCache[cleanName] = r.result.files.id; 
        return r.result.files.id; 
    }
    
    const c = await gapi.client.drive.files.create({ 
        resource: { name: cleanName, mimeType: 'application/vnd.google-apps.folder' }, 
        fields: 'id' 
    });
    folderCache[cleanName] = c.result.id; 
    return c.result.id;
}

// 3. 메인 자동 정리 로직 (다 끄집어내고 빈 폴더 삭제)
async function startOrganizing() {
    const startBtn = document.getElementById('start-btn');
    startBtn.disabled = true;
    startBtn.innerText = "🚀 살벌하게 정리 중... (창 닫지 마세요)";

    while (true) {
        log("🔎 드라이브 전체 스캔 중... (100장 단위)", 'log-info');
        try {
            // 모든 사진 다 긁어옴 (폴더 안에 있든 없든)
            const r = await gapi.client.drive.files.list({ 
                pageSize: 100, 
                q: "mimeType contains 'image/' and trashed = false", 
                fields: "files(id, name, createdTime, parents, imageMediaMetadata)" 
            });
            
            // 이미 10자리 폴더에 들어가 있는 사진은 제외
            const files = r.result.files.filter(f => {
                const targetName = getStrictDate(f);
                return !f.parents || !f.parents.includes(folderCache[targetName]);
            });

            if (!files || files.length === 0) { 
                log("✅ 모든 사진 정리 및 폴더 파괴 완료!", 'log-success'); 
                break; 
            }

            const oldParentIds = new Set();
            
            // 사진 끄집어내서 10자리 폴더로 꽂아 넣기
            for (const f of files) {
                const tName = getStrictDate(f);
                const tId = await getOrCreateFolder(tName);
                
                if (f.parents && f.parents.includes(tId)) continue; // 중복 방지
                if (f.parents) f.parents.forEach(id => oldParentIds.add(id)); // 기존에 있던 폴더 ID 기억

                // 기존 폴더(removeParents)에서 끄집어내고 새 폴더(addParents)로 직행
                await gapi.client.drive.files.update({ 
                    fileId: f.id, 
                    addParents: tId, 
                    removeParents: f.parents ? f.parents.join(',') : null 
                });
                log(`[이동] ${f.name} ➡️ ${tName}`, 'log-success');
            }

            // 사진 빠져나가서 빈껍데기 된 옛날 폴더들 삭제
            for (const pId of oldParentIds) {
                const check = await gapi.client.drive.files.list({ q: `'${pId}' in parents and trashed=false`, fields: "files(id)" });
                // 폴더 안에 남은 파일이 0개라면
                if (check.result.files && check.result.files.length === 0) {
                    const info = await gapi.client.drive.files.get({ fileId: pId, fields: "name" });
                    // 내가 만든 10자리(YYYY.MM.DD) 폴더가 아니면 폭파
                    if (!/^\d{4}\.\d{2}\.\d{2}$/.test(info.result.name)) {
                        try { 
                            await gapi.client.drive.files.delete({ fileId: pId }); 
                            log(`🗑️ 빈 폴더 폭파: [${info.result.name}]`, 'log-warn'); 
                        } catch(e) { /* 삭제 권한 없는 폴더는 무시 */ }
                    }
                }
            }
        } catch (err) { 
            log(`❌ 에러 발생: ${err.message}. 3초 뒤 다시 달립니다.`, 'log-warn');
            await new Promise(res => setTimeout(res, 3000)); 
        }
    }
    startBtn.disabled = false;
    startBtn.innerText = "2. 자동 정리 스위치 ON";
}
