import React, { useState } from "react";
import {
  EyeOff,
  ShieldAlert,
  AlertTriangle,
  Lock,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  Info,
  Download,
  Mail
} from "lucide-react";
import { storage } from "../services/storage";

export function DeepfakeSupportPage() {
  const [platform, setPlatform] = useState("Instagram");
  const [postUrl, setPostUrl] = useState("");
  const [perpetratorHandle, setPerpetratorHandle] = useState("");
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split("T")[0]);
  const [concernType, setConcernType] = useState("morphed_image"); // "morphed_image" | "ncii_blackmail" | "ai_generated_video" | "impersonation"
  const [incidentDescription, setIncidentDescription] = useState("");
  
  const [savedCaseId, setSavedCaseId] = useState(null);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const handleSaveIntake = (e) => {
    e.preventDefault();
    if (!incidentDescription.trim()) return;

    const saved = storage.saveDeepfakeReport({
      platform,
      postUrl: postUrl.trim(),
      perpetratorHandle: perpetratorHandle.trim(),
      incidentDate,
      concernType,
      incidentDescription: incidentDescription.trim(),
    });

    setSavedCaseId(saved.id);
  };

  const generateLegalTakedownNotice = () => {
    return `SUBJECT: URGENT LEGAL TAKEDOWN NOTICE UNDER RULE 3(2)(b) OF THE IT RULES, 2021 — NON-CONSENSUAL/MORPHED INTIMATE CONTENT

To,
The Resident Grievance Officer,
${platform} India.

Dear Grievance Officer,

I am writing to formally report an unauthorized, non-consensual publication and distribution of content violating my dignity and privacy on your platform.

Incident Details:
- Platform: ${platform}
- Offending Profile / Account: ${perpetratorHandle || "[Profile URL or Handle]"}
- Offending Post URL: ${postUrl || "[Specific Post URL]"}
- Date Observed: ${incidentDate}
- Description of Violation: ${incidentDescription || "Unauthorized morphed / non-consensual depiction of my likeness."}

STATUTORY NOTICE UNDER INDIAN LAW:
Under Rule 3(2)(b) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, you as an intermediary are legally mandated to disable access or remove content depicting any individual in any sexual act, partial/full nudity, or morphed/impersonated imagery within TWENTY-FOUR (24) HOURS of receipt of this complaint.

Furthermore, this act constitutes severe offenses under:
- Section 66E & 67A of the Information Technology Act, 2000
- Section 79 & 351 of the Bharatiya Nyaya Sanhita (BNS), 2023

I request you to immediately remove and disable public access to this content and preserve the server access logs and IP records for law enforcement subpoena.

Sincerely,
Complainant / Authorized Representative
(Generated via SafeSignal Evidence & Legal Response Module)`;
  };

  const handleCopyTakedown = () => {
    navigator.clipboard.writeText(generateLegalTakedownNotice());
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  const handleCopyFullCase = () => {
    const caseText = `[SAFESIGNAL DEEPFAKE & IMAGE-ABUSE INTAKE DOSSIER]
Case ID: ${savedCaseId || "DRAFT-" + Date.now()}
Date Generated: ${new Date().toISOString()}
Concern Type: ${concernType}
Platform: ${platform}
Perpetrator Account / Handle: ${perpetratorHandle}
Post URL: ${postUrl}
Incident Summary:
${incidentDescription}

OFFICIAL ACTION CHECKLIST COMPLETED:
[ ] Generated hash on StopNCII.org (or TakeItDown for minors)
[ ] Captured full uncropped screenshots with timestamps & URL bar
[ ] Sent Rule 3(2)(b) 24-Hour Notice to Platform Resident Grievance Officer
[ ] Lodged complaint on cybercrime.gov.in / Helpline 1930
`;
    navigator.clipboard.writeText(caseText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-plum-700 mb-1">
              <EyeOff className="w-5 h-5 text-coral-500" />
              <h2 className="text-xl font-extrabold text-plum-950">Suspected Deepfake & Image-Abuse Support</h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Confidential, structured intake and response guidance for morphed media, non-consensual intimate imagery (NCII), and blackmail threats under Indian law.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 bg-coral-50 border border-coral-200 p-2.5 rounded-xl">
            <Lock className="w-4 h-4 text-coral-600 shrink-0" />
            <span className="font-semibold text-coral-800">Zero-Image Upload Policy: SafeSignal does not upload or store intimate media.</span>
          </div>
        </div>
      </div>

      {/* Crucial Safety Guidance Banner */}
      <div className="bg-plum-900 text-white p-6 rounded-3xl shadow-soft space-y-3">
        <div className="flex items-center space-x-2 text-coral-300 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-coral-400" />
          <span>Immediate Rules of Safety & Evidence</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <span className="font-bold block text-lavender-200 mb-1">1. DO NOT PAY EXTORTION</span>
            <p className="text-white/80 leading-relaxed">
              Paying extortion demands rarely deletes the material and often invites continued demands for more money.
            </p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <span className="font-bold block text-lavender-200 mb-1">2. NEVER RE-UPLOAD OR FORWARD</span>
            <p className="text-white/80 leading-relaxed">
              Do not share morphed or explicit images into chat groups as proof. Preserving post URLs and platform links is safer and lawful.
            </p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
            <span className="font-bold block text-lavender-200 mb-1">3. USE LOCAL HASHING FIRST</span>
            <p className="text-white/80 leading-relaxed">
              Use StopNCII.org to generate hashes directly in your browser so platforms can block image distribution without seeing your photos.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Intake Form & Action Toolkit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Intake Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
          <div className="border-b border-surface-border pb-3">
            <h3 className="font-extrabold text-base text-plum-950">Incident Documentation Form</h3>
            <p className="text-xs text-slate-500">Record structured facts for police complaints or platform grievance reports</p>
          </div>

          <form onSubmit={handleSaveIntake} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Concern Category *</label>
                <select
                  value={concernType}
                  onChange={(e) => setConcernType(e.target.value)}
                  className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                >
                  <option value="morphed_image">Morphed / Face-swapped Photo</option>
                  <option value="ncii_blackmail">Threat to Leak Private Photos (Blackmail)</option>
                  <option value="ai_generated_video">AI Generated Video / Deepfake</option>
                  <option value="impersonation">Impersonation Profile Using My Likeness</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hosting Platform *</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telegram">Telegram</option>
                  <option value="X (Twitter)">X (Twitter)</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Other / Website">Other / Unknown Website</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Perpetrator Handle / Username</label>
                <input
                  type="text"
                  placeholder="e.g. @anonymous_stalker or phone number"
                  value={perpetratorHandle}
                  onChange={(e) => setPerpetratorHandle(e.target.value)}
                  className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date First Discovered</label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Post / Account Permalink URL</label>
              <input
                type="url"
                placeholder="https://instagram.com/p/... or profile link"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Incident Context & Description *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Explain what was posted, whether demands/threats were made, and any context. Do not copy paste graphic descriptions; factual details suffice."
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-plum-800 hover:bg-plum-900 text-white rounded-xl text-xs font-bold shadow-soft transition-all"
              >
                Save Incident Record
              </button>

              {savedCaseId && (
                <button
                  type="button"
                  onClick={handleCopyFullCase}
                  className="py-2.5 px-4 bg-surface-subtle hover:bg-slate-100 text-slate-700 border border-surface-border rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? "Case Copied!" : "Copy Full Dossier"}</span>
                </button>
              )}
            </div>

            {savedCaseId && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Case #{savedCaseId} documented and stored locally in browser storage.</span>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Toolkit & Official Prevention Platforms */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* StopNCII / Take It Down Card */}
          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-3">
            <h4 className="font-extrabold text-sm text-plum-950 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-plum-700" />
              <span>Cryptographic Prevention Tools</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              These global initiatives compute anonymous numeric hashes directly on your computer. Your photo never leaves your machine.
            </p>

            <div className="space-y-2 pt-1">
              <a
                href="https://stopncii.org"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-lavender-50 hover:bg-lavender-100 border border-lavender-200 rounded-xl flex items-center justify-between text-xs font-bold text-plum-900 transition-colors group"
              >
                <div>
                  <div className="font-extrabold">StopNCII.org (Adults 18+)</div>
                  <div className="text-[10px] text-slate-500 font-normal">Blocks photo sharing on Instagram, Facebook, TikTok</div>
                </div>
                <ExternalLink className="w-4 h-4 text-plum-600 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href="https://takeitdown.ncmec.org"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-lavender-50 hover:bg-lavender-100 border border-lavender-200 rounded-xl flex items-center justify-between text-xs font-bold text-plum-900 transition-colors group"
              >
                <div>
                  <div className="font-extrabold">Take It Down (Under 18)</div>
                  <div className="text-[10px] text-slate-500 font-normal">NCMEC removal tool for minors & students</div>
                </div>
                <ExternalLink className="w-4 h-4 text-plum-600 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* IT Rules 24-Hour Notice Generator */}
          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-plum-950 flex items-center space-x-2">
                <Mail className="w-4 h-4 text-coral-500" />
                <span>Rule 3(2)(b) 24-Hr Notice</span>
              </h4>
              <button
                type="button"
                onClick={handleCopyTakedown}
                className="text-xs font-bold text-plum-700 hover:text-plum-900 flex items-center space-x-1"
              >
                {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNotice ? "Copied!" : "Copy Email"}</span>
              </button>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Social platforms operating in India are legally obligated under IT Rules 2021 to take down non-consensual sexual/morphed imagery within 24 hours of notification.
            </p>

            <textarea
              readOnly
              rows={4}
              value={generateLegalTakedownNotice()}
              className="w-full text-[11px] font-mono bg-surface-subtle p-3 rounded-xl border border-surface-border text-slate-600 focus:outline-none"
            />
          </div>

          {/* Official Police Escalation */}
          <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-soft-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-plum-950">Lodge Official FIR</div>
              <div className="text-[11px] text-slate-500">Call 1930 or file on cybercrime.gov.in</div>
            </div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Open Portal
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
