# Deploying Laurel on Vercel

The project has deployment configuration; it has not been deployed by this task. No Vercel account, token, or public repository was created.

## Choose the correct project root

Laurel has its own repository at https://github.com/NatechDevs/laurel. Import that
repository and leave Vercel Root Directory at the repository root (`.`). The local
checkout may live inside an unrelated project; do not import or deploy that
parent project's repository.

## Dashboard setup

1. Push the project source to a Git repository you control.
2. In Vercel, add a project and import that repository.
3. Select the correct Root Directory: `bu-gradebook` when it is nested, or the repository root when it has its own repository.
4. Use Framework Preset **Other**. `vercel.json` declares `framework: null`.
5. Use build command `npm test && npm run build` and Output Directory `dist`.
6. No environment variables or database are required. Use a supported Node.js version of at least 22.
7. Deploy, then review the resulting preview URL before promoting your public domain.

The settings in `vercel.json` are supported by Vercel's [build configuration](https://vercel.com/docs/builds/configure-a-build) and [static project configuration](https://vercel.com/docs/project-configuration/vercel-json). Vercel interfaces and supported runtimes can change; consult those official references when deploying.

## What gets deployed

The build copies the landing page (`index.html`), calculator workspace (`planner.html`), public `sources.html` and `disclaimer.html` pages, CSS, JavaScript, local fonts, the font license, and a 404 page into `dist`. Source tests, developer documents, backups, local grades, and the supplied handbook PDF are not copied into the deployment output. Fonts are served from the same origin. There are no runtime package dependencies or server functions.

The repository includes response headers for content-type protection, framing restrictions, referrer handling, and a Content Security Policy. Application network connections are disabled by `connect-src 'none'`; same-origin page scripts, styles, fonts and images still load. The policy allows inline CSS for dynamic visual states and print output, but not inline JavaScript.

The local Node preview is a simple static server and does not emulate all Vercel response headers. Verify those headers on a real preview deployment.

## Verify the deployment

- Open the home page and confirm Poppins loads without external font requests.
- Import the CSV template, edit a grade, and check that the GWA updates.
- Reload and confirm local saving works.
- Select one semester; confirm the summary labels it as a semester result.
- Review the eligibility breakdown with unknown, unmet, and complete answers.
- Enter a remaining-unit scenario and inspect reachable/unreachable targets.
- Preview and save a PNG, copy a summary, and print to PDF.
- Export JSON, reset only your test records, and restore the backup.
- Inspect a narrow mobile screen, keyboard navigation, and an unknown URL/404.
- Confirm the privacy notice still matches the deployed behavior and any hosting settings.

## Existing user records

Local storage is scoped to the browser and origin. Data from `file://`, localhost, a Vercel preview domain, a production Vercel domain, and a custom domain will not necessarily be shared. Before moving URLs, export JSON at the old URL and restore it at the new one. There is no server migration or automatic synchronization.

## Updating and rolling back

Edit source files, run `npm test`, then `npm run build`. Preview the build before pushing. Keep handbook rule changes separate from purely visual changes when possible. Use Vercel's deployment history for rollback, and keep the local-storage schema backward compatible. A code rollback does not roll back a user's browser-local records.


## Public notices and credits

The build copies `LICENSE`, `AUTHORS.md`, and `THIRD_PARTY_NOTICES.md` to `dist/`.
The disclaimer page includes developer attribution and links to those notices.
Maintainer-only workflow and security guidance stay in the source checkout.
The standalone edition embeds the application and font notices in HTML comments
and includes adjacent application-license and third-party-notice files.
Before release, confirm the displayed developer identity and publish a monitored
private security-reporting channel; none is configured by the build.
