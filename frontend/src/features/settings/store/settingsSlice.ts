import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { settingsService } from "@/features/settings/services/settings.service";
import type {
  UpdateWorkspaceSettingsRequest,
  WorkspaceSettings,
} from "@/features/settings/types/settings.types";

type SettingsState = {
  data: WorkspaceSettings | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: SettingsState = {
  data: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

const errorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string }).message ?? fallback;

export const fetchSettings = createAsyncThunk<
  WorkspaceSettings,
  void,
  { rejectValue: string }
>("settings/fetch", async (_, { rejectWithValue }) => {
  try {
    return (await settingsService.get()).data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to load settings."));
  }
});

export const updateSettings = createAsyncThunk<
  WorkspaceSettings,
  UpdateWorkspaceSettingsRequest,
  { rejectValue: string }
>("settings/update", async (request, { rejectWithValue }) => {
  try {
    return (await settingsService.update(request)).data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to save settings."));
  }
});

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load settings.";
      })
      .addCase(updateSettings.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isSaving = false;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload ?? "Unable to save settings.";
      });
  },
});

export const { clearSettingsError } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
export const selectSettings = (state: RootState) => state.settings.data;
export const selectSettingsLoading = (state: RootState) =>
  state.settings.isLoading;
export const selectSettingsSaving = (state: RootState) =>
  state.settings.isSaving;
export const selectSettingsError = (state: RootState) => state.settings.error;
