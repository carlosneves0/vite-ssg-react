#!/usr/bin/env node

global.__vite_react_ssg_start_time = new Date()

const process = await import("node:process"),
    argv = process.argv.slice(2)

let script
const SCRIPT = {
    DEV: 0,
    BUILD: 1,
    PREVIEW: 2,
}

for (const arg of argv) {
    switch (arg) {
        case "dev":
            script = SCRIPT.DEV
            break

        case "build":
            script = SCRIPT.BUILD
            break

        case "preview":
            script = SCRIPT.PREVIEW
            break

        default:
            // TO-DO: forward these args to vite.
            console.log(`Warn: ignoring command-line argument "${arg}"`)
    }
}

switch (script) {
    case SCRIPT.DEV:
        await import("./script/dev.js")
        break

    case SCRIPT.BUILD:
        await import("./script/build.js")
        break

    case SCRIPT.PREVIEW:
        await import("./script/preview.js")
        break

    default:
        console.error(`Usage: `)
}
