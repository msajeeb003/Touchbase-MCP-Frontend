import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { band, eyebrow, sec, wrap } from "./landingUi";

const FAQS = [
  {
    q: "Is Follow-Up AI a CRM?",
    a: "No. It is a post-call follow-up automation platform. It can work with lead information imported from your existing spreadsheet without requiring you to replace your current sales system.",
  },
  {
    q: "Do I need to use every communication channel?",
    a: "No. You decide which channels belong in each sequence. A sequence can use one channel or combine email, WhatsApp, SMS, and AI voice.",
  },
  {
    q: "Can I create different sequences for different call outcomes?",
    a: "Yes. You can create separate sequences for no-shows, second-meeting scheduling, proposal follow-up, decision follow-up, and other stages of your sales process.",
  },
  {
    q: "How does the Fathom integration work?",
    a: "Fathom provides notes and context from the sales conversation, helping keep the follow-up connected to what was discussed during the call.",
  },
  {
    q: "Can I control the timing of each message?",
    a: "Yes. You decide when every touchpoint is scheduled and how long each sequence should continue.",
  },
  {
    q: "What happens during an AI call?",
    a: "The system can place an AI-powered follow-up call and provide a recording and transcript for reference.",
  },
  {
    q: "Who is the pilot designed for?",
    a: "The pilot is best suited for agencies, consultancies, and service businesses that generate leads, hold sales calls, send proposals, and need to follow up several times before receiving a decision.",
  },
] as const;

export function LandingFaq() {
  return (
    <section className={band} id="faq">
      <div className={cn(wrap, "max-w-[880px]")}>
        <p className={eyebrow}>FAQ</p>
        <h2 className={sec}>Frequently asked questions</h2>

        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="mt-9 w-full border-t border-landing-line"
        >
          {FAQS.map(({ q, a }, index) => (
            <AccordionItem
              key={q}
              value={`item-${index}`}
              className="border-landing-line"
            >
              <AccordionTrigger
                className={cn(
                  "py-5 text-left hover:no-underline",
                  "font-landing-display text-[clamp(17px,1.6vw,20px)] font-semibold tracking-[-0.02em] text-landing-ink",
                  "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-landing-indigo-lift",
                )}
              >
                {q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[15.5px] leading-[1.65] text-landing-muted">
                <p className="m-0 max-w-[58ch]">{a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
