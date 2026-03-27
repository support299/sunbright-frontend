import { ArrowRight, Clock, Gauge } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "../../../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { STAGE_COLORS, TOOLTIP_STYLE } from "../../../lib/chartTheme";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import { useGetPipelineQuery } from "../api/dashboardApi";

export default function PipelinePage() {
  const { filterParams } = useDateFilter();
  const { data: res, isLoading } = useGetPipelineQuery(filterParams);
  const bundle = res?.data || {};
  const averages = bundle.averages || {};
  const velocity = bundle.velocity || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline Velocity</h1>
          <p className="mt-1 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const chartDay = (v) => (v != null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : 0);

  const stageData = [
    { name: "Sign → CRC", days: chartDay(averages.avgDaysToCrc) },
    { name: "Survey → CRC", days: chartDay(averages.avgDaysSsToCrc) },
    { name: "Sign → Permit", days: chartDay(averages.avgDaysToPermit) },
    { name: "CRC → Install", days: chartDay(averages.avgDaysCrcToInstall) },
    { name: "Sign → Install", days: chartDay(averages.avgDaysToInstall) },
    { name: "Install → PTO", days: chartDay(averages.avgDaysInstallToPto) },
    { name: "Sign → PTO", days: chartDay(averages.avgDaysToPtoSubmitted) },
  ];

  const cleanVsNotClean = [
    { name: "Clean Deals", days: chartDay(averages.avgInstallClean) },
    { name: "Non-Clean Deals", days: chartDay(averages.avgInstallNotClean) },
  ];

  const projectList = velocity
    .filter((p) => p.daysToInstall != null || p.daysToCrc != null)
    .slice(0, 30);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pipeline Velocity</h1>
        <p className="mt-1 text-muted-foreground">
          Stage-by-stage timeline analysis with average days between milestones
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg Sign → Install"
          value={
            averages.avgDaysToInstall != null && averages.avgDaysToInstall !== ""
              ? `${averages.avgDaysToInstall} days`
              : "N/A"
          }
          subtitle="Customer sign to install complete"
          icon={Gauge}
        />
        <StatCard
          title="Avg Sign → CRC"
          value={
            averages.avgDaysToCrc != null && averages.avgDaysToCrc !== "" ? `${averages.avgDaysToCrc} days` : "N/A"
          }
          subtitle="Customer sign to CRC"
          icon={Clock}
        />
        <StatCard
          title="Avg CRC → Install"
          value={
            averages.avgDaysCrcToInstall != null && averages.avgDaysCrcToInstall !== ""
              ? `${averages.avgDaysCrcToInstall} days`
              : "N/A"
          }
          subtitle="CRC to install complete"
          icon={ArrowRight}
        />
        <StatCard
          title="Avg Install → PTO"
          value={
            averages.avgDaysInstallToPto != null && averages.avgDaysInstallToPto !== ""
              ? `${averages.avgDaysInstallToPto} days`
              : "N/A"
          }
          subtitle="Install to PTO submission"
          icon={ArrowRight}
        />
      </div>

      <Card className="gap-0 border-border bg-card py-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Average Days Between Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                <XAxis
                  type="number"
                  stroke="oklch(0.6 0.015 260)"
                  domain={[0, "auto"]}
                  label={{ value: "Days", position: "insideBottom", offset: -5, fill: "oklch(0.6 0.015 260)" }}
                />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: "oklch(0.6 0.015 260)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} days`, "Average"]} />
                <Bar dataKey="days" name="Avg Days" radius={[0, 4, 4, 0]}>
                  {stageData.map((_, i) => (
                    <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 border-border bg-card py-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Install Speed: Clean vs Non-Clean</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cleanVsNotClean}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" />
                <YAxis
                  stroke="oklch(0.6 0.015 260)"
                  domain={[0, "auto"]}
                  label={{ value: "Days", angle: -90, position: "insideLeft", fill: "oklch(0.6 0.015 260)" }}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} days`, "Avg Days to Install"]} />
                <Bar dataKey="days" name="Avg Days to Install" radius={[4, 4, 0, 0]}>
                  {cleanVsNotClean.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#22c55e" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 border-border bg-card py-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Project Timeline Details (Top 30)</CardTitle>
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
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">
                      {[p.firstName, p.lastName?.charAt(0) ? `${p.lastName.charAt(0)}.` : ""].filter(Boolean).join(" ") ||
                        "—"}
                    </td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">{p.salesRep || "—"}</td>
                    <td className="whitespace-nowrap py-3 px-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.projectCategory === "Active"
                            ? "bg-green-500/20 text-green-400"
                            : p.projectCategory === "Cancelled"
                              ? "bg-red-500/20 text-red-400"
                              : p.projectCategory === "On Hold"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {p.projectCategory || "—"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">{p.isCleanDeal ? "Yes" : "No"}</td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">
                      {p.daysToCrc != null ? `${p.daysToCrc}d` : "—"}
                    </td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">
                      {p.daysToPermit != null ? `${p.daysToPermit}d` : "—"}
                    </td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">
                      {p.daysToInstall != null ? `${p.daysToInstall}d` : "—"}
                    </td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">
                      {p.daysToPtoSubmitted != null ? `${p.daysToPtoSubmitted}d` : "—"}
                    </td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">
                      {p.projectAgeDays != null ? `${p.projectAgeDays}d` : "—"}
                    </td>
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
