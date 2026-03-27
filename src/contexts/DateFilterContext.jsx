import { createContext, useContext, useMemo, useState } from "react";

/** @typedef {{ from: string | null; to: string | null }} DateRange */

/** @type {React.Context<null | { dateRange: DateRange; setDateRange: (r: DateRange) => void; clearDateRange: () => void; hasFilter: boolean; filterParams: { dateFrom: string | null; dateTo: string | null } }>} */
const DateFilterContext = createContext(null);

export function DateFilterProvider({ children }) {
  /** @type {[DateRange, React.Dispatch<React.SetStateAction<DateRange>>]} */
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const hasFilter = dateRange.from !== null || dateRange.to !== null;

  const filterParams = useMemo(
    () => ({ dateFrom: dateRange.from, dateTo: dateRange.to }),
    [dateRange.from, dateRange.to]
  );

  const clearDateRange = () => setDateRange({ from: null, to: null });

  const value = useMemo(
    () => ({ dateRange, setDateRange, clearDateRange, hasFilter, filterParams }),
    [dateRange, hasFilter, filterParams]
  );

  return <DateFilterContext.Provider value={value}>{children}</DateFilterContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with provider
export function useDateFilter() {
  const ctx = useContext(DateFilterContext);
  if (!ctx) throw new Error("useDateFilter must be used within DateFilterProvider");
  return ctx;
}
