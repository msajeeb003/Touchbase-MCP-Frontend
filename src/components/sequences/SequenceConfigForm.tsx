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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardProgress from "@/components/sequences/WizardProgress";
import ManageTemplatesDialog from "@/components/sequences/ManageTemplatesDialog";
import { useGetPromptTemplatesQuery } from "@/store/features/templates/templatesApi";
import { useGenerateSaveSequenceMutation } from "@/store/features/sequences/sequencesApi";
import { GOAL_TYPES } from "@/constants/goalType";
import {
  formatCadence,
  isValidCadence,
  parseCadence,
} from "@/constants/cadence";
import type { LeadItem } from "@/types/leads";
import type { SequenceItem, SequenceStepItem } from "@/types/sequences";
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

const GOAL_ICONS = {
  "Book another call": Calendar,
  "Get a reply": MessageSquare,
  "Build relationship": Users,
  "Close the deal": FileCheck,
  "Send proposal": FileText,
  "Share resources": Share2,
} as const;
interface SequenceConfigFormProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  situation: string | null;
  setSituation: (val: string) => void;
  goal: string;
  setGoal: (val: string) => void;
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
  const [customSteps, setCustomSteps] = useState(parsedCadence?.steps ?? 5);
  const [customDays, setCustomDays] = useState(parsedCadence?.days ?? 7);
  const isCadenceValid = isValidCadence(cadence);

  useEffect(() => {
    const parsed = parseCadence(cadence);
    if (!parsed) return;
    setCustomSteps(parsed.steps);
    setCustomDays(parsed.days);
  }, [cadence]);
  const {
    data: templatesResponse,
    isLoading: isLoadingTemplates,
    isError: isTemplatesError,
  } = useGetPromptTemplatesQuery();
  const templates = templatesResponse?.data || [];

  const [generateSave] = useGenerateSaveSequenceMutation();

  const situations = [
    ...templates.map((template) => ({
      id: template.id,
      title: template.name,
      desc: template.promptText,
      icon: BookOpen,
      isCustom: false,
    })),
    {
      id: "__custom__",
      title: "Custom",
      desc: "Create or manage your own template",
      icon: Sparkles,
      isCustom: true,
    },
  ];

  const hasMoreSituations = situations.length > TEMPLATE_PREVIEW_COUNT;
  const visibleSituations = showAllSituations
    ? situations
    : situations.slice(0, TEMPLATE_PREVIEW_COUNT);
  const goals = GOAL_TYPES.map((goalType) => ({
    id: goalType,
    label: goalType,
    icon: GOAL_ICONS[goalType],
  }));

  const handleSituationSelect = (id: string, isCustom: boolean) => {
    if (isCustom) {
      navigate("/dashboard/templates");
      return;
    }

    setSituation(id);
    if (goal && currentStep === 1) setCurrentStep(2);
  };

  const handleGoalSelect = (id: string) => {
    setGoal(id);
    if (situation && currentStep === 1) setCurrentStep(2);
  };

  const handleCustomStepsChange = (raw: string) => {
    const steps = Math.max(1, Number(raw) || 1);
    setCustomSteps(steps);
    setCadence(formatCadence(steps, customDays));
  };

  const handleCustomDaysChange = (raw: string) => {
    const days = Math.max(1, Number(raw) || 1);
    setCustomDays(days);
    setCadence(formatCadence(customSteps, days));
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
      <CardContent className="flex flex-col gap-8 p-6">
        <WizardProgress
          currentStep={sequenceStatus === "active" ? 6 : currentStep}
        />
        <hr className="border-slate-100" />

        {/* Section 1 */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                1. What happened with this lead?
              </h2>
              <p className="text-sm text-slate-500">
                This helps us choose the right follow-up strategy.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsManageTemplatesOpen(true)}
            >
              <Settings className="h-4 w-4" />
              Manage templates
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoadingTemplates && (
              <p className="text-sm text-slate-500">Loading templates...</p>
            )}
            {isTemplatesError && (
              <p className="text-sm text-red-500">Failed to load templates.</p>
            )}
            {visibleSituations.map((item) => {
              const isSelected = situation === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSituationSelect(item.id, item.isCustom)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${isSelected
                    ? "border-indigo-600 bg-indigo-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                    }`}
                >
                  <item.icon
                    className={`mb-3 h-5 w-5 ${isSelected ? "text-indigo-600" : "text-slate-500"
                      }`}
                  />
                  <h3
                    className={`text-sm font-semibold ${isSelected ? "text-indigo-900" : "text-slate-900"
                      }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`mt-1 line-clamp-2 text-xs ${isSelected ? "text-indigo-700" : "text-slate-500"
                      }`}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
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
                  : `More (${situations.length - TEMPLATE_PREVIEW_COUNT} more)`}
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
            {goals.map((item) => {
              const isSelected = goal === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`gap-2 rounded-full ${isSelected
                    ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-none"
                    : "text-slate-700"
                    }`}
                  onClick={() => handleGoalSelect(item.id)}
                >
                  <item.icon
                    className={`h-4 w-4 ${isSelected ? "text-indigo-600" : "text-slate-400"
                      }`}
                  />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Section 3 */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-900">
            3. Preferences
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Cadence</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cadence-steps" className="text-xs font-normal text-slate-500">
                    Steps
                  </Label>
                  <Input
                    id="cadence-steps"
                    type="number"
                    min={1}
                    value={customSteps}
                    onChange={(e) => handleCustomStepsChange(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cadence-days" className="text-xs font-normal text-slate-500">
                    Days
                  </Label>
                  <Input
                    id="cadence-days"
                    type="number"
                    min={1}
                    value={customDays}
                    onChange={(e) => handleCustomDaysChange(e.target.value)}
                  />
                </div>
                <p className="col-span-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{cadence}</span>
                </p>
                {!isCadenceValid && (
                  <p className="col-span-2 text-xs text-red-500">
                    Steps and days must be at least 1.
                  </p>
                )}
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

        {/* Generate Button */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleGenerate}
            disabled={currentStep < 2 || isGenerating || !selectedLead || !isCadenceValid}
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-10 px-6 font-semibold"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Generate Follow-up Sequence"}
          </Button>
          <span className="text-sm text-slate-400">Takes ~10 seconds</span>
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
    </Card>
  );
}
