from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.glucose import router as glucose_router
from app.routers.meals import router as meals_router
from app.routers.activity_sleep import activity_router, sleep_router
from app.routers.predict import router as predict_router
from app.routers.alerts_dashboard import alerts_router, dashboard_router

app = FastAPI(title="Livora API", version="1.0.0")

# Allow React frontend running on localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(glucose_router)
app.include_router(meals_router)
app.include_router(activity_router)
app.include_router(sleep_router)
app.include_router(predict_router)
app.include_router(alerts_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"status": "Livora API running", "docs": "/docs"}
