from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.other import ActivityLog, SleepLog
from app.schemas import ActivityCreate, ActivityOut, SleepCreate, SleepOut
from app.core.security import get_current_user

# ─── Activity ─────────────────────────────────────────────────────────────────

activity_router = APIRouter(prefix="/activity", tags=["activity"])


@activity_router.post("/", response_model=ActivityOut)
def log_activity(
    body: ActivityCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    log = ActivityLog(user_id=user.id, **body.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@activity_router.get("/", response_model=List[ActivityOut])
def get_activity(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    return (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user.id, ActivityLog.recorded_at >= since)
        .order_by(ActivityLog.recorded_at.desc())
        .all()
    )


@activity_router.delete("/{log_id}")
def delete_activity(log_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    log = db.query(ActivityLog).filter(ActivityLog.id == log_id, ActivityLog.user_id == user.id).first()
    if log:
        db.delete(log)
        db.commit()
    return {"deleted": True}


# ─── Sleep ────────────────────────────────────────────────────────────────────

sleep_router = APIRouter(prefix="/sleep", tags=["sleep"])


@sleep_router.post("/", response_model=SleepOut)
def log_sleep(
    body: SleepCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    log = SleepLog(user_id=user.id, **body.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@sleep_router.get("/", response_model=List[SleepOut])
def get_sleep(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    return (
        db.query(SleepLog)
        .filter(SleepLog.user_id == user.id, SleepLog.recorded_at >= since)
        .order_by(SleepLog.recorded_at.desc())
        .all()
    )


@sleep_router.delete("/{log_id}")
def delete_sleep(log_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    log = db.query(SleepLog).filter(SleepLog.id == log_id, SleepLog.user_id == user.id).first()
    if log:
        db.delete(log)
        db.commit()
    return {"deleted": True}
