import {
  AlertCircle,
  Brain,
  Building2,
  Gauge,
  Heart,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  PauseCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Sun,
  Target,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import DateRangeFilter from "../components/layout/DateRangeFilter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { cn } from "../lib/utils";
import { clearCredentials, normalizeAuthUser } from "../store/authSlice";

const SIDEBAR_COLLAPSED_KEY = "sunbright-sidebar-collapsed";

const menuItems = [
  { icon: LayoutDashboard, label: "Executive Overview", path: "/" },
  { icon: Sparkles, label: "Clean Deals", path: "/clean-deals" },
  { icon: ShieldAlert, label: "Retention", path: "/retention" },
  { icon: Users, label: "Rep Performance", path: "/rep-performance" },
  { icon: Building2, label: "Team Performance", path: "/team-performance" },
  { icon: Gauge, label: "Pipeline Velocity", path: "/pipeline" },
  { icon: PauseCircle, label: "On Hold Details", path: "/on-hold" },
  { icon: XCircle, label: "Cancellations", path: "/cancellations" },
  { icon: Heart, label: "Customer Experience", path: "/customer-experience" },
  { icon: Target, label: "Manager Performance", path: "/manager-performance" },
  { icon: AlertCircle, label: "Outcome Pending", path: "/outcome-pending" },
  { icon: Brain, label: "AI Insights", path: "/ai-insights", adminOnly: true },
  { icon: UserCog, label: "Users & roles", path: "/users", adminOnly: true },
  { icon: RefreshCw, label: "Data Sync", path: "/data-sync", adminOnly: true },
];

function DashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const normalized = normalizeAuthUser(user);
  const isAdmin = normalized?.role === "admin" || Boolean(normalized?.isStaff);

  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1" : false
  );

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  const toggleSidebar = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  const visibleNav = menuItems.filter((item) => !item.adminOnly || isAdmin);

  const logout = () => {
    dispatch(clearCredentials());
    navigate("/auth/login", { replace: true });
  };

  const displayName = user?.username || "Account";
  const displayEmail = user?.email?.trim() || "";
  const initial = (displayName || "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-svh w-full bg-background text-foreground">
      <aside
        className={cn(
          "sticky top-0 z-30 flex h-svh shrink-0 flex-col border-r-0 bg-sidebar text-sidebar-foreground",
          "transition-[width] duration-200 ease-out",
          collapsed ? "w-[3.25rem]" : "w-[260px]"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-sidebar-border px-2">
          <div className="flex w-full items-center gap-2">
            <button
              type="button"
              onClick={toggleSidebar}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            {!collapsed ? (
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Sun className="h-5 w-5 shrink-0 text-primary" />
                <span className="truncate font-semibold tracking-tight text-foreground">Sunbright</span>
              </div>
            ) : null}
          </div>
        </div>

        <nav
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-2 py-1 [scrollbar-width:thin]"
          aria-label="Main navigation"
        >
          {visibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex h-10 items-center rounded-md text-sm font-normal transition-colors",
                    "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                    collapsed ? "justify-center px-0" : "gap-2 px-2",
                    isActive
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "opacity-90")}
                      aria-hidden
                    />
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-sidebar-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  collapsed && "justify-center px-0"
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sidebar-border bg-primary/20 text-xs font-medium text-primary">
                  {initial}
                </span>
                {!collapsed ? (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-none text-foreground">{displayName}</p>
                    <p className="mt-1.5 truncate text-xs text-muted-foreground">
                      {displayEmail || (isAdmin ? "Administrator" : "Team member")}
                    </p>
                  </div>
                ) : null}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
              {!collapsed ? (
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  {displayEmail || displayName}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col border-l border-border bg-background">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
          <DateRangeFilter />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-[1400px]">
            {normalized?.dataScope?.restricted ? (
              <div
                className={cn(
                  "mb-4 rounded-lg border px-3 py-2.5 text-sm",
                  normalized.dataScope.scopeKind === "unset"
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100"
                    : "border-primary/25 bg-primary/5 text-foreground"
                )}
                role="status"
              >
                {normalized.dataScope.scopeKind === "unset" ? (
                  <>
                    <span className="font-medium">No data scope assigned.</span>{" "}
                    <span className="text-muted-foreground">
                      Ask an administrator to set your team or rep under Users &amp; roles — metrics will stay empty
                      until then.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium">Filtered view:</span>{" "}
                    <span className="text-muted-foreground">{normalized.dataScope.label}</span>
                    {" · "}
                    <span className="text-muted-foreground">
                      Customer Experience totals are limited for scoped accounts until CX rows include team/rep fields.
                    </span>
                  </>
                )}
              </div>
            ) : null}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
