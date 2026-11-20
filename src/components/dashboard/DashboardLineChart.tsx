import { dashCard, dashCardIcon, dashCardTitle, dashEmpty } from "@/components/dashboard/dashboardTheme";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DashboardLineChartSeries {
  dataKey: string;
  label: string;
  color: string;
}

export interface DashboardLineChartDataPoint {
  label: string;
  [key: string]: string | number;
}

interface DashboardLineChartProps {
  title: string;
  titleIcon?: LucideIcon;
  /** Optional; not shown (the title is enough). */
  description?: string;
  emptyMessage: string;
  data: DashboardLineChartDataPoint[];
  series: DashboardLineChartSeries[];
  xAxisTickFormatter?: (value: string) => string;
  tooltipLabelFormatter?: (value: string) => string;
}

export default function DashboardLineChart({
  title,
  titleIcon: TitleIcon,
  emptyMessage,
  data,
  series,
  xAxisTickFormatter,
  tooltipLabelFormatter,
}: DashboardLineChartProps) {
  if (data.length === 0 || series.length === 0) {
    return (
      <Card className={dashCard}>
        <CardHeader className="pb-2">
          <CardTitle className={dashCardTitle}>
            {TitleIcon ? <TitleIcon className={dashCardIcon} /> : null}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={dashEmpty}>
            {emptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = series.reduce<ChartConfig>((acc, item) => {
    acc[item.dataKey] = {
      label: item.label,
      color: item.color,
    };

    return acc;
  }, {});

  return (
    <Card className={dashCard}>
      <CardHeader className="pb-2">
        <CardTitle className={dashCardTitle}>
          {TitleIcon ? <TitleIcon className={dashCardIcon} /> : null}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <ChartContainer config={config} className="h-[280px] w-full">
          <LineChart
            data={data}
            margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tickMargin={10}
              tickFormatter={(value) =>
                xAxisTickFormatter ? xAxisTickFormatter(String(value)) : String(value)
              }
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    tooltipLabelFormatter ? tooltipLabelFormatter(String(value)) : String(value)
                  }
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {series.map((item) => (
              <Line
                key={item.dataKey}
                type="monotone"
                dataKey={item.dataKey}
                stroke={`var(--color-${item.dataKey})`}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
