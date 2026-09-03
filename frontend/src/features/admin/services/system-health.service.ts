import { apiClient } from "@/api/client";
import type { SystemHealthResponse } from "@/features/admin/types/system-health.types";

export const systemHealthService = {
  async get(): Promise<SystemHealthResponse> {
    const { data } = await apiClient.get<SystemHealthResponse>("/admin/health");
    return {
      ...data,
      data: {
        ...data.data,
        uptime_seconds: Number(data.data.uptime_seconds) || 0,
        services: data.data.services.map((service) => ({
          ...service,
          latency_ms: Number(service.latency_ms) || 0,
        })),
      },
    };
  },
};
