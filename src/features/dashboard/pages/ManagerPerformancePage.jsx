import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  HardHat,
  Hammer,
  PackageCheck,
  Phone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  XCircle,
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
import ChartCard from "../../../components/dashboard/ChartCard";
import StatCard from "../../../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useDashboardFilters } from "../../../contexts/DashboardFiltersContext";
import { TOOLTIP_STYLE } from "../../../lib/chartTheme";
import { cn } from "../../../lib/utils";
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

function daysFmt(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  return Number.isNaN(n) ? "—" : `${n.toFixed(1)}d`;
}

function rateColor(val, good, warn) {
  if (val == null) return "text-muted-foreground";
  const n = Number(val);
  if (n >= good) return "text-green-400";
  if (n >= warn) return "text-yellow-400";
  return "text-red-400";
}

function shortenName(s, max = 14) {
  if (!s) return "—";
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export default function ManagerPerformancePage() {
  const { filterParams } = useDashboardFilters();
  const { data: res, isLoading } = useGetManagerPerformanceQuery(filterParams, {
    refetchOnMountOrArgChange: true,
  });
  const bundle = res?.data || {};
  const managerOverview = bundle.managerOverview || {};
  const repPerformance = bundle.repPerformance;
  const teamPerformance = bundle.teamPerformance;
  const doorStats = bundle.doorStats || {};
  const dealStageBreakdown = bundle.dealStageBreakdown || [];
  const pmPerformance = bundle.pmPerformance || [];
  const pmKpis = bundle.pmKpis || {};

  const [viewMode, setViewMode] = useState("team");
  const [expandedTeams, setExpandedTeams] = useState(() => new Set());
  const [selectedPm, setSelectedPm] = useState(null);

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
    name: shortenName(r.deal_stage, 18),
    full: r.deal_stage,
    count: Number(r.count),
  }));

  const pmStatusData = useMemo(() => {
    return (pmPerformance || []).slice(0, 12).map((row) => ({
      name: shortenName(row.projectManager),
      full: row.projectManager,
      Active: Number(row.activeProjects) || 0,
      "On Hold": Number(row.onHoldProjects) || 0,
      Cancelled: Number(row.cancelledProjects) || 0,
      "Red Flagged": Number(row.redFlaggedProjects) || 0,
      Disqualified: Number(row.disqualifiedProjects) || 0,
    }));
  }, [pmPerformance]);

  const activeByPm = useMemo(() => {
    return [...(pmPerformance || [])]
      .sort((a, b) => Number(b.activeProjects || 0) - Number(a.activeProjects || 0))
      .slice(0, 12)
      .map((row) => ({
        name: shortenName(row.projectManager),
        full: row.projectManager,
        value: Number(row.activeProjects) || 0,
      }));
  }, [pmPerformance]);

  const cleanByPm = useMemo(() => {
    return [...(pmPerformance || [])]
      .sort((a, b) => Number(b.cleanDeals || 0) - Number(a.cleanDeals || 0))
      .slice(0, 12)
      .map((row) => ({
        name: shortenName(row.projectManager),
        full: row.projectManager,
        value: Number(row.cleanDeals) || 0,
      }));
  }, [pmPerformance]);

  const selectedRow = useMemo(() => {
    if (!selectedPm) return null;
    return (pmPerformance || []).find((r) => r.projectManager === selectedPm) || null;
  }, [pmPerformance, selectedPm]);

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

  const salesFieldTab = (
    <div className="space-y-6">
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
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${Number(value).toFixed(1)}%`]} />
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
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10, fill: "oklch(0.6 0.015 260)" }} />
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

  const pmTab = (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Job-level metrics from synced Sunbase projects, grouped by{" "}
        <strong className="text-foreground">Project Manager</strong>. Click any row in the table to drill into a single PM.
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard title="Closures" value={pct(pmKpis.cancelledPct)} subtitle={`${num(pmKpis.cancelled)} cancelled`} icon={XCircle} />
        <StatCard title="On Hold" value={pct(pmKpis.onHoldPct)} subtitle={`${num(pmKpis.onHold)} jobs`} icon={AlertCircle} />
        <StatCard title="Active Deals" value={num(pmKpis.activeDeals)} subtitle={`${num(pmKpis.totalProjects)} total`} icon={Target} />
        <StatCard
          title="Clean Deals"
          value={pct(pmKpis.cleanDealsPct)}
          subtitle={`${num(pmKpis.cleanDeals)} clean`}
          icon={Sparkles}
        />
        <StatCard
          title="Install Scheduled"
          value={pct(pmKpis.installScheduledPct)}
          subtitle={`${num(pmKpis.installScheduled)} jobs`}
          icon={ClipboardList}
        />
        <StatCard
          title="Install Completed"
          value={pct(pmKpis.installCompletedPct)}
          subtitle={`${num(pmKpis.installCompleted)} jobs`}
          icon={CheckCircle2}
        />
        <StatCard
          title="CRC Reached"
          value={pct(pmKpis.crcReachedPct)}
          subtitle={`${num(pmKpis.crcReached)} jobs`}
          icon={PackageCheck}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {pmStatusData.length > 0 ? (
          <ChartCard
            title="Deals by Status"
            description="Stacked status mix per project manager (top 12 by total)."
            height={320}
            className="lg:col-span-2"
          >
            <BarChart data={pmStatusData} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
              <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 10 }} />
              <YAxis stroke="oklch(0.6 0.015 260)" />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v, name) => [v, name]}
                labelFormatter={(_, p) => p?.[0]?.payload?.full || ""}
              />
              <Legend />
              <Bar dataKey="Active" stackId="a" fill="#22c55e" />
              <Bar dataKey="On Hold" stackId="a" fill="#ec4899" />
              <Bar dataKey="Cancelled" stackId="a" fill="#ef4444" />
              <Bar dataKey="Red Flagged" stackId="a" fill="#f97316" />
              <Bar dataKey="Disqualified" stackId="a" fill="#64748b" />
            </BarChart>
          </ChartCard>
        ) : null}

        {activeByPm.length > 0 ? (
          <ChartCard
            title="Active Deals by PM"
            description="Top 12 PMs by active project count."
            height={300}
          >
            <BarChart data={activeByPm} layout="vertical" margin={{ left: 16, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
              <XAxis type="number" stroke="oklch(0.6 0.015 260)" />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10, fill: "oklch(0.6 0.015 260)" }} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [v, "Active deals"]}
                labelFormatter={(_, p) => p?.[0]?.payload?.full || ""}
              />
              <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartCard>
        ) : null}

        {cleanByPm.length > 0 ? (
          <ChartCard
            title="Clean Deals by PM"
            description="Top 12 PMs by clean deal count."
            height={300}
          >
            <BarChart data={cleanByPm} layout="vertical" margin={{ left: 16, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
              <XAxis type="number" stroke="oklch(0.6 0.015 260)" />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10, fill: "oklch(0.6 0.015 260)" }} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [v, "Clean deals"]}
                labelFormatter={(_, p) => p?.[0]?.payload?.full || ""}
              />
              <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartCard>
        ) : null}
      </div>

      {pmPerformance.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No project manager assignments found. Run data sync after the Job List includes the Project Manager column.
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-foreground">All project managers</CardTitle>
            {selectedPm ? (
              <button
                type="button"
                onClick={() => setSelectedPm(null)}
                className="text-xs text-primary hover:underline"
              >
                Clear selection
              </button>
            ) : null}
          </CardHeader>
          <CardContent className="max-h-[min(560px,70vh)] overflow-auto p-0">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="bg-muted/50">
                  <th className="p-3 text-left font-medium text-muted-foreground">Project manager</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Deals</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Active</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Cancelled</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">On hold</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Clean %</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Retention</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Avg CRC</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Avg SS→SSR</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Avg install</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">CRC #</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Install sched.</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Install comp.</th>
                </tr>
              </thead>
              <tbody>
                {pmPerformance.map((row, idx) => {
                  const isSelected = selectedPm === row.projectManager;
                  return (
                    <tr
                      key={`${row.projectManager}-${idx}`}
                      onClick={() =>
                        setSelectedPm((curr) => (curr === row.projectManager ? null : row.projectManager))
                      }
                      className={cn(
                        "cursor-pointer border-t border-border/50 transition-colors",
                        isSelected ? "bg-primary/15 hover:bg-primary/20" : "hover:bg-accent/20",
                        !isSelected && idx % 2 !== 0 && "bg-muted/20"
                      )}
                    >
                      <td className="p-3 font-medium text-foreground">{row.projectManager}</td>
                      <td className="p-3 text-center text-foreground">{num(row.totalProjects)}</td>
                      <td className="p-3 text-center text-foreground">{num(row.activeProjects)}</td>
                      <td className="p-3 text-center text-foreground">{num(row.cancelledProjects)}</td>
                      <td className="p-3 text-center text-foreground">{num(row.onHoldProjects)}</td>
                      <td className={cn("p-3 text-center font-medium", rateColor(row.cleanDealPct, 60, 40))}>
                        {pct(row.cleanDealPct)}
                      </td>
                      <td className={cn("p-3 text-center font-medium", rateColor(row.netRetentionRate, 80, 60))}>
                        {pct(row.netRetentionRate)}
                      </td>
                      <td className="p-3 text-center text-foreground">{daysFmt(row.avgDaysToCrc)}</td>
                      <td className="p-3 text-center text-foreground">{daysFmt(row.avgDaysSsToSsr)}</td>
                      <td className="p-3 text-center text-foreground">{daysFmt(row.avgDaysToInstall)}</td>
                      <td className="p-3 text-center text-foreground">{num(row.crcReachedCount)}</td>
                      <td className="p-3 text-center text-foreground">{num(row.installScheduledCount)}</td>
                      <td className="p-3 text-center text-foreground">{num(row.installCompletedCount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {selectedRow ? <PmDrillIn row={selectedRow} onClose={() => setSelectedPm(null)} /> : null}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manager Performance</h1>
        <p className="mt-1 text-muted-foreground">
          Field &amp; appointment metrics plus operational KPIs by project manager.
        </p>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger value="sales">Sales &amp; field</TabsTrigger>
          <TabsTrigger value="pm">Project managers</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-4">
          {salesFieldTab}
        </TabsContent>
        <TabsContent value="pm" className="mt-4">
          {pmTab}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PmDrillIn({ row, onClose }) {
  const installs = (row.monthlyInstalls || []).map((p) => ({ name: p.month, value: Number(p.value) || 0 }));
  const cleanDeals = (row.monthlyCleanDeals || []).map((p) => ({ name: p.month, value: Number(p.value) || 0 }));

  return (
    <Card className="border-primary/40 bg-card">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">
            <HardHat className="mr-2 inline h-4 w-4 text-primary" />
            {row.projectManager}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {num(row.totalProjects)} deals — {num(row.activeProjects)} active, {num(row.cancelledProjects)} cancelled,{" "}
            {num(row.onHoldProjects)} on hold
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
          Close
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Retention rate" value={pct(row.netRetentionRate)} icon={TrendingUp} />
          <StatCard title="Clean %" value={pct(row.cleanDealPct)} subtitle={`${num(row.cleanDeals)} clean`} icon={Sparkles} />
          <StatCard title="Avg CRC days" value={daysFmt(row.avgDaysToCrc)} subtitle={`${num(row.crcReachedCount)} CRCs`} icon={PackageCheck} />
          <StatCard title="Avg SS→SSR days" value={daysFmt(row.avgDaysSsToSsr)} icon={ClipboardList} />
          <StatCard
            title="Avg install days"
            value={daysFmt(row.avgDaysToInstall)}
            subtitle={`${num(row.installScheduledCount)} scheduled`}
            icon={Hammer}
          />
          <StatCard
            title="Install completed"
            value={num(row.installCompletedCount)}
            subtitle={`${num(row.installScheduledCount)} scheduled`}
            icon={CheckCircle2}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Installations" description="Monthly install count (completed when available, else scheduled)." height={240}>
            <BarChart data={installs} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
              <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 10 }} />
              <YAxis stroke="oklch(0.6 0.015 260)" allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v, "Installs"]} />
              <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Clean Deals" description="Monthly clean deals (by Customer Since date)." height={240}>
            <BarChart data={cleanDeals} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
              <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" tick={{ fontSize: 10 }} />
              <YAxis stroke="oklch(0.6 0.015 260)" allowDecimals={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v, "Clean deals"]} />
              <Bar dataKey="value" fill="#ec4899" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartCard>
        </div>
      </CardContent>
    </Card>
  );
}
