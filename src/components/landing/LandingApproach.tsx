import { WaitlistButton } from "@/components/landing/waitlist";
import { cn } from "@/lib/utils";
import { band, btn, btnPrimary, eyebrow, lede, sec, wrap } from "./landingUi";

/** Each call outcome and the sequence it is routed into. */
const ROUTES = [
  { outcome: "The lead did not attend", sequence: "no_show_recovery" },
  { outcome: "A second call needs to be scheduled", sequence: "book_second_meeting" },
  { outcome: "A PRD or project plan needs review", sequence: "prd_review" },
  { outcome: "A proposal was presented", sequence: "proposal_decision" },
  { outcome: "The lead needs more time to decide", sequence: "decision_pending" },
  { outcome: "A custom next step is required", sequence: "custom" },
] as const;

export function LandingApproach() {
  return (
    <section className={band}>
      <div className={wrap}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className={eyebrow}>The approach</p>
            <h2 className={sec}>
              Map each outcome once. Route every lead automatically.
            </h2>
            <p className={lede}>
              Follow-Up AI turns each stage of your sales process into a
              reusable, multi-channel sequence. After a call, you select the
              outcome. The right touchpoints are scheduled across the channels
              you choose.
            </p>
            <p className="m-0 mt-4 text-[16px] text-landing-fog/60">
              Your team defines the strategy once. The system executes it
              consistently for every lead.
            </p>
            <WaitlistButton className={cn(btn, btnPrimary, "mt-7")}>
              Apply for Pilot Access
            </WaitlistButton>
          </div>

          <div
            data-reveal
            className="rounded-2xl border border-landing-line bg-landing-steel-2 p-2"
          >
            <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3 font-landing-mono text-[10.5px] uppercase tracking-[0.14em] text-landing-fog/40">
              <span>Routing table</span>
              <span>outcome → sequence</span>
            </div>
            <ul className="m-0 list-none divide-y divide-landing-line p-0">
              {ROUTES.map(({ outcome, sequence }) => (
                <li
                  key={sequence}
                  className="flex flex-col gap-1 px-4 py-3.5 text-[15px] text-landing-fog sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <span>{outcome}</span>
                  <span className="font-landing-mono text-[11px] text-landing-sky">
                    {sequence}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
