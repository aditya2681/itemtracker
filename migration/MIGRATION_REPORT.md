# Migration report — production complete

Source: stock-tracker / elated-cassowary-248. Destination: itemtracker / benevolent-mosquito-853, workspace Shop. Migration batch: stock-tracker-20261115. Source export and destination pre-import snapshot are local, private and Git-ignored.

| Source type | Imported |
| --- | ---: |
| Products | 826 |
| Distributors | 82 |
| Product–distributor links | 256 |
| Purchase bill-line prices | 337 |
| Enquiry prices | 1,763 |
| Bills | 0 |

The 337 legacy purchase-history rows match the bill-line multiset and were not imported a second time. The 1,276 enquiries lacking a recorded weight are marked per quoted unit with unknown weight rather than per kg. Raw source snapshots and bill provenance are stored in migration metadata; no source bill IDs are used as live bill references.

A fresh source snapshot was analyzed before import. All inspected references and dates were valid; the full development import and rerun confirmed 3,264 records and no duplicates. Production verification checked every source mapping, each price relationship, date, kind, and normalized rate, and returned zero errors. The production owner-authorized catalog and rates queries returned 826 items, 82 distributors, 2,100 rates, and zero bills. One production retry for each source type skipped its existing record. The old source database was not modified. The separate application remains incomplete in areas unrelated to this migration.
