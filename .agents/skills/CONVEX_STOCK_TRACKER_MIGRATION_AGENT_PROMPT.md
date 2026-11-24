# Coding Agent Task: Migrate Stock Tracker Masters & Historical Prices to Purchase & Rate Intelligence

**Priority:** Required migration before the new application's production cutover.  
**Read together with:** `PURCHASE_RATE_APP_MASTER_BUILD_PROMPT.md` and `purchase_bill_rate_intelligence_PRD.md` when available.  
**Source project:** `stock-tracker`  
**Source deployment name:** `elated-cassowary-248`  
**Source dashboard:** https://dashboard.convex.dev/t/aditya-doredla/stock-tracker/elated-cassowary-248/data?table=billItems  
**Destination:** New Purchase & Rate Intelligence Convex project/deployment. **Do not assume its name**; discover/configure it and display destination identity before writing.

## 1. Objective and non-negotiable scope

Copy from the OLD deployment to the NEW deployment:

1. **All items** and their useful master attributes (name, aliases, categories, units of measure, packaging defaults, price display defaults, status, etc.).
2. **All distributors/suppliers** and useful metadata (name, contact, identifiers, addresses, status, etc.).
3. **All previously logged enquiry/quoted prices**, including item, supplier, actual quote date, input price basis, quantity and package details, notes and original edit/correction metadata where available.
4. **All meaningful historical actual purchase price observations** from historical bill line items, even though the old bills themselves must not appear in the new app. Inspect `billItems` and any other legacy price/bill tables to discover the authoritative values and joins.
5. **Item–distributor relationships** and preferred/default distributor associations, if present.

**Do NOT migrate:** bill headers as active purchase bills, bill documents, payments, old inventory movements/stock quantities, or old bill attachments unless a separately approved dependency is necessary. Legacy bill fields required for historical provenance can be copied as *plain snapshot metadata inside a price observation*, not as new bills or live foreign keys.

**Never mutate, delete, replace, reset, or migrate into the OLD deployment. It is a read-only source.**

**Never import an unfiltered whole-database snapshot directly into the destination.** A snapshot may be used as a read-only source artifact. Never run `--replace-all` on either deployment. Never write to production without explicit approval and validated dry-run results.

## 2. First discover the actual legacy schema (do not guess table/field names)

- Locate the old project's source code if accessible; read `convex/schema.ts`, generated types, queries, and price normalization logic.
- If access to source code is absent, ask for or use a Convex snapshot ZIP exported from the SOURCE deployment. The user may download the ZIP from source Dashboard > Settings > Backup & Restore, or from CLI.
- For CLI, verify you have Convex login/authorized export access and **explicitly target the old source**, not the new project implicitly:

```bash
npx convex export --deployment elated-cassowary-248 --path ./migration/source-stock-tracker.zip
```

- If the CLI cannot resolve the deployment across projects, use the supported project-qualified deployment reference or export from the old project's directory after verifying its project/deployment; do not guess and do not run commands with ambiguous targets.
- The export ZIP normally contains `<table>/documents.jsonl` for each user table. Inspect in a local read-only working directory; preserve the original ZIP unchanged.
- Locate all relevant tables, not just `billItems`: item master, distributor master, bill headers (READ ONLY for context), enquiry quote history, relationship/link tables, price logs, and any legacy category/UOM tables.
- Print source table names, counts, relevant fields, sample anonymized records, reference patterns, date formats, price bases, calculated values, and any uncertain mappings.
- Inspect whether price enquiries are recorded as standalone quotes, overwritten current prices, or audit events. If only latest rates are retained, do not invent missing historical events.
- Check source records for historical bill lines that may reference deleted master records; decide a transparent fallback such as a named inactive legacy item or 'unresolved' staging record rather than silently discarding rows.

Deliver `migration/SCHEMA_MAPPING.md` before executing writes.

## 3. Target model and transformation requirements

Prefer the new application's schema designed in the master build prompt. If names differ, map to the real names rather than imposing arbitrary field names.

### Item master
- Preserve all available usable attributes, aliases, normalized search names, categories, base UOM, package type (bag/box/loose), default content per pack, status, preferences and metadata.
- Merge duplicates **only** with unambiguous identity; names can be reused or spelled differently. Report collisions; avoid silent name-based collapsing.

### Distributor master
- Preserve supplier identity, aliases, contact/tax data if present, status, and supplier-item links.
- Preferred/default distributor must point to the new distributor ID, not an old ID.

### Purchase history / price observation (independent of bills)
Create one independent persisted purchase price-history event for **each valid historical bill line**, unless the source itself stores multiple revisions requiring special treatment. Never reconstruct a bill in the new `bills` table. Preserve:

- mapped `itemId` and `distributorId`;
- observation type `PURCHASE` (distinct from `ENQUIRY`);
- original **purchase date** (join source bill header if needed; do not substitute migration date);
- original entered amount/rate and whether per piece/kg/bag/box/line total;
- quantity, pack count, content per pack, package UOM and base UOM **as they were at purchase time**;
- computed base-unit rate **only if enough trustworthy data exists**, plus calculation basis;
- original line subtotal/discount/tax if available and relevant to whether the rate is gross or net;
- source bill number/date and source bill ID as **denormalized historical metadata**, never live links to a non-existent new bill;
- source line ID, original created/updated time when present;
- original user/source metadata if safe and useful;
- provenance `sourceSystem=stock-tracker`, `sourceDeployment=elated-cassowary-248`, `sourceTable`, `sourceId`, `migrationBatchId` and stable idempotency key.

Do not claim a calculated ₹/kg rate if unit dimensions are ambiguous, amounts include unknown tax/discount, or quantity conversion is unknown. Preserve original raw fields and flag records for manual resolution.

### Enquiry price history
- Create independent `ENQUIRY` observation for every available historical quote.
- Preserve quote timestamp/date, item, distributor, quoted original unit/price, comparable normalized unit rate where safe, validity, notes, edits/history if they actually exist.
- Never transform enquiry into purchase, or vice versa.

### Identity and relationships
- Legacy Convex `Id<...>` values must **not** be casually reused in the new schema; build explicit old-to-new ID mapping tables for items and distributors and every dependent relationship.
- Preserve source IDs as strings in migration metadata for traceability.
- If destination already has matching entities, use a controlled upsert policy and report matches/ambiguous duplicates.
- Audit missing/discontinued/deleted item or distributor references and do not silently drop historic records.

## 4. Migration implementation (reproducible, dry-run first)

Produce versioned scripts under `scripts/migration/` with README and tests. Recommended sequence:

1. **Export/read only** source snapshot; optionally export destination snapshot for rollback.
2. **Discover/validate** and create mapping report and counts before writes.
3. **Transform** source data into canonical typed staging records (include validation and normalized unit calculations).
4. **Dry-run** every transformed record: report valid, warnings, invalid, unresolved associations and price-unit ambiguity; do not modify destination.
5. **Build destination staging import** or controlled authenticated migration mutations. Use batch sizes, transaction limits and safe retry strategy. Do not create public unauthenticated migration endpoints.
6. **Import/upsert in order:** categories/UOM metadata if needed → items → distributors → item-distributor links/defaults → enquiry history → purchase history.
7. **Reconcile** and run sample comparisons against source snapshot, including last three purchase and enquiry prices for representative items and per-distributor histories.
8. **Finalize/disable** one-time migration scripts or endpoints after successful validation.

**Safe CLI alternative**: Transform to `.jsonl` files compatible with the new schema and then import tables selectively, only when relationship IDs and required fields are already correct. Convex supports:

```bash
npx convex import --table <targetTable> <prepared-file>.jsonl
```

Do not use `--append` for reruns unless idempotency/duplicate prevention has been implemented; do not use `--replace` if destination records must be retained. The import method must be chosen after inspecting the target schema and existing contents. Any write/import should be explicitly bound to the **verified destination deployment**, never inferred from the current directory alone.

### Data validation rules
- No fabricated price observations, dates, suppliers, quantities, units or conversions.
- Handle missing prices, invalid numbers, zero quantities, negative adjustments/returns, currencies and fractional pack sizes explicitly.
- Test pack normalization examples: four 50 kg sugar bags at ₹1,000 per bag = 200 kg, ₹4,000 total, ₹20/kg; 15 pieces per box at ₹300/box = ₹20/piece.
- Support legacy records priced by total line amount versus by pack; do not conflate them.
- Preserve duplicate legitimate purchases on same date and rate; deduplicate only exact migrated identities.
- Capture superseded prices/revisions accurately without incorrectly counting edits as independent purchases.

## 5. Acceptance criteria (all mandatory)

- [ ] All original item master records are accounted for (migrated, intentionally merged, or unresolved with an explanation).
- [ ] All distributor records are accounted for similarly.
- [ ] All enquiry observations available in source are accounted for, linked to correct item + distributor, with historical dates intact.
- [ ] All historical bill line items are accounted for as *purchase observations* or explicitly documented invalid/excluded cases.
- [ ] No old bill headers, old bill attachments, or live old bill references are created in the new application.
- [ ] Original historical prices survive even if old bills are deleted later.
- [ ] The new app shows latest **3 purchases** and latest **3 enquiries** correctly, sorted by original event date and with stable tie-breaking.
- [ ] New rate analysis filters by date range without requiring an item, and optionally by item/distributor/type, including imported history.
- [ ] Preferred distributor mapping and item associations remain correct.
- [ ] Idempotency verified: running migration twice does not produce duplicate price observations or suppliers/items.
- [ ] Spot-check samples against source by item, supplier, date, quantity, and unit rate; test calculation accuracy.
- [ ] Total migration counts and unresolved differences are reported. Do not claim zero data loss without evidence.
- [ ] Source remains unchanged; destination data is backed up or rollback plan documented before write.

## 6. Mandatory deliverables to generate at end

1. `migration/SCHEMA_MAPPING.md`: actual old tables/fields → new fields, discovery evidence, unresolved mappings.
2. `migration/MIGRATION_PLAN.md`: source/destination deployment identities, exact safe steps, rollback, access requirements, dry-run results.
3. `migration/MIGRATION_REPORT.md`: source counts, imported/merged/skipped/unresolved counts by data type, duplicate handling, sample comparisons, final reconciliation status.
4. `migration/ID_MAPPING.json` **only if safe** (internal/private) or an equivalent authenticated persistent tracking store; no secrets in version control.
5. `scripts/migration/`: repeatable dry-run and migration scripts and focused automated tests.
6. **Update `RUN_APPLICATION.md`**: source data requirements, migration commands and prerequisites, destination environment variables, instructions for running the app once migration is complete; do not claim commands were tested unless actually executed.
7. **Update `DELIVERY_CHECKLIST.md`** to show migration status and any blockers separately from frontend/backend app status.

**Final response from agent:** show source and destination identity, exact records migrated by type, any unresolved mappings, whether the old source was kept unmodified, tests performed, and exact next command. If lacking source access/export/auth or destination access, produce scripts and reports possible with known inputs, and state precise blockers; never invent migrated totals or claim completion.

## 7. References

- Convex snapshot export: https://docs.convex.dev/cli/reference/export
- Convex import overview: https://docs.convex.dev/database/import-export/import
- Convex CLI data inspection: https://docs.convex.dev/cli/reference/data
- Convex backup format: https://docs.convex.dev/database/backup-restore
