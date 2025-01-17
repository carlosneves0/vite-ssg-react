import { URL } from "node:url"
import { basename, relative } from "node:path"
import { readFile } from "node:fs/promises"
import { minify } from "terser"
import { absolute, normalize } from "./lib/netpath.js"

export default function ssgVanillaJS() {
    let config
    return {
        name: "ssg-vanilla-js",

        enforce: "pre",

        configResolved(resolvedConfig) {
            config = resolvedConfig
        },

        async load(id, { ssr }) {
            if (!ssr) return

            const fileURL = new URL(`file://${id}`),
                filePath = fileURL.pathname
            if (!/\.js$/.test(filePath) || !fileURL.searchParams.has("vanilla")) return

            if (config.env.DEV) {
                const fileLink = absolute(normalize(relative(config.root, filePath)))
                return `export default ${JSON.stringify(fileLink)}`
            } else {
                if (fileURL.searchParams.has("inline")) {
                    const codeUTF8 = await readFile(filePath, "utf8"),
                        minifiedCodeUTF8 = (await minify(codeUTF8)).code,
                        codeBase64 = Buffer.from(minifiedCodeUTF8).toString("base64"),
                        codeBase64DataURL = `data:application/javascript;base64,${codeBase64}`
                    return `export default ${JSON.stringify(codeBase64DataURL)}`
                } else {
                    // Emit as asset.
                    const codeUTF8 = await readFile(filePath, "utf8"),
                        minifiedCodeUTF8 = (await minify(codeUTF8)).code,
                        originalFileName = normalize(relative(config.root, filePath)),
                        referenceId = this.emitFile({
                            type: "asset",
                            // Ignore directory structure for asset file names.
                            name: basename(filePath),
                            originalFileName,
                            source: minifiedCodeUTF8,
                        }),
                        // postfix = (fileURL.search || "") + (fileURL.hash || ""),
                        postfix = "", // Remove trailing "?vanilla".
                        url = `__VITE_ASSET__${referenceId}__${postfix ? `$_${postfix}__` : ``}`
                    return {
                        code: `export default ${JSON.stringify(url)}`,
                        meta: { "vite:asset": true },
                    }
                }
            }
        },
    }
}
