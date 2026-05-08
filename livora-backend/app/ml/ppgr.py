"""
PPGR Inference
Loads trained RandomForestRegressor.

All real contextual signals flow in:
- Meal macros (carbs, protein, fat)
- Time of day, time since last meal
- Baseline glucose (most recent reading)
- Activity level (from recent activity log or profile)
- Sleep hours (from recent sleep log or profile goal)
- microbiome PCA (zeros for unknown users)

Caller is responsible for passing adjusted baseline that already
incorporates HbA1c, BP, and BMI corrections (done in dfrs.py and meals router).
"""
import os
import numpy as np
import joblib
from datetime import datetime

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml_models")

FEATURES = (
    ["Carbs", "Protein", "Fat", "hour", "time_since_last_meal",
     "baseline_glucose", "activity_level", "sleep_hours"]
    + [f"micro_pc_{i}" for i in range(50)]
)

_model = None


def _load():
    global _model
    if _model is None:
        _model = joblib.load(os.path.join(MODEL_DIR, "ppgr_model.pkl"))


def _risk_flag(ppgr: float) -> str:
    if ppgr >= 60:
        return "HIGH"
    elif ppgr >= 35:
        return "MODERATE"
    return "LOW"


def predict_ppgr(
    carbs: float,
    protein: float,
    fat: float,
    baseline_glucose: float = 110.0,
    activity_level: int = 1,
    sleep_hours: float = 7.0,
    time_since_last_meal: float = 3.0,
    hour: int | None = None,
) -> dict:
    """
    Returns predicted PPGR (mg/dL), risk flag, and explanation.
    """
    _load()

    if hour is None:
        hour = datetime.now().hour

    row = [
        carbs, protein, fat,
        float(hour), time_since_last_meal,
        baseline_glucose, float(activity_level), sleep_hours,
        *([0.0] * 50)
    ]

    X = np.array(row, dtype=np.float32).reshape(1, -1)
    ppgr = float(_model.predict(X)[0])
    ppgr = max(0.0, ppgr)   # clamp — can't be negative
    flag = _risk_flag(ppgr)

    # Explainability breakdown
    activity_labels  = {0: "unfavorable", 1: "neutral", 2: "beneficial"}
    sleep_effect     = "beneficial" if sleep_hours >= 7 else ("neutral" if sleep_hours >= 6 else "unfavorable")
    baseline_context = "elevated" if baseline_glucose > 140 else ("normal" if baseline_glucose < 100 else "borderline")

    return {
        "predicted_ppgr": round(ppgr, 1),
        "risk_flag": flag,
        "explanation": {
            "carb_contribution":     round(carbs * 0.60, 1),
            "protein_contribution":  round(protein * 0.20, 1),
            "fat_contribution":      round(fat * 0.10, 1),
            "activity_effect":       activity_labels.get(activity_level, "neutral"),
            "sleep_effect":          sleep_effect,
            "baseline_context":      baseline_context,
            "time_of_day":           "morning" if 5 <= hour < 12 else ("afternoon" if hour < 17 else ("evening" if hour < 21 else "night")),
        }
    }
