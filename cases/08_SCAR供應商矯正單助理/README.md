# 08 SCAR 供應商矯正單助理 — 設定卡

| 項目 | 內容 |
|---|---|
| 一句話 | 從本月 24 筆進料異常裡自己找出該開單的供應商，照正式格式出 SCAR（根因與矯正措施留給供應商填）；Agent 版把該開的全開、寄件信與追蹤表一起建 |
| 情境 | 連接器加工廠（華城直接班「小明的一天」課堂虛構）品保部；六家虛構供應商 |
| 來源 | 華城直接班 Demo B：Gem「連接器加工廠_SCAR稽核助理」指令（原文照用）＋ 24 筆假資料表＋ `DEMO_SCAR產生器.html`（Kvalley-1/huacheng-ai-facilitator L6-教具） |
| 盤點 #／KV 碼 | #10／— |
| AI 版 | Gemini Gem「SCAR稽核助理」：指令 `02_AI設定/Gem指令_貼上用.txt`，知識檔＝`01_輸入假資料/本月進料異常記錄.csv`（原版掛 Google Sheet，需 AI Pro）；網址待 Kyo 建好填 |
| 實作站 | `04_實作站/SCAR產生器.html`（貼 Gem 回覆 → A4 報告）；網站 `lab/08-scar-generator.html`、`lab/08-scar-sample.html` |
| Agent 版 | https://github.com/lxm3-web/scar-agent （私人）；開 Agent＝`claude.ai/code?repositories=lxm3-web/scar-agent&prompt=品保主管的指示在 inbox，該開的 SCAR 開一開` |
| 實跑結果 | 開單 3 家（元展 6／誠鎰 5／大昇 5，皆連續三週再發）、觀察 3 家；三份 SCAR＋三封信＋追蹤表＋月報；`03_範例產出/cc/` |
