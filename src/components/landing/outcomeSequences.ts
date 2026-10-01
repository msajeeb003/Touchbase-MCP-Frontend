/**
 * Example follow-up sequences shown on the landing page.
 * Single source for the hero routing preview and the scenarios calendar,
 * so the days and channels can never drift apart.
 */

export type OutcomeId = "noshow" | "second" | "proposal";

export type ChannelKey = "email" | "whatsapp" | "sms" | "voice";

export type OutcomeStep = {
  channel: ChannelKey;
  label: string;
  /** Days after the call. */
  day: number;
};

export type OutcomePanel = {
  id: OutcomeId;
  tabLabel: string;
  exit: string;
  steps: OutcomeStep[];
};

/** Channel label and accent. Hex values mirror the landing-* channel tokens. */
export const CHANNELS: Record<ChannelKey, { label: string; color: string }> = {
  email: { label: "Email", color: "#7FB4FF" },
  whatsapp: { label: "WhatsApp", color: "#5EDBA6" },
  sms: { label: "SMS", color: "#F2C86A" },
  voice: { label: "AI voice", color: "#FF9A7A" },
};

export const OUTCOMES: OutcomePanel[] = [
  {
    id: "noshow",
    tabLabel: "No-show",
    exit: "lead reschedules",
    steps: [
      { channel: "email", label: "Sorry we missed you", day: 0 },
      { channel: "whatsapp", label: "Reminder", day: 1 },
      { channel: "sms", label: "Rescheduling link", day: 2 },
      { channel: "email", label: "Final check-in", day: 5 },
    ],
  },
  {
    id: "second",
    tabLabel: "Second meeting",
    exit: "next meeting booked",
    steps: [
      { channel: "email", label: "Next step, summarised", day: 0 },
      { channel: "whatsapp", label: "Reminder", day: 2 },
      { channel: "sms", label: "Short follow-up", day: 4 },
      { channel: "voice", label: "Call if still no response", day: 6 },
    ],
  },
  {
    id: "proposal",
    tabLabel: "Proposal sent",
    exit: "decision received",
    steps: [
      { channel: "email", label: "Proposal follow-up", day: 2 },
      { channel: "whatsapp", label: "Short check-in", day: 4 },
      { channel: "sms", label: "Reminder", day: 6 },
      { channel: "voice", label: "Request an update", day: 8 },
      { channel: "email", label: "Decision and next step", day: 11 },
    ],
  },
];
