import scriptJS from "./script.js?url"

export default function Footer() {
    return (
        <footer>
            <hr />
            <p>HTML generated at {new Date().toISOString()}</p>
            <p id="access-time">Site accessed at </p>
            <script src={scriptJS} />
            {/* ^ NOTE: this becomes an inline base64 script. */}
            {/* ^ NOTE: what happens for *big* scripts? */}
        </footer>
    )
}
