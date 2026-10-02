import {
  FileText,
  Layers3,
  MailCheck,
  MessageCircle,
  MessageSquareText,
  PhoneCall,
  Users2,
} from "lucide-react";
import DashboardSummaryCard from "@/components/dashboard/DashboardSummaryCard";
import type { DashboardSummary } from "@/types/dashboard";

/** Channel cards use the same channel colours as the landing page. */
const summaryCards = [
  {
    key: "totalLeads",
    title: "Total Leads",
    description: "All leads in your workspace",
    icon: Users2,
    iconClassName: "bg-landing-sky-soft text-landing-sky",
  },
  {
    key: "totalEmailsSent",
    title: "Emails Sent",
    description: "Delivered from sequences",
    icon: MailCheck,
    iconClassName: "bg-landing-email/15 text-landing-email",
  },
  {
    key: "totalSmsSent",
    title: "SMS Sent",
    description: "Sent to your leads",
    icon: MessageSquareText,
    iconClassName: "bg-landing-sms/15 text-landing-sms",
  },
  {
    key: "totalWhatsAppSent",
    title: "WhatsApp Sent",
    description: "Sent to WhatsApp leads",
    icon: MessageCircle,
    iconClassName: "bg-landing-whatsapp/15 text-landing-whatsapp",
  },
  {
    key: "totalCallsMade",
    title: "Calls Made",
    description: "AI voice calls completed",
    icon: PhoneCall,
    iconClassName: "bg-landing-voice/15 text-landing-voice",
  },
  {
    key: "activeSequences",
    title: "Active Sequences",
    description: "Currently running follow-ups",
    icon: Layers3,
    iconClassName: "bg-landing-sky-soft text-landing-sky",
  },
  {
    key: "totalTranscripts",
    title: "Total Transcripts",
    description: "Imported from meetings",
    icon: FileText,
    iconClassName: "bg-landing-sky-soft text-landing-sky",
  },
] as const;

interface DashboardSummarySectionProps {
  summary: DashboardSummary;
}

export default function DashboardSummarySection({
  summary,
}: DashboardSummarySectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 2xl:grid-cols-7">
      {summaryCards.map((item) => (
        <DashboardSummaryCard
          key={item.key}
          title={item.title}
          value={summary[item.key]}
          description={item.description}
          icon={item.icon}
          iconClassName={item.iconClassName}
        />
      ))}
    </div>
  );
}
