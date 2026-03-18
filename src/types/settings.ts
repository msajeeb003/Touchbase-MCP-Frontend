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
  textmagicUsername: string | null;
  textmagicApiKey: string | null;
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
  aiProvider?: string;
  aiApiKey?: string;
  aiModel?: string;
  fathomApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpFromName?: string;
  textmagicUsername?: string;
  textmagicApiKey?: string;
}

export interface UpdateSettingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SettingsItem;
}
