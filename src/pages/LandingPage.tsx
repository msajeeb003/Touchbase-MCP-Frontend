import { useEffect } from "react";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingGap from "@/components/landing/LandingGap";
import { LandingApproach } from "@/components/landing/LandingApproach";
import { LandingChannels } from "@/components/landing/LandingChannels";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
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
import { LANDING_FONT_HREF } from "@/components/landing/landingFonts";

const FONT_HREF = LANDING_FONT_HREF;

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
      "Touchbase AI — your follow-up, running as a system";

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
        className="landing-page min-h-screen bg-landing-steel font-landing-sans text-[17px] leading-[1.6] text-landing-fog/80 antialiased [&_img]:block [&_img]:max-w-full [&_svg]:block [&_svg]:max-w-full"
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
