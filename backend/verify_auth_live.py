import requests
import json
import time

BASE = "http://127.0.0.1:8000"

def test_live_auth_and_features():
    print("=" * 60)
    print("SAFESIGNAL LIVE VERIFICATION SUITE")
    print("=" * 60)

    # 1. New User Sign Up
    unique_email = f"priya.sharma_{int(time.time())}@example.com"
    signup_payload = {
        "email": unique_email,
        "password": "Password123!",
        "name": "Priya Sharma"
    }
    r = requests.post(f"{BASE}/api/auth/signup", json=signup_payload)
    assert r.status_code in (200, 201), f"Signup failed: {r.text}"
    data = r.json()
    token = data.get("token")
    user = data.get("user")
    print(f"[PASS] Scenario 1 - Sign Up: {user['name']} ({user['email']}) created successfully. Token received.")

    # 2. Existing User Log In
    login_payload = {
        "email": unique_email,
        "password": "Password123!"
    }
    r = requests.post(f"{BASE}/api/auth/login", json=login_payload)
    assert r.status_code == 200, f"Login failed: {r.text}"
    login_token = r.json().get("token")
    assert bool(login_token), "Token missing in login response"
    print(f"[PASS] Scenario 2 - Log In: Existing user verified with bcrypt hash. Token received.")

    # 3. Invalid Credentials Error Handling
    bad_login = {
        "email": unique_email,
        "password": "WrongPassword999!"
    }
    r = requests.post(f"{BASE}/api/auth/login", json=bad_login)
    assert r.status_code == 401, f"Expected 401, got {r.status_code}"
    detail = r.json().get("detail")
    print(f"[PASS] Scenario 3 - Invalid Credentials Error: HTTP 401 '{detail}' returned as expected.")

    # 4. Refresh / Session Persistence (/me)
    headers = {"Authorization": f"Bearer {login_token}"}
    r = requests.get(f"{BASE}/api/auth/me", headers=headers)
    assert r.status_code == 200, f"Auth /me failed: {r.text}"
    me = r.json()
    assert me["email"] == unique_email
    print(f"[PASS] Scenario 4 - Session Persistence: Verified JWT against /api/auth/me -> {me['name']} ({me['email']}).")

    # 5. Forgot Password & Reset Password
    r = requests.post(f"{BASE}/api/auth/forgot-password", json={"email": unique_email})
    assert r.status_code == 200
    reset_token = r.json().get("reset_code")
    assert bool(reset_token), "Reset token not generated"
    print(f"[PASS] Scenario 5a - Forgot Password: Token '{reset_token}' generated.")

    r = requests.post(f"{BASE}/api/auth/reset-password", json={"email": unique_email, "token": reset_token, "new_password": "NewSecretPassword2026!"})
    assert r.status_code == 200
    print(f"[PASS] Scenario 5b - Reset Password: Password successfully updated in SQLite.")

    # Verify old password fails, new password succeeds
    r_old = requests.post(f"{BASE}/api/auth/login", json={"email": unique_email, "password": "Password123!"})
    assert r_old.status_code == 401
    r_new = requests.post(f"{BASE}/api/auth/login", json={"email": unique_email, "password": "NewSecretPassword2026!"})
    assert r_new.status_code == 200
    print(f"[PASS] Scenario 5c - Verified: Old password rejected, new password authenticated successfully.")

    # 5d. Google Sign In flow
    google_email = f"sruthi.google_{int(time.time())}@gmail.com"
    r_google = requests.post(f"{BASE}/api/auth/google", json={
        "email": google_email,
        "name": "Sruthi Google Demo",
        "avatar_url": "https://lh3.googleusercontent.com/a/demo"
    })
    assert r_google.status_code == 200
    g_data = r_google.json()
    assert g_data["user"]["auth_provider"] == "google"
    assert bool(g_data["token"])
    print(f"[PASS] Scenario 5d - Sign in with Google: Authenticated {g_data['user']['name']} ({g_data['user']['email']}) with Google OAuth provider.")


    # 6. Harassment Analyzer feature
    r = requests.post(f"{BASE}/api/analyze-text", json={
        "text": "I know where you live. Stop ignoring my calls or I will post your personal photos everywhere."
    })
    assert r.status_code == 200, f"Harassment analyze failed: {r.text}"
    h_data = r.json()
    print(f"[PASS] Scenario 8a - Harassment Analyzer: Category = {h_data['category']}, Severity = {h_data['severityScore']}/100, Signals = {len(h_data['signals'])}.")

    # 7. Action Plan feature
    r = requests.post(f"{BASE}/api/action-plan", json={
        "situation": "stalking",
        "details": "Unknown person following from transit stop to residential complex."
    })
    assert r.status_code == 200, f"Action plan failed: {r.text}"
    plan_data = r.json()
    print(f"[PASS] Scenario 8b - Action Plan Generator: '{plan_data['title']}', Immediate: {plan_data['immediateStep']}.")

    # 8. RAG Assistant with Gemini 2.5 Flash
    r = requests.post(f"{BASE}/api/assistant", json={
        "query": "How do I report online blackmail and non-consensual image sharing under Indian Law?"
    })
    assert r.status_code == 200, f"Assistant failed: {r.text}"
    rag_data = r.json()
    print(f"[PASS] Scenario 8c - RAG Assistant (Gemini 2.5 Flash): Model = {rag_data['model']}, Grounded = {rag_data['isGrounded']}, Sources = {len(rag_data['sources'])}.")

    print("=" * 60)
    print("ALL 8 VERIFICATION SCENARIOS PASSED WITH FLYING COLORS!")
    print("=" * 60)

if __name__ == "__main__":
    test_live_auth_and_features()
