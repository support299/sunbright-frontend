import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";

/**
 * One stage in a funnel KPI strip: a label, a count, and an optional
 * conversion percent against the previous stage. Designed to be rendered
 * inside <StageStrip />.
 *
 * Props:
 *   label      — required string (e.g. "Sold Projects").
 *   count      — number or formatted string.
 *   pctOfPrev  — optional 0–100 number. If supplied, rendered as "X% of prev".
 *   accent     — Tailwind color class for the bottom accent bar (default primary).
 *   muted      — when true, dims the tile (e.g. "Cancelled" stage).
 */
export default function FunnelMetricCard({
  label,
  count,
  pctOfPrev,
  accent = "bg-primary",
  muted = false,
}) {
  return (
    <Card className={cn("gap-0 border-border bg-card py-0", muted && "opacity-70")}>
      <CardContent className="px-4 pb-4 pt-3.5">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{count ?? "—"}</p>
        {typeof pctOfPrev === "number" && !Number.isNaN(pctOfPrev) ? (
          <p className="text-xs text-muted-foreground">{`${pctOfPrev.toFixed(1)}% of prev`}</p>
        ) : null}
      </CardContent>
      <div className={cn("h-1 w-full rounded-b-xl", accent)} />
    </Card>
  );
}
