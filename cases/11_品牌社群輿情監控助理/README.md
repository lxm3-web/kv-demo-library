# 11 品牌社群輿情監控助理 — 設定卡

| 項目 | 內容 |
|---|---|
| 一句話 | 把五個平台一週的評論判情緒、嚴重度、主題；Agent 版再把同一人的多則串成一件、嚴重的打包 LINE 告警、每則寫平台格式的回覆草稿、給行銷經理一頁週報、沒政策的列出來問 |
| 情境 | 沐光家電（demo 虛構，D2C 小家電：除濕機 D12／清淨機 A3／吸塵器 V2）行銷部；社群小編小安、客服主管陳姐、行銷經理黃經理、產品部吳經理 |
| 來源 | Playbook #33「品牌社群輿情監控」（怡臻，Notion Case 33：Sheet＋GAS 關鍵字判讀 → LINE 推嚴重負評 → Sheets Gemini 側邊欄三種語氣草稿）；評論與品牌全部重寫成虛構 |
| 盤點 #／KV 碼 | #33／— |
| AI 版 | Gemini Gem「KV Demo 11｜品牌社群輿情監控助理」：指令 `02_AI設定/Gem指令_貼上用.txt`，知識檔＝`01_輸入假資料/品牌回應準則.md`＋`產品與常見問題.md`；https://gemini.google.com/gem/1YI3XviFTpu187xRgE36FiI4PgdpL_Hdz?usp=sharing |
| 實作站 | `04_實作站/Code.gs`（Sheet 選單「📣 AI 輿情助手」；改欄位、加 `setupDemoData()` 灌 38 筆、LINE Messaging API）；Sheet 網址待建後填 |
| Agent 版 | https://github.com/lxm3-web/listening-agent （私人）；開 Agent＝`claude.ai/code?repositories=lxm3-web/listening-agent&prompt=這週的評論在 inbox，幫我判讀` |
| 實跑結果 | 34 則判完：負 14（高 7，合併同一人後 5 件）、要回 26、待釐清 10；不計入 5（非本品牌 1、重複 1、疑似刷評 3）；反諷、五星在罵、影響力帳號、Amy Liu 三則串一件、24 小時 SOP 已破都抓到；還主動指出 R015 與 R001 帳號名對不上；`03_範例產出/cc/` |
| 網站 | `case-11.html`（行銷段）；牆 61 套 |

## 資料夾
- `01_輸入假資料/`：輿情池 38 則、品牌回應準則、產品與常見問題、README（含設計的陷阱）
- `02_AI設定/`：Gem 指令（貼上用＋說明版）、`cc/listening-agent/`（Agent 本體，同 GitHub）
- `03_範例產出/cc/`：實跑產出＋逐字稿＋log＋確認後正本
- `04_實作站/`：Code.gs＋安裝說明
- `05_展示腳本/`：業務展示用
