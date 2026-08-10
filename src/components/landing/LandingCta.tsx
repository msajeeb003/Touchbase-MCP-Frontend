import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  bandTight,
  btn,
  btnGhost,
  btnPrimary,
  ctaRow,
  wrap,
} from "./landingUi";

export function LandingCta() {
  return (
    <section className={bandTight}>
      <div className={wrap}>
        <div
          data-reveal
          className="overflow-hidden rounded-2xl bg-landing-ink px-6 py-10 text-center sm:px-10 sm:py-12 md:px-14 md:py-14"
        >
          <div className="mx-auto max-w-[40ch]">
            <h2 className="m-0 font-landing-display text-[clamp(26px,3.6vw,40px)] font-bold leading-[1.08] tracking-[-0.022em] text-white">
              Your next client may already be in your spreadsheet.
            </h2>
            <p className="mt-4 text-[clamp(16px,1.4vw,18px)] leading-[1.6] text-white/[0.66]">
              The opportunity has not necessarily disappeared. It may simply be
              waiting for the next follow-up.
            </p>
            <div className={cn(ctaRow, "mt-7 justify-center")}>
              <Link className={cn(btn, btnPrimary)} to="/auth/signup">
                Join the Pilot
              </Link>
              <Link className={cn(btn, btnGhost)} to="/auth/signin">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
