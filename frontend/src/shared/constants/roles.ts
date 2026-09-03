export type Role = "public" | "private" | "admin" | "user";

export const ROLES: Record<string, Role> = {
  PUBLIC: "public",
  PRIVATE: "private",
  ADMIN: "admin",
  USER: "user",
};
