import { Info, UsersRound } from "lucide-react";
import DataTable from "../../../components/dashboard/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useDashboardFilters } from "../../../contexts/DashboardFiltersContext";
import { useGetRolePerformanceQuery } from "../api/dashboardApi";
import {
  ROLE_PERFORMANCE_CLOSER_COLUMNS,
  ROLE_PERFORMANCE_SETTER_COLUMNS,
  buildRolePerformanceCloserRows,
  buildRolePerformanceSetterRows,
} from "../rolePerformanceTableConfig";

export default function RolePerformancePage() {
  const { filterParams } = useDashboardFilters();
  const { data: res, isLoading } = useGetRolePerformanceQuery(filterParams, {
    refetchOnMountOrArgChange: true,
  });
  const bundle = res?.data || {};
  const notes = bundle.notes || [];

  const setterData = buildRolePerformanceSetterRows(bundle);
  const closerData = buildRolePerformanceCloserRows(bundle);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Setters &amp; closers</h1>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <UsersRound className="h-8 w-8 shrink-0 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Setters &amp; closers</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Agents are taken from <strong>Sunbase Users</strong> (roles). Setter metrics use{" "}
            <strong>Door canvasser</strong>, <strong>Appointment.setter</strong>, and{" "}
            <strong>Project.setter</strong> matched to <strong>Fullname</strong>. Closer metrics use{" "}
            <strong>Appointment.sales_rep</strong>. Run Users + Job List sync after deploy so roles and setter on jobs stay
            current.
          </p>
        </div>
      </div>

      {notes.length > 0 ? (
        <div className="flex gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <ul className="list-inside list-disc space-y-1">
            {notes.map((line, idx) => (
              <li key={`note-${idx}`}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Setters (Sunbase role contains “setter”)</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={setterData} columns={ROLE_PERFORMANCE_SETTER_COLUMNS} />
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">
            Closers / sales (Sunbase role Sales or contains “closer”, excluding setters)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={closerData} columns={ROLE_PERFORMANCE_CLOSER_COLUMNS} />
        </CardContent>
      </Card>
    </div>
  );
}
