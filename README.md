# Laurel — BU Academic Planner

A browser-local workspace for Bicol University students to calculate a unit-weighted GWA, review Latin honors requirements, organize semester records, and plan remaining grades. The application is independent of BU and uses the supplied **BU Student Handbook, revised 2019** as its policy reference.

**Project boundary:** Laurel is a separate application from StructureCraft. This repository contains its source, fonts, tests, build scripts, documentation, and Vercel configuration. Run commands from the repository root and deploy it as its own Vercel project.

Repository: [NatechDevs/laurel](https://github.com/NatechDevs/laurel).

The homepage is a dedicated introduction with a split hero, a product preview, an interactive planning example, features, workflow, policy context, and FAQs. **Start calculating** opens `planner.html`, where the actual grade-entry workspace lives. The example record on the homepage is illustrative and never creates or modifies student data.

## Features

- Self-hosted Poppins typography, navy and warm neutral colors, responsive layout, keyboard focus states, reduced-motion support, and explicit input labels.
- Minimal glass surfaces with readable contrast, blur fallbacks, and reduced-transparency support.
- Course and semester records with automatic local saving.
- CSV/TSV import, spreadsheet paste, quoted CSV fields, optional semester column, downloadable CSV template, and CSV export.
- Four-decimal GWA calculation and a separate, explainable honors assessment.
- Semester overview and remaining-grade target scenarios.
- A separate temporary, unit-weighted semester GWA estimator for students who already have term averages.
- Visible non-affiliation notices and public disclaimer/source pages.
- PNG result cards, copyable summaries, and print/PDF output. Including a name and degree program is optional.
- JSON backup/restore, including profile, semester IDs, course inclusion flags, and self-reported checks.
- No application backend, account system, portal scraping, analytics, or external font requests.

## Run locally

Use Node.js 22 or later. There are no npm package dependencies.

```sh
npm test
npm run build
npm start
```

Open `http://127.0.0.1:4180`. Stop the preview with Ctrl+C. Run these commands from this repository's root.

The build produces two editions:

| Output | Purpose |
| --- | --- |
| `dist/` | Static site for Vercel or another static host; fonts and scripts are separate local assets. |
| `standalone/index.html` | Self-contained offline HTML, with embedded fonts, CSS, scripts, and font-license notice. Open directly in a browser. |

Source `index.html` depends on `assets/`. When sending someone a single HTML file, use the **standalone build** instead.

## Deployment

The project is prepared for deployment but has not been published. See [Vercel deployment](docs/DEPLOYMENT.md). For this repository, use Root Directory **`.`** (the repository root), Framework Preset **Other**, build command `npm test && npm run build`, and output directory `dist`. Build settings are declared in `vercel.json`.

## How honors determination works

Entering grades determines a GWA range; it cannot independently establish university eligibility. The application separately checks entered grades for failures/conditional ratings, unresolved entries, missing values, and self-reported curriculum/load/residency requirements. “Potentially eligible” remains an estimate based on the user's own records and statements.

The app does not connect to the student portal, validate a transcript, certify graduation, or automatically award Academic Distinction. See [Calculation and policy](docs/METHODOLOGY.md) for the rules, source edition, and limitations.

## Documentation

- [User guide](docs/USER-GUIDE.md): entering grades, imports, assessment, planning, and sharing.
- [Calculation and policy](docs/METHODOLOGY.md): formula, precision, honors thresholds, and excluded/non-numeric grades.
- [Vercel deployment](docs/DEPLOYMENT.md): setup, build, validation, updates, and data migration.
- [Architecture and maintenance](docs/DEVELOPMENT.md): files, data schema, tests, and policy updates.
- [Privacy](docs/PRIVACY.md): local storage, exports, shared computers, and hosting.
- [Validation record](docs/VALIDATION.md): automated checks, browser verification, and release-check limits.
- [Reference review](docs/REFERENCE-REVIEW.md): synthetic tests across the three supplied calculators.
- [Policy source audit](docs/POLICY-SOURCES.md): verified rules, unresolved exclusions, and identity context.
- Public [Rules & Sources](sources.html) and [Independent Tool Notice](disclaimer.html) pages.
- The website also includes an in-app guide and policy notes.

## Project layout

```text
bu-gradebook/
  index.html                   Public landing page and text wordmark
  planner.html                 Accessible workspace markup and in-app guide
  404.html                     Missing-page fallback
  assets/
    app.css                    Design system, layout and responsive styles
    theme.css                  Minimal glass surfaces and readable fallbacks
    core.js                    Pure calculation, planning and CSV functions
    app.js                     Record management, local storage and result cards
    workspace.js               Assessment breakdown, reports and import UI
    quick.js                   Temporary semester-average estimates
    fonts/                     Poppins weights 400–700 and OFL license
  scripts/
    build.mjs                  Static and standalone builds
    serve.mjs                  Loopback-only local preview
  tests/
    core.test.cjs              Calculation, CSV and source consistency tests
  docs/                        User, deployment, policy and maintenance docs
  vercel.json                  Vercel build settings and response headers
```

## Credits and licensing

Developed and maintained by **NatechDevs**. Laurel is separate from StructureCraft.
Application source and original project materials are **All rights reserved**;
see [LICENSE](LICENSE). This is not an open-source license. Users may use the
hosted tool and share outputs generated from their own records. Browser-delivered
code remains viewable; the notice does not technically prevent copying.

Poppins retains its SIL Open Font License in `assets/fonts/OFL.txt`. See
[third-party notices](THIRD_PARTY_NOTICES.md), [developer credits](AUTHORS.md),
[security reporting](SECURITY.md), [maintenance workflow](CONTRIBUTING.md), and
[release notes](CHANGELOG.md). No BU seal, official logo, or handbook PDF is
redistributed. No university affiliation or endorsement is claimed.

### Planning update · 4.1

The planner includes degree-unit progress with an optional confirmed-credit override, a separate temporary what-if simulator, and undo for the latest 20 course deletions in the current page session. See [the user guide](docs/USER-GUIDE.md) for credit-counting limits and backup behavior. All calculations remain local.


### Visual update · 4.6

`assets/glass.css` applies shared frosted surfaces after responsive styles.
`assets/appearance.js` adds reduced-motion-aware entrance cues and an interactive,
illustrative target-GWA example. The example does not modify saved records.
Public credits and license details are linked in every shared footer.
