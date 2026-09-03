import {
  Activity,
  CheckCircle2,
  Database,
  RefreshCw,
  Server,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProtectedLayout } from "@/features/layout/ProtectedLayout";
import { useSystemHealth } from "@/features/admin/hooks/useSystemHealth";
import type { HealthService } from "@/features/admin/types/system-health.types";

const icons = { api: Server, postgresql: Database, redis: Activity };
const labels = { api: "API", postgresql: "PostgreSQL", redis: "Redis" };

function ServiceCard({ service }: { service: HealthService }) {
  const Icon = icons[service.name];
  const operational = service.status === "operational";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {labels[service.name]}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-lg font-semibold">
          {operational ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          {operational ? "Operational" : "Unavailable"}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {service.latency_ms} ms response time
        </p>
        {!operational && service.message && (
          <p className="mt-2 text-xs text-destructive">{service.message}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SystemHealthPage() {
  const { health, isLoading, error, refresh } = useSystemHealth();
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
            <p className="mt-1 text-muted-foreground">
              Monitor the services that power ShortShout.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => void refresh()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {health && (
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 pt-6">
              <Badge
                variant={
                  health.status === "operational" ? "default" : "destructive"
                }
              >
                {health.status === "operational"
                  ? "All systems operational"
                  : "System degraded"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Uptime: {Math.floor(health.uptime_seconds / 86400)}d{" "}
                {Math.floor((health.uptime_seconds % 86400) / 3600)}h
              </span>
              <span className="text-sm text-muted-foreground">
                Checked {new Date(health.checked_at).toLocaleTimeString()}
              </span>
            </CardContent>
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          {health?.services.map((service) => (
            <ServiceCard key={service.name} service={service} />
          ))}
        </div>
        {!isLoading && !error && !health && (
          <Card>
            <CardHeader>
              <CardTitle>No health data</CardTitle>
              <CardDescription>
                Refresh to check system services.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </ProtectedLayout>
  );
}
