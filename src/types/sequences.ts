export type SequenceStatus = "draft" | "active" | "paused" | "completed" | "cancelled";

export interface SequenceLeadInfo {
  name: string;
  email: string;
  company: string;
  followUpStage: string;
}

export interface SequencePromptTemplateInfo {
  id: string;
  name: string;
  followUpStage: string;
}

export interface SequenceCountInfo {
  steps: number;
}

export interface SequenceItem {
  id: string;
  userId: string;
  leadId: string;
  promptTemplateId: string;
  name: string;
  totalSteps: number;
  status: SequenceStatus;
  createdAt: string;
  updatedAt: string;
  lead: SequenceLeadInfo;
  promptTemplate: SequencePromptTemplateInfo;
  _count?: SequenceCountInfo;
}

export interface SequenceStepItem {
  id: string;
  sequenceId: string;
  stepOrder: number;
  stepType: "EMAIL" | "SMS";
  subject: string | null;
  content: string | null;
  status: string;
  scheduledAt: string;
  sentAt: string | null;
  sendLog: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetSequencesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceItem[];
}

export interface CreateSequenceRequestBody {
  leadId: string;
  name: string;
  totalSteps: number;
  promptTemplateId: string;
}

export interface CreateSequenceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceItem;
}

export interface GetSingleSequenceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceItem & {
    steps: SequenceStepItem[];
  };
}

export interface UpdateSequenceRequestBody {
  leadId: string;
  name: string;
  totalSteps: number;
  promptTemplateId: string;
  status?: SequenceStatus;
}

export interface UpdateSequenceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceItem;
}

export interface DeleteSequenceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}

export interface GetSequenceStepsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceStepItem[];
}

export interface CreateSequenceStepRequestBody {
  stepOrder: number;
  stepType: "EMAIL" | "SMS";
  scheduledAt: string;
}

export interface CreateSequenceStepResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceStepItem;
}

export interface DeleteSequenceStepResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}

export interface GenerateSequenceStepContentResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceStepItem;
}

export interface SequenceGenerationStepResult {
  stepOrder: number;
  status: string;
}

/** Shape returned by POST /sequences/:id/generate-steps (lead may omit optional list fields). */
export interface GenerateSequenceStepsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    sequence: Omit<SequenceItem, "lead" | "_count"> & {
      lead: Pick<SequenceLeadInfo, "name" | "email" | "followUpStage"> &
        Partial<Pick<SequenceLeadInfo, "company">>;
      promptTemplate: SequencePromptTemplateInfo;
      steps: SequenceStepItem[];
    };
    generationResults: SequenceGenerationStepResult[];
  };
}

export interface UpdateSequenceStepRequestBody {
  subject?: string | null;
  content?: string | null;
  scheduledAt?: string;
}

export interface UpdateSequenceStepResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceStepItem;
}
