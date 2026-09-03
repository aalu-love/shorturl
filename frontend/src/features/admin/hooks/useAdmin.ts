import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchAdminOverview,
  selectAdminError,
  selectAdminLoading,
  selectAdminOverview,
} from "@/features/admin/store/adminSlice";

export function useAdmin() {
  const dispatch = useAppDispatch();
  const overview = useAppSelector(selectAdminOverview);
  const isLoading = useAppSelector(selectAdminLoading);
  const error = useAppSelector(selectAdminError);
  useEffect(() => {
    void dispatch(fetchAdminOverview());
  }, [dispatch]);
  const refresh = useCallback(
    () => dispatch(fetchAdminOverview()).unwrap(),
    [dispatch],
  );
  return { overview, isLoading, error, refresh };
}
