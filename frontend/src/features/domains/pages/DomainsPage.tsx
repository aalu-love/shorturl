import { useState } from "react";
import { ProtectedLayout } from "@/features/layout/ProtectedLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { useDomains } from "@/features/domains/hooks/useDomains";
import type { DomainStatus } from "@/features/domains/types/domains.types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

function StatusBadge({ status }: { status: DomainStatus }) {
  if (status === "active")
    return (
      <Badge
        variant="secondary"
        className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
      >
        <CheckCircle2 className="w-3 h-3 mr-1" /> Active
      </Badge>
    );
  if (status === "pending")
    return (
      <Badge
        variant="secondary"
        className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
      >
        <Clock className="w-3 h-3 mr-1" /> Pending DNS
      </Badge>
    );
  return (
    <Badge
      variant="destructive"
      className="bg-red-500/10 text-red-600 hover:bg-red-500/20"
    >
      <XCircle className="w-3 h-3 mr-1" /> Configuration Error
    </Badge>
  );
}

export default function DomainsPage() {
  const { toast } = useToast();
  const { domains, isLoading, isMutating, error, add, verify, remove } =
    useDomains();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [domainName, setDomainName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await add({ domain: domainName });
      setDomainName("");
      setIsAddOpen(false);
      toast({
        title: "Domain added",
        description: "Your domain is pending DNS verification.",
      });
    } catch (addError) {
      toast({
        title: "Unable to add domain",
        description: String(addError),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast({
        title: "Domain removed",
        description: "The domain has been unlinked from your workspace.",
      });
    } catch (removeError) {
      toast({
        title: "Unable to remove domain",
        description: String(removeError),
        variant: "destructive",
      });
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const result = await verify(id);
      toast({
        title:
          result.status === "active"
            ? "Domain verified"
            : "DNS records not found",
        description:
          result.status === "active"
            ? "Your domain is ready for branded links."
            : "Add the required DNS record and try again.",
        variant: result.status === "active" ? "default" : "destructive",
      });
    } catch (verifyError) {
      toast({
        title: "Unable to verify domain",
        description: String(verifyError),
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Custom Domains
            </h1>
            <p className="text-muted-foreground mt-1">
              Use your own domains to create branded short links.
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleAdd}>
                <DialogHeader>
                  <DialogTitle>Add Custom Domain</DialogTitle>
                  <DialogDescription>
                    Connect a domain you own to use for your short links.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="domain-name">Domain Name</Label>
                    <Input
                      id="domain-name"
                      placeholder="link.yourbrand.com"
                      required
                      value={domainName}
                      onChange={(event) => setDomainName(event.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      We recommend using a subdomain like 'link' or 'go' if your
                      root domain is used for your main website.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isMutating}>
                    Add Domain
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="md:col-span-2 xl:col-span-3 text-center text-sm text-muted-foreground py-12">
              Loading domains...
            </div>
          ) : error ? (
            <div className="md:col-span-2 xl:col-span-3 text-center text-sm text-destructive py-12">
              {error}
            </div>
          ) : (
            domains.map((domain) => (
              <Card key={domain.id} className="flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {domain.domain}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Added{" "}
                          {format(new Date(domain.added_at), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="-mt-1 -mr-2"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleVerify(domain.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" /> Verify DNS
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(domain.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Remove Domain
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <StatusBadge status={domain.status} />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Active Links
                      </span>
                      <span className="font-medium">
                        {domain.links_count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">SSL</span>
                      <span className="font-medium">
                        {domain.ssl_enabled ? "Active" : "Pending"}
                      </span>
                    </div>
                    {domain.status !== "active" && (
                      <div className="mt-2 bg-muted/50 p-3 rounded-md text-xs space-y-2 border border-border/50">
                        <p className="font-medium text-foreground">
                          Required DNS configuration:
                        </p>
                        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-mono">A</span>
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-mono">@</span>
                          <span className="text-muted-foreground">Value:</span>
                          <span className="font-mono">76.76.21.21</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                {domain.status !== "active" && (
                  <CardFooter className="pt-0">
                    <Button
                      variant="outline"
                      className="w-full text-xs h-8"
                      onClick={() => handleVerify(domain.id)}
                      disabled={isMutating}
                    >
                      Verify Configuration
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
