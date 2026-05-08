import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";

/**
 * KPI tile with optional period-over-period delta indicator. Use this when
 * you have the value AND a previous-period comparison; for simple value-only
 * tiles, keep using the existing <StatCard />.
 *
 * Props:
 *   title    — required string.
 *   value    — primary value (number or formatted string).
 *   subtitle — secondary string under the value.
 *   icon     — optional Lucide icon component.
 *   delta    — number (positive / negative). Renders a tinted pill with arrow.
 *   deltaSuffix — string appended to the delta (default "%").
 *   higherIsBetter — defaults to true; flip for cancellation-style metrics.
 */
export default function KpiTrendCard({
  title,
  value,
  subtitle,
  icon: Icon,
  delta,
  deltaSuffix = "%",
  higherIsBetter = true,
}) {
  const hasDelta = typeof delta === "number" && !Number.isNaN(delta);
  const isPositive = hasDelta && (higherIsBetter ? delta >= 0 : delta < 0);
  const ArrowIcon = hasDelta && delta < 0 ? TrendingDown : TrendingUp;

  return (
    <Card className="gap-0 border-border bg-card py-0">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <div className="flex items-center gap-2">
              {hasDelta ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
                    isPositive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  )}
                >
                  <ArrowIcon className="h-3 w-3" aria-hidden />
                  {`${delta > 0 ? "+" : ""}${delta}${deltaSuffix}`}
                </span>
              ) : null}
              {subtitle ? (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          </div>
          {Icon ? (
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
