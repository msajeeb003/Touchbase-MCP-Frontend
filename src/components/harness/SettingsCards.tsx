import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Ban,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  KeyRound,
  Loader2,
  Mail,
  MessageSquareReply,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiErrorMessage, dayLabel, rel, type Tone } from "@/lib/harness/labels";
import {
  useCreateMcpTokenMutation,
  useGetMcpTokensQuery,
  useRevokeMcpTokenMutation,
} from "@/store/features/harness/harnessApi";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/store/features/settings/settingsApi";
import type { McpTokenCreated } from "@/types/harness";
import { showError, showSuccess } from "@/utils/toast";
import { Chip, IconCircle, NoteBox, dangerBtn, outlineBtn, primaryBtn } from "./ui";

const sectionCardClass = "overflow-hidden rounded-2xl border border-landing-line bg-landing-steel-2";

function SectionHead({ icon: Icon, title, sub, right, iconClass = "text-landing-sky" }: {
  icon: typeof KeyRound;
  title: string;
  sub: string;
  right?: React.ReactNode;
  iconClass?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-landing-line bg-landing-fog/[0.03] px-4 py-3">
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 ${iconClass}`} />
        <div>
          <h3 className="font-landing-display font-bold text-landing-fog">{title}</h3>
          <p className="text-xs text-landing-fog/55">{sub}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

/** Where Claude connects: the backend's origin plus /mcp. */
const mcpUrl = () => {
  try {
    return `${new URL(import.meta.env.VITE_BASE_URL as string).origin}/mcp`;
  } catch {
    return "http://127.0.0.1:5001/mcp";
  }
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement("textarea");
    t.value = text;
    document.body.appendChild(t);
    t.select();
    try {
      document.execCommand("copy");
    } catch {
      /* nothing more to try */
    }
    t.remove();
  }
}

function CodeBlock({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="relative">
      <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg border border-landing-line bg-landing-steel px-3 py-2.5 pr-20 font-landing-mono text-[11.5px] leading-relaxed text-landing-fog/85">
        {text}
      </pre>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="absolute right-1.5 top-1.5 h-7 gap-1 px-2 text-landing-sky hover:bg-landing-fog/5 hover:text-landing-sky"
        onClick={async () => {
          await copyText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1500);
        }}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {done ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

const connectCommand = (token: string) =>
  `claude mcp add --transport http touchbase ${mcpUrl()} --header "Authorization: Bearer ${token}"`;

// ── Connect Claude (access tokens) ────────────────────────────────────

export function ClaudeAccessCard() {
  const { data, isLoading } = useGetMcpTokensQuery();
  const [createToken, { isLoading: creating }] = useCreateMcpTokenMutation();
  const [revokeToken, { isLoading: revoking }] = useRevokeMcpTokenMutation();
  const [name, setName] = useState("My Claude");
  const [days, setDays] = useState("90");
  const [made, setMade] = useState<McpTokenCreated | null>(null);
  const [help, setHelp] = useState(false);
  const location = useLocation();

  // Links such as /dashboard/settings#claude-access scroll to their section.
  useEffect(() => {
    const id = location.hash.slice(1);
    if (!id) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    return () => window.clearTimeout(t);
  }, [location.hash]);

  const now = Date.now();
  const tokens = (data?.data ?? []).filter((t) => !t.revokedAt && (!t.expiresAt || new Date(t.expiresAt).getTime() > now));
  const connected = tokens.length > 0;

  const create = async () => {
    try {
      const res = await createToken({ name: name.trim() || "My Claude", expiresInDays: Number(days) }).unwrap();
      setMade(res.data);
    } catch (error) {
      showError(apiErrorMessage(error, "Could not create the token."));
    }
  };

  const revoke = async (id: string) => {
    try {
      await revokeToken(id).unwrap();
      showSuccess("Token revoked. Claude can no longer use it.");
    } catch (error) {
      showError(apiErrorMessage(error, "Could not revoke the token."));
    }
  };

  return (
    <section id="claude-access" className={sectionCardClass}>
      <SectionHead
        icon={KeyRound}
        title="Connect Claude"
        sub="Claude reaches Touchbase through an access token made for you. Revoke it at any time."
        right={connected ? <Chip tone="ok" icon={Check}>Connected</Chip> : <Chip tone="bad">Not connected</Chip>}
      />
      <div className="space-y-3 p-4">
        {isLoading ? (
          <p className="text-sm text-landing-fog/55">Loading tokens…</p>
        ) : tokens.length ? (
          tokens.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-landing-line px-3 py-2.5">
              <IconCircle tone="ok" icon={KeyRound} size="sm" />
              <div className="min-w-0 flex-1">
                <b className="text-sm text-landing-fog">{t.name}</b>
                <div className="font-landing-mono text-[11.5px] text-landing-fog/50">
                  {t.prefix}… · last used {rel(t.lastUsedAt)}
                  {t.expiresAt ? ` · expires ${dayLabel(t.expiresAt)}` : ""}
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className={dangerBtn} disabled={revoking}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Revoke
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="font-landing-sans">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-landing-fog">Revoke “{t.name}”?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Claude stops working with Touchbase right away for anyone using this token. Drafts it already made stay in the Review Queue.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-landing-voice text-landing-steel hover:bg-landing-voice/90" onClick={() => revoke(t.id)}>
                      Revoke
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <NoteBox tone="warn" icon={AlertTriangle}>
            No token. Claude cannot reach Touchbase until you create one.
          </NoteBox>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px_auto] md:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="token-name">Name</Label>
            <Input id="token-name" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="My Claude" />
          </div>
          <div className="space-y-1.5">
            <Label>Valid for</Label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="button" className={primaryBtn} onClick={create} disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create access token
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setHelp((h) => !h)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-landing-sky hover:underline"
        >
          {help ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <Terminal className="h-4 w-4" />
          How to connect
        </button>
        {help ? (
          <div className="space-y-2.5 rounded-xl border border-landing-line bg-landing-fog/[0.02] p-3.5 text-[13px] text-landing-fog/75">
            <p>
              <b className="text-landing-fog">Claude Code:</b> create a token above, then run this in a terminal (the token dialog fills in your token):
            </p>
            <CodeBlock text={connectCommand("PASTE_TOKEN_HERE")} />
            <p>
              <b className="text-landing-fog">Claude desktop app:</b> Settings → Developer → Edit Config, and add the Touchbase server as described in the hand-over guide. Restart the app afterwards.
            </p>
            <p className="text-landing-fog/55">
              The token works only on the Touchbase MCP server ({mcpUrl()}), never for signing in to this app.
            </p>
          </div>
        ) : null}
      </div>

      <Dialog open={made !== null} onOpenChange={(o) => !o && setMade(null)}>
        {made ? (
          <DialogContent className="max-w-xl font-landing-sans">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-landing-display text-landing-fog">
                <KeyRound className="h-5 w-5 text-landing-whatsapp" />
                Copy your token now
              </DialogTitle>
            </DialogHeader>
            <NoteBox tone="warn" icon={Eye}>
              It is shown only this once. Touchbase keeps a fingerprint of it, not the token itself, so it cannot be shown again.
            </NoteBox>
            <CodeBlock text={made.token} />
            <p className="text-[13px] text-landing-fog/70">To connect Claude Code, run:</p>
            <CodeBlock text={connectCommand(made.token)} />
            <div className="flex justify-end">
              <Button className={primaryBtn} onClick={() => setMade(null)}>
                <Check className="h-4 w-4" />
                I have copied it
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  );
}

// ── Send window ───────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);
const FALLBACK_ZONES = [
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
];

export function SendWindowCard() {
  const { data } = useGetSettingsQuery();
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation();
  const s = data?.data;
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [weekends, setWeekends] = useState(false);
  const [tz, setTz] = useState<string>("");

  useEffect(() => {
    if (!s) return;
    setStart(s.sendWindowStart ?? "09:00");
    setEnd(s.sendWindowEnd ?? "18:00");
    setWeekends(Boolean(s.sendOnWeekends));
    setTz(s.sendTimezone ?? "");
  }, [s]);

  const zones = useMemo(() => {
    const intl = Intl as unknown as { supportedValuesOf?: (k: string) => string[] };
    const list = intl.supportedValuesOf ? intl.supportedValuesOf("timeZone") : FALLBACK_ZONES;
    return tz && !list.includes(tz) ? [tz, ...list] : list;
  }, [tz]);
  const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hourOptions = useMemo(() => {
    const set = new Set(HOURS);
    [start, end].forEach((v) => v && set.add(v));
    return [...set].sort();
  }, [start, end]);

  const save = async () => {
    if (start >= end) {
      showError("The start time must be before the end time.");
      return;
    }
    try {
      await updateSettings({
        sendWindowStart: start,
        sendWindowEnd: end,
        sendOnWeekends: weekends,
        sendTimezone: tz || null,
      }).unwrap();
      showSuccess("Send window saved.");
    } catch (error) {
      showError(apiErrorMessage(error, "Could not save the send window."));
    }
  };

  return (
    <section id="send-window" className={sectionCardClass}>
      <SectionHead
        icon={Clock}
        title="Send window"
        sub="Follow-ups Claude prepared go out only between these hours. Applied when you approve, checked again just before sending."
        right={<Chip>Only you can change this</Chip>}
      />
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>From</Label>
          <Select value={start} onValueChange={setStart}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Until</Label>
          <Select value={end} onValueChange={setEnd}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Timezone</Label>
          <Select value={tz || "none"} onValueChange={(v) => setTz(v === "none" ? "" : v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="none">Not set (approvals are refused)</SelectItem>
              {zones.map((z) => (
                <SelectItem key={z} value={z}>
                  {z}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!tz ? (
            <NoteBox tone="warn" icon={AlertTriangle} className="mt-2">
              Without a timezone, no follow-up Claude prepared can be approved.{" "}
              {browserZone ? (
                <button type="button" className="text-landing-sky hover:underline" onClick={() => setTz(browserZone)}>
                  Use {browserZone}
                </button>
              ) : null}
            </NoteBox>
          ) : null}
        </div>
        <label className="flex items-center gap-3 md:col-span-2">
          <Switch checked={weekends} onCheckedChange={setWeekends} />
          <span className="text-sm">Also send on Saturdays and Sundays</span>
        </label>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <Button type="button" className={primaryBtn} onClick={save} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save send window
          </Button>
          <span className="text-xs text-landing-fog/50">Follow-ups you build yourself in Sequences are not affected.</span>
        </div>
      </div>
    </section>
  );
}

// ── Safety rules and the tool list ────────────────────────────────────

const RULES: [typeof ShieldCheck, Tone, string, string][] = [
  [ShieldCheck, "ok", "Claude prepares, you release", "No tool can switch on a follow-up or send a message. Claude creates drafts and asks for approval. Only a person signed in to this app can approve."],
  [Server, "ok", "Mock mode by default", "Unless the server is set to live, Touchbase does everything except hand the message to the email or SMS provider. Such steps are labelled “Mock”."],
  [BookOpen, "claude", "Read the call first", "If a lead has a saved call, Claude must read the most recent one in the same task before it may write. Every draft shows what it was based on."],
  [AlertTriangle, "warn", "No {{placeholders}}", "A draft that still contains something like {{lead.name}} cannot be saved by Claude or approved by you."],
  [Ban, "bad", "Do-not-contact", "Checked when a lead is added, when a draft is made, at approval and just before sending. Claude can set it; only a person can clear it."],
  [Mail, "blue", "Email and SMS only", "WhatsApp and phone calls can be read but not prepared by Claude."],
  [RefreshCw, "ok", "Never sent twice", "Each step is claimed before it is sent. Asking Claude the same thing twice changes nothing: one draft per lead per task."],
  [Clock, "blue", "Send window", "Messages go out only between your hours, on weekdays unless you allow weekends. Without a timezone, approval is refused."],
  [MessageSquareReply, "claude", "Pause on reply", "When a lead replies, their follow-up pauses by itself."],
  [Eye, "claude", "Lead text is data", "Anything written by a lead (replies, transcripts, notes) reaches Claude labelled as untrusted data. Claude does not follow instructions found in it."],
];

const TOOLS: [string, [string, "R" | "W", string][]][] = [
  ["Tasks", [["start_run", "W", "Opens a task for each instruction"], ["get_run", "R", "Reads what a task did"], ["list_runs", "R", "Lists earlier tasks"], ["finish_run", "W", "Closes the task with a summary"]]],
  ["Leads", [["search_leads", "R", "Finds leads, e.g. “no reply in 30 days”"], ["get_lead", "R", "Reads one lead"], ["create_lead", "W", "Adds one lead (duplicates matched)"], ["update_lead", "W", "Corrects details"], ["import_leads", "W", "Adds a pasted list"], ["mark_lead_do_not_contact", "W", "Blocks a lead. Cannot unblock"]]],
  ["Calls, notes, replies", [["list_lead_transcripts", "R", "Lists saved calls"], ["get_lead_transcript", "R", "Reads a call (required before writing)"], ["list_lead_replies", "R", "Reads replies, as data"], ["add_lead_transcript", "W", "Saves pasted call notes"]]],
  ["Templates and profile", [["list_templates", "R", "Your saved templates"], ["get_template", "R", "Tone and booking link for a stage"], ["create_template", "W", "Saves a template"], ["update_template", "W", "Changes a template"], ["list_goals", "R", "Saved goals"], ["save_goal", "W", "Saves a goal"], ["get_workspace_profile", "R", "Sender name, channels, send window. Never secrets"]]],
  ["Follow-ups", [["list_sequences", "R", "Finds follow-ups"], ["get_sequence", "R", "Reads one, with steps"], ["create_draft_sequences", "W", "Starts drafts (one per lead per task)"], ["update_sequence", "W", "Renames, goal, tone"], ["write_steps", "W", "Writes the messages"], ["reschedule_step", "W", "Moves a step"], ["reorder_steps", "W", "Changes the order"], ["remove_step", "W", "Removes a draft step"], ["skip_step", "W", "Leaves a step out"], ["request_approval", "W", "Sends drafts to your Review Queue"], ["pause_sequence", "W", "Holds a running follow-up"], ["resume_sequence", "W", "Off: only you can resume"], ["stop_sequence", "W", "Ends a follow-up"], ["get_sequence_activity", "R", "History of one follow-up"]]],
  ["Reporting", [["get_dashboard", "R", "The numbers on your dashboard"], ["list_recent_activity", "R", "What was sent, failed or replied lately"]]],
];

export function SafetyRulesCard() {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const total = TOOLS.reduce((n, [, t]) => n + t.length, 0);
  const reads = TOOLS.reduce((n, [, t]) => n + t.filter((x) => x[1] === "R").length, 0);
  return (
    <section id="claude-safety" className={sectionCardClass}>
      <SectionHead
        icon={ShieldCheck}
        iconClass="text-landing-whatsapp"
        title="Safety rules for Claude"
        sub="Always on. Enforced by the Touchbase server, not by Claude."
      />
      <div className="grid grid-cols-1 divide-y divide-landing-line md:grid-cols-2 md:divide-y-0">
        {RULES.map(([Icon, tone, title, text]) => (
          <div key={title} className="flex items-start gap-3 border-landing-line px-4 py-3 md:border-b">
            <IconCircle tone={tone} icon={Icon} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <b className="text-sm text-landing-fog">{title}</b>
                <Chip tone="ok" className="ml-auto">On</Chip>
              </div>
              <p className="mt-0.5 text-[12.5px] text-landing-fog/60">{text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-landing-line px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Server className="h-4 w-4 text-landing-sky" />
          <b className="text-sm text-landing-fog">What Claude can do in Touchbase</b>
          <span className="text-xs text-landing-fog/50">
            {total} tools · {reads} read · {total - reads} write · none can send
          </span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map(([group, tools], gi) => (
            <div key={group} className="rounded-xl border border-landing-line">
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [gi]: !o[gi] }))}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-landing-fog/[0.03]"
              >
                <b className="flex-1 text-sm text-landing-fog">{group}</b>
                <span className="text-xs text-landing-fog/45">{tools.length} tools</span>
                {open[gi] ? <ChevronDown className="h-4 w-4 text-landing-fog/45" /> : <ChevronRight className="h-4 w-4 text-landing-fog/45" />}
              </button>
              {open[gi] ? (
                <div className="space-y-2 border-t border-landing-line px-3 py-2.5">
                  {tools.map(([n, rw, d]) => (
                    <div key={n} className="flex items-start gap-2">
                      <Chip tone={rw === "R" ? "mute" : "blue"}>{rw === "R" ? "Read" : "Write"}</Chip>
                      <div className="min-w-0">
                        <div className="font-landing-mono text-[11.5px] text-landing-fog/85">{n}</div>
                        <div className="text-[12px] text-landing-fog/55">{d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
