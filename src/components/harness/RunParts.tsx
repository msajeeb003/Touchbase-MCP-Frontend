import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PHASES, currentPhaseIndex, errorText, hm, sequenceLook, toolIcon, toolPhase } from "@/lib/harness/labels";
import type { RunEvent, RunItem, RunSequence } from "@/types/harness";
import { StatusChip } from "./ui";

/*
 * Building blocks of the AI Tasks page (spec: AI-Tasks-Redesign-Spec.html).
 * One accent for selection, primary actions and the current stage; amber only
 * for "needs you"; red only for failure. Done states stay neutral.
 */

// ── Task state ────────────────────────────────────────────────────────

type RunState = "live" | "wait" | "fail" | "mute" | "done";

/** One state per task, used the same way in the list, the chip and the stages. */
function runState(run: RunItem): RunState {
  if (run.status === "in_progress") return "live";
  if ((run.counts?.awaiting_approval ?? 0) > 0) return "wait";
  if (run.status === "failed") return "fail";
  if (run.status === "abandoned") return "mute";
  return "done";
}

const STATE_LOOK: Record<RunState, { label: string; icon: LucideIcon; chip: string; dot: string }> = {
  live: {
    label: "Claude is working",
    icon: Sparkles,
    chip: "bg-tb-accent/10 text-tb-accent ring-tb-accent/30",
    dot: "bg-tb-accent animate-pulse",
  },
  wait: {
    label: "Waiting for you",
    icon: Clock,
    chip: "bg-landing-sms/10 text-landing-sms ring-landing-sms/35",
    dot: "bg-landing-sms",
  },
  fail: {
    label: "Failed",
    icon: X,
    chip: "bg-landing-voice/10 text-landing-voice ring-landing-voice/35",
    dot: "bg-landing-voice",
  },
  mute: {
    label: "Left unfinished",
    icon: X,
    chip: "bg-tb-ink/[0.05] text-tb-ink-3 ring-tb-ink/15",
    dot: "bg-tb-ink-3/60",
  },
  done: {
    label: "Done",
    icon: Check,
    chip: "bg-tb-ink/[0.05] text-tb-ink-2 ring-tb-ink/15",
    dot: "bg-tb-ink-3",
  },
};

export function RunStateChip({ run, className }: { run: RunItem; className?: string }) {
  const look = STATE_LOOK[runState(run)];
  const Icon = look.icon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        look.chip,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {look.label}
    </span>
  );
}

export function RunStateDot({ run }: { run: RunItem }) {
  const look = STATE_LOOK[runState(run)];
  return <span className={cn("mt-[7px] h-2 w-2 shrink-0 rounded-full", look.dot)} role="img" aria-label={look.label} />;
}

// ── Stages ────────────────────────────────────────────────────────────

type StageState = "done" | "skip" | "cur" | "todo" | "need" | "bad";

const STAGE_WORD: Record<StageState, string> = {
  done: "completed",
  skip: "not needed in this task",
  cur: "in progress",
  todo: "pending",
  need: "needs your approval",
  bad: "stopped here",
};

/**
 * Six stages as nodes. A finished task shows a stage as completed only when it
 * has events; otherwise "not needed". Running: current and pending. Waiting
 * drafts: "Asked for approval" needs you. Failed: the stage it stopped in.
 */
export function RunStepper({ run, events }: { run: RunItem; events: RunEvent[] }) {
  const state = runState(run);
  const last = currentPhaseIndex(events);

  return (
    <ol aria-label="Progress" className="grid grid-cols-1 gap-2.5 md:grid-cols-6 md:gap-0">
      {PHASES.map((phase, idx) => {
        const here = events.filter((e) => toolPhase(e.tool) === phase.key);
        const refused = here.filter((e) => !e.ok).length;
        const ran = here.length > 0 || (phase.key === "done" && run.status !== "in_progress" && !!run.finished_at);

        let s: StageState = ran ? "done" : "skip";
        if (state === "live") s = idx < last ? (ran ? "done" : "skip") : idx === last ? "cur" : "todo";
        else if (state === "fail" || state === "mute") s = idx < last ? (ran ? "done" : "skip") : idx === last ? "bad" : "todo";
        else if (state === "wait" && phase.key === "ask") s = "need";

        const node = {
          done: "border-tb-ink-2 bg-tb-ink-2 text-[rgb(var(--tb-surface-strong))]",
          skip: "border-dashed border-tb-ink/25",
          cur: "border-tb-accent text-tb-accent ring-4 ring-tb-accent/10",
          todo: "border-tb-ink/20",
          need: "border-landing-sms bg-landing-sms text-[rgb(var(--tb-surface-strong))]",
          bad: "border-landing-voice bg-landing-voice text-[rgb(var(--tb-surface-strong))]",
        }[s];
        const label = {
          done: "text-tb-ink-2",
          skip: "text-tb-ink-3",
          cur: "font-semibold text-tb-accent",
          todo: "text-tb-ink-3",
          need: "font-semibold text-landing-sms",
          bad: "font-semibold text-landing-voice",
        }[s];

        return (
          <li key={phase.key} className="relative flex min-w-0 items-center gap-2.5 md:flex-col md:items-start md:gap-2 md:pr-2">
            {idx < PHASES.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute right-0.5 top-[9px] hidden h-[1.5px] md:left-[24px] md:block",
                  s === "done" ? "bg-tb-ink-3" : "bg-tb-ink/15",
                )}
              />
            ) : null}
            <span
              className={cn(
                "relative z-[1] grid h-5 w-5 shrink-0 place-items-center rounded-full border-[1.5px] bg-[rgb(var(--tb-surface-strong))]",
                node,
              )}
            >
              {s === "done" ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
              {s === "need" ? <Clock className="h-3 w-3" strokeWidth={3} /> : null}
              {s === "bad" ? <X className="h-3 w-3" strokeWidth={3} /> : null}
              {s === "cur" ? <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-tb-accent" /> : null}
            </span>
            <span className={cn("min-w-0 text-xs leading-tight", label)}>
              {phase.label}
              <span className="sr-only">: {STAGE_WORD[s]}</span>
              {refused ? (
                <span className="block pt-0.5 text-[11px] font-medium text-landing-sms">
                  {refused} stopped by a rule
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// ── Key numbers ───────────────────────────────────────────────────────

/** The task's numbers on one line. Zeros fade; risks above zero turn amber and lead. */
export function RunCountsRow({ run, events }: { run: RunItem; events: RunEvent[] }) {
  const c = run.counts;
  const items: { label: string; value: number; risk?: boolean }[] = [
    { label: "tool calls", value: events.length },
    { label: "follow-ups made", value: c?.sequences ?? 0 },
    { label: "waiting for you", value: c?.awaiting_approval ?? 0 },
    { label: "no call transcript", value: c?.drafts_with_no_call_transcript ?? 0, risk: true },
    { label: "stopped by a rule", value: events.filter((e) => !e.ok).length, risk: true },
    { label: "messages sent", value: c?.steps_sent ?? 0 },
  ];
  const ordered = [...items].sort((a, b) => Number(!!b.risk && b.value > 0) - Number(!!a.risk && a.value > 0));
  return (
    <p className="flex flex-wrap gap-y-1 text-[13px] text-tb-ink-3">
      {ordered.map((it, i) => {
        const warn = it.risk && it.value > 0;
        return (
          <span
            key={it.label}
            className={cn(
              i < ordered.length - 1 && "mr-3.5 border-r border-tb-ink/[0.12] pr-3.5",
              warn && "text-landing-sms",
            )}
          >
            <b className={cn("mr-1 tabular-nums", it.value ? "font-semibold" : "font-medium", warn ? "text-landing-sms" : it.value ? "text-tb-ink" : "text-tb-ink-3")}>
              {it.value}
            </b>
            {it.label}
          </span>
        );
      })}
    </p>
  );
}

// ── What Claude did ───────────────────────────────────────────────────

/** One quiet row per tool call: what happened, what it touched, when. */
export function RunTimeline({ run, events }: { run: RunItem; events: RunEvent[] }) {
  if (!events.length) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-tb-ink-3">
        <RefreshCw className="h-4 w-4 animate-spin text-tb-accent" />
        Waiting for Claude's first step…
      </div>
    );
  }
  const working = run.status === "in_progress";
  const t0 = new Date(events[0].at).getTime();

  return (
    <ol className="divide-y divide-tb-ink/[0.07] pt-1">
      {events.map((e, idx) => {
        const Icon = !e.ok ? ShieldAlert : toolIcon(e.tool);
        const leads = e.touched.filter((t) => t.type === "lead");
        const seqs = e.touched.filter((t) => t.type === "sequence");
        const isLast = idx === events.length - 1;
        return (
          <li key={e.seq} className="grid grid-cols-[22px_minmax(0,1fr)_auto] gap-3 py-2.5">
            <span
              className={cn(
                "mt-px grid h-[22px] w-[22px] place-items-center rounded-full",
                !e.ok ? "bg-landing-sms/10 text-landing-sms" : "bg-tb-ink/[0.05] text-tb-ink-3",
                working && isLast && "bg-tb-accent/10 text-tb-accent",
              )}
            >
              <Icon className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <p className="break-words text-sm text-tb-ink">
                {e.summary}
                {working && isLast ? <span className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-tb-accent align-middle" /> : null}
              </p>
              {!e.ok ? (
                <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-landing-sms">
                  <ShieldCheck className="h-3 w-3 shrink-0" />
                  Stopped by a safety rule: {errorText(e.error_code)}. Nothing was changed by this step.
                </p>
              ) : null}
              {leads.length || seqs.length ? (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  {leads.slice(0, 8).map((t) => (
                    <Link
                      key={`l-${t.id}`}
                      to={`/dashboard/leads/${t.id}/transcripts`}
                      className="inline-flex items-center gap-1 text-[12.5px] text-tb-accent hover:underline"
                    >
                      <UserRound className="h-3 w-3" />
                      {t.label || "Lead"}
                    </Link>
                  ))}
                  {seqs.slice(0, 8).map((t) => (
                    <Link
                      key={`s-${t.id}`}
                      to={`/dashboard/review/${t.id}`}
                      className="inline-flex items-center gap-1 text-[12.5px] text-tb-accent hover:underline"
                    >
                      <Mail className="h-3 w-3" />
                      {t.label || "Open draft"}
                    </Link>
                  ))}
                  {leads.length + seqs.length > 16 ? (
                    <span className="text-[12.5px] text-tb-ink-3">+{leads.length + seqs.length - 16} more</span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="text-right font-landing-mono text-[11.5px] leading-snug tabular-nums text-tb-ink-3/80">
              {hm(e.at)}
              <br />
              <span className="text-tb-ink-3">+{Math.round((new Date(e.at).getTime() - t0) / 1000)}s</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ── Technical log ─────────────────────────────────────────────────────

/** For developers: each row is one MCP tool call, as stored in agent_run_events. */
export function RunTechLog({ events }: { events: RunEvent[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div className="pt-3">
      <p className="mb-2 text-[12.5px] text-tb-ink-3">
        One row per MCP tool call, as stored in <span className="font-landing-mono">agent_run_events</span>. Click a row
        to see the record.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-tb-ink/[0.07] text-left font-landing-mono text-[10.5px] uppercase tracking-[0.1em] text-tb-ink-3">
              <th className="px-2 py-2 font-normal">#</th>
              <th className="px-2 py-2 font-normal">Tool</th>
              <th className="px-2 py-2 font-normal">Result</th>
              <th className="hidden px-2 py-2 font-normal sm:table-cell">Time</th>
              <th className="hidden px-2 py-2 font-normal sm:table-cell">ms</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <FragmentRow key={e.seq} e={e} open={!!open[e.seq]} onToggle={() => setOpen((o) => ({ ...o, [e.seq]: !o[e.seq] }))} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FragmentRow({ e, open, onToggle }: { e: RunEvent; open: boolean; onToggle: () => void }) {
  return (
    <>
      <tr
        className="cursor-pointer border-b border-tb-ink/[0.07] last:border-0 hover:bg-tb-ink/[0.03]"
        onClick={onToggle}
        aria-expanded={open}
      >
        <td className="px-2 py-2 font-landing-mono text-[12px] text-tb-ink-3">{e.seq}</td>
        <td className="px-2 py-2 font-landing-mono text-[12.5px] text-tb-ink">
          <span className="inline-flex items-center gap-1">
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {e.tool}
          </span>
        </td>
        <td className="px-2 py-2 font-landing-mono text-[12px]">
          {e.ok ? <span className="text-tb-ink-3">ok</span> : <span className="text-landing-sms">{e.error_code ?? "error"}</span>}
        </td>
        <td className="hidden px-2 py-2 font-landing-mono text-[12px] text-tb-ink-3 sm:table-cell">{hm(e.at)}</td>
        <td className="hidden px-2 py-2 font-landing-mono text-[12px] text-tb-ink-3 sm:table-cell">{e.duration_ms ?? "–"}</td>
      </tr>
      {open ? (
        <tr className="border-b border-tb-ink/[0.07]">
          <td colSpan={5} className="p-0">
            <pre className="max-h-72 overflow-auto bg-tb-ink/[0.03] px-4 py-3 font-landing-mono text-[11.5px] leading-relaxed text-tb-ink-2">
              {JSON.stringify(e, null, 2)}
            </pre>
          </td>
        </tr>
      ) : null}
    </>
  );
}

// ── Follow-ups ────────────────────────────────────────────────────────

/** The drafts a task made, with where each one stands. */
export function RunDrafts({ sequences }: { sequences: RunSequence[] }) {
  if (!sequences.length) {
    return <p className="py-8 text-center text-sm text-tb-ink-3">No follow-ups were made in this task.</p>;
  }
  return (
    <div className="overflow-x-auto pt-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-tb-ink/[0.07] text-left font-landing-mono text-[10.5px] uppercase tracking-[0.1em] text-tb-ink-3">
            <th className="px-2 py-2 font-normal">Lead</th>
            <th className="hidden px-2 py-2 font-normal sm:table-cell">Based on</th>
            <th className="px-2 py-2 font-normal">Status</th>
            <th className="px-2 py-2" />
          </tr>
        </thead>
        <tbody>
          {sequences.map((s) => {
            const t = s.steps.find((st) => st.based_on.kind === "transcript")?.based_on.transcripts[0];
            return (
              <tr key={s.sequence_id} className="border-b border-tb-ink/[0.07] last:border-0 hover:bg-tb-ink/[0.03]">
                <td className="px-2 py-2.5">
                  <Link to={`/dashboard/review/${s.sequence_id}`} className="block">
                    <span className="font-medium text-tb-ink">{s.lead.untrusted.name}</span>
                    <span className="block text-xs text-tb-ink-3">{s.lead.untrusted.company || "—"}</span>
                  </Link>
                </td>
                <td className="hidden px-2 py-2.5 sm:table-cell">
                  {s.no_call_transcript ? (
                    <span className="inline-flex items-center gap-1 text-[12.5px] text-landing-sms">
                      <BookOpen className="h-3 w-3" />
                      No call transcript
                    </span>
                  ) : t ? (
                    <span className="inline-flex items-center gap-1 text-[12.5px] text-tb-ink-2">
                      <BookOpen className="h-3 w-3" />
                      Call of {t.meeting_date}
                    </span>
                  ) : (
                    <span className="text-xs text-tb-ink-3">Not stated</span>
                  )}
                </td>
                <td className="px-2 py-2.5">
                  <StatusChip look={sequenceLook(s)} />
                </td>
                <td className="px-2 py-2.5 text-right">
                  <Link to={`/dashboard/review/${s.sequence_id}`} aria-label="Open in Review Queue" className="text-tb-ink-3 hover:text-tb-accent">
                    <ChevronRight className="inline h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── How tasks work ────────────────────────────────────────────────────

const FLOW: { title: string; text: string }[] = [
  { title: "You type an instruction", text: "In the Claude desktop app or Claude Code" },
  { title: "Claude plans the work", text: "Chooses which Touchbase tools to use" },
  { title: "Touchbase MCP server", text: "37 tools. Checks your access on every call" },
  { title: "Safety rules", text: "Read the call first, no placeholders, do-not-contact, email and SMS only" },
  { title: "Review Queue", text: "Drafts wait for you. Edit, approve or reject" },
  { title: "Sent in your send window", text: "Only inside your hours. Never twice" },
];
const REVIEW_STEP = 4;

/**
 * How an instruction travels, as one quiet line. The Review Queue step is
 * amber because it is the one you act on. "How tasks work" opens the details.
 */
export function FlowStrip({ defaultOpen = false, lead }: { defaultOpen?: boolean; lead?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[12.5px] text-tb-ink-3">
      {lead}
      <ol className="contents" aria-label="How tasks work">
        {FLOW.map((n, i) => (
          <li key={n.title} className="inline-flex items-center gap-1.5">
            {i === REVIEW_STEP ? (
              <Link to="/dashboard/review" className="inline-flex items-center gap-1.5 font-semibold text-landing-sms hover:underline">
                <StepNo n={i + 1} amber />
                <span className="hidden sm:inline">{n.title}</span>
              </Link>
            ) : (
              <>
                <StepNo n={i + 1} />
                <span className="hidden sm:inline">{n.title}</span>
              </>
            )}
            {i < FLOW.length - 1 ? <span aria-hidden className="text-tb-ink/30">→</span> : null}
          </li>
        ))}
      </ol>
      <details className="group w-full" open={defaultOpen}>
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-medium text-tb-accent [&::-webkit-details-marker]:hidden">
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
          How tasks work
        </summary>
        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6">
          {FLOW.map((n, i) => (
            <div key={n.title} className="tb-well px-3 py-2.5">
              <p className={cn("text-[13px] font-semibold", i === REVIEW_STEP ? "text-landing-sms" : "text-tb-ink")}>
                {i + 1}. {n.title}
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-tb-ink-3">{n.text}</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function StepNo({ n, amber = false }: { n: number; amber?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-[18px] w-[18px] place-items-center rounded-full border font-landing-mono text-[10.5px]",
        amber ? "border-landing-sms text-landing-sms" : "border-tb-ink/20 text-tb-ink-3",
      )}
    >
      {n}
    </span>
  );
}
