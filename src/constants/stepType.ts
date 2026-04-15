export const STEP_TYPE = {
  EMAIL: "EMAIL",
  SMS: "SMS",
  WHATSAPP: "WHATSAPP",
} as const;

export type StepType = (typeof STEP_TYPE)[keyof typeof STEP_TYPE];

export const STEP_TYPE_VALUES = [STEP_TYPE.EMAIL, STEP_TYPE.SMS, STEP_TYPE.WHATSAPP] as const;
