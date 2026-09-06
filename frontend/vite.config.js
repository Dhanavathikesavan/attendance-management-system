import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Standard Vite + React config. Dev server runs on port 5173,
// which matches FRONTEND_ORIGIN in the backend's .env (for CORS).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
