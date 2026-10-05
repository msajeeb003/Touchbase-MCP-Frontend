import { Label, Pie, PieChart } from "recharts";
import type { LucideIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CATEGORY_PALETTE,
  dashCard,
  dashCardDesc,
  dashCardIcon,
  dashCardTitle,
  dashEmpty,
} from "@/components/dashboard/dashboardTheme";

export interface DashboardDonutChartItem {
  label: string;
  count: number;
}

interface DashboardDonutChartProps {
  title: string;
  titleIcon?: LucideIcon;
  description: string;
  emptyMessage: string;
  centerLabel: string;
  valueLabel: string;
  data: DashboardDonutChartItem[];
}

/** Slice colour by position, cycling through the shared palette. */
const getChartColor = (index: number) =>
  CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];

/** Matches the card surface, so slices read as separated rather than outlined. */
const SLICE_GAP_COLOR = "rgb(var(--landing-steel-2))";

export default function DashboardDonutChart({
  title,
  titleIcon: TitleIcon,
  description,
  emptyMessage,
  centerLabel,
  valueLabel,
  data,
}: DashboardDonutChartProps) {
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.map((item, index) => ({
    ...item,
    fill: getChartColor(index),
    percent: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
  }));

  if (chartData.length === 0) {
    return (
      <Card className={dashCard}>
        <CardHeader className="pb-2">
          <CardTitle className={dashCardTitle}>
            {TitleIcon ? <TitleIcon className={dashCardIcon} /> : null}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={dashEmpty}>{emptyMessage}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={dashCard}>
      <CardHeader className="pb-2">
        <CardTitle className={dashCardTitle}>
          {TitleIcon ? <TitleIcon className={dashCardIcon} /> : null}
          {title}
        </CardTitle>
        <p className={dashCardDesc}>{description}</p>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-landing-line bg-landing-steel p-3 sm:p-4">
          <ChartContainer
            config={{ count: { label: valueLabel } }}
            className="mx-auto aspect-square h-[240px] w-full max-w-[240px] sm:h-[280px] sm:max-w-[280px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, _name, item) => {
                      const payload = item.payload as DashboardDonutChartItem & {
                        fill: string;
                        percent: number;
                      };

                      return (
                        <div className="grid min-w-[11rem] gap-1">
                          <span className="font-medium text-landing-fog">{payload.label}</span>
                          <div className="flex items-center justify-between gap-4 text-landing-fog/60">
                            <span>{valueLabel}</span>
                            <span className="font-medium text-landing-fog">{value}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-landing-fog/60">
                            <span>Percent</span>
                            <span className="font-medium text-landing-fog">{payload.percent}%</span>
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                innerRadius={62}
                outerRadius={96}
                paddingAngle={3}
                stroke={SLICE_GAP_COLOR}
                strokeWidth={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                      return null;
                    }

                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy - 6}
                          className="fill-landing-fog font-landing-display text-2xl font-bold"
                        >
                          {totalCount}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy + 18}
                          className="fill-landing-fog/55 text-xs"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-5 gap-y-2 p-0">
          {chartData.map((item) => (
            <li
              key={`${item.label}-${item.count}`}
              className="inline-flex items-center gap-2 text-sm text-landing-fog/70"
            >
              <span className="h-2.5 w-2.5 flex-none rounded-sm" style={{ backgroundColor: item.fill }} />
              <span>{item.label}</span>
              <span className="font-landing-mono text-[12px] tabular-nums text-landing-fog/45">
                {item.count} · {item.percent}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
