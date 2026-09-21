# 01 採購異常處理 — 設定卡

| 項目 | 內容 |
|---|---|
| 一句話 | 供應商說要延遲，AI 立刻查庫存撐幾天、哪些訂單受影響、備援供應商夠不夠、該誰核准，並寫進異常紀錄 |
| 情境 | 「小明的一天」：網通代工廠（數據機、路由器）採購／生產單位 |
| 來源 | 華城直接班 Demo E／雁博 IGNITE 0821 講師示範（Jimmy 設計） |
| 盤點 #／KV 碼 | #8／— |
| 示範料號 | **AB123**（晶片A）：撐 1 天、PO-060＋PO-120 共 1,260、備援 251、缺口 1,009、核准 procurement_director |
| AI 版 | ChatGPT GPTs「採購異常處理 AI 助理」＋ Action → GAS → Google Sheet。網址 https://chatgpt.com/g/g-6aaa4f3b176c8191a24408fdc097a0f5（**只有登入 open@asia-learning.com 可用**，OpenAI 已取消連結分享） |
| Agent 版（CC） | https://github.com/lxm3-web/procurement-agent （私人 repo）；本體 `02_AI設定/cc/procurement-agent/`，clone 後 `claude` 三句：掃一下 → 處理 AB123 → 好，寄 |
| 資料庫 | Google Sheet「(new)採購異常處理_AI資料庫 的副本」`1drsIQsef0R-Kxf3lccrOr6-FYX8O9r9sufl1mNdx5gU`（open@ 持有） |
| 後端 | Apps Script Web App（open@ 部署，2026-09-16），程式碼 `02_AI設定/Code.gs`；網址與 secret 在本機 `_secrets/01.env`，不進 Drive |
| 重置 | 多場 demo 後叫 Kyo 跑 `resetDemoData`，incident_log 回到 51 列種子 |
| 資料夾 | `01_輸入假資料/`（5 張表 CSV）｜`02_AI設定/`（gpts.md、openapi.yaml、Code.gs、cc.md）｜`03_範例產出/`｜`04_實作站/`（無）｜`05_展示腳本/` |
| 跟 Jimmy 的關係 | 完全獨立：他的 GPT／GAS／Sheet 不動，兩邊平行跑 |
