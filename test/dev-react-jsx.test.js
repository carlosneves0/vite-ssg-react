import { JSDOM } from "jsdom"

const PORT = globalThis.__DEV_SERVER_PORT__,
    ORIGIN = `http://localhost:${PORT}`

test("DEV: render React/JSX into HTML: GET /", async () => {
    const response = await fetch(`${ORIGIN}/`)

    expect(response.ok).toBe(true)

    const html = await response.text(),
        { document } = new JSDOM(html).window,
        title = "Home page"

    expect(document.title).toBe(title)

    expect(document.querySelector("body > h1").textContent).toBe(title)

    expect(document.querySelector("body > p:first-of-type").textContent).toBe(
        "Hello, world.",
    )

    expect(document.querySelector("body > p#thanks").textContent).toBe(
        "Many thanks to Vite and React!",
    )
})
