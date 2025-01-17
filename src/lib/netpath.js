import process from "node:process"
import path from "node:path"

export function normalize(osPath) {
    const isWindows = process.platform === "win32"
    return path.posix.normalize(isWindows ? osPath.replace(/\\/g, "/") : osPath)
}

export function absolute(posixPath) {
    return /^[^\/]/.test(posixPath) ? `/${posixPath}` : posixPath
}

export function trim(posixPath) {
    if (posixPath === "/") return posixPath
    return posixPath.replace(/\/$/, "")
}
