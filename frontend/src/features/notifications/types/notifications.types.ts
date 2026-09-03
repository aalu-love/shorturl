import type { ApiResponse } from "@/api/types";

export type NotificationType = "milestone" | "health" | "digest" | "schedule";

export type NotificationRecord = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  link_short_url: string | null;
  read: boolean;
  created_at: string;
};

export type NotificationListParams = {
  limit?: number;
  offset?: number;
};

export type NotificationPreferences = {
  digest_enabled: boolean;
  health_enabled: boolean;
  default_threshold: number;
};

export type NotificationList = {
  notifications: NotificationRecord[];
  unread: number;
  limit: number;
  offset: number;
};

export type NotificationListResponse = ApiResponse<NotificationList>;
export type NotificationPreferencesResponse =
  ApiResponse<NotificationPreferences>;
