import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-xl border border-border bg-card py-6 text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("grid gap-2 px-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <div className={cn("font-semibold leading-none", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("px-6", className)} {...props} />;
}
