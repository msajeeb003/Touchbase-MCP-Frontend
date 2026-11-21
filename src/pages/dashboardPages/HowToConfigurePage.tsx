import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ClaudeMcpGuide, { ClaudeMcpBanner } from "@/components/harness/ClaudeMcpGuide";

export default function HowToConfigurePage() {

  return (
    <div className="space-y-6">
      <ClaudeMcpBanner />
      <div className="rounded-2xl border border-landing-line bg-landing-fog/[0.02] p-6 font-landing-sans text-landing-fog/80 md:p-10">
        <HowItWorksSection id="how-to-configure" showSetupAndTracking linksEnabled showMcp />
      </div>
      <div className="font-landing-sans">
        <ClaudeMcpGuide />
      </div>
    </div>
  );
}
