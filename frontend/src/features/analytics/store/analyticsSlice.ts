import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { analyticsService } from "@/features/analytics/services/analytics.service";
import type {
  AnalyticsData,
  AnalyticsQuery,
} from "@/features/analytics/types/analytics.types";

type AnalyticsState = {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: AnalyticsState = {
  data: null,
  isLoading: false,
  error: null,
};

const errorMessage = (error: unknown) =>
  (error as { message?: string }).message ?? "Unable to load analytics.";

export const fetchAnalytics = createAsyncThunk<
  AnalyticsData,
  AnalyticsQuery | undefined,
  { rejectValue: string }
>("analytics/fetchOverview", async (query, { rejectWithValue }) => {
  try {
    return (await analyticsService.getOverview(query)).data;
  } catch (error) {
    return rejectWithValue(errorMessage(error));
  }
});

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load analytics.";
      });
  },
});

export const { clearAnalyticsError } = analyticsSlice.actions;
export const analyticsReducer = analyticsSlice.reducer;
export const selectAnalytics = (state: RootState) => state.analytics.data;
export const selectAnalyticsLoading = (state: RootState) =>
  state.analytics.isLoading;
export const selectAnalyticsError = (state: RootState) => state.analytics.error;
