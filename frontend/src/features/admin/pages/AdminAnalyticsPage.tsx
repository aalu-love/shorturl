import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, RefreshCw } from "lucide-react";
import { ProtectedLayout } from "@/features/layout/ProtectedLayout";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAdminWorkspace } from "@/features/admin/hooks/useAdminWorkspace";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useState } from "react";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const TIMEFRAMES = { "7d": 7, "30d": 30, "90d": 90 } as const;

type Timeframe = keyof typeof TIMEFRAMES;

export default function AdminAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("30d");
  const [domain, setDomain] = useState("all");
  const [userId, setUserId] = useState("all");
  const { domains, analytics, isLoading, error } = useAdminWorkspace({
    days: TIMEFRAMES[timeframe],
    domain: domain === "all" ? undefined : domain,
    user_id: userId === "all" ? undefined : userId,
  });
  const { users } = useUsers();
  const data = analytics ?? {
    total_clicks: 0,
    unique_visitors: 0,
    over_time: [],
    referrers: [],
    devices: [],
    top_links: [],
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <BarChart3 className="h-7 w-7" />
              Workspace Analytics
            </h1>
            <p className="mt-1 text-muted-foreground">
              Aggregate traffic across workspace links.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription>
              Filter aggregate results by reporting period, domain, or link
              owner.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <Select
              value={timeframe}
              onValueChange={(value) => setTimeframe(value as Timeframe)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger>
                <SelectValue placeholder="All domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All domains</SelectItem>
                {domains.map((item) => (
                  <SelectItem key={item.id} value={item.domain}>
                    {item.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total clicks</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {data.total_clicks.toLocaleString()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Unique visitors</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {data.unique_visitors.toLocaleString()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Links with traffic</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {data.top_links.length.toLocaleString()}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Clicks over time</CardTitle>
            <CardDescription>
              Workspace traffic for the selected filters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.over_time}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    name="Clicks"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="unique_visitors"
                    name="Unique visitors"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Referrers</CardTitle>
              <CardDescription>
                Top traffic sources in the workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.referrers}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" name="Clicks" radius={[0, 4, 4, 0]}>
                      {data.referrers.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Devices</CardTitle>
              <CardDescription>Aggregate device distribution.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.devices}
                      dataKey="count"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                    >
                      {data.devices.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top workspace links</CardTitle>
            <CardDescription>
              Highest traffic links for the selected filters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short link</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.top_links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <Badge variant="outline">{link.short_url}</Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {link.original_url}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {link.clicks.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!isLoading && data.top_links.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No traffic matches the selected filters.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
