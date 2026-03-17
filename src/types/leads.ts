export interface LeadItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  status: string;
  followUpStage: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadsCollection {
  items: LeadItem[];
  pagination: LeadsPagination;
}

export interface GetLeadsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LeadsCollection;
}

export interface GetLeadsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  followUpStage?: string;
}
