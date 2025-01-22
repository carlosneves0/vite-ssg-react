import path from "node:path"
import link from "../lib/link.js"

export default function ssgCSS() {
    let config
    return {
        name: "ssg-css",

        configResolved(resolvedConfig) {
            config = resolvedConfig

            if (config.env.DEV)
                if (!global.cssLinks) {
                    global.cssLinks = new Set()
                    // ^ Why must this be a global?
                    // ^ Because it will be used by the dev SSR script to inject all imported CSS files.
                    // https://github.com/vitejs/vite/issues/2282#issuecomment-844188264
                }
        },

        transform(_code, id, ssr) {
            if (!ssr) return

            if (!config.env.DEV) return

            if (!/\.css$/.test(id)) return

            // TO-DO: handle `.css` import deletions...

            global.cssLinks.add(
                link.absolute(link.normalize(path.relative(config.root, id))),
            )
        },
    }
}
