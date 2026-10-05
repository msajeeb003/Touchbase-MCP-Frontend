import { format, parseISO } from "date-fns";
import {
  CalendarClock,
  Clock3,
  Hash,
  Mail,
  MessageCircle,
  MessageSquareText,
  PhoneCall,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  dashCard,
  dashCardDesc,
  dashCardIcon,
  dashCardTitle,
  dashEmpty,
} from "@/components/dashboard/dashboardTheme";
import type { DashboardUpcomingStepItem } from "@/types/dashboard";

interface UpcomingStepsSectionProps {
  data: DashboardUpcomingStepItem[];
}

const formatDateTime = (value: string) => {
  try {
    return format(parseISO(value), "MMM d, yyyy • h:mm a");
  } catch {
    return value;
  }
};

/** Tinted channel badges, using the same channel colours as the landing page. */
const getStepTypeBadgeClass = (stepType: string) => {
  if (stepType === "EMAIL") return "border-landing-email/40 bg-landing-email/15 text-landing-email";
  if (stepType === "SMS") return "border-landing-sms/40 bg-landing-sms/15 text-landing-sms";
  if (stepType === "WHATSAPP") return "border-landing-whatsapp/40 bg-landing-whatsapp/15 text-landing-whatsapp";
  if (stepType === "CALL") return "border-landing-voice/40 bg-landing-voice/15 text-landing-voice";
  return "border-landing-line bg-landing-steel text-landing-fog/70";
};

const getStepTypeIcon = (stepType: string) => {
  if (stepType === "EMAIL") return Mail;
  if (stepType === "SMS") return MessageSquareText;
  if (stepType === "WHATSAPP") return MessageCircle;
  if (stepType === "CALL") return PhoneCall;
  return MessageSquareText;
};

function StepTypeBadge({ stepType }: { stepType: string }) {
  const Icon = getStepTypeIcon(stepType);
  return (
    <Badge
      variant="outline"
      className={`font-landing-mono text-[10.5px] font-medium tracking-[0.06em] ${getStepTypeBadgeClass(stepType)}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" />
        {stepType}
      </span>
    </Badge>
  );
}

const headCell =
  "font-landing-mono text-[10.5px] font-normal uppercase tracking-[0.12em] text-landing-fog/45";

export default function UpcomingStepsSection({
  data,
}: UpcomingStepsSectionProps) {
  if (data.length === 0) {
    return (
      <Card className={dashCard}>
        <CardHeader className="pb-2">
          <CardTitle className={dashCardTitle}>
            <Clock3 className={dashCardIcon} />
            Upcoming Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={dashEmpty}>No upcoming steps scheduled yet.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={dashCard}>
      <CardHeader className="pb-2">
        <CardTitle className={dashCardTitle}>
          <Clock3 className={dashCardIcon} />
          Upcoming Activity
        </CardTitle>
        <p className={dashCardDesc}>
          Next scheduled sequence steps for your leads.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4 md:hidden">
          {data.map((step) => (
            <div
              key={step.id}
              className="rounded-2xl border border-landing-line bg-landing-steel p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-landing-fog">
                    {step.subject || `${step.stepType} follow-up`}
                  </p>
                  <p className="mt-1 text-sm text-landing-fog/55">{step.sequenceName}</p>
                </div>
                <StepTypeBadge stepType={step.stepType} />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-landing-fog/65">
                <p className="inline-flex items-center gap-2">
                  <Hash className="h-4 w-4 flex-none text-landing-fog/35" />
                  Step {step.stepOrder}
                </p>
                <p className="inline-flex min-w-0 items-center gap-2">
                  <UserRound className="h-4 w-4 flex-none text-landing-fog/35" />
                  <span className="min-w-0 break-words">
                    {step.leadName} • {step.leadEmail}
                  </span>
                </p>
                <p className="inline-flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 flex-none text-landing-fog/35" />
                  {formatDateTime(step.scheduledAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-landing-line hover:bg-transparent">
                <TableHead className={headCell}>Type</TableHead>
                <TableHead className={headCell}>Step</TableHead>
                <TableHead className={headCell}>Subject</TableHead>
                <TableHead className={headCell}>Lead</TableHead>
                <TableHead className={headCell}>Sequence</TableHead>
                <TableHead className={headCell}>Scheduled At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((step) => (
                <TableRow
                  key={step.id}
                  className="border-landing-line hover:bg-landing-fog/[0.03]"
                >
                  <TableCell>
                    <StepTypeBadge stepType={step.stepType} />
                  </TableCell>
                  <TableCell className="font-medium text-landing-fog">
                    Step {step.stepOrder}
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <div className="truncate text-landing-fog/75">
                      {step.subject || `${step.stepType} follow-up`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-landing-fog">{step.leadName}</span>
                      <span className="text-sm text-landing-fog/50">{step.leadEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-landing-fog/75">{step.sequenceName}</TableCell>
                  <TableCell className="whitespace-nowrap font-landing-mono text-[12.5px] text-landing-fog/65">
                    {formatDateTime(step.scheduledAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
