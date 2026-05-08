"""
create_tables.py
Run once to initialize the PostgreSQL schema.

    cd livora-backend
    python create_tables.py
"""
from app.database import Base, engine
from app.models import User, GlucoseReading, MealLog, ActivityLog, SleepLog, Recommendation, Alert

Base.metadata.create_all(bind=engine)
print("All tables created ✓")
