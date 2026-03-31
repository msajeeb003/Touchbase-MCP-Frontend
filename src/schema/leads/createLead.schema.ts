import { z } from "zod";

const nationalDigits = (val: string) => val.replace(/\D/g, "").length;

/**
 * @param getMinNationalDigits - Min digits for the national number (no country prefix). Use a ref-backed getter in the form when this depends on selected country ISO.
 */
export function createLeadFormSchema(getMinNationalDigits: () => number = () => 8) {
  return z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .refine((val) => nationalDigits(val) >= getMinNationalDigits(), () => {
        const min = getMinNationalDigits();
        return {
          message: `Phone must be at least ${min} digit${min === 1 ? "" : "s"} (national number, no country code)`,
        };
      }),
    company: z.string().optional(),
    location: z.string().min(1, "Location is required"),
    followUpStage: z.string().min(1, "Follow-up stage is required"),
  });
}

export type CreateLeadFormValues = z.infer<ReturnType<typeof createLeadFormSchema>>;
