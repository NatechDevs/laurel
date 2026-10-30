# Validation record

Checked on 29 October 2026 against the independent Laurel project in `bu-gradebook/`.

## Automated checks

`npm test` exercises calculation boundaries, weighting, non-numeric and excluded grades, self-reported requirements, CSV imports/exports, remaining-unit targets, source/DOM consistency, and backup validation. `npm run build` produces the static deployment and standalone editions. Neither command depends on StructureCraft's package scripts.

## Browser checks

Used the XAMPP URL `http://localhost/TO%20KEEP/ASCII-STRUCTURE/bu-gradebook/` with synthetic course data only.

- Imported three courses across two named semesters through the spreadsheet-paste dialog.
- Confirmed that an INC entry was excluded from numeric totals and produced a record-review warning.
- Resolved the INC to a numeric rating and observed GWA update from 1.4000 to 1.2667.
- Checked semester totals and individual semester averages.
- Entered 12 remaining units; the planner returned 2.1125 for a final target of 1.7500 using the unrounded current weighted points.
- Marked all requirements met and confirmed the result changed to Potentially eligible.
- Marked the load requirement unmet and confirmed the result changed to Other requirements not met.
- Previewed a result card and confirmed it retained the assessment warning and omitted the individual course list.
- Checked narrow and desktop layouts. Corrected an absolute-positioned table-label overflow; the page had no horizontal document overflow after the fix. The course table itself scrolls horizontally on narrow screens.

## Limits of these checks

Landing-page update: verified the primary call to action opens `planner.html`, the calculator initializes with its saved-state key unchanged, the text wordmark returns to the landing page, and no icon-logo or BU-shield elements remain in the workspace. Checked the landing layout at desktop and narrow mobile widths; the narrow page did not overflow horizontally. The build now includes both HTML pages and validates the syntax of the bundled standalone scripts.

There is no published Vercel deployment, so Vercel's production headers, domain configuration, and deployment behavior have not been verified against a live deployment. Browser preview of the result card was checked; PNG download, native print dialogs, clipboard permissions, and JSON file selection should be checked again on the target browser before release. These are also listed in the deployment guide.

Screenshots use synthetic example records and are illustrative, not academic certifications.

Final navigation pass: direct methodology links expand the relevant disclosure automatically. The updated workspace script uses a release query so previously cached copies do not hide that behavior. Verified the expanded policy section in the XAMPP browser. The standalone builder checks that all four scripts are embedded and contain valid JavaScript.

## Glass interface and semester-estimate update

- The suite now has 26 passing tests, including weighted semester averages, four-decimal precision, invalid/blank row rejection, exact range endpoints, list limits, and absence of eligibility claims from summary-only results.
- In the browser, semester averages 1.0/2.0 with units 3/9 produced 1.7500. Entering 6 replaced the result with an error and disabled copying.
- Escape dismissed the native estimate dialog. The saved course count remained unchanged.
- Copied a synthetic semester estimate in the browser and confirmed that its text retained the non-affiliation notice. The clipboard fallback was not needed in that check.
- Rules & Sources and Independent Tool Notice are public pages with local navigation. Non-affiliation notices appear on the homepage, planner, estimate dialog, copied text, and PNG result output.
- The theme has translucent panels, mostly opaque inputs, reduced-transparency support, and an opaque fallback when backdrop filters are unsupported. Screen-size/layout checks are separate from the mathematics tests.
- Checked the updated planner at narrow, 390-pixel mobile, and 1280-pixel desktop viewports without horizontal document overflow. All four public HTML pages passed local-link and duplicate-ID checks.

## Appearance, workflow, and result-card update (3.1)

The header offers Light, Dark, and System. Appearance tests cover system changes, saved explicit preferences, invalid values, and unavailable storage. Saving tests cover flushing pending changes on page exit/visibility changes and storage-failure feedback. The browser checks confirmed that the chosen theme survives navigation, Assessment links expand the correct section, the quick estimator opens, and a synthetic 3-unit course with grade 1.5 produces 1.5000. At the 390-pixel mobile preset the course entry uses stacked fields and the document stays within its viewport.

Result previews now use tier-specific palettes, original botanical accents, and a short entrance animation with a reduced-motion alternative. GWA-range and unofficial-result labels remain visible. The redesigned PNG export was exercised in the browser and returned its success message with no console errors; a saved file's appearance was not independently inspected. The image uses a light palette for sharing, independent of the website theme. Print/PDF remains a plain accessible text summary.

Interactive preview check: selecting Midnight updated the pressed style control and preview data-style; Celebrate displayed its acknowledgment; Save image returned its success message. The selected style is read by the canvas exporter. Style choices use native buttons with pressed states, and the celebration is decorative rather than an academic-status change.

## Animated snapshot export

A synthetic course record was exported with Save animation. The in-page player reported 1200×1200, 3.912 seconds, readyState 4, active playback, and no media error; browser console errors were empty. The browser generated a local WebM blob and displayed a download-again link. This verifies local encoding/playback, not compatibility with every sharing app. WebM support is detected before recording and unsupported browsers retain PNG/PDF options. Vercel's media-src policy allows same-origin/blob video for the locally generated preview; production headers have not been tested on a deployment.

Card presentation: all three styles now use a thin double keyline, offset corner rules, a restrained range badge, and a bordered two-column statistics panel. PNG and animated video use the same canvas border drawing. The narrow-browser preview retained four decorative corners and had equal dialog content/client widths (253 px), with no horizontal overflow. The decorations remain separate from the unofficial-result wording.

## Visual-system verification (4.0)

- Main Light and Dark text/background token pairs were measured: body text, secondary text, hover surfaces, primary buttons and their hover state, selected/accent surfaces, warning, and error surfaces. The lowest measured ratio was 5.50:1 in Light and 6.57:1 in Dark; this is a palette check, not a full accessibility certification.
- At 320 CSS pixels, the landing header and workspace measured 304 pixels of content with no horizontal overflow after a header-spacing correction. Desktop landing and planner at 1280 pixels also fit the viewport.
- Desktop share dialog measured 1013 pixels for both client/content width, with a two-column settings/card layout. Selected style colors and a visible keyboard-focus outline were checked. Pointer-hover rules use the same palette tokens; the browser tool does not expose a hover action, so a complete live pointer-hover sweep was not performed.
- Assessment navigation opens its disclosure and updates aria-current. A synthetic course grade of 1.3 retained the expected 1.3000 result during the layout check. Test records were removed afterward.

## Progress, scenarios, and deletion undo (4.1)

The suite has 38 passing tests. New tests cover passed-unit counting independent of GWA inclusion, conditional/failed/unresolved exclusions, zero manual overrides, repeated-name warnings, invalid/excess totals, unequal-unit future projections, invalid future-row rejection, empty current records, and non-mutation/no-eligibility claims. Backup validation checks older records with missing progress settings and valid new progress fields. Production and six-script standalone builds both passed.

Browser checks used synthetic records only: two 3-unit courses at 1.5/1.0 produced 1.2500; progress was 6/120 units (5.0%, 114 remaining). Removing the 1.0 course changed GWA to 1.5000, and Undo restored 1.2500 and both rows. A hypothetical 6-unit course at 2.0 projected 1.6250 while actual rows/GWA stayed unchanged. Entering zero future units removed the old projection and showed validation. Setting confirmed earned units to 3 produced 2.5% and 117 remaining. Progress settings survived reload, while hypothetical courses reset. No console errors were reported, and the simulator's client/content widths both measured 253 pixels at the narrow viewport. These are unit/GWA planning aids, not graduation certification. Test records and settings were cleared afterward.

## Mobile presentation check (4.2)

- Checked the landing and planner at a 320-pixel phone viewport, a 390-pixel preset (reported as 391 CSS pixels by the preview), and a 768-pixel tablet viewport. At the phone preset, document/content measured 391/375; on tablet, 768/753. The tablet course table fit its 695-pixel panel. Rules & Sources and Disclaimer also fit the narrow viewport (320/305) while the rules table remained locally scrollable.
- The new course card used 16px field text and a 48px grade select; its scroll/client widths both measured 308px. The share dialog had matching scroll/client widths of 324px, 16px name entry, and a 44px close control. The narrow what-if dialog had matching 254px widths and a stacked current/projected comparison.
- Both Light and Dark layouts were inspected. A synthetic 3-unit grade of 1.5 still produced 1.5000; a temporary 3-unit future grade of 1.0 projected 1.2500. The test record was removed afterward.
- 38 tests and the static/standalone build passed. All four public pages passed duplicate-ID and local-asset checks. The standalone edition includes the mobile stylesheet. These checks use browser viewport resizing; physical mobile keyboards, safe-area hardware, and platform download apps still require device testing.

## Mobile navigation check (4.3)

The drawer measured 291px for both scroll/client width in a 320px viewport. Opening locked background scrolling; Escape closed it, restored the prior body overflow, and returned focus to Menu. Appearance selection updated the page theme and synchronized desktop/menu controls. Open planner navigation worked, and Honors checklist selection closed the drawer, opened the assessment disclosure, and marked the link current. Resizing to 768px closed an open drawer, restored scrolling, hid the Menu button, and showed the desktop appearance control. Console errors were empty. The portable build includes its explicit edition flag and in-page reference targets. All 38 tests and both builds passed.

## Shared footer (4.4)

All four public pages now share a footer with workspace shortcuts, rules/sources, privacy/local-data information, an independent-tool notice, and Back to top. Mobile navigation links have 44px minimum height and the footer stacks into two link columns under the brand block. Browser validation confirmed that the Privacy & local data link opens the correct disclosure-page section. Static checks confirmed exactly one footer per page, unique IDs, and valid local fragment links. Standalone footer links are rewritten to its own sections. The static and standalone builds passed.

## Visible independence notes (4.5)

All four public pages show a persistent Independent tool descriptor in the wordmark and a visible non-affiliation note immediately below the header. The note highlights unofficial estimates and links to the full disclaimer. The calculator summary, share-preview note, exported-card disclaimer, and footer use stronger wording/weight to distinguish an estimate from university certification. The PNG and animated card share the same canvas drawing. These are transparency measures, not university permission or a guarantee against complaints.

Verified one affiliation note and unique IDs per public page. At the 320-pixel viewport the content fit within 304 pixels; the note was visible above the hero. The Light theme note used foreground #79551e on #fcf1dc, from the previously measured warning palette. The desktop calculator fit its 1280-pixel viewport and showed its unofficial-certification label. All 38 tests and both builds passed.


## 4.6.0 visual and documentation update — 30 October 2026

- All 38 automated tests pass; static and standalone builds complete.
- Browser checked landing and calculator at 390px and 320px; document width
  stayed within the viewport. Mobile navigation and theme selection worked.
- Light/dark surfaces and reference/credit pages checked; no browser console
  errors observed. Landing example target 1.2500 returned required GWA 1.0000
  for the illustrated 18 completed and 18 remaining units.
- Reduced-motion rules suppress the new entrance and hover translations by CSS;
  reduced-transparency and unsupported-blur fallbacks are included. These media
  preference fallbacks were reviewed in source, not emulated on every device.
- No real academic records were added or modified for this update.
- Vercel publication and live security-header verification remain outside this
  local validation.
