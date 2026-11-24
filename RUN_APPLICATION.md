# Purchase & Rate: current run instructions

**This implementation is incomplete and is not ready for business data or production deployment.** The app now builds and a preliminary backend has been pushed to the connected Convex development deployment. Sign-in and business flows have not been verified end to end.

## Run locally

Open a terminal in `/Users/aditya/Documents/itemtracker` (the folder containing `package.json`). Install dependencies with `npm ci`, then run:

```bash
npx convex dev
```

Keep that terminal open. In a second terminal in the same folder, run:

```bash
npm run dev -- --host localhost --port 5173
```

Open the `Local` URL printed by Vite. Use the username/password form to sign in or create an account. New passwords must have at least 10 characters. Authentication has not yet been verified in a browser.
`.env.local` is created by Convex CLI and should contain `VITE_CONVEX_URL`; do not commit it. The current cloud development deployment accepted the schema and functions with `npx convex dev --once`.

## What exists

The current code includes a username/password login implementation, workspace setup, creation of items and distributors, purchase/enquiry entry, recent price accordions, date filtering of a bounded set of rates, bill soft delete, and a PWA build. These are preliminary and have not been exercised end to end. The server requires authenticated workspace membership for business functions. Purchase rates are stored separately from bills.

## Checks performed

- `npm run build`: passed, including PWA asset generation.
- `npm run lint`: passed.
- `npm run test`: passed, 11 pricing calculation unit cases.
- `npx convex dev --once`: passed against the connected development deployment.
- Browser and passkey login: **not verified**; browser automation failed to initialize.
- E2E and full business acceptance: **not verified**.

## Netlify deployment

Hosting is now configured for a separate Netlify project connected to `aditya2681/itemtracker`. See [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md) for the production endpoint, first deployment, and update process. The old GitHub Pages workflow has been replaced with verification-only CI. Netlify publication and sign-in on the final origin still need verification.

## Remaining work

Bill editing and synchronization with revisions, restore and bulk deletion, draft and attachment upload, category and master editing, supplier links and preferred suppliers, quote edit/void, full indexed pagination and complete filters, offline behavior, full mobile accessibility, authorization and history regression tests, and the complete acceptance matrix remain unfinished. The current UI and data paths do not meet the master specification. Do not deploy for use until these are implemented and validated.

## Username/password and migration status

The development code now uses username/password sign-in and account creation. Convex Auth enforces a minimum of 10 characters for new passwords. The requested `aditya` password is six characters and cannot be used by the supported method; the owner chose to create their own account. The updated authentication code was deployed to the development deployment only; a temporary development account completed backend sign-up and sign-in via Convex CLI, while browser login remains unverified. The updated backend has been deployed to production.

A read-only snapshot of stock-tracker (`elated-cassowary-248`) was analyzed. Data has been imported into itemtracker production (`benevolent-mosquito-853`); see the completed status below. Run `python3 scripts/migration/dry_run.py migration/source-stock-tracker.zip` to repeat aggregate diagnostics. The snapshot is private and ignored by Git. See `migration/MIGRATION_REPORT.md` and `migration/MIGRATION_PLAN.md` for counts, unresolved mappings and required work before import.

## Production migration completed

Production workspace Shop now contains 826 imported products, 82 distributors, 256 supplier links, 337 purchase-price records and 1,763 enquiries; no old bills were imported. Local frontend http://localhost:5181/ was started against the production deployment for account creation and verification. The process must be running to use that local address; the GitHub Pages frontend has not been published by this migration. Source records with unknown weight are labelled per quoted unit. See MIGRATION_REPORT.md for verification.
