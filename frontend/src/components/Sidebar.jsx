import React from "react";
import {
  LayoutDashboard,
  ShieldAlert,
  Navigation,
  MessageSquareWarning,
  EyeOff,
  BotMessageSquare,
  ClipboardList,
  Users,
  Settings,
  Sparkles,
  ExternalLink,
  HeartHandshake,
  LogOut,
  User
} from "lucide-react";

export function Sidebar({ currentTab, setCurrentTab, mobileOpen, setMobileOpen, user, onLogout }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
    { id: "sos", label: "Physical Safety & SOS", icon: ShieldAlert, badge: "SOS" },
    { id: "journey", label: "Safe Journey & Ally", icon: Navigation, badge: null },
    { id: "cyber", label: "Cyber Harassment", icon: MessageSquareWarning, badge: "AI" },
    { id: "deepfake", label: "Deepfake Support", icon: EyeOff, badge: "NCII" },
    { id: "assistant", label: "AI Safety Assistant", icon: BotMessageSquare, badge: "RAG" },
    { id: "action-plan", label: "Safety Action Plan", icon: ClipboardList, badge: null },
    { id: "contacts", label: "Trusted Contacts", icon: Users, badge: null },
    { id: "settings", label: "Settings & Privacy", icon: Settings, badge: null },
  ];

  const handleSelect = (id) => {
    setCurrentTab(id);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-plum-950/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white border-r border-surface-border flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 space-y-1 overflow-y-auto">
          
          <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            Safety Navigation
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-lavender-100/80 text-plum-900 font-semibold shadow-soft-sm border border-lavender-200"
                      : "text-slate-600 hover:text-plum-950 hover:bg-surface-subtle"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-plum-700" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        item.badge === "SOS"
                          ? "bg-coral-100 text-coral-700 border border-coral-200"
                          : "bg-lavender-200 text-plum-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom card: User Profile & Quick Portal */}
        <div className="p-4 border-t border-surface-border bg-surface-subtle/50 space-y-2">
          {user && (
            <div className="p-3 bg-white rounded-2xl border border-surface-border shadow-soft-sm flex items-center justify-between">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-xl object-cover ring-1 ring-plum-200 shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-plum-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-plum-950 truncate flex items-center space-x-1">
                    <span>{user.name}</span>
                    {user.auth_provider === "google" && (
                      <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                        Google
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors shrink-0"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="p-2.5 bg-white rounded-xl border border-surface-border shadow-soft-sm">
            <div className="flex items-center space-x-2 text-plum-900 font-semibold text-xs mb-0.5">
              <HeartHandshake className="w-3.5 h-3.5 text-plum-600" />
              <span>National Cyber Helpline</span>
            </div>
            <p className="text-[10px] text-slate-500 mb-1.5">Dial 1930 for online blackmail in India.</p>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-[10px] font-bold text-plum-700 hover:text-plum-900"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
