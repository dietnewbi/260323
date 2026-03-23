const folderCache = {};

function log(msg, cls = '') {
    const win = document.getElementById('log-window');
    if (!win) return;
    win.innerHTML += `<div class="${cls}">${msg}</div>`;
    win.scrollTop = win.scrollHeight;
}

// ★ 날짜 추출 로직 완전 재조립 (10자리 고정) ★
function getStrictDate(file) {
    try {
        const name = file.name;
        // 파일명에서 숫자만 싹 긁어모음 (예: kakaoscreenshot 260323 -> 260323)
        const n = name.replace(/[^0-9]/g, ''); 
        let y, m, d;

        // 1. 8자리 숫자 패턴 (예: 20260323)
        const m8 = n.match(/(20\d{2})(\d{2})(\d{2})/);
        if (m8) {
            y = m8; m = m8; d = m8;
        } 
        // 2. 6자리 숫자 패턴 (예: 260323)
        else {
            const m6 = n.match(/(\d{2})(\d{2})(\d{2})/);
            if (m6) {
                y = "20" + m6; m = m6; d = m6;
            }
        }

        // 3. 파일명에 숫자가 없으면 메타데이터나 생성일로 보정
        if (!y || !m || !d) {
            const dt = (file.imageMediaMetadata && file.imageMediaMetadata.time) 
                       ? new Date(file.imageMediaMetadata.time.split(' ').replace(/:/g, '-'))
                       : new Date(file.createdTime);
            y = dt.getFullYear();
            m = String(dt.getMonth() + 1).padStart(2, '0');
            d = String(dt.getDate()).padStart(2, '0');
        }

        // 최종 결과물: 반드시 YYYY.MM.DD (점 포함 10자)
        const finalDate = `${y}.${m}.${d}`;
        return finalDate.substring(0, 10);

    } catch (e) {
        return "2026.03.23"; // 정 안되면 오늘 날짜라도 박음
    }
}

async function getOrCreateFolder(name) {
    const cleanName = name.substring(0, 10);
    if (folderCache[cleanName]) return folderCache[cleanName];
    const r = await gapi.client.drive.files.list({ q: `name='${cleanName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`, fields: "files(id)" });
    if (r.result.files && r.result.files.length > 0) { folderCache[cleanName] = r.result.files.id; return r.result.files.id; }
    const c = await gapi.client.drive.files.create({ resource: { name: cleanName, mimeType: 'application/vnd.google-apps.folder' }, fields: 'id' });
    folderCache[cleanName] = c.result.id; return c.result.id;
}

async function startOrganizing() {
    const startBtn = document.getElementById('start-btn');
    startBtn.disabled = true;
    startBtn.innerText = "🚀 날짜 형식 강제 고정 정리 중...";

    while (true) {
        log("🔎 드라이브 전체 스캔 중...", 'log-info');
        try {
            const r = await gapi.client.drive.files.list({ 
                pageSize: 100, 
                q: "mimeType contains 'image/' and trashed = false", 
                fields: "files(id, name, createdTime, parents, imageMediaMetadata)" 
            });
            
            const files = r.result.files.filter(f => {
                const target = getStrictDate(f);
                return !f.parents || !f.parents.includes(folderCache[target]);
            });

            if (!files || files.length === 0) { log("✅ 모든 사진 정리 완료!", 'log-success'); break; }

            const oldParentIds = new Set();
            for (const f of files) {
                const tName = getStrictDate(f);
                const tId = await getOrCreateFolder(tName);
                if (f.parents && f.parents.includes(tId)) continue;
                if (f.parents) f.parents.forEach(id => oldParentIds.add(id));
                await gapi.client.drive.files.update({ fileId: f.id, addParents: tId, removeParents: f.parents ? f.parents.join(',') : null });
                log(`[이동] ${f.name} ➡️ ${tName}`, 'log-success');
            }

            for (const pId of oldParentIds) {
                const check = await gapi.client.drive.files.list({ q: `'${pId}' in parents and trashed=false`, fields: "files(id)" });
                if (check.result.files && check.result.files.length === 0) {
                    const info = await gapi.client.drive.files.get({ fileId: pId, fields: "name" });
                    if (!/^\d{4}\.\d{2}\.\d{2}$/.test(info.result.name)) {
                        try { await gapi.client.drive.files.delete({ fileId: pId }); log(`🗑️ 빈 폴더 삭제: ${info.result.name}`, 'log-warn'); } catch(e){}
                    }
                }
            }
        } catch (err) { 
            log(`❌ 에러: ${err.message}`, 'log-warn');
            await new Promise(res => setTimeout(res, 3000)); 
        }
    }
    startBtn.disabled = false;
    startBtn.innerText = "2. 자동 정리 스위치 ON";
}
