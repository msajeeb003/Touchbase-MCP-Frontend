import createSequenceShot from "@/assets/landingPageImages/create sequence.png";
import configureShot from "@/assets/landingPageImages/configure.png";
import dashboard2Shot from "@/assets/landingPageImages/dashboard2.png";
import leadShot from "@/assets/landingPageImages/lead.png";
import sequencesShot from "@/assets/landingPageImages/sequences.png";
import transcriptsShot from "@/assets/landingPageImages/transcripts.png";
import type { ReactNode } from "react";
import { LandingShot } from "./LandingShot";
import { cn } from "@/lib/utils";
import {
  band,
  chip,
  eyebrow,
  sec,
  stepBadge,
  stepBody,
  stepTitle,
  wrap,
} from "./landingUi";

const LEAD_FIELDS = ["First and last name", "Email address", "Phone number"] as const;

const OUTCOME_PILLS = [
  "No-show",
  "Discovery completed",
  "Second meeting required",
  "PRD presented",
  "Proposal sent",
  "Waiting for a decision",
  "Custom scenario",
] as const;

type StepRowProps = {
  badge: string;
  title: string;
  body: string;
  chips?: readonly string[];
  /** Put the screenshot on the left from lg up. */
  flip?: boolean;
  shot: ReactNode;
};

function StepRow({ badge, title, body, chips, flip = false, shot }: StepRowProps) {
  return (
    <div
      data-reveal
      className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14"
    >
      <div className={cn(flip && "lg:order-2")}>
        <span className={stepBadge}>{badge}</span>
        <h3 className={stepTitle}>{title}</h3>
        <p className={stepBody}>{body}</p>
        {chips ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((label) => (
              <span key={label} className={chip}>
                {label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className={cn("min-w-0", flip && "lg:order-1")}>{shot}</div>
    </div>
  );
}

export function LandingHowItWorks() {
  return (
    <section className={band} id="how">
      <div className={wrap}>
        <div className="mx-auto max-w-[700px] text-center">
          <p className={eyebrow}>How it works</p>
          <h2 className={sec}>Five steps from spreadsheet to running sequence.</h2>
        </div>

        <div className="mt-14 space-y-16 lg:space-y-24">
          <StepRow
            badge="01 · Input"
            title="Import your leads"
            body="Upload a spreadsheet containing each lead's details. No complicated migration is required to get started."
            chips={LEAD_FIELDS}
            shot={
              <LandingShot
                wide
                className="mt-0"
                url="followupaitool.com/dashboard/leads"
                src={leadShot}
                alt="Leads table with search, filters, follow-up stage and status"
                caption="Every imported lead in one table: searchable, filterable, with follow-up stage and status editable inline."
              />
            }
          />

          <StepRow
            flip
            badge="02 · Context"
            title="Connect Fathom"
            body="Connect your Fathom account so your follow-up workflow can use the notes and context captured during the conversation."
            shot={
              <LandingShot
                wide
                className="mt-0"
                url="followupaitool.com/dashboard/transcripts"
                src={transcriptsShot}
                alt="Fathom meetings list with transcripts"
                caption="Meetings pulled straight from Fathom. Open the full transcript, or attach it to the lead it belongs to."
              />
            }
          />

          <StepRow
            badge="03 · Trigger"
            title="Select the call outcome"
            body="Choose what happened, and the follow-up path follows from there."
            chips={OUTCOME_PILLS}
            shot={
              <LandingShot
                wide
                className="mt-0"
                url="followupaitool.com/dashboard/sequences/new"
                src={createSequenceShot}
                alt="Create sequence screen with situation, goal, tone, cadence and channels"
                caption="Pick the situation and the goal, then set tone, intensity, cadence and channels. The summary on the right updates as you go."
              />
            }
          />

          <StepRow
            flip
            badge="04 · Plan"
            title="Launch the right sequence"
            body="Choose a predefined sequence or create your own: which channels to use, what messages to send, when each touchpoint should happen, and how long the follow-up should continue."
            shot={
              <LandingShot
                wide
                className="mt-0"
                url="followupaitool.com/dashboard/sequences"
                src={sequencesShot}
                alt="Sequences list with per-channel progress and start or pause toggle"
                caption="Each sequence shows its lead, template, step count and per-channel progress, and a toggle to start or pause it."
              />
            }
          />

          <div data-reveal>
            <div className="mx-auto max-w-[640px] text-center">
              <span className={stepBadge}>05 · Run</span>
              <h3 className={stepTitle}>Keep the conversation moving</h3>
              <p className={cn(stepBody, "mx-auto max-w-none")}>
                Touchbase AI executes the scheduled sequence so leads continue
                hearing from you across multiple channels, not just through
                another email sitting in their inbox.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <LandingShot
                className="mt-0 max-w-none"
                url="followupaitool.com/dashboard/how-to-configure"
                src={configureShot}
                alt="Sequence step review with regenerate, pause and resume"
                caption="Review or regenerate any step, then pause and resume it any time."
              />
              <LandingShot
                className="mt-0 max-w-none"
                url="followupaitool.com/dashboard"
                src={dashboard2Shot}
                alt="Charts of message volume over time and sent versus failed by channel"
                caption="Volume over time, and sent vs failed by channel."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
