import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  band,
  bandDark,
  eyebrow,
  eyebrowOnDark,
  lede,
  ledeOnDark,
  sec,
  secOnDark,
  wrap,
} from "./landingUi";

type Channel = {
  name: string;
  body: string;
  color: string;
  icon: ReactNode;
};

const CHANNELS: Channel[] = [
  {
    name: "Email",
    color: "#7C6FFF",
    body: "Detailed follow-ups, meeting recaps, proposal reminders, and next-step requests.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
        <path d="m3 6 7 5 7-5" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    color: "#17A673",
    body: "Continue the conversation through a channel that feels direct and personal.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M10 2.8a7.2 7.2 0 0 0-6.2 10.9L2.8 17.2l3.6-1a7.2 7.2 0 1 0 3.6-13.4z" />
      </svg>
    ),
  },
  {
    name: "SMS",
    color: "#F0A93B",
    body: "Short reminders and simple calls to action that are easy to respond to.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M3 5.5A2 2 0 0 1 5 3.5h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-5 3.5z" />
      </svg>
    ),
  },
  {
    name: "AI Voice",
    color: "#F2603C",
    body: "An AI-powered follow-up call with a recording and transcript for future reference.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M4.2 3.5h3l1.4 3.4-2 1.4a9 9 0 0 0 4.6 4.6l1.4-2 3.4 1.4v3a1.5 1.5 0 0 1-1.7 1.5C8.6 16.2 3.8 11.4 2.7 5.2A1.5 1.5 0 0 1 4.2 3.5z" />
      </svg>
    ),
  },
];

export function LandingChannels() {
  return (
    <section className={cn(band, bandDark)} id="channels">
      <div className={wrap}>
        <p className={cn(eyebrow, eyebrowOnDark)}>Channels</p>
        <h2 className={cn(sec, secOnDark)}>
          One sequence. Multiple ways to reach the lead.
        </h2>
        <p className={cn(lede, ledeOnDark)}>
          Use one channel, or coordinate several within the same sequence.
        </p>

        <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map(({ name, body, color, icon }) => (
            <div
              key={name}
              data-reveal
              className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-5"
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] [&_svg]:h-5 [&_svg]:w-5"
                style={{
                  color,
                  backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
                }}
              >
                {icon}
              </div>
              <h3 className="mb-2 font-landing-display text-lg font-semibold tracking-[-0.02em] text-white">
                {name}
              </h3>
              <p className="m-0 text-[14.5px] leading-[1.55] text-white/[0.58]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
