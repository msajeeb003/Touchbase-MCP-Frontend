import dashboard1Shot from "@/assets/landingPageImages/dashboard1.png";
import dashboard2Shot from "@/assets/landingPageImages/dashboard2.png";
import leadShot from "@/assets/landingPageImages/lead.png";
import sequencesShot from "@/assets/landingPageImages/sequences.png";
import transcriptsShot from "@/assets/landingPageImages/transcripts.png";
import type { ReactNode } from "react";
import { LandingShot } from "./LandingShot";
import { cn } from "@/lib/utils";
import { band, eyebrow, sec, wrap } from "./landingUi";

const OUTCOME_PILLS = [
  "No-show",
  "Discovery completed",
  "Second meeting required",
  "PRD presented",
  "Proposal sent",
  "Waiting for a decision",
  "Custom scenario",
] as const;

const stepLabel =
  "m-0 flex flex-col gap-1 font-landing-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-muted";

const stepNum =
  "font-landing-display text-[clamp(28px,3vw,36px)] font-bold leading-none tracking-[-0.02em] text-[#c5c8d6]";

type StepProps = {
  n: number;
  children: ReactNode;
  className?: string;
};

function Step({ n, children, className }: StepProps) {
  return (
    <li
      data-reveal
      className={cn(
        "grid grid-cols-1 gap-5 border-b border-landing-line px-5 py-10 last:border-b-0 sm:px-7 md:grid-cols-[72px_1fr] md:gap-8 md:px-9 md:py-12",
        className,
      )}
    >
      <div className={stepLabel}>
        Step
        <span className={stepNum}>{n}</span>
      </div>
      <div className="min-w-0">{children}</div>
    </li>
  );
}

export function LandingHowItWorks() {
  return (
    <section className={band} id="how">
      <div className={wrap}>
        <p className={eyebrow}>How it works</p>
        <h2 className={sec}>Five steps from spreadsheet to running sequence.</h2>

        <ol className="mt-10 list-none overflow-hidden rounded-2xl border border-landing-line bg-[#f7f8fc] p-0">
          <Step n={1}>
            <h3 className="mb-2.5 font-landing-display text-[clamp(22px,2.4vw,28px)] font-medium tracking-[-0.02em] text-landing-ink">
              Import your leads
            </h3>
            <p className="mb-3.5 max-w-[54ch] text-base leading-[1.65] text-landing-ink-2">
              Upload a spreadsheet containing each lead&apos;s details. No
              complicated migration is required to get started.
            </p>
            <div className="mb-[22px] flex flex-wrap gap-2">
              {["First and last name", "Email address", "Phone number"].map(
                (label) => (
                  <span
                    key={label}
                    className="rounded-md border border-landing-line bg-[#eef0f6] px-2.5 py-1 font-landing-mono text-[12px] text-landing-muted"
                  >
                    {label}
                  </span>
                ),
              )}
            </div>
            <LandingShot
              wide
              className="mt-0"
              url="followupaitool.com/dashboard/leads"
              src={leadShot}
              alt="Every imported lead in one table — searchable, filterable, with follow-up stage and status editable inline."
              caption="Every imported lead in one table — searchable, filterable, with follow-up stage and status editable inline."
            />
          </Step>

          <Step n={2}>
            <h3 className="mb-2.5 font-landing-display text-[clamp(22px,2.4vw,28px)] font-medium tracking-[-0.02em] text-landing-ink">
              Connect Fathom
            </h3>
            <p className="mb-3.5 max-w-[54ch] text-base leading-[1.65] text-landing-ink-2">
              Connect your Fathom account so your follow-up workflow can use
              the notes and context captured during the conversation.
            </p>
            <LandingShot
              wide
              className="mt-0"
              url="followupaitool.com/dashboard/transcripts"
              src={transcriptsShot}
              alt="Meetings pulled straight from Fathom. Open the full transcript, or attach it to the lead it belongs to."
              caption="Meetings pulled straight from Fathom. Open the full transcript, or attach it to the lead it belongs to."
            />
          </Step>

          <Step n={3}>
            <h3 className="mb-2.5 font-landing-display text-[clamp(22px,2.4vw,28px)] font-medium tracking-[-0.02em] text-landing-ink">
              Select the call outcome
            </h3>
            <p className="mb-3.5 max-w-[54ch] text-base leading-[1.65] text-landing-ink-2">
              Choose what happened, and the follow-up path follows from there.
            </p>
            <div className="flex flex-wrap gap-2">
              {OUTCOME_PILLS.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-landing-line bg-[#eef0f6] px-3.5 py-1.5 text-[13px] font-medium text-landing-ink"
                >
                  {label}
                </span>
              ))}
            </div>
          </Step>

          <Step n={4}>
            <h3 className="mb-2.5 font-landing-display text-[clamp(22px,2.4vw,28px)] font-medium tracking-[-0.02em] text-landing-ink">
              Launch the right sequence
            </h3>
            <p className="mb-3.5 max-w-[54ch] text-base leading-[1.65] text-landing-ink-2">
              Choose a predefined sequence or create your own — which channels
              to use, what messages to send, when each touchpoint should
              happen, and how long the follow-up should continue.
            </p>
            <LandingShot
              wide
              className="mt-0"
              url="followupaitool.com/dashboard/sequences"
              src={sequencesShot}
              alt="Each sequence shows its lead, template, step count and per-channel progress — and a toggle to start or pause it."
              caption="Each sequence shows its lead, template, step count and per-channel progress — and a toggle to start or pause it."
            />
          </Step>

          <Step n={5}>
            <h3 className="mb-2.5 font-landing-display text-[clamp(22px,2.4vw,28px)] font-medium tracking-[-0.02em] text-landing-ink">
              Keep the conversation moving
            </h3>
            <p className="mb-3.5 max-w-[54ch] text-base leading-[1.65] text-landing-ink-2">
              Follow-Up AI executes the scheduled sequence so leads continue
              hearing from you across multiple channels — not just through
              another email sitting in their inbox.
            </p>
            <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2">
              <LandingShot
                className="mt-0 max-w-none"
                url="followupaitool.com/dashboard"
                src={dashboard1Shot}
                alt="Leads, sends and active sequences at a glance."
                caption="Leads, sends and active sequences at a glance."
              />
              <LandingShot
                className="mt-0 max-w-none"
                url="followupaitool.com/dashboard"
                src={dashboard2Shot}
                alt="Volume over time, and sent vs failed by channel."
                caption="Volume over time, and sent vs failed by channel."
              />
            </div>
          </Step>
        </ol>
      </div>
    </section>
  );
}
