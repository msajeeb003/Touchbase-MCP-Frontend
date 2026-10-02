import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, Loader2, Plus, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PromptTemplateReference, {
  PROMPT_TEMPLATE_VARIABLE_ROWS,
} from "@/components/templates/PromptTemplateReference";
import { createPromptTemplateSchema } from "@/schema/templates/createPromptTemplate.schema";
import { generatePromptTextSchema } from "@/schema/templates/generatePromptText.schema";
import {
  useGeneratePromptTextMutation,
  useGetPromptTemplateByIdQuery,
  useUpdatePromptTemplateMutation,
} from "@/store/features/templates/templatesApi";
import type { GeneratePromptTextRequestBody } from "@/types/templates";
import { useSteelTheme } from "@/components/dashboard/dashboardTheme";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";

const STAGE_PRESETS = ["NoShow", "Interested", "Proposal sent", "Cold lead"];

const emptyBrief = {
  followUpScenario: "",
  serviceDescription: "",
  sequenceGoal: "",
  senderName: "",
  companyName: "",
  ctaLink: "",
  additionalNotes: "",
};

type BriefFields = typeof emptyBrief;
type BriefErrors = Partial<Record<keyof BriefFields, string>>;

function FieldLabel({
  children,
  required,
  optional,
}: {
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <Label className="flex items-center gap-1.5 font-semibold text-landing-fog">
      <span>
        {children}
        {required && (
          <span className="ml-0.5 font-semibold text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {optional && (
        <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-landing-fog/55">
          Optional
        </span>
      )}
    </Label>
  );
}

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
  useSteelTheme();
  const navigate = useNavigate();
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const { data, isLoading: isTemplateLoading, isError } = useGetPromptTemplateByIdQuery(id ?? "", {
    skip: !id,
  });
  const [generatePromptText, { isLoading: isGenerating }] = useGeneratePromptTextMutation();
  const [updatePromptTemplate, { isLoading: isSaving }] = useUpdatePromptTemplateMutation();

  const [step, setStep] = useState<"editor" | "brief">("editor");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [brief, setBrief] = useState<BriefFields>(emptyBrief);
  const [briefErrors, setBriefErrors] = useState<BriefErrors>({});
  const [isHydrated, setIsHydrated] = useState(false);

  const [promptText, setPromptText] = useState("");
  const [name, setName] = useState("");
  const [followUpStage, setFollowUpStage] = useState("");
  const [isCustomStage, setIsCustomStage] = useState(false);
  const [saveErrors, setSaveErrors] = useState<{
    name?: string;
    followUpStage?: string;
    promptText?: string;
  }>({});
  const [pendingAction, setPendingAction] = useState<"regenerate" | "leave" | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const hasBrief = Boolean(
    brief.followUpScenario.trim() &&
      brief.serviceDescription.trim() &&
      brief.sequenceGoal.trim() &&
      brief.senderName.trim(),
  );

  useEffect(() => {
    if (!data?.data || isHydrated) return;
    const template = data.data;
    setName(template.name);
    setPromptText(template.promptText);
    const stage = template.followUpStage || "";
    setFollowUpStage(stage);
    setIsCustomStage(Boolean(stage) && !STAGE_PRESETS.includes(stage));
    setIsHydrated(true);
  }, [data, isHydrated]);

  const updateBrief = (field: keyof BriefFields, value: string) => {
    setBrief((prev) => ({ ...prev, [field]: value }));
    setBriefErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const runGenerate = async () => {
    const parsed = generatePromptTextSchema.safeParse(brief);

    if (!parsed.success) {
      const errors: BriefErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof BriefFields;
        if (field && !errors[field]) errors[field] = issue.message;
      }
      setBriefErrors(errors);
      setStep("brief");
      setAdvancedOpen(advancedOpen || Boolean(errors.companyName || errors.ctaLink));
      return;
    }

    const values = parsed.data;
    const payload: GeneratePromptTextRequestBody = {
      followUpScenario: values.followUpScenario,
      serviceDescription: values.serviceDescription,
      sequenceGoal: values.sequenceGoal,
      senderName: values.senderName,
      ...(values.ctaLink ? { ctaLink: values.ctaLink } : {}),
      ...(values.companyName ? { companyName: values.companyName } : {}),
      ...(values.additionalNotes ? { additionalNotes: values.additionalNotes } : {}),
    };

    const loadingToastId = showLoading("Generating prompt text...");

    try {
      const response = await generatePromptText(payload).unwrap();
      setPromptText(response.data.promptText);
      setSaveErrors((prev) => ({ ...prev, promptText: undefined }));
      setIsDirty(true);
      setStep("editor");
      showSuccess(response.message || "Prompt text generated successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to generate prompt text. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  const handleRegenerate = () => {
    if (!hasBrief) {
      setStep("brief");
      return;
    }
    if (promptText.trim()) {
      setPendingAction("regenerate");
      return;
    }
    void runGenerate();
  };

  const handleCancel = () => {
    if (isDirty) {
      setPendingAction("leave");
      return;
    }
    navigate("/dashboard/templates");
  };

  const confirmPendingAction = () => {
    const action = pendingAction;
    setPendingAction(null);
    if (action === "regenerate") {
      void runGenerate();
      return;
    }
    if (action === "leave") {
      navigate("/dashboard/templates");
    }
  };

  const insertVariable = (variable: string) => {
    const el = promptRef.current;
    if (!el) {
      setPromptText((prev) => `${prev}${variable}`);
      setIsDirty(true);
      return;
    }
    const start = el.selectionStart ?? promptText.length;
    const end = el.selectionEnd ?? start;
    setPromptText(`${promptText.slice(0, start)}${variable}${promptText.slice(end)}`);
    setIsDirty(true);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + variable.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const handleSelectStage = (preset: string) => {
    setIsCustomStage(false);
    setFollowUpStage(preset);
    setIsDirty(true);
    setSaveErrors((prev) => ({ ...prev, followUpStage: undefined }));
  };

  const handleSelectCustomStage = () => {
    if (!isCustomStage) setFollowUpStage("");
    setIsCustomStage(true);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!id) return;

    const parsed = createPromptTemplateSchema.safeParse({ name, followUpStage, promptText });

    if (!parsed.success) {
      const errors: { name?: string; followUpStage?: string; promptText?: string } = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as "name" | "followUpStage" | "promptText";
        if (field && !errors[field]) errors[field] = issue.message;
      }
      setSaveErrors(errors);
      setStep("editor");
      return;
    }

    setSaveErrors({});
    const loadingToastId = showLoading("Updating prompt template...");

    try {
      const response = await updatePromptTemplate({
        id,
        body: {
          name,
          followUpStage,
          promptText,
        },
      }).unwrap();
      showSuccess(response.message || "Prompt template updated successfully");
      navigate("/dashboard/templates");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to update prompt template. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
    }
  };

  if (isTemplateLoading || (!isHydrated && !isError)) {
    return (
      <div className="rounded-xl border border-dashed border-landing-line p-8 font-landing-sans text-sm text-landing-fog/60">
        Loading template...
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="rounded-xl border border-landing-voice/40 bg-landing-voice/10 p-8 font-landing-sans text-sm text-landing-voice">
        Failed to load template.
      </div>
    );
  }

  return (
    <div className="space-y-4 font-landing-sans text-landing-fog/80">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-landing-display text-[clamp(24px,2.6vw,30px)] font-bold tracking-[-0.02em] text-landing-fog">Edit Prompt Template</h2>
          <p className="mt-1 text-sm text-landing-fog/55">
            {step === "brief"
              ? "Answer a few questions to regenerate the prompt."
              : "Update the name, stage, and prompt text."}
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          Back to templates
        </Button>
      </div>

      {step === "brief" ? (
        <div className="rounded-2xl border border-landing-line bg-landing-steel-2 p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep("editor")}
              className="h-8 gap-1.5 px-2 text-landing-fog/65 hover:text-landing-fog"
            >
              <ArrowLeft className="h-4 w-4" />
              Editor
            </Button>
            <span className="text-sm font-medium text-landing-fog">Generate with AI</span>
          </div>

          <div className="space-y-5">
            <div className="flex flex-col gap-2">
              <FieldLabel required>What is the situation?</FieldLabel>
              <Textarea
                value={brief.followUpScenario}
                onChange={(e) => updateBrief("followUpScenario", e.target.value)}
                placeholder="The lead booked a discovery call but did not show up."
                className="min-h-20 resize-y text-sm"
              />
              {briefErrors.followUpScenario && (
                <p className="text-xs text-destructive">{briefErrors.followUpScenario}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel required>What do you offer?</FieldLabel>
              <Textarea
                value={brief.serviceDescription}
                onChange={(e) => updateBrief("serviceDescription", e.target.value)}
                placeholder="AI-powered recruitment automation that reduces hiring time by 60%."
                className="min-h-20 resize-y text-sm"
              />
              {briefErrors.serviceDescription && (
                <p className="text-xs text-destructive">{briefErrors.serviceDescription}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <FieldLabel required>What should it achieve?</FieldLabel>
                <Input
                  value={brief.sequenceGoal}
                  onChange={(e) => updateBrief("sequenceGoal", e.target.value)}
                  placeholder="Book a 15-minute discovery call"
                  className="h-10 text-sm"
                />
                {briefErrors.sequenceGoal && (
                  <p className="text-xs text-destructive">{briefErrors.sequenceGoal}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel required>Who is sending it?</FieldLabel>
                <Input
                  value={brief.senderName}
                  onChange={(e) => updateBrief("senderName", e.target.value)}
                  placeholder="Artur Abdullin"
                  className="h-10 text-sm"
                />
                {briefErrors.senderName && (
                  <p className="text-xs text-destructive">{briefErrors.senderName}</p>
                )}
              </div>
            </div>

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-landing-fog/65 hover:text-landing-fog"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                  />
                  Advanced options
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <FieldLabel optional>Company name</FieldLabel>
                    <Input
                      value={brief.companyName}
                      onChange={(e) => updateBrief("companyName", e.target.value)}
                      placeholder="Artech Digital"
                      className="h-10 text-sm"
                    />
                    {briefErrors.companyName && (
                      <p className="text-xs text-destructive">{briefErrors.companyName}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <FieldLabel optional>CTA link</FieldLabel>
                    <Input
                      value={brief.ctaLink}
                      onChange={(e) => updateBrief("ctaLink", e.target.value)}
                      placeholder="https://calendly.com/yourname/30min-call"
                      className="h-10 text-sm"
                    />
                    {briefErrors.ctaLink && (
                      <p className="text-xs text-destructive">{briefErrors.ctaLink}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <FieldLabel optional>Additional notes</FieldLabel>
                  <Textarea
                    value={brief.additionalNotes}
                    onChange={(e) => updateBrief("additionalNotes", e.target.value)}
                    placeholder="Extra instructions or constraints. Example: Never mention competitors"
                    className="min-h-20 resize-y text-sm"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t pt-5">
            <Button
              variant="ghost"
              onClick={() => setStep("editor")}
              className="text-landing-fog/80 hover:bg-white/[0.06] hover:text-landing-fog"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void runGenerate()}
              disabled={isGenerating}
              className="gap-2 bg-landing-sky px-5 font-semibold text-landing-steel hover:bg-landing-sky-deep"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate prompt
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-landing-line bg-landing-steel-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
            <span className="text-sm font-medium text-landing-fog">Prompt</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="h-8 gap-1.5 text-xs"
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : hasBrief ? (
                <RefreshCw className="h-3.5 w-3.5" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {hasBrief ? "Regenerate" : "Generate with AI"}
            </Button>
          </div>

          <div className="space-y-4 border-b border-landing-line bg-landing-steel/50 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <FieldLabel required>Template name</FieldLabel>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsDirty(true);
                    setSaveErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="NoShow Follow-up Template"
                  className="h-10 bg-landing-steel text-sm"
                />
                {saveErrors.name && (
                  <p className="text-xs text-destructive">{saveErrors.name}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel required>Follow-up stage</FieldLabel>
                <div className="flex flex-wrap items-center gap-1.5">
                  {STAGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectStage(preset)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        !isCustomStage && followUpStage === preset
                          ? "border-landing-sky/40 bg-landing-sky-soft text-landing-sky"
                          : "border-landing-line bg-landing-steel text-landing-fog/65 hover:border-landing-sky/40 hover:text-landing-fog"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSelectCustomStage}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      isCustomStage
                        ? "border-landing-sky/40 bg-landing-sky-soft text-landing-sky"
                        : "border-landing-line bg-landing-steel text-landing-fog/65 hover:border-landing-sky/40 hover:text-landing-fog"
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {isCustomStage && (
                  <Input
                    value={followUpStage}
                    onChange={(e) => {
                      setFollowUpStage(e.target.value);
                      setIsDirty(true);
                      setSaveErrors((prev) => ({ ...prev, followUpStage: undefined }));
                    }}
                    placeholder="Enter a stage"
                    className="h-10 bg-landing-steel text-sm"
                  />
                )}
                {saveErrors.followUpStage && (
                  <p className="text-xs text-destructive">{saveErrors.followUpStage}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 font-landing-mono text-[10.5px] uppercase tracking-[0.1em] text-landing-fog/45">
                Insert
              </span>
              {PROMPT_TEMPLATE_VARIABLE_ROWS.map((row) => (
                <button
                  key={row.variable}
                  type="button"
                  onClick={() => insertVariable(row.variable)}
                  className="inline-flex items-center gap-1 rounded-full border border-landing-line bg-white/[0.04] px-2.5 py-1 font-landing-mono text-[11px] text-landing-fog/65 transition-colors hover:border-landing-sky/40 hover:bg-landing-sky-soft hover:text-landing-sky"
                >
                  <Plus className="h-3 w-3" />
                  {row.variable}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel required>Prompt text</FieldLabel>
              <Textarea
                ref={promptRef}
                value={promptText}
                onChange={(e) => {
                  setPromptText(e.target.value);
                  setIsDirty(true);
                  setSaveErrors((prev) => ({ ...prev, promptText: undefined }));
                }}
                placeholder="You are a virtual assistant for {{lead.company}}..."
                className="min-h-[360px] resize-y font-landing-mono text-[13px] leading-relaxed"
              />
              {saveErrors.promptText && (
                <p className="text-xs text-destructive">{saveErrors.promptText}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t px-4 py-4 sm:px-6">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-landing-fog/80 hover:bg-white/[0.06] hover:text-landing-fog"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="gap-2 bg-landing-sky px-5 font-semibold text-landing-steel hover:bg-landing-sky-deep"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save template"}
            </Button>
          </div>
        </div>
      )}

      {step === "editor" && <PromptTemplateReference />}

      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent className="border-landing-line bg-landing-steel-2 font-landing-sans">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === "regenerate" ? "Replace this prompt?" : "Discard changes?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "regenerate"
                ? "Generating again overwrites the prompt you have in the editor."
                : "Your changes have not been saved yet and will be lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPendingAction}>
              {pendingAction === "regenerate" ? "Regenerate" : "Discard"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
