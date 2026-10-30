# Privacy and local records

Laurel stores the profile, course records, semester names, inclusion flags, and assessment answers in this browser's local storage. Names and programs are optional. A student ID, password, email address, or portal credential is not required or collected.

Application code does not upload grades, send analytics, contact a student portal, or request remote fonts. It has no user accounts, cloud database, or cross-device synchronization. On a hosted site, the browser still requests the site's static files from its hosting provider, which may process standard request metadata under its own policies. “No grade uploads” should not be described as “no hosting logs.”

Anyone with access to the same browser profile may be able to view locally saved records. Use the reset option on a shared device after keeping a backup where appropriate. Clearing browser data, private browsing sessions, browser storage restrictions, or storage quotas may affect saving.

JSON backups contain the complete workspace, including optional profile details and every course record. CSV exports contain all course names, units, grades, and semester names. Keep these files private unless you intend to disclose them. Neither format encrypts the data.

Shared PNG/text/PDF summaries contain the selected GWA scope, included units, course count, GWA range, and assessment status. Name and degree program are excluded by default. Individual course rows are omitted. The application prepares the output locally; users choose where to share it.

Records are not shared between different origins automatically. Export a JSON backup before moving from a local file to a hosted URL, between preview and production URLs, or to a new custom domain. Keep the old backup until you confirm the restore succeeded.

The semester-average estimator is a temporary calculation. Its inputs stay in page memory while the current planner page remains open and are not written to the saved record, JSON backup, or server. Reloading the page clears these temporary inputs. Copied estimates retain an eligibility limitation and non-affiliation notice.

If cloud features, analytics, portal access, remote OCR, or other integrations are added later, update this notice and implement the appropriate data-access and consent flow before enabling them.

The appearance preference is stored separately under `laurel-appearance`. It contains only `light`, `dark`, or `system`, is shared by pages on this origin, and is not included in academic backups or removed by resetting course records. With System selected, the application reads the browser's color-scheme preference. No appearance information is transmitted by application code.

Degree-unit totals and optional confirmed earned units are part of the saved local workspace and JSON backups. The what-if simulator and up to 20 deleted courses are kept only in current-page memory; they are not uploaded or included in JSON backups. Reset/restore clears deletion history, and reload clears both temporary planning inputs and deletion history.
