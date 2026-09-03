/**
 * Centralised route constants.
 * Use these everywhere instead of raw string paths.
 */
export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",

  // User
  MY_DASHBOARD: "/my-dashboard",
  LINKS: "/links",
  ANALYTICS: "/analytics",
  NOTIFICATIONS: "/notifications",
  DOMAINS: "/domains",
  SETTINGS: "/settings",
  PROFILE: "/profile",

  // Admin only
  DASHBOARD: "/dashboard",
  USERS: "/users",
  ADMIN: "/admin",
  ADMIN_HEALTH: "/admin/health",
  ADMIN_WORKSPACE: "/admin/workspace",
  ADMIN_ANALYTICS: "/admin/analytics",
} as const;

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];
