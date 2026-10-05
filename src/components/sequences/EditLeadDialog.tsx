import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { LeadItem } from "@/types/leads";
import { useUpdateLeadMutation } from "@/store/features/leads/leadsApi";

interface EditLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadItem;
  onSave: (updatedLead: LeadItem) => void;
}

export default function EditLeadDialog({
  open,
  onOpenChange,
  lead,
  onSave,
}: EditLeadDialogProps) {
  const [name, setName] = useState(lead.name);
  const [email, setEmail] = useState(lead.email || "");
  const [phone, setPhone] = useState(lead.phone || "");

  const [updateLead, { isLoading }] = useUpdateLeadMutation();

  useEffect(() => {
    if (open) {
      setName(lead.name);
      setEmail(lead.email || "");
      setPhone(lead.phone || "");
    }
  }, [open, lead]);

  const handleSave = async () => {
    try {
      const response = await updateLead({
        id: lead.id,
        body: { name, email, phone },
      }).unwrap();
      
      onSave(response.data);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update lead", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-base font-semibold text-landing-fog">
            Edit lead
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-name" className="text-landing-fog/80 font-normal">Name</Label>
            <Input 
              id="lead-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-sm"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-email" className="text-landing-fog/80 font-normal">Email</Label>
            <Input 
              id="lead-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 text-sm"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-phone" className="text-landing-fog/80 font-normal">Phone</Label>
            <Input 
              id="lead-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 text-sm"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-landing-fog/[0.03]">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading}
            className="text-landing-fog/80 hover:text-landing-fog hover:bg-landing-fog/[0.06]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-landing-sky hover:bg-landing-sky-deep text-landing-steel"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
