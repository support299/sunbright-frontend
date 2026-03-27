import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

const EMPTY_REPS = [];
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { TOOLTIP_STYLE } from "../../../lib/chartTheme";
import { formatCurrency } from "../../../lib/formatters";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import { useGetPerformanceQuery } from "../api/dashboardApi";

export default function RepPerformancePage() {
  const { filterParams } = useDateFilter();
  const { data: res, isLoading } = useGetPerformanceQuery(filterParams);
  const reps = res?.data?.reps ?? EMPTY_REPS;

  const [sortKey, setSortKey] = useState("totalProjects");
  const [sortDir, setSortDir] = useState("desc");

  const sorted = useMemo(() => {
    const arr = [...reps];
    if (sortKey && sortDir) {
      arr.sort((a, b) => {
        const aVal = Number(a[sortKey]) || 0;
        const bVal = Number(b[sortKey]) || 0;
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
    return arr;
  }, [reps, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "desc" ? "asc" : prev === "asc" ? null : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col || !sortDir) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 inline h-3 w-3 text-primary" />
    );
  };

  const chartData = useMemo(() => {
    return [...reps]
      .sort((a, b) => Number(b.totalProjects) - Number(a.totalProjects))
      .slice(0, 10)
      .map((r) => ({
        name: r.salesRep?.split(" ")[0] || "Unknown",
        fullName: r.salesRep,
        active: Number(r.activeProjects),
        cancelled: Number(r.cancelledProjects),
        onHold: Number(r.onHoldProjects),
      }));
  }, [reps]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rep Performance</h1>
          <p className="mt-1 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const columns = [
    { key: "salesRep", label: "Sales Rep", sortable: false },
    { key: "salesTeam", label: "Team", sortable: false },
    { key: "totalProjects", label: "Total", sortable: true },
    { key: "activeProjects", label: "Active", sortable: true },
    { key: "cancelledProjects", label: "Cancelled", sortable: true },
    { key: "onHoldProjects", label: "On Hold", sortable: true },
    { key: "cleanDealPct", label: "Clean %", sortable: true, format: (v) => (v != null ? `${v}%` : "—") },
    { key: "cancellationRate", label: "Cancel %", sortable: true, format: (v) => (v != null ? `${v}%` : "—") },
    { key: "netRetentionRate", label: "Net Retention", sortable: true, format: (v) => (v != null ? `${v}%` : "—") },
    { key: "avgDaysToInstall", label: "Avg Install", sortable: true, format: (v) => (v != null ? `${v}d` : "—") },
    { key: "activePipelineValue", label: "Pipeline $", sortable: true, format: (v) => formatCurrency(v) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rep Performance</h1>
        <p className="mt-1 text-muted-foreground">Individual sales rep metrics — click column headers to sort</p>
      </div>

      <Card className="gap-0 border-border bg-card py-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Top Reps — Project Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 11 }} />
                <YAxis stroke="oklch(0.6 0.015 260)" />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                />
                <Legend />
                <Bar dataKey="active" name="Active" fill="#22c55e" stackId="a" />
                <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" stackId="a" />
                <Bar dataKey="onHold" name="On Hold" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 border-border bg-card py-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">All Reps — Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`whitespace-nowrap px-3 py-3 text-left font-medium text-muted-foreground ${
                        col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""
                      }`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      {col.label}
                      {col.sortable ? <SortIcon col={col.key} /> : null}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 transition-colors hover:bg-accent/30">
                    {columns.map((col) => (
                      <td key={col.key} className="whitespace-nowrap px-3 py-3 text-foreground">
                        {col.format ? col.format(row[col.key]) : (row[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
