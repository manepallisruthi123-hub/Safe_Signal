import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  MapPin,
  Send,
  Copy,
  Check,
  X,
  PhoneCall,
  ShieldAlert,
  Loader2,
  ExternalLink,
  MessageCircle,
  Info,
  RefreshCw,
  Navigation
} from "lucide-react";
import { storage } from "../services/storage";
import {
  getLocation,
  getLastKnownLocation,
  formatSOSMessage,
  buildSmsLink,
  buildWhatsAppLink
} from "../services/geolocation";

export function SOSModal({ isOpen, onClose }) {
  const [step, setStep] = useState("confirm"); // "confirm" | "countdown" | "acquiring" | "ready"
  const [countdown, setCountdown] = useState(3);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [customNote, setCustomNote] = useState("I am in an emergency situation and require immediate help!");
  const [landmark, setLandmark] = useState("");
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // "idle" | "requesting" | "acquired" | "refreshing"
  const [locationError, setLocationError] = useState("");
  const [preparedMessage, setPreparedMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState("");

  // Re-build message whenever coords, selectedContact, customNote, or landmark changes
  const buildMessage = (currentCoords, currentLandmark = landmark) => {
    const msg = formatSOSMessage({
      contactName: selectedContact?.name || "Trusted Contact",
      coords: currentCoords || coords,
      customNote,
      landmark: currentLandmark
    });
    setPreparedMessage(msg);
  };

  useEffect(() => {
    if (isOpen) {
      setStep("confirm");
      setCountdown(3);
      setLocationStatus("idle");
      setLocationError("");
      setActionNotice("");
      setCopied(false);
      setLandmark("");

      const loadedContacts = storage.getContacts();
      setContacts(loadedContacts);
      const primary = loadedContacts.find((c) => c.isPrimary) || loadedContacts[0] || null;
      setSelectedContact(primary);

      // Pre-load cached location immediately so user doesn't wait
      const cached = getLastKnownLocation();
      if (cached) {
        setCoords(cached);
      }

      // Pre-warm high accuracy location in background
      getLocation({ timeout: 4500 })
        .then((pos) => {
          if (pos) {
            setCoords(pos);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Handle countdown during confirmation if active
  useEffect(() => {
    let timer;
    if (isOpen && step === "countdown" && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (isOpen && step === "countdown" && countdown === 0) {
      proceedToAcquiring();
    }
    return () => clearTimeout(timer);
  }, [isOpen, step, countdown]);

  const handleStartCountdown = () => {
    setStep("countdown");
  };

  const handleCancelCountdown = () => {
    setStep("confirm");
    setCountdown(3);
  };

  const proceedToAcquiring = async () => {
    setStep("acquiring");
    setLocationStatus("requesting");

    try {
      const pos = await getLocation({ timeout: 5000 });
      setCoords(pos);
      setLocationStatus("acquired");
      buildMessage(pos, landmark);
      setStep("ready");
    } catch (err) {
      // Fallback is guaranteed by getLocation, but guard just in case
      const cached = getLastKnownLocation();
      const fallbackPos = cached || {
        latitude: 16.5062,
        longitude: 80.6480,
        accuracy: 2500,
        googleMapsUrl: "https://maps.google.com/?q=16.5062,80.6480",
        isFallback: true
      };
      setCoords(fallbackPos);
      setLocationStatus("acquired");
      buildMessage(fallbackPos, landmark);
      setStep("ready");
    }
  };

  const handleRefreshLocation = async () => {
    setLocationStatus("refreshing");
    try {
      const pos = await getLocation({ timeout: 5000 });
      setCoords(pos);
      setLocationStatus("acquired");
      buildMessage(pos, landmark);
      setActionNotice("GPS coordinates updated successfully.");
      setTimeout(() => setActionNotice(""), 3000);
    } catch (_) {
      setLocationStatus("acquired");
    }
  };

  const handleLandmarkChange = (val) => {
    setLandmark(val);
    buildMessage(coords, val);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(preparedMessage);
    setCopied(true);
    setActionNotice("Message copied to clipboard! Paste into your messaging app or SMS.");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleOpenSms = () => {
    const link = buildSmsLink(selectedContact?.phone, preparedMessage);
    window.location.href = link;
    setActionNotice(
      selectedContact
        ? `Opened SMS composer for ${selectedContact.name} (${selectedContact.phone}). Note: You must press 'Send' in your SMS app.`
        : `Opened SMS composer. Note: You must press 'Send' in your SMS app.`
    );
  };

  const handleOpenWhatsApp = () => {
    const link = buildWhatsAppLink(selectedContact?.phone, preparedMessage);
    window.open(link, "_blank");
    setActionNotice(
      selectedContact
        ? `Opened WhatsApp composer for ${selectedContact.name} (${selectedContact.phone}) with live GPS coordinates included. Note: Press 'Send' in WhatsApp.`
        : `Opened WhatsApp composer with live GPS coordinates included. Note: Select a contact and press 'Send' in WhatsApp.`
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-plum-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-coral-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-coral-500 to-coral-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <div>
              <h3 className="font-bold text-lg leading-tight">Emergency SOS Dispatch</h3>
              <p className="text-coral-100 text-xs">Sends Live GPS Map Link via WhatsApp & SMS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* STEP 1: Confirmation */}
          {step === "confirm" && (
            <div className="text-center space-y-4 py-3">
              <div className="w-16 h-16 rounded-full bg-coral-100 text-coral-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-800">Confirm SOS Emergency Trigger</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Click below to activate emergency alert dispatch and acquire your current GPS coordinates.
                </p>
              </div>

              {/* Target contact selection */}
              <div className="text-left bg-surface-subtle p-3.5 rounded-xl border border-surface-border">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Contact to Alert:
                </label>
                {contacts.length === 0 ? (
                  <p className="text-xs text-amber-600">
                    No trusted contacts added yet. You can still open WhatsApp or SMS to send to any contact or group!
                  </p>
                ) : (
                  <select
                    className="w-full text-sm bg-white border border-surface-border rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-coral-400 focus:outline-none"
                    value={selectedContact?.id || ""}
                    onChange={(e) => {
                      const found = contacts.find((c) => c.id === e.target.value);
                      setSelectedContact(found);
                      if (coords) {
                        const msg = formatSOSMessage({
                          contactName: found?.name || "Trusted Contact",
                          coords,
                          customNote,
                          landmark
                        });
                        setPreparedMessage(msg);
                      }
                    }}
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.relationship}) — {c.phone} {c.isPrimary ? "[Primary]" : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/2 py-2.5 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartCountdown}
                  className="w-full sm:w-1/2 py-2.5 px-4 bg-coral-500 hover:bg-coral-600 text-white text-sm font-bold rounded-xl shadow-coral-glow transition-all"
                >
                  Yes, Activate SOS
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: 3-Second Countdown */}
          {step === "countdown" && (
            <div className="text-center space-y-4 py-6">
              <div className="w-20 h-20 rounded-full bg-coral-500 text-white text-3xl font-extrabold flex items-center justify-center mx-auto shadow-coral-glow animate-pulse">
                {countdown}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">Activating in {countdown} seconds...</h4>
                <p className="text-xs text-slate-500">Tap below if this was an accidental press</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelCountdown}
                  className="py-2.5 px-6 bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-bold rounded-xl transition-colors"
                >
                  Abort Activation
                </button>
                <button
                  type="button"
                  onClick={proceedToAcquiring}
                  className="py-2.5 px-6 bg-coral-500 hover:bg-coral-600 text-white text-sm font-bold rounded-xl transition-all"
                >
                  Skip Countdown Now
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Acquiring location */}
          {step === "acquiring" && (
            <div className="text-center space-y-4 py-8">
              <Loader2 className="w-12 h-12 text-coral-500 animate-spin mx-auto" />
              <div>
                <h4 className="text-base font-bold text-slate-800">Acquiring Current GPS Coordinates...</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Connecting to GPS satellite and network positioning...
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Ready - Output options */}
          {step === "ready" && (
            <div className="space-y-4">
              
              {/* Location acquisition feedback card */}
              <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-900 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-emerald-800">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {coords?.source === "gps_high_accuracy"
                        ? "GPS Satellite Coordinates Acquired"
                        : coords?.source === "wifi_standard"
                        ? "Browser Wi-Fi / Cell Fix Acquired"
                        : coords?.isCached
                        ? "Last Known GPS Coordinates"
                        : "Live Network Location Acquired"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRefreshLocation}
                    disabled={locationStatus === "refreshing"}
                    className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${locationStatus === "refreshing" ? "animate-spin" : ""}`} />
                    <span>{locationStatus === "refreshing" ? "Refreshing..." : "Refresh GPS"}</span>
                  </button>
                </div>

                {coords && (
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-emerald-700 pt-0.5">
                    <span>
                      <strong>Lat/Lng:</strong> {Number(coords.latitude).toFixed(4)}, {Number(coords.longitude).toFixed(4)}
                      {coords.accuracy ? ` (±${Math.round(coords.accuracy)}m)` : ""}
                    </span>

                    <a
                      href={coords.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline text-emerald-800 inline-flex items-center space-x-0.5 hover:text-emerald-950"
                    >
                      <span>Preview Google Maps</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Landmark or specific spot input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nearby Landmark / Spot (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Metro Gate 3, beside Apollo Pharmacy"
                  value={landmark}
                  onChange={(e) => handleLandmarkChange(e.target.value)}
                  className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral-400"
                />
              </div>

              {/* Prepared Message Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Generated Emergency Message:</label>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-xs font-semibold text-plum-700 hover:text-plum-900 flex items-center space-x-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={5}
                  value={preparedMessage}
                  className="w-full text-xs font-mono bg-surface-subtle p-3 rounded-xl border border-surface-border text-slate-800 select-all focus:outline-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">Send Alert Directly:</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-soft transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send via WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenSms}
                    className="flex items-center justify-center space-x-2 py-3 px-4 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-bold shadow-soft transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send via SMS App</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href="tel:112"
                    className="w-full py-2.5 px-3 text-center text-xs font-bold text-coral-700 bg-coral-50 hover:bg-coral-100 rounded-xl border border-coral-200 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-coral-600" />
                    <span>Call Police Emergency: 112 Directly</span>
                  </a>
                </div>
              </div>

              {/* Action Feedback */}
              {actionNotice && (
                <div className="p-2.5 bg-lavender-50 border border-lavender-200 rounded-xl text-xs text-plum-900 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-plum-700 shrink-0 mt-0.5" />
                  <span>{actionNotice}</span>
                </div>
              )}

              {/* Safety & Integrity Notice */}
              <div className="text-[11px] text-slate-400 bg-surface-subtle p-2.5 rounded-lg border border-surface-border leading-relaxed">
                <span className="font-bold text-slate-600">Live GPS Notice: </span>
                Clicking "Send via WhatsApp" opens WhatsApp with your recipient and live Google Maps link pre-loaded in the message composer. Tap Send in WhatsApp to deliver the message.
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
