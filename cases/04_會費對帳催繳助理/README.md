# 04 會費對帳催繳助理 — 設定卡

| 項目 | 內容 |
|---|---|
| 一句話 | 會員名冊對銀行入帳，對出誰沒繳、誰繳錯、誰對不上，依逾期天數寫三種語氣的催繳信 |
| 情境 | 北區科技產業協會（虛構）秘書處，120 家會員、年費四級 |
| 來源 | 內科協會「對帳催繳」Gem（原 Gem 已刪，無法取得指令）＋ Notion Case 08 應收帳款催款（怡臻，GAS 選單＋Gemini 側邊欄）；客戶名去識別化 |
| 盤點 #／KV 碼 | Playbook #8／— |
| AI 版 | Gemini Gem「會費對帳催繳助理」：指令 `02_AI設定/Gem指令_貼上用.txt`，不掛知識檔（兩張表每次上傳）；網址 https://gemini.google.com/gem/1nNtjI0oDJWg1Mxc0tY7msFiDat2h-PLH?usp=sharing （open@ 建，知道連結可檢視） |
| 自動化串接 | `04_實作站/Code.gs`：Sheet 選單「對帳→帳齡分級→催繳優先清單→重置」（改寫自 Case 08）；Sheet 待 Kyo 在 open@ 建、匯入兩張 CSV、貼程式 |
| Agent 版 | https://github.com/lxm3-web/dues-agent （私人）；開 Agent＝`claude.ai/code?repositories=lxm3-web/dues-agent&prompt=秘書長的指示在 inbox，做本月催繳` |
| 假資料 | `01_輸入假資料/`：120 會員（含 4 組只差「股份」的同名公司）、100 筆入帳（匯款人名去後綴／用個人名／打碼、短繳、重複）、解答檔不給 AI |
| 實跑結果 | 已繳 60／短繳 13／重複 7／未繳 40／對不上 13 筆；警告 18／強調 15／提醒 20；60 封信；`03_範例產出/cc/` |
