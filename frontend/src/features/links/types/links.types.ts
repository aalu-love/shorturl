import type { ApiResponse } from "@/api/types";

export type LinkRecord = {
  id: string;
  short_code: string;
  original_url: string;
  title: string | null;
  expires_at: string | null;
  click_count: number;
  created_at: string;
  short_url: string;
  tags: string[];
  note: string | null;
  mobile_url: string | null;
  scheduled_from: string | null;
  scheduled_until: string | null;
  fallback_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  pinned: boolean;
  health_status: "ok" | "warn" | "error" | "unknown";
  health_checked_at: string | null;
  milestone_threshold: number;
  last_clicked_at: string | null;
};

export type LinkList = {
  urls: LinkRecord[];
  total: number;
  limit: number;
  offset: number;
};

export type CreateLinkRequest = {
  original_url: string;
  domain?: string;
  custom_code?: string;
  expires_at?: string;
  title?: string;
  tags?: string[];
  note?: string;
  mobile_url?: string;
  scheduled_from?: string;
  scheduled_until?: string;
  fallback_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  milestone_threshold?: number;
};

export type UpdateLinkRequest = Partial<
  Omit<CreateLinkRequest, "custom_code">
> & {
  pinned?: boolean;
};

export type LinkListResponse = ApiResponse<LinkList>;
export type LinkResponse = ApiResponse<LinkRecord>;
export type DeleteLinkResponse = ApiResponse<void>;
export type HealthCheckResult = Pick<
  LinkRecord,
  "short_code" | "health_status" | "health_checked_at"
>;
export type BulkHealthCheckResponse = ApiResponse<HealthCheckResult[]>;
export type BulkMilestoneRequest = {
  milestones: Array<{
    short_code: string;
    milestone_threshold: number;
  }>;
};
