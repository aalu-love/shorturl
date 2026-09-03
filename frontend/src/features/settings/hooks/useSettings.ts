import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchSettings,
  selectSettings,
  selectSettingsError,
  selectSettingsLoading,
  selectSettingsSaving,
  updateSettings,
} from "@/features/settings/store/settingsSlice";
import type { UpdateWorkspaceSettingsRequest } from "@/features/settings/types/settings.types";

export function useSettings() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(selectSettings);
  const isLoading = useAppSelector(selectSettingsLoading);
  const isSaving = useAppSelector(selectSettingsSaving);
  const error = useAppSelector(selectSettingsError);

  useEffect(() => {
    void dispatch(fetchSettings());
  }, [dispatch]);

  const refresh = useCallback(
    () => dispatch(fetchSettings()).unwrap(),
    [dispatch],
  );
  const save = useCallback(
    (request: UpdateWorkspaceSettingsRequest) =>
      dispatch(updateSettings(request)).unwrap(),
    [dispatch],
  );

  return { settings, isLoading, isSaving, error, refresh, save };
}
