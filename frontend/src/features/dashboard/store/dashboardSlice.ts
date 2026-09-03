import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import type {
  CreateDashboardUrlRequest,
  DashboardData,
  DashboardRecentClick,
} from "@/features/dashboard/types/dashboard.types";

type DashboardState = {
  data: DashboardData | null;
  recentClicks: DashboardRecentClick[];
  isLoading: boolean;
  recentClicksLoading: boolean;
  error: string | null;
};

const initialState: DashboardState = {
  data: null,
  recentClicks: [],
  isLoading: false,
  recentClicksLoading: false,
  error: null,
};

export const fetchDashboard = createAsyncThunk<
  DashboardData,
  void,
  { rejectValue: string }
>("dashboard/fetchDashboard", async (_, { rejectWithValue }) => {
  try {
    const response = await dashboardService.getDashboardData();
    return response.data;
  } catch (error) {
    const apiError = error as { message?: string };
    return rejectWithValue(
      apiError.message ?? "Unable to load dashboard data.",
    );
  }
});

export const shortenUrl = createAsyncThunk<
  void,
  CreateDashboardUrlRequest,
  { rejectValue: string }
>("dashboard/shortenUrl", async (request, { dispatch, rejectWithValue }) => {
  try {
    await dashboardService.shortenUrl(request);
    dispatch(fetchDashboard());
    return;
  } catch (error) {
    const apiError = error as { message?: string };
    return rejectWithValue(apiError.message ?? "Unable to shorten URL.");
  }
});

export const fetchRecentClicks = createAsyncThunk<
  DashboardRecentClick[],
  void,
  { rejectValue: string }
>("dashboard/fetchRecentClicks", async (_, { rejectWithValue }) => {
  try {
    const response = await dashboardService.getRecentClicks();
    return response.data;
  } catch (error) {
    const apiError = error as { message?: string };
    return rejectWithValue(apiError.message ?? "Unable to load recent clicks.");
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = null;
    },
    setDashboardData(state, action: PayloadAction<DashboardData>) {
      state.data = action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load dashboard data.";
      })
      .addCase(shortenUrl.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(shortenUrl.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(shortenUrl.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unable to shorten URL.";
      })
      .addCase(fetchRecentClicks.pending, (state) => {
        state.recentClicksLoading = true;
      })
      .addCase(fetchRecentClicks.fulfilled, (state, action) => {
        state.recentClicks = action.payload;
        state.recentClicksLoading = false;
      })
      .addCase(fetchRecentClicks.rejected, (state, action) => {
        state.recentClicksLoading = false;
        state.error = action.payload ?? "Unable to load recent clicks.";
      });
  },
});

export const { clearDashboardError, setDashboardData } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;

export const selectDashboard = (state: RootState) => state.dashboard.data;
export const selectDashboardLoading = (state: RootState) =>
  state.dashboard.isLoading;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
export const selectRecentClicks = (state: RootState) =>
  state.dashboard.recentClicks;
export const selectRecentClicksLoading = (state: RootState) =>
  state.dashboard.recentClicksLoading;
