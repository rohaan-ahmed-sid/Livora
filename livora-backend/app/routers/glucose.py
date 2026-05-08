from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.models.glucose import GlucoseReading
from app.models.other import Alert
from app.schemas import GlucoseCreate, GlucoseOut
from app.core.security import get_current_user

router = APIRouter(prefix="/glucose", tags=["glucose"])


def _check_and_alert(user: User, reading: GlucoseReading, db: Session):
    """Auto-create alert if glucose is out of range."""
    low = user.target_glucose_min or 70
    high = user.target_glucose_max or 180
    val = reading.value

    if val < low:
        alert = Alert(
            user_id=user.id,
            alert_type="critical",
            title="Low Blood Sugar",
            message=f"Glucose reading of {val} mg/dL is below your target range ({low} mg/dL). Consider eating a fast-acting carb.",
        )
        db.add(alert)
    elif val > high:
        severity = "critical" if val > 250 else "warning"
        alert = Alert(
            user_id=user.id,
            alert_type=severity,
            title="High Blood Sugar",
            message=f"Glucose reading of {val} mg/dL is above your target range ({high} mg/dL). Stay hydrated and consider activity.",
        )
        db.add(alert)


@router.post("/", response_model=GlucoseOut)
def add_reading(
    body: GlucoseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    reading = GlucoseReading(user_id=user.id, **body.model_dump())
    db.add(reading)
    db.flush()
    _check_and_alert(user, reading, db)
    db.commit()
    db.refresh(reading)
    return reading


@router.get("/", response_model=List[GlucoseOut])
def get_readings(
    days: int = Query(7, ge=1, le=90),
    context: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    q = db.query(GlucoseReading).filter(
        GlucoseReading.user_id == user.id,
        GlucoseReading.recorded_at >= since,
    )
    if context:
        q = q.filter(GlucoseReading.context == context)
    return q.order_by(GlucoseReading.recorded_at.desc()).all()


@router.get("/latest", response_model=Optional[GlucoseOut])
def latest_reading(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(GlucoseReading)
        .filter(GlucoseReading.user_id == user.id)
        .order_by(GlucoseReading.recorded_at.desc())
        .first()
    )


@router.delete("/{reading_id}")
def delete_reading(
    reading_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    reading = db.query(GlucoseReading).filter(
        GlucoseReading.id == reading_id, GlucoseReading.user_id == user.id
    ).first()
    if reading:
        db.delete(reading)
        db.commit()
    return {"deleted": True}
