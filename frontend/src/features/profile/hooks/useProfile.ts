import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  changeProfilePassword,
  fetchProfile,
  selectProfile,
  selectProfileError,
  selectProfileLoading,
  selectProfilePasswordChanging,
  selectProfileSaving,
  updateProfile,
} from "@/features/profile/store/profileSlice";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "@/features/profile/types/profile.types";

export function useProfile() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const isLoading = useAppSelector(selectProfileLoading);
  const isSaving = useAppSelector(selectProfileSaving);
  const isChangingPassword = useAppSelector(selectProfilePasswordChanging);
  const error = useAppSelector(selectProfileError);

  useEffect(() => {
    void dispatch(fetchProfile());
  }, [dispatch]);

  const refresh = useCallback(
    () => dispatch(fetchProfile()).unwrap(),
    [dispatch],
  );
  const update = useCallback(
    (request: UpdateProfileRequest) =>
      dispatch(updateProfile(request)).unwrap(),
    [dispatch],
  );
  const changePassword = useCallback(
    (request: ChangePasswordRequest) =>
      dispatch(changeProfilePassword(request)).unwrap(),
    [dispatch],
  );

  return {
    profile,
    isLoading,
    isSaving,
    isChangingPassword,
    error,
    refresh,
    update,
    changePassword,
  };
}
