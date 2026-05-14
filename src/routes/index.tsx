import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Shield, Zap, Lock, Globe, Eye, Fingerprint, Activity, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Obsidian VPN — Digital Privacy Reinvented" },
      { name: "description", content: "Next-gen cybersecurity tools and privacy suite. URL scanning, breach detection, password tools, and more." },
      { property: "og:title", content: "Obsidian VPN — Digital Privacy Reinvented" },
      { property: "og:description", content: "Next-gen cybersecurity tools and privacy suite." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Shield, title: "URL Scanner", desc: "Detect malicious links before you click." },
  { icon: Lock, title: "Password Strength", desc: "Real-time entropy & breach analysis." },
  { icon: Zap, title: "Password Generator", desc: "Cryptographically secure on-device." },
  { icon: Eye, title: "Email Breach Checker", desc: "Scan billions of leaked records." },
  { icon: Globe, title: "IP Lookup", desc: "Geolocate, trace, and inspect any IP." },
  { icon: Fingerprint, title: "Fingerprint Scanner", desc: "See what trackers see about you." },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Test the waters.",
    features: ["Access to 1 tool", "2 uses per day", "Community support"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Gold",
    price: "$9",
    period: "/month",
    desc: "For everyday privacy.",
    features: ["All 6 tools unlocked", "50 uses daily", "Priority support", "Scan history"],
    cta: "Go Gold",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$24",
    period: "/month",
    desc: "Zero limits.",
    features: ["Unlimited usage", "All tools + early access", "API access", "Dedicated support"],
    cta: "Go Pro",
    highlight: false,
  },
];

const testimonials = [
  { name: "Alex Mercer", role: "Security Engineer", quote: "Obsidian replaced four tools in my workflow. The fingerprint scanner alone is worth it." },
  { name: "Lina Rao", role: "Founder, Cipherlabs", quote: "Beautiful UI, serious privacy. My entire team migrated within a week." },
  { name: "Jonas K.", role: "Pentester", quote: "Fastest URL scanner I've used. The dashboard is genuinely a joy." },
];

function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="mx-auto max-w-5xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            v2.0 — Now with on-device fingerprint scanning
          </div>
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-semibold tracking-tight leading-[0.95]">
            Digital Privacy<br />
            <span className="neon-text">Reinvented.</span>
          </h1>
          <p className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto">
            A unified cybersecurity suite for the modern web. Scan, encrypt, generate, and audit — from a single matte-black dashboard.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold animate-pulse-neon hover:scale-[1.02] transition"
            >
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </Link>
            <a href="#features" className="px-7 py-3.5 rounded-xl glass text-foreground hover:border-primary/40 transition">
              Explore tools
            </a>
          </div>
        </div>

        {/* Floating preview card */}
        <div className="mt-24 mx-auto max-w-4xl animate-float">
          <div className="glass p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary/80" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">obsidian://dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="glass p-4">
                <Activity className="h-5 w-5 text-primary mb-2" />
                <div className="text-2xl font-semibold">98</div>
                <div className="text-xs text-muted-foreground">Security score</div>
              </div>
              <div className="glass p-4">
                <Shield className="h-5 w-5 text-primary mb-2" />
                <div className="text-2xl font-semibold">1,284</div>
                <div className="text-xs text-muted-foreground">Threats blocked</div>
              </div>
              <div className="glass p-4">
                <Lock className="h-5 w-5 text-primary mb-2" />
                <div className="text-2xl font-semibold">0</div>
                <div className="text-xs text-muted-foreground">Breaches found</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-primary font-mono mb-3">// FEATURES</p>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Six tools. One obsidian-black dashboard.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="glass glass-hover p-6">
                <div className="h-11 w-11 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-5">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm text-primary font-mono mb-3">// PRICING</p>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">Pick your shield.</h2>
            <p className="mt-4 text-muted-foreground">Cancel anytime. No tracking. No bullshit.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`glass p-8 relative ${p.highlight ? "border-primary/60 neon-glow" : ""}`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most popular
                  </div>
                )}
                <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-5xl font-semibold">{p.price}</span>
                  <span className="text-muted-foreground">{p.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <ul className="mt-6 space-y-3">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/dashboard"
                  className={`mt-8 w-full inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold transition ${
                    p.highlight
                      ? "bg-primary text-primary-foreground hover:scale-[1.02]"
                      : "border border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-primary font-mono mb-3">// REVIEWS</p>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">Trusted by paranoids.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="glass p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground/90 mb-6">"{t.quote}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
