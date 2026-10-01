import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { band, eyebrow, lede, sec, wrap } from "./landingUi";
import {
  CHANNELS,
  OUTCOMES,
  type OutcomeId,
  type OutcomeStep,
} from "./outcomeSequences";

const SCENARIOS: { id: OutcomeId; key: string; title: string; body: string }[] = [
  {
    id: "noshow",
    key: "No-show",
    title: "When a lead misses the call",
    body: "Automatically begin a sequence that checks whether they are still interested and gives them a clear way to reschedule.",
  },
  {
    id: "second",
    key: "Second meeting",
    title: "When the next meeting needs scheduling",
    body: "Follow up after the discovery call until the lead schedules the next conversation to review the PRD, plan, or proposed solution.",
  },
  {
    id: "proposal",
    key: "Awaiting decision",
    title: "When a proposal is awaiting a decision",
    body: "Stay present after presenting the proposal without relying on someone from your team to remember every follow-up.",
  },
];

/** A week is the shortest strip shown, so short sequences still read as a calendar. */
const MIN_DAYS = 7;

function stepsFor(id: OutcomeId): OutcomeStep[] {
  return OUTCOMES.find((outcome) => outcome.id === id)?.steps ?? [];
}

function CadenceStrip({ steps }: { steps: OutcomeStep[] }) {
  const lastDay = steps.reduce((max, step) => Math.max(max, step.day), 0);
  const dayCount = Math.max(MIN_DAYS, lastDay + 1);
  const byDay = new Map(steps.map((step) => [step.day, step]));

  return (
    <ol
      className={cn(
        "m-0 grid list-none gap-2 p-0",
        dayCount > MIN_DAYS
          ? "grid-cols-4 sm:grid-cols-6 lg:grid-cols-12"
          : "grid-cols-4 sm:grid-cols-7",
      )}
    >
      {Array.from({ length: dayCount }, (_, day) => {
        const step = byDay.get(day);
        if (!step) {
          return (
            <li
              key={day}
              className="flex min-h-[58px] flex-col items-center justify-center rounded-lg border border-landing-line bg-landing-steel px-1 py-2 font-landing-mono text-[11px] text-landing-fog/30"
            >
              <span className="sr-only">Day {day}: no touchpoint</span>
              <span aria-hidden>D{day}</span>
            </li>
          );
        }
        const channel = CHANNELS[step.channel];
        return (
          <li
            key={day}
            title={step.label}
            className="flex min-h-[58px] flex-col items-center justify-center rounded-lg border px-1 py-2 text-center"
            style={{
              color: channel.color,
              borderColor: `color-mix(in srgb, ${channel.color} 45%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${channel.color} 16%, transparent)`,
            }}
          >
            <span className="sr-only">
              Day {day}: {channel.label}, {step.label}
            </span>
            <span aria-hidden className="font-landing-mono text-[11px] font-medium">
              D{day}
            </span>
            <span aria-hidden className="mt-0.5 text-[12.5px] font-semibold leading-tight">
              {channel.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** All rows open on desktop for side-by-side comparison; only the first on small screens. */
function initialOpenRows(): string[] {
  const all = SCENARIOS.map((scenario) => scenario.id);
  if (typeof window === "undefined" || !window.matchMedia) return all;
  return window.matchMedia("(min-width: 768px)").matches ? all : all.slice(0, 1);
}

export function LandingScenarios() {
  const [openRows, setOpenRows] = useState<string[]>(initialOpenRows);

  return (
    <section className={band} id="scenarios">
      <div className={wrap}>
        <div className="max-w-[720px]">
          <p className={eyebrow}>Scenarios</p>
          <h2 className={sec}>Built for the moments where deals usually stall.</h2>
          <p className={lede}>
            Each of these has a sequence behind it. The strip shows which day
            each touchpoint goes out, and on which channel.
          </p>
        </div>

        <Accordion
          type="multiple"
          value={openRows}
          onValueChange={setOpenRows}
          data-reveal
          className="mt-10 overflow-hidden rounded-2xl border border-landing-line bg-landing-steel-2"
        >
          {SCENARIOS.map(({ id, key, title, body }) => (
            <AccordionItem
              key={id}
              value={id}
              className="border-b border-landing-line px-5 last:border-b-0 sm:px-7"
            >
              <AccordionTrigger
                className={cn(
                  "gap-4 py-6 text-left hover:no-underline",
                  "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:flex-none [&>svg]:text-landing-sky",
                )}
              >
                <span className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-[200px_1fr] md:items-baseline md:gap-6">
                  <span className="font-landing-mono text-[11px] font-normal uppercase tracking-[0.14em] text-landing-sky">
                    {key}
                  </span>
                  <span className="font-landing-display text-[clamp(19px,2vw,23px)] font-bold leading-tight tracking-[-0.02em] text-landing-fog">
                    {title}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-7 md:pl-[224px]">
                <p className="m-0 max-w-[58ch] text-[15.5px] leading-[1.6] text-landing-fog/60">
                  {body}
                </p>
                <div className="mt-5 md:pr-8">
                  <CadenceStrip steps={stepsFor(id)} />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
