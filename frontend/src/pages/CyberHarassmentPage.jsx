import React, { useState } from "react";
import {
  MessageSquareWarning,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Info,
  Loader2,
  Trash2,
  Lock
} from "lucide-react";
import { api } from "../services/api";
import { storage } from "../services/storage";
import { SAMPLE_HARASSMENT_TEXTS } from "../services/mockData";

export function CyberHarassmentPage() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAnalyze = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setResult(null);
    setSavedSuccess(false);

    try {
      const res = await api.analyzeHarassment(inputText);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (sampleText) => {
    setInputText(sampleText);
    setResult(null);
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
  };

  const handleSaveToRecords = () => {
    if (!result) return;
    storage.saveIncident({
      type: "cyber_harassment",
      category: result.category,
      severityScore: result.severityScore,
      preview: inputText.slice(0, 100) + (inputText.length > 100 ? "..." : "")
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `[SAFESIGNAL CYBER HARASSMENT ASSESSMENT RECORD]
Timestamp: ${new Date().toISOString()}
Assessment Category: ${result.category}
Assessed Severity Score: ${result.severityScore}/10

INPUT TEXT EXCERPT:
"${inputText.trim()}"

IDENTIFIED SIGNALS:
${result.signals?.map(s => `- ${s.type}: ${s.description}`).join("\n") || "No overt signals detected."}

RECOMMENDED SAFETY ACTIONS:
${result.recommendedActions?.map(a => `- ${a}`).join("\n")}

PRIMARY REPORTING CHANNELS IN INDIA:
- National Cybercrime Helpline: 1930
- National Cyber Crime Reporting Portal: https://cybercrime.gov.in
- National Commission for Women (NCW): 7827170170

DISCLAIMER:
${result.disclaimer}
`;
    navigator.clipboard.writeText(reportText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-plum-700 mb-1">
              <MessageSquareWarning className="w-5 h-5" />
              <h2 className="text-xl font-extrabold text-plum-950">Cyber Harassment & Threat Analyzer</h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Paste suspicious messages, abusive DMs, or blackmail comments to receive an objective, cautious assessment of threat indicators, legal implications under Indian law, and evidence-preservation steps.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-surface-subtle p-2.5 rounded-xl border border-surface-border">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Local Evaluation • Private & Confidential</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Input Form */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
        
        {/* Sample Pills for Quick Evaluation */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-600 block">Try testing with standard hackathon sample incidents:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_HARASSMENT_TEXTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadSample(sample.text)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface-subtle border border-surface-border hover:bg-lavender-50 hover:border-plum-300 text-slate-700 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Paste Message, DM, or Incident Text Below:
          </label>
          <textarea
            rows={5}
            required
            placeholder="Paste the received message or comment here for preliminary safety screening..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full text-xs font-mono bg-surface-subtle border border-surface-border rounded-2xl p-4 text-slate-800 focus:bg-white focus:ring-2 focus:ring-plum-400 focus:outline-none transition-all"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="py-3 px-6 bg-plum-800 hover:bg-plum-900 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-soft transition-all flex items-center space-x-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{loading ? "Analyzing Signals..." : "Evaluate Safety Signals"}</span>
              </button>

              {inputText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-3 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-surface-subtle transition-colors"
                  title="Clear text"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              {inputText.length} characters
            </span>
          </div>
        </form>

      </div>

      {/* ANALYSIS RESULTS */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Severity Banner */}
          <div className={`p-6 rounded-3xl border shadow-soft ${
            result.category === "High Concern"
              ? "bg-coral-50/90 border-coral-300"
              : result.category === "Moderate Concern"
              ? "bg-amber-50/80 border-amber-300"
              : "bg-emerald-50/80 border-emerald-300"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    result.category === "High Concern"
                      ? "bg-coral-600 text-white"
                      : result.category === "Moderate Concern"
                      ? "bg-amber-600 text-white"
                      : "bg-emerald-600 text-white"
                  }`}>
                    {result.category}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Calculated Threat Indicator: {result.severityScore} / 10
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-800 mt-2 leading-relaxed">
                  {result.guidance}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-surface-border shadow-soft-sm flex items-center space-x-1.5 transition-colors"
                >
                  {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSummary ? "Copied Record!" : "Copy Incident Record"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveToRecords}
                  className="px-4 py-2 bg-plum-800 hover:bg-plum-900 text-white text-xs font-bold rounded-xl shadow-soft flex items-center space-x-1.5 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>{savedSuccess ? "Saved Locally!" : "Save Case"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown Grid: Detected Signals & Recommended Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Detected Signals */}
            <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
              <h3 className="font-extrabold text-sm text-plum-950 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-plum-700" />
                <span>Detected Signals & Legal Context</span>
              </h3>

              {result.signals && result.signals.length > 0 ? (
                <div className="space-y-3">
                  {result.signals.map((sig, idx) => (
                    <div key={idx} className="p-3.5 bg-surface-subtle rounded-2xl border border-surface-border space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-plum-900">{sig.type}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          sig.severity === "High" ? "bg-coral-100 text-coral-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {sig.severity} Severity
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{sig.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">No explicit threatening or extortion keywords identified.</p>
              )}
            </div>

            {/* Recommended Safety Actions & Evidence Preservation */}
            <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
              <h3 className="font-extrabold text-sm text-plum-950 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Step-by-Step Response Checklist</span>
              </h3>

              <div className="space-y-2.5">
                {result.recommendedActions?.map((act, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-lavender-100 text-plum-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>

              {/* Direct Reporting Escalations */}
              <div className="pt-3 border-t border-surface-border space-y-2">
                <div className="text-xs font-bold text-slate-700">Official Reporting Portals:</div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-plum-50 hover:bg-plum-100 text-plum-800 border border-plum-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <span>cybercrime.gov.in</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href="tel:1930"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-coral-50 hover:bg-coral-100 text-coral-800 border border-coral-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <span>Call 1930 Helpline</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Legal / Informational Disclaimer */}
          <div className="p-4 bg-surface-subtle rounded-2xl border border-surface-border text-xs text-slate-500 leading-relaxed flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700">Ethical & Legal Notice: </span>
              {result.disclaimer}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
