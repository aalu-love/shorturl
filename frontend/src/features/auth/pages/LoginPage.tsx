import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Link as LinkIcon } from "lucide-react";
import { LoginForm, SsoButtons } from "@/features/auth/components/LoginForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/shared/constants/routes";
import { ROLES } from "@/shared/constants/roles";

export default function LoginPage() {
  const { login, isAuthenticated, role } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (_values: {
    email: string;
    password: string;
    remember: boolean;
  }) => {
    // TODO: dispatch login action via useAuth() when backend is ready
    try {
      await login({
        email: _values.email,
        password: _values.password,
      });
      toast({
        title: "Welcome back",
        description: "You're signed in to your workspace.",
      });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
      });
    }
  };

  const handleSso = async (provider: string) => {
    toast({
      title: `Continuing with ${provider}`,
      description: "Redirecting you to your workspace.",
    });
    await setLocation(ROUTES.DASHBOARD);
  };

  useEffect(() => {
    if (isAuthenticated) {
      setLocation(
        role === ROLES.ADMIN ? ROUTES.DASHBOARD : ROUTES.MY_DASHBOARD,
      );
    }
  }, [isAuthenticated, role, setLocation]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      {/* Left: form */}
      <div className="flex-1 flex flex-col px-6 py-8 md:px-12 md:py-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-base tracking-tight self-start"
        >
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <LinkIcon className="w-4 h-4 text-primary-foreground" />
          </div>
          shortURL
        </Link>

        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to manage your short links and analytics.
              </p>
            </div>

            <SsoButtons onSso={handleSso} />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or continue with email
                </span>
              </div>
            </div>

            <LoginForm onSubmit={handleSubmit} />
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center md:text-left">
          © 2026 shortURL. All rights reserved.
        </div>
      </div>

      {/* Right: marketing panel */}
      <div className="hidden lg:flex flex-1 bg-foreground text-background relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2 text-sm opacity-80">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            All systems operational
          </div>
          <div className="max-w-md">
            <blockquote className="text-2xl font-semibold leading-snug tracking-tight">
              "We replaced three different link tools with shortURL. Setup took
              an afternoon and our marketing team finally agrees on
              attribution."
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-sm font-semibold">
                MR
              </div>
              <div>
                <div className="text-sm font-medium">Maya Reyes</div>
                <div className="text-xs opacity-60">Head of Growth, Linear</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 max-w-md">
            {[
              ["120M+", "Links shortened"],
              ["8B+", "Clicks tracked"],
              ["99.99%", "Uptime SLA"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="text-2xl font-bold">{v}</div>
                <div className="text-xs opacity-60 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div
          aria-hidden
          className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]"
        />
      </div>
    </div>
  );
}
