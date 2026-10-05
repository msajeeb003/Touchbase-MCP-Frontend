/** Status-tinted styles for Send log boxes in step previews. */
export function getSendLogStatusClass(status: string | null | undefined) {
  const value = (status || "").toLowerCase();
  if (value === "sent") {
    return {
      box: "border-landing-whatsapp/40 bg-landing-whatsapp/10",
      label: "text-landing-whatsapp",
      text: "text-landing-fog/80",
    };
  }
  if (value === "failed") {
    return {
      box: "border-landing-voice/40 bg-landing-voice/10",
      label: "text-landing-voice",
      text: "text-landing-fog/80",
    };
  }
  if (value === "sending" || value === "calling") {
    return {
      box: "border-landing-violet/40 bg-landing-violet/10",
      label: "text-landing-violet",
      text: "text-landing-fog/80",
    };
  }
  if (value === "scheduled") {
    return {
      box: "border-landing-email/40 bg-landing-email/10",
      label: "text-landing-email",
      text: "text-landing-fog/80",
    };
  }
  if (value === "pending") {
    return {
      box: "border-landing-sms/40 bg-landing-sms/10",
      label: "text-landing-sms",
      text: "text-landing-fog/80",
    };
  }
  if (value === "skipped") {
    return {
      box: "border-landing-line bg-landing-fog/[0.06]",
      label: "text-landing-fog/65",
      text: "text-landing-fog/80",
    };
  }
  // draft / unknown
  return {
    box: "border-landing-line bg-landing-fog/[0.04]",
    label: "text-landing-fog/55",
    text: "text-landing-fog/80",
  };
}
