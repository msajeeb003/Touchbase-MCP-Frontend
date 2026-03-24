import DashboardStackedBarChart from "@/components/dashboard/DashboardStackedBarChart";
import type { DashboardDeliveryStatsItem } from "@/types/dashboard";

interface DeliveryStatsChartProps {
  data: DashboardDeliveryStatsItem[];
}

export default function DeliveryStatsChart({
  data,
}: DeliveryStatsChartProps) {
  return (
    <DashboardStackedBarChart
      title="Delivery Stats"
      description="Email vs SMS success and failure counts by delivery type."
      emptyMessage="No delivery stats available yet."
      data={data.map((item) => ({
        label: item.type,
        sent: item.sent,
        failed: item.failed,
      }))}
      series={[
        {
          dataKey: "sent",
          label: "Sent",
          color: "#10b981",
          stackId: "delivery",
        },
        {
          dataKey: "failed",
          label: "Failed",
          color: "#f43f5e",
          stackId: "delivery",
        },
      ]}
    />
  );
}
