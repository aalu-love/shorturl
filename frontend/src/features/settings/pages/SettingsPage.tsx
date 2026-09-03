import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { useDomains } from "@/features/domains/hooks/useDomains";

export default function SettingsPage() {
  const { toast } = useToast();
  const { settings, isLoading, isSaving, error, save } = useSettings();
  const { domains } = useDomains();
  const [workspaceName, setWorkspaceName] = useState("Acme Corp");
  const [defaultDomain, setDefaultDomain] = useState("sh.rt");
  const [requireSso, setRequireSso] = useState(false);
  const [publicAnalytics, setPublicAnalytics] = useState(true);

  useEffect(() => {
    if (!settings) return;
    setWorkspaceName(settings.workspace_name);
    setDefaultDomain(settings.default_domain);
    setRequireSso(settings.require_sso);
    setPublicAnalytics(settings.public_analytics);
  }, [settings]);

  const handleSave = async () => {
    try {
      await save({
        workspace_name: workspaceName,
        default_domain: defaultDomain,
        require_sso: requireSso,
        public_analytics: publicAnalytics,
      });
      toast({
        title: "Settings saved",
        description: "Your workspace settings have been updated.",
      });
    } catch (saveError) {
      toast({
        title: "Unable to save settings",
        description: String(saveError),
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Workspace Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your team's preferences and configuration.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[250px_1fr]">
          <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1">
            <Button variant="secondary" className="justify-start">
              General
            </Button>
            <Button variant="ghost" className="justify-start">
              Link Defaults
            </Button>
            <Button variant="ghost" className="justify-start">
              API & Integrations
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Danger Zone
            </Button>
          </nav>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Identity</CardTitle>
                <CardDescription>
                  This is your workspace's visible name and default domain.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input
                    id="workspace-name"
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Default Domain</Label>
                  <Select
                    value={defaultDomain}
                    onValueChange={setDefaultDomain}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sh.rt">
                        sh.rt (System Default)
                      </SelectItem>
                      {domains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.domain}>
                          {domain.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    All new links will use this domain unless specified
                    otherwise.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave} disabled={isLoading || isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security & Access</CardTitle>
                <CardDescription>
                  Manage who can access your workspace and links.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require SSO</Label>
                    <p className="text-sm text-muted-foreground">
                      Require all users to log in with Single Sign-On.
                    </p>
                  </div>
                  <Switch
                    checked={requireSso}
                    onCheckedChange={setRequireSso}
                    disabled={isSaving}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Public Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anyone with the link to view analytics data by
                      appending '+'.
                    </p>
                  </div>
                  <Switch
                    checked={publicAnalytics}
                    onCheckedChange={setPublicAnalytics}
                    disabled={isSaving}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Destructive actions for your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Delete Workspace</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently remove your workspace and all associated data.
                    </p>
                  </div>
                  <Button variant="destructive">Delete Workspace</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
