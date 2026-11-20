import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Download,
  History,
  Inbox,
  Loader2,
  MessageSquareReply,
  PauseCircle,
  PencilLine,
  Play,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Trash2,
  Sparkles,
  StopCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSteelTheme } from "@/components/dashboard/dashboardTheme";
import { dayGroup, hm, rel, type Tone } from "@/lib/harness/labels";
import { useGetActivityQuery, useGetRunsQuery } from "@/store/features/harness/harnessApi";
import type { ActivityEvent, RunItem } from "@/types/harness";
import { Chip, Empty, IconCircle, NoteBox, PageHead, Panel, outlineBtn } from "@/components/harness/ui";

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

export default function ActivityLogPage() {
  useSteelTheme();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const since = useMemo(() => new Date(Date.now() - 30 * 86_400_000).toISOString(), []);
  const activity = useGetActivityQuery({ since, page_size: 50 }, { pollingInterval: 30000 });
  const runs = useGetRunsQuery({ limit: 50 });

  const rows = useMemo(() => {
    const events = activity.data?.data.events ?? [];
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
    const oldest = events.length ? events[events.length - 1].at : since;
    list.push(...fromRuns((runs.data?.data.items ?? []).filter((r) => r.started_at >= oldest || events.length < 50)));
    return list.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  }, [activity.data, runs.data, since]);

  const f = FILTERS.find((x) => x.key === filter) ?? FILTERS[0];
  const shown = rows.filter(f.match).filter((r) => !q || r.text.toLowerCase().includes(q.toLowerCase()));
  const groups = shown.reduce<Record<string, Row[]>>((acc, r) => {
    (acc[dayGroup(r.at)] ??= []).push(r);
    return acc;
  }, {});

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
  const total = activity.data?.data.total ?? 0;

  return (
    <div className="w-full min-w-0 space-y-4 font-landing-sans text-landing-fog/80">
      <PageHead
        title="Activity Log"
        icon={History}
        sub="A record of the last 30 days: what Claude did, what you approved, what was sent, what failed and what was stopped. Click a row to open it."
        actions={
          <Button variant="outline" className={outlineBtn} onClick={exportCsv} disabled={!shown.length}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-fog/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the log" className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((x) => (
            <button
              key={x.key}
              type="button"
              onClick={() => setFilter(x.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] transition-colors",
                filter === x.key
                  ? "border-landing-sky/50 bg-landing-sky/10 text-landing-sky"
                  : "border-landing-line text-landing-fog/65 hover:text-landing-fog",
              )}
            >
              {x.label}
              <span className="font-landing-mono text-[11px] opacity-70">{rows.filter(x.match).length}</span>
            </button>
          ))}
        </div>
      </div>

      {(activity.data?.data.notes ?? []).map((n) => (
        <NoteBox key={n} tone="mute" icon={History}>
          {n}
        </NoteBox>
      ))}

      {loading ? (
        <Panel className="p-8 text-sm text-landing-fog/55">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-landing-sky" />
          Loading the log…
        </Panel>
      ) : activity.isError ? (
        <Panel className="border-landing-voice/40 p-8 text-sm text-landing-voice">Could not load the activity log.</Panel>
      ) : !shown.length ? (
        <Panel>
          <Empty icon={History}>Nothing matches.</Empty>
        </Panel>
      ) : (
        Object.entries(groups).map(([day, list]) => (
          <div key={day}>
            <p className="mb-2 mt-4 font-landing-mono text-[10.5px] uppercase tracking-[0.12em] text-landing-fog/45">{day}</p>
            <Panel>
              <div className="divide-y divide-landing-line">
                {list.map((r) => {
                  const [Icon, tone] = TYPE_UI[r.type] ?? [History, "mute"];
                  const [who, whoTone] = ACTOR[r.actor];
                  const body = (
                    <>
                      <IconCircle tone={tone} icon={Icon} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="break-words text-[13.5px] text-landing-fog/90">{r.text}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <Chip tone={whoTone}>{who}</Chip>
                          <span className="font-landing-mono text-[11px] text-landing-fog/40" title={new Date(r.at).toLocaleString()}>
                            {hm(r.at)} · {rel(r.at)}
                          </span>
                        </div>
                      </div>
                      {r.to ? <ChevronRight className="h-4 w-4 shrink-0 text-landing-fog/35" /> : null}
                    </>
                  );
                  return r.to ? (
                    <Link key={r.key} to={r.to} className="flex items-center gap-3 px-4 py-3 hover:bg-landing-fog/[0.03]">
                      {body}
                    </Link>
                  ) : (
                    <div key={r.key} className="flex items-center gap-3 px-4 py-3">
                      {body}
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        ))
      )}
      {total > 50 ? (
        <p className="text-xs text-landing-fog/45">Showing the newest 50 of {total} follow-up events from the last 30 days.</p>
      ) : null}
    </div>
  );
}
