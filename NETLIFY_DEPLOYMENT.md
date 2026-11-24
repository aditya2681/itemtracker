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

Run `npm run lint`, `npm test`, and `npm run build`, review changes, commit and push to `main`. Netlify runs checks and publishes the new frontend. Backend changes need their own reviewed Convex deployment. Keep database snapshots, local environment files, CLI state and private keys out of Git.

The production Convex `SITE_URL` was absent when checked. Current username/password auth uses the Convex client directly; browser sign-in on the final Netlify origin still needs verification. Review auth redirect settings if adding OAuth or redirect-based recovery. Business flows beyond the existing tests have not been certified; see the delivery checklist for remaining work.
