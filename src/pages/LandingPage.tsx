import { useEffect } from "react";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingGap from "@/components/landing/LandingGap";
import { LandingApproach } from "@/components/landing/LandingApproach";
import { LandingChannels } from "@/components/landing/LandingChannels";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingOrigin } from "@/components/landing/LandingOrigin";
import { LandingPilot } from "@/components/landing/LandingPilot";
import { LandingPositioning } from "@/components/landing/LandingPositioning";
import { LandingScenarios } from "@/components/landing/LandingScenarios";
import { LandingWatchItWork } from "@/components/landing/LandingWatchItWork";
import LandingFooter from "@/components/landing/LandingFooter";
import {
  WaitlistModal,
  WaitlistProvider,
} from "@/components/landing/waitlist";
import { useLandingReveal } from "@/components/landing/useLandingReveal";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";

function useLandingFonts() {
  useEffect(() => {
    const preconnectGoogle = document.createElement("link");
    preconnectGoogle.rel = "preconnect";
    preconnectGoogle.href = "https://fonts.googleapis.com";

    const preconnectGstatic = document.createElement("link");
    preconnectGstatic.rel = "preconnect";
    preconnectGstatic.href = "https://fonts.gstatic.com";
    preconnectGstatic.crossOrigin = "anonymous";

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = FONT_HREF;

    document.head.append(preconnectGoogle, preconnectGstatic, stylesheet);

    const previousTitle = document.title;
    document.title =
      "Follow-Up AI — turn every sales call into a consistent follow-up sequence";

    let description = document.querySelector('meta[name="description"]');
    const createdDescription = !description;
    if (!description) {
      description = document.createElement("meta");
      description.setAttribute("name", "description");
      document.head.appendChild(description);
    }
    const previousDescription = description.getAttribute("content");
    description.setAttribute(
      "content",
      "Import your leads, connect Fathom, select what happened on the call, and launch coordinated outreach across email, WhatsApp, SMS, and AI voice.",
    );

    return () => {
      preconnectGoogle.remove();
      preconnectGstatic.remove();
      stylesheet.remove();
      document.title = previousTitle;
      if (createdDescription) {
        description?.remove();
      } else if (previousDescription != null) {
        description?.setAttribute("content", previousDescription);
      }
    };
  }, []);
}

export default function LandingPage() {
  useLandingFonts();
  useLandingReveal();

  return (
    <WaitlistProvider>
      <div
        className="landing-page min-h-screen bg-landing-paper font-landing-sans text-[17px] leading-[1.62] text-landing-body antialiased [&_img]:block [&_img]:max-w-full [&_svg]:block [&_svg]:max-w-full"
        id="top"
      >
        <LandingNav />
        <main>
          <LandingHero />
          <LandingGap />
          <LandingApproach />
          <LandingWatchItWork />
          <LandingHowItWorks />
          <LandingChannels />
          <LandingScenarios />
          <LandingPositioning />
          <LandingOrigin />
          <LandingPilot />
          <LandingFaq />
          <LandingCta />
        </main>
        <LandingFooter />
        <WaitlistModal />
      </div>
    </WaitlistProvider>
  );
}
