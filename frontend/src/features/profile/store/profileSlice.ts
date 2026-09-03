import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { profileService } from "@/features/profile/services/profile.service";
import type {
  ChangePasswordRequest,
  Profile,
  UpdateProfileRequest,
} from "@/features/profile/types/profile.types";

type ProfileState = {
  data: Profile | null;
  isLoading: boolean;
  isSaving: boolean;
  isChangingPassword: boolean;
  error: string | null;
};

const initialState: ProfileState = {
  data: null,
  isLoading: false,
  isSaving: false,
  isChangingPassword: false,
  error: null,
};

const errorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string }).message ?? fallback;

export const fetchProfile = createAsyncThunk<
  Profile,
  void,
  { rejectValue: string }
>("profile/fetch", async (_, { rejectWithValue }) => {
  try {
    return (await profileService.get()).data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to load profile."));
  }
});

export const updateProfile = createAsyncThunk<
  Profile,
  UpdateProfileRequest,
  { rejectValue: string }
>("profile/update", async (request, { rejectWithValue }) => {
  try {
    return (await profileService.update(request)).data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to update profile."));
  }
});

export const changeProfilePassword = createAsyncThunk<
  void,
  ChangePasswordRequest,
  { rejectValue: string }
>("profile/changePassword", async (request, { rejectWithValue }) => {
  try {
    await profileService.changePassword(request);
    return;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to update password."));
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load profile.";
      })
      .addCase(updateProfile.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isSaving = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload ?? "Unable to update profile.";
      })
      .addCase(changeProfilePassword.pending, (state) => {
        state.isChangingPassword = true;
        state.error = null;
      })
      .addCase(changeProfilePassword.fulfilled, (state) => {
        state.isChangingPassword = false;
      })
      .addCase(changeProfilePassword.rejected, (state, action) => {
        state.isChangingPassword = false;
        state.error = action.payload ?? "Unable to update password.";
      });
  },
});

export const { clearProfileError } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;
export const selectProfile = (state: RootState) => state.profile.data;
export const selectProfileLoading = (state: RootState) =>
  state.profile.isLoading;
export const selectProfileSaving = (state: RootState) => state.profile.isSaving;
export const selectProfilePasswordChanging = (state: RootState) =>
  state.profile.isChangingPassword;
export const selectProfileError = (state: RootState) => state.profile.error;
