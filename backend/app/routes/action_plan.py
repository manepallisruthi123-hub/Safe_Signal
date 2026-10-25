from fastapi import APIRouter, HTTPException
from app.models.schemas import ActionPlanRequest, ActionPlanResponse
from app.services.action_planner import generate_action_plan

router = APIRouter(prefix="/api", tags=["Safety Action Plan"])

@router.post("/action-plan", response_model=ActionPlanResponse)
def get_action_plan(req: ActionPlanRequest):
    try:
        plan = generate_action_plan(req.situation, req.details or "")
        return ActionPlanResponse(
            title=plan["title"],
            situationKey=plan["situationKey"],
            immediateStep=plan["immediateStep"],
            safetyGuidance=plan["safetyGuidance"],
            evidenceChecklist=plan["evidenceChecklist"],
            reportingOptions=plan["reportingOptions"],
            relevantResources=plan["relevantResources"],
            followUpSteps=plan["followUpSteps"],
            timestamp=plan["timestamp"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Action plan generation failed: {str(e)}")
