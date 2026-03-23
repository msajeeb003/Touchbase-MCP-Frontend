import { z } from "zod";

export const createStepFormSchema = z.object({
  stepOrder: z.coerce.number().int().min(1, "Step order must be at least 1"),
  stepType: z.enum(["EMAIL", "SMS"], {
    message: "Step type is required",
  }),
  scheduledAt: z.string().min(1, "Scheduled time is required"),
});

export type CreateStepFormValues = z.infer<typeof createStepFormSchema>;
