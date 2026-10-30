# Using Laurel

The home page introduces Laurel and its approach. Select **Open planner** or **Start your grade planner** to enter the workspace at `planner.html`. The text wordmark in the planner returns to the landing page. Both pages use the same browser origin, so navigating between them does not reset your saved record.

## 1. Start with your academic record

Use the final grade and credit units from your student portal, grade report, or transcript. Your name and program are optional; a student ID is not required or collected.

Create a semester, select it, and add the courses taken in that term. When **All semesters** is selected, newly added courses go into the most recently created semester. The small label below each course shows its semester.

Grades use the BU numeric scale. Select **INC**, **DRP**, or **PENDING** if no final numeric rating is available. A grade of 5.0 is a failure and must not be hidden from the academic record.

The **In GWA** checkbox controls whether a numeric grade and its units enter the average. Follow your registrar's instructions when excluding courses. An excluded grade greater than 3.0 still fails the grade-history condition; unchecking it cannot conceal it from the honors assessment.

## 2. Import a spreadsheet

Select **Import grades**, then paste spreadsheet cells or load a CSV/TSV file. Use this column order:

```csv
Course,Units,Grade,Semester
Mathematics,3,1.2,Year 1 - First semester
"Science, Technology and Society",3,1.5,Year 1 - First semester
Literature,3,INC,Year 1 - First semester
```

The header and Semester column are optional. Names containing commas must be quoted in CSV; spreadsheet CSV exports handle this. Tab-separated spreadsheet cells can be pasted directly. Use one decimal place for numeric grades; a number such as `1.25` is not silently converted into a valid BU course grade. Decimal credit units are supported to four places, greater than zero and at most 30 per course.

Review the text, then select **Add courses**. Imports validate every row before changing the record. If one row fails, no rows are added. Named semesters are created as necessary; without a semester column, courses go into the selected or most recently created term. Reimporting the same file adds duplicates, so review your list first. Imports are limited to 500 rows at a time and 2 MB; the workspace supports 3,000 courses and 100 semesters.

CSV is for moving course lists. **JSON backup is for restoring the complete workspace**, including inclusion flags and eligibility answers. Exported CSV includes all courses; importing it includes all numeric grades by default, so review the inclusion flags afterward.

## 3. Read the result correctly

The summary reflects the selected scope. **All semesters** combines all included numeric courses by credit units. A single-semester result never establishes graduation honors.

Possible messages include:

| Message | Meaning |
| --- | --- |
| GWA range | The number is within an honors range, but eligibility has not been established. |
| Record needs attention | An entry is incomplete or unresolved; valid numeric entries alone form the displayed average. |
| Grade requirement not met | A grade greater than 3.0 appears in the entered record, or your full-history answer says one exists. |
| Other requirements not met | You indicated an unmet regular-load, curriculum, or residency condition. |
| Potentially eligible | Your entered complete record and all self-reported checks meet the listed conditions; BU must still evaluate it. |

Use the assessment breakdown to see the reason for each status. It always reviews all entered semesters, even when the summary shows a single semester. Self-reported answers are labeled explicitly.

## 4. Plan remaining grades

### Already have semester GWAs?

Select **Semester GWA estimate** near the top of the workspace. Enter each average (1.0000–5.0000) and the units included in it. The temporary dialog accepts up to 50 semesters. Every row must be valid; zero, blank, and out-of-range values are rejected rather than silently ignored.

This estimate is separate from your saved course record and JSON backups. Inputs stay while the current page remains open, but are not saved after reload. Rounded semester averages can differ from a course-level calculation. Averages cannot establish grade history, regular loads, or residency; the result never confirms honors eligibility. You can copy its labeled summary.

### Future-grade scenarios

Enter the number of remaining degree units and choose a target final GWA. The planner uses **all semesters** and the unrounded weighted points of currently valid, included numeric grades. It shows the average needed across future courses, or explains why a target is mathematically unreachable on the 1.0–5.0 scale.

The plan is a scenario. It does not replace unresolved grades, add hypothetical courses, forecast graduation, or override honors requirements. An already failed grade cannot be canceled by a better future average for honors eligibility under the referenced rules.

## 5. Save or share

Preview a result card before downloading a PNG, copying a summary, or printing to PDF. Name and program are excluded by default and can be included explicitly. The card labels the GWA range and assessment status; it never lists individual courses. Sharing is manual through your own messaging or social app.

Use **Back up JSON** before moving to a different device, switching from an offline file to a hosted website, clearing browser data, or resetting the workspace. Restore replaces current records after confirmation. Browser-local records do not automatically migrate to a new Vercel URL or custom domain.

## If something does not work

- **No automatic save:** storage may be disabled or full. Download a JSON backup.
- **Clipboard unavailable:** the copy button reveals selectable summary text.
- **No print window:** allow the site's print pop-up and retry. The print dialog can save a PDF.
- **Missing styles or fonts:** use the standalone build for a single-file download, or deploy the whole `dist` folder.
- **Result differs from a portal:** compare units, course inclusion, final ratings, transfer credits, unresolved courses, and the applicable handbook edition with your registrar.

## Appearance and easier entry (3.1)

On desktop, use **Color theme** in the header; on phones, open **Menu → Appearance** to choose **Light**, **Dark**, or **System**. System follows your device preference. The selection is saved separately from academic records; it is not part of a JSON backup. If browser storage is unavailable, the theme still works for the current page.

The planner starts with two choices: **Individual course grades** for a detailed record, or **Semester averages** for a temporary weighted estimate. Course entry has three steps: add a course, enter its units, and select its final grade. On phones, courses appear as stacked entry cards, with no sideways table scrolling.

Your name/program, semester breakdown, honors checklist, and target planner are expandable sections. Open them when needed. The Assessment and Grade planning links reveal their sections automatically. Name and program remain optional; calculations do not require them.

Share previews use gold, periwinkle, or sage accents for the numerical Summa, Magna, or Cum range. These decorations do not certify an award. Saved PNGs use a light background for readability; the website follows your chosen appearance. Entrance animation respects reduced-motion settings, and non-honors results retain a neutral progress message.

The share dialog includes a **Make it yours** style chooser: Signature follows the numerical-range palette, Midnight uses a dark card, and Botanical uses sage accents. The preview and PNG use the selected style independently of the app's Light/Dark preference. **Celebrate** plays a short decorative burst confined to the preview; reduced-motion users receive a quiet text acknowledgment. No style or celebration changes grades or eligibility. Style selection lasts for this page session and is not included in backups. PNGs are static images; the preview's controls and animations stay in the website.

To include a name on a shared card, check **Include my name and degree program on the card** in the share dialog. Name and program fields appear directly below it; typing updates the preview and saves the same optional profile used by the workspace. You do not need to leave the dialog to find the collapsed profile section. Unchecking the option removes those details from the preview and export.

## Save a moving celebration

**Save animation** records a four-second, silent WebM video of the card as it looks when you select the button. Sparkles move through the side margins while the grades, name, and disclaimers remain readable. The selected Signature, Midnight, or Botanical design is included. The video is created locally from the card canvas; camera, microphone, screen-capture access, and uploads are not used.

Keep the tab open while the animation is created. The video downloads when ready and appears in a player with playback controls, looping, and a download-again link. Autoplay is skipped when reduced motion is requested. If this browser cannot record WebM, use the PNG option. Changing the preview hides the old video so it cannot be mistaken for a freshly updated export. PNG and PDF exports remain still images/documents; animations belong to the video export.

## Degree progress, what-if planning, and undo (4.1)

**Degree progress** appears below the academic summary. Enter your curriculum's total degree units to see a percentage and remaining units across all semesters. By default, the estimate sums valid passed course rows (grades 1.0 through 3.0), including rows excluded from GWA. INC, DRP, pending, failed, conditional, and incomplete rows do not earn units. It does not check whether a passed course belongs to the degree, is a repeat, or was credited by the registrar. Repeated course names receive a warning. Use **Adjust earned units → Confirmed earned units** to supply a verified count, including zero. Clearing that field restores automatic estimation. Earned units above the total produce an error, rather than a misleading 100% indicator. Reaching the unit total is not confirmation of graduation eligibility. Total and confirmed earned-unit fields are saved in JSON backups; older backups default to blank values.

**What-if simulator:** open **Grade planning**, then **Try a what-if scenario**. Add up to 50 possible future courses, their units, and numeric BU grades. The comparison combines all saved semesters with those hypothetical courses using unit weighting. Every future row must be valid; incomplete rows remove the previous projection instead of silently disappearing. The result is only a numerical GWA range. It does not update saved records, assessment answers, share cards, or graduation requirements. Future-course entries live in memory and clear on reload; reset the scenario to start again.

**Undo deletion:** after removing a course, choose **Undo deletion** below the course table. The original grade, units, inclusion setting, and semester are restored. The filter switches to that semester so you can see the restored course. You can undo the latest 20 deletions in reverse order during the current page session. Dismissing the deletion history, reloading, resetting, or restoring a workspace clears that history. Undo is for course deletion, not a replacement for JSON backups.

## Mobile layout (4.2)

The phone workspace has a shorter introduction and compact mode choices. Course rows become bordered entry cards, with separate units/grade fields and a full-width Add course button. Editable fields use 16px text, and main controls have larger touch areas. Light/Dark colors use the same shared tokens as desktop.

The landing page has a full-width primary action, readable example records, and stacked sections. Dialogs fit the viewport, include safe-area padding, and keep their close header available while scrolling. On very narrow phones, the what-if comparison stacks current/projected numbers vertically. Style selection, name entry, and exports remain available on phones.

## Mobile navigation (4.3)

On phones, the header keeps the wordmark and a **Menu** button. Menu opens a side drawer containing page/section links, references, and the Light/Dark/System appearance selector. Choosing a section closes the menu and opens the corresponding workspace disclosure. Escape or the close button dismisses the drawer and returns focus to Menu. A wider desktop/tablet viewport restores the regular top navigation. The independent-tool notice remains in the menu. The standalone edition uses in-page reference links.
