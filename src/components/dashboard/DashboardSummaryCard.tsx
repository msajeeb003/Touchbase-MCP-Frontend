import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const numberFormatter = new Intl.NumberFormat();

interface DashboardSummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconClassName: string;
}

/** One number cell inside the workspace totals strip. */
export default function DashboardSummaryCard({
  title,
  value,
  icon: Icon,
  iconClassName,
}: DashboardSummaryCardProps) {
  return (
    <div className="-mb-px -mr-px min-w-0 border-b border-r px-4 py-4">
      <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-tb-ink-3">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", iconClassName)} aria-hidden />
        <span className="truncate">{title}</span>
      </p>
      <p className="tb-num mt-2 text-[26px]">{numberFormatter.format(value)}</p>
    </div>
  );
}
