# Migration tools

`python3 scripts/migration/dry_run.py migration/source-stock-tracker.zip` reads a local Convex snapshot and emits aggregate discovery and consistency diagnostics. It never connects to or writes to a database. This is not an import tool or a full transform. Keep the snapshot private and out of Git. See `migration/MIGRATION_PLAN.md` for outstanding work.
