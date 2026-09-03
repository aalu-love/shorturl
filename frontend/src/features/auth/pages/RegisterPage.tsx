import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link as LinkIcon, Mail, Lock, User, ArrowRight, Github, Eye, EyeOff, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SsoButtons } from "@/features/auth/components/LoginForm";

const PERKS = [
  "50 short links per month, free forever",
  "Real-time click analytics",
  "QR codes for every link",
  "Connect your own domain anytime",
];

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too short", "Weak", "Fair", "Strong", "Excellent"];
  const colors = ["bg-muted", "bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];
  return { score, label: labels[score], color: colors[score] };
}

export default function RegisterPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const strength = passwordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      toast({ title: "Please accept the terms", description: "You need to agree to the terms to continue.", variant: "destructive" });
      return;
    }
    toast({ title: "Account created", description: "Your workspace is ready. Welcome to shortURL." });
    setLocation("/my-dashboard");
  };

  const handleSso = (provider: string) => {
    toast({ title: `Continuing with ${provider}`, description: "Setting up your new workspace." });
    setLocation("/my-dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <div className="flex-1 flex flex-col px-6 py-8 md:px-12 md:py-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight self-start">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <LinkIcon className="w-4 h-4 text-primary-foreground" />
          </div>
          shortURL
        </Link>

        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
              <p className="mt-2 text-sm text-muted-foreground">Start shortening, sharing, and tracking links in minutes.</p>
            </div>

            <SsoButtons onSso={handleSso} />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} className="pl-9" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Work email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-9" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} className="pl-9 pr-9" minLength={8} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-muted"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">Password strength: {strength.label}</p>
                  </div>
                )}
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="agree" checked={agree} onCheckedChange={c => setAgree(c === true)} className="mt-0.5" />
                <label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer select-none leading-snug">
                  I agree to the{" "}<a href="#" className="text-foreground hover:underline">Terms of Service</a>{" "}and{" "}<a href="#" className="text-foreground hover:underline">Privacy Policy</a>.
                </label>
              </div>
              <Button type="submit" className="w-full gap-2">Create account <ArrowRight className="w-4 h-4" /></Button>
            </form>

            <p className="mt-8 text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-foreground font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center md:text-left">© 2026 shortURL. All rights reserved.</div>
      </div>

      <div className="hidden lg:flex flex-1 bg-foreground text-background relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2 text-sm opacity-80">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Free forever — no credit card required
          </div>
          <div className="max-w-md">
            <h2 className="text-3xl font-bold tracking-tight leading-tight">Everything you need to launch<br /><span className="opacity-60">on day one.</span></h2>
            <ul className="mt-8 space-y-4">
              {PERKS.map(perk => (
                <li key={perk} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-background/10 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm opacity-90 leading-relaxed">{perk}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-sm opacity-60">Join 12,000+ teams already shipping branded short links.</div>
        </div>
        <div aria-hidden className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
      </div>
    </div>
  );
}
