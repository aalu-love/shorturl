import type { ApiResponse } from "@/api/types";

export type DomainStatus = "active" | "pending" | "error";

export type DomainRecord = {
  id: string;
  domain: string;
  status: DomainStatus;
  links_count: number;
  added_at: string;
  ssl_enabled: boolean;
};

export type CreateDomainRequest = {
  domain: string;
};

export type DomainListResponse = ApiResponse<DomainRecord[]>;
export type DomainResponse = ApiResponse<DomainRecord>;
