import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      phaser: "phaser/dist/phaser.esm.js"
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup/phaser.ts"
  }
});
