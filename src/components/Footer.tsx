import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-32">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold">Obsidian<span className="text-primary">VPN</span></span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Reinventing digital privacy with a suite of next-gen cybersecurity tools.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Features</li><li>Pricing</li><li>Tools</li><li>Changelog</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>About</li><li>Privacy</li><li>Terms</li><li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © 2026 Obsidian VPN. Encrypted by design.
      </div>
    </footer>
  );
}
