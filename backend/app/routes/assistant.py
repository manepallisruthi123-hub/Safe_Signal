from fastapi import APIRouter, HTTPException
from app.models.schemas import AssistantRequest, AssistantResponse
from app.rag.engine import rag_engine

router = APIRouter(prefix="/api", tags=["Assistant"])

@router.post("/assistant", response_model=AssistantResponse)
def query_assistant(req: AssistantRequest):
    try:
        res = rag_engine.generate_response(req.query)
        return AssistantResponse(
            answer=res["answer"],
            sources=res["sources"],
            isGrounded=res["isGrounded"],
            model=res["model"],
            isDeterministicFallback=res.get("isDeterministicFallback", False),
            disclaimer=res.get("disclaimer", "Informational guidance only.")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate assistant response: {str(e)}")
