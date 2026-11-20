import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const numberFormatter = new Intl.NumberFormat();

interface DashboardSummaryCardProps {
  title: string;
  value: number;
  /** Optional, kept for callers that still pass it. Not shown: the title says enough. */
  description?: string;
  icon: LucideIcon;
  iconClassName: string;
  valueClassName?: string;
}

/** One number cell inside the workspace totals strip. */
export default function DashboardSummaryCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  valueClassName,
}: DashboardSummaryCardProps) {
  return (
    <div className="-mb-px -mr-px min-w-0 border-b border-r px-4 py-4">
      <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-tb-ink-3">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", iconClassName)} aria-hidden />
        <span className="truncate">{title}</span>
      </p>
      <p className={cn("tb-num mt-2 text-[26px]", valueClassName)}>{numberFormatter.format(value)}</p>
    </div>
  );
}
