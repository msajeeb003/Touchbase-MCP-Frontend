import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, BookOpen, Inbox, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TONE_CLASS, clientLabel, hasPlaceholder, rel, runLook, type Tone } from "@/lib/harness/labels";
import { useGetAllRunSequencesQuery, useGetRunsQuery } from "@/store/features/harness/harnessApi";
import type { HarnessSequence } from "@/types/harness";
import { StatusChip } from "./ui";

const isWaiting = (s: HarnessSequence) => s.status === "draft" && s.approval_status === "awaiting_approval";
const isScheduled = (s: HarnessSequence) => s.status === "active" && !s.steps.some((st) => st.status === "sent");
const isSending = (s: HarnessSequence) => s.status === "active" && s.steps.some((st) => st.status === "sent");

/** Follow-ups that need a person to look at them. */
const needsAttention = (s: HarnessSequence) =>
  (isWaiting(s) && (s.steps.some(hasPlaceholder) || s.lead.do_not_contact)) ||
  s.steps.some((st) => st.status === "failed") ||
  (s.status === "paused" && s.paused_reason === "changed_after_approval");

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const Bar = ({ className }: { className: string }) => (
  <div className={cn("animate-pulse rounded-md bg-tb-ink/[0.07]", className)} />
);

/** Same layout and size as the loaded section, without data. */
function StripPlaceholder() {
  return (
    <section className="space-y-4" aria-label="Claude" aria-busy="true">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="tb-card min-h-[179px] p-5">
          <Bar className="h-3 w-36" />
          <Bar className="mt-4 h-12 w-20" />
          <Bar className="mt-6 h-3 w-48" />
        </div>
        <div className="tb-card min-h-[179px] p-5">
          <Bar className="h-3 w-24" />
          <Bar className="mt-4 h-4 w-4/5" />
          <Bar className="mt-2 h-4 w-3/5" />
          <Bar className="mt-6 h-3 w-40" />
        </div>
      </div>
      <div className="tb-card p-5 lg:min-h-[294px]">
        <Bar className="h-5 w-28" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="tb-well h-16 p-3 lg:h-auto lg:min-h-[212px]">
              <Bar className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The Claude part of the dashboard: what waits for approval, the latest task,
 * and where each follow-up Claude prepared stands now.
 */
export default function HarnessDashboardStrip() {
  const { data: seqs = [], isLoading } = useGetAllRunSequencesQuery(undefined, { pollingInterval: 30000 });
  const { data: runsData, isLoading: runsLoading } = useGetRunsQuery({ limit: 1 }, { pollingInterval: 15000 });
  const latest = runsData?.data.items[0];

  // Hold the section's space while loading, so it does not pop in above the
  // charts and push the page down.
  if (isLoading || runsLoading) return <StripPlaceholder />;

  if (!latest) {
    return (
      <div className="tb-card flex flex-wrap items-center gap-3 px-5 py-4">
        <Sparkles className="h-5 w-5 shrink-0 text-landing-violet" />
        <p className="tb-body min-w-0 flex-1">
          <b className="text-tb-ink">Let Claude prepare your follow-ups.</b> You review every draft here first.
        </p>
        <Link to="/dashboard/settings#claude-access" className="tb-btn-quiet">
          Connect Claude
        </Link>
      </div>
    );
  }

  const waiting = seqs.filter(isWaiting);
  const attention = seqs.filter(needsAttention);
  const pipeline: { label: string; tone: Tone; list: HarnessSequence[]; show: string }[] = [
    { label: "Waiting for you", tone: "warn", list: waiting, show: "awaiting" },
    { label: "Scheduled", tone: "blue", list: seqs.filter(isScheduled), show: "approved" },
    { label: "Sending", tone: "ok", list: seqs.filter(isSending), show: "sending" },
    { label: "Paused", tone: "mute", list: seqs.filter((s) => s.status === "paused"), show: "sending" },
    { label: "Done", tone: "claude", list: seqs.filter((s) => s.status === "completed"), show: "sending" },
  ];
  const sentSteps = seqs.reduce((n, s) => n + s.steps.filter((st) => st.status === "sent").length, 0);

  return (
    <section className="space-y-4" aria-label="Claude">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Next step: the one thing to act on. */}
        <div className="tb-card relative overflow-hidden p-5">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-tb-accent via-landing-violet to-transparent"
          />
          <p className="tb-label">Waiting for approval</p>
          <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-3">
            <span className="tb-num text-[52px]">{waiting.length}</span>
            <p className="tb-body mb-1.5 min-w-0 flex-1">
              {waiting.length
                ? `draft${waiting.length > 1 ? "s" : ""} from Claude`
                : "All caught up"}
            </p>
            {waiting.length ? (
              <Link to="/dashboard/review" className="tb-btn-primary">
                <Inbox className="h-4 w-4" />
                Review drafts
              </Link>
            ) : (
              <Link to="/dashboard/activity" className="tb-btn-quiet">
                Activity
              </Link>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-tb-ink/[0.07] pt-4 text-[13px]">
            <Link to="/dashboard/review?show=approved" className="text-tb-ink-3 hover:text-tb-ink">
              <b className="tabular-nums text-tb-ink">{pipeline[1].list.length}</b> scheduled
            </Link>
            <Link to="/dashboard/review?show=sending" className="text-tb-ink-3 hover:text-tb-ink">
              <b className="tabular-nums text-tb-ink">{sentSteps}</b> sent
            </Link>
            {attention.length ? (
              <Link
                to={`/dashboard/review/${attention[0].sequence_id}`}
                className="inline-flex items-center gap-1.5 font-medium text-landing-voice hover:underline"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {attention.length} need{attention.length > 1 ? "" : "s"} attention
              </Link>
            ) : null}
          </div>
        </div>

        {/* Latest task from Claude. */}
        <Link to={`/dashboard/ai-tasks/${latest.run_id}`} className="tb-card-link group flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2">
            <p className="tb-label">Latest task</p>
            <StatusChip look={runLook(latest.status)} className="ml-auto" />
          </div>
          <p className="line-clamp-2 text-[15px] font-semibold leading-6 text-tb-ink">“{latest.instruction}”</p>
          {latest.summary ? <p className="tb-body line-clamp-2">{latest.summary}</p> : null}
          <div className="tb-meta mt-auto flex flex-wrap items-center gap-x-1.5 pt-2">
            <span>{clientLabel(latest.client)}</span>
            <span>· {rel(latest.started_at)}</span>
            <span>· {latest.counts?.sequences ?? 0} follow-ups</span>
            {latest.counts?.awaiting_approval ? (
              <span className="text-landing-sms">· {latest.counts.awaiting_approval} waiting</span>
            ) : null}
            <ArrowRight className="ml-auto h-4 w-4 text-tb-accent transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

      {/* Where each follow-up Claude prepared stands. */}
      <div className="tb-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="tb-h2">Follow-ups</h2>
          <Link to="/dashboard/ai-tasks" className="ml-auto text-[13px] font-medium text-tb-accent hover:underline">
            All tasks
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {pipeline.map((col) => (
            <div key={col.label} className="tb-well min-w-0 p-3">
              <Link
                to={`/dashboard/review?show=${col.show}`}
                className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-tb-ink hover:text-tb-accent"
              >
                <span className={cn("h-2 w-2 shrink-0 rounded-full", TONE_CLASS[col.tone].bar)} />
                <span className="min-w-0 flex-1 truncate">{col.label}</span>
                <span className="tb-num text-[15px]">{col.list.length}</span>
              </Link>
              <div className="space-y-0.5">
                {col.list.slice(0, 4).map((s) => (
                  <Link
                    key={s.sequence_id}
                    to={`/dashboard/review/${s.sequence_id}`}
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-[13px] text-tb-ink-2 hover:bg-tb-ink/[0.05] hover:text-tb-ink"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tb-ink/[0.07] font-landing-mono text-[10px] text-tb-ink-2">
                      {initials(s.lead.untrusted.name)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{s.lead.untrusted.name}</span>
                    {s.no_call_transcript && isWaiting(s) ? (
                      <BookOpen className="h-3 w-3 shrink-0 text-landing-sms" aria-label="No call transcript" />
                    ) : null}
                  </Link>
                ))}
                {col.list.length > 4 ? (
                  <Link
                    to={`/dashboard/review?show=${col.show}`}
                    className="block px-1.5 pt-1 text-[12.5px] font-medium text-tb-accent hover:underline"
                  >
                    +{col.list.length - 4} more
                  </Link>
                ) : null}
                {!col.list.length ? <p className="px-1.5 text-[13px] text-tb-ink-3">—</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
