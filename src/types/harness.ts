/**
 * AI harness: what Claude did in Touchbase through the MCP server.
 * Shapes match the backend's /runs, /mcp-tokens and /activity endpoints
 * (snake_case, as the backend sends them).
 */

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface HarnessPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export type RunStatus =
  | "in_progress"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "abandoned";

export interface RunCounts {
  sequences: number;
  awaiting_approval: number;
  active: number;
  paused: number;
  steps_sent: number;
  steps_failed: number;
  drafts_with_no_call_transcript: number;
}

export interface RunItem {
  run_id: string;
  status: RunStatus | string;
  instruction: string;
  summary: string | null;
  client: string | null;
  started_at: string;
  finished_at: string | null;
  counts?: RunCounts;
}

export interface RunTouched {
  type: string;
  id: string;
  label?: string;
}

export interface RunEvent {
  seq: number;
  tool: string;
  ok: boolean;
  error_code: string | null;
  duration_ms: number | null;
  at: string;
  summary: string;
  touched: RunTouched[];
}

export interface RunEventsPage {
  events: RunEvent[];
  last_seq: number;
  has_more: boolean;
}

export interface BasedOn {
  kind: "transcript" | "notes_and_stage" | "not_stated" | string;
  transcripts: { id: string; meeting_date: string; untrusted_meeting_title: string | null }[];
  note: string | null;
}

export interface RunStep {
  step_id: string;
  step_number: number;
  channel: "email" | "sms" | "whatsapp" | "call" | string;
  status: string;
  delay_days: number | null;
  scheduled_for: string | null;
  sent_at: string | null;
  delivery_mode: "mock" | "live" | null;
  subject?: string | null;
  body?: string | null;
  send_log?: string | null;
  based_on: BasedOn;
}

export interface RunSequence {
  sequence_id: string;
  name: string;
  status: string;
  approval_status: "none" | "awaiting_approval" | "approved" | string;
  approved_at: string | null;
  paused_reason: string | null;
  no_call_transcript: boolean;
  transcript_added_since: boolean;
  lead: {
    lead_id: string;
    do_not_contact: boolean;
    /** Typed or imported by someone else: shown as plain text, never as markup. */
    untrusted: { name: string; company: string | null };
  };
  steps: RunStep[];
}

/** A follow-up together with the task (run) Claude made it in. */
export interface HarnessSequence extends RunSequence {
  run: RunItem;
}

export interface RunSequencesPage {
  items: RunSequence[];
  pagination: HarnessPagination;
}

export interface RunDetail {
  run: RunItem;
  events: RunEventsPage;
  sequences: RunSequencesPage;
}

export interface RunsPage {
  items: RunItem[];
  pagination: HarnessPagination;
}

export interface McpToken {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface McpTokenCreated extends McpToken {
  /** Shown once. The list never returns it again. */
  token: string;
}

export interface ActivityEvent {
  at: string;
  type: string;
  actor: string;
  sequence_id: string | null;
  step_number: number | null;
  channel: string | null;
  /** Null for a settings change. */
  lead_id: string | null;
  untrusted: { lead_name: string | null };
  untrusted_details: Record<string, unknown>;
}

export interface ActivityPage {
  since: string;
  events: ActivityEvent[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  notes: string[];
}
