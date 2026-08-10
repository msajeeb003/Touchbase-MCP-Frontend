import { band, eyebrow, lede, sec, wrap } from "./landingUi";

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
    <section className={band}>
      <div className={wrap}>
        <p className={eyebrow}>The gap</p>
        <h2 className={sec}>The call went well. Then the lead went quiet.</h2>
        <p className={lede}>
          Most opportunities are not lost during the sales call. They are lost in the days that
          follow.
        </p>

        <ul
          data-reveal
          className="mt-9 list-none overflow-hidden rounded-[14px] border border-landing-line bg-white p-0"
        >
          {LOSS_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-baseline gap-3.5 border-b border-landing-line px-[22px] py-[18px] text-base text-landing-ink last:border-b-0"
            >
              <span className="-translate-y-0.5 h-1.5 w-1.5 flex-none rounded-full bg-landing-coral" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          {TOOLS.map((tool) => (
            <div key={tool.title} data-reveal className="border-t-2 border-landing-line pt-4">
              <h4 className="mb-1.5 font-landing-display text-base font-bold leading-[1.06] tracking-[-0.022em] text-landing-ink">
                {tool.title}
              </h4>
              <p className="text-[14.5px] text-landing-muted">{tool.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-9 max-w-[34ch] border-l-[3px] border-landing-indigo pl-[22px] font-landing-display text-[clamp(21px,2.6vw,29px)] leading-[1.3] tracking-[-0.02em] text-landing-ink">
          But none of them connects what happened during the call with what should happen next.
        </p>
      </div>
    </section>
  );
}
