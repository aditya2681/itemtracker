# Delivery checklist

Status as of 15 November 2026. This is an incomplete implementation and is not ready for use.

| Requirement | Status | Evidence / remaining work |
| --- | --- | --- |
| Dependency installation and lockfile | PARTIAL | Runtime and dev packages installed; clean `npm ci` not verified. |
| Official skills | PARTIAL | Convex and other requested skills installed. UI SDK CLI skill renamed and replacement clone failed; bundled SDK skill exists. |
| Decimal pricing examples and validation | PARTIAL | `npm run test`: 11 passing unit cases. Server recomputation and integration are not implemented. |
| React PWA, navigation and responsive screens | BLOCKED | Not implemented; production build fails without `index.html`. |
| Authentication, membership and authorization | BLOCKED | Not implemented or tested. |
| Item/category and distributor management | BLOCKED | Not implemented. |
| Enquiries, last-three history and comparisons | BLOCKED | Not implemented. |
| Bills, drafts, attachments and edits | BLOCKED | Not implemented. |
| Retained history on bill deletion, revisions and restore | BLOCKED | Not implemented or tested. |
| Rate analysis, date-only filters and pagination | BLOCKED | Not implemented. |
| Offline state, accessibility and mobile verification | BLOCKED | Not implemented or tested. |
| Unit tests and typecheck | PARTIAL | Pricing tests and current source typecheck pass; full application tests do not exist. |
| End-to-end tests | BLOCKED | `npm run test:e2e` failed; no E2E suite exists. |
| Convex cloud and GitHub Pages deployment | BLOCKED | No cloud project or auth provider configured; hosting configuration not implemented. |
| Backup/recovery and production readiness | BLOCKED | Not implemented or tested. |
