# 10 會議決議追蹤交辦助理 — 設定卡

| 項目 | 內容 |
|---|---|
| 一句話 | 把秘書口語的週會記錄變成決議摘要與待辦表；Agent 版再對回上週待辦改狀態、一人一則交辦通知、逾期提醒、給總經理一頁摘要、沒人接的列出來問 |
| 情境 | 涼風實業（課堂虛構，電風扇廠）總經理室；主管週會八位主管；秘書小敏 |
| 來源 | Playbook #30「會議決議追蹤與待辦派發」（Eric，Notion Case 30：GAS 產 prompt → Claude 出 JSON → 手填 Sheet → LINE Notify）；資料全部重寫成虛構 |
| 盤點 #／KV 碼 | #30／— |
| AI 版 | Gemini Gem「會議秘書助理」：指令 `02_AI設定/Gem指令_貼上用.txt`，知識檔＝`01_輸入假資料/部門與窗口.md`；網址待 Kyo 建好填 |
| 實作站 | `04_實作站/Code.gs`（Sheet 選單「📋 會議追蹤助手」；修了裸換行、LINE Notify 停服改 Messaging API）；Sheet 網址待建後填 |
| Agent 版 | https://github.com/lxm3-web/meeting-agent （私人）；開 Agent＝`claude.ai/code?repositories=lxm3-web/meeting-agent&prompt=週會記錄在 inbox，幫我更新待辦` |
| 實跑結果 | 決議 8（1 不列）、新待辦 7（推測 1）＋待釐清 1、上週異動 9、逾期 1、問王總 4；更新後待辦表 T01–T20、摘要、7 則交辦通知、逾期提醒、待釐清；`03_範例產出/cc/` |
| 網站 | `case-10.html`（營運段）；牆 60 套 |

## 資料夾
- `01_輸入假資料/`：待辦追蹤 12 筆、9/21 週會口語記錄、部門與窗口、README（含設計的陷阱）
- `02_AI設定/`：Gem 指令（貼上用＋說明版）、`cc/meeting-agent/`（Agent 本體，同 GitHub）
- `03_範例產出/cc/`：實跑產出＋逐字稿＋log＋確認後正本
- `04_實作站/`：Code.gs＋安裝說明
- `05_展示腳本/`：業務展示用
