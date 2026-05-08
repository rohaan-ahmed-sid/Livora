from app.database import engine
from sqlalchemy import text, inspect

inspector = inspect(engine)
existing = [col["name"] for col in inspector.get_columns("users")]

additions = {
    "dietary_preferences": "VARCHAR DEFAULT ''",
    "bp_systolic":         "FLOAT",
    "bp_diastolic":        "FLOAT",
}

with engine.connect() as conn:
    for col, coltype in additions.items():
        if col not in existing:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {coltype}"))
            print(f"  ✓ Added: {col}")
        else:
            print(f"  — Already exists: {col}")
    conn.commit()

print("\nMigration complete ✓")