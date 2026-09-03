/**
 * useAuth — the primary hook for auth state and actions in components.
 *
 * Wraps the Redux auth slice so components don't depend on Redux directly.
 */
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  clearError,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthRole,
} from "@/features/auth/store/authSlice";
import { authService } from "@/features/auth/services/auth.service";
import type {
  LoginCredentials,
  RegisterCredentials,
} from "@/features/auth/types/auth.types";

export function useAuth() {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const role = useAppSelector(selectAuthRole);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      dispatch(loginStart());
      try {
        const response = await authService.login(credentials);
        console.log("Login response in useAuth:", response); // Debugging line
        if (response.success) {
          dispatch(
            loginSuccess({
              user: response.data.user,
              tokens: {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
              },
            }),
          );
        } else {
          dispatch(loginFailure(response.message ?? "Login failed."));
        }
      } catch (err) {
        console.log("Error during login in useAuth:", err); // Debugging line
        const message =
          err instanceof Error
            ? err.message
            : "Login failed. Please try again.";

        console.error("Login error message:", message); // Debugging line
        dispatch(loginFailure(message));
        throw err;
      }
    },
    [dispatch],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      dispatch(loginStart());
      try {
        const response = await authService.register(credentials);
        if (response.success) {
          dispatch(
            loginSuccess({
              user: response.data.user,
              tokens: {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
              },
            }),
          );
        } else {
          dispatch(loginFailure(response.message ?? "Registration failed."));
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.";
        dispatch(loginFailure(message));
        throw err;
      }
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch(logoutAction());
  }, [dispatch]);

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    dismissError,
  };
}
