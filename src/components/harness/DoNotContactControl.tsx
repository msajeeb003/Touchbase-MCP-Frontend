import { useState } from "react";
import { Ban, Loader2, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiErrorMessage, dayLabel } from "@/lib/harness/labels";
import { useClearDoNotContactMutation, useMarkDoNotContactMutation } from "@/store/features/harness/harnessApi";
import type { LeadItem } from "@/types/leads";
import { showError, showSuccess } from "@/utils/toast";
import { Chip, NoteBox } from "./ui";
import { btnDanger, btnQuiet } from "@/lib/ds";

const SOURCE: Record<string, string> = {
  mcp: "by Claude",
  user: "by you",
  system: "by Touchbase",
  lead_opt_out: "the lead asked to stop (SMS STOP or a reply)",
};

/**
 * Do-not-contact on a lead: a badge, a button to set it and a button to clear it.
 * Clearing needs a reason and exists only here, for a signed-in person.
 */
export default function DoNotContactControl({ lead }: { lead: LeadItem }) {
  const [mode, setMode] = useState<null | "mark" | "clear">(null);
  const [reason, setReason] = useState("");
  const [mark, { isLoading: marking }] = useMarkDoNotContactMutation();
  const [clear, { isLoading: clearing }] = useClearDoNotContactMutation();
  const busy = marking || clearing;

  const close = () => {
    setMode(null);
    setReason("");
  };

  const submit = async () => {
    try {
      if (mode === "mark") {
        await mark({ leadId: lead.id, reason: reason.trim() || undefined }).unwrap();
        showSuccess(`${lead.name} is now do-not-contact. Running follow-ups were paused.`);
      } else {
        await clear({ leadId: lead.id, reason: reason.trim() }).unwrap();
        showSuccess(`${lead.name} can be contacted again.`);
      }
      close();
    } catch (error) {
      showError(apiErrorMessage(error, "Could not change do-not-contact."));
    }
  };

  return (
    <>
      {lead.doNotContact ? (
        <div className="flex flex-col items-start gap-1">
          <Chip
            tone="bad"
            icon={Ban}
            title={[lead.doNotContactReason, lead.doNotContactSource ? SOURCE[lead.doNotContactSource] : null].filter(Boolean).join(" · ")}
          >
            Do-not-contact
          </Chip>
          {lead.doNotContactSource === "lead_opt_out" ? (
            // The lead's own opt-out can't be cleared (the server refuses it too).
            <span className="text-[12px] text-landing-fog/60">The lead opted out</span>
          ) : (
            <button type="button" className="text-[12px] text-landing-sky hover:underline" onClick={() => setMode("clear")}>
              Clear…
            </button>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-landing-fog/60 hover:bg-landing-voice/10 hover:text-landing-voice"
          onClick={() => setMode("mark")}
        >
          <Ban className="h-3.5 w-3.5" />
          Block
        </Button>
      )}

      <Dialog open={mode !== null} onOpenChange={(o) => !o && !busy && close()}>
        {mode ? (
          <DialogContent className="max-w-md font-landing-sans">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-landing-display text-landing-fog">
                {mode === "mark" ? <Ban className="h-5 w-5 text-landing-voice" /> : <LockOpen className="h-5 w-5 text-landing-sky" />}
                {mode === "mark" ? `Mark ${lead.name} do-not-contact?` : `Clear do-not-contact for ${lead.name}?`}
              </DialogTitle>
            </DialogHeader>
            {mode === "mark" ? (
              <p className="text-sm text-landing-fog/65">
                Nothing will be sent to {lead.email || lead.phone || "this lead"}. Running follow-ups pause, and Claude cannot prepare new ones.
                Only a person can clear this later.
              </p>
            ) : (
              <NoteBox tone="warn" icon={Ban}>
                Marked {lead.doNotContactSource ? SOURCE[lead.doNotContactSource] ?? "" : ""}
                {lead.doNotContactAt ? ` on ${dayLabel(lead.doNotContactAt)}` : ""}
                {lead.doNotContactReason ? `: “${lead.doNotContactReason}”` : "."} Make sure the lead really agreed to be contacted again.
              </NoteBox>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="dnc-reason">{mode === "mark" ? "Reason (optional)" : "Reason (required)"}</Label>
              <Textarea
                id="dnc-reason"
                rows={3}
                maxLength={300}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={mode === "mark" ? "For example: asked by email to stop" : "For example: asked for a quote again on the phone"}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={close} disabled={busy}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className={mode === "mark" ? btnDanger : btnQuiet}
                onClick={submit}
                disabled={busy || (mode === "clear" && !reason.trim())}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {mode === "mark" ? "Mark do-not-contact" : "Clear do-not-contact"}
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
