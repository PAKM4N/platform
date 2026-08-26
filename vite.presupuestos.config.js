import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(rootDir, "presupuestos"),
  publicDir: path.join(rootDir, "public"),
  plugins: [react()],
  build: {
    outDir: path.join(rootDir, "dist-presupuestos"),
    emptyOutDir: true,
  },
});
