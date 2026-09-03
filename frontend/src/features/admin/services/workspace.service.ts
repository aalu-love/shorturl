import { apiClient } from "@/api/client";
import type {
  AdminAnnouncementRequest,
  AdminAnnouncementResponse,
  AdminAnalyticsQuery,
  AdminDomainsResponse,
  AdminWorkspaceAnalyticsResponse,
} from "@/features/admin/types/workspace.types";

export const workspaceAdminService = {
  async listDomains(): Promise<AdminDomainsResponse> {
    const { data } =
      await apiClient.get<AdminDomainsResponse>("/admin/domains");
    return data;
  },
  async verifyDomain(id: string): Promise<void> {
    await apiClient.post(`/admin/domains/${encodeURIComponent(id)}/verify`);
  },
  async removeDomain(id: string): Promise<void> {
    await apiClient.delete(`/admin/domains/${encodeURIComponent(id)}`);
  },
  async getAnalytics(
    query: AdminAnalyticsQuery = {},
  ): Promise<AdminWorkspaceAnalyticsResponse> {
    const { data } = await apiClient.get<AdminWorkspaceAnalyticsResponse>(
      "/admin/analytics",
      { params: query },
    );
    return data;
  },
  async announce(
    request: AdminAnnouncementRequest,
  ): Promise<AdminAnnouncementResponse> {
    const { data } = await apiClient.post<AdminAnnouncementResponse>(
      "/admin/announcements",
      request,
    );
    return data;
  },
};
