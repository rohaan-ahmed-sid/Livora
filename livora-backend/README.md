# Livora Backend — Local Setup Guide

## Stack
- **Backend**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 16
- **Auth**: Custom JWT (no Supabase)
- **ML**: PyTorch (Hybrid LSTM+Transformer) + scikit-learn (RandomForest PPGR)
- **Frontend**: React/TypeScript (existing repo, minor changes needed)

---

## Backend Setup (run once)

### 1. Prerequisites
```bash
# Install PostgreSQL if not already installed
# Ubuntu/WSL:
sudo apt install postgresql postgresql-client

# Start PostgreSQL
sudo service postgresql start

# Create DB + user
sudo -u postgres psql -c "CREATE USER livora WITH PASSWORD 'livora123';"
sudo -u postgres psql -c "CREATE DATABASE livoradb OWNER livora;"
```

### 2. Python environment
```bash
cd livora-backend

# Create venv (recommended)
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Train ML models (run ONCE — takes ~2 min)
```bash
python train_models.py
# Creates: ml_models/hybrid_model.pt
#          ml_models/glucose_scaler.pkl
#          ml_models/ppgr_model.pkl
```

### 4. Create database tables (run ONCE)
```bash
python create_tables.py
```

### 5. Start the server
```bash
uvicorn app.main:app --reload --port 8000
# API is live at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

---

## Frontend Setup

### 1. Install axios
```bash
cd your-react-frontend
npm install axios
```

### 2. Replace files
Copy from `frontend-changes/` into your React project:
- `src/lib/api.ts`  → replaces Supabase client
- `src/contexts/AuthContext.tsx`  → replaces Supabase auth context

### 3. Wrap your app with AuthProvider
In `src/main.tsx` or `src/App.tsx`:
```tsx
import { AuthProvider } from "@/contexts/AuthContext";

<AuthProvider>
  <App />
</AuthProvider>
```

### 4. Update components
Replace any Supabase calls with the new API functions:

```tsx
// OLD (Supabase)
const { data, error } = await supabase.from("glucose_readings").select("*");

// NEW (FastAPI)
import { glucoseApi } from "@/lib/api";
const { data } = await glucoseApi.list(7);
```

---

## API Reference

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| POST   | /auth/register              | Register new user                  |
| POST   | /auth/login                 | Login → returns JWT                |
| GET    | /auth/me                    | Get current user profile           |
| PUT    | /auth/me                    | Update profile                     |
| POST   | /glucose/                   | Add CGM reading (auto-alerts)      |
| GET    | /glucose/?days=7            | List readings                      |
| GET    | /glucose/latest             | Latest reading                     |
| POST   | /meals/                     | Log meal (auto-runs PPGR model)    |
| GET    | /meals/?days=7              | List meals with PPGR predictions   |
| POST   | /activity/                  | Log activity                       |
| POST   | /sleep/                     | Log sleep                          |
| POST   | /predict/glucose            | 30-min forecast (LSTM+Transformer) |
| POST   | /predict/ppgr               | Predict glucose rise for a meal    |
| GET    | /predict/recommendations    | DFRS food recommendations          |
| GET    | /alerts/                    | List alerts                        |
| PUT    | /alerts/{id}/read           | Mark alert as read                 |
| GET    | /dashboard/                 | Aggregated dashboard data          |

---

## ML Models

### Model 1: Hybrid LSTM + Transformer
- **Input**: Last 36 CGM readings (3h at 5-min intervals)
- **Output**: Predicted glucose at 30 minutes ahead
- **Auto-pads** with average if fewer than 36 readings available

### Model 2: PPGR (RandomForest)
- **Input**: Carbs, Protein, Fat + hour, time since last meal, baseline glucose, activity, sleep
- **Output**: Predicted glucose rise (mg/dL) + risk flag (LOW / MODERATE / HIGH)
- **Runs automatically** every time a meal is logged

### Model 3: DFRS (Food Recommender)
- Uses PPGR model to rank all foods in the Pakistani/South Asian food library
- Returns top-N safest foods for the user's current context
- Call `/predict/recommendations` to get ranked list

---

## Alerts (auto-generated)
Alerts are created automatically when:
- Glucose < target minimum → **Low Blood Sugar** (critical)
- Glucose > target maximum → **High Blood Sugar** (warning or critical)
