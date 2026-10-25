import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file from backend or root
env_path = BASE_DIR / ".env"
if not env_path.exists():
    env_path = BASE_DIR.parent / ".env"

load_dotenv(dotenv_path=env_path)

# Knowledge base locations
KNOWLEDGE_BASE_DIRS = [
    BASE_DIR / "knowledge_base",
    BASE_DIR.parent / "knowledge_base"
]

PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# CORS Origins
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,*"
).split(",")

# Runtime key store
_RUNTIME_GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")

def get_gemini_api_key() -> str:
    global _RUNTIME_GEMINI_KEY
    return os.getenv("GEMINI_API_KEY", "") or _RUNTIME_GEMINI_KEY

def set_gemini_api_key(key: str) -> None:
    global _RUNTIME_GEMINI_KEY
    _RUNTIME_GEMINI_KEY = key
    os.environ["GEMINI_API_KEY"] = key
    
    # Save to backend/.env
    target_env = BASE_DIR / ".env"
    try:
        lines = []
        if target_env.exists():
            with open(target_env, "r", encoding="utf-8") as f:
                lines = f.readlines()
        
        found = False
        new_lines = []
        for line in lines:
            if line.startswith("GEMINI_API_KEY="):
                new_lines.append(f"GEMINI_API_KEY={key}\n")
                found = True
            else:
                new_lines.append(line)
        if not found:
            new_lines.append(f"GEMINI_API_KEY={key}\n")
            
        with open(target_env, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as e:
        print(f"Warning: Could not write to .env file: {e}")

GEMINI_API_KEY = get_gemini_api_key()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# JWT Security Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "safesignal-secure-jwt-secret-key-rechersion26-token")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

# Google OAuth 2.0 Configuration
_RUNTIME_GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
_RUNTIME_GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

def get_google_client_id() -> str:
    global _RUNTIME_GOOGLE_CLIENT_ID
    return os.getenv("GOOGLE_CLIENT_ID", "") or _RUNTIME_GOOGLE_CLIENT_ID

def get_google_client_secret() -> str:
    global _RUNTIME_GOOGLE_CLIENT_SECRET
    return os.getenv("GOOGLE_CLIENT_SECRET", "") or _RUNTIME_GOOGLE_CLIENT_SECRET

def set_google_oauth_credentials(client_id: str, client_secret: str = "") -> None:
    global _RUNTIME_GOOGLE_CLIENT_ID, _RUNTIME_GOOGLE_CLIENT_SECRET
    _RUNTIME_GOOGLE_CLIENT_ID = client_id.strip()
    _RUNTIME_GOOGLE_CLIENT_SECRET = client_secret.strip()
    os.environ["GOOGLE_CLIENT_ID"] = _RUNTIME_GOOGLE_CLIENT_ID
    os.environ["GOOGLE_CLIENT_SECRET"] = _RUNTIME_GOOGLE_CLIENT_SECRET
    
    target_env = BASE_DIR / ".env"
    try:
        lines = []
        if target_env.exists():
            with open(target_env, "r", encoding="utf-8") as f:
                lines = f.readlines()
        
        found_id = False
        found_secret = False
        new_lines = []
        for line in lines:
            if line.startswith("GOOGLE_CLIENT_ID="):
                new_lines.append(f"GOOGLE_CLIENT_ID={_RUNTIME_GOOGLE_CLIENT_ID}\n")
                found_id = True
            elif line.startswith("GOOGLE_CLIENT_SECRET="):
                new_lines.append(f"GOOGLE_CLIENT_SECRET={_RUNTIME_GOOGLE_CLIENT_SECRET}\n")
                found_secret = True
            else:
                new_lines.append(line)
        if not found_id:
            new_lines.append(f"GOOGLE_CLIENT_ID={_RUNTIME_GOOGLE_CLIENT_ID}\n")
        if not found_secret:
            new_lines.append(f"GOOGLE_CLIENT_SECRET={_RUNTIME_GOOGLE_CLIENT_SECRET}\n")
            
        with open(target_env, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as e:
        print(f"Warning: Could not write Google credentials to .env file: {e}")

GOOGLE_CLIENT_ID = get_google_client_id()
GOOGLE_CLIENT_SECRET = get_google_client_secret()

# Embedding Model
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
