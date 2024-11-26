import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import express from "express"
import { createServer } from "vite"
import colors from "colors/safe.js"

assert(process.env.NODE_ENV !== "production", 'process.env.NODE_ENV !== "production"')

const port = parseInt(process.env.PORT, 10) || 5173,
    base = process.env.BASE || "/",
    httpServer = express(),
    vite = await createServer({
        server: { middlewareMode: true },
        appType: "custom",
        base,
    }),
    packageJSON = JSON.parse(
        await readFile(join(import.meta.dirname, "../../../../../package.json")),
    ),
    viteVersion = (packageJSON?.devDependencies?.vite ?? "").replace(/[^0-9.]/g, "")

httpServer.use(vite.middlewares)

httpServer.use("*all", async (request, response) => {
    const viteRequestURL = request.originalUrl.replace(base, "")
    try {
        const entryPoint = `${/\/$/.test(request.originalUrl) ? "" : request.originalUrl}/index.html.jsx`
        // entryPoint = url === "" ? "/index.html.jsx" : url

        // TO-DO: improve logic to return 404 for non HTML-JSX files.

        // TO-DO: improve logic to accept `/foo` as either `/foo.html.jsx` or `/foo/index.html`

        // TO-DO: improve logging...

        const render = (await vite.ssrLoadModule(entryPoint)).render,
            cssLinks = global.css ? [...global.css] : [],
            html = await vite.transformIndexHtml(viteRequestURL, render({ cssLinks }))

        return response
            .status(200)
            .set("Content-Type", "text/html; charset=utf-8")
            .end(html)
    } catch (error) {
        vite?.ssrFixStacktrace(error)
        console.error(error)
        const html = await vite.transformIndexHtml(
            viteRequestURL,
            `<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,user-scalable=yes" />
        <meta name="color-scheme" content="light dark" />
    </head>
    <body>
        <pre style="word-wrap: break-word; white-space: pre-wrap; font-size: 1.2em">${error.stack}</pre>
    </body>
</html>`,
        )
        response.status(500).end(html)
    }
})

// TO-DO: allow passing in `--host` like vite.
httpServer.listen({ host: "localhost", port }, () => {
    const elapsedTimeMs = new Date() - global.__vite_react_ssg_start_time
    console.log()
    console.log(
        `  ${colors.green(`${colors.bold("VITE")} v${viteVersion}`)}  ${colors.dim(
            `ready in ${colors.reset(colors.bold(Math.ceil(elapsedTimeMs)))} ms`,
        )}`,
    )
    console.log()
    console.log(
        `  ${colors.green("➜")}  Local:   ${colors.cyan(`http://localhost:${colors.bold(port)}/`)}`,
    )
    console.log()
})
