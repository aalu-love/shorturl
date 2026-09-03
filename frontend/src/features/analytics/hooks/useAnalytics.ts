import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchAnalytics,
  selectAnalytics,
  selectAnalyticsError,
  selectAnalyticsLoading,
} from "@/features/analytics/store/analyticsSlice";
import type { AnalyticsQuery } from "@/features/analytics/types/analytics.types";

export function useAnalytics(query?: AnalyticsQuery) {
  const dispatch = useAppDispatch();
  const analytics = useAppSelector(selectAnalytics);
  const isLoading = useAppSelector(selectAnalyticsLoading);
  const error = useAppSelector(selectAnalyticsError);
  const days = query?.days;

  useEffect(() => {
    void dispatch(fetchAnalytics({ days }));
  }, [dispatch, days]);

  const refresh = useCallback(
    () => dispatch(fetchAnalytics({ days })).unwrap(),
    [dispatch, days],
  );

  return { analytics, isLoading, error, refresh };
}
