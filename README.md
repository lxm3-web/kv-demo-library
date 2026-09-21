# KV Demo Library — 智谷 AI 工作流 Demo 素材庫

ai.kvalley.biz 上 11 套 demo 的完整素材：假資料、AI 版（Gem／GPTs）指令、Sheet 選單版 Code.gs、展示腳本。
網站：https://ai.kvalley.biz/

## 每題資料夾結構

| 資料夾 | 放什麼 |
|---|---|
| `01_輸入假資料/` | demo 用的虛構資料（CSV／md），Gem 知識庫與 Agent repo 用同一份 |
| `02_AI設定/` | Gem／GPTs 指令貼上用、知識檔合併版 |
| `03_範例產出/` | Agent 版實跑一次的完整產出 |
| `04_實作站/` | Google Sheet 選單版 Code.gs 與安裝說明 |
| `05_展示腳本/` | 業務 demo 時打哪句、它回什麼、旁邊怎麼講 |

## Agent 版程式（各自獨立 repo）

| # | 題名 | Repo |
|---|---|---|
| 01 | 採購異常處理 | https://github.com/lxm3-web/procurement-agent |
| 02 | 電話行銷話術助理 | https://github.com/lxm3-web/telesales-agent |
| 03 | 訂戶數據儀表板助手 | https://github.com/lxm3-web/dashboard-agent |
| 04 | 會費對帳催繳助理 | https://github.com/lxm3-web/dues-agent |
| 05 | 讀書會訪綱專家 | https://github.com/lxm3-web/bookclub-agent |
| 06 | 品牌人物訪綱助理 | https://github.com/lxm3-web/interview-agent |
| 07 | 客訴分級助理 | https://github.com/lxm3-web/complaint-agent |
| 08 | SCAR 供應商矯正單助理 | https://github.com/lxm3-web/scar-agent |
| 09 | 履歷篩選面試安排助理 | https://github.com/lxm3-web/hiring-agent |
| 10 | 會議決議追蹤交辦助理 | https://github.com/lxm3-web/meeting-agent |
| 11 | 品牌社群輿情監控助理 | https://github.com/lxm3-web/listening-agent |

Gem／Sheet 連結與建置狀態見 `00_編號對照總表.md`。

## 注意

- 所有人名、公司、數字皆為虛構，僅供教學示範。
- `Code.gs`／`openapi.yaml` 裡的 `{{WEBAPP_URL}}`、`{{SECRET}}` 是佔位符，部署時自行填入。
- `01_輸入假資料` 的 CSV 為無 BOM 的 UTF-8（Gem 知識庫需要）；用 Excel 直接開中文會亂碼，請用 Google Sheets 匯入。
