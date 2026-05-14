import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Globe, ArrowLeft, Loader as Loader2, MapPin, Server, Shield, Wifi } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/tools/ip-lookup")({
  head: () => ({ meta: [{ title: "IP Lookup — Obsidian VPN" }] }),
  component: IpLookupWrapper,
});

function IpLookupWrapper() {
  return (
    <ProtectedRoute>
      <IpLookup />
    </ProtectedRoute>
  );
}

type IpInfo = {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  org: string;
  asn: string;
  isProxy: boolean;
  isHosting: boolean;
};

async function lookupIp(ip: string): Promise<IpInfo> {
  const target = ip.trim() === "" || ip.trim().toLowerCase() === "me" ? "" : `/${ip.trim()}`;
  const res = await fetch(`https://ipapi.co${target}/json/`);
  if (!res.ok) throw new Error("Lookup failed");
  const data = await res.json();
  if (data.error) throw new Error(data.reason || "Invalid IP address");

  return {
    ip: data.ip || ip,
    city: data.city || "Unknown",
    region: data.region || "Unknown",
    country: data.country_name || "Unknown",
    countryCode: data.country_code || "",
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    timezone: data.timezone || "Unknown",
    isp: data.org || data.isp || "Unknown",
    org: data.org || "Unknown",
    asn: data.asn || "Unknown",
    isProxy: false,
    isHosting: (data.org || "").toLowerCase().includes("hosting") || (data.org || "").toLowerCase().includes("cloud"),
  };
}

function countryFlagEmoji(countryCode: string): string {
  const codePoints = [...countryCode.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function IpLookup() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<IpInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doLookup = async (ip: string) => {
    setError(null);
    setLoading(true);
    try {
      const info = await lookupIp(ip);
      setResult(info);
      if (user) {
        await supabase.from("tool_history").insert({
          user_id: user.id,
          tool: "ip",
          input: (ip.trim() || "my-ip").slice(0, 100),
          result: { ip: info.ip, country: info.country, city: info.city, isp: info.isp },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    doLookup(input);
  };

  const handleMyIp = () => {
    setInput("");
    doLookup("");
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
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">IP Lookup</h1>
            <p className="text-sm text-muted-foreground">Geolocate, trace, and inspect any IP address</p>
          </div>
        </div>

        <div className="glass p-6 mb-6">
          <form onSubmit={handleLookup} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="8.8.8.8 or leave blank for your IP"
              className="flex-1 px-4 py-3 rounded-lg bg-input border border-border/60 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              Lookup
            </button>
          </form>
          <div className="flex gap-2 mt-3">
            <button onClick={handleMyIp} disabled={loading} className="text-xs text-primary hover:underline disabled:opacity-50">
              Look up my IP
            </button>
          </div>
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </div>

        {result && (
          <div className="space-y-4 animate-fade-up">
            <div className="glass p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-primary mb-1">// IP ADDRESS</p>
                  <h2 className="text-3xl font-semibold font-mono">{result.ip}</h2>
                </div>
                {result.countryCode && (
                  <div className="text-right">
                    <p className="text-3xl">{countryFlagEmoji(result.countryCode)}</p>
                    <p className="text-sm text-muted-foreground mt-1">{result.countryCode}</p>
                  </div>
                )}
              </div>
              {(result.isProxy || result.isHosting) && (
                <div className="flex gap-2 mt-4">
                  {result.isProxy && <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-mono">Proxy detected</span>}
                  {result.isHosting && <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-mono">Hosting/Cloud</span>}
                </div>
              )}
            </div>

            <div className="glass p-5">
              <p className="text-xs font-mono text-primary mb-4">// GEOLOCATION</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: MapPin, label: "City", value: result.city },
                  { icon: MapPin, label: "Region", value: result.region },
                  { icon: Globe, label: "Country", value: result.country },
                  { icon: Wifi, label: "Timezone", value: result.timezone },
                  { icon: Server, label: "ISP / Org", value: result.org },
                  { icon: Server, label: "ASN", value: result.asn },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">{label}</p>
                      <p className="text-sm font-medium mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-5">
              <p className="text-xs font-mono text-primary mb-3">// COORDINATES</p>
              <p className="font-mono text-sm">
                <span className="text-muted-foreground">lat </span>{result.latitude.toFixed(4)}{" "}
                <span className="text-muted-foreground ml-4">lon </span>{result.longitude.toFixed(4)}
              </p>
              <a
                href={`https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}&zoom=12`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-xs text-primary hover:underline"
              >
                <MapPin className="h-3 w-3" /> View on map
              </a>
            </div>

            <div className="glass p-4 flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">Location data is approximate and based on public IP geolocation databases. Accuracy varies by region and ISP.</p>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="glass p-8 text-center text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Enter an IP address to look up its geolocation and network information.</p>
            <p className="text-xs mt-2 opacity-60">Leave blank and click Lookup to inspect your own IP.</p>
          </div>
        )}
      </div>
    </div>
  );
}
