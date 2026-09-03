import { useState } from "react";
import { Link } from "wouter";
import { ProtectedLayout } from "@/features/layout/ProtectedLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// ── CSV export ────────────────────────────────────────────────────────────────

function exportCsv(
  timeframe: string,
  data: NonNullable<ReturnType<typeof useAnalytics>["analytics"]>,
) {
  const rows = [
    ["Date", "Total Clicks", "Unique Visitors"],
    ...data.over_time.map((r) => [r.date, r.clicks, r.unique_visitors]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `analytics-${timeframe}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Trend indicator ────────────────────────────────────────────────────────────

function Trend({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="flex items-center gap-0.5 text-emerald-600 font-medium text-xs">
        <TrendingUp className="w-3 h-3" />+{value}%
      </span>
    );
  if (value < 0)
    return (
      <span className="flex items-center gap-0.5 text-red-500 font-medium text-xs">
        <TrendingDown className="w-3 h-3" />
        {value}%
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-muted-foreground text-xs">
      <Minus className="w-3 h-3" />—
    </span>
  );
}

// ── Notification type badge ───────────────────────────────────────────────────

function NotifTypeBadge({ type }: { type: string }) {
  if (type === "milestone")
    return (
      <Badge className="bg-amber-500/10 text-amber-700 border-amber-200 text-[10px]">
        Milestone
      </Badge>
    );
  if (type === "health")
    return (
      <Badge className="bg-red-500/10 text-red-700 border-red-200 text-[10px]">
        Health
      </Badge>
    );
  if (type === "digest")
    return (
      <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 text-[10px]">
        Digest
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-[10px]">
      Schedule
    </Badge>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("7d");
  const timeframeDays = {
    "24h": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
    all: 90,
  } as const;
  const { analytics, isLoading, error } = useAnalytics({
    days: timeframeDays[timeframe as keyof typeof timeframeDays],
  });
  const { notifications } = useNotifications();
  const unreadNotifs = notifications.filter(
    (notification) => !notification.read,
  );
  const emptyAnalytics = {
    period_days: 0,
    total_clicks: 0,
    unique_visitors: 0,
    over_time: [],
    referrers: [],
    devices: [],
    top_links: [],
  };
  const data = analytics ?? emptyAnalytics;

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Detailed breakdown of your link performance.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => exportCsv(timeframe, data)}
              disabled={isLoading}
            >
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Clicks over time */}
        <Card>
          <CardHeader>
            <CardTitle>Clicks Over Time</CardTitle>
            <CardDescription>
              Total clicks and unique visitors across all your links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.over_time}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    dy={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 12,
                    }}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    name="Total Clicks"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="unique_visitors"
                    name="Unique Visitors"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Referrers + Devices */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Referrer Breakdown</CardTitle>
              <CardDescription>
                Where your traffic is coming from and how it's trending.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bar chart */}
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.referrers}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: "hsl(var(--foreground))",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                      width={90}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Clicks"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={24}
                    >
                      {data.referrers.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Detail table */}
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-0">Source</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                    <TableHead className="text-right">vs last period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.referrers.map((r, i) => (
                    <TableRow key={r.name} className="hover:bg-muted/30">
                      <TableCell className="pl-0 font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                          {r.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {r.count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${r.percentage}%`,
                                backgroundColor: COLORS[i % COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {r.percentage}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Trend value={r.trend} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Devices</CardTitle>
              <CardDescription>Breakdown by device type.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.devices}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {data.devices.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-2 mt-2">
                {data.devices.map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span>{d.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {d.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top links */}
        <Card>
          <CardHeader>
            <CardTitle>Top Links</CardTitle>
            <CardDescription>
              Most active links in this time period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short Link</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.top_links.slice(0, 5).map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="font-medium text-primary hover:underline cursor-pointer">
                        {link.short_url}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {link.original_url}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {link.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {link.clicks.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Click notifications preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Recent Notifications
                  {unreadNotifs.length > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
                      {unreadNotifs.length} new
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Click milestones, health alerts, and digest summaries.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/notifications" className="flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${n.read ? "bg-muted/20" : "bg-primary/5 border border-primary/10"}`}
                >
                  <div className="mt-0.5 shrink-0">
                    <NotifTypeBadge type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${n.read ? "text-foreground/70" : "font-medium"}`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {n.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(n.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                    {n.link_short_url && (
                      <div className="flex items-center gap-1 text-xs text-primary/70 mt-1 justify-end">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[80px]">
                          {n.link_short_url}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
