import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shield, LayoutDashboard, Wrench, Activity, Settings, LogOut, Crown,
  Search, Lock, Key, Mail, Globe, Fingerprint, ArrowUpRight, Zap,
  TrendingUp, AlertTriangle, CheckCircle2, User
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Obsidian VPN" },
      { name: "description", content: "Your Obsidian VPN security command center." },
    ],
  }),
  component: Dashboard,
});

const tools = [
  { id: "url", name: "URL Scanner", icon: Search, desc: "Check links for malware & phishing", color: "from-emerald-500/20" },
  { id: "pwd-check", name: "Password Strength", icon: Lock, desc: "Audit password entropy", color: "from-emerald-500/20" },
  { id: "pwd-gen", name: "Password Generator", icon: Key, desc: "Generate secure passwords", color: "from-emerald-500/20" },
  { id: "breach", name: "Email Breach Checker", icon: Mail, desc: "Scan leaked databases", color: "from-emerald-500/20" },
  { id: "ip", name: "IP Lookup", icon: Globe, desc: "Geolocate any IP address", color: "from-emerald-500/20" },
  { id: "fp", name: "Fingerprint Scanner", icon: Fingerprint, desc: "Audit your browser exposure", color: "from-emerald-500/20" },
];

const activity = [
  { icon: CheckCircle2, text: "URL scan completed — example.com", time: "2m ago", ok: true },
  { icon: AlertTriangle, text: "Weak password detected in audit", time: "1h ago", ok: false },
  { icon: CheckCircle2, text: "Email breach check — no leaks", time: "3h ago", ok: true },
  { icon: CheckCircle2, text: "Password generated (32 chars)", time: "Yesterday", ok: true },
];

const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Wrench, label: "Tools" },
  { icon: Activity, label: "Activity" },
  { icon: Settings, label: "Settings" },
];

function Dashboard() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

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

        <button className="mt-4 flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="border-b border-border/40 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Welcome back, operator</h1>
            <p className="text-xs text-muted-foreground font-mono">Last sync: just now</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
              <Crown className="h-4 w-4" /> Upgrade plan
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg glass">
              <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden sm:inline text-sm">Alex</span>
            </button>
          </div>
        </header>

        <div className="p-6 grid gap-6 lg:grid-cols-3">
          {/* Security score */}
          <div className="glass p-6 lg:col-span-2 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-xs font-mono text-primary mb-2">// SECURITY SCORE</p>
                <h2 className="text-2xl font-semibold">Your privacy posture</h2>
                <p className="text-sm text-muted-foreground mt-1">Based on recent audits & active tools.</p>
              </div>
              <div className="flex items-center gap-1 text-primary text-sm">
                <TrendingUp className="h-4 w-4" /> +6 this week
              </div>
            </div>
            <div className="mt-8 flex items-end gap-6 relative">
              <div className="text-7xl font-semibold neon-text">98</div>
              <div className="pb-3">
                <div className="text-sm text-muted-foreground">/ 100</div>
                <div className="text-sm font-medium text-primary mt-1">Excellent</div>
              </div>
            </div>
            <div className="mt-6 h-2 rounded-full bg-secondary overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full neon-glow" style={{ width: "98%" }} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass p-6">
            <p className="text-xs font-mono text-primary mb-4">// QUICK ACTIONS</p>
            <div className="space-y-2">
              {[
                { icon: Search, label: "Scan a URL" },
                { icon: Mail, label: "Check email breach" },
                { icon: Key, label: "Generate password" },
                { icon: Zap, label: "Run full audit" },
              ].map((a) => (
                <button key={a.label} className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-sidebar-accent transition group">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <a.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{a.label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </button>
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
                <button
                  key={t.id}
                  onClick={() => setSelectedTool(t.id)}
                  className={`glass glass-hover p-5 text-left ${selectedTool === t.id ? "border-primary/60 neon-glow" : ""}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <t.icon className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h4 className="font-semibold">{t.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="glass p-6">
            <p className="text-xs font-mono text-primary mb-4">// RECENT ACTIVITY</p>
            <div className="space-y-4">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${a.ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{a.text}</p>
                    <p className="text-xs text-muted-foreground font-mono">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-5 text-xs text-primary hover:underline">View full log →</button>
          </div>
        </div>
      </main>
    </div>
  );
}
