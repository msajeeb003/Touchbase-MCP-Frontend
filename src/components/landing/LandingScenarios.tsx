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
        <div className="max-w-[720px]">
          <p className={eyebrow}>Scenarios</p>
          <h2 className={sec}>Built for the moments where deals usually stall.</h2>
          <p className={lede}>
            Each of these has a sequence behind it. Switch between them in the
            routing preview at the top of the page.
          </p>
        </div>

        <div
          data-reveal
          className="mt-10 grid grid-cols-1 divide-y divide-landing-line rounded-2xl border border-landing-line bg-landing-steel-2 md:grid-cols-3 md:divide-x md:divide-y-0"
        >
          {SCENARIOS.map(({ key, title, body }) => (
            <div key={key} className="px-7 py-8">
              <p className="m-0 font-landing-mono text-[11px] uppercase tracking-[0.14em] text-landing-sky">
                {key}
              </p>
              <h3 className="m-0 mt-3 font-landing-display text-[21px] font-bold leading-tight text-landing-fog">
                {title}
              </h3>
              <p className="m-0 mt-2.5 text-[14.5px] leading-[1.6] text-landing-fog/60">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
