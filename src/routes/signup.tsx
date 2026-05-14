import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GuestRoute } from "@/components/GuestRoute";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — Obsidian VPN" },
      { name: "description", content: "Create your Obsidian VPN account." },
    ],
  }),
  component: SignupPageWrapper,
});

function SignupPageWrapper() {
  return (
    <GuestRoute>
      <SignupPage />
    </GuestRoute>
  );
}

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordStrength = (): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: "", color: "", width: "0%" };
    if (password.length < 6) return { label: "Too short", color: "bg-destructive", width: "25%" };
    if (password.length < 10) return { label: "Weak", color: "bg-yellow-500", width: "50%" };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: "Fair", color: "bg-yellow-400", width: "65%" };
    if (password.length >= 12 && /[^A-Za-z0-9]/.test(password)) return { label: "Strong", color: "bg-primary", width: "100%" };
    return { label: "Good", color: "bg-primary/70", width: "80%" };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setSubmitting(false);
    } else {
      setSuccess(true);
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="w-full max-w-md relative z-10 animate-fade-up">
          <div className="glass p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Check your email</h2>
            <p className="text-sm text-muted-foreground mb-2">
              We sent a confirmation link to{" "}
              <span className="text-foreground font-medium">{email}</span>.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              After clicking the link, you'll be signed in and taken to your dashboard automatically.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary" />
              <div className="absolute inset-0 blur-md bg-primary/40 group-hover:bg-primary/60 transition" />
            </div>
            <span className="font-display text-xl font-semibold">
              Obsidian<span className="text-primary">VPN</span>
            </span>
          </Link>
          <h1 className="text-2xl font-semibold mt-4">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join the next generation of digital privacy</p>
        </div>

        <div className="glass p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@obsidian.io"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-input border border-border/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{strength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-3 pr-12 rounded-lg bg-input border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:ring-1 transition ${
                    confirmPassword && confirmPassword !== password
                      ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                      : "border-border/60 focus:border-primary/60 focus:ring-primary/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed animate-pulse-neon"
            >
              {submitting ? (
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
