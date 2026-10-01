import { useState, type CSSProperties, type KeyboardEvent } from "react";
import dashboardShot from "@/assets/landingPageImages/dashboard1.png";
import { WaitlistButton } from "@/components/landing/waitlist";
import { cn } from "@/lib/utils";
import { LandingShot } from "./LandingShot";
import { btn, btnGhost, btnPrimary, gridBgStyle, wrap } from "./landingUi";
import { CHANNELS, OUTCOMES, type OutcomeId } from "./outcomeSequences";

const SYSTEM_NOTES = [
  "Pause or resume any time",
  "Review or regenerate any step",
  "Sent vs failed tracked per channel",
] as const;

function RoutingPreview() {
  const [activeId, setActiveId] = useState<OutcomeId>("noshow");

  const selectByIndex = (index: number) => {
    const next = OUTCOMES[(index + OUTCOMES.length) % OUTCOMES.length];
    setActiveId(next.id);
    document.getElementById(`t-${next.id}`)?.focus();
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
    if (!forward && !backward) return;
    event.preventDefault();
    selectByIndex(index + (forward ? 1 : -1));
  };

  return (
    <div
      data-reveal
      className="mx-auto mt-14 max-w-[1040px] rounded-2xl border border-landing-line bg-landing-steel-2 p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] sm:p-7"
      id="picker"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 font-landing-mono text-[10.5px] uppercase tracking-[0.14em] text-landing-fog/45">
          Routing preview · pick an outcome
        </p>
        <span className="flex items-center gap-2 font-landing-mono text-[10.5px] uppercase tracking-[0.12em] text-landing-sky">
          <i className="h-1.5 w-1.5 rounded-full bg-landing-sky shadow-[0_0_8px_#4F9CF9]" />
          automated
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-[minmax(0,1fr)_56px_minmax(0,1.15fr)] sm:gap-0">
        {/* Trigger node */}
        <div className="rounded-xl border border-landing-line bg-landing-steel p-4">
          <p className="m-0 font-landing-mono text-[10.5px] uppercase tracking-[0.14em] text-landing-fog/45">
            Trigger
          </p>
          <p className="m-0 mt-1 text-[15px] font-semibold text-landing-fog">
            Call outcome selected
          </p>
          <div
            className="mt-3 flex flex-col gap-1.5"
            role="tablist"
            aria-label="Call outcome"
            aria-orientation="vertical"
          >
            {OUTCOMES.map((outcome, index) => {
              const selected = activeId === outcome.id;
              return (
                <button
                  key={outcome.id}
                  type="button"
                  role="tab"
                  id={`t-${outcome.id}`}
                  aria-selected={selected}
                  aria-controls={`p-${outcome.id}`}
                  tabIndex={selected ? 0 : -1}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-left font-landing-sans text-[13.5px] font-semibold transition-colors duration-150",
                    selected
                      ? "border-landing-sky bg-landing-sky-soft text-landing-fog"
                      : "border-landing-line bg-transparent text-landing-fog/60 hover:border-landing-fog/40 hover:text-landing-fog",
                  )}
                  onClick={() => setActiveId(outcome.id)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                >
                  {outcome.tabLabel}
                  <span className="font-landing-mono text-[10.5px] font-normal opacity-60">
                    {outcome.steps.length} steps
                  </span>
                </button>
              );
            })}
          </div>
          <p className="m-0 mt-3 font-landing-mono text-[10.5px] leading-[1.6] text-landing-fog/40">
            + Fathom notes attached as context
          </p>
        </div>

        {/* Connector: vertical on mobile, horizontal from sm up */}
        <div className="relative h-8 sm:h-auto" aria-hidden>
          <span className="absolute bottom-0 left-1/2 top-0 w-px bg-landing-fog/15 sm:bottom-auto sm:left-0 sm:right-0 sm:top-1/2 sm:h-px sm:w-auto" />
          <span className="absolute left-1/2 top-0 -ml-[3px] h-1.5 w-1.5 animate-landing-travel-v rounded-full bg-landing-sky shadow-[0_0_10px_#4F9CF9] motion-reduce:animate-none sm:left-0 sm:top-1/2 sm:-mt-[3px] sm:ml-0 sm:animate-landing-travel-h sm:motion-reduce:animate-none" />
        </div>

        {/* Sequence nodes */}
        <div>
          {OUTCOMES.map((outcome) => (
            <div
              key={outcome.id}
              role="tabpanel"
              id={`p-${outcome.id}`}
              aria-labelledby={`t-${outcome.id}`}
              hidden={activeId !== outcome.id}
              className="space-y-2"
            >
              {outcome.steps.map((step) => {
                const channel = CHANNELS[step.channel];
                return (
                  <div
                    key={`${outcome.id}-${step.day}-${step.label}`}
                    className="relative rounded-xl border border-landing-line bg-landing-steel px-4 py-3 before:absolute before:-left-px before:bottom-3 before:top-3 before:w-0.5 before:rounded-sm before:bg-[var(--chan)] before:content-['']"
                    style={{ "--chan": channel.color } as CSSProperties}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="font-landing-mono text-[10.5px] uppercase tracking-[0.1em]"
                        style={{ color: channel.color }}
                      >
                        {channel.label}
                      </span>
                      <span className="font-landing-mono text-[10.5px] text-landing-fog/40">
                        day {step.day}
                      </span>
                    </div>
                    <p className="m-0 mt-1 text-[14px] font-semibold text-landing-fog">
                      {step.label}
                    </p>
                  </div>
                );
              })}
              <p className="m-0 pt-1 font-landing-mono text-[11px] text-landing-fog/45">
                exit: {outcome.exit}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 border-t border-landing-line pt-4 font-landing-mono text-[11.5px] text-landing-fog/50 sm:grid-cols-3">
        {SYSTEM_NOTES.map((note) => (
          <span key={note} className="flex items-center gap-2">
            <i className="h-1 w-1 flex-none rounded-full bg-landing-sky" />
            {note}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden" style={gridBgStyle}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(50%_60%_at_50%_0%,rgba(79,156,249,0.14),transparent_70%)]"
      />
      <div className={cn(wrap, "relative z-[1] pb-16 pt-16 lg:pb-24 lg:pt-24")}>
        <div className="mx-auto max-w-[800px] text-center">
          <p className="m-0 inline-flex items-center gap-2 rounded-md border border-landing-line bg-landing-steel-2 px-3 py-1 font-landing-mono text-[11px] uppercase tracking-[0.14em] text-landing-sky">
            <svg
              viewBox="0 0 20 20"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <circle cx="4" cy="10" r="2" />
              <circle cx="16" cy="5" r="2" />
              <circle cx="16" cy="15" r="2" />
              <path d="M6 10h4l4-5M10 10l4 5" />
            </svg>
            Follow-up automation
          </p>
          <h1 className="m-0 mt-6 font-landing-display text-[clamp(38px,5.6vw,68px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-landing-fog">
            Your follow-up,{" "}
            <span className="text-landing-sky">running as a system.</span>
          </h1>
          <p className="mx-auto mb-0 mt-6 max-w-[62ch] text-[clamp(17px,1.4vw,19px)] text-landing-fog/60">
            Import your leads, connect Fathom, and select what happened on the
            call. Follow-Up AI routes each outcome into the right sequence and
            sends every touchpoint across email, WhatsApp, SMS, and AI voice,
            on schedule.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <WaitlistButton className={cn(btn, btnPrimary)}>
              Join the Pilot
            </WaitlistButton>
            <a className={cn(btn, btnGhost)} href="#how">
              See How It Works
            </a>
          </div>
          <p className="mx-auto mb-0 mt-5 max-w-[60ch] font-landing-mono text-[12px] leading-[1.7] text-landing-fog/40">
            Built for agencies, consultancies, and service businesses that sell
            through discovery calls, demos, and proposals.
          </p>
        </div>

        <RoutingPreview />

        <LandingShot
          wide
          centerCaption
          className="mx-auto mt-6 max-w-[1040px]"
          url="followupaitool.com/dashboard"
          src={dashboardShot}
          alt="Dashboard overview: leads by stage, sequences by status, and messages sent per channel"
          caption="One place to see it working: leads by stage, sequences by status, and everything that has gone out across each channel."
        />
      </div>
    </section>
  );
}
