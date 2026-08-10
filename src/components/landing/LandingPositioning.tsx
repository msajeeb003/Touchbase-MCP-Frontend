import { cn } from "@/lib/utils";
import { bandTight, eyebrow, lede, sec, wrap } from "./landingUi";

const COMBINES = [
  "Lead information from your spreadsheet",
  "Conversation context from Fathom",
  "Your sales process and follow-up scenarios",
  "Multi-channel outreach",
  "Scheduling across multiple days or weeks",
] as const;

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      className="mt-0.5 h-[18px] w-[18px] flex-none text-landing-indigo"
      aria-hidden
    >
      <path d="M4 10.5 8 14.5 16 6" />
    </svg>
  );
}

export function LandingPositioning() {
  return (
    <section className={bandTight} id="positioning">
      <div className={wrap}>
        <p className={eyebrow}>Positioning</p>
        <h2 className={sec}>
          Not another CRM. Not another generic email sequencer.
        </h2>
        <p className={lede}>
          CRMs help you store lead information. Email tools help you send emails.
          Follow-Up AI is designed for what happens{" "}
          <strong className="font-semibold text-landing-ink">
            between sales conversations
          </strong>
          . It combines:
        </p>

        <ul
          data-reveal
          className="mt-7 max-w-[42ch] list-none space-y-3 p-0"
        >
          {COMBINES.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-[15.5px] leading-[1.5] text-landing-ink-2"
            >
              <CheckIcon />
              {item}
            </li>
          ))}
        </ul>

        <p
          data-reveal
          className={cn(
            "mt-9 max-w-[34ch] border-l-[3px] border-landing-indigo pl-[22px]",
            "font-landing-display text-[clamp(21px,2.6vw,29px)] leading-[1.3] tracking-[-0.02em] text-landing-ink",
          )}
        >
          So your follow-up reflects where the lead actually is in the sales
          process.
        </p>
      </div>
    </section>
  );
}
