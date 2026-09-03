import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { systemHealthService } from "@/features/admin/services/system-health.service";
import type { SystemHealth } from "@/features/admin/types/system-health.types";

type SystemHealthState = {
  data: SystemHealth | null;
  isLoading: boolean;
  error: string | null;
};
const initialState: SystemHealthState = {
  data: null,
  isLoading: false,
  error: null,
};

export const fetchSystemHealth = createAsyncThunk<
  SystemHealth,
  void,
  { rejectValue: string }
>("systemHealth/fetch", async (_, { rejectWithValue }) => {
  try {
    return (await systemHealthService.get()).data;
  } catch (error) {
    return rejectWithValue(
      (error as { message?: string }).message ??
        "Unable to load system health.",
    );
  }
});

const systemHealthSlice = createSlice({
  name: "systemHealth",
  initialState,
  reducers: {
    clearSystemHealthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemHealth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load system health.";
      });
  },
});

export const { clearSystemHealthError } = systemHealthSlice.actions;
export const systemHealthReducer = systemHealthSlice.reducer;
export const selectSystemHealth = (state: RootState) => state.systemHealth.data;
export const selectSystemHealthLoading = (state: RootState) =>
  state.systemHealth.isLoading;
export const selectSystemHealthError = (state: RootState) =>
  state.systemHealth.error;
