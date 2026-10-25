import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  KeyRound,
  X
} from "lucide-react";
import { auth } from "../services/auth";
import { api } from "../services/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "981900039921-edrnhf4voup6fpc37n2db5ko2bmssot7.apps.googleusercontent.com";

export function AuthPage({ onAuthSuccess, onBrowsePublic }) {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot" | "reset"
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Google sign in states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [generatedResetCode, setGeneratedResetCode] = useState("");

  const resetFormState = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setGeneratedResetCode("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetFormState();
  };

  // Real Google credential handler
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    setGoogleLoading(true);
    setErrorMessage("");
    try {
      const result = await auth.loginWithGoogle({ credential: response.credential });
      setGoogleLoading(false);
      if (result.success) {
        onAuthSuccess(result.user);
      } else {
        setErrorMessage(result.error || "Google authentication failed. Please try again.");
      }
    } catch (err) {
      setGoogleLoading(false);
      setErrorMessage("Network error during Google sign in.");
    }
  };

  // Initialize official Google Identity Services
  useEffect(() => {
    let timer;
    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        setGoogleLoaded(true);
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          // Render official Google button into active view
          const containerId = mode === "login" ? "googleBtnLogin" : "googleBtnSignup";
          const el = document.getElementById(containerId);
          if (el) {
            el.innerHTML = "";
            window.google.accounts.id.renderButton(el, {
              type: "standard",
              theme: "outline",
              size: "large",
              text: mode === "login" ? "continue_with" : "signup_with",
              shape: "rectangular",
              logo_alignment: "left",
              width: 320
            });
          }

          // Trigger One Tap popup for real Google accounts
          window.google.accounts.id.prompt();
        } catch (err) {
          console.warn("Google initialization notice:", err);
        }
      } else {
        timer = setTimeout(initGoogle, 300);
      }
    };

    initGoogle();
    return () => clearTimeout(timer);
  }, [mode]);

  const handleGoogleSignInClick = () => {
    resetFormState();
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // 1. Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    resetFormState();

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const result = await auth.login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      onAuthSuccess(result.user);
    } else {
      setErrorMessage(result.error || "Invalid email or password.");
    }
  };

  // 2. Handle Sign Up
  const handleSignup = async (e) => {
    e.preventDefault();
    resetFormState();

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    const result = await auth.signup(name.trim(), email.trim(), password);
    setLoading(false);

    if (result.success) {
      onAuthSuccess(result.user);
    } else {
      setErrorMessage(result.error || "Failed to create account. Please try again.");
    }
  };

  // 3. Handle Forgot Password Request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    resetFormState();

    if (!email.trim()) {
      setErrorMessage("Please enter the email address linked to your SafeSignal account.");
      return;
    }

    setLoading(true);
    const result = await auth.forgotPassword(email.trim());
    setLoading(false);

    if (result.success) {
      setSuccessMessage("Password reset code generated successfully.");
      if (result.resetCode) {
        setGeneratedResetCode(result.resetCode);
        setResetToken(result.resetCode);
      }
      setMode("reset");
    } else {
      setErrorMessage(result.error || "No account found with this email.");
    }
  };

  // 4. Handle Password Reset Submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetFormState();

    if (!resetToken.trim()) {
      setErrorMessage("Please enter the reset code.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const result = await auth.resetPassword(email.trim(), resetToken.trim(), newPassword);
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || "Password updated! You can now log in.");
      setPassword("");
      setTimeout(() => switchMode("login"), 2500);
    } else {
      setErrorMessage(result.error || "Invalid or expired reset code.");
    }
  };

  // Quick fill for hackathon demo testing
  const handleDemoPooja = () => {
    setEmail("pooja.sharma@safesignal.app");
    setPassword("PoojaSafe2026!");
    resetFormState();
  };

  const handleDemoSignupQuick = () => {
    setName("Ananya Deshmukh");
    setEmail("ananya.d@safesignal.app");
    setPassword("AnanyaSafe2026!");
    setConfirmPassword("AnanyaSafe2026!");
    resetFormState();
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-lavender-200 selection:text-plum-900">
      
      {/* Background ambient gradient */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-lavender-100/50 via-surface to-plum-50/30 -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        {/* SafeSignal Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-plum-700 to-plum-950 text-white shadow-soft mx-auto">
          <Shield className="w-8 h-8 text-lavender-300 fill-lavender-400/20" />
        </div>

        <div>
          <h1 className="text-3xl font-black text-plum-950 tracking-tight">
            Safe<span className="text-coral-500">Signal</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Unified AI Women's Safety Platform • recHERsion'26
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-soft-lg sm:rounded-3xl border border-surface-border space-y-6">
          
          {/* Form Header */}
          <div className="border-b border-surface-border pb-4 text-center">
            <h2 className="text-lg font-extrabold text-plum-950">
              {mode === "login" && "Sign In to SafeSignal"}
              {mode === "signup" && "Create Your Safety Account"}
              {mode === "forgot" && "Recover Your Account"}
              {mode === "reset" && "Set New Secure Password"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === "login" && "Access your personalized safe journeys, trusted allies, and evidence records."}
              {mode === "signup" && "Join SafeSignal for integrated physical & digital threat defense."}
              {mode === "forgot" && "Enter your email to receive a secure password reset code."}
              {mode === "reset" && "Enter the reset code and choose a new password."}
            </p>
          </div>

          {/* Error & Success Alerts */}
          {errorMessage && (
            <div className="p-3.5 bg-coral-50 border border-coral-200 rounded-xl text-xs text-coral-800 flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-coral-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span>{successMessage}</span>
                {generatedResetCode && (
                  <div className="mt-1 font-mono font-bold bg-white/70 px-2 py-0.5 rounded text-emerald-900 border border-emerald-300">
                    Reset Code: {generatedResetCode}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === "login" && (
            <div className="space-y-4">
              {/* Google Sign In Container */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div id="googleBtnLogin" className="w-full flex justify-center min-h-[44px]" />
                {!googleLoaded && (
                  <button
                    type="button"
                    onClick={handleGoogleSignInClick}
                    disabled={loading || googleLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all flex items-center justify-center space-x-3 group"
                  >
                    <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{googleLoading ? "Signing in with Google..." : "Continue with Google"}</span>
                  </button>
                )}
                {googleLoading && (
                  <p className="text-[11px] text-plum-700 font-semibold flex items-center space-x-1 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Signing in with Google...</span>
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-white px-2.5 text-slate-400">or sign in with email</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl pl-10 pr-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-[11px] font-bold text-plum-700 hover:text-plum-900 underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl pl-10 pr-10 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-plum-800 to-plum-950 hover:from-plum-900 hover:to-black disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-soft transition-all flex items-center justify-center space-x-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
              </button>
            </form>
          </div>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === "signup" && (
            <div className="space-y-4">
              {/* Google Sign Up Container */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <div id="googleBtnSignup" className="w-full flex justify-center min-h-[44px]" />
                {!googleLoaded && (
                  <button
                    type="button"
                    onClick={handleGoogleSignInClick}
                    disabled={loading || googleLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all flex items-center justify-center space-x-3 group"
                  >
                    <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{googleLoading ? "Signing in with Google..." : "Sign up with Google"}</span>
                  </button>
                )}
                {googleLoading && (
                  <p className="text-[11px] text-plum-700 font-semibold flex items-center space-x-1 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Signing in with Google...</span>
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-white px-2.5 text-slate-400">or register with email</span>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl pl-10 pr-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="pooja@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl pl-10 pr-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Create Password (min 6 characters) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Choose secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl pl-10 pr-10 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl pl-10 pr-10 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-plum-800 to-plum-950 hover:from-plum-900 hover:to-black disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-soft transition-all flex items-center justify-center space-x-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? "Creating Account..." : "Create SafeSignal Account"}</span>
              </button>
            </form>
          </div>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Registered Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl pl-10 pr-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-plum-800 hover:bg-plum-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>{loading ? "Generating Code..." : "Send Reset Code"}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-xs font-bold text-plum-700 hover:text-plum-900"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* 4. RESET PASSWORD FORM */}
          {mode === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full text-xs bg-slate-100 border border-surface-border rounded-xl px-3.5 py-2.5 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Reset Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4F2A9C"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full text-xs font-mono uppercase bg-surface-subtle border border-surface-border rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password (min 6 characters) *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-plum-800 hover:bg-plum-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                <span>{loading ? "Updating Password..." : "Update Password & Log In"}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-xs font-bold text-plum-700 hover:text-plum-900"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* Mode Switch Footer */}
          <div className="pt-2 text-center text-xs text-slate-600">
            {mode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-bold text-plum-700 hover:text-plum-950 underline"
                >
                  Sign up for SafeSignal
                </button>
              </p>
            ) : mode === "signup" ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-bold text-plum-700 hover:text-plum-950 underline"
                >
                  Sign in
                </button>
              </p>
            ) : null}
          </div>

        </div>

        {/* Public mission browse link */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={onBrowsePublic}
            className="text-xs font-semibold text-slate-500 hover:text-plum-900 inline-flex items-center space-x-1 transition-colors"
          >
            <span>Learn more about SafeSignal's mission & helplines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
