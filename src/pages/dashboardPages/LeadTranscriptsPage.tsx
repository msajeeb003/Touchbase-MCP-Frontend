import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  FilePlus2,
  FileText,
  Loader2,
  Mic,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewTranscriptDialog from "@/components/transcripts/ViewTranscriptDialog";
import { useGetSingleLeadQuery } from "@/store/features/leads/leadsApi";
import {
  useDeleteLeadTranscriptMutation,
  useGetFathomMeetingsQuery,
  useGetLeadTranscriptsQuery,
  useImportLeadTranscriptFromFathomMutation,
  useLazyGetFathomMeetingsQuery,
} from "@/store/features/transcripts/transcriptsApi";
import type { FathomMeetingItem, LeadTranscriptItem } from "@/types/transcripts";
import { dismissToast, showError, showLoading, showSuccess } from "@/utils/toast";
import LeadReplies from "@/components/leads/LeadReplies";

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

const getDurationText = (start: string | null | undefined, end: string | null | undefined) => {
  if (!start || !end) return "N/A";

  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(ms) || ms <= 0) return "N/A";

  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

function TranscriptMeetingCard({
  meeting,
  isAdded,
  isAdding,
  onAdd,
}: {
  meeting: FathomMeetingItem;
  isAdded: boolean;
  isAdding: boolean;
  onAdd: (meeting: FathomMeetingItem) => void;
}) {
  const host = meeting.recorded_by?.name || meeting.calendar_invitees?.[0]?.name || "Unknown";
  const attendeesCount = meeting.calendar_invitees?.length ?? 0;
  const meetingTitle = meeting.meeting_title || meeting.title;

  return (
    <div className="rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-landing-display text-lg font-bold text-landing-fog">{meetingTitle}</h3>
          <p className="mt-1 text-xs text-landing-fog/55">Recording ID: {meeting.recording_id}</p>
        </div>
        {isAdded ? (
          <Badge variant="outline" className="border-landing-whatsapp/40 bg-landing-whatsapp/15 text-landing-whatsapp">
            Added
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-col space-y-2 text-sm text-landing-fog/65">
        <p className="inline-flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-landing-fog/40" />
          {formatDateTime(meeting.scheduled_start_time || meeting.created_at)}
        </p>
        <p className="inline-flex items-center gap-2">
          <Mic className="h-4 w-4 text-landing-fog/40" />
          Recording duration: {getDurationText(meeting.recording_start_time, meeting.recording_end_time)}
        </p>
        <p className="inline-flex items-center gap-2">
          <UserRound className="h-4 w-4 text-landing-fog/40" />
          Host: {host} | Invitees: {attendeesCount}
        </p>
      </div>

      <div className="mt-4 flex flex-row items-center gap-2 border-t pt-4">
        <ViewTranscriptDialog
          recordingId={meeting.recording_id}
          meetingTitle={meetingTitle}
          trigger={
            <Button size="sm" variant="outline" className="w-full">
              View
              <Eye className="ml-1 h-3.5 w-3.5" />
            </Button>
          }
        />

        <Button
          size="sm"
          className="w-full bg-landing-sky font-semibold text-landing-steel hover:bg-landing-sky-deep"
          disabled={isAdded || isAdding}
          onClick={() => onAdd(meeting)}
        >
          {isAdding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isAdded ? (
            <>
              Added
              <CheckCircle2 className="ml-1 h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Add
              <FilePlus2 className="ml-1 h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function LeadTranscriptsPage() {
  const { id: leadId = "" } = useParams();
  const [activeTab, setActiveTab] = useState("all");
  const [addingRecordingId, setAddingRecordingId] = useState<number | null>(null);
  const [deletingTranscriptId, setDeletingTranscriptId] = useState<string | null>(null);
  const [meetingSearch, setMeetingSearch] = useState("");
  const [hasInitializedSearch, setHasInitializedSearch] = useState(false);

  const { data: leadData, isLoading: isLeadLoading, isError: isLeadError } = useGetSingleLeadQuery(
    leadId,
    { skip: !leadId },
  );
  const { data: meetingsData, isLoading: isMeetingsLoading, isError: isMeetingsError } =
    useGetFathomMeetingsQuery();
  const [fetchMoreMeetings, { isFetching: isLoadingMoreMeetings }] = useLazyGetFathomMeetingsQuery();
  const {
    data: selectedTranscriptsData,
    isLoading: isSelectedTranscriptsLoading,
    isError: isSelectedTranscriptsError,
  } = useGetLeadTranscriptsQuery(leadId, { skip: !leadId });

  const [importLeadTranscript] = useImportLeadTranscriptFromFathomMutation();
  const [deleteLeadTranscript] = useDeleteLeadTranscriptMutation();

  const lead = leadData?.data;
  const meetings = meetingsData?.data.items;
  const meetingsHasMore = Boolean(meetingsData?.data.hasMore && meetingsData.data.next_cursor);
  const meetingsNextCursor = meetingsData?.data.next_cursor ?? "";

  const handleLoadMoreMeetings = () => {
    if (!meetingsHasMore || !meetingsNextCursor || isLoadingMoreMeetings) return;
    fetchMoreMeetings(meetingsNextCursor);
  };

  const normalizedMeetingSearch = meetingSearch.trim().toLowerCase();
  const selectedTranscripts = useMemo(
    () => selectedTranscriptsData?.data ?? [],
    [selectedTranscriptsData?.data],
  );
  const addedRecordingIds = useMemo(
    () => new Set(selectedTranscripts.map((item) => item.fathomRecordingId)),
    [selectedTranscripts],
  );
  const filteredMeetings = useMemo(() => {
    const list = meetings ?? [];
    if (!normalizedMeetingSearch) return list;

    const queryTokens = normalizedMeetingSearch.split(/\s+/).filter(Boolean);

    return list.filter((meeting) => {
      const meetingTitle = (meeting.meeting_title || meeting.title || "").toLowerCase();
      return (
        meetingTitle.includes(normalizedMeetingSearch) ||
        queryTokens.some((token) => meetingTitle.includes(token))
      );
    });
  }, [meetings, normalizedMeetingSearch]);

  useEffect(() => {
    if (!lead?.name || hasInitializedSearch) return;

    const timeoutId = window.setTimeout(() => {
      setMeetingSearch(lead.name);
      setHasInitializedSearch(true);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [hasInitializedSearch, lead?.name]);

  const handleAddTranscript = async (meeting: FathomMeetingItem) => {
    const loadingToastId = showLoading("Importing transcript...");
    setAddingRecordingId(meeting.recording_id);

    try {
      const response = await importLeadTranscript({
        leadId,
        body: {
          recordingId: meeting.recording_id,
          meetingTitle: meeting.meeting_title || meeting.title,
          meetingDate: meeting.created_at,
        },
      }).unwrap();

      setActiveTab("selected");
      showSuccess(response.message || "Transcript added successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to add transcript. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setAddingRecordingId(null);
    }
  };

  const handleDeleteTranscript = async (transcript: LeadTranscriptItem) => {
    const loadingToastId = showLoading("Removing transcript...");
    setDeletingTranscriptId(transcript.id);

    try {
      const response = await deleteLeadTranscript({
        leadId,
        transcriptId: transcript.id,
      }).unwrap();

      showSuccess(response.message || "Transcript deleted successfully");
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        "Failed to remove transcript. Please try again.";
      showError(errorMessage);
    } finally {
      dismissToast(loadingToastId);
      setDeletingTranscriptId(null);
    }
  };

  if (isLeadLoading) {
    return (
      <div className="rounded-lg border border-dashed border-landing-line p-8 text-sm text-landing-fog/55">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-landing-sky" />
          <span>Loading lead transcripts...</span>
        </div>
      </div>
    );
  }

  if (isLeadError || !lead) {
    return (
      <div className="rounded-xl border border-dashed border-landing-voice/40 bg-landing-voice/10 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-landing-voice/15">
          <FileText className="h-5 w-5 text-landing-voice" />
        </div>
        <h3 className="font-landing-display text-2xl font-bold text-landing-fog">Lead not found.</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-landing-fog/60">
          We could not load this lead right now. Please go back and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-landing-sans text-landing-fog/80">
      <div className="rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="font-landing-display text-[clamp(26px,3vw,34px)] font-bold tracking-[-0.02em] text-landing-fog">Lead Transcripts</h2>
            <p className="mt-1 text-sm text-landing-fog/55">
              Import Fathom transcripts for <span className="font-medium text-landing-fog">{lead.name}</span>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-landing-sky/40 bg-landing-sky-soft text-landing-sky">
              {lead.followUpStage}
            </Badge>
            <Badge variant="outline" className="border-landing-line bg-landing-fog/5 text-landing-fog/70">
              {selectedTranscripts.length} selected
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-landing-fog/65 md:grid-cols-3">
          <div className="rounded-xl border border-landing-line bg-landing-steel px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-landing-fog/40">Lead</p>
            <p className="mt-1 font-medium text-landing-fog">{lead.name}</p>
          </div>
          <div className="rounded-xl border border-landing-line bg-landing-steel px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-landing-fog/40">Email</p>
            <p className="mt-1 font-medium text-landing-fog">{lead.email}</p>
          </div>
          <div className="rounded-xl border border-landing-line bg-landing-steel px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-landing-fog/40">Company</p>
            <p className="mt-1 font-medium text-landing-fog">{lead.company || "N/A"}</p>
          </div>
        </div>
      </div>

      <LeadReplies leadId={leadId} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="all">All Transcripts</TabsTrigger>
          <TabsTrigger value="selected">Selected Transcripts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isMeetingsLoading ? (
            <div className="rounded-lg border border-dashed border-landing-line p-8 text-sm text-landing-fog/55">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-landing-sky" />
                <span>Loading meetings...</span>
              </div>
            </div>
          ) : isMeetingsError ? (
            <div className="rounded-xl border border-dashed border-landing-voice/40 bg-landing-voice/10 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-landing-voice/15">
                <FileText className="h-5 w-5 text-landing-voice" />
              </div>
              <h3 className="font-landing-display text-2xl font-bold text-landing-fog">Invalid Fathom API key.</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-landing-fog/60">
                Invalid Fathom API key. Please check your Settings.
              </p>
            </div>
          ) : (meetings?.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-dashed border-landing-line bg-landing-steel-2 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-landing-sky-soft">
                <FileText className="h-5 w-5 text-landing-sky" />
              </div>
              <h3 className="font-landing-display text-2xl font-bold text-landing-fog">No meetings found.</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-landing-fog/55">
                Connect your settings and sync with Fathom to view transcript-ready meetings here.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-landing-line bg-landing-steel-2 p-4">
                <div className="relative max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-landing-fog/40" />
                  <Input
                    value={meetingSearch}
                    onChange={(event) => {
                      setMeetingSearch(event.target.value);
                      setHasInitializedSearch(true);
                    }}
                    placeholder="Search transcripts by lead name or meeting title"
                    className="pl-9"
                  />
                </div>
                <p className="mt-2 text-xs text-landing-fog/55">
                  Matching against meeting title. Auto-filled from lead name after page load, and you can edit it anytime.
                </p>
              </div>

              {filteredMeetings.length === 0 ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-dashed border-landing-line bg-landing-steel-2 px-6 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-landing-fog/10">
                      <Search className="h-5 w-5 text-landing-fog/65" />
                    </div>
                    <h3 className="font-landing-display text-2xl font-bold text-landing-fog">No matching transcripts found.</h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm text-landing-fog/55">
                      Try updating the search text to match part of the meeting title.
                    </p>
                  </div>
                  {meetingsHasMore ? (
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        className="min-w-[200px] border-landing-sky/40 bg-transparent text-landing-sky hover:bg-landing-sky-soft hover:text-landing-sky"
                        onClick={handleLoadMoreMeetings}
                        disabled={isLoadingMoreMeetings}
                      >
                        {isLoadingMoreMeetings ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading more...
                          </>
                        ) : (
                          "Load more meetings"
                        )}
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredMeetings.map((meeting) => (
                      <TranscriptMeetingCard
                        key={meeting.recording_id}
                        meeting={meeting}
                        isAdded={addedRecordingIds.has(meeting.recording_id)}
                        isAdding={addingRecordingId === meeting.recording_id}
                        onAdd={handleAddTranscript}
                      />
                    ))}
                  </div>
                  {meetingsHasMore ? (
                    <div className="flex justify-center pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="min-w-[200px] border-landing-sky/40 bg-transparent text-landing-sky hover:bg-landing-sky-soft hover:text-landing-sky"
                        onClick={handleLoadMoreMeetings}
                        disabled={isLoadingMoreMeetings}
                      >
                        {isLoadingMoreMeetings ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading more...
                          </>
                        ) : (
                          "Load more meetings"
                        )}
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="selected" className="space-y-4">
          {isSelectedTranscriptsLoading ? (
            <div className="rounded-lg border border-dashed border-landing-line p-8 text-sm text-landing-fog/55">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-landing-sky" />
                <span>Loading selected transcripts...</span>
              </div>
            </div>
          ) : isSelectedTranscriptsError ? (
            <div className="rounded-xl border border-dashed border-landing-voice/40 bg-landing-voice/10 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-landing-voice/15">
                <FileText className="h-5 w-5 text-landing-voice" />
              </div>
              <h3 className="font-landing-display text-2xl font-bold text-landing-fog">Failed to load transcripts.</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-landing-fog/60">
                We could not load selected transcripts for this lead right now.
              </p>
            </div>
          ) : selectedTranscripts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-landing-line bg-landing-steel-2 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-landing-sky-soft">
                <CheckCircle2 className="h-5 w-5 text-landing-sky" />
              </div>
              <h3 className="font-landing-display text-2xl font-bold text-landing-fog">No transcripts selected yet.</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-landing-fog/55">
                Add a transcript from the first tab and it will appear here for this lead.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {selectedTranscripts.map((item) => (
                <div key={item.id} className="rounded-2xl border border-landing-line bg-landing-steel-2 p-5">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-landing-display text-lg font-bold text-landing-fog">{item.meetingTitle}</h3>
                      <p className="mt-1 text-xs text-landing-fog/55">
                        Recording ID: {item.fathomRecordingId}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-landing-whatsapp/40 bg-landing-whatsapp/15 text-landing-whatsapp"
                    >
                      Imported
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-landing-fog/65">
                    <p className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-landing-fog/40" />
                      {formatDateTime(item.meetingDate)}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4 text-landing-fog/40" />
                      Source: {item.source}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl border border-landing-line bg-landing-steel p-4">
                    <p className="mb-2 text-sm font-medium text-landing-fog">Transcript</p>
                    <div className="max-h-72 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-landing-fog/65">
                      {item.transcript}
                    </div>
                  </div>

                  <div className="mt-4 border-t pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <ViewTranscriptDialog
                        recordingId={item.fathomRecordingId}
                        meetingTitle={item.meetingTitle}
                        trigger={
                          <Button size="sm" variant="outline">
                            View Source
                            <Eye className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-landing-voice/40 bg-transparent text-landing-voice hover:bg-landing-voice/10 hover:text-landing-voice"
                        disabled={deletingTranscriptId === item.id}
                        onClick={() => handleDeleteTranscript(item)}
                      >
                        {deletingTranscriptId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            Remove
                            <Trash2 className="ml-1 h-3.5 w-3.5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
