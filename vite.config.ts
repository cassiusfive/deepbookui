import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/indexer": {
        target: "https://deepbook-indexer.mainnet.mystenlabs.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/indexer/, ""),
      },
    },
  },
  plugins: [TanStackRouterVite(), viteReact()],
});
