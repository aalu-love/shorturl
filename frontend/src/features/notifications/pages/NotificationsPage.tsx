import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/features/layout/ProtectedLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  TrendingUp,
  AlertTriangle,
  Mail,
  Calendar,
  CheckCheck,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import type { NotificationRecord } from "@/features/notifications/types/notifications.types";
import { useLinks } from "@/features/links/hooks/useLinks";

// ── Notification type helpers ─────────────────────────────────────────────────

const typeConfig = {
  milestone: {
    label: "Milestone",
    icon: TrendingUp,
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  health: {
    label: "Health",
    icon: AlertTriangle,
    bg: "bg-red-500/10",
    text: "text-red-700",
    border: "border-red-200",
  },
  digest: {
    label: "Digest",
    icon: Mail,
    bg: "bg-blue-500/10",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  schedule: {
    label: "Schedule",
    icon: Calendar,
    bg: "bg-violet-500/10",
    text: "text-violet-700",
    border: "border-violet-200",
  },
} as const;

function NotifCard({
  notif,
  onMarkRead,
  onDismiss,
}: {
  notif: NotificationRecord;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const cfg = typeConfig[notif.type];
  const Icon = cfg.icon;

  return (
    <div
      className={`flex items-start gap-4 rounded-lg p-4 border transition-colors ${notif.read ? "bg-card border-border/50" : "bg-primary/[0.03] border-primary/20"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}
      >
        <Icon className={`w-4 h-4 ${cfg.text}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${cfg.bg} ${cfg.text} ${cfg.border} border font-normal`}
          >
            {cfg.label}
          </Badge>
          {!notif.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
          )}
          <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
            {formatDistanceToNow(new Date(notif.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p
          className={`text-sm mt-1 ${notif.read ? "text-foreground/70" : "font-medium"}`}
        >
          {notif.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {notif.description}
        </p>
        {notif.link_short_url && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-primary/80 hover:text-primary cursor-pointer w-fit">
            <ExternalLink className="w-3 h-3" />
            <span>{notif.link_short_url}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        {!notif.read && (
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            title="Mark as read"
            onClick={() => onMarkRead(notif.id)}
          >
            <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7"
          title="Dismiss"
          onClick={() => onDismiss(notif.id)}
        >
          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { toast } = useToast();
  const { links: apiLinks, saveMilestones } = useLinks();
  const {
    notifications: apiNotifications,
    unread,
    preferences,
    isLoading,
    isMutating,
    markRead: markReadApi,
    markAllRead: markAllReadApi,
    dismiss: dismissApi,
    savePreferences: savePreferencesApi,
  } = useNotifications();
  const notifications = apiNotifications;
  const [digestEnabled, setDigestEnabled] = useState(
    preferences.digest_enabled,
  );
  const [healthEnabled, setHealthEnabled] = useState(
    preferences.health_enabled,
  );
  const [defaultThreshold, setDefaultThreshold] = useState(
    String(preferences.default_threshold),
  );
  const [linkThresholds, setLinkThresholds] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    setDigestEnabled(preferences.digest_enabled);
    setHealthEnabled(preferences.health_enabled);
    setDefaultThreshold(String(preferences.default_threshold));
  }, [preferences]);

  useEffect(() => {
    setLinkThresholds(
      Object.fromEntries(
        apiLinks.map((link) => [
          link.id,
          link.milestone_threshold > 0 ? String(link.milestone_threshold) : "",
        ]),
      ),
    );
  }, [apiLinks]);

  const markRead = async (id: string) => {
    try {
      await markReadApi(id);
    } catch {
      toast({ title: "Unable to update notification", variant: "destructive" });
    }
  };
  const dismiss = async (id: string) => {
    try {
      await dismissApi(id);
    } catch {
      toast({
        title: "Unable to dismiss notification",
        variant: "destructive",
      });
    }
  };
  const markAllRead = async () => {
    try {
      await markAllReadApi();
    } catch {
      toast({
        title: "Unable to update notifications",
        variant: "destructive",
      });
    }
  };
  const saveSettings = async () => {
    try {
      await Promise.all([
        savePreferencesApi({
          digest_enabled: digestEnabled,
          health_enabled: healthEnabled,
          default_threshold: Number(defaultThreshold) || 0,
        }),
        ...(apiLinks.length > 0
          ? [
              saveMilestones({
                milestones: apiLinks.map((link) => ({
                  short_code: link.short_code,
                  milestone_threshold: linkThresholds[link.id]
                    ? Number(linkThresholds[link.id])
                    : 0,
                })),
              }),
            ]
          : []),
      ]);
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch {
      toast({ title: "Unable to save settings", variant: "destructive" });
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Notifications
              {unread > 0 && (
                <Badge className="bg-primary text-primary-foreground text-sm px-2">
                  {unread} new
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-1">
              Click milestones, health alerts, digests, and schedule events.
            </p>
          </div>
          {unread > 0 && (
            <Button variant="outline" className="gap-2" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4" /> Mark all as read
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Notification feed */}
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border rounded-lg bg-card text-muted-foreground gap-3">
                <Bell className="w-8 h-8 opacity-30" />
                <p className="text-sm">
                  You're all caught up — no notifications.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotifCard
                  key={n.id}
                  notif={n}
                  onMarkRead={markRead}
                  onDismiss={dismiss}
                />
              ))
            )}
          </div>

          {/* Settings sidebar */}
          <div className="space-y-4">
            {/* Delivery settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Delivery Settings</CardTitle>
                <CardDescription>
                  Choose how and when you're notified.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                      Weekly digest
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Top links summary every Monday.
                    </p>
                  </div>
                  <Switch
                    checked={digestEnabled}
                    onCheckedChange={setDigestEnabled}
                    disabled={isMutating}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                      Health alerts
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Notify when a destination goes down.
                    </p>
                  </div>
                  <Switch
                    checked={healthEnabled}
                    onCheckedChange={setHealthEnabled}
                    disabled={isMutating}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                    Default click milestone
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Alert me every time a link crosses this threshold.
                  </p>
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 1000"
                    value={defaultThreshold}
                    onChange={(e) => setDefaultThreshold(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Per-link milestones */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Per-link Milestones</CardTitle>
                <CardDescription>
                  Override the default threshold for individual links.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {apiLinks.map((link) => (
                  <div key={link.id} className="space-y-1">
                    <Label className="text-xs text-foreground font-medium truncate block max-w-full">
                      {link.short_url}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        placeholder={`default (${defaultThreshold})`}
                        value={linkThresholds[link.id] ?? ""}
                        onChange={(e) =>
                          setLinkThresholds((prev) => ({
                            ...prev,
                            [link.id]: e.target.value,
                          }))
                        }
                        className="h-8 text-xs"
                      />
                      {linkThresholds[link.id] && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() =>
                            setLinkThresholds((prev) => ({
                              ...prev,
                              [link.id]: "",
                            }))
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  className="w-full mt-2"
                  size="sm"
                  onClick={saveSettings}
                >
                  Save preferences
                </Button>
              </CardContent>
            </Card>

            {/* Next digest preview */}
            {digestEnabled && (
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" /> Next
                    digest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Scheduled for{" "}
                    <strong>
                      Monday,{" "}
                      {format(new Date(Date.now() + 7 * 86400000), "MMM d")}
                    </strong>{" "}
                    at 8:00 AM. It will summarise your top 5 links and total
                    clicks for the past week.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
