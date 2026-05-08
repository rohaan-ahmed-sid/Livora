from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    email          = Column(String, unique=True, index=True, nullable=False)
    name           = Column(String, nullable=False)
    password_hash  = Column(String, nullable=False)

    # Basic info
    dob            = Column(String, nullable=True)
    gender         = Column(String, nullable=True)
    height_cm      = Column(Float, nullable=True)
    weight_kg      = Column(Float, nullable=True)

    # Diabetes profile
    diabetes_type  = Column(String, default="T2D")
    diagnosis_year = Column(Integer, nullable=True)
    hba1c          = Column(Float, nullable=True)
    medication_type= Column(String, default="none")

    # Lifestyle
    activity_level     = Column(String, default="moderate")
    sleep_goal_hours   = Column(Float, default=8.0)
    target_glucose_min = Column(Float, default=70.0)
    target_glucose_max = Column(Float, default=180.0)
    glucose_unit       = Column(String, default="mg/dL")

    # Dietary preferences — comma-separated list
    # e.g. "halal,gluten-free,nut-free,vegetarian"
    dietary_preferences = Column(String, nullable=True, default="")

    # Latest BP snapshot (updated whenever user logs BP)
    bp_systolic  = Column(Float, nullable=True)
    bp_diastolic = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    glucose_readings = relationship("GlucoseReading",  back_populates="user", cascade="all, delete-orphan")
    meal_logs        = relationship("MealLog",          back_populates="user", cascade="all, delete-orphan")
    activity_logs    = relationship("ActivityLog",      back_populates="user", cascade="all, delete-orphan")
    sleep_logs       = relationship("SleepLog",         back_populates="user", cascade="all, delete-orphan")
    recommendations  = relationship("Recommendation",   back_populates="user", cascade="all, delete-orphan")
    alerts           = relationship("Alert",            back_populates="user", cascade="all, delete-orphan")
