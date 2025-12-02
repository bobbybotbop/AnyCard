import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@": path.resolve(__dirname, "./"),
    },
  },
});
