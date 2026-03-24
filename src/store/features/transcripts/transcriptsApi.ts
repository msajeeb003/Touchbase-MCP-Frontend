import { baseApi } from "@/store/api/baseApi";
import type {
  DeleteLeadTranscriptResponse,
  GetFathomMeetingsResponse,
  GetLeadTranscriptsResponse,
  GetMeetingTranscriptResponse,
  ImportLeadTranscriptFromFathomRequestBody,
  ImportLeadTranscriptFromFathomResponse,
} from "@/types/transcripts";

export const transcriptsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFathomMeetings: builder.query<GetFathomMeetingsResponse, void>({
      query: () => ({
        url: "/fathom/meetings",
        method: "GET",
      }),
      providesTags: ["Transcripts"],
    }),
    getMeetingTranscript: builder.query<GetMeetingTranscriptResponse, number>({
      query: (recordingId) => ({
        url: `/fathom/meetings/${recordingId}/transcript`,
        method: "GET",
      }),
      providesTags: ["Transcripts"],
    }),
    getLeadTranscripts: builder.query<GetLeadTranscriptsResponse, string>({
      query: (leadId) => ({
        url: `/leads/${leadId}/transcripts`,
        method: "GET",
      }),
      providesTags: ["Transcripts"],
    }),
    importLeadTranscriptFromFathom: builder.mutation<
      ImportLeadTranscriptFromFathomResponse,
      { leadId: string; body: ImportLeadTranscriptFromFathomRequestBody }
    >({
      query: ({ leadId, body }) => ({
        url: `/leads/${leadId}/transcripts/from-fathom`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transcripts"],
    }),
    deleteLeadTranscript: builder.mutation<
      DeleteLeadTranscriptResponse,
      { leadId: string; transcriptId: string }
    >({
      query: ({ leadId, transcriptId }) => ({
        url: `/leads/${leadId}/transcripts/${transcriptId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transcripts"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFathomMeetingsQuery,
  useGetLeadTranscriptsQuery,
  useLazyGetMeetingTranscriptQuery,
  useDeleteLeadTranscriptMutation,
  useImportLeadTranscriptFromFathomMutation,
} = transcriptsApi;
