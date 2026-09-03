import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  CreateLinkRequest,
  DeleteLinkResponse,
  LinkListResponse,
  LinkRecord,
  LinkResponse,
  UpdateLinkRequest,
  BulkMilestoneRequest,
  HealthCheckResult,
  BulkHealthCheckResponse,
} from "@/features/links/types/links.types";

const normaliseLink = (link: LinkRecord): LinkRecord => ({
  ...link,
  click_count: Number(link.click_count) || 0,
});

export const linksService = {
  async list(params: { limit?: number; offset?: number } = {}) {
    const { data } = await apiClient.get<LinkListResponse>("/urls", {
      params: {
        limit: params.limit ?? 20,
        offset: params.offset ?? 0,
      },
    });

    return {
      ...data,
      data: {
        ...data.data,
        urls: data.data.urls.map(normaliseLink),
      },
    };
  },

  async create(request: CreateLinkRequest): Promise<LinkResponse> {
    const { data } = await apiClient.post<LinkResponse>("/urls", request);
    return {
      ...data,
      data: normaliseLink(data.data),
    };
  },

  async remove(shortCode: string): Promise<DeleteLinkResponse> {
    const { data } = await apiClient.delete<DeleteLinkResponse>(
      `/urls/${encodeURIComponent(shortCode)}`,
    );
    return data;
  },

  async update(
    shortCode: string,
    request: UpdateLinkRequest,
  ): Promise<LinkResponse> {
    const { data } = await apiClient.patch<LinkResponse>(
      `/urls/${encodeURIComponent(shortCode)}`,
      request,
    );
    return {
      ...data,
      data: normaliseLink(data.data),
    };
  },

  async checkHealth(
    shortCode: string,
  ): Promise<ApiResponse<HealthCheckResult>> {
    const { data } = await apiClient.post<ApiResponse<HealthCheckResult>>(
      `/urls/${encodeURIComponent(shortCode)}/health-check`,
    );
    return data;
  },

  async checkAllHealth(
    shortCodes?: string[],
  ): Promise<BulkHealthCheckResponse> {
    const { data } = await apiClient.post<BulkHealthCheckResponse>(
      "/urls/health-check",
      shortCodes?.length ? { short_codes: shortCodes } : {},
    );
    return data;
  },

  async updateMilestones(
    request: BulkMilestoneRequest,
  ): Promise<ApiResponse<unknown[]>> {
    const { data } = await apiClient.patch<ApiResponse<unknown[]>>(
      "/urls/milestones",
      request,
    );
    return data;
  },
};
