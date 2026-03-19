import { baseApi } from "@/store/api/baseApi";
import type { GetFathomMeetingsResponse, GetMeetingTranscriptResponse } from "@/types/transcripts";

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
  }),
  overrideExisting: false,
});

export const { useGetFathomMeetingsQuery, useLazyGetMeetingTranscriptQuery } = transcriptsApi;
