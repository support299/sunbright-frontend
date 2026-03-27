import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import {
  useGetCancellationReasonsQuery,
  useGetCategoryBreakdownQuery,
  useGetOnHoldReasonsQuery,
  useGetOverviewQuery,
} from "../api/dashboardApi";

const CATEGORY_COLORS = {
  Active: "#22c55e",
  Cancelled: "#ef4444",
  "On Hold": "#f59e0b",
  "Red Flagged": "#f97316",
  Disqualified: "#6b7280",
};

const TOOLTIP_STYLE = {
  backgroundColor: "oklch(0.2 0.018 260)",
  border: "1px solid oklch(0.28 0.012 260)",
  borderRadius: "8px",
  color: "oklch(0.93 0.005 260)",
};

function formatCurrency(val) {
  if (val == null || Number.isNaN(Number(val))) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(val));
}

function KpiCard({ title, value, subtitle, icon, trend, trendLabel }) {
  const IconEl = icon;
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5">
            <IconEl className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trendLabel ? (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {trend === "up" ? <TrendingUp className="h-3.5 w-3.5 text-green-400" /> : null}
            {trend === "down" ? <TrendingDown className="h-3.5 w-3.5 text-red-400" /> : null}
            <span
              className={
                trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground"
              }
            >
              {trendLabel}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { filterParams } = useDateFilter();
  const { data: overviewRes, isLoading: loadingOverview } = useGetOverviewQuery(filterParams);
  const { data: categoriesRes, isLoading: loadingCats } = useGetCategoryBreakdownQuery(filterParams);
  const { data: cancelRes, isLoading: loadingCancel } = useGetCancellationReasonsQuery(filterParams);
  const { data: holdRes, isLoading: loadingHold } = useGetOnHoldReasonsQuery(filterParams);

  const loading = loadingOverview || loadingCats || loadingCancel || loadingHold;

  const overview = overviewRes?.data || {};
  const categories = categoriesRes?.data || [];
  const cancelReasons = cancelRes?.data || [];
  const holdReasons = holdRes?.data || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Executive Overview</h1>
          <p className="mt-1 text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse border-border bg-card">
              <CardContent className="h-28 p-5" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const o = overview;
  const pieData = categories.map((c) => ({
    name: c.project_category,
    value: Number(c.count),
  }));

  const cancelData = cancelReasons.map((r) => ({
    name: r.reason?.length > 25 ? `${r.reason.slice(0, 25)}...` : r.reason,
    fullName: r.reason,
    count: Number(r.count),
  }));

  const holdData = holdReasons.map((r) => ({
    name: r.reason?.length > 25 ? `${r.reason.slice(0, 25)}...` : r.reason,
    fullName: r.reason,
    count: Number(r.count),
  }));

  const totalProjects = Number(o.totalProjects) || 0;
  const onHoldCount = Number(o.onHoldProjects) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Executive Overview</h1>
        <p className="mt-1 text-muted-foreground">Real-time project performance and pipeline health</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Projects"
          value={totalProjects}
          subtitle={`${Number(o.activeProjects) || 0} active in pipeline`}
          icon={Activity}
        />
        <KpiCard
          title="Active Pipeline Value"
          value={formatCurrency(o.activePipelineValue)}
          subtitle={`${formatCurrency(o.totalContractValue)} total`}
          icon={DollarSign}
        />
        <KpiCard
          title="Clean Deal Rate"
          value={`${Number(o.cleanDealPct) || 0}%`}
          subtitle={`${Number(o.cleanDeals) || 0} of ${totalProjects} projects`}
          icon={CheckCircle2}
          trend={Number(o.cleanDealPct) >= 70 ? "up" : "down"}
          trendLabel={Number(o.cleanDealPct) >= 70 ? "Above target" : "Below 70% target"}
        />
        <KpiCard
          title="Net Retention Rate"
          value={`${Number(o.netRetentionRate) || 0}%`}
          subtitle="Excl. cancelled, on hold, red flagged"
          icon={Zap}
          trend={Number(o.netRetentionRate) >= 80 ? "up" : "down"}
          trendLabel={Number(o.netRetentionRate) >= 80 ? "Healthy retention" : "Needs attention"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Cancellation Rate"
          value={`${Number(o.cancellationRate) || 0}%`}
          subtitle={`${Number(o.cancelledProjects) || 0} projects cancelled`}
          icon={TrendingDown}
          trend={Number(o.cancellationRate) <= 15 ? "up" : "down"}
          trendLabel={Number(o.cancellationRate) <= 15 ? "Within threshold" : "Above 15% threshold"}
        />
        <KpiCard
          title="On Hold Projects"
          value={onHoldCount}
          subtitle={totalProjects ? `${((onHoldCount / totalProjects) * 100).toFixed(1)}% of total` : "—"}
          icon={AlertTriangle}
        />
        <KpiCard
          title="Avg. Days to Install"
          value={o.avgDaysToInstall != null ? Number(o.avgDaysToInstall) : "N/A"}
          subtitle={`${Number(o.installedProjects) || 0} projects with install date`}
          icon={Clock}
        />
        <KpiCard
          title="Red Flagged"
          value={Number(o.redFlaggedProjects) || 0}
          subtitle={`${Number(o.disqualifiedProjects) || 0} disqualified`}
          icon={AlertTriangle}
          trend={Number(o.redFlaggedProjects) === 0 ? "up" : "down"}
          trendLabel={Number(o.redFlaggedProjects) === 0 ? "No red flags" : "Requires review"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={CATEGORY_COLORS[entry.name] || "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Cancellation Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {cancelData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cancelData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                    <XAxis type="number" stroke="oklch(0.6 0.015 260)" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={140}
                      tick={{ fontSize: 11, fill: "oklch(0.6 0.015 260)" }}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value, _n, props) => [value, props.payload.fullName]}
                    />
                    <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                  No cancelled projects in the dataset, or run a data sync after updating the API.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">On Hold Reasons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            {holdData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={holdData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                  <XAxis type="number" stroke="oklch(0.6 0.015 260)" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={180}
                    tick={{ fontSize: 11, fill: "oklch(0.6 0.015 260)" }}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value, _n, props) => [value, props.payload.fullName]}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                {onHoldCount > 0
                  ? "Loading breakdown or re-sync job list so on-hold rows include job status."
                  : "No on-hold projects in the current dataset."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
