import {defineConfig} from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("@supabase") || id.includes("node_modules/@supabase")) {
                        return "supabase";
                    }
                }
            }
        }
    },
    server: {port: 5173, host: true},
    test: {
        environment: "jsdom",
        globals: true,
        include: ["src/**/*.test.{ts,tsx}"]
    }
});
