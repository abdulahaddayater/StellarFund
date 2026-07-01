import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "muted";
}

const variants = {
  default: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  danger: "bg-red-500/20 text-red-300 border-red-500/30",
  muted: "bg-white/10 text-muted-foreground border-white/10",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: number }) {
  const label = STATUS_LABELS[status] ?? "Unknown";
  const variant =
    status === 0
      ? "default"
      : status === 1
        ? "success"
        : status === 2
          ? "danger"
          : "muted";
  return <Badge variant={variant}>{label}</Badge>;
}

export function CategoryBadge({ category }: { category: string }) {
  return <Badge variant="muted">{category}</Badge>;
}
