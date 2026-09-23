# Disaster Recovery & Database Backup / Restore Guide

This guide establishes the operating procedures for safeguarding Evolve Academy's Supabase database, performing routine integrity tests, and restoring from backups during an incident.

---

## 1. Automated Daily Backups

### Supabase Managed Backups
- **Daily Physical Backups:** Maintained automatically by Supabase for 7 to 30 days depending on project tier.
- **Point-in-Time Recovery (PITR):** Enables restoring database state to any minute in the past 7 days.

### Offsite Logical Dumps (Recommended Cron)
Run a nightly cron job on a secure maintenance runner:

```bash
pg_dump "$SUPABASE_DB_URL" \
  --format=custom \
  --compress=9 \
  --file="evolve_db_$(date +%Y%m%d_%H%M%S).dump"
```

Upload the compressed `.dump` to an encrypted, offsite S3 / Google Cloud Storage bucket with object lock enabled (WORM compliance).

---

## 2. Integrity Verification Test Script

Run the automated validation script:

```bash
bash scripts/test_backup_restore.sh
```

What the script verifies:
1. `pg_dump` connects with read permissions without locking critical tables.
2. The output archive has valid table-of-contents (`TOC`) entries.
3. No transaction is left dangling.
4. Dry-run restore against an isolated test target database succeeds.

---

## 3. Emergency Restoration Procedure

### Step 1: Put Application in Maintenance Mode
Prevent student payments or modifications during restore:
- Set maintenance flag in `.env.local` or route middleware.

### Step 2: Provision or Prepare Target Postgres
```bash
# Example restoring into target database
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-acl \
  --dbname="$DATABASE_URL" \
  ./backups/evolve_backup_latest.dump
```

### Step 3: Verify Integrity After Restore
Execute verification queries:
```sql
SELECT count(*) FROM courses WHERE is_published = true;
SELECT count(*) FROM enrollments;
SELECT count(*) FROM profiles;
SELECT count(*) FROM community_projects;
```

### Step 4: Resume Traffic & Health Verification
1. Call `/api/health` to confirm latency and database connectivity.
2. Re-enable user access and monitor error logs.
