import { baseApi } from "@/store/api/baseApi";
import type {
  ActivityPage,
  ApiEnvelope,
  HarnessSequence,
  McpToken,
  McpTokenCreated,
  RunDetail,
  RunEventsPage,
  RunSequencesPage,
  RunsPage,
} from "@/types/harness";

/**
 * AI harness endpoints. All of them take the normal login token (baseApi adds it).
 * Approving, pausing and cancelling a sequence use the existing
 * PATCH /sequences/:id (sequencesApi.updateSequence).
 */
export const harnessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRuns: builder.query<
      ApiEnvelope<RunsPage>,
      { status?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: "/runs", method: "GET", params: { ...(params || {}) } }),
      providesTags: ["Runs"],
    }),
    getRun: builder.query<ApiEnvelope<RunDetail>, { id: string; page?: number; limit?: number }>({
      query: ({ id, page, limit }) => ({
        url: `/runs/${id}`,
        method: "GET",
        params: { page, limit: limit ?? 50 },
      }),
      providesTags: ["Runs"],
    }),
    getRunEvents: builder.query<ApiEnvelope<RunEventsPage>, { id: string; after?: number }>({
      query: ({ id, after }) => ({ url: `/runs/${id}/events`, method: "GET", params: { after } }),
    }),
    getRunSequences: builder.query<
      ApiEnvelope<RunSequencesPage>,
      { id: string; page?: number; limit?: number }
    >({
      query: ({ id, page, limit }) => ({
        url: `/runs/${id}/sequences`,
        method: "GET",
        params: { page, limit: limit ?? 50 },
      }),
      providesTags: ["Runs"],
    }),

    /**
     * Every follow-up Claude prepared, across its recent tasks, each with its task.
     * Used by the Review Queue and the dashboard. Reads the 50 newest tasks.
     */
    getAllRunSequences: builder.query<HarnessSequence[], void>({
      async queryFn(_arg, _api, _extra, baseQuery) {
        const runsRes = await baseQuery({ url: "/runs", params: { limit: 50 } });
        if (runsRes.error) return { error: runsRes.error };
        const runs = (runsRes.data as ApiEnvelope<RunsPage>).data.items.filter(
          (r) => (r.counts?.sequences ?? 0) > 0,
        );

        const all: HarnessSequence[] = [];
        for (const run of runs) {
          let page = 1;
          for (;;) {
            const res = await baseQuery({
              url: `/runs/${run.run_id}/sequences`,
              params: { page, limit: 50 },
            });
            if (res.error) return { error: res.error };
            const data = (res.data as ApiEnvelope<RunSequencesPage>).data;
            for (const item of data.items) all.push({ ...item, run });
            if (page >= data.pagination.total_pages) break;
            page++;
          }
        }
        return { data: all };
      },
      providesTags: ["Runs"],
    }),

    getMcpTokens: builder.query<ApiEnvelope<McpToken[]>, void>({
      query: () => ({ url: "/mcp-tokens", method: "GET" }),
      providesTags: ["McpTokens"],
    }),
    createMcpToken: builder.mutation<
      ApiEnvelope<McpTokenCreated>,
      { name: string; expiresInDays?: number }
    >({
      query: (body) => ({ url: "/mcp-tokens", method: "POST", body }),
      invalidatesTags: ["McpTokens"],
    }),
    revokeMcpToken: builder.mutation<ApiEnvelope<McpToken>, string>({
      query: (id) => ({ url: `/mcp-tokens/${id}`, method: "DELETE" }),
      invalidatesTags: ["McpTokens"],
    }),

    markDoNotContact: builder.mutation<ApiEnvelope<unknown>, { leadId: string; reason?: string }>({
      query: ({ leadId, reason }) => ({
        url: `/leads/${leadId}/do-not-contact`,
        method: "POST",
        body: reason ? { reason } : {},
      }),
      invalidatesTags: ["Leads", "Sequences", "Runs", "Activity", "Dashboard"],
    }),
    clearDoNotContact: builder.mutation<ApiEnvelope<unknown>, { leadId: string; reason: string }>({
      query: ({ leadId, reason }) => ({
        url: `/leads/${leadId}/do-not-contact/clear`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Leads", "Runs", "Activity"],
    }),

    getActivity: builder.query<
      ApiEnvelope<ActivityPage>,
      { types?: string; since?: string; lead_id?: string; page?: number; page_size?: number } | void
    >({
      query: (params) => ({ url: "/activity", method: "GET", params: { ...(params || {}) } }),
      providesTags: ["Activity"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRunsQuery,
  useGetRunQuery,
  useLazyGetRunEventsQuery,
  useGetRunSequencesQuery,
  useGetAllRunSequencesQuery,
  useGetMcpTokensQuery,
  useCreateMcpTokenMutation,
  useRevokeMcpTokenMutation,
  useMarkDoNotContactMutation,
  useClearDoNotContactMutation,
  useGetActivityQuery,
} = harnessApi;
