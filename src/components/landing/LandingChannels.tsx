import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { band, bandAlt, eyebrow, lede, sec, wrap } from "./landingUi";

type Channel = {
  name: string;
  body: string;
  /** Mirrors the landing-email / whatsapp / sms / voice tokens. */
  color: string;
  icon: ReactNode;
};

const CHANNELS: Channel[] = [
  {
    name: "Email",
    color: "#7FB4FF",
    body: "Detailed follow-ups, meeting recaps, proposal reminders, and next-step requests.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
        <path d="m3 6 7 5 7-5" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    color: "#5EDBA6",
    body: "Continue the conversation through a channel that feels direct and personal.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M10 2.8a7.2 7.2 0 0 0-6.2 10.9L2.8 17.2l3.6-1a7.2 7.2 0 1 0 3.6-13.4z" />
      </svg>
    ),
  },
  {
    name: "SMS",
    color: "#F2C86A",
    body: "Short reminders and simple calls to action that are easy to respond to.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M3 5.5A2 2 0 0 1 5 3.5h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-5 3.5z" />
      </svg>
    ),
  },
  {
    name: "AI Voice",
    color: "#FF9A7A",
    body: "An AI-powered follow-up call with a recording and transcript for future reference.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4.2 3.5h3l1.4 3.4-2 1.4a9 9 0 0 0 4.6 4.6l1.4-2 3.4 1.4v3a1.5 1.5 0 0 1-1.7 1.5C8.6 16.2 3.8 11.4 2.7 5.2A1.5 1.5 0 0 1 4.2 3.5z" />
      </svg>
    ),
  },
];

export function LandingChannels() {
  return (
    <section className={cn(band, bandAlt)} id="channels">
      <div className={wrap}>
        <div className="mx-auto max-w-[700px] text-center">
          <p className={eyebrow}>Channels</p>
          <h2 className={sec}>One sequence. Four ways to reach the lead.</h2>
          <p className={lede}>
            Use one channel, or coordinate several within the same sequence.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map(({ name, body, color, icon }) => (
            <div
              key={name}
              data-reveal
              className="relative rounded-2xl border border-landing-line bg-landing-steel p-6 before:absolute before:-left-px before:bottom-3 before:top-3 before:w-0.5 before:rounded-sm before:bg-[var(--chan)] before:content-['']"
              style={{ "--chan": color } as CSSProperties}
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 [&_svg]:h-5 [&_svg]:w-5"
                style={{ color }}
              >
                {icon}
              </div>
              <h3 className="m-0 font-landing-display text-[20px] font-bold text-landing-fog">
                {name}
              </h3>
              <p className="m-0 mt-2 text-[14.5px] leading-[1.55] text-landing-fog/60">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
