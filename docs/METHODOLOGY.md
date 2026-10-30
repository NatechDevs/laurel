# Calculation and policy

## Reference and scope

The policy reference supplied for this project is `492555631-BU-Student-Handbook.pdf`, Bicol University Student Handbook, revised 2019. Grading and honors content appears in the supplied file on PDF pages 29–31, with printed page labels 18–21. The PDF includes duplicated/overlapping extracted text, so topic headings are the preferred locator.

This application models the supplied edition. It does not claim that edition is the currently applicable policy for every college, degree, curriculum, or graduation cohort. The college registrar/evaluation committee must confirm applicability and any updated rules. The PDF is not included in the deployed website.

## Weighted average

```text
Weighted points = sum(final numeric grade × credit units)
GWA             = weighted points / sum(included credit units)
```

Only valid, included numeric grades contribute to both the numerator and denominator. Semester averages are not averaged equally. Each numeric grade is represented in integer tenths and units in integer ten-thousandths during accumulation, avoiding premature per-course rounding. The total GWA is rounded to four decimal places, then compared with the honors ranges.

Example: a 1-unit course graded 1.0 and a 3-unit course graded 2.0 produce `(1 × 1 + 2 × 3) / 4 = 1.7500`.

## Numeric and unresolved grades

- 1.0 is highest. The input accepts tenths from 1.0 to 4.0 and the failing final grade 5.0.
- 3.0 is passing. The handbook describes 3.1–4.0 as conditional; use only a rating that appears in the student's official final record.
- The handbook explicitly excludes an unresolved INC from GWA. The tool also excludes DRP and PENDING because they have no numeric grade; these are conservatively flagged as records requiring review, not automatically treated as disqualifications.
- A blank/invalid included grade or invalid units excludes that course from numeric totals and prevents a complete-record eligibility estimate.
- Under the referenced edition, an overdue INC may be converted to a failing grade through the stated registrar/professor process. The application does not make that conversion automatically.
- Course exclusions are chosen by the user according to registrar guidance. There is no hard-coded PE or NSTP exclusion.

## Latin honors ranges

| Range | Four-decimal GWA |
| --- | --- |
| Summa Cum Laude | 1.0000 ≤ GWA ≤ 1.2500 |
| Magna Cum Laude | 1.2500 < GWA ≤ 1.4500 |
| Cum Laude | 1.4500 < GWA ≤ 1.7500 |

The supplied graduation-with-honors provisions also require completion of the degree, college residency, prescribed regular semester loads, curriculum compliance, and no grade academically lower than 3.0 in any subject. Numerically, a grade greater than 3.0 is academically lower. The grade-history check includes courses excluded from the GWA and the user's declared record at other institutions.

“Potentially eligible” is shown only for All semesters when a numeric honors range is met, no included record is incomplete, no record is unresolved, no entered grade exceeds 3.0, all four self-reported conditions are marked met, and the user explicitly confirms a complete degree record. This is a rule-based estimate, not verification.

## Academic Distinction

The supplied handbook describes Academic Distinction for a candidate meeting the honors GWA but failing other graduation-with-honors requirements. It separately requires no grade lower than 3.0 in any subject, compliance with transfer-credit/curriculum-sequence rules, at least 75% of curriculum units completed at BU, and at least six semesters/terms immediately preceding graduation in residence.

The tool does **not** automatically assign Academic Distinction from a failed Latin honors check. It directs users to a separate registrar evaluation because those additional conditions are not established by a GWA calculation.

## Target planner

```text
Required future average =
  (target final GWA × (current included units + remaining units)
   − current unrounded weighted points) / remaining units
```

The displayed required ceiling is rounded downward to four decimals, so the planner does not recommend an average slightly worse than the algebraic limit. An average better than 1.0 is unreachable. If the requirement is above 3.0, any passing future average satisfies the numerical target; independent honors restrictions still apply. Remaining units must be greater than zero and at most 500.

## Deliberate limitations

There is no portal connection, transcript authentication, OCR-based grade extraction, adviser approval, curriculum database, or proof of residency/load. The user supplies the inputs and confirms record completeness. Do not use this tool as a registrar decision system or a certification generator. Policy changes require updating both the calculation rules and explanatory copy, with regression tests for boundary cases.
