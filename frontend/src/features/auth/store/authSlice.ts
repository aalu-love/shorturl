import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authStorage } from "@/features/auth/utils/authStorage";
import { Role } from "@/shared/constants/roles";
import type {
  AuthState,
  AuthTokens,
  AuthUser,
} from "@/features/auth/types/auth.types";
import type { RootState } from "@/app/store";

const initialState: AuthState = {
  user: authStorage.getUser<AuthUser>(),
  role: authStorage.getUserRole() as Role,
  tokens: authStorage.getAccessToken()
    ? {
        access_token: authStorage.getAccessToken()!,
        refresh_token: authStorage.getRefreshToken() ?? "",
      }
    : null,
  isAuthenticated: !!authStorage.getAccessToken(),
  isLoading: false,
  error: null,
};

console.log("Initial auth state:", initialState); // Debugging line

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess(
      state,
      action: PayloadAction<{ user: AuthUser; tokens: AuthTokens }>,
    ) {
      const { user, tokens } = action.payload;
      state.user = user;
      state.tokens = tokens;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.role = user.role.toLocaleUpperCase() as Role;
      // Persist to storage
      authStorage.setAccessToken(tokens.access_token);
      authStorage.setRefreshToken(tokens.refresh_token);
      authStorage.setUser(user);
      authStorage.setUserRole(user.role);
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      authStorage.clear();
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } =
  authSlice.actions;
export const authReducer = authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthRole = (state: RootState) => state.auth.role;
