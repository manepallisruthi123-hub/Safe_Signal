import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { SOSModal } from "./components/SOSModal";

import { AuthPage } from "./pages/AuthPage";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JourneyPage } from "./pages/JourneyPage";
import { CyberHarassmentPage } from "./pages/CyberHarassmentPage";
import { DeepfakeSupportPage } from "./pages/DeepfakeSupportPage";
import { AssistantPage } from "./pages/AssistantPage";
import { ActionPlanPage } from "./pages/ActionPlanPage";
import { TrustedContactsPage } from "./pages/TrustedContactsPage";
import { SettingsPage } from "./pages/SettingsPage";

import { api } from "./services/api";
import { auth } from "./services/auth";
import { storage } from "./services/storage";
import { Loader2 } from "lucide-react";

export function App() {
  const [user, setUser] = useState(auth.getCurrentUser());
  const [authChecking, setAuthChecking] = useState(true);
  const [currentTab, setCurrentTab] = useState("landing"); // "landing" opens first! ("landing", "auth", "dashboard", "sos", "journey", "cyber", "deepfake", "assistant", "action-plan", "contacts", "settings")
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  // 1. Initial Session Restoration
  useEffect(() => {
    restoreSession();
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const restoreSession = async () => {
    setAuthChecking(true);
    const existingToken = auth.getToken();
    if (existingToken) {
      const verifiedUser = await auth.getMe();
      if (verifiedUser) {
        setUser(verifiedUser);
        storage.setActiveUserEmail(verifiedUser.email);
      } else {
        setUser(null);
        storage.setActiveUserEmail(null);
      }
    } else {
      setUser(null);
      storage.setActiveUserEmail(null);
    }
    setAuthChecking(false);
  };

  const checkHealth = async () => {
    const res = await api.checkHealth();
    setBackendStatus(res.status === "healthy" || res.status === "online" ? "online" : "offline");
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    storage.setActiveUserEmail(authenticatedUser.email);
    setCurrentTab("dashboard");
    setDataRefreshKey(k => k + 1);
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    storage.setActiveUserEmail(null);
    setCurrentTab("landing");
    setDataRefreshKey(k => k + 1);
  };

  const handleResetData = () => {
    storage.resetAllData();
    setDataRefreshKey(k => k + 1);
    alert("SafeSignal data for the current account has been refreshed.");
  };

  const handleOpenSOS = () => {
    setIsSOSOpen(true);
  };

  // Loading state during initial session verification
  if (authChecking) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-plum-700 to-plum-950 text-white flex items-center justify-center shadow-soft animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-lavender-300" />
        </div>
        <p className="text-xs font-semibold text-slate-500">Restoring SafeSignal Session...</p>
      </div>
    );
  }

  // 2. Unauthenticated Gate: Show AuthPage if trying to access protected dashboard/features or clicking Sign In
  if (!user && currentTab !== "landing") {
    return (
      <AuthPage 
        onAuthSuccess={handleAuthSuccess} 
        onBrowsePublic={() => setCurrentTab("landing")}
      />
    );
  }

  // 3. Application View: Landing page (for visitors & users) OR Protected Dashboard (for authenticated users)
  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">

      {/* Main Navigation Header */}
      <Navbar
        onOpenSOS={handleOpenSOS}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        backendStatus={backendStatus}
        user={user}
        onLogout={handleLogout}
        onLogin={() => setCurrentTab("auth")}
        onNavigate={(tab) => {
          if (!user && tab !== "landing") {
            setCurrentTab("auth");
          } else {
            setCurrentTab(tab);
          }
        }}
        currentTab={currentTab}
      />

      {/* Landing page preview vs Main App layout */}
      {currentTab === "landing" ? (
        <LandingPage onEnterApp={() => setCurrentTab(user ? "dashboard" : "auth")} />
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
          
          {/* Responsive Sidebar */}
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            user={user}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main key={dataRefreshKey} className="flex-1 min-w-0 pb-16">
            
            {/* Quick Breadcrumb / Top Bar */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-border text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab("dashboard")}
                  className="hover:text-plum-900 font-semibold text-plum-950"
                >
                  SafeSignal
                </button>
                <span>/</span>
                <span className="font-semibold text-plum-950 capitalize">
                  {currentTab.replace("-", " ")}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Welcome, <strong className="text-plum-900">{user?.name || "Safety Ally"}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentTab("landing")}
                  className="text-[11px] font-bold text-plum-700 hover:text-plum-900"
                >
                  About & Mission →
                </button>
              </div>
            </div>

            {/* Tab Rendering */}
            {currentTab === "dashboard" && (
              <DashboardPage
                onOpenSOS={handleOpenSOS}
                onNavigate={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === "sos" && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
                  <h2 className="text-xl font-black text-plum-950">Emergency Physical Safety & SOS Center</h2>
                  <p className="text-xs text-slate-600 max-w-xl">
                    SafeSignal provides a confirmed 2-step emergency trigger that captures your GPS location with your explicit consent, generates shareable Google Maps links, and prepares immediate SMS and WhatsApp alerts to your chosen allies.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenSOS}
                    className="px-6 py-3.5 bg-coral-500 hover:bg-coral-600 text-white rounded-2xl text-sm font-extrabold shadow-coral-glow transition-all"
                  >
                    Open SOS Dispatch Confirmation
                  </button>
                </div>
                <ActionPlanPage onOpenSOS={handleOpenSOS} />
              </div>
            )}

            {currentTab === "journey" && (
              <JourneyPage onOpenSOS={handleOpenSOS} />
            )}

            {currentTab === "cyber" && (
              <CyberHarassmentPage />
            )}

            {currentTab === "deepfake" && (
              <DeepfakeSupportPage />
            )}

            {currentTab === "assistant" && (
              <AssistantPage />
            )}

            {currentTab === "action-plan" && (
              <ActionPlanPage onOpenSOS={handleOpenSOS} />
            )}

            {currentTab === "contacts" && (
              <TrustedContactsPage />
            )}

            {currentTab === "settings" && (
              <SettingsPage
                user={user}
                onLogout={handleLogout}
                onDataReset={handleResetData}
                onUserUpdated={(updatedUser) => {
                  setUser(updatedUser);
                  auth.setCurrentUser(updatedUser);
                }}
              />
            )}

          </main>
        </div>
      )}

      {/* Global SOS Emergency Modal */}
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />

    </div>
  );
}

export default App;
