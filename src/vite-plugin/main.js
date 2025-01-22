import ssgHTML from "./ssg-html.js"
import ssgCSS from "./ssg-css.js"
import ssgVanillaJS from "./ssg-vanilla-js.js"
import ssgReact from "./ssg-react.js"

export default () => [ssgHTML(), ssgCSS(), ssgVanillaJS(), ssgReact()]
