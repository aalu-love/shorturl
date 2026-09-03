/**
 * Dashboard Service - This service provides functions to fetch and manage dashboard-related data for the user.
 * It encapsulates all API calls related to the dashboard, ensuring that components and hooks interact with the service instead of calling the API client directly.
 */

import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  DashboardData,
  CreateDashboardUrlRequest,
  CreateDashboardUrlResponse,
  DashboardStats,
  DashboardStatsResponse,
  DashboardUrl,
  DashboardUrlListResponse,
  DashboardRecentClicksResponse,
} from "@/features/dashboard/types/dashboard.types";

const normaliseUrl = (url: DashboardUrl): DashboardUrl => ({
  ...url,
  click_count: Number(url.click_count) || 0,
});

export const dashboardService = {
  async shortenUrl(
    request: CreateDashboardUrlRequest,
  ): Promise<CreateDashboardUrlResponse> {
    const { data } = await apiClient.post<CreateDashboardUrlResponse>(
      "/urls",
      request,
    );
    return {
      ...data,
      data: normaliseUrl(data.data),
    };
  },

  async getStats(): Promise<DashboardStatsResponse> {
    const { data } = await apiClient.get<DashboardStatsResponse>(
      "/analytics/dashboard",
    );
    return data;
  },

  async getUrls(
    params: { limit?: number; offset?: number } = {},
  ): Promise<DashboardUrlListResponse> {
    const { data } = await apiClient.get<DashboardUrlListResponse>("/urls", {
      params: {
        limit: params.limit ?? 5,
        offset: params.offset ?? 0,
      },
    });

    return {
      ...data,
      data: {
        ...data.data,
        urls: data.data.urls.map(normaliseUrl),
      },
    };
  },

  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    const { data } = await apiClient.get<ApiResponse<DashboardData>>(
      "/dashboard",
      { params: { limit: 5, offset: 0 } },
    );
    return data;
  },

  async getRecentClicks(limit = 6): Promise<DashboardRecentClicksResponse> {
    const { data } = await apiClient.get<DashboardRecentClicksResponse>(
      "/dashboard/recent-clicks",
      { params: { limit } },
    );
    return data;
  },
};
