from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─────────────── AUTH ───────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str

class UserProfile(BaseModel):
    id: int
    email: str
    name: str
    dob: Optional[str]
    gender: Optional[str]
    height_cm: Optional[float]
    weight_kg: Optional[float]
    diabetes_type: Optional[str]
    diagnosis_year: Optional[int]
    hba1c: Optional[float]
    medication_type: Optional[str]
    activity_level: Optional[str]
    sleep_goal_hours: Optional[float]
    target_glucose_min: Optional[float]
    target_glucose_max: Optional[float]
    glucose_unit: Optional[str]

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    diagnosis_year: Optional[int] = None
    hba1c: Optional[float] = None
    medication_type: Optional[str] = None
    activity_level: Optional[str] = None
    sleep_goal_hours: Optional[float] = None
    target_glucose_min: Optional[float] = None
    target_glucose_max: Optional[float] = None
    glucose_unit: Optional[str] = None


# ─────────────── GLUCOSE ───────────────

class GlucoseCreate(BaseModel):
    value: float
    unit: str = "mg/dL"
    context: str = "fasting"
    notes: Optional[str] = None
    recorded_at: datetime

class GlucoseOut(BaseModel):
    id: int
    value: float
    unit: str
    context: str
    notes: Optional[str]
    recorded_at: datetime

    class Config:
        from_attributes = True


# ─────────────── MEAL ───────────────

class MealCreate(BaseModel):
    name: Optional[str] = None
    meal_type: Optional[str] = None
    carbs: float = 0.0
    protein: float = 0.0
    fat: float = 0.0
    fiber: float = 0.0
    calories: Optional[float] = None
    recorded_at: datetime

class MealOut(BaseModel):
    id: int
    name: Optional[str]
    meal_type: Optional[str]
    carbs: float
    protein: float
    fat: float
    fiber: float
    calories: Optional[float]
    predicted_ppgr: Optional[float]
    risk_flag: Optional[str]
    recorded_at: datetime

    class Config:
        from_attributes = True


# ─────────────── ACTIVITY ───────────────

class ActivityCreate(BaseModel):
    activity_type: str
    duration_minutes: int
    intensity: str = "moderate"
    calories_burned: Optional[float] = None
    notes: Optional[str] = None
    recorded_at: datetime

class ActivityOut(BaseModel):
    id: int
    activity_type: str
    duration_minutes: int
    intensity: str
    calories_burned: Optional[float]
    notes: Optional[str]
    recorded_at: datetime

    class Config:
        from_attributes = True


# ─────────────── SLEEP ───────────────

class SleepCreate(BaseModel):
    bedtime: Optional[str] = None
    wake_time: Optional[str] = None
    hours: float
    quality: str = "good"
    recorded_at: datetime

class SleepOut(BaseModel):
    id: int
    bedtime: Optional[str]
    wake_time: Optional[str]
    hours: float
    quality: str
    recorded_at: datetime

    class Config:
        from_attributes = True


# ─────────────── PREDICT ───────────────

class GlucoseForecastRequest(BaseModel):
    recent_readings: List[float]   # last N glucose values in mg/dL (up to 36)

class GlucoseForecastResponse(BaseModel):
    forecast_mg_dl: float
    horizon_minutes: int = 30
    confidence: str          # LOW / MEDIUM / HIGH

class PPGRRequest(BaseModel):
    carbs: float
    protein: float
    fat: float
    baseline_glucose: Optional[float] = 110.0
    activity_level: int = 1            # 0=low, 1=medium, 2=high
    sleep_hours: float = 7.0
    time_since_last_meal: float = 3.0  # hours

class PPGRResponse(BaseModel):
    predicted_ppgr: float
    risk_flag: str
    explanation: dict

class RecommendationOut(BaseModel):
    meal_name: str
    carbs: float
    protein: float
    fat: float
    predicted_ppgr: float
    risk_flag: str
    rank: int

    class Config:
        from_attributes = True


# ─────────────── ALERT ───────────────

class AlertOut(BaseModel):
    id: int
    alert_type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    is_read: bool


# ─────────────── DASHBOARD ───────────────

class DashboardResponse(BaseModel):
    latest_glucose: Optional[float]
    glucose_trend: str       # rising, stable, falling
    glucose_status: str      # in-range, borderline, risk
    forecast_30min: Optional[float]
    steps_today: int
    sleep_last_night: Optional[float]
    total_meals_today: int
    unread_alerts: int
