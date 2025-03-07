import NavList from './component/NavList.jsx'
import "./global-script.js?vanilla"
import "./global.css"
import homeCSS from "./home.css?url"

export const __IMPORT_HTML_MODULES = true

export const title = "Home"

export default function HomePage({ htmls, cssLinks, jsLinks }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,user-scalable=yes" />
                <meta name="color-scheme" content="light dark" />
                <link
                    rel="icon"
                    type="image/gif"
                    href="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                />
                {[...cssLinks, homeCSS].map(cssLink => (
                    <link key={cssLink} rel="stylesheet" href={cssLink} />
                ))}
                <title>{title}</title>
            </head>
            <body>
                <NavList title={title} htmls={htmls} />
                <h1>{title}</h1>
                <p>Hello, world.</p>
                <p id="thanks">
                    Many thanks to{" "}
                    <a href="https://vite.dev/" target="_blank">
                        {/* <img src="/vite.svg" /> */}
                        Vite
                    </a>{" "}
                    and{" "}
                    <a href="https://react.dev/" target="_blank">
                        {/* <img src={reactSVG} /> */}
                        React
                    </a>
                    !
                </p>
                {jsLinks.map(jsLink => (
                    <script key={jsLink} src={jsLink} />
                ))}
            </body>
        </html>
    )
}
