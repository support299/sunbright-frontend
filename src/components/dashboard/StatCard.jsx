import { Card, CardContent } from "../ui/card";

export default function StatCard({ title, value, subtitle, icon }) {
  const IconComponent = icon;
  return (
    <Card className="gap-0 border-border bg-card py-0">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5">
            <IconComponent className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
