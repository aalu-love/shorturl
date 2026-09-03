import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  dismissNotification,
  fetchNotificationPreferences,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  saveNotificationPreferences,
  selectNotificationPreferences,
  selectNotifications,
  selectNotificationsError,
  selectNotificationsLoading,
  selectNotificationsMutating,
  selectUnreadNotifications,
} from "@/features/notifications/store/notificationsSlice";
import type { NotificationPreferences } from "@/features/notifications/types/notifications.types";

export function useNotifications() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);
  const unread = useAppSelector(selectUnreadNotifications);
  const preferences = useAppSelector(selectNotificationPreferences);
  const isLoading = useAppSelector(selectNotificationsLoading);
  const isMutating = useAppSelector(selectNotificationsMutating);
  const error = useAppSelector(selectNotificationsError);

  useEffect(() => {
    void dispatch(fetchNotifications());
    void dispatch(fetchNotificationPreferences());
  }, [dispatch]);

  const refresh = useCallback(
    () => dispatch(fetchNotifications()).unwrap(),
    [dispatch],
  );
  const markRead = useCallback(
    (id: string) => dispatch(markNotificationRead(id)).unwrap(),
    [dispatch],
  );
  const markAllRead = useCallback(
    () => dispatch(markAllNotificationsRead()).unwrap(),
    [dispatch],
  );
  const dismiss = useCallback(
    (id: string) => dispatch(dismissNotification(id)).unwrap(),
    [dispatch],
  );
  const savePreferences = useCallback(
    (value: NotificationPreferences) =>
      dispatch(saveNotificationPreferences(value)).unwrap(),
    [dispatch],
  );

  return {
    notifications,
    unread,
    preferences,
    isLoading,
    isMutating,
    error,
    refresh,
    markRead,
    markAllRead,
    dismiss,
    savePreferences,
  };
}
