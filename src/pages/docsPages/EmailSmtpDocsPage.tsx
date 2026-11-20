import { BookOpen, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import {
  GMAIL_SMTP_AND_CLIENTS_URL,
  GOOGLE_APP_PASSWORDS_URL,
  MICROSOFT_EXCHANGE_SMTP_SUBMISSION_URL,
  MICROSOFT_OUTLOOK_SMTP_SETTINGS_URL,
} from "@/constants/docs/emailSmtpLinks";

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

export default function EmailSmtpDocsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 font-landing-sans text-landing-fog/80">
      <div>
        <p className="inline-flex items-center gap-2 font-landing-mono text-[11px] uppercase tracking-[0.14em] text-landing-sky">
          <BookOpen className="h-4 w-4" aria-hidden />
          Settings · Help
        </p>
        <h1 className="mt-2 font-landing-display text-[clamp(26px,3vw,34px)] font-bold tracking-[-0.02em] text-landing-fog">
          Email (SMTP) settings
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-landing-fog/65">
          These values tell this app how to send sequence emails through your email provider&apos;s outbound mail
          server. Your IT team or provider documentation is the source of truth for host, port, and security
          requirements.
        </p>
      </div>

      <div className="rounded-lg border border-landing-sms/40 bg-landing-sms/10 px-4 py-3 text-sm text-landing-sms">
        <strong className="font-semibold">Security.</strong> Treat your SMTP password and app passwords like
        secrets—never share them in chat. Many providers require an app password or OAuth for automated sending; your
        normal web login password may be rejected.
      </div>

      <section className="space-y-3 rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
        <h2 className="font-landing-display text-lg font-bold text-landing-fog">What each field is for</h2>
        <dl className="space-y-3 text-sm text-landing-fog/80">
          <div>
            <dt className="font-medium text-landing-fog">SMTP Host</dt>
            <dd className="mt-1 text-landing-fog/65">
              Outbound mail server hostname from your provider (e.g.&nbsp;
              <code className="rounded bg-landing-fog/10 px-1 font-landing-mono text-xs text-landing-fog">smtp.office365.com</code> or your company&apos;s
              relay).
            </dd>
          </div>
          <div>
            <dt className="font-medium text-landing-fog">SMTP Port</dt>
            <dd className="mt-1 text-landing-fog/65">
              Common values: <strong className="font-medium text-landing-fog">587</strong> (STARTTLS submission) or{" "}
              <strong className="font-medium text-landing-fog">465</strong> (TLS). Your provider specifies which port and
              encryption to use—wrong combinations cause connection failures or rejected mail.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-landing-fog">SMTP Username</dt>
            <dd className="mt-1 text-landing-fog/65">
              Usually the full mailbox address you authenticate with (for example{" "}
              <code className="rounded bg-landing-fog/10 px-1 font-landing-mono text-xs text-landing-fog">you@company.com</code>).
            </dd>
          </div>
          <div>
            <dt className="font-medium text-landing-fog">SMTP Password</dt>
            <dd className="mt-1 text-landing-fog/65">
              The password or app-specific password your provider expects for SMTP. Do not reuse unrelated passwords.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-landing-fog">SMTP From Name</dt>
            <dd className="mt-1 text-landing-fog/65">
              The display name recipients see (for example your team or product name). The actual &quot;From&quot;
              address is usually tied to the authenticated mailbox on the server side.
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3 rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
        <h2 className="font-landing-display text-lg font-bold text-landing-fog">Common providers</h2>
        <p className="text-sm text-landing-fog/65">
          If you use Google or Microsoft personally or at work, start with their SMTP documentation. Corporate policies
          often block SMTP unless enabled by an administrator.
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm text-landing-fog/80">
          <li>
            Gmail / Google Workspace SMTP (and related settings):&nbsp;
            <DocLink href={GMAIL_SMTP_AND_CLIENTS_URL}>Google Mail SMTP guide</DocLink>
          </li>
          <li>
            Google app passwords (when required):&nbsp;
            <DocLink href={GOOGLE_APP_PASSWORDS_URL}>Sign in with app passwords</DocLink>
          </li>
          <li>
            Outlook.com POP/IMAP/SMTP settings:&nbsp;
            <DocLink href={MICROSOFT_OUTLOOK_SMTP_SETTINGS_URL}>Microsoft support · Outlook SMTP</DocLink>
          </li>
          <li>
            Microsoft 365 / Exchange Online SMTP submission:&nbsp;
            <DocLink href={MICROSOFT_EXCHANGE_SMTP_SUBMISSION_URL}>
              Authenticated client SMTP submission
            </DocLink>
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
        <h2 className="font-landing-display text-lg font-bold text-landing-fog">If sending fails</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-landing-fog/80">
          <li>Confirm host and port match your provider&apos;s current documentation.</li>
          <li>Verify the account is allowed to send via SMTP (some orgs disable it).</li>
          <li>Use an app password or approved credential if two-factor authentication is enabled.</li>
          <li>Ask your IT admin for a dedicated relay if your provider does not support plain SMTP for apps.</li>
        </ul>
      </section>

      <p className="text-xs text-landing-fog/55">
        SPF, DKIM, and DMARC affect deliverability; those are configured at your domain/DNS level with your provider, not
        in this form alone.
      </p>
    </div>
  );
}
