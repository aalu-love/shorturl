import type { ApiResponse } from "@/api/types";

export type AdminLinkStatus = "active" | "archived";

export type AdminLink = {
  id: string;
  short_code: string;
  short_url: string;
  original_url: string;
  title: string | null;
  domain: string;
  click_count: number;
  is_active: boolean;
  health_status: "ok" | "warn" | "error" | "unknown";
  created_at: string;
  owner_id: string | null;
  owner_name: string | null;
  owner_email: string | null;
};

export type AdminLinkList = {
  links: AdminLink[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminLinkListParams = {
  search?: string;
  status?: AdminLinkStatus;
  limit?: number;
  offset?: number;
};

export type AdminLinkModerationRequest = { action: "archive" | "restore" };
export type AdminLinkListResponse = ApiResponse<AdminLinkList>;
export type AdminLinkModerationResponse = ApiResponse<
  Pick<AdminLink, "id" | "short_code" | "is_active">
>;
