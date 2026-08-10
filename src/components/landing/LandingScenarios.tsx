import { cn } from "@/lib/utils";
import { band, eyebrow, lede, sec, wrap } from "./landingUi";

const SCENARIOS = [
  {
    key: "No-show",
    title: "When a lead misses the call",
    body: "Automatically begin a sequence that checks whether they are still interested and gives them a clear way to reschedule.",
  },
  {
    key: "Second meeting",
    title: "When the next meeting needs scheduling",
    body: "Follow up after the discovery call until the lead schedules the next conversation to review the PRD, plan, or proposed solution.",
  },
  {
    key: "Awaiting decision",
    title: "When a proposal is awaiting a decision",
    body: "Stay present after presenting the proposal without relying on someone from your team to remember every follow-up.",
  },
] as const;

export function LandingScenarios() {
  return (
    <section className={band} id="scenarios">
      <div className={wrap}>
        <p className={eyebrow}>Scenarios</p>
        <h2 className={sec}>Built for the moments where deals usually stall.</h2>
        <p className={lede}>
          Each of these has a sequence behind it — switch between them at the top
          of the page to see the touchpoints.
        </p>

        <div
          data-reveal
          className="mt-9 grid grid-cols-1 overflow-hidden rounded-2xl border border-landing-line bg-white md:grid-cols-3"
        >
          {SCENARIOS.map(({ key, title, body }) => (
            <div
              key={key}
              className={cn(
                "border-b border-landing-line px-6 py-8 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:py-10 md:last:border-r-0",
              )}
            >
              <p className="mb-3 font-landing-mono text-[11px] uppercase tracking-[0.14em] text-landing-muted">
                {key}
              </p>
              <h3 className="mb-2.5 font-landing-display text-[clamp(18px,1.8vw,22px)] font-semibold tracking-[-0.02em] text-landing-ink">
                {title}
              </h3>
              <p className="m-0 text-[14.5px] leading-[1.6] text-landing-muted">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
