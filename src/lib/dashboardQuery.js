/**
 * Build an API URL with the global dashboard filter set applied.
 *
 * Accepts the shape produced by `useDashboardFilters()` (camelCase) and the
 * legacy `useDateFilter()` shape (also camelCase, date-only). Unknown keys
 * are ignored. Empty / null values are skipped so the backend treats the
 * dimension as "no filter".
 */

const PARAM_MAP = [
  ["dateFrom", "date_from"],
  ["dateTo", "date_to"],
  ["installer", "installer"],
  ["salesTeam", "sales_team"],
  ["leadSource", "lead_source"],
  ["manager", "manager"],
  ["market", "market"],
  ["repKind", "rep_kind"],
  ["repName", "rep_name"],
];

export function dashboardQueryUrl(path, filterParams) {
  const fp = filterParams && typeof filterParams === "object" ? filterParams : {};
  const qs = new URLSearchParams();
  for (const [src, dst] of PARAM_MAP) {
    const value = fp[src];
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text.length === 0) continue;
    qs.set(dst, text);
  }
  const q = qs.toString();
  return q ? `${path}?${q}` : path;
}
