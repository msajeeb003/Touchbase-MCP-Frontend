import { useState } from "react";
import { BookOpen, Plus, PenLine, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  useGetPromptTemplatesQuery, 
  useCreatePromptTemplateMutation,
  useDeletePromptTemplateMutation
} from "@/store/features/templates/templatesApi";

interface ManageTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate?: (promptText: string) => void;
}

export default function ManageTemplatesDialog({ open, onOpenChange, onUseTemplate }: ManageTemplatesDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [stage, setStage] = useState("General");
  const [promptText, setPromptText] = useState("");

  const { data: templatesResponse, isLoading: isLoadingTemplates } = useGetPromptTemplatesQuery(undefined, { skip: !open });
  const templates = templatesResponse?.data || [];

  const [createTemplate, { isLoading: isCreatingMutation }] = useCreatePromptTemplateMutation();
  const [deleteTemplate, { isLoading: isDeleting }] = useDeletePromptTemplateMutation();

  const handleCreate = async () => {
    if (!name.trim() || !promptText.trim()) return;
    try {
      await createTemplate({
        name,
        followUpStage: stage,
        promptText,
      }).unwrap();
      
      // reset and close
      setName("");
      setStage("General");
      setPromptText("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create template:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteTemplate(id).unwrap();
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Manage prompt templates
          </DialogTitle>
        </DialogHeader>
        
        {/* Subheader */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <p className="text-sm text-slate-500">
            Create, edit and delete the saved prompts used in your sequences.
          </p>
          {!isCreating && (
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-9 px-4 rounded-md"
            >
              <Plus className="h-4 w-4" />
              New template
            </Button>
          )}
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50/50">
          <div className="flex flex-col gap-3 min-h-[100px]">
            {isCreating && (
              <div className="flex flex-col gap-5 p-5 border border-indigo-100 rounded-xl bg-white shadow-sm mb-2">
                <h3 className="text-sm font-semibold text-slate-900">New template</h3>
                
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <Label htmlFor="tpl-name" className="text-slate-700 font-normal">Name</Label>
                    <Input 
                      id="tpl-name" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      disabled={isCreatingMutation}
                    />
                  </div>
                  <div className="w-1/3 flex flex-col gap-2">
                    <Label htmlFor="tpl-stage" className="text-slate-700 font-normal">Stage</Label>
                    <Input 
                      id="tpl-stage" 
                      value={stage} 
                      onChange={e => setStage(e.target.value)}
                      disabled={isCreatingMutation}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="tpl-prompt" className="text-slate-700 font-normal">Prompt</Label>
                  <Textarea 
                    id="tpl-prompt" 
                    value={promptText}
                    onChange={e => setPromptText(e.target.value)}
                    placeholder="Describe how the AI should write for this situation..." 
                    className="min-h-[120px] resize-none text-sm placeholder:text-slate-400"
                    disabled={isCreatingMutation}
                  />
                  <span className="text-xs text-slate-400">{promptText.length} characters (min 10)</span>
                </div>

                <div className="flex items-center justify-end gap-3 mt-1">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsCreating(false)} 
                    disabled={isCreatingMutation}
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreate}
                    disabled={isCreatingMutation || promptText.length < 10 || !name.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isCreatingMutation ? "Creating..." : "Create template"}
                  </Button>
                </div>
              </div>
            )}

            {isLoadingTemplates && !isCreating ? (
              <div className="flex items-center justify-center p-8 text-sm text-slate-500">
                Loading templates...
              </div>
            ) : templates.length === 0 && !isCreating ? (
               <div className="flex items-center justify-center p-8 text-sm text-slate-500">
                No templates found.
              </div>
            ) : (
              templates.map((tpl) => (
                <div key={tpl.id} className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm hover:border-indigo-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 bg-indigo-50 flex items-center justify-center rounded-lg">
                      <BookOpen className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{tpl.name}</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] uppercase font-medium rounded-full px-2 py-0.5">
                          {tpl.followUpStage}
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-500 line-clamp-1 max-w-lg">{tpl.promptText}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        onUseTemplate?.(tpl.promptText);
                        onOpenChange(false);
                      }}
                      className="h-9 px-4 text-slate-700 font-medium"
                    >
                      Use
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500"><PenLine className="h-4 w-4" /></Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDelete(tpl.id)}
                      disabled={isDeleting}
                      className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end bg-white">
          <Button variant="secondary" onClick={() => onOpenChange(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700">Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
