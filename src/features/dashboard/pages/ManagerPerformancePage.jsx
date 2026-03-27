import {
  AlertCircle,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  DoorOpen,
  Phone,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import StatCard from "../../../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { cn } from "../../../lib/utils";
import { TOOLTIP_STYLE } from "../../../lib/chartTheme";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import { useGetManagerPerformanceQuery } from "../api/dashboardApi";

function pct(val) {
  if (val == null || val === "") return "—";
  const n = Number(val);
  return Number.isNaN(n) ? "—" : `${n.toFixed(1)}%`;
}

function num(val) {
  if (val == null || val === "") return "0";
  return Number(val).toLocaleString();
}

function rateColor(val, good, warn) {
  if (val == null) return "text-muted-foreground";
  const n = Number(val);
  if (n >= good) return "text-green-400";
  if (n >= warn) return "text-yellow-400";
  return "text-red-400";
}

export default function ManagerPerformancePage() {
  const { filterParams } = useDateFilter();
  const { data: res, isLoading } = useGetManagerPerformanceQuery(filterParams);
  const bundle = res?.data || {};
  const managerOverview = bundle.managerOverview || {};
  const repPerformance = bundle.repPerformance;
  const teamPerformance = bundle.teamPerformance;
  const doorStats = bundle.doorStats || {};
  const dealStageBreakdown = bundle.dealStageBreakdown || [];

  const [viewMode, setViewMode] = useState("team");
  const [expandedTeams, setExpandedTeams] = useState(() => new Set());

  const toggleTeam = (team) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(team)) next.delete(team);
      else next.add(team);
      return next;
    });
  };

  const expandAll = () => {
    if (teamPerformance?.length) {
      setExpandedTeams(new Set(teamPerformance.map((t) => t.salesTeam || "Unassigned")));
    }
  };

  const collapseAll = () => setExpandedTeams(new Set());

  const repsByTeam = useMemo(() => {
    const grouped = {};
    const list = repPerformance;
    if (!list) return grouped;
    for (const rep of list) {
      const team = rep.salesTeam || "Unassigned";
      if (!grouped[team]) grouped[team] = [];
      grouped[team].push(rep);
    }
    return grouped;
  }, [repPerformance]);

  const teamChartData = useMemo(() => {
    const list = teamPerformance;
    if (!list) return [];
    return list.map((t) => ({
      name: t.salesTeamDisplay || t.salesTeam || "Unknown",
      "Sit Down Rate": Number(t.sitDownRate) || 0,
      "Qualified SD Rate": Number(t.qualifiedSitDownRate) || 0,
      "Closing Rate": Number(t.closingRate) || 0,
      "Qualified Closing Rate": Number(t.qualifiedClosingRate) || 0,
    }));
  }, [teamPerformance]);

  const stageChart = dealStageBreakdown.slice(0, 12).map((r) => ({
    name: (r.deal_stage || "").length > 18 ? `${(r.deal_stage || "").slice(0, 18)}…` : r.deal_stage || "—",
    full: r.deal_stage,
    count: Number(r.count),
  }));

  const o = managerOverview;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manager Performance</h1>
          <p className="mt-1 text-muted-foreground">Loading performance data...</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manager Performance</h1>
        <p className="mt-1 text-muted-foreground">
          Sales rep and team performance metrics — appointments, sit downs, and closing rates
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Appointments"
          value={num(o.totalAppointments)}
          subtitle={`${num(o.totalReps)} reps across ${num(o.totalTeams)} teams`}
          icon={CalendarCheck}
        />
        <StatCard
          title="Sit Downs"
          value={num(o.totalSitDowns)}
          subtitle={`${pct(o.overallSitDownRate)} sit down rate`}
          icon={Users}
        />
        <StatCard
          title="Deals Closed"
          value={num(o.totalClosedDeals)}
          subtitle={`${pct(o.overallClosingRate)} closing rate`}
          icon={Target}
        />
        <StatCard
          title="Qualified Closing Rate"
          value={pct(o.overallQualifiedClosingRate)}
          subtitle={`${num(o.totalActiveClosedDeals)} active deals`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Doors Knocked"
          value={num(o.totalDoors ?? doorStats.totalDoors)}
          subtitle={`${num(o.totalCanvassers)} canvassers`}
          icon={DoorOpen}
        />
        <StatCard
          title="Total Contacts"
          value={num(o.totalContacts ?? doorStats.contacts)}
          subtitle={`${pct(o.overallContactRate ?? doorStats.contactRate)} contact rate`}
          icon={Phone}
        />
        <StatCard
          title="Self-Set Appointments"
          value={num(o.totalSelfSet)}
          subtitle={`${
            o.totalAppointments ? ((Number(o.totalSelfSet) / Number(o.totalAppointments)) * 100).toFixed(1) : 0
          }% of total`}
          icon={Target}
        />
        <StatCard
          title="Pending Outcome"
          value={num(o.totalPendingOutcome)}
          subtitle="Appointments needing follow-up"
          icon={AlertCircle}
        />
      </div>

      {teamChartData.length > 0 ? (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Team Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamChartData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                  <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="oklch(0.6 0.015 260)" unit="%" />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [`${Number(value).toFixed(1)}%`]}
                  />
                  <Legend />
                  <Bar dataKey="Sit Down Rate" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Qualified SD Rate" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Closing Rate" fill="#22c55e" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Qualified Closing Rate" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {stageChart.length > 0 ? (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Deal stage mix (appointments)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageChart} layout="vertical" margin={{ left: 16, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                  <XAxis type="number" stroke="oklch(0.6 0.015 260)" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={140}
                    tick={{ fontSize: 10, fill: "oklch(0.6 0.015 260)" }}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v) => [v, "Count"]}
                    labelFormatter={(_, p) => p?.[0]?.payload?.full || ""}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setViewMode("team")}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              viewMode === "team" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            By Team
          </button>
          <button
            type="button"
            onClick={() => setViewMode("rep")}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              viewMode === "rep" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            All Reps
          </button>
        </div>
        {viewMode === "team" ? (
          <div className="flex gap-2 text-xs">
            <button type="button" onClick={expandAll} className="text-primary hover:underline">
              Expand All
            </button>
            <span className="text-muted-foreground">|</span>
            <button type="button" onClick={collapseAll} className="text-primary hover:underline">
              Collapse All
            </button>
          </div>
        ) : null}
      </div>

      {viewMode === "team" && teamPerformance && teamPerformance.length > 0 ? (
        <div className="space-y-3">
          {teamPerformance.map((team) => {
            const teamKey = team.salesTeam || "Unassigned";
            const isExpanded = expandedTeams.has(teamKey);
            const teamReps = repsByTeam[teamKey] || [];

            return (
              <Card key={teamKey} className="overflow-hidden border-border bg-card">
                <button
                  type="button"
                  onClick={() => toggleTeam(teamKey)}
                  className="w-full text-left transition-colors hover:bg-accent/30"
                >
                  <div className="flex items-center gap-3 p-4">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-base font-semibold text-foreground">
                          {team.salesTeamDisplay || team.salesTeam || "Unassigned"}
                        </span>
                        <span className="text-xs text-muted-foreground">{num(team.repCount)} reps</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 text-sm sm:gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Appts</p>
                        <p className="font-semibold text-foreground">{num(team.totalAppointments)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Sit Downs</p>
                        <p className="font-semibold text-foreground">{num(team.sitDowns)}</p>
                      </div>
                      <div className="hidden text-center sm:block">
                        <p className="text-xs text-muted-foreground">SD Rate</p>
                        <p className={cn("font-semibold", rateColor(team.sitDownRate, 50, 30))}>{pct(team.sitDownRate)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Closed</p>
                        <p className="font-semibold text-foreground">{num(team.closedDeals)}</p>
                      </div>
                      <div className="hidden text-center md:block">
                        <p className="text-xs text-muted-foreground">Closing Rate</p>
                        <p className={cn("font-semibold", rateColor(team.closingRate, 40, 25))}>{pct(team.closingRate)}</p>
                      </div>
                      <div className="hidden text-center lg:block">
                        <p className="text-xs text-muted-foreground">Qual. Close</p>
                        <p className={cn("font-semibold", rateColor(team.qualifiedClosingRate, 80, 60))}>
                          {pct(team.qualifiedClosingRate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && teamReps.length > 0 ? (
                  <div className="border-t border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="p-3 text-left font-medium text-muted-foreground">Sales Rep</th>
                            <th className="p-3 text-center font-medium text-muted-foreground">Appts</th>
                            <th className="p-3 text-center font-medium text-muted-foreground">Sit Downs</th>
                            <th className="p-3 text-center font-medium text-muted-foreground">SD Rate</th>
                            <th className="p-3 text-center font-medium text-muted-foreground">Qual. SD</th>
                            <th className="p-3 text-center font-medium text-muted-foreground">Qual. SD Rate</th>
                            <th className="p-3 text-center font-medium text-muted-foreground">Closed</th>
                            <th className="p-3 text-center font-medium text-muted-foreground">Close Rate</th>
                            <th className="p-3 text-center font-medium text-muted-foreground">Qual. Close</th>
                            <th className="p-3 text-center font-medium text-muted-foreground">Self-Set</th>
                            <th className="p-3 text-center font-medium text-muted-foreground">Assigned</th>
                            <th className="p-3 text-center font-medium text-muted-foreground">Pending</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamReps.map((rep, idx) => (
                            <tr
                              key={`${rep.salesRep}-${idx}`}
                              className={cn(
                                "border-t border-border/50 transition-colors hover:bg-accent/20",
                                idx % 2 !== 0 && "bg-muted/20"
                              )}
                            >
                              <td className="p-3 font-medium text-foreground">{rep.salesRep}</td>
                              <td className="p-3 text-center text-foreground">{num(rep.totalAppointments)}</td>
                              <td className="p-3 text-center text-foreground">{num(rep.sitDowns)}</td>
                              <td className={cn("p-3 text-center font-medium", rateColor(rep.sitDownRate, 50, 30))}>
                                {pct(rep.sitDownRate)}
                              </td>
                              <td className="p-3 text-center text-foreground">{num(rep.qualifiedSitDowns)}</td>
                              <td className={cn("p-3 text-center font-medium", rateColor(rep.qualifiedSitDownRate, 40, 20))}>
                                {pct(rep.qualifiedSitDownRate)}
                              </td>
                              <td className="p-3 text-center text-foreground">{num(rep.closedDeals)}</td>
                              <td className={cn("p-3 text-center font-medium", rateColor(rep.closingRate, 40, 25))}>
                                {pct(rep.closingRate)}
                              </td>
                              <td className={cn("p-3 text-center font-medium", rateColor(rep.qualifiedClosingRate, 80, 60))}>
                                {pct(rep.qualifiedClosingRate)}
                              </td>
                              <td className="p-3 text-center text-foreground">{num(rep.selfSetCount)}</td>
                              <td className="p-3 text-center text-foreground">{num(rep.assignedCount)}</td>
                              <td
                                className={cn(
                                  "p-3 text-center",
                                  Number(rep.pendingOutcome) > 0 ? "font-medium text-yellow-400" : "text-foreground"
                                )}
                              >
                                {num(rep.pendingOutcome)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : null}

      {viewMode === "rep" && repPerformance && repPerformance.length > 0 ? (
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">All Sales Reps Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-3 text-left font-medium text-muted-foreground">Sales Rep</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Team</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Appts</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Sit Downs</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">SD Rate</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Qual. SD</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Qual. SD Rate</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Closed</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Close Rate</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Qual. Close</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Self-Set</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Assigned</th>
                    <th className="p-3 text-center font-medium text-muted-foreground">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {repPerformance.map((rep, idx) => (
                    <tr
                      key={`${rep.salesRep}-${idx}`}
                      className={cn(
                        "border-t border-border/50 transition-colors hover:bg-accent/20",
                        idx % 2 !== 0 && "bg-muted/20"
                      )}
                    >
                      <td className="p-3 font-medium text-foreground">{rep.salesRep}</td>
                      <td className="p-3 text-muted-foreground">{rep.salesTeamDisplay || rep.salesTeam || "—"}</td>
                      <td className="p-3 text-center text-foreground">{num(rep.totalAppointments)}</td>
                      <td className="p-3 text-center text-foreground">{num(rep.sitDowns)}</td>
                      <td className={cn("p-3 text-center font-medium", rateColor(rep.sitDownRate, 50, 30))}>
                        {pct(rep.sitDownRate)}
                      </td>
                      <td className="p-3 text-center text-foreground">{num(rep.qualifiedSitDowns)}</td>
                      <td className={cn("p-3 text-center font-medium", rateColor(rep.qualifiedSitDownRate, 40, 20))}>
                        {pct(rep.qualifiedSitDownRate)}
                      </td>
                      <td className="p-3 text-center text-foreground">{num(rep.closedDeals)}</td>
                      <td className={cn("p-3 text-center font-medium", rateColor(rep.closingRate, 40, 25))}>
                        {pct(rep.closingRate)}
                      </td>
                      <td className={cn("p-3 text-center font-medium", rateColor(rep.qualifiedClosingRate, 80, 60))}>
                        {pct(rep.qualifiedClosingRate)}
                      </td>
                      <td className="p-3 text-center text-foreground">{num(rep.selfSetCount)}</td>
                      <td className="p-3 text-center text-foreground">{num(rep.assignedCount)}</td>
                      <td
                        className={cn(
                          "p-3 text-center",
                          Number(rep.pendingOutcome) > 0 ? "font-medium text-yellow-400" : "text-foreground"
                        )}
                      >
                        {num(rep.pendingOutcome)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
