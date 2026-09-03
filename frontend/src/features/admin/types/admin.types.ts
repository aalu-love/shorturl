import type { ApiResponse } from "@/api/types";

export type AdminPlanCount = {
  name: "Free" | "Pro" | "Business";
  count: number;
};
export type AdminActivity = {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
};
export type AdminTopLink = {
  id: string;
  short_code: string;
  short_url: string;
  original_url: string;
  click_count: number;
};
export type AdminOverview = {
  total_users: number;
  new_users: number;
  total_links: number;
  total_clicks: number;
  avg_ctr: number;
  active_domains: number;
  plan_distribution: AdminPlanCount[];
  activity: AdminActivity[];
  top_links: AdminTopLink[];
};
export type AdminOverviewResponse = ApiResponse<AdminOverview>;
