import path from "node:path"
import process from "node:process"

export default { absolute, normalize }

export function absolute(posixPath) {
    return /^\//.test(posixPath) ? posixPath : `/${posixPath}`
}

export function normalize(osPath) {
    const isWindows = process.platform === "win32"
    return path.posix.normalize(isWindows ? osPath.replace(/\\/g, "/") : osPath)
}
