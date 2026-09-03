import { apiClient } from "@/api/client";
import type {
  AdminLinkListParams,
  AdminLinkListResponse,
  AdminLinkModerationRequest,
  AdminLinkModerationResponse,
} from "@/features/admin/types/admin-links.types";

export const adminLinksService = {
  async list(params: AdminLinkListParams = {}): Promise<AdminLinkListResponse> {
    const { data } = await apiClient.get<AdminLinkListResponse>(
      "/admin/links",
      {
        params: {
          limit: params.limit ?? 20,
          offset: params.offset ?? 0,
          ...params,
        },
      },
    );
    return {
      ...data,
      data: {
        ...data.data,
        links: data.data.links.map((link) => ({
          ...link,
          id: String(link.id),
          click_count: Number(link.click_count) || 0,
        })),
      },
    };
  },

  async moderate(
    id: string,
    request: AdminLinkModerationRequest,
  ): Promise<AdminLinkModerationResponse> {
    const { data } = await apiClient.patch<AdminLinkModerationResponse>(
      `/admin/links/${encodeURIComponent(id)}/moderation`,
      request,
    );
    return data;
  },
};
