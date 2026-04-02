export const getStageBadgeClass = (stage: string) => {
  const value = stage.toLowerCase();
  if (value.includes("no")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
  if (value.includes("after")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (value.includes("prd")) return "bg-violet-100 text-violet-700 border-violet-200";
  if (value.includes("hot")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

export const getShortNotes = (notes: string, maxLength = 15) => {
  if (notes.length <= maxLength) return notes;
  return `${notes.slice(0, maxLength)}...`;
};
