# Deploy Purchase & Rate to Netlify

Use a **new Netlify project** connected to `aditya2681/itemtracker`, production branch `main`. The separate MyBilling site `dk-payment.netlify.app` belongs to `aditya2681/billingpayment` and must not be selected.

## First deployment

1. In Netlify select **Add new project → Import an existing project → GitHub** and choose `aditya2681/itemtracker`.
2. Select branch `main`, leave the base directory at the repository root, use build command `npm run lint && npm test && node scripts/netlify-build.mjs`, and publish directory `dist`. These settings are supplied by `netlify.toml`.
3. Publish the site. The production build reads the public client URL `https://benevolent-mosquito-853.eu-west-1.convex.cloud` from `netlify.toml`, targeting the migrated itemtracker database. Never substitute the local development deployment or MyBilling's URL. No backend deploy or data import occurs in this build.
4. Open the new URL on a phone, sign in with your existing itemtracker account, and verify the Shop workspace, imported items, suppliers, and rates. Refresh the page and check installation. Do not create test transactions in production.

The build refuses a missing/invalid backend URL and a production URL that is not itemtracker. Netlify uses `/` as its base path, with an SPA fallback and a revalidated service worker. For deploy previews, configure `VITE_CONVEX_URL` in Netlify for the preview context to the intended development deployment; otherwise preview builds fail instead of silently choosing a database.

## CLI alternative

From `/Users/aditya/Documents/itemtracker`:

```bash
npx netlify-cli login
npx netlify-cli init
```

Choose to create a **new** site using the existing `itemtracker` Git repository. Do not link to `dk-payment`. After connecting the repository, later pushes to `main` trigger Netlify automatically. Check each deployment under the new site's **Deploys** tab.

## Later updates

From `/Users/aditya/Documents/itemtracker`, follow these steps:

1. Review `git status` and `git diff`. Run `npm run lint`, `npm test`, and `npm run build`.
2. If backend files under `convex/` changed, check the production target with `npx convex dashboard --prod --no-open`. It must be `benevolent-mosquito-853`. Check the migration and compatibility impact, then run `npx convex deploy` and verify the output and production functionality. This deploys functions and schema; it does not automatically copy or delete data. For schema/data migrations, use a separately reviewed migration plan.
3. Commit only the intended files (`git add <files>` then `git commit -m "Describe the change"`) and run `git push origin main`.
4. For a connected Netlify project, open its **Deploys** tab, confirm the new commit succeeds, then verify the production URL on a phone. Netlify builds and publishes the frontend; pushing to GitHub alone does not deploy the Convex backend.

Keep database snapshots, local environment files, CLI state and private keys out of Git. Never select the MyBilling project for this app.

The production Convex `SITE_URL` was absent when checked. Current username/password auth uses the Convex client directly; browser sign-in on the final Netlify origin still needs verification. Review auth redirect settings if adding OAuth or redirect-based recovery. Business flows beyond the existing tests have not been certified; see the delivery checklist for remaining work.
