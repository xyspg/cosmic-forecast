import path from "node:path";

import { cloudflare } from "@cloudflare/vite-plugin";
import tailwind from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwind(),
    cloudflare(),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
