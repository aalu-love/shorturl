import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  ChangePasswordRequest,
  Profile,
  ProfileResponse,
  UpdateProfileRequest,
} from "@/features/profile/types/profile.types";

const normaliseProfile = (profile: Profile): Profile => ({
  ...profile,
  id: String(profile.id),
  two_factor_enabled: Boolean(profile.two_factor_enabled),
});

export const profileService = {
  async get(): Promise<ProfileResponse> {
    const { data } = await apiClient.get<ProfileResponse>("/profile");
    return { ...data, data: normaliseProfile(data.data) };
  },

  async update(request: UpdateProfileRequest): Promise<ProfileResponse> {
    const { data } = await apiClient.patch<ProfileResponse>(
      "/profile",
      request,
    );
    return { ...data, data: normaliseProfile(data.data) };
  },

  async changePassword(
    request: ChangePasswordRequest,
  ): Promise<ApiResponse<null>> {
    const { data } = await apiClient.patch<ApiResponse<null>>(
      "/profile/password",
      request,
    );
    return data;
  },
};
