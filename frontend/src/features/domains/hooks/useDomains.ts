import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createDomain,
  fetchDomains,
  removeDomain,
  selectDomains,
  selectDomainsError,
  selectDomainsLoading,
  selectDomainsMutating,
  verifyDomain,
} from "@/features/domains/store/domainsSlice";
import type { CreateDomainRequest } from "@/features/domains/types/domains.types";

export function useDomains() {
  const dispatch = useAppDispatch();
  const domains = useAppSelector(selectDomains);
  const isLoading = useAppSelector(selectDomainsLoading);
  const isMutating = useAppSelector(selectDomainsMutating);
  const error = useAppSelector(selectDomainsError);

  useEffect(() => {
    void dispatch(fetchDomains());
  }, [dispatch]);

  const refresh = useCallback(
    () => dispatch(fetchDomains()).unwrap(),
    [dispatch],
  );
  const add = useCallback(
    (request: CreateDomainRequest) => dispatch(createDomain(request)).unwrap(),
    [dispatch],
  );
  const verify = useCallback(
    (id: string) => dispatch(verifyDomain(id)).unwrap(),
    [dispatch],
  );
  const remove = useCallback(
    (id: string) => dispatch(removeDomain(id)).unwrap(),
    [dispatch],
  );

  return {
    domains,
    isLoading,
    isMutating,
    error,
    refresh,
    add,
    verify,
    remove,
  };
}
