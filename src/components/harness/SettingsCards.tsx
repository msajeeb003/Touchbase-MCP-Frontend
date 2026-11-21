import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Copy, Eye, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
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
import { SectionActions, SettingsSection } from "@/components/settings/SettingsLayout";
import { CLAUDE_PERMISSIONS, apiErrorMessage, dayLabel, rel, type ClaudePermissionKey } from "@/lib/harness/labels";
import { btnDanger, btnPrimary, btnQuiet, btnSm } from "@/lib/ds";
import { cn } from "@/lib/utils";
import {
  useCreateMcpTokenMutation,
  useGetMcpTokensQuery,
  useRevokeMcpTokenMutation,
} from "@/store/features/harness/harnessApi";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/store/features/settings/settingsApi";
import type { McpTokenCreated } from "@/types/harness";
import { showError, showSuccess } from "@/utils/toast";

/*
 * The Claude group of the Settings page. Each part is a SettingsSection and
 * saves on its own (tokens immediately, the others with their own button).
 */

/** Where Claude connects: the backend's origin plus /mcp. */
export const mcpUrl = () => {
  try {
    return `${new URL(import.meta.env.VITE_BASE_URL as string).origin}/mcp`;
  } catch {
    return "http://127.0.0.1:5001/mcp";
  }
};

export async function copyText(text: string) {
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

export function CodeBlock({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="relative">
      <pre className="tb-well overflow-x-auto whitespace-pre-wrap break-all px-3 py-2.5 pr-20 font-landing-mono text-[11.5px] leading-relaxed text-tb-ink-2">
        {text}
      </pre>
      <button
        type="button"
        className="absolute right-1.5 top-1.5 inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12.5px] font-medium text-tb-accent hover:bg-tb-ink/[0.05]"
        onClick={async () => {
          await copyText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1500);
        }}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {done ? "Copied" : "Copy"}
      </button>
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
    <SettingsSection
      id="claude-access"
      title="Connect Claude"
      desc="Access tokens Claude uses to reach Touchbase."
      status={isLoading ? undefined : connected ? { text: "Connected", tone: "ok" } : { text: "Not connected", tone: "warn" }}
    >
      {tokens.length ? (
        <ul className="divide-y divide-tb-ink/[0.07] rounded-xl border border-tb-ink/[0.08]">
          {tokens.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 px-3.5 py-2.5">
              <KeyRound className="h-4 w-4 shrink-0 text-tb-ink-3" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-tb-ink">{t.name}</p>
                <p className="font-landing-mono text-[11.5px] text-tb-ink-3">
                  {t.prefix}… · used {rel(t.lastUsedAt)}
                  {t.expiresAt ? ` · expires ${dayLabel(t.expiresAt)}` : ""}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" className={cn(btnDanger, btnSm)} disabled={revoking}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Revoke
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="font-landing-sans">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-tb-ink">Revoke “{t.name}”?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Claude stops working with Touchbase right away for anyone using this token. Drafts it already made stay in the Review Queue.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-landing-voice text-white hover:bg-landing-voice/90" onClick={() => revoke(t.id)}>
                      Revoke
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="token-name">New token name</Label>
          <Input id="token-name" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="My Claude" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="token-days">Valid for</Label>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger id="token-days">
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
        <Button type="button" variant="outline" className={btnQuiet} onClick={create} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create token
        </Button>
      </div>

      <details className="group">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[13px] font-medium text-tb-accent [&::-webkit-details-marker]:hidden">
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
          How to connect
        </summary>
        <div className="mt-2.5 space-y-2.5 text-[13px] text-tb-ink-2">
          <p>
            <b className="text-tb-ink">Claude Code:</b> create a token, then run this in a terminal. The token dialog fills in your token.
          </p>
          <CodeBlock text={connectCommand("PASTE_TOKEN_HERE")} />
          <p>
            <b className="text-tb-ink">Claude desktop app:</b> Settings → Developer → Edit Config, add the Touchbase server as in the hand-over guide, then restart the app.
          </p>
          <p className="text-tb-ink-3">The token works only on the Touchbase MCP server ({mcpUrl()}), never for signing in.</p>
        </div>
      </details>

      <Dialog open={made !== null} onOpenChange={(o) => !o && setMade(null)}>
        {made ? (
          <DialogContent className="max-w-xl font-landing-sans">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-landing-display text-tb-ink">
                <KeyRound className="h-5 w-5 text-tb-accent" />
                Copy your token now
              </DialogTitle>
            </DialogHeader>
            <p className="flex items-start gap-2 text-[13px] text-landing-sms">
              <Eye className="mt-0.5 h-4 w-4 shrink-0" />
              It is shown only this once. Touchbase keeps a fingerprint, not the token, so it cannot be shown again.
            </p>
            <CodeBlock text={made.token} />
            <p className="text-[13px] text-tb-ink-2">To connect Claude Code, run:</p>
            <CodeBlock text={connectCommand(made.token)} />
            <div className="flex justify-end">
              <Button className={btnPrimary} onClick={() => setMade(null)}>
                <Check className="h-4 w-4" />
                I have copied it
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </SettingsSection>
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
  const saved = {
    start: s?.sendWindowStart ?? "09:00",
    end: s?.sendWindowEnd ?? "18:00",
    weekends: Boolean(s?.sendOnWeekends),
    tz: s?.sendTimezone ?? "",
  };
  const [start, setStart] = useState(saved.start);
  const [end, setEnd] = useState(saved.end);
  const [weekends, setWeekends] = useState(saved.weekends);
  const [tz, setTz] = useState<string>(saved.tz);

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
  const changed = start !== saved.start || end !== saved.end || weekends !== saved.weekends || tz !== saved.tz;

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
    <SettingsSection
      id="send-window"
      title="Send window"
      desc="When Claude's follow-ups may go out. Sequences you build yourself are not affected."
      status={
        saved.tz
          ? { text: `${saved.start}–${saved.end}, ${saved.weekends ? "every day" : "weekdays"}`, tone: "ok" }
          : { text: "No timezone", tone: "warn" }
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[120px_120px_minmax(0,1fr)]">
        <div className="space-y-1.5">
          <Label htmlFor="sw-start">From</Label>
          <Select value={start} onValueChange={setStart}>
            <SelectTrigger id="sw-start">
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
          <Label htmlFor="sw-end">Until</Label>
          <Select value={end} onValueChange={setEnd}>
            <SelectTrigger id="sw-end">
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
        <div className="col-span-2 space-y-1.5 sm:col-span-1">
          <Label htmlFor="sw-tz">Timezone</Label>
          <Select value={tz || "none"} onValueChange={(v) => setTz(v === "none" ? "" : v)}>
            <SelectTrigger id="sw-tz">
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
        </div>
      </div>
      {!tz ? (
        <p className="text-[13px] text-landing-sms">
          Without a timezone, nothing Claude prepared can be approved.{" "}
          {browserZone ? (
            <button type="button" className="font-medium text-tb-accent hover:underline" onClick={() => setTz(browserZone)}>
              Use {browserZone}
            </button>
          ) : null}
        </p>
      ) : null}
      <label className="flex items-center gap-3 text-sm text-tb-ink-2">
        <Switch checked={weekends} onCheckedChange={setWeekends} />
        Also send on Saturdays and Sundays
      </label>
      <SectionActions>
        <Button type="button" className={cn(btnPrimary, btnSm)} onClick={save} disabled={isLoading || !changed}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save
        </Button>
      </SectionActions>
    </SettingsSection>
  );
}

// ── Claude permissions ────────────────────────────────────────────────

export function ClaudePermissionsCard() {
  const { data } = useGetSettingsQuery();
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation();
  const s = data?.data;
  const savedValues = useMemo<Record<ClaudePermissionKey, boolean>>(
    () => ({
      claudeCanActivate: Boolean(s?.claudeCanActivate),
      claudeCanResume: Boolean(s?.claudeCanResume),
      claudeCanEditSettings: Boolean(s?.claudeCanEditSettings),
      claudeCanDeleteLeads: Boolean(s?.claudeCanDeleteLeads),
      claudeCanClearDoNotContact: Boolean(s?.claudeCanClearDoNotContact),
    }),
    [s],
  );
  const savedCap = String(s?.claudeDailyActivationCap ?? 50);
  const [values, setValues] = useState(savedValues);
  const [cap, setCap] = useState(savedCap);

  useEffect(() => {
    setValues(savedValues);
    setCap(savedCap);
  }, [savedValues, savedCap]);

  const changed = cap !== savedCap || CLAUDE_PERMISSIONS.some((p) => values[p.key] !== savedValues[p.key]);
  const onCount = CLAUDE_PERMISSIONS.filter((p) => savedValues[p.key]).length;

  const save = async () => {
    const capNumber = Number(cap);
    if (!Number.isInteger(capNumber) || capNumber < 0 || capNumber > 500) {
      showError("The daily limit must be a whole number from 0 to 500.");
      return;
    }
    try {
      await updateSettings({ ...values, claudeDailyActivationCap: capNumber }).unwrap();
      showSuccess("Claude permissions saved.");
    } catch (error) {
      showError(apiErrorMessage(error, "Could not save Claude permissions."));
    }
  };

  return (
    <SettingsSection
      id="claude-permissions"
      title="Permissions"
      desc="What Claude may do beyond drafts, and only when you ask in your own message. Every action shows in AI Tasks."
      status={onCount ? { text: `${onCount} on`, tone: "warn" } : { text: "All off" }}
    >
      <ul className="divide-y divide-tb-ink/[0.07]">
        {CLAUDE_PERMISSIONS.map((p) => (
          <li key={p.key} className="first:pt-0">
            <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
              <span className="min-w-0">
                <span className="block text-sm font-medium text-tb-ink">{p.label}</span>
                <span className="mt-0.5 block text-[12.5px] leading-[18px] text-tb-ink-3">{p.risk}</span>
              </span>
              <Switch
                className="mt-0.5 shrink-0"
                checked={values[p.key]}
                onCheckedChange={(checked) => setValues((v) => ({ ...v, [p.key]: checked }))}
              />
            </label>
          </li>
        ))}
        <li className="flex flex-wrap items-center justify-between gap-3 pt-3">
          <Label htmlFor="claude-daily-cap" className="text-sm font-medium text-tb-ink">
            Daily limit for activations
          </Label>
          <Input
            id="claude-daily-cap"
            type="number"
            min={0}
            max={500}
            value={cap}
            onChange={(e) => setCap(e.target.value)}
            className="w-24 text-right tabular-nums"
          />
        </li>
      </ul>
      <SectionActions>
        <Button type="button" className={cn(btnPrimary, btnSm)} onClick={save} disabled={isLoading || !changed}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save
        </Button>
      </SectionActions>
    </SettingsSection>
  );
}

// ── Safety rules and the tool list ────────────────────────────────────

const RULES: [string, string][] = [
  ["Claude prepares, you release", "Claude makes drafts and asks for approval. Anything more only with a permission above, and only when you ask."],
  ["Mock mode by default", "Unless the server is set to live, nothing is handed to the email or SMS provider. Such steps are labelled “Mock”."],
  ["Read the call first", "If a lead has a saved call, Claude reads the latest one before writing. Each draft shows what it was based on."],
  ["No {{placeholders}}", "A draft with something like {{lead.name}} left in it cannot be saved or approved."],
  ["Do-not-contact", "Checked when a lead is added, drafted, approved and just before sending. A lead who asked to stop is never cleared."],
  ["Email and SMS only", "WhatsApp and calls can be read but not prepared by Claude."],
  ["Never sent twice", "Each step is claimed before sending. Asking twice changes nothing."],
  ["Send window", "Messages go out only in your hours. Without a timezone, approval is refused."],
  ["Pause on reply", "A reply by email or SMS pauses the follow-up. An SMS STOP blocks the lead for good."],
  ["Lead text is data", "Replies, transcripts and notes reach Claude labelled as untrusted. Claude does not follow instructions in them."],
];

const TOOLS: [string, [string, "R" | "W", string][]][] = [
  ["Tasks", [["start_run", "W", "Opens a task for each instruction"], ["get_run", "R", "Reads what a task did"], ["list_runs", "R", "Lists earlier tasks"], ["finish_run", "W", "Closes the task with a summary"]]],
  ["Leads", [["search_leads", "R", "Finds leads, e.g. “no reply in 30 days”"], ["get_lead", "R", "Reads one lead"], ["create_lead", "W", "Adds one lead (duplicates matched)"], ["update_lead", "W", "Corrects details"], ["import_leads", "W", "Adds a pasted list"], ["mark_lead_do_not_contact", "W", "Blocks a lead"], ["delete_lead", "W", "Hides a lead, restorable 30 days. Off unless allowed"], ["clear_do_not_contact", "W", "Unblocks a lead you or Claude blocked. Off unless allowed"]]],
  ["Calls, notes, replies", [["list_lead_transcripts", "R", "Lists saved calls"], ["get_lead_transcript", "R", "Reads a call (required before writing)"], ["list_lead_replies", "R", "Reads email and SMS replies, as data"], ["add_lead_transcript", "W", "Saves pasted call notes"]]],
  ["Templates and profile", [["list_templates", "R", "Your saved templates"], ["get_template", "R", "Tone and booking link for a stage"], ["create_template", "W", "Saves a template"], ["update_template", "W", "Changes a template"], ["list_goals", "R", "Saved goals"], ["save_goal", "W", "Saves a goal"], ["get_workspace_profile", "R", "Sender name, channels, send window, permissions. Never secrets"], ["update_workspace_settings", "W", "Timezone, hours, sender details. Off unless allowed"]]],
  ["Follow-ups", [["list_sequences", "R", "Finds follow-ups"], ["get_sequence", "R", "Reads one, with steps"], ["create_draft_sequences", "W", "Starts drafts (one per lead per task)"], ["update_sequence", "W", "Renames, goal, tone"], ["write_steps", "W", "Writes the messages"], ["reschedule_step", "W", "Moves a step"], ["reorder_steps", "W", "Changes the order"], ["remove_step", "W", "Removes a draft step"], ["skip_step", "W", "Leaves a step out"], ["request_approval", "W", "Sends drafts to your Review Queue"], ["activate_sequence", "W", "Starts approved drafts. Off unless allowed"], ["pause_sequence", "W", "Holds a running follow-up"], ["resume_sequence", "W", "Resumes a paused follow-up. Off unless allowed"], ["stop_sequence", "W", "Ends a follow-up"], ["get_sequence_activity", "R", "History of one follow-up"]]],
  ["Reporting", [["get_dashboard", "R", "The numbers on your dashboard"], ["list_recent_activity", "R", "What was sent, failed or replied lately"]]],
];

export function SafetyRulesCard() {
  const total = TOOLS.reduce((n, [, t]) => n + t.length, 0);
  const reads = TOOLS.reduce((n, [, t]) => n + t.filter((x) => x[1] === "R").length, 0);
  return (
    <SettingsSection
      id="claude-safety"
      title="Safety rules"
      desc="Always on. Enforced by the Touchbase server, not by Claude."
      status={{ text: "Always on", tone: "ok" }}
    >
      <ul className="grid grid-cols-1 gap-x-6 gap-y-3 xl:grid-cols-2">
        {RULES.map(([title, text]) => (
          <li key={title} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-landing-whatsapp" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-tb-ink">{title}</span>
              <span className="block text-[12.5px] leading-[18px] text-tb-ink-3">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      <details className="group">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[13px] font-medium text-tb-accent [&::-webkit-details-marker]:hidden">
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
          What Claude can do in Touchbase · {total} tools ({reads} read, {total - reads} write)
        </summary>
        <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {TOOLS.map(([group, tools]) => (
            <div key={group}>
              <p className="tb-label mb-1.5">{group}</p>
              <ul className="space-y-1.5">
                {tools.map(([n, rw, d]) => (
                  <li key={n} className="grid grid-cols-[44px_minmax(0,1fr)] gap-2 text-[12.5px]">
                    <span className={cn("font-landing-mono text-[10.5px] uppercase leading-5", rw === "W" ? "text-tb-accent" : "text-tb-ink-3")}>
                      {rw === "R" ? "Read" : "Write"}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-landing-mono text-[11.5px] text-tb-ink">{n}</span>
                      <span className="block text-tb-ink-3">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </SettingsSection>
  );
}
