/** Generic API response wrapper returned by all endpoints. */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

/** Paginated response for list endpoints. */
export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  limit: number;
}>;

/** Normalised error shape returned from the API. */
export type ApiError = {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
};

/** Generic filter / pagination query params. */
export type QueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};
