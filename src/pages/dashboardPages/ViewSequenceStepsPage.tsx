import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  Send,
  StickyNote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SequenceStepCallLogSummary } from "@/components/sequences/steps/SequenceStepCallLogSummary";
import {
  useGetSequenceStepsQuery,
  useGetSingleSequenceQuery,
} from "@/store/features/sequences/sequencesApi";
import type { SequenceStepItem } from "@/types/sequences";

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

const getStepStatusBadgeClass = (status: string) => {
  const value = status.toLowerCase();
  if (value === "sent") return "border-emerald-200 bg-emerald-100 text-emerald-700";
  if (value === "pending") return "border-amber-200 bg-amber-100 text-amber-700";
  if (value === "skipped") return "border-slate-200 bg-slate-100 text-slate-700";
  if (value === "failed") return "border-rose-200 bg-rose-100 text-rose-700";
  return "border-blue-200 bg-blue-100 text-blue-700";
};

const getStepTypeBadgeClass = (stepType: SequenceStepItem["stepType"]) => {
  if (stepType === "EMAIL") return "border-indigo-200 bg-indigo-100 text-indigo-700";
  if (stepType === "SMS") return "border-violet-200 bg-violet-100 text-violet-700";
  if (stepType === "WHATSAPP") return "border-emerald-200 bg-emerald-100 text-emerald-700";
  return "border-amber-200 bg-amber-100 text-amber-700";
};

function StepTypeIcon({ stepType }: { stepType: SequenceStepItem["stepType"] }) {
  if (stepType === "EMAIL") return <Mail className="h-4 w-4" />;
  if (stepType === "SMS") return <MessageSquare className="h-4 w-4" />;
  if (stepType === "WHATSAPP") return <MessageCircle className="h-4 w-4" />;
  return <PhoneCall className="h-4 w-4" />;
}

function StepContentView({ step }: { step: SequenceStepItem }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="space-y-4 lg:col-span-2">
        {step.stepType === "EMAIL" ? (
          <div className="space-y-1.5">
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <StickyNote className="h-4 w-4 text-slate-400" />
              Subject
            </p>
            <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
              {step.subject || "—"}
            </p>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <StepTypeIcon stepType={step.stepType} />
            Content
          </p>
          <p className="min-h-24 whitespace-pre-wrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800">
            {step.content || "No content available."}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          Scheduled At
        </p>
        <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
          {formatDateTime(step.scheduledAt)}
        </p>
      </div>

      <div className="flex items-start gap-3">
        <Send className="mt-0.5 h-4 w-4 text-slate-400" />
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sent At</p>
          <p className="text-sm text-slate-700">{formatDateTime(step.sentAt)}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 lg:col-span-2">
        <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Send log</p>
          <p className="text-sm text-slate-700">{step.sendLog || "No send log available."}</p>
        </div>
      </div>

      {step.callLog ? <SequenceStepCallLogSummary log={step.callLog} /> : null}
    </div>
  );
}

export default function ViewSequenceStepsPage() {
  const { id } = useParams<{ id: string }>();
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
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <Accordion type="multiple" className="w-full">
            {steps.map((step) => (
              <AccordionItem key={step.id} value={step.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex w-full flex-col items-start gap-3 pr-4 text-left sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-slate-900">
                          Step {step.stepOrder}
                        </span>
                        <Badge
                          variant="outline"
                          className={`flex items-center gap-1 ${getStepTypeBadgeClass(step.stepType)}`}
                        >
                          <StepTypeIcon stepType={step.stepType} />
                          {step.stepType}
                        </Badge>
                        <Badge variant="outline" className={getStepStatusBadgeClass(step.status)}>
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Scheduled: {formatDateTime(step.scheduledAt)}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-xl bg-slate-50/70 p-4">
                    <StepContentView step={step} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
