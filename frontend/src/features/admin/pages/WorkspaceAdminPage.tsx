import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Globe,
  Megaphone,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProtectedLayout } from "@/features/layout/ProtectedLayout";
import { useAdminWorkspace } from "@/features/admin/hooks/useAdminWorkspace";
import { useToast } from "@/hooks/use-toast";

export default function WorkspaceAdminPage() {
  const { toast } = useToast();
  const {
    domains,
    analytics,
    isLoading,
    isMutating,
    error,
    verifyDomain,
    removeDomain,
    sendAnnouncement,
  } = useAdminWorkspace();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const announce = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await sendAnnouncement({ title, description });
      setTitle("");
      setDescription("");
      toast({
        title: "Announcement sent",
        description: `Delivered to ${result.recipients} active users.`,
      });
    } catch (actionError) {
      toast({
        title: "Unable to send announcement",
        description: String(actionError),
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Workspace Operations
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage workspace domains, aggregate traffic, and announcements.
            </p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}

        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold">Workspace Domains</h2>
            <p className="text-sm text-muted-foreground">
              Review ownership, DNS verification, SSL, and link usage.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {isLoading && domains.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Loading domains...
              </p>
            ) : (
              domains.map((domain) => (
                <Card key={domain.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {domain.domain}
                      </span>
                      {domain.status === "active" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {domain.owner_name || domain.owner_email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        variant={
                          domain.status === "active" ? "default" : "secondary"
                        }
                      >
                        {domain.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SSL</span>
                      <span>{domain.ssl_enabled ? "Enabled" : "Pending"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Links</span>
                      <span>{domain.links_count}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isMutating}
                        onClick={() => void verifyDomain(domain.id)}
                      >
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isMutating}
                        onClick={() => void removeDomain(domain.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-semibold">Aggregate Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Workspace totals only. Individual user analytics remain
              owner-scoped.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total clicks</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {analytics?.total_clicks.toLocaleString() ?? "-"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Unique visitors</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {analytics?.unique_visitors.toLocaleString() ?? "-"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top links</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {analytics?.top_links.length ?? "-"}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Top workspace links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analytics?.top_links.map((link) => (
                <div
                  key={link.id}
                  className="flex justify-between border-b py-2 text-sm last:border-0"
                >
                  <span>{link.short_url}</span>
                  <span className="font-medium">
                    {link.clicks.toLocaleString()} clicks
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Workspace Announcement
              </CardTitle>
              <CardDescription>
                Send a security, maintenance, or workspace-wide announcement to
                active users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="max-w-2xl space-y-4" onSubmit={announce}>
                <div className="space-y-2">
                  <Label htmlFor="announcement-title">Title</Label>
                  <Input
                    id="announcement-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement-description">Message</Label>
                  <textarea
                    id="announcement-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    required
                    className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <Button type="submit" disabled={isMutating}>
                  <Activity className="mr-2 h-4 w-4" />
                  Send announcement
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </ProtectedLayout>
  );
}
