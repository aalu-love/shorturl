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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Mail, Github, LogOut, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authStorage } from "@/features/auth/utils/authStorage";
import { AuthUser } from "@/features/auth/types/auth.types";
import { userUtils } from "@/features/auth/utils/userUtils";
import { useProfile } from "@/features/profile/hooks/useProfile";

export default function ProfilePage() {
  const { toast } = useToast();
  const user: AuthUser | null = authStorage.getUser();
  const {
    profile,
    isLoading,
    isSaving,
    isChangingPassword,
    error,
    update,
    changePassword,
  } = useProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setEmail(profile.email);
    setTwoFactorEnabled(profile.two_factor_enabled);
  }, [profile]);

  const saveProfile = async () => {
    try {
      const updated = await update({
        name,
        email,
        two_factor_enabled: twoFactorEnabled,
      });
      if (user)
        authStorage.setUser({
          ...user,
          name: updated.name ?? "",
          email: updated.email,
        });
      toast({
        title: "Profile updated",
        description: "Your personal details have been saved.",
      });
    } catch (saveError) {
      toast({
        title: "Unable to update profile",
        description: String(saveError),
        variant: "destructive",
      });
    }
  };

  const savePassword = async () => {
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      toast({
        title: "Password updated",
        description: "Your password has been changed.",
      });
    } catch (passwordError) {
      toast({
        title: "Unable to update password",
        description: String(passwordError),
        variant: "destructive",
      });
    }
  };

  const userInitials = userUtils.getUserInitials(user?.name || "User");

  return (
    <ProtectedLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and preferences.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your photo and personal details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20 border-2 border-border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Upload new photo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended size: 256x256px. Max file size: 2MB.
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={saveProfile} disabled={isLoading || isSaving}>
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your password and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" /> Two-Factor
                    Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                  disabled={isSaving}
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Change Password</h4>
                <div className="grid gap-4 max-w-sm">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-fit"
                    onClick={savePassword}
                    disabled={
                      isChangingPassword || !currentPassword || !newPassword
                    }
                  >
                    Update Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                Manage connected OAuth providers for faster login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Google</p>
                    <p className="text-xs text-muted-foreground">
                      Connected to {user?.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Disconnect
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">GitHub</p>
                    <p className="text-xs text-muted-foreground">
                      Not connected
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="ghost" className="text-muted-foreground gap-2">
              <LogOut className="w-4 h-4" /> Sign out of all sessions
            </Button>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
