import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ArrowLeft, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Shield, ExternalLink, Loader as Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/tools/url-scanner")({
  head: () => ({ meta: [{ title: "URL Scanner — Obsidian VPN" }] }),
  component: UrlScannerWrapper,
});

function UrlScannerWrapper() {
  return (
    <ProtectedRoute>
      <UrlScanner />
    </ProtectedRoute>
  );
}

type ScanResult = {
  url: string;
  safe: boolean;
  risk: "low" | "medium" | "high";
  flags: string[];
  details: {
    hasSuspiciousTld: boolean;
    hasIpAddress: boolean;
    hasExcessiveSubdomains: boolean;
    hasUrlShortener: boolean;
    hasPhishingKeywords: boolean;
    hasDeceptiveChars: boolean;
    isHttps: boolean;
    domainLength: number;
  };
};

const SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club", ".work", ".click", ".link", ".online", ".site", ".win", ".download"];
const URL_SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "buff.ly", "adf.ly", "bc.vc", "shorte.st", "cutt.ly"];
const PHISHING_KEYWORDS = ["login", "signin", "account", "verify", "secure", "bank", "paypal", "amazon", "apple", "microsoft", "google", "update", "confirm", "password", "credential"];

function analyzeUrl(rawUrl: string): ScanResult {
  let url = rawUrl.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      url: rawUrl,
      safe: false,
      risk: "high",
      flags: ["Invalid URL format"],
      details: {
        hasSuspiciousTld: false,
        hasIpAddress: false,
        hasExcessiveSubdomains: false,
        hasUrlShortener: false,
        hasPhishingKeywords: false,
        hasDeceptiveChars: false,
        isHttps: false,
        domainLength: 0,
      },
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const fullPath = parsed.href.toLowerCase();

  const hasSuspiciousTld = SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld));
  const hasIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const hasExcessiveSubdomains = hostname.split(".").length > 4;
  const hasUrlShortener = URL_SHORTENERS.some((s) => hostname === s || hostname.endsWith("." + s));
  const hasPhishingKeywords = PHISHING_KEYWORDS.some((kw) =>
    fullPath.includes(kw) && !["google.com", "amazon.com", "apple.com", "microsoft.com", "paypal.com"].some((d) => hostname === d || hostname.endsWith("." + d))
  );
  const hasDeceptiveChars = /[а-яёА-ЯЁ\u0400-\u04FF]/.test(hostname) || hostname.includes("--") || hostname.includes("paypa1") || hostname.includes("g00gle") || hostname.includes("arnazon");
  const isHttps = parsed.protocol === "https:";
  const domainLength = hostname.length;

  const flags: string[] = [];
  if (!isHttps) flags.push("No HTTPS — connection is unencrypted");
  if (hasIpAddress) flags.push("URL uses raw IP address instead of domain");
  if (hasSuspiciousTld) flags.push("Suspicious top-level domain (TLD)");
  if (hasExcessiveSubdomains) flags.push("Excessive subdomain nesting (phishing pattern)");
  if (hasPhishingKeywords) flags.push("Contains phishing-related keywords");
  if (hasDeceptiveChars) flags.push("Deceptive characters or domain impersonation detected");
  if (hasUrlShortener) flags.push("URL shortener — hides the real destination");
  if (domainLength > 40) flags.push("Unusually long domain name");

  const riskScore =
    (hasSuspiciousTld ? 2 : 0) +
    (hasIpAddress ? 3 : 0) +
    (hasExcessiveSubdomains ? 1 : 0) +
    (hasPhishingKeywords ? 2 : 0) +
    (hasDeceptiveChars ? 3 : 0) +
    (!isHttps ? 1 : 0) +
    (hasUrlShortener ? 1 : 0) +
    (domainLength > 40 ? 1 : 0);

  const risk: "low" | "medium" | "high" = riskScore >= 4 ? "high" : riskScore >= 2 ? "medium" : "low";
  const safe = riskScore === 0;

  return {
    url,
    safe,
    risk,
    flags,
    details: { hasSuspiciousTld, hasIpAddress, hasExcessiveSubdomains, hasUrlShortener, hasPhishingKeywords, hasDeceptiveChars, isHttps, domainLength },
  };
}

function UrlScanner() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setScanning(true);

    await new Promise((r) => setTimeout(r, 900));
    const scanResult = analyzeUrl(input);
    setResult(scanResult);
    setScanning(false);

    if (user) {
      await supabase.from("tool_history").insert({
        user_id: user.id,
        tool: "url",
        input: input.trim().slice(0, 500),
        result: { safe: scanResult.safe, risk: scanResult.risk, flags: scanResult.flags },
      });
    }
  };

  const riskColor = result?.risk === "high" ? "text-destructive" : result?.risk === "medium" ? "text-yellow-400" : "text-primary";
  const riskBg = result?.risk === "high" ? "bg-destructive/10 border-destructive/30" : result?.risk === "medium" ? "bg-yellow-500/10 border-yellow-500/30" : "bg-primary/10 border-primary/30";

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
            <Search className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">URL Scanner</h1>
            <p className="text-sm text-muted-foreground">Detect malicious links before you click</p>
          </div>
        </div>

        <div className="glass p-6 mb-6">
          <form onSubmit={handleScan} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com or paste any URL"
              className="flex-1 px-4 py-3 rounded-lg bg-input border border-border/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition font-mono"
            />
            <button
              type="submit"
              disabled={scanning || !input.trim()}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {scanning ? "Scanning…" : "Scan"}
            </button>
          </form>
        </div>

        {result && (
          <div className="space-y-4 animate-fade-up">
            <div className={`glass p-6 border ${riskBg}`}>
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${result.safe ? "bg-primary/20" : "bg-destructive/20"}`}>
                  {result.safe ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <AlertTriangle className={`h-6 w-6 ${riskColor}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className={`text-xl font-semibold ${riskColor}`}>
                      {result.safe ? "Safe" : result.risk === "high" ? "High Risk" : "Suspicious"}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold uppercase border ${riskColor}`} style={{ borderColor: "currentColor" }}>
                      {result.risk} risk
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 font-mono break-all">{result.url}</p>
                </div>
              </div>
            </div>

            {result.flags.length > 0 && (
              <div className="glass p-5">
                <h3 className="text-sm font-mono text-primary mb-4">// THREAT INDICATORS</h3>
                <ul className="space-y-2">
                  {result.flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${result.risk === "high" ? "text-destructive" : "text-yellow-400"}`} />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="glass p-5">
              <h3 className="text-sm font-mono text-primary mb-4">// ANALYSIS BREAKDOWN</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "HTTPS", value: result.details.isHttps, good: true },
                  { label: "IP address URL", value: result.details.hasIpAddress, good: false },
                  { label: "Suspicious TLD", value: result.details.hasSuspiciousTld, good: false },
                  { label: "Excessive subdomains", value: result.details.hasExcessiveSubdomains, good: false },
                  { label: "Phishing keywords", value: result.details.hasPhishingKeywords, good: false },
                  { label: "Deceptive characters", value: result.details.hasDeceptiveChars, good: false },
                ].map((check) => {
                  const isWarning = check.good ? !check.value : check.value;
                  return (
                    <div key={check.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isWarning ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                      {isWarning ? <AlertTriangle className="h-3 w-3 shrink-0" /> : <CheckCircle2 className="h-3 w-3 shrink-0" />}
                      <span>{check.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {result.safe && (
              <div className="glass p-4 flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">
                  No threats detected. Always exercise caution with links from untrusted sources.
                </p>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0">
                  Visit <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {!result && !scanning && (
          <div className="glass p-8 text-center text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Enter a URL above to scan for threats, phishing indicators, and malicious patterns.</p>
          </div>
        )}
      </div>
    </div>
  );
}
