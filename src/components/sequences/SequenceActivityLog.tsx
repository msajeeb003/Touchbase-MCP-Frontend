import { useGetSequenceLogsQuery } from "@/store/features/sequences/sequencesApi";
import { formatDistanceToNow } from "date-fns";
import {
  PlusCircle,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Pencil,
  Clock,
  CheckCircle,
  Loader,
  CheckCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { type SequenceLogItem } from "@/types/sequences";

const EVENT_UI: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  sequence_created: { icon: PlusCircle, color: "text-blue-600", bgColor: "bg-blue-100" },
  sequence_generated: { icon: Sparkles, color: "text-purple-600", bgColor: "bg-purple-100" },
  sequence_regenerated: { icon: RefreshCw, color: "text-purple-600", bgColor: "bg-purple-100" },
  sequence_status_changed: { icon: ArrowRight, color: "text-orange-600", bgColor: "bg-orange-100" },
  sequence_edited: { icon: Pencil, color: "text-slate-600", bgColor: "bg-slate-100" },
  step_generated: { icon: Sparkles, color: "text-purple-600", bgColor: "bg-purple-100" },
  step_scheduled: { icon: Clock, color: "text-blue-600", bgColor: "bg-blue-100" },
  step_sent: { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
  step_sending: { icon: Loader, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  step_delivered: { icon: CheckCheck, color: "text-green-600", bgColor: "bg-green-100" },
  step_failed: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
  step_edited: { icon: Pencil, color: "text-slate-600", bgColor: "bg-slate-100" },
};

const renderLogMessage = (log: SequenceLogItem): string => {
  const { eventType, meta } = log;
  
  switch (eventType) {
    case "sequence_created":
      return `Sequence created: "${meta.name}" with ${meta.totalSteps} steps.`;
    case "sequence_generated":
      return `AI Generated: ${meta.stepsGenerated} steps based on ${meta.situation} situation.`;
    case "sequence_regenerated":
      return `Steps Regenerated: Replaced ${meta.stepsReset} existing steps with ${meta.stepsGenerated} new ones.`;
    case "sequence_status_changed":
      return `Status changed from ${meta.from} to ${meta.to}.`;
    case "sequence_edited":
      return `Sequence settings edited: updated ${meta.fields?.join(", ") || "fields"}.`;
    case "step_generated":
      return `Step ${meta.stepOrder} (${meta.stepType}) content generated with AI.`;
    case "step_scheduled":
      return `Step ${meta.stepOrder} (${meta.stepType}) scheduled for delivery.`;
    case "step_sent":
      return `Step ${meta.stepOrder} sent via ${meta.channel || meta.stepType}.`;
    case "step_sending":
      return `Step ${meta.stepOrder} dispatching...`;
    case "step_delivered":
      return `Step ${meta.stepOrder} delivered successfully.`;
    case "step_failed":
      return `Step ${meta.stepOrder} failed to send. Reason: ${meta.reason || "Unknown"}`;
    case "step_edited":
      return `Step ${meta.stepOrder} content manually edited.`;
    default:
      return `Unknown event: ${eventType}`;
  }
};

interface SequenceActivityLogProps {
  sequenceId: string;
}

export default function SequenceActivityLog({ sequenceId }: SequenceActivityLogProps) {
  const { data: logsData, isLoading } = useGetSequenceLogsQuery(sequenceId);
  const logs = logsData?.data?.items || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-400">
        <Loader className="w-6 h-6 animate-spin mr-2" />
        Loading activity log...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 border border-dashed rounded-lg bg-slate-50 mt-8">
        No activity recorded yet for this sequence.
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white border shadow-sm rounded-xl p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">Activity Log</h3>
      <div className="relative border-l border-slate-200 ml-4 space-y-8">
        {logs.map((log) => {
          const ui = EVENT_UI[log.eventType] || { icon: ArrowRight, color: "text-slate-500", bgColor: "bg-slate-100" };
          const IconComponent = ui.icon;
          
          return (
            <div key={log.id} className="relative pl-8">
              <div 
                className={`absolute -left-3.5 top-0 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-white ${ui.bgColor}`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${ui.color}`} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-slate-800 font-medium">
                  {renderLogMessage(log)}
                </p>
                <span className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
