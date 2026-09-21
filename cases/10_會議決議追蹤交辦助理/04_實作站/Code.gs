/**
 * Case 30 · 會議決議追蹤與待辦派發流程
 * 工具：Claude Prompt + Google Sheets + LINE Notify
 *
 * 工作表結構：
 *   「待辦追蹤」 A=會議日期 / B=待辦事項 / C=負責人 / D=截止日期 /
 *                E=狀態（待處理/進行中/已完成/逾期）/ F=備注 / G=LINE提醒已發
 *
 * Script Properties：
 *   LINE_CHANNEL_TOKEN  LINE Messaging API channel access token（LINE Notify 已停服）
 *   LINE_TO             推播對象 userId 或 groupId
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📋 會議追蹤助手')
    .addItem('0. 灌 demo 資料', 'setupDemoData')
    .addItem('產出 AI 萃取 Prompt（貼入 Claude）', 'generateExtractionPrompt')
    .addItem('檢查到期待辦 & 發 LINE 提醒', 'checkDeadlines')
    .addSeparator()
    .addItem('安裝每日 09:00 自動提醒', 'installDailyTrigger')
    .addItem('套用狀態顏色格式', 'applyStatusFormat')
    .addToUi();
}

function generateExtractionPrompt() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('貼入會議記錄', '請貼入本次會議記錄（議題/討論/結論均可）：', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;

  const notes = res.getResponseText();
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const prompt = `你是一位專業會議秘書。以下是 ${today} 的會議記錄，請萃取所有待辦事項，輸出 JSON 格式清單。

會議記錄：
${notes}

請輸出 JSON：
[
  {"待辦事項":"...","負責人":"...","截止日期":"YYYY-MM-DD","備注":"..."},
  ...
]

若記錄未明確說明截止日，請根據語境推估並標注「推測」。`;

  const ss = SpreadsheetApp.getActive();
  let out = ss.getSheetByName('待辦追蹤') || ss.insertSheet('待辦追蹤');
  const lastRow = out.getLastRow() + 2;
  out.getRange(lastRow, 1).setValue('=== AI 萃取 Prompt（複製後貼入 Claude）===');
  out.getRange(lastRow+1, 1).setValue(prompt);
  ui.alert(`Prompt 已寫入「待辦追蹤」底部。
複製 Prompt → 貼入 Claude → 取得 JSON → 依格式新增到工作表前段。`);
}

function checkDeadlines() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('待辦追蹤');
  if (!sheet) { SpreadsheetApp.getUi().alert('找不到待辦追蹤工作表。'); return; }

  const today = new Date();
  const data = sheet.getDataRange().getValues().slice(1);
  const alerts = [];

  data.forEach((r, i) => {
    if (!r[1] || r[4] === '已完成') return;
    const dl = new Date(r[3]);
    if (isNaN(dl)) return;
    const days = Math.ceil((dl - today) / 86400000);
    if ((days <= 2 || days < 0) && !r[6]) {
      alerts.push({ row: i+2, task: r[1], owner: r[2], deadline: r[3], days });
    }
  });

  if (alerts.length) {
    const msg = '📋 會議待辦追蹤提醒\n\n' + alerts.map(a =>
      a.days < 0
        ? `⚠️ 逾期！【${a.owner}】${a.task}（截止：${a.deadline}，逾期 ${Math.abs(a.days)} 天）`
        : `⏰ 即將到期！【${a.owner}】${a.task}（截止：${a.deadline}，剩 ${a.days} 天）`
    ).join('\n');
    pushLine(msg);
    alerts.forEach(a => { sheet.getRange(a.row, 7).setValue('已發'); if(a.days < 0) sheet.getRange(a.row, 5).setValue('逾期'); });
  }
  SpreadsheetApp.getUi().alert(`掃描完成，共 ${alerts.length} 項即將到期/逾期待辦已發 LINE 提醒。`);
}

function pushLine(message) {
  // LINE Notify 已於 2025-03-31 停服，改用 LINE Messaging API push
  // Script Properties：LINE_CHANNEL_TOKEN（Messaging API channel access token）、LINE_TO（userId 或 groupId）
  const p = PropertiesService.getScriptProperties();
  const token = p.getProperty('LINE_CHANNEL_TOKEN'), to = p.getProperty('LINE_TO');
  if (!token || !to) { Logger.log('LINE_CHANNEL_TOKEN / LINE_TO 未設定。\n' + message); return; }
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post', contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ to, messages: [{ type: 'text', text: message }] }),
    muteHttpExceptions: true,
  });
}

function installDailyTrigger() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'checkDeadlines').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('checkDeadlines').timeBased().everyDays(1).atHour(9).create();
  SpreadsheetApp.getUi().alert('已安裝每日 09:00 自動提醒。');
}

function applyStatusFormat() {
  const ss = SpreadsheetApp.getActive();
  const s = ss.getSheetByName('待辦追蹤');
  if (!s || s.getLastRow() < 2) return;
  const range = s.getRange(2, 5, s.getLastRow()-1, 1);
  s.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('已完成').setBackground('#d9ead3').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('進行中').setBackground('#fff2cc').setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('逾期').setBackground('#fce4e4').setFontColor('#cc0000').setRanges([range]).build(),
  ]);
  SpreadsheetApp.getUi().alert('已套用：已完成=綠/進行中=黃/逾期=紅。');
}

// ── 示範資料 ────────────────────────────────────────────────────────────────
function setupDemoData() {
  const ss = SpreadsheetApp.getActive();
  let s = ss.getSheetByName('待辦追蹤') || ss.insertSheet('待辦追蹤');
  s.clearContents();
  s.getRange(1,1,1,7).setValues([['會議日期','待辦事項','負責人','截止日期','狀態','備注','LINE提醒已發']]).setFontWeight('bold').setBackground('#cfe2f3');
  s.getRange(2,1,12,7).setValues([
    ['2026-09-07','Q4 促銷方案初稿','周主任','2026-09-14','已完成','9/14 週會已報告','已發'],
    ['2026-09-07','新款 KV-N200 開模報價（三家）','張經理','2026-09-18','逾期','只收到兩家','已發'],
    ['2026-09-07','倉庫盤點差異說明','劉課長','2026-09-12','已完成','差異 0.8%','已發'],
    ['2026-09-07','員工旅遊問卷發放','黃經理','2026-09-15','已完成','回收率 71%','已發'],
    ['2026-09-07','ERP 報表模組升級測試','吳工程師','2026-09-19','逾期','測試環境 9/17 才到','已發'],
    ['2026-09-14','大興通路 Q4 訂單確認','陳經理','2026-09-23','進行中','對方採購請假中',''],
    ['2026-09-14','八月應收帳齡表','林經理','2026-09-21','進行中','',''],
    ['2026-09-14','官網產品頁改版需求書','周主任','2026-09-25','進行中','',''],
    ['2026-09-14','品保人員招募面試安排','黃經理','2026-09-30','進行中','',''],
    ['2026-09-14','10 月生產排程草案','劉課長','2026-09-24','進行中','等訂單數',''],
    ['2026-09-14','公司車保險續約比價','林經理','2026-09-26','進行中','',''],
    ['2026-09-14','LINE 官方帳號回覆流程整理','周主任','2026-10-02','進行中','',''],
  ]);
  SpreadsheetApp.getUi().alert('示範資料建立完成！\n12 筆待辦（3 筆已完成／2 筆逾期／7 筆進行中，涼風實業虛構）。\n點「套用狀態顏色格式」再拍截圖 A；點「檢查到期待辦 & 發 LINE 提醒」拍截圖 B、C。');
}
