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
import { useSteelTheme } from "@/components/dashboard/dashboardTheme";

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getStepStatusBadgeClass = (status: string) => {
  const value = status.toLowerCase();
  if (value === "sent") return "border-landing-whatsapp/40 bg-landing-whatsapp/15 text-landing-whatsapp";
  if (value === "pending") return "border-landing-sms/40 bg-landing-sms/15 text-landing-sms";
  if (value === "draft") return "border-landing-line bg-white/[0.06] text-landing-fog/80";
  if (value === "scheduled") return "border-landing-email/40 bg-landing-email/15 text-landing-email";
  if (value === "sending" || value === "calling") return "border-[#A78BFA]/40 bg-[#A78BFA]/15 text-[#A78BFA]";
  if (value === "skipped") return "border-landing-line bg-white/[0.06] text-landing-fog/65";
  if (value === "failed") return "border-landing-voice/40 bg-landing-voice/15 text-landing-voice";
  return "border-landing-line bg-white/[0.06] text-landing-fog/80";
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
      iconColor: "text-landing-email",
      iconBg: "bg-landing-email/15",
      hasPreview: true,
    };
  }
  if (stepType === STEP_TYPE.SMS) {
    return {
      label: "SMS",
      icon: MessageSquare,
      iconColor: "text-landing-sms",
      iconBg: "bg-landing-sms/15",
      hasPreview: true,
    };
  }
  if (stepType === STEP_TYPE.WHATSAPP) {
    return {
      label: "WhatsApp",
      icon: MessageCircle,
      iconColor: "text-landing-whatsapp",
      iconBg: "bg-landing-whatsapp/15",
      hasPreview: true,
    };
  }
  return {
    label: "AI Call",
    icon: Phone,
    iconColor: "text-landing-voice",
    iconBg: "bg-landing-voice/15",
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
    <div className="flex flex-col gap-3 rounded-xl border border-landing-line bg-landing-steel-2 p-4 transition-colors hover:border-landing-sky/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-landing-mono text-xs font-medium text-landing-fog/80">
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
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-landing-fog/55">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-landing-fog/65">Scheduled:</span>
          <span>{time}</span>
        </p>

        {step.subject && (
          <p className="truncate text-sm font-medium text-landing-fog">
            Subject: {step.subject}
          </p>
        )}
        <p className="line-clamp-2 text-sm text-landing-fog/55 sm:truncate sm:line-clamp-none">
          {step.content}
        </p>
      </div>
    </div>
  );
}

export default function ViewSequenceStepsPage() {
  useSteelTheme();
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
      <div className="rounded-lg border border-dashed p-8 text-sm text-landing-fog/55">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-landing-sky" />
          <span>Loading sequence steps...</span>
        </div>
      </div>
    );
  }

  if (isSequenceError || isStepsError) {
    return (
      <div className="rounded-lg border border-landing-voice/40 bg-landing-voice/10 p-8 text-sm text-landing-voice">
        Failed to fetch sequence steps.
      </div>
    );
  }

  return (
    <div className="space-y-5 font-landing-sans text-landing-fog/80">
      <div className="rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-landing-display text-[clamp(24px,2.6vw,30px)] font-bold tracking-[-0.02em] text-landing-fog">
              {sequence?.name || "Sequence Steps"}
            </h2>
            <p className="mt-1 text-sm text-landing-fog/55">
              Lead: {sequence?.lead?.name || "N/A"} | Template:{" "}
              {sequence?.promptTemplate?.name || "N/A"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-landing-line bg-white/[0.04] text-landing-fog/80">
              {steps.length}/{sequence?.totalSteps ?? 0} step{steps.length === 1 ? "" : "s"}
            </Badge>
            {id && (
              <Button asChild className="bg-landing-sky font-semibold text-landing-steel hover:bg-landing-sky-deep">
                <Link to={`/dashboard/sequences/${id}/steps`}>Edit sequence</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-landing-fog/20 bg-white/[0.03] px-6 py-14 text-center">
          <h3 className="font-landing-display text-xl font-bold text-landing-fog">No steps found.</h3>
          <p className="mt-2 text-sm text-landing-fog/55">
            This sequence has no generated steps yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-landing-line bg-white/[0.02] p-4 sm:p-6">
          {steps.map((step) => (
            <ViewStepCard key={step.id} step={step} onPreview={setPreviewStep} />
          ))}
        </div>
      )}

      <Dialog open={!!previewStep} onOpenChange={(open) => !open && setPreviewStep(null)}>
        <DialogContent className="flex max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-xl border-landing-line bg-landing-steel-2 p-0 font-landing-sans">
          <DialogHeader className="shrink-0 border-b px-6 py-4">
            <DialogTitle className="text-base font-semibold text-landing-fog">
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
            <div className="flex items-center gap-1.5 text-xs text-landing-fog/55">
              <Clock className="h-3.5 w-3.5" />
              {previewStep?.time}
            </div>
            <div className="flex flex-col gap-2">
              {previewStep?.subject && (
                <div className="text-sm font-semibold text-landing-fog">
                  Subject: {previewStep.subject}
                </div>
              )}
              {previewStep?.type === "AI Call" && (
                <div className="text-sm font-semibold text-landing-fog">
                  AI Call Script
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-landing-fog/80">
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
          <div className="flex shrink-0 justify-end border-t bg-white/[0.03] px-6 py-4">
            <Button variant="outline" onClick={() => setPreviewStep(null)} className="h-9">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
