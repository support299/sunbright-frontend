import { ResponsiveContainer } from "recharts";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

/**
 * Wraps a Recharts visual in the standard dark Card chrome and a
 * fixed-height ResponsiveContainer. Pages should not call <Card> +
 * <ResponsiveContainer> directly anymore — use this component so the
 * heading, padding, and theming stay consistent everywhere.
 *
 * Props:
 *   title       — required. Card heading text.
 *   description — optional muted subline under the title.
 *   actions     — optional ReactNode rendered in the top-right (e.g. links/filters).
 *   height      — chart container height in pixels (default 288 = h-72).
 *   className   — additional class names for the outer Card.
 *   contentClassName — additional class names applied to CardContent.
 *   children    — the Recharts root component (BarChart / PieChart / LineChart …).
 */
export default function ChartCard({
  title,
  description,
  actions,
  height = 288,
  className,
  contentClassName,
  children,
}) {
  return (
    <Card className={cn("gap-0 border-border bg-card py-0", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="grid gap-0.5">
          <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent className={contentClassName}>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
