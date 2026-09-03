import type { ApiResponse } from "@/api/types";

export type DashboardStats = {
  total_urls: number;
  total_clicks: number;
  top_url_clicks: number;
  avg_daily_clicks: number;
};

export type DashboardUrl = {
  id: string;
  short_code: string;
  original_url: string;
  title: string | null;
  expires_at: string | null;
  click_count: number;
  created_at: string;
  short_url: string;
};

export type DashboardUrlList = {
  urls: DashboardUrl[];
  total: number;
  limit: number;
  offset: number;
};

export type DashboardData = DashboardStats & DashboardUrlList;

export type DashboardStatsResponse = ApiResponse<DashboardStats>;
export type DashboardUrlListResponse = ApiResponse<DashboardUrlList>;
export type CreateDashboardUrlRequest = {
  original_url: string;
  title?: string;
};
export type CreateDashboardUrlResponse = ApiResponse<DashboardUrl>;

export type DashboardRecentClick = {
  id: string;
  short_code: string;
  short_url: string;
  location: string;
  device: string;
  referer: string;
  user_agent: string | null;
  created_at: string;
};

export type DashboardRecentClicksResponse = ApiResponse<DashboardRecentClick[]>;
