export const AI_PROVIDER = {
  OPENAI: "openai",
  GEMINI: "gemini",
  CLAUDE: "claude",
} as const;

export type AiProvider = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];
export type SmsProvider = "textmagic" | "twilio";

export interface SettingsItem {
  id: string;
  userId: string;
  aiProvider: AiProvider | null;
  aiApiKey: string | null;
  aiModel: string | null;
  fathomApiKey: string | null;
  autoDraftEnabled: boolean;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUsername: string | null;
  smtpPassword: string | null;
  smtpFromName: string | null;
  smsProvider: SmsProvider | null;
  textmagicUsername: string | null;
  textmagicApiKey: string | null;
  twilioAccountSid: string | null;
  twilioAuthToken: string | null;
  twilioPhoneNumber: string | null;
  twilioWhatsappNumber: string | null;
  retellApiKey: string | null;
  retellAgentId: string | null;
  retellCallerNumber: string | null;
  /** AI harness send window: "HH:MM" 24-hour times and an IANA timezone. */
  sendWindowStart?: string | null;
  sendWindowEnd?: string | null;
  sendOnWeekends?: boolean;
  sendTimezone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetSettingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SettingsItem;
}

export interface UpdateSettingsRequestBody {
  aiProvider?: AiProvider | null;
  aiApiKey?: string | null;
  aiModel?: string | null;
  fathomApiKey?: string | null;
  autoDraftEnabled?: boolean;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUsername?: string | null;
  smtpPassword?: string | null;
  smtpFromName?: string | null;
  smsProvider?: SmsProvider | null;
  textmagicUsername?: string | null;
  textmagicApiKey?: string | null;
  twilioAccountSid?: string | null;
  twilioAuthToken?: string | null;
  twilioPhoneNumber?: string | null;
  twilioWhatsappNumber?: string | null;
  retellApiKey?: string | null;
  retellAgentId?: string | null;
  retellCallerNumber?: string | null;
  sendWindowStart?: string;
  sendWindowEnd?: string;
  sendOnWeekends?: boolean;
  sendTimezone?: string | null;
}

export interface UpdateSettingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SettingsItem;
}
