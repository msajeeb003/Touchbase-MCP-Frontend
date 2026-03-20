import { baseApi } from "@/store/api/baseApi";
import type {
  CreateSequenceRequestBody,
  CreateSequenceResponse,
  GetSequencesResponse,
} from "@/types/sequences";

export const sequencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSequences: builder.query<GetSequencesResponse, void>({
      query: () => ({
        url: "/sequences",
        method: "GET",
      }),
      providesTags: ["Sequences"],
    }),
    createSequence: builder.mutation<CreateSequenceResponse, CreateSequenceRequestBody>({
      query: (body) => ({
        url: "/sequences",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sequences"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSequencesQuery, useCreateSequenceMutation } = sequencesApi;
