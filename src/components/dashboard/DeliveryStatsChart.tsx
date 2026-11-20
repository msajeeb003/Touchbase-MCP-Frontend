import DashboardStackedBarChart from "@/components/dashboard/DashboardStackedBarChart";
import { STEP_TYPE, type StepType } from "@/constants/stepType";
import { BarChart3 } from "lucide-react";
import type { DashboardDeliveryStatsItem } from "@/types/dashboard";
import { ACCENT_COLOR, CHANNEL_COLORS } from "@/components/dashboard/dashboardTheme";

const CHANNEL_LABEL: Record<StepType, string> = {
  [STEP_TYPE.EMAIL]: "Email",
  [STEP_TYPE.SMS]: "SMS",
  [STEP_TYPE.WHATSAPP]: "WhatsApp",
  [STEP_TYPE.CALL]: "Calls",
};

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
      emptyMessage="No delivery stats available yet."
      data={data.map((item) => ({
        label: CHANNEL_LABEL[item.type],
        sent: item.sent,
        failed: item.failed,
      }))}
      series={[
        {
          dataKey: "sent",
          label: "Sent",
          color: ACCENT_COLOR,
          stackId: "delivery",
        },
        {
          dataKey: "failed",
          label: "Failed",
          color: CHANNEL_COLORS.call,
          stackId: "delivery",
        },
      ]}
    />
  );
}
