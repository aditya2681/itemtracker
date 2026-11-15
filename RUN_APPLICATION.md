# How to run and view the application

## Which folder should I use?

Run all commands from the **project root**: the folder that contains `package.json`.

For this checkout, the project root is:

```text
/Users/aditya/Documents/itemtracker
```

In VS Code, open the `itemtracker` folder itself. Do not run `npm` from `src/` or `convex/`.

## Important: this checkout is not ready to show a frontend yet

You have already run `npx convex dev` and selected a cloud deployment. That sets up/runs the Convex backend. It does not create or start the React frontend.

The current files in this checkout do not include `index.html`, a Vite config, or a React app entry point. `npm run dev` can start the Vite server, but there is no app page to render; `npm run build` fails because `index.html` is missing. There is currently no screen to open in the browser.

## Local development once the frontend exists

Use two terminal windows, both opened at the project root.

### Terminal 1 — Convex backend

```bash
npx convex dev
```

Keep this command running. It watches the `convex/` folder and syncs backend functions to the selected development deployment. If it asks you to log in or select/link a project, complete that flow. Since you already selected a cloud deployment, confirm it is the intended **development** deployment before continuing.

### Terminal 2 — React frontend

macOS/Linux:

```bash
cd /Users/aditya/Documents/itemtracker
npm install
npm run dev
```

Windows PowerShell (replace the path with where you cloned the repository):

```powershell
cd C:\path\to\itemtracker
npm install
npm run dev
```

Vite normally prints a local address such as `http://localhost:5173/`. Open the exact `Local:` URL printed by Vite. If it prints a different port, use that port.

## Check the Convex connection

The root `.env.local` is created/updated by Convex CLI and is ignored by Git. It should include `VITE_CONVEX_URL` for the frontend to connect to Convex. Do not paste the file contents publicly; deployment values can identify your project. Never put private secrets in a `VITE_` variable because Vite includes those values in the browser bundle.

To check which deployment the CLI selected, from the project root run:

```bash
npx convex dev
```

Read the deployment name shown by the CLI. For an existing cloud project, confirm it matches the development deployment you intended to use. Use the Convex dashboard to inspect its tables and function deployment status.

## Deploy the frontend to GitHub Pages

The repository root is the frontend project directory, so run frontend build and GitHub Pages setup from that directory—not from `src/` and not from `convex/`.

Once the React/Vite frontend has been implemented and the production build succeeds:

```bash
npm run build
```

Then configure GitHub Pages for this repository (usually using a GitHub Actions workflow to publish Vite's `dist/` folder). For a project site such as `https://USERNAME.github.io/REPOSITORY/`, Vite must use the matching repository base path, and client-side routing must support refreshes on nested URLs. Those settings and the Pages workflow are not present in this checkout yet. A custom domain or `USERNAME.github.io` root site uses different base-path settings.

The frontend must be configured with the **production Convex URL** when building the Pages version. Do not use a local-only URL such as `127.0.0.1`. The browser receives the URL, so it is public configuration. Build after setting the correct `VITE_CONVEX_URL` in the deployment workflow/repository variables.

## Current implementation and verified status

As checked on 15 November 2026:

- `npx convex dev --once` previously completed and created a local Convex deployment. You report that you have since selected a cloud deployment; this guide cannot verify the current dashboard selection.
- This checkout contains generated Convex client types, but no business schema/functions or React frontend screens.
- `npm run test` passed 11 pricing calculation tests.
- `npm run typecheck` passed for the existing source.
- `npm run lint` passed for the existing source.
- `npm run dev -- --host 127.0.0.1` started Vite and printed `http://127.0.0.1:5174/` because port 5173 was occupied. This only verifies that Vite starts; the app entry/page is missing.
- `npm run build` failed because there is no `index.html`.
- `npm run test:e2e` failed because there is no E2E suite.

So right now you can run Convex from the project root, but you cannot yet view the purchase-rate app in a browser. The frontend and backend feature implementation must be completed before local viewing or GitHub Pages deployment.

## Quick commands

From the repository root:

```bash
# Backend (keep running in terminal 1)
npx convex dev

# Frontend (terminal 2; available after the app entry files are implemented)
npm run dev
```

Open the Vite `Local:` URL in your browser. Vite may start and print a URL, but the app page cannot render until `index.html` and the React entry point are implemented. The missing page is not a Convex deployment error.
