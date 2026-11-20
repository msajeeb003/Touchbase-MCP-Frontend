import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSteelTheme } from "@/components/dashboard/dashboardTheme";
import { apiErrorMessage, dayLabel, rel } from "@/lib/harness/labels";
import { useGetDeletedLeadsQuery, useRestoreLeadMutation } from "@/store/features/leads/leadsApi";
import { Chip, Empty, NoteBox, PageHead, Panel, PanelHead, outlineBtn } from "@/components/harness/ui";
import { showError, showSuccess } from "@/utils/toast";

/**
 * Leads Claude deleted. Each can be restored for 30 days; after that it is
 * removed for good. A do-not-contact block on the lead's email or phone stays
 * either way. Restoring does not restart follow-ups that were stopped.
 */
export default function DeletedLeadsPage() {
  useSteelTheme();
  const { data, isLoading, isError } = useGetDeletedLeadsQuery();
  const [restore] = useRestoreLeadMutation();
  const [restoring, setRestoring] = useState<string | null>(null);
  const leads = data?.data ?? [];

  const onRestore = async (id: string, name: string) => {
    setRestoring(id);
    try {
      await restore(id).unwrap();
      showSuccess(`${name} is back in your leads.`);
    } catch (error) {
      showError(apiErrorMessage(error, "Could not restore the lead."));
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="space-y-5 font-landing-sans text-landing-fog/80">
      <PageHead
        icon={Trash2}
        title="Recently deleted"
        sub="Leads Claude deleted for you. Restore one within 30 days; after that it is removed for good."
        actions={
          <Button asChild variant="outline" className={outlineBtn}>
            <Link to="/dashboard/leads">
              <ArrowLeft className="h-4 w-4" /> Back to leads
            </Link>
          </Button>
        }
      />
      <NoteBox tone="blue" icon={RotateCcw}>
        Restoring brings the lead back with its notes, calls and replies. Follow-ups that were stopped stay stopped. A
        do-not-contact block stays in place.
      </NoteBox>
      <Panel>
        <PanelHead title={`${leads.length} deleted lead${leads.length === 1 ? "" : "s"}`} icon={Trash2} />
        {isLoading ? (
          <p className="flex items-center gap-2 p-4 text-sm text-landing-fog/55">
            <Loader2 className="h-4 w-4 animate-spin text-landing-sky" /> Loading…
          </p>
        ) : isError ? (
          <p className="p-4 text-sm text-landing-voice">Could not load deleted leads.</p>
        ) : leads.length === 0 ? (
          <Empty icon={Trash2}>Nothing here. Leads Claude deletes appear here for 30 days.</Empty>
        ) : (
          <ul className="divide-y divide-landing-line">
            {leads.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-landing-fog">{lead.name}</p>
                  <p className="truncate text-xs text-landing-fog/55">
                    {[lead.email, lead.phone, lead.company].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-landing-fog/55">
                    Deleted {rel(lead.deletedAt)} {lead.deletedBy === "claude" ? "by Claude" : ""}
                    {lead.deletedReason ? `: ${lead.deletedReason}` : ""}
                  </p>
                </div>
                {lead.doNotContact ? <Chip tone="bad">Do-not-contact stays</Chip> : null}
                <Chip>Restore until {dayLabel(lead.restorableUntil)}</Chip>
                <Button
                  type="button"
                  variant="outline"
                  className={outlineBtn}
                  disabled={restoring === lead.id}
                  onClick={() => onRestore(lead.id, lead.name)}
                >
                  {restoring === lead.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  Restore
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
