from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.rag.engine import rag_engine

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        rag_ready=rag_engine.is_initialized,
        demo_mode=True,
        active_sources_count=len(rag_engine.documents)
    )
