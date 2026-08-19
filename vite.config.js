import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : "/burbank-votes/",
  publicDir: "public",
  server: {
    host: true,
    port: 5173,
  },
}));
