export const getStatusBadgeClass = (status: string | null | undefined) => {
  const value = (status ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  if (value === "active") {
    return "border-landing-whatsapp/40 bg-landing-whatsapp/15 text-landing-whatsapp";
  }
  if (value === "not active" || value === "inactive" || value === "not_active") {
    return "border-landing-line bg-white/5 text-landing-fog/55";
  }
  return "border-landing-line bg-white/5 text-landing-fog/70";
};

export const getStageBadgeClass = (stage: string | null | undefined) => {
  const value = (stage ?? "").toLowerCase();
  if (!value) return "border-landing-line bg-white/5 text-landing-fog/50";
  if (value.includes("no")) return "border-landing-sky/40 bg-landing-sky-soft text-landing-sky";
  if (value.includes("after")) return "border-[#A78BFA]/40 bg-[#A78BFA]/15 text-[#A78BFA]";
  if (value.includes("prd")) return "border-landing-email/40 bg-landing-email/15 text-landing-email";
  if (value.includes("hot")) return "border-landing-voice/40 bg-landing-voice/15 text-landing-voice";
  return "border-landing-line bg-white/5 text-landing-fog/70";
};

export const getShortNotes = (notes: string, maxLength = 15) => {
  if (notes.length <= maxLength) return notes;
  return `${notes.slice(0, maxLength)}...`;
};

export const formatLeadAddedAt = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
