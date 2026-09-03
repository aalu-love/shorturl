import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Link as LinkIcon,
  BarChart3,
  Globe,
  QrCode,
  Shield,
  Users,
  ArrowRight,
  Check,
  Copy,
  Sparkles,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FEATURES = [
  {
    icon: LinkIcon,
    title: "Smart short links",
    description:
      "Turn any URL into a clean, branded link in milliseconds — with custom back-halves, tags, and expiration.",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description:
      "Track every click with location, device, and referrer breakdowns. Spot what's working before your meeting ends.",
  },
  {
    icon: Globe,
    title: "Custom domains",
    description:
      "Connect your own domain in minutes with guided DNS, automatic SSL, and per-domain analytics.",
  },
  {
    icon: QrCode,
    title: "QR codes built in",
    description:
      "Every short link comes with a downloadable, print-ready QR — no third-party tools required.",
  },
  {
    icon: Users,
    title: "Team workspaces",
    description:
      "Invite teammates, assign roles, and share branded links across your whole organization.",
  },
  {
    icon: Shield,
    title: "Enterprise security",
    description:
      "SSO, audit logs, role-based access, and password-protected links keep your campaigns locked down.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Paste your link",
    description:
      "Drop in any long URL. Add tags, a custom back-half, or a UTM template if you want.",
  },
  {
    number: "02",
    title: "Share anywhere",
    description:
      "Copy the short link or download a QR code. Use it on any channel — print, social, email.",
  },
  {
    number: "03",
    title: "Watch it perform",
    description:
      "Open analytics to see clicks roll in by country, device, and referrer in real time.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Everything you need to get started.",
    features: ["50 links / month", "Basic analytics", "1 user", "Standard domain"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "per month",
    description: "For creators and growing teams.",
    features: [
      "Unlimited links",
      "Advanced analytics",
      "5 team members",
      "3 custom domains",
      "QR code customization",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$79",
    cadence: "per month",
    description: "Built for scaling organizations.",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Unlimited domains",
      "SSO + SAML",
      "Audit logs",
      "Priority support",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
];

const STATS = [
  { value: "120M+", label: "Links shortened" },
  { value: "8B+", label: "Clicks tracked" },
  { value: "12K+", label: "Active teams" },
  { value: "99.99%", label: "Uptime SLA" },
];

export default function Landing() {
  const { toast } = useToast();
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) return;
    const code = Math.random().toString(36).substring(2, 8);
    setShortUrl(`sh.rt/${code}`);
  };

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(`https://${shortUrl}`);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-base tracking-tight"
          >
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <LinkIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            shortURL
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how" className="hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">
                Get started
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <Badge
              variant="secondary"
              className="mb-6 gap-1.5 px-3 py-1 text-xs font-medium"
            >
              <Sparkles className="w-3 h-3" />
              New: Workspace audit logs are live
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-foreground">
              Short links that
              <br />
              <span className="italic font-serif text-muted-foreground">
                actually mean something.
              </span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Build branded, trackable URLs in seconds. Connect your own
              domain, see real-time analytics, and run every link your team
              ships from a single calm dashboard.
            </p>

            {/* Inline shortener */}
            <form onSubmit={handleShorten} className="mt-10 max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 p-2 bg-card border border-border rounded-xl shadow-sm">
                <Input
                  type="url"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  placeholder="https://example.com/your-very-long-url..."
                  className="flex-1 border-none shadow-none focus-visible:ring-0 text-base h-11"
                />
                <Button type="submit" size="lg" className="h-11 px-6">
                  Shorten link
                </Button>
              </div>
              {shortUrl && (
                <div className="mt-4 flex items-center justify-between gap-2 px-4 py-3 bg-card border border-border rounded-lg text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <LinkIcon className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate">
                        {shortUrl}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {longUrl}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="shrink-0 gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </Button>
                </div>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                No credit card required. Free forever for personal use.
              </p>
            </form>
          </div>

          {/* Stats strip */}
          <div className="mt-20 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 text-xs">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Everything your links need.
              <br />
              <span className="text-muted-foreground">Nothing they don't.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              A focused toolkit that handles the boring parts so you can spend
              your time on the campaigns themselves.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-card p-8 hover:bg-muted/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center mb-5">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-16">
            <Badge variant="outline" className="mb-4 text-xs">
              How it works
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              From long URL to live link
              <br />
              <span className="text-muted-foreground">in three steps.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, idx) => (
              <div key={step.number} className="relative">
                <div className="text-sm font-mono text-muted-foreground mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold tracking-tight mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-2 right-0 w-8 h-px bg-border -mr-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4 text-xs">
              Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Simple, honest pricing.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Start free. Upgrade when you outgrow it. No surprise charges, no
              annual contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.highlighted
                    ? "border-foreground shadow-lg relative"
                    : "border-border"
                }
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3">Most popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                    {plan.name}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.cadence}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <Button
                    asChild
                    className="w-full mt-6"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    <Link href="/register">{plan.cta}</Link>
                  </Button>
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 mt-0.5 text-foreground shrink-0" />
                        <span className="text-muted-foreground">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Ready to clean up your links?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Set up your workspace in under a minute. Bring your own domain
            whenever you're ready.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Create free account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <LinkIcon className="w-3 h-3 text-primary-foreground" />
            </div>
            <span>shortURL — built for fast teams.</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
          <div className="text-xs text-muted-foreground">
            © 2026 shortURL. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
