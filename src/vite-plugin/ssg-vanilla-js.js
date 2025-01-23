import { URL } from "node:url"
import path from "node:path"
import fs from "node:fs/promises"
import { minify } from "terser"
import link from "../lib/link.js"

export default function ssgVanillaJS() {
    let config
    return {
        name: "ssg-vanilla-js",

        enforce: "pre",

        configResolved(resolvedConfig) {
            config = resolvedConfig

            if (config.env.DEV)
                if (!global.jsLinks) {
                    global.jsLinks = new Set()
                    // ^ Why must this be a global?
                    // ^ It will be used by the dev SSR script to inject all imported vanilla-JS files.
                }
        },

        async load(id, { ssr }) {
            if (!ssr) return

            const fileURL = new URL(`file://${id}`),
                filePath = fileURL.pathname
            if (!/\.js$/.test(filePath) || !fileURL.searchParams.has("vanilla")) return

            if (config.env.DEV) {
                const fileLink = link.absolute(
                    link.normalize(path.relative(config.root, filePath)),
                )
                // TO-DO: handle `.js?vanilla` import deletions...
                global.jsLinks.add(fileLink)
                return `export default ${JSON.stringify(fileLink)}`
            } else {
                let assetName, assetSource
                if (fileURL.searchParams.has("inline")) {
                    const codeUTF8 = await fs.readFile(filePath, "utf8"),
                        finalCodeUTF8 = config.build.minify
                            ? (await minify(codeUTF8)).code
                            : codeUTF8,
                        codeBase64 = Buffer.from(finalCodeUTF8).toString("base64"),
                        codeBase64DataURL = `data:application/javascript;base64,${codeBase64}`
                    // Ignore directory structure for asset file names.
                    assetName = `.inline.${path.basename(filePath)}`
                    assetSource = codeBase64DataURL
                } else {
                    // Emit as asset.
                    const codeUTF8 = await fs.readFile(filePath, "utf8"),
                        finalCodeUTF8 = config.build.minify
                            ? (await minify(codeUTF8)).code
                            : codeUTF8
                    // Ignore directory structure for asset file names.
                    assetName = path.basename(filePath)
                    assetSource = finalCodeUTF8
                }

                const originalFileName = link.normalize(
                        path.relative(config.root, filePath),
                    ),
                    referenceId = this.emitFile({
                        type: "asset",
                        name: assetName,
                        originalFileName,
                        source: assetSource,
                    }),
                    // postfix = (fileURL.search || "") + (fileURL.hash || ""),
                    postfix = "", // Remove trailing "?vanilla".
                    url = `__VITE_ASSET__${referenceId}__${postfix ? `$_${postfix}__` : ``}`

                return {
                    code: `export default ${JSON.stringify(url)}`,
                    meta: { "vite:asset": true },
                }
            }
        },
    }
}
