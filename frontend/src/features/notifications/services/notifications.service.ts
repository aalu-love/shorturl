import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  NotificationListResponse,
  NotificationListParams,
  NotificationRecord,
  NotificationPreferences,
  NotificationPreferencesResponse,
} from "@/features/notifications/types/notifications.types";

const normaliseNotification = (
  notification: NotificationRecord,
): NotificationRecord => ({
  ...notification,
  id: String(notification.id),
});

export const notificationsService = {
  async list(params: NotificationListParams = {}) {
    const { data } = await apiClient.get<NotificationListResponse>(
      "/notifications",
      {
        params: {
          limit: params.limit ?? 50,
          offset: params.offset ?? 0,
        },
      },
    );
    return {
      ...data,
      data: {
        ...data.data,
        notifications: data.data.notifications.map(normaliseNotification),
        unread: Number(data.data.unread) || 0,
      },
    };
  },

  async markRead(id: string): Promise<ApiResponse<{ id: string }>> {
    const { data } = await apiClient.patch<ApiResponse<{ id: string }>>(
      `/notifications/${encodeURIComponent(id)}/read`,
    );
    return data;
  },

  async markAllRead(): Promise<ApiResponse<{ updated: number }>> {
    const { data } = await apiClient.patch<ApiResponse<{ updated: number }>>(
      "/notifications/read-all",
    );
    return data;
  },

  async dismiss(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `/notifications/${encodeURIComponent(id)}`,
    );
    return data;
  },

  async getPreferences(): Promise<NotificationPreferencesResponse> {
    const { data } = await apiClient.get<NotificationPreferencesResponse>(
      "/notifications/preferences",
    );
    return data;
  },

  async updatePreferences(
    preferences: NotificationPreferences,
  ): Promise<NotificationPreferencesResponse> {
    const { data } = await apiClient.patch<NotificationPreferencesResponse>(
      "/notifications/preferences",
      preferences,
    );
    return data;
  },
};
