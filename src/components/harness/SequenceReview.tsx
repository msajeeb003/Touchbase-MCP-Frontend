import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  BookOpen,
  CalendarClock,
  Check,
  History,
  Loader2,
  Mail,
  MessageSquare,
  MessageSquareReply,
  PauseCircle,
  PencilLine,
  Play,
  Sparkles,
  StopCircle,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  PAUSED_REASON,
  apiErrorMessage,
  basedOnLabel,
  future,
  hasPlaceholder,
  rel,
  sequenceLook,
  stepLook,
  textHasPlaceholder,
} from "@/lib/harness/labels";
import { useUpdateSequenceMutation, useUpdateSequenceStepMutation } from "@/store/features/sequences/sequencesApi";
import { useGetSettingsQuery } from "@/store/features/settings/settingsApi";
import type { HarnessSequence, RunStep } from "@/types/harness";
import { showError, showSuccess } from "@/utils/toast";
import { NoteBox, StatusChip } from "./ui";
import { btnDanger, btnPrimary, btnQuiet } from "@/lib/ds";

/** Shows {{placeholders}} highlighted. The text is rendered as text, never as markup. */
export function Highlighted({ text }: { text: string }) {
  const parts = text.split(/(\{\{[^}]*\}\})/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\{\{[^}]*\}\}$/.test(p) ? (
          <mark key={i} className="rounded bg-landing-voice/20 px-0.5 text-landing-voice">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function useSendWindowText() {
  const { data } = useGetSettingsQuery();
  const s = data?.data;
  if (!s) return { text: "your send window", timezone: null as string | null };
  return {
    text: `${s.sendWindowStart ?? "09:00"}–${s.sendWindowEnd ?? "18:00"}${s.sendOnWeekends ? "" : " on weekdays"}${s.sendTimezone ? ` (${s.sendTimezone})` : ""}`,
    timezone: s.sendTimezone ?? null,
  };
}

type Confirm = null | "approve" | "reject" | "pause" | "resume" | "stop";

export default function SequenceReview({ seq }: { seq: HarnessSequence }) {
  const [updateSequence, { isLoading: saving }] = useUpdateSequenceMutation();
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [editing, setEditing] = useState<RunStep | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const win = useSendWindowText();

  useEffect(() => setLastError(null), [seq.sequence_id]);

  const look = sequenceLook(seq);
  const awaiting = seq.status === "draft" && seq.approval_status === "awaiting_approval";
  const placeholder = seq.steps.some(hasPlaceholder);
  const firstTranscript = seq.steps.find((s) => s.based_on.kind === "transcript")?.based_on.transcripts[0];
  const note = seq.steps.find((s) => s.based_on.note)?.based_on.note;
  const nextStep = seq.steps.find((s) => s.status === "scheduled" && s.scheduled_for);

  const changeStatus = async (status: "active" | "cancelled" | "paused", done: string) => {
    setLastError(null);
    try {
      await updateSequence({ id: seq.sequence_id, body: { status } }).unwrap();
      showSuccess(done);
    } catch (error) {
      const message = apiErrorMessage(error, "Could not change this follow-up.");
      setLastError(message);
      showError(message);
    } finally {
      setConfirm(null);
    }
  };

  let actions: ReactNode = null;
  if (awaiting) {
    actions = (
      <>
        <Button className={btnPrimary} disabled={saving || placeholder} onClick={() => setConfirm("approve")}>
          <Check className="h-4 w-4" />
          Approve
        </Button>
        <Button variant="outline" className={btnQuiet} onClick={() => setEditing(seq.steps[0])}>
          <PencilLine className="h-4 w-4" />
          Edit
        </Button>
        <Button variant="outline" className={btnDanger} disabled={saving} onClick={() => setConfirm("reject")}>
          <X className="h-4 w-4" />
          Reject
        </Button>
      </>
    );
  } else if (seq.status === "active") {
    actions = (
      <>
        <Button variant="outline" className={btnQuiet} disabled={saving} onClick={() => setConfirm("pause")}>
          <PauseCircle className="h-4 w-4" />
          Pause
        </Button>
        <Button variant="outline" className={btnDanger} disabled={saving} onClick={() => setConfirm("stop")}>
          <StopCircle className="h-4 w-4" />
          Stop for good
        </Button>
      </>
    );
  } else if (seq.status === "paused") {
    actions = (
      <>
        <Button className={btnPrimary} disabled={saving} onClick={() => setConfirm("resume")}>
          <Play className="h-4 w-4" />
          {seq.paused_reason === "changed_after_approval" ? "Approve again" : "Resume"}
        </Button>
        <Button variant="outline" className={btnDanger} disabled={saving} onClick={() => setConfirm("stop")}>
          <StopCircle className="h-4 w-4" />
          Stop for good
        </Button>
      </>
    );
  }

  const confirmText: Record<Exclude<Confirm, null>, { title: string; body: string; ok: string; run: () => void }> = {
    approve: {
      title: `Approve the follow-up for ${seq.lead.untrusted.name}?`,
      body: `${seq.steps.length} message${seq.steps.length > 1 ? "s" : ""} will be scheduled inside your send window, ${win.text}. You can pause or stop it later.`,
      ok: "Approve",
      run: () => changeStatus("active", "Approved. The messages are scheduled."),
    },
    reject: {
      title: "Reject this draft?",
      body: "It will not be sent. The follow-up is cancelled and stays in the list as rejected.",
      ok: "Reject",
      run: () => changeStatus("cancelled", "Rejected. Nothing will be sent."),
    },
    pause: {
      title: "Pause this follow-up?",
      body: "No more messages go out until you resume it.",
      ok: "Pause",
      run: () => changeStatus("paused", "Paused."),
    },
    resume: {
      title: seq.paused_reason === "changed_after_approval" ? "Approve the changed follow-up?" : "Resume this follow-up?",
      body: `The remaining messages are scheduled inside your send window, ${win.text}.`,
      ok: seq.paused_reason === "changed_after_approval" ? "Approve again" : "Resume",
      run: () => changeStatus("active", "Resumed."),
    },
    stop: {
      title: "Stop this follow-up for good?",
      body: "No more messages will be sent. This cannot be resumed.",
      ok: "Stop",
      run: () => changeStatus("cancelled", "Stopped."),
    },
  };

  const notices: { tone: "bad" | "warn" | "ok" | "blue" | "mute"; icon: typeof Ban; title: string; text: ReactNode }[] = [];
  if (lastError) notices.push({ tone: "bad", icon: XCircle, title: "Not done.", text: lastError });
  if (seq.lead.do_not_contact)
    notices.push({ tone: "bad", icon: Ban, title: "This lead is do-not-contact.", text: "Touchbase refuses to approve or send this follow-up. Only a person can clear it, on the Leads page." });
  if (placeholder)
    notices.push({ tone: "warn", icon: AlertTriangle, title: "A placeholder is left in the text", text: "(highlighted below). Nothing fills it at send time, so the lead would see it. Edit the message before approving." });
  if (seq.transcript_added_since)
    notices.push({ tone: "blue", icon: BookOpen, title: "New call transcript.", text: "A call transcript was added for this lead after Claude wrote this draft. You may want Claude to write it again." });
  if (seq.status === "paused" && seq.paused_reason)
    notices.push({
      tone: seq.paused_reason === "lead_replied" ? "ok" : "mute",
      icon: seq.paused_reason === "lead_replied" ? MessageSquareReply : PauseCircle,
      title: "Paused.",
      text: PAUSED_REASON[seq.paused_reason] ?? seq.paused_reason,
    });
  if (seq.status === "cancelled") notices.push({ tone: "bad", icon: XCircle, title: "Rejected or stopped.", text: "Nothing more will be sent." });
  if (seq.status === "active" && seq.approved_at)
    notices.push({
      tone: "blue",
      icon: CalendarClock,
      title: `Approved ${rel(seq.approved_at)}.`,
      text: nextStep?.scheduled_for ? `Next message ${future(nextStep.scheduled_for)}, inside your send window.` : "The messages go out inside your send window.",
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Who it is for, and where it came from */}
      <div className="space-y-2 px-5 pt-5 md:px-6">
        <div className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-landing-display text-[22px] font-bold leading-7 tracking-[-0.015em] text-tb-ink">
              {seq.lead.untrusted.name}
            </h3>
            <p className="text-sm text-tb-ink-3">{seq.lead.untrusted.company || "No company"}</p>
          </div>
          <StatusChip look={look} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <Link to={`/dashboard/leads/${seq.lead.lead_id}/transcripts`} className="inline-flex items-center gap-1 font-medium text-tb-accent hover:underline">
            <History className="h-3.5 w-3.5" />
            Lead and calls
          </Link>
          <Link to={`/dashboard/sequences/${seq.sequence_id}/view`} className="inline-flex items-center gap-1 font-medium text-tb-accent hover:underline">
            <Mail className="h-3.5 w-3.5" />
            Open in Sequences
          </Link>
          <Link
            to={`/dashboard/ai-tasks/${seq.run.run_id}`}
            className="inline-flex min-w-0 max-w-full items-center gap-1 text-tb-ink-3 hover:text-tb-ink hover:underline"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-landing-violet" />
            <span className="truncate">Prepared by Claude in the task “{seq.run.instruction}”</span>
          </Link>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 md:px-6">
        {notices.length ? (
          <ul className="space-y-2">
            {notices.map((n) => (
              <li
                key={n.title}
                className={cn(
                  "flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] leading-5 text-tb-ink-2",
                  n.tone === "bad" ? "bg-landing-voice/[0.07]" : n.tone === "warn" ? "bg-landing-sms/[0.08]" : "bg-tb-ink/[0.04]",
                )}
              >
                <n.icon
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    n.tone === "bad"
                      ? "text-landing-voice"
                      : n.tone === "warn"
                        ? "text-landing-sms"
                        : n.tone === "ok"
                          ? "text-landing-whatsapp"
                          : n.tone === "blue"
                            ? "text-tb-accent"
                            : "text-tb-ink-3",
                  )}
                />
                <span className="min-w-0">
                  <b className="font-semibold text-tb-ink">{n.title}</b> {n.text}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Why Claude wrote it this way */}
        <div className="space-y-1.5 border-l-2 border-tb-ink/[0.14] pl-3.5">
          <p className="tb-label">Why Claude wrote it this way</p>
          {note ? <p className="whitespace-pre-wrap text-[14.5px] leading-6 text-tb-ink">{note}</p> : null}
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px]">
            {seq.no_call_transcript ? (
              <>
                <span className="inline-flex items-center gap-1 font-medium text-landing-sms">
                  <BookOpen className="h-3.5 w-3.5" />
                  No call transcript
                </span>
                <span className="text-tb-ink-3">Written from the lead's notes and stage.</span>
                <Link to={`/dashboard/leads/${seq.lead.lead_id}/transcripts`} className="font-medium text-tb-accent hover:underline">
                  Add a call transcript
                </Link>
              </>
            ) : firstTranscript ? (
              <>
                <span className="inline-flex items-center gap-1 font-medium text-tb-ink-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  Based on: call of {firstTranscript.meeting_date}
                  {firstTranscript.untrusted_meeting_title ? ` · ${firstTranscript.untrusted_meeting_title}` : ""}
                </span>
                <span className="text-tb-ink-3">Claude had to read this call before it could write.</span>
              </>
            ) : (
              <span className="text-tb-ink-3">Basis not stated</span>
            )}
          </p>
        </div>

        {/* The messages, as a thread on a rail */}
        <div>
          <p className="tb-label mb-3">
            The messages ({seq.steps.length} step{seq.steps.length === 1 ? "" : "s"})
          </p>
          <ol className="relative space-y-4">
            {seq.steps.map((st, idx) => (
              <StepBox
                key={st.step_id}
                step={st}
                idx={idx}
                last={idx === seq.steps.length - 1}
                editable={awaiting}
                onEdit={() => setEditing(st)}
              />
            ))}
          </ol>
        </div>
      </div>

      {actions ? (
        <div className="sticky bottom-0 z-10 mt-auto flex flex-wrap items-center gap-2 rounded-b-2xl border-t border-tb-ink/[0.08] bg-[rgb(var(--tb-surface-strong)/0.92)] px-5 py-3 backdrop-blur-md md:px-6">
          {actions}
          {awaiting && placeholder ? <span className="text-xs font-medium text-landing-sms">Remove the placeholder to approve.</span> : null}
        </div>
      ) : null}

      {editing ? <EditStepDialog sequenceId={seq.sequence_id} step={editing} onClose={() => setEditing(null)} /> : null}

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        {confirm ? (
          <AlertDialogContent className="font-landing-sans">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-tb-ink">{confirmText[confirm].title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmText[confirm].body}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={cn(confirm === "reject" || confirm === "stop" ? "bg-landing-voice text-white hover:bg-landing-voice/90" : btnPrimary)}
                onClick={(e) => {
                  e.preventDefault();
                  confirmText[confirm].run();
                }}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {confirmText[confirm].ok}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </div>
  );
}

function StepBox({
  step,
  idx,
  last,
  editable,
  onEdit,
}: {
  step: RunStep;
  idx: number;
  last: boolean;
  editable: boolean;
  onEdit: () => void;
}) {
  const look = stepLook(step.status);
  const sms = step.channel === "sms";
  const when =
    idx === 0
      ? "First message"
      : `${step.delay_days ?? 0} day${step.delay_days === 1 ? "" : "s"} after step ${idx}`;
  const date = step.sent_at ? `sent ${rel(step.sent_at)}` : step.scheduled_for ? future(step.scheduled_for) : null;
  const Icon = sms ? MessageSquare : Mail;
  const basisTone = step.based_on.kind === "notes_and_stage" ? "text-landing-sms" : "text-tb-ink-3";

  return (
    <li className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3">
      {!last ? <span aria-hidden className="absolute bottom-[-16px] left-[13.5px] top-8 w-px bg-tb-ink/[0.12]" /> : null}
      <span className="relative z-[1] mt-1 grid h-7 w-7 place-items-center rounded-full bg-tb-ink/[0.06] text-tb-ink-2">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pb-1.5 text-[12.5px] text-tb-ink-3">
          <b className="text-[13px] font-semibold text-tb-ink">
            {sms ? "SMS" : step.channel === "email" ? "Email" : step.channel} {step.step_number}
          </b>
          <span>{when}</span>
          {date ? <span>· {date}</span> : null}
          <span className="ml-auto flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {step.delivery_mode === "mock" ? (
              <span className="font-medium text-landing-sms" title="Recorded as sent, but not handed to the email or SMS provider">
                Mock: not really sent
              </span>
            ) : null}
            <span className={cn("inline-flex items-center gap-1", basisTone)}>
              <BookOpen className="h-3 w-3" />
              {basedOnLabel(step)}
            </span>
            <StatusChip look={look} />
            {editable ? (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-7 items-center gap-1 rounded-md px-2 font-medium text-tb-accent hover:bg-tb-ink/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgb(var(--tb-accent))]"
              >
                <PencilLine className="h-3.5 w-3.5" />
                Edit
              </button>
            ) : null}
          </span>
        </div>
        <div className="rounded-xl border border-tb-ink/[0.08] bg-[rgb(var(--tb-surface-strong)/0.7)]">
          {step.subject ? (
            <p className="border-b border-tb-ink/[0.07] px-4 py-2.5 text-sm font-semibold text-tb-ink">
              <Highlighted text={step.subject} />
            </p>
          ) : null}
          <p className="max-w-[68ch] whitespace-pre-wrap break-words px-4 py-3 text-[14.5px] leading-[1.7] text-tb-ink-2">
            <Highlighted text={step.body || ""} />
          </p>
          {step.status === "failed" && step.send_log ? (
            <p className="mx-4 mb-3 rounded-lg bg-landing-voice/[0.07] px-3 py-2 text-[12.5px] text-tb-ink-2">
              <b className="text-landing-voice">Failed:</b> {step.send_log}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function EditStepDialog({ sequenceId, step, onClose }: { sequenceId: string; step: RunStep; onClose: () => void }) {
  const [subject, setSubject] = useState(step.subject ?? "");
  const [body, setBody] = useState(step.body ?? "");
  const [updateStep, { isLoading }] = useUpdateSequenceStepMutation();
  const sms = step.channel === "sms";
  const leftover = textHasPlaceholder(subject) || textHasPlaceholder(body);

  const save = async () => {
    try {
      await updateStep({
        sequenceId,
        stepId: step.step_id,
        body: sms ? { content: body } : { subject, content: body },
      }).unwrap();
      showSuccess("Saved. The draft is still waiting for your approval.");
      onClose();
    } catch (error) {
      showError(apiErrorMessage(error, "Could not save the message."));
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl font-landing-sans">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-landing-display text-tb-ink">
            <PencilLine className="h-5 w-5 text-tb-accent" />
            Edit {sms ? "SMS" : "email"} {step.step_number}
          </DialogTitle>
        </DialogHeader>
        {!sms ? (
          <div className="space-y-1.5">
            <Label htmlFor="step-subject">Subject</Label>
            <Input id="step-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="step-body">Message</Label>
          <Textarea id="step-body" rows={sms ? 4 : 10} value={body} onChange={(e) => setBody(e.target.value)} />
          {sms ? <p className="text-xs text-tb-ink-3">{body.length} characters</p> : null}
        </div>
        {leftover ? (
          <NoteBox tone="warn" icon={AlertTriangle}>
            The text still contains a {"{{placeholder}}"}. It cannot be approved until it is replaced with real words.
          </NoteBox>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button className={btnPrimary} onClick={save} disabled={isLoading || !body.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
