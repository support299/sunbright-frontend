import { Download, PauseCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

const EMPTY_PROJECTS = [];
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { formatCurrency } from "../../../lib/formatters";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import { useGetOnHoldProjectsQuery } from "../api/dashboardApi";

function projectName(p) {
  return `${p.first_name || ""} ${p.last_name || ""}`.trim() || "—";
}

export default function OnHoldPage() {
  const { filterParams } = useDateFilter();
  const { data: res, isLoading } = useGetOnHoldProjectsQuery(filterParams);
  const projects = res?.data ?? EMPTY_PROJECTS;

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");

  const teams = useMemo(() => {
    const set = new Set(projects.map((p) => p.sales_team).filter(Boolean));
    return Array.from(set).sort();
  }, [projects]);

  const reasons = useMemo(() => {
    const set = new Set(projects.map((p) => p.on_hold_reason).filter(Boolean));
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const matchSearch =
        !search ||
        projectName(p).toLowerCase().includes(q) ||
        (p.sales_rep || "").toLowerCase().includes(q);
      const matchTeam = teamFilter === "all" || p.sales_team === teamFilter;
      const matchReason = reasonFilter === "all" || p.on_hold_reason === reasonFilter;
      return matchSearch && matchTeam && matchReason;
    });
  }, [projects, search, teamFilter, reasonFilter]);

  const handleExport = () => {
    const headers = ["Name", "Rep", "Team", "Installer", "Reason", "Contract", "Customer Since", "Clean Deal"];
    const rows = filtered.map((p) => [
      projectName(p),
      p.sales_rep || "",
      p.sales_team || "",
      p.installer || "",
      p.on_hold_reason || "",
      p.contract_amount ?? "",
      p.customer_since ?? "",
      p.is_clean_deal ? "Yes" : "No",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "on-hold-projects.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">On Hold Projects</h1>
          <p className="mt-1 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">On Hold Projects</h1>
          <p className="mt-1 text-muted-foreground">
            {filtered.length} of {projects.length} projects shown
          </p>
        </div>
        <Button variant="outline" size="sm" type="button" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="gap-0 border-border bg-card py-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total On Hold</p>
                <p className="text-2xl font-bold text-foreground">{projects.length}</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2.5">
                <PauseCircle className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Name or rep..."
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Team</label>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All teams</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Reason</label>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All reasons</option>
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="gap-0 border-border bg-card py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Rep</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Team</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Installer</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Reason</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Contract</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Customer since</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Clean</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 transition-colors hover:bg-accent/30">
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">{projectName(p)}</td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">{p.sales_rep || "—"}</td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">{p.sales_team || "—"}</td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">{p.installer || "—"}</td>
                    <td className="max-w-[200px] truncate py-3 px-3 text-foreground">{p.on_hold_reason || "—"}</td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">
                      {formatCurrency(p.contract_amount)}
                    </td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">{p.customer_since || "—"}</td>
                    <td className="whitespace-nowrap py-3 px-3 text-foreground">{p.is_clean_deal ? "Yes" : "No"}</td>
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
