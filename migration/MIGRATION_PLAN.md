# Migration plan and status

Source: `aditya-doredla / stock-tracker / elated-cassowary-248` (read-only). Destination: `aditya-doredla / itemtracker / benevolent-mosquito-853` (production), identified by `npx convex deploy --dry-run`; the command stopped before deployment because it could not prompt in the non-interactive terminal. Development is `aromatic-emu-434`. Do not substitute either deployment by inference when running a write.

The local source snapshot is `migration/source-stock-tracker.zip`; it is ignored by Git and must be handled as private business data. Source records were not modified. The read-only diagnostic dry run is reproducible from the repository root:

```bash
python3 scripts/migration/dry_run.py migration/source-stock-tracker.zip
```

Before import: finish source semantics discovery, extend destination model/UI for raw source metadata and non-comparable quoted rates, create and identify the production owner/workspace, export a destination backup, implement bounded idempotent source-ID mapping and import logic, verify it on a separate development dataset twice, compare counts and representative histories, and confirm the specific production target before running the import. No production import command is provided because that code and its safety checks are not complete. Never use `--replace-all` or import the snapshot as-is. Rollback must remove only records tied to the recorded migration batch and preserve pre-existing records; no rollback procedure has yet been implemented or tested.

The user chose to create their own production account with a password of at least 10 characters. Production authentication changes have not been deployed, and a workspace for the import has not been identified.
