from fastapi import APIRouter, HTTPException
from app.models.schemas import HarassmentAnalyzeRequest, HarassmentAnalyzeResponse
from app.services.analyzer import analyze_cyber_harassment_text

router = APIRouter(prefix="/api", tags=["Harassment Analyzer"])

@router.post("/analyze-text", response_model=HarassmentAnalyzeResponse)
def analyze_text(req: HarassmentAnalyzeRequest):
    try:
        res = analyze_cyber_harassment_text(req.text)
        return HarassmentAnalyzeResponse(
            category=res["category"],
            severityScore=res["severityScore"],
            signals=res["signals"],
            guidance=res["guidance"],
            recommendedActions=res["recommendedActions"],
            isDeterministicFallback=res.get("isDeterministicFallback", True),
            disclaimer=res.get("disclaimer", "Preliminary heuristic evaluation.")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")
