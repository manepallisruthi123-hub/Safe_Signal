from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.config import get_gemini_api_key, set_gemini_api_key

router = APIRouter(prefix="/api/settings", tags=["Settings & AI Configuration"])

class GeminiKeyRequest(BaseModel):
    api_key: str = Field(..., min_length=10, max_length=150, description="Google Gemini API key from AI Studio")

class GeminiStatusResponse(BaseModel):
    gemini_enabled: bool
    model: str = "gemini-1.5-flash"
    message: str

@router.get("/gemini-status", response_model=GeminiStatusResponse)
def get_gemini_status():
    key = get_gemini_api_key()
    has_key = bool(key and len(key.strip()) > 10)
    return GeminiStatusResponse(
        gemini_enabled=has_key,
        model="gemini-2.5-flash",
        message="Gemini 2.5 Flash is active and synthesizing grounded safety responses." if has_key else "Operating in high-precision local deterministic RAG fallback mode."
    )

@router.post("/gemini-key", response_model=GeminiStatusResponse)
def configure_gemini_key(req: GeminiKeyRequest):
    test_key = req.api_key.strip()
    
    # Test the API key against Google Gemini API
    try:
        import google.generativeai as genai
        genai.configure(api_key=test_key)
        
        # Test with gemini-2.5-flash
        model_name = "gemini-2.5-flash"
        try:
            model = genai.GenerativeModel(model_name)
            test_res = model.generate_content("Respond with exactly: 'SafeSignal Gemini Verified'")
        except Exception:
            model_name = "gemini-flash-latest"
            model = genai.GenerativeModel(model_name)
            test_res = model.generate_content("Respond with exactly: 'SafeSignal Gemini Verified'")

        if not test_res.text:
            raise ValueError("Empty response received from Gemini.")
            
        # Key is valid, save it
        set_gemini_api_key(test_key)
        
        return GeminiStatusResponse(
            gemini_enabled=True,
            model=model_name,
            message=f"Google Gemini ({model_name}) successfully verified and activated!"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Gemini API verification failed: {str(e)}. Please ensure your key is valid from aistudio.google.com."
        )

@router.delete("/gemini-key", response_model=GeminiStatusResponse)
def remove_gemini_key():
    set_gemini_api_key("")
    return GeminiStatusResponse(
        gemini_enabled=False,
        model="gemini-1.5-flash",
        message="Gemini key removed. SafeSignal returned to verified local knowledge base fallback mode."
    )

# --- Google OAuth Credentials Management ---

class GoogleOAuthRequest(BaseModel):
    client_id: str = Field(..., min_length=5, max_length=250, description="Google OAuth 2.0 Web Client ID")
    client_secret: str = Field("", max_length=250, description="Google OAuth 2.0 Client Secret (optional)")

class GoogleOAuthStatusResponse(BaseModel):
    google_oauth_configured: bool
    client_id: str = ""
    has_client_secret: bool = False
    message: str

@router.get("/google-oauth", response_model=GoogleOAuthStatusResponse)
def get_google_oauth_status():
    from app.config import get_google_client_id, get_google_client_secret
    client_id = get_google_client_id()
    client_secret = get_google_client_secret()
    is_configured = bool(client_id and len(client_id.strip()) > 5)
    return GoogleOAuthStatusResponse(
        google_oauth_configured=is_configured,
        client_id=client_id if is_configured else "",
        has_client_secret=bool(client_secret),
        message="Google OAuth 2.0 Web Client credentials active." if is_configured else "Google OAuth credentials not configured in .env. Interactive demo accounts active."
    )

@router.post("/google-oauth", response_model=GoogleOAuthStatusResponse)
def configure_google_oauth(req: GoogleOAuthRequest):
    from app.config import set_google_oauth_credentials
    cid = req.client_id.strip()
    csecret = (req.client_secret or "").strip()
    set_google_oauth_credentials(cid, csecret)
    return GoogleOAuthStatusResponse(
        google_oauth_configured=True,
        client_id=cid,
        has_client_secret=bool(csecret),
        message="Google OAuth 2.0 credentials saved and activated successfully."
    )

@router.delete("/google-oauth", response_model=GoogleOAuthStatusResponse)
def remove_google_oauth():
    from app.config import set_google_oauth_credentials
    set_google_oauth_credentials("", "")
    return GoogleOAuthStatusResponse(
        google_oauth_configured=False,
        client_id="",
        has_client_secret=False,
        message="Google OAuth credentials removed. Reverted to interactive demo mode."
    )

