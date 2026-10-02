import HowItWorksSection from "@/components/landing/HowItWorksSection";
import { useSteelTheme } from "@/components/dashboard/dashboardTheme";

export default function HowToConfigurePage() {
  useSteelTheme();

  return (
    <div className="rounded-2xl border border-landing-line bg-white/[0.02] p-6 font-landing-sans text-landing-fog/80 md:p-10">
      <HowItWorksSection id="how-to-configure" showSetupAndTracking linksEnabled />
    </div>
  );
}
