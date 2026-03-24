import { format, parseISO } from "date-fns";
import DashboardLineChart from "@/components/dashboard/DashboardLineChart";
import type { DashboardSentTrendItem } from "@/types/dashboard";

interface SentTrendLineChartProps {
  data: DashboardSentTrendItem[];
}

const formatDateLabel = (value: string) => {
  try {
    return format(parseISO(value), "MMM d");
  } catch {
    return value;
  }
};

export default function SentTrendLineChart({ data }: SentTrendLineChartProps) {
  return (
    <DashboardLineChart
      title="Sent Trend"
      description="Email and SMS sending activity over time."
      emptyMessage="No sent trend data available yet."
      data={data.map((item) => ({
        label: item.date,
        emails: item.emails,
        sms: item.sms,
      }))}
      series={[
        {
          dataKey: "emails",
          label: "Emails",
          color: "#4f46e5",
        },
        {
          dataKey: "sms",
          label: "SMS",
          color: "#f59e0b",
        },
      ]}
      xAxisTickFormatter={formatDateLabel}
      tooltipLabelFormatter={formatDateLabel}
    />
  );
}
