import { z } from "zod";

export const generatePromptTextSchema = z.object({
  followUpScenario: z.string().min(1, "Follow-up scenario is required"),
  serviceDescription: z.string().min(1, "Service description is required"),
  sequenceGoal: z.string().min(1, "Sequence goal is required"),
  senderName: z.string().min(1, "Sender name is required"),
  ctaLink: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().url("CTA link must be a valid URL").optional(),
  ),
  companyName: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().min(1, "Company name is required").optional(),
  ),
  additionalNotes: z.string().optional(),
});

export type GeneratePromptTextFormValues = z.infer<typeof generatePromptTextSchema>;
