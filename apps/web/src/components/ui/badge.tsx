import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "muted" | "danger";

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  warning: "bg-accent/20 text-amber-800 dark:text-amber-200",
  muted: "bg-muted text-muted-foreground",
  danger: "bg-destructive/12 text-destructive"
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn("inline-flex items-center rounded px-2 py-1 text-xs font-semibold leading-none", variants[variant], className)}
      {...props}
    />
  );
}
