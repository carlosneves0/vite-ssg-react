import assert from "node:assert/strict"
import { join } from "node:path"
import express from "express"
import compression from "compression"
import sirv from "sirv"
import colors from "colors/safe.js"

process.env.NODE_ENV = process.env.NODE_ENV ?? "production"
assert(process.env.NODE_ENV === "production", 'process.env.NODE_ENV === "production"')

const port = parseInt(process.env.PORT, 10) || 4173,
    httpServer = express()

httpServer.use((request, response, next) => {
    const startedAt = new Date()
    console.log(`${request.method} ${request.originalUrl}`)
    response.prependOnceListener("finish", () => {
        const elapsedTimeMs = new Date() - startedAt
        console.log(
            `${request.method} ${request.originalUrl} -> ${response.statusCode}\t${elapsedTimeMs}ms`,
        )
    })
    next()
})

httpServer.use(compression())

httpServer.use(sirv(join("dist", "public")))

// TO-DO: allow passing in `--host` like vite.
httpServer.listen({ host: "localhost", port }, () => {
    console.log()
    console.log(
        `  ${colors.green("➜")}  Local:   ${colors.cyan(`http://localhost:${colors.bold(port)}/`)}`,
    )
    console.log()
})
