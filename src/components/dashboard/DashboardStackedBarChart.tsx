import { dashCard, dashCardIcon, dashCardTitle, dashEmpty } from "@/components/dashboard/dashboardTheme";
import {
  Bar,
  BarChart,
  CartesianGrid,
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

export interface DashboardStackedBarSeries {
  dataKey: string;
  label: string;
  color: string;
  stackId?: string;
}

export interface DashboardStackedBarDataPoint {
  label: string;
  [key: string]: string | number;
}

interface DashboardStackedBarChartProps {
  title: string;
  titleIcon?: LucideIcon;
  emptyMessage: string;
  data: DashboardStackedBarDataPoint[];
  series: DashboardStackedBarSeries[];
}

export default function DashboardStackedBarChart({
  title,
  titleIcon: TitleIcon,
  emptyMessage,
  data,
  series,
}: DashboardStackedBarChartProps) {
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
          <BarChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {series.map((item) => (
              <Bar
                key={item.dataKey}
                dataKey={item.dataKey}
                stackId={item.stackId}
                fill={`var(--color-${item.dataKey})`}
                radius={[6, 6, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
