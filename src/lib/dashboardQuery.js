/** Build API path with optional customer-since filter (backend may ignore until wired). */
export function dashboardQueryUrl(path, filterParams) {
  const fp = filterParams && typeof filterParams === "object" ? filterParams : {};
  const qs = new URLSearchParams();
  if (fp.dateFrom) qs.set("date_from", fp.dateFrom);
  if (fp.dateTo) qs.set("date_to", fp.dateTo);
  const q = qs.toString();
  return q ? `${path}?${q}` : path;
}
