import { LandingShot } from "./LandingShot";
import { band, eyebrow, sec, wrap } from "./landingUi";

export function LandingHowItWorks() {
  return (
    <section className={band} id="how">
      <div className={wrap}>
        <p className={eyebrow}>How it works</p>
        <h2 className={sec}>Five steps from spreadsheet to running sequence.</h2>

        <ol className="mt-10 flex list-none flex-col gap-14 p-0">
          <li
            data-reveal
            className="grid grid-cols-1 items-start gap-2 min-[921px]:grid-cols-[88px_1fr] min-[921px]:gap-7"
          >
            <p className="m-0 mt-1 text-xs font-bold uppercase tracking-[0.1em] text-landing-indigo">
              Step 1
            </p>
            <div>
              <h3 className="mb-2.5 font-landing-display text-[clamp(22px,2.4vw,28px)] font-medium tracking-[-0.02em] text-landing-ink">
                Import your leads
              </h3>
              <p className="mb-3.5 max-w-[54ch] text-base leading-[1.65] text-landing-ink-2">
                Upload a spreadsheet containing each lead&apos;s details. No
                complicated migration is required to get started.
              </p>
              <ul className="mb-[22px] pl-[1.15em] text-[15px] leading-[1.7] text-landing-ink-2">
                <li>First and last name</li>
                <li>Email address</li>
                <li>Phone number</li>
              </ul>
              <LandingShot
                url="followupaitool.com/dashboard/leads"
                src="/landing/leads.webp"
                alt="Every imported lead in one table — searchable, filterable, with follow-up stage and status editable inline."
                caption="Every imported lead in one table — searchable, filterable, with follow-up stage and status editable inline."
              />
            </div>
          </li>

          <li
            data-reveal
            className="grid grid-cols-1 items-start gap-2 min-[921px]:grid-cols-[88px_1fr] min-[921px]:gap-7"
          >
            <p className="m-0 mt-1 text-xs font-bold uppercase tracking-[0.1em] text-landing-indigo">
              Step 2
            </p>
            <div>
              <h3 className="mb-2.5 font-landing-display text-[clamp(22px,2.4vw,28px)] font-medium tracking-[-0.02em] text-landing-ink">
                Connect Fathom
              </h3>
              <p className="mb-3.5 max-w-[54ch] text-base leading-[1.65] text-landing-ink-2">
                Connect your Fathom account so your follow-up workflow can use
                the notes and context captured during the conversation.
              </p>
              <LandingShot
                url="followupaitool.com/dashboard/transcripts"
                src="/landing/transcripts.webp"
                alt="Meetings pulled straight from Fathom. Open the full transcript, or attach it to the lead it belongs to."
                caption="Meetings pulled straight from Fathom. Open the full transcript, or attach it to the lead it belongs to."
              />
            </div>
          </li>

          <li
            data-reveal
            className="grid grid-cols-1 items-start gap-2 min-[921px]:grid-cols-[88px_1fr] min-[921px]:gap-7"
          >
            <p className="m-0 mt-1 text-xs font-bold uppercase tracking-[0.1em] text-landing-indigo">
              Step 3
            </p>
            <div>
              <h3 className="mb-2.5 font-landing-display text-[clamp(22px,2.4vw,28px)] font-medium tracking-[-0.02em] text-landing-ink">
                Select the call outcome
              </h3>
              <p className="mb-3.5 max-w-[54ch] text-base leading-[1.65] text-landing-ink-2">
                Choose what happened, and the follow-up path follows from there.
              </p>
              <ul className="mb-[22px] pl-[1.15em] text-[15px] leading-[1.7] text-landing-ink-2">
                <li>No-show</li>
                <li>Discovery completed</li>
                <li>Second meeting required</li>
                <li>PRD presented</li>
                <li>Proposal sent</li>
                <li>Waiting for a decision</li>
                <li>Custom scenario</li>
              </ul>
            </div>
          </li>

          <li
            data-reveal
            className="grid grid-cols-1 items-start gap-2 min-[921px]:grid-cols-[88px_1fr] min-[921px]:gap-7"
          >
            <p className="m-0 mt-1 text-xs font-bold uppercase tracking-[0.1em] text-landing-indigo">
              Step 4
            </p>
            <div>
              <h3 className="mb-2.5 font-landing-display text-[clamp(22px,2.4vw,28px)] font-medium tracking-[-0.02em] text-landing-ink">
                Launch the right sequence
              </h3>
              <p className="mb-3.5 max-w-[54ch] text-base leading-[1.65] text-landing-ink-2">
                Choose a predefined sequence or create your own — which channels
                to use, what messages to send, when each touchpoint should
                happen, and how long the follow-up should continue.
              </p>
              <LandingShot
                url="followupaitool.com/dashboard/sequences"
                src="/landing/sequences.webp"
                alt="Each sequence shows its lead, template, step count and per-channel progress — and a toggle to start or pause it."
                caption="Each sequence shows its lead, template, step count and per-channel progress — and a toggle to start or pause it."
              />
            </div>
          </li>

          <li
            data-reveal
            className="grid grid-cols-1 items-start gap-2 min-[921px]:grid-cols-[88px_1fr] min-[921px]:gap-7"
          >
            <p className="m-0 mt-1 text-xs font-bold uppercase tracking-[0.1em] text-landing-indigo">
              Step 5
            </p>
            <div>
              <h3 className="mb-2.5 font-landing-display text-[clamp(22px,2.4vw,28px)] font-medium tracking-[-0.02em] text-landing-ink">
                Keep the conversation moving
              </h3>
              <p className="mb-3.5 max-w-[54ch] text-base leading-[1.65] text-landing-ink-2">
                Follow-Up AI executes the scheduled sequence so leads continue
                hearing from you across multiple channels — not just through
                another email sitting in their inbox.
              </p>
              <div className="mt-[22px] grid max-w-[920px] grid-cols-1 gap-[18px] min-[921px]:grid-cols-2">
                <LandingShot
                  className="mt-0 max-w-none"
                  url="followupaitool.com/dashboard"
                  src="/landing/dashboard.webp"
                  alt="Leads, sends and active sequences at a glance."
                  caption="Leads, sends and active sequences at a glance."
                />
                <LandingShot
                  className="mt-0 max-w-none"
                  url="followupaitool.com/dashboard"
                  src="/landing/dashboard-charts.webp"
                  alt="Volume over time, and sent vs failed by channel."
                  caption="Volume over time, and sent vs failed by channel."
                />
              </div>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
