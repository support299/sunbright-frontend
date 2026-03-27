import { CheckCircle2, Clock, TrendingUp, XCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DataTable from "../../../components/dashboard/DataTable";
import StatCard from "../../../components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { TOOLTIP_STYLE } from "../../../lib/chartTheme";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import { useGetCleanDealsQuery } from "../api/dashboardApi";

export default function CleanDealsPage() {
  const { filterParams } = useDateFilter();
  const { data: res, isLoading } = useGetCleanDealsQuery(filterParams);
  const bundle = res?.data || {};
  const analysis = bundle.analysis || [];
  const byRep = bundle.byRep || [];
  const byTeam = bundle.byTeam || [];
  const byInstaller = bundle.byInstaller || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clean Deals Analysis</h1>
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

  const clean = analysis.find((r) => r.isCleanDeal === 1) || {};
  const notClean = analysis.find((r) => r.isCleanDeal === 0) || {};
  const totalAll = Number(clean.total || 0) + Number(notClean.total || 0);

  const comparisonData = [
    { name: "Total", clean: Number(clean.total || 0), notClean: Number(notClean.total || 0) },
    { name: "Installed", clean: Number(clean.installed || 0), notClean: Number(notClean.installed || 0) },
    { name: "Cancelled", clean: Number(clean.cancelled || 0), notClean: Number(notClean.cancelled || 0) },
    { name: "Active", clean: Number(clean.active || 0), notClean: Number(notClean.active || 0) },
  ];

  const chartDay = (v) => (v != null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : 0);

  const speedData = [
    { name: "Clean Deals", avgDays: chartDay(clean.avgDaysToInstall) },
    { name: "Non-Clean Deals", avgDays: chartDay(notClean.avgDaysToInstall) },
  ];

  const cancelSpeedData = [
    { name: "Clean Deals", avgDays: chartDay(clean.avgDaysToCancel) },
    { name: "Non-Clean Deals", avgDays: chartDay(notClean.avgDaysToCancel) },
  ];

  const repCols = [
    { key: "salesRep", label: "Sales Rep" },
    { key: "salesTeam", label: "Team" },
    { key: "totalProjects", label: "Total" },
    { key: "cleanDeals", label: "Clean" },
    { key: "cleanDealPct", label: "Clean %", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "cleanInstalled", label: "Installed" },
    { key: "realizationRatio", label: "Realization %", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "avgInstallClean", label: "Avg Install (Clean)", format: (v) => (v != null ? `${v} days` : "—") },
    { key: "avgInstallNotClean", label: "Avg Install (Not Clean)", format: (v) => (v != null ? `${v} days` : "—") },
  ];

  const teamCols = [
    { key: "salesTeam", label: "Team" },
    { key: "totalProjects", label: "Total" },
    { key: "cleanDeals", label: "Clean" },
    { key: "cleanDealPct", label: "Clean %", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "realizationRatio", label: "Realization %", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "avgInstallClean", label: "Avg Install (Clean)", format: (v) => (v != null ? `${v} days` : "—") },
    { key: "avgInstallNotClean", label: "Avg Install (Not Clean)", format: (v) => (v != null ? `${v} days` : "—") },
  ];

  const installerCols = [
    { key: "installer", label: "Installer" },
    { key: "totalProjects", label: "Total" },
    { key: "cleanDeals", label: "Clean" },
    { key: "cleanDealPct", label: "Clean %", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "cleanInstalled", label: "Installed" },
    { key: "realizationRatio", label: "Realization %", format: (v) => (v != null ? `${v}%` : "—") },
    { key: "avgInstallClean", label: "Avg Install (Clean)", format: (v) => (v != null ? `${v} days` : "—") },
    { key: "avgInstallNotClean", label: "Avg Install (Not Clean)", format: (v) => (v != null ? `${v} days` : "—") },
  ];

  const realizationPct =
    totalAll > 0 && Number(clean.total) > 0
      ? `${((Number(clean.installed || 0) / Number(clean.total || 1)) * 100).toFixed(1)}%`
      : "N/A";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Clean Deals Analysis</h1>
        <p className="mt-1 text-muted-foreground">
          Compare clean vs non-clean deal performance, installation speed, and realization ratios
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clean Deals"
          value={Number(clean.total || 0)}
          subtitle={totalAll ? `${((Number(clean.total || 0) / totalAll) * 100).toFixed(1)}% of all projects` : "—"}
          icon={CheckCircle2}
        />
        <StatCard
          title="Not Clean Deals"
          value={Number(notClean.total || 0)}
          subtitle={totalAll ? `${((Number(notClean.total || 0) / totalAll) * 100).toFixed(1)}% of all projects` : "—"}
          icon={XCircle}
        />
        <StatCard
          title="Avg Install (Clean)"
          value={
            clean.avgDaysToInstall != null && clean.avgDaysToInstall !== ""
              ? `${clean.avgDaysToInstall} days`
              : "N/A"
          }
          subtitle="Customer sign to install date"
          icon={Clock}
        />
        <StatCard title="Clean Realization" value={realizationPct} subtitle="Clean deals that reached installation" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Clean vs Non-Clean Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                  <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" />
                  <YAxis stroke="oklch(0.6 0.015 260)" />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend />
                  <Bar dataKey="clean" name="Clean" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="notClean" name="Not Clean" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 border-border bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Installation Speed Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speedData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                  <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" />
                  <YAxis stroke="oklch(0.6 0.015 260)" width={40} domain={[0, "auto"]} allowDecimals />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} days`, "Avg Days to Install"]} />
                  <Bar dataKey="avgDays" name="Avg Days to Install" radius={[4, 4, 0, 0]}>
                    {speedData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "#22c55e" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0 border-border bg-card py-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Cancellation Speed: Clean vs Non-Clean</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cancelSpeedData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.012 260)" />
                <XAxis dataKey="name" stroke="oklch(0.6 0.015 260)" />
                <YAxis stroke="oklch(0.6 0.015 260)" width={40} domain={[0, "auto"]} allowDecimals />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} days`, "Avg Days to Cancel"]} />
                <Bar dataKey="avgDays" name="Avg Days to Cancel" radius={[4, 4, 0, 0]}>
                  {cancelSpeedData.map((_, i) => (
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
          <CardTitle className="text-base font-semibold text-foreground">Clean Deal Metrics by Dimension</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rep" className="w-full">
            <TabsList className="bg-secondary">
              <TabsTrigger value="rep">By Rep</TabsTrigger>
              <TabsTrigger value="team">By Team</TabsTrigger>
              <TabsTrigger value="installer">By Installer</TabsTrigger>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
