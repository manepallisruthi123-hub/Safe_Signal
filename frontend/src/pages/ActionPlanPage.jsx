import React, { useState } from "react";
import {
  ClipboardList,
  ShieldAlert,
  Navigation,
  MessageSquareWarning,
  EyeOff,
  UserCheck,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  ExternalLink,
  Copy,
  Check,
  Printer
} from "lucide-react";
import { api } from "../services/api";

const SITUATIONS = [
  { id: "physical_danger", label: "Immediate Physical Danger", icon: ShieldAlert, color: "coral" },
  { id: "unsafe_journey", label: "Unsafe Transit / Cab Deviation", icon: Navigation, color: "plum" },
  { id: "online_harassment", label: "Cyber Harassment & Stalking", icon: MessageSquareWarning, color: "lavender" },
  { id: "deepfake_image_abuse", label: "Morphed Imagery / NCII Threat", icon: EyeOff, color: "plum" },
  { id: "impersonation", label: "Identity Impersonation / Fake Profile", icon: UserCheck, color: "lavender" },
];

export function ActionPlanPage({ onOpenSOS }) {
  const [selectedSituation, setSelectedSituation] = useState("physical_danger");
  const [details, setDetails] = useState("");
  const [plan, setPlan] = useState(null);
  const [copiedPlan, setCopiedPlan] = useState(false);

  // Generate initial plan on render
  React.useEffect(() => {
    generatePlan(selectedSituation);
  }, [selectedSituation]);

  const generatePlan = async (situation) => {
    const res = await api.generateActionPlan(situation, details);
    setPlan(res);
  };

  const handleCopyPlan = () => {
    if (!plan) return;
    const planText = `[SAFESIGNAL COMPREHENSIVE SAFETY ACTION PLAN]
Situation: ${plan.title}
Timestamp: ${new Date().toISOString()}

1. IMMEDIATE NEXT STEP:
${plan.immediateStep}

2. RELEVANT SAFETY GUIDANCE:
${plan.safetyGuidance}

3. EVIDENCE PRESERVATION CHECKLIST:
${plan.evidenceChecklist?.map((e, i) => `${i + 1}. ${e}`).join("\n")}

4. REPORTING & TRUSTED CONTACT OPTIONS:
${plan.reportingOptions?.map((r, i) => `${i + 1}. ${r}`).join("\n")}

5. FOLLOW-UP & RECOVERY:
${plan.followUpSteps?.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Generated via SafeSignal Unified Women's Safety Platform.
`;
    navigator.clipboard.writeText(planText);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm">
        <div className="flex items-center space-x-2 text-plum-700 mb-1">
          <ClipboardList className="w-5 h-5 text-plum-700" />
          <h2 className="text-xl font-extrabold text-plum-950">Safety Action Plan (End-to-End Workflow)</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-2xl">
          Move from panic or confusion to clear, actionable clarity. Select your scenario below to generate an immediate 6-step protocol tailored with legal codes, evidence checklists, and official emergency contacts.
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SITUATIONS.map((s) => {
          const Icon = s.icon;
          const isSelected = selectedSituation === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedSituation(s.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? "bg-plum-900 text-white border-plum-900 shadow-soft"
                  : "bg-white text-slate-700 border-surface-border hover:border-plum-300 hover:bg-lavender-50/50"
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isSelected ? "bg-white/20 text-white" : "bg-surface-subtle text-plum-700"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs leading-tight">
                {s.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* GENERATED STRUCTURED ACTION PLAN */}
      {plan && (
        <div className="bg-white rounded-3xl border border-surface-border shadow-soft-sm p-6 sm:p-8 space-y-8 animate-in fade-in duration-200">
          
          {/* Plan Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-plum-700 bg-lavender-100 px-2.5 py-1 rounded-full">
                Customized Protocol
              </span>
              <h3 className="text-2xl font-black text-plum-950 mt-2">{plan.title}</h3>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyPlan}
                className="px-4 py-2 bg-surface-subtle hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-surface-border transition-colors flex items-center space-x-1.5"
              >
                {copiedPlan ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPlan ? "Plan Copied!" : "Copy Full Action Plan"}</span>
              </button>

              {selectedSituation === "physical_danger" && (
                <button
                  type="button"
                  onClick={onOpenSOS}
                  className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-black shadow-coral-glow transition-all"
                >
                  Activate SOS Now
                </button>
              )}
            </div>
          </div>

          {/* 6 Structured Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Step 1: Immediate Next Step */}
            <div className="p-5 rounded-2xl bg-coral-50/80 border border-coral-200 space-y-2">
              <div className="flex items-center space-x-2 text-coral-800 font-extrabold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-coral-500 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Immediate Next Step</span>
              </div>
              <p className="text-sm font-bold text-slate-900 leading-relaxed">
                {plan.immediateStep}
              </p>
            </div>

            {/* Step 2: Relevant Safety Guidance */}
            <div className="p-5 rounded-2xl bg-lavender-50/80 border border-lavender-200 space-y-2">
              <div className="flex items-center space-x-2 text-plum-900 font-extrabold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-plum-700 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Safety & Legal Guidance</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {plan.safetyGuidance}
              </p>
            </div>

            {/* Step 3: Evidence Checklist */}
            <div className="p-5 rounded-2xl bg-surface-subtle border border-surface-border space-y-3">
              <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Evidence Preservation Checklist</span>
              </div>
              <div className="space-y-2">
                {plan.evidenceChecklist?.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-plum-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Trusted Contact / Reporting Options */}
            <div className="p-5 rounded-2xl bg-surface-subtle border border-surface-border space-y-3">
              <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">4</span>
                <span>Immediate Support & Helplines</span>
              </div>
              <div className="space-y-2">
                {plan.reportingOptions?.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700">
                    <PhoneCall className="w-3.5 h-3.5 text-coral-600 shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 5: Verified Resources */}
            <div className="p-5 rounded-2xl bg-surface-subtle border border-surface-border space-y-3">
              <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">5</span>
                <span>Verified Official Portals</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {plan.relevantResources?.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-surface-border rounded-xl text-xs font-bold text-plum-900 hover:border-plum-400 transition-colors shadow-soft-sm"
                  >
                    <span>{res.name}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-plum-600" />
                  </a>
                ))}
              </div>
            </div>

            {/* Step 6: Follow-up & Recovery */}
            <div className="p-5 rounded-2xl bg-surface-subtle border border-surface-border space-y-3">
              <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">6</span>
                <span>Follow-Up & Resolution</span>
              </div>
              <div className="space-y-1.5">
                {plan.followUpSteps?.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                    <span className="text-plum-700 font-bold">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
