import type { ApiResponse } from "@/api/types";

export type UserPlan = "Free" | "Pro" | "Business";
export type UserStatus = "active" | "invited" | "suspended";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  status: UserStatus;
  is_active: boolean;
  links_count: number;
  joined_at: string;
};

export type UserListQuery = {
  search?: string;
  limit?: number;
  offset?: number;
};
export type UserListResponse = ApiResponse<{
  users: UserRecord[];
  limit: number;
  offset: number;
}>;
export type UserRequest = {
  name: string;
  email: string;
  plan: UserPlan;
  status?: UserStatus;
};
export type UserResponse = ApiResponse<UserRecord>;
