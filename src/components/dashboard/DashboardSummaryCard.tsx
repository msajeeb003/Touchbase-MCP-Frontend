import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dashCard } from "@/components/dashboard/dashboardTheme";

const numberFormatter = new Intl.NumberFormat();

interface DashboardSummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  valueClassName?: string;
}

export default function DashboardSummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  valueClassName = "text-landing-fog",
}: DashboardSummaryCardProps) {
  return (
    <Card
      className={cn(
        dashCard,
        "transition-colors duration-200 hover:border-landing-sky/40",
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-landing-mono text-[10.5px] uppercase leading-[1.5] tracking-[0.12em] text-landing-fog/50">
            {title}
          </p>
          <span
            className={cn(
              "flex h-9 w-9 flex-none items-center justify-center rounded-lg",
              iconClassName,
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        </div>

        <p
          className={cn(
            "mt-3 font-landing-display text-[30px] font-bold leading-none tracking-[-0.02em] tabular-nums",
            valueClassName,
          )}
        >
          {numberFormatter.format(value)}
        </p>
        <p className="mt-2 text-[13px] leading-snug text-landing-fog/50">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
