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
import { Lead } from "@/components/sequences/LeadSelectorDialog";

interface EditLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  onSave: (updatedLead: Lead) => void;
}

export default function EditLeadDialog({
  open,
  onOpenChange,
  lead,
  onSave,
}: EditLeadDialogProps) {
  const [name, setName] = useState(lead.name);
  const [email, setEmail] = useState(lead.email);
  const [phone, setPhone] = useState(lead.phone);

  useEffect(() => {
    if (open) {
      setName(lead.name);
      setEmail(lead.email);
      setPhone(lead.phone);
    }
  }, [open, lead]);

  const handleSave = () => {
    // Basic validation or just passing it back
    onSave({
      ...lead,
      name,
      email,
      phone,
      // update initials if name changed significantly, but for now we can leave it
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || lead.initials
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-base font-semibold text-slate-900">
            Edit lead
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-name" className="text-slate-700 font-normal">Name</Label>
            <Input 
              id="lead-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-email" className="text-slate-700 font-normal">Email</Label>
            <Input 
              id="lead-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-phone" className="text-slate-700 font-normal">Phone</Label>
            <Input 
              id="lead-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50/50">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            className="text-slate-700 hover:text-slate-900 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
