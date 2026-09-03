/**
 * RTK Query base API.
 *
 * All feature-specific APIs should inject into this base using
 * `baseApi.injectEndpoints(...)` — this keeps a single shared cache
 * and avoids duplicate middleware registration.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import env from "@/env";
import { authStorage } from "@/features/auth/utils/authStorage";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: env.apiBaseUrl || "/api",
    prepareHeaders: (headers) => {
      const token = authStorage.getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // Global cache tag list — feature endpoints add their own tags.
  tagTypes: ["Link", "User", "Domain", "Analytics", "Notification"],
  endpoints: () => ({}),
});
