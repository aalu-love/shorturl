import { Link, useLocation } from "wouter";
import {
  Link as LinkIcon,
  ShieldCheck,
  UserCircle2,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, USER_NAV } from "@/features/layout/navigation/menuConfig";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLES } from "@/shared/constants/roles";

export function Sidebar({
  isOpen,
  setIsOpen: _setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
}) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { role } = user || {};
  const navGroups = role === ROLES.ADMIN ? ADMIN_NAV : USER_NAV;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-transform transform md:translate-x-0 flex flex-col",
        !isOpen && "-translate-x-full md:translate-x-0",
      )}
    >
      <div className="px-6 pt-6 pb-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight text-sidebar-foreground hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <LinkIcon className="w-4 h-4 text-primary-foreground" />
          </div>
          shortURL
        </Link>
      </div>

      <div className="px-4">
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-[11px] font-medium border",
            role === ROLES.ADMIN
              ? "bg-neutral-950/5 border-neutral-200 text-foreground"
              : "bg-neutral-100/60 border-neutral-200 text-muted-foreground",
          )}
        >
          {role === ROLES.ADMIN ? (
            <ShieldCheck className="w-3.5 h-3.5" />
          ) : (
            <UserCircle2 className="w-3.5 h-3.5" />
          )}
          <span className="uppercase tracking-wider">
            {role === ROLES.ADMIN ? "Admin mode" : "User mode"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  location === item.href ||
                  (item.href !== "/" && location.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-6 pt-2 border-t border-sidebar-border">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors"
        >
          <span>View landing page</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
