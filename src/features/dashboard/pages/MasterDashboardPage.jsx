import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  PauseCircle,
  ShieldCheck,
  Timer,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "../../../components/dashboard/ChartCard";
import DataTable from "../../../components/dashboard/DataTable";
import StatCard from "../../../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useDashboardFilters } from "../../../contexts/DashboardFiltersContext";
import { REASON_COLORS, TEAM_COLORS, TOOLTIP_STYLE } from "../../../lib/chartTheme";
import {
  useGetCancellationReasonsQuery,
  useGetCategoryBreakdownQuery,
  useGetCleanDealsQuery,
  useGetOnHoldReasonsQuery,
  useGetOverviewQuery,
  useGetPerformanceQuery,
  useGetPipelineQuery,
  useGetRetentionQuery,
  useGetRolePerformanceQuery,
} from "../api/dashboardApi";
import {
  ROLE_PERFORMANCE_CLOSER_COLUMNS,
  ROLE_PERFORMANCE_SETTER_COLUMNS,
  buildRolePerformanceCloserRows,
  buildRolePerformanceSetterRows,
} from "../rolePerformanceTableConfig";

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function MasterDashboardPage() {
  const { filterParams } = useDashboardFilters();
  const { data: overviewRes, isLoading: loadingOverview } = useGetOverviewQuery(filterParams);
  const { data: categoryRes, isLoading: loadingCategory } = useGetCategoryBreakdownQuery(filterParams);
  const { data: retentionRes, isLoading: loadingRetention } = useGetRetentionQuery(filterParams);
  const { data: cleanRes, isLoading: loadingClean } = useGetCleanDealsQuery(filterParams);
  const { data: pipelineRes, isLoading: loadingPipeline } = useGetPipelineQuery(filterParams);
  const { data: performanceRes, isLoading: loadingPerformance } = useGetPerformanceQuery(filterParams);
  const { data: cancellationRes, isLoading: loadingCancelReasons } = useGetCancellationReasonsQuery(filterParams);
  const { data: holdRes, isLoading: loadingHoldReasons } = useGetOnHoldReasonsQuery(filterParams);
  const { data: rolePerfRes, isLoading: loadingRolePerf } = useGetRolePerformanceQuery(filterParams);

  const loading =
    loadingOverview ||
    loadingCategory ||
    loadingRetention ||
    loadingClean ||
    loadingPipeline ||
    loadingPerformance ||
    loadingCancelReasons ||
    loadingHoldReasons ||
    loadingRolePerf;

  const overview = overviewRes?.data || {};
  const categories = categoryRes?.data || [];
  const retention = retentionRes?.data || {};
  const clean = cleanRes?.data || {};
  const pipeline = pipelineRes?.data || {};
  const performance = performanceRes?.data || {};
  const cancellationReasons = cancellationRes?.data || [];
  const onHoldReasons = holdRes?.data || [];
  const rolePerfBundle = rolePerfRes?.data || {};
  const setterTableData = buildRolePerformanceSetterRows(rolePerfBundle);
  const closerTableData = buildRolePerformanceCloserRows(rolePerfBundle);

  const byLeadSource = retention.byLeadSource || [];
  const byTeam = retention.byTeam || [];
  const reps = performance.reps || [];
  const cleanAnalysis = clean.analysis || [];
  const averages = pipeline.averages || {};

  const cleanDealRow = cleanAnalysis.find((row) => row.isCleanDeal === 1) || {};
  const notCleanDealRow = cleanAnalysis.find((row) => row.isCleanDeal === 0) || {};
  const totalDeals = Number(overview.totalProjects) || 0;
  const onHoldCount = Number(overview.onHoldProjects) || 0;

  const statusPieData = categories.map((row) => ({
    name: row.project_category || "Unknown",
    value: Number(row.count) || 0,
  }));

  const activeLeadSourceData = byLeadSource
    .map((row) => ({
      name: row.lead_source || "Unknown",
      active: Number(row.activeProjects) || 0,
      total: Number(row.totalProjects) || 0,
      cancelled: Number(row.cancelledProjects) || 0,
      onHold: Number(row.onHoldProjects) || 0,
    }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.active - a.active)
    .slice(0, 8);

  const activeTeamData = byTeam
    .map((row) => ({
      name: row.sales_team || "Unknown",
      active: Number(row.activeProjects) || 0,
    }))
    .filter((row) => row.active > 0)
    .sort((a, b) => b.active - a.active)
    .slice(0, 8);

  const dealsByLeadSourceData = activeLeadSourceData.map((row) => ({
    name: row.name,
    active: row.active,
    cancelled: row.cancelled,
    onHold: row.onHold,
  }));

  const cancelReasonData = cancellationReasons
    .map((row) => ({
      name: row.reason || "Unknown",
      count: Number(row.count) || 0,
    }))
    .slice(0, 8);

  const onHoldReasonData = onHoldReasons
    .map((row) => ({
      name: row.reason || "Unknown",
      count: Number(row.count) || 0,
    }))
    .slice(0, 8);

  const cleanDealsData = [
    { name: "Clean Deal", value: Number(cleanDealRow.total) || 0 },
    { name: "Not Clean Deal", value: Number(notCleanDealRow.total) || 0 },
  ];

  const topRepRows = reps
    .slice()
    .sort((a, b) => (Number(b.totalProjects) || 0) - (Number(a.totalProjects) || 0))
    .slice(0, 12);

  const repColumns = [
    { key: "salesRep", label: "Sales Rep" },
    { key: "salesTeam", label: "Sales Team" },
    { key: "totalProjects", label: "Total" },
    { key: "activeProjects", label: "Active" },
    { key: "cleanDealPct", label: "Clean %", format: (v) => `${Number(v || 0).toFixed(1)}%` },
    { key: "cancellationRate", label: "Cancel %", format: (v) => `${Number(v || 0).toFixed(1)}%` },
    { key: "avgDaysToInstall", label: "Install Days", format: (v) => (v != null ? Number(v).toFixed(1) : "N/A") },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Master Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Loading consolidated metrics...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Master Dashboard</h1>
        <p className="mt-1 text-muted-foreground">PowerBI-style executive summary using synced Sunbase data</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard title="Deals" value={totalDeals} subtitle="Total projects in range" icon={Activity} />
        <StatCard title="Active" value={Number(overview.activeProjects) || 0} subtitle="Current pipeline" icon={Gauge} />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(overview.activePipelineValue)}
          subtitle={formatCurrency(overview.totalContractValue)}
          icon={TrendingUp}
        />
        <StatCard title="Retention Rate" value={`${Number(overview.netRetentionRate) || 0}%`} subtitle="Net retention" icon={ShieldCheck} />
        <StatCard title="CRC Days" value={averages.avgDaysToCrc ?? "N/A"} subtitle="Avg sign to CRC" icon={Clock3} />
        <StatCard title="Install Days" value={averages.avgDaysToInstall ?? "N/A"} subtitle="Avg sign to install" icon={Timer} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clean Deal Rate"
          value={`${Number(overview.cleanDealPct) || 0}%`}
          subtitle={`${Number(overview.cleanDeals) || 0} clean deals`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Cancellation Rate"
          value={`${Number(overview.cancellationRate) || 0}%`}
          subtitle={`${Number(overview.cancelledProjects) || 0} projects cancelled`}
          icon={TrendingDown}
        />
        <StatCard
          title="On Hold Projects"
          value={onHoldCount}
          subtitle={totalDeals ? `${((onHoldCount / totalDeals) * 100).toFixed(1)}% of total` : "No projects in range"}
          icon={PauseCircle}
        />
        <StatCard
          title="Red Flagged"
          value={Number(overview.redFlaggedProjects) || 0}
          subtitle={`${Number(overview.disqualifiedProjects) || 0} disqualified`}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Active Deals by Lead Source">
          <BarChart data={activeLeadSourceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
            <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 11 }} />
            <YAxis stroke="oklch(0.6 0.015 260)" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="active" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Active Deals by Sales Team">
          <PieChart>
            <Pie data={activeTeamData} dataKey="active" nameKey="name" cx="50%" cy="50%" outerRadius={90} labelLine>
              {activeTeamData.map((_, i) => (
                <Cell key={i} fill={TEAM_COLORS[i % TEAM_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
          </PieChart>
        </ChartCard>

        <ChartCard title="Active Deals by Status">
          <PieChart>
            <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
              {statusPieData.map((_, i) => (
                <Cell key={i} fill={REASON_COLORS[i % REASON_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
          </PieChart>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Deals by Lead Source" height={320}>
          <BarChart data={dealsByLeadSourceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
            <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 11 }} />
            <YAxis stroke="oklch(0.6 0.015 260)" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend />
            <Bar dataKey="active" stackId="a" fill="#3b82f6" />
            <Bar dataKey="cancelled" stackId="a" fill="#ef4444" />
            <Bar dataKey="onHold" stackId="a" fill="#f59e0b" />
          </BarChart>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Cancellations by Reason" height={256}>
          <BarChart data={cancelReasonData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
            <XAxis type="number" stroke="oklch(0.6 0.015 260)" />
            <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11, fill: "oklch(0.6 0.015 260)" }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="count" fill="#1d4ed8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="On Hold by Reason" height={256}>
          <BarChart data={onHoldReasonData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
            <XAxis type="number" stroke="oklch(0.6 0.015 260)" />
            <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11, fill: "oklch(0.6 0.015 260)" }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-lg font-semibold text-foreground">Setters &amp; closers (by Sunbase role)</h2>
          </div>
          <Link
            to="/role-performance"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Full page + methodology notes
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Rows list users whose Sunbase role is setter-type or sales/closer-type; metrics match their{" "}
          <strong>Fullname</strong> to doors, appointments, and jobs in range.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Setters</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[min(420px,55vh)] overflow-auto">
            <DataTable data={setterTableData} columns={ROLE_PERFORMANCE_SETTER_COLUMNS} />
          </CardContent>
        </Card>

        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Closers / sales</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[min(420px,55vh)] overflow-auto">
            <DataTable data={closerTableData} columns={ROLE_PERFORMANCE_CLOSER_COLUMNS} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="gap-0 border-border bg-card py-0 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Top Rep Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={topRepRows} columns={repColumns} />
          </CardContent>
        </Card>

        <ChartCard title="Clean Deals">
          <BarChart data={cleanDealsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
            <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" />
            <YAxis stroke="oklch(0.6 0.015 260)" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {cleanDealsData.map((_, i) => (
                <Cell key={i} fill={i === 0 ? "#ec4899" : "#3b82f6"} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}
