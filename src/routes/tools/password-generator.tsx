import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Key, ArrowLeft, Copy, RefreshCw, CircleCheck as CheckCircle2, Shield } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/tools/password-generator")({
  head: () => ({ meta: [{ title: "Password Generator — Obsidian VPN" }] }),
  component: PasswordGeneratorWrapper,
});

function PasswordGeneratorWrapper() {
  return (
    <ProtectedRoute>
      <PasswordGenerator />
    </ProtectedRoute>
  );
}

const CHARS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

function generatePassword(length: number, opts: { upper: boolean; lower: boolean; digits: boolean; symbols: boolean; excludeAmbiguous: boolean }): string {
  let charset = "";
  if (opts.upper) charset += opts.excludeAmbiguous ? CHARS.upper.replace(/[OI]/g, "") : CHARS.upper;
  if (opts.lower) charset += opts.excludeAmbiguous ? CHARS.lower.replace(/[ol]/g, "") : CHARS.lower;
  if (opts.digits) charset += opts.excludeAmbiguous ? CHARS.digits.replace(/[01]/g, "") : CHARS.digits;
  if (opts.symbols) charset += CHARS.symbols;

  if (!charset) return "";

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((v) => charset[v % charset.length])
    .join("");
}

function calcEntropy(length: number, opts: { upper: boolean; lower: boolean; digits: boolean; symbols: boolean }): number {
  let size = 0;
  if (opts.upper) size += 26;
  if (opts.lower) size += 26;
  if (opts.digits) size += 10;
  if (opts.symbols) size += 26;
  return size > 0 ? Math.round(Math.log2(Math.pow(size, length))) : 0;
}

function PasswordGenerator() {
  const { user } = useAuth();
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true, excludeAmbiguous: false });
  const [password, setPassword] = useState(() => generatePassword(20, { upper: true, lower: true, digits: true, symbols: true, excludeAmbiguous: false }));
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const regenerate = useCallback(() => {
    setPassword(generatePassword(length, opts));
  }, [length, opts]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!user) return;
    await supabase.from("tool_history").insert({
      user_id: user.id,
      tool: "pwd-gen",
      input: `length=${length}`,
      result: { length, entropy: calcEntropy(length, opts), opts },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateAndRegenerate = (newLength: number, newOpts: typeof opts) => {
    setLength(newLength);
    setOpts(newOpts);
    setPassword(generatePassword(newLength, newOpts));
  };

  const entropy = calcEntropy(length, opts);
  const strengthLabel = entropy > 128 ? "Excellent" : entropy > 80 ? "Strong" : entropy > 60 ? "Good" : "Weak";
  const strengthColor = entropy > 128 ? "text-primary" : entropy > 80 ? "text-emerald-400" : entropy > 60 ? "text-yellow-400" : "text-destructive";

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
            <Key className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Password Generator</h1>
            <p className="text-sm text-muted-foreground">Cryptographically secure, generated on-device</p>
          </div>
        </div>

        <div className="glass p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Generated Password</p>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${strengthColor}`}>{strengthLabel} — {entropy} bits</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 overflow-x-auto">
              <p className="font-mono text-lg tracking-widest text-foreground bg-secondary/50 px-4 py-3 rounded-lg break-all">{password}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={regenerate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg glass border text-sm hover:border-primary/40 transition"
            >
              <RefreshCw className="h-4 w-4" /> Regenerate
            </button>
          </div>
        </div>

        <div className="glass p-6 mb-4">
          <p className="text-xs font-mono text-primary mb-5">// OPTIONS</p>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Length</label>
              <span className="font-mono text-primary text-sm">{length}</span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => updateAndRegenerate(parseInt(e.target.value), opts)}
              className="w-full h-2 rounded-full bg-secondary appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>8</span><span>16</span><span>32</span><span>48</span><span>64</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "upper", label: "Uppercase (A-Z)" },
              { key: "lower", label: "Lowercase (a-z)" },
              { key: "digits", label: "Numbers (0-9)" },
              { key: "symbols", label: "Symbols (!@#…)" },
              { key: "excludeAmbiguous", label: "Exclude ambiguous (0, O, l, 1)" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <button
                  type="button"
                  onClick={() => {
                    const newOpts = { ...opts, [key]: !opts[key as keyof typeof opts] };
                    updateAndRegenerate(length, newOpts);
                  }}
                  className={`h-5 w-5 rounded flex items-center justify-center border transition ${
                    opts[key as keyof typeof opts]
                      ? "bg-primary border-primary"
                      : "border-border group-hover:border-primary/50"
                  }`}
                >
                  {opts[key as keyof typeof opts] && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                </button>
                <span className="text-sm select-none">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-border hover:border-primary/50 text-sm transition"
          >
            {saved ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Shield className="h-4 w-4" />}
            {saved ? "Saved to history" : "Save to history"}
          </button>
        </div>
      </div>
    </div>
  );
}
