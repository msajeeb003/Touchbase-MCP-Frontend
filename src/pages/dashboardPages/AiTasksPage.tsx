import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Code2, Copy, History, Inbox, Loader2, Mail, RefreshCw, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSteelTheme } from "@/components/dashboard/dashboardTheme";
import { clientLabel, rel, runLook } from "@/lib/harness/labels";
import { useGetRunQuery, useGetRunsQuery, useLazyGetRunEventsQuery } from "@/store/features/harness/harnessApi";
import type { RunEvent, RunItem } from "@/types/harness";
import NewInstructionDialog from "@/components/harness/NewInstructionDialog";
import { FlowStrip, RunCountsRow, RunDrafts, RunStepper, RunTechLog, RunTimeline } from "@/components/harness/RunParts";
import { Chip, Empty, NoteBox, PageHead, Panel, PanelHead, SafetyBanner, StatusChip, outlineBtn, primaryBtn } from "@/components/harness/ui";
import { showSuccess } from "@/utils/toast";

type Tab = "timeline" | "drafts" | "tech";

export default function AiTasksPage() {
  useSteelTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetRunsQuery({ limit: 50 }, { pollingInterval: 15000 });
  const runs = data?.data.items ?? [];
  const selectedId = id ?? runs[0]?.run_id;

  return (
    <div className="w-full min-w-0 space-y-4 font-landing-sans text-landing-fog/80">
      <PageHead
        title="AI Tasks"
        icon={Sparkles}
        sub="Every instruction you give Claude becomes a task here. See step by step what Claude did in Touchbase, what a safety rule stopped, and what it left for you."
        actions={
          <>
            <Button variant="outline" className={outlineBtn} onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <NewInstructionDialog />
          </>
        }
      />
      <SafetyBanner />
      <FlowStrip />

      {isLoading ? (
        <Panel className="p-8 text-sm text-landing-fog/55">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-landing-sky" />
          Loading Claude's tasks…
        </Panel>
      ) : isError ? (
        <Panel className="border-landing-voice/40 p-8 text-sm text-landing-voice">Could not load the tasks.</Panel>
      ) : !runs.length ? (
        <Panel>
          <Empty icon={Sparkles} tone="claude">
            <b className="text-landing-fog">No tasks yet.</b>
            <div className="mt-1">Connect Claude in Settings, then give it an instruction. Its work appears here the moment it starts.</div>
            <div className="mt-3 flex justify-center gap-2">
              <NewInstructionDialog />
              <Button asChild variant="outline" className={outlineBtn}>
                <Link to="/dashboard/settings#claude-access">
                  <Terminal className="h-4 w-4" />
                  Connect Claude
                </Link>
              </Button>
            </div>
          </Empty>
        </Panel>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
          <Panel className="lg:max-h-[calc(100svh-9rem)] lg:overflow-y-auto">
            <PanelHead title="Tasks" icon={History} right={<Chip>{data?.data.pagination.total ?? runs.length}</Chip>} />
            <div className="divide-y divide-landing-line">
              {runs.map((r) => (
                <RunListItem key={r.run_id} run={r} on={r.run_id === selectedId} onClick={() => navigate(`/dashboard/ai-tasks/${r.run_id}`)} />
              ))}
            </div>
          </Panel>
          <Panel>{selectedId ? <RunDetailPane key={selectedId} runId={selectedId} /> : null}</Panel>
        </div>
      )}
    </div>
  );
}

function RunListItem({ run, on, onClick }: { run: RunItem; on: boolean; onClick: () => void }) {
  const look = runLook(run.status);
  const c = run.counts;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full border-l-[3px] px-4 py-3 text-left transition-colors hover:bg-landing-fog/[0.03]",
        on ? "border-landing-sky bg-landing-sky/[0.07]" : "border-transparent",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <StatusChip look={look} />
        <span className="font-landing-mono text-[11px] text-landing-fog/40">{rel(run.started_at)}</span>
      </div>
      <div className="line-clamp-2 text-sm font-medium text-landing-fog">“{run.instruction}”</div>
      <div className="mt-1.5 flex flex-wrap gap-x-2 text-xs text-landing-fog/50">
        <span>{clientLabel(run.client)}</span>
        <span>· {c?.sequences ?? 0} follow-ups</span>
        {c?.awaiting_approval ? <span className="text-landing-sms">· {c.awaiting_approval} waiting</span> : null}
      </div>
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

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-landing-fog/55">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-landing-sky" />
        Loading the task…
      </div>
    );
  }
  if (isError || !detail || !run) {
    return <div className="p-8 text-sm text-landing-voice">Could not load this task. It may belong to another account.</div>;
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

  return (
    <div>
      <div className="px-5 pb-2 pt-5">
        <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-landing-fog/55">
          <StatusChip look={runLook(run.status)} />
          <span>
            {clientLabel(run.client)} · started {rel(run.started_at)}
            {took ? ` · took ${took > 90 ? `${Math.round(took / 60)} min` : `${took} s`}` : ""}
          </span>
          <span className="ml-auto font-landing-mono text-[11px] text-landing-fog/35">{run.run_id.slice(0, 8)}</span>
        </div>
        <p className="mt-3 font-landing-display text-lg font-semibold leading-snug text-landing-fog">“{run.instruction}”</p>
        <RunStepper run={run} events={events} />
        <RunCountsRow run={run} events={events} />

        {working ? (
          <NoteBox tone="claude" icon={RefreshCw} className="mt-3">
            <b>Claude is working in Touchbase right now.</b> Each step appears below as it happens. Drafts reach your Review Queue
            when Claude asks for approval.
          </NoteBox>
        ) : run.summary ? (
          <div className="mt-3 rounded-xl border border-landing-violet/30 bg-landing-violet/[0.06] p-3.5">
            <div className="flex items-center gap-1.5 font-landing-mono text-[10.5px] uppercase tracking-[0.12em] text-landing-violet">
              <Sparkles className="h-3 w-3" />
              Claude's summary
            </div>
            {/* Claude's own words: shown as plain text. */}
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-landing-fog/85">{run.summary}</p>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {waiting ? (
            <Button asChild size="sm" className={primaryBtn}>
              <Link to={`/dashboard/review?run=${run.run_id}`}>
                <Inbox className="h-4 w-4" />
                Review {waiting} draft{waiting > 1 ? "s" : ""}
              </Link>
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" className="gap-2 text-landing-fog/70 hover:bg-landing-fog/5 hover:text-landing-fog" onClick={copyInstruction}>
            <Copy className="h-4 w-4" />
            Copy instruction
          </Button>
        </div>

        <div className="mt-4 flex gap-1 border-b border-landing-line">
          {(
            [
              ["timeline", "What Claude did", History],
              ["drafts", `Follow-ups (${sequences.length})`, Mail],
              ["tech", "Technical log", Code2],
            ] as const
          ).map(([k, label, Icon]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={cn(
                "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors",
                tab === k ? "border-landing-sky font-semibold text-landing-fog" : "border-transparent text-landing-fog/55 hover:text-landing-fog",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5">
        {tab === "timeline" ? (
          <RunTimeline run={run} events={events} />
        ) : tab === "drafts" ? (
          <RunDrafts sequences={sequences} />
        ) : (
          <RunTechLog events={events} />
        )}
        {detail.events.has_more ? (
          <p className="mt-2 text-xs text-landing-fog/45">Showing the first 200 steps of this task.</p>
        ) : null}
      </div>
    </div>
  );
}
