import { Link, useNavigate } from "@tanstack/react-router";
import { Shield, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export function Navbar() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate({ to: "/" });
  };

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

          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg glass hover:border-primary/40 transition"
                >
                  <User className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                >
                  {signingOut
                    ? <span className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    : <LogOut className="h-4 w-4" />
                  }
                  <span className="hidden sm:inline">{signingOut ? "Signing out…" : "Sign out"}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition shadow-[0_0_20px_rgba(0,255,150,0.35)]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
