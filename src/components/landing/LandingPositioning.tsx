import { cn } from "@/lib/utils";
import { LandingOrigin } from "./LandingOrigin";
import { band, bandAlt, eyebrow, wrap } from "./landingUi";

const COMBINES = [
  "Lead information from your spreadsheet",
  "Conversation context from Fathom",
  "Your sales process and follow-up scenarios",
  "Multi-channel outreach",
  "Scheduling across multiple days or weeks",
] as const;

function CheckBadge() {
  return (
    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md bg-landing-sky text-landing-steel">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        className="h-3.5 w-3.5"
        aria-hidden
      >
        <path d="M4 10.5 8 14.5 16 6" />
      </svg>
    </span>
  );
}

/** Positioning on the left, origin story card on the right. */
export function LandingPositioning() {
  return (
    <section className={cn(band, bandAlt)} id="positioning">
      <div className={wrap}>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className={eyebrow}>Positioning</p>
            <h2 className="m-0 mt-3 max-w-[20ch] font-landing-display text-[clamp(28px,3.6vw,42px)] font-bold leading-[1.08] tracking-[-0.03em] text-landing-fog">
              Not another CRM. Not another generic email sequencer.
            </h2>
            <p className="m-0 mt-4 max-w-[50ch] text-[17px] text-landing-fog/60">
              CRMs help you store lead information. Email tools help you send
              emails. Touchbase AI is designed for what happens{" "}
              <strong className="font-semibold text-landing-fog">
                between sales conversations
              </strong>
              . It combines:
            </p>

            <ul
              data-reveal
              className="m-0 mt-6 list-none space-y-2.5 p-0 text-[15.5px] text-landing-fog/85"
            >
              {COMBINES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckBadge />
                  {item}
                </li>
              ))}
            </ul>

            <p
              data-reveal
              className="m-0 mt-7 max-w-[34ch] border-l-2 border-landing-sky pl-5 font-landing-display text-[clamp(19px,2.1vw,24px)] font-bold leading-[1.3] text-landing-fog"
            >
              So your follow-up reflects where the lead actually is in the sales
              process.
            </p>
          </div>

          <LandingOrigin />
        </div>
      </div>
    </section>
  );
}
