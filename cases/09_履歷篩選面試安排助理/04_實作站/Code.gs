/**
 * Case 19 · 職缺履歷篩選到面試安排流程
 * ⚠️  履歷分析須使用公司內部 Local LLM（Ollama），嚴禁上傳個資至雲端 AI
 *
 * 工具：Local LLM (Ollama + LLaMA3) + Google Sheets + GAS + Calendly
 *
 * 工作表結構：
 *   「候選人追蹤」 A=姓名 / B=去識別化代號 / C=應徵職位 / D=來源平台 / E=AI評分(1-5) /
 *                  F=符合度說明 / G=面試狀態 / H=Calendly連結 / I=主管評核分
 *   「主管評核彙整」GAS 自動建立
 *
 * ⚠️  B 欄「去識別化代號」必須在收到履歷、還沒去識別化之前就填，
 *     跟 A 欄姓名同一列、同一個人、同一個動作一次性指定，之後不可重編。
 *     貼去 Ollama 的去識別化文字開頭也要帶同一個代號；Ollama 輸出評分時
 *     一併回填代號（見 showOllamaPrompt），這樣分數貼回表格是「比代號」，
 *     不是人資憑記憶比對哪一段文字是哪一位。
 *
 * Script Properties：
 *   CALENDLY_URL   公司 Calendly 面試連結（https://calendly.com/...）
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('👥 招募助手')
    .addItem('0. 灌 demo 資料', 'setupDemoData')
    .addItem('發送面試邀請 Email（評分≥3.5）', 'sendInterviewEmails')
    .addItem('彙整主管評核', 'aggregateEvaluations')
    .addSeparator()
    .addItem('顯示 Ollama 履歷評分 Prompt 範本', 'showOllamaPrompt')
    .addToUi();
}

function sendInterviewEmails() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('候選人追蹤');
  if (!sheet) { SpreadsheetApp.getUi().alert('找不到候選人追蹤工作表'); return; }

  const calendly = PropertiesService.getScriptProperties().getProperty('CALENDLY_URL')
    || 'https://calendly.com/your-company/interview（請先在 Script Properties 設定 CALENDLY_URL）';

  const data = sheet.getDataRange().getValues().slice(1)
    .map((r, i) => ({ r, i, score: Number(r[4]), status: String(r[6]) }))
    .filter(x => x.score >= 3.5 && !x.status);

  if (!data.length) { SpreadsheetApp.getUi().alert('無符合條件的候選人（AI評分≥3.5 且未發過邀請）。'); return; }

  data.forEach(({ r, i }) => {
    const name = r[0], code = r[1], pos = r[2];
    // ⚠️ 正式部署時：將候選人 Email 存入 J 欄，取消下方 MailApp 注解
    // 寄送前務必核對：這一列的代號（r[1]）要跟 AI 評分來源的去識別化代號一致
    // MailApp.sendEmail({ to: r[9], subject: `【面試邀請】${pos}－${name}`, body: buildEmailBody(name, pos, calendly) });
    Logger.log(`[模擬] 已發邀請給 ${name}（代號 ${code}｜${pos}）`);
    sheet.getRange(i + 2, 7).setValue('已發邀請');
    sheet.getRange(i + 2, 8).setValue(calendly);
  });
  SpreadsheetApp.getUi().alert(`已處理 ${data.length} 位候選人邀請（模擬模式，真實部署請取消 MailApp 注解並補上 Email 欄位）。`);
}

function buildEmailBody(name, pos, calendlyUrl) {
  return `親愛的 ${name} 您好，

感謝您應徵「${pos}」職缺，您的履歷已通過初篩！
請點以下連結選擇面試時段：
${calendlyUrl}

面試為線上視訊（30 分鐘），請提前 5 分鐘準備好視訊環境。

期待與您的會面！
人力資源部`;
}

function aggregateEvaluations() {
  const ss = SpreadsheetApp.getActive();
  const track = ss.getSheetByName('候選人追蹤');
  let evalOut = ss.getSheetByName('主管評核彙整') || ss.insertSheet('主管評核彙整');
  evalOut.clearContents();
  evalOut.getRange(1,1,1,6).setValues([['姓名','代號','應徵職位','AI評分','主管評核分','建議']]).setFontWeight('bold').setBackground('#e3d4f5');

  const rows = track.getDataRange().getValues().slice(1).filter(r => r[0]).map(r => {
    const mgr = Number(r[8]);
    const rec = mgr >= 4 ? '建議錄用' : mgr >= 3 ? '備取' : '婉拒';
    return [r[0], r[1], r[2], r[4], r[8], rec];
  });
  if (rows.length) evalOut.getRange(2,1,rows.length,6).setValues(rows);
  evalOut.autoResizeColumns(1,6);
  SpreadsheetApp.getUi().alert('主管評核已彙整至「主管評核彙整」工作表。');
}

function showOllamaPrompt() {
  const prompt = `【Ollama 履歷評分 Prompt 範本】
以下是一位應徵者的履歷（已去識別化，開頭帶去識別化代號），請根據職位條件評分並說明。

職位：[填入]
必要條件：[填入]
加分條件：[填入]

履歷內容（第一行是代號，例如「代號：C001」）：
[貼入去識別化後的履歷文字]

請輸出：
代號：[原樣照抄履歷開頭的代號，不可省略]
評分：X 分（1-5）
符合度說明：[說明符合/缺少哪些條件]
建議後續：[進入面試 / 保留備取 / 婉拒]

⚠️ 此 Prompt 請在公司內部 Ollama 介面使用，勿上傳至 ChatGPT/Claude.ai 等雲端服務。
⚠️ 分數貼回 Sheet 時，用輸出的「代號」去對「候選人追蹤」表 B 欄找對應列，
   不要憑記憶用姓名或履歷內容去猜是哪一位。`;
  SpreadsheetApp.getUi().alert(prompt);
}

// ── 示範資料 ────────────────────────────────────────────────────────────────
function setupDemoData() {
  const ss = SpreadsheetApp.getActive();
  let s = ss.getSheetByName('候選人追蹤') || ss.insertSheet('候選人追蹤');
  s.clearContents();
  s.getRange(1,1,1,9).setValues([['姓名','代號','應徵職位','來源平台','AI評分(1-5)','符合度說明','面試狀態','Calendly連結','主管評核分']]).setFontWeight('bold').setBackground('#e3d4f5');
  // ⚠️ 代號在收件當下跟姓名一起填，示範用 R01–R08；實際使用時不可事後重編
  s.getRange(2,1,8,9).setValues([
    ['林柏宏','R01','資深工程師','104人力銀行',4.2,'8年PHP/Laravel，符合技術條件，英文佳','已錄用','','4'],
    ['許雅婷','R02','行銷專員','LinkedIn',3.8,'4年數位行銷，社群管理經驗豐富','已發邀請','','3'],
    ['王大仁','R03','資深工程師','CakeResume',2.1,'僅2年PHP，無團隊帶領經驗','婉拒','',''],
    ['陳佳蓉','R04','HR Specialist','104人力銀行',4.5,'6年HR，擅長招募與薪酬管理','已錄用','','4.5'],
    ['張文彥','R05','行銷專員','LinkedIn',3.1,'3年傳統廣告，數位經驗不足','備取','',''],
    ['劉雨潔','R06','HR Specialist','CakeResume',3.9,'5年HR，人力規劃經驗強','已發邀請','','3.5'],
    ['陳冠宇','R07','資深工程師','104人力銀行',4.0,'6年Java/Spring，需補強PHP','已發邀請','',''],
    ['黃怡如','R08','行銷專員','CakeResume',4.1,'5年品牌行銷，電商經驗豐富','已發邀請','',''],
  ]);
  SpreadsheetApp.getUi().alert('示範資料建立完成！\n8 位候選人（評分 2.1-4.5），每位都帶去識別化代號 R01–R08。\n評分≥3.5 者點「發送面試邀請 Email」。');
}
