import { Calendar, Filter, X } from "lucide-react";
import { useDashboardFilters } from "../../contexts/DashboardFiltersContext";
import { useGetFilterOptionsQuery } from "../../features/dashboard/api/dashboardApi";
import { Button } from "../ui/button";

function FilterSelect({ label, value, options, onChange, placeholder }) {
  if (!options || options.length === 0) return null;
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
  const {
    filters,
    setFilter,
    setDateRange,
    clearAll,
    hasFilter,
  } = useDashboardFilters();

  const { data: optionsRes } = useGetFilterOptionsQuery();
  const options = optionsRes?.data || {};

  const dateFrom = filters.dateFrom ?? "";
  const dateTo = filters.dateTo ?? "";

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>Customer Since:</span>
      </div>
      <input
        type="date"
        value={dateFrom}
        onChange={(event) => setDateRange({ from: event.target.value || null, to: filters.dateTo })}
        className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <span className="text-xs text-muted-foreground">to</span>
      <input
        type="date"
        value={dateTo}
        onChange={(event) => setDateRange({ from: filters.dateFrom, to: event.target.value || null })}
        className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />

      <div className="mx-1 hidden h-5 w-px bg-border md:block" aria-hidden />

      <div className="hidden items-center gap-1 text-xs text-muted-foreground md:flex">
        <Filter className="h-3.5 w-3.5" />
        <span>Filters:</span>
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
      />
      <FilterSelect
        label="Market"
        value={filters.market}
        options={options.markets}
        onChange={(value) => setFilter("market", value)}
      />

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
  );
}
