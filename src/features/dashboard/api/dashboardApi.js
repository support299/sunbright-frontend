import { dashboardQueryUrl } from "../../../lib/dashboardQuery";
import { apiSlice } from "../../../store/api/apiSlice";

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOverview: builder.query({
      query: (filterParams) => dashboardQueryUrl("/dashboard/overview/", filterParams),
      providesTags: ["Dashboard"],
    }),
    getCategoryBreakdown: builder.query({
      query: (filterParams) => dashboardQueryUrl("/dashboard/category-breakdown/", filterParams),
      providesTags: ["Dashboard"],
    }),
    getCancellationReasons: builder.query({
      query: (filterParams) => dashboardQueryUrl("/dashboard/cancellation-reasons/", filterParams),
      providesTags: ["Dashboard"],
    }),
    getOnHoldReasons: builder.query({
      query: (filterParams) => dashboardQueryUrl("/dashboard/on-hold-reasons/", filterParams),
      providesTags: ["Dashboard"],
    }),
    getCleanDeals: builder.query({
      query: (filterParams) => dashboardQueryUrl("/clean-deals/", filterParams),
      providesTags: ["Dashboard"],
    }),
    getRetention: builder.query({
      query: (filterParams) => dashboardQueryUrl("/retention/", filterParams),
      providesTags: ["Dashboard"],
    }),
    getPerformance: builder.query({
      query: (filterParams) => dashboardQueryUrl("/performance/", filterParams),
      providesTags: ["Dashboard"],
    }),
    getPipeline: builder.query({
      query: (filterParams) => dashboardQueryUrl("/pipeline/", filterParams),
      providesTags: ["Dashboard"],
    }),
    getOnHoldProjects: builder.query({
      query: (filterParams) => dashboardQueryUrl("/projects/on-hold/", filterParams),
      providesTags: ["Project"],
    }),
    getCancelledProjects: builder.query({
      query: (filterParams) => dashboardQueryUrl("/projects/cancelled/", filterParams),
      providesTags: ["Project"],
    }),
    getCustomerExperience: builder.query({
      query: (filterParams) => dashboardQueryUrl("/cx/", filterParams),
      providesTags: ["Dashboard"],
    }),
    getManagerPerformance: builder.query({
      query: (filterParams) => dashboardQueryUrl("/manager/", filterParams),
      providesTags: ["Dashboard"],
    }),
    generateInsights: builder.mutation({ query: (body) => ({ url: "/insights/generate/", method: "POST", body }) }),
    getSyncStatus: builder.query({ query: () => "/sync/", providesTags: ["Dashboard"] }),
    triggerSync: builder.mutation({ query: () => ({ url: "/sync/", method: "POST" }), invalidatesTags: ["Dashboard"] }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetCategoryBreakdownQuery,
  useGetCancellationReasonsQuery,
  useGetOnHoldReasonsQuery,
  useGetCleanDealsQuery,
  useGetRetentionQuery,
  useGetPerformanceQuery,
  useGetPipelineQuery,
  useGetOnHoldProjectsQuery,
  useGetCancelledProjectsQuery,
  useGetCustomerExperienceQuery,
  useGetManagerPerformanceQuery,
  useGenerateInsightsMutation,
  useGetSyncStatusQuery,
  useTriggerSyncMutation,
} = dashboardApi;
