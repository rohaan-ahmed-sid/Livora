# Livora — Adaptive Diet Planning & Monitoring System for Diabetic Patients

A full-stack AI-powered health management application built as a Final Year Project at FAST-NUCES Karachi.

Livora helps diabetic patients manage their glucose levels through real-time monitoring, AI-driven food recommendations, and predictive glucose forecasting.

---

## Team

| Name | Roll Number |
|---|---|
| Rohaan Ahmed | 22K-4839 |
| Sameen Tariq | 22K-5184 |
| Asfand Amir | 22K-4720 |

---

## Features

- **Glucose Tracking** — Manual CGM entry with automatic alerts for out-of-range readings
- **30-Minute Glucose Forecast** — Hybrid LSTM + Transformer model predicts glucose 30 minutes ahead
- **PPGR Prediction** — RandomForest model predicts post-meal glucose rise for any food
- **DFRS Food Recommendations** — AI-ranked Pakistani/South Asian food suggestions filtered by dietary preferences (Halal, Vegan, Gluten-Free, Nut-Free, Dairy-Free)
- **Activity & Sleep Logging** — All logs feed into prediction models for personalized results
- **Health Profile** — HbA1c, BP, BMI all factor into glucose predictions
- **Alerts** — Auto-generated when glucose goes out of target range
- **Trends & History** — Charts with real-time filtering and forecast overlay

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Auth | Custom JWT |
| ML Models | PyTorch (LSTM+Transformer), scikit-learn (RandomForest) |

---

## Prerequisites

Install these before anything else:

- **Python 3.11 or 3.12** — https://python.org/downloads
  - ⚠️ Avoid Python 3.13 if possible (psycopg2 compatibility issues)
  - During install, tick **"Add Python to PATH"**
- **Node.js LTS** — https://nodejs.org
- **PostgreSQL 16** — https://www.postgresql.org/download/windows
  - During install, set a superuser password and keep port 5432
  - Uncheck "Launch Stack Builder" at the end
- **Git** — https://git-scm.com/download/win

---

## Setup — Step by Step

### 1. Clone the repository

```bash
git clone https://github.com/rohaan-ahmed-sid/Livora.git
cd Livora
```

---

### 2. PostgreSQL — create database

Open **pgAdmin 4** (installed with PostgreSQL) → enter your superuser password.

In the left panel: right-click **Databases → Create → Database**
- Name: `livoradb`
- Owner: `postgres`
- Click Save

Then open **Tools → Query Tool** and run:

```sql
CREATE USER livora WITH PASSWORD 'livora123';
GRANT ALL PRIVILEGES ON DATABASE livoradb TO livora;
```

Click ▶ Run.

---

### 3. Backend setup

Open a terminal and navigate to the backend folder:

```bash
cd livora-backend
```

Create and activate a virtual environment:

```bash
# Create
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

You should see `(venv)` at the start of your prompt.

Install dependencies:

```bash
pip install -r requirements.txt
pip install bcrypt==4.0.1
```

> ⚠️ PyTorch is ~2GB. This will take several minutes.

> If you're on **Python 3.13**, install psycopg3 instead:
> ```bash
> pip install psycopg[binary]
> ```
> Then change `DATABASE_URL` in `.env` from `postgresql://` to `postgresql+psycopg://`

---

### 4. Environment file

Create a file called `.env` inside `livora-backend/` with this content:

```
DATABASE_URL=postgresql://livora:livora123@localhost:5432/livoradb
SECRET_KEY=livora_super_secret_key_change_in_production_32chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

> If you're on Python 3.13 with psycopg3, change the first line to:
> `DATABASE_URL=postgresql+psycopg://livora:livora123@localhost:5432/livoradb`

---

### 5. Train the ML models

> ⏱️ This takes ~2 minutes. Run it once only.

```bash
python train_models.py
```

Expected output:
```
Training Hybrid LSTM+Transformer...
  hybrid_model.pt saved ✓

Training PPGR RandomForest...
  ppgr_model.pkl saved ✓
```

---

### 6. Create database tables

```bash
python create_tables.py
```

Expected output: `All tables created ✓`

---

### 7. Start the backend

```bash
uvicorn app.main:app --reload --port 8000
```

Expected output:
```
Application startup complete.
Uvicorn running on http://127.0.0.1:8000
```

Verify at: http://localhost:8000
Interactive API docs: http://localhost:8000/docs

---

### 8. Frontend setup

Open a **second terminal** and navigate to the frontend:

```bash
cd livora-frontend-updated
npm install
npm run dev
```

Expected output:
```
VITE ready
➜  Local: http://localhost:5173/
```

Open http://localhost:5173 in your browser.

---

## Running the project (every time)

You need **2 terminals** running simultaneously:

**Terminal 1 — Backend:**
```bash
cd livora-backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd livora-frontend-updated
npm run dev
```

Then open: http://localhost:5173

---

## Test the app

1. Register with any email and password
2. Complete onboarding — set your health profile and dietary preferences
3. **Manual Entry → Glucose** — enter a reading (e.g. `112`, context: Fasting)
4. **Manual Entry → Activity** — log a walk
5. **Manual Entry → Sleep** — log last night's sleep
6. **Meals** — log a meal with macros → PPGR prediction appears instantly
7. **Dashboard** — shows glucose gauge, 30-min forecast, activity, sleep
8. **Trends** — filter by 1h/6h/12h/24h, see forecast line
9. **History** — select any date to review that day's data
10. **Alerts** — auto-generated if glucose goes out of your target range

---

## Troubleshooting

| Error | Fix |
|---|---|
| `venv\Scripts\activate` fails | Run PowerShell as Admin → `Set-ExecutionPolicy RemoteSigned` |
| `ModuleNotFoundError` | Venv not active — run activate command first |
| `connection refused` (PostgreSQL) | Open Windows Services → start PostgreSQL service |
| `password authentication failed` | Check `.env` file DATABASE_URL matches your setup |
| `No module named 'psycopg2'` | Run `pip install psycopg[binary]` and update DATABASE_URL |
| Port 8000 in use | Change to `--port 8001` and update `BASE_URL` in `src/lib/api.ts` |
| Frontend blank page | Make sure backend is running on port 8000 first |
| `ml_models not found` | Run `python train_models.py` |

---

## Project Structure

```
Livora/
├── livora-backend/
│   ├── app/
│   │   ├── core/          # JWT auth, config
│   │   ├── models/        # SQLAlchemy DB models
│   │   ├── routers/       # API endpoints
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── ml/            # ML model inference
│   │   └── main.py        # FastAPI app
│   ├── ml_models/         # Trained model files (generated locally)
│   ├── train_models.py    # One-time model training script
│   ├── create_tables.py   # One-time DB setup
│   ├── seed_demo.py       # Optional demo data
│   └── requirements.txt
│
└── livora-frontend-updated/
    ├── src/
    │   ├── pages/         # All app screens
    │   ├── components/    # Reusable UI components
    │   ├── contexts/      # Auth context
    │   └── lib/           # API client
    └── package.json
```

---

## ML Models

### Model 1 — Hybrid LSTM + Transformer
- **Task:** Predict glucose 30 minutes ahead
- **Input:** Last 36 CGM readings (3 hours at 5-min intervals)
- **Architecture:** LSTM → Linear projection → TransformerEncoder → FC

### Model 2 — PPGR RandomForest
- **Task:** Predict post-prandial glucose rise for a given meal
- **Input:** Carbs, Protein, Fat, hour, time since last meal, baseline glucose, activity level, sleep hours
- **Output:** Predicted glucose rise (mg/dL) + risk flag (LOW / MODERATE / HIGH)

### Model 3 — DFRS (Diet Food Recommender)
- **Task:** Rank all foods in the food library by predicted PPGR
- Uses Model 2 internally with the user's real health context
- Filters by dietary preferences (Halal, Vegan, Gluten-Free, Nut-Free, Dairy-Free)
- Adjusts baseline using HbA1c, blood pressure, and BMI
