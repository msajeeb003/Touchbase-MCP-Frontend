import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  band,
  bandDark,
  btn,
  btnGhost,
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
    <section className={cn(band, bandDark)} id="pilot">
      <div className={wrap}>
        <p className={cn(eyebrow, eyebrowOnDark)}>Pilot programme</p>
        <h2 className={cn(sec, secOnDark)}>Join the Follow-Up AI Pilot.</h2>
        <p className={cn(lede, ledeOnDark)}>
          We are inviting a limited number of agencies and service businesses to
          test Follow-Up AI using their real sales workflows. During the pilot,
          we will help you:
        </p>

        <ul className="mt-9 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {PILOT_ITEMS.map((item) => (
            <li
              key={item}
              data-reveal
              className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 text-[14.5px] leading-[1.5] text-white/[0.78]"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-landing-indigo-lift" />
              {item}
            </li>
          ))}
        </ul>

        <div className={ctaRow}>
          <Link className={cn(btn, btnPrimary)} to="/auth/signup">
            Apply to Join the Pilot
          </Link>
          <Link className={cn(btn, btnGhost)} to="/auth/signin">
            Login
          </Link>
        </div>

        <p className="mt-4 max-w-[46ch] pt-[18px] font-landing-mono text-xs leading-[1.75] text-white/[0.42]">
          No complicated migration. Start with the leads and sales process you
          already have.
        </p>
      </div>
    </section>
  );
}
