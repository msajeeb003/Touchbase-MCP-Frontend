import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { btnDanger, btnPrimary, btnQuiet, glassCard } from "@/lib/ds";
import { useGetSettingsQuery } from "@/store/features/settings/settingsApi";
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
  sub?: string;
  icon: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0 max-w-3xl">
        <h2 className="tb-title flex items-center gap-2.5">
          <Icon className="h-6 w-6 text-tb-accent" />
          {title}
        </h2>
        {sub ? <p className="tb-body mt-1.5">{sub}</p> : null}
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
    <div className={cn("min-w-0 overflow-hidden", glassCard, className)}>
      {children}
    </div>
  );
}

export function PanelHead({ title, icon: Icon, right }: { title: string; icon?: LucideIcon; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-tb-ink/[0.07] px-4 py-3">
      {Icon ? <Icon className="h-4 w-4 text-tb-accent" /> : null}
      <h3 className="tb-h3">{title}</h3>
      {right ? <div className="ml-auto flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function Empty({ icon: Icon, tone = "mute", children }: { icon: LucideIcon; tone?: Tone; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-tb-ink-3">
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
        <span className="tb-label">{label}</span>
        <Icon className={cn("h-4 w-4", TONE_CLASS[tone].text)} />
      </div>
      <div className="tb-num mt-2 text-[28px]">{value}</div>
      {hint ? <div className="tb-meta mt-1">{hint}</div> : null}
    </>
  );
  const cls = cn(
    "tb-card-link p-4 text-left",
    active ? cn("ring-2 ring-inset", TONE_CLASS[tone].border.replace("border-", "ring-")) : "",
  );
  if (to) return <Link to={to} className={cls}>{body}</Link>;
  return (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

const PERMISSION_LABELS = [
  ["claudeCanActivate", "activate"],
  ["claudeCanResume", "resume"],
  ["claudeCanEditSettings", "change settings"],
  ["claudeCanDeleteLeads", "delete leads"],
  ["claudeCanClearDoNotContact", "clear do-not-contact"],
] as const;

/**
 * What Claude may do in this workspace, in one line. Green while every Claude
 * permission is off (Claude drafts, you approve); amber once any is on.
 * Links to the settings that control it.
 */
export function SafetyBanner({ mock = false, className }: { mock?: boolean; className?: string }) {
  const { data } = useGetSettingsQuery();
  const settings = (data?.data ?? {}) as Record<string, unknown>;
  const allowed = PERMISSION_LABELS.filter(([key]) => Boolean(settings[key])).map(([, label]) => label);
  const open = allowed.length > 0;
  return (
    <Link
      to={open ? "/dashboard/settings#claude-permissions" : "/dashboard/settings#claude-safety"}
      title={mock ? "Mock mode: messages are recorded, nothing reaches a real person." : undefined}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12.5px] font-medium transition-colors",
        open
          ? "border-landing-sms/35 bg-landing-sms/[0.08] text-landing-sms hover:bg-landing-sms/[0.14]"
          : "border-landing-whatsapp/30 bg-landing-whatsapp/[0.07] text-landing-whatsapp hover:bg-landing-whatsapp/[0.13]",
        className,
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">
        {open ? `Claude can also ${allowed.join(", ")}` : "Claude drafts, you approve"}
        {mock ? " · mock mode" : ""}
      </span>
      <ChevronRight className="h-3 w-3 shrink-0 opacity-70" />
    </Link>
  );
}

export const primaryBtn = btnPrimary;
export const outlineBtn = btnQuiet;
export const dangerBtn = btnDanger;
