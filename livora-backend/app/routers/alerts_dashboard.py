from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from typing import List, Optional
from datetime import datetime, timedelta, date
from app.database import get_db
from app.models.user import User
from app.models.other import Alert, ActivityLog, SleepLog
from app.models.glucose import GlucoseReading
from app.models.meal import MealLog
from app.schemas import AlertOut, AlertUpdate, DashboardResponse
from app.core.security import get_current_user

# ─── Alerts ───────────────────────────────────────────────────────────────────

alerts_router = APIRouter(prefix="/alerts", tags=["alerts"])


@alerts_router.get("/", response_model=List[AlertOut])
def get_alerts(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Alert).filter(Alert.user_id == user.id)
    if unread_only:
        q = q.filter(Alert.is_read == False)
    return q.order_by(Alert.created_at.desc()).limit(50).all()


@alerts_router.put("/{alert_id}/read")
def mark_read(
    alert_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == user.id).first()
    if alert:
        alert.is_read = True
        db.commit()
    return {"updated": True}


@alerts_router.put("/mark-all-read")
def mark_all_read(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.query(Alert).filter(Alert.user_id == user.id).update({"is_read": True})
    db.commit()
    return {"updated": True}


# ─── Dashboard ────────────────────────────────────────────────────────────────

dashboard_router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@dashboard_router.get("/", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    # Latest glucose
    last_readings = (
        db.query(GlucoseReading)
        .filter(GlucoseReading.user_id == user.id)
        .order_by(GlucoseReading.recorded_at.desc())
        .limit(3)
        .all()
    )
    latest_glucose = last_readings[0].value if last_readings else None

    # Trend (compare last 2 readings)
    trend = "stable"
    if len(last_readings) >= 2:
        diff = last_readings[0].value - last_readings[1].value
        trend = "rising" if diff > 5 else ("falling" if diff < -5 else "stable")

    # Status relative to target
    status = "in-range"
    if latest_glucose:
        lo = user.target_glucose_min or 70
        hi = user.target_glucose_max or 180
        if latest_glucose < lo - 10 or latest_glucose > hi + 30:
            status = "risk"
        elif latest_glucose < lo or latest_glucose > hi:
            status = "borderline"

    # 30-min forecast (quick from last 36 readings)
    forecast_val = None
    try:
        recent = (
            db.query(GlucoseReading)
            .filter(GlucoseReading.user_id == user.id)
            .order_by(GlucoseReading.recorded_at.desc())
            .limit(36)
            .all()
        )
        if recent:
            from app.ml.glucose_forecast import predict_glucose
            vals = [r.value for r in reversed(recent)]
            forecast_val = predict_glucose(vals)["forecast_mg_dl"]
    except Exception:
        pass

    # Activity today (steps via duration proxy)
    act_today = (
        db.query(func.sum(ActivityLog.duration_minutes))
        .filter(ActivityLog.user_id == user.id, ActivityLog.recorded_at >= today_start)
        .scalar()
    ) or 0
    steps_today = int(act_today * 100)   # rough proxy: 100 steps/min

    # Last sleep
    last_sleep = (
        db.query(SleepLog)
        .filter(SleepLog.user_id == user.id)
        .order_by(SleepLog.recorded_at.desc())
        .first()
    )
    sleep_last = last_sleep.hours if last_sleep else None

    # Meals today
    meals_today = (
        db.query(func.count(MealLog.id))
        .filter(MealLog.user_id == user.id, MealLog.recorded_at >= today_start)
        .scalar()
    ) or 0

    # Unread alerts
    unread = (
        db.query(func.count(Alert.id))
        .filter(Alert.user_id == user.id, Alert.is_read == False)
        .scalar()
    ) or 0

    return DashboardResponse(
        latest_glucose=latest_glucose,
        glucose_trend=trend,
        glucose_status=status,
        forecast_30min=forecast_val,
        steps_today=steps_today,
        sleep_last_night=sleep_last,
        total_meals_today=meals_today,
        unread_alerts=unread,
    )
