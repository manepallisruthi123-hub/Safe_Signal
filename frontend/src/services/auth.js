import { storage } from "./storage";

const TOKEN_KEY = "safesignal_auth_token";
const USER_KEY = "safesignal_auth_user";

const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, "");
  const saved = storage.getSettings()?.backendUrl;
  if (saved && saved.trim()) return saved.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(window.location.hostname)) {
      return `http://${window.location.hostname}:8000`;
    }
    // Deployed domain (e.g. Vercel) with no backend configured yet
    return "";
  }
  return "http://localhost:8000";
};

// Decode standard Google Identity JWT on client
const decodeGoogleJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const auth = {
  // Token management
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || null;
  },

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  // User management
  getCurrentUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      // Update storage active user for data isolation
      storage.setActiveUserEmail(user.email);
    } else {
      localStorage.removeItem(USER_KEY);
      storage.setActiveUserEmail(null);
    }
  },

  isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  // Sign up
  async signup(name, email, password) {
    try {
      const res = await fetch(`${getBackendUrl()}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        signal: AbortSignal.timeout(8000)
      });
      
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || "Signup failed. Please try again." };
      }

      this.setToken(data.token);
      this.setCurrentUser(data.user);
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      return { success: false, error: "Network error. Please verify backend is running." };
    }
  },

  // Login
  async login(email, password) {
    try {
      const res = await fetch(`${getBackendUrl()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(8000)
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || "Invalid email or password." };
      }

      this.setToken(data.token);
      this.setCurrentUser(data.user);
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      return { success: false, error: "Network error. Please verify backend is running." };
    }
  },

  // Google sign in / sign up
  async loginWithGoogle({ email, name, avatarUrl, credential }) {
    // 1. If backend URL is available, attempt real server validation first
    const backendUrl = getBackendUrl();
    if (backendUrl) {
      try {
        const payload = {};
        if (email) payload.email = email;
        if (name) payload.name = name;
        if (avatarUrl) payload.avatar_url = avatarUrl;
        if (credential) payload.credential = credential;

        const res = await fetch(`${backendUrl}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(6000)
        });

        if (res.ok) {
          const data = await res.json();
          this.setToken(data.token);
          this.setCurrentUser(data.user);
          return { success: true, user: data.user, token: data.token };
        }
      } catch (err) {
        console.warn("Backend auth call failed, falling back to client-side Google token decode:", err);
      }
    }

    // 2. Client-side fallback: decode real Google JWT token if backend is offline or not yet connected
    if (credential) {
      const decoded = decodeGoogleJwt(credential);
      if (decoded && decoded.email) {
        const localUser = {
          id: decoded.sub || `google_${Date.now()}`,
          email: decoded.email,
          name: decoded.name || decoded.email.split("@")[0],
          avatar_url: decoded.picture || avatarUrl || null,
          auth_provider: "google",
          created_at: new Date().toISOString()
        };
        const token = credential;
        this.setToken(token);
        this.setCurrentUser(localUser);
        return { success: true, user: localUser, token };
      }
    }

    if (email) {
      const fallbackUser = {
        id: `google_${Date.now()}`,
        email,
        name: name || email.split("@")[0],
        avatar_url: avatarUrl || null,
        auth_provider: "google",
        created_at: new Date().toISOString()
      };
      const token = `local_token_${Date.now()}`;
      this.setToken(token);
      this.setCurrentUser(fallbackUser);
      return { success: true, user: fallbackUser, token };
    }

    return { success: false, error: "Could not authenticate with Google." };
  },

  // Verify session (/api/auth/me)
  async getMe() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${getBackendUrl()}/api/auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok) {
        const user = await res.json();
        this.setCurrentUser(user);
        return user;
      } else {
        // Token expired or invalid
        this.logout();
        return null;
      }
    } catch (err) {
      // If backend offline, rely on stored session in demo mode
      return this.getCurrentUser();
    }
  },

  // Update Profile Name
  async updateProfile(name) {
    try {
      const token = this.getToken();
      if (!token) return { success: false, error: "Not authenticated" };

      const res = await fetch(`${getBackendUrl()}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name }),
        signal: AbortSignal.timeout(6000)
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || "Failed to update profile." };
      }

      const currentUser = this.getCurrentUser() || {};
      const updatedUser = { ...currentUser, ...data };
      this.setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err) {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        currentUser.name = name;
        this.setCurrentUser(currentUser);
        return { success: true, user: currentUser };
      }
      return { success: false, error: "Failed to update profile." };
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const res = await fetch(`${getBackendUrl()}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: AbortSignal.timeout(6000)
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || "Password reset request failed." };
      }
      return { success: true, message: data.message, resetCode: data.reset_code };
    } catch (err) {
      return { success: false, error: "Network error. Please verify backend is running." };
    }
  },

  // Reset password
  async resetPassword(email, token, newPassword) {
    try {
      const res = await fetch(`${getBackendUrl()}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, new_password: newPassword }),
        signal: AbortSignal.timeout(6000)
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || "Password reset failed." };
      }
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: "Network error. Please verify backend is running." };
    }
  },

  // Logout
  logout() {
    this.setToken(null);
    this.setCurrentUser(null);
  }
};
