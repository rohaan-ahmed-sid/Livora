from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.glucose import GlucoseReading
from app.models.other import Recommendation, ActivityLog, SleepLog
from app.models.meal import MealLog
from app.schemas import (
    GlucoseForecastRequest, GlucoseForecastResponse,
    PPGRRequest, PPGRResponse,
    RecommendationOut,
)
from app.core.security import get_current_user
from app.ml.glucose_forecast import predict_glucose
from app.ml.ppgr import predict_ppgr
from app.ml.dfrs import get_recommendations, _adjusted_baseline

router = APIRouter(prefix="/predict", tags=["predict"])


def _get_recent_sleep(user_id: int, db: Session, fallback: float) -> float:
    since = datetime.utcnow() - timedelta(hours=24)
    log = (
        db.query(SleepLog)
        .filter(SleepLog.user_id == user_id, SleepLog.recorded_at >= since)
        .order_by(SleepLog.recorded_at.desc())
        .first()
    )
    return log.hours if log else fallback


def _get_recent_activity(user_id: int, db: Session, fallback: str) -> int:
    since = datetime.utcnow() - timedelta(hours=24)
    log = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id, ActivityLog.recorded_at >= since)
        .order_by(ActivityLog.recorded_at.desc())
        .first()
    )
    if log:
        return {"light": 0, "moderate": 1, "vigorous": 2}.get(log.intensity, 1)
    return {"low": 0, "moderate": 1, "high": 2}.get(fallback or "moderate", 1)


def _hours_since_last_meal(user_id: int, db: Session) -> float:
    last = (
        db.query(MealLog)
        .filter(MealLog.user_id == user_id)
        .order_by(MealLog.recorded_at.desc())
        .first()
    )
    if not last:
        return 4.0
    delta = datetime.utcnow() - last.recorded_at.replace(tzinfo=None)
    return min(delta.total_seconds() / 3600, 12.0)


@router.post("/glucose", response_model=GlucoseForecastResponse)
def forecast_glucose(
    body: GlucoseForecastRequest,
    user: User = Depends(get_current_user),
):
    result = predict_glucose(body.recent_readings)
    return GlucoseForecastResponse(
        forecast_mg_dl=result["forecast_mg_dl"],
        confidence=result["confidence"],
    )


@router.post("/ppgr", response_model=PPGRResponse)
def predict_meal_ppgr(
    body: PPGRRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Use real context if caller didn't supply it
    baseline = body.baseline_glucose
    if baseline is None:
        latest = (
            db.query(GlucoseReading)
            .filter(GlucoseReading.user_id == user.id)
            .order_by(GlucoseReading.recorded_at.desc())
            .first()
        )
        baseline = latest.value if latest else 110.0

    adj_baseline = _adjusted_baseline(
        baseline_glucose=baseline,
        hba1c=user.hba1c,
        bp_systolic=user.bp_systolic,
        weight_kg=user.weight_kg,
        height_cm=user.height_cm,
    )

    activity_int = body.activity_level
    if activity_int == 1:   # default — try real log
        activity_int = _get_recent_activity(user.id, db, fallback=user.activity_level)

    sleep = body.sleep_hours
    if sleep == 7.0:        # default — try real log
        sleep = _get_recent_sleep(user.id, db, fallback=user.sleep_goal_hours or 7.0)

    result = predict_ppgr(
        carbs=body.carbs,
        protein=body.protein,
        fat=body.fat,
        baseline_glucose=adj_baseline,
        activity_level=activity_int,
        sleep_hours=sleep,
        time_since_last_meal=body.time_since_last_meal,
        hour=datetime.now().hour,
    )
    return PPGRResponse(**result)


@router.get("/recommendations", response_model=List[RecommendationOut])
def get_food_recommendations(
    top_n: int = Query(10, ge=3, le=30),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    DFRS recommendations using user's full health profile:
    - Latest glucose reading
    - Recent sleep log (or profile goal)
    - Recent activity log (or profile level)
    - Dietary preferences (halal, vegan, gluten-free, nut-free, dairy-free)
    - HbA1c, BP, BMI (adjusts effective baseline)
    - Time since last meal
    """
    latest = (
        db.query(GlucoseReading)
        .filter(GlucoseReading.user_id == user.id)
        .order_by(GlucoseReading.recorded_at.desc())
        .first()
    )
    baseline = latest.value if latest else 110.0

    sleep_hours  = _get_recent_sleep(user.id, db, fallback=user.sleep_goal_hours or 7.0)
    activity_int = _get_recent_activity(user.id, db, fallback=user.activity_level)
    time_since   = _hours_since_last_meal(user.id, db)

    # Parse dietary preferences from user profile
    prefs = []
    if user.dietary_preferences:
        prefs = [p.strip() for p in user.dietary_preferences.split(",") if p.strip()]

    recs = get_recommendations(
        baseline_glucose=baseline,
        activity_level=activity_int,
        sleep_hours=sleep_hours,
        sleep_goal=user.sleep_goal_hours or 8.0,
        time_since_last_meal=time_since,
        dietary_preferences=prefs,
        hba1c=user.hba1c,
        bp_systolic=user.bp_systolic,
        bp_diastolic=user.bp_diastolic,
        weight_kg=user.weight_kg,
        height_cm=user.height_cm,
        top_n=top_n,
    )

    # Persist to DB
    db.query(Recommendation).filter(Recommendation.user_id == user.id).delete()
    for r in recs:
        r_clean = {k: v for k, v in r.items() if k != "tags"}
        db.add(Recommendation(user_id=user.id, **r_clean))
    db.commit()

    return recs
