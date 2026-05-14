import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Vercel deployment: disable Cloudflare Workers plugin and let TanStack Start
// produce a standard Node-compatible SSR build that Vercel can serve.
export default defineConfig({
  cloudflare: false,
});
