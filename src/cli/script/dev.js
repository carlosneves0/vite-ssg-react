import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import posixPath from "node:path/posix"
import { fileURLToPath } from "node:url"
import { cwd } from "node:process"
import { randomUUID } from "node:crypto"
import express from "express"
import { createServer } from "vite"
import colors from "colors/safe.js"

assert(process.env.NODE_ENV !== "production", 'process.env.NODE_ENV !== "production"')

// TO-DO: allow passing in `--host` like vite.
const host = global.__vite_react_ssg_args.host ?? "localhost",
    port = global.__vite_react_ssg_args.strictPort || 5173,
    base = process.env.BASE || "/",
    httpServer = express(),
    vite = await createServer({
        server: { middlewareMode: true },
        appType: "custom",
        base,
    })

let packageJSON
try {
    packageJSON = JSON.parse(
        await readFile(
            join(dirname(fileURLToPath(import.meta.url)), "../../../../../package.json"),
        ),
    )
} catch {
    try {
        packageJSON = JSON.parse(await readFile(join(cwd(), "package.json")))
    } catch {
        throw new Error("Could not find `package.json` file")
    }
}

const viteVersion = (packageJSON?.devDependencies?.vite ?? "").replace(/[^0-9.]/g, "")

httpServer.use(vite.middlewares)

httpServer.use("*all", async (request, response) => {
    const viteURL = request.originalUrl.replace(base, "")
    try {
        let module
        try {
            module = await vite.ssrLoadModule(viteURL)
        } catch (error) {
            if (error.code !== "ERR_LOAD_URL") throw error
            try {
                module = await vite.ssrLoadModule(
                    `${viteURL.replace(/\/+$/, "")}.html.jsx`,
                )
            } catch (error) {
                if (error.code !== "ERR_LOAD_URL") throw error
                module = await vite.ssrLoadModule(
                    posixPath.join(viteURL, "index.html.jsx"),
                )
            }
        }

        // TO-DO: improve logging...

        const { render, __IMPORT_HTML_MODULES } = module,
            renderUUID = randomUUID(),
            htmls = await Promise.all(
                Object.values(global.htmls ?? {}).map(async ({ path, link }) => ({
                    path,
                    link,
                    ...(__IMPORT_HTML_MODULES === true
                        ? { module: await vite.ssrLoadModule(path) }
                        : {}),
                })),
            ),
            cssLinks = [...(global.cssLinks ?? new Set())],
            jsLinks = [...(global.jsLinks ?? new Set())],
            html = await vite.transformIndexHtml(
                viteURL,
                render({ renderUUID, htmls, cssLinks, jsLinks }),
            )

        return response
            .status(200)
            .set("Content-Type", "text/html; charset=utf-8")
            .end(html)
    } catch (error) {
        vite?.ssrFixStacktrace(error)
        console.error(error)
        const html = await vite.transformIndexHtml(
            viteURL,
            `<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,user-scalable=yes" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" type="image/gif" href="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
    </head>
    <body>
        <pre style="word-wrap: break-word; white-space: pre-wrap; font-size: 1.2em">${error.stack}</pre>
    </body>
</html>`,
        )
        response.status(500).end(html)
    }
})

httpServer.listen({ host, port }, () => {
    const elapsedTimeMs = new Date() - global.__vite_react_ssg_start_time
    console.log()
    console.log(
        `  ${colors.green(`${colors.bold("VITE")} v${viteVersion}`)}  ${colors.dim(
            `ready in ${colors.reset(colors.bold(Math.ceil(elapsedTimeMs)))} ms`,
        )}`,
    )
    console.log()
    console.log(
        `  ${colors.green("➜")}  Local:   ${colors.cyan(`http://${host}:${colors.bold(port)}/`)}`,
    )
    console.log()
})
