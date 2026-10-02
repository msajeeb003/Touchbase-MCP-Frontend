import { useSteelTheme } from "@/components/dashboard/dashboardTheme";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const docLinks: { to: string; title: string; description: string }[] = [
  {
    to: "/docs/ai-credentials",
    title: "AI provider credentials",
    description: "OpenAI, Gemini, and Claude keys, models, and official documentation.",
  },
  {
    to: "/docs/fathom-transcripts",
    title: "Fathom call transcripts",
    description: "How to get your Fathom API key and connect transcripts.",
  },
  {
    to: "/docs/retell-ai-calling",
    title: "Retell AI calling",
    description: "API key, agent ID, and caller number for voice sequences.",
  },
  {
    to: "/docs/email-smtp",
    title: "Email (SMTP)",
    description: "SMTP fields, ports, common providers (Google & Microsoft).",
  },
  {
    to: "/docs/sms-settings",
    title: "SMS settings",
    description: "TextMagic and Twilio setup for SMS and WhatsApp.",
  },
];

const cardClass =
  "block rounded-xl border border-landing-line bg-landing-steel-2 p-4 transition-colors hover:border-landing-sky/40 hover:bg-white/[0.03]";

export default function DocsIndexPage() {
  useSteelTheme();
  return (
    <div className="mx-auto max-w-3xl space-y-8 font-landing-sans text-landing-fog/80">
      <div>
        <p className="inline-flex items-center gap-2 font-landing-mono text-[11px] uppercase tracking-[0.14em] text-landing-sky">
          <BookOpen className="h-4 w-4" aria-hidden />
          Help
        </p>
        <h1 className="mt-2 font-landing-display text-[clamp(26px,3vw,34px)] font-bold tracking-[-0.02em] text-landing-fog">Documentation</h1>
        <p className="mt-2 text-sm leading-relaxed text-landing-fog/65">
          Guides for configuring integrations in&nbsp;
          <Link to="/dashboard/settings" className="font-medium text-landing-sky hover:underline">
            Settings
          </Link>
          . Choose a topic below.
        </p>
      </div>

      <nav aria-label="Documentation topics">
        <ul className="grid gap-3 sm:grid-cols-1">
          {docLinks.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className={cn(cardClass)}>
                <span className="font-medium text-landing-fog">{item.title}</span>
                <p className="mt-1 text-sm text-landing-fog/65">{item.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
