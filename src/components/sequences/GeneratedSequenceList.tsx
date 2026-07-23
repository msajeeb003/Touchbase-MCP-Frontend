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
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const generatedSteps = [
  {
    id: 1,
    type: "Email",
    time: "Now",
    icon: Mail,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    subject: "Subject: Following up on our conversation",
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
    subject: "Subject: Following up on our conversation",
    content: "Hi Art, I hope you're doing well. I wanted to follow up on our conversation...",
    hasPreview: true,
  },
];

export default function GeneratedSequenceList() {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900">
            Your Generated Sequence
          </h2>
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal hover:bg-slate-100 rounded-md">
            5 steps
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-slate-700 h-9">
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-slate-700 h-9">
            <SlidersHorizontal className="h-4 w-4" />
            Advanced Edit
          </Button>
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4">
            <Send className="h-4 w-4" />
            Activate Sequence
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-6 bg-slate-50/50">
        {generatedSteps.map((step) => (
          <div
            key={step.id}
            className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-indigo-100"
          >
            {/* Drag Handle & Icon */}
            <div className="flex items-center gap-3 w-40 shrink-0">
              <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
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
                  {step.subject}
                </span>
              )}
              <span className={`text-sm text-slate-500 truncate ${!step.subject ? "mt-1" : ""}`}>
                {step.content}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {step.hasPreview && (
                <Button variant="outline" size="sm" className="h-8 text-xs px-3">
                  Preview
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-8 text-xs px-3 gap-1.5">
                <PenLine className="h-3.5 w-3.5" />
                {step.editLabel || "Edit"}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <div className="flex justify-center mt-2">
          <Button variant="outline" size="sm" className="gap-2 text-slate-600 rounded-full h-8 px-4 border-dashed border-slate-300 bg-white">
            <Plus className="h-3.5 w-3.5" />
            Add Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
