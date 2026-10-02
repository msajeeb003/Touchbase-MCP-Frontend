import { format, parseISO } from "date-fns";
import { Activity } from "lucide-react";
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
          color: "#7FB4FF",
        },
        {
          dataKey: "sms",
          label: "SMS",
          color: "#F2C86A",
        },
        {
          dataKey: "whatsapp",
          label: "WhatsApp",
          color: "#5EDBA6",
        },
        {
          dataKey: "calls",
          label: "Calls",
          color: "#FF9A7A",
        },
      ]}
      xAxisTickFormatter={formatDateLabel}
      tooltipLabelFormatter={formatDateLabel}
    />
  );
}
