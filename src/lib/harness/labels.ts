import type { LucideIcon } from "lucide-react";
import {
  Ban,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  MessageSquareReply,
  PauseCircle,
  PencilLine,
  Plus,
  Search,
  Send,
  Settings2,
  Sparkles,
  StopCircle,
  Upload,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";
import type { RunEvent, RunSequence, RunStep } from "@/types/harness";

/** Colour families from the steel theme, used by chips, icons and bars. */
export type Tone = "claude" | "warn" | "ok" | "blue" | "bad" | "mute";

export const TONE_CLASS: Record<
  Tone,
  { chip: string; text: string; bg: string; border: string; bar: string }
> = {
  claude: {
    chip: "border-landing-violet/35 bg-landing-violet/10 text-landing-violet",
    text: "text-landing-violet",
    bg: "bg-landing-violet/15",
    border: "border-landing-violet/40",
    bar: "bg-landing-violet",
  },
  warn: {
    chip: "border-landing-sms/35 bg-landing-sms/10 text-landing-sms",
    text: "text-landing-sms",
    bg: "bg-landing-sms/15",
    border: "border-landing-sms/40",
    bar: "bg-landing-sms",
  },
  ok: {
    chip: "border-landing-whatsapp/35 bg-landing-whatsapp/10 text-landing-whatsapp",
    text: "text-landing-whatsapp",
    bg: "bg-landing-whatsapp/15",
    border: "border-landing-whatsapp/40",
    bar: "bg-landing-whatsapp",
  },
  blue: {
    chip: "border-landing-email/35 bg-landing-email/10 text-landing-email",
    text: "text-landing-email",
    bg: "bg-landing-email/15",
    border: "border-landing-email/40",
    bar: "bg-landing-email",
  },
  bad: {
    chip: "border-landing-voice/35 bg-landing-voice/10 text-landing-voice",
    text: "text-landing-voice",
    bg: "bg-landing-voice/15",
    border: "border-landing-voice/40",
    bar: "bg-landing-voice",
  },
  mute: {
    chip: "border-landing-line bg-landing-fog/[0.05] text-landing-fog/65",
    text: "text-landing-fog/60",
    bg: "bg-landing-fog/[0.07]",
    border: "border-landing-line",
    bar: "bg-landing-fog/30",
  },
};

export type StatusLook = { label: string; tone: Tone; icon: LucideIcon };

// ── runs (tasks) ─────────────────────────────────────────────────────

export const RUN_STATUS: Record<string, StatusLook> = {
  in_progress: { label: "Claude is working", tone: "claude", icon: Sparkles },
  awaiting_approval: { label: "Waiting for you", tone: "warn", icon: Clock },
  completed: { label: "Done", tone: "ok", icon: CheckCircle2 },
  failed: { label: "Failed", tone: "bad", icon: XCircle },
  abandoned: { label: "Left unfinished", tone: "mute", icon: StopCircle },
};

export const runLook = (status: string): StatusLook =>
  RUN_STATUS[status] ?? { label: status, tone: "mute", icon: Sparkles };

/** The six phases of a task, as the stepper shows them. */
export const PHASES = [
  { key: "understand", label: "Understood the task", icon: Sparkles },
  { key: "find", label: "Found the leads", icon: Search },
  { key: "read", label: "Read the calls", icon: BookOpen },
  { key: "write", label: "Wrote the drafts", icon: PencilLine },
  { key: "ask", label: "Asked for approval", icon: Inbox },
  { key: "done", label: "Finished", icon: CheckCircle2 },
] as const;

export type PhaseKey = (typeof PHASES)[number]["key"];

/** Which phase each MCP tool belongs to, and its icon. Unknown tools count as "find". */
const TOOL_PHASE: Record<string, [PhaseKey, LucideIcon]> = {
  start_run: ["understand", Sparkles],
  get_run: ["understand", Sparkles],
  list_runs: ["understand", Sparkles],
  get_workspace_profile: ["understand", Settings2],
  list_templates: ["understand", FileText],
  get_template: ["understand", FileText],
  create_template: ["understand", FileText],
  update_template: ["understand", FileText],
  list_goals: ["understand", FileText],
  save_goal: ["understand", FileText],
  get_dashboard: ["understand", Settings2],
  list_recent_activity: ["understand", Settings2],
  search_leads: ["find", Search],
  get_lead: ["find", UserRound],
  create_lead: ["find", Plus],
  update_lead: ["find", UserRound],
  import_leads: ["find", Upload],
  mark_lead_do_not_contact: ["find", Ban],
  create_draft_sequences: ["find", Plus],
  list_sequences: ["find", Search],
  get_sequence: ["find", Search],
  get_sequence_activity: ["find", Search],
  list_lead_transcripts: ["read", BookOpen],
  get_lead_transcript: ["read", BookOpen],
  add_lead_transcript: ["read", BookOpen],
  list_lead_replies: ["read", MessageSquareReply],
  write_steps: ["write", PencilLine],
  update_sequence: ["write", PencilLine],
  reschedule_step: ["write", CalendarClock],
  reorder_steps: ["write", PencilLine],
  remove_step: ["write", PencilLine],
  skip_step: ["write", PencilLine],
  pause_sequence: ["write", PauseCircle],
  resume_sequence: ["write", Send],
  activate_sequence: ["ask", Send],
  update_workspace_settings: ["understand", Settings2],
  delete_lead: ["find", Ban],
  clear_do_not_contact: ["find", Ban],
  stop_sequence: ["write", StopCircle],
  request_approval: ["ask", Inbox],
  finish_run: ["done", CheckCircle2],
};

export const toolPhase = (tool: string): PhaseKey => TOOL_PHASE[tool]?.[0] ?? "find";
export const toolIcon = (tool: string): LucideIcon => TOOL_PHASE[tool]?.[1] ?? Wrench;

/** Plain words for the error codes a safety rule or a check can return. */
const ERROR_TEXT: Record<string, string> = {
  TRANSCRIPT_NOT_READ: "Claude must read the lead's latest call before writing",
  PLACEHOLDER_LEFT: "The draft still had a {{placeholder}}",
  DO_NOT_CONTACT: "This lead is do-not-contact",
  CHANNEL_NOT_SUPPORTED: "Claude may prepare email and SMS only",
  HUMAN_ONLY: "Only a person can do this, in the app",
  NOT_A_DRAFT: "Only drafts can be changed this way",
  MISSING_ADDRESS: "The lead has no address for this channel",
  CONFLICT: "It clashed with something already there",
  INTERNAL: "Something went wrong on the server",
  RUN_CLOSED: "The task was already closed",
  RUN_NOT_FOUND: "Unknown task",
  LIMIT_EXCEEDED: "A limit was reached",
  VALIDATION: "The request was not valid",
  NOT_FOUND: "Not found",
  RATE_LIMITED: "Too many calls at once",
};

export const errorText = (code: string | null) =>
  code ? ERROR_TEXT[code] ?? code.toLowerCase().replace(/_/g, " ") : "Refused";

/** The phase a run is in now, from its newest event. */
export const currentPhaseIndex = (events: RunEvent[]) => {
  if (!events.length) return 0;
  const key = toolPhase(events[events.length - 1].tool);
  return PHASES.findIndex((p) => p.key === key);
};

/** Shortens a client string like "claude-code/2.1.326 (claude-desktop, …)". */
export const clientLabel = (client: string | null) => {
  if (!client) return "Claude";
  const c = client.toLowerCase();
  if (c.startsWith("claude-code")) return "Claude Code";
  if (c.startsWith("claude")) return "Claude desktop app";
  return client.split(/[ /(]/)[0];
};

// ── sequences (follow-ups) ───────────────────────────────────────────

/**
 * One label for where a follow-up made by Claude stands.
 * "Approved · scheduled" is an active sequence whose steps have not gone out yet.
 */
export const sequenceLook = (
  s: Pick<RunSequence, "status" | "approval_status" | "steps">
): StatusLook => {
  if (s.status === "draft") {
    return s.approval_status === "awaiting_approval"
      ? { label: "Waiting for you", tone: "warn", icon: Clock }
      : { label: "Claude is writing", tone: "claude", icon: Sparkles };
  }
  if (s.status === "active") {
    return s.steps.some((st) => st.status === "sent")
      ? { label: "Sending", tone: "ok", icon: Send }
      : { label: "Approved · scheduled", tone: "blue", icon: CalendarClock };
  }
  if (s.status === "paused") return { label: "Paused", tone: "mute", icon: PauseCircle };
  if (s.status === "completed") return { label: "Done", tone: "ok", icon: CheckCircle2 };
  if (s.status === "cancelled") return { label: "Rejected / stopped", tone: "bad", icon: XCircle };
  return { label: s.status, tone: "mute", icon: Clock };
};

export const PAUSED_REASON: Record<string, string> = {
  lead_replied: "The lead replied, so this follow-up paused itself.",
  do_not_contact: "The lead was marked do-not-contact.",
  changed_after_approval: "A message or address changed after approval. Approve it again before it can send.",
  not_approved: "It was never approved, so nothing was sent.",
  paused_by_claude: "Claude paused it.",
  paused_by_user: "You paused it.",
};

export const STEP_STATUS: Record<string, StatusLook> = {
  draft: { label: "Draft", tone: "mute", icon: PencilLine },
  pending: { label: "Pending", tone: "warn", icon: Clock },
  scheduled: { label: "Scheduled", tone: "blue", icon: CalendarClock },
  sending: { label: "Sending", tone: "claude", icon: Send },
  calling: { label: "Calling", tone: "claude", icon: Send },
  sent: { label: "Sent", tone: "ok", icon: CheckCircle2 },
  failed: { label: "Failed", tone: "bad", icon: XCircle },
  skipped: { label: "Skipped", tone: "mute", icon: Ban },
};

export const stepLook = (status: string): StatusLook =>
  STEP_STATUS[status] ?? { label: status, tone: "mute", icon: Clock };

const PLACEHOLDER = /\{\{[^}]*\}\}/;
export const textHasPlaceholder = (text: string | null | undefined) => PLACEHOLDER.test(text ?? "");
export const hasPlaceholder = (step: Pick<RunStep, "subject" | "body">) =>
  textHasPlaceholder(step.subject) || textHasPlaceholder(step.body);

/** "Based on: call of 12 Oct" / "No call transcript" / "Basis not stated". */
export const basedOnLabel = (step: RunStep) => {
  if (step.based_on.kind === "transcript") {
    const t = step.based_on.transcripts[0];
    return t ? `Based on: call of ${shortDate(t.meeting_date)}` : "Based on a call";
  }
  if (step.based_on.kind === "notes_and_stage") return "No call transcript";
  return "Basis not stated";
};

// ── dates ────────────────────────────────────────────────────────────

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");

export const shortDate = (iso: string) => {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return `${d.getDate()} ${MON[d.getMonth()]}`;
};
export const hm = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const dayLabel = (iso: string) => {
  const d = new Date(iso);
  return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
};
export const fullDate = (iso: string) => `${dayLabel(iso)}, ${hm(iso)}`;

export const future = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return `today ${hm(iso)}`;
  if (d.toDateString() === tomorrow.toDateString()) return `tomorrow ${hm(iso)}`;
  return fullDate(iso);
};

/** "just now", "5 min ago", "3 h ago", "yesterday 14:05", "Mon 17 Nov". */
export const rel = (iso: string | null | undefined) => {
  if (!iso) return "never";
  const d = new Date(iso);
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < -60) return future(iso);
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return `${Math.round(s / 3600)} h ago`;
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return `yesterday ${hm(iso)}`;
  return dayLabel(iso);
};

/** Day group heading for lists: "Today", "Yesterday", "Mon 17 Nov". */
export const dayGroup = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return dayLabel(iso);
};

/** The error message an RTK Query call returned, as the backend wrote it. */
export const apiErrorMessage = (error: unknown, fallback = "Something went wrong.") => {
  const e = error as { data?: { message?: string }; error?: string } | undefined;
  return e?.data?.message || e?.error || fallback;
};
