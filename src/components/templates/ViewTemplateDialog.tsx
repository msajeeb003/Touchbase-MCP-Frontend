import { type ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLazyGetPromptTemplateByIdQuery } from "@/store/features/templates/templatesApi";

interface ViewTemplateDialogProps {
  templateId: string;
  trigger: ReactNode;
}

const getStageBadgeClass = (stage: string) => {
  const value = stage.toLowerCase();
  if (value.includes("no")) return "bg-landing-sky/20 text-landing-sky border-landing-sky/40";
  if (value.includes("after")) return "bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/40";
  if (value.includes("cancel")) return "bg-landing-voice/15 text-landing-voice border-landing-voice/40";
  return "bg-white/[0.06] text-landing-fog/80 border-landing-line";
};

export default function ViewTemplateDialog({ templateId, trigger }: ViewTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [fetchTemplate, { data, isFetching, isError }] = useLazyGetPromptTemplateByIdQuery();
  const template = data?.data;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      fetchTemplate(templateId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-3xl border-landing-line bg-landing-steel-2 p-0 font-landing-sans sm:w-full">
        <DialogHeader className="px-4 pt-5 sm:px-6">
          <DialogTitle>View Prompt Template</DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto px-4 pb-5 sm:px-6 sm:pb-6">
          {isFetching ? (
            <p className="mt-2 text-sm text-landing-fog/55">Loading template...</p>
          ) : isError ? (
            <p className="mt-2 text-sm text-landing-voice">Failed to load template details.</p>
          ) : template ? (
            <div className="mt-2 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <h3 className="font-landing-display text-base font-bold text-landing-fog sm:text-lg">{template.name}</h3>
                <Badge variant="outline" className={`flex-none whitespace-nowrap font-landing-mono text-[11px] ${getStageBadgeClass(template.followUpStage)}`}>
                  {template.followUpStage}
                </Badge>
              </div>
              <div className="rounded-xl border border-landing-line bg-landing-steel p-3 sm:p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-landing-fog/80">
                  {template.promptText}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-landing-fog/55">Template not found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
