import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()

client = TestClient(app)

def test_auth_signup_flow():
    test_email = "test.pooja@example.com"
    # Signup
    res = client.post("/api/auth/signup", json={
        "name": "Pooja Sharma",
        "email": test_email,
        "password": "Password123!"
    })
    # If already exists from prior run, handle or assert
    if res.status_code == 400 and "already exists" in res.text:
        pass
    else:
        assert res.status_code == 200
        data = res.json()
        assert "token" in data
        assert data["user"]["email"] == test_email
        assert data["user"]["name"] == "Pooja Sharma"

def test_auth_duplicate_signup():
    test_email = "test.duplicate@example.com"
    client.post("/api/auth/signup", json={
        "name": "Duplicate User",
        "email": test_email,
        "password": "Password123!"
    })
    res = client.post("/api/auth/signup", json={
        "name": "Duplicate User",
        "email": test_email,
        "password": "Password123!"
    })
    assert res.status_code == 400
    assert "already exists" in res.text

def test_auth_login_success_and_me():
    test_email = "test.login@example.com"
    client.post("/api/auth/signup", json={
        "name": "Login User",
        "email": test_email,
        "password": "SecretPassword123"
    })
    
    # Login
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "SecretPassword123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    assert len(token) > 20
    
    # Test /api/auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email

def test_auth_login_invalid_password():
    res = client.post("/api/auth/login", json={
        "email": "test.login@example.com",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401
    assert "Invalid email or password" in res.text

def test_auth_me_unauthorized():
    res = client.get("/api/auth/me")
    assert res.status_code == 401

def test_forgot_and_reset_password():
    test_email = "test.reset@example.com"
    client.post("/api/auth/signup", json={
        "name": "Reset User",
        "email": test_email,
        "password": "OldPassword123"
    })
    
    # Request forgot password
    forgot_res = client.post("/api/auth/forgot-password", json={"email": test_email})
    assert forgot_res.status_code == 200
    reset_code = forgot_res.json()["reset_code"]
    assert len(reset_code) > 0
    
    # Reset password
    reset_res = client.post("/api/auth/reset-password", json={
        "email": test_email,
        "token": reset_code,
        "new_password": "BrandNewPassword456"
    })
    assert reset_res.status_code == 200
    
    # Login with new password
    new_login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "BrandNewPassword456"
    })
    assert new_login_res.status_code == 200
    assert "token" in new_login_res.json()

def test_google_auth_flow():
    google_email = "sruthi.google.test@gmail.com"
    google_avatar = "https://example.com/avatar.jpg"
    
    # 1. Sign in with Google (first time user)
    res = client.post("/api/auth/google", json={
        "email": google_email,
        "name": "Sruthi Google",
        "avatar_url": google_avatar
    })
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == google_email
    assert data["user"]["name"] == "Sruthi Google"
    assert data["user"]["auth_provider"] == "google"
    assert data["user"]["avatar_url"] == google_avatar
    token = data["token"]

    # 2. Verify /api/auth/me with Google token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == google_email
    assert me_data["auth_provider"] == "google"
    assert me_data["avatar_url"] == google_avatar

    # 3. Subsequent Google sign in (existing user)
    res_repeat = client.post("/api/auth/google", json={
        "email": google_email,
        "name": "Sruthi Google",
        "avatar_url": google_avatar
    })
    assert res_repeat.status_code == 200
    assert "token" in res_repeat.json()

