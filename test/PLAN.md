1. Bootstrap a sample project that uses all features

    - React/JSX (`REACT-JSX`)
    - Global CSS (`GLOBAL-CSS`)
    - Local CSS (`LOCAL-CSS`)
    - Global Vanilla JS (`GLOBAL-VJS`)
    - Inline Vanilla JS (`GLOBAL-INLINE-VJS`)
    - **TO-DO**: local vanilla JS (`LOCAL-VJS`, `LOCAL-INLINE-VJS`)
    - `htmls` prop (`HTMLS-PROP` + `HTMLS-PROP:IMPORT-MODULES`)
    - Hot-reload (`HOT-RELOAD`)

2. Validate each feature in each script

    - dev (`DEV`)
    - build (`BUILD`)
    - serve (`SERVE`)

---

## `DEV`

### Test #0: `DEV:REACT-JSX`

1. Start dev-server
2. Hit each page route in parallel
3. Assert the rendered HTML in each route

### Test #1: `DEV:GLOBAL-CSS`

1. Start dev-server
2. Hit each page route in parallel
3. Assert that the globally imported CSS files are present at the end of each HTML's head

### Test #2: `DEV:LOCAL-CSS`

1. Start dev-server
2. Hit each page route
3. Assert that the locally imported CSS files are present only in each specific HTML's head

### Test #3: `DEV:GLOBAL-VJS`

1. Start dev-server
2. Hit each page route in parallel
3. Assert the globally imported Vanilla JS files are present at the end of each page's body

### Test #3: `DEV:GLOBAL-INLINE-VJS`

1. Start dev-server
2. Hit each page route in parallel
3. Assert the inlined Vanilla JS files are present at the end of each page's body as base64 inlined script tags

### Test #4: `DEV:HTMLS-PROP`

1. Start dev-server
2. Hit each page route
3. Assert that the injected `htmls` prop has each `index.html.jsx` in the source folder.
    - Without the `module` property

### Test #5: `DEV:HTMLS-PROP:IMPORT-MODULES`

1. Start dev-server
2. Hit each page route that exported `__IMPORT_HTML_MODULES = true`
3. Assert that the injected `htmls` prop has each `index.html.jsx` in the source folder.
    - With the `module` property

### Test #6: `DEV:HOT-RELOAD`

We'll need a websocket-capable client here...
Puppeteer? Playwright?

## `BUILD`

### Test #0: `BUILD:REACT-JSX`

1. Start dev-server
2. Hit each page route in parallel
3. Assert the rendered HTML in each route

### Test #1: `BUILD:GLOBAL-CSS`

1. Start dev-server
2. Hit each page route in parallel
3. Assert that the globally imported CSS files are present at the end of each HTML's head

### Test #2: `BUILD:LOCAL-CSS`

1. Start dev-server
2. Hit each page route
3. Assert that the locally imported CSS files are present only in each specific HTML's head

### Test #3: `BUILD:GLOBAL-VJS`

1. Start dev-server
2. Hit each page route in parallel
3. Assert the globally imported Vanilla JS files are present at the end of each page's body

### Test #3: `BUILD:GLOBAL-INLINE-VJS`

1. Start dev-server
2. Hit each page route in parallel
3. Assert the inlined Vanilla JS files are present at the end of each page's body as base64 inlined script tags

### Test #4: `DEV:HTMLS-PROP`

1. Start dev-server
2. Hit each page route
3. Assert that the injected `htmls` prop has each `index.html.jsx` in the source folder.
    - Without the `module` property

### Test #5: `DEV:HTMLS-PROP:IMPORT-MODULES`

1. Start dev-server
2. Hit each page route that exported `__IMPORT_HTML_MODULES = true`
3. Assert that the injected `htmls` prop has each `index.html.jsx` in the source folder.
    - With the `module` property
