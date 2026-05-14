import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ArrowLeft, Eye, EyeOff, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Circle as XCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/tools/password-strength")({
  head: () => ({ meta: [{ title: "Password Strength — Obsidian VPN" }] }),
  component: PasswordStrengthWrapper,
});

function PasswordStrengthWrapper() {
  return (
    <ProtectedRoute>
      <PasswordStrengthChecker />
    </ProtectedRoute>
  );
}

type StrengthResult = {
  score: number;
  label: string;
  color: string;
  barColor: string;
  entropy: number;
  crackTime: string;
  checks: { label: string; pass: boolean }[];
  suggestions: string[];
};

function analyzePassword(pwd: string): StrengthResult {
  const checks = [
    { label: "At least 8 characters", pass: pwd.length >= 8 },
    { label: "At least 12 characters", pass: pwd.length >= 12 },
    { label: "Uppercase letters (A-Z)", pass: /[A-Z]/.test(pwd) },
    { label: "Lowercase letters (a-z)", pass: /[a-z]/.test(pwd) },
    { label: "Numbers (0-9)", pass: /[0-9]/.test(pwd) },
    { label: "Special characters (!@#$…)", pass: /[^A-Za-z0-9]/.test(pwd) },
    { label: "No common patterns", pass: !/(password|123456|qwerty|abc|admin|letmein)/i.test(pwd) },
    { label: "No repeated characters", pass: !/(.)\\1{2,}/.test(pwd) },
  ];

  let charsetSize = 0;
  if (/[a-z]/.test(pwd)) charsetSize += 26;
  if (/[A-Z]/.test(pwd)) charsetSize += 26;
  if (/[0-9]/.test(pwd)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(pwd)) charsetSize += 32;

  const entropy = charsetSize > 0 ? Math.log2(Math.pow(charsetSize, pwd.length)) : 0;

  const guesses = Math.pow(charsetSize, pwd.length);
  const seconds = guesses / 1_000_000_000;
  let crackTime: string;
  if (seconds < 1) crackTime = "Instantly";
  else if (seconds < 60) crackTime = `${Math.round(seconds)} seconds`;
  else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} minutes`;
  else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} hours`;
  else if (seconds < 2592000) crackTime = `${Math.round(seconds / 86400)} days`;
  else if (seconds < 31536000) crackTime = `${Math.round(seconds / 2592000)} months`;
  else if (seconds < 3.154e9) crackTime = `${Math.round(seconds / 31536000)} years`;
  else if (seconds < 3.154e12) crackTime = `${Math.round(seconds / 3.154e9).toLocaleString()} thousand years`;
  else crackTime = "Centuries";

  const score = Math.min(100, Math.round((entropy / 80) * 100));

  const label =
    score >= 80 ? "Strong" :
    score >= 60 ? "Good" :
    score >= 40 ? "Fair" :
    score >= 20 ? "Weak" :
    "Very Weak";

  const color =
    score >= 80 ? "text-primary" :
    score >= 60 ? "text-emerald-400" :
    score >= 40 ? "text-yellow-400" :
    score >= 20 ? "text-orange-400" :
    "text-destructive";

  const barColor =
    score >= 80 ? "bg-primary" :
    score >= 60 ? "bg-emerald-400" :
    score >= 40 ? "bg-yellow-400" :
    score >= 20 ? "bg-orange-400" :
    "bg-destructive";

  const suggestions: string[] = [];
  if (pwd.length < 12) suggestions.push("Use at least 12 characters for better security");
  if (!/[A-Z]/.test(pwd)) suggestions.push("Add uppercase letters");
  if (!/[0-9]/.test(pwd)) suggestions.push("Include numbers");
  if (!/[^A-Za-z0-9]/.test(pwd)) suggestions.push("Add special characters like !@#$%");
  if (/(password|123456|qwerty|abc|admin|letmein)/i.test(pwd)) suggestions.push("Avoid common words and patterns");
  if (suggestions.length === 0 && score < 80) suggestions.push("Consider using a passphrase of 4+ random words");

  return { score, label, color, barColor, entropy: Math.round(entropy), crackTime, checks, suggestions };
}

function PasswordStrengthChecker() {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const result = password.length > 0 ? analyzePassword(password) : null;

  const handleSave = async () => {
    if (!user || !result) return;
    await supabase.from("tool_history").insert({
      user_id: user.id,
      tool: "pwd-check",
      input: `[${password.length} chars]`,
      result: { score: result.score, label: result.label, entropy: result.entropy, crackTime: result.crackTime },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition text-sm">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Password Strength</h1>
            <p className="text-sm text-muted-foreground">Real-time entropy analysis and crack time estimation</p>
          </div>
        </div>

        <div className="glass p-6 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Enter your password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type or paste your password"
                autoComplete="off"
                className="w-full px-4 py-3 pr-12 rounded-lg bg-input border border-border/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Your password is analyzed locally and never sent to our servers.</p>
          </div>
        </div>

        {result && (
          <div className="space-y-4 animate-fade-up">
            <div className="glass p-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-1">STRENGTH</p>
                  <h2 className={`text-3xl font-semibold ${result.color}`}>{result.label}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-muted-foreground mb-1">ENTROPY</p>
                  <p className="text-2xl font-semibold font-mono">{result.entropy} <span className="text-sm text-muted-foreground">bits</span></p>
                </div>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${result.barColor}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Very Weak</span><span>Weak</span><span>Fair</span><span>Good</span><span>Strong</span>
              </div>
            </div>

            <div className="glass p-5">
              <p className="text-xs font-mono text-primary mb-2">// ESTIMATED CRACK TIME</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-semibold font-mono ${result.color}`}>{result.crackTime}</span>
                <span className="text-xs text-muted-foreground">at 1 billion guesses/second</span>
              </div>
            </div>

            <div className="glass p-5">
              <p className="text-xs font-mono text-primary mb-4">// SECURITY CHECKS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.checks.map((check) => (
                  <div key={check.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${check.pass ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                    {check.pass ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0 text-destructive/50" />}
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {result.suggestions.length > 0 && (
              <div className="glass p-5">
                <p className="text-xs font-mono text-primary mb-4">// SUGGESTIONS</p>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full px-5 py-3 rounded-lg border border-border hover:border-primary/50 text-sm transition flex items-center justify-center gap-2"
            >
              {saved ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
              {saved ? "Saved to history" : "Save audit to history"}
            </button>
          </div>
        )}

        {!result && (
          <div className="glass p-8 text-center text-muted-foreground">
            <Lock className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Type a password above to analyze its strength, entropy, and estimated crack time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
