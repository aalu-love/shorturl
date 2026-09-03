import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchAdminDomains,
  fetchWorkspaceAnalytics,
  removeAdminDomain,
  selectAdminDomains,
  selectWorkspaceAnalytics,
  selectWorkspaceError,
  selectWorkspaceLoading,
  selectWorkspaceMutating,
  sendAdminAnnouncement,
  verifyAdminDomain,
} from "@/features/admin/store/workspaceSlice";
import type {
  AdminAnalyticsQuery,
  AdminAnnouncementRequest,
} from "@/features/admin/types/workspace.types";

export function useAdminWorkspace(query: AdminAnalyticsQuery = {}) {
  const dispatch = useAppDispatch();
  const domains = useAppSelector(selectAdminDomains);
  const analytics = useAppSelector(selectWorkspaceAnalytics);
  const isLoading = useAppSelector(selectWorkspaceLoading);
  const isMutating = useAppSelector(selectWorkspaceMutating);
  const error = useAppSelector(selectWorkspaceError);
  useEffect(() => {
    void dispatch(fetchAdminDomains());
    void dispatch(fetchWorkspaceAnalytics(query));
  }, [dispatch, query.days, query.domain, query.user_id]);
  const verifyDomain = useCallback(
    (id: string) => dispatch(verifyAdminDomain(id)).unwrap(),
    [dispatch],
  );
  const removeDomain = useCallback(
    (id: string) => dispatch(removeAdminDomain(id)).unwrap(),
    [dispatch],
  );
  const sendAnnouncement = useCallback(
    (request: AdminAnnouncementRequest) =>
      dispatch(sendAdminAnnouncement(request)).unwrap(),
    [dispatch],
  );
  return {
    domains,
    analytics,
    isLoading,
    isMutating,
    error,
    verifyDomain,
    removeDomain,
    sendAnnouncement,
  };
}
