"""
train_models.py
───────────────
Run ONCE to generate and save the ML models.

    cd livora-backend
    python train_models.py

Produces:
    ml_models/hybrid_model.pt
    ml_models/glucose_scaler.pkl
    ml_models/ppgr_model.pkl
"""

import os
import numpy as np
import joblib
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler

OUT_DIR = "ml_models"
os.makedirs(OUT_DIR, exist_ok=True)

# ═══════════════════════════════════════════════════════════════
# 1. HYBRID LSTM + TRANSFORMER  —  Glucose Forecasting
# ═══════════════════════════════════════════════════════════════
print("Training Hybrid LSTM+Transformer...")

SEQ_LEN = 36
HORIZON = 6


def make_cgm_series(n=15000):
    """Synthetic CGM data: daily sinusoidal pattern + meal spikes + noise."""
    t = np.arange(n)
    base = 110 + 25 * np.sin(2 * np.pi * t / 288)         # ~daily cycle (288 = 24h at 5-min)
    meals = np.zeros(n)
    for spike_t in range(0, n, 72):                         # meal spike every 6h
        for k in range(30):
            if spike_t + k < n:
                meals[spike_t + k] = 30 * np.exp(-k / 8)  # exponential decay
    noise = np.random.normal(0, 4, n)
    series = np.clip(base + meals + noise, 50, 300).astype("float32")
    return series


cgm_series = make_cgm_series(15000)

scaler = MinMaxScaler()
series_scaled = scaler.fit_transform(cgm_series.reshape(-1, 1)).flatten()
joblib.dump(scaler, os.path.join(OUT_DIR, "glucose_scaler.pkl"))
print(f"  Scaler saved. CGM range: [{cgm_series.min():.1f}, {cgm_series.max():.1f}]")

# Sequences
X_list, y_list = [], []
for i in range(len(series_scaled) - SEQ_LEN - HORIZON):
    X_list.append(series_scaled[i:i + SEQ_LEN])
    y_list.append(series_scaled[i + SEQ_LEN + HORIZON - 1])
X = np.array(X_list, dtype="float32").reshape(-1, SEQ_LEN, 1)
y = np.array(y_list, dtype="float32")

split = int(0.8 * len(X))
X_tr, y_tr = torch.tensor(X[:split]), torch.tensor(y[:split])
X_te, y_te = torch.tensor(X[split:]), torch.tensor(y[split:])

train_loader = DataLoader(TensorDataset(X_tr, y_tr), batch_size=256, shuffle=True)


class HybridLSTMTransformer(nn.Module):
    def __init__(self, input_size=1, hidden_size=32, d_model=32, nhead=2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.proj = nn.Linear(hidden_size, d_model)
        enc_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead, batch_first=True, dropout=0.0)
        self.transformer = nn.TransformerEncoder(enc_layer, num_layers=1)
        self.fc = nn.Linear(d_model, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        x = self.proj(out)
        x = self.transformer(x)
        return self.fc(x[:, -1, :])


model = HybridLSTMTransformer()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.MSELoss()

for epoch in range(15):
    model.train()
    total = 0
    for xb, yb in train_loader:
        optimizer.zero_grad()
        pred = model(xb).squeeze()
        loss = loss_fn(pred, yb)
        loss.backward()
        optimizer.step()
        total += loss.item()
    if (epoch + 1) % 5 == 0:
        print(f"  Epoch {epoch+1}/15 — loss: {total/len(train_loader):.4f}")

# Eval
model.eval()
with torch.no_grad():
    pred_s = model(X_te).squeeze().numpy()
pred_real = scaler.inverse_transform(pred_s.reshape(-1, 1)).flatten()
y_real = scaler.inverse_transform(y_te.numpy().reshape(-1, 1)).flatten()
rmse = np.sqrt(((pred_real - y_real) ** 2).mean())
print(f"  RMSE: {rmse:.2f} mg/dL")

torch.save(model.state_dict(), os.path.join(OUT_DIR, "hybrid_model.pt"))
print("  hybrid_model.pt saved ✓\n")

# ═══════════════════════════════════════════════════════════════
# 2. PPGR  —  RandomForest
# ═══════════════════════════════════════════════════════════════
print("Training PPGR RandomForest...")

N = 8000
rng = np.random.default_rng(42)

carbs   = rng.uniform(0, 100, N)
protein = rng.uniform(0, 40, N)
fat     = rng.uniform(0, 40, N)
hour    = rng.integers(0, 24, N).astype(float)
tslm    = rng.uniform(0, 8, N)          # time since last meal (h)
bg      = rng.normal(110, 20, N)        # baseline glucose
act     = rng.integers(0, 3, N).astype(float)   # 0/1/2
sleep   = rng.normal(7, 1.5, N)
micro   = np.zeros((N, 50))             # zeros (unknown microbiome)

# PPGR formula (matches original notebook logic + noise)
ppgr = (
    carbs * 0.60
    + protein * 0.20
    + fat * 0.10
    + (bg - 100) * 0.05
    - act * 3.0
    - (sleep - 6) * 1.5
    + rng.normal(0, 5, N)
)
ppgr = np.clip(ppgr, 0, 120).astype("float32")

FEATURES = (
    ["Carbs", "Protein", "Fat", "hour", "time_since_last_meal",
     "baseline_glucose", "activity_level", "sleep_hours"]
    + [f"micro_pc_{i}" for i in range(50)]
)

import pandas as pd
X_ppgr = pd.DataFrame(
    np.column_stack([carbs, protein, fat, hour, tslm, bg, act, sleep, micro]),
    columns=FEATURES,
)

rf = RandomForestRegressor(n_estimators=150, random_state=42, n_jobs=-1)
rf.fit(X_ppgr, ppgr)

pred_ppgr = rf.predict(X_ppgr)
rmse_ppgr = np.sqrt(((pred_ppgr - ppgr) ** 2).mean())
print(f"  Train RMSE: {rmse_ppgr:.2f} mg/dL")

joblib.dump(rf, os.path.join(OUT_DIR, "ppgr_model.pkl"))
print("  ppgr_model.pkl saved ✓\n")

print("=" * 50)
print("All models saved to ml_models/")
print("  hybrid_model.pt")
print("  glucose_scaler.pkl")
print("  ppgr_model.pkl")
print("=" * 50)
