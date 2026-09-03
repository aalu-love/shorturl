import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { workspaceAdminService } from "@/features/admin/services/workspace.service";
import type { AnalyticsData } from "@/features/analytics/types/analytics.types";
import type {
  AdminAnalyticsQuery,
  AdminAnnouncementRequest,
  AdminDomain,
} from "@/features/admin/types/workspace.types";

type WorkspaceState = {
  domains: AdminDomain[];
  analytics: AnalyticsData | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
};
const initialState: WorkspaceState = {
  domains: [],
  analytics: null,
  isLoading: false,
  isMutating: false,
  error: null,
};
const errorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string }).message ?? fallback;

export const fetchAdminDomains = createAsyncThunk<
  AdminDomain[],
  void,
  { rejectValue: string }
>("adminWorkspace/domains", async (_, { rejectWithValue }) => {
  try {
    return (await workspaceAdminService.listDomains()).data;
  } catch (error) {
    return rejectWithValue(
      errorMessage(error, "Unable to load workspace domains."),
    );
  }
});
export const verifyAdminDomain = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("adminWorkspace/verifyDomain", async (id, { dispatch, rejectWithValue }) => {
  try {
    await workspaceAdminService.verifyDomain(id);
    dispatch(fetchAdminDomains());
    return id;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to verify domain."));
  }
});
export const removeAdminDomain = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("adminWorkspace/removeDomain", async (id, { dispatch, rejectWithValue }) => {
  try {
    await workspaceAdminService.removeDomain(id);
    dispatch(fetchAdminDomains());
    return id;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to remove domain."));
  }
});
export const fetchWorkspaceAnalytics = createAsyncThunk<
  AnalyticsData,
  AdminAnalyticsQuery | undefined,
  { rejectValue: string }
>("adminWorkspace/analytics", async (days, { rejectWithValue }) => {
  try {
    return (await workspaceAdminService.getAnalytics(days)).data;
  } catch (error) {
    return rejectWithValue(
      errorMessage(error, "Unable to load workspace analytics."),
    );
  }
});
export const sendAdminAnnouncement = createAsyncThunk<
  { recipients: number },
  AdminAnnouncementRequest,
  { rejectValue: string }
>("adminWorkspace/announce", async (request, { rejectWithValue }) => {
  try {
    return (await workspaceAdminService.announce(request)).data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to send announcement."));
  }
});

const workspaceSlice = createSlice({
  name: "adminWorkspace",
  initialState,
  reducers: {
    clearWorkspaceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAdminDomains.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminDomains.fulfilled, (state, action) => {
      state.domains = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchAdminDomains.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload ?? "Unable to load workspace domains.";
    });
    builder.addCase(fetchWorkspaceAnalytics.fulfilled, (state, action) => {
      state.analytics = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchWorkspaceAnalytics.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchWorkspaceAnalytics.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload ?? "Unable to load workspace analytics.";
    });
    builder.addCase(verifyAdminDomain.pending, (state) => {
      state.isMutating = true;
    });
    builder.addCase(verifyAdminDomain.fulfilled, (state) => {
      state.isMutating = false;
    });
    builder.addCase(verifyAdminDomain.rejected, (state, action) => {
      state.isMutating = false;
      state.error = action.payload ?? "Unable to verify domain.";
    });
    builder.addCase(removeAdminDomain.pending, (state) => {
      state.isMutating = true;
    });
    builder.addCase(removeAdminDomain.fulfilled, (state) => {
      state.isMutating = false;
    });
    builder.addCase(removeAdminDomain.rejected, (state, action) => {
      state.isMutating = false;
      state.error = action.payload ?? "Unable to remove domain.";
    });
    builder.addCase(sendAdminAnnouncement.pending, (state) => {
      state.isMutating = true;
    });
    builder.addCase(sendAdminAnnouncement.fulfilled, (state) => {
      state.isMutating = false;
    });
    builder.addCase(sendAdminAnnouncement.rejected, (state, action) => {
      state.isMutating = false;
      state.error = action.payload ?? "Unable to send announcement.";
    });
  },
});
export const { clearWorkspaceError } = workspaceSlice.actions;
export const adminWorkspaceReducer = workspaceSlice.reducer;
export const selectAdminDomains = (state: RootState) =>
  state.adminWorkspace.domains;
export const selectWorkspaceAnalytics = (state: RootState) =>
  state.adminWorkspace.analytics;
export const selectWorkspaceLoading = (state: RootState) =>
  state.adminWorkspace.isLoading;
export const selectWorkspaceMutating = (state: RootState) =>
  state.adminWorkspace.isMutating;
export const selectWorkspaceError = (state: RootState) =>
  state.adminWorkspace.error;
