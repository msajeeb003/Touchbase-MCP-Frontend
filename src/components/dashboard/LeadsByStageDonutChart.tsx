import DashboardDonutChart from "@/components/dashboard/DashboardDonutChart";
import { Users2 } from "lucide-react";
import type { DashboardLeadsByStageItem } from "@/types/dashboard";

interface LeadsByStageDonutChartProps {
  data: DashboardLeadsByStageItem[];
}

export default function LeadsByStageDonutChart({
  data,
}: LeadsByStageDonutChartProps) {
  return (
    <DashboardDonutChart
      title="Leads by Stage"
      titleIcon={Users2}
      emptyMessage="No stage data available yet."
      centerLabel="Total Leads"
      valueLabel="Leads"
      data={data.map((item) => ({
        label: item.stage,
        count: item.count,
      }))}
    />
  );
}
