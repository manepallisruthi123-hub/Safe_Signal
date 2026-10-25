import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.rag.engine import rag_engine
from app.db.database import init_db
from app.routes import health, assistant, harassment, action_plan, resources, settings, auth, location

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("safesignal")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize user database and RAG vector engine
    logger.info("Initializing SafeSignal database...")
    init_db()
    logger.info("Initializing SafeSignal RAG retrieval pipeline...")
    rag_engine.initialize()
    logger.info("SafeSignal Backend startup complete. Ready to serve requests.")
    yield
    # Shutdown
    logger.info("Shutting down SafeSignal Backend.")

app = FastAPI(
    title="SafeSignal AI Safety Backend",
    description="Unified API backend providing RAG safety assistance, cyber harassment analysis, and emergency action planning for recHERsion'26.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for hackathon local demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(health.router)
app.include_router(assistant.router)
app.include_router(harassment.router)
app.include_router(action_plan.router)
app.include_router(resources.router)
app.include_router(settings.router)
app.include_router(auth.router)
app.include_router(location.router)

@app.get("/")
def root():
    return {
        "platform": "SafeSignal",
        "description": "AI-Powered Unified Women's Safety Platform",
        "hackathon": "recHERsion'26",
        "docs_url": "/docs",
        "health_url": "/health",
        "status": "online"
    }

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
