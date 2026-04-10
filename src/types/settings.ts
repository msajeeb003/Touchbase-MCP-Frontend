export type SmsProvider = "textmagic" | "twilio";

export interface SettingsItem {
  id: string;
  userId: string;
  aiProvider: string | null;
  aiApiKey: string | null;
  aiModel: string | null;
  fathomApiKey: string | null;
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
  aiProvider?: string | null;
  aiApiKey?: string | null;
  aiModel?: string | null;
  fathomApiKey?: string | null;
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
}

export interface UpdateSettingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SettingsItem;
}
