from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.meal import MealLog
from app.models.glucose import GlucoseReading
from app.models.other import ActivityLog, SleepLog
from app.schemas import MealCreate, MealOut
from app.core.security import get_current_user
from app.ml.ppgr import predict_ppgr
from app.ml.dfrs import _adjusted_baseline

router = APIRouter(prefix="/meals", tags=["meals"])


def _get_baseline(user_id: int, db: Session) -> float:
    reading = (
        db.query(GlucoseReading)
        .filter(GlucoseReading.user_id == user_id)
        .order_by(GlucoseReading.recorded_at.desc())
        .first()
    )
    return reading.value if reading else 110.0


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


def _get_recent_sleep(user_id: int, db: Session, fallback: float) -> float:
    since = datetime.utcnow() - timedelta(hours=24)
    log = (
        db.query(SleepLog)
        .filter(SleepLog.user_id == user_id, SleepLog.recorded_at >= since)
        .order_by(SleepLog.recorded_at.desc())
        .first()
    )
    return log.hours if log else fallback


def _get_recent_activity_level(user_id: int, db: Session, fallback: str) -> int:
    since = datetime.utcnow() - timedelta(hours=24)
    log = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id, ActivityLog.recorded_at >= since)
        .order_by(ActivityLog.recorded_at.desc())
        .first()
    )
    if log:
        intensity_map = {"light": 0, "moderate": 1, "vigorous": 2}
        return intensity_map.get(log.intensity, 1)
    profile_map = {"low": 0, "moderate": 1, "high": 2}
    return profile_map.get(fallback or "moderate", 1)


@router.post("/", response_model=MealOut)
def log_meal(
    body: MealCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    baseline     = _get_baseline(user.id, db)
    time_since   = _hours_since_last_meal(user.id, db)
    sleep_hours  = _get_recent_sleep(user.id, db, fallback=user.sleep_goal_hours or 7.0)
    activity_int = _get_recent_activity_level(user.id, db, fallback=user.activity_level)

    # Full health profile adjusts effective baseline
    adj_baseline = _adjusted_baseline(
        baseline_glucose=baseline,
        hba1c=user.hba1c,
        bp_systolic=user.bp_systolic,
        weight_kg=user.weight_kg,
        height_cm=user.height_cm,
    )

    ppgr_result = predict_ppgr(
        carbs=body.carbs,
        protein=body.protein,
        fat=body.fat,
        baseline_glucose=adj_baseline,
        activity_level=activity_int,
        sleep_hours=sleep_hours,
        time_since_last_meal=time_since,
        hour=body.recorded_at.hour,
    )

    meal = MealLog(
        user_id=user.id,
        **body.model_dump(),
        predicted_ppgr=ppgr_result["predicted_ppgr"],
        risk_flag=ppgr_result["risk_flag"],
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal


@router.get("/", response_model=List[MealOut])
def get_meals(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    return (
        db.query(MealLog)
        .filter(MealLog.user_id == user.id, MealLog.recorded_at >= since)
        .order_by(MealLog.recorded_at.desc())
        .all()
    )


@router.delete("/{meal_id}")
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    meal = db.query(MealLog).filter(
        MealLog.id == meal_id, MealLog.user_id == user.id
    ).first()
    if meal:
        db.delete(meal)
        db.commit()
    return {"deleted": True}
