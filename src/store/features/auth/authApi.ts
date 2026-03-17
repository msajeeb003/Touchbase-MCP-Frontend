import { baseApi } from "@/store/api/baseApi";
import type { RegisterRequestBody, RegisterResponse } from "@/types/auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequestBody>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      })
    }),
  }),
});

export const { useRegisterMutation } = authApi;
