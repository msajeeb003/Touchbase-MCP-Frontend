export interface LeadItem {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  status: string;
  followUpStage: string | null;
  notes?: string;
  /** Set by a person, by Claude, by the system, or by the lead ("lead_opt_out", never cleared by Claude). */
  doNotContact?: boolean;
  doNotContactAt?: string | null;
  doNotContactReason?: string | null;
  doNotContactSource?: string | null;
  /** Soft delete by Claude. Such leads appear only under Recently deleted. */
  deletedAt?: string | null;
  deletedReason?: string | null;
  deletedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeletedLeadItem extends LeadItem {
  deletedAt: string;
  restorableUntil: string;
}

export interface GetDeletedLeadsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DeletedLeadItem[];
}

/** A reply from a lead, by email or SMS. Its text was written by the lead: show it as plain text. */
export interface LeadReplyItem {
  id: string;
  channel: "email" | "sms";
  fromEmail: string | null;
  fromPhone: string | null;
  fromName: string | null;
  subject: string | null;
  bodyText: string;
  receivedAt: string;
}

export interface GetLeadRepliesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: { items: LeadReplyItem[]; pagination: LeadsPagination };
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

export interface CreateLeadRequestBody {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  location?: string | null;
  followUpStage?: string | null;
  notes?: string | null;
}

export interface CreateLeadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LeadItem;
}

export interface GetSingleLeadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LeadItem;
}

export interface UpdateLeadRequestBody {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  location?: string | null;
  followUpStage?: string | null;
  notes?: string | null;
}

export interface UpdateLeadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LeadItem;
}

export interface DeleteLeadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}

export interface BulkDeleteLeadsRequestBody {
  leadIds: string[];
}

export interface BulkDeleteLeadsResult {
  deletedCount: number;
  requestedCount: number;
  skippedCount: number;
}

export interface BulkDeleteLeadsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: BulkDeleteLeadsResult;
}

export interface LeadImportErrorItem {
  row: number;
  email: string;
  reason: string;
}

export interface ImportLeadsCsvData {
  total: number;
  success: number;
  failed: number;
  errors: LeadImportErrorItem[];
  /** CSV header → lead field (e.g. "Contact Name" → "name"). */
  columnMapping: Record<string, string>;
}

export interface ImportLeadsCsvResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ImportLeadsCsvData;
}
