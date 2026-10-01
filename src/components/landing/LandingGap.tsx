import { cn } from "@/lib/utils";
import { band, bandAlt, lede, sec, wrap } from "./landingUi";

const LOSS_ITEMS = [
  "A promising lead says they will get back to you.",
  "A second meeting needs to be scheduled.",
  "A proposal is sent, but nobody follows up consistently.",
  "A no-show stays buried in a spreadsheet.",
  "Your team gets busy, and the conversation loses momentum.",
];

const TOOLS = [
  { title: "Calendar reminders", body: "Tell you to follow up." },
  { title: "Spreadsheets", body: "Tell you who the lead is." },
  { title: "Generic email sequences", body: "Send messages." },
];

export default function LandingGap() {
  return (
    <section className={cn(band, bandAlt)}>
      <div className={wrap}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className="m-0 font-landing-mono text-[11px] uppercase tracking-[0.18em] text-landing-voice">
              The gap
            </p>
            <h2 className={sec}>The call went well. Then the lead went quiet.</h2>
            <p className={lede}>
              Most opportunities are not lost during the sales call. They are
              lost in the days that follow, when the next touch depends on
              someone remembering.
            </p>
            <div className="mt-8 divide-y divide-landing-line border-y border-landing-line">
              {TOOLS.map((tool) => (
                <div
                  key={tool.title}
                  data-reveal
                  className="flex items-baseline justify-between gap-6 py-3.5"
                >
                  <p className="m-0 text-[15.5px] font-semibold text-landing-fog">
                    {tool.title}
                  </p>
                  <p className="m-0 text-right text-[14px] text-landing-fog/55">
                    {tool.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <ol
              data-reveal
              className="m-0 list-none divide-y divide-landing-line rounded-2xl border border-landing-line bg-landing-steel p-0"
            >
              {LOSS_ITEMS.map((item, index) => (
                <li
                  key={item}
                  className="flex items-baseline gap-4 px-6 py-4 text-[16px] text-landing-fog"
                >
                  <span className="font-landing-mono text-[11px] text-landing-voice">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
            <p
              data-reveal
              className="m-0 mt-7 max-w-[40ch] font-landing-display text-[clamp(21px,2.3vw,27px)] font-bold leading-[1.3] tracking-[-0.02em] text-landing-fog"
            >
              None of these connects{" "}
              <span className="text-landing-sky">what happened on the call</span>{" "}
              with what should happen next.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
