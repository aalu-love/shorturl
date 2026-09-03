import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  archiveAdminLink,
  fetchAdminLinks,
  selectAdminLinks,
  selectAdminLinksError,
  selectAdminLinksLoading,
  selectAdminLinksMutating,
  selectAdminLinksTotal,
} from "@/features/admin/store/adminLinksSlice";
import type { AdminLinkListParams } from "@/features/admin/types/admin-links.types";

export function useAdminLinks(params: AdminLinkListParams = {}) {
  const dispatch = useAppDispatch();
  const links = useAppSelector(selectAdminLinks);
  const total = useAppSelector(selectAdminLinksTotal);
  const isLoading = useAppSelector(selectAdminLinksLoading);
  const isMutating = useAppSelector(selectAdminLinksMutating);
  const error = useAppSelector(selectAdminLinksError);

  useEffect(() => {
    void dispatch(fetchAdminLinks(params));
  }, [dispatch, params.search, params.status, params.limit, params.offset]);

  const refresh = useCallback(
    (nextParams?: AdminLinkListParams) =>
      dispatch(fetchAdminLinks(nextParams ?? params)).unwrap(),
    [dispatch, params],
  );
  const moderate = useCallback(
    (id: string, action: "archive" | "restore") =>
      dispatch(archiveAdminLink({ id, action })).unwrap(),
    [dispatch],
  );

  return { links, total, isLoading, isMutating, error, refresh, moderate };
}
