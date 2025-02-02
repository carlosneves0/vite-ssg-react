# `vite-ssg-react` <a href="https://npmjs.com/package/vite-ssg-react"><img src="https://img.shields.io/npm/v/vite-ssg-react" alt="npm package"></a>

## Disclaimer

This repo is very much a work-in-progress at this stage. There are still bugs and things might break.

## Commands

`dev`, `build`, and `preview` scripts like Vite to generate static HTML websites from React/JSX

### `npm run dev`

Start an SSR dev-server with hot-reloading.

### `npm run build`

Pre-render all JSX into HTML/CSS/JS & assets into the HTTP-ready folder `dist/public`.

### `npm run preview`

First run the `build` command, and then start an HTTP server serving the `dist/public` folder.

## HTML

Each `index.html.jsx` file in the `src` folder will output a corresponding `index.html` file in the `dist/public` folder.

### Create a new HTML page

To render this web-page at `/foo`, then either create the file `src/foo.html.jsx` or the file `src/foo/index.html.jsx`. In this file, define a JSX component as the default export.

Note that `.html.jsx` files must render the whole HTML structure: `<html>`, `<head>`, and `<body>`. Only the `<!doctype html>` tag is left out.

> [!IMPORTANT]
> **Known limitation**: If `config.build.emptyOutDir` is turned on, then there can't be more than one `.html.jsx` file in the same folder, due to the way the output files are overwritten in `dist/server`.

### The `htmls` prop

This prop carries a list of every `.html.jsx` entrypoint scattered in the `src` folder. By default, each object in `htmls` has the shape:

```js
{
    path: '/users/my-user/path/to/website.com/src/my-page/index.html.jsx',
    link: '/my-page'
}
```

If a `.html.jsx` file defines the `__IMPORT_HTML_MODULES` export as below, then its `htmls` prop will be incremented with the ESM modules of each `.html.jsx` file in `src`:

```js
export const __IMPORT_HTML_MODULES = true

export default function Page({ htmls }) {
    return (
        <html>
            <body>
                <h2>List of Pages</h2>
                {htmls.map => (
                    html => (
                        <a key={html.link} href={html.link}>
                            {html.module.title}
                            {/* NOTE: assuming each `.html.jsx` entrypoint exports a `title` `*/}
                        </a>
                    )
                )}
            </body>
        </html>
    )
}
```

## CSS

### The `cssLinks` prop (_global_ CSS imports)

In Vite, it's usual to straight up import CSS files:

```js
import "./style.css"
```

Each CSS file imported like `import "./style.css"` will automatically be appended to the `cssLinks` prop, which is injected into every `.html.jsx` entrypoint.

> [!IMPORTANT]
> **Known bug**: _during development_, files imported in this way will be injected into all entrypoints, even if that entrypoint doesn't transitively depend on that CSS file. This bug doesn't happen in the production build.

> [!TIP]
> For now, this can be mitigated by only including "global" CSS for globally shared components. For styles specific to a web-page, include them with the `?url` parameter. [See the session below](#local-css-imports).

The `cssLinks` prop must be rendered as `<link>` tags, otherwise no CSS will be loaded by the final HTML page:

```jsx
<head>
    {cssLinks.map(cssLink => (
        <link key={cssLink} rel="stylesheet" href={cssLink} />
    ))}
</head>
```

<h3 id='local-css-imports'>Prevent CSS imports from being automatically injected into <code>cssLinks</code> (<i>local</i> CSS imports)</h3>

Use the `?url` parameter when importing:

```jsx
import exclusiveStyleCSS from "./exclusive-style.css?url"

export default function SomePage({ cssLinks }) {
    // assert exclusiveStyleCSS not in cssLinks
    return (
        <html>
            <head>
                <link rel="stylesheet" href={exclusiveStyleCSS} />
            </head>
        </html>
    )
}
```

In doing this, `exclusive-style.css` will not be present in the `cssLinks` prop, and must be manually rendered as a `<link>` tag.

### Inlining

TO-DO: explore CSS inlining...

## Vanilla JS

### _Global_ vanilla JS imports & the `jsLinks` prop

All JS files imported like below won't be evaluated at build-time, only at page-load-time; and their links will be appended to the `jsLinks` prop, which is injected into every `.html.jsx` entrypoint.

```js
import "./my-script.js?vanilla"

export default function WebPage({ jsLinks }) {
    return (
        <html>
            <body>
                {jsLinks.map(jsLink => (
                    <script key={jsLink} src={jsLink} />
                ))}
            </body>
        </html>
    )
}
```

Like it's done for the `cssLinks` prop, the `jsLinks` prop must also be rendered as `<script>` tags.

#### Inlining

```js
import "./my-script.js?vanilla&inline"
```

`my-script.js` will be inlined into the final HTML as a base64 link.

### _Local_ vanilla JS imports

Doing `import localJS from './local.js?url` works fine for this use case. `localJS` won't be injected into `jsLinks`, and `config.build.assetsInlineLimit` will be followed properly.

## Notes on further improvements

- Typescript
- Expand tests
- Will bringing back client-side rending during development speed up the hot-reloading?
- Somehow optimize asset copying during build
- Allow turning on `config.build.emptyOutDir` without the limitation of at most one `.html.jsx` file per folder
- Respect `config.build.emptyOutDir` before emptying `dist/public`
- Fix global CSS imports in development
- Follow `config.build.assetsInlineLimit` for auto-inlining vanilla JS files