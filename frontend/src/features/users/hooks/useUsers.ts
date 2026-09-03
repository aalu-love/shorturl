import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchUsers,
  inviteUser,
  removeUser,
  selectUsers,
  selectUsersError,
  selectUsersLoading,
  selectUsersMutating,
  updateUser,
} from "@/features/users/store/usersSlice";
import type {
  UserListQuery,
  UserRequest,
} from "@/features/users/types/users.types";

export function useUsers(query: UserListQuery = {}) {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const isLoading = useAppSelector(selectUsersLoading);
  const isMutating = useAppSelector(selectUsersMutating);
  const error = useAppSelector(selectUsersError);
  const search = query.search;
  useEffect(() => {
    void dispatch(fetchUsers({ ...query, search }));
  }, [dispatch, search]);
  const refresh = useCallback(
    () => dispatch(fetchUsers({ ...query, search })).unwrap(),
    [dispatch, search],
  );
  const invite = useCallback(
    (request: UserRequest) => dispatch(inviteUser(request)).unwrap(),
    [dispatch],
  );
  const update = useCallback(
    (id: string, request: Partial<UserRequest>) =>
      dispatch(updateUser({ id, request })).unwrap(),
    [dispatch],
  );
  const remove = useCallback(
    (id: string) => dispatch(removeUser(id)).unwrap(),
    [dispatch],
  );
  return {
    users,
    isLoading,
    isMutating,
    error,
    refresh,
    invite,
    update,
    remove,
  };
}
