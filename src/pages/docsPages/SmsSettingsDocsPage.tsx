import { useSteelTheme } from "@/components/dashboard/dashboardTheme";
import { BookOpen, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import {
  TEXTMAGIC_API_GET_STARTED_URL,
  TEXTMAGIC_CONFIGURE_API_URL,
  TWILIO_CONSOLE_URL,
  TWILIO_HELP_FIND_CREDENTIALS_URL,
  TWILIO_HELP_PHONE_NUMBERS_URL,
  TWILIO_USAGE_GET_STARTED_URL,
  TWILIO_WHATSAPP_DOCS_URL,
} from "@/constants/docs/smsSettingsLinks";

const outbound = { target: "_blank", rel: "noopener noreferrer" } as const;

function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      {...outbound}
      className="inline-flex items-center gap-1 font-medium text-landing-sky underline-offset-2 hover:underline"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
    </a>
  );
}

export default function SmsSettingsDocsPage() {
  useSteelTheme();
  return (
    <div className="mx-auto max-w-3xl space-y-8 font-landing-sans text-landing-fog/80">
      <div>
        <p className="inline-flex items-center gap-2 font-landing-mono text-[11px] uppercase tracking-[0.14em] text-landing-sky">
          <BookOpen className="h-4 w-4" aria-hidden />
          Settings · Help
        </p>
        <h1 className="mt-2 font-landing-display text-[clamp(26px,3vw,34px)] font-bold tracking-[-0.02em] text-landing-fog">
          SMS settings
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-landing-fog/65">
          Pick <strong className="font-medium text-landing-fog">TextMagic</strong> or{" "}
          <strong className="font-medium text-landing-fog">Twilio</strong> to send SMS (and WhatsApp when using
          Twilio). Choose <strong className="font-medium text-landing-fog">None</strong> to turn off SMS for
          sequence steps. Credential names and dashboards can change slightly—use each provider&apos;s help if
          menus differ from this guide.
        </p>
      </div>

      <div className="rounded-lg border border-landing-sms/40 bg-landing-sms/10 px-4 py-3 text-sm text-landing-sms">
        <strong className="font-semibold">Security.</strong> API keys and auth tokens grant send access like
        passwords. Never share them in chat or screenshots. Paste them only here in Settings.
      </div>

      <section className="space-y-3 rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
        <h2 className="font-landing-display text-lg font-bold text-landing-fog">TextMagic</h2>
        <p className="text-sm text-landing-fog/65">
          Copy your <strong className="font-medium text-landing-fog">Username</strong> and{" "}
          <strong className="font-medium text-landing-fog">API key</strong> from Textmagic&apos;s API settings into
          the matching fields here.
        </p>
        <ol className="list-inside list-decimal space-y-2 text-sm text-landing-fog/80">
          <li>Sign in at Textmagic.</li>
          <li>Open the API settings page in your account (sometimes called Integrations or API).</li>
          <li>Create or view an API key and copy both your account username label and the key value.</li>
          <li>Save Settings in this app after pasting.</li>
        </ol>
        <ul className="list-inside list-disc space-y-2 border-t border-landing-line pt-4 text-sm text-landing-fog/80">
          <li>
            Configure API:&nbsp;<DocLink href={TEXTMAGIC_CONFIGURE_API_URL}>Textmagic · API settings guide</DocLink>
          </li>
          <li>
            Credential steps:&nbsp;
            <DocLink href={TEXTMAGIC_API_GET_STARTED_URL}>REST API · get started</DocLink>
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
        <h2 className="font-landing-display text-lg font-bold text-landing-fog">Twilio</h2>
        <p className="text-sm text-landing-fog/65">
          One Twilio account supplies credentials for both <strong className="font-medium text-landing-fog">SMS</strong>{" "}
          and <strong className="font-medium text-landing-fog">WhatsApp</strong> in Settings. Copy your{" "}
          <strong className="font-medium text-landing-fog">Account SID</strong> and{" "}
          <strong className="font-medium text-landing-fog">Auth Token</strong> from the Twilio Console. Enter phone
          numbers you have provisioned there, in <strong className="font-medium text-landing-fog">E.164</strong> format
          (start with <code className="rounded bg-landing-fog/10 px-1 font-landing-mono text-xs text-landing-fog">+</code> and the country code).
        </p>
        <ol className="list-inside list-decimal space-y-2 text-sm text-landing-fog/80">
          <li>
            Open the&nbsp;
            <DocLink href={TWILIO_CONSOLE_URL}>Twilio Console</DocLink>
            .
          </li>
          <li>
            Copy your Account SID and Auth Token into{" "}
            <strong className="font-medium text-landing-fog">Settings → SMS Settings</strong> when Twilio is selected.
          </li>
          <li>Ensure you have purchased or verified an SMS-capable phone number for regular texts.</li>
          <li>
            For WhatsApp, finish Twilio&apos;s WhatsApp onboarding for your sender number in Console (sandbox or
            approved sender)—then paste that WhatsApp-enabled number here.
          </li>
        </ol>
        <ul className="list-inside list-disc space-y-2 border-t border-landing-line pt-4 text-sm text-landing-fog/80">
          <li>
            <DocLink href={TWILIO_HELP_FIND_CREDENTIALS_URL}>Where to find Account SID and Auth Token</DocLink>
          </li>
          <li>
            <DocLink href={TWILIO_USAGE_GET_STARTED_URL}>Twilio quick start (trial and basics)</DocLink>
          </li>
          <li>
            <DocLink href={TWILIO_HELP_PHONE_NUMBERS_URL}>Search for and buy a Twilio phone number</DocLink>
          </li>
          <li>
            <DocLink href={TWILIO_WHATSAPP_DOCS_URL}>Connect a WhatsApp sender (Twilio)</DocLink>
          </li>
        </ul>
      </section>

      <p className="text-xs text-landing-fog/55">
        Messaging rules (opt-in, quiet hours, country restrictions) depend on law and carrier policy—you are
        responsible for compliant outreach.
      </p>
    </div>
  );
}
