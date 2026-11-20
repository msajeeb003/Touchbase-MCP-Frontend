import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, Ban, BookOpen, Check, FlaskConical, Inbox, Loader2, RefreshCw, Sparkles, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useSteelTheme } from "@/components/dashboard/dashboardTheme";
import { apiErrorMessage, hasPlaceholder, sequenceLook, type Tone } from "@/lib/harness/labels";
import { useGetAllRunSequencesQuery } from "@/store/features/harness/harnessApi";
import { useUpdateSequenceMutation } from "@/store/features/sequences/sequencesApi";
import type { HarnessSequence } from "@/types/harness";
import SequenceReview, { useSendWindowText } from "@/components/harness/SequenceReview";
import { PageHead, Panel, primaryBtn } from "@/components/harness/ui";
import { showError, showSuccess } from "@/utils/toast";

/*
 * Review Queue: a reading desk. Tabs with counts on top, the list of
 * follow-ups on the left, the selected one on the right with its decision
 * bar. Behaviour (URL ?show= / ?run= / :id, selection, bulk approve) is
 * unchanged from the previous version.
 */

type FilterKey = "awaiting" | "approved" | "sending" | "rejected";

const REVIEW_FILTERS: {
  key: FilterKey;
  label: string;
  tone: Tone;
  match: (s: HarnessSequence) => boolean;
}[] = [
  { key: "awaiting", label: "Waiting for you", tone: "warn", match: (s) => s.status === "draft" && s.approval_status === "awaiting_approval" },
  { key: "approved", label: "Approved · scheduled", tone: "blue", match: (s) => s.status === "active" && !s.steps.some((st) => st.status === "sent") },
  {
    key: "sending",
    label: "Sending / sent",
    tone: "ok",
    match: (s) => (s.status === "active" && s.steps.some((st) => st.status === "sent")) || s.status === "completed" || s.status === "paused",
  },
  { key: "rejected", label: "Rejected / stopped", tone: "bad", match: (s) => s.status === "cancelled" },
];

const TAB_DOT: Record<Tone, string> = {
  warn: "bg-landing-sms",
  blue: "bg-tb-accent",
  ok: "bg-landing-whatsapp",
  bad: "bg-landing-voice",
  mute: "bg-tb-ink-3",
  claude: "bg-landing-violet",
};

const iconBtn =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-tb-ink-3 transition-colors hover:bg-tb-ink/[0.06] hover:text-tb-ink disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--tb-accent))]";

export default function ReviewQueuePage() {
  useSteelTheme();
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch, isFetching } = useGetAllRunSequencesQuery(undefined, { pollingInterval: 30000 });
  const all = useMemo(() => data ?? [], [data]);

  const runFilter = params.get("run");
  const selectedFromUrl = id ? all.find((s) => s.sequence_id === id) : undefined;
  const filterParam = params.get("show") as FilterKey | null;
  const filter: FilterKey =
    filterParam && REVIEW_FILTERS.some((f) => f.key === filterParam)
      ? filterParam
      : selectedFromUrl
        ? REVIEW_FILTERS.find((f) => f.match(selectedFromUrl))?.key ?? "awaiting"
        : "awaiting";
  const f = REVIEW_FILTERS.find((x) => x.key === filter)!;

  const scoped = runFilter ? all.filter((s) => s.run.run_id === runFilter) : all;
  const list = scoped
    .filter(f.match)
    .sort((a, b) => (a.run.started_at < b.run.started_at ? 1 : a.run.started_at > b.run.started_at ? -1 : 0));
  const current = selectedFromUrl ?? list[0];

  const [selected, setSelected] = useState<string[]>([]);
  const waitingIds = list.filter((s) => REVIEW_FILTERS[0].match(s) && !hasBlocker(s)).map((s) => s.sequence_id);
  const sel = selected.filter((x) => waitingIds.includes(x));
  useEffect(() => setSelected([]), [filter, runFilter]);

  const setFilter = (k: FilterKey) => {
    const next = new URLSearchParams(params);
    next.set("show", k);
    navigate({ pathname: "/dashboard/review", search: next.toString() });
  };
  const open = (s: HarnessSequence) => navigate({ pathname: `/dashboard/review/${s.sequence_id}`, search: params.toString() });

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1440px] space-y-5 font-landing-sans">
      <PageHead
        title="Review Queue"
        icon={Inbox}
        actions={
          <>
            <button type="button" className={iconBtn} onClick={() => refetch()} disabled={isFetching} title="Refresh" aria-label="Refresh">
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            </button>
            <BulkApprove ids={sel} items={all} onDone={() => setSelected([])} />
          </>
        }
      />

      {/* Filters as tabs with counts. Status is in the words; the dot only repeats it. */}
      <div className="space-y-2.5">
        <nav aria-label="Review filters" className="flex gap-1 overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_rgb(var(--tb-ink)/0.08)]">
          {REVIEW_FILTERS.map((x) => {
            const on = filter === x.key;
            const n = scoped.filter(x.match).length;
            return (
              <button
                key={x.key}
                type="button"
                aria-current={on ? "page" : undefined}
                onClick={() => setFilter(x.key)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-[13.5px] transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[rgb(var(--tb-accent))]",
                  on ? "border-tb-accent font-semibold text-tb-ink" : "border-transparent text-tb-ink-3 hover:text-tb-ink",
                )}
              >
                <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", n ? TAB_DOT[x.tone] : "bg-tb-ink/20")} />
                {x.label}
                <span className={cn("font-landing-mono text-[11.5px] tabular-nums", on ? "text-tb-ink-2" : "text-tb-ink-3")}>{n}</span>
              </button>
            );
          })}
        </nav>

        {runFilter ? (
          <p className="flex flex-wrap items-center gap-2 text-[13px] text-tb-ink-3">
            <Sparkles className="h-3.5 w-3.5 text-landing-violet" />
            Showing only the follow-ups from one task.
            <button
              type="button"
              className="font-medium text-tb-accent hover:underline"
              onClick={() => {
                const n = new URLSearchParams(params);
                n.delete("run");
                setParams(n);
              }}
            >
              Show all
            </button>
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
          <Panel className="space-y-1 p-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="space-y-2 p-2.5">
                <div className="h-3.5 w-1/2 animate-pulse rounded bg-tb-ink/[0.07]" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-tb-ink/[0.06]" />
              </div>
            ))}
          </Panel>
          <Panel className="hidden min-h-[320px] lg:block">
            <div className="flex items-center gap-2 p-6 text-sm text-tb-ink-3">
              <Loader2 className="h-4 w-4 animate-spin text-tb-accent" />
              Loading the follow-ups Claude prepared…
            </div>
          </Panel>
        </div>
      ) : isError ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-landing-voice/35 bg-landing-voice/[0.07] px-4 py-3.5">
          <XCircle className="h-[18px] w-[18px] shrink-0 text-landing-voice" />
          <p className="min-w-0 flex-1 text-sm text-tb-ink">Could not load the Review Queue.</p>
          <button type="button" className="tb-btn-quiet tb-btn-sm" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
          <Panel className={cn("lg:sticky lg:top-20 lg:max-h-[calc(100svh-6.5rem)] lg:overflow-y-auto", id && "max-lg:hidden")}>
            {filter === "awaiting" && waitingIds.length ? (
              <label className="flex cursor-pointer items-center gap-2.5 px-4 pb-2 pt-3.5 text-[13px] text-tb-ink-2">
                <Checkbox
                  aria-label="Select all waiting"
                  checked={sel.length > 0 && sel.length === waitingIds.length ? true : sel.length ? "indeterminate" : false}
                  onCheckedChange={(v) => setSelected(v === true ? waitingIds : [])}
                />
                Select all {waitingIds.length} ready to approve
                <span className="ml-auto font-landing-mono text-xs text-tb-ink-3">{list.length}</span>
              </label>
            ) : (
              <div className="flex items-center gap-2 px-4 pb-2 pt-3.5">
                <h3 className="text-sm font-semibold text-tb-ink">{f.label}</h3>
                <span className="ml-auto font-landing-mono text-xs text-tb-ink-3">{list.length}</span>
              </div>
            )}
            {list.length ? (
              <div className="grid gap-0.5 px-1.5 pb-1.5">
                {list.map((s) => (
                  <SeqListItem
                    key={s.sequence_id}
                    s={s}
                    on={current?.sequence_id === s.sequence_id}
                    showStatus={filter !== "awaiting"}
                    selectable={waitingIds.includes(s.sequence_id)}
                    checked={sel.includes(s.sequence_id)}
                    onCheck={(v) => setSelected((prev) => (v ? [...prev, s.sequence_id] : prev.filter((x) => x !== s.sequence_id)))}
                    onOpen={() => open(s)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1 px-4 pb-8 pt-6 text-center">
                <Check className="mx-auto h-5 w-5 text-landing-whatsapp" />
                <p className="text-sm text-tb-ink">
                  Nothing here.{filter === "awaiting" ? " Everything has been reviewed." : ""}
                </p>
                {!all.length ? (
                  <p className="text-[13px] text-tb-ink-3">
                    When Claude prepares follow-ups, they wait here. See{" "}
                    <Link className="text-tb-accent hover:underline" to="/dashboard/ai-tasks">
                      AI Tasks
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            )}
          </Panel>

          <Panel className={cn("flex min-h-[320px] flex-col overflow-visible", !id && "max-lg:hidden")}>
            {current ? (
              <>
                <Link
                  to={{ pathname: "/dashboard/review", search: params.toString() }}
                  className="tb-btn-quiet tb-btn-sm mx-5 mt-4 self-start lg:hidden"
                >
                  ← {f.label}
                </Link>
                <SequenceReview key={current.sequence_id} seq={current} />
              </>
            ) : id && !selectedFromUrl ? (
              <p className="px-6 py-10 text-center text-sm text-tb-ink-3">
                This follow-up was not made by Claude, or it is older than the newest 50 tasks.{" "}
                <Link className="text-tb-accent hover:underline" to={`/dashboard/sequences/${id}/view`}>
                  Open it in Sequences
                </Link>
              </p>
            ) : (
              <p className="px-6 py-10 text-center text-sm text-tb-ink-3">Pick a follow-up on the left.</p>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}

/** A draft that cannot be approved as it is. */
const hasBlocker = (s: HarnessSequence) => s.lead.do_not_contact || s.steps.some(hasPlaceholder);

function SeqListItem({
  s,
  on,
  showStatus,
  selectable,
  checked,
  onCheck,
  onOpen,
}: {
  s: HarnessSequence;
  on: boolean;
  showStatus: boolean;
  selectable: boolean;
  checked: boolean;
  onCheck: (v: boolean) => void;
  onOpen: () => void;
}) {
  const first = s.steps[0];
  const look = sequenceLook(s);
  const flags: { text: string; icon: typeof Ban; tone: "warn" | "bad" | "mute" }[] = [];
  if (s.steps.some(hasPlaceholder)) flags.push({ text: "Placeholder left", icon: AlertTriangle, tone: "bad" });
  if (s.lead.do_not_contact) flags.push({ text: "Do-not-contact", icon: Ban, tone: "bad" });
  if (s.steps.some((st) => st.status === "failed")) flags.push({ text: "Send failed", icon: XCircle, tone: "bad" });
  if (s.no_call_transcript) flags.push({ text: "No call transcript", icon: BookOpen, tone: "warn" });
  if (s.steps.some((st) => st.delivery_mode === "mock")) flags.push({ text: "Mock", icon: FlaskConical, tone: "mute" });

  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={on ? "true" : undefined}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      className={cn(
        "relative grid cursor-pointer grid-cols-[18px_minmax(0,1fr)] gap-x-2.5 rounded-xl px-3 py-2.5 transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[rgb(var(--tb-accent))]",
        on ? "bg-tb-accent/[0.09]" : "hover:bg-tb-ink/[0.04]",
      )}
    >
      {on ? <span aria-hidden className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r bg-tb-accent" /> : null}
      <span className="pt-0.5" onClick={(e) => e.stopPropagation()}>
        {selectable ? (
          <Checkbox aria-label={`Select ${s.lead.untrusted.name}`} checked={checked} onCheckedChange={(v) => onCheck(v === true)} />
        ) : null}
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-tb-ink">{s.lead.untrusted.name}</span>
          {showStatus ? <span className="shrink-0 text-[11.5px] font-medium text-tb-ink-3">{look.label}</span> : null}
        </div>
        <p className="truncate text-[12px] text-tb-ink-3">
          {s.lead.untrusted.company || "—"} · {s.steps.length} step{s.steps.length === 1 ? "" : "s"}
        </p>
        {first ? <p className="mt-1 truncate text-[13px] text-tb-ink-2">{first.subject || first.body}</p> : null}
        {flags.length ? (
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] font-medium">
            {flags.map((fl) => (
              <span
                key={fl.text}
                className={cn(
                  "inline-flex items-center gap-1",
                  fl.tone === "bad" ? "text-landing-voice" : fl.tone === "warn" ? "text-landing-sms" : "text-tb-ink-3",
                )}
              >
                <fl.icon className="h-3 w-3" />
                {fl.text}
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function BulkApprove({ ids, items, onDone }: { ids: string[]; items: HarnessSequence[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [updateSequence] = useUpdateSequenceMutation();
  const win = useSendWindowText();

  const run = async () => {
    setBusy(true);
    let ok = 0;
    const failed: string[] = [];
    for (const id of ids) {
      try {
        await updateSequence({ id, body: { status: "active" } }).unwrap();
        ok++;
      } catch (error) {
        const name = items.find((s) => s.sequence_id === id)?.lead.untrusted.name ?? "A follow-up";
        failed.push(`${name}: ${apiErrorMessage(error, "not approved")}`);
      }
    }
    setBusy(false);
    setOpen(false);
    onDone();
    if (ok) showSuccess(`Approved ${ok} follow-up${ok > 1 ? "s" : ""}.`);
    if (failed.length) showError(failed.slice(0, 3).join(" · ") + (failed.length > 3 ? ` (+${failed.length - 3} more)` : ""));
  };

  return (
    <>
      <Button className={primaryBtn} disabled={!ids.length} onClick={() => setOpen(true)}>
        <Check className="h-4 w-4" />
        Approve selected ({ids.length})
      </Button>
      <AlertDialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <AlertDialogContent className="font-landing-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-tb-ink">Approve {ids.length} follow-ups?</AlertDialogTitle>
            <AlertDialogDescription>
              Their messages will be scheduled inside your send window, {win.text}. Have you read them? You can still pause or stop each one later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              <X className="mr-1 h-4 w-4" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={primaryBtn}
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                void run();
              }}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Approve all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
