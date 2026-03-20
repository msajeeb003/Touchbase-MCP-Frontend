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
