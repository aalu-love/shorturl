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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Link as LinkIcon,
  MousePointerClick,
  TrendingUp,
  Sparkles,
  Copy,
  ArrowRight,
  Calendar,
  Globe,
  QrCode,
} from "lucide-react";
import { mockLinks } from "@/lib/mock-data";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { userUtils } from "@/features/auth/utils/userUtils";
import { useState } from "react";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { useToast } from "@/hooks/use-toast";

const planUsage = {
  links: { used: 47, limit: 100 },
  clicks: { used: 12480, limit: 50000 },
  domains: { used: 1, limit: 3 },
};
export default function UserDashboardPage() {
  const {
    dashboard,
    isLoading: isDashboardLoading,
    createShortUrl,
    recentClicks,
    recentClicksLoading,
  } = useDashboard();
  const [originalUrl, setOriginalUrl] = useState("");
  const myLinks = dashboard
    ? dashboard.urls.map((link) => ({
        id: link.id,
        shortUrl: link.short_url,
        originalUrl: link.original_url,
        domain: new URL(link.short_url).hostname,
        clicks: link.click_count,
        createdAt: link.created_at,
      }))
    : mockLinks.slice(0, 4);
  const linksPct = (planUsage.links.used / planUsage.links.limit) * 100;
  const clicksPct = (planUsage.clicks.used / planUsage.clicks.limit) * 100;
  const domainsPct = (planUsage.domains.used / planUsage.domains.limit) * 100;
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const userInitials = userUtils.getUserInitials(currentUser?.name || "User");

  const handleShorten = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await createShortUrl({ original_url: originalUrl });
      setOriginalUrl("");
      toast({
        title: "Link shortened",
        description: "Your link has been successfully shortened.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Unable to shorten this URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={"currentUser?.avatarUrl"} />
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {currentUser?.name?.split(" ")[0] || "User"}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's a snapshot of your personal links and activity.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {"Pro"} plan
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile">View profile</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shorten a new link</CardTitle>
            <CardDescription>
              Paste any long URL and get a clean, trackable link in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={handleShorten}
            >
              <Input
                placeholder="https://example.com/very/long/url..."
                className="flex-1"
                value={originalUrl}
                onChange={(event) => setOriginalUrl(event.target.value)}
                type="url"
                required
              />
              <Button type="submit" disabled={isDashboardLoading}>
                <LinkIcon className="h-4 w-4 mr-2" />
                {isDashboardLoading ? "Working..." : "Shorten"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Links</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard?.total ?? planUsage.links.used}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                3 created this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clicks
              </CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  dashboard?.total_clicks ?? planUsage.clicks.used
                ).toLocaleString()}
              </div>
              <p className="text-xs text-emerald-500 font-medium mt-1">
                +8.2% vs last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Daily Clicks
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboard?.avg_daily_clicks ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Past 30 days</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Plan usage</CardTitle>
              <CardDescription>
                Your current monthly consumption on the {"Pro"} plan.
              </CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href="/settings">Upgrade</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                label: "Short links",
                used: planUsage.links.used,
                limit: planUsage.links.limit,
                pct: linksPct,
                fmt: (v: number) => String(v),
              },
              {
                label: "Tracked clicks",
                used: planUsage.clicks.used,
                limit: planUsage.clicks.limit,
                pct: clicksPct,
                fmt: (v: number) => v.toLocaleString(),
              },
              {
                label: "Custom domains",
                used: planUsage.domains.used,
                limit: planUsage.domains.limit,
                pct: domainsPct,
                fmt: (v: number) => String(v),
              },
            ].map(({ label, used, limit, pct, fmt }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">
                    {fmt(used)} / {fmt(limit)}
                  </span>
                </div>
                <Progress value={pct} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My recent links</CardTitle>
                <CardDescription>
                  Links you've created or updated recently.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/links" className="flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {myLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between group gap-4"
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">
                          {link.shortUrl}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <QrCode className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground truncate">
                        {link.originalUrl}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs gap-1">
                          <Globe className="h-3 w-3" />
                          {link.domain}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(link.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-sm">
                        {link.clicks.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        clicks
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent clicks</CardTitle>
                <CardDescription>Live activity on your links.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/analytics" className="flex items-center gap-1">
                  Analytics <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentClicks.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <MousePointerClick className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {c.short_url}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {c.location} · {c.device} · {c.referer}
                      </span>
                      <span className="text-xs text-muted-foreground/70 mt-0.5">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                {!recentClicksLoading && recentClicks.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No recent clicks yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}
