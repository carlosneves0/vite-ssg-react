import { cwd } from "node:process"
import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises"
import { dirname, join, relative, sep } from "node:path"
import { spawn } from "node:child_process"
import colors from "colors/safe.js"
import viteConfig from "../../../../../vite.config.js"

const root = viteConfig.root ?? cwd(),
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

    const entryPointOutDir = join(outDir, dirname(entryPoint)),
        outFilePathList = []
    let cssFileLink
    for (const outFile of await readdir(entryPointOutDir, { withFileTypes: true }))
        if (outFile.isFile()) outFilePathList.push(join(entryPointOutDir, outFile.name))
        else if (outFile.isDirectory() && outFile.name === "asset")
            for (const assetFile of await readdir(join(entryPointOutDir, outFile.name), {
                withFileTypes: true,
            }))
                if (assetFile.isFile()) {
                    outFilePathList.push(join(entryPointOutDir, "asset", assetFile.name))
                    if (/\.css$/.test(assetFile.name))
                        cssFileLink = `/asset/${assetFile.name}`
                }

    for (const outFilePath of outFilePathList)
        if (/\.html\.js$/.test(outFilePath)) {
            const publicFilePath = join(
                publicOutDir,
                relative(outDir, outFilePath.replace(/\.js$/, "")),
            )
            console.log(
                `Rendering ${colors.dim(outFilePath)} to ${colors.bold(publicFilePath)} (with ${colors.dim(cssFileLink)})...`,
            )
            await mkdir(dirname(publicFilePath), { recursive: true })
            const html = (await import(join(cwd(), outFilePath))).render({
                cssLinks: [cssFileLink],
            })
            await writeFile(publicFilePath, html)
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
