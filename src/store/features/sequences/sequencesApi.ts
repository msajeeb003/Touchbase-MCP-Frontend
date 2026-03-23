import { baseApi } from "@/store/api/baseApi";
import type {
  CreateSequenceStepRequestBody,
  CreateSequenceStepResponse,
  CreateSequenceRequestBody,
  CreateSequenceResponse,
  DeleteSequenceStepResponse,
  DeleteSequenceResponse,
  GenerateSequenceStepContentResponse,
  GetSequencesResponse,
  GetSequenceStepsResponse,
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
    getSequenceSteps: builder.query<GetSequenceStepsResponse, string>({
      query: (sequenceId) => ({
        url: `/sequences/${sequenceId}/steps`,
        method: "GET",
      }),
      providesTags: ["Sequences"],
    }),
    createSequenceStep: builder.mutation<
      CreateSequenceStepResponse,
      { sequenceId: string; body: CreateSequenceStepRequestBody }
    >({
      query: ({ sequenceId, body }) => ({
        url: `/sequences/${sequenceId}/steps`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sequences"],
    }),
    deleteSequenceStep: builder.mutation<
      DeleteSequenceStepResponse,
      { sequenceId: string; stepId: string }
    >({
      query: ({ sequenceId, stepId }) => ({
        url: `/sequences/${sequenceId}/steps/${stepId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sequences"],
    }),
    generateSequenceStepContent: builder.mutation<
      GenerateSequenceStepContentResponse,
      { sequenceId: string; stepId: string }
    >({
      query: ({ sequenceId, stepId }) => ({
        url: `/sequences/${sequenceId}/steps/${stepId}/generate`,
        method: "POST",
      }),
      invalidatesTags: ["Sequences"],
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
  useGetSequenceStepsQuery,
  useCreateSequenceStepMutation,
  useDeleteSequenceStepMutation,
  useGenerateSequenceStepContentMutation,
  useCreateSequenceMutation,
  useUpdateSequenceMutation,
  useDeleteSequenceMutation,
} = sequencesApi;
