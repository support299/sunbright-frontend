import { Calendar, Filter, X } from "lucide-react";
import { useMemo } from "react";
import { useDashboardFilters } from "../../contexts/DashboardFiltersContext";
import { useGetFilterOptionsQuery } from "../../features/dashboard/api/dashboardApi";
import { Button } from "../ui/button";

function toYmd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function FilterSelect({ label, value, options, onChange, placeholder, title: titleAttr }) {
  if (!options || options.length === 0) return null;
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground" title={titleAttr}>
      <span className="hidden md:inline">{label}:</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
        className="h-8 max-w-[10rem] rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">{placeholder ?? `All ${label.toLowerCase()}`}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FiltersBar() {
  const { filters, setFilter, setDateRange, clearAll, hasFilter } = useDashboardFilters();

  const { data: optionsRes } = useGetFilterOptionsQuery();
  const options = optionsRes?.data || {};

  const dateFrom = filters.dateFrom ?? "";
  const dateTo = filters.dateTo ?? "";

  const repNameOptions = useMemo(() => {
    if (filters.repKind === "setter") return options.setters || [];
    if (filters.repKind === "sales_rep") return options.salesReps || [];
    return [];
  }, [filters.repKind, options.setters, options.salesReps]);

  const setLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    setDateRange({ from: toYmd(start), to: toYmd(end) });
  };

  const setMonthToDate = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    setDateRange({ from: toYmd(start), to: toYmd(end) });
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-[11px] leading-snug text-muted-foreground md:text-xs">
        <strong className="font-medium text-foreground/90">Customer Since</strong> drives most KPIs (pipeline,
        performance). Customer Experience uses install dates. Manager includes job PM plus anyone reporting to that
        manager in Sunbase.
      </p>
      <div className="flex w-full flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Customer Since</span>
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateRange({ from: event.target.value || null, to: filters.dateTo })}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Customer since start date"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(event) => setDateRange({ from: filters.dateFrom, to: event.target.value || null })}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Customer since end date"
        />
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={setLast7Days}
          >
            Last 7 days
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={setMonthToDate}
          >
            Month to date
          </Button>
        </div>

        <div className="mx-1 hidden h-5 w-px bg-border md:block" aria-hidden />

        <div className="hidden items-center gap-1 text-xs text-muted-foreground md:flex">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters</span>
        </div>

        <FilterSelect
          label="Team"
          value={filters.salesTeam}
          options={options.salesTeams}
          onChange={(value) => setFilter("salesTeam", value)}
        />
        <FilterSelect
          label="Installer"
          value={filters.installer}
          options={options.installers}
          onChange={(value) => setFilter("installer", value)}
          title="Matches installer on the project or the installer catalog name."
        />
        <FilterSelect
          label="Lead Source"
          value={filters.leadSource}
          options={options.leadSources}
          onChange={(value) => setFilter("leadSource", value)}
        />
        <FilterSelect
          label="Manager"
          value={filters.manager}
          options={options.projectManagers}
          onChange={(value) => setFilter("manager", value)}
          title="Project manager field and/or Sunbase reports of this manager."
        />
        <FilterSelect
          label="Market"
          value={filters.market}
          options={options.markets}
          onChange={(value) => setFilter("market", value)}
        />

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="hidden md:inline">Rep type:</span>
          <select
            value={filters.repKind ?? ""}
            onChange={(event) => {
              const v = event.target.value || null;
              setFilter("repKind", v);
              setFilter("repName", null);
            }}
            className="h-8 max-w-[9rem] rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All reps</option>
            <option value="sales_rep">Sales rep</option>
            <option value="setter">Setter</option>
          </select>
        </label>

        {filters.repKind ? (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="hidden md:inline">Person:</span>
            <select
              value={filters.repName ?? ""}
              onChange={(event) => setFilter("repName", event.target.value || null)}
              className="h-8 max-w-[12rem] rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Choose name</option>
              {repNameOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {hasFilter ? (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={clearAll}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear all
          </Button>
        ) : null}
      </div>
    </div>
  );
}
