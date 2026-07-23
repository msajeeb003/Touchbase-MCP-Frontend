import { Check } from "lucide-react";

const steps = [
  { num: 1, title: "Choose Goal", desc: "Tell us the situation", active: true },
  { num: 2, title: "Configure", desc: "Set your preferences" },
  { num: 3, title: "Generate", desc: "AI builds your sequence" },
  { num: 4, title: "Review", desc: "Check and edit steps" },
  { num: 5, title: "Activate", desc: "Launch and automate" },
];

export default function WizardProgress() {
  return (
    <div className="flex w-full items-center justify-between gap-4 py-4">
      {steps.map((step, index) => (
        <div key={step.num} className="flex flex-1 items-center gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
              step.active
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {step.num}
          </div>
          <div className="flex flex-col">
            <span
              className={`text-sm font-medium ${
                step.active ? "text-indigo-600" : "text-slate-900"
              }`}
            >
              {step.title}
            </span>
            <span className="text-xs text-slate-500">{step.desc}</span>
          </div>
          {index < steps.length - 1 && (
            <div className="ml-4 h-[1px] flex-1 bg-slate-200" />
          )}
        </div>
      ))}
    </div>
  );
}
