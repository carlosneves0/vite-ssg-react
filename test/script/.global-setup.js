import { readFile } from "node:fs/promises"
import { join } from "node:path"

export default async (_globalConfig, _projectConfig) => {
    globalThis.__DEV_SERVER_PORT__ = await readFile(
        join("test", "project", "node_modules", ".port"),
        "utf8",
    )

    console.log()
    console.log("Awaiting dev-server to be ready...")
    let isReady = false
    const startTime = new Date(),
        TIMEOUT = 5_000,
        ENDPOINT = `http://localhost:${globalThis.__DEV_SERVER_PORT__}/`
    while (!isReady) {
        if (new Date() - startTime > TIMEOUT)
            throw new Error(`Dev server not yet ready after 5 seconds`)
        try {
            const response = await fetch(ENDPOINT, { method: "HEAD" })
            if (!response.ok) throw new Error("HTTP Error")
            isReady = true
        } catch {}
    }
    console.log("Dev-server is ready.")
}
