import { Search, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGetLeadsQuery } from "@/store/features/leads/leadsApi";
import type { LeadItem } from "@/types/leads";

interface LeadSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLeadId: string | null;
  onSelectLead: (lead: LeadItem) => void;
}

export function getInitials(name?: string) {
  if (!name) return "??";
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

export default function LeadSelectorDialog({
  open,
  onOpenChange,
  selectedLeadId,
  onSelectLead,
}: LeadSelectorDialogProps) {
  const { data: leadsResponse, isLoading } = useGetLeadsQuery({ limit: 50 }, { skip: !open });
  
  const leads = leadsResponse?.data?.items || [];

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

        <div className="overflow-y-auto max-h-[350px] p-2 flex flex-col min-h-[100px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-slate-500">
              Loading leads...
            </div>
          ) : leads.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-sm text-slate-500">
              No leads found.
            </div>
          ) : (
            leads.map((lead) => {
              const isSelected = lead.id === selectedLeadId;
              const initials = getInitials(lead.name);
              
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
                    {initials}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {lead.name}
                    </span>
                    <span className="text-[13px] text-slate-500 truncate">
                      {lead.email} {lead.phone && `· ${lead.phone}`}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-indigo-600 shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
