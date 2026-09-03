import { Link } from "wouter";
import { ProtectedLayout } from "@/features/layout/ProtectedLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  BarChart3,
  Link as LinkIcon,
  MousePointerClick,
  Globe,
  ArrowRight,
  Copy,
} from "lucide-react";
import { useAdmin } from "@/features/admin/hooks/useAdmin";

export default function DashboardPage() {
  const { overview, isLoading, error } = useAdmin();
  const topLinks = overview?.top_links ?? [];
  const activity = overview?.activity ?? [];

  const handleCopy = async (shortUrl: string) => {
    await navigator.clipboard.writeText(shortUrl);
  };

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your links today.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <div className="flex gap-2 w-full md:w-[400px]">
              <Input
                placeholder="Paste long URL to shorten..."
                className="bg-card flex-1"
                disabled
              />
              <Button disabled>Shorten</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Links",
              value: overview?.total_links ?? 0,
              sub: "Active links",
              icon: LinkIcon,
            },
            {
              title: "Total Clicks",
              value: overview?.total_clicks ?? 0,
              sub: "Across active links",
              icon: MousePointerClick,
              subGreen: true,
            },
            {
              title: "Avg. CTR",
              value: `${overview?.avg_ctr ?? 0}%`,
              sub: "Based on unique visitors",
              icon: BarChart3,
            },
            {
              title: "Active Domains",
              value: overview?.active_domains ?? 0,
              sub: "Verified domains",
              icon: Globe,
            },
          ].map(({ title, value, sub, icon: Icon, subGreen }) => (
            <Card key={title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p
                  className={`text-xs mt-1 ${subGreen ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}
                >
                  {sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Performing Links</CardTitle>
                <CardDescription>
                  Your most clicked links this month.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/links" className="flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading dashboard...
                  </p>
                ) : error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : (
                  topLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex flex-col gap-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm truncate">
                            {link.short_url}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Copy ${link.short_url}`}
                            onClick={() => void handleCopy(link.short_url)}
                            className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Copy className="w-3 h-3 text-muted-foreground" />
                          </Button>
                        </div>
                        <span className="text-xs text-muted-foreground truncate">
                          {link.original_url}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">
                          {link.click_count.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          clicks
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions in your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading activity...
                  </p>
                ) : error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : (
                  activity.map((activity) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {activity.type === "link_created" && (
                          <LinkIcon className="w-4 h-4 text-primary" />
                        )}
                        {activity.type === "link_clicked" && (
                          <MousePointerClick className="w-4 h-4 text-emerald-500" />
                        )}
                        {activity.type === "domain_added" && (
                          <Globe className="w-4 h-4 text-blue-500" />
                        )}
                        {activity.type === "user_signup" && (
                          <ArrowUpRight className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium">
                          {activity.description}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString()}{" "}
                          {new Date(activity.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}
