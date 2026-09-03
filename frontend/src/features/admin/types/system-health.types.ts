import type { ApiResponse } from "@/api/types";

export type HealthStatus = "operational" | "down";
export type OverallHealthStatus = "operational" | "degraded";

export type HealthService = {
  name: "api" | "postgresql" | "redis";
  status: HealthStatus;
  latency_ms: number;
  message?: string;
};

export type SystemHealth = {
  status: OverallHealthStatus;
  checked_at: string;
  uptime_seconds: number;
  services: HealthService[];
};

export type SystemHealthResponse = ApiResponse<SystemHealth>;
