import {
  Users,
  PenLine,
  Mail,
  MessageSquare,
  MessageCircle,
  Phone,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function SequenceSidebar() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Lead Card */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
          <CardTitle className="text-sm font-semibold">Lead</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <Users className="h-3 w-3" />
              Pick from Leads
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1.5 text-slate-600">
              <PenLine className="h-3 w-3" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 pt-0">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-indigo-600 text-white font-medium">KP</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-slate-900 truncate">Kishon Pashi</span>
              <span className="text-xs text-slate-500 truncate">kishonpashi@gmail.com</span>
              <span className="text-xs text-slate-500 truncate">+8801705361661</span>
            </div>
          </div>
          <Select defaultValue="default">
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Kishon Pashi — kishonpashi@gmail.c...</SelectItem>
            </SelectContent>
          </Select>
        <Separator className="my-5" />

        {/* Follow-up Summary */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-900 px-1">Follow-up Summary</h3>
          <div className="flex flex-col gap-3 text-sm px-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Situation</span>
              <span className="font-medium text-slate-900">No-show</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Goal</span>
              <span className="font-medium text-slate-900">Book another call</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tone</span>
              <span className="font-medium text-slate-900">Friendly & Professional</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Intensity</span>
              <span className="font-medium text-slate-900">Standard</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Cadence</span>
              <span className="font-medium text-slate-900">5 steps over 7 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Template</span>
              <span className="font-medium text-slate-900">Auto (situation)</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-slate-500">Channels</span>
              <div className="flex gap-2 text-slate-400">
                <Mail className="h-4 w-4 text-blue-500" />
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <MessageCircle className="h-4 w-4 text-green-500" />
                <Phone className="h-4 w-4 text-amber-500" />
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex items-start gap-3 rounded-lg bg-indigo-50 p-4 text-indigo-700">
            <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">
              AI will generate a sequence optimized for this situation and your goal.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

      {/* Tips */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-sm font-semibold">Tips for this sequence</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm text-slate-700">Best time to reach out:</span>
                <span className="text-sm text-slate-500">Weekdays, 10am - 2pm</span>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">Keep messages short and clear</span>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">Offer an easy next step</span>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700">Don't sound needy</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 h-10 mt-2 font-medium">
        <BookOpen className="h-4 w-4" />
        View Playbook (No-show)
      </Button>
    </div>
  );
}
