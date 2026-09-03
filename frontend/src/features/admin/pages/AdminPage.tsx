import { ProtectedLayout } from "@/features/layout/ProtectedLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Server,
  Users as UsersIcon,
  Link as LinkIcon,
  Database,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { useAdmin } from "@/features/admin/hooks/useAdmin";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

export default function AdminPage() {
  const { overview, isLoading, error } = useAdmin();
  const planData = overview?.plan_distribution ?? [];
  const activity = overview?.activity ?? [];
  const totalUsers = overview?.total_users ?? 0;
  const totalLinks = overview?.total_links ?? 0;
  const totalClicks = overview?.total_clicks ?? 0;
  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Admin</h1>
          <p className="text-muted-foreground mt-1">
            Platform overview and system health.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Users",
              value: totalUsers.toLocaleString(),
              sub: `+${overview?.new_users ?? 0} this week`,
              icon: UsersIcon,
            },
            {
              title: "System Links",
              value: totalLinks.toLocaleString(),
              sub: "Active links",
              icon: LinkIcon,
            },
            {
              title: "Total Clicks",
              value: totalClicks.toLocaleString(),
              sub: "Across active links",
              icon: Activity,
            },
          ].map(({ title, value, sub, icon: Icon }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center text-xs text-emerald-500 font-medium mt-1">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> {sub}
                </div>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Health
              </CardTitle>
              <Server className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.99%</div>
              <p className="text-xs text-muted-foreground mt-1">
                All services operational
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>
                Breakdown of active users by plan tier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={planData}
                    margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {planData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Audit Log</CardTitle>
                  <CardDescription>
                    Recent global events and administrative actions.
                  </CardDescription>
                </div>
                <Database className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading admin data...
                  </p>
                ) : error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : (
                  activity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="mt-0.5 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium">
                          {activity.description}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                          {activity.userId && (
                            <span>• by {activity.userId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground ring-4 ring-muted" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium">
                      Database backup completed
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />5 hours ago • System
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-destructive ring-4 ring-destructive/20" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium">
                      Failed login attempt from unknown IP
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      12 hours ago • System
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}
