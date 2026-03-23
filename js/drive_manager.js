// js/drive_manager.js
const folderCache = {};

function log(msg, cls = '') {
    const win = document.getElementById('log-window');
    if (!win) return;
    win.innerHTML += `<div class="${cls}">${msg}</div>`;
    win.scrollTop = win.scrollHeight;
}

function getSmartDate(file) {
    try {
        if (file.imageMediaMetadata && file.imageMediaMetadata.time) {
            return file.imageMediaMetadata.time.split(' ').replace(/:/g, '.').substring(0, 10);
        }
        const numbers = file.name.replace(/[^0-9]/g, '');
        let y, m, d;
        const match8 = numbers.match(/20(\d{2})(\d{2})(\d{2})/);
        if (match8) { y = "20" + match8; m = match8; d = match8; }
        else {
            const match6 = numbers.match(/(\d{2})(\d{2})(\d{2})/);
            if (match6) { y = "20" + match6; m = match6; d = match6; }
        }
        if (y && m && d) return `${y}.${m}.${d}`;
        const dt = new Date(file.createdTime);
        return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
    } catch (e) { return "날짜미상"; }
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
    while (true) {
        log("🔎 전역 사진 스캔 중...", 'log-info');
        try {
            const r = await gapi.client.drive.files.list({ pageSize: 100, q: "mimeType contains 'image/' and trashed = false", fields: "files(id, name, createdTime, parents, imageMediaMetadata)" });
            const files = r.result.files.filter(f => {
                const target = getSmartDate(f);
                return target !== "날짜미상" && (!f.parents || !f.parents.includes(folderCache[target]));
            });
            if (!files || files.length === 0) { log("✅ 모든 사진 정리 완료!", 'log-success'); break; }
            const oldParentIds = new Set();
            for (const f of files) {
                const tName = getSmartDate(f);
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
                        try { await gapi.client.drive.files.delete({ fileId: pId }); log(`🗑️ 빈 폴더 삭제 완료`, 'log-warn'); } catch(e){}
                    }
                }
            }
        } catch (err) { await new Promise(res => setTimeout(res, 3000)); }
    }
    startBtn.disabled = false;
}
