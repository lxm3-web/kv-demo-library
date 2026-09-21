# 02 電話行銷話術助理 — 設定卡

| 項目 | 內容 |
|---|---|
| 一句話 | 給一個主推商品，AI 替五種訂戶族群各寫一版 3 分鐘電話話術；Agent 版更進一步：讀完整份名單自己分群、排今天要打的 30 通、每通話術卡 |
| 情境 | 觀點週刊（虛構財經媒體）顧客運營處，電銷人員每天打續訂電話 |
| 來源 | 課堂示範「電銷話術機器人」（去識別化；原客戶名不出現） |
| 盤點 #／KV 碼 | #3／— |
| AI 版 | **Gemini Gem**「電話行銷話術助理」（備援：lxm3@ 的 Gemini Notebook https://notebook.google.com/notebook/4872d171-2028-47a3-811a-763d118854b9 ，只有被加入的人能開）：指令見 `02_AI設定/gem.md`，知識檔＝12 方案頁＋族群判讀規則。網址 https://gemini.google.com/gem/1VQqmnD8J-M7excbOYaQwu-MYnZqNQsK7?usp=sharing （open@ 建，知道連結可檢視） |
| Agent 版 | https://github.com/lxm3-web/telesales-agent （私人 repo）；本體 `02_AI設定/cc/telesales-agent/`；開 Agent＝`claude.ai/code?repositories=lxm3-web/telesales-agent&prompt=林經理丟了本週指示到 inbox，幫我排` |
| 假資料 | `01_輸入假資料/`：300 筆全虛構訂戶（五群 40/90/60/85/25）、12 方案頁（價格虛構）、族群判讀規則 |
| 示範 | 主推「紙本兩年」→ 只打群 3 企業決策領袖 60 人 → 前 30 通分給小美／阿凱／婷婷 → 一張 392 字話術卡 |
| 實跑產出 | `03_範例產出/cc/`（2026-09-18） |
| 資料夾 | `01_輸入假資料/`｜`02_AI設定/`（gem.md、cc/）｜`03_範例產出/`｜`04_實作站/`（無）｜`05_展示腳本/` |
