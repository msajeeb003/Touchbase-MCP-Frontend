import { useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  btn,
  btnGhost,
  btnPrimary,
  ctaRow,
  eyebrow,
  eyebrowOnDark,
  wrap,
} from "./landingUi";

type OutcomeId = "noshow" | "second" | "proposal";

type OutcomeStep = {
  channel: string;
  label: string;
  when: string;
  color: string;
};

type OutcomePanel = {
  id: OutcomeId;
  tabLabel: string;
  caption: string;
  steps: OutcomeStep[];
};

const OUTCOMES: OutcomePanel[] = [
  {
    id: "noshow",
    tabLabel: "No-show",
    caption:
      "Checks whether they are still interested, and gives them a clear way to reschedule.",
    steps: [
      { channel: "Email", label: "Sorry we missed you", when: "shortly after", color: "#7C6FFF" },
      { channel: "WhatsApp", label: "Reminder", when: "next day", color: "#17A673" },
      { channel: "SMS", label: "Rescheduling link", when: "+2 days", color: "#F0A93B" },
      { channel: "Email", label: "Final check-in", when: "+5 days", color: "#7C6FFF" },
    ],
  },
  {
    id: "second",
    tabLabel: "Second meeting",
    caption:
      "Runs until the lead schedules the next conversation to review the PRD, plan, or proposed solution.",
    steps: [
      { channel: "Email", label: "Next step, summarised", when: "same day", color: "#7C6FFF" },
      { channel: "WhatsApp", label: "Reminder", when: "+2 days", color: "#17A673" },
      { channel: "SMS", label: "Short follow-up", when: "+4 days", color: "#F0A93B" },
      { channel: "AI voice", label: "Call if still no response", when: "+6 days", color: "#F2603C" },
    ],
  },
  {
    id: "proposal",
    tabLabel: "Proposal sent",
    caption:
      "Stays present after the proposal without relying on someone remembering every follow-up.",
    steps: [
      { channel: "Email", label: "Proposal follow-up", when: "+2 days", color: "#7C6FFF" },
      { channel: "WhatsApp", label: "Short check-in", when: "+4 days", color: "#17A673" },
      { channel: "SMS", label: "Reminder", when: "+6 days", color: "#F0A93B" },
      { channel: "AI voice", label: "Request an update", when: "+8 days", color: "#F2603C" },
      { channel: "Email", label: "Decision and next step", when: "+11 days", color: "#7C6FFF" },
    ],
  },
];

function OutcomePicker() {
  const [activeId, setActiveId] = useState<OutcomeId>("noshow");

  const selectByIndex = (index: number) => {
    const next = OUTCOMES[(index + OUTCOMES.length) % OUTCOMES.length];
    setActiveId(next.id);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    selectByIndex(index + delta);
  };

  return (
    <div
      data-reveal
      className="overflow-hidden rounded-2xl border border-landing-line-dark bg-gradient-to-[170deg] from-landing-ink-2 to-[#121634]"
      style={{ background: "linear-gradient(170deg, #171b42, #121634)" }}
      id="picker"
    >
      <div className="border-b border-landing-line-dark px-5 pb-4 pt-5">
        <p className="mb-[13px] font-landing-mono text-[10.5px] uppercase tracking-[0.16em] text-white/[0.42]">
          Select the call outcome
        </p>
        <div className="flex flex-wrap gap-[7px]" role="tablist" aria-label="Call outcome">
          {OUTCOMES.map((outcome, index) => {
            const selected = activeId === outcome.id;
            return (
              <button
                key={outcome.id}
                type="button"
                className={cn(
                  "cursor-pointer rounded-lg border px-[13px] py-2 font-landing-sans text-[13.5px] font-medium transition-all duration-[180ms]",
                  selected
                    ? "border-landing-indigo bg-landing-indigo text-white"
                    : "border-landing-line-dark bg-transparent text-white/[0.62] hover:border-white/[0.32] hover:text-white",
                )}
                role="tab"
                id={`t-${outcome.id}`}
                aria-selected={selected}
                aria-controls={`p-${outcome.id}`}
                onClick={() => setActiveId(outcome.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
              >
                {outcome.tabLabel}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-5 pt-[18px]">
        {OUTCOMES.map((outcome) => {
          const isActive = activeId === outcome.id;
          return (
            <div
              key={outcome.id}
              role="tabpanel"
              id={`p-${outcome.id}`}
              aria-labelledby={`t-${outcome.id}`}
              hidden={!isActive}
            >
              <p className="mb-4 text-sm leading-[1.55] text-white/[0.56]">
                {outcome.caption}
              </p>
              <ul className="relative m-0 list-none p-0 before:absolute before:bottom-[18px] before:left-[7px] before:top-[18px] before:w-[1.5px] before:bg-landing-line-dark before:content-['']">
                {outcome.steps.map((step) => (
                  <li
                    key={`${outcome.id}-${step.channel}-${step.label}`}
                    className="relative py-2 pl-[30px]"
                    style={{ "--chan": step.color } as CSSProperties}
                  >
                    <span
                      className="absolute left-0 top-[15px] grid h-[15px] w-[15px] place-items-center rounded-full border-[1.5px] border-[color:var(--chan,#7c6fff)] bg-landing-ink-2 after:h-[5px] after:w-[5px] after:rounded-full after:bg-[var(--chan,#7c6fff)] after:content-['']"
                    />
                    <div className="flex flex-wrap items-center gap-[9px]">
                      <span
                        className="flex-none rounded-[5px] border px-[7px] py-[3px] font-landing-mono text-[10px] uppercase tracking-[0.1em]"
                        style={{
                          color: step.color,
                          borderColor: `color-mix(in srgb, ${step.color} 38%, transparent)`,
                        }}
                      >
                        {step.channel}
                      </span>
                      <span className="text-[14.5px] font-medium tracking-[-0.01em] text-white/[0.9]">
                        {step.label}
                      </span>
                      <span className="ml-auto flex-none font-landing-mono text-[11px] text-white/[0.4]">
                        {step.when}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        <p className="mt-[18px] border-t border-landing-line-dark pt-4 font-landing-mono text-[11px] leading-[1.7] text-white/[0.36]">
          You define the strategy once. The system executes it consistently for every lead.
        </p>
      </div>
    </div>
  );
}

export default function LandingHero() {
  return (
    <section
      className="relative overflow-hidden bg-landing-ink pt-[clamp(56px,7vw,92px)] pb-[clamp(70px,9vw,116px)] text-white/[0.72]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10%] bottom-[-60%] left-[28%] h-[70%] bg-[radial-gradient(ellipse_at_center,rgba(91,77,245,0.3),transparent_68%)]"
      />
      <div
        className={cn(
          wrap,
          "relative z-[1] grid grid-cols-1 items-start gap-[clamp(40px,5vw,68px)] min-[921px]:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)]",
        )}
      >
        <div className="flex flex-col gap-5 min-[921px]:gap-6">
          <p className={cn(eyebrow, eyebrowOnDark, "mb-0")}>Post-call follow-up</p>
          <h1 className="m-0 max-w-[22ch] font-landing-display text-[clamp(36px,5.6vw,62px)] font-bold leading-[1.06] tracking-[-0.022em] text-white min-[921px]:max-w-[17ch]">
            Turn every sales call into a{" "}
            <em className="not-italic text-landing-indigo-lift">
              consistent follow-up sequence.
            </em>
          </h1>
          <div className="flex max-w-[50ch] flex-col gap-3.5 text-[clamp(17px,1.55vw,19.5px)] text-white/[0.66]">
            <p className="m-0">
              Import your leads, connect Fathom, select what happened on the call, and launch
              coordinated outreach across email, WhatsApp, SMS, and AI voice.
            </p>
            <p className="m-0">
              Stay in front of every opportunity — without manually chasing every lead.
            </p>
          </div>
          <div className={cn(ctaRow, "mt-0")}>
            <Link className={cn(btn, btnPrimary)} to="/auth/signup">
              Join the Pilot
            </Link>
            <a className={cn(btn, btnGhost)} href="#how">
              See How It Works
            </a>
          </div>
          <p className="m-0 max-w-[46ch] border-t border-landing-line-dark pt-5 font-landing-mono text-xs leading-[1.75] text-white/[0.42]">
            Built for agencies, consultancies, and service businesses that sell through
            discovery calls, demos, and proposals.
          </p>
        </div>

        <OutcomePicker />
      </div>
    </section>
  );
}
