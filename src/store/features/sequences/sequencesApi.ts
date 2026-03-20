import { baseApi } from "@/store/api/baseApi";
import type {
  CreateSequenceRequestBody,
  CreateSequenceResponse,
  DeleteSequenceResponse,
  GetSequencesResponse,
  GetSingleSequenceResponse,
  UpdateSequenceRequestBody,
  UpdateSequenceResponse,
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
    getSingleSequence: builder.query<GetSingleSequenceResponse, string>({
      query: (id) => ({
        url: `/sequences/${id}`,
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
    updateSequence: builder.mutation<
      UpdateSequenceResponse,
      { id: string; body: UpdateSequenceRequestBody }
    >({
      query: ({ id, body }) => ({
        url: `/sequences/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Sequences"],
    }),
    deleteSequence: builder.mutation<DeleteSequenceResponse, string>({
      query: (id) => ({
        url: `/sequences/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sequences"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSequencesQuery,
  useGetSingleSequenceQuery,
  useCreateSequenceMutation,
  useUpdateSequenceMutation,
  useDeleteSequenceMutation,
} = sequencesApi;
