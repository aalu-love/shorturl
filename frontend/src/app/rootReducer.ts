import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "@/api/baseApi";
import { authReducer } from "@/features/auth/store/authSlice";
import { dashboardReducer } from "@/features/dashboard/store/dashboardSlice";
import { linksReducer } from "@/features/links/store/linksSlice";
import { notificationsReducer } from "@/features/notifications/store/notificationsSlice";
import { analyticsReducer } from "@/features/analytics/store/analyticsSlice";
import { domainsReducer } from "@/features/domains/store/domainsSlice";
import { settingsReducer } from "@/features/settings/store/settingsSlice";
import { profileReducer } from "@/features/profile/store/profileSlice";
import { adminReducer } from "@/features/admin/store/adminSlice";
import { systemHealthReducer } from "@/features/admin/store/systemHealthSlice";
import { adminWorkspaceReducer } from "@/features/admin/store/workspaceSlice";
import { usersReducer } from "@/features/users/store/usersSlice";
import { adminLinksReducer } from "@/features/admin/store/adminLinksSlice";

export const rootReducer = combineReducers({
  // RTK Query cache
  [baseApi.reducerPath]: baseApi.reducer,
  // Feature slices
  auth: authReducer,
  dashboard: dashboardReducer,
  links: linksReducer,
  notifications: notificationsReducer,
  analytics: analyticsReducer,
  domains: domainsReducer,
  settings: settingsReducer,
  profile: profileReducer,
  admin: adminReducer,
  systemHealth: systemHealthReducer,
  adminWorkspace: adminWorkspaceReducer,
  users: usersReducer,
  adminLinks: adminLinksReducer,
});
