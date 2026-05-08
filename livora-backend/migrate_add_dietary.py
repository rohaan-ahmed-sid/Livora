"""
migrate_add_dietary.py
Run once to add dietary_preferences column to users table.

    python migrate_add_dietary.py
"""
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN dietary_preferences VARCHAR DEFAULT ''"))
        conn.commit()
        print("Column added: dietary_preferences ✓")
    except Exception as e:
        if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
            print("Column already exists — skipping.")
        else:
            raise
