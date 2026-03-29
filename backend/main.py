import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db
from config import settings

# ── Allowed Origins ────────────────────────────────────────────
_allowed_origins = [
    "https://pwa-six-puce.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]
if settings.FRONTEND_URL and settings.FRONTEND_URL not in _allowed_origins:
    _allowed_origins.insert(0, settings.FRONTEND_URL)

# ── Socket.IO ──────────────────────────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=_allowed_origins,
    logger=False,
    engineio_logger=False,
)


@sio.event
async def connect(sid, environ):
    print(f"🔌 Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"🔌 Client disconnected: {sid}")


@sio.event
async def join_district(sid, data):
    district_id = data.get("district_id", "")
    room = f"district_{district_id}"
    sio.enter_room(sid, room)
    print(f"📡 {sid} joined room {room}")


# ── FastAPI app ────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()

    # Train Isolation Forest
    try:
        from services.isolation_forest import load_model
        load_model()
    except Exception as e:
        print(f"⚠️  Isolation Forest load skipped: {e}")

    # Start scheduler
    try:
        from services.scheduler import start_scheduler
        start_scheduler()
    except Exception as e:
        print(f"⚠️  Scheduler start skipped: {e}")

    yield

    # Shutdown
    try:
        from services.scheduler import scheduler
        scheduler.shutdown(wait=False)
    except Exception:
        pass
    await close_db()


app = FastAPI(
    title="PMDDKY GroundTruth API",
    description="Smart Governance & Field Monitoring Platform for PMDDKY",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ────────────────────────────────────────────
from routes.auth import router as auth_router
from routes.farmers import router as farmers_router
from routes.submissions import router as submissions_router
from routes.fund_logs import router as fund_logs_router
from routes.verifications import router as verifications_router
from routes.anomalies import router as anomalies_router
from routes.dashboard import router as dashboard_router
from routes.notifications import router as notifications_router
from routes.bdo_dashboard import router as bdo_router
from routes.whatsapp_webhook import router as whatsapp_router
from routes.beneficiary_responses import router as beneficiary_responses_router
from routes.verification import router as verification_router
from routes.public_dashboard import router as public_dashboard_router

app.include_router(auth_router)
app.include_router(farmers_router)
app.include_router(submissions_router)
app.include_router(fund_logs_router)
app.include_router(verifications_router)
app.include_router(anomalies_router)
app.include_router(dashboard_router)
app.include_router(notifications_router)
app.include_router(bdo_router)
app.include_router(whatsapp_router)
app.include_router(beneficiary_responses_router)
app.include_router(verification_router)
app.include_router(public_dashboard_router)


@app.get("/")
async def root():
    return {
        "name": "PMDDKY GroundTruth API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health():
    return {"status": "healthy"}


# ── Mount Socket.IO ───────────────────────────────────────────
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)
