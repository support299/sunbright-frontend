import { ArrowRight, Clock, Gauge, Layers, ListChecks, Rocket, Timer } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "../../../components/dashboard/ChartCard";
import DataTable from "../../../components/dashboard/DataTable";
import StageStrip from "../../../components/dashboard/StageStrip";
import StatCard from "../../../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useDashboardFilters } from "../../../contexts/DashboardFiltersContext";
import { STAGE_COLORS, TOOLTIP_STYLE } from "../../../lib/chartTheme";
import { useGetPipelineQuery } from "../api/dashboardApi";

const dayValue = (v) =>
  v != null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : 0;

const formatDays = (v) =>
  v != null && v !== "" && Number.isFinite(Number(v)) ? `${Number(v).toFixed(1)} days` : "N/A";

function categoryBadge(category) {
  if (category === "Active") return "bg-green-500/20 text-green-400";
  if (category === "Cancelled") return "bg-red-500/20 text-red-400";
  if (category === "On Hold") return "bg-yellow-500/20 text-yellow-400";
  return "bg-gray-500/20 text-gray-400";
}

function OverviewTab({ averages }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg Sign → Install"
          value={formatDays(averages.avgDaysToInstall)}
          subtitle="Customer sign to install"
          icon={Gauge}
        />
        <StatCard
          title="Avg Sign → CRC"
          value={formatDays(averages.avgDaysToCrc)}
          subtitle="Customer sign to CRC"
          icon={Clock}
        />
        <StatCard
          title="Avg CRC → Install"
          value={formatDays(averages.avgDaysCrcToInstall)}
          subtitle="CRC to install complete"
          icon={ArrowRight}
        />
        <StatCard
          title="Avg Install → PTO"
          value={formatDays(averages.avgDaysInstallToPto)}
          subtitle="Install to PTO submission"
          icon={ArrowRight}
        />
      </div>

      <ChartCard title="Average Days Between Milestones" height={320}>
        <BarChart
          data={[
            { name: "Sign → CRC", days: dayValue(averages.avgDaysToCrc) },
            { name: "Survey → CRC", days: dayValue(averages.avgDaysSsToCrc) },
            { name: "Sign → Permit", days: dayValue(averages.avgDaysToPermit) },
            { name: "CRC → Install", days: dayValue(averages.avgDaysCrcToInstall) },
            { name: "Sign → Install", days: dayValue(averages.avgDaysToInstall) },
            { name: "Install → PTO", days: dayValue(averages.avgDaysInstallToPto) },
            { name: "Sign → PTO", days: dayValue(averages.avgDaysToPtoSubmitted) },
          ]}
          layout="vertical"
          margin={{ left: 20, right: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
          <XAxis type="number" stroke="oklch(0.6 0.015 260)" domain={[0, "auto"]} />
          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: "oklch(0.6 0.015 260)" }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} days`, "Average"]} />
          <Bar dataKey="days" radius={[0, 4, 4, 0]}>
            {STAGE_COLORS.map((color, i) => (
              <Cell key={i} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>

      <ChartCard title="Install Speed: Clean vs Non-Clean" height={192}>
        <BarChart
          data={[
            { name: "Clean Deals", days: dayValue(averages.avgInstallClean) },
            { name: "Non-Clean Deals", days: dayValue(averages.avgInstallNotClean) },
          ]}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
          <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" />
          <YAxis stroke="oklch(0.6 0.015 260)" domain={[0, "auto"]} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} days`, "Avg Days to Install"]} />
          <Bar dataKey="days" radius={[4, 4, 0, 0]}>
            <Cell fill="#22c55e" />
            <Cell fill="#ef4444" />
          </Bar>
        </BarChart>
      </ChartCard>
    </div>
  );
}

function FunnelTab({ funnel }) {
  if (!Array.isArray(funnel) || funnel.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No funnel data available for this filter range.
      </p>
    );
  }

  const normalizedFunnel = funnel.map((s) => ({
    ...s,
    label: s.label || s.stage || s.name || "",
  }));
  const activeStages = normalizedFunnel.filter((s) => !s.muted);
  const exitStages = normalizedFunnel.filter((s) => s.muted);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground">Forward funnel</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Counts of projects in each stage and conversion vs the previous stage.
        </p>
        <StageStrip stages={activeStages} />
      </div>

      {exitStages.length ? (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground">Exited pipeline</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Projects that left the active funnel (cancellations / on hold).
          </p>
          <StageStrip stages={exitStages} />
        </div>
      ) : null}

      <ChartCard title="Stage distribution" height={360}>
        <BarChart
          data={normalizedFunnel.map((s) => ({ name: s.label, count: s.count }))}
          margin={{ top: 12, right: 16, bottom: 72, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
          <XAxis
            dataKey="name"
            stroke="oklch(0.6 0.015 260)"
            interval={0}
            angle={-35}
            textAnchor="end"
            tick={{ fontSize: 11, fill: "oklch(0.72 0.015 260)" }}
          />
          <YAxis stroke="oklch(0.6 0.015 260)" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [v, "Projects"]}
            labelFormatter={(label) => `Stage: ${label}`}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {normalizedFunnel.map((s, i) => (
              <Cell key={i} fill={s.muted ? "#64748b" : STAGE_COLORS[i % STAGE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>
    </div>
  );
}

function VelocityTab({ velocity }) {
  const projectList = (velocity || [])
    .filter((p) => p.daysToInstall != null || p.daysToCrc != null)
    .slice(0, 100);

  if (projectList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No projects with milestone data fall in this filter range yet.
      </p>
    );
  }

  return (
    <Card className="gap-0 border-border bg-card py-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">Project Timeline Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">Rep</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">Clean</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">→ CRC</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">→ Permit</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">→ Install</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">→ PTO</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground">Age</th>
              </tr>
            </thead>
            <tbody>
              {projectList.map((p) => (
                <tr key={p.id} className="border-b border-border/50 transition-colors hover:bg-accent/30">
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">
                    {[p.firstName, p.lastName?.charAt(0) ? `${p.lastName.charAt(0)}.` : ""].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{p.salesRep || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadge(p.projectCategory)}`}>
                      {p.projectCategory || "—"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{p.isCleanDeal ? "Yes" : "No"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{p.daysToCrc != null ? `${p.daysToCrc}d` : "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{p.daysToPermit != null ? `${p.daysToPermit}d` : "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{p.daysToInstall != null ? `${p.daysToInstall}d` : "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{p.daysToPtoSubmitted != null ? `${p.daysToPtoSubmitted}d` : "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-foreground">{p.projectAgeDays != null ? `${p.projectAgeDays}d` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function CrcAnalyticsTab({ crcAnalytics, dealsPipeline }) {
  const kpis = crcAnalytics?.kpis || {};
  const series = crcAnalytics?.series || [];
  const pipeline = dealsPipeline || [];
  const totalDeals = pipeline[0]?.count || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Customer → SS" value={formatDays(kpis.avgDaysCustomerToSs)} subtitle="Sign to site survey" icon={Clock} />
        <StatCard title="SS → SSR" value={formatDays(kpis.avgDaysSsToSsr)} subtitle="Site survey to result" icon={Timer} />
        <StatCard title="SSR → CRC" value={formatDays(kpis.avgDaysSsrToCrc)} subtitle="SSR to CRC" icon={ArrowRight} />
        <StatCard title="Customer → CRC" value={formatDays(kpis.avgDaysToCrc)} subtitle="Sign to CRC" icon={Gauge} />
      </div>

      <ChartCard
        title="CRC milestone averages"
        description="Average days between consecutive CRC milestones in the current filter."
        height={288}
      >
        <LineChart data={series.map((s) => ({ stage: s.label, days: dayValue(s.days), n: s.n }))}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
          <XAxis dataKey="stage" stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 11 }} />
          <YAxis stroke="oklch(0.6 0.015 260)" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name, payload) => {
              if (name === "days") return [`${v} days (${payload?.payload?.n ?? 0} rows)`, "Average"];
              return [v, name];
            }}
          />
          <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ChartCard>

      <ChartCard
        title="Deals pipeline"
        description={
          totalDeals > 0
            ? `Each bar shows count and % of the ${totalDeals.toLocaleString()} total deals in range.`
            : "No deals in range."
        }
        height={320}
      >
        <BarChart
          data={pipeline.map((p) => ({
            name: p.label,
            count: p.count,
            pct: totalDeals > 0 ? Math.round((100 * p.count) / totalDeals) : 0,
          }))}
          layout="vertical"
          margin={{ left: 20, right: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
          <XAxis type="number" stroke="oklch(0.6 0.015 260)" />
          <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: "oklch(0.6 0.015 260)" }} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, _name, payload) => [`${v} (${payload?.payload?.pct ?? 0}%)`, payload?.payload?.name]}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartCard>
    </div>
  );
}

function QuickInstallsTab({ quickInstalls }) {
  const summary = quickInstalls || {};
  const items = summary.items || [];

  const columns = [
    {
      key: "name",
      label: "Customer",
      format: (_, row) =>
        [row.firstName, row.lastName].filter(Boolean).join(" ") || "—",
    },
    { key: "salesRep", label: "Rep" },
    { key: "installer", label: "Installer" },
    { key: "projectManager", label: "PM" },
    {
      key: "customerSince",
      label: "Sign Date",
      format: (v) => (v ? v : "—"),
    },
    {
      key: "installCompleted",
      label: "Install Complete",
      format: (v, row) => row.installCompleted || row.installDate || "—",
    },
    {
      key: "daysToInstall",
      label: "Days",
      format: (v) => (v != null ? `${v}d` : "—"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Quick Installs" value={summary.count ?? 0} subtitle="≤ 30 days sign-to-install" icon={Rocket} />
        <StatCard title="Total Installed" value={summary.totalInstalled ?? 0} subtitle="In current filter range" icon={ListChecks} />
        <StatCard
          title="Quick Install Rate"
          value={`${summary.quickInstallRate ?? 0}%`}
          subtitle="Quick / total installed"
          icon={Layers}
        />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No quick installs in this filter range. The threshold is configurable in <code>QUICK_INSTALL_DAYS</code>.
        </p>
      ) : (
        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Quick install jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={items} columns={columns} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PipelinePage() {
  const { filterParams } = useDashboardFilters();
  const { data: res, isLoading } = useGetPipelineQuery(filterParams);
  const bundle = res?.data || {};
  const averages = bundle.averages || {};
  const velocity = bundle.velocity || [];
  const funnel = bundle.funnel || [];
  const crcAnalytics = bundle.crcAnalytics || {};
  const dealsPipeline = bundle.dealsPipeline || [];
  const quickInstalls = bundle.quickInstalls || {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
          <p className="mt-1 text-muted-foreground">Loading pipeline metrics...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
        <p className="mt-1 text-muted-foreground">
          Stage funnel, milestone velocity, CRC drill-down, and quick-install detail in one place.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="velocity">Velocity</TabsTrigger>
          <TabsTrigger value="crc">CRC Analytics</TabsTrigger>
          <TabsTrigger value="quick">Quick Installs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab averages={averages} />
        </TabsContent>
        <TabsContent value="funnel" className="mt-4">
          <FunnelTab funnel={funnel} />
        </TabsContent>
        <TabsContent value="velocity" className="mt-4">
          <VelocityTab velocity={velocity} />
        </TabsContent>
        <TabsContent value="crc" className="mt-4">
          <CrcAnalyticsTab crcAnalytics={crcAnalytics} dealsPipeline={dealsPipeline} />
        </TabsContent>
        <TabsContent value="quick" className="mt-4">
          <QuickInstallsTab quickInstalls={quickInstalls} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
