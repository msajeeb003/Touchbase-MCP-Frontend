import { useState } from "react";
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
} from "lucide-react";
import WizardProgress from "@/components/sequences/WizardProgress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SequenceConfigForm() {
  const [selectedSituation, setSelectedSituation] = useState("No-show");
  const [selectedGoal, setSelectedGoal] = useState("Book another call");

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

  return (
    <Card className="border shadow-sm">
      <CardContent className="flex flex-col gap-8 p-6">
        <WizardProgress />
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
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Manage templates
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {situations.map((item) => {
              const isSelected = selectedSituation === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedSituation(item.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                  }`}
                >
                  <item.icon
                    className={`mb-3 h-5 w-5 ${
                      isSelected ? "text-indigo-600" : "text-slate-500"
                    }`}
                  />
                  <h3
                    className={`text-sm font-semibold ${
                      isSelected ? "text-indigo-900" : "text-slate-900"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`mt-1 text-xs ${
                      isSelected ? "text-indigo-700" : "text-slate-500"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2 */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-slate-900">
            2. What is your goal?
          </h2>
          <div className="flex flex-wrap gap-3">
            {goals.map((item) => {
              const isSelected = selectedGoal === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`gap-2 rounded-full ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-none"
                      : "text-slate-700"
                  }`}
                  onClick={() => setSelectedGoal(item.id)}
                >
                  <item.icon
                    className={`h-4 w-4 ${
                      isSelected ? "text-indigo-600" : "text-slate-400"
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
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-10 px-6 font-semibold">
            <Sparkles className="h-4 w-4" />
            Generate Follow-up Sequence
          </Button>
          <span className="text-sm text-slate-400">Takes ~10 seconds</span>
        </div>
      </CardContent>
    </Card>
  );
}
