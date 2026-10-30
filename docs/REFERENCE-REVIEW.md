# Reference calculator review

Reviewed on 29 October 2026 using synthetic data only. These sites inform workflow decisions, not BU policy. Visible behavior was tested; source code and security were not audited.

## kapeiii.github.io/jss

[Reference](https://kapeiii.github.io/jss/) · [Graduation mode](https://kapeiii.github.io/jss/gradute.html)

Separate semester, graduation, and goal modules are available. Graduation accepts semester averages and units; its popup lists semester results.

| Test | Observed result |
| --- | --- |
| 1.0 × 3 units plus 2.0 × 9 units | 1.7500, Cum Laude |
| Both averages 1.25 | 1.2500, Summa |
| Both averages 1.45 | 1.4500, Magna |
| Both averages 1.75 | 1.7500, Cum |
| Both averages 1.7501 | No Latin Honor |
| Averages 0 and 1.0 | Invalid row omitted; 1.0000 shown |
| Averages 6 and 1, equal units | 3.5000 shown |

A course-level 1.0/2.0 test with units 1/3 returned 1.7500 and Dean's Lister. Clicking outside closed the observed graduation popup; Escape did not. A save-result click was attempted but not verified after an interaction timeout.

**Adaptation:** weighted semester estimates, explicit validation, clear limitations, and keyboard-dismissible dialogs.

## angel10599.github.io/bicol-university-grade-calculator

[Reference](https://angel10599.github.io/bicol-university-grade-calculator/)

The observed Latin honors flow has Student Info, Term Setup, and Grade Entry. It requests a name/program, asks about regular-load/residency status, supports midyear terms, and has quick unit buttons. All eight main terms required subject counts in the tested BS Computer Science flow. The initial regular-student answer was preselected Yes.

A synthetic record used one 3-unit subject graded 1.2 in each of eight terms. Entry and submission were exercised, but the final classification was not independently captured; no result-pass claim is made.

**Adaptation:** explicit entry guidance and reduced repetitive input. Keep identity optional and eligibility answers initially unreviewed. Avoid forcing every degree into four years.

## bugpa.vercel.app

[Reference](https://bugpa.vercel.app/)

Year-based course selection auto-filled credits. Engineering Calculus filled four credits; adding it with A+ produced GPA 10. The observed options use letter grades.

**Adaptation:** course search and credit defaults are useful. Its observed 10-point system is incompatible with Laurel's BU scale; its grade mapping and course catalogue are not copied.

## Policy is a separate source question

See [Rules & Sources](../sources.html) and the [policy source audit](POLICY-SOURCES.md). Another calculator's UI is not evidence for a blanket NSTP exclusion, permanent DRP ban, automatic Academic Distinction, or permission to use university marks.
