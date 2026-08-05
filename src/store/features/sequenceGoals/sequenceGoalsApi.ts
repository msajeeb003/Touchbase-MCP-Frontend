import { baseApi } from "@/store/api/baseApi";
import type {
  CreateSequenceGoalRequestBody,
  CreateSequenceGoalResponse,
  DeleteSequenceGoalResponse,
  GetSequenceGoalByIdResponse,
  GetSequenceGoalsResponse,
  UpdateSequenceGoalRequestBody,
  UpdateSequenceGoalResponse,
} from "@/types/sequenceGoals";

export const sequenceGoalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSequenceGoals: builder.query<GetSequenceGoalsResponse, void>({
      query: () => ({
        url: "/sequence-goals",
        method: "GET",
      }),
      providesTags: ["SequenceGoals"],
    }),
    getSequenceGoalById: builder.query<GetSequenceGoalByIdResponse, string>({
      query: (id) => ({
        url: `/sequence-goals/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "SequenceGoals", id }],
    }),
    createSequenceGoal: builder.mutation<
      CreateSequenceGoalResponse,
      CreateSequenceGoalRequestBody
    >({
      query: (body) => ({
        url: "/sequence-goals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SequenceGoals"],
    }),
    updateSequenceGoal: builder.mutation<
      UpdateSequenceGoalResponse,
      { id: string; body: UpdateSequenceGoalRequestBody }
    >({
      query: ({ id, body }) => ({
        url: `/sequence-goals/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["SequenceGoals"],
    }),
    deleteSequenceGoal: builder.mutation<DeleteSequenceGoalResponse, string>({
      query: (id) => ({
        url: `/sequence-goals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SequenceGoals"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSequenceGoalsQuery,
  useGetSequenceGoalByIdQuery,
  useLazyGetSequenceGoalByIdQuery,
  useCreateSequenceGoalMutation,
  useUpdateSequenceGoalMutation,
  useDeleteSequenceGoalMutation,
} = sequenceGoalsApi;
