import { join, relative } from "node:path"

export default function reactSSG() {
    let root, isDevelopment
    return {
        name: "react-ssg",

        configResolved(config) {
            root = config.root

            isDevelopment = config.env.DEV

            if (isDevelopment) {
                global.css = new Set() // https://github.com/vitejs/vite/issues/2282#issuecomment-844188264
                // ^ Why must this be a global?
                // ^ Because it will be used by the dev SSR script to inject all imported CSS files.
            }
        },

        transform(code, id, ssr) {
            if (!ssr) return

            if (/\.css$/.test(id)) {
                if (isDevelopment) {
                    // TO-DO: handle CSS import deletions...
                    global.css.add(join("/", relative(root, id)))
                }
            } else if (/\.html\.jsx$/.test(id)) {
                const defaultExportName = extractDefaultExportName(code)
                if (!defaultExportName) {
                    console.log(
                        `Warn: could not extract default export name from \`${relative(root, id)}\``,
                    )
                    return code
                }
                return code.replace(
                    /\n?$/,
                    '\nimport { renderToString } from "react-dom/server"\n' +
                        "export function render(props, options) {\n" +
                        '    return "<!doctype html>" + renderToString(\n' +
                        (isDevelopment
                            ? `${devJSXFactory(defaultExportName, id)},\n`
                            : `${prodJSXFactory(defaultExportName)},\n`) +
                        "        options\n" +
                        "    )\n" +
                        "}",
                )
            }
        },
    }
}

function extractDefaultExportName(code) {
    let match = code.match(/export\s+default\s+function\s+([_a-zA-Z][_a-zA-Z0-9]*)\s*\(/)
    if (!match) match = code.match(/export\s+default\s+([_a-zA-Z][_a-zA-Z0-9]*)\b/)
    if (!match) return null
    return match[1]
}

function devJSXFactory(defaultExportName, id) {
    return (
        // TO-DO: check whether it's safe to always pass `/* @__PURE__ */`...
        `        /* @__PURE__ */ _jsxDEV(${defaultExportName}, props, void 0, false, {\n` +
        `            fileName: "${id}",\n` +
        `            lineNumber: -1,\n` + // TO-DO: improve this
        "            columnNumber: -1\n" + // TO-DO: improve this
        "        }, this)"
    )
}

function prodJSXFactory(defaultExportName) {
    // TO-DO: check whether it's safe to always pass `/* @__PURE__ */`...
    return `        /* @__PURE__ */  jsx(${defaultExportName}, props)`
}
