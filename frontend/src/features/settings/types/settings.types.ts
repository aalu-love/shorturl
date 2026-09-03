import type { ApiResponse } from "@/api/types";

export type WorkspaceSettings = {
  workspace_name: string;
  default_domain: string;
  require_sso: boolean;
  public_analytics: boolean;
};

export type UpdateWorkspaceSettingsRequest = Partial<WorkspaceSettings>;
export type WorkspaceSettingsResponse = ApiResponse<WorkspaceSettings>;
