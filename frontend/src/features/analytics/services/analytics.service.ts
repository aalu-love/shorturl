import { apiClient } from "@/api/client";
import type {
  AnalyticsData,
  AnalyticsQuery,
  AnalyticsResponse,
} from "@/features/analytics/types/analytics.types";

const normaliseAnalytics = (data: AnalyticsData): AnalyticsData => ({
  ...data,
  total_clicks: Number(data.total_clicks) || 0,
  unique_visitors: Number(data.unique_visitors) || 0,
  over_time: data.over_time.map((item) => ({
    ...item,
    clicks: Number(item.clicks) || 0,
    unique_visitors: Number(item.unique_visitors) || 0,
  })),
  referrers: data.referrers.map((item) => ({
    ...item,
    count: Number(item.count) || 0,
    percentage: Number(item.percentage) || 0,
    trend: Number(item.trend) || 0,
  })),
  devices: data.devices.map((item) => ({
    ...item,
    count: Number(item.count) || 0,
    percentage: Number(item.percentage) || 0,
  })),
  top_links: data.top_links.map((item) => ({
    ...item,
    id: String(item.id),
    clicks: Number(item.clicks) || 0,
  })),
});

export const analyticsService = {
  async getOverview(query: AnalyticsQuery = {}): Promise<AnalyticsResponse> {
    const { data } = await apiClient.get<AnalyticsResponse>("/analytics", {
      params: query,
    });
    return { ...data, data: normaliseAnalytics(data.data) };
  },
};
