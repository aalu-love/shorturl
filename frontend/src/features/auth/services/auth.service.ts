/**
 * Auth service — encapsulates all auth API calls.
 * Components and hooks call this service; they never call apiClient directly.
 */
import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type {
  AuthTokens,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from "@/features/auth/types/auth.types";

type LoginResponse = ApiResponse<{
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}>;
type RegisterResponse = ApiResponse<{
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}>;
type RefreshResponse = ApiResponse<{ tokens: AuthTokens }>;

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials,
    );
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const { data } = await apiClient.post<RegisterResponse>(
      "/auth/register",
      credentials,
    );
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout").catch(() => {
      // Best-effort — always clear local state even if request fails
    });
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await apiClient.post<RefreshResponse>("/auth/refresh", {
      refreshToken,
    });
    return data;
  },

  async me(): Promise<ApiResponse<AuthUser>> {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
    return data;
  },
};
