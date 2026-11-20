import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  History,
  Inbox,
  Info,
  MessageSquareReply,
  PauseCircle,
  PencilLine,
  Play,
  Search,
  Send,
  Server,
  Settings2,
  ShieldCheck,
  Trash2,
  Sparkles,
  StopCircle,
  UserRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { dayGroup, hm, rel, type Tone } from "@/lib/harness/labels";
import { useGetAllActivityQuery, useGetRunsQuery } from "@/store/features/harness/harnessApi";
import type { ActivityEvent, RunItem } from "@/types/harness";
import { ErrorBox, PageHead } from "@/components/harness/ui";
import { btnQuiet } from "@/lib/ds";

/*
 * Activity Log: a journal. Day headings that stay in view, times in a left
 * column, a thin rail of icon nodes, and who did it in words. The data,
 * filters, search, links and CSV export are unchanged.
 */

/** One row of the log, from a sequence event, a reply, or a Claude task. */
type Row = {
  key: string;
  at: string;
  actor: "claude" | "you" | "system" | "lead";
  type: string;
  text: string;
  to: string | null;
};

const TYPE_UI: Record<string, [LucideIcon, Tone]> = {
  task: [Sparkles, "claude"],
  task_done: [CheckCircle2, "claude"],
  created: [PencilLine, "claude"],
  approval_requested: [Inbox, "claude"],
  approved: [CheckCircle2, "ok"],
  edited: [PencilLine, "blue"],
  sent: [Send, "ok"],
  sending: [Send, "claude"],
  failed: [XCircle, "bad"],
  skipped: [Ban, "mute"],
  replied: [MessageSquareReply, "claude"],
  paused: [PauseCircle, "mute"],
  resumed: [Play, "blue"],
  stopped: [StopCircle, "bad"],
  completed: [CheckCircle2, "ok"],
  scheduled: [CalendarClock, "blue"],
  lead_deleted: [Trash2, "bad"],
  do_not_contact_cleared: [ShieldCheck, "warn"],
  settings_changed: [Settings2, "blue"],
};

const ACTOR: Record<Row["actor"], [string, Tone]> = {
  claude: ["Claude", "claude"],
  you: ["You", "blue"],
  system: ["Touchbase", "mute"],
  lead: ["Lead", "claude"],
};

const FILTERS: { key: string; label: string; match: (r: Row) => boolean }[] = [
  { key: "all", label: "Everything", match: () => true },
  { key: "claude", label: "Claude's work", match: (r) => r.actor === "claude" },
  { key: "you", label: "Your actions", match: (r) => r.actor === "you" },
  { key: "sent", label: "Sent", match: (r) => r.type === "sent" },
  { key: "replies", label: "Replies", match: (r) => r.type === "replied" || r.type === "paused" },
  { key: "problems", label: "Failed or stopped", match: (r) => ["failed", "stopped", "skipped"].includes(r.type) },
];

const channelWord = (c: string | null) => (c === "sms" ? "SMS" : c === "email" ? "email" : c ?? "message");

function describe(e: ActivityEvent): string {
  const name = e.untrusted.lead_name ?? "a lead";
  const step = e.step_number ? `step ${e.step_number}` : "a step";
  const d = e.untrusted_details as Record<string, unknown>;
  switch (e.type) {
    case "sent":
      return `${channelWord(e.channel)} ${step} to ${name} was sent${d.mode === "mock" || d.deliveryMode === "mock" ? " (mock)" : ""}`;
    case "failed":
      return `${channelWord(e.channel)} ${step} to ${name} failed${typeof d.reason === "string" ? `: ${d.reason}` : ""}`;
    case "skipped":
      return `${step} for ${name} was skipped`;
    case "replied":
      return e.channel === "sms"
        ? `${name} replied by SMS`
        : `${name} replied${typeof d.subject === "string" && d.subject ? `: “${d.subject}”` : ""}`;
    case "lead_deleted":
      return `${name} was deleted by Claude${typeof d.reason === "string" ? `: ${d.reason}` : ""} (restorable for 30 days)`;
    case "do_not_contact_cleared":
      return `Do-not-contact for ${name} was cleared by Claude${typeof d.reason === "string" ? `: ${d.reason}` : ""}`;
    case "settings_changed": {
      const fields = Array.isArray(d.changed_fields) ? (d.changed_fields as string[]).join(", ").replace(/_/g, " ") : "";
      return `Settings changed by Claude${fields ? `: ${fields}` : ""}`;
    }
    case "paused":
      return `Follow-up for ${name} paused`;
    case "resumed":
      return e.actor === "claude" ? `Follow-up for ${name} resumed by Claude` : `Follow-up for ${name} resumed`;
    case "stopped":
      return `Follow-up for ${name} was rejected or stopped`;
    case "approved":
      return e.actor === "claude"
        ? `Follow-up for ${name} activated by Claude and scheduled`
        : `Follow-up for ${name} approved and scheduled`;
    case "completed":
      return `Follow-up for ${name} finished`;
    case "created":
      return `Draft follow-up started for ${name}`;
    case "approval_requested":
      return `Draft for ${name} sent to the Review Queue`;
    case "sending":
      return `${channelWord(e.channel)} ${step} to ${name} is being sent`;
    case "edited":
      return e.step_number
        ? `${channelWord(e.channel)} ${step} of the follow-up for ${name} was written or edited`
        : `Follow-up for ${name} was changed`;
    default:
      return `Follow-up for ${name} changed`;
  }
}

const actorOf = (a: string): Row["actor"] =>
  a === "claude" ? "claude" : a === "user" ? "you" : a === "lead" ? "lead" : "system";

function fromRuns(runs: RunItem[]): Row[] {
  const rows: Row[] = [];
  for (const r of runs) {
    rows.push({
      key: `run-${r.run_id}`,
      at: r.started_at,
      actor: "claude",
      type: "task",
      text: `Claude started a task: “${r.instruction}”`,
      to: `/dashboard/ai-tasks/${r.run_id}`,
    });
    if (r.finished_at) {
      const c = r.counts;
      rows.push({
        key: `run-done-${r.run_id}`,
        at: r.finished_at,
        actor: "claude",
        type: "task_done",
        text: `Claude finished the task${c?.sequences ? `: ${c.sequences} follow-up${c.sequences > 1 ? "s" : ""} made, ${c.awaiting_approval} waiting for you` : ""}`,
        to: `/dashboard/ai-tasks/${r.run_id}`,
      });
    }
  }
  return rows;
}

const ACTOR_ICON: Record<Row["actor"], LucideIcon> = {
  claude: Sparkles,
  you: UserRound,
  system: Server,
  lead: MessageSquareReply,
};

export default function ActivityLogPage() {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [params, setParams] = useSearchParams();
  const since = useMemo(() => new Date(Date.now() - 30 * 86_400_000).toISOString(), []);
  const activity = useGetAllActivityQuery({ since }, { pollingInterval: 30000 });
  const runs = useGetRunsQuery({ limit: 50 });

  const rows = useMemo(() => {
    const events = activity.data?.events ?? [];
    const list: Row[] = events.map((e, i) => ({
      key: `a-${i}-${e.at}`,
      at: e.at,
      actor: actorOf(e.actor),
      type: e.type,
      text: (() => { const t = describe(e); return t.charAt(0).toUpperCase() + t.slice(1); })(),
      to: e.sequence_id
        ? `/dashboard/review/${e.sequence_id}`
        : e.type === "lead_deleted"
          ? "/dashboard/leads/deleted"
          : e.type === "settings_changed"
            ? "/dashboard/settings#claude-permissions"
            : e.lead_id
              ? `/dashboard/leads/${e.lead_id}/transcripts`
              : null,
    }));
    list.push(...fromRuns((runs.data?.data.items ?? []).filter((r) => r.started_at >= since)));
    return list.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  }, [activity.data, runs.data, since]);

  const f = FILTERS.find((x) => x.key === filter) ?? FILTERS[0];
  const shown = rows.filter(f.match).filter((r) => !q || r.text.toLowerCase().includes(q.toLowerCase()));
  // One day per page: page 1 is the newest day with activity, page 2 the day
  // before it, and so on. Days without activity are skipped.
  const days = Object.entries(
    shown.reduce<Record<string, Row[]>>((acc, r) => {
      (acc[dayGroup(r.at)] ??= []).push(r);
      return acc;
    }, {}),
  );
  const pageCount = days.length;
  const askedPage = Number(params.get("page")) || 1;
  const page = Math.min(Math.max(1, askedPage), Math.max(1, pageCount));
  const current = days[page - 1];
  const goTo = (n: number) => {
    const next = new URLSearchParams(params);
    if (n <= 1) next.delete("page");
    else next.set("page", String(n));
    setParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // A new search or filter starts again at the newest day.
  useEffect(() => {
    if (params.get("page")) {
      const next = new URLSearchParams(params);
      next.delete("page");
      setParams(next, { replace: true });
    }
    // Only when the search or filter changes, not when the page does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filter]);

  const exportCsv = () => {
    const lines = [["time", "who", "what"], ...shown.map((r) => [r.at, ACTOR[r.actor][0], r.text])];
    const csv = lines.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "touchbase-activity.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loading = activity.isLoading || runs.isLoading;
  const total = activity.data?.total ?? 0;
  const loaded = activity.data?.events.length ?? 0;

  return (
    <div className="mx-auto w-full min-w-0 max-w-[980px] space-y-5 font-landing-sans">
      <PageHead
        title="Activity Log"
        icon={History}
        sub="Last 30 days"
        actions={
          <Button variant="outline" className={btnQuiet} onClick={exportCsv} disabled={!shown.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {/* Search and filters on one line */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tb-ink-3" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the log"
            aria-label="Search the log"
            className="pl-9"
          />
        </div>
        <div role="group" aria-label="Filter the log" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 md:pb-0">
          {FILTERS.map((x) => {
            const on = filter === x.key;
            return (
              <button
                key={x.key}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(x.key)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--tb-accent))]",
                  on ? "bg-tb-ink text-[rgb(var(--tb-surface-strong))]" : "text-tb-ink-3 hover:bg-tb-ink/[0.05] hover:text-tb-ink",
                )}
              >
                {x.label}
                <span className={cn("font-landing-mono text-[11px] tabular-nums", on ? "opacity-80" : "")}>{rows.filter(x.match).length}</span>
              </button>
            );
          })}
        </div>
      </div>

      {(activity.data?.notes ?? []).map((n) => (
        <p key={n} className="flex items-start gap-2 text-[13px] text-tb-ink-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {n}
        </p>
      ))}

      {loading ? (
        <div className="tb-card space-y-3 p-5" role="status" aria-label="Loading the log">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="grid grid-cols-[48px_minmax(0,1fr)] gap-4">
              <div className="h-3 animate-pulse rounded bg-tb-ink/[0.06]" />
              <div className="h-3.5 animate-pulse rounded bg-tb-ink/[0.07]" style={{ width: `${55 + ((i * 13) % 35)}%` }} />
            </div>
          ))}
        </div>
      ) : activity.isError ? (
        <ErrorBox text="Could not load the activity log." onRetry={() => activity.refetch()} />
      ) : !shown.length ? (
        <div className="tb-card px-6 py-12 text-center">
          <p className="text-sm text-tb-ink">Nothing matches.</p>
          {q || filter !== "all" ? (
            <button
              type="button"
              className="mt-1 text-[13px] font-medium text-tb-accent hover:underline"
              onClick={() => {
                setQ("");
                setFilter("all");
              }}
            >
              Show everything
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {current ? [current].map(([day, list]) => (
            <section key={day} aria-label={day}>
              {/* Day heading stays in view while its events scroll */}
              <h2 className="sticky top-14 z-[5] -mx-1 mb-1 flex items-baseline gap-2 bg-[rgb(var(--tb-canvas)/0.85)] px-1 py-2 backdrop-blur-sm">
                <span className="font-landing-display text-[15px] font-bold text-tb-ink">{day}</span>
                <span className="text-[12px] text-tb-ink-3">
                  {list.length} event{list.length === 1 ? "" : "s"}
                </span>
              </h2>
              <ol className="tb-card px-2 py-1.5">
                {list.map((r, i) => {
                  const [Icon, tone] = TYPE_UI[r.type] ?? [History, "mute"];
                  const [who] = ACTOR[r.actor];
                  const WhoIcon = ACTOR_ICON[r.actor];
                  // Only problems and Claude's own tasks get colour; the rest stay neutral.
                  const node =
                    tone === "bad"
                      ? "bg-landing-voice/[0.10] text-landing-voice"
                      : tone === "warn"
                        ? "bg-landing-sms/[0.10] text-landing-sms"
                        : tone === "claude" && r.type.startsWith("task")
                          ? "bg-landing-violet/[0.10] text-landing-violet"
                          : "bg-tb-ink/[0.05] text-tb-ink-3";
                  const body = (
                    <>
                      <time
                        dateTime={r.at}
                        title={new Date(r.at).toLocaleString()}
                        className="pt-[3px] text-right font-landing-mono text-[11.5px] tabular-nums text-tb-ink-3"
                      >
                        {hm(r.at)}
                      </time>
                      <span className="relative flex justify-center">
                        {i < list.length - 1 ? <span aria-hidden className="absolute bottom-[-14px] top-7 w-px bg-tb-ink/[0.10]" /> : null}
                        <span className={cn("relative z-[1] grid h-6 w-6 place-items-center rounded-full", node)}>
                          <Icon className="h-3 w-3" />
                        </span>
                      </span>
                      <span className="min-w-0">
                        <span className="block break-words text-[14px] leading-5 text-tb-ink">{r.text}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-tb-ink-3">
                          <WhoIcon className="h-3 w-3" />
                          {who}
                          <span aria-hidden>·</span>
                          {rel(r.at)}
                        </span>
                      </span>
                      {r.to ? (
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-tb-ink-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                      ) : (
                        <span />
                      )}
                    </>
                  );
                  const cls = "grid grid-cols-[44px_24px_minmax(0,1fr)_16px] gap-x-3 rounded-xl px-2 py-2.5";
                  return (
                    <li key={r.key}>
                      {r.to ? (
                        <Link
                          to={r.to}
                          className={cn(
                            cls,
                            "group transition-colors hover:bg-tb-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[rgb(var(--tb-accent))]",
                          )}
                        >
                          {body}
                        </Link>
                      ) : (
                        <div className={cls}>{body}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          )) : null}
          {pageCount > 1 ? <DayPager page={page} pageCount={pageCount} days={days.map(([d]) => d)} onGo={goTo} /> : null}
        </div>
      )}
      {total > loaded ? (
        <p className="text-xs text-tb-ink-3">Showing the newest {loaded} of {total} follow-up events from the last 30 days.</p>
      ) : null}
    </div>
  );
}

/** Page numbers with the newest day as page 1. Long lists show 1 … 4 5 6 … 30. */
function DayPager({
  page,
  pageCount,
  days,
  onGo,
}: {
  page: number;
  pageCount: number;
  days: string[];
  onGo: (n: number) => void;
}) {
  const shown = new Set([1, pageCount, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pageCount));
  const numbers = [...shown].sort((a, b) => a - b);
  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg px-2.5 text-[13px] tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--tb-accent))] disabled:pointer-events-none disabled:opacity-40";
  return (
    <nav aria-label="Days" className="flex flex-col items-center gap-2 pt-2">
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button type="button" className={cn(btn, "text-tb-ink-2 hover:bg-tb-ink/[0.05]")} disabled={page <= 1} onClick={() => onGo(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
          Newer
        </button>
        {numbers.map((n, i) => (
          <span key={n} className="flex items-center gap-1">
            {i > 0 && n - numbers[i - 1] > 1 ? <span className="px-1 text-tb-ink-3">…</span> : null}
            <button
              type="button"
              title={days[n - 1]}
              aria-label={`Page ${n}: ${days[n - 1]}`}
              aria-current={n === page ? "page" : undefined}
              onClick={() => onGo(n)}
              className={cn(
                btn,
                n === page ? "bg-tb-ink font-semibold text-[rgb(var(--tb-surface-strong))]" : "text-tb-ink-2 hover:bg-tb-ink/[0.05]",
              )}
            >
              {n}
            </button>
          </span>
        ))}
        <button type="button" className={cn(btn, "text-tb-ink-2 hover:bg-tb-ink/[0.05]")} disabled={page >= pageCount} onClick={() => onGo(page + 1)}>
          Older
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="text-[12px] text-tb-ink-3">
        Day {page} of {pageCount} · {days[page - 1]}
      </p>
    </nav>
  );
}
