import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Loader2, Plus, RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess } from "@/utils/toast";

const VARIABLES = [
  "{{lead.name}}",
  "{{lead.email}}",
  "{{lead.phone}}",
  "{{lead.company}}",
  "{{lead.location}}",
  "{{lead.followUpStage}}",
  "{{lead.notes}}",
  "{{sequence.name}}",
];

const STAGE_PRESETS = ["No-show", "Interested", "Proposal sent", "Cold lead"];

const buildDummyPrompt = (brief: {
  scenario: string;
  goal: string;
  sender: string;
  company: string;
  ctaLink: string;
  notes: string;
}) => {
  const company = brief.company || "your company";
  const cta = brief.ctaLink || "https://calendly.com/yourname/30min-call";

  return `You are a Virtual Assistant writing follow-up messages on behalf of ${brief.sender} at ${company}.

## CONTEXT
${brief.scenario}

Write ONE message for the CURRENT STEP ONLY. Cadence, channel, tone and intensity are supplied by the app.

## GOAL
${brief.goal}

## PERSONALIZATION
- Address the lead by first name using {{lead.name}}
- Use {{lead.company}}, {{lead.location}} and {{lead.notes}} when they add value; skip empty fields
- Include the CTA once per message: ${cta}
- Sign as: ${brief.sender}

## CHANNEL RULES
- EMAIL: line 1 must be "SUBJECT: <short subject>", blank line, then the body
- SMS: 2-4 short sentences, one clear CTA
- WHATSAPP: 3-6 warm sentences, light formatting allowed
- CALL: 5-8 short talking points, never read the URL aloud

## WRITING GUIDELINES
- Natural, direct and human. No corporate filler.
- Never invent facts that are not in the lead data or transcript.
- Always end with one low-friction next step.${brief.notes ? `\n- ${brief.notes}` : ""}`;
};

export default function CreateTemplateDemoPage() {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [step, setStep] = useState<"brief" | "editor">("brief");
  const [isGenerating, setIsGenerating] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [scenario, setScenario] = useState("");
  const [goal, setGoal] = useState("");
  const [sender, setSender] = useState("");
  const [company, setCompany] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [notes, setNotes] = useState("");

  const [promptText, setPromptText] = useState("");
  const [name, setName] = useState("");
  const [stage, setStage] = useState("");
  const [customStageOpen, setCustomStageOpen] = useState(false);

  const canGenerate = scenario.trim() && goal.trim() && sender.trim();

  const handleGenerate = () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    window.setTimeout(() => {
      setPromptText(buildDummyPrompt({ scenario, goal, sender, company, ctaLink, notes }));
      setName(name || `${stage || "Follow-up"} Template`);
      setIsGenerating(false);
      setStep("editor");
    }, 900);
  };

  const insertVariable = (variable: string) => {
    const el = textareaRef.current;
    if (!el) {
      setPromptText((prev) => `${prev}${variable}`);
      return;
    }
    const start = el.selectionStart ?? promptText.length;
    const end = el.selectionEnd ?? start;
    setPromptText(`${promptText.slice(0, start)}${variable}${promptText.slice(end)}`);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + variable.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const handleSave = () => {
    showSuccess("Demo only - nothing was saved");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-semibold text-slate-900">Create Prompt Template</h2>
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
              Demo
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Prototype of the simplified flow. Nothing here is saved to the server.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/dashboard/templates")}>
          Back to templates
        </Button>
      </div>

      {step === "brief" ? (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-900">
              Describe your follow-up
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Three quick answers and the prompt is written for you. You can edit everything after.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex flex-col gap-2">
              <Label className="font-normal text-slate-700">What is the situation?</Label>
              <Textarea
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="The lead booked a discovery call but did not show up."
                className="min-h-20 resize-y text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="font-normal text-slate-700">What should it achieve?</Label>
                <Input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Book a 15-minute discovery call"
                  className="h-10 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-normal text-slate-700">Who is sending it?</Label>
                <Input
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="Artur Abdullin"
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-slate-600 hover:text-slate-900"
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
                    <Label className="font-normal text-slate-700">Company name</Label>
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Artech Digital"
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="font-normal text-slate-700">CTA link</Label>
                    <Input
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      placeholder="https://calendly.com/yourname/30min-call"
                      className="h-10 text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-normal text-slate-700">Anything to avoid?</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Never mention competitors"
                    className="h-10 text-sm"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t pt-5">
            <Button
              variant="ghost"
              onClick={() => setStep("editor")}
              className="text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              Write it myself
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="gap-2 bg-indigo-600 px-5 hover:bg-indigo-700"
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
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("brief")}
                className="h-8 gap-1.5 px-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Brief
              </Button>
              <span className="text-sm font-medium text-slate-900">Prompt</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className="h-8 gap-1.5 text-xs"
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Regenerate
            </Button>
          </div>

          <div className="space-y-3 px-6 py-5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                Insert
              </span>
              {VARIABLES.map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => insertVariable(variable)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Plus className="h-3 w-3" />
                  {variable}
                </button>
              ))}
            </div>

            <Textarea
              ref={textareaRef}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="You are a virtual assistant for {{lead.company}}..."
              className="min-h-[360px] resize-y font-mono text-sm leading-relaxed"
            />
          </div>

          <div className="space-y-4 border-t bg-slate-50/60 px-6 py-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="font-normal text-slate-700">Template name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="No-show follow-up"
                  className="h-10 bg-white text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="font-normal text-slate-700">Follow-up stage</Label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {STAGE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setStage(preset);
                        setCustomStageOpen(false);
                      }}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        stage === preset && !customStageOpen
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStageOpen(true);
                      setStage("");
                    }}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      customStageOpen
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {customStageOpen && (
                  <Input
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    placeholder="Enter a stage"
                    className="h-10 bg-white text-sm"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/templates")}
                className="text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!promptText.trim() || !name.trim() || !stage.trim()}
                className="bg-indigo-600 px-5 hover:bg-indigo-700"
              >
                Save template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
