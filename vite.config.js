import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import os from "node:os";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  // Give every dev-server process its own optimizer cache. This prevents two
  // Vite instances (or a browser/antivirus holding the previous cache) from
  // competing for node_modules/.vite/deps on Windows.
  cacheDir: path.join(os.tmpdir(), `portal-educativo-vite-${process.pid}`),
  optimizeDeps: {
    noDiscovery: true,
    include: [
      "react",
      "react-dom/client",
      "react/jsx-dev-runtime",
      "lucide-react",
    ],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
