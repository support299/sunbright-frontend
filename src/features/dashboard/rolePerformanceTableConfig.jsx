/** Shared columns + row builders for /role-performance/ and Master Dashboard. */

export function rolePerformancePct(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  return Number.isNaN(n) ? "—" : `${n.toFixed(1)}%`;
}

export function rolePerformanceNum(v) {
  if (v == null || v === "") return "0";
  return Number(v).toLocaleString();
}

const numCell = (v, row) =>
  row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v);

const pctCell = (v, row) =>
  row.agent === "Total" ? <strong>{rolePerformancePct(v)}</strong> : rolePerformancePct(v);

export const ROLE_PERFORMANCE_SETTER_COLUMNS = [
  { key: "agent", label: "Agent" },
  { key: "role", label: "Sunbase Role" },
  { key: "crew", label: "Crew" },
  {
    key: "allDoors",
    label: "All Doors",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "contactsMade",
    label: "Contacts Made",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "appointmentDoorsHeuristic",
    label: "Appts (door-ish)",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "appointments",
    label: "Appointments",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "sitdowns",
    label: "Sitdowns",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "qfdSitdowns",
    label: "QFD Sitdowns",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "allJobs",
    label: "All Jobs",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "jobsCancelled",
    label: "Jobs Cancelled",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "activeDeals",
    label: "Active Deals",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "jobsOnHold",
    label: "Jobs On Hold",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "totalInstall",
    label: "Total Install",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "contactRate",
    label: "Contact Rate",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformancePct(v)}</strong> : rolePerformancePct(v),
  },
  {
    key: "apptSchedRatio",
    label: "Appt / Contact",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformancePct(v)}</strong> : rolePerformancePct(v),
  },
  {
    key: "sitDownRate",
    label: "Sit / Appt",
    format: pctCell,
  },
  { key: "cleanDeals", label: "Clean Deals", format: numCell },
  { key: "cleanPct", label: "Clean %", format: pctCell },
  { key: "cancellationRate", label: "Cancel %", format: pctCell },
  { key: "netRetentionRate", label: "Retention", format: pctCell },
];

export const ROLE_PERFORMANCE_CLOSER_COLUMNS = [
  { key: "agent", label: "Agent" },
  { key: "role", label: "Sunbase Role" },
  { key: "crew", label: "Crew" },
  {
    key: "allDoors",
    label: "All Doors",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "contactsMade",
    label: "Contacts Made",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "appointmentsSelfGen",
    label: "Appts Self Gen",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "appointmentsLeadGen",
    label: "Appts Lead Gen",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "totalAppointments",
    label: "Total Appts",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "sitsSelfGen",
    label: "Sits Self Gen",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "sitsLeadGen",
    label: "Sits Lead Gen",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "totalSits",
    label: "Total Sits",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "qfdSitsSelfGen",
    label: "QFD Sits Self",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "qfdSitsLeadGen",
    label: "QFD Sits Lead",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "totalQfdSits",
    label: "Total QFD Sits",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "dealsSelfGen",
    label: "Deals Self Gen",
    format: (v, row) =>
      row.agent === "Total" ? <strong>{rolePerformanceNum(v)}</strong> : rolePerformanceNum(v),
  },
  {
    key: "dealsLeadGen",
    label: "Deals Lead Gen",
    format: numCell,
  },
  { key: "totalDeals", label: "Total Deals", format: numCell },
  { key: "allJobs", label: "All Jobs", format: numCell },
  { key: "activeDeals", label: "Active Deals", format: numCell },
  { key: "jobsCancelled", label: "Cancelled", format: numCell },
  { key: "cleanDeals", label: "Clean Deals", format: numCell },
  { key: "totalInstall", label: "Total Install", format: numCell },
  { key: "sitDownRate", label: "Sit / Appt", format: pctCell },
  { key: "closingRate", label: "Close / Sit", format: pctCell },
  { key: "cleanPct", label: "Clean %", format: pctCell },
  { key: "cancellationRate", label: "Cancel %", format: pctCell },
  { key: "netRetentionRate", label: "Retention", format: pctCell },
];

export function buildRolePerformanceSetterRows(bundle) {
  const setters = bundle?.setters ?? [];
  const setterTotals = bundle?.setterTotals;
  return setterTotals ? [...setters, setterTotals] : setters;
}

export function buildRolePerformanceCloserRows(bundle) {
  const closers = bundle?.closers ?? [];
  const closerTotals = bundle?.closerTotals;
  return closerTotals ? [...closers, closerTotals] : closers;
}
