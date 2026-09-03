import { apiClient } from "@/api/client";
import type {
  CreateDomainRequest,
  DomainListResponse,
  DomainRecord,
  DomainResponse,
} from "@/features/domains/types/domains.types";

const normaliseDomain = (domain: DomainRecord): DomainRecord => ({
  ...domain,
  id: String(domain.id),
  links_count: Number(domain.links_count) || 0,
});

export const domainsService = {
  async list(): Promise<DomainListResponse> {
    const { data } = await apiClient.get<DomainListResponse>("/domains");
    return { ...data, data: data.data.map(normaliseDomain) };
  },

  async create(request: CreateDomainRequest): Promise<DomainResponse> {
    const { data } = await apiClient.post<DomainResponse>("/domains", request);
    return { ...data, data: normaliseDomain(data.data) };
  },

  async verify(id: string): Promise<DomainResponse> {
    const { data } = await apiClient.post<DomainResponse>(
      `/domains/${encodeURIComponent(id)}/verify`,
    );
    return { ...data, data: normaliseDomain(data.data) };
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/domains/${encodeURIComponent(id)}`);
  },
};
