import { Search, UserCog } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { normalizeAuthUser, setCredentials } from "../../../store/authSlice";
import { extractApiErrors } from "../../../utils/extractApiErrors";
import { useGetDashboardUsersQuery, useUpdateDashboardUserMutation } from "../api/usersApi";

function formatJoined(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function parseTeamsText(text) {
  return text
    .split(/[\n,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function DataScopeEditor({ row, disabled, onError, onSyncedSelf }) {
  const ds = row.dataScope || {};
  const initialKind = ["team", "teams", "rep"].includes(ds.scopeKind) ? ds.scopeKind : "team";
  const [scopeKind, setScopeKind] = useState(initialKind);
  const [salesTeam, setSalesTeam] = useState(ds.salesTeam || "");
  const [salesRep, setSalesRep] = useState(ds.salesRep || "");
  const [teamsText, setTeamsText] = useState((ds.salesTeams || []).join("\n"));
  const [updateUser, { isLoading }] = useUpdateDashboardUserMutation();

  useEffect(() => {
    const d = row.dataScope || {};
    const k = ["team", "teams", "rep"].includes(d.scopeKind) ? d.scopeKind : "team";
    setScopeKind(k);
    setSalesTeam(d.salesTeam || "");
    setSalesRep(d.salesRep || "");
    setTeamsText((d.salesTeams || []).join("\n"));
  }, [row.id, row.dataScope]);

  const saveScope = async () => {
    onError("");
    const payload = {
      scopeKind,
      salesTeam: scopeKind === "team" ? salesTeam.trim() : "",
      salesRep: scopeKind === "rep" ? salesRep.trim() : "",
      salesTeams: scopeKind === "teams" ? parseTeamsText(teamsText) : [],
    };
    try {
      const apiRes = await updateUser({ id: row.id, dataScope: payload }).unwrap();
      onSyncedSelf?.(apiRes?.data);
    } catch (err) {
      const { generalErrors, fieldErrors } = extractApiErrors(err);
      const msg =
        generalErrors[0] || fieldErrors.dataScope?.[0] || "Could not save data scope.";
      onError(msg);
    }
  };

  const clearScope = async () => {
    onError("");
    try {
      const apiRes = await updateUser({ id: row.id, clearDataScope: true }).unwrap();
      onSyncedSelf?.(apiRes?.data);
      setSalesTeam("");
      setSalesRep("");
      setTeamsText("");
    } catch (err) {
      const { generalErrors, fieldErrors } = extractApiErrors(err);
      const msg =
        generalErrors[0] || fieldErrors.dataScope?.[0] || "Could not clear data scope.";
      onError(msg);
    }
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="font-medium text-foreground">Data visibility (team members only)</p>
      <p className="text-xs text-muted-foreground">
        Match names to values in Sunbase / CRM (<span className="text-foreground">sales_team</span>,{" "}
        <span className="text-foreground">sales_rep</span>). Case-insensitive.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Scope type</span>
          <select
            className="h-9 min-w-[10rem] rounded-md border border-input bg-background px-2 text-foreground"
            value={scopeKind}
            disabled={disabled || isLoading}
            onChange={(e) => setScopeKind(e.target.value)}
          >
            <option value="team">One sales team</option>
            <option value="teams">Multiple teams</option>
            <option value="rep">One rep (sales rep / setter)</option>
          </select>
        </label>
        {scopeKind === "team" ? (
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
            <span className="text-xs text-muted-foreground">Team name</span>
            <input
              className="h-9 rounded-md border border-input bg-background px-2 text-foreground"
              value={salesTeam}
              disabled={disabled || isLoading}
              onChange={(e) => setSalesTeam(e.target.value)}
              placeholder="e.g. Northeast"
            />
          </label>
        ) : null}
        {scopeKind === "teams" ? (
          <label className="flex min-w-[16rem] flex-1 flex-col gap-1">
            <span className="text-xs text-muted-foreground">Team names (comma or newline)</span>
            <textarea
              className="min-h-[4rem] rounded-md border border-input bg-background px-2 py-1.5 text-foreground"
              value={teamsText}
              disabled={disabled || isLoading}
              onChange={(e) => setTeamsText(e.target.value)}
              placeholder={"Team A\nTeam B"}
            />
          </label>
        ) : null}
        {scopeKind === "rep" ? (
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1">
            <span className="text-xs text-muted-foreground">Rep name</span>
            <input
              className="h-9 rounded-md border border-input bg-background px-2 text-foreground"
              value={salesRep}
              disabled={disabled || isLoading}
              onChange={(e) => setSalesRep(e.target.value)}
              placeholder="As shown in CRM"
            />
          </label>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" disabled={disabled || isLoading} onClick={saveScope}>
            Save scope
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={disabled || isLoading} onClick={clearScope}>
            Clear scope
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Current: <span className="text-foreground">{ds.label || "—"}</span>
      </p>
    </div>
  );
}

export default function UsersRolesPage() {
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.user);
  const normalizedSelf = normalizeAuthUser(currentUser);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  const { data: res, isLoading, isFetching, error } = useGetDashboardUsersQuery({
    page,
    pageSize: 25,
    search: debounced,
  });

  const payload = res?.data;
  const items = payload?.items ?? [];
  const total = payload?.total ?? 0;
  const pageSize = payload?.pageSize ?? 25;

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const [updateUser, { isLoading: saving }] = useUpdateDashboardUserMutation();
  const [actionError, setActionError] = useState("");

  const syncSelfFromRow = (updated) => {
    if (!updated || updated.id !== normalizedSelf?.id) return;
    dispatch(
      setCredentials({
        access: localStorage.getItem("accessToken"),
        refresh: localStorage.getItem("refreshToken"),
        user: updated,
      })
    );
  };

  const onRoleChange = async (row, nextRole) => {
    const nextStaff = nextRole === "admin";
    if (row.isStaff === nextStaff) return;
    setActionError("");
    try {
      const apiRes = await updateUser({ id: row.id, role: nextRole }).unwrap();
      const updated = apiRes?.data;
      syncSelfFromRow(updated);
    } catch (err) {
      const { generalErrors, fieldErrors } = extractApiErrors(err);
      const msg =
        generalErrors[0] || fieldErrors.role?.[0] || fieldErrors.isStaff?.[0] || "Could not update role.";
      setActionError(msg);
    }
  };

  const onActiveToggle = async (row) => {
    const next = !row.isActive;
    if (row.id === normalizedSelf?.id && !next) return;
    setActionError("");
    try {
      const apiRes = await updateUser({ id: row.id, isActive: next }).unwrap();
      syncSelfFromRow(apiRes?.data);
    } catch (err) {
      const { generalErrors, fieldErrors } = extractApiErrors(err);
      const msg =
        generalErrors[0] || fieldErrors.isActive?.[0] || "Could not update account status.";
      setActionError(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <UserCog className="h-7 w-7 text-primary" aria-hidden />
          Users &amp; roles
        </h1>
        <p className="mt-1 text-muted-foreground">
          <span className="text-foreground">Administrators</span> see all organization data.{" "}
          <span className="text-foreground">Team members</span> only see projects and metrics for the sales team or rep
          you assign below (Customer Experience charts stay empty for scoped users until CX is linked to teams).
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Accounts</CardTitle>
          {actionError ? (
            <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {actionError}
            </p>
          ) : null}
          <div className="relative mt-2 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search username or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              Could not load users. Check that you are signed in as an administrator.
            </p>
          ) : null}
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">User</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Active</th>
                  <th className="px-3 py-3 text-left font-medium text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                ) : null}
                {!isLoading && items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      No users match your search.
                    </td>
                  </tr>
                ) : null}
                {items.map((row) => (
                  <Fragment key={row.id}>
                    <tr className="border-b border-border/60 transition-colors hover:bg-accent/20">
                      <td className="px-3 py-3 font-medium text-foreground">{row.username}</td>
                      <td className="max-w-[220px] truncate px-3 py-3 text-muted-foreground">{row.email || "—"}</td>
                      <td className="px-3 py-3">
                        <select
                          className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={row.role}
                          disabled={saving || isFetching}
                          onChange={(e) => onRoleChange(row, e.target.value)}
                          aria-label={`Role for ${row.username}`}
                        >
                          <option value="user">Team member</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <label className="flex cursor-pointer items-center gap-2 text-foreground">
                          <input
                            type="checkbox"
                            checked={row.isActive}
                            disabled={
                              saving || isFetching || (row.id === normalizedSelf?.id && row.isActive)
                            }
                            onChange={() => onActiveToggle(row)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <span className="text-muted-foreground">{row.isActive ? "Yes" : "No"}</span>
                        </label>
                        {row.id === normalizedSelf?.id ? (
                          <p className="mt-1 text-xs text-muted-foreground">You cannot deactivate yourself.</p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                        {formatJoined(row.dateJoined)}
                      </td>
                    </tr>
                    {!row.isStaff ? (
                      <tr className="border-b border-border/60 bg-muted/15">
                        <td colSpan={5} className="px-3 py-4">
                          <DataScopeEditor
                            row={row}
                            disabled={saving || isFetching}
                            onError={setActionError}
                            onSyncedSelf={syncSelfFromRow}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {total} account{total === 1 ? "" : "s"}
                {isFetching ? " · Updating…" : ""}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {total} account{total === 1 ? "" : "s"}
              {isFetching ? " · Updating…" : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
