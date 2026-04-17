import DashboardStackedBarChart from "@/components/dashboard/DashboardStackedBarChart";
import { BarChart3 } from "lucide-react";
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
      titleIcon={BarChart3}
      description="Email, SMS, and WhatsApp success/failure counts by delivery type."
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
