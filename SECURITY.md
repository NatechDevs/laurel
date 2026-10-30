# Security policy

## Scope

Laurel is a static browser application. Academic records and optional profile
details are stored in the current browser; there is no application account or
grade-upload service. Hosting providers still receive ordinary web requests.
See `docs/PRIVACY.md` for data-handling details.

## Reporting a vulnerability

A dedicated private reporting address has not been configured. Before public
release, the maintainer should publish a monitored private contact or enable
private vulnerability reporting on the actual source repository.

Do not post real student records, backups, credentials, or exploitable details
in a public issue. Prepare a minimal report using synthetic grades, affected
version, browser, reproduction steps, expected behavior, and observed behavior.
No response-time commitment or bug bounty is currently offered.

## Maintenance checks

- Treat imported CSV and JSON as untrusted input; validate and render as text.
- Never add analytics, uploads, or third-party scripts without updating privacy
  documentation and reviewing the deployment content security policy.
- Run `npm test` and `npm run build` before publishing.
- Verify security headers on the deployed host; local Apache preview does not
  establish that Vercel response headers are active.
- Keep exported backups off public repositories and screenshots.
