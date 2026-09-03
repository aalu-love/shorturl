import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/features/layout/ProtectedLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MoreHorizontal,
  Plus,
  Copy,
  QrCode,
  Pencil,
  Trash2,
  Search,
  Star,
  StickyNote,
  Smartphone,
  Calendar,
  Globe2,
  Heart,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Copy as CopyIcon,
} from "lucide-react";
import { mockLinks, mockDomains, type Link as LinkType } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useLinks } from "@/features/links/hooks/useLinks";
import type { LinkRecord } from "@/features/links/types/links.types";

// ── Types ────────────────────────────────────────────────────────────────────

type LinkFormState = {
  destination: string;
  domain: string;
  customBackHalf: string;
  tags: string;
  note: string;
  mobileUrl: string;
  scheduledFrom: string;
  scheduledUntil: string;
  fallbackUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  milestoneThreshold: string;
};

const emptyForm: LinkFormState = {
  destination: "",
  domain: "sh.rt",
  customBackHalf: "",
  tags: "",
  note: "",
  mobileUrl: "",
  scheduledFrom: "",
  scheduledUntil: "",
  fallbackUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  milestoneThreshold: "",
};

function toForm(link: LinkType): LinkFormState {
  return {
    destination: link.originalUrl,
    domain: link.domain,
    customBackHalf: link.shortCode,
    tags: link.tags.join(", "),
    note: link.note,
    mobileUrl: link.mobileUrl,
    scheduledFrom: link.scheduledFrom,
    scheduledUntil: link.scheduledUntil,
    fallbackUrl: link.fallbackUrl,
    ogTitle: link.ogTitle,
    ogDescription: link.ogDescription,
    ogImage: link.ogImage,
    milestoneThreshold:
      link.milestoneThreshold > 0 ? String(link.milestoneThreshold) : "",
  };
}

function fromForm(form: LinkFormState, base?: LinkType): Partial<LinkType> {
  const code =
    form.customBackHalf.trim() ||
    (base?.shortCode ?? Math.random().toString(36).substring(2, 8));
  return {
    originalUrl: form.destination,
    shortCode: code,
    shortUrl: `${form.domain}/${code}`,
    domain: form.domain,
    tags: form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    note: form.note,
    mobileUrl: form.mobileUrl,
    scheduledFrom: form.scheduledFrom,
    scheduledUntil: form.scheduledUntil,
    fallbackUrl: form.fallbackUrl,
    ogTitle: form.ogTitle,
    ogDescription: form.ogDescription,
    ogImage: form.ogImage,
    milestoneThreshold: form.milestoneThreshold
      ? Number(form.milestoneThreshold)
      : 0,
  };
}

function toUiLink(link: LinkRecord): LinkType {
  let domain = "localhost";
  try {
    domain = new URL(link.short_url).hostname;
  } catch {
    // Keep a safe display value for malformed legacy URLs.
  }

  return {
    id: link.id,
    originalUrl: link.original_url,
    shortCode: link.short_code,
    shortUrl: link.short_url,
    domain,
    clicks: link.click_count,
    createdAt: link.created_at,
    lastClickedAt: link.last_clicked_at ?? link.created_at,
    tags: link.tags ?? [],
    status: "active",
    pinned: link.pinned,
    note: link.note ?? "",
    mobileUrl: link.mobile_url ?? "",
    scheduledFrom: link.scheduled_from ?? "",
    scheduledUntil: link.scheduled_until ?? link.expires_at ?? "",
    fallbackUrl: link.fallback_url ?? "",
    ogTitle: link.og_title ?? link.title ?? "",
    ogDescription: link.og_description ?? "",
    ogImage: link.og_image ?? "",
    healthStatus: link.health_status,
    milestoneThreshold: link.milestone_threshold,
  };
}

// ── Health indicator ─────────────────────────────────────────────────────────

function HealthDot({ status }: { status: LinkType["healthStatus"] }) {
  const map = {
    ok: { color: "bg-emerald-500", label: "Destination healthy" },
    warn: {
      color: "bg-amber-500",
      label: "Destination reachable with a warning",
    },
    error: { color: "bg-red-500", label: "Destination unreachable (404)" },
    unknown: { color: "bg-muted-foreground/40", label: "Health not checked" },
  };
  const { color, label } = map[status];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-block w-2 h-2 rounded-full ${color} shrink-0 cursor-default`}
        />
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

function HealthIcon({ status }: { status: LinkType["healthStatus"] }) {
  if (status === "ok")
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === "warn")
    return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  if (status === "error") return <XCircle className="w-4 h-4 text-red-500" />;
  return <HelpCircle className="w-4 h-4 text-muted-foreground/50" />;
}

// ── Link form (tabbed) ────────────────────────────────────────────────────────

function LinkForm({
  form,
  setForm,
}: {
  form: LinkFormState;
  setForm: (f: LinkFormState) => void;
}) {
  const activeDomains = mockDomains.filter((d) => d.status === "active");
  return (
    <Tabs defaultValue="setup" className="mt-2">
      <TabsList className="w-full grid grid-cols-3 mb-2">
        <TabsTrigger value="setup">Setup</TabsTrigger>
        <TabsTrigger value="advanced">Targeting & Schedule</TabsTrigger>
        <TabsTrigger value="social">Social Preview</TabsTrigger>
      </TabsList>

      {/* ── Setup tab ── */}
      <TabsContent value="setup" className="space-y-4 pt-2">
        <div className="grid gap-2">
          <Label htmlFor="lf-dest">Destination URL</Label>
          <Input
            id="lf-dest"
            type="url"
            placeholder="https://example.com/very-long-url..."
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Domain</Label>
            <Select
              value={form.domain}
              onValueChange={(v) => setForm({ ...form, domain: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activeDomains.map((d) => (
                  <SelectItem key={d.id} value={d.domain}>
                    {d.domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>
              Back-half{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              placeholder="summer-sale"
              value={form.customBackHalf}
              onChange={(e) =>
                setForm({ ...form, customBackHalf: e.target.value })
              }
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>
            Tags{" "}
            <span className="text-muted-foreground font-normal">
              (comma-separated)
            </span>
          </Label>
          <Input
            placeholder="marketing, social"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lf-note">
            Note{" "}
            <span className="text-muted-foreground font-normal">
              (private, team-only)
            </span>
          </Label>
          <Textarea
            id="lf-note"
            placeholder="Context about how this link is used…"
            rows={2}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="resize-none"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lf-milestone">
            Click milestone alert{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id="lf-milestone"
            type="number"
            min={0}
            placeholder="e.g. 10000"
            value={form.milestoneThreshold}
            onChange={(e) =>
              setForm({ ...form, milestoneThreshold: e.target.value })
            }
          />
          <p className="text-xs text-muted-foreground">
            Notify me when this link crosses this many clicks.
          </p>
        </div>
      </TabsContent>

      {/* ── Targeting & Schedule tab ── */}
      <TabsContent value="advanced" className="space-y-5 pt-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Device targeting</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Mobile visitors will be redirected to this URL instead.
          </p>
          <Input
            placeholder="https://apps.apple.com/app/... or intent://..."
            value={form.mobileUrl}
            onChange={(e) => setForm({ ...form, mobileUrl: e.target.value })}
          />
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Schedule</span>
          </div>
          <p className="text-xs text-muted-foreground">
            This link will only redirect within the specified window.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Active from</Label>
              <Input
                type="datetime-local"
                value={form.scheduledFrom}
                onChange={(e) =>
                  setForm({ ...form, scheduledFrom: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Active until</Label>
              <Input
                type="datetime-local"
                value={form.scheduledUntil}
                onChange={(e) =>
                  setForm({ ...form, scheduledUntil: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>
              Fallback URL{" "}
              <span className="text-muted-foreground font-normal">
                (after expiry)
              </span>
            </Label>
            <Input
              placeholder="https://example.com/expired"
              value={form.fallbackUrl}
              onChange={(e) =>
                setForm({ ...form, fallbackUrl: e.target.value })
              }
            />
          </div>
        </div>
      </TabsContent>

      {/* ── Social Preview tab ── */}
      <TabsContent value="social" className="space-y-4 pt-2">
        <div className="flex items-center gap-2 mb-1">
          <Globe2 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Open Graph / Social preview
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Customise how this link appears when shared on Twitter, LinkedIn,
          Slack, and other platforms.
        </p>
        <div className="grid gap-2">
          <Label>Title</Label>
          <Input
            placeholder="Your campaign headline"
            value={form.ogTitle}
            onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea
            placeholder="A short description that appears under the title."
            rows={2}
            value={form.ogDescription}
            onChange={(e) =>
              setForm({ ...form, ogDescription: e.target.value })
            }
            className="resize-none"
          />
        </div>
        <div className="grid gap-2">
          <Label>Image URL</Label>
          <Input
            placeholder="https://example.com/og-image.png"
            value={form.ogImage}
            onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
          />
        </div>
        {(form.ogTitle || form.ogDescription) && (
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              Preview
            </p>
            <p className="text-sm font-semibold leading-tight">
              {form.ogTitle || "No title"}
            </p>
            {form.ogDescription && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {form.ogDescription}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground/60">
              {form.domain}/{form.customBackHalf || "short-code"}
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

// ── Row badges ────────────────────────────────────────────────────────────────

function LinkRowBadges({ link }: { link: LinkType }) {
  const isScheduled = link.scheduledFrom || link.scheduledUntil;
  const now = new Date();
  const isExpired = link.scheduledUntil && new Date(link.scheduledUntil) < now;
  return (
    <div className="flex items-center gap-1 flex-wrap mt-0.5">
      {link.tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="text-[10px] px-1.5 py-0 font-normal"
        >
          {tag}
        </Badge>
      ))}
      {link.mobileUrl && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 gap-0.5 font-normal cursor-default"
            >
              <Smartphone className="w-2.5 h-2.5" />
              Device
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Mobile visitors redirected separately</TooltipContent>
        </Tooltip>
      )}
      {isScheduled && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 gap-0.5 font-normal cursor-default ${isExpired ? "border-red-300 text-red-600" : "border-amber-300 text-amber-700"}`}
            >
              <Calendar className="w-2.5 h-2.5" />
              {isExpired ? "Expired" : "Scheduled"}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {link.scheduledFrom && <p>From: {link.scheduledFrom}</p>}
            {link.scheduledUntil && <p>Until: {link.scheduledUntil}</p>}
          </TooltipContent>
        </Tooltip>
      )}
      {link.ogTitle && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 gap-0.5 font-normal cursor-default"
            >
              <Globe2 className="w-2.5 h-2.5" />
              OG
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            Custom social preview set: "{link.ogTitle}"
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function LinksPage() {
  const { toast } = useToast();
  const {
    links: apiLinks,
    isLoading,
    isMutating,
    error,
    create,
    update,
    remove,
    checkAllHealth,
    lastCheckedAt,
  } = useLinks();
  const [links, setLinks] = useState<LinkType[]>(mockLinks);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<LinkFormState>(emptyForm);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [editForm, setEditForm] = useState<LinkFormState>(emptyForm);
  const [deletingLink, setDeletingLink] = useState<LinkType | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  useEffect(() => {
    if (!isLoading) setLinks(apiLinks.map(toUiLink));
  }, [apiLinks, isLoading]);

  // Sort: pinned first, then by createdAt desc
  const sortedLinks = [...links].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredLinks = sortedLinks.filter(
    (l) =>
      l.shortUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      l.note.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ── Actions ──

  const togglePin = (id: string) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l)));
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`,
    );
    toast({ title: "Copied", description: "Short URL copied to clipboard." });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await create({
        original_url: createForm.destination,
        ...(createForm.customBackHalf.trim()
          ? { custom_code: createForm.customBackHalf.trim() }
          : {}),
        ...(createForm.ogTitle.trim()
          ? { title: createForm.ogTitle.trim() }
          : {}),
        tags: createForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        note: createForm.note,
        mobile_url: createForm.mobileUrl || undefined,
        scheduled_from: createForm.scheduledFrom || undefined,
        scheduled_until: createForm.scheduledUntil || undefined,
        fallback_url: createForm.fallbackUrl || undefined,
        og_title: createForm.ogTitle || undefined,
        og_description: createForm.ogDescription || undefined,
        og_image: createForm.ogImage || undefined,
        milestone_threshold: createForm.milestoneThreshold
          ? Number(createForm.milestoneThreshold)
          : 0,
      });
      setIsCreateOpen(false);
      setCreateForm(emptyForm);
      toast({
        title: "Link created",
        description: `${created.short_url} is ready to share.`,
      });
    } catch {
      toast({
        title: "Unable to create link",
        description: error ?? "Please check the URL and try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    try {
      await update(editingLink.shortCode, {
        original_url: editForm.destination,
        title: editForm.ogTitle || undefined,
        tags: editForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        note: editForm.note,
        mobile_url: editForm.mobileUrl || undefined,
        scheduled_from: editForm.scheduledFrom || undefined,
        scheduled_until: editForm.scheduledUntil || undefined,
        fallback_url: editForm.fallbackUrl || undefined,
        og_title: editForm.ogTitle || undefined,
        og_description: editForm.ogDescription || undefined,
        og_image: editForm.ogImage || undefined,
        milestone_threshold: editForm.milestoneThreshold
          ? Number(editForm.milestoneThreshold)
          : 0,
      });
      setEditingLink(null);
      toast({
        title: "Link updated",
        description: "Your changes have been saved.",
      });
    } catch {
      toast({
        title: "Unable to update link",
        description: error ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = (link: LinkType) => {
    const code = `${link.shortCode}-copy`;
    const dup: LinkType = {
      ...link,
      id: `l${Date.now()}`,
      shortCode: code,
      shortUrl: `${link.domain}/${code}`,
      clicks: 0,
      pinned: false,
      createdAt: new Date().toISOString(),
      lastClickedAt: new Date().toISOString(),
      healthStatus: "unknown",
    };
    void create({
      original_url: dup.originalUrl,
      custom_code: dup.shortCode,
      title: dup.ogTitle || undefined,
      tags: dup.tags,
      note: dup.note,
      mobile_url: dup.mobileUrl || undefined,
      scheduled_from: dup.scheduledFrom || undefined,
      scheduled_until: dup.scheduledUntil || undefined,
      fallback_url: dup.fallbackUrl || undefined,
      og_title: dup.ogTitle || undefined,
      og_description: dup.ogDescription || undefined,
      og_image: dup.ogImage || undefined,
      milestone_threshold: dup.milestoneThreshold,
    })
      .then(() => {
        toast({
          title: "Link duplicated",
          description: `${dup.shortUrl} created. Edit it to customise.`,
        });
      })
      .catch(() => {
        toast({
          title: "Unable to duplicate link",
          description: error ?? "Please try again.",
          variant: "destructive",
        });
      });
  };

  const confirmDelete = async () => {
    if (!deletingLink) return;
    try {
      await remove(deletingLink.shortCode);
      toast({
        title: "Link deleted",
        description: `${deletingLink.shortUrl} has been removed.`,
      });
      setDeletingLink(null);
    } catch {
      toast({
        title: "Unable to delete link",
        description: error ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCheckAllHealth = async () => {
    setIsCheckingHealth(true);
    try {
      await checkAllHealth();
      toast({
        title: "Health check complete",
        description: `${links.length} link${links.length === 1 ? "" : "s"} checked.`,
      });
    } catch {
      toast({
        title: "Health check incomplete",
        description: "Some links could not be checked.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  // ── Render ──

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Links</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your shortened URLs.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Create Link
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto"
              animation="slide-up"
            >
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create short link</DialogTitle>
                  <DialogDescription>
                    Paste a URL to shorten, then configure targeting, schedule,
                    and social preview.
                  </DialogDescription>
                </DialogHeader>
                <LinkForm form={createForm} setForm={setCreateForm} />
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isMutating}>
                    {isMutating ? "Creating..." : "Create link"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm flex-wrap bg-blue-50 border-blue-200">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search links, URLs, tags, or notes…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="gap-2 shrink-0"
              onClick={handleCheckAllHealth}
              disabled={isCheckingHealth}
            >
              {isCheckingHealth ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isCheckingHealth ? "Checking…" : "Check health"}
            </Button>
            <div className="text-[0.60rem] text-muted-foreground">
              {lastCheckedAt
                ? `Last checked: ${lastCheckedAt}`
                : "Not checked yet"}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-8" />
                <TableHead>Short link</TableHead>
                <TableHead>Original URL</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No links found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLinks.map((link) => (
                  <TableRow
                    key={link.id}
                    className={`group ${link.pinned ? "bg-primary/[0.03]" : ""}`}
                  >
                    {/* Pin button */}
                    <TableCell className="pr-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7"
                            onClick={() => togglePin(link.id)}
                          >
                            <Star
                              className={`w-3.5 h-3.5 transition-colors ${link.pinned ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40 group-hover:text-muted-foreground"}`}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {link.pinned ? "Unpin" : "Pin to top"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    {/* Short link + badges */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <HealthDot status={link.healthStatus} />
                        <span className="hover:underline cursor-pointer truncate max-w-[160px]">
                          {link.shortUrl}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={() => handleCopy(link.shortUrl)}
                        >
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        </Button>
                        {link.note && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <StickyNote className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 cursor-default" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[220px]">
                              {link.note}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <LinkRowBadges link={link} />
                    </TableCell>

                    {/* Original URL */}
                    <TableCell>
                      <div
                        className="max-w-[220px] truncate text-sm text-muted-foreground"
                        title={link.originalUrl}
                      >
                        {link.originalUrl}
                      </div>
                    </TableCell>

                    {/* Clicks */}
                    <TableCell className="text-right font-medium">
                      {link.clicks.toLocaleString()}
                    </TableCell>

                    {/* Created */}
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(link.createdAt), "MMM d, yyyy")}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleCopy(link.shortUrl)}
                          >
                            <CopyIcon className="w-4 h-4 mr-2" /> Copy link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <QrCode className="w-4 h-4 mr-2" /> QR code
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(link)}
                          >
                            <Heart className="w-4 h-4 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingLink(link);
                              setEditForm(toForm(link));
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeletingLink(link)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog
        open={!!editingLink}
        onOpenChange={(o) => !o && setEditingLink(null)}
      >
        <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit link</DialogTitle>
              <DialogDescription>
                Update destination, targeting, schedule, or social preview.
              </DialogDescription>
            </DialogHeader>
            <LinkForm form={editForm} setForm={setEditForm} />
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingLink(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deletingLink}
        onOpenChange={(o) => !o && setDeletingLink(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this short link?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingLink && (
                <>
                  <strong>{deletingLink.shortUrl}</strong> will stop redirecting
                  immediately. This action can't be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isMutating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedLayout>
  );
}
