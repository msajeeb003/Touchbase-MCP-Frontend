import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  ChevronRight,
  Clock,
  Eye,
  History,
  Inbox,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TONE_CLASS, clientLabel, hasPlaceholder, rel, runLook, type Tone } from "@/lib/harness/labels";
import { useGetAllRunSequencesQuery, useGetRunsQuery } from "@/store/features/harness/harnessApi";
import type { HarnessSequence } from "@/types/harness";
import NewInstructionDialog from "./NewInstructionDialog";
import { Chip, IconCircle, Kpi, SafetyBanner, StatusChip, outlineBtn, primaryBtn } from "./ui";

const isWaiting = (s: HarnessSequence) => s.status === "draft" && s.approval_status === "awaiting_approval";
const isScheduled = (s: HarnessSequence) => s.status === "active" && !s.steps.some((st) => st.status === "sent");
const isSending = (s: HarnessSequence) => s.status === "active" && s.steps.some((st) => st.status === "sent");

/** Follow-ups that need a person to look at them. */
const needsAttention = (s: HarnessSequence) =>
  (isWaiting(s) && (s.steps.some(hasPlaceholder) || s.lead.do_not_contact)) ||
  s.steps.some((st) => st.status === "failed") ||
  (s.status === "paused" && s.paused_reason === "changed_after_approval");

/**
 * The AI harness part of the dashboard: what Claude prepared, what waits for
 * approval, and where each follow-up stands. Hidden until Claude has done
 * anything, apart from a short invitation.
 */
export default function HarnessDashboardStrip() {
  const { data: seqs = [], isLoading } = useGetAllRunSequencesQuery(undefined, { pollingInterval: 30000 });
  const { data: runsData } = useGetRunsQuery({ limit: 1 }, { pollingInterval: 15000 });
  const latest = runsData?.data.items[0];

  if (isLoading) return null;

  if (!latest) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-landing-violet/30 bg-landing-violet/[0.06] px-4 py-3">
        <IconCircle tone="claude" icon={Sparkles} />
        <div className="min-w-0 flex-1 text-sm text-landing-fog/75">
          <b className="text-landing-fog">New: let Claude prepare your follow-ups.</b> Connect Claude, give it an instruction, and review its drafts here before anything is sent.
        </div>
        <Button asChild variant="outline" className={outlineBtn}>
          <Link to="/dashboard/settings#claude-access">Connect Claude</Link>
        </Button>
      </div>
    );
  }

  const waiting = seqs.filter(isWaiting);
  const attention = seqs.filter(needsAttention);
  const pipeline: { label: string; tone: Tone; list: HarnessSequence[]; show: string }[] = [
    { label: "Waiting for you", tone: "warn", list: waiting, show: "awaiting" },
    { label: "Approved · scheduled", tone: "blue", list: seqs.filter(isScheduled), show: "approved" },
    { label: "Sending", tone: "ok", list: seqs.filter(isSending), show: "sending" },
    { label: "Paused", tone: "mute", list: seqs.filter((s) => s.status === "paused"), show: "sending" },
    { label: "Done", tone: "claude", list: seqs.filter((s) => s.status === "completed"), show: "sending" },
  ];
  const sentSteps = seqs.reduce((n, s) => n + s.steps.filter((st) => st.status === "sent").length, 0);
  const look = runLook(latest.status);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-landing-mono text-[11px] uppercase tracking-[0.18em] text-landing-violet">AI Harness</p>
          <h3 className="mt-1 font-landing-display text-xl font-bold text-landing-fog">What Claude prepared for you</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className={outlineBtn}>
            <Link to="/dashboard/ai-tasks">
              <Sparkles className="h-4 w-4" />
              See Claude's work
            </Link>
          </Button>
          <NewInstructionDialog />
        </div>
      </div>

      <SafetyBanner />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-landing-violet/30 bg-gradient-to-br from-landing-violet/[0.10] to-transparent p-5">
          <p className="font-landing-mono text-[10.5px] uppercase tracking-[0.12em] text-landing-violet">Your next step</p>
          {waiting.length ? (
            <>
              <h4 className="mt-1.5 font-landing-display text-2xl font-bold text-landing-fog">
                {waiting.length} follow-up{waiting.length > 1 ? "s are" : " is"} waiting for your approval
              </h4>
              <p className="mt-1 text-sm text-landing-fog/60">
                Claude wrote them from each lead's own calls and notes. Read them, edit if you like, then approve. Nothing is sent before you do.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild className={primaryBtn}>
                  <Link to="/dashboard/review">
                    <Inbox className="h-4 w-4" />
                    Open Review Queue
                  </Link>
                </Button>
                <Button asChild variant="outline" className={outlineBtn}>
                  <Link to={`/dashboard/ai-tasks/${waiting[0].run.run_id}`}>
                    <Eye className="h-4 w-4" />
                    See how Claude made them
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <h4 className="mt-1.5 font-landing-display text-2xl font-bold text-landing-fog">Nothing is waiting for you</h4>
              <p className="mt-1 text-sm text-landing-fog/60">Give Claude a new instruction. Its work appears under AI Tasks the moment it starts.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <NewInstructionDialog />
                <Button asChild variant="outline" className={outlineBtn}>
                  <Link to="/dashboard/activity">
                    <History className="h-4 w-4" />
                    What happened
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2.5 rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
          <div className="flex items-center gap-2">
            <span className="font-landing-mono text-[10.5px] uppercase tracking-[0.12em] text-landing-fog/50">Latest task from Claude</span>
            <StatusChip look={look} className="ml-auto" />
          </div>
          <p className="line-clamp-2 text-[15px] font-medium text-landing-fog">“{latest.instruction}”</p>
          <div className="flex flex-wrap gap-x-2 text-[12.5px] text-landing-fog/50">
            <span>{clientLabel(latest.client)}</span>
            <span>· {rel(latest.started_at)}</span>
            <span>· {latest.counts?.sequences ?? 0} follow-ups</span>
            {latest.counts?.awaiting_approval ? <span className="text-landing-sms">· {latest.counts.awaiting_approval} waiting</span> : null}
          </div>
          {latest.summary ? <p className="line-clamp-3 text-[13px] text-landing-fog/65">{latest.summary}</p> : null}
          <div className="mt-auto">
            <Button asChild size="sm" variant="outline" className={outlineBtn}>
              <Link to={`/dashboard/ai-tasks/${latest.run_id}`}>
                <Eye className="h-4 w-4" />
                Watch what Claude did
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <Kpi label="Waiting for you" value={waiting.length} hint="Drafts Claude prepared" icon={Clock} tone="warn" to="/dashboard/review?show=awaiting" />
        <Kpi label="Approved · scheduled" value={pipeline[1].list.length} hint="Go out in your send window" icon={CalendarClock} tone="blue" to="/dashboard/review?show=approved" />
        <Kpi label="Messages sent" value={sentSteps} hint="From Claude's follow-ups" icon={Send} tone="ok" to="/dashboard/review?show=sending" />
        <Kpi label="Needs attention" value={attention.length} hint="Failed, blocked or flagged" icon={AlertTriangle} tone={attention.length ? "bad" : "ok"} to={attention[0] ? `/dashboard/review/${attention[0].sequence_id}` : "/dashboard/review"} />
      </div>

      <div className="rounded-2xl border border-landing-line bg-landing-steel-2">
        <div className="flex flex-wrap items-center gap-2 border-b border-landing-line px-4 py-3">
          <h4 className="font-landing-display font-bold text-landing-fog">Follow-up pipeline</h4>
          <span className="text-xs text-landing-fog/50">Where each lead Claude prepared a follow-up for is now. Click a name to open it.</span>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          {pipeline.map((col) => (
            <div key={col.label} className="min-w-0 rounded-xl border border-landing-line bg-landing-steel p-3">
              <div className={cn("mb-2 h-1 rounded-full", TONE_CLASS[col.tone].bar)} />
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-landing-fog">{col.label}</span>
                <Chip tone={col.tone}>{col.list.length}</Chip>
              </div>
              <div className="space-y-1">
                {col.list.slice(0, 4).map((s) => (
                  <Link
                    key={s.sequence_id}
                    to={`/dashboard/review/${s.sequence_id}`}
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-[13px] text-landing-fog/80 hover:bg-landing-fog/[0.05]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-landing-fog/[0.08] font-landing-mono text-[10px] text-landing-fog/70">
                      {s.lead.untrusted.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{s.lead.untrusted.name}</span>
                    {s.no_call_transcript && isWaiting(s) ? <BookOpen className="h-3 w-3 shrink-0 text-landing-sms" /> : null}
                  </Link>
                ))}
                {col.list.length > 4 ? (
                  <Link to={`/dashboard/review?show=${col.show}`} className="inline-flex items-center gap-0.5 px-1.5 text-[12.5px] text-landing-sky hover:underline">
                    +{col.list.length - 4} more <ChevronRight className="h-3 w-3" />
                  </Link>
                ) : null}
                {!col.list.length ? <div className="px-1.5 text-[12.5px] text-landing-fog/35">Nobody here</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
