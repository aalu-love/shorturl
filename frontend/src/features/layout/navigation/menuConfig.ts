import {
  LayoutDashboard,
  Link as LinkIcon,
  BarChart3,
  Globe,
  Users,
  Shield,
  Settings,
  User as UserIcon,
  Gauge,
  Bell,
  Activity,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const ADMIN_NAV: NavGroup[] = [
  {
    title: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/links", label: "Links", icon: LinkIcon },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/domains", label: "Domains", icon: Globe },
    ],
  },
  {
    title: "Admin",
    items: [
      { href: "/users", label: "Users", icon: Users },
      { href: "/admin/links", label: "All Links", icon: LinkIcon },
      { href: "/admin", label: "Admin Overview", icon: Shield },
      { href: "/admin/health", label: "System Health", icon: Activity },
      {
        href: "/admin/workspace",
        label: "Workspace Operations",
        icon: Settings,
      },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/profile", label: "Profile", icon: UserIcon },
    ],
  },
];

export const USER_NAV: NavGroup[] = [
  {
    title: "My Workspace",
    items: [
      { href: "/my-dashboard", label: "Dashboard", icon: Gauge },
      { href: "/links", label: "My Links", icon: LinkIcon },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/domains", label: "Domains", icon: Globe },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/profile", label: "Profile", icon: UserIcon },
    ],
  },
];
