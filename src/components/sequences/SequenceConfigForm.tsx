import {
  Phone,
  MessageSquare,
  Sparkles,
  Calendar,
  MessageCircle,
  FileCheck,
  Mail,
  Settings,
  Loader2,
  X,
  BookOpen,
  Users,
  FileText,
  Share2,
  Plus,
  MoreVertical,
  PenLine,
  Trash2,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardProgress from "@/components/sequences/WizardProgress";
import ManageTemplatesDialog from "@/components/sequences/ManageTemplatesDialog";
import { useGetPromptTemplatesQuery } from "@/store/features/templates/templatesApi";
import { useGenerateSaveSequenceMutation } from "@/store/features/sequences/sequencesApi";
import {
  useCreateSequenceGoalMutation,
  useDeleteSequenceGoalMutation,
  useGetSequenceGoalsQuery,
  useUpdateSequenceGoalMutation,
} from "@/store/features/sequenceGoals/sequenceGoalsApi";
import {
  formatCadence,
  getCadenceFieldError,
  isValidCadence,
  parseCadence,
  parsePositiveIntInput,
} from "@/constants/cadence";
import type { LeadItem } from "@/types/leads";
import type { SequenceItem, SequenceStepItem } from "@/types/sequences";
import type { SequenceGoalItem } from "@/types/sequenceGoals";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const GOAL_ICONS: Record<string, typeof Target> = {
  "Book another call": Calendar,
  "Get a reply": MessageSquare,
  "Build relationship": Users,
  "Close the deal": FileCheck,
  "Send proposal": FileText,
  "Share resources": Share2,
};

const getGoalIcon = (label: string) => GOAL_ICONS[label] ?? Target;
interface SequenceConfigFormProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  situation: string | null;
  setSituation: (val: string) => void;
  goal: string | null;
  setGoal: (val: string | null) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  setIsGenerated: (val: boolean) => void;
  selectedLead: LeadItem | null;
  onSequenceGenerated: (sequence: SequenceItem, steps: SequenceStepItem[]) => void;
  tone: string;
  setTone: (val: string) => void;
  intensity: string;
  setIntensity: (val: string) => void;
  cadence: string;
  setCadence: (val: string) => void;
  channels: string[];
  setChannels: (val: string[] | ((prev: string[]) => string[])) => void;
  customPrompt: string;
  setCustomPrompt: (val: string) => void;
  sequenceStatus?: string;
  sequenceId?: string;
}

export default function SequenceConfigForm({
  currentStep,
  setCurrentStep,
  situation,
  setSituation,
  goal,
  setGoal,
  isGenerating,
  setIsGenerating,
  setIsGenerated,
  selectedLead,
  onSequenceGenerated,
  tone,
  setTone,
  intensity,
  setIntensity,
  cadence,
  setCadence,
  channels,
  setChannels,
  customPrompt,
  setCustomPrompt,
  sequenceStatus,
  sequenceId,
}: SequenceConfigFormProps) {
  const navigate = useNavigate();
  const [isManageTemplatesOpen, setIsManageTemplatesOpen] = useState(false);
  const [showAllSituations, setShowAllSituations] = useState(false);
  const TEMPLATE_PREVIEW_COUNT = 6;
  const parsedCadence = parseCadence(cadence);
  const [stepsInput, setStepsInput] = useState(String(parsedCadence?.steps ?? 5));
  const [daysInput, setDaysInput] = useState(String(parsedCadence?.days ?? 7));
  const stepsError = getCadenceFieldError(stepsInput);
  const daysError = getCadenceFieldError(daysInput);
  const parsedSteps = parsePositiveIntInput(stepsInput);
  const parsedDays = parsePositiveIntInput(daysInput);
  const isCadenceValid =
    parsedSteps !== null && parsedDays !== null && isValidCadence(cadence);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalLabel, setNewGoalLabel] = useState("");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalLabel, setEditGoalLabel] = useState("");
  const [goalPendingDelete, setGoalPendingDelete] = useState<SequenceGoalItem | null>(
    null,
  );

  useEffect(() => {
    const parsed = parseCadence(cadence);
    if (!parsed) return;
    setStepsInput(String(parsed.steps));
    setDaysInput(String(parsed.days));
  }, [cadence]);

  const {
    data: templatesResponse,
    isLoading: isLoadingTemplates,
    isError: isTemplatesError,
  } = useGetPromptTemplatesQuery();
  const templates = templatesResponse?.data || [];

  const {
    data: goalsResponse,
    isLoading: isLoadingGoals,
    isError: isGoalsError,
  } = useGetSequenceGoalsQuery();
  const goals = goalsResponse?.data ?? [];

  const [createGoal, { isLoading: isCreatingGoal }] = useCreateSequenceGoalMutation();
  const [updateGoal, { isLoading: isUpdatingGoal }] = useUpdateSequenceGoalMutation();
  const [deleteGoal, { isLoading: isDeletingGoal }] = useDeleteSequenceGoalMutation();
  const [generateSave] = useGenerateSaveSequenceMutation();

  const customSituation = {
    id: "__custom__",
    title: "Custom",
    desc: "Create or manage your own template",
    icon: Sparkles,
    isCustom: true,
  };

  const templateSituations = templates.map((template) => ({
    id: template.id,
    title: template.name,
    desc: template.promptText,
    icon: BookOpen,
    isCustom: false,
  }));

  // Keep Custom pinned as the last card in the grid.
  const previewTemplateCount = Math.max(TEMPLATE_PREVIEW_COUNT - 1, 0);
  const hasMoreSituations = templateSituations.length > previewTemplateCount;
  const visibleTemplates = showAllSituations
    ? templateSituations
    : templateSituations.slice(0, previewTemplateCount);
  const visibleSituations = [...visibleTemplates, customSituation];
  const hiddenCount = Math.max(templateSituations.length - previewTemplateCount, 0);

  const handleSituationSelect = (id: string, isCustom: boolean) => {
    if (isCustom) {
      navigate("/dashboard/templates/new");
      return;
    }

    setSituation(id);
    if (goal && currentStep === 1) setCurrentStep(2);
  };

  const renderSituationCard = (item: (typeof visibleSituations)[number]) => {
    const isSelected = situation === item.id;
    return (
      <div
        key={item.id}
        onClick={() => handleSituationSelect(item.id, item.isCustom)}
        className={`cursor-pointer rounded-xl border p-4 transition-all ${
          isSelected
            ? "border-indigo-600 bg-indigo-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
        }`}
      >
        <item.icon
          className={`mb-3 h-5 w-5 ${isSelected ? "text-indigo-600" : "text-slate-500"}`}
        />
        <h3
          className={`text-sm font-semibold ${isSelected ? "text-indigo-900" : "text-slate-900"}`}
        >
          {item.title}
        </h3>
        <p
          className={`mt-1 line-clamp-2 text-xs ${isSelected ? "text-indigo-700" : "text-slate-500"}`}
        >
          {item.desc}
        </p>
      </div>
    );
  };

  const handleGoalSelect = (label: string) => {
    setIsAddingGoal(false);
    setEditingGoalId(null);
    setGoal(label);
    if (situation && currentStep === 1) setCurrentStep(2);
  };

  const handleStartAddGoal = () => {
    setEditingGoalId(null);
    setIsAddingGoal(true);
    setNewGoalLabel("");
  };

  const handleCancelAddGoal = () => {
    setIsAddingGoal(false);
    setNewGoalLabel("");
  };

  const handleSaveNewGoal = async () => {
    const label = newGoalLabel.trim();
    if (!label) {
      showError("Goal label is required");
      return;
    }
    try {
      const result = await createGoal({ label }).unwrap();
      setIsAddingGoal(false);
      setNewGoalLabel("");
      setGoal(result.data.label);
      if (situation && currentStep === 1) setCurrentStep(2);
      showSuccess("Goal added");
    } catch {
      showError("Failed to add goal");
    }
  };

  const handleStartEditGoal = (item: SequenceGoalItem) => {
    setIsAddingGoal(false);
    setEditingGoalId(item.id);
    setEditGoalLabel(item.label);
  };

  const handleCancelEditGoal = () => {
    setEditingGoalId(null);
    setEditGoalLabel("");
  };

  const handleSaveEditGoal = async () => {
    if (!editingGoalId) return;
    const label = editGoalLabel.trim();
    if (!label) {
      showError("Goal label is required");
      return;
    }
    const previousLabel = goals.find((g) => g.id === editingGoalId)?.label;
    try {
      const result = await updateGoal({
        id: editingGoalId,
        body: { label },
      }).unwrap();
      if (goal === previousLabel) {
        setGoal(result.data.label);
      }
      setEditingGoalId(null);
      setEditGoalLabel("");
      showSuccess("Goal updated");
    } catch {
      showError("Failed to update goal");
    }
  };

  const handleConfirmDeleteGoal = async () => {
    if (!goalPendingDelete) return;
    const deleted = goalPendingDelete;
    try {
      await deleteGoal(deleted.id).unwrap();
      if (goal === deleted.label) {
        setGoal(null);
      }
      setGoalPendingDelete(null);
      showSuccess("Goal deleted");
    } catch {
      showError("Failed to delete goal");
    }
  };

  const handleCustomStepsChange = (raw: string) => {
    const next = raw.replace(/\D/g, "");
    setStepsInput(next);
    const steps = parsePositiveIntInput(next);
    const days = parsePositiveIntInput(daysInput);
    if (steps !== null && days !== null) {
      setCadence(formatCadence(steps, days));
    }
  };

  const handleCustomDaysChange = (raw: string) => {
    const next = raw.replace(/\D/g, "");
    setDaysInput(next);
    const steps = parsePositiveIntInput(stepsInput);
    const days = parsePositiveIntInput(next);
    if (steps !== null && days !== null) {
      setCadence(formatCadence(steps, days));
    }
  };

  const toggleChannel = (channel: string) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const handleGenerate = async () => {
    if (!situation || !goal || !selectedLead || !isCadenceValid) return;

    setIsGenerating(true);
    setCurrentStep(3);
    const loadingToastId = showLoading("Generating sequence...");

    try {
      const response = await generateSave({
        ...(sequenceId ? { sequenceId } : {}),
        leadId: selectedLead.id,
        promptTemplateId: situation,
        goal,
        preferences: {
          tone,
          intensity,
          cadence,
          channels,
        },
      }).unwrap();

      setIsGenerated(true);
      setCurrentStep(4);
      onSequenceGenerated(response.data.sequence, response.data.sequence.steps);
      dismissToast(loadingToastId);
      showSuccess("Sequence generated successfully");
    } catch (error: unknown) {
      console.error("Failed to generate sequence:", error);
      dismissToast(loadingToastId);
      const errorMessage =
        typeof error === "object" &&
          error !== null &&
          "data" in error &&
          typeof error.data === "object" &&
          error.data !== null &&
          "message" in error.data &&
          typeof error.data.message === "string"
          ? error.data.message
          : "Failed to generate sequence";
      showError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="flex flex-col gap-8 p-4 sm:p-6">
        <WizardProgress
          currentStep={sequenceStatus === "active" ? 6 : currentStep}
        />
        <hr className="border-slate-100" />

        {/* Section 1 */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900">
                1. What happened with this lead?
              </h2>
              <p className="text-sm text-slate-500">
                This helps us choose the right follow-up strategy.
              </p>
            </div>
            {/* <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsManageTemplatesOpen(true)}
            >
              <Settings className="h-4 w-4" />
              Manage templates
            </Button> */}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoadingTemplates && (
              <p className="text-sm text-slate-500">Loading templates...</p>
            )}
            {isTemplatesError && (
              <p className="text-sm text-red-500">Failed to load templates.</p>
            )}
            {!isLoadingTemplates && !isTemplatesError && visibleSituations.map(renderSituationCard)}
          </div>

          {hasMoreSituations && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowAllSituations((prev) => !prev)}
              >
                {showAllSituations
                  ? "Show less"
                  : `More (${hiddenCount} more)`}
              </Button>
            </div>
          )}
          {situation === "Custom" && (
            <div className="flex flex-col gap-4 rounded-xl border border-indigo-100 bg-slate-50/50 p-5 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold text-slate-900">Describe your situation</span>
                </div>
                <button
                  onClick={() => setSituation("")}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Lead downloaded our pricing PDF twice but hasn't booked a demo..."
                  className="min-h-[120px] resize-none bg-white border-slate-200 placeholder:text-slate-400 focus-visible:ring-indigo-600"
                />
                <div className="flex items-center justify-between px-1 mt-1">
                  <span className="text-xs text-slate-500">
                    Write it in your own words — the AI follows this exactly.
                  </span>
                  <span className="text-xs text-slate-400">
                    {customPrompt.length} characters
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Or use one of your saved prompts</span>
                  <button
                    onClick={() => setIsManageTemplatesOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Manage templates
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isLoadingTemplates && <span className="text-sm text-slate-500 py-1">Loading saved prompts...</span>}
                  {!isLoadingTemplates && templates.length === 0 && <span className="text-sm text-slate-500 py-1">No saved prompts yet.</span>}
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setCustomPrompt(tpl.promptText)}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-indigo-200 hover:bg-slate-50 transition-colors"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      {tpl.name}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500 mt-1">
                  Pick a saved prompt to steer the AI, type your own situation above, or both.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2 */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-900">
            2. What is your goal?
          </h2>
          <div className="flex flex-wrap gap-3">
            {isLoadingGoals && (
              <span className="flex items-center gap-2 py-1 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading goals...
              </span>
            )}
            {isGoalsError && !isLoadingGoals && (
              <span className="py-1 text-sm text-red-600">
                Failed to load goals. Please refresh.
              </span>
            )}
            {!isLoadingGoals && !isGoalsError && goals.length === 0 && !isAddingGoal && (
              <span className="py-1 text-sm text-slate-500">
                No goals yet. Add one to get started.
              </span>
            )}
            {goals.map((item) => {
              const Icon = getGoalIcon(item.label);
              const isSelected = goal === item.label;
              const isEditing = editingGoalId === item.id;

              if (isEditing) {
                return (
                  <div
                    key={item.id}
                    className="flex w-full max-w-md flex-wrap items-center gap-2"
                  >
                    <Input
                      value={editGoalLabel}
                      onChange={(e) => setEditGoalLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleSaveEditGoal();
                        }
                        if (e.key === "Escape") handleCancelEditGoal();
                      }}
                      placeholder="Goal label"
                      className="h-9 min-w-[180px] flex-1"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void handleSaveEditGoal()}
                      disabled={isUpdatingGoal || !editGoalLabel.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isUpdatingGoal ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEditGoal}
                      disabled={isUpdatingGoal}
                    >
                      Cancel
                    </Button>
                  </div>
                );
              }

              return (
                <div key={item.id} className="group relative">
                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`gap-2 rounded-full pr-8 ${
                      isSelected
                        ? "border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-none hover:bg-indigo-100"
                        : "text-slate-700"
                    }`}
                    onClick={() => handleGoalSelect(item.label)}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isSelected ? "text-indigo-600" : "text-slate-400"
                      }`}
                    />
                    {item.label}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Manage ${item.label}`}
                        className={`absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full transition-opacity ${
                          isSelected
                            ? "text-indigo-600 opacity-100 hover:bg-indigo-100"
                            : "text-slate-400 opacity-0 hover:bg-slate-100 group-hover:opacity-100 focus:opacity-100"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStartEditGoal(item)}>
                        <PenLine className="mr-2 h-4 w-4 text-slate-500" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setGoalPendingDelete(item)}
                        className="text-red-600 focus:bg-red-50 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
            {!isAddingGoal && (
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-full border-dashed text-slate-700"
                onClick={handleStartAddGoal}
              >
                <Plus className="h-4 w-4 text-slate-400" />
                Add goal
              </Button>
            )}
          </div>

          {isAddingGoal && (
            <div className="flex w-full max-w-md flex-wrap items-center gap-2">
              <Input
                id="new-goal"
                value={newGoalLabel}
                onChange={(e) => setNewGoalLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleSaveNewGoal();
                  }
                  if (e.key === "Escape") handleCancelAddGoal();
                }}
                placeholder="e.g. Book another call, Get a reply, Close the deal"
                className="h-9 min-w-[180px] flex-1"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                onClick={() => void handleSaveNewGoal()}
                disabled={isCreatingGoal || !newGoalLabel.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isCreatingGoal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancelAddGoal}
                disabled={isCreatingGoal}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Section 3 */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-900">
            3. Preferences
          </h2>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Friendly & Professional">
                      <span className="flex items-center gap-2">
                        <span>🙂</span> Friendly & Professional
                      </span>
                    </SelectItem>
                    <SelectItem value="Direct & Assertive">
                      <span className="flex items-center gap-2">
                        <span>💪</span> Direct & Assertive
                      </span>
                    </SelectItem>
                    <SelectItem value="Casual & Conversational">
                      <span className="flex items-center gap-2">
                        <span>😎</span> Casual & Conversational
                      </span>
                    </SelectItem>
                    <SelectItem value="Formal & Polished">
                      <span className="flex items-center gap-2">
                        <span>🎩</span> Formal & Polished
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-slate-700">Intensity</Label>
                <Select value={intensity} onValueChange={setIntensity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700">Cadence</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cadence-steps" className="text-xs font-normal text-slate-500">
                      Steps
                    </Label>
                    <Input
                      id="cadence-steps"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={stepsInput}
                      onChange={(e) => handleCustomStepsChange(e.target.value)}
                      aria-invalid={Boolean(stepsError)}
                    />
                    {stepsError && (
                      <p className="text-xs text-red-500">{stepsError}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cadence-days" className="text-xs font-normal text-slate-500">
                      Days
                    </Label>
                    <Input
                      id="cadence-days"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={daysInput}
                      onChange={(e) => handleCustomDaysChange(e.target.value)}
                      aria-invalid={Boolean(daysError)}
                    />
                    {daysError && (
                      <p className="text-xs text-red-500">{daysError}</p>
                    )}
                  </div>
                  <p className="col-span-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">
                      {isCadenceValid ? cadence : "—"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-slate-700">Channels</Label>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-email"
                      checked={channels.includes("email")}
                      onCheckedChange={() => toggleChannel("email")}
                      className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <Label htmlFor="ch-email" className="flex items-center gap-1.5 font-normal text-slate-700">
                      <Mail className="h-3.5 w-3.5 text-blue-500" />
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-sms"
                      checked={channels.includes("sms")}
                      onCheckedChange={() => toggleChannel("sms")}
                      className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <Label htmlFor="ch-sms" className="flex items-center gap-1.5 font-normal text-slate-700">
                      <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
                      SMS
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-whatsapp"
                      checked={channels.includes("whatsapp")}
                      onCheckedChange={() => toggleChannel("whatsapp")}
                      className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <Label htmlFor="ch-whatsapp" className="flex items-center gap-1.5 font-normal text-slate-700">
                      <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                      WhatsApp
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ch-aicall"
                      checked={channels.includes("aicall")}
                      onCheckedChange={() => toggleChannel("aicall")}
                      className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <Label htmlFor="ch-aicall" className="flex items-center gap-1.5 font-normal text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-amber-500" />
                      AI Call
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            onClick={handleGenerate}
            disabled={currentStep < 2 || !goal || isGenerating || !selectedLead || !isCadenceValid}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-10 px-6 font-semibold"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Generate Follow-up Sequence"}
          </Button>
          <span className="text-sm text-slate-400">Usually takes 30–60 seconds</span>
        </div>
      </CardContent>
      <ManageTemplatesDialog
        open={isManageTemplatesOpen}
        onOpenChange={setIsManageTemplatesOpen}
        onUseTemplate={(text) => {
          setSituation("Custom");
          setCustomPrompt(text);
        }}
      />
      <AlertDialog
        open={Boolean(goalPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setGoalPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goal?</AlertDialogTitle>
            <AlertDialogDescription>
              {goalPendingDelete
                ? `“${goalPendingDelete.label}” will be removed from your goals list. This can’t be undone.`
                : "This goal will be removed from your list."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingGoal}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmDeleteGoal();
              }}
              disabled={isDeletingGoal}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingGoal ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
