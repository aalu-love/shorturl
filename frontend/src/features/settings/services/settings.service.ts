import { apiClient } from "@/api/client";
import type {
  UpdateWorkspaceSettingsRequest,
  WorkspaceSettings,
  WorkspaceSettingsResponse,
} from "@/features/settings/types/settings.types";

export const settingsService = {
  async get(): Promise<WorkspaceSettingsResponse> {
    const { data } =
      await apiClient.get<WorkspaceSettingsResponse>("/settings");
    return data;
  },

  async update(
    request: UpdateWorkspaceSettingsRequest,
  ): Promise<WorkspaceSettingsResponse> {
    const { data } = await apiClient.patch<WorkspaceSettingsResponse>(
      "/settings",
      request,
    );
    return data;
  },
};
