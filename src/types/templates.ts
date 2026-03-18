export interface PromptTemplateItem {
  id: string;
  name: string;
  followUpStage: string;
  promptText: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetPromptTemplatesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PromptTemplateItem[];
}

export interface CreatePromptTemplateRequestBody {
  name: string;
  followUpStage: string;
  promptText: string;
}

export interface CreatePromptTemplateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PromptTemplateItem;
}

export interface GetPromptTemplateByIdResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PromptTemplateItem;
}

export interface UpdatePromptTemplateRequestBody {
  name: string;
  followUpStage: string;
  promptText: string;
}

export interface UpdatePromptTemplateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PromptTemplateItem;
}

export interface DeletePromptTemplateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}
