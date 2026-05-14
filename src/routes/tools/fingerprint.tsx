import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FingerprintPattern as Fingerprint, ArrowLeft, Eye, Shield, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Loader as Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/tools/fingerprint")({
  head: () => ({ meta: [{ title: "Fingerprint Scanner — Obsidian VPN" }] }),
  component: FingerprintWrapper,
});

function FingerprintWrapper() {
  return (
    <ProtectedRoute>
      <FingerprintScanner />
    </ProtectedRoute>
  );
}

type FingerprintData = {
  userAgent: string;
  language: string;
  languages: string[];
  platform: string;
  screenResolution: string;
  colorDepth: number;
  deviceMemory: number | string;
  hardwareConcurrency: number;
  timezone: string;
  timezoneOffset: number;
  cookiesEnabled: boolean;
  doNotTrack: string | null;
  touchPoints: number;
  plugins: string[];
  canvas: string;
  webgl: string;
  fonts: string[];
  adBlock: boolean;
  webRtcEnabled: boolean;
  uniquenessScore: number;
};

async function collectFingerprint(): Promise<FingerprintData> {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { effectiveType?: string };
    msDoNotTrack?: string;
  };

  let canvasHash = "unavailable";
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = 200;
    canvas.height = 50;
    ctx.font = "14px Arial";
    ctx.fillStyle = "#0ff";
    ctx.fillRect(0, 0, 200, 50);
    ctx.fillStyle = "#f00";
    ctx.fillText("Obsidian Privacy", 10, 30);
    ctx.strokeStyle = "#0f0";
    ctx.beginPath();
    ctx.arc(150, 25, 20, 0, Math.PI * 2);
    ctx.stroke();
    const data = canvas.toDataURL();
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    canvasHash = Math.abs(hash).toString(16).toUpperCase();
  } catch {}

  let webglHash = "unavailable";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") as WebGLRenderingContext | null;
    if (gl) {
      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      webglHash = `${vendor} / ${renderer}`;
    }
  } catch {}

  const plugins: string[] = [];
  try {
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
  } catch {}

  let adBlock = false;
  try {
    const ad = document.createElement("div");
    ad.innerHTML = "&nbsp;";
    ad.className = "adsbox ad-banner";
    ad.style.position = "absolute";
    ad.style.left = "-9999px";
    document.body.appendChild(ad);
    adBlock = ad.offsetHeight === 0;
    document.body.removeChild(ad);
  } catch {}

  const testFonts = ["Arial", "Courier New", "Georgia", "Times New Roman", "Trebuchet MS", "Verdana", "Impact", "Comic Sans MS", "Tahoma", "Palatino"];
  const detectedFonts: string[] = [];
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const baseFonts = ["monospace", "sans-serif", "serif"];
    const testString = "mmmmmmmmmmlli";
    const testSize = "72px";
    const baseWidths: number[] = [];
    for (const base of baseFonts) {
      ctx.font = `${testSize} ${base}`;
      baseWidths.push(ctx.measureText(testString).width);
    }
    for (const font of testFonts) {
      for (let i = 0; i < baseFonts.length; i++) {
        ctx.font = `${testSize} '${font}', ${baseFonts[i]}`;
        if (ctx.measureText(testString).width !== baseWidths[i]) {
          detectedFonts.push(font);
          break;
        }
      }
    }
  } catch {}

  let score = 30;
  if (plugins.length > 0) score += 10;
  if (canvasHash !== "unavailable") score += 15;
  if (webglHash !== "unavailable") score += 15;
  if (detectedFonts.length > 3) score += 10;
  if ((nav.deviceMemory || 0) > 0) score += 5;
  if (!adBlock) score += 5;
  if (navigator.doNotTrack !== "1") score += 5;
  score = Math.min(100, score);

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: Array.from(navigator.languages || [navigator.language]),
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height} (${screen.availWidth}x${screen.availHeight} available)`,
    colorDepth: screen.colorDepth,
    deviceMemory: nav.deviceMemory || "unknown",
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    touchPoints: navigator.maxTouchPoints,
    plugins,
    canvas: canvasHash,
    webgl: webglHash,
    fonts: detectedFonts,
    adBlock,
    webRtcEnabled: typeof RTCPeerConnection !== "undefined",
    uniquenessScore: score,
  };
}

function FingerprintScanner() {
  const { user } = useAuth();
  const [result, setResult] = useState<FingerprintData | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    await new Promise((r) => setTimeout(r, 800));
    const fp = await collectFingerprint();
    setResult(fp);
    setScanning(false);

    if (user) {
      await supabase.from("tool_history").insert({
        user_id: user.id,
        tool: "fp",
        input: "browser-scan",
        result: {
          uniquenessScore: fp.uniquenessScore,
          platform: fp.platform,
          timezone: fp.timezone,
          adBlock: fp.adBlock,
          doNotTrack: fp.doNotTrack,
        },
      });
    }
  };

  const scoreColor = result
    ? result.uniquenessScore >= 70 ? "text-destructive" : result.uniquenessScore >= 50 ? "text-yellow-400" : "text-primary"
    : "";
  const scoreLabel = result
    ? result.uniquenessScore >= 70 ? "Highly Trackable" : result.uniquenessScore >= 50 ? "Moderately Trackable" : "Low Exposure"
    : "";

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
            <Fingerprint className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Fingerprint Scanner</h1>
            <p className="text-sm text-muted-foreground">See exactly what trackers can learn about your browser</p>
          </div>
        </div>

        {!result ? (
          <div className="glass p-10 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
              {scanning ? <Loader2 className="h-10 w-10 text-primary animate-spin" /> : <Eye className="h-10 w-10 text-primary" />}
            </div>
            <h3 className="text-lg font-semibold mb-2">{scanning ? "Scanning your browser…" : "Ready to scan"}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              {scanning
                ? "Collecting browser attributes, fonts, canvas hash, and more."
                : "Analyze what unique identifiers your browser exposes to tracking scripts."}
            </p>
            {!scanning && (
              <button
                onClick={handleScan}
                className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition animate-pulse-neon"
              >
                Start Scan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-up">
            <div className="glass p-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-1">TRACKABILITY SCORE</p>
                  <h2 className={`text-3xl font-semibold ${scoreColor}`}>{scoreLabel}</h2>
                </div>
                <div className="text-right">
                  <p className={`text-5xl font-semibold font-mono ${scoreColor}`}>{result.uniquenessScore}</p>
                  <p className="text-xs text-muted-foreground">/100</p>
                </div>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${result.uniquenessScore >= 70 ? "bg-destructive" : result.uniquenessScore >= 50 ? "bg-yellow-400" : "bg-primary"}`}
                  style={{ width: `${result.uniquenessScore}%` }}
                />
              </div>
            </div>

            <div className="glass p-5">
              <p className="text-xs font-mono text-primary mb-4">// PRIVACY SIGNALS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "AdBlock active", value: result.adBlock, good: true },
                  { label: "Do Not Track", value: result.doNotTrack === "1", good: true },
                  { label: "Cookies enabled", value: result.cookiesEnabled, good: false },
                  { label: "WebRTC enabled", value: result.webRtcEnabled, good: false },
                ].map(({ label, value, good }) => {
                  const isPositive = good ? value : !value;
                  return (
                    <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isPositive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                      {isPositive ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass p-5">
              <p className="text-xs font-mono text-primary mb-4">// BROWSER ATTRIBUTES</p>
              <div className="space-y-3">
                {[
                  { label: "Platform", value: result.platform },
                  { label: "Language", value: result.language },
                  { label: "Timezone", value: result.timezone },
                  { label: "Screen", value: result.screenResolution },
                  { label: "Color Depth", value: `${result.colorDepth}-bit` },
                  { label: "CPU Cores", value: String(result.hardwareConcurrency) },
                  { label: "Touch Points", value: String(result.touchPoints) },
                  { label: "Device RAM", value: typeof result.deviceMemory === "number" ? `${result.deviceMemory} GB` : "unknown" },
                  { label: "Canvas Hash", value: result.canvas },
                  { label: "WebGL Renderer", value: result.webgl },
                  { label: "Detected Fonts", value: result.fonts.length > 0 ? result.fonts.join(", ") : "None detected" },
                  { label: "Browser Plugins", value: result.plugins.length > 0 ? result.plugins.join(", ") : "None" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3 text-sm">
                    <span className="text-muted-foreground font-mono text-xs w-32 shrink-0 mt-0.5">{label}</span>
                    <span className="text-foreground break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-5">
              <p className="text-xs font-mono text-primary mb-2">// USER AGENT</p>
              <p className="text-xs font-mono text-muted-foreground break-all">{result.userAgent}</p>
            </div>

            <div className="glass p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                This data is collected locally and never transmitted. Trackers use this combination of attributes to identify you across websites without cookies.
              </p>
            </div>

            <button
              onClick={() => { setResult(null); handleScan(); }}
              className="w-full px-5 py-3 rounded-lg border border-border hover:border-primary/50 text-sm transition"
            >
              Rescan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
