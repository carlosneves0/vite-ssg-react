import { JSDOM } from "jsdom"

const PORT = globalThis.__DEV_SERVER_PORT__,
    ORIGIN = `http://localhost:${PORT}`

describe("DEV:REACT-JSX: render React/JSX into HTML", () => {
    test("/", async () => {
        const response = await fetch(`${ORIGIN}/`)

        expect(response.ok).toBe(true)

        const html = await response.text(),
            { document } = new JSDOM(html).window,
            title = "Home"

        expect(document.title).toBe(title)

        expect(document.querySelector("body > h1").textContent).toBe(title)

        expect(document.querySelector("body > p:first-of-type").textContent).toBe(
            "Hello, world.",
        )

        expect(document.querySelector("body > p#thanks").textContent).toBe(
            "Many thanks to Vite and React!",
        )
    })

    test("/foo", async () => {
        const response = await fetch(`${ORIGIN}/foo`)

        expect(response.ok).toBe(true)

        const html = await response.text(),
            { document } = new JSDOM(html).window,
            title = "Foo"

        expect(document.title).toBe(title)

        expect(document.querySelector("body > h1").textContent).toBe(title)
    })

    test("/bar", async () => {
        const response = await fetch(`${ORIGIN}/bar`)

        expect(response.ok).toBe(true)

        const html = await response.text(),
            { document } = new JSDOM(html).window,
            title = "Bar"

        expect(document.title).toBe(title)

        expect(document.querySelector("body > h1").textContent).toBe(title)
    })
})
