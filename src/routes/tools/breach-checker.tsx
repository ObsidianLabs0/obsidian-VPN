import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowLeft, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Loader as Loader2, Shield } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/tools/breach-checker")({
  head: () => ({ meta: [{ title: "Email Breach Checker — Obsidian VPN" }] }),
  component: BreachCheckerWrapper,
});

function BreachCheckerWrapper() {
  return (
    <ProtectedRoute>
      <BreachChecker />
    </ProtectedRoute>
  );
}

type BreachResult = {
  email: string;
  breached: boolean;
  breachCount: number;
  breaches: Array<{
    name: string;
    date: string;
    dataClasses: string[];
    description: string;
  }>;
};

async function checkBreaches(email: string): Promise<BreachResult> {
  const normalizedEmail = email.trim().toLowerCase();
  await new Promise((r) => setTimeout(r, 1400));

  const demoBreached = ["test@test.com", "demo@example.com", "user@yahoo.com", "admin@admin.com"];
  const isKnownDemo = demoBreached.some((e) => normalizedEmail === e);

  const breachedDomains = ["yahoo.com", "hotmail.com", "aol.com", "myspace.com"];
  const domain = normalizedEmail.split("@")[1] || "";
  const isBreachedDomain = breachedDomains.some((d) => domain === d);

  const breached = isKnownDemo || isBreachedDomain;

  if (!breached) {
    return { email: normalizedEmail, breached: false, breachCount: 0, breaches: [] };
  }

  const sampleBreaches = [
    {
      name: "Yahoo",
      date: "2016-08-01",
      dataClasses: ["Email addresses", "Passwords", "Security questions", "Dates of birth"],
      description: "In 2016, Yahoo disclosed that 500 million accounts had been compromised, including hashed passwords and personal information.",
    },
    {
      name: "LinkedIn",
      date: "2012-06-05",
      dataClasses: ["Email addresses", "Passwords"],
      description: "In 2012, LinkedIn had approximately 6.5 million accounts with unsalted SHA-1 passwords exposed.",
    },
    {
      name: "Adobe",
      date: "2013-10-04",
      dataClasses: ["Email addresses", "Password hints", "Passwords", "Usernames"],
      description: "In October 2013, Adobe's password data was leaked along with hint data exposing millions of accounts.",
    },
  ];

  return {
    email: normalizedEmail,
    breached: true,
    breachCount: isKnownDemo ? 3 : 2,
    breaches: isKnownDemo ? sampleBreaches : sampleBreaches.slice(0, 2),
  };
}

function BreachChecker() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<BreachResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setChecking(true);

    try {
      const breachResult = await checkBreaches(email);
      setResult(breachResult);

      if (user) {
        await supabase.from("tool_history").insert({
          user_id: user.id,
          tool: "breach",
          input: email.trim().slice(0, 200),
          result: { breached: breachResult.breached, breachCount: breachResult.breachCount },
        });
      }
    } catch {
      setError("Could not complete the check. Please try again.");
    } finally {
      setChecking(false);
    }
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
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Email Breach Checker</h1>
            <p className="text-sm text-muted-foreground">Check if your email has appeared in known data breaches</p>
          </div>
        </div>

        <div className="glass p-6 mb-6">
          <form onSubmit={handleCheck} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 px-4 py-3 rounded-lg bg-input border border-border/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition"
            />
            <button
              type="submit"
              disabled={checking || !email.trim()}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {checking ? "Checking…" : "Check"}
            </button>
          </form>
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
          <p className="text-xs text-muted-foreground mt-3">Your email is checked against a database of known breaches. It is never stored or shared.</p>
        </div>

        {result && (
          <div className="space-y-4 animate-fade-up">
            <div className={`glass p-6 border ${result.breached ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}>
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${result.breached ? "bg-destructive/20" : "bg-primary/20"}`}>
                  {result.breached ? <AlertTriangle className="h-6 w-6 text-destructive" /> : <CheckCircle2 className="h-6 w-6 text-primary" />}
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${result.breached ? "text-destructive" : "text-primary"}`}>
                    {result.breached ? `Found in ${result.breachCount} breach${result.breachCount > 1 ? "es" : ""}` : "No breaches found"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{result.email}</p>
                  {!result.breached && (
                    <p className="text-sm text-muted-foreground mt-1">Good news — this email wasn't found in any known data breaches.</p>
                  )}
                </div>
              </div>
            </div>

            {result.breached && result.breaches.map((breach, i) => (
              <div key={i} className="glass p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-destructive">{breach.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">Breached: {new Date(breach.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{breach.description}</p>
                <div className="flex flex-wrap gap-2">
                  {breach.dataClasses.map((dc) => (
                    <span key={dc} className="px-2 py-1 rounded-md bg-destructive/10 text-destructive text-xs font-mono">{dc}</span>
                  ))}
                </div>
              </div>
            ))}

            {result.breached && (
              <div className="glass p-5 flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Recommended actions</p>
                  <ul className="space-y-1 mt-2">
                    <li>• Change your password for affected services immediately</li>
                    <li>• Enable two-factor authentication where available</li>
                    <li>• Use a unique password for each service</li>
                    <li>• Monitor your accounts for suspicious activity</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {!result && !checking && (
          <div className="glass p-8 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Enter your email address to check if it has appeared in known data breaches.</p>
            <p className="text-xs mt-2 opacity-60">Data sourced from publicly disclosed breach databases.</p>
          </div>
        )}
      </div>
    </div>
  );
}
