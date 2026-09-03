/**
 * Encapsulates all auth-related localStorage reads/writes.
 * No component should access localStorage for auth data directly.
 */
const ACCESS_TOKEN_KEY = "shorturl.access_token";
const REFRESH_TOKEN_KEY = "shorturl.refresh_token";
const USER_KEY = "shorturl.user";
const USER_ROLE_KEY = "shorturl.role";

export const authStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getUserRole(): string | null {
    return localStorage.getItem(USER_ROLE_KEY);
  },
  setUserRole(role: string): void {
    localStorage.setItem(USER_ROLE_KEY, role);
  },

  getUser<T = unknown>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setUser(user: unknown): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /** Remove all auth data from storage. */
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
  },
};
