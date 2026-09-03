import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { adminService } from "@/features/admin/services/admin.service";
import type { AdminOverview } from "@/features/admin/types/admin.types";

type AdminState = {
  data: AdminOverview | null;
  isLoading: boolean;
  error: string | null;
};
const initialState: AdminState = { data: null, isLoading: false, error: null };
export const fetchAdminOverview = createAsyncThunk<
  AdminOverview,
  void,
  { rejectValue: string }
>("admin/fetchOverview", async (_, { rejectWithValue }) => {
  try {
    return (await adminService.getOverview()).data;
  } catch (error) {
    return rejectWithValue(
      (error as { message?: string }).message ??
        "Unable to load admin overview.",
    );
  }
});
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdminOverview.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminOverview.fulfilled, (state, action) => {
      state.data = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchAdminOverview.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload ?? "Unable to load admin overview.";
    });
  },
});
export const { clearAdminError } = adminSlice.actions;
export const adminReducer = adminSlice.reducer;
export const selectAdminOverview = (state: RootState) => state.admin.data;
export const selectAdminLoading = (state: RootState) => state.admin.isLoading;
export const selectAdminError = (state: RootState) => state.admin.error;
