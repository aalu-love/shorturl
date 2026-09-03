import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { adminLinksService } from "@/features/admin/services/admin-links.service";
import type {
  AdminLink,
  AdminLinkListParams,
} from "@/features/admin/types/admin-links.types";

type AdminLinksState = {
  items: AdminLink[];
  total: number;
  limit: number;
  offset: number;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
};
const initialState: AdminLinksState = {
  items: [],
  total: 0,
  limit: 20,
  offset: 0,
  isLoading: false,
  isMutating: false,
  error: null,
};
const errorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string }).message ?? fallback;

export const fetchAdminLinks = createAsyncThunk<
  { items: AdminLink[]; total: number; limit: number; offset: number },
  AdminLinkListParams | undefined,
  { rejectValue: string }
>("adminLinks/fetch", async (params, { rejectWithValue }) => {
  try {
    const response = await adminLinksService.list(params);
    return {
      items: response.data.links,
      total: response.data.total,
      limit: response.data.limit,
      offset: response.data.offset,
    };
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to load admin links."));
  }
});

export const archiveAdminLink = createAsyncThunk<
  { id: string; is_active: boolean },
  { id: string; action: "archive" | "restore" },
  { rejectValue: string }
>(
  "adminLinks/moderate",
  async ({ id, action }, { dispatch, rejectWithValue }) => {
    try {
      const response = await adminLinksService.moderate(id, { action });
      dispatch(fetchAdminLinks());
      return response.data;
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Unable to moderate link."));
    }
  },
);

const adminLinksSlice = createSlice({
  name: "adminLinks",
  initialState,
  reducers: {
    clearAdminLinksError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminLinks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminLinks.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.isLoading = false;
      })
      .addCase(fetchAdminLinks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load admin links.";
      })
      .addCase(archiveAdminLink.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(archiveAdminLink.fulfilled, (state) => {
        state.isMutating = false;
      })
      .addCase(archiveAdminLink.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to moderate link.";
      });
  },
});
export const { clearAdminLinksError } = adminLinksSlice.actions;
export const adminLinksReducer = adminLinksSlice.reducer;
export const selectAdminLinks = (state: RootState) => state.adminLinks.items;
export const selectAdminLinksTotal = (state: RootState) =>
  state.adminLinks.total;
export const selectAdminLinksLoading = (state: RootState) =>
  state.adminLinks.isLoading;
export const selectAdminLinksMutating = (state: RootState) =>
  state.adminLinks.isMutating;
export const selectAdminLinksError = (state: RootState) =>
  state.adminLinks.error;
