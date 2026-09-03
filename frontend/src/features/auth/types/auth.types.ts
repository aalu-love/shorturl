import { Role } from "@/shared/constants/roles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  api_key: string;
  role: Role;
  is_active: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
  remember?: boolean;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

export type AuthState = {
  user: AuthUser | null;
  role: Role;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};
