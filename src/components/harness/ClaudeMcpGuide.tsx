import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Ban,
  BookOpen,
  Check,
  ClipboardList,
  Copy,
  History,
  Info,
  KeyRound,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { ClaudeLogo } from "./ClaudeLogo";
import { CodeBlock, copyText, mcpUrl } from "./SettingsCards";

/** The five steps of the existing guide, and what each becomes with Claude. */
const WORKFLOW: { step: string; app: string; claude: string }[] = [
  {
    step: "Create Template",
    app: "Write a template, or generate one with AI.",
    claude: "Claude uses your saved templates, or saves a new one you describe.",
  },
  {
    step: "Add Lead",
    app: "Add leads one by one or import a CSV, then attach transcripts.",
    claude: "Paste a list or your call notes. Claude adds them and matches duplicates.",
  },
  {
    step: "Generate Sequence",
    app: "Pick one lead and one template, then generate.",
    claude: "Ask once for a whole group. Claude finds the leads and writes each draft from that lead's own call.",
  },
  {
    step: "Review & Edit",
    app: "Open each sequence and edit its steps.",
    claude: "All drafts wait in one Review Queue, each showing what it was based on.",
  },
  {
    step: "Activate",
    app: "Activate each sequence.",
    claude: "Approve one draft or many at once. They go out in your send window.",
  },
];

const CONNECT: { title: string; text: string }[] = [
  {
    title: "Add Touchbase to Claude",
    text: "In Claude, open Settings → Connectors → Add custom connector, and paste this address.",
  },
  {
    title: "Sign in and allow",
    text: "Claude opens a Touchbase page. Enter your Touchbase email and password, then click Allow.",
  },
  {
    title: "Give Claude a task",
    text: "Type what you want in plain words. Its work appears in AI Tasks as it happens.",
  },
];

const EXAMPLES: { label: string; icon: LucideIcon; text: string }[] = [
  {
    label: "Find leads",
    icon: Search,
    text: "Show me my leads in the Demo done stage who have not replied in the last 7 days.",
  },
  {
    label: "Follow up with a group",
    icon: Send,
    text: "Follow up with every lead in Demo done who has not replied in 7 days: one email now and a short SMS two days later. Use what they said on the call.",
  },
  {
    label: "Save call notes",
    icon: BookOpen,
    text: "Here are my notes from today's call with Sarah Chen: wants a quote by Friday. Save the notes and write a follow-up email.",
  },
  {
    label: "Stop contacting someone",
    icon: Ban,
    text: "Sarah Chen asked not to be contacted again. Make sure nothing goes out.",
  },
  {
    label: "Daily check",
    icon: ClipboardList,
    text: "What did you prepare today, and what is still waiting for my approval?",
  },
];

const CONTROL: { title: string; text: string; icon: LucideIcon; to: string; link: string }[] = [
  {
    title: "You release",
    text: "By default Claude only prepares drafts. Nothing is sent until you approve it.",
    icon: Check,
    to: "/dashboard/review",
    link: "Review Queue",
  },
  {
    title: "Checks always run",
    text: "Do-not-contact, your send window, no leftover placeholders, and never sent twice.",
    icon: ShieldCheck,
    to: "/dashboard/settings#claude-safety",
    link: "Safety rules",
  },
  {
    title: "Extra powers are off",
    text: "Activating, resuming, changing settings and deleting leads stay off unless you allow them.",
    icon: SlidersHorizontal,
    to: "/dashboard/settings#claude-permissions",
    link: "Permissions",
  },
  {
    title: "Everything is recorded",
    text: "See each step Claude took, what a rule stopped, and what happened after.",
    icon: History,
    to: "/dashboard/ai-tasks",
    link: "AI Tasks",
  },
];

/** Top of the How to configure page: points to the new section below the guide. */
export function ClaudeMcpBanner() {
  return (
    <a href="#claude-mcp" className="tb-card-link group flex flex-wrap items-center gap-3 px-5 py-4 no-underline">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#D97757]/[0.12]">
        <ClaudeLogo className="h-[22px] w-[22px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="tb-h3">Run Touchbase from Claude</span>
          <NewBadge />
        </span>
        <span className="tb-meta mt-0.5 block">Type one instruction. Claude prepares the follow-ups, and you approve them.</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-tb-accent">
        See how
        <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
      </span>
    </a>
  );
}

function NewBadge() {
  return (
    <span className="rounded-full bg-[#D97757]/[0.14] px-2 py-0.5 font-landing-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-landing-voice">
      New
    </span>
  );
}

/** The MCP part of the How to configure page. Added after the existing guide. */
export default function ClaudeMcpGuide() {
  const address = mcpUrl();
  const localOnly = address.startsWith("http://");

  return (
    <section id="claude-mcp" aria-labelledby="claude-mcp-title" className="scroll-mt-20 space-y-5">
      <header className="mx-auto max-w-2xl pt-4 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#D97757]/[0.12]">
          <ClaudeLogo className="h-7 w-7" />
        </span>
        <div className="flex justify-center">
          <NewBadge />
        </div>
        <h2 id="claude-mcp-title" className="mt-2 font-landing-display text-[clamp(26px,3vw,34px)] font-bold leading-tight tracking-[-0.02em] text-tb-ink">
          Touchbase in Claude
        </h2>
        <p className="tb-body mt-2">
          Tell Claude what you want. It does the work in Touchbase through a secure connection called MCP, and you approve
          before anything is sent.
        </p>
      </header>

      {/* The existing five steps, side by side with Claude */}
      <div className="tb-card overflow-hidden">
        <div className="border-b border-tb-ink/[0.07] px-5 py-4">
          <h3 className="tb-h2">Your same five steps, with less work</h3>
        </div>
        <div className="hidden grid-cols-[190px_minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-tb-ink/[0.07] px-5 py-2 md:grid">
          <span className="tb-label">Step</span>
          <span className="tb-label">In the app</span>
          <span className="tb-label">With Claude</span>
        </div>
        <ol className="divide-y divide-tb-ink/[0.07]">
          {WORKFLOW.map((row, i) => (
            <li key={row.step} className="grid grid-cols-1 gap-2 px-5 py-3.5 md:grid-cols-[190px_minmax(0,1fr)_minmax(0,1fr)] md:gap-4">
              <span className="flex items-center gap-2.5 md:items-start">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-tb-ink/[0.07] font-landing-mono text-[11px] font-semibold text-tb-ink-2">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-tb-ink">{row.step}</span>
              </span>
              <p className="tb-body">
                <span className="tb-label mb-0.5 block md:hidden">In the app</span>
                {row.app}
              </p>
              <p className="text-sm leading-5 text-tb-ink">
                <span className="tb-label mb-0.5 block md:hidden">With Claude</span>
                {row.claude}
              </p>
            </li>
          ))}
        </ol>
        <p className="flex items-start gap-2 border-t border-tb-ink/[0.07] px-5 py-3 text-[13px] text-tb-ink-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tb-ink-3" />
          Claude prepares email and SMS. For WhatsApp and AI calls, keep using the steps in the guide above.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Connect */}
        <div className="tb-card p-5">
          <h3 className="tb-h2">Connect in 3 steps</h3>
          <ol className="mt-4 space-y-4">
            {CONNECT.map((step, i) => (
              <li key={step.title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                <span className="tb-btn-primary grid h-7 w-7 place-items-center rounded-full p-0 text-[12px] font-bold">{i + 1}</span>
                <div className="min-w-0">
                  <p className="tb-h3">{step.title}</p>
                  <p className="tb-body mt-0.5">{step.text}</p>
                  {i === 0 ? (
                    <div className="mt-2">
                      <CodeBlock text={address} />
                      {localOnly ? (
                        <p className="tb-meta mt-1.5">
                          This is the address on this computer. Claude connectors need the hosted https address.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
          <Link
            to="/dashboard/settings#claude-access"
            className="mt-4 inline-flex items-center gap-1.5 border-t border-tb-ink/[0.07] pt-3 text-[13px] font-medium text-tb-accent hover:underline"
          >
            <KeyRound className="h-3.5 w-3.5" />
            Using Claude Code? Create an access token
          </Link>
        </div>

        {/* What to ask */}
        <div className="tb-card p-5">
          <h3 className="tb-h2">Try asking</h3>
          <ul className="mt-3 space-y-2">
            {EXAMPLES.map((example) => (
              <ExampleRow key={example.label} {...example} />
            ))}
          </ul>
        </div>
      </div>

      {/* Control */}
      <div>
        <h3 className="tb-h2 mb-3">You stay in control</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CONTROL.map(({ title, text, icon: Icon, to, link }) => (
            <Link key={title} to={to} className="tb-card-link group flex flex-col p-4 no-underline">
              <Icon className="h-4 w-4 text-tb-accent" />
              <span className="tb-h3 mt-2.5">{title}</span>
              <span className="tb-meta mt-1 flex-1">{text}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-tb-accent">
                {link}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ExampleRow({ label, icon: Icon, text }: { label: string; icon: LucideIcon; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <li className="tb-well flex items-start gap-3 px-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-tb-ink-3" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-tb-ink">{label}</p>
        <p className="mt-0.5 text-[13px] leading-[18px] text-tb-ink-2">“{text}”</p>
      </div>
      <button
        type="button"
        aria-label={`Copy: ${label}`}
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[12.5px] font-medium text-tb-accent hover:bg-tb-ink/[0.05]"
        onClick={async () => {
          await copyText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </li>
  );
}
