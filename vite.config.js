import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
  server: {
    proxy: {
      "/auth": {
        target: "http://44.196.188.33",
        changeOrigin: true,
      },
      "/auth-api": {
        target: "http://44.196.188.33",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-api/, "/auth"),
      },
      "/core": {
        target: "http://44.196.188.33",
        changeOrigin: true,
      },
      "/api": {
        target: "http://44.196.188.33",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/mock"),
      },
    },
  },
});
