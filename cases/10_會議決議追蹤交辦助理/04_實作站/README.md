# 04 實作站 — Google Sheet 選單「📋 會議追蹤助手」（自動化串接）

`Code.gs` 改自 Notion Case 30（Eric）：`setupDemoData()` 建「待辦追蹤」表（12 筆涼風實業虛構待辦）、「產出 AI 萃取 Prompt」把會議記錄包成 prompt 貼進 Gem／Claude、「檢查到期待辦」掃逾期與 2 天內到期並推 LINE、每日 09:00 觸發、狀態顏色。

改了兩處：原碼 alert 字串裸換行會語法錯誤（已修）；LINE Notify 2025-03-31 停服，`pushLine` 改成 LINE Messaging API push（Script Properties 設 `LINE_CHANNEL_TOKEN`、`LINE_TO`）。

安裝：open@ 建 Sheet → 擴充功能 → Apps Script → 貼 → 執行 `setupDemoData()` → 重整 → 選單出現。Sheet 網址待建後填設定卡。
