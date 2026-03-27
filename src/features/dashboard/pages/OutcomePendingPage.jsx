import { AlertCircle, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { formatDateTimeShort } from "../../../lib/formatters";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import { useGetManagerPerformanceQuery } from "../api/dashboardApi";

const EMPTY_PENDING = [];

function daysSince(iso) {
  if (!iso) return 0;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

export default function OutcomePendingPage() {
  const { filterParams } = useDateFilter();
  const { data: res, isLoading } = useGetManagerPerformanceQuery(filterParams);
  const pending = res?.data?.pendingOutcome ?? EMPTY_PENDING;

  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");

  const teams = useMemo(() => {
    const set = new Set(
      pending.map((a) => a.salesTeamDisplay || a.salesTeam || "Unassigned")
    );
    return Array.from(set).sort();
  }, [pending]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return pending.filter((a) => {
      const matchesSearch =
        !searchTerm ||
        (a.firstName || "").toLowerCase().includes(q) ||
        (a.lastName || "").toLowerCase().includes(q) ||
        (a.salesRep || "").toLowerCase().includes(q) ||
        (a.setter || "").toLowerCase().includes(q) ||
        (a.city || "").toLowerCase().includes(q);
      const team = a.salesTeamDisplay || a.salesTeam || "Unassigned";
      const matchesTeam = teamFilter === "all" || team === teamFilter;
      return matchesSearch && matchesTeam;
    });
  }, [pending, searchTerm, teamFilter]);

  const urgent = filtered.filter((a) => daysSince(a.appointmentDateTime) > 7);
  const recent = filtered.filter((a) => daysSince(a.appointmentDateTime) <= 7);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outcome Pending</h1>
          <p className="mt-1 text-muted-foreground">Loading pending appointments...</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse border-border bg-card">
              <CardContent className="h-20 p-5" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Outcome Pending</h1>
        <p className="mt-1 text-muted-foreground">
          Appointments that have passed but still have no outcome recorded — {filtered.length} total
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
              <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-card">
          <CardContent className="p-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Urgent (7+ days)</p>
              <p className="text-2xl font-bold text-red-400">{urgent.length}</p>
              <p className="text-xs text-muted-foreground">Need immediate follow-up</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Recent (&lt;= 7 days)</p>
              <p className="text-2xl font-bold text-yellow-400">{recent.length}</p>
              <p className="text-xs text-muted-foreground">Within follow-up window</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, rep, setter, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Teams</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="gap-0 border-border bg-card py-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Pending Outcome Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 text-left font-medium text-muted-foreground">Customer</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Appt Date</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Days Ago</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Deal Stage</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Sales Rep</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Setter</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Team</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Lead Source</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">City</th>
                  <th className="p-3 text-center font-medium text-muted-foreground">Self-Set</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-muted-foreground">
                      No pending outcome appointments found
                    </td>
                  </tr>
                ) : (
                  filtered.map((appt, idx) => {
                    const days = daysSince(appt.appointmentDateTime);
                    const isUrgent = days > 7;
                    return (
                      <tr
                        key={appt.id || idx}
                        className={`border-t border-border/50 transition-colors hover:bg-accent/20 ${
                          isUrgent ? "bg-red-500/5" : idx % 2 === 0 ? "" : "bg-muted/20"
                        }`}
                      >
                        <td className="p-3 font-medium text-foreground">
                          {[appt.firstName, appt.lastName].filter(Boolean).join(" ") || "—"}
                        </td>
                        <td className="p-3 text-foreground">{formatDateTimeShort(appt.appointmentDateTime)}</td>
                        <td className={`p-3 text-center font-medium ${isUrgent ? "text-red-400" : "text-yellow-400"}`}>
                          {days}d
                        </td>
                        <td className="p-3 text-muted-foreground">{appt.dealStage || "—"}</td>
                        <td className="p-3 text-foreground">{appt.salesRep || "—"}</td>
                        <td className="p-3 text-foreground">{appt.setter || "—"}</td>
                        <td className="p-3 text-muted-foreground">{appt.salesTeamDisplay || appt.salesTeam || "—"}</td>
                        <td className="p-3 text-muted-foreground">{appt.leadSource || "—"}</td>
                        <td className="p-3 text-muted-foreground">{appt.city || "—"}</td>
                        <td className="p-3 text-center">
                          {appt.isSelfSet ? (
                            <span className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                              Self
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {urgent.length > 0 ? (
        <Card className="gap-0 border-red-500/30 bg-card py-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-red-400">
              <AlertCircle className="h-5 w-5" />
              Over 7 days ({urgent.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              These appointments are in urgent follow-up range. Prioritize rep review and stage updates.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
