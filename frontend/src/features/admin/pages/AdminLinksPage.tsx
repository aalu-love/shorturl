import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProtectedLayout } from "@/features/layout/ProtectedLayout";
import { useAdminLinks } from "@/features/admin/hooks/useAdminLinks";
import type { AdminLinkStatus } from "@/features/admin/types/admin-links.types";

export default function AdminLinksPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminLinkStatus | undefined>();
  const { links, total, isLoading, isMutating, error, moderate } =
    useAdminLinks({ search: search || undefined, status });

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Links</h1>
          <p className="mt-1 text-muted-foreground">
            Review and moderate links across the workspace.
          </p>
        </div>
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>{total.toLocaleString()} links</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search code, URL, or owner..."
                className="sm:w-72"
              />
              <div className="flex gap-2">
                <Button
                  variant={!status ? "default" : "outline"}
                  onClick={() => setStatus(undefined)}
                >
                  All
                </Button>
                <Button
                  variant={status === "active" ? "default" : "outline"}
                  onClick={() => setStatus("active")}
                >
                  Active
                </Button>
                <Button
                  variant={status === "archived" ? "default" : "outline"}
                  onClick={() => setStatus("archived")}
                >
                  Archived
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading links...</p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : links.length === 0 ? (
              <p className="text-sm text-muted-foreground">No links found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="p-3">Short link</th>
                      <th className="p-3">Owner</th>
                      <th className="p-3">Clicks</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => (
                      <tr key={link.id} className="border-b last:border-0">
                        <td className="max-w-xs p-3">
                          <div className="font-medium">{link.short_url}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {link.original_url}
                          </div>
                        </td>
                        <td className="p-3">
                          {link.owner_name || link.owner_email || "Unknown"}
                        </td>
                        <td className="p-3">
                          {link.click_count.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={link.is_active ? "default" : "secondary"}
                          >
                            {link.is_active ? "Active" : "Archived"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isMutating}
                            onClick={() =>
                              void moderate(
                                link.id,
                                link.is_active ? "archive" : "restore",
                              )
                            }
                          >
                            {link.is_active ? "Archive" : "Restore"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
