import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SequenceConfigForm from "@/components/sequences/SequenceConfigForm";
import GeneratedSequenceList from "@/components/sequences/GeneratedSequenceList";
import SequenceSidebar from "@/components/sequences/SequenceSidebar";
import SequenceActivityLog from "@/components/sequences/SequenceActivityLog";
import type { LeadItem } from "@/types/leads";
import type { SequenceItem, SequenceStepItem } from "@/types/sequences";
import { useGetSingleLeadQuery } from "@/store/features/leads/leadsApi";
import { useUpdateSequenceMutation, useGetSingleSequenceQuery } from "@/store/features/sequences/sequencesApi";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";
import { useParams } from "react-router-dom";

function readSequenceGoal(goal: SequenceItem["goal"] | { id?: string; label?: string } | null) {
  if (!goal) return null;
  if (typeof goal === "string") return goal;
  return goal.label || goal.id || null;
}

export default function CreateSequencePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [situation, setSituation] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  
  const [tone, setTone] = useState("Friendly & Professional");
  const [intensity, setIntensity] = useState("Standard");
  const [cadence, setCadence] = useState("5 steps over 7 days");
  const [channels, setChannels] = useState<string[]>(["email", "sms", "whatsapp", "aicall"]);
  const [customPrompt, setCustomPrompt] = useState("");
  
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [generatedSequence, setGeneratedSequence] = useState<SequenceItem | null>(null);
  const [generatedSteps, setGeneratedSteps] = useState<SequenceStepItem[]>([]);
  
  const { data: sequenceData } = useGetSingleSequenceQuery(id ?? "", { skip: !id });
  const leadId = sequenceData?.data?.leadId;
  const { data: leadData } = useGetSingleLeadQuery(leadId ?? "", {
    skip: !leadId,
  });

  // Initialize form from existing sequence data
  useEffect(() => {
    if (sequenceData?.data) {
      const seq = sequenceData.data;
      setSituation(seq.promptTemplateId || null);
      setGoal(readSequenceGoal(seq.goal));
      setTone(seq.tone || "Friendly & Professional");
      setIntensity(seq.intensity || "Standard");
      setCadence(seq.cadence || "5 steps over 7 days");
      setChannels(seq.channels || ["email", "sms", "whatsapp", "aicall"]);
      setGeneratedSequence(seq);
      setGeneratedSteps(seq.steps || []);
      setIsGenerated(true);
      setCurrentStep(4);
    }
  }, [sequenceData]);

  useEffect(() => {
    if (leadData?.data) {
      setSelectedLead(leadData.data);
    }
  }, [leadData]);
  
  const [updateSequence] = useUpdateSequenceMutation();

  const handleActivate = async () => {
    if (!generatedSequence?.id) return;
    
    const isCurrentlyActive = generatedSequence.status === "active";
    const nextStatus = isCurrentlyActive ? "paused" : "active";
    const loadingToastId = showLoading(isCurrentlyActive ? "Pausing sequence..." : "Activating sequence...");
    
    try {
      const response = await updateSequence({
        id: generatedSequence.id,
        body: { status: nextStatus },
      }).unwrap();
      
      dismissToast(loadingToastId);
      showSuccess(isCurrentlyActive ? "Sequence paused successfully" : "Sequence activated successfully");
      setGeneratedSequence((prev) =>
        prev
          ? { ...prev, status: response.data.status ?? nextStatus }
          : prev,
      );
      
      if (!isCurrentlyActive) {
        setCurrentStep(5);
      }
    } catch (error: any) {
      console.error("Failed to update sequence:", error);
      dismissToast(loadingToastId);
      const errorMessage = error?.data?.message || "Failed to update sequence";
      showError(errorMessage);
    }
  };

  const isEditMode = Boolean(id);

  return (
    <div className="flex flex-col space-y-6 pb-10 font-landing-sans text-landing-fog/80">
      <div className="flex flex-col gap-1">
        <h1 className="font-landing-display text-[clamp(24px,2.6vw,30px)] font-bold tracking-[-0.02em] text-landing-fog">
          {isEditMode ? "Edit Follow-up Sequence" : "Create Follow-up Sequence"}
        </h1>
        <p className="text-sm text-landing-fog/55">
          {isEditMode
            ? "Update preferences, regenerate steps, or refine your follow-up sequence."
            : "Generate a multi-channel follow-up in seconds."}
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Main Content Area */}
        <div className="order-2 flex-1 flex flex-col gap-8 min-w-0 xl:order-1">
          <SequenceConfigForm
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            situation={situation}
            setSituation={setSituation}
            goal={goal}
            setGoal={setGoal}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            setIsGenerated={setIsGenerated}
            selectedLead={selectedLead}
            onSequenceGenerated={(sequence, steps) => {
              setGeneratedSequence(sequence);
              setGeneratedSteps(steps);
              if (!id && sequence.id) {
                navigate(`/dashboard/sequences/${sequence.id}/steps`, { replace: true });
              }
            }}
            tone={tone}
            setTone={setTone}
            intensity={intensity}
            setIntensity={setIntensity}
            cadence={cadence}
            setCadence={setCadence}
            channels={channels}
            setChannels={setChannels}
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            sequenceStatus={generatedSequence?.status}
            sequenceId={id}
          />
          <GeneratedSequenceList 
            isGenerated={isGenerated}
            onActivate={handleActivate} 
            sequenceId={generatedSequence?.id}
            apiSteps={generatedSteps}
            sequenceStatus={generatedSequence?.status}
            totalSteps={generatedSequence?.totalSteps}
            onRegenerated={(newSteps) => setGeneratedSteps(newSteps)}
          />
          {id && (
            <SequenceActivityLog sequenceId={id} />
          )}
        </div>

        {/* Right Sidebar — sticky on xl+; below xl it moves above the form so the lead can be picked first */}
        <aside className="order-1 w-full xl:order-2 xl:w-80 xl:shrink-0 xl:sticky xl:top-6 xl:self-start xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
          <SequenceSidebar 
            situation={situation} 
            goal={goal}
            tone={tone}
            intensity={intensity}
            cadence={cadence}
            channels={channels}
            selectedLead={selectedLead}
            setSelectedLead={setSelectedLead}
            autoSelectLead={!isEditMode}
          />
        </aside>
      </div>
    </div>
  );
}
