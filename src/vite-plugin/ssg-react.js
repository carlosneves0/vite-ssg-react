import path from "node:path"

export default function ssgReact() {
    let config
    return {
        name: "ssg-react",

        configResolved(resolvedConfig) {
            config = resolvedConfig
        },

        transform(code, id, ssr) {
            if (!ssr) return

            if (!/\.html\.jsx$/.test(id)) return

            const defaultExportName = extractDefaultExportName(code)

            if (!defaultExportName) {
                console.error(
                    `Warning: could not extract default export name from \`${path.relative(config.root, id)}\``,
                )
                return code
            }

            return code.replace(
                /\n?$/,
                '\nimport { renderToString } from "react-dom/server"\n' +
                    "export function render(props, options) {\n" +
                    '    return "<!doctype html>" + renderToString(\n' +
                    (config.env.DEV
                        ? `${devJSXFactory(defaultExportName, id)},\n`
                        : `${prodJSXFactory(defaultExportName)},\n`) +
                    "        options\n" +
                    "    )\n" +
                    "}",
            )
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
