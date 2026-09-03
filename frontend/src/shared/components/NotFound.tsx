import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, ArrowLeft, Plus } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Minimal nav */}
      <header className="px-6 py-4 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2 font-bold text-sm tracking-tight w-fit">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <LinkIcon className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          shortURL
        </Link>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {/* Large icon */}
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
            <LinkIcon className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive flex items-center justify-center">
            <span className="text-destructive-foreground text-xs font-bold leading-none">!</span>
          </div>
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">404</p>
        <h1 className="text-4xl font-bold tracking-tight">This link doesn't exist</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-sm leading-relaxed">
          It may have expired, been deleted, or the short code was mistyped.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
          <Button asChild className="gap-2 px-6">
            <Link href="/register">
              <Plus className="w-4 h-4" /> Create your own short links
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" /> Back to homepage
            </Link>
          </Button>
        </div>

        {/* Bottom hint */}
        <p className="mt-12 text-xs text-muted-foreground/60">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      {/* Subtle grid bg */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03] [background-image:radial-gradient(circle_at_1px_1px,hsl(var(--foreground))_1px,transparent_0)] [background-size:32px_32px]"
      />
    </div>
  );
}
