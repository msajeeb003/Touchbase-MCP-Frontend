import { Search, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface Lead {
  id: string;
  initials: string;
  name: string;
  email: string;
  phone: string;
}

const dummyLeads: Lead[] = [
  { id: "1", initials: "KP", name: "Kishon Pashi", email: "kishonpashi@gmail.com", phone: "+8801705361661" },
  { id: "2", initials: "JB", name: "James bradley", email: "jamesbradley1986tw@gmail.com", phone: "+447831392278" },
  { id: "3", initials: "TC", name: "Thelma Chukwu", email: "thelmachukwu@gmail.com", phone: "+14242889379" },
  { id: "4", initials: "EH", name: "Elie Hneine", email: "elienhneine@gmail.com", phone: "+966566061682" },
  { id: "5", initials: "BQ", name: "Brittney Quinn", email: "brittney@claimyourpowher.com", phone: "+18289640365" },
  { id: "6", initials: "MM", name: "Matt Mosholder", email: "matt@mosholder.com", phone: "+15551234567" },
];

interface LeadSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
}

export default function LeadSelectorDialog({
  open,
  onOpenChange,
  selectedLeadId,
  onSelectLead,
}: LeadSelectorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="text-base font-semibold text-slate-900">
            Pick from Leads
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name, email or phone..." 
              className="pl-9 h-10 border-indigo-200 focus-visible:ring-indigo-600 rounded-lg text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[350px] p-2 flex flex-col">
          {dummyLeads.map((lead) => {
            const isSelected = lead.id === selectedLeadId;
            return (
              <div
                key={lead.id}
                onClick={() => {
                  onSelectLead(lead);
                  onOpenChange(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  isSelected 
                    ? "bg-indigo-50 border border-indigo-200" 
                    : "border border-transparent hover:bg-slate-50"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-sm font-semibold text-white">
                  {lead.initials}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold text-slate-900 truncate">
                    {lead.name}
                  </span>
                  <span className="text-[13px] text-slate-500 truncate">
                    {lead.email} · {lead.phone}
                  </span>
                </div>
                {isSelected && (
                  <Check className="h-5 w-5 text-indigo-600 shrink-0 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
