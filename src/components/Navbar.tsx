import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-4">
        <div className="glass flex items-center justify-between px-4 sm:px-6 py-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 blur-md bg-primary/40 group-hover:bg-primary/60 transition" />
            </div>
            <span className="font-display font-semibold tracking-tight text-foreground">
              Obsidian<span className="text-primary">VPN</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition">Reviews</a>
          </nav>
          <Link
            to="/dashboard"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition shadow-[0_0_20px_rgba(0,255,150,0.35)]"
          >
            Launch App
          </Link>
        </div>
      </div>
    </header>
  );
}
