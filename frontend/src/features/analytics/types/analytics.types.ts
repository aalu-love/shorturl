import type { ApiResponse } from "@/api/types";

export type AnalyticsTimeframe = "24h" | "7d" | "30d" | "90d" | "all";

export type AnalyticsQuery = {
  days?: number;
};

export type AnalyticsOverTime = {
  date: string;
  clicks: number;
  unique_visitors: number;
};

export type AnalyticsReferrer = {
  name: string;
  count: number;
  percentage: number;
  trend: number;
};

export type AnalyticsDevice = {
  name: "Mobile" | "Desktop" | "Tablet" | "Unknown";
  count: number;
  percentage: number;
};

export type AnalyticsTopLink = {
  id: string;
  short_code: string;
  short_url: string;
  original_url: string;
  tags: string[];
  clicks: number;
};

export type AnalyticsData = {
  period_days: number;
  total_clicks: number;
  unique_visitors: number;
  over_time: AnalyticsOverTime[];
  referrers: AnalyticsReferrer[];
  devices: AnalyticsDevice[];
  top_links: AnalyticsTopLink[];
};

export type AnalyticsResponse = ApiResponse<AnalyticsData>;
