/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

//const API_BASE_URL = "http://3.214.183.222";
//const API_BASE_URL = "http://52.3.93.209";
const API_BASE_URL = "http://localhost:9000";

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
      "/auth-api": {
        target: API_BASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-api/, "/auth"),
      },
      "/auth": {
        target: API_BASE_URL,
        changeOrigin: true,
      },
      "/core": {
        target: API_BASE_URL,
        changeOrigin: true,
        proxyTimeout: 300000,
        timeout: 300000,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers["authorization"]) {
              proxyReq.setHeader("Authorization", req.headers["authorization"]);
            }
          });
        },
      },
      "/api": {
        target: API_BASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/mock"),
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: [
      "src/**/*.{test,spec}.{js,jsx}",
      "tests/**/*.{test,spec}.{js,jsx}",
    ],
  },
});
