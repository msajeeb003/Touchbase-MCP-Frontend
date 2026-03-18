import { z } from "zod";

export const createLeadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  company: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  followUpStage: z.string().min(1, "Follow-up stage is required"),
});

export type CreateLeadFormValues = z.infer<typeof createLeadFormSchema>;
