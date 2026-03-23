import { CalendarDays, Clock3, Loader2, Mail, MessageSquare, Send, StickyNote } from "lucide-react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  useGetSequenceStepsQuery,
  useGetSingleSequenceQuery,
} from "@/store/features/sequences/sequencesApi";

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

export default function SequenceStepsPage() {
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
          <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
            {steps.length} step{steps.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/40 px-6 py-14 text-center">
          <h3 className="text-xl font-semibold text-slate-900">No steps found.</h3>
          <p className="mt-2 text-sm text-slate-500">
            This sequence has no generated steps yet. Later you can add and manage them here.
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
                          className={
                            step.stepType === "EMAIL"
                              ? "border-indigo-200 bg-indigo-100 text-indigo-700"
                              : "border-violet-200 bg-violet-100 text-violet-700"
                          }
                        >
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
                  <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50/70 p-4 lg:grid-cols-2">
                    <div className="space-y-4 lg:col-span-2">
                      <div className="flex items-start gap-3">
                        <StickyNote className="mt-0.5 h-4 w-4 text-slate-400" />
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Subject
                          </p>
                          <p className="text-sm text-slate-700">{step.subject || "No subject"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        {step.stepType === "EMAIL" ? (
                          <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                        ) : (
                          <MessageSquare className="mt-0.5 h-4 w-4 text-slate-400" />
                        )}
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Content
                          </p>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                            {step.content || "No content generated yet."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Scheduled At
                        </p>
                        <p className="text-sm text-slate-700">{formatDateTime(step.scheduledAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Send className="mt-0.5 h-4 w-4 text-slate-400" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Sent At
                        </p>
                        <p className="text-sm text-slate-700">{formatDateTime(step.sentAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 lg:col-span-2">
                      <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Send Log
                        </p>
                        <p className="text-sm text-slate-700">{step.sendLog || "No send log available."}</p>
                      </div>
                    </div>
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
