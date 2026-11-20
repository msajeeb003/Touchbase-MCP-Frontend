import { BookOpen, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import {
  FATHOM_HELP_CENTER_HOME_URL,
  FATHOM_HELP_PUBLIC_API_URL,
  FATHOM_WEB_URL,
} from "@/constants/docs/fathomTranscriptsLinks";

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

export default function FathomTranscriptsDocsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 font-landing-sans text-landing-fog/80">
      <div>
        <p className="inline-flex items-center gap-2 font-landing-mono text-[11px] uppercase tracking-[0.14em] text-landing-sky">
          <BookOpen className="h-4 w-4" aria-hidden />
          Settings · Help
        </p>
        <h1 className="mt-2 font-landing-display text-[clamp(26px,3vw,34px)] font-bold tracking-[-0.02em] text-landing-fog">
          How to get your Fathom API key
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-landing-fog/65">
          You create the key inside your own Fathom account, then paste it into this app&apos;s Settings so we can
          import transcripts you&apos;re allowed to access. Labels in Fathom may change slightly over time —
          use their help article if menus look different from the steps below.
        </p>
      </div>

      <div className="rounded-lg border border-landing-sms/40 bg-landing-sms/10 px-4 py-3 text-sm text-landing-sms">
        <strong className="font-semibold">Security.</strong> Never share your API key in chat, email, or
        screenshots. Only paste it into the Fathom API Key field in Settings here.
      </div>

      <section className="space-y-4 rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
        <h2 className="font-landing-display text-lg font-bold text-landing-fog">Steps</h2>
        <ol className="list-inside list-decimal space-y-3 text-sm leading-relaxed text-landing-fog/80">
          <li>
            Sign in to Fathom in your browser:&nbsp;
            <DocLink href={FATHOM_WEB_URL}>fathom.video</DocLink>.
          </li>
          <li>
            Open your user or account&nbsp;
            <strong className="font-medium text-landing-fog">Settings</strong> (often from your profile or avatar
            menu).
          </li>
          <li>
            Find the&nbsp;
            <strong className="font-medium text-landing-fog">API Access</strong>
            &nbsp;area (sometimes under integrations or developer options).
          </li>
          <li>
            <strong className="font-medium text-landing-fog">Create</strong> or&nbsp;
            <strong className="font-medium text-landing-fog">generate</strong> an API key, then&nbsp;
            <strong className="font-medium text-landing-fog">copy</strong> it while you still see it once — keys are
            often shown only once, like a password.
          </li>
          <li>
            In this app, go to&nbsp;
            <strong className="font-medium text-landing-fog">Settings → Fathom Call Transcripts</strong>
            , paste into&nbsp;
            <strong className="font-medium text-landing-fog">Fathom API Key</strong>, and save.
          </li>
        </ol>
      </section>

      <section className="space-y-3 rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
        <h2 className="font-landing-display text-lg font-bold text-landing-fog">Official help from Fathom</h2>
        <p className="text-sm text-landing-fog/65">
          Fathom describes what API keys can access (for example meetings you recorded or meetings shared with your
          team). Check their article for current wording.
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm text-landing-fog/80">
          <li>
            <DocLink href={FATHOM_HELP_PUBLIC_API_URL}>Public API overview</DocLink>
            &nbsp;— what the integration is for
          </li>
          <li>
            <DocLink href={FATHOM_HELP_CENTER_HOME_URL}>Fathom Help Center home</DocLink>
            &nbsp;— search if your screen does not match the steps above
          </li>
        </ul>
      </section>

      <p className="text-xs text-landing-fog/55">
        If menus move, search &quot;API&quot; or &quot;API key&quot; in Fathom&apos;s Help Center — not in this app.
      </p>
    </div>
  );
}
