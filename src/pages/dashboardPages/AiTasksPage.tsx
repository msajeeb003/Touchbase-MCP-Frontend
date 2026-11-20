import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ChevronLeft, Copy, Inbox, RefreshCw, Sparkles, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSteelTheme } from "@/components/dashboard/dashboardTheme";
import { clientLabel, rel } from "@/lib/harness/labels";
import { useGetRunQuery, useGetRunsQuery, useLazyGetRunEventsQuery } from "@/store/features/harness/harnessApi";
import type { RunEvent, RunItem } from "@/types/harness";
import NewInstructionDialog from "@/components/harness/NewInstructionDialog";
import {
  FlowStrip,
  RunCountsRow,
  RunDrafts,
  RunStateChip,
  RunStateDot,
  RunStepper,
  RunTechLog,
  RunTimeline,
} from "@/components/harness/RunParts";
import { PageHead, Panel, SafetyBanner } from "@/components/harness/ui";
import { showSuccess } from "@/utils/toast";

/*
 * AI Tasks. Layout and states follow AI-Tasks-Redesign-Spec.html:
 * header, quiet workflow line, approval bar when drafts wait, then the task
 * list and the selected task's detail. Below md the list and the detail are
 * two screens (the URL holds the task id, so back works).
 */

type Tab = "timeline" | "drafts" | "tech";

const iconBtn =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-tb-ink-3 transition-colors hover:bg-tb-ink/[0.06] hover:text-tb-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--tb-accent))]";

export default function AiTasksPage() {
  useSteelTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, isFetching, refetch } = useGetRunsQuery({ limit: 50 }, { pollingInterval: 15000 });
  const runs = data?.data.items ?? [];
  const selectedId = id ?? runs[0]?.run_id;
  const totalWaiting = runs.reduce((n, r) => n + (r.counts?.awaiting_approval ?? 0), 0);

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1440px] space-y-4 font-landing-sans">
      <PageHead
        title="AI Tasks"
        icon={Sparkles}
        actions={
          <>
            <button type="button" className={iconBtn} onClick={() => refetch()} title="Refresh" aria-label="Refresh">
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </button>
            <NewInstructionDialog />
          </>
        }
      />

      <FlowStrip defaultOpen={!isLoading && !isError && !runs.length} lead={<SafetyBanner className="mr-1" />} />

      {totalWaiting > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-landing-sms/35 bg-landing-sms/[0.08] px-4 py-3">
          <Inbox className="h-[18px] w-[18px] shrink-0 text-landing-sms" />
          <p className="min-w-[200px] flex-1 text-sm text-tb-ink">
            <b>
              {totalWaiting} draft{totalWaiting > 1 ? "s are" : " is"} waiting for your approval.
            </b>{" "}
            <span className="text-tb-ink-3">Nothing is sent before you approve.</span>
          </p>
          <Link
            to="/dashboard/review"
            className="tb-btn bg-landing-sms text-[rgb(var(--tb-surface-strong))] hover:brightness-110"
          >
            Open Review Queue
          </Link>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,330px)_minmax(0,1fr)]">
          <Panel className="space-y-1 p-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="space-y-2 p-2.5">
                <div className="h-3.5 animate-pulse rounded bg-tb-ink/[0.07]" />
                <div className="h-3 w-3/5 animate-pulse rounded bg-tb-ink/[0.06]" />
              </div>
            ))}
          </Panel>
          <Panel className="hidden lg:block">
            <DetailSkeleton />
          </Panel>
        </div>
      ) : isError ? (
        <ErrorBox text="Could not load the tasks." onRetry={() => refetch()} />
      ) : !runs.length ? (
        <Panel className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <p className="tb-h3">No tasks yet</p>
          <p className="tb-body max-w-md">Give Claude an instruction. Its work shows up here as it happens.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <NewInstructionDialog />
            <Link to="/dashboard/settings#claude-access" className="tb-btn-quiet">
              <Terminal className="h-4 w-4" />
              Connect Claude
            </Link>
          </div>
        </Panel>
      ) : (
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(260px,330px)_minmax(0,1fr)]">
          <Panel className={cn("lg:sticky lg:top-20 lg:max-h-[calc(100svh-6.5rem)] lg:overflow-y-auto", id && "max-md:hidden")}>
            <div className="flex items-center gap-2 px-4 pb-2 pt-3.5">
              <h3 className="text-sm font-semibold text-tb-ink">Tasks</h3>
              <span className="font-landing-mono text-xs text-tb-ink-3">{data?.data.pagination.total ?? runs.length}</span>
            </div>
            <div className="grid gap-0.5 px-1.5 pb-1.5">
              {runs.map((r) => (
                <TaskRow
                  key={r.run_id}
                  run={r}
                  selected={r.run_id === selectedId}
                  onClick={() => navigate(`/dashboard/ai-tasks/${r.run_id}`)}
                />
              ))}
            </div>
          </Panel>
          <Panel className={cn(!id && "max-md:hidden")}>
            {selectedId ? <RunDetailPane key={selectedId} runId={selectedId} /> : null}
          </Panel>
        </div>
      )}
    </div>
  );
}

/** One task: state dot, the instruction first, then source · follow-ups · waiting, time on the right. */
function TaskRow({ run, selected, onClick }: { run: RunItem; selected: boolean; onClick: () => void }) {
  const c = run.counts;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "relative grid w-full grid-cols-[8px_minmax(0,1fr)] gap-x-2.5 gap-y-1 rounded-xl px-3 py-2.5 text-left transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[rgb(var(--tb-accent))]",
        selected ? "bg-tb-accent/[0.09]" : "hover:bg-tb-ink/[0.04]",
      )}
    >
      {selected ? <span aria-hidden className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r bg-tb-accent" /> : null}
      <RunStateDot run={run} />
      <span className="line-clamp-2 text-sm font-medium leading-5 text-tb-ink">“{run.instruction}”</span>
      <span className="col-start-2 flex flex-wrap items-center gap-x-1.5 text-xs text-tb-ink-3">
        <span>{clientLabel(run.client)}</span>
        <span>· {c?.sequences ?? 0} follow-ups</span>
        {c?.awaiting_approval ? <span className="font-semibold text-landing-sms">· {c.awaiting_approval} waiting</span> : null}
        <span className="ml-auto font-landing-mono text-[11px] text-tb-ink-3/80">{rel(run.started_at)}</span>
      </span>
    </button>
  );
}

function RunDetailPane({ runId }: { runId: string }) {
  const [tab, setTab] = useState<Tab>("timeline");
  const { data, isLoading, isError, refetch } = useGetRunQuery({ id: runId });
  const [fetchEvents] = useLazyGetRunEventsQuery();
  const [liveEvents, setLiveEvents] = useState<RunEvent[]>([]);
  const lastSeq = useRef(0);

  const detail = data?.data;
  const run = detail?.run;
  const working = run?.status === "in_progress";

  // Events from the detail call, plus newer ones fetched while Claude is working.
  const events = useMemo(() => {
    const base = detail?.events.events ?? [];
    const seen = new Set(base.map((e) => e.seq));
    return [...base, ...liveEvents.filter((e) => !seen.has(e.seq))].sort((a, b) => a.seq - b.seq);
  }, [detail, liveEvents]);

  useEffect(() => {
    lastSeq.current = events.length ? events[events.length - 1].seq : 0;
  }, [events]);

  // Live progress: while the task is running, ask every 3 seconds for newer
  // events only, and reload the task when something new happened.
  useEffect(() => {
    if (!working) return;
    const timer = window.setInterval(async () => {
      const res = await fetchEvents({ id: runId, after: lastSeq.current });
      const fresh = res.data?.data.events ?? [];
      if (fresh.length) {
        setLiveEvents((prev) => [...prev, ...fresh]);
        refetch();
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [working, runId, fetchEvents, refetch]);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !detail || !run) {
    return (
      <div className="p-5">
        <ErrorBox text="Could not load this task. It may belong to another account." onRetry={() => refetch()} />
      </div>
    );
  }

  const sequences = detail.sequences.items;
  const waiting = run.counts?.awaiting_approval ?? 0;
  const took =
    run.finished_at && run.started_at
      ? Math.max(1, Math.round((new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000))
      : null;

  const copyInstruction = async () => {
    try {
      await navigator.clipboard.writeText(run.instruction);
      showSuccess("Instruction copied.");
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  const tabs: [Tab, string, number | null][] = [
    ["timeline", "What Claude did", null],
    ["drafts", "Follow-ups", sequences.length],
    ["tech", "Technical log", null],
  ];

  return (
    <div className="space-y-[18px] px-5 py-5 md:px-[22px]">
      <Link to="/dashboard/ai-tasks" className="tb-btn-quiet tb-btn-sm md:hidden">
        <ChevronLeft className="h-4 w-4" />
        Tasks
      </Link>

      {/* 1 Status line */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[12.5px] text-tb-ink-3">
        <RunStateChip run={run} />
        <span>
          {clientLabel(run.client)} · started {rel(run.started_at)}
          {took ? ` · took ${took > 90 ? `${Math.round(took / 60)} min` : `${took} s`}` : ""}
        </span>
        <span className="ml-auto select-all font-landing-mono text-[11px] text-tb-ink-3/80" title="Run id">
          {run.run_id.slice(0, 8)}
        </span>
      </div>

      {/* 2 Instruction */}
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 break-words font-landing-display text-xl font-semibold leading-7 tracking-[-0.01em] text-tb-ink">
          “{run.instruction}”
        </h3>
        <button type="button" className={iconBtn} onClick={copyInstruction} title="Copy instruction" aria-label="Copy instruction">
          <Copy className="h-4 w-4" />
        </button>
      </div>

      {/* 3 What needs you */}
      {waiting ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-landing-sms/35 bg-landing-sms/[0.08] px-4 py-3">
          <Inbox className="h-[18px] w-[18px] shrink-0 text-landing-sms" />
          <p className="min-w-[180px] flex-1 text-sm text-tb-ink">
            <b>
              {waiting} draft{waiting > 1 ? "s wait" : " waits"} for your approval.
            </b>{" "}
            <span className="text-tb-ink-3">Nothing is sent before you approve.</span>
          </p>
          <Link
            to={`/dashboard/review?run=${run.run_id}`}
            className="tb-btn bg-landing-sms text-[rgb(var(--tb-surface-strong))] hover:brightness-110"
          >
            Review {waiting} draft{waiting > 1 ? "s" : ""}
          </Link>
        </div>
      ) : null}

      {/* 4 Progress, 5 numbers */}
      <RunStepper run={run} events={events} />
      <RunCountsRow run={run} events={events} />

      {/* 6 Summary (always visible: "Done" does not always mean the goal was reached) */}
      {working ? (
        <p className="flex items-center gap-2 text-[13px] text-tb-accent">
          <span className="h-2 w-2 animate-pulse rounded-full bg-tb-accent" />
          Claude is working in Touchbase right now. Each step appears below as it happens.
        </p>
      ) : run.summary ? (
        <div className="space-y-1.5 border-l-2 border-tb-ink/[0.14] pl-3.5">
          <p className="tb-label">Claude's summary</p>
          {/* Claude's own words: shown as plain text. */}
          <p className="whitespace-pre-wrap text-[14.5px] leading-6 text-tb-ink">{run.summary}</p>
        </div>
      ) : null}

      {/* 7 Details */}
      <div>
        <div role="tablist" aria-label="Task details" className="flex gap-0.5 overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_rgb(var(--tb-ink)/0.08)]">
          {tabs.map(([k, label, n]) => (
            <button
              key={k}
              type="button"
              role="tab"
              id={`run-tab-${k}`}
              aria-selected={tab === k}
              aria-controls={`run-panel-${k}`}
              onClick={() => setTab(k)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[13.5px] transition-colors",
                tab === k ? "border-tb-accent font-semibold text-tb-ink" : "border-transparent text-tb-ink-3 hover:text-tb-ink",
              )}
            >
              {label}
              {n !== null ? <span className="font-landing-mono text-[11px] text-tb-ink-3">{n}</span> : null}
            </button>
          ))}
        </div>
        {/*
          All three panels stay mounted and are only hidden, so switching tabs
          does not rebuild them (no flash, and the technical log keeps its
          opened rows). The minimum height keeps the page long enough that a
          short panel never makes the browser jump the scroll position.
        */}
        <div className="min-h-[calc(100svh-8rem)]">
          <div role="tabpanel" id="run-panel-timeline" aria-labelledby="run-tab-timeline" hidden={tab !== "timeline"}>
            <RunTimeline run={run} events={events} />
          </div>
          <div role="tabpanel" id="run-panel-drafts" aria-labelledby="run-tab-drafts" hidden={tab !== "drafts"}>
            <RunDrafts sequences={sequences} />
          </div>
          <div role="tabpanel" id="run-panel-tech" aria-labelledby="run-tab-tech" hidden={tab !== "tech"}>
            <RunTechLog events={events} />
          </div>
          {detail.events.has_more ? (
            <p className="mt-2 text-xs text-tb-ink-3">Showing the first 200 steps of this task.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4 p-5" aria-label="Loading the task">
      <div className="h-3.5 w-2/5 animate-pulse rounded bg-tb-ink/[0.07]" />
      <div className="h-6 w-4/5 animate-pulse rounded bg-tb-ink/[0.07]" />
      <div className="h-5 animate-pulse rounded bg-tb-ink/[0.06]" />
      <div className="h-3.5 w-3/4 animate-pulse rounded bg-tb-ink/[0.06]" />
      <div className="h-16 animate-pulse rounded bg-tb-ink/[0.05]" />
    </div>
  );
}

function ErrorBox({ text, onRetry }: { text: string; onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-landing-voice/35 bg-landing-voice/[0.07] px-4 py-3.5">
      <AlertTriangle className="h-[18px] w-[18px] shrink-0 text-landing-voice" />
      <p className="min-w-0 flex-1 text-sm text-tb-ink">{text}</p>
      <button type="button" className="tb-btn-quiet tb-btn-sm" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
