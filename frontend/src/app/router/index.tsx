import React from "react";
import { Route, Switch } from "wouter";

import { routes } from "./routes";
import { RouteGuard } from "./RouteGuard";

// Pages
import NotFound from "@/shared/components/NotFound";

/* ---------------------------------------------------------- */
/* Router */
/* ---------------------------------------------------------- */

export function AppRouter() {
  return (
    <Switch>
      {routes.map(({ path, component: Component, auth }) => (
        <Route key={path} path={path}>
          <RouteGuard auth={auth}>
            <Component />
          </RouteGuard>
        </Route>
      ))}

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
