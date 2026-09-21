# 03 訂戶數據儀表板助手 — 設定卡

| 項目 | 內容 |
|---|---|
| 一句話 | 三個事業體格式不同的訂戶表，去敏後串成一張圖：誰快流失、誰值得留、電銷先打誰 |
| 情境 | 觀點週刊（虛構）顧客運營處，每月 5 號要月報 |
| 來源 | 課堂示範 Demo D「訂戶數據儀表版助手」（原 Gem 無知識檔、功能為去識別化整合＋互動儀表板；指令依此重寫、去識別化） |
| 盤點 #／KV 碼 | #20／— |
| AI 版 | **Gemini Gem**「訂戶數據儀表板助手」：指令 `02_AI設定/Gem指令_貼上用.txt`，不掛知識檔（資料每次上傳）；網址 https://gemini.google.com/gem/1Bpuj8p2hRLg5qBGFd9lG6HEPbDQvY7Jz?usp=sharing （open@ 建，知道連結可檢視） |
| Agent 版 | https://github.com/lxm3-web/dashboard-agent （私人）；本體 `02_AI設定/cc/dashboard-agent/`；開 Agent＝`claude.ai/code?repositories=lxm3-web/dashboard-agent&prompt=林經理的指示在 inbox，出月報` |
| 實作站 | `04_實作站/資料脫敏器.html`、`訂閱流失預警儀表板.html`（課堂教具去品牌化）；網站 `lab/03-deid.html`、`lab/03-dashboard.html` |
| 假資料 | `01_輸入假資料/`：600 個假人；訂閱 300（中文欄、民國日期）、App 220（英文欄、ISO、Email 大寫混雜）、商城 500 筆交易（8 碼日期）；三表刻意部分重疊 |
| 實跑結果 | 439 人／有效 200／到期預警 45／高風險 24／建議先聯絡 4；儀表板 HTML（黑金、純 SVG）在 `03_範例產出/cc/` |
| 資料夾 | `00_主人提供/`（空）｜`01_輸入假資料/`｜`02_AI設定/`（gem.md、Gem 指令 txt、cc/）｜`03_範例產出/`｜`04_實作站/`｜`05_展示腳本/` |
