import { baseApi } from "@/store/api/baseApi";
import type { GetLeadsQueryParams, GetLeadsResponse } from "@/types/leads";

const sanitizeQueryParams = (params: GetLeadsQueryParams) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<GetLeadsResponse, GetLeadsQueryParams>({
      query: (params) => ({
        url: "/leads",
        method: "GET",
        params: sanitizeQueryParams(params),
      }),
      providesTags: ["Leads"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLeadsQuery } = leadsApi;
