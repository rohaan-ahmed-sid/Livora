"""
Glucose Forecast Inference
Loads HybridLSTMTransformer + MinMaxScaler.
Accepts a list of recent CGM readings and returns a 30-min forecast.
"""
import os
import numpy as np
import torch
import joblib
from app.ml.models import HybridLSTMTransformer

SEQ_LEN = 36
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml_models")

_model = None
_scaler = None


def _load():
    global _model, _scaler
    if _model is None:
        scaler_path = os.path.join(MODEL_DIR, "glucose_scaler.pkl")
        model_path  = os.path.join(MODEL_DIR, "hybrid_model.pt")
        _scaler = joblib.load(scaler_path)
        _model  = HybridLSTMTransformer()
        _model.load_state_dict(torch.load(model_path, map_location="cpu"))
        _model.eval()


def predict_glucose(recent_readings: list[float]) -> dict:
    """
    recent_readings: list of up to 36 glucose values (mg/dL), most recent last.
    Returns: { forecast_mg_dl, confidence }
    """
    _load()

    vals = np.array(recent_readings, dtype=np.float32)

    # Pad or truncate to SEQ_LEN
    if len(vals) < SEQ_LEN:
        pad = np.full(SEQ_LEN - len(vals), vals[0] if len(vals) > 0 else 110.0)
        vals = np.concatenate([pad, vals])
    else:
        vals = vals[-SEQ_LEN:]

    scaled = _scaler.transform(vals.reshape(-1, 1)).flatten()
    tensor = torch.tensor(scaled, dtype=torch.float32).unsqueeze(0).unsqueeze(-1)  # (1, 36, 1)

    with torch.no_grad():
        pred_scaled = _model(tensor).item()

    pred_real = _scaler.inverse_transform([[pred_scaled]])[0][0]

    # confidence based on how many real readings were provided
    n = len(recent_readings)
    confidence = "HIGH" if n >= 24 else ("MEDIUM" if n >= 12 else "LOW")

    return {
        "forecast_mg_dl": round(float(pred_real), 1),
        "confidence": confidence,
    }
