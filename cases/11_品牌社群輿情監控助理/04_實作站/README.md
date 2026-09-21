# 04 實作站 — Google Sheet 選單「📣 AI 輿情助手」（自動化串接）

`Code.gs` 改自 Notion Case 33（怡臻）：欄位對齊本案 `輿情池.csv`（A–I），判讀結果寫 J 情緒／K 嚴重度／L 摘要；新增 `setupDemoData()` 一鍵灌 38 筆；LINE 推播用 Messaging API（Script Properties 設 `LINE_CHANNEL_TOKEN`、`LINE_TO`）。

**demo 的對比點**：規則判讀是關鍵字，跑完會看到 R006（反諷）被判「正」、R014（有「吵、慢」的好評）被判「負中」、R023（五星在罵）靠關鍵字才抓到——這時切到 Gem 或 Agent 版，同三則判得對。

安裝：open@ 建 Sheet → 擴充功能 → Apps Script → 貼 → 重整 → 選單「📣 AI 輿情助手」→ `0. 灌 demo 資料` → 依序 1～4。Sheet 網址待建後填設定卡。
