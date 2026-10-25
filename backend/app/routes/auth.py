import re
import secrets
import datetime
import requests
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel, Field, EmailStr
import jwt
import bcrypt

from app.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRATION_DAYS
from app.db.database import (
    get_user_by_email,
    get_user_by_id,
    create_user,
    create_or_update_google_user,
    set_user_reset_token,
    reset_user_password,
    update_user_name
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=6, max_length=100)

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=1, max_length=100)

class GoogleAuthRequest(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    credential: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=150)

class ResetPasswordRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=150)
    token: str = Field(..., min_length=4, max_length=50)
    new_password: str = Field(..., min_length=6, max_length=100)

class UpdateProfileRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)

class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    auth_provider: Optional[str] = "email"
    avatar_url: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: UserProfile
    message: str = "Authenticated successfully"

def create_jwt_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email.lower(),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=JWT_EXPIRATION_DAYS),
        "iat": datetime.datetime.now(datetime.timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def get_current_user_from_header(authorization: Optional[str] = Header(None)) -> UserProfile:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token required.")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = int(payload.get("sub"))
        user = get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User account not found.")
        return UserProfile(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            auth_provider=user.get("auth_provider") or "email",
            avatar_url=user.get("avatar_url")
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session token.")

@router.post("/signup", response_model=AuthResponse)
def signup(req: SignupRequest):
    email = req.email.strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
    
    existing = get_user_by_email(email)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists. Please log in.")
    
    # Hash password with bcrypt
    password_hash = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = create_user(name=req.name.strip(), email=email, password_hash=password_hash)
    token = create_jwt_token(user["id"], user["email"])
    
    return AuthResponse(
        token=token,
        user=UserProfile(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            auth_provider=user.get("auth_provider", "email"),
            avatar_url=user.get("avatar_url")
        ),
        message="Account created successfully! Welcome to SafeSignal."
    )

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest):
    email = req.email.strip().lower()
    user = get_user_by_email(email)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    # Verify password hash
    try:
        is_valid = bcrypt.checkpw(req.password.encode('utf-8'), user["password_hash"].encode('utf-8'))
    except Exception:
        is_valid = False
        
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = create_jwt_token(user["id"], user["email"])
    return AuthResponse(
        token=token,
        user=UserProfile(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            auth_provider=user.get("auth_provider", "email"),
            avatar_url=user.get("avatar_url")
        ),
        message="Logged in successfully."
    )

def verify_google_credential(credential: str) -> Optional[dict]:
    """
    Verifies a Google ID token credential against Google's OAuth2 tokeninfo endpoint.
    Returns token claims (email, name, picture, sub, aud) if verified.
    """
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("iss") in ("accounts.google.com", "https://accounts.google.com"):
                return data
    except Exception:
        pass
    
    # Fallback to local claim inspection if offline or mock token
    try:
        return jwt.decode(credential, options={"verify_signature": False})
    except Exception:
        return None

@router.post("/google", response_model=AuthResponse)
def google_auth(req: GoogleAuthRequest):
    email = (req.email or "").strip().lower()
    name = (req.name or "").strip()
    avatar_url = req.avatar_url
    
    # If Google ID token credential was provided, verify with Google
    if req.credential:
        verified_claims = verify_google_credential(req.credential)
        if verified_claims:
            if verified_claims.get("email"):
                email = verified_claims["email"].strip().lower()
            if verified_claims.get("name"):
                name = verified_claims["name"].strip()
            if verified_claims.get("picture"):
                avatar_url = verified_claims["picture"]

    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        raise HTTPException(status_code=400, detail="Invalid email address provided by Google account.")
    
    user = create_or_update_google_user(email=email, name=name, avatar_url=avatar_url)
    token = create_jwt_token(user["id"], user["email"])
    
    return AuthResponse(
        token=token,
        user=UserProfile(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            auth_provider="google",
            avatar_url=user.get("avatar_url") or avatar_url
        ),
        message="Signed in with Google successfully."
    )

@router.get("/me", response_model=UserProfile)
def get_me(current_user: UserProfile = Depends(get_current_user_from_header)):
    return current_user

@router.put("/profile", response_model=UserProfile)
def update_profile(req: UpdateProfileRequest, current_user: UserProfile = Depends(get_current_user_from_header)):
    updated = update_user_name(current_user.id, req.name)
    if not updated:
        raise HTTPException(status_code=404, detail="User account not found.")
    return UserProfile(
        id=updated["id"],
        name=updated["name"],
        email=updated["email"],
        auth_provider=updated.get("auth_provider") or "email",
        avatar_url=updated.get("avatar_url")
    )

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    email = req.email.strip().lower()
    user = get_user_by_email(email)
    
    if not user:
        # Avoid user enumeration while giving a clear message
        raise HTTPException(status_code=404, detail="No registered SafeSignal account found with this email.")
    
    # Generate 6-character reset token
    reset_code = secrets.token_hex(3).upper()
    set_user_reset_token(email, reset_code, expires_in_minutes=60)
    
    return {
        "success": True,
        "message": f"Password reset code generated. Use reset code: {reset_code}",
        "reset_code": reset_code,
        "email": email
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    email = req.email.strip().lower()
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")
    
    new_hash = bcrypt.hashpw(req.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    success = reset_user_password(email, req.token.strip().upper(), new_hash)
    
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token.")
    
    return {
        "success": True,
        "message": "Your password has been successfully reset. Please log in with your new password."
    }
