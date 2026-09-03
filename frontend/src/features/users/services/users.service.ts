import { apiClient } from "@/api/client";
import type {
  UserListQuery,
  UserListResponse,
  UserRequest,
  UserResponse,
} from "@/features/users/types/users.types";

const normaliseUser = (user: UserResponse["data"]) => ({
  ...user,
  id: String(user.id),
  links_count: Number(user.links_count) || 0,
});

export const usersService = {
  async list(query: UserListQuery = {}): Promise<UserListResponse> {
    const { data } = await apiClient.get<UserListResponse>("/admin/users", {
      params: query,
    });
    return {
      ...data,
      data: { ...data.data, users: data.data.users.map(normaliseUser) },
    };
  },
  async invite(request: UserRequest): Promise<UserResponse> {
    const { data } = await apiClient.post<UserResponse>(
      "/admin/users",
      request,
    );
    return { ...data, data: normaliseUser(data.data) };
  },
  async update(
    id: string,
    request: Partial<UserRequest>,
  ): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>(
      `/admin/users/${encodeURIComponent(id)}`,
      request,
    );
    return { ...data, data: normaliseUser(data.data) };
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${encodeURIComponent(id)}`);
  },
};
