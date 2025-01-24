import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import ssg from "vite-ssg-react"

// Node18 doesn't have `import.meta.dirname`.
const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
    root: join(__dirname, "src"),
    build: {
        emptyOutDir: true,
        assetsDir: "asset",
        minify: true,
        cssMinify: true,
        ssrEmitAssets: true,
    },
    plugins: [react(), ssg()],
})
