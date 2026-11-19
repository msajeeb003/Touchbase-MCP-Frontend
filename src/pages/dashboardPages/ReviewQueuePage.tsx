import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  Check,
  Clock,
  Inbox,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
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
import { Chip, Empty, Kpi, NoteBox, PageHead, Panel, PanelHead, StatusChip, outlineBtn, primaryBtn } from "@/components/harness/ui";
import { showError, showSuccess } from "@/utils/toast";

type FilterKey = "awaiting" | "approved" | "sending" | "rejected";

const REVIEW_FILTERS: {
  key: FilterKey;
  label: string;
  icon: typeof Clock;
  tone: Tone;
  match: (s: HarnessSequence) => boolean;
}[] = [
  { key: "awaiting", label: "Waiting for you", icon: Clock, tone: "warn", match: (s) => s.status === "draft" && s.approval_status === "awaiting_approval" },
  { key: "approved", label: "Approved · scheduled", icon: CalendarClock, tone: "blue", match: (s) => s.status === "active" && !s.steps.some((st) => st.status === "sent") },
  {
    key: "sending",
    label: "Sending / sent",
    icon: Send,
    tone: "ok",
    match: (s) => (s.status === "active" && s.steps.some((st) => st.status === "sent")) || s.status === "completed" || s.status === "paused",
  },
  { key: "rejected", label: "Rejected / stopped", icon: XCircle, tone: "bad", match: (s) => s.status === "cancelled" },
];

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
    <div className="w-full min-w-0 space-y-4 font-landing-sans text-landing-fog/80">
      <PageHead
        title="Review Queue"
        icon={Inbox}
        sub="Claude prepared these follow-ups. Nothing is sent until you approve. Edit a draft if you like, then approve or reject it."
        actions={
          <>
            <Button variant="outline" className={outlineBtn} onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              Refresh
            </Button>
            <BulkApprove ids={sel} items={all} onDone={() => setSelected([])} />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {REVIEW_FILTERS.map((x) => (
          <Kpi
            key={x.key}
            label={x.label}
            value={scoped.filter(x.match).length}
            icon={x.icon}
            tone={x.tone}
            active={filter === x.key}
            onClick={() => setFilter(x.key)}
          />
        ))}
      </div>

      {runFilter ? (
        <NoteBox tone="claude" icon={Sparkles}>
          Showing only the follow-ups from one task.{" "}
          <button type="button" className="text-landing-sky hover:underline" onClick={() => { const n = new URLSearchParams(params); n.delete("run"); setParams(n); }}>
            Show all
          </button>
        </NoteBox>
      ) : null}

      {isLoading ? (
        <Panel className="p-8 text-sm text-landing-fog/55">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-landing-sky" />
          Loading the follow-ups Claude prepared…
        </Panel>
      ) : isError ? (
        <Panel className="border-landing-voice/40 p-8 text-sm text-landing-voice">Could not load the Review Queue.</Panel>
      ) : (
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
          <Panel className="lg:max-h-[calc(100svh-9rem)] lg:overflow-y-auto">
            {filter === "awaiting" && waitingIds.length ? (
              <div className="flex items-center gap-2 border-b border-landing-line bg-landing-fog/[0.03] px-4 py-3">
                <Checkbox
                  aria-label="Select all waiting"
                  checked={sel.length > 0 && sel.length === waitingIds.length ? true : sel.length ? "indeterminate" : false}
                  onCheckedChange={(v) => setSelected(v === true ? waitingIds : [])}
                />
                <span className="text-sm">Select all {waitingIds.length} ready to approve</span>
                <Chip className="ml-auto">{list.length}</Chip>
              </div>
            ) : (
              <PanelHead title={f.label} right={<Chip>{list.length}</Chip>} />
            )}
            {list.length ? (
              <div className="divide-y divide-landing-line">
                {list.map((s) => (
                  <SeqListItem
                    key={s.sequence_id}
                    s={s}
                    on={current?.sequence_id === s.sequence_id}
                    selectable={waitingIds.includes(s.sequence_id)}
                    checked={sel.includes(s.sequence_id)}
                    onCheck={(v) => setSelected((prev) => (v ? [...prev, s.sequence_id] : prev.filter((x) => x !== s.sequence_id)))}
                    onOpen={() => open(s)}
                  />
                ))}
              </div>
            ) : (
              <Empty icon={Check} tone="ok">
                Nothing here.{filter === "awaiting" ? " Everything has been reviewed." : ""}
                {!all.length ? (
                  <div className="mt-1">
                    When Claude prepares follow-ups, they wait here. See <Link className="text-landing-sky hover:underline" to="/dashboard/ai-tasks">AI Tasks</Link>.
                  </div>
                ) : null}
              </Empty>
            )}
          </Panel>
          <Panel className="flex min-h-[320px] flex-col">
            {current ? (
              <SequenceReview key={current.sequence_id} seq={current} />
            ) : id && !selectedFromUrl ? (
              <Empty icon={Inbox}>
                This follow-up was not made by Claude, or it is older than the newest 50 tasks.{" "}
                <Link className="text-landing-sky hover:underline" to={`/dashboard/sequences/${id}/view`}>
                  Open it in Sequences
                </Link>
              </Empty>
            ) : (
              <Empty icon={Inbox}>Pick a follow-up on the left.</Empty>
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
  selectable,
  checked,
  onCheck,
  onOpen,
}: {
  s: HarnessSequence;
  on: boolean;
  selectable: boolean;
  checked: boolean;
  onCheck: (v: boolean) => void;
  onOpen: () => void;
}) {
  const first = s.steps[0];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
      className={cn(
        "block cursor-pointer border-l-[3px] px-4 py-3 transition-colors hover:bg-landing-fog/[0.03]",
        on ? "border-landing-sky bg-landing-sky/[0.07]" : "border-transparent",
      )}
    >
      <div className="flex items-center gap-2">
        {selectable ? (
          <span onClick={(e) => e.stopPropagation()}>
            <Checkbox aria-label={`Select ${s.lead.untrusted.name}`} checked={checked} onCheckedChange={(v) => onCheck(v === true)} />
          </span>
        ) : null}
        <b className="min-w-0 flex-1 truncate font-medium text-landing-fog">{s.lead.untrusted.name}</b>
        <StatusChip look={sequenceLook(s)} />
      </div>
      <div className="mt-0.5 truncate text-[12.5px] text-landing-fog/50">{s.lead.untrusted.company || "—"}</div>
      {first ? (
        <div className="mt-1 truncate text-[13.5px] text-landing-fog/80">{first.subject || first.body}</div>
      ) : null}
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {s.no_call_transcript ? <Chip tone="warn" icon={BookOpen}>No call transcript</Chip> : <Chip tone="blue" icon={BookOpen}>Based on a call</Chip>}
        {s.steps.some(hasPlaceholder) ? <Chip tone="bad" icon={AlertTriangle}>Placeholder left</Chip> : null}
        {s.lead.do_not_contact ? <Chip tone="bad">Do-not-contact</Chip> : null}
        {s.steps.some((st) => st.status === "failed") ? <Chip tone="bad">Send failed</Chip> : null}
        {s.steps.some((st) => st.delivery_mode === "mock") ? <Chip tone="warn">Mock</Chip> : null}
        <span className="ml-auto font-landing-mono text-[11px] text-landing-fog/40">{s.steps.length} steps</span>
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
            <AlertDialogTitle className="text-landing-fog">Approve {ids.length} follow-ups?</AlertDialogTitle>
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
