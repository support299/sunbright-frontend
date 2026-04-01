import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearCredentials, setCredentials } from "../authSlice";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

/** Refresh must not send Authorization: expired access tokens break JWT auth before the body is read. */
const refreshBaseQuery = fetchBaseQuery({ baseUrl });

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;
    if (refreshToken) {
      const refreshResult = await refreshBaseQuery(
        {
          url: "/auth/refresh/",
          method: "POST",
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data?.success && refreshResult.data?.data?.access) {
        const payload = refreshResult.data.data;
        const nextRefresh = payload.refresh ?? refreshToken;
        api.dispatch(
          setCredentials({
            access: payload.access,
            refresh: nextRefresh,
            user: api.getState().auth.user,
          })
        );
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearCredentials());
      }
    } else {
      api.dispatch(clearCredentials());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "Project", "Dashboard"],
  endpoints: () => ({}),
});
