import os
import sqlite3
import datetime
from pathlib import Path
from typing import Optional, Dict, Any

DB_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "safesignal.db"

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables for SafeSignal users and reset tokens."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            reset_token TEXT,
            reset_token_expires TEXT,
            auth_provider TEXT DEFAULT 'email',
            avatar_url TEXT
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
    
    # Safe migration for existing tables created without new columns
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'email'")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT")
    except Exception:
        pass

    conn.commit()
    conn.close()

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, name, created_at, auth_provider, avatar_url FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def create_user(name: str, email: str, password_hash: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    cursor.execute(
        "INSERT INTO users (name, email, password_hash, created_at, auth_provider) VALUES (?, LOWER(?), ?, ?, 'email')",
        (name.strip(), email.strip(), password_hash, now)
    )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {
        "id": user_id,
        "name": name.strip(),
        "email": email.strip().lower(),
        "created_at": now,
        "auth_provider": "email",
        "avatar_url": None
    }

def create_or_update_google_user(email: str, name: str, avatar_url: Optional[str] = None) -> Dict[str, Any]:
    """Finds existing user by email or creates a new Google authenticated user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    row = cursor.fetchone()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    if row:
        user_dict = dict(row)
        # Update avatar or provider if not set
        updates = []
        params = []
        if avatar_url and user_dict.get("avatar_url") != avatar_url:
            updates.append("avatar_url = ?")
            params.append(avatar_url)
            user_dict["avatar_url"] = avatar_url
        if not user_dict.get("auth_provider"):
            updates.append("auth_provider = 'google'")
            user_dict["auth_provider"] = "google"
        
        if updates:
            params.append(user_dict["id"])
            cursor.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", params)
            conn.commit()
        
        conn.close()
        return user_dict
    else:
        cursor.execute(
            """
            INSERT INTO users (name, email, password_hash, created_at, auth_provider, avatar_url)
            VALUES (?, LOWER(?), ?, ?, 'google', ?)
            """,
            (name.strip(), email.strip(), "oauth:google", now, avatar_url)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return {
            "id": user_id,
            "name": name.strip(),
            "email": email.strip().lower(),
            "created_at": now,
            "auth_provider": "google",
            "avatar_url": avatar_url
        }

def set_user_reset_token(email: str, token: str, expires_in_minutes: int = 60) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    expires_at = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=expires_in_minutes)).isoformat()
    cursor.execute(
        "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE LOWER(email) = LOWER(?)",
        (token, expires_at, email.strip())
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def update_user_name(user_id: int, new_name: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET name = ? WHERE id = ?", (new_name.strip(), user_id))
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)

def reset_user_password(email: str, token: str, new_password_hash: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    cursor.execute(
        """
        UPDATE users 
        SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL 
        WHERE LOWER(email) = LOWER(?) AND reset_token = ? AND reset_token_expires > ?
        """,
        (new_password_hash, email.strip(), token, now)
    )
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0

def update_user_name(user_id: int, new_name: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET name = ? WHERE id = ?", (new_name.strip(), user_id))
    conn.commit()
    conn.close()
    return get_user_by_id(user_id)
