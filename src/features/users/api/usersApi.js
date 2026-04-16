import { apiSlice } from "../../../store/api/apiSlice";

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardUsers: builder.query({
      query: (params = {}) => ({
        url: "/users/",
        params: {
          page: params.page,
          page_size: params.pageSize,
          search: params.search || undefined,
        },
      }),
      providesTags: ["UserAdmin"],
    }),
    updateDashboardUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["UserAdmin"],
    }),
  }),
});

export const { useGetDashboardUsersQuery, useUpdateDashboardUserMutation } = usersApi;
