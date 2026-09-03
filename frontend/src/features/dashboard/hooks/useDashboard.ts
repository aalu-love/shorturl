import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchDashboard,
  fetchRecentClicks,
  selectDashboard,
  selectDashboardError,
  selectDashboardLoading,
  selectRecentClicks,
  selectRecentClicksLoading,
  shortenUrl,
} from "@/features/dashboard/store/dashboardSlice";
import type { CreateDashboardUrlRequest } from "@/features/dashboard/types/dashboard.types";

export function useDashboard() {
  const dispatch = useAppDispatch();
  const dashboard = useAppSelector(selectDashboard);
  const isLoading = useAppSelector(selectDashboardLoading);
  const error = useAppSelector(selectDashboardError);
  const recentClicks = useAppSelector(selectRecentClicks);
  const recentClicksLoading = useAppSelector(selectRecentClicksLoading);

  useEffect(() => {
    void dispatch(fetchDashboard());
    void dispatch(fetchRecentClicks());
  }, [dispatch]);

  const refresh = useCallback(() => {
    return dispatch(fetchDashboard()).unwrap();
  }, [dispatch]);

  const createShortUrl = useCallback(
    (request: CreateDashboardUrlRequest) =>
      dispatch(shortenUrl(request)).unwrap(),
    [dispatch],
  );

  return {
    dashboard,
    isLoading,
    error,
    recentClicks,
    recentClicksLoading,
    refresh,
    createShortUrl,
  };
}
