import { WaitlistButton } from "@/components/landing/waitlist";
import { cn } from "@/lib/utils";
import {
  band,
  btn,
  btnGhost,
  btnPrimary,
  ctaRow,
  eyebrow,
  lede,
  sec,
  wrap,
} from "./landingUi";

const PILOT_ITEMS = [
  "Import your existing lead list",
  "Connect your Fathom account",
  "Map your most common post-call scenarios",
  "Create your initial follow-up sequences",
  "Configure email, WhatsApp, SMS, and AI voice touchpoints",
  "Test the system with real opportunities",
  "Share feedback that helps shape the product",
] as const;

export function LandingPilot() {
  return (
    <section className={band} id="pilot">
      <div className={wrap}>
        <div className="max-w-[720px]">
          <p className={eyebrow}>Pilot programme</p>
          <h2 className={sec}>Join the Touchbase AI Pilot.</h2>
          <p className={lede}>
            We are inviting a limited number of agencies and service businesses
            to test Touchbase AI using their real sales workflows. During the
            pilot, we will help you:
          </p>
        </div>

        <ol className="m-0 mt-10 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {PILOT_ITEMS.map((item, index) => (
            <li
              key={item}
              data-reveal
              className="rounded-xl border border-landing-line bg-landing-steel-2 px-4 py-4 text-[14.5px] leading-[1.5] text-landing-fog/85"
            >
              <span className="mb-2 block font-landing-mono text-[11px] text-landing-sky">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item}
            </li>
          ))}
          <li
            data-reveal
            className="flex items-center rounded-xl border border-dashed border-landing-line px-4 py-4 font-landing-mono text-[12px] leading-[1.6] text-landing-fog/45"
          >
            No complicated migration. Start with the leads and sales process you
            already have.
          </li>
        </ol>

        <div className={cn(ctaRow, "mt-9")}>
          <WaitlistButton className={cn(btn, btnPrimary)}>
            Apply to Join the Pilot
          </WaitlistButton>
          <a className={cn(btn, btnGhost)} href="#faq">
            Read the FAQ
          </a>
        </div>
      </div>
    </section>
  );
}
