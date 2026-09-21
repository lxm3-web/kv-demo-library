/**
 * 04 會費對帳催繳 — Google Sheet 選單（自動化串接版）
 * 改寫自智谷 AI Playbook Case 08（怡臻）「應收帳款催款」GAS，情境換成協會會費。
 * 安裝：建一份 Sheet，匯入兩個分頁「會員名冊」「銀行入帳」（欄位照 01_輸入假資料 的 CSV）
 *       → 擴充功能 → Apps Script → 貼上本檔 → 儲存 → 重整 Sheet → 上方出現「💰 會費催繳助手」選單
 * 選單：1 對帳 → 2 帳齡分級 → 3 產出催繳優先清單 → 🔄 重置
 */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('💰 會費催繳助手')
    .addItem('1. 對帳（入帳 ↔ 名冊）', 'reconcile')
    .addItem('2. 帳齡分級', 'aging')
    .addItem('3. 產出催繳優先清單', 'buildPriority')
    .addSeparator().addItem('🔄 重置 demo', 'resetDemo').addToUi();
}
function norm(s) { return String(s || '').replace(/股份有限公司|有限公司|\s/g, ''); }
function reconcile() {
  const ss = SpreadsheetApp.getActive();
  const m = ss.getSheetByName('會員名冊'), b = ss.getSheetByName('銀行入帳');
  const mv = m.getDataRange().getValues().slice(1), bv = b.getDataRange().getValues().slice(1);
  const paid = {}; const result = [];
  bv.forEach((r, i) => {
    const payer = norm(r[3]), amt = Number(r[4]);
    let hit = mv.find(x => norm(x[1]) === payer);
    let how = '公司名';
    if (!hit) { hit = mv.find(x => norm(x[1]).slice(0, 2) === payer.slice(0, 2) && Number(x[5]) === amt); how = '前兩字＋金額'; }
    if (!hit) { hit = mv.find(x => String(x[2]) === String(r[3]) && Number(x[5]) === amt); how = '聯絡人＋金額'; }
    if (!hit) { result.push('對不上'); return; }
    const id = hit[0]; paid[id] = (paid[id] || []); paid[id].push(amt); result.push(id + '（' + how + '）');
  });
  b.getRange(2, 7, result.length, 1).setValues(result.map(x => [x]));
  // 名冊寫狀態到 K/L 欄
  const st = mv.map(x => {
    const id = x[0], fee = Number(x[5]), got = paid[id] || [];
    if (!got.length) return ['未繳', 0];
    const sum = got.reduce((a, c) => a + c, 0);
    if (got.length > 1) return ['重複繳（多 ' + (sum - fee) + '）', sum];
    if (sum < fee) return ['短繳（差 ' + (fee - sum) + '）', sum];
    return ['已繳', sum];
  });
  m.getRange(1, 11, 1, 2).setValues([['對帳狀態', '入帳金額']]);
  m.getRange(2, 11, st.length, 2).setValues(st);
  const c = {}; st.forEach(s => { const k = s[0].split('（')[0]; c[k] = (c[k] || 0) + 1; });
  SpreadsheetApp.getUi().alert('對帳完成\n' + Object.keys(c).map(k => k + '：' + c[k] + ' 人').join('\n') + '\n對不上：' + result.filter(x => x === '對不上').length + ' 筆入帳');
}
function aging() {
  const m = SpreadsheetApp.getActive().getSheetByName('會員名冊');
  const v = m.getDataRange().getValues().slice(1); const today = new Date(); today.setHours(0,0,0,0);
  const out = v.map(x => {
    const st = String(x[10] || ''); if (!st || st === '已繳' || st.indexOf('重複') === 0) return ['', ''];
    const due = x[6] instanceof Date ? x[6] : new Date(String(x[6]).replace(/\//g, '-'));
    const d = Math.floor((today - due) / 86400000);
    return [d, d >= 60 ? '警告' : d >= 30 ? '強調' : d > 0 ? '提醒' : '未到期'];
  });
  m.getRange(1, 13, 1, 2).setValues([['逾期天數', '催繳級別']]); m.getRange(2, 13, out.length, 2).setValues(out);
  const rng = m.getRange(2, 14, out.length, 1);
  const rules = [['提醒', '#FFF3C4'], ['強調', '#FFD8A8'], ['警告', '#FFB3B3']].map(([t, c]) =>
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(t).setBackground(c).setRanges([rng]).build());
  m.setConditionalFormatRules(rules);
  const c = {}; out.forEach(o => { if (o[1]) c[o[1]] = (c[o[1]] || 0) + 1; });
  SpreadsheetApp.getUi().alert('帳齡分級\n' + Object.keys(c).map(k => k + '：' + c[k] + ' 人').join('\n'));
}
function buildPriority() {
  const ss = SpreadsheetApp.getActive(), m = ss.getSheetByName('會員名冊');
  let p = ss.getSheetByName('催繳優先清單') || ss.insertSheet('催繳優先清單'); p.clear();
  p.appendRow(['優先序', '會員編號', '公司', '聯絡人', '級別', '年費', '狀態', '逾期天數', '催繳級別', '聯絡偏好', '建議動作']);
  const v = m.getDataRange().getValues().slice(1).filter(x => x[13] && x[13] !== '未到期');
  const rank = { '警告': 3, '強調': 2, '提醒': 1 };
  v.sort((a, b) => (rank[b[13]] - rank[a[13]]) || (Number(b[5]) - Number(a[5])));
  v.forEach((x, i) => p.appendRow([i + 1, x[0], x[1], x[2], x[4], x[5], x[10], x[12], x[13], x[9],
    x[13] === '警告' ? '電話＋警告級信，說明權益影響' : x[13] === '強調' ? '強調級信＋一週後電話' : '提醒級信（' + x[9] + '）']));
  SpreadsheetApp.getUi().alert('催繳優先清單已產出：' + v.length + ' 人');
}
function resetDemo() {
  const ss = SpreadsheetApp.getActive(); const m = ss.getSheetByName('會員名冊'), b = ss.getSheetByName('銀行入帳');
  m.getRange(1, 11, m.getLastRow(), 4).clearContent(); m.setConditionalFormatRules([]); b.getRange(2, 7, b.getLastRow(), 1).clearContent();
  const p = ss.getSheetByName('催繳優先清單'); if (p) ss.deleteSheet(p);
}
