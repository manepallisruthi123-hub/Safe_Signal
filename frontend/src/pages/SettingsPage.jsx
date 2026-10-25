import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Lock,
  Globe,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  ExternalLink,
  Loader2,
  Key,
  User,
  UserCheck,
  Mail,
  KeyRound,
  Edit3,
  CheckCircle2,
  LogOut,
  Save,
  X,
  Shield
} from "lucide-react";
import { storage } from "../services/storage";
import { api } from "../services/api";
import { auth } from "../services/auth";

export function SettingsPage({ user, onLogout, onDataReset, onUserUpdated }) {
  const [currentUser, setCurrentUser] = useState(user || auth.getCurrentUser());
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [nameFeedback, setNameFeedback] = useState({ type: "", text: "" });

  // Password update state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState({ type: "", text: "" });

  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      setNameInput(user.name || "");
    } else {
      const stored = auth.getCurrentUser();
      if (stored) {
        setCurrentUser(stored);
        setNameInput(stored.name || "");
      }
    }
  }, [user]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setSavingName(true);
    setNameFeedback({ type: "", text: "" });

    const res = await auth.updateProfile(nameInput.trim());
    setSavingName(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setEditingName(false);
      setNameFeedback({ type: "success", text: "Display name updated successfully!" });
      if (onUserUpdated) onUserUpdated(res.user);
      setTimeout(() => setNameFeedback({ type: "", text: "" }), 3000);
    } else {
      setNameFeedback({ type: "error", text: res.error || "Failed to update name." });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordFeedback({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: "error", text: "Passwords do not match." });
      return;
    }

    if (!currentUser?.email) {
      setPasswordFeedback({ type: "error", text: "No active user email found." });
      return;
    }

    setUpdatingPassword(true);
    setPasswordFeedback({ type: "", text: "" });

    const forgotRes = await auth.forgotPassword(currentUser.email);
    if (forgotRes.success && forgotRes.resetCode) {
      const resetRes = await auth.resetPassword(currentUser.email, forgotRes.resetCode, newPassword);
      setUpdatingPassword(false);
      if (resetRes.success) {
        setPasswordFeedback({ type: "success", text: "Password updated successfully!" });
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setShowPasswordSection(false);
          setPasswordFeedback({ type: "", text: "" });
        }, 3000);
      } else {
        setPasswordFeedback({ type: "error", text: resetRes.error || "Password update failed." });
      }
    } else {
      setUpdatingPassword(false);
      setPasswordFeedback({ type: "error", text: forgotRes.error || "Failed to update password." });
    }
  };

  const handleResetData = () => {
    storage.resetAllData();
    setResetConfirm(false);
    if (onDataReset) onDataReset();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm">
        <div className="flex items-center space-x-2 text-plum-700 mb-1">
          <Settings className="w-5 h-5 text-plum-700" />
          <h2 className="text-xl font-extrabold text-plum-950">Settings & Account Privacy</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-xl">
          Manage your verified account credentials, profile settings, AI intelligence preferences, and privacy safeguards.
        </p>
      </div>

      {/* USER DETAILS & ACCOUNT PROFILE CARD */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-plum-700 to-plum-950 text-white flex items-center justify-center shadow-soft-sm">
              <UserCheck className="w-4 h-4 text-lavender-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-plum-950">User Profile & Account Details</h3>
              <p className="text-[11px] text-slate-500">Your authenticated SafeSignal identity and security credentials</p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active Session</span>
          </span>
        </div>

        {/* User Card Layout */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-subtle border border-surface-border">
          <div className="flex items-center space-x-4">
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-plum-300 shadow-soft"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-plum-700 to-plum-950 text-white flex items-center justify-center font-black text-xl shadow-soft">
                {getInitials(currentUser?.name)}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-extrabold text-base text-plum-950">
                  {currentUser?.name || "Safety Ally"}
                </h4>
                {currentUser?.auth_provider === "google" ? (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    <span>Google Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-lavender-100 text-plum-800 border border-lavender-200 text-[10px] font-bold">
                    <span>Email & Password</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser?.email || "user@safesignal.app"}</span>
              </p>
              <div className="text-[11px] text-slate-400">
                User UID: <code className="bg-white px-1.5 py-0.2 rounded border border-surface-border font-mono font-bold text-plum-900">#SAFE-{currentUser?.id || "001"}</code>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            {!editingName && (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="flex-1 md:flex-initial px-3.5 py-2 text-xs font-bold text-plum-900 bg-white hover:bg-lavender-50 border border-lavender-200 rounded-xl transition-all shadow-soft-sm flex items-center justify-center space-x-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-plum-700" />
                <span>Edit Name</span>
              </button>
            )}

            {currentUser?.auth_provider !== "google" && !showPasswordSection && (
              <button
                type="button"
                onClick={() => setShowPasswordSection(true)}
                className="flex-1 md:flex-initial px-3.5 py-2 text-xs font-bold text-plum-900 bg-white hover:bg-lavender-50 border border-lavender-200 rounded-xl transition-all shadow-soft-sm flex items-center justify-center space-x-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-plum-700" />
                <span>Change Password</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 md:flex-initial px-3.5 py-2 text-xs font-bold text-coral-700 bg-coral-50 hover:bg-coral-100 border border-coral-200 rounded-xl transition-all shadow-soft-sm flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-coral-600" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit Name Form */}
        {editingName && (
          <form onSubmit={handleUpdateName} className="p-4 rounded-2xl bg-lavender-50/50 border border-lavender-200 space-y-3">
            <h5 className="text-xs font-bold text-plum-950 flex items-center space-x-1.5">
              <Edit3 className="w-3.5 h-3.5 text-plum-700" />
              <span>Update Display Name</span>
            </h5>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your full name"
                className="flex-1 text-xs bg-white border border-surface-border rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-plum-400"
              />
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={savingName || !nameInput.trim()}
                  className="px-4 py-2 bg-plum-800 hover:bg-plum-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                >
                  {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(currentUser?.name || "");
                    setEditingName(false);
                  }}
                  className="px-3 py-2 bg-white text-slate-600 hover:bg-surface-subtle border border-surface-border rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
            {nameFeedback.text && (
              <p className={`text-xs ${nameFeedback.type === "success" ? "text-emerald-700" : "text-coral-700"}`}>
                {nameFeedback.text}
              </p>
            )}
          </form>
        )}

        {/* Change Password Form */}
        {showPasswordSection && (
          <form onSubmit={handleChangePassword} className="p-4 rounded-2xl bg-lavender-50/50 border border-lavender-200 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-plum-950 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-plum-700" />
                <span>Update Account Password</span>
              </h5>
              <button
                type="button"
                onClick={() => setShowPasswordSection(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full text-xs bg-white border border-surface-border rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-plum-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full text-xs bg-white border border-surface-border rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-plum-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="submit"
                disabled={updatingPassword || !newPassword || !confirmPassword}
                className="px-4 py-2 bg-plum-800 hover:bg-plum-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
              >
                {updatingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                <span>Update Password</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordSection(false)}
                className="px-3 py-2 bg-white text-slate-600 hover:bg-surface-subtle border border-surface-border rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            {passwordFeedback.text && (
              <p className={`text-xs ${passwordFeedback.type === "success" ? "text-emerald-700" : "text-coral-700"}`}>
                {passwordFeedback.text}
              </p>
            )}
          </form>
        )}

        {/* Security Summary Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border space-y-1">
            <div className="font-bold text-slate-700 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-plum-700" />
              <span>Password Security</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {currentUser?.auth_provider === "google" ? "Managed securely by Google OAuth 2.0" : "Hashed with bcrypt (salted rounds)"}
            </p>
          </div>

          <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border space-y-1">
            <div className="font-bold text-slate-700 flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-plum-700" />
              <span>Session Type</span>
            </div>
            <p className="text-[11px] text-slate-500">Persistent JWT Authentication with auto-renewal</p>
          </div>

          <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border space-y-1">
            <div className="font-bold text-slate-700 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Isolation</span>
            </div>
            <p className="text-[11px] text-slate-500">Private account-scoped encryption & isolation</p>
          </div>
        </div>
      </div>

      {/* Privacy Notice Card */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-surface-border pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-sm text-plum-950">SafeSignal Privacy Architecture Notice</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="p-3.5 bg-surface-subtle rounded-2xl border border-surface-border space-y-1">
            <span className="font-bold text-slate-800 block">1. Geolocation On-Demand Only:</span>
            <p>
              SafeSignal does NOT run background GPS tracking. Coordinates are requested strictly when you trigger the SOS button or explicitly initiate a tracked journey. If location access is denied, emergency messages are still dispatched.
            </p>
          </div>

          <div className="p-3.5 bg-surface-subtle rounded-2xl border border-surface-border space-y-1">
            <span className="font-bold text-slate-800 block">2. Zero Sensitive Media Storage:</span>
            <p>
              Under no circumstances does SafeSignal upload, retain, or share private intimate photos. We integrate with client-side hashing standards (such as StopNCII.org) to prevent viral circulation without exposing raw image data.
            </p>
          </div>

          <div className="p-3.5 bg-surface-subtle rounded-2xl border border-surface-border space-y-1">
            <span className="font-bold text-slate-800 block">3. User Isolation & Local Encryption:</span>
            <p>
              All emergency contacts, journey records, and safety action plans are strictly partitioned by authenticated user ID. No advertising trackers or data brokers are integrated.
            </p>
          </div>
        </div>
      </div>

      {/* Data Purge / Reset */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
        <div className="flex items-center space-x-2 text-coral-600">
          <Trash2 className="w-5 h-5" />
          <h3 className="font-extrabold text-sm text-slate-900">Clear Incident History & Data</h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Clear all stored journey records, contact modifications, and saved case reports for the current account.
        </p>

        {resetConfirm ? (
          <div className="p-4 bg-coral-50 border border-coral-200 rounded-2xl space-y-3">
            <p className="text-xs font-bold text-coral-800">
              Are you sure? This will permanently delete your stored journeys, contacts, and saved harassment analysis reports.
            </p>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetData}
                className="py-2 px-4 bg-coral-600 hover:bg-coral-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Yes, Clear All Data
              </button>
              <button
                type="button"
                onClick={() => setResetConfirm(false)}
                className="py-2 px-4 bg-white text-slate-700 border border-surface-border rounded-xl text-xs font-semibold hover:bg-surface-subtle transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setResetConfirm(true)}
            className="py-2.5 px-4 bg-surface-subtle hover:bg-coral-50 text-coral-700 border border-surface-border hover:border-coral-300 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Account Incident History</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-slate-400 space-y-1">
        <div className="font-semibold text-slate-600">SafeSignal — Unified AI Women's Safety Platform</div>
        <div>Engineered for physical defense, cyber harassment protection, and instant emergency response.</div>
      </div>

    </div>
  );
}

export default SettingsPage;