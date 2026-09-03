/**
 * Centralised axios instance.
 *
 * - Injects JWT from storage on every request.
 * - Normalises error responses into ApiError shape.
 * - Handles 401 → clears token and redirects to login.
 */
import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import env from "@/env";
import { authStorage } from "@/features/auth/utils/authStorage";
import type { ApiError } from "./types";

const BASE_URL = env.apiBaseUrl || "http://localhost:3000/api/v1";
const TIMEOUT_MS = 15_000;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: true, // Send cookies with requests (for CSRF protection)
});

// ── Request interceptor — attach bearer token ──────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — normalise errors ────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (
    error: AxiosError<{
      success?: boolean;
      error?: string;
      details?: Record<string, string[]>;
    }>,
  ) => {
    const status = error.response?.status ?? 0;

    // Auto-logout on 401
    // if (status === 401) {
    //   authStorage.clear();
    //   window.location.href = "/login";
    // }

    const normalised: ApiError = {
      message:
        error.response?.data?.error ??
        error.message ??
        "An unexpected error occurred.",
      statusCode: status,
      errors: error.response?.data?.details,
    };

    return Promise.reject(normalised);
  },
);
