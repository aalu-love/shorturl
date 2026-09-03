import { apiClient } from "@/api/client";
import type { AdminOverviewResponse } from "@/features/admin/types/admin.types";

export const adminService = {
  async getOverview(): Promise<AdminOverviewResponse> {
    const { data } =
      await apiClient.get<AdminOverviewResponse>("/admin/overview");
    return {
      ...data,
      data: {
        ...data.data,
        total_users: Number(data.data.total_users) || 0,
        new_users: Number(data.data.new_users) || 0,
        total_links: Number(data.data.total_links) || 0,
        total_clicks: Number(data.data.total_clicks) || 0,
        avg_ctr: Number(data.data.avg_ctr) || 0,
        active_domains: Number(data.data.active_domains) || 0,
        plan_distribution: data.data.plan_distribution.map((plan) => ({
          ...plan,
          count: Number(plan.count) || 0,
        })),
        top_links: data.data.top_links.map((link) => ({
          ...link,
          id: String(link.id),
          click_count: Number(link.click_count) || 0,
        })),
      },
    };
  },
};
