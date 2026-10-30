# Maintenance and contributions

This document describes how to maintain Laurel. It does not grant permission
to redistribute the application; consult the project's license notice.
Keep this project separate from the parent StructureCraft application.

## Local workflow

Use Node.js 22 or newer. No package installation is required for the current
zero-dependency build. Run commands from this directory:

```sh
npm test
npm run build
npm start
```

Edit source files, not generated `dist/` or `standalone/` output. Rebuild both
editions after changes. Do not commit student records or exported backups.

## Review expectations

- Use synthetic grades to verify weighted GWA, unresolved statuses, and imports.
- Keep honors ranges separate from full-record eligibility requirements.
- Cite academic policy changes in `docs/POLICY-SOURCES.md`; calculator sites
  are workflow references, not policy authorities.
- Check light/dark themes, narrow screens, keyboard controls, and reduced motion.
- Preserve the visible independent-tool and unofficial-result notices.
- Update user documentation when behavior changes and deployment documentation
  when build outputs, headers, or data handling change.

Coordinate external contributions with the maintainer before opening a patch.
The project repository is https://github.com/NatechDevs/laurel.
Use repository issues for non-sensitive bug reports; follow `SECURITY.md` for
vulnerabilities and never include real student records.
