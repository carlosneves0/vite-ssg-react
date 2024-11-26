import scriptJS from "./script.js?raw&inline"

console.log("DEBUG", "scriptJS", scriptJS)

export default function Footer() {
    return (
        <footer>
            <hr />
            <p>HTML generated at {new Date().toISOString()}</p>
            <p id="access-time">Site accessed at </p>
            <script dangerouslySetInnerHTML={{ __html: scriptJS }} />
        </footer>
    )
}
