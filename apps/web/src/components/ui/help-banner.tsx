import { cn } from "@/lib/utils";
import { Info, AlertCircle, CheckCircle2 } from "lucide-react";

type HelpBannerVariant = "info" | "success" | "warning";

const styles: Record<HelpBannerVariant, string> = {
  info: "border-orange-500/30 bg-orange-500/10 text-orange-100",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
};

interface HelpBannerProps {
  title?: string;
  children: React.ReactNode;
  variant?: HelpBannerVariant;
  className?: string;
}

export function HelpBanner({
  title,
  children,
  variant = "info",
  className,
}: HelpBannerProps) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        styles[variant],
        className,
      )}
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          {title && <p className="mb-1 font-semibold">{title}</p>}
          <div className="text-muted-foreground [&_strong]:text-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-muted-foreground">{children}</p>;
}
