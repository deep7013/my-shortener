# migrate_db_add_columns.py
# Adds expires_at and vanity columns (if missing) and sets defaults.
import sqlite3, shutil, os

DB = os.path.join("instance", "shortener.db")
BACKUP = os.path.join("instance", "shortener.db.bak2")

if not os.path.exists(DB):
    raise SystemExit("DB not found: " + DB)

# create a second backup if not already present
if not os.path.exists(BACKUP):
    print("Creating backup:", BACKUP)
    shutil.copy2(DB, BACKUP)
else:
    print("Backup already exists:", BACKUP)

conn = sqlite3.connect(DB)
cur = conn.cursor()

cur.execute("PRAGMA table_info(link);")
cols = [r[1] for r in cur.fetchall()]
print("Existing columns:", cols)

# add expires_at if missing
if "expires_at" not in cols:
    print("Adding column expires_at ...")
    cur.execute("ALTER TABLE link ADD COLUMN expires_at TEXT;")
    conn.commit()
else:
    print("expires_at already present.")

# add vanity if missing
if "vanity" not in cols:
    print("Adding column vanity ...")
    # default 0 (False)
    cur.execute("ALTER TABLE link ADD COLUMN vanity INTEGER DEFAULT 0;")
    conn.commit()
else:
    print("vanity already present.")

# Show result and a few rows
cur.execute("PRAGMA table_info(link);")
print("Columns after ALTER:", [r[1] for r in cur.fetchall()])

cur.execute("SELECT id, slug, short, long, clicks, expires_at, vanity FROM link LIMIT 10;")
for r in cur.fetchall():
    print(r)

conn.close()
print("Migration complete. Restart your app.")
