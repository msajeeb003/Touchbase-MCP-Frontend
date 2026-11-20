import { Loader2, Mail, MessageSquareReply, Smartphone } from "lucide-react";
import { useGetLeadRepliesQuery } from "@/store/features/leads/leadsApi";
import { rel } from "@/lib/harness/labels";
import { Chip } from "@/components/harness/ui";

/**
 * The lead's replies, by email and by SMS, newest first.
 * The text was written by the lead: it is shown as plain text, never as HTML.
 */
export default function LeadReplies({ leadId }: { leadId: string }) {
  const { data, isLoading, isError } = useGetLeadRepliesQuery({ leadId, limit: 20 }, { skip: !leadId });
  const replies = data?.data.items ?? [];

  return (
    <section className="rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-landing-display text-lg font-bold text-landing-fog">
          <MessageSquareReply className="h-5 w-5 text-landing-sky" />
          Replies
        </h3>
        <span className="text-xs text-landing-fog/50">
          Email and SMS. A reply pauses this lead's running follow-up.
        </span>
      </div>

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-landing-fog/55">
          <Loader2 className="h-4 w-4 animate-spin text-landing-sky" /> Loading replies…
        </p>
      ) : isError ? (
        <p className="text-sm text-landing-voice">Could not load the replies.</p>
      ) : replies.length === 0 ? (
        <p className="text-sm text-landing-fog/55">No replies from this lead yet.</p>
      ) : (
        <ul className="space-y-3">
          {replies.map((reply) => {
            const sms = reply.channel === "sms";
            return (
              <li key={reply.id} className="rounded-xl border border-landing-line bg-landing-steel px-4 py-3">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-landing-fog/55">
                  <Chip tone={sms ? "claude" : "blue"} icon={sms ? Smartphone : Mail}>
                    {sms ? "SMS" : "Email"}
                  </Chip>
                  <span>{sms ? reply.fromPhone : reply.fromName || reply.fromEmail}</span>
                  <span title={new Date(reply.receivedAt).toLocaleString()}>· {rel(reply.receivedAt)}</span>
                </div>
                {!sms && reply.subject ? (
                  <p className="text-sm font-medium text-landing-fog">{reply.subject}</p>
                ) : null}
                <p className="whitespace-pre-wrap break-words text-sm text-landing-fog/75">
                  {reply.bodyText.length > 1200 ? `${reply.bodyText.slice(0, 1200)}…` : reply.bodyText}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
