import { useState, useEffect } from "react";
import {
  Users,
  PenLine,
  Mail,
  MessageSquare,
  MessageCircle,
  Phone,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import LeadSelectorDialog, { getInitials } from "@/components/sequences/LeadSelectorDialog";
import EditLeadDialog from "@/components/sequences/EditLeadDialog";
import type { LeadItem } from "@/types/leads";
import { useGetLeadsQuery } from "@/store/features/leads/leadsApi";
import { useGetPromptTemplatesQuery } from "@/store/features/templates/templatesApi";

interface SequenceSidebarProps {
  situation: string | null;
  goal: string | null;
  tone: string;
  intensity: string;
  cadence: string;
  channels: string[];
  selectedLead: LeadItem | null;
  setSelectedLead: (lead: LeadItem | null) => void;
  autoSelectLead?: boolean;
}

export default function SequenceSidebar({
  situation,
  goal,
  tone,
  intensity,
  cadence,
  channels,
  selectedLead,
  setSelectedLead,
  autoSelectLead = true,
}: SequenceSidebarProps) {
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: leadsResponse } = useGetLeadsQuery({ limit: 1 });
  const { data: templatesResponse } = useGetPromptTemplatesQuery();
  

  const selectedPromptName =
    templatesResponse?.data?.find((template) => template.id === situation)?.name ?? null;

  useEffect(() => {
    if (!autoSelectLead || selectedLead || !leadsResponse?.data?.items?.length) {
      return;
    }
    setSelectedLead(leadsResponse.data.items[0]);
  }, [autoSelectLead, leadsResponse, selectedLead, setSelectedLead]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Lead Card */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
          <CardTitle className="text-sm font-semibold">Lead</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsLeadDialogOpen(true)}
              className="h-7 text-xs px-2 gap-1.5 text-landing-sky border-landing-sky/40 hover:bg-landing-sky-soft"
            >
              <Users className="h-3 w-3" />
              Pick from Leads
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditDialogOpen(true)}
              disabled={!selectedLead}
              className="h-7 text-xs px-2 gap-1.5 text-landing-fog/65"
            >
              <PenLine className="h-3 w-3" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          {selectedLead ? (
            <div className="flex items-center gap-3 mb-1">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-landing-sky text-landing-steel font-medium">{getInitials(selectedLead.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-landing-fog truncate">{selectedLead.name}</span>
                {selectedLead.email && <span className="text-xs text-landing-fog/55 truncate">{selectedLead.email}</span>}
                {selectedLead.phone && <span className="text-xs text-landing-fog/55 truncate">{selectedLead.phone}</span>}
              </div>
            </div>
          ) : (
            <div className="text-sm text-landing-fog/55 italic mb-1">No lead selected</div>
          )}
        <Separator className="my-5" />

        {/* Follow-up Summary */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-landing-fog px-1">Follow-up Summary</h3>
          <div className="flex flex-col gap-3 text-sm px-1">
            <div className="flex justify-between items-center gap-3">
              <span className="text-landing-fog/55 shrink-0">Prompt</span>
              <span className="font-medium text-landing-fog text-right truncate">
                {selectedPromptName || "-"}
              </span>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-landing-fog/55 shrink-0">Goal</span>
              <span className="font-medium text-landing-fog text-right truncate">{goal || "-"}</span>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-landing-fog/55 shrink-0">Tone</span>
              <span className="font-medium text-landing-fog text-right truncate">{tone || "-"}</span>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-landing-fog/55 shrink-0">Intensity</span>
              <span className="font-medium text-landing-fog text-right truncate">{intensity || "-"}</span>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-landing-fog/55 shrink-0">Cadence</span>
              <span className="font-medium text-landing-fog text-right truncate">{cadence || "-"}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-landing-fog/55">Channels</span>
              <div className="flex gap-2 text-landing-fog/40">
                {channels.includes("email") && <Mail className="h-4 w-4 text-landing-email" />}
                {channels.includes("sms") && <MessageSquare className="h-4 w-4 text-landing-sms" />}
                {channels.includes("whatsapp") && <MessageCircle className="h-4 w-4 text-landing-whatsapp" />}
                {channels.includes("aicall") && <Phone className="h-4 w-4 text-landing-voice" />}
                {channels.length === 0 && <span className="font-medium text-landing-fog">-</span>}
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex items-start gap-3 rounded-lg bg-landing-sky-soft p-4 text-landing-sky">
            <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">
              AI will generate a sequence optimized for this prompt and your goal.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

      {/* Tips */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-sm font-semibold">Tips for this sequence</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-landing-fog/25 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm text-landing-fog/80">Best time to reach out:</span>
                <span className="text-sm text-landing-fog/55">Weekdays, 10am - 2pm</span>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-landing-fog/25 shrink-0 mt-0.5" />
              <span className="text-sm text-landing-fog/80">Keep messages short and clear</span>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-landing-fog/25 shrink-0 mt-0.5" />
              <span className="text-sm text-landing-fog/80">Offer an easy next step</span>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-landing-fog/25 shrink-0 mt-0.5" />
              <span className="text-sm text-landing-fog/80">Don't sound needy</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full gap-2 bg-landing-sky-soft text-landing-sky hover:bg-landing-sky/20 h-10 mt-2 font-medium">
        <BookOpen className="h-4 w-4" />
        View Playbook (No-show)
      </Button>

      <LeadSelectorDialog 
        open={isLeadDialogOpen}
        onOpenChange={setIsLeadDialogOpen}
        selectedLeadId={selectedLead?.id || null}
        onSelectLead={setSelectedLead}
      />

      {selectedLead && (
        <EditLeadDialog 
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          lead={selectedLead}
          onSave={setSelectedLead}
        />
      )}
    </div>
  );
}
