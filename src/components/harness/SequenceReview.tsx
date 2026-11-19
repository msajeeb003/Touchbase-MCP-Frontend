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
import { Chip, NoteBox, StatusChip, dangerBtn, outlineBtn, primaryBtn } from "./ui";

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
        <Button className={primaryBtn} disabled={saving || placeholder} onClick={() => setConfirm("approve")}>
          <Check className="h-4 w-4" />
          Approve
        </Button>
        <Button variant="outline" className={outlineBtn} onClick={() => setEditing(seq.steps[0])}>
          <PencilLine className="h-4 w-4" />
          Edit
        </Button>
        <Button variant="outline" className={dangerBtn} disabled={saving} onClick={() => setConfirm("reject")}>
          <X className="h-4 w-4" />
          Reject
        </Button>
      </>
    );
  } else if (seq.status === "active") {
    actions = (
      <>
        <Button variant="outline" className={outlineBtn} disabled={saving} onClick={() => setConfirm("pause")}>
          <PauseCircle className="h-4 w-4" />
          Pause
        </Button>
        <Button variant="outline" className={dangerBtn} disabled={saving} onClick={() => setConfirm("stop")}>
          <StopCircle className="h-4 w-4" />
          Stop for good
        </Button>
      </>
    );
  } else if (seq.status === "paused") {
    actions = (
      <>
        <Button className={primaryBtn} disabled={saving} onClick={() => setConfirm("resume")}>
          <Play className="h-4 w-4" />
          {seq.paused_reason === "changed_after_approval" ? "Approve again" : "Resume"}
        </Button>
        <Button variant="outline" className={dangerBtn} disabled={saving} onClick={() => setConfirm("stop")}>
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

  return (
    <div className="flex min-h-0 flex-col">
      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 break-words font-landing-display text-xl font-bold tracking-[-0.01em] text-landing-fog">
            {seq.lead.untrusted.name}
          </h3>
          <StatusChip look={look} className="ml-auto" />
        </div>
        <div className="mt-0.5 text-sm text-landing-fog/55">{seq.lead.untrusted.company || "No company"}</div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
          <Link to={`/dashboard/leads/${seq.lead.lead_id}/transcripts`} className="inline-flex items-center gap-1 text-landing-sky hover:underline">
            <History className="h-3.5 w-3.5" />
            Lead and calls
          </Link>
          <Link to={`/dashboard/sequences/${seq.sequence_id}/view`} className="inline-flex items-center gap-1 text-landing-sky hover:underline">
            <Mail className="h-3.5 w-3.5" />
            Open in Sequences
          </Link>
        </div>
        <Link
          to={`/dashboard/ai-tasks/${seq.run.run_id}`}
          className="mt-2 inline-flex max-w-full items-center gap-1 text-[12.5px] text-landing-violet hover:underline"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Prepared by Claude in the task “{seq.run.instruction}”</span>
        </Link>
      </div>

      <div className="space-y-3 px-5 py-4">
        {lastError ? (
          <NoteBox tone="bad" icon={XCircle}>
            <b>Not done.</b> {lastError}
          </NoteBox>
        ) : null}
        {seq.lead.do_not_contact ? (
          <NoteBox tone="bad" icon={Ban}>
            <b>This lead is do-not-contact.</b> Touchbase refuses to approve or send this follow-up. Only a person can clear it, on the Leads page.
          </NoteBox>
        ) : null}
        {placeholder ? (
          <NoteBox tone="warn" icon={AlertTriangle}>
            <b>A placeholder is left in the text</b> (highlighted below). Nothing fills it at send time, so the lead would see it. Edit the message before approving.
          </NoteBox>
        ) : null}
        {seq.transcript_added_since ? (
          <NoteBox tone="blue" icon={BookOpen}>
            A call transcript was added for this lead after Claude wrote this draft. You may want Claude to write it again.
          </NoteBox>
        ) : null}
        {seq.status === "paused" && seq.paused_reason ? (
          <NoteBox tone={seq.paused_reason === "lead_replied" ? "ok" : "mute"} icon={seq.paused_reason === "lead_replied" ? MessageSquareReply : PauseCircle}>
            <b>Paused.</b> {PAUSED_REASON[seq.paused_reason] ?? seq.paused_reason}
          </NoteBox>
        ) : null}
        {seq.status === "cancelled" ? (
          <NoteBox tone="bad" icon={XCircle}>
            <b>Rejected or stopped.</b> Nothing more will be sent.
          </NoteBox>
        ) : null}
        {seq.status === "active" && seq.approved_at ? (
          <NoteBox tone="blue" icon={CalendarClock}>
            <b>Approved {rel(seq.approved_at)}.</b>{" "}
            {nextStep?.scheduled_for ? `Next message ${future(nextStep.scheduled_for)}, inside your send window.` : "The messages go out inside your send window."}
          </NoteBox>
        ) : null}

        <div className="rounded-xl border border-landing-sky/25 bg-landing-sky/[0.06] p-3.5">
          <div className="flex items-center gap-1.5 font-landing-mono text-[10.5px] uppercase tracking-[0.12em] text-landing-sky">
            <Sparkles className="h-3 w-3" />
            Why Claude wrote it this way
          </div>
          {note ? <p className="mt-1.5 whitespace-pre-wrap text-sm text-landing-fog/85">{note}</p> : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {seq.no_call_transcript ? (
              <>
                <Chip tone="warn" icon={BookOpen}>No call transcript</Chip>
                <span className="text-[12.5px] text-landing-fog/55">Written from the lead's notes and stage.</span>
                <Link to={`/dashboard/leads/${seq.lead.lead_id}/transcripts`} className="text-[12.5px] text-landing-sky hover:underline">
                  Add a call transcript
                </Link>
              </>
            ) : firstTranscript ? (
              <>
                <Chip tone="blue" icon={BookOpen}>
                  Based on: call of {firstTranscript.meeting_date}
                  {firstTranscript.untrusted_meeting_title ? ` · ${firstTranscript.untrusted_meeting_title}` : ""}
                </Chip>
                <span className="text-[12px] text-landing-fog/45">Claude had to read this call before it could write.</span>
              </>
            ) : (
              <Chip tone="mute">Basis not stated</Chip>
            )}
          </div>
        </div>

        <p className="pt-1 font-landing-mono text-[10.5px] uppercase tracking-[0.12em] text-landing-fog/45">
          The messages ({seq.steps.length} step{seq.steps.length === 1 ? "" : "s"})
        </p>
        <div className="space-y-2.5">
          {seq.steps.map((st, idx) => (
            <StepBox key={st.step_id} step={st} idx={idx} editable={awaiting} onEdit={() => setEditing(st)} />
          ))}
        </div>
      </div>

      {actions ? (
        <div className="sticky bottom-0 mt-auto flex flex-wrap gap-2 border-t border-landing-line bg-landing-steel-2/95 px-5 py-3 backdrop-blur">
          {actions}
          {awaiting && placeholder ? (
            <span className="self-center text-xs text-landing-sms">Remove the placeholder to approve.</span>
          ) : null}
        </div>
      ) : null}

      {editing ? (
        <EditStepDialog sequenceId={seq.sequence_id} step={editing} onClose={() => setEditing(null)} />
      ) : null}

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        {confirm ? (
          <AlertDialogContent className="font-landing-sans">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-landing-fog">{confirmText[confirm].title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmText[confirm].body}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={cn(confirm === "reject" || confirm === "stop" ? "bg-landing-voice text-landing-steel hover:bg-landing-voice/90" : primaryBtn)}
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

function StepBox({ step, idx, editable, onEdit }: { step: RunStep; idx: number; editable: boolean; onEdit: () => void }) {
  const look = stepLook(step.status);
  const sms = step.channel === "sms";
  const when =
    idx === 0
      ? "First message"
      : `${step.delay_days ?? 0} day${step.delay_days === 1 ? "" : "s"} after step ${idx}`;
  const date = step.sent_at ? `sent ${rel(step.sent_at)}` : step.scheduled_for ? future(step.scheduled_for) : null;

  return (
    <div className="overflow-hidden rounded-xl border border-landing-line bg-landing-steel">
      <div className="flex flex-wrap items-center gap-2 border-b border-landing-line px-3.5 py-2">
        {sms ? <MessageSquare className="h-4 w-4 text-landing-sms" /> : <Mail className="h-4 w-4 text-landing-email" />}
        <b className="text-[13px] text-landing-fog">
          {sms ? "SMS" : step.channel === "email" ? "Email" : step.channel} {step.step_number}
        </b>
        <span className="text-[12.5px] text-landing-fog/50">{when}</span>
        {date ? <span className="text-[12.5px] text-landing-fog/50">· {date}</span> : null}
        <span className="ml-auto flex items-center gap-1.5">
          {step.delivery_mode === "mock" ? (
            <Chip tone="warn" title="Recorded as sent, but not handed to the email or SMS provider">
              Mock: not really sent
            </Chip>
          ) : null}
          <Chip tone={step.based_on.kind === "transcript" ? "blue" : step.based_on.kind === "notes_and_stage" ? "warn" : "mute"} icon={BookOpen}>
            {basedOnLabel(step)}
          </Chip>
          <StatusChip look={look} />
          {editable ? (
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-landing-sky hover:bg-landing-fog/5 hover:text-landing-sky" onClick={onEdit}>
              <PencilLine className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : null}
        </span>
      </div>
      {step.subject ? (
        <div className="border-b border-landing-line px-3.5 py-2 text-sm font-semibold text-landing-fog">
          <Highlighted text={step.subject} />
        </div>
      ) : null}
      <div className="whitespace-pre-wrap break-words px-3.5 py-3 text-sm leading-relaxed text-landing-fog/85">
        <Highlighted text={step.body || ""} />
      </div>
      {step.status === "failed" && step.send_log ? (
        <div className="mx-3.5 mb-3 rounded-lg border border-landing-voice/35 bg-landing-voice/[0.07] px-3 py-2 text-[12.5px] text-landing-fog/80">
          <b className="text-landing-voice">Failed:</b> {step.send_log}
        </div>
      ) : null}
    </div>
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
          <DialogTitle className="flex items-center gap-2 font-landing-display text-landing-fog">
            <PencilLine className="h-5 w-5 text-landing-sky" />
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
          {sms ? <p className="text-xs text-landing-fog/50">{body.length} characters</p> : null}
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
          <Button className={primaryBtn} onClick={save} disabled={isLoading || !body.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
