import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE_CLASS, type StatusLook, type Tone } from "@/lib/harness/labels";

/**
 * Small building blocks for the AI harness screens (AI Tasks, Review Queue,
 * Activity Log, and the harness parts of Dashboard, Leads and Settings).
 * They use the app's steel theme tokens only.
 */

export function PageHead({
  title,
  sub,
  icon: Icon,
  actions,
}: {
  title: string;
  sub: string;
  icon: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0 max-w-3xl">
        <p className="font-landing-mono text-[11px] uppercase tracking-[0.18em] text-landing-sky">AI Harness</p>
        <h2 className="mt-1 flex items-center gap-2 font-landing-display text-[clamp(26px,3vw,34px)] font-bold leading-tight tracking-[-0.02em] text-landing-fog">
          <Icon className="h-7 w-7 text-landing-sky" />
          {title}
        </h2>
        <p className="mt-1 text-sm text-landing-fog/55">{sub}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Chip({
  tone = "mute",
  icon: Icon,
  children,
  className,
  title,
}: {
  tone?: Tone;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11.5px] font-medium",
        TONE_CLASS[tone].chip,
        className,
      )}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {children}
    </span>
  );
}

export function StatusChip({ look, className }: { look: StatusLook; className?: string }) {
  return (
    <Chip tone={look.tone} icon={look.icon} className={className}>
      {look.label}
    </Chip>
  );
}

export function IconCircle({ tone, icon: Icon, size = "md" }: { tone: Tone; icon: LucideIcon; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        TONE_CLASS[tone].bg,
        TONE_CLASS[tone].text,
        size === "sm" ? "h-7 w-7" : "h-9 w-9",
      )}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </span>
  );
}

/** A tinted message box: warning, problem, good news, or Claude's own words. */
export function NoteBox({
  tone,
  icon: Icon,
  children,
  className,
}: {
  tone: Tone;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm text-landing-fog/85",
        TONE_CLASS[tone].border,
        TONE_CLASS[tone].bg.replace("/15", "/[0.07]"),
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", TONE_CLASS[tone].text)} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-2xl border border-landing-line bg-landing-steel-2", className)}>
      {children}
    </div>
  );
}

export function PanelHead({ title, icon: Icon, right }: { title: string; icon?: LucideIcon; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-landing-line bg-landing-fog/[0.03] px-4 py-3">
      {Icon ? <Icon className="h-4 w-4 text-landing-sky" /> : null}
      <h3 className="font-landing-display font-bold text-landing-fog">{title}</h3>
      {right ? <div className="ml-auto flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function Empty({ icon: Icon, tone = "mute", children }: { icon: LucideIcon; tone?: Tone; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-landing-fog/55">
      <IconCircle tone={tone} icon={Icon} />
      <div>{children}</div>
    </div>
  );
}

/** Number card. Clickable when `onClick` or `to` is given. */
export function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  tone,
  active,
  onClick,
  to,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: LucideIcon;
  tone: Tone;
  active?: boolean;
  onClick?: () => void;
  to?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-landing-mono text-[10.5px] uppercase tracking-[0.1em] text-landing-fog/50">{label}</span>
        <Icon className={cn("h-4 w-4", TONE_CLASS[tone].text)} />
      </div>
      <div className="mt-1 font-landing-display text-[28px] font-bold leading-none text-landing-fog">{value}</div>
      {hint ? <div className="mt-1 text-xs text-landing-fog/50">{hint}</div> : null}
    </>
  );
  const cls = cn(
    "block rounded-xl border bg-landing-steel-2 p-3.5 text-left transition-colors hover:bg-landing-fog/[0.04]",
    active ? cn(TONE_CLASS[tone].border, "ring-1 ring-inset", TONE_CLASS[tone].border.replace("border-", "ring-")) : "border-landing-line",
  );
  if (to) return <Link to={to} className={cls}>{body}</Link>;
  return (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

/** "Claude prepares, you release." Shown at the top of the harness screens. */
export function SafetyBanner({ mock = false }: { mock?: boolean }) {
  return (
    <Link
      to="/dashboard/settings#claude-safety"
      className="flex items-center gap-3 rounded-xl border border-landing-whatsapp/30 bg-landing-whatsapp/[0.06] px-4 py-3 text-sm transition-colors hover:bg-landing-whatsapp/10"
    >
      <IconCircle tone="ok" icon={ShieldCheck} />
      <div className="min-w-0 flex-1 text-landing-fog/80">
        <b className="text-landing-fog">Claude prepares, you release.</b>{" "}
        Claude can find leads and write drafts, but it cannot send or switch anything on.
        {mock ? " On this computer messages are recorded as mock sends, so nothing reaches a real person." : null}
      </div>
      <span className="hidden items-center gap-1 text-landing-sky sm:inline-flex">
        Why it is safe <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

export const primaryBtn = "gap-2 bg-landing-sky font-semibold text-landing-steel hover:bg-landing-sky-deep";
export const outlineBtn = "gap-2 border-landing-line bg-transparent text-landing-fog hover:bg-landing-fog/5 hover:text-landing-fog";
export const dangerBtn = "gap-2 border-landing-voice/40 bg-transparent text-landing-voice hover:bg-landing-voice/10 hover:text-landing-voice";
