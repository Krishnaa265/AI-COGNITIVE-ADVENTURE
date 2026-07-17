import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.svg",
        "icons.svg"
      ],

      manifest: {
        name: "AI Cognitive Adventure",
        short_name: "AI Adventure",
        description: "AI-powered speech-based cognitive assessment platform",
        theme_color: "#1a1a1a",
        background_color: "#111111",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",

        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ]
});