import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Navigation,
  MessageSquareWarning,
  EyeOff,
  BotMessageSquare,
  Users,
  ClipboardList,
  PhoneCall,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { storage } from "../services/storage";
import { OFFICIAL_HELPLINES } from "../services/mockData";

export function DashboardPage({ onOpenSOS, onNavigate }) {
  const [activeJourney, setActiveJourney] = useState(null);
  const [primaryContact, setPrimaryContact] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [checkedInAlert, setCheckedInAlert] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setActiveJourney(storage.getActiveJourney());
    setPrimaryContact(storage.getPrimaryContact());
    setRecentIncidents(storage.getIncidents().slice(0, 3));
  };

  const handleQuickCheckIn = (journeyId) => {
    storage.checkInJourney(journeyId);
    setCheckedInAlert(true);
    loadDashboardData();
    setTimeout(() => setCheckedInAlert(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-plum-900 via-plum-800 to-plum-950 text-white p-6 sm:p-8 rounded-3xl shadow-soft-lg">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-bold text-lavender-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>All Safety Systems Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to SafeSignal
          </h2>
          <p className="text-xs sm:text-sm text-lavender-200 leading-relaxed">
            Your unified shield for physical transit, emergency response, cyber harassment defense, and verified Indian legal guidance.
          </p>
        </div>

        {/* Big SOS button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenSOS}
            className="w-full sm:w-auto px-6 py-4 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white font-extrabold text-base rounded-2xl shadow-coral-glow hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-3"
          >
            <ShieldAlert className="w-6 h-6 animate-pulse fill-white text-coral-600" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-coral-100">Immediate Danger</div>
              <div className="text-base font-black leading-none">ACTIVATE SOS</div>
            </div>
          </button>
        </div>
      </div>

      {/* Success Notification for Check-in */}
      {checkedInAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">Journey marked safe! Your status is now Checked In.</span>
        </div>
      )}

      {/* Active Journey Snapshot (if active) */}
      {activeJourney && (
        <div className={`p-5 rounded-2xl border transition-all ${
          activeJourney.status === "Overdue"
            ? "bg-coral-50/80 border-coral-300 shadow-coral-glow"
            : "bg-lavender-50/80 border-lavender-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  activeJourney.status === "Overdue" 
                    ? "bg-coral-600 text-white animate-pulse" 
                    : "bg-plum-700 text-white"
                }`}>
                  {activeJourney.status === "Overdue" ? "Overdue Alert" : "Active Journey"}
                </span>
                <span className="text-xs text-slate-500">Destination:</span>
                <span className="text-xs font-bold text-slate-800">{activeJourney.destination}</span>
              </div>
              <p className="text-xs text-slate-600">
                Contact: <span className="font-semibold">{activeJourney.contactName} ({activeJourney.contactPhone})</span>
                {activeJourney.notes && <span className="text-slate-500"> • Notes: {activeJourney.notes}</span>}
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => handleQuickCheckIn(activeJourney.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-soft transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>I Have Arrived Safely</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate("journey")}
                className="px-3 py-2 bg-white hover:bg-surface-subtle text-slate-700 rounded-xl text-xs font-semibold border border-surface-border transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Safe Journey */}
        <div
          onClick={() => onNavigate("journey")}
          className="p-5 bg-white rounded-2xl border border-surface-border shadow-soft-sm hover:shadow-soft hover:border-plum-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-plum-950">Safe Journey & Ally</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Log cab details, set expected arrival, and alert allies if overdue.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-plum-700">
            <span>Open Journey Tracker</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Cyber Harassment */}
        <div
          onClick={() => onNavigate("cyber")}
          className="p-5 bg-white rounded-2xl border border-surface-border shadow-soft-sm hover:shadow-soft hover:border-plum-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-lavender-100 text-lavender-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-plum-950">Harassment Analyzer</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Scan suspicious messages for threats, blackmail, and stalking cues.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-plum-700">
            <span>Analyze Messages</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Deepfake Support */}
        <div
          onClick={() => onNavigate("deepfake")}
          className="p-5 bg-white rounded-2xl border border-surface-border shadow-soft-sm hover:shadow-soft hover:border-plum-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-coral-100 text-coral-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-plum-950">Deepfake & Image Abuse</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Empathetic intake, StopNCII hash guides, and IT Rules 24-hr takedowns.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-coral-700">
            <span>Get Image Support</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: AI Safety Assistant */}
        <div
          onClick={() => onNavigate("assistant")}
          className="p-5 bg-white rounded-2xl border border-surface-border shadow-soft-sm hover:shadow-soft hover:border-plum-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-plum-100 text-plum-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BotMessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-plum-950">AI Safety Assistant</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                RAG-grounded guidance with citations from Indian laws and helplines.
              </p>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs font-bold text-plum-700">
            <span>Ask Safety Question</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Two-Column Section: Helplines & Primary Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Direct Emergency Call Buttons */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-plum-950">Direct Emergency Helplines</h3>
              <p className="text-xs text-slate-500">Instant one-tap phone links for verified authorities in India</p>
            </div>
            <span className="text-[10px] font-bold text-coral-700 bg-coral-50 border border-coral-200 px-2 py-0.5 rounded-full">
              24/7 Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OFFICIAL_HELPLINES.slice(0, 4).map((h, i) => (
              <a
                key={i}
                href={`tel:${h.number}`}
                className="p-3.5 rounded-xl border border-surface-border bg-surface-subtle hover:bg-lavender-50 hover:border-plum-300 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-lg font-black text-plum-950 font-mono">{h.number}</div>
                  <div className="text-xs font-bold text-slate-800">{h.name}</div>
                  <div className="text-[10px] text-slate-500">{h.type}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white border border-surface-border flex items-center justify-center text-coral-500 group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => onNavigate("action-plan")}
              className="text-xs font-bold text-plum-700 hover:text-plum-900 inline-flex items-center space-x-1"
            >
              <span>Need a customized action plan? Generate Safety Action Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Trusted Ally Snapshot & Primary Contact */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-plum-700" />
              <h3 className="font-bold text-base text-plum-950">Primary Trusted Ally</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("contacts")}
              className="text-xs font-bold text-plum-700 hover:text-plum-900"
            >
              Manage
            </button>
          </div>

          {primaryContact ? (
            <div className="p-4 rounded-2xl bg-lavender-50 border border-lavender-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-plum-950">{primaryContact.name}</span>
                <span className="text-[10px] font-bold text-plum-800 bg-white px-2 py-0.5 rounded border border-lavender-200">
                  {primaryContact.relationship}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-700">{primaryContact.phone}</div>
              <p className="text-[11px] text-slate-500">
                This contact will be prioritized when you activate SOS or begin a Safe Journey.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-surface-subtle text-center text-xs text-slate-500">
              No contacts configured yet.
            </div>
          )}

          <div className="p-3.5 bg-surface-subtle rounded-2xl border border-surface-border text-xs text-slate-600 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Protection Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Your location and contact details are stored strictly in local browser memory in demo mode. No tracking scripts or commercial telemetry.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
