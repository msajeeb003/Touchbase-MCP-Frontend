export interface DashboardSummary {
  totalLeads: number;
  totalEmailsSent: number;
  totalSmsSent: number;
  totalWhatsAppSent: number;
  activeSequences: number;
  totalTranscripts: number;
}

export interface DashboardLeadsByStageItem {
  stage: string;
  count: number;
}

export interface DashboardSequencesByStatusItem {
  status: string;
  count: number;
}

export interface DashboardSentTrendItem {
  date: string;
  emails: number;
  sms: number;
  whatsapp: number;
}

export interface DashboardDeliveryStatsItem {
  type: string;
  sent: number;
  failed: number;
}

export interface DashboardLeadsOverTimeItem {
  date: string;
  count: number;
}

export interface DashboardUpcomingStepItem {
  id: string;
  stepOrder: number;
  stepType: string;
  subject: string | null;
  scheduledAt: string;
  sequenceName: string;
  leadName: string;
  leadEmail: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  leadsByStage: DashboardLeadsByStageItem[];
  sequencesByStatus: DashboardSequencesByStatusItem[];
  sentTrend: DashboardSentTrendItem[];
  deliveryStats: DashboardDeliveryStatsItem[];
  leadsOverTime: DashboardLeadsOverTimeItem[];
  upcomingSteps: DashboardUpcomingStepItem[];
}

export interface GetDashboardResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DashboardData;
}
