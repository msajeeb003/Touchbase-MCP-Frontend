/** Status-tinted styles for Send log boxes in step previews. */
export function getSendLogStatusClass(status: string | null | undefined) {
  const value = (status || "").toLowerCase();
  if (value === "sent") {
    return {
      box: "border-emerald-200 bg-emerald-50",
      label: "text-emerald-700",
      text: "text-emerald-900",
    };
  }
  if (value === "failed") {
    return {
      box: "border-rose-200 bg-rose-50",
      label: "text-rose-700",
      text: "text-rose-900",
    };
  }
  if (value === "sending" || value === "calling") {
    return {
      box: "border-violet-200 bg-violet-50",
      label: "text-violet-700",
      text: "text-violet-900",
    };
  }
  if (value === "scheduled") {
    return {
      box: "border-blue-200 bg-blue-50",
      label: "text-blue-700",
      text: "text-blue-900",
    };
  }
  if (value === "pending") {
    return {
      box: "border-amber-200 bg-amber-50",
      label: "text-amber-700",
      text: "text-amber-900",
    };
  }
  if (value === "skipped") {
    return {
      box: "border-slate-200 bg-slate-100",
      label: "text-slate-600",
      text: "text-slate-700",
    };
  }
  // draft / unknown
  return {
    box: "border-slate-200 bg-slate-50",
    label: "text-slate-500",
    text: "text-slate-700",
  };
}
