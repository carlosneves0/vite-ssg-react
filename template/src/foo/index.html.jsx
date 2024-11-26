import NavBar from "../component/NavBar.jsx"
import Footer from "../component/Footer"
import reactSVG from "../asset/react.svg"
import "../index.css"

export default function HomeHTML({ cssLinks }) {
    return (
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width,user-scalable=yes" />
                <link rel="icon" type="image/svg+xml" href={reactSVG} />
                {cssLinks &&
                    cssLinks.map(cssLink => (
                        <link key={cssLink} rel="stylesheet" href={cssLink} />
                    ))}
                <title>Foo page</title>
            </head>
            <body>
                <NavBar
                    links={[
                        { text: "Home", href: "/" },
                        { text: "Foo", href: "/foo", isDisabled: true },
                    ]}
                />
                <h1>Foo page</h1>
                <Footer />
            </body>
        </html>
    )
}
