import { useMemo } from "react";
import {
  DashboardFiltersProvider,
  useDashboardFilters,
} from "./DashboardFiltersContext";

/**
 * Backwards-compatible alias for the old date-only filter context.
 *
 * Pages that only care about `dateRange` / `setDateRange` / `clearDateRange`
 * keep working unchanged. New pages should reach for `useDashboardFilters`
 * directly so they can read installer / team / lead source / manager / market.
 */

export function DateFilterProvider({ children }) {
  return <DashboardFiltersProvider>{children}</DashboardFiltersProvider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- legacy hook export
export function useDateFilter() {
  const {
    dateRange,
    setDateRange,
    clearDateRange,
    hasFilter,
    filterParams,
  } = useDashboardFilters();
  return useMemo(
    () => ({
      dateRange,
      setDateRange: (range) => setDateRange(range || { from: null, to: null }),
      clearDateRange,
      hasFilter: Boolean(dateRange.from || dateRange.to),
      // Legacy callers only know about `dateFrom` / `dateTo`. Continue to
      // expose those, but bring the full filter set along too so any page
      // can opportunistically forward the new dimensions.
      filterParams,
      _hasAnyFilter: hasFilter,
    }),
    [dateRange, setDateRange, clearDateRange, filterParams, hasFilter]
  );
}
