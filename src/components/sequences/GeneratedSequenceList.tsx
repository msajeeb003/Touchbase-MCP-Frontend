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
  Plus,
  Sparkles,
  Copy,
  Trash2,
  Loader2,
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
import { STEP_TYPE, type StepType } from "@/constants/stepType";
import { getSendLogStatusClass } from "@/lib/sequences/stepStatusStyles";
import { 
  useUpdateSequenceStepMutation, 
  useDeleteSequenceStepMutation,
  useRegenerateSequenceStepsMutation,
  useReorderSequenceStepsMutation,
  useCreateSequenceStepMutation,
  useGenerateSequenceStepContentMutation,
} from "@/store/features/sequences/sequencesApi";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

type UiStepChannel = "Email" | "SMS" | "WhatsApp" | "AI Call";

const UI_CHANNEL_TO_STEP_TYPE: Record<UiStepChannel, StepType> = {
  Email: STEP_TYPE.EMAIL,
  SMS: STEP_TYPE.SMS,
  WhatsApp: STEP_TYPE.WHATSAPP,
  "AI Call": STEP_TYPE.CALL,
};

export interface SequenceStep {
  id: string | number;
  stepOrder: number;
  type: string;
  time: string;
  scheduledAt?: string | null;
  status: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  subject?: string;
  content: string;
  sendLog?: string | null;
  hasPreview: boolean;
  editLabel?: string;
}

const getStepStatusBadgeClass = (status: string) => {
  const value = status.toLowerCase();
  if (value === "sent") return "border-landing-whatsapp/40 bg-landing-whatsapp/15 text-landing-whatsapp";
  if (value === "pending") return "border-landing-sms/40 bg-landing-sms/15 text-landing-sms";
  if (value === "draft") return "border-landing-line bg-white/[0.06] text-landing-fog/80";
  if (value === "scheduled") return "border-landing-email/40 bg-landing-email/15 text-landing-email";
  if (value === "sending" || value === "calling") return "border-[#A78BFA]/40 bg-[#A78BFA]/15 text-[#A78BFA]";
  if (value === "skipped") return "border-landing-line bg-white/[0.06] text-landing-fog/65";
  if (value === "failed") return "border-landing-voice/40 bg-landing-voice/15 text-landing-voice";
  return "border-landing-line bg-white/[0.06] text-landing-fog/80";
};

const getSequenceStatusBadgeClass = (status: string) => {
  const value = status.toLowerCase();
  if (value === "active") return "border-landing-whatsapp/40 bg-landing-whatsapp/15 text-landing-whatsapp";
  if (value === "draft") return "border-landing-sms/40 bg-landing-sms/15 text-landing-sms";
  if (value === "completed") return "border-landing-sky/40 bg-landing-sky-soft text-landing-sky";
  if (value === "cancelled") return "border-landing-voice/40 bg-landing-voice/15 text-landing-voice";
  if (value === "paused") return "border-landing-email/40 bg-landing-email/15 text-landing-email";
  return "border-landing-line bg-white/[0.06] text-landing-fog/80";
};

const formatStepStatus = (status: string) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

const formatSequenceStatus = (status: string) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

const initialSteps: SequenceStep[] = [
  {
    id: 1,
    stepOrder: 1,
    type: "Email",
    time: "Now",
    status: "draft",
    icon: Mail,
    iconColor: "text-landing-email",
    iconBg: "bg-landing-email/15",
    subject: "Following up on our conversation",
    content: "Hi Art, I hope you're doing well. I wanted to follow up on our conversation...",
    hasPreview: true,
  },
  {
    id: 2,
    stepOrder: 2,
    type: "SMS",
    time: "+2 days",
    status: "draft",
    icon: MessageSquare,
    iconColor: "text-landing-sms",
    iconBg: "bg-landing-sms/15",
    content: "Hi Art, I tried reaching you earlier but couldn't connect. Are you still open to a quick chat this week?",
    hasPreview: true,
  },
  {
    id: 3,
    stepOrder: 3,
    type: "WhatsApp",
    time: "+4 days",
    status: "draft",
    icon: MessageCircle,
    iconColor: "text-landing-whatsapp",
    iconBg: "bg-landing-whatsapp/15",
    content: "Hi Art! Just checking in 🙂 Let me know if a quick call this week works for you.",
    hasPreview: true,
  },
  {
    id: 4,
    stepOrder: 4,
    type: "AI Call",
    time: "+6 days",
    status: "draft",
    icon: Phone,
    iconColor: "text-landing-voice",
    iconBg: "bg-landing-voice/15",
    content: "AI will call and leave a personalized voicemail asking to reschedule a call.",
    hasPreview: true,
    editLabel: "Edit Script",
  },
  {
    id: 5,
    stepOrder: 5,
    type: "Email",
    time: "+8 days",
    status: "draft",
    icon: Mail,
    iconColor: "text-landing-email",
    iconBg: "bg-landing-email/15",
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
  onGenerateContent: (stepId: string) => void;
  isGeneratingContent: boolean;
  canGenerateContent: boolean;
}

function SortableStep({
  step,
  index,
  setPreviewStep,
  setEditStep,
  handleDuplicateStep,
  handleDeleteStep,
  onGenerateContent,
  isGeneratingContent,
  canGenerateContent,
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
      className={`flex flex-col gap-3 rounded-xl border bg-landing-steel-2 p-4 shadow-sm transition-all hover:border-landing-sky/25 ${
        isDragging ? "opacity-60 shadow-lg ring-1 ring-landing-sky scale-[1.01]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 text-landing-fog/25 outline-none hover:bg-white/[0.04] hover:text-landing-fog/55"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xs font-semibold text-landing-fog/80">
            {step.stepOrder}
          </div>

          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${step.iconBg}`}>
            <step.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${step.iconColor}`} />
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-sm font-semibold ${step.iconColor}`}>{step.type}</span>
            <Badge variant="outline" className={getStepStatusBadgeClass(step.status)}>
              {formatStepStatus(step.status)}
            </Badge>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {canGenerateContent && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGenerateContent(String(step.id))}
              disabled={isGeneratingContent}
              className="h-8 gap-1.5 px-3 text-xs"
            >
              {isGeneratingContent ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {isGeneratingContent ? "Generating..." : "Generate"}
            </Button>
          )}
          {step.hasPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewStep(step)}
              className="h-8 px-3 text-xs"
            >
              Preview
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditStep(step)}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <PenLine className="h-3.5 w-3.5" />
            {step.editLabel || "Edit"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-landing-fog/40">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDuplicateStep(index)}>
                <Copy className="mr-2 h-4 w-4 text-landing-fog/55" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteStep(step.id)}
                className="text-landing-voice focus:bg-landing-voice/10 focus:text-landing-voice"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="min-w-0 space-y-1">
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-landing-fog/55">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-landing-fog/65">Scheduled:</span>
          <span>{step.time}</span>
        </p>

        {step.subject && (
          <p className="truncate text-sm font-medium text-landing-fog">
            Subject: {step.subject}
          </p>
        )}
        <p className="line-clamp-2 text-sm text-landing-fog/55 sm:truncate sm:line-clamp-none">
          {step.content}
        </p>
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
  totalSteps?: number;
  onRegenerated?: (steps: SequenceStepItem[]) => void;
}

const formatScheduledAt = (value: string | null | undefined) => {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const toDateTimeLocalValue = (value: string | Date | null | undefined) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getNextStepOrder = (stepsArray: SequenceStep[]) => {
  if (stepsArray.length === 0) return 1;
  return Math.max(...stepsArray.map((step) => step.stepOrder || 0)) + 1;
};

/** Default schedule = latest step scheduledAt + 1 day, else now. */
const getDefaultAddStepScheduledAt = (stepsArray: SequenceStep[]) => {
  const timestamps = stepsArray
    .map((step) => step.scheduledAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((value) => !Number.isNaN(value));

  if (timestamps.length === 0) return new Date();

  const next = new Date(Math.max(...timestamps));
  next.setDate(next.getDate() + 1);
  return next;
};

const BLOCKED_REORDER_STATUSES = new Set([
  "sent",
  "sending",
  "calling",
]);

const mapApiStepToUiStep = (apiStep: SequenceStepItem, index: number): SequenceStep => {
  const isEmail = apiStep.stepType === STEP_TYPE.EMAIL;
  const isSms = apiStep.stepType === STEP_TYPE.SMS;
  const isWhatsapp = apiStep.stepType === STEP_TYPE.WHATSAPP;
  const isCall = apiStep.stepType === STEP_TYPE.CALL;

  return {
    id: apiStep.id || `temp-${index}`,
    stepOrder: apiStep.stepOrder ?? index + 1,
    type: isEmail ? "Email" : isSms ? "SMS" : isWhatsapp ? "WhatsApp" : isCall ? "AI Call" : "Unknown",
    time: formatScheduledAt(apiStep.scheduledAt),
    scheduledAt: apiStep.scheduledAt ?? null,
    status: apiStep.status || "draft",
    icon: isEmail ? Mail : isSms ? MessageSquare : isWhatsapp ? MessageCircle : isCall ? Phone : Mail,
    iconColor: isEmail ? "text-landing-email" : isSms ? "text-landing-sms" : isWhatsapp ? "text-landing-whatsapp" : "text-landing-voice",
    iconBg: isEmail ? "bg-landing-email/15" : isSms ? "bg-landing-sms/15" : isWhatsapp ? "bg-landing-whatsapp/15" : "bg-landing-voice/15",
    subject: apiStep.subject || undefined,
    content: apiStep.content || "",
    sendLog: apiStep.sendLog ?? null,
    hasPreview: true,
    editLabel: isCall ? "Edit Script" : "Edit",
  };
};

/** Move steps, densify stepOrder 1..n, and reassign schedule slots by position. */
const reorderStepsWithScheduleSlots = (
  stepsArray: SequenceStep[],
  oldIndex: number,
  newIndex: number,
): SequenceStep[] => {
  const scheduleSlots = stepsArray.map((step) => step.scheduledAt);
  return arrayMove(stepsArray, oldIndex, newIndex).map((step, index) => {
    const scheduledAt = scheduleSlots[index] ?? step.scheduledAt;
    return {
      ...step,
      stepOrder: index + 1,
      scheduledAt,
      time: formatScheduledAt(scheduledAt),
    };
  });
};

export default function GeneratedSequenceList({
  isGenerated,
  onActivate,
  sequenceId,
  apiSteps,
  sequenceStatus,
  totalSteps,
  onRegenerated,
}: GeneratedSequenceListProps) {
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const canAddStep =
    typeof totalSteps !== "number" || steps.length < totalSteps;
  
  const [updateStep, { isLoading: isSavingStep }] = useUpdateSequenceStepMutation();
  const [deleteStep] = useDeleteSequenceStepMutation();
  const [regenerateSteps, { isLoading: isRegenerating }] = useRegenerateSequenceStepsMutation();
  const [reorderSteps, { isLoading: isReordering }] = useReorderSequenceStepsMutation();
  const [createStep, { isLoading: isCreatingStep }] = useCreateSequenceStepMutation();
  const [generateStepContent] = useGenerateSequenceStepContentMutation();
  const [isPersistingReorder, setIsPersistingReorder] = useState(false);
  const [generatingStepId, setGeneratingStepId] = useState<string | null>(null);
  
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
  const [addStepChannel, setAddStepChannel] = useState<UiStepChannel | null>(null);
  const [addStepOrder, setAddStepOrder] = useState(1);
  const [addScheduledAt, setAddScheduledAt] = useState("");

  // Edit form states
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");

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
      setEditScheduledAt(toDateTimeLocalValue(editStep.scheduledAt));
    }
  }, [editStep]);

  // Keep step numbers in sync with list position after add/delete (local-only)
  const recalculateStepOrders = (stepsArray: SequenceStep[]) => {
    return stepsArray.map((step, index) => ({
      ...step,
      stepOrder: index + 1,
    }));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (isPersistingReorder || isReordering) return;

    const oldIndex = steps.findIndex((item) => item.id === active.id);
    const newIndex = steps.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previousSteps = steps;
    const nextSteps = reorderStepsWithScheduleSlots(steps, oldIndex, newIndex);

    // Local-only demo steps (no sequence yet)
    if (!sequenceId) {
      setSteps(nextSteps);
      return;
    }

    const orderedStepIds = nextSteps.map((step) => step.id);
    if (orderedStepIds.some((id) => typeof id !== "string")) {
      showError("Save steps before reordering");
      return;
    }

    if (previousSteps.some((step) => BLOCKED_REORDER_STATUSES.has(step.status.toLowerCase()))) {
      showError("Cannot reorder steps that are already sending or sent");
      return;
    }

    setSteps(nextSteps);
    setIsPersistingReorder(true);
    const toastId = showLoading("Saving step order...");

    try {
      const response = await reorderSteps({
        sequenceId,
        body: { orderedStepIds: orderedStepIds as string[] },
      }).unwrap();

      // Response already includes synced stepOrder + scheduledAt — no extra refetch needed
      const syncedSteps = response.data.map(mapApiStepToUiStep);
      setSteps(syncedSteps);
      onRegenerated?.(response.data);
      dismissToast(toastId);
      showSuccess("Step order updated");
    } catch (err: unknown) {
      setSteps(previousSteps);
      dismissToast(toastId);
      const errorMessage =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof err.data === "object" &&
        err.data !== null &&
        "message" in err.data &&
        typeof err.data.message === "string"
          ? err.data.message
          : "Failed to reorder steps";
      showError(errorMessage);
    } finally {
      setIsPersistingReorder(false);
    }
  };

  const handleDuplicateStep = (index: number) => {
    const stepToCopy = steps[index];
    const newStep = { ...stepToCopy, id: Date.now() };
    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, newStep);
    setSteps(recalculateStepOrders(newSteps));
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
    
    setSteps((prev) => recalculateStepOrders(prev.filter((step) => step.id !== id)));
  };

  const handleAddStep = (type: UiStepChannel) => {
    setAddStepChannel(type);
    setAddStepOrder(getNextStepOrder(steps));
    setAddScheduledAt(toDateTimeLocalValue(getDefaultAddStepScheduledAt(steps)));
  };

  const handleCloseAddStep = () => {
    if (isCreatingStep) return;
    setAddStepChannel(null);
    setAddScheduledAt("");
  };

  const handleConfirmAddStep = async () => {
    if (!addStepChannel) return;

    if (!addScheduledAt.trim()) {
      showError("Scheduled time is required");
      return;
    }

    const scheduledAtIso = new Date(addScheduledAt).toISOString();
    if (Number.isNaN(new Date(addScheduledAt).getTime())) {
      showError("Enter a valid scheduled time");
      return;
    }

    const stepType = UI_CHANNEL_TO_STEP_TYPE[addStepChannel];
    const stepOrder = addStepOrder;

    if (!sequenceId) {
      showError("Save the sequence before adding steps");
      return;
    }

    const loadingToastId = showLoading("Creating step...");
    try {
      const response = await createStep({
        sequenceId,
        body: {
          stepOrder,
          stepType,
          scheduledAt: scheduledAtIso,
        },
      }).unwrap();

      const created = response.data;
      setSteps((prev) =>
        [...prev, mapApiStepToUiStep(created, prev.length)].sort(
          (a, b) => a.stepOrder - b.stepOrder,
        ),
      );
      onRegenerated?.(
        [
          ...(apiSteps ?? []).filter((step) =>
            steps.some((local) => local.id === step.id),
          ),
          created,
        ].sort((a, b) => a.stepOrder - b.stepOrder),
      );
      dismissToast(loadingToastId);
      showSuccess(response.message || "Step added successfully");
      setAddStepChannel(null);
      setAddScheduledAt("");
    } catch (err: unknown) {
      dismissToast(loadingToastId);
      const errorMessage =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof err.data === "object" &&
        err.data !== null &&
        "message" in err.data &&
        typeof err.data.message === "string"
          ? err.data.message
          : "Failed to create step";
      showError(errorMessage);
    }
  };

  const handleSaveEdit = async () => {
    if (!editStep) return;

    const scheduledAtIso = editScheduledAt.trim()
      ? new Date(editScheduledAt).toISOString()
      : undefined;

    if (sequenceId && typeof editStep.id === 'string') {
      const loadingToastId = showLoading("Saving changes...");
      try {
        await updateStep({
          sequenceId,
          stepId: editStep.id,
          body: {
            ...(editStep.type === "Email" ? { subject: editSubject } : {}),
            content: editContent,
            ...(scheduledAtIso ? { scheduledAt: scheduledAtIso } : {}),
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
          scheduledAt: scheduledAtIso ?? step.scheduledAt,
          time: formatScheduledAt(scheduledAtIso ?? step.scheduledAt),
        };
      }
      return step;
    }));
    setEditStep(null);
  };

  const handleRegenerate = async () => {
    if (!sequenceId || isRegenerating) return;
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

  const handleGenerateStepContent = async (stepId: string) => {
    if (!sequenceId || generatingStepId) return;

    setGeneratingStepId(stepId);
    const toastId = showLoading("Generating content...");

    try {
      const response = await generateStepContent({ sequenceId, stepId }).unwrap();
      const updatedStep = response.data;

      setSteps((prev) =>
        prev.map((step) =>
          step.id === updatedStep.id ? mapApiStepToUiStep(updatedStep, step.stepOrder - 1) : step,
        ),
      );

      onRegenerated?.(
        (apiSteps ?? []).some((step) => step.id === updatedStep.id)
          ? (apiSteps ?? []).map((step) =>
              step.id === updatedStep.id ? updatedStep : step,
            )
          : [...(apiSteps ?? []), updatedStep].sort(
              (a, b) => a.stepOrder - b.stepOrder,
            ),
      );

      // Keep open dialogs in sync if they show this step
      setPreviewStep((prev) =>
        prev && prev.id === updatedStep.id
          ? mapApiStepToUiStep(updatedStep, updatedStep.stepOrder - 1)
          : prev,
      );
      setEditStep((prev) =>
        prev && prev.id === updatedStep.id
          ? mapApiStepToUiStep(updatedStep, updatedStep.stepOrder - 1)
          : prev,
      );

      dismissToast(toastId);
      showSuccess(response.message || "Content generated successfully");
    } catch (err: unknown) {
      dismissToast(toastId);
      const errorMessage =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof err.data === "object" &&
        err.data !== null &&
        "message" in err.data &&
        typeof err.data.message === "string"
          ? err.data.message
          : "Failed to generate content";
      showError(errorMessage);
    } finally {
      setGeneratingStepId(null);
    }
  };

  const previewSendLogStyles = getSendLogStatusClass(previewStep?.status);

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-col gap-3 space-y-0 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-base font-semibold text-landing-fog">
              Your Generated Sequence
            </h2>
            {isGenerated && (
              <Badge variant="secondary" className="bg-white/[0.06] text-landing-fog/65 font-normal hover:bg-white/[0.06] rounded-md">
                {steps.length} steps
              </Badge>
            )}
            {isGenerated && sequenceStatus && (
              <Badge
                variant="outline"
                className={`font-normal ${getSequenceStatusBadgeClass(sequenceStatus)}`}
              >
                {formatSequenceStatus(sequenceStatus)}
              </Badge>
            )}
          </div>
          {isGenerated && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleRegenerate}
                variant="outline"
                size="sm"
                disabled={isRegenerating}
                className="gap-2 text-landing-fog/80 h-9"
              >
                {isRegenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isRegenerating ? "Regenerating..." : "Regenerate All"}
              </Button>

              <Button onClick={onActivate} size="sm" className="gap-2 bg-landing-sky hover:bg-landing-sky-deep text-landing-steel h-9 px-4">
                <Send className="h-4 w-4" />
                {sequenceStatus === "active" ? "Pause Sequence" : "Activate Sequence"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className={`flex flex-col gap-3 p-4 sm:p-6 ${isGenerated ? "bg-white/[0.03]" : ""}`}>
          {!isGenerated ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-landing-sky-soft flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-landing-sky" />
              </div>
              <h3 className="text-base font-semibold text-landing-fog mb-1">No sequence generated yet</h3>
              <p className="text-sm text-landing-fog/55 max-w-sm">
                Configure your preferences above and click Generate to see your AI-crafted follow-up sequence here.
              </p>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div
                ref={animationParent}
                className={`flex flex-col gap-3 ${isPersistingReorder || isReordering ? "pointer-events-none opacity-70" : ""}`}
              >
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
                      onGenerateContent={handleGenerateStepContent}
                      isGeneratingContent={generatingStepId === String(step.id)}
                      canGenerateContent={Boolean(sequenceId) && typeof step.id === "string"}
                    />
                  ))}
                </SortableContext>
                
                {canAddStep && (
                <div className="flex justify-center mt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 text-landing-fog/65 rounded-full h-8 px-4 border-dashed border-landing-fog/20 bg-landing-steel hover:bg-white/[0.04]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Step
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-40">
                      <DropdownMenuItem onClick={() => handleAddStep("Email")}>
                        <Mail className="mr-2 h-4 w-4 text-landing-email" />
                        Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddStep("SMS")}>
                        <MessageSquare className="mr-2 h-4 w-4 text-landing-sms" />
                        SMS
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddStep("WhatsApp")}>
                        <MessageCircle className="mr-2 h-4 w-4 text-landing-whatsapp" />
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddStep("AI Call")}>
                        <Phone className="mr-2 h-4 w-4 text-landing-voice" />
                        AI Call
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                )}
              </div>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewStep} onOpenChange={(open) => !open && setPreviewStep(null)}>
        <DialogContent className="flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-xl p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle className="text-base font-semibold text-landing-fog">
              {previewStep?.type === "Email" ? "Email preview" : 
               previewStep?.type === "SMS" ? "SMS preview" : 
               previewStep?.type === "WhatsApp" ? "WhatsApp preview" : 
               previewStep?.type === "AI Call" ? "AI Call preview" : "Preview"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
            <div className="flex items-center gap-1.5 text-xs text-landing-fog/55">
              <Clock className="h-3.5 w-3.5" />
              {previewStep?.time}
            </div>
            <div className="flex flex-col gap-2">
              {previewStep?.subject && (
                <div className="text-sm font-semibold text-landing-fog">
                  Subject: {previewStep.subject}
                </div>
              )}
              {previewStep?.type === "AI Call" && (
                <div className="text-sm font-semibold text-landing-fog">
                  AI Call Script
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-landing-fog/80">
                {previewStep?.content}
              </div>
            </div>
            <div className={`rounded-lg border px-4 py-3 ${previewSendLogStyles.box}`}>
              <p
                className={`text-xs font-medium uppercase tracking-wide ${previewSendLogStyles.label}`}
              >
                Send log
              </p>
              <p
                className={`mt-1.5 whitespace-pre-wrap text-sm leading-relaxed ${previewSendLogStyles.text}`}
              >
                {previewStep?.sendLog || "No send log available."}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 justify-end border-t bg-white/[0.03] px-6 py-4">
            <Button variant="outline" onClick={() => setPreviewStep(null)} className="h-9">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editStep} onOpenChange={(open) => !open && !isSavingStep && setEditStep(null)}>
        <DialogContent className="flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-xl p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle className="text-base font-semibold text-landing-fog">
              {editStep?.type === "Email" ? "Edit Email message" : 
               editStep?.type === "SMS" ? "Edit SMS message" : 
               editStep?.type === "WhatsApp" ? "Edit WhatsApp message" : "Edit call script"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
            {editStep?.type === "Email" && (
              <div className="flex flex-col gap-2">
                <Label className="font-normal text-landing-fog/80">Subject</Label>
                <Input 
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  disabled={isSavingStep}
                  className="h-10 text-sm"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label className="font-normal text-landing-fog/80">Scheduled at</Label>
              <Input
                type="datetime-local"
                value={editScheduledAt}
                onChange={(e) => setEditScheduledAt(e.target.value)}
                disabled={isSavingStep}
                className="h-10 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-normal text-landing-fog/80">
                {editStep?.type === "AI Call" ? "Call script" : "Message"}
              </Label>
              <Textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={isSavingStep}
                className="min-h-[200px] resize-none text-sm p-3"
              />
            </div>
          </div>
          <div className="flex shrink-0 justify-end gap-3 border-t bg-white/[0.03] px-6 py-4">
            <Button 
              variant="ghost" 
              onClick={() => setEditStep(null)} 
              disabled={isSavingStep}
              className="text-landing-fog/80 hover:text-landing-fog hover:bg-white/[0.06] h-9"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={isSavingStep}
              className="bg-landing-sky hover:bg-landing-sky-deep text-landing-steel h-9 px-5"
            >
              {isSavingStep ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Step Dialog */}
      <Dialog
        open={Boolean(addStepChannel)}
        onOpenChange={(open) => {
          if (!open) handleCloseAddStep();
        }}
      >
        <DialogContent className="flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-md flex-col gap-0 overflow-hidden rounded-xl p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle className="text-base font-semibold text-landing-fog">
              Add {addStepChannel ?? "Step"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
            <div className="flex flex-col gap-2">
              <Label className="font-normal text-landing-fog/80">Step order</Label>
              <Input
                value={String(addStepOrder)}
                disabled
                className="h-10 bg-white/[0.04] text-sm"
              />
              <p className="text-xs text-landing-fog/55">
                Automatically set to the next available order.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-normal text-landing-fog/80">Channel</Label>
              <Input
                value={addStepChannel ?? ""}
                disabled
                className="h-10 bg-white/[0.04] text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-normal text-landing-fog/80">Scheduled at</Label>
              <Input
                type="datetime-local"
                value={addScheduledAt}
                onChange={(e) => setAddScheduledAt(e.target.value)}
                disabled={isCreatingStep}
                className="h-10 text-sm"
              />
              {/* <p className="text-xs text-landing-fog/55">
                Default is the latest step time plus one day.
              </p> */}
            </div>
          </div>
          <div className="flex shrink-0 justify-end gap-3 border-t bg-white/[0.03] px-6 py-4">
            <Button
              variant="ghost"
              onClick={handleCloseAddStep}
              disabled={isCreatingStep}
              className="h-9 text-landing-fog/80 hover:bg-white/[0.06] hover:text-landing-fog"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleConfirmAddStep()}
              disabled={isCreatingStep || !addScheduledAt.trim()}
              className="h-9 bg-landing-sky px-5 text-landing-steel hover:bg-landing-sky-deep"
            >
              {isCreatingStep ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add step"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
