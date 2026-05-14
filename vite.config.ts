import { defineConfig } from '@tanstack/start/config' // Recommended for TanStack Start
import react from '@vitejs/plugin-react'

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [react()], // Essential to make React work
    server: {
      host: "0.0.0.0",
      port: 5000,
      strictPort: true,
      allowedHosts: "all", // Or a specific array of hosts
    },
  },
});
