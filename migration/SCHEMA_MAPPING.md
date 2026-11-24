# Stock Tracker source mapping — discovery, not imported

Source: project `stock-tracker`, deployment `elated-cassowary-248`. Snapshot exported read-only on 15 November 2026. The legacy application source code was not found in the inspected workspace, so field meaning below is inferred from exported names and consistency checks; it needs confirmation before transformation.

| Legacy table and fields | Destination / treatment | Open questions |
| --- | --- | --- |
| `products`: name, unitLabel, weightPerUnitKg, defaultUnitsPerBag, createdAt | `items`, plus migration mapping and raw metadata | 611 have zero weight; package defaults and base unit cannot always be derived. 13 normalized name collisions must stay distinct. Stock quantities are excluded. |
| `distributors`: name, shortCode, isActive, phone, area | `distributors` and source metadata | Destination does not yet preserve every source field. Three normalized name collisions must remain distinct. |
| `productDistributors`: productId, distributorId | `itemDistributors` via explicit ID maps | Preferred status is not represented in these exported links. |
| `bills`: billDate, billNumber, distributorId | Read-only join for purchase provenance | Do not create destination bills. Store source bill identity/number as snapshot metadata. |
| `billItems`: billId, productId, weightType, weightPerUnitKg, unitsPerBag, unitsBought, ratePerKg, ratePerUnit, totalPrice | Independent `PURCHASE` observations, plus original values and provenance | Source pricing implementation is unavailable; verify basis and historical unit snapshots before import. |
| `purchasePriceHistory`: billId, productId, distributorId, purchaseDate, rates, totals, unitsBought | Cross-check and date/distributor evidence | The entire multiset matches bill items on billId/productId/quantity/unit rate/total. Importing both blindly duplicates 337 observations. No stable direct line ID is present; duplicate-identical lines would require controlled multiset pairing. |
| `enquiryPriceHistory`: productId, distributorId, enquiryDate, quotedRatePerUnit, quotedRatePerKg, weightPerUnitKg, notes, source | Independent `ENQUIRY` observations with provenance | 1,276 records have zero weight and no kg rate; never infer a kg rate. Preserve quoted unit and raw data, and mark unresolved until comparability is established. |

No missing item, distributor, or bill references were found among the inspected relationships. All three checked date fields parse as ISO calendar dates. Source raw records and snapshot are private and excluded from Git. The target `priceRecords` schema currently requires a numeric normalized rate and does not carry all required provenance or ambiguous-rate semantics. `legacyObservations` and `migrationMappings` were added locally as groundwork but are not an importer or a substitute for correctly presenting history.
