import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Shield, LayoutDashboard, Wrench, Activity, Settings, LogOut, Crown,
  Search, Lock, Key, Mail, Globe, Fingerprint, ArrowUpRight, Zap,
  TrendingUp, AlertTriangle, CheckCircle2, RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Obsidian VPN" },
      { name: "description", content: "Your Obsidian VPN security command center." },
    ],
  }),
  component: DashboardWrapper,
});

const tools = [
  { id: "url", name: "URL Scanner", icon: Search, desc: "Check links for malware & phishing", path: "/tools/url-scanner" as const },
  { id: "pwd-check", name: "Password Strength", icon: Lock, desc: "Audit password entropy", path: "/tools/password-strength" as const },
  { id: "pwd-gen", name: "Password Generator", icon: Key, desc: "Generate secure passwords", path: "/tools/password-generator" as const },
  { id: "breach", name: "Email Breach Checker", icon: Mail, desc: "Scan leaked databases", path: "/tools/breach-checker" as const },
  { id: "ip", name: "IP Lookup", icon: Globe, desc: "Geolocate any IP address", path: "/tools/ip-lookup" as const },
  { id: "fp", name: "Fingerprint Scanner", icon: Fingerprint, desc: "Audit your browser exposure", path: "/tools/fingerprint" as const },
];

const toolIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  url: Search,
  "pwd-check": Lock,
  "pwd-gen": Key,
  breach: Mail,
  ip: Globe,
  fp: Fingerprint,
};

const toolNameMap: Record<string, string> = {
  url: "URL Scanner",
  "pwd-check": "Password Strength",
  "pwd-gen": "Password Generator",
  breach: "Email Breach Checker",
  ip: "IP Lookup",
  fp: "Fingerprint Scanner",
};

const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Wrench, label: "Tools" },
  { icon: Activity, label: "Activity" },
  { icon: Settings, label: "Settings" },
];

type HistoryItem = {
  id: string;
  tool: string;
  input: string;
  result: Record<string, unknown>;
  created_at: string;
};

function DashboardWrapper() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const [signingOut, setSigningOut] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.email?.split("@")[0] ?? "operator";
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!user) return;
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    const { data } = await supabase
      .from("tool_history")
      .select("id, tool, input, result, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(data ?? []);
    setHistoryLoading(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate({ to: "/" });
  };

  const formatTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const isPositiveResult = (item: HistoryItem): boolean => {
    const r = item.result;
    if (item.tool === "url") return r.safe === true;
    if (item.tool === "breach") return r.breached === false;
    if (item.tool === "pwd-check") return typeof r.score === "number" && (r.score as number) >= 60;
    return true;
  };

  const getActivityText = (item: HistoryItem): string => {
    const name = toolNameMap[item.tool] || item.tool;
    const r = item.result;
    if (item.tool === "url") return `${name} — ${item.input.slice(0, 35)} — ${r.safe ? "safe" : (r.risk as string) + " risk"}`;
    if (item.tool === "breach") return `${name} — ${r.breached ? (r.breachCount as number) + " breaches found" : "no breaches"}`;
    if (item.tool === "pwd-check") return `${name} — ${r.label as string} (${r.score as number}/100)`;
    if (item.tool === "pwd-gen") return `${name} — ${item.input}`;
    if (item.tool === "ip") return `${name} — ${item.input === "my-ip" ? "own IP" : item.input} — ${r.country as string}`;
    if (item.tool === "fp") return `${name} — trackability ${r.uniquenessScore as number}/100`;
    return name;
  };

  const totalScans = history.length;
  const breachScans = history.filter((h) => h.tool === "breach");
  const breachesFound = breachScans.filter((h) => h.result.breached === true).length;
  const urlScans = history.filter((h) => h.tool === "url");
  const threatsFound = urlScans.filter((h) => h.result.safe === false).length;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/40 bg-sidebar p-5">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-display font-semibold">Obsidian<span className="text-primary">VPN</span></span>
        </Link>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                item.active
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="glass p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Unlock unlimited usage & API access.</p>
          <button className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
            Upgrade
          </button>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-4 flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-50"
        >
          {signingOut
            ? <span className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            : <LogOut className="h-4 w-4" />
          }
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="border-b border-border/40 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 lg:hidden">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-sm">Obsidian<span className="text-primary">VPN</span></span>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold">Welcome back, {displayName}</h1>
            <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
              <Crown className="h-4 w-4" /> Upgrade plan
            </button>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass">
              <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>
              <span className="hidden sm:inline text-sm">{displayName}</span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="lg:hidden flex items-center gap-1 px-3 py-2 rounded-lg glass text-muted-foreground hover:text-foreground transition text-sm disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Mobile greeting */}
        <div className="lg:hidden px-4 pt-4 pb-0">
          <h1 className="text-lg font-semibold">Welcome back, {displayName}</h1>
          <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
        </div>

        <div className="p-4 sm:p-6 grid gap-6 lg:grid-cols-3">
          {/* Stats overview */}
          <div className="glass p-6 lg:col-span-2 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-xs font-mono text-primary mb-2">// SECURITY OVERVIEW</p>
                <h2 className="text-2xl font-semibold">Your privacy posture</h2>
                <p className="text-sm text-muted-foreground mt-1">Based on your scan history.</p>
              </div>
              <div className="flex items-center gap-1 text-primary text-sm">
                <TrendingUp className="h-4 w-4" /> Live
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 relative">
              <div className="glass p-4 text-center">
                <div className="text-2xl font-semibold font-mono">{totalScans}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Scans</div>
              </div>
              <div className="glass p-4 text-center">
                <div className={`text-2xl font-semibold font-mono ${threatsFound > 0 ? "text-destructive" : "text-primary"}`}>
                  {threatsFound}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Threats Found</div>
              </div>
              <div className="glass p-4 text-center">
                <div className={`text-2xl font-semibold font-mono ${breachesFound > 0 ? "text-destructive" : "text-primary"}`}>
                  {breachesFound}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Breaches</div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass p-6">
            <p className="text-xs font-mono text-primary mb-4">// QUICK ACTIONS</p>
            <div className="space-y-2">
              {[
                { icon: Search, label: "Scan a URL", path: "/tools/url-scanner" as const },
                { icon: Mail, label: "Check email breach", path: "/tools/breach-checker" as const },
                { icon: Key, label: "Generate password", path: "/tools/password-generator" as const },
                { icon: Zap, label: "Fingerprint scan", path: "/tools/fingerprint" as const },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={a.path}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-sidebar-accent transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <a.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{a.label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </Link>
              ))}
            </div>
          </div>

          {/* Tools grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tools</h3>
              <span className="text-xs text-muted-foreground font-mono">6 / 6 unlocked</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {tools.map((t) => (
                <Link
                  key={t.id}
                  to={t.path}
                  className="glass glass-hover p-5 block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <t.icon className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold">{t.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono text-primary">// RECENT ACTIVITY</p>
              <button onClick={loadHistory} className="text-muted-foreground hover:text-foreground transition" title="Refresh">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-8 w-8 rounded-lg bg-secondary shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-secondary rounded w-3/4" />
                      <div className="h-2 bg-secondary rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-6">
                <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No scans yet. Try a tool above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.slice(0, 6).map((item) => {
                  const ok = isPositiveResult(item);
                  const Icon = toolIconMap[item.tool] ?? Shield;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        {ok ? <Icon className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm truncate">{getActivityText(item)}</p>
                        <p className="text-xs text-muted-foreground font-mono">{formatTime(item.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
