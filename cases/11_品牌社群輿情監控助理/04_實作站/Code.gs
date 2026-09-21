/**
 * KV Demo 11｜品牌社群輿情監控助理 — Google Sheet 選單「📣 AI 輿情助手」（自動化串接）
 *
 * 改自 Notion Case 33（怡臻）：欄位對齊 demo-library 11 的「輿情池.csv」，
 * 內建 setupDemoData() 一鍵灌 38 筆虛構評論（沐光家電，Google／FB／Dcard／PTT／蝦皮）。
 *
 * 工作流：
 *  1. 輿情池：小安人工貼入（實際部署可接 Make.com 定時抓取）
 *  2. 規則判讀：關鍵字判「情緒／嚴重度／摘要」——瞬間完成，但看不懂反諷、看不懂五星在罵
 *     （這正是 demo 的對比點：規則跑完，再開 Gem 或 Agent 版看 R006、R014、R023）
 *  3. 嚴重負評打包推 LINE 群（Messaging API）
 *  4. 月度趨勢：平台 × 正／中／負 分布與負評率
 *
 * 欄位（輿情池）：A 編號｜B 日期｜C 平台｜D 來源頁面｜E 帳號｜F 星等｜G 評論內容｜H 處理狀態｜I 備註｜J 情緒｜K 嚴重度｜L 摘要
 *
 * 設定（專案設定 → 指令碼屬性）：
 *  LINE_CHANNEL_TOKEN  LINE Messaging API Channel access token
 *  LINE_TO             推播對象 groupId／userId
 */

var SHEET_NAME = '輿情池';
var TREND_NAME = '月度趨勢';
var HEADER = ["編號", "日期", "平台", "來源頁面", "帳號", "星等", "評論內容", "處理狀態", "備註", "情緒", "嚴重度", "摘要"];
var DEMO_ROWS = [
  ["R001", "2026-09-03", "Google", "台北信義門市", "林**", "1", "除濕機水箱滿了不會自動停，水流出來把地板弄濕。", "已結案", "客服 9/4 電聯，安排換新機"],
  ["R002", "2026-09-05", "FB", "沐光家電粉專", "Chen Y.", "", "APP 一直連不上 wifi，設定十次了。", "已結案", "9/5 回覆：改連 2.4G"],
  ["R003", "2026-09-08", "蝦皮", "沐光官方商城", "w***7", "5", "除濕很快，安靜，很滿意。", "已結案", "已回覆感謝"],
  ["R004", "2026-09-10", "Dcard", "家電板", "匿名", "", "沐光 D12 跟 X 牌 12L 選哪台？", "已結案", "9/10 官方帳號回覆比較重點"],
  ["R005", "2026-09-15", "Google", "台北信義門市", "王**", "1", "水箱滿了不會自動停，上個月就反映過一次，客服說會處理，結果什麼都沒有。第二次了。", "未處理", ""],
  ["R006", "2026-09-15", "PTT", "e-shopping", "cooldog77", "", "沐光除濕機真的很棒，買三個月壞兩次，棒到我想哭 👍", "未處理", ""],
  ["R007", "2026-09-15", "蝦皮", "沐光官方商城", "a***3", "5", "吸塵器很好用，吸力夠。但出貨等了八天，客服回訊息要等一天。", "未處理", ""],
  ["R008", "2026-09-16", "FB", "沐光家電粉專", "Amy Liu", "", "昨晚 D12 運轉中有燒焦味，還冒白煙，我馬上拔插頭。這樣還能用嗎？很怕。", "未處理", ""],
  ["R009", "2026-09-16", "Dcard", "家電板", "匿名", "", "請問 D12 可以放浴室用嗎？洗完澡開一下，會不會有觸電風險？", "未處理", ""],
  ["R010", "2026-09-16", "Google", "台中公益門市", "張**", "5", "店員小林很專業，問什麼都答得出來，還幫我算電費。", "未處理", ""],
  ["R011", "2026-09-16", "Google", "台北信義門市", "咖啡控", "5", "沐光咖啡的拿鐵超好喝，燕麥奶也有。", "未處理", ""],
  ["R012", "2026-09-17", "蝦皮", "沐光官方商城", "k***9", "1", "收到就有刮傷，申請退貨三天沒人理。再不處理我要檢舉了。", "未處理", ""],
  ["R013", "2026-09-17", "Dcard", "家電板", "小房間除濕日記（追蹤 4.2 萬）", "", "沐光 A3 濾網三個月就要換，一片 890，一年濾網比機器還貴。不推。", "未處理", ""],
  ["R014", "2026-09-17", "FB", "沐光家電粉專", "Kevin Huang", "", "本來擔心會很吵很慢，結果超安靜，除濕也快。推薦給租屋族。", "未處理", ""],
  ["R015", "2026-09-17", "Google", "台北信義門市", "陳**", "5", "上次那台換新機已經收到了，謝謝客服小姐，處理很快。", "未處理", ""],
  ["R016", "2026-09-17", "PTT", "Lifeismoney", "buybuy_tw", "", "雙 11 前一週才買 D12，今天官網就打八折，很傻眼。有沒有價差補？", "未處理", ""],
  ["R017", "2026-09-18", "Google", "台中公益門市", "u**", "1", "爛", "未處理", ""],
  ["R018", "2026-09-18", "Google", "台中公益門市", "q**", "1", "爛透了", "未處理", ""],
  ["R019", "2026-09-18", "Google", "台中公益門市", "z**", "1", "不推", "未處理", ""],
  ["R020", "2026-09-18", "FB", "沐光家電粉專", "Peggy Wu", "", "打客服電話等了二十分鐘，接起來態度很差，講兩句就想掛。", "未處理", ""],
  ["R021", "2026-09-18", "Dcard", "租屋板", "匿名", "", "【心得】租屋族除濕實測：沐光 D12 用兩個月，濕度從 78 降到 55，附一週數據圖。", "未處理", ""],
  ["R022", "2026-09-18", "FB", "沐光家電粉專", "Amy Liu", "", "已經跟消保官申訴了，也聯絡了記者朋友。你們不回我就等著看。", "未處理", ""],
  ["R023", "2026-09-19", "蝦皮", "沐光官方商城", "m***2", "5", "五星是給物流，機器本身第二天就不會轉了。", "未處理", ""],
  ["R024", "2026-09-19", "Google", "台北信義門市", "Mark T.", "4", "Great dehumidifier, very quiet. Shipping was slow though (9 days).", "未處理", ""],
  ["R025", "2026-09-19", "Dcard", "家電板", "匿名", "", "空氣清淨機放窗邊、窗戶開著開整天，數值都沒變，是不是壞了？", "未處理", ""],
  ["R026", "2026-09-19", "FB", "沐光家電粉專", "Jason Lin", "", "APP 連不上 wifi，設定好幾次都失敗。", "未處理", ""],
  ["R027", "2026-09-19", "PTT", "e-shopping", "cooldog77", "", "沐光除濕機真的很棒，買三個月壞兩次，棒到我想哭 👍", "未處理", "（與 R006 同帳號同內容）"],
  ["R028", "2026-09-20", "FB", "沐光家電粉專", "Grace Ho", "", "😡😡😡", "未處理", ""],
  ["R029", "2026-09-20", "Google", "台北信義門市", "李**", "3", "D8 的遙控器壞了，哪裡買得到？門市說停產了。", "未處理", ""],
  ["R030", "2026-09-20", "FB", "沐光家電粉專", "Tina Chang", "", "我們公司想團購 20 台 A3，有窗口嗎？", "未處理", ""],
  ["R031", "2026-09-20", "Dcard", "家電板", "匿名", "", "【開箱】沐光 V2 無線吸塵器，寵物毛真的吸得起來，續航實測 38 分鐘。", "未處理", ""],
  ["R032", "2026-09-20", "蝦皮", "沐光官方商城", "h***5", "2", "跟照片顏色不一樣，實品比較暗。", "未處理", ""],
  ["R033", "2026-09-21", "Google", "台北信義門市", "黃**", "5", "除濕機 CP 值高，客服也有耐心。", "未處理", ""],
  ["R034", "2026-09-21", "PTT", "e-shopping", "rainyday88", "", "D12 水箱感應器有人更新韌體後就正常了嗎？我的還是會滿了不停。", "未處理", ""],
  ["R035", "2026-09-21", "FB", "沐光家電粉專", "Amy Liu", "", "三天了，沒有人打電話給我。", "未處理", ""],
  ["R036", "2026-09-21", "Dcard", "家電板", "匿名", "", "A3 用了半年，濾網指示燈亮了，官網訂閱制到底划不划算？", "未處理", ""],
  ["R037", "2026-09-21", "蝦皮", "沐光官方商城", "p***1", "4", "整體不錯，只是說明書字太小。", "未處理", ""],
  ["R038", "2026-09-21", "Google", "台中公益門市", "吳**", "2", "門市週日五點就關，上班族根本來不及。", "未處理", ""]
];

// ──────────────────────────────────────────────────────────
// 入口 0：灌 demo 資料（重灌會清掉現有內容）
// ──────────────────────────────────────────────────────────
function setupDemoData() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  sh.setName(SHEET_NAME);
  sh.clear();
  sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]).setFontWeight('bold').setBackground('#f3f4f6');
  sh.getRange(2, 1, DEMO_ROWS.length, DEMO_ROWS[0].length).setValues(DEMO_ROWS);
  sh.setFrozenRows(1);
  sh.setColumnWidth(7, 420);
  setupSheets_();
  SpreadsheetApp.getUi().alert('已灌入 ' + DEMO_ROWS.length + ' 筆評論（4 筆已結案、34 筆未處理），並建立「月度趨勢」與條件格式。');
}

// ──────────────────────────────────────────────────────────
// 入口 1：初始化補充工作表 + 條件格式
// ──────────────────────────────────────────────────────────
function setupSheets() {
  setupSheets_();
  SpreadsheetApp.getUi().alert('已建立「' + TREND_NAME + '」工作表 + 套用條件格式');
}
function setupSheets_() {
  var ss = SpreadsheetApp.getActive();
  if (!ss.getSheetByName(TREND_NAME)) {
    var t = ss.insertSheet(TREND_NAME);
    t.appendRow(['平台', '正評', '中性', '負評', '合計', '負評率']);
    t.setFrozenRows(1);
    t.getRange('A1:F1').setFontWeight('bold').setBackground('#f3f4f6');
  }
  applyConditionalFormat_();
}
function applyConditionalFormat_() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  var range = sh.getRange(2, 1, lastRow - 1, HEADER.length);
  var rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($J2="負",$K2="高")').setBackground('#fce4e4').setFontColor('#b91c1c')
      .setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND($J2="負",$K2="中")').setBackground('#fef3c7')
      .setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$J2="正"').setBackground('#d1fae5')
      .setRanges([range]).build()
  ];
  sh.setConditionalFormatRules(rules);
}

// ──────────────────────────────────────────────────────────
// 入口 2：規則判讀情緒 + 嚴重度 + 摘要（只跑「未處理」）
// ──────────────────────────────────────────────────────────
function analyzeAllReviews() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  var data = sh.getDataRange().getValues();
  var n = 0;
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    if (String(r[7]) !== '未處理') continue;
    var cls = classifyReview_(String(r[6] || ''));
    sh.getRange(i + 1, 10, 1, 3).setValues([[cls.sentiment, cls.severity, makeSummary_(String(r[6] || ''))]]);
    n++;
  }
  SpreadsheetApp.getUi().alert('已用規則判讀 ' + n + ' 則。提醒：規則看不懂反諷（R006）、看不懂「五星但在罵」（R023），這些要交給 AI 版。');
}
function classifyReview_(text) {
  var highMarkers = ['退款', '退貨', '檢舉', '消保官', '記者', '第二次', '客服態度', '態度很差', '冒煙', '冒白煙', '燒焦', '觸電', '沒人理', '沒有人打'];
  var negativeWords = ['失望', '抱怨', '壞', '慢', '不耐用', '斷', '糟', '爛', '差', '不符', '不推', '傻眼', '不會轉', '不一樣', '關', '沒效果', '連不上'];
  var positiveWords = ['推薦', '讚', '棒', '喜歡', '好用', '滿意', '不錯', '專業', '安靜', '謝謝', '處理很快', '耐心', 'CP 值', '👍'];
  var neutralQuestion = ['請問', '想問', '哪裡', '為什麼', '有沒有', '划不划算', '嗎？', '嗎?'];
  var hasHigh = highMarkers.some(function (k) { return text.indexOf(k) >= 0; });
  var neg = negativeWords.filter(function (k) { return text.indexOf(k) >= 0; }).length;
  var pos = positiveWords.filter(function (k) { return text.indexOf(k) >= 0; }).length;
  var isQ = neutralQuestion.some(function (k) { return text.indexOf(k) >= 0; });
  var sentiment, severity;
  if (hasHigh) { sentiment = '負'; severity = '高'; }
  else if (neg >= 2 && pos === 0) { sentiment = '負'; severity = '中'; }
  else if (neg > pos && !isQ) { sentiment = '負'; severity = neg >= 2 ? '中' : '低'; }
  else if (pos > neg) { sentiment = '正'; severity = '—'; }
  else { sentiment = '中'; severity = '—'; }
  return { sentiment: sentiment, severity: severity };
}
function makeSummary_(text) {
  return text.length > 22 ? text.slice(0, 22) + '…' : text;
}

// ──────────────────────────────────────────────────────────
// 入口 3：嚴重負評打包推 LINE
// ──────────────────────────────────────────────────────────
function alertHighSeverityToLine() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  var data = sh.getDataRange().getValues().slice(1);
  var hi = data.filter(function (r) { return r[9] === '負' && r[10] === '高' && String(r[7]) === '未處理'; });
  if (hi.length === 0) { SpreadsheetApp.getUi().alert('目前沒有嚴重負評（先跑「2. 規則判讀」）'); return; }
  var msg = '🚨 沐光客服告警 · 嚴重負評 ' + hi.length + ' 則\n\n' +
    hi.map(function (r) { return '• ' + r[0] + ' ' + r[2] + ' · ' + r[4] + '\n  「' + r[11] + '」'; }).join('\n\n') +
    '\n\n──────────\n請客服主管至 Sheet 認領處理。';
  pushLine_(msg);
  SpreadsheetApp.getUi().alert('已推 ' + hi.length + ' 則嚴重負評到 LINE 群組');
}

// ──────────────────────────────────────────────────────────
// 入口 4：月度趨勢統計
// ──────────────────────────────────────────────────────────
function monthlyTrend() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET_NAME);
  var trend = ss.getSheetByName(TREND_NAME);
  if (!trend) { SpreadsheetApp.getUi().alert('請先跑「1. 初始化補充工作表」'); return; }
  var data = sh.getDataRange().getValues().slice(1);
  var platforms = {};
  data.forEach(function (r) {
    var p = r[2], s = r[9];
    if (!p || !s) return;
    if (!platforms[p]) platforms[p] = { 正: 0, 中: 0, 負: 0 };
    if (platforms[p][s] !== undefined) platforms[p][s] += 1;
  });
  var lr = trend.getLastRow();
  if (lr > 1) trend.getRange(2, 1, lr - 1, 6).clearContent();
  var out = Object.keys(platforms).sort().map(function (p) {
    var c = platforms[p]; var total = c.正 + c.中 + c.負;
    return [p, c.正, c.中, c.負, total, total ? Math.round(c.負 / total * 100) + '%' : '0%'];
  });
  if (out.length) trend.getRange(2, 1, out.length, 6).setValues(out);
  SpreadsheetApp.getUi().alert('月度趨勢已更新（' + out.length + ' 個平台）');
}

// ──────────────────────────────────────────────────────────
// 入口 5：重置 demo（清 J/K/L 與趨勢，處理狀態不動）
// ──────────────────────────────────────────────────────────
function resetDemo() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(SHEET_NAME);
  var trend = ss.getSheetByName(TREND_NAME);
  var lr = sh.getLastRow();
  if (lr > 1) sh.getRange(2, 10, lr - 1, 3).clearContent();
  if (trend) { var t = trend.getLastRow(); if (t > 1) trend.getRange(2, 1, t - 1, 6).clearContent(); }
  SpreadsheetApp.getUi().alert('已重置：清空情緒／嚴重度／摘要與月度趨勢，可從 Step 2 重新跑');
}

// ──────────────────────────────────────────────────────────
// LINE Messaging API push
// ──────────────────────────────────────────────────────────
function pushLine_(text) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('LINE_CHANNEL_TOKEN');
  var to = props.getProperty('LINE_TO');
  if (!token || !to) { Logger.log('⚠️ LINE_CHANNEL_TOKEN / LINE_TO 未設定。內容：\n' + text); return; }
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ to: to, messages: [{ type: 'text', text: text }] }),
    muteHttpExceptions: true
  });
}

// ──────────────────────────────────────────────────────────
// 自訂選單
// ──────────────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📣 AI 輿情助手')
    .addItem('0. 灌 demo 資料（38 筆）', 'setupDemoData')
    .addItem('1. 初始化補充工作表', 'setupSheets')
    .addItem('2. 規則判讀情緒 + 嚴重度', 'analyzeAllReviews')
    .addItem('3. 嚴重負評推 LINE', 'alertHighSeverityToLine')
    .addItem('4. 月度趨勢統計', 'monthlyTrend')
    .addSeparator()
    .addItem('🔄 重置 demo', 'resetDemo')
    .addToUi();
}
