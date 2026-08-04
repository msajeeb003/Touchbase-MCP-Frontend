import { Check } from "lucide-react";

interface WizardProgressProps {
  currentStep: number;
}

const steps = [
  { num: 1, title: "Choose Goal", desc: "Tell us the situation" },
  { num: 2, title: "Configure", desc: "Set your preferences" },
  { num: 3, title: "Generate", desc: "AI builds your sequence" },
  { num: 4, title: "Review", desc: "Check and edit steps" },
  { num: 5, title: "Activate", desc: "Launch and automate" },
];

export default function WizardProgress({ currentStep }: WizardProgressProps) {
  const boundedStep = Math.min(Math.max(currentStep, 1), steps.length);
  const activeStep = steps[boundedStep - 1];
  const progress = (boundedStep / steps.length) * 100;

  return (
    <>
      <div className="flex flex-col gap-2 py-2 sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-indigo-600">{activeStep.title}</span>
          <span className="shrink-0 text-xs text-slate-500">
            Step {boundedStep} of {steps.length}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-slate-500">{activeStep.desc}</span>
      </div>

      <div className="hidden w-full items-center justify-between gap-2 py-4 sm:flex xl:gap-4">
        {steps.map((step, index) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;

          return (
            <div key={step.num} className="flex min-w-0 flex-1 items-center gap-2 xl:gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                  isActive || isCompleted
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.num}
              </div>
              <div className="flex min-w-0 flex-col">
                <span
                  className={`truncate text-xs font-medium xl:text-sm ${
                    isActive || isCompleted ? "text-indigo-600" : "text-slate-900"
                  }`}
                >
                  {step.title}
                </span>
                <span className="hidden truncate text-xs text-slate-500 xl:block">
                  {step.desc}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`ml-1 hidden h-[1px] flex-1 md:block xl:ml-4 ${
                    isCompleted ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
