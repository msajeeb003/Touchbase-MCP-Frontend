export interface SequenceGoalItem {
  id: string;
  userId: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetSequenceGoalsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceGoalItem[];
}

export interface GetSequenceGoalByIdResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceGoalItem;
}

export interface CreateSequenceGoalRequestBody {
  label: string;
}

export interface CreateSequenceGoalResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceGoalItem;
}

export interface UpdateSequenceGoalRequestBody {
  label: string;
}

export interface UpdateSequenceGoalResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceGoalItem;
}

export interface DeleteSequenceGoalResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}
