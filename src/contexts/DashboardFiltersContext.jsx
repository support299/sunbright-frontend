import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * @typedef {Object} DashboardFilters
 * @property {string|null} dateFrom
 * @property {string|null} dateTo
 * @property {string|null} salesTeam
 * @property {string|null} installer
 * @property {string|null} leadSource
 * @property {string|null} manager
 * @property {string|null} market
 */

const EMPTY_FILTERS = Object.freeze({
  dateFrom: null,
  dateTo: null,
  salesTeam: null,
  installer: null,
  leadSource: null,
  manager: null,
  market: null,
});

const FILTER_KEYS = Object.keys(EMPTY_FILTERS);

const DashboardFiltersContext = createContext(null);

function normalizeValue(v) {
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") return v;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function DashboardFiltersProvider({ children }) {
  const [filters, setFiltersState] = useState(EMPTY_FILTERS);

  const setFilter = useCallback((key, value) => {
    if (!FILTER_KEYS.includes(key)) {
      if (import.meta.env.DEV) {
        console.warn(`DashboardFilters: unknown filter "${key}"`);
      }
      return;
    }
    setFiltersState((prev) => ({ ...prev, [key]: normalizeValue(value) }));
  }, []);

  const setFilters = useCallback((partial) => {
    setFiltersState((prev) => {
      const next = { ...prev };
      for (const key of FILTER_KEYS) {
        if (key in (partial || {})) next[key] = normalizeValue(partial[key]);
      }
      return next;
    });
  }, []);

  const setDateRange = useCallback(({ from = null, to = null }) => {
    setFiltersState((prev) => ({
      ...prev,
      dateFrom: normalizeValue(from),
      dateTo: normalizeValue(to),
    }));
  }, []);

  const clearAll = useCallback(() => setFiltersState(EMPTY_FILTERS), []);

  const clearDateRange = useCallback(
    () => setFiltersState((prev) => ({ ...prev, dateFrom: null, dateTo: null })),
    []
  );

  const hasFilter = useMemo(
    () => FILTER_KEYS.some((k) => filters[k] !== null && filters[k] !== ""),
    [filters]
  );

  const dateRange = useMemo(
    () => ({ from: filters.dateFrom, to: filters.dateTo }),
    [filters.dateFrom, filters.dateTo]
  );

  const filterParams = useMemo(() => ({ ...filters }), [filters]);

  const value = useMemo(
    () => ({
      filters,
      filterParams,
      dateRange,
      setFilter,
      setFilters,
      setDateRange,
      clearDateRange,
      clearAll,
      hasFilter,
    }),
    [filters, filterParams, dateRange, setFilter, setFilters, setDateRange, clearDateRange, clearAll, hasFilter]
  );

  return (
    <DashboardFiltersContext.Provider value={value}>{children}</DashboardFiltersContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with provider
export function useDashboardFilters() {
  const ctx = useContext(DashboardFiltersContext);
  if (!ctx) {
    throw new Error("useDashboardFilters must be used within DashboardFiltersProvider");
  }
  return ctx;
}

export const DASHBOARD_FILTER_KEYS = FILTER_KEYS;
