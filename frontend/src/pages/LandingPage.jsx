import React from "react";
import {
  Shield,
  ArrowRight,
  ShieldAlert,
  Navigation,
  MessageSquareWarning,
  EyeOff,
  BotMessageSquare,
  Lock,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { OFFICIAL_HELPLINES } from "../services/mockData";

export function LandingPage({ onEnterApp }) {
  const steps = [
    { num: "01", title: "Identify a Threat", desc: "Recognize digital stalking, abusive DMs, unsafe transit deviations, or morphing risks." },
    { num: "02", title: "Understand the Situation", desc: "Get calm, transparent assessment without panic or legal jargon." },
    { num: "03", title: "Trustworthy Guidance", desc: "Access verified Indian legal frameworks (IT Rules 2021, BNS 2023) and official platforms." },
    { num: "04", title: "Actionable Next Step", desc: "Follow step-by-step evidence checklists, 24-hr takedown notices, and StopNCII hashes." },
    { num: "05", title: "Reach Trusted Support", desc: "Alert chosen allies with GPS coordinates or dial 112 / 1930 directly." },
  ];

  const features = [
    {
      icon: ShieldAlert,
      title: "Physical Safety & SOS",
      desc: "2-step confirmed emergency trigger with GPS link generation, SMS composer integration, and zero false claims.",
      color: "from-coral-500 to-coral-600"
    },
    {
      icon: Navigation,
      title: "Safe Journey & Trusted Ally",
      desc: "Set destination, estimated time, and vehicle notes. Calculate overdue status and share live status with allies.",
      color: "from-plum-600 to-plum-700"
    },
    {
      icon: MessageSquareWarning,
      title: "Cyber Harassment Analyzer",
      desc: "Analyze threatening messages, blackmail, and stalking signals. Cautious severity ratings with evidence preservation protocols.",
      color: "from-lavender-600 to-plum-700"
    },
    {
      icon: EyeOff,
      title: "Suspected Deepfake Support",
      desc: "Empathetic intake for morphed images and NCII. StopNCII cryptographic hash integration and IT Rules 24-hour takedown notices.",
      color: "from-plum-700 to-plum-900"
    },
    {
      icon: BotMessageSquare,
      title: "AI Assistant with RAG",
      desc: "Retrieval-Augmented Generation grounded in official Indian cybercrime, police, and NCW documentation with clickable source citations.",
      color: "from-lavender-500 to-lavender-700"
    },
    {
      icon: Lock,
      title: "Privacy-First Architecture",
      desc: "No silent tracking, no forced intimate image uploads, local-first storage, and full data deletion controls.",
      color: "from-slate-700 to-slate-900"
    }
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-surface-border bg-gradient-to-b from-plum-50/60 via-lavender-50/30 to-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-lavender-200 shadow-soft-sm mb-6 text-xs text-plum-900 font-semibold">
            <span className="w-2 h-2 rounded-full bg-coral-500 animate-ping"></span>
            <span>Built for recHERsion'26 Hackathon • Women's Unified Safety</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-plum-950 tracking-tight leading-[1.12]">
                Safety is not just an SOS button. <br />
                It is a <span className="text-transparent bg-clip-text bg-gradient-to-r from-plum-700 via-plum-900 to-coral-600">complete workflow.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                SafeSignal unites physical security, safe journeys, cyber harassment analysis, deepfake image-abuse defense, and RAG-grounded legal guidance for women and girls in India.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onEnterApp}
                  className="px-6 py-3.5 bg-gradient-to-r from-plum-700 to-plum-900 hover:from-plum-800 hover:to-plum-950 text-white font-bold rounded-2xl shadow-soft hover:shadow-soft-lg flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Open SafeSignal App</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#helplines"
                  className="px-6 py-3.5 bg-white hover:bg-surface-subtle text-slate-700 font-bold rounded-2xl border border-surface-border shadow-soft-sm flex items-center justify-center space-x-2 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-coral-500" />
                  <span>Emergency Helplines</span>
                </a>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No Silent Tracking</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Indian Legal Frameworks</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Production Ready</span>
                </div>
              </div>
            </div>

            {/* Hero Interactive Card / Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 shadow-soft-lg border border-lavender-200 space-y-4 relative">
                <div className="flex items-center justify-between pb-3 border-b border-surface-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-coral-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="text-[11px] font-bold text-plum-900 bg-lavender-100 px-2.5 py-0.5 rounded-full">
                    Unified Safety Engine
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-coral-50/70 border border-coral-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-coral-500 text-white flex items-center justify-center font-bold">
                        SOS
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Two-Step SOS Dispatch</div>
                        <div className="text-[11px] text-slate-500">With instant GPS location link</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-coral-700 bg-white px-2 py-1 rounded-lg border border-coral-200">
                      Active
                    </span>
                  </div>

                  <div className="p-3 bg-plum-50/70 border border-plum-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-plum-700 text-white flex items-center justify-center font-bold">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Safe Journey & Overdue Alert</div>
                        <div className="text-[11px] text-slate-500">Automatic check-in tracking</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-plum-800 bg-white px-2 py-1 rounded-lg border border-plum-200">
                      Live
                    </span>
                  </div>

                  <div className="p-3 bg-lavender-50/70 border border-lavender-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-lavender-600 text-white flex items-center justify-center font-bold">
                        <BotMessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">RAG Safety Assistant</div>
                        <div className="text-[11px] text-slate-500">Grounded in cybercrime.gov.in & IT Rules</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-lavender-800 bg-white px-2 py-1 rounded-lg border border-lavender-200">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5-Step Workflow Section */}
      <section className="py-16 md:py-24 border-b border-surface-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold tracking-widest text-plum-700 uppercase mb-2">The Complete Safety Loop</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-plum-950">
              From threat identification to trusted action
            </h3>
            <p className="text-slate-500 text-sm mt-2">
              Most panic buttons stop at sending an alert. SafeSignal guides you through what happens before, during, and after an incident.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((st, i) => (
              <div key={i} className="p-5 rounded-2xl bg-surface-subtle border border-surface-border hover:shadow-soft transition-all space-y-2 relative">
                <div className="text-2xl font-black text-plum-300 font-mono">{st.num}</div>
                <h4 className="text-sm font-bold text-plum-950">{st.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 md:py-24 border-b border-surface-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold tracking-widest text-plum-700 uppercase mb-2">Full-Spectrum Protection</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-plum-950">
              Designed for physical & digital realities
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="p-6 rounded-3xl bg-white border border-surface-border shadow-soft-sm hover:shadow-soft transition-all space-y-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} text-white flex items-center justify-center shadow-soft`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-plum-950">{feat.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Helplines Section */}
      <section id="helplines" className="py-16 bg-white border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl font-extrabold text-plum-950">Official 24/7 Helplines in India</h3>
            <p className="text-slate-500 text-xs mt-1">Verified national numbers for instant emergency and distress intervention</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {OFFICIAL_HELPLINES.map((h, i) => (
              <a
                key={i}
                href={`tel:${h.number}`}
                className="p-4 rounded-2xl border border-surface-border bg-surface-subtle hover:bg-lavender-50/50 hover:border-plum-300 transition-all block group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-plum-800 uppercase px-2 py-0.5 rounded bg-white border border-surface-border">
                    {h.type}
                  </span>
                  <PhoneCall className="w-4 h-4 text-coral-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl font-black text-plum-950 font-mono tracking-tight">{h.number}</div>
                <div className="text-xs font-bold text-slate-800 mt-1">{h.name}</div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{h.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-surface-subtle text-center text-xs text-slate-500 border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-plum-700" />
            <span className="font-bold text-plum-950">SafeSignal</span>
            <span>— Developed for recHERsion'26 Hackathon</span>
          </div>
          <div>
            <span>Targeting physical and cyber safety for students and young women across India.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
