import { Calendar, X } from "lucide-react";
import { useDateFilter } from "../../contexts/DateFilterContext";
import { Button } from "../ui/button";

export default function DateRangeFilter() {
  const { dateRange, setDateRange, clearDateRange, hasFilter } = useDateFilter();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>Customer Since:</span>
      </div>
      <input
        type="date"
        value={dateRange.from || ""}
        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value || null })}
        className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <span className="text-xs text-muted-foreground">to</span>
      <input
        type="date"
        value={dateRange.to || ""}
        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value || null })}
        className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {hasFilter ? (
        <Button variant="ghost" size="sm" type="button" onClick={clearDateRange} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
          <X className="mr-1 h-3.5 w-3.5" />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
