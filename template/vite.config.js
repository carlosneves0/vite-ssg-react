import { join } from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import reactSSG from "vite-react-ssg"

// https://vite.dev/config/
export default defineConfig({
    root: join(import.meta.dirname, "src"),
    build: {
        emptyOutDir: true,
        assetsDir: "asset",
        // minify: true, // May be useful when shipping vanilla JS along with HTML & CSS.
        cssMinify: true,
        ssrEmitAssets: true,
    },
    plugins: [react(), reactSSG()],
})
