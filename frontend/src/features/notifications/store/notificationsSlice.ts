import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { notificationsService } from "@/features/notifications/services/notifications.service";
import type {
  NotificationList,
  NotificationPreferences,
  NotificationRecord,
} from "@/features/notifications/types/notifications.types";

type NotificationsState = {
  items: NotificationRecord[];
  unread: number;
  limit: number;
  offset: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
};

const initialState: NotificationsState = {
  items: [],
  unread: 0,
  limit: 50,
  offset: 0,
  preferences: {
    digest_enabled: true,
    health_enabled: true,
    default_threshold: 1000,
  },
  isLoading: false,
  isMutating: false,
  error: null,
};

const getError = (error: unknown, fallback: string) =>
  (error as { message?: string }).message ?? fallback;

export const fetchNotifications = createAsyncThunk<
  NotificationList,
  void,
  { rejectValue: string }
>("notifications/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await notificationsService.list();
    return response.data;
  } catch (error) {
    return rejectWithValue(getError(error, "Unable to load notifications."));
  }
});

export const markNotificationRead = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notifications/markRead", async (id, { rejectWithValue }) => {
  try {
    await notificationsService.markRead(id);
    return id;
  } catch (error) {
    return rejectWithValue(
      getError(error, "Unable to mark notification as read."),
    );
  }
});

export const markAllNotificationsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("notifications/markAllRead", async (_, { rejectWithValue }) => {
  try {
    await notificationsService.markAllRead();
    return;
  } catch (error) {
    return rejectWithValue(
      getError(error, "Unable to mark notifications as read."),
    );
  }
});

export const dismissNotification = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("notifications/dismiss", async (id, { rejectWithValue }) => {
  try {
    await notificationsService.dismiss(id);
    return id;
  } catch (error) {
    return rejectWithValue(getError(error, "Unable to dismiss notification."));
  }
});

export const fetchNotificationPreferences = createAsyncThunk<
  NotificationPreferences,
  void,
  { rejectValue: string }
>("notifications/fetchPreferences", async (_, { rejectWithValue }) => {
  try {
    return (await notificationsService.getPreferences()).data;
  } catch (error) {
    return rejectWithValue(
      getError(error, "Unable to load notification preferences."),
    );
  }
});

export const saveNotificationPreferences = createAsyncThunk<
  NotificationPreferences,
  NotificationPreferences,
  { rejectValue: string }
>("notifications/savePreferences", async (preferences, { rejectWithValue }) => {
  try {
    return (await notificationsService.updatePreferences(preferences)).data;
  } catch (error) {
    return rejectWithValue(
      getError(error, "Unable to save notification preferences."),
    );
  }
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications;
        state.unread = action.payload.unread;
        state.limit = action.payload.limit;
        state.offset = action.payload.offset;
        state.isLoading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load notifications.";
      })
      .addCase(markNotificationRead.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const item = state.items.find(
          (notification) => notification.id === action.payload,
        );
        if (item && !item.read) {
          item.read = true;
          state.unread -= 1;
        }
        state.isMutating = false;
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to mark notification as read.";
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.read = true;
        });
        state.unread = 0;
        state.isMutating = false;
      })
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to mark notifications as read.";
      })
      .addCase(dismissNotification.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(dismissNotification.fulfilled, (state, action) => {
        const item = state.items.find(
          (notification) => notification.id === action.payload,
        );
        if (item && !item.read) state.unread -= 1;
        state.items = state.items.filter(
          (notification) => notification.id !== action.payload,
        );
        state.isMutating = false;
      })
      .addCase(dismissNotification.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to dismiss notification.";
      })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      .addCase(saveNotificationPreferences.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(saveNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
        state.isMutating = false;
      })
      .addCase(saveNotificationPreferences.rejected, (state, action) => {
        state.isMutating = false;
        state.error =
          action.payload ?? "Unable to save notification preferences.";
      });
  },
});

export const { clearNotificationsError } = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
export const selectNotifications = (state: RootState) =>
  state.notifications.items;
export const selectUnreadNotifications = (state: RootState) =>
  state.notifications.unread;
export const selectNotificationPreferences = (state: RootState) =>
  state.notifications.preferences;
export const selectNotificationsLoading = (state: RootState) =>
  state.notifications.isLoading;
export const selectNotificationsMutating = (state: RootState) =>
  state.notifications.isMutating;
export const selectNotificationsError = (state: RootState) =>
  state.notifications.error;
