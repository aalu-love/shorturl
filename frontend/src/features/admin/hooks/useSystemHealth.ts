import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchSystemHealth,
  selectSystemHealth,
  selectSystemHealthError,
  selectSystemHealthLoading,
} from "@/features/admin/store/systemHealthSlice";

export function useSystemHealth() {
  const dispatch = useAppDispatch();
  const health = useAppSelector(selectSystemHealth);
  const isLoading = useAppSelector(selectSystemHealthLoading);
  const error = useAppSelector(selectSystemHealthError);

  useEffect(() => {
    void dispatch(fetchSystemHealth());
  }, [dispatch]);

  const refresh = useCallback(
    () => dispatch(fetchSystemHealth()).unwrap(),
    [dispatch],
  );

  return { health, isLoading, error, refresh };
}
