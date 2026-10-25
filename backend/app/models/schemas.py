from typing import List, Optional
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    rag_ready: bool = True
    demo_mode: bool = True
    active_sources_count: int = 0

class SourceCitation(BaseModel):
    id: Optional[str] = None
    title: str
    url: str
    sourceType: str = "Official Government"
    verifiedDate: str = "2026-02-15"
    relevance_score: Optional[float] = None

class AssistantRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000, description="User question or incident description")
    history: Optional[List[dict]] = Field(default=[], description="Chat history")

class AssistantResponse(BaseModel):
    answer: str
    sources: List[SourceCitation] = []
    isGrounded: bool = True
    model: str
    isDeterministicFallback: bool = False
    disclaimer: str

class SignalItem(BaseModel):
    type: str
    description: str
    severity: str

class HarassmentAnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Pasted message or text to screen")

class HarassmentAnalyzeResponse(BaseModel):
    category: str
    severityScore: int
    signals: List[SignalItem] = []
    guidance: str
    recommendedActions: List[str] = []
    isDeterministicFallback: bool = False
    disclaimer: str

class ActionPlanRequest(BaseModel):
    situation: str = Field(..., description="Key: physical_danger, unsafe_journey, online_harassment, deepfake_image_abuse, impersonation")
    details: Optional[str] = Field(default="", max_length=2000)

class ActionPlanResponse(BaseModel):
    title: str
    situationKey: str
    immediateStep: str
    safetyGuidance: str
    evidenceChecklist: List[str] = []
    reportingOptions: List[str] = []
    relevantResources: List[dict] = []
    followUpSteps: List[str] = []
    timestamp: str

class ResourceItem(BaseModel):
    title: str
    category: str
    url: str
    description: str
    source: str
    verifiedDate: str

class ResourcesResponse(BaseModel):
    resources: List[ResourceItem]
    isFallback: bool = False
