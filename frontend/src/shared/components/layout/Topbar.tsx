import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Menu, Search, Bell, ShieldCheck, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLES, Role } from "@/shared/constants/roles";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { userUtils } from "@/features/auth/utils/userUtils";
import { ROUTES } from "@/shared/constants/routes";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";

export function Topbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { role: userRole, user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<Role>(userRole);
  const { unread } = useNotifications();
  const userInitials = userUtils.getUserInitials(user?.name || "User");

  useEffect(() => {
    setRole(userRole);
  }, [userRole]);

  const handleRoleChange = (next: string) => {
    if (userRole !== ROLES.ADMIN) return;
    setRole(next as Role);
    setLocation(next === ROLES.ADMIN ? ROUTES.DASHBOARD : ROUTES.MY_DASHBOARD);
  };

  const handleLogout = async () => {
    await logout();
    setLocation(ROUTES.LOGIN);
  };

  return (
    <header className="h-16 border-b bg-card flex items-center px-4 md:px-8 justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search links, tags, domains..."
            className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={role}
          onValueChange={handleRoleChange}
          disabled={userRole !== ROLES.ADMIN}
        >
          <SelectTrigger className="w-[150px] h-9 bg-muted/50 border-none focus:ring-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value={ROLES.USER} disabled={userRole !== ROLES.ADMIN}>
              <div className="flex items-center gap-2">
                <UserCircle2 className="w-4 h-4 text-muted-foreground" />
                <span>User view</span>
              </div>
            </SelectItem>
            <SelectItem value={ROLES.ADMIN}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Admin view</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          title="Notifications"
          onClick={() => setLocation(ROUTES.NOTIFICATIONS)}
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-4 h-4 rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.name || "User Name"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLocation(ROUTES.PROFILE)}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Billing</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation(ROUTES.SETTINGS)}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
