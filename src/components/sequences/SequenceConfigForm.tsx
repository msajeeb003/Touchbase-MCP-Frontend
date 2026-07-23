import {
  CalendarX2,
  Phone,
  FileText,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Calendar,
  MessageCircle,
  FileCheck,
  Plus,
  Mail,
  Settings,
  Loader2,
  X,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import WizardProgress from "@/components/sequences/WizardProgress";
import ManageTemplatesDialog from "@/components/sequences/ManageTemplatesDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SequenceConfigFormProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  situation: string | null;
  setSituation: (val: string) => void;
  goal: string | null;
  setGoal: (val: string) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  setIsGenerated: (val: boolean) => void;
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
}: SequenceConfigFormProps) {
  const [isManageTemplatesOpen, setIsManageTemplatesOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const templates = [
    { id: 1, title: "NO SHOW", tag: "NOSHOW1", desc: "You are a Virtual Assistant representing Artur Abdullin from Artech Digita..." },
    { id: 2, title: "No Show NEW", tag: "No Show NEW", desc: "You are a Virtual Assistant representing Artur from Artech Digital. A meet..." },
    { id: 3, title: "test", tag: "test", desc: "You are a Virtual Assistant representing Tanumoy Bosu from toto. A mee..." },
    { id: 4, title: "After sales-No Number", tag: "Post call2", desc: "You are a Virtual Assistant for Artech Digital, an AI development agency ..." },
    { id: 5, title: "NO SHOW - Artur", tag: "No Show1", desc: "You are a Virtual Assistant representing Artech Digital and the sender Art..." },
    { id: 6, title: "Admin test", tag: "No Show (admin test)", desc: "You are a Virtual Assistant writing on behalf of Artech Digital and the sen..." },
    { id: 7, title: "Final PRD Follow Up", tag: "PRD Follow up3", desc: "You are a Virtual Assistant for Artech Digital, an AI development agency ..." },
    { id: 8, title: "Post call", tag: "Post call", desc: "You are a Virtual Assistant for Artech Digital, an AI development agency ..." },
    { id: 9, title: "GOOD Leads - Follow Up", tag: "Good Leads", desc: "You are a Virtual Assistant for Artech Digital, an AI services company run..." },
    { id: 10, title: "MAIL SMS", tag: "No Show new", desc: "You are a Virtual Assistant for Artech Digital, a company that provides AI..." },
  ];

  const situations = [
    {
      id: "No-show",
      title: "No-show",
      desc: "Lead missed a scheduled call or meeting",
      icon: CalendarX2,
    },
    {
      id: "Post-call follow-up",
      title: "Post-call follow-up",
      desc: "Follow up after a call or meeting",
      icon: Phone,
    },
    {
      id: "Proposal sent",
      title: "Proposal sent",
      desc: "Follow up after sending a proposal",
      icon: FileText,
    },
    {
      id: "No reply",
      title: "No reply",
      desc: "Lead hasn't replied to your message",
      icon: MessageSquare,
    },
    {
      id: "Re-engagement",
      title: "Re-engagement",
      desc: "Re-connect with an inactive lead",
      icon: RefreshCw,
    },
    {
      id: "Custom",
      title: "Custom",
      desc: "Describe your own situation",
      icon: Sparkles,
    },
  ];

  const goals = [
    { id: "Book another call", label: "Book another call", icon: Calendar },
    { id: "Get a reply", label: "Get a reply", icon: MessageSquare },
    { id: "Close proposal", label: "Close proposal", icon: FileCheck },
    { id: "Qualify lead", label: "Qualify lead", icon: Plus },
    { id: "Other goal", label: "Other goal", icon: Plus },
  ];

  const handleSituationSelect = (id: string) => {
    setSituation(id);
    if (goal && currentStep === 1) setCurrentStep(2);
  };

  const handleGoalSelect = (id: string) => {
    setGoal(id);
    if (situation && currentStep === 1) setCurrentStep(2);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setCurrentStep(3);

    // Simulate API delay
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      setCurrentStep(4);
    }, 1500);
  };

  return (
    <Card className="border shadow-sm">
      <CardContent className="flex flex-col gap-8 p-6">
        <WizardProgress currentStep={currentStep} />
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
            {situations.map((item) => {
              const isSelected = situation === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSituationSelect(item.id)}
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
                    className={`mt-1 text-xs ${isSelected ? "text-indigo-700" : "text-slate-500"
                      }`}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

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
                    {customPrompt.length}/400
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
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setCustomPrompt(tpl.desc)}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-indigo-200 hover:bg-slate-50 transition-colors"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      {tpl.title}
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
              <Label className="text-slate-700">Tone of voice</Label>
              <Select defaultValue="Friendly & Professional">
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
              <Select defaultValue="Standard">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                </SelectContent>
                <SelectContent>
                  <SelectItem value="Light">Light</SelectItem>
                </SelectContent>
                <SelectContent>
                  <SelectItem value="Aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Cadence</Label>
              <Select defaultValue="5 steps over 7 days">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5 steps over 7 days">
                    5 steps over 7 days
                  </SelectItem>
                  <SelectItem value="3 steps over 5 days">
                    3 steps over 5 days
                  </SelectItem>
                  <SelectItem value="7 steps over 14 days">
                    7 steps over 14 days
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-slate-700">Channels</Label>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="ch-email" defaultChecked className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                  <Label htmlFor="ch-email" className="flex items-center gap-1.5 font-normal text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="ch-sms" defaultChecked className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                  <Label htmlFor="ch-sms" className="flex items-center gap-1.5 font-normal text-slate-700">
                    <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
                    SMS
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="ch-whatsapp" defaultChecked className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                  <Label htmlFor="ch-whatsapp" className="flex items-center gap-1.5 font-normal text-slate-700">
                    <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                    WhatsApp
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="ch-aicall" defaultChecked className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
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
            disabled={currentStep < 2 || isGenerating}
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
        templates={templates}
      />
    </Card>
  );
}
