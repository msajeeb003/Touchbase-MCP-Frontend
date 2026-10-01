import { eyebrow } from "./landingUi";

/** Origin story card. Rendered inside the positioning section's right column. */
export function LandingOrigin() {
  return (
    <div
      data-reveal
      className="rounded-2xl border border-landing-line bg-landing-steel p-7 sm:p-9"
      id="origin"
    >
      <p className={eyebrow}>Origin</p>
      <h2 className="m-0 mt-3 max-w-[18ch] font-landing-display text-[clamp(24px,2.8vw,32px)] font-bold leading-[1.1] tracking-[-0.03em] text-landing-fog">
        Built from a workflow we needed ourselves.
      </h2>
      <div className="mt-5 space-y-3.5 text-[16px] text-landing-fog/60">
        <p className="m-0">
          We originally created Touchbase AI for our own agency.
        </p>
        <p className="m-0">
          We were managing leads in spreadsheets, holding discovery calls,
          preparing PRDs, presenting proposals, and manually reminding prospects
          to take the next step.
        </p>
        <p className="m-0">
          The problem was not knowing that we needed to follow up. The problem
          was doing it consistently, through the right channel, with the right
          context, for every opportunity.
        </p>
        <p className="m-0 font-semibold text-landing-fog">
          Touchbase AI turns that manual process into a repeatable system.
        </p>
      </div>
    </div>
  );
}
