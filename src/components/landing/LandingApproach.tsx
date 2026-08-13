import configureShot from "@/assets/landingPageImages/dashboard1.png";
import { WaitlistButton } from "@/components/landing/waitlist";
import { LandingShot } from "./LandingShot";
import { cn } from "@/lib/utils";
import {
  band,
  bandDark,
  btn,
  btnPrimary,
  ctaRow,
  eyebrow,
  eyebrowOnDark,
  lede,
  ledeOnDark,
  sec,
  secOnDark,
  wrap,
} from "./landingUi";

const OUTCOMES = [
  "The lead did not attend.",
  "A second call needs to be scheduled.",
  "A PRD or project plan needs review.",
  "A proposal was presented.",
  "The lead needs more time to decide.",
  "A custom next step is required.",
] as const;

export function LandingApproach() {
  return (
    <section className={cn(band, bandDark)}>
      <div className={wrap}>
        <p className={cn(eyebrow, eyebrowOnDark)}>The approach</p>
        <h2 className={cn(sec, secOnDark)}>
          Follow-up automation built around your sales conversations.
        </h2>
        <p className={cn(lede, ledeOnDark)}>
          Follow-Up AI turns each stage of your sales process into a reusable,
          multi-channel sequence. After a call, simply select the outcome.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((text) => (
            <div
              key={text}
              data-reveal
              className="rounded-xl border border-white/10 bg-white/[0.03] px-[18px] py-4 text-[14.5px] leading-[1.45] text-[rgba(236,236,244,0.88)]"
            >
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-landing-indigo-lift">
                Outcome
              </span>
              {text}
            </div>
          ))}
        </div>

        <p className={cn(lede, ledeOnDark, "mt-9")}>
          Follow-Up AI then schedules the appropriate touchpoints across the
          channels you choose. Your team defines the strategy once. The system
          helps execute it consistently for every lead.
        </p>

        <LandingShot
          dark
          wide
          url="followupaitool.com/dashboard"
          src={configureShot}
          alt="How to configure: templates, leads, and generate sequence with AI"
          caption="One place to see it working — leads by stage, sequences by status, and everything that has gone out across each channel."
        />

        <div className={cn(ctaRow, "mt-7")}>
          <WaitlistButton className={cn(btn, btnPrimary)}>
            Apply for Pilot Access
          </WaitlistButton>
        </div>
      </div>
    </section>
  );
}
