import { WaitlistButton } from "@/components/landing/waitlist";
import { cn } from "@/lib/utils";
import {
  bandTight,
  btn,
  btnGhost,
  btnPrimary,
  gridBgStyle,
  wrap,
} from "./landingUi";

export function LandingCta() {
  return (
    <section className={bandTight} style={gridBgStyle}>
      <div data-reveal className={cn(wrap, "text-center")}>
        <h2 className="mx-auto my-0 max-w-[24ch] font-landing-display text-[clamp(28px,3.8vw,46px)] font-extrabold leading-[1.08] tracking-[-0.03em] text-landing-fog">
          Your next client may already be in your spreadsheet.
        </h2>
        <p className="mx-auto mb-0 mt-4 max-w-[52ch] text-[17px] text-landing-fog/60">
          The opportunity has not necessarily disappeared. It may simply be
          waiting for the next follow-up.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <WaitlistButton className={cn(btn, btnPrimary)}>
            Join the Pilot
          </WaitlistButton>
          <a className={cn(btn, btnGhost)} href="#how">
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
