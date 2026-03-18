import { z } from "zod";

const optionalText = z.string().optional();
const optionalAiProvider = z.union([z.literal(""), z.enum(["openai", "gemini"])]).optional();
const optionalAiModel = z.union([z.literal(""), z.enum(["gpt-4o-mini", "gemini-2.0-flash"])]).optional();

const optionalPort = z.preprocess((value) => {
  if (value === "" || value === null || typeof value === "undefined") {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().int().min(1, "SMTP port must be between 1 and 65535").max(65535, "SMTP port must be between 1 and 65535").optional());

export const updateSettingsSchema = z.object({
  body: z
    .object({
      aiProvider: optionalAiProvider,
      aiApiKey: optionalText,
      aiModel: optionalAiModel,

      fathomApiKey: optionalText,

      smtpHost: optionalText,
      smtpPort: optionalPort,
      smtpUsername: optionalText,
      smtpPassword: optionalText,
      smtpFromName: optionalText,

      textmagicUsername: optionalText,
      textmagicApiKey: optionalText,
    })
    .refine(
      (data) =>
        !data.aiProvider ||
        data.aiProvider === "" ||
        !data.aiModel ||
        data.aiModel === "" ||
        (data.aiProvider === "openai" && data.aiModel === "gpt-4o-mini") ||
        (data.aiProvider === "gemini" && data.aiModel === "gemini-2.0-flash"),
      {
        path: ["aiModel"],
        message: "Selected AI model does not match AI provider",
      },
    ),
});

export const settingsFormSchema = updateSettingsSchema.shape.body;
export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
