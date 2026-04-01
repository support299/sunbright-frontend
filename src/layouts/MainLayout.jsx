import { Link, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/clean-deals", label: "Clean Deals" },
  { to: "/retention", label: "Retention" },
  { to: "/rep-performance", label: "Rep Performance" },
  { to: "/team-performance", label: "Team Performance" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/on-hold", label: "On Hold" },
  { to: "/cancellations", label: "Cancellations" },
  { to: "/customer-experience", label: "Customer Experience" },
  { to: "/manager-performance", label: "Manager Performance" },
  { to: "/outcome-pending", label: "Outcome Pending" },
  { to: "/ai-insights", label: "AI Insights" },
  { to: "/data-sync", label: "Data Sync" },
];

function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground ">
      <aside className="border-b border-border bg-card/40">
        <nav className="mx-auto flex max-w-[1400px] flex-wrap gap-2 px-4 py-3 sm:px-6 lg:px-8">
          {navItems.map((item) => (
            <Link
              className="rounded-lg border border-transparent px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
              key={item.to}
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
