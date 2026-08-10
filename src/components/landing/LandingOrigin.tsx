import { cn } from "@/lib/utils";
import { bandTight, eyebrow, wrap } from "./landingUi";

export function LandingOrigin() {
  return (
    <section className={bandTight} id="origin">
      <div className={cn(wrap, "max-w-[880px]")}>
        <div
          data-reveal
          className="rounded-2xl border border-landing-line bg-white px-6 py-8 shadow-[0_18px_50px_rgba(20,20,36,0.06)] sm:px-9 sm:py-10 md:px-11 md:py-12"
        >
          <p className={eyebrow}>Origin</p>
          <h2 className="m-0 max-w-[18ch] font-landing-display text-[clamp(26px,3.4vw,38px)] font-bold leading-[1.08] tracking-[-0.022em] text-landing-ink">
            Built from a workflow we needed ourselves.
          </h2>
          <div className="mt-[22px] space-y-4 text-[17px] leading-[1.62] text-landing-muted">
            <p className="m-0">
              We originally created Follow-Up AI for our own agency.
            </p>
            <p className="m-0">
              We were managing leads in spreadsheets, holding discovery calls,
              preparing PRDs, presenting proposals, and manually reminding
              prospects to take the next step.
            </p>
            <p className="m-0">
              The problem was not knowing that we needed to follow up. The
              problem was doing it consistently, through the right channel, with
              the right context, for every opportunity.
            </p>
            <p className="m-0 font-medium text-landing-ink">
              Follow-Up AI turns that manual process into a repeatable system.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
