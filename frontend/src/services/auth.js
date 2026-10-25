import { storage } from "./storage";

const TOKEN_KEY = "safesignal_auth_token";
const USER_KEY = "safesignal_auth_user";

const getBackendUrl = () => {
  const saved = storage.getSettings()?.backendUrl;
  if (saved && saved.trim()) return saved;
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
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
    try {
      const payload = {};
      if (email) payload.email = email;
      if (name) payload.name = name;
      if (avatarUrl) payload.avatar_url = avatarUrl;
      if (credential) payload.credential = credential;

      const res = await fetch(`${getBackendUrl()}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000)
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || "Google authentication failed." };
      }

      this.setToken(data.token);
      this.setCurrentUser(data.user);
      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      return { success: false, error: "Network error connecting to auth server." };
    }
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
