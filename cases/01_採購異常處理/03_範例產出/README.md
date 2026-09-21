# 03 範例產出 — 採購異常處理

## AI 版（GPTs＋Action）實際回傳（2026-09-16 打雁博版端點）
- `getInventoryStatus_AB123.json`：庫存 20／安全庫存 80／日耗 20 → days_remaining 1、below_safety_stock true
- `getPolicyRules.json`：R001～R050 簽核規則

## Jimmy 2026-08-21 課前實測（逐字轉錄）
| 動作 | 回傳 |
|---|---|
| getImpactedOrders AB123 | 2 張，都是 Alpha Motors、都是 high：PO-060（920 支）＋PO-120（340 支）＝1,260 支 |
| getBackupVendors AB123 | CoreSupply（3 天／+5%／117 支）、BoardKing（4 天／+5%／134 支）→ 合計 251 支 |
| handleProcurementIncident AB123 延遲 14 天 | risk_level high、approval_required "yes: procurement_director"、selected_backup_vendor CoreSupply |

觸發規則：R003（high 優先級）／R004（庫存 < 3 天）／R006（替代供應量不足）／R009（低於安全庫存）。漲幅剛好 5% 不 > 5%，R001 不觸發。

## CC 版（2026-09-17 實跑一次，`cc/`）
- 觸發：`inbox/2026-09-17_晶芯科技_AB123_延遲通知.txt`
- 產出：詢價信 CoreSupply 117 件、BoardKing 134 件；交期協調信給業務陳專員（缺口 1,009）；incident_log 一列
- 數字：撐 1 天／需求 1,260／備援 251／缺口 1,009／high／採購主管核准——跟 AI 版同一份資料算出同一組數字
