import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Function form: the object form mis-resolves React's module ids,
        // which pulled react-dom into the three chunk and made the entry
        // eagerly preload ~1MB of Three.js. React stays in the entry chunk
        // (always needed); three/framer load only with their lazy sections.
        manualChunks(id) {
          // Vite's dynamic-import preload helper is shared by every chunk
          // that code-splits; left unassigned it sinks into the three chunk
          // and chains it into the eager graph. Keep it with the entry-side
          // react chunk. (Virtual module — must be checked before the
          // node_modules guard.)
          if (id.includes("vite/preload-helper")) return "react";
          if (!id.includes("node_modules")) return undefined;
          // Pin the React runtime to its own (eager) chunk — otherwise
          // Rollup merges react/react-dom into the three/framer chunks,
          // dragging them into the initial load.
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
            return "react";
          }
          // Shared Babel interop helpers are imported by eager AND lazy
          // code — if left unassigned they sink into the three chunk and
          // drag it into the initial load.
          if (id.includes("@babel/runtime")) return "react";
          if (
            id.includes("@react-three/") ||
            /node_modules\/(three|three-stdlib)\//.test(id)
          ) {
            return "three";
          }
          if (id.includes("framer-motion")) return "framer";
          if (id.includes("gsap")) return "gsap";
          return undefined;
        },
      },
    },
  },
});
