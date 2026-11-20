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

/** Workspace totals. Channel colours match the landing page. */
const summaryCards = [
  { key: "totalLeads", title: "Leads", icon: Users2, iconClassName: "text-tb-accent" },
  { key: "activeSequences", title: "Active sequences", icon: Layers3, iconClassName: "text-tb-accent" },
  { key: "totalEmailsSent", title: "Emails sent", icon: MailCheck, iconClassName: "text-landing-email" },
  { key: "totalSmsSent", title: "SMS sent", icon: MessageSquareText, iconClassName: "text-landing-sms" },
  { key: "totalWhatsAppSent", title: "WhatsApp sent", icon: MessageCircle, iconClassName: "text-landing-whatsapp" },
  { key: "totalCallsMade", title: "Calls made", icon: PhoneCall, iconClassName: "text-landing-voice" },
  { key: "totalTranscripts", title: "Transcripts", icon: FileText, iconClassName: "text-landing-violet" },
] as const;

interface DashboardSummarySectionProps {
  summary: DashboardSummary;
}

/** One glass strip of numbers instead of seven separate cards. */
export default function DashboardSummarySection({ summary }: DashboardSummarySectionProps) {
  return (
    <section
      aria-label="Workspace totals"
      className="tb-card grid grid-cols-2 overflow-hidden sm:grid-cols-4 xl:grid-cols-7 [&>*]:border-tb-ink/[0.07]"
    >
      {summaryCards.map((item) => (
        <DashboardSummaryCard
          key={item.key}
          title={item.title}
          value={summary[item.key]}
          icon={item.icon}
          iconClassName={item.iconClassName}
        />
      ))}
    </section>
  );
}
