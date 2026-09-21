/**
 * 01 採購異常處理 — Google Apps Script Web App（公司版，指向 Drive「的副本」Sheet）
 * 2026-09-16 Kyo 的網頁設計師依 Jimmy 端點的實際回傳格式重寫；Jimmy 原始碼未取得。
 * 部署：擴充功能 → Apps Script → 貼上 → 部署 → 新增部署 → 網頁應用程式
 *       執行身分：我（open@）／誰可以存取：任何人 → 複製網址填進 _secrets/01.env
 */
const SHEET_ID = '1drsIQsef0R-Kxf3lccrOr6-FYX8O9r9sufl1mNdx5gU';
const SECRET   = '{{SECRET}}';   // 部署前換成 _secrets/01.env 的值；要換就同步改 GPT 指令與 openapi.yaml
const SEED_ROWS = 51;            // incident_log 種子資料列數（不含標題），resetDemoData 只保留這些

// approval_required 依風險等級（對齊 Jimmy 2026-08-21 實測：AB123 high → procurement_director）
const APPROVAL_BY_RISK = { high: 'procurement_director', medium: 'procurement_manager', low: null };

function doGet(e) {
  const p = (e && e.parameter) || {};
  let out;
  try {
    if (p.secret !== SECRET) throw new Error('Unauthorized');
    const code = (p.material_code || '').trim();
    switch (p.action) {
      case 'getInventoryStatus':        out = getInventoryStatus(code); break;
      case 'getImpactedOrders':         out = getImpactedOrders(code); break;
      case 'getBackupVendors':          out = getBackupVendors(code); break;
      case 'getPolicyRules':            out = getPolicyRules(); break;
      case 'createIncidentLog':         out = createIncidentLog(p); break;
      case 'handleProcurementIncident': out = handleProcurementIncident(code, p.issue || '', Number(p.delay_days || 0)); break;
      case 'resetDemoData':             out = resetDemoData(); break;
      default: throw new Error('Unknown action: ' + p.action);
    }
  } catch (err) {
    out = { ok: false, error: String(err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- 讀表 ----------
function rows(name) {
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
  if (!sh) throw new Error('Sheet not found: ' + name);
  const v = sh.getDataRange().getValues();
  const h = v[0];
  return v.slice(1).filter(r => r.join('') !== '').map(r => Object.fromEntries(h.map((k, i) => [k, r[i]])));
}

function getInventoryStatus(code) {
  if (!code) throw new Error('material_code required');
  const it = rows('inventory').find(r => String(r.material_code) === code);
  if (!it) throw new Error('Material not found: ' + code);
  const stock = Number(it.current_stock), safety = Number(it.safety_stock), usage = Number(it.daily_usage);
  return { ok: true, material_code: code, material_name: it.material_name, current_stock: stock,
    safety_stock: safety, daily_usage: usage,
    days_remaining: usage > 0 ? Math.floor(stock / usage) : null, below_safety_stock: stock < safety };
}

function getImpactedOrders(code) {
  if (!code) throw new Error('material_code required');
  const list = rows('production_schedule').filter(r => String(r.material_code) === code)
    .map(r => ({ order_id: r.order_id, customer: r.customer, material_code: r.material_code,
      production_date: fmt(r.production_date), quantity: Number(r.quantity), priority: r.priority }))
    .sort((a, b) => a.production_date.localeCompare(b.production_date));
  return { ok: true, material_code: code, impacted_orders: list, order_count: list.length,
    total_quantity: list.reduce((s, o) => s + o.quantity, 0) };
}

function getBackupVendors(code) {
  if (!code) throw new Error('material_code required');
  const list = rows('vendors').filter(r => String(r.material_code) === code)
    .map(r => ({ vendor_name: r.vendor_name, material_code: r.material_code, lead_time_days: Number(r.lead_time_days),
      price_delta_percent: Number(r.price_delta_percent), available_qty: Number(r.available_qty) }))
    .sort((a, b) => a.lead_time_days - b.lead_time_days || a.price_delta_percent - b.price_delta_percent);
  return { ok: true, material_code: code, backup_vendors: list, vendor_count: list.length,
    total_available_qty: list.reduce((s, v) => s + v.available_qty, 0) };
}

function getPolicyRules() {
  return { ok: true, rules: rows('policy').map(r => ({ rule_id: r.rule_id, condition: r.condition,
    approval_level: r.approval_level, description: r.description })) };
}

// ---------- 寫表 ----------
function appendLog(o) {
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('incident_log');
  const h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  sh.appendRow(h.map(k => o[k] !== undefined ? o[k] : ''));
  return sh.getLastRow();
}

function createIncidentLog(p) {
  const row = { timestamp: new Date(), material_code: p.material_code || '', issue: p.issue || '',
    delay_days: p.delay_days || '', days_remaining: p.days_remaining || '', affected_orders: p.affected_orders || '',
    backup_vendor: p.backup_vendor || '', risk_level: p.risk_level || '', suggested_action: p.suggested_action || '',
    approval_required: p.approval_required || '', status: p.status || 'open' };
  const n = appendLog(row);
  return { ok: true, message: 'Incident logged', row: n };
}

function handleProcurementIncident(code, issue, delayDays) {
  const inv = getInventoryStatus(code);
  const ord = getImpactedOrders(code);
  const ven = getBackupVendors(code);
  const required = ord.total_quantity;
  const best = ven.backup_vendors[0] || null;
  const ctx = {
    days_remaining: inv.days_remaining, current_stock: inv.current_stock, safety_stock: inv.safety_stock,
    delay_days: delayDays, required_qty: required, available_qty: ven.total_available_qty,
    price_delta_percent: best ? best.price_delta_percent : 0,
    priority_high: ord.impacted_orders.some(o => o.priority === 'high'),
    customer_strategic: ord.impacted_orders.some(o => String(o.priority) === 'strategic'),
    no_backup_vendor: ven.vendor_count === 0
  };
  // policy 分頁是 10 條 × 5 批次的重複，只取每種 condition 第一次出現的那條
  const seen = {};
  const triggered = getPolicyRules().rules.filter(r => {
    if (seen[r.condition]) return false;
    seen[r.condition] = true;
    return evalCondition(r.condition, ctx);
  });
  const risk = (inv.days_remaining !== null && inv.days_remaining < 3) || ctx.priority_high ? 'high'
             : inv.below_safety_stock || delayDays > 7 ? 'medium' : 'low';
  const top = APPROVAL_BY_RISK[risk];
  const gap = Math.max(0, required - ven.total_available_qty);
  const suggested = best
    ? `建議啟用備援供應商 ${best.vendor_name}（交期 ${best.lead_time_days} 天、漲幅 ${best.price_delta_percent}%），備援合計可補 ${ven.total_available_qty}，缺口 ${gap}；同步通知業務協調 ${ord.order_count} 筆訂單交期。`
    : '無備援供應商，建議立即召開會議協調交期。';
  const row = { timestamp: new Date(), material_code: code, issue: issue, delay_days: delayDays,
    days_remaining: inv.days_remaining, affected_orders: ord.impacted_orders.map(o => o.order_id).join(', '),
    backup_vendor: best ? best.vendor_name : '', risk_level: risk, suggested_action: suggested,
    approval_required: top ? 'yes: ' + top : 'no', status: 'open' };
  const n = appendLog(row);
  return { ok: true, message: 'Incident handled and logged', row: n, material_code: code, material_name: inv.material_name,
    days_remaining: inv.days_remaining, below_safety_stock: inv.below_safety_stock, delay_days: delayDays,
    impacted_orders: ord.impacted_orders, required_qty: required, backup_vendors: ven.backup_vendors,
    backup_total_qty: ven.total_available_qty, shortage_qty: gap, selected_backup_vendor: best ? best.vendor_name : null,
    risk_level: risk, triggered_rules: triggered.map(r => r.rule_id + ' ' + r.description.replace(/。?規則批次：\d+$/, '')),
    notify: [...new Set(triggered.map(r => r.approval_level))],
    approval_required: top ? 'yes: ' + top : 'no', suggested_action: suggested };
}

function resetDemoData() {
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName('incident_log');
  const last = sh.getLastRow(), keep = SEED_ROWS + 1;
  if (last > keep) sh.deleteRows(keep + 1, last - keep);
  return { ok: true, message: `incident_log reset to ${SEED_ROWS} seed rows`, removed: Math.max(0, last - keep) };
}

// ---------- 規則判斷（policy.condition 的 10 種寫法）----------
function evalCondition(cond, c) {
  cond = String(cond).trim();
  let m;
  if ((m = cond.match(/^(\w+)\s*(>|<|>=|<=)\s*([\d.]+)$/))) {
    const v = Number(c[m[1]]); const n = Number(m[3]);
    if (isNaN(v)) return false;
    return m[2] === '>' ? v > n : m[2] === '<' ? v < n : m[2] === '>=' ? v >= n : v <= n;
  }
  if (cond === 'current_stock < safety_stock') return c.current_stock < c.safety_stock;
  if (cond === 'available_qty < required_qty') return c.available_qty < c.required_qty;
  if (cond === 'priority = high') return c.priority_high;
  if (cond === 'customer_priority = strategic') return c.customer_strategic;
  if (cond === 'no_backup_vendor') return c.no_backup_vendor;
  return false;
}

function fmt(d) {
  return d instanceof Date ? Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(d);
}

// ---------- 素材庫上傳（網頁設計師用；POST JSON {secret, action:"putFile", path, content_b64, mime}）----------
const LIBRARY_ROOT_ID = '1UoiOzOfJ-RPHM8NBrNHD2kfqNYldYt_G';   // Drive「Demo Website 展示作…」

function doPost(e) {
  let out;
  try {
    const p = JSON.parse(e.postData.contents || '{}');
    if (p.secret !== SECRET) throw new Error('Unauthorized');
    if (p.action === 'putFile') out = putFile(p.path, p.content_b64, p.mime || 'application/octet-stream');
    else if (p.action === 'listFolder') out = listFolder(p.path || '');
    else throw new Error('Unknown action: ' + p.action);
  } catch (err) { out = { ok: false, error: String(err.message || err) }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function folderByPath(path, create) {
  let f = DriveApp.getFolderById(LIBRARY_ROOT_ID);
  path.split('/').filter(Boolean).forEach(name => {
    const it = f.getFoldersByName(name);
    if (it.hasNext()) f = it.next();
    else if (create) f = f.createFolder(name);
    else throw new Error('Folder not found: ' + name);
  });
  return f;
}

function putFile(path, b64, mime) {
  const parts = path.split('/'); const name = parts.pop();
  const folder = folderByPath(parts.join('/'), true);
  const blob = Utilities.newBlob(Utilities.base64Decode(b64), mime, name);
  const old = folder.getFilesByName(name);
  while (old.hasNext()) old.next().setTrashed(true);
  const file = folder.createFile(blob);
  return { ok: true, id: file.getId(), url: file.getUrl(), path: path, bytes: blob.getBytes().length };
}

function listFolder(path) {
  const folder = folderByPath(path, false), files = [], subs = [];
  const fi = folder.getFiles(); while (fi.hasNext()) { const f = fi.next(); files.push({ name: f.getName(), id: f.getId() }); }
  const si = folder.getFolders(); while (si.hasNext()) subs.push(si.next().getName());
  return { ok: true, path: path, folders: subs, files: files };
}
