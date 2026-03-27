import { Activity, PauseCircle, ShieldAlert, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DataTable from "../../../components/dashboard/DataTable";
import StatCard from "../../../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { REASON_COLORS, TOOLTIP_STYLE } from "../../../lib/chartTheme";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import {
  useGetCancellationReasonsQuery,
  useGetOnHoldReasonsQuery,
  useGetOverviewQuery,
  useGetRetentionQuery,
} from "../api/dashboardApi";

export default function RetentionPage() {
  const { filterParams } = useDateFilter();
  const { data: overviewRes, isLoading: loadingOverview } = useGetOverviewQuery(filterParams);
  const { data: cancelRes } = useGetCancellationReasonsQuery(filterParams);
  const { data: holdRes } = useGetOnHoldReasonsQuery(filterParams);
  const { data: retentionRes, isLoading: loadingRetention } = useGetRetentionQuery(filterParams);

  const loading = loadingOverview || loadingRetention;
  const o = overviewRes?.data || {};
  const cancelReasons = cancelRes?.data || [];
  const holdReasons = holdRes?.data || [];
  const retention = retentionRes?.data || {};
  const byRep = retention.byRep || [];
  const byTeam = retention.byTeam || [];
  const byInstaller = retention.byInstaller || [];
  const byLeadSource = retention.byLeadSource || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Retention Analysis</h1>
          <p className="mt-1 text-muted-foreground">Loading...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  const cancelPieData = cancelReasons.map((r) => ({
    name: r.reason,
    value: Number(r.count),
  }));

  const holdPieData = holdReasons.map((r) => ({
    name: r.reason,
    value: Number(r.count),
  }));

  const teamRetentionData = byTeam.map((t) => ({
    name: t.sales_team || "Unknown",
    netRetention: Number(t.netRetentionRate) || 0,
    cancellationRate: Number(t.cancellationRate) || 0,
    onHoldRate: Number(t.onHoldRate) || 0,
  }));

  const repCols = [
    { key: "sales_rep", label: "Sales Rep" },
    { key: "sales_team", label: "Team" },
    { key: "totalProjects", label: "Total" },
    { key: "activeProjects", label: "Active" },
    { key: "cancelledProjects", label: "Cancelled" },
    { key: "onHoldProjects", label: "On Hold" },
    { key: "cancellationRate", label: "Cancel %", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "onHoldRate", label: "Hold %", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "netRetentionRate", label: "Net Retention", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "avgDaysToCancel", label: "Avg Days to Cancel", format: (v) => (v != null ? `${v} days` : "—") },
  ];

  const teamCols = [
    { key: "sales_team", label: "Team" },
    { key: "totalProjects", label: "Total" },
    { key: "activeProjects", label: "Active" },
    { key: "cancelledProjects", label: "Cancelled" },
    { key: "onHoldProjects", label: "On Hold" },
    { key: "cancellationRate", label: "Cancel %", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "netRetentionRate", label: "Net Retention", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "avgDaysToCancel", label: "Avg Days to Cancel", format: (v) => (v != null ? `${v} days` : "—") },
  ];

  const installerCols = [
    { key: "installer", label: "Installer" },
    { key: "totalProjects", label: "Total" },
    { key: "activeProjects", label: "Active" },
    { key: "cancelledProjects", label: "Cancelled" },
    { key: "cancellationRate", label: "Cancel %", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "netRetentionRate", label: "Net Retention", format: (v) => (v != null ? `${v}%` : "—") },
  ];

  const leadCols = [
    { key: "lead_source", label: "Lead Source" },
    { key: "totalProjects", label: "Total" },
    { key: "cancelledProjects", label: "Cancelled" },
    { key: "onHoldProjects", label: "On Hold" },
    { key: "cancellationRate", label: "Cancel %", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "netRetentionRate", label: "Net Retention", format: (v) => (v != null ? `${v}%` : "—") },
  ];

  const totalProjectsForHold = Number(o.totalProjects) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Retention Analysis</h1>
        <p className="mt-1 text-muted-foreground">
          Track cancellations, on-hold projects, and net retention across all dimensions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Net Retention Rate"
          value={`${Number(o.netRetentionRate) || 0}%`}
          subtitle="Active / Total (excl. cancelled, hold, red flag)"
          icon={ShieldAlert}
        />
        <StatCard
          title="Cancellation Rate"
          value={`${Number(o.cancellationRate) || 0}%`}
          subtitle={`${Number(o.cancelledProjects) || 0} projects cancelled`}
          icon={TrendingDown}
        />
        <StatCard
          title="On Hold"
          value={Number(o.onHoldProjects) || 0}
          subtitle={totalProjectsForHold ? `${((Number(o.onHoldProjects) / totalProjectsForHold) * 100).toFixed(1)}% of total` : "—"}
          icon={PauseCircle}
        />
        <StatCard
          title="Active Projects"
          value={Number(o.activeProjects) || 0}
          subtitle={totalProjectsForHold ? `${((Number(o.activeProjects) / totalProjectsForHold) * 100).toFixed(1)}% of total` : "—"}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Cancellation Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={cancelPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ value }) => `${value}`} labelLine>
                    {cancelPieData.map((_, i) => (
                      <Cell key={i} fill={REASON_COLORS[i % REASON_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Net Retention by Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamRetentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                  <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="oklch(0.6 0.015 260)" domain={[0, 100]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                  <Legend />
                  <Bar dataKey="netRetention" name="Net Retention %" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancellationRate" name="Cancel %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {holdPieData.length > 0 ? (
        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">On Hold Reasons Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={holdPieData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                  <XAxis type="number" stroke="oklch(0.6 0.015 260)" />
                  <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11, fill: "oklch(0.6 0.015 260)" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="gap-0 border-border bg-card py-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Retention Metrics by Dimension</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rep" className="w-full">
            <TabsList className="bg-secondary">
              <TabsTrigger value="rep">By Rep</TabsTrigger>
              <TabsTrigger value="team">By Team</TabsTrigger>
              <TabsTrigger value="installer">By Installer</TabsTrigger>
              <TabsTrigger value="leadSource">By Lead Source</TabsTrigger>
            </TabsList>
            <TabsContent value="rep" className="mt-4">
              <DataTable data={byRep} columns={repCols} />
            </TabsContent>
            <TabsContent value="team" className="mt-4">
              <DataTable data={byTeam} columns={teamCols} />
            </TabsContent>
            <TabsContent value="installer" className="mt-4">
              <DataTable data={byInstaller} columns={installerCols} />
            </TabsContent>
            <TabsContent value="leadSource" className="mt-4">
              <DataTable data={byLeadSource} columns={leadCols} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
