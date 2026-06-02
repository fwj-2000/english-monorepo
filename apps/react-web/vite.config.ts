import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { Config } from "@en/config"

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${Config.ports.server}`,
        changeOrigin: true,
      },
      "/ai": {
        target: `http://localhost:${Config.ports.ai}`,
        changeOrigin: true,
      }
    },
    port: Config.ports.reactWeb,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    },
  },
})
