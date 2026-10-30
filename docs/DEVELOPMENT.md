# Architecture and maintenance

## Runtime

`index.html` is the public landing page; `planner.html` contains the working calculator. The landing page uses no JavaScript and shares the local Poppins stylesheet with the planner. Its example record is static, explicitly illustrative, and does not modify local storage. Use the text wordmark throughout; there is no icon logo or university seal.

Laurel uses native HTML, CSS, and JavaScript. No framework, CDN, API key, backend, or npm dependencies are required. Scripts load in order: `core.js`, `app.js`, `workspace.js`, then `quick.js`. The workspace initializes before the independent semester-estimate handlers are installed.

- **core.js:** policy constants, unit/grade validation, GWA and assessment status, target scenario algebra, CSV/TSV parsing, CSV serialization.
- **app.js:** state, record editing, local persistence, backup/restore, dialogs, and share-card generation.
- **workspace.js:** semester reports, explainable checks, spreadsheet import orchestration, planning output, and initial render.
- **app.css:** typography, colors, spacing, responsive layout, dialogs, reduced motion, and print styles.
- **theme.css:** restrained glass styling, contrast/transparency fallbacks, notice pages, and estimate-dialog layout.
- **quick.js:** temporary semester-average inputs and copyable estimates; never writes to the saved degree record.
- **build.mjs:** copies the static deployment output and generates a separate single-file edition with embedded fonts and scripts.

## State schema

Local-storage key: `laurel-bu-v1`. The v1 key/schema is retained so existing records from the initial tool remain readable.

```json
{
  "version": 1,
  "name": "",
  "program": "",
  "terms": [{ "id": "t1", "name": "Year 1 · 1st semester" }],
  "courses": [{ "id": "unique-id", "name": "Mathematics", "units": "3", "grade": "1.2", "include": true, "term": "t1" }],
  "checks": {
    "load": "unknown",
    "curriculum": "unknown",
    "residency": "unknown",
    "history": "unknown",
    "complete": false
  }
}
```

Eligibility answers are `yes`, `no`, or `unknown`; `complete` is boolean. Stable IDs connect courses to semesters. JSON restore validates shape, IDs, term references, limits, and fields before replacing current state. Draft numeric fields can be incomplete and are reported in the UI. Unknown future schemas must not be silently interpreted as v1.

## Design conventions

Poppins weights 400, 500, 600 and 700 are local font assets. The visual direction is minimalist glassmorphism: translucent white panels, restrained navy actions/summary, muted accent text, subtle diffuse background color, and thin borders. Inputs remain mostly opaque for readability. Use the reduced-transparency and unsupported-browser fallbacks; never depend on blur alone to separate controls. Avoid decorative animations, arbitrary badges, unnecessary charts, or an official university seal. Keep uncertainty explicit and preserve readable text and keyboard focus states.

## Tests and builds

```sh
npm test
npm run build
npm start
```

The test suite covers exact honors thresholds, four-decimal boundaries, weighted units, non-numeric grades, excluded low grades, self-reported conditions, incomplete records, semester scope, future-grade targets, CSV quoting, invalid rows, import limits, spreadsheet formula-prefix protection, script syntax, HTML IDs, and local asset references. The project uses Node's built-in test runner.

Perform browser interaction and layout verification after changes to DOM structure, responsive styles, importing, saving, or result sharing. Automated calculation tests do not establish visual quality or prove Vercel-specific response-header behavior.

## Security and data handling

User text is escaped before insertion into HTML. CSV exports quote fields and prefix leading formula characters to reduce formula interpretation in spreadsheet software. JSON restore rejects invalid structure and duplicate IDs. Import validation finishes before any state mutation. No user-entered grades are sent over the network by application code.

Keep `vercel.json` restrictions compatible with future features. If adding external analytics, cloud persistence, a portal connector, or third-party OCR, revisit the privacy notice and network policy first. Do not place secrets in browser JavaScript.

## Updating policy

Obtain the applicable handbook or registrar guidance, record the edition and relevant sections, then update `POLICY` and any assessment conditions in `core.js`. Update thresholds in HTML, planner options, sharing language, the in-app guide, and `METHODOLOGY.md`. Add tests for exact cutoffs and newly introduced exceptions. The tool deliberately does not infer underload exceptions or automatically confer Academic Distinction.

## Font sources

Google Fonts stylesheet used during preparation:

`https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap`

The corresponding font files and upstream [SIL Open Font License](https://github.com/google/fonts/blob/main/ofl/poppins/OFL.txt) are retained locally. The running website does not request that stylesheet.

## Visual system (4.0)

`assets/design.css` owns the final page composition and shared `--ui-*` color tokens. The Light and Dark palettes define normal, hover, selected, focus, disabled, warning, and error states. Card export styles remain independent of the surrounding app theme. The homepage uses a split hero with a labeled example record; the planning example uses 18 units at 1.5000 and 18 future units at 1.4000 to illustrate a final 1.4500 GWA. The desktop share dialog separates settings from the card and collapses to one column on smaller screens. The standalone builder embeds the design stylesheet after the existing base/theme layers.

Public frontend HTML, CSS, and JavaScript are visible to browsers. Minification can make code less convenient to read, but cannot prevent copying or imitation. Never put secrets in this static bundle. Any future private processing or credentials belong on a properly secured server; this planner currently works locally without those services.

## Planning tools (4.1)

`core.js` exposes pure `degreeProgress` and `projectGrades` helpers. Progress is independent of GWA inclusion, and its optional confirmed-unit override accounts for curriculum credit that course rows cannot establish. `planning.js` renders the progress UI and owns a temporary future-course list and bounded undo history. App state retains schema version 1; missing `degreeUnits`/`earnedUnits` fields normalize to empty strings during backup validation. The standalone build now embeds six scripts.

The final responsive layer is `assets/mobile.css`, loaded after `design.css` and embedded by the standalone builder. It owns phone/tablet composition and touch sizing, without changing calculation behavior or stored records. Viewport-fit and safe-area spacing support edge-to-edge mobile browsers. Responsive browser checks are not a substitute for physical iOS/Android keyboard and download testing.
