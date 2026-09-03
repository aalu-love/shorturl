/**
 * API endpoint definitions injected into the base RTK Query API.
 *
 * Import `linksApi`, `usersApi`, etc. from here in feature slices and pages.
 */
import { baseApi } from "./baseApi";
import type { ApiResponse, PaginatedResponse, QueryParams } from "./types";

// ── Shared domain types (lightweight DTOs) ─────────────────────────────────
export type LinkDto = {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  domain: string;
  clicks: number;
  createdAt: string;
  tags: string[];
  status: "active" | "archived";
};

export type CreateLinkDto = {
  destination: string;
  domain: string;
  customBackHalf?: string;
  tags?: string[];
};

// ── Links API ──────────────────────────────────────────────────────────────
export const linksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLinks: build.query<PaginatedResponse<LinkDto>, QueryParams>({
      query: (params) => ({ url: "/links", params }),
      providesTags: ["Link"],
    }),
    getLinkById: build.query<ApiResponse<LinkDto>, string>({
      query: (id) => `/links/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Link", id }],
    }),
    createLink: build.mutation<ApiResponse<LinkDto>, CreateLinkDto>({
      query: (body) => ({ url: "/links", method: "POST", body }),
      invalidatesTags: ["Link"],
    }),
    updateLink: build.mutation<
      ApiResponse<LinkDto>,
      { id: string } & Partial<CreateLinkDto>
    >({
      query: ({ id, ...body }) => ({
        url: `/links/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "Link", id },
        "Link",
      ],
    }),
    deleteLink: build.mutation<ApiResponse<void>, string>({
      query: (id) => ({ url: `/links/${id}`, method: "DELETE" }),
      invalidatesTags: ["Link"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLinksQuery,
  useGetLinkByIdQuery,
  useCreateLinkMutation,
  useUpdateLinkMutation,
  useDeleteLinkMutation,
} = linksApi;
