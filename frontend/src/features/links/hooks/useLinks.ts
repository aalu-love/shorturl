import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createLink,
  checkLinkHealth,
  checkAllLinksHealth,
  updateMilestones,
  deleteLink,
  fetchLinks,
  updateLink,
  selectLinks,
  selectLinksError,
  selectLinksLoading,
  selectLinksMutating,
  selectLinksTotal,
  lastCheckedAtSelector,
} from "@/features/links/store/linksSlice";
import type {
  CreateLinkRequest,
  UpdateLinkRequest,
  BulkMilestoneRequest,
} from "@/features/links/types/links.types";

export function useLinks() {
  const dispatch = useAppDispatch();
  const links = useAppSelector(selectLinks);
  const total = useAppSelector(selectLinksTotal);
  const isLoading = useAppSelector(selectLinksLoading);
  const isMutating = useAppSelector(selectLinksMutating);
  const error = useAppSelector(selectLinksError);
  const lastCheckedAt = useAppSelector(lastCheckedAtSelector);

  useEffect(() => {
    void dispatch(fetchLinks());
  }, [dispatch]);

  const refresh = useCallback(
    () => dispatch(fetchLinks()).unwrap(),
    [dispatch],
  );
  const create = useCallback(
    (request: CreateLinkRequest) => dispatch(createLink(request)).unwrap(),
    [dispatch],
  );
  const remove = useCallback(
    (shortCode: string) => dispatch(deleteLink(shortCode)).unwrap(),
    [dispatch],
  );
  const update = useCallback(
    (shortCode: string, request: UpdateLinkRequest) =>
      dispatch(updateLink({ shortCode, request })).unwrap(),
    [dispatch],
  );
  const checkHealth = useCallback(
    (shortCode: string) => dispatch(checkLinkHealth(shortCode)).unwrap(),
    [dispatch],
  );
  const checkAllHealth = useCallback(
    (shortCodes?: string[]) =>
      dispatch(checkAllLinksHealth(shortCodes)).unwrap(),
    [dispatch],
  );
  const saveMilestones = useCallback(
    (request: BulkMilestoneRequest) =>
      dispatch(updateMilestones(request)).unwrap(),
    [dispatch],
  );

  return {
    links,
    total,
    isLoading,
    isMutating,
    error,
    refresh,
    create,
    update,
    checkHealth,
    checkAllHealth,
    saveMilestones,
    lastCheckedAt,
    remove,
  };
}
