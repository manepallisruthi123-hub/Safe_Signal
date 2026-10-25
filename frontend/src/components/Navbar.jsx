import React from "react";
import { Shield, AlertCircle, Menu, X, PhoneCall, LogOut, UserCheck } from "lucide-react";

export function Navbar({ onOpenSOS, mobileOpen, setMobileOpen, backendStatus, user, onLogout, onLogin, onNavigate, currentTab }) {
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-plum-900 hover:bg-lavender-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate(user && currentTab === "landing" ? "dashboard" : "landing");
              }
            }}
            className="flex items-center space-x-2.5 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-plum-700 to-plum-950 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-lavender-300 fill-lavender-400/20" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-plum-950">Safe<span className="text-coral-500">Signal</span></span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-lavender-100 text-plum-800 border border-lavender-200">
                  recHERsion'26
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium">Unified AI Women's Safety Platform</p>
            </div>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Quick Helplines link */}
          <a
            href="tel:112"
            className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-coral-700 bg-coral-50 hover:bg-coral-100 border border-coral-200 rounded-lg transition-colors"
            title="National Police Emergency Helpline"
          >
            <PhoneCall className="w-3.5 h-3.5 text-coral-600 animate-pulse" />
            <span>Emergency: 112</span>
          </a>

          {/* Backend / Status Indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 text-xs rounded-full bg-surface-subtle border border-surface-border text-slate-600">
            <span className={`w-2 h-2 rounded-full ${backendStatus === "online" ? "bg-emerald-500 animate-pulse" : "bg-emerald-400"}`}></span>
            <span className="font-medium">{backendStatus === "online" ? "FastAPI Live" : "Platform Active"}</span>
          </div>

          {/* Prominent SOS Trigger */}
          <button
            type="button"
            onClick={onOpenSOS}
            className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-coral-glow hover:shadow-lg transition-all active:scale-95"
          >
            <AlertCircle className="w-4 h-4 fill-white text-coral-600 animate-bounce" />
            <span>SOS</span>
          </button>

          {/* User Profile Pill & Logout Button OR Sign In Button */}
          {user ? (
            <div className="flex items-center space-x-1.5 pl-1 sm:pl-2 border-l border-surface-border">
              {currentTab === "landing" && onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate("dashboard")}
                  className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-plum-900 bg-lavender-100 hover:bg-lavender-200 border border-lavender-200 rounded-xl transition-colors shadow-soft-sm mr-1"
                >
                  <span>Go to App →</span>
                </button>
              )}

              <div 
                className="flex items-center space-x-2 px-2.5 py-1 rounded-xl bg-lavender-50 border border-lavender-200 text-xs"
                title={`Signed in as ${user.name} (${user.email})${user.auth_provider === 'google' ? ' via Google' : ''}`}
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-6 h-6 rounded-lg object-cover ring-1 ring-plum-300" />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-plum-800 text-white font-bold text-[10px] flex items-center justify-center">
                    {getInitials(user.name)}
                  </div>
                )}
                <span className="hidden md:inline font-bold text-plum-950 max-w-[100px] truncate">
                  {user.name.split(" ")[0]}
                </span>
                {user.auth_provider === "google" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Google Verified" />
                )}
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-coral-600 hover:bg-coral-50 rounded-xl transition-colors"
                title="Log Out of SafeSignal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-plum-900 bg-lavender-100 hover:bg-lavender-200 border border-lavender-200 rounded-xl shadow-soft-sm transition-all active:scale-95 ml-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-plum-700" />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>

      {/* Mobile Drawer when on Landing Page */}
      {mobileOpen && currentTab === "landing" && (
        <div className="md:hidden border-t border-surface-border bg-white px-4 pt-3 pb-5 space-y-3 shadow-soft-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                if (onNavigate) {
                  onNavigate(user ? "dashboard" : "auth");
                }
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-plum-700 to-plum-900 text-white rounded-xl text-xs font-bold text-center shadow-soft active:scale-95 transition-all"
            >
              {user ? "Open SafeSignal Dashboard →" : "Sign In to SafeSignal →"}
            </button>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <a
                href="tel:112"
                className="p-2 rounded-xl bg-coral-50 border border-coral-200 text-coral-700 text-[11px] font-bold flex flex-col items-center justify-center space-y-0.5 active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5 text-coral-600" />
                <span>112 Police</span>
              </a>
              <a
                href="tel:181"
                className="p-2 rounded-xl bg-plum-50 border border-plum-200 text-plum-700 text-[11px] font-bold flex flex-col items-center justify-center space-y-0.5 active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5 text-plum-600" />
                <span>181 Women</span>
              </a>
              <a
                href="tel:1930"
                className="p-2 rounded-xl bg-lavender-50 border border-lavender-200 text-plum-900 text-[11px] font-bold flex flex-col items-center justify-center space-y-0.5 active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5 text-plum-700" />
                <span>1930 Cyber</span>
              </a>
            </div>

            {user && (
              <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  Signed in as <strong className="text-plum-900">{user.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onLogout();
                  }}
                  className="font-bold text-coral-600 hover:text-coral-700"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
