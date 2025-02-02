import path from "node:path"
import chokidar from "chokidar"
import link from "../lib/link.js"

export default function ssgHTML() {
    let fsWatcher
    return {
        name: "ssg-html",

        // TO-DO: `await fsWatcher.close()` on some Vite-plugin clean-up hook.

        configResolved(config) {
            if (!config.env.DEV) return

            if (!global.htmls) {
                global.htmls = {}
                // ^ Why must this be a global?
                // ^ Because it will be used by the dev SSR script to inject all HTML files.
            }

            if (!fsWatcher) {
                fsWatcher = chokidar.watch(config.root)
                // ^ `{ ignored: (path, stats) => !/\.(ht|x)ml\.jsx$/.test(path) }`
                // ^ This didn't work...
                // ^ `{ ignored: join(root, "**", "*.html.jsx") }` also didn't work...

                fsWatcher.on("all", (event, id, _stats) => {
                    if (!/\.(ht|x)ml\.jsx$/.test(id)) return

                    if (event === "unlink") {
                        delete global.htmls[id]
                    } else {
                        global.htmls[id] = {
                            path: id,
                            link: link.absolute(
                                link
                                    .normalize(path.relative(config.root, id))
                                    .replace(/\/?index\.html\.jsx$/, "")
                                    .replace(/\.html\.jsx$/, ""),
                            ),
                        }
                    }
                })
            }
        },
    }
}
