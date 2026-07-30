import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAutoAnimate } from "@formkit/auto-animate/react";

import {
  RefreshCw,
  SlidersHorizontal,
  Send,
  GripVertical,
  Mail,
  MessageSquare,
  MessageCircle,
  Phone,
  Clock,
  MoreVertical,
  PenLine,
  Eye,
  Plus,
  Sparkles,
  Copy,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SequenceStepItem } from "@/types/sequences";
import { STEP_TYPE } from "@/constants/stepType";
import { 
  useUpdateSequenceStepMutation, 
  useDeleteSequenceStepMutation,
  useRegenerateSequenceStepsMutation
} from "@/store/features/sequences/sequencesApi";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

export interface SequenceStep {
  id: string | number;
  type: string;
  time: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  subject?: string;
  content: string;
  hasPreview: boolean;
  editLabel?: string;
}

const initialSteps: SequenceStep[] = [
  {
    id: 1,
    type: "Email",
    time: "Now",
    icon: Mail,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    subject: "Following up on our conversation",
    content: "Hi Art, I hope you're doing well. I wanted to follow up on our conversation...",
    hasPreview: true,
  },
  {
    id: 2,
    type: "SMS",
    time: "+2 days",
    icon: MessageSquare,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-50",
    content: "Hi Art, I tried reaching you earlier but couldn't connect. Are you still open to a quick chat this week?",
    hasPreview: true,
  },
  {
    id: 3,
    type: "WhatsApp",
    time: "+4 days",
    icon: MessageCircle,
    iconColor: "text-green-500",
    iconBg: "bg-green-50",
    content: "Hi Art! Just checking in 🙂 Let me know if a quick call this week works for you.",
    hasPreview: true,
  },
  {
    id: 4,
    type: "AI Call",
    time: "+6 days",
    icon: Phone,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    content: "AI will call and leave a personalized voicemail asking to reschedule a call.",
    hasPreview: false,
    editLabel: "Edit Script",
  },
  {
    id: 5,
    type: "Email",
    time: "+8 days",
    icon: Mail,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    subject: "Following up on our conversation",
    content: "Hi Art, I hope you're doing well. I wanted to follow up on our conversation...",
    hasPreview: true,
  },
];

interface SortableStepProps {
  step: SequenceStep;
  index: number;
  setPreviewStep: (step: SequenceStep) => void;
  setEditStep: (step: SequenceStep) => void;
  handleDuplicateStep: (index: number) => void;
  handleDeleteStep: (id: string | number) => void;
}

function SortableStep({
  step,
  index,
  setPreviewStep,
  setEditStep,
  handleDuplicateStep,
  handleDeleteStep,
}: SortableStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm hover:border-indigo-100 ${
        isDragging ? "opacity-60 shadow-lg ring-1 ring-indigo-500 scale-[1.02]" : ""
      }`}
    >
      {/* Drag Handle & Icon */}
      <div className="flex items-center gap-3 w-40 shrink-0">
        <div {...attributes} {...listeners} className="cursor-grab hover:bg-slate-50 p-1 -ml-1 rounded outline-none text-slate-300 hover:text-slate-500">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${step.iconBg}`}>
          <step.icon className={`h-5 w-5 ${step.iconColor}`} />
        </div>
        <div className="flex flex-col">
          <span className={`text-sm font-semibold ${step.iconColor}`}>
            {step.type}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock className="h-3 w-3" />
            {step.time}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center min-w-0 pr-4">
        {step.subject && (
          <span className="text-sm font-medium text-slate-900 truncate">
            Subject: {step.subject}
          </span>
        )}
        <span className={`text-sm text-slate-500 truncate ${!step.subject ? "mt-1" : ""}`}>
          {step.content}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {step.hasPreview && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPreviewStep(step)}
            className="h-8 text-xs px-3"
          >
            Preview
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setEditStep(step)}
          className="h-8 text-xs px-3 gap-1.5"
        >
          <PenLine className="h-3.5 w-3.5" />
          {step.editLabel || "Edit"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDuplicateStep(index)}>
              <Copy className="mr-2 h-4 w-4 text-slate-500" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteStep(step.id)} className="text-red-600 focus:bg-red-50 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface GeneratedSequenceListProps {
  isGenerated: boolean;
  onActivate: () => void;
  sequenceId?: string;
  apiSteps?: SequenceStepItem[];
  sequenceStatus?: string;
  onRegenerated?: (steps: SequenceStepItem[]) => void;
}

const mapApiStepToUiStep = (apiStep: SequenceStepItem, index: number): SequenceStep => {
  const isEmail = apiStep.stepType === STEP_TYPE.EMAIL;
  const isSms = apiStep.stepType === STEP_TYPE.SMS;
  const isWhatsapp = apiStep.stepType === STEP_TYPE.WHATSAPP;
  const isCall = apiStep.stepType === STEP_TYPE.CALL;

  return {
    id: apiStep.id || `temp-${index}`,
    type: isEmail ? "Email" : isSms ? "SMS" : isWhatsapp ? "WhatsApp" : isCall ? "AI Call" : "Unknown",
    time: `Step ${apiStep.stepOrder}`, // Simplify time mapping for now or calculate based on scheduledAt
    icon: isEmail ? Mail : isSms ? MessageSquare : isWhatsapp ? MessageCircle : isCall ? Phone : Mail,
    iconColor: isEmail ? "text-blue-500" : isSms ? "text-purple-500" : isWhatsapp ? "text-green-500" : "text-amber-500",
    iconBg: isEmail ? "bg-blue-50" : isSms ? "bg-purple-50" : isWhatsapp ? "bg-green-50" : "bg-amber-50",
    subject: apiStep.subject || undefined,
    content: apiStep.content || "",
    hasPreview: !isCall,
    editLabel: isCall ? "Edit Script" : "Edit",
  };
};

export default function GeneratedSequenceList({
  isGenerated,
  onActivate,
  sequenceId,
  apiSteps,
  sequenceStatus,
  onRegenerated,
}: GeneratedSequenceListProps) {
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  
  const [updateStep] = useUpdateSequenceStepMutation();
  const [deleteStep] = useDeleteSequenceStepMutation();
  const [regenerateSteps] = useRegenerateSequenceStepsMutation();
  
  useEffect(() => {
    if (apiSteps && apiSteps.length > 0) {
      setSteps(apiSteps.map(mapApiStepToUiStep));
    } else {
      setSteps(initialSteps);
    }
  }, [apiSteps]);

  // Dialog states
  const [previewStep, setPreviewStep] = useState<SequenceStep | null>(null);
  const [editStep, setEditStep] = useState<SequenceStep | null>(null);
  
  // Edit form states
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");

  const [animationParent] = useAutoAnimate<HTMLDivElement>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync edit form states when editStep changes
  useEffect(() => {
    if (editStep) {
      setEditSubject(editStep.subject || "");
      setEditContent(editStep.content || "");
    }
  }, [editStep]);

  // Recalculate times so they always stay chronological based on position
  const recalculateTimes = (stepsArray: SequenceStep[]) => {
    return stepsArray.map((step, index) => ({
      ...step,
      time: index === 0 ? "Now" : `+${index * 2} days`
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return recalculateTimes(arrayMove(items, oldIndex, newIndex));
      });
    }
  };

  const handleDuplicateStep = (index: number) => {
    const stepToCopy = steps[index];
    const newStep = { ...stepToCopy, id: Date.now() };
    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, newStep);
    setSteps(recalculateTimes(newSteps));
  };

  const handleDeleteStep = async (id: string | number) => {
    if (sequenceId && typeof id === 'string') {
      const loadingToastId = showLoading("Deleting step...");
      try {
        await deleteStep({ sequenceId, stepId: id }).unwrap();
        dismissToast(loadingToastId);
        showSuccess("Step deleted successfully");
      } catch (err: any) {
        dismissToast(loadingToastId);
        showError(err?.data?.message || "Failed to delete step");
        return; // Stop local update if API fails
      }
    }
    
    setSteps((prev) => recalculateTimes(prev.filter(step => step.id !== id)));
  };

  const handleAddStep = (type: "Email" | "SMS" | "WhatsApp" | "AI Call") => {
    let newStep: SequenceStep;
    const baseStep = { id: Date.now(), time: "", hasPreview: true }; // time will be recalculated

    if (type === "Email") {
      newStep = { ...baseStep, type, icon: Mail, iconColor: "text-blue-500", iconBg: "bg-blue-50", subject: "New Subject", content: "New Email Content..." };
    } else if (type === "WhatsApp") {
      newStep = { ...baseStep, type, icon: MessageCircle, iconColor: "text-green-500", iconBg: "bg-green-50", content: "New WhatsApp Message..." };
    } else if (type === "AI Call") {
      newStep = { ...baseStep, type, icon: Phone, iconColor: "text-amber-500", iconBg: "bg-amber-50", content: "AI will call...", hasPreview: false, editLabel: "Edit Script" };
    } else {
      newStep = { ...baseStep, type: "SMS", icon: MessageSquare, iconColor: "text-purple-500", iconBg: "bg-purple-50", content: "New step — generate the sequence (or Edit) to add content." };
    }
    
    setSteps((prev) => recalculateTimes([...prev, newStep]));
  };

  const handleSaveEdit = async () => {
    if (!editStep) return;
    
    if (sequenceId && typeof editStep.id === 'string') {
      const loadingToastId = showLoading("Saving changes...");
      try {
        await updateStep({
          sequenceId,
          stepId: editStep.id,
          body: {
            subject: editStep.type === "Email" ? editSubject : null,
            content: editContent,
          }
        }).unwrap();
        dismissToast(loadingToastId);
        showSuccess("Step updated successfully");
      } catch (err: any) {
        dismissToast(loadingToastId);
        showError(err?.data?.message || "Failed to update step");
        return; // Stop local update if API fails
      }
    }

    setSteps(steps.map(step => {
      if (step.id === editStep.id) {
        return {
          ...step,
          subject: editStep.type === "Email" ? editSubject : step.subject,
          content: editContent,
        };
      }
      return step;
    }));
    setEditStep(null);
  };

  const handleRegenerate = async () => {
    if (!sequenceId) return;
    const toastId = showLoading("Regenerating all steps...");
    try {
      const response = await regenerateSteps(sequenceId).unwrap();
      dismissToast(toastId);
      showSuccess("Steps regenerated successfully");
      if (onRegenerated) {
         onRegenerated(response.data.sequence.steps);
      }
    } catch (err: any) {
      dismissToast(toastId);
      showError(err?.data?.message || "Failed to regenerate steps");
    }
  };

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-900">
              Your Generated Sequence
            </h2>
            {isGenerated && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal hover:bg-slate-100 rounded-md">
                {steps.length} steps
              </Badge>
            )}
          </div>
          {isGenerated && (
            <div className="flex items-center gap-2">
              <Button onClick={handleRegenerate} variant="outline" size="sm" className="gap-2 text-slate-700 h-9">
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>

              <Button onClick={onActivate} size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4">
                <Send className="h-4 w-4" />
                {sequenceStatus === "active" ? "Pause Sequence" : "Activate Sequence"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className={`flex flex-col gap-3 p-6 ${isGenerated ? "bg-slate-50/50" : ""}`}>
          {!isGenerated ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">No sequence generated yet</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Configure your preferences above and click Generate to see your AI-crafted follow-up sequence here.
              </p>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div ref={animationParent} className="flex flex-col gap-3">
                <SortableContext 
                  items={steps.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {steps.map((step, index) => (
                    <SortableStep
                      key={step.id}
                      step={step}
                      index={index}
                      setPreviewStep={setPreviewStep}
                      setEditStep={setEditStep}
                      handleDuplicateStep={handleDuplicateStep}
                      handleDeleteStep={handleDeleteStep}
                    />
                  ))}
                </SortableContext>
                
                <div className="flex justify-center mt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 text-slate-600 rounded-full h-8 px-4 border-dashed border-slate-300 bg-white hover:bg-slate-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Step
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-40">
                      <DropdownMenuItem onClick={() => handleAddStep("Email")}>
                        <Mail className="mr-2 h-4 w-4 text-blue-500" />
                        Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddStep("SMS")}>
                        <MessageSquare className="mr-2 h-4 w-4 text-purple-500" />
                        SMS
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddStep("WhatsApp")}>
                        <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddStep("AI Call")}>
                        <Phone className="mr-2 h-4 w-4 text-amber-500" />
                        AI Call
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewStep} onOpenChange={(open) => !open && setPreviewStep(null)}>
        <DialogContent className="max-w-md rounded-xl overflow-hidden p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-base font-semibold text-slate-900">
              {previewStep?.type === "Email" ? "Email preview" : 
               previewStep?.type === "SMS" ? "SMS preview" : 
               previewStep?.type === "WhatsApp" ? "WhatsApp preview" : "Preview"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {previewStep?.time}
            </div>
            <div className="flex flex-col gap-2">
              {previewStep?.subject && (
                <div className="font-semibold text-sm text-slate-900">
                  Subject: {previewStep.subject}
                </div>
              )}
              <div className="text-sm text-slate-700 whitespace-pre-wrap">
                {previewStep?.content}
              </div>
            </div>
          </div>
          <div className="flex justify-end px-6 py-4 border-t bg-slate-50/50">
            <Button variant="outline" onClick={() => setPreviewStep(null)} className="h-9">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editStep} onOpenChange={(open) => !open && setEditStep(null)}>
        <DialogContent className="max-w-xl rounded-xl overflow-hidden p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-base font-semibold text-slate-900">
              {editStep?.type === "Email" ? "Edit Email message" : 
               editStep?.type === "SMS" ? "Edit SMS message" : 
               editStep?.type === "WhatsApp" ? "Edit WhatsApp message" : "Edit call script"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 flex flex-col gap-5">
            {editStep?.type === "Email" && (
              <div className="flex flex-col gap-2">
                <Label className="font-normal text-slate-700">Subject</Label>
                <Input 
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label className="font-normal text-slate-700">
                {editStep?.type === "AI Call" ? "Call script" : "Message"}
              </Label>
              <Textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[200px] resize-none text-sm p-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50/50">
            <Button 
              variant="ghost" 
              onClick={() => setEditStep(null)} 
              className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 h-9"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-5"
            >
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
