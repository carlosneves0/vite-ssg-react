import NavList from "./component/NavList.jsx"
import "./global.css"

export const __IMPORT_HTML_MODULES = true

export const title = "Bar"

export default function BarPage({ htmls, cssLinks }) {
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
                {cssLinks.map(cssLink => (
                    <link key={cssLink} rel="stylesheet" href={cssLink} />
                ))}
                <title>{title}</title>
            </head>
            <body>
                <NavList title={title} htmls={htmls} />
                <h1>{title}</h1>
            </body>
        </html>
    )
}
