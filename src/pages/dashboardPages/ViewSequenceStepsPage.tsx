import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Clock,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetSequenceStepsQuery,
  useGetSingleSequenceQuery,
} from "@/store/features/sequences/sequencesApi";
import type { SequenceStepItem } from "@/types/sequences";
import { STEP_TYPE } from "@/constants/stepType";
import { getSendLogStatusClass } from "@/lib/sequences/stepStatusStyles";

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getStepStatusBadgeClass = (status: string) => {
  const value = status.toLowerCase();
  if (value === "sent") return "border-emerald-200 bg-emerald-100 text-emerald-700";
  if (value === "pending") return "border-amber-200 bg-amber-100 text-amber-700";
  if (value === "draft") return "border-slate-200 bg-slate-100 text-slate-700";
  if (value === "scheduled") return "border-blue-200 bg-blue-100 text-blue-700";
  if (value === "sending" || value === "calling") return "border-violet-200 bg-violet-100 text-violet-700";
  if (value === "skipped") return "border-slate-200 bg-slate-100 text-slate-600";
  if (value === "failed") return "border-rose-200 bg-rose-100 text-rose-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
};

const formatStepStatus = (status: string) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

type StepVisuals = {
  label: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  hasPreview: boolean;
};

const getStepVisuals = (stepType: SequenceStepItem["stepType"]): StepVisuals => {
  if (stepType === STEP_TYPE.EMAIL) {
    return {
      label: "Email",
      icon: Mail,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
      hasPreview: true,
    };
  }
  if (stepType === STEP_TYPE.SMS) {
    return {
      label: "SMS",
      icon: MessageSquare,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50",
      hasPreview: true,
    };
  }
  if (stepType === STEP_TYPE.WHATSAPP) {
    return {
      label: "WhatsApp",
      icon: MessageCircle,
      iconColor: "text-green-500",
      iconBg: "bg-green-50",
      hasPreview: true,
    };
  }
  return {
    label: "AI Call",
    icon: Phone,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    hasPreview: true,
  };
};

type PreviewStep = {
  type: string;
  time: string;
  status: string;
  subject?: string;
  content: string;
  sendLog?: string | null;
};

function ViewStepCard({
  step,
  onPreview,
}: {
  step: SequenceStepItem;
  onPreview: (step: PreviewStep) => void;
}) {
  const visuals = getStepVisuals(step.stepType);
  const Icon = visuals.icon;
  const time = formatDateTime(step.scheduledAt);

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all hover:border-indigo-100">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
            {step.stepOrder}
          </div>

          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${visuals.iconBg}`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${visuals.iconColor}`} />
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-sm font-semibold ${visuals.iconColor}`}>{visuals.label}</span>
            <Badge variant="outline" className={getStepStatusBadgeClass(step.status)}>
              {formatStepStatus(step.status)}
            </Badge>
          </div>
        </div>

        {visuals.hasPreview && (
          <div className="flex shrink-0 items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPreview({
                  type: visuals.label,
                  time,
                  status: step.status,
                  subject: step.subject || undefined,
                  content: step.content || "",
                  sendLog: step.sendLog,
                })
              }
              className="h-8 px-3 text-xs"
            >
              Preview
            </Button>
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-1">
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-slate-600">Scheduled:</span>
          <span>{time}</span>
        </p>

        {step.subject && (
          <p className="truncate text-sm font-medium text-slate-900">
            Subject: {step.subject}
          </p>
        )}
        <p className="line-clamp-2 text-sm text-slate-500 sm:truncate sm:line-clamp-none">
          {step.content}
        </p>
      </div>
    </div>
  );
}

export default function ViewSequenceStepsPage() {
  const { id } = useParams<{ id: string }>();
  const [previewStep, setPreviewStep] = useState<PreviewStep | null>(null);
  const {
    data: sequenceData,
    isLoading: isSequenceLoading,
    isError: isSequenceError,
  } = useGetSingleSequenceQuery(id ?? "", {
    skip: !id,
  });
  const {
    data: stepsData,
    isLoading: isStepsLoading,
    isError: isStepsError,
  } = useGetSequenceStepsQuery(id ?? "", {
    skip: !id,
  });

  const sequence = sequenceData?.data;
  const steps = stepsData?.data ?? [];
  const sendLogStyles = getSendLogStatusClass(previewStep?.status);

  if (isSequenceLoading || isStepsLoading) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          <span>Loading sequence steps...</span>
        </div>
      </div>
    );
  }

  if (isSequenceError || isStepsError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-600">
        Failed to fetch sequence steps.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">
              {sequence?.name || "Sequence Steps"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Lead: {sequence?.lead?.name || "N/A"} | Template:{" "}
              {sequence?.promptTemplate?.name || "N/A"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
              {steps.length}/{sequence?.totalSteps ?? 0} step{steps.length === 1 ? "" : "s"}
            </Badge>
            {id && (
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link to={`/dashboard/sequences/${id}/steps`}>Edit sequence</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/40 px-6 py-14 text-center">
          <h3 className="text-xl font-semibold text-slate-900">No steps found.</h3>
          <p className="mt-2 text-sm text-slate-500">
            This sequence has no generated steps yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border bg-slate-50/50 p-4 shadow-sm sm:p-6">
          {steps.map((step) => (
            <ViewStepCard key={step.id} step={step} onPreview={setPreviewStep} />
          ))}
        </div>
      )}

      <Dialog open={!!previewStep} onOpenChange={(open) => !open && setPreviewStep(null)}>
        <DialogContent className="flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-xl p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle className="text-base font-semibold text-slate-900">
              {previewStep?.type === "Email"
                ? "Email preview"
                : previewStep?.type === "SMS"
                  ? "SMS preview"
                  : previewStep?.type === "WhatsApp"
                    ? "WhatsApp preview"
                    : previewStep?.type === "AI Call"
                      ? "AI Call preview"
                      : "Preview"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {previewStep?.time}
            </div>
            <div className="flex flex-col gap-2">
              {previewStep?.subject && (
                <div className="text-sm font-semibold text-slate-900">
                  Subject: {previewStep.subject}
                </div>
              )}
              {previewStep?.type === "AI Call" && (
                <div className="text-sm font-semibold text-slate-900">
                  AI Call Script
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {previewStep?.content}
              </div>
            </div>
            <div className={`rounded-lg border px-4 py-3 ${sendLogStyles.box}`}>
              <p
                className={`text-xs font-medium uppercase tracking-wide ${sendLogStyles.label}`}
              >
                Send log
              </p>
              <p
                className={`mt-1.5 whitespace-pre-wrap text-sm leading-relaxed ${sendLogStyles.text}`}
              >
                {previewStep?.sendLog || "No send log available."}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 justify-end border-t bg-slate-50/50 px-6 py-4">
            <Button variant="outline" onClick={() => setPreviewStep(null)} className="h-9">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
