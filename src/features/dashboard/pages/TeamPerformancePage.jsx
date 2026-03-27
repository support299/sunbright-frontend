import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { TEAM_COLORS, TOOLTIP_STYLE } from "../../../lib/chartTheme";
import { formatCurrency } from "../../../lib/formatters";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import { useGetPerformanceQuery } from "../api/dashboardApi";

export default function TeamPerformancePage() {
  const { filterParams } = useDateFilter();
  const { data: res, isLoading } = useGetPerformanceQuery(filterParams);
  const teams = res?.data?.teams || [];
  const installers = res?.data?.installers || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Performance</h1>
          <p className="mt-1 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const teamData = teams.map((t) => ({
    name: t.salesTeam || "Unknown",
    total: Number(t.totalProjects),
    active: Number(t.activeProjects),
    cancelled: Number(t.cancelledProjects),
    onHold: Number(t.onHoldProjects),
    cleanPct: Number(t.cleanDealPct) || 0,
    cancelRate: Number(t.cancellationRate) || 0,
    netRetention: Number(t.netRetentionRate) || 0,
    avgInstall: Number(t.avgDaysToInstall) || 0,
    pipelineValue: Number(t.activePipelineValue) || 0,
    totalValue: Number(t.totalContractValue) || 0,
  }));

  const installerData = installers.map((inst) => ({
    name: inst.installer || "Unknown",
    total: Number(inst.totalProjects),
    active: Number(inst.activeProjects),
    cancelled: Number(inst.cancelledProjects),
    cleanPct: Number(inst.cleanDealPct) || 0,
    cancelRate: Number(inst.cancellationRate) || 0,
    netRetention: Number(inst.netRetentionRate) || 0,
    avgInstall: Number(inst.avgDaysToInstall) || 0,
    totalValue: Number(inst.totalContractValue) || 0,
  }));

  const radarData = [
    { metric: "Clean %", ...Object.fromEntries(teamData.map((t) => [t.name, t.cleanPct])) },
    { metric: "Retention %", ...Object.fromEntries(teamData.map((t) => [t.name, t.netRetention])) },
    {
      metric: "Active %",
      ...Object.fromEntries(
        teamData.map((t) => [t.name, t.total > 0 ? Math.round((t.active / t.total) * 100) : 0])
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Performance</h1>
        <p className="mt-1 text-muted-foreground">Aggregated metrics per sales team with visual comparisons</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {teamData.map((t, i) => (
          <Card key={t.name} className="gap-0 border-border bg-card py-0">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: TEAM_COLORS[i % TEAM_COLORS.length] }} />
                <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Projects:</span>{" "}
                  <span className="font-medium text-foreground">{t.total}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Active:</span>{" "}
                  <span className="font-medium text-foreground">{t.active}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Clean %:</span>{" "}
                  <span className="font-medium text-foreground">{t.cleanPct}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Retention:</span>{" "}
                  <span className="font-medium text-foreground">{t.netRetention}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cancel %:</span>{" "}
                  <span className="font-medium text-foreground">{t.cancelRate}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg Install:</span>{" "}
                  <span className="font-medium text-foreground">{t.avgInstall || "—"}d</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Pipeline:</span>{" "}
                  <span className="font-medium text-foreground">{formatCurrency(t.pipelineValue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Pipeline Value by Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                  <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="oklch(0.6 0.015 260)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="pipelineValue" name="Active Pipeline" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalValue" name="Total Contract" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Team Comparison Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="oklch(0.28 0.012 260)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "oklch(0.6 0.015 260)", fontSize: 11 }} />
                  <PolarRadiusAxis tick={{ fill: "oklch(0.6 0.015 260)", fontSize: 10 }} domain={[0, 100]} />
                  {teamData.map((t, i) => (
                    <Radar
                      key={t.name}
                      name={t.name}
                      dataKey={t.name}
                      stroke={TEAM_COLORS[i % TEAM_COLORS.length]}
                      fill={TEAM_COLORS[i % TEAM_COLORS.length]}
                      fillOpacity={0.15}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 border-border bg-card py-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Installer Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Installer</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Total</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Active</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Cancelled</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Clean %</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Cancel %</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Net Retention</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Avg Install</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {installerData.map((inst, i) => (
                  <tr key={i} className="border-b border-border/50 transition-colors hover:bg-accent/30">
                    <td className="py-3 px-3 font-medium text-foreground">{inst.name}</td>
                    <td className="py-3 px-3 text-foreground">{inst.total}</td>
                    <td className="py-3 px-3 text-foreground">{inst.active}</td>
                    <td className="py-3 px-3 text-foreground">{inst.cancelled}</td>
                    <td className="py-3 px-3 text-foreground">{inst.cleanPct}%</td>
                    <td className="py-3 px-3 text-foreground">{inst.cancelRate}%</td>
                    <td className="py-3 px-3 text-foreground">{inst.netRetention}%</td>
                    <td className="py-3 px-3 text-foreground">{inst.avgInstall || "—"} days</td>
                    <td className="py-3 px-3 text-foreground">{formatCurrency(inst.totalValue)}</td>
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
