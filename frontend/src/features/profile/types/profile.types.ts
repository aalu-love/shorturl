import type { ApiResponse } from "@/api/types";

export type Profile = {
  id: string;
  name: string | null;
  email: string;
  two_factor_enabled: boolean;
};

export type UpdateProfileRequest = {
  name?: string;
  email?: string;
  two_factor_enabled?: boolean;
};

export type ChangePasswordRequest = {
  current_password: string;
  new_password: string;
};

export type ProfileResponse = ApiResponse<Profile>;
