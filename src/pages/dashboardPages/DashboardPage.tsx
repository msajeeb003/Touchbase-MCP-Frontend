import { AlertTriangle, Loader2 } from "lucide-react";
import DeliveryStatsChart from "@/components/dashboard/DeliveryStatsChart";
import LeadsByStageDonutChart from "@/components/dashboard/LeadsByStageDonutChart";
import DashboardSummarySection from "@/components/dashboard/DashboardSummarySection";
import SequencesByStatusDonutChart from "@/components/dashboard/SequencesByStatusDonutChart";
import SentTrendLineChart from "@/components/dashboard/SentTrendLineChart";
import UpcomingStepsSection from "@/components/dashboard/UpcomingStepsSection";
import HarnessDashboardStrip from "@/components/harness/HarnessDashboardStrip";
import NewInstructionDialog from "@/components/harness/NewInstructionDialog";
import { SafetyBanner } from "@/components/harness/ui";
import { useGetDashboardQuery } from "@/store/features/dashboard/dashboardApi";

const today = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" });

/**
 * Dashboard overview. The page sits on the layout's canvas; every block is a
 * design-system glass card (see DESIGN-SYSTEM.md).
 */
export default function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboardQuery();
  const dashboardData = data?.data;
  const summary = dashboardData?.summary;

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 font-landing-sans">
      <header className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="tb-title">Dashboard</h1>
          <p className="tb-meta mt-1">{today.format(new Date())}</p>
        </div>
        <SafetyBanner />
        <NewInstructionDialog />
      </header>

      {isLoading ? (
        <div className="tb-card flex items-center gap-2 p-6 text-sm text-tb-ink-3">
          <Loader2 className="h-4 w-4 animate-spin text-tb-accent" />
          Loading…
        </div>
      ) : isError || !summary || !dashboardData ? (
        <div className="tb-card flex items-center gap-3 p-6">
          <AlertTriangle className="h-5 w-5 shrink-0 text-landing-voice" />
          <div>
            <p className="tb-h3">The dashboard could not load.</p>
            <p className="tb-meta mt-0.5">Try again in a moment.</p>
          </div>
        </div>
      ) : (
        <>
          <HarnessDashboardStrip />
          <DashboardSummarySection summary={summary} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <LeadsByStageDonutChart data={dashboardData.leadsByStage} />
            <SequencesByStatusDonutChart data={dashboardData.sequencesByStatus} />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <SentTrendLineChart data={dashboardData.sentTrend} />
            <DeliveryStatsChart data={dashboardData.deliveryStats} />
          </div>
          <UpcomingStepsSection data={dashboardData.upcomingSteps} />
        </>
      )}
    </div>
  );
}
