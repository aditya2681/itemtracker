# Delivery checklist

The implementation is **incomplete** and must not be used for business data yet.

| Area | Status | Evidence or remaining work |
| --- | --- | --- |
| Pricing engine | PARTIAL | 11 unit tests pass; more precision and integration coverage needed. |
| Convex schema and development push | PARTIAL | `npx convex dev --once` passed; production not deployed. |
| Login and workspace security | PARTIAL | Passkey and membership code present; login and authorization have not been tested end to end. |
| Items and distributors | PARTIAL | Create/list implemented with bounded reads; edit, archive, categories and links missing. |
| Purchases and enquiries | PARTIAL | Creation and recent history implemented; edit, correction audit, drafts and attachments missing. |
| Bill deletion and retained history | PARTIAL | Soft-delete mutation retains price records; restore, bulk operations and regression tests missing. |
| Rate analysis | PARTIAL | Date filtering applies to a bounded 100-record client result; full pagination and filters missing. |
| Mobile UX and accessibility | PARTIAL | Responsive screens implemented; browser interaction and accessibility not verified. |
| PWA and GitHub Pages | PARTIAL | Build and workflow exist; install and deployment unverified. |
| Automated checks | PARTIAL | Build, lint and pricing unit tests pass. Full integration and E2E tests missing. |

## Stock Tracker migration and password login

- PARTIAL: Username/password sign-in and create-account UI implemented and development backend pushed; temporary development account sign-up and sign-in passed via CLI. Browser login and production rollout are not verified.
- PARTIAL: Source snapshot analyzed; 826 products, 82 suppliers, 1,763 enquiries and 337 purchase lines accounted for in read-only diagnostics.
- BLOCKED: No production account/workspace or import has been created. The destination must support ambiguous rates and provenance, and an idempotent importer with reconciliation and rollback must be implemented and tested first. See `migration/MIGRATION_REPORT.md`.

## Production transfer completed

- PASS: 826 products, 82 distributors, 256 links, 337 purchase prices and 1,763 enquiries imported to Shop; no bills imported.
- PASS: complete source-to-destination price and relationship reconciliation found no errors; production owner queries return all imported records.
- PASS: full development rerun inserted no duplicates; sample retries of each production record type skipped correctly.
- PARTIAL: 1,276 enquiries have no recorded weight and display a quoted-unit rate instead of a per-kg rate.
