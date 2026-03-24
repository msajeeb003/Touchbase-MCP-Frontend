import DashboardDonutChart from "@/components/dashboard/DashboardDonutChart";
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
      description="Distribution of your leads across follow-up stages."
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
