import type { ReactNode } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import DeliveryStatsChart from "@/components/dashboard/DeliveryStatsChart";
import LeadsByStageDonutChart from "@/components/dashboard/LeadsByStageDonutChart";
import DashboardSummarySection from "@/components/dashboard/DashboardSummarySection";
import SequencesByStatusDonutChart from "@/components/dashboard/SequencesByStatusDonutChart";
import SentTrendLineChart from "@/components/dashboard/SentTrendLineChart";
import UpcomingStepsSection from "@/components/dashboard/UpcomingStepsSection";
import HarnessDashboardStrip from "@/components/harness/HarnessDashboardStrip";
import { lightSurfaceVars, steelSurfaceVars } from "@/components/dashboard/dashboardTheme";
import { useAppTheme, type AppTheme } from "@/lib/appTheme";
import { useGetDashboardQuery } from "@/store/features/dashboard/dashboardApi";

/**
 * Steel surface for this page, dark or light. The negative margins cancel the
 * layout's <main> padding so the surface fills the content area edge to edge,
 * and the scoped CSS variables re-theme the shadcn primitives rendered inside it.
 */
function DashboardSurface({ theme, children }: { theme: AppTheme; children: ReactNode }) {
  return (
    <div
      className="-m-4 min-h-[calc(100svh-3.5rem)] bg-landing-steel p-4 font-landing-sans text-landing-fog/80 md:-m-6 md:p-6"
      style={theme === "light" ? lightSurfaceVars : steelSurfaceVars}
    >
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const theme = useAppTheme();
  const { data, isLoading, isError } = useGetDashboardQuery();
  const dashboardData = data?.data;
  const summary = dashboardData?.summary;

  if (isLoading) {
    return (
      <DashboardSurface theme={theme}>
        <div className="rounded-xl border border-dashed border-landing-line bg-landing-steel-2 p-8 text-sm text-landing-fog/60">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-landing-sky" />
            <span>Loading dashboard summary...</span>
          </div>
        </div>
      </DashboardSurface>
    );
  }

  if (isError || !summary) {
    return (
      <DashboardSurface theme={theme}>
        <div className="rounded-xl border border-dashed border-landing-voice/40 bg-landing-voice/10 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-landing-voice/15">
            <TrendingUp className="h-5 w-5 text-landing-voice" />
          </div>
          <h3 className="font-landing-display text-2xl font-bold text-landing-fog">
            Failed to load dashboard.
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-landing-fog/60">
            We could not fetch your dashboard summary right now. Please try again in a moment.
          </p>
        </div>
      </DashboardSurface>
    );
  }

  return (
    <DashboardSurface theme={theme}>
      <div className="space-y-6">
        <div>
          <p className="font-landing-mono text-[11px] uppercase tracking-[0.18em] text-landing-sky">
            Overview
          </p>
          <h2 className="mt-2 font-landing-display text-[clamp(26px,3vw,34px)] font-bold leading-tight tracking-[-0.02em] text-landing-fog">
            Dashboard Overview
          </h2>
          <p className="mt-1 text-sm text-landing-fog/55">
            A quick snapshot of leads, email/SMS/WhatsApp/call activity, sequences, and transcripts.
          </p>
        </div>

        <HarnessDashboardStrip />
        <DashboardSummarySection summary={summary} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LeadsByStageDonutChart data={dashboardData.leadsByStage} />
          <SequencesByStatusDonutChart data={dashboardData.sequencesByStatus} />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <SentTrendLineChart data={dashboardData.sentTrend} />
          <DeliveryStatsChart data={dashboardData.deliveryStats} />
        </div>
        <UpcomingStepsSection data={dashboardData.upcomingSteps} />
      </div>
    </DashboardSurface>
  );
}
