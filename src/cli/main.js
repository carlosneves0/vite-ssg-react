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

global.__vite_react_ssg_args = {}
for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
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

        case "--host":
            if (
                i + 1 === argv.length ||
                ["dev", "build", "preview"].includes(argv[i + 1]) ||
                /^--/.test(argv[i + 1])
            ) {
                global.__vite_react_ssg_args.host = "0.0.0.0"
            } else {
                global.__vite_react_ssg_args.host = argv[i + 1]
                i++
            }
            break

        case "--strictPort":
            global.__vite_react_ssg_args.strictPort = argv[i + 1]
            i++
            break

        default:
            // TO-DO: maybe forward more args to vite...
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
