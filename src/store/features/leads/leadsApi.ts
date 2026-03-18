import { baseApi } from "@/store/api/baseApi";
import type {
  CreateLeadRequestBody,
  CreateLeadResponse,
  GetLeadsQueryParams,
  GetLeadsResponse,
} from "@/types/leads";

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
    createLead: builder.mutation<CreateLeadResponse, CreateLeadRequestBody>({
      query: (body) => ({
        url: "/leads",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Leads"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLeadsQuery, useCreateLeadMutation } = leadsApi;
