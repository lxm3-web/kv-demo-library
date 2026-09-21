# 01 輸入假資料 — 採購異常處理

> ⚠️ 教學用假資料，公司、料號、訂單、供應商全部虛構。
> 正本：Google Sheet「(new)採購異常處理_AI資料庫 的副本」（Drive `01 採購異常處理/` 內，ID `1drsIQsef0R-Kxf3lccrOr6-FYX8O9r9sufl1mNdx5gU`）。
> 這裡的 CSV 是 2026-09-16 匯出的快照，正本改了要重抓。

| 分頁 | 筆數 | 欄位 |
|---|---|---|
| inventory | 59 | material_code／material_name／current_stock／safety_stock／daily_usage |
| production_schedule | 119 | order_id／customer／material_code／production_date／quantity／priority |
| vendors | 119 | vendor_name／material_code／lead_time_days／price_delta_percent／available_qty |
| policy | 49 | rule_id／condition／approval_level／description |
| incident_log | 52 | timestamp／material_code／issue／delay_days／days_remaining／impacted_orders／backup_vendor／risk_level／summary…（示範時 append 到最後一列） |

**示範料號固定用 `AB123`（晶片A）**：庫存 20／安全庫存 80／日耗 20 → 只撐 1 天；受影響訂單 PO-060＋PO-120（Alpha Motors，皆 high，共 1,260 支）；備援 CoreSupply＋BoardKing 合計只有 251 支。資料本身就把故事講完。
