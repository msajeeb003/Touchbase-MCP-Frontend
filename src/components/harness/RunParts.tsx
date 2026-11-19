import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Inbox,
  Mail,
  RefreshCw,
  Send,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PHASES,
  TONE_CLASS,
  currentPhaseIndex,
  errorText,
  hm,
  sequenceLook,
  toolIcon,
  toolPhase,
  type Tone,
} from "@/lib/harness/labels";
import type { RunEvent, RunItem, RunSequence } from "@/types/harness";
import { Chip, Empty, IconCircle, StatusChip } from "./ui";

/** Six bars: which phases of the task are done, running, or hit a safety rule. */
export function RunStepper({
  run,
  events,
  compact = false,
}: {
  run: RunItem;
  events: RunEvent[];
  compact?: boolean;
}) {
  const working = run.status === "in_progress";
  const failed = run.status === "failed" || run.status === "abandoned";
  const last = currentPhaseIndex(events);

  return (
    <div className={cn("grid grid-cols-6 gap-1.5", compact ? "my-1" : "my-3")}>
      {PHASES.map((phase, idx) => {
        const here = events.filter((e) => toolPhase(e.tool) === phase.key);
        const refused = here.some((e) => !e.ok);
        let state: "done" | "active" | "todo" | "warn" | "bad" = "done";
        if (working) state = idx < last ? "done" : idx === last ? "active" : "todo";
        else if (failed) state = idx < last ? "done" : idx === last ? "bad" : "todo";
        if (state === "done" && refused) state = "warn";

        const bar =
          state === "done"
            ? TONE_CLASS.ok.bar
            : state === "active"
              ? cn(TONE_CLASS.claude.bar, "animate-pulse")
              : state === "warn"
                ? TONE_CLASS.warn.bar
                : state === "bad"
                  ? TONE_CLASS.bad.bar
                  : "bg-landing-fog/10";
        const Icon = phase.icon;
        return (
          <div key={phase.key} className="min-w-0" title={phase.label}>
            <div className={cn("h-1.5 rounded-full", bar)} />
            {!compact ? (
              <div
                className={cn(
                  "mt-1.5 hidden items-center gap-1 truncate text-[11.5px] md:flex",
                  state === "todo" ? "text-landing-fog/35" : "text-landing-fog/70",
                )}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span className="truncate">{phase.label}</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** "What Claude did": one row per tool call, in plain words. */
export function RunTimeline({ run, events }: { run: RunItem; events: RunEvent[] }) {
  if (!events.length) {
    return (
      <Empty icon={RefreshCw} tone="claude">
        Waiting for Claude's first step…
      </Empty>
    );
  }
  const working = run.status === "in_progress";
  const t0 = new Date(events[0].at).getTime();

  return (
    <ol className="relative mt-3 space-y-1">
      {events.map((e, idx) => {
        const tone: Tone = !e.ok
          ? "warn"
          : e.tool === "finish_run"
            ? "ok"
            : e.tool === "request_approval"
              ? "blue"
              : "claude";
        const Icon = !e.ok ? ShieldAlert : toolIcon(e.tool);
        const leads = e.touched.filter((t) => t.type === "lead");
        const seqs = e.touched.filter((t) => t.type === "sequence");
        const isLast = idx === events.length - 1;
        return (
          <li
            key={e.seq}
            className={cn(
              "flex gap-3 rounded-xl px-2 py-2",
              !e.ok && "border border-landing-sms/30 bg-landing-sms/[0.06]",
              working && isLast && "bg-landing-violet/[0.06]",
            )}
          >
            <IconCircle tone={tone} icon={Icon} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-landing-fog">
                <span className="min-w-0 break-words">{e.summary}</span>
                {!e.ok ? (
                  <Chip tone="warn" icon={ShieldCheck}>
                    Safety rule
                  </Chip>
                ) : null}
              </div>
              {!e.ok ? (
                <div className="mt-0.5 text-[12.5px] text-landing-fog/60">
                  Stopped: {errorText(e.error_code)}. Nothing was changed by this step.
                </div>
              ) : null}
              {leads.length || seqs.length ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {leads.slice(0, 8).map((t) => (
                    <Link
                      key={`l-${t.id}`}
                      to={`/dashboard/leads/${t.id}/transcripts`}
                      className="inline-flex items-center gap-1 rounded-full border border-landing-line px-2 py-0.5 text-[11.5px] text-landing-fog/75 hover:border-landing-sky/50 hover:text-landing-sky"
                    >
                      <UserRound className="h-3 w-3" />
                      {t.label || "Lead"}
                    </Link>
                  ))}
                  {seqs.slice(0, 8).map((t) => (
                    <Link
                      key={`s-${t.id}`}
                      to={`/dashboard/review/${t.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-landing-line px-2 py-0.5 text-[11.5px] text-landing-fog/75 hover:border-landing-sky/50 hover:text-landing-sky"
                    >
                      <Mail className="h-3 w-3" />
                      {t.label || "Open draft"}
                    </Link>
                  ))}
                  {leads.length + seqs.length > 16 ? (
                    <span className="text-[11.5px] text-landing-fog/45">
                      +{leads.length + seqs.length - 16} more
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="shrink-0 text-right font-landing-mono text-[11px] leading-tight text-landing-fog/45">
              {hm(e.at)}
              <br />
              <span className="hidden sm:inline">+{Math.round((new Date(e.at).getTime() - t0) / 1000)}s</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** For developers: each row is one MCP tool call, as stored in agent_run_events. */
export function RunTechLog({ events }: { events: RunEvent[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div className="mt-3">
      <p className="mb-2 text-[12.5px] text-landing-fog/55">
        For developers: each row is one MCP tool call Claude made, as recorded in{" "}
        <span className="font-landing-mono">agent_run_events</span>. Click a row to see the stored record.
      </p>
      <div className="overflow-x-auto rounded-xl border border-landing-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-landing-line text-left font-landing-mono text-[10.5px] uppercase tracking-[0.1em] text-landing-fog/45">
              <th className="px-3 py-2 font-normal">#</th>
              <th className="px-3 py-2 font-normal">Tool</th>
              <th className="px-3 py-2 font-normal">Result</th>
              <th className="hidden px-3 py-2 font-normal sm:table-cell">Time</th>
              <th className="hidden px-3 py-2 font-normal sm:table-cell">ms</th>
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
      <tr className="cursor-pointer border-b border-landing-line last:border-0 hover:bg-landing-fog/[0.03]" onClick={onToggle}>
        <td className="px-3 py-2 font-landing-mono text-[12px] text-landing-fog/45">{e.seq}</td>
        <td className="px-3 py-2 font-landing-mono text-[12.5px] text-landing-fog/85">
          <span className="inline-flex items-center gap-1">
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {e.tool}
          </span>
        </td>
        <td className="px-3 py-2">{e.ok ? <Chip tone="ok">ok</Chip> : <Chip tone="warn">{e.error_code ?? "error"}</Chip>}</td>
        <td className="hidden px-3 py-2 font-landing-mono text-[12px] text-landing-fog/45 sm:table-cell">{hm(e.at)}</td>
        <td className="hidden px-3 py-2 font-landing-mono text-[12px] text-landing-fog/45 sm:table-cell">{e.duration_ms ?? "–"}</td>
      </tr>
      {open ? (
        <tr className="border-b border-landing-line">
          <td colSpan={5} className="p-0">
            <pre className="max-h-72 overflow-auto bg-landing-steel px-4 py-3 font-landing-mono text-[11.5px] leading-relaxed text-landing-fog/75">
              {JSON.stringify(e, null, 2)}
            </pre>
          </td>
        </tr>
      ) : null}
    </>
  );
}

/** The drafts a task made, with where each one stands. */
export function RunDrafts({ sequences }: { sequences: RunSequence[] }) {
  if (!sequences.length) {
    return (
      <Empty icon={Mail}>No follow-ups were made in this task.</Empty>
    );
  }
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-landing-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-landing-line text-left font-landing-mono text-[10.5px] uppercase tracking-[0.1em] text-landing-fog/45">
            <th className="px-3 py-2 font-normal">Lead</th>
            <th className="hidden px-3 py-2 font-normal sm:table-cell">Based on</th>
            <th className="px-3 py-2 font-normal">Status</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {sequences.map((s) => {
            const t = s.steps.find((st) => st.based_on.kind === "transcript")?.based_on.transcripts[0];
            return (
              <tr key={s.sequence_id} className="border-b border-landing-line last:border-0 hover:bg-landing-fog/[0.03]">
                <td className="px-3 py-2">
                  <Link to={`/dashboard/review/${s.sequence_id}`} className="block">
                    <b className="font-medium text-landing-fog">{s.lead.untrusted.name}</b>
                    <div className="text-xs text-landing-fog/50">{s.lead.untrusted.company || "—"}</div>
                  </Link>
                </td>
                <td className="hidden px-3 py-2 sm:table-cell">
                  {s.no_call_transcript ? (
                    <Chip tone="warn" icon={BookOpen}>No call transcript</Chip>
                  ) : t ? (
                    <Chip tone="blue" icon={BookOpen}>Call of {t.meeting_date}</Chip>
                  ) : (
                    <span className="text-xs text-landing-fog/45">Not stated</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <StatusChip look={sequenceLook(s)} />
                </td>
                <td className="px-3 py-2 text-right">
                  <Link to={`/dashboard/review/${s.sequence_id}`} className="text-landing-fog/45 hover:text-landing-sky">
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

/** How an instruction travels: you, Claude, the MCP server, the rules, the queue, the send. */
export function FlowStrip() {
  const nodes: { where: string; title: string; text: string; icon: typeof Sparkles; tone: Tone }[] = [
    { where: "In Claude", title: "You type an instruction", text: "In the Claude desktop app or Claude Code", icon: UserRound, tone: "blue" },
    { where: "Claude", title: "Claude plans the work", text: "Chooses which Touchbase tools to use", icon: Sparkles, tone: "claude" },
    { where: "Touchbase", title: "Touchbase MCP server", text: "37 tools. Checks your access on every call", icon: Server, tone: "claude" },
    { where: "Touchbase", title: "Safety rules", text: "Read the call first, no placeholders, do-not-contact, email and SMS only", icon: ShieldCheck, tone: "warn" },
    { where: "This app", title: "Review Queue", text: "Drafts wait for you. Edit, approve or reject", icon: Inbox, tone: "blue" },
    { where: "This app", title: "Sent in your send window", text: "Only inside your hours. Never twice", icon: Send, tone: "ok" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {nodes.map((n, i) => (
        <div key={n.title} className="relative rounded-xl border border-landing-line bg-landing-steel-2 p-3">
          <div className="flex items-center justify-between">
            <IconCircle tone={n.tone} icon={n.icon} size="sm" />
            <span className="font-landing-mono text-[9.5px] uppercase tracking-[0.12em] text-landing-fog/40">{n.where}</span>
          </div>
          <div className="mt-2 text-[13px] font-semibold text-landing-fog">
            {i + 1}. {n.title}
          </div>
          <div className="mt-0.5 text-[12px] leading-snug text-landing-fog/55">{n.text}</div>
        </div>
      ))}
    </div>
  );
}

export function RunCountsRow({ run, events }: { run: RunItem; events: RunEvent[] }) {
  const c = run.counts;
  const items: [string, number, typeof Sparkles][] = [
    ["Tool calls", events.length, Sparkles],
    ["Follow-ups made", c?.sequences ?? 0, Mail],
    ["Waiting for you", c?.awaiting_approval ?? 0, Clock],
    ["No call transcript", c?.drafts_with_no_call_transcript ?? 0, BookOpen],
    ["Stopped by a rule", events.filter((e) => !e.ok).length, ShieldAlert],
    ["Messages sent", c?.steps_sent ?? 0, Send],
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-6">
      {items.map(([k, v, Icon]) => (
        <div key={k} className="rounded-xl border border-landing-line bg-landing-steel px-3 py-2">
          <div className="flex items-center gap-1.5 text-landing-fog/50">
            <Icon className="h-3 w-3" />
            <span className="font-landing-mono text-[9.5px] uppercase leading-tight tracking-[0.08em]">{k}</span>
          </div>
          <div className="mt-0.5 font-landing-display text-xl font-bold text-landing-fog">{v}</div>
        </div>
      ))}
    </div>
  );
}
