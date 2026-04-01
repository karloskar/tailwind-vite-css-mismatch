import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["bun"],
    },
  },
  environments: {
    ssr: {
      resolve: {
        external: ["bun"],
        externalConditions: ["bun", "node"],
      },
    },
  },
  plugins: [
    tanstackStart({
      router: {
        quoteStyle: "double",
        semicolons: true,
      },
    }),
    nitro({
      preset: "bun",
    }),
    viteReact(),
    tailwindcss(),
  ],
});
