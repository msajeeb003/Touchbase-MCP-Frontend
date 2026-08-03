import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SequenceConfigForm from "@/components/sequences/SequenceConfigForm";
import GeneratedSequenceList from "@/components/sequences/GeneratedSequenceList";
import SequenceSidebar from "@/components/sequences/SequenceSidebar";
import SequenceActivityLog from "@/components/sequences/SequenceActivityLog";
import type { LeadItem } from "@/types/leads";
import type { SequenceItem, SequenceStepItem } from "@/types/sequences";
import { useUpdateSequenceMutation, useGetSingleSequenceQuery } from "@/store/features/sequences/sequencesApi";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";
import { useParams } from "react-router-dom";

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
  
  // Initialize form from existing sequence data
  useEffect(() => {
    if (sequenceData?.data) {
      const seq = sequenceData.data;
      setSituation(seq.promptTemplateId || null);
      setGoal(seq.goal || null);
      setTone(seq.tone || "Friendly & Professional");
      setIntensity(seq.intensity || "Standard");
      setCadence(seq.cadence || "5 steps over 7 days");
      setChannels(seq.channels || ["email", "sms", "whatsapp", "aicall"]);
      
      setSelectedLead({ ...seq.lead, id: seq.leadId } as unknown as LeadItem);
      setGeneratedSequence(seq);
      setGeneratedSteps(seq.steps || []);
      setIsGenerated(true);
      setCurrentStep(4);
    }
  }, [sequenceData]);
  
  const [updateSequence] = useUpdateSequenceMutation();

  const handleActivate = async () => {
    if (!generatedSequence?.id) return;
    
    const isCurrentlyActive = generatedSequence.status === "active";
    const nextStatus = isCurrentlyActive ? "paused" : "active";
    const loadingToastId = showLoading(isCurrentlyActive ? "Pausing sequence..." : "Activating sequence...");
    
    try {
      await updateSequence({
        id: generatedSequence.id,
        body: { status: nextStatus },
      }).unwrap();
      
      dismissToast(loadingToastId);
      showSuccess(isCurrentlyActive ? "Sequence paused successfully" : "Sequence activated successfully");
      
      if (!isCurrentlyActive) {
        setCurrentStep(5); // Move to final visual state if activating
      }
      setTimeout(() => {
        navigate("/dashboard/sequences"); // Redirect back to sequence list
      }, 1500);
    } catch (error: any) {
      console.error("Failed to update sequence:", error);
      dismissToast(loadingToastId);
      const errorMessage = error?.data?.message || "Failed to update sequence";
      showError(errorMessage);
    }
  };

  return (
    <div className="flex flex-col space-y-6 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Follow-up Sequence
        </h1>
        <p className="text-sm text-slate-500">
          Generate a multi-channel follow-up in seconds.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
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
            onRegenerated={(newSteps) => setGeneratedSteps(newSteps)}
          />
          {id && (
            <SequenceActivityLog sequenceId={id} />
          )}
        </div>

        {/* Right Sidebar — sticky only on lg+; stacks below on smaller screens */}
        <aside className="w-full lg:w-80 lg:shrink-0 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <SequenceSidebar 
            situation={situation} 
            goal={goal}
            tone={tone}
            intensity={intensity}
            cadence={cadence}
            channels={channels}
            selectedLead={selectedLead}
            setSelectedLead={setSelectedLead}
          />
        </aside>
      </div>
    </div>
  );
}
