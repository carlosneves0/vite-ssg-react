import { cwd } from "node:process"
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { basename, dirname, join, relative } from "node:path"
import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import colors from "colors/safe.js"
import link from "../../lib/link.js"

let viteConfig
try {
    viteConfig = (await import("../../../../../vite.config.js")).default
} catch {
    try {
        viteConfig = (await import(join(cwd(), "vite.config.js"))).default
    } catch {
        throw new Error("Could not find `vite.config.js` file")
    }
}

const root = viteConfig?.root ?? cwd(),
    viteOutDir = join("..", "dist", "server"),
    outDir = relative(cwd(), join(root, viteOutDir)),
    publicOutDir = join("dist", "public"),
    entryPointList = (await readdir(root, { recursive: true }))
        .filter(fileName => /\.html\.jsx$/.test(fileName))
        .map(fileName => relative(root, join(root, fileName)))

console.log(`Emptying ${colors.dim(publicOutDir)}...`)
await rm(publicOutDir, { recursive: true, force: true })

for (const entryPoint of entryPointList) {
    const entryPointViteOutDir = join(viteOutDir, dirname(entryPoint)),
        argv = ["vite", "build", "--outDir", entryPointViteOutDir, "--ssr", entryPoint]

    console.log(`> ${argv.join(" ")}`)

    const childProcess = spawn(argv[0], argv.slice(1), { stdio: "inherit" })

    await new Promise((resolve, reject) => {
        childProcess.prependOnceListener("error", reject)
        childProcess.prependOnceListener("exit", resolve)
    }).finally(() => childProcess.removeAllListeners())
}

const initialHTMLs = (await readdir(outDir, { recursive: true }))
    .filter(path => /\.html\.js$/.test(path))
    .map(path => ({
        path: join(root, "..", outDir, path),
        link: link.absolute(link.normalize(path).replace(/\/?index\.html\.js$/, "")),
    }))

for (const entryPoint of entryPointList) {
    const entryPointOutDir = join(outDir, dirname(entryPoint)),
        outFilePathList = [],
        cssLinks = [],
        jsLinks = [],
        inlineJSLinks = []
    for (const outFile of await readdir(entryPointOutDir, { withFileTypes: true })) {
        const outFilePath = join(entryPointOutDir, outFile.name)
        if (outFile.isFile()) {
            outFilePathList.push(outFilePath)
        } else if (outFile.isDirectory() && outFile.name === "asset") {
            const indexHTMLJS = await readFile(join(entryPointOutDir, "index.html.js"))
            for (const assetFile of await readdir(outFilePath, {
                withFileTypes: true,
            }))
                if (assetFile.isFile()) {
                    outFilePathList.push(join(entryPointOutDir, "asset", assetFile.name))
                    if (
                        /\.css$/.test(assetFile.name) &&
                        !indexHTMLJS.includes(assetFile.name)
                        // ^ TO-DO: convert this "feature" to a URL param: `?url`
                    )
                        cssLinks.push(`/asset/${assetFile.name}`)
                    else if (/\.js$/.test(assetFile.name)) {
                        if (/^\.inline\./.test(assetFile.name))
                            inlineJSLinks.push(
                                await readFile(join(outFilePath, assetFile.name), "utf8"),
                            )
                        else jsLinks.push(`/asset/${assetFile.name}`)
                    }
                }
        }
    }

    for (const outFilePath of outFilePathList)
        if (/\.html\.js$/.test(outFilePath)) {
            const publicFilePath = join(
                publicOutDir,
                relative(outDir, outFilePath.replace(/\.js$/, "")),
            )
            console.log(
                `Rendering ${colors.dim(outFilePath)} to ${colors.bold(publicFilePath)} (with ${colors.dim(cssLinks.join(", "))})...`,
            )
            await mkdir(dirname(publicFilePath), { recursive: true })
            const renderUUID = randomUUID(),
                { render, __IMPORT_HTML_MODULES } = await import(
                    join(cwd(), outFilePath)
                ),
                htmls =
                    __IMPORT_HTML_MODULES === true
                        ? await Promise.all(
                              initialHTMLs.map(async ({ path, link }) => ({
                                  path,
                                  link,
                                  module: await import(path),
                              })),
                          )
                        : initialHTMLs,
                html = render({
                    renderUUID,
                    htmls,
                    cssLinks,
                    jsLinks: [...jsLinks, ...inlineJSLinks],
                })
            await writeFile(publicFilePath, html)
        } else if (/^\.inline\./.test(basename(outFilePath))) {
            continue
        } else {
            const publicFilePath = join(
                publicOutDir,
                relative(join(outDir, dirname(entryPoint)), outFilePath),
            )
            console.log(
                `Copying ${colors.dim(outFilePath)} to ${colors.dim(publicFilePath)}...`,
            )
            await mkdir(dirname(publicFilePath), { recursive: true })
            await cp(outFilePath, publicFilePath, { force: false })
        }

    console.log()
}

console.log(colors.green(`Done in ${new Date() - global.__vite_react_ssg_start_time}ms.`))
