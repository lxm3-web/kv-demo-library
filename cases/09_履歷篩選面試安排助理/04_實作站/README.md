# 04 實作站 — Google Sheet 選單「👥 招募助手」（自動化串接）

`Code.gs` 來自 Notion Case 19（Eric）：`setupDemoData()` 建「候選人追蹤」表、發面試邀請 Email（Calendly 連結）、彙整主管評核。
安裝：open@ 建 Sheet → 擴充功能 → Apps Script → 貼 → 執行 setupDemoData() → Script Properties 設 CALENDLY_URL → 重整。Sheet 網址待建後填設定卡。

**2026-10-01 補：「候選人追蹤」表加了 B 欄「去識別化代號」**，跟姓名同一列、收件當下一起填，`showOllamaPrompt()` 也改成要求 AI 輸出時把代號原樣帶回。發信（`sendInterviewEmails`）、彙整（`aggregateEvaluations`）都改用代號對列，不是人資憑記憶把 Ollama 分數貼回正確的人。原版（A=姓名 B=應徵職位…，完全沒有代號欄）就是本案「人資怎麼確保代號對回的是同一人」這個缺口的來源，對照表示範檔見 `01_輸入假資料/代號對照表.md`。
