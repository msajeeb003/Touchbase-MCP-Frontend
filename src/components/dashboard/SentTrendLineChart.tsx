import { format, parseISO } from "date-fns";
import { Activity } from "lucide-react";
import DashboardLineChart from "@/components/dashboard/DashboardLineChart";
import type { DashboardSentTrendItem } from "@/types/dashboard";
import { CHANNEL_COLORS } from "@/components/dashboard/dashboardTheme";

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
      titleIcon={Activity}
      description="Email, SMS, WhatsApp, and AI call volume over time."
      emptyMessage="No sent trend data available yet."
      data={data.map((item) => ({
        label: item.date,
        emails: item.emails,
        sms: item.sms,
        whatsapp: item.whatsapp,
        calls: item.calls,
      }))}
      series={[
        {
          dataKey: "emails",
          label: "Emails",
          color: CHANNEL_COLORS.email,
        },
        {
          dataKey: "sms",
          label: "SMS",
          color: CHANNEL_COLORS.sms,
        },
        {
          dataKey: "whatsapp",
          label: "WhatsApp",
          color: CHANNEL_COLORS.whatsapp,
        },
        {
          dataKey: "calls",
          label: "Calls",
          color: CHANNEL_COLORS.call,
        },
      ]}
      xAxisTickFormatter={formatDateLabel}
      tooltipLabelFormatter={formatDateLabel}
    />
  );
}
