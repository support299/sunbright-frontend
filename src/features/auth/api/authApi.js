import { apiSlice } from "../../../store/api/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login/", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    googleLogin: builder.mutation({
      query: (body) => ({ url: "/auth/google/", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useGoogleLoginMutation } = authApi;
