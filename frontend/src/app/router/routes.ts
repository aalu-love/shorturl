import { ROUTES } from "@/shared/constants/routes";
import { Role, ROLES } from "@/shared/constants/roles";

// Pages
import Landing from "@/pages/landing";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";

import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import UserDashboardPage from "@/features/dashboard/pages/UserDashboardPage";

import LinksPage from "@/features/links/pages/LinksPage";
import AnalyticsPage from "@/features/analytics/pages/AnalyticsPage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import DomainsPage from "@/features/domains/pages/DomainsPage";
import UsersPage from "@/features/users/pages/UsersPage";
import AdminPage from "@/features/admin/pages/AdminPage";
import SystemHealthPage from "@/features/admin/pages/SystemHealthPage";
import WorkspaceAdminPage from "@/features/admin/pages/WorkspaceAdminPage";
import AdminAnalyticsPage from "@/features/admin/pages/AdminAnalyticsPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import AdminLinksPage from "@/features/admin/pages/AdminLinksPage";

/* ---------------------------------------------------------- */
/* Types */
/* ---------------------------------------------------------- */

export type Auth = {
  roles: Role[];
};

export type RouteConfig = {
  path: string;
  component: React.ComponentType;
  auth: Auth;
};

/* ---------------------------------------------------------- */
/* Routes */
/* ---------------------------------------------------------- */

export const routes: RouteConfig[] = [
  // PUBLIC
  {
    path: ROUTES.HOME,
    component: Landing,
    auth: {
      roles: [ROLES.PUBLIC],
    },
  },

  // GUEST ONLY
  {
    path: ROUTES.LOGIN,
    component: LoginPage,
    auth: {
      roles: [ROLES.PUBLIC],
    },
  },
  {
    path: ROUTES.REGISTER,
    component: RegisterPage,
    auth: {
      roles: [ROLES.PUBLIC],
    },
  },

  // PRIVATE
  {
    path: ROUTES.MY_DASHBOARD,
    component: UserDashboardPage,
    auth: {
      roles: [ROLES.USER],
    },
  },
  {
    path: ROUTES.LINKS,
    component: LinksPage,
    auth: {
      roles: [ROLES.PRIVATE, ROLES.USER, ROLES.ADMIN],
    },
  },
  {
    path: ROUTES.ANALYTICS,
    component: AnalyticsPage,
    auth: {
      roles: [ROLES.PRIVATE, ROLES.USER, ROLES.ADMIN],
    },
  },
  {
    path: ROUTES.NOTIFICATIONS,
    component: NotificationsPage,
    auth: {
      roles: [ROLES.PRIVATE, ROLES.USER, ROLES.ADMIN],
    },
  },
  {
    path: ROUTES.SETTINGS,
    component: SettingsPage,
    auth: {
      roles: [ROLES.PRIVATE, ROLES.USER, ROLES.ADMIN],
    },
  },
  {
    path: ROUTES.DOMAINS,
    component: DomainsPage,
    auth: {
      roles: [ROLES.PRIVATE, ROLES.USER, ROLES.ADMIN],
    },
  },
  {
    path: ROUTES.PROFILE,
    component: ProfilePage,
    auth: {
      roles: [ROLES.PRIVATE, ROLES.USER, ROLES.ADMIN],
    },
  },

  // MULTIPLE ROLES
  {
    path: ROUTES.DASHBOARD,
    component: DashboardPage,
    auth: {
      roles: [ROLES.ADMIN],
    },
  },

  // ADMIN ONLY
  {
    path: ROUTES.USERS,
    component: UsersPage,
    auth: {
      roles: [ROLES.ADMIN],
    },
  },
  {
    path: "/admin/links",
    component: AdminLinksPage,
    auth: {
      roles: [ROLES.ADMIN],
    },
  },
  {
    path: ROUTES.ADMIN,
    component: AdminPage,
    auth: {
      roles: [ROLES.ADMIN],
    },
  },
  {
    path: ROUTES.ADMIN_HEALTH,
    component: SystemHealthPage,
    auth: {
      roles: [ROLES.ADMIN],
    },
  },
  {
    path: ROUTES.ADMIN_WORKSPACE,
    component: WorkspaceAdminPage,
    auth: {
      roles: [ROLES.ADMIN],
    },
  },
  {
    path: ROUTES.ADMIN_ANALYTICS,
    component: AdminAnalyticsPage,
    auth: {
      roles: [ROLES.ADMIN],
    },
  },
];
