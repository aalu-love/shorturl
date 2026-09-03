import React from "react";
import { Redirect } from "wouter";

import { ROUTES } from "@/shared/constants/routes";

import { Auth } from "./routes";
import { Role, ROLES } from "@/shared/constants/roles";
import { useAuth } from "@/features/auth/hooks/useAuth";

/* ---------------------------------------------------------- */
/* Guard */
/* ---------------------------------------------------------- */

export function RouteGuard({
  auth,
  children,
}: {
  auth: Auth;
  children: React.ReactNode;
}) {
  const { role, isAuthenticated } = useAuth();

  // PUBLIC
  if (auth.roles.includes(ROLES.PUBLIC)) {
    return <>{children}</>;
  }

  // GUEST ONLY
  if (auth.roles.includes(ROLES.PUBLIC)) {
    if (isAuthenticated) {
      return (
        <Redirect
          to={role === ROLES.ADMIN ? ROUTES.DASHBOARD : ROUTES.MY_DASHBOARD}
          replace
        />
      );
    }

    return <>{children}</>;
  }

  // PRIVATE
  if (auth.roles.includes(ROLES.PRIVATE)) {
    if (!isAuthenticated) {
      return <Redirect to={ROUTES.LOGIN} replace />;
    }

    return <>{children}</>;
  }

  // ROLE BASED
  if (!isAuthenticated) {
    return <Redirect to={ROUTES.LOGIN} replace />;
  }

  if (
    !auth.roles.includes(ROLES.PUBLIC) &&
    !auth.roles.includes(role as Role)
  ) {
    return (
      <Redirect
        to={role === ROLES.ADMIN ? ROUTES.DASHBOARD : ROUTES.MY_DASHBOARD}
        replace
      />
    );
  }

  return <>{children}</>;
}
