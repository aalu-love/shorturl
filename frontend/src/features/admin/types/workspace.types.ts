import type { ApiResponse } from "@/api/types";
import type { AnalyticsData } from "@/features/analytics/types/analytics.types";
import type { DomainStatus } from "@/features/domains/types/domains.types";

export type AdminDomain = {
  id: string;
  domain: string;
  status: DomainStatus;
  ssl_enabled: boolean;
  added_at: string;
  links_count: number;
  owner_id: string;
  owner_name: string | null;
  owner_email: string;
};

export type AdminAnnouncementRequest = {
  title: string;
  description: string;
  type?: "milestone" | "health" | "digest" | "schedule";
};

export type AdminAnalyticsQuery = {
  days?: number;
  domain?: string;
  user_id?: string;
};

export type AdminWorkspaceAnalytics = AnalyticsData;
export type AdminDomainsResponse = ApiResponse<AdminDomain[]>;
export type AdminWorkspaceAnalyticsResponse =
  ApiResponse<AdminWorkspaceAnalytics>;
export type AdminAnnouncementResponse = ApiResponse<{ recipients: number }>;
