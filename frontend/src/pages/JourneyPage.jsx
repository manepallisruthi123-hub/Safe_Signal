import React, { useState, useEffect } from "react";
import {
  Navigation,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Share2,
  Copy,
  Check,
  MapPin,
  Car,
  User,
  Shield,
  PhoneCall,
  Info,
  Calendar
} from "lucide-react";
import { storage } from "../services/storage";
import { buildWhatsAppLink, buildSmsLink, getLocation, getLastKnownLocation } from "../services/geolocation";

export function JourneyPage({ onOpenSOS }) {
  const [journeys, setJourneys] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeJourney, setActiveJourney] = useState(null);

  // Form state
  const [destination, setDestination] = useState("");
  const [expectedMinutes, setExpectedMinutes] = useState(30);
  const [selectedContactId, setSelectedContactId] = useState("");
  const [vehicleNotes, setVehicleNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Trusted Ally preview modal
  const [showAllyModal, setShowAllyModal] = useState(false);
  const [previewJourney, setPreviewJourney] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadData();
    // Refresh interval for overdue check every 15 seconds
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const list = storage.getJourneys();
    setJourneys(list);
    const active = storage.getActiveJourney();
    setActiveJourney(active);

    const contactList = storage.getContacts();
    setContacts(contactList);
    if (!selectedContactId && contactList.length > 0) {
      const primary = contactList.find(c => c.isPrimary) || contactList[0];
      setSelectedContactId(primary.id);
    }
  };

  const handleStartJourney = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      setFormError("Please enter your destination.");
      return;
    }
    if (!selectedContactId) {
      setFormError("Please select a trusted contact to notify.");
      return;
    }

    const contact = contacts.find(c => c.id === selectedContactId);
    const expectedArrival = new Date(Date.now() + expectedMinutes * 60 * 1000).toISOString();

    // Grab current location or cached location
    let currentCoords = getLastKnownLocation();
    try {
      currentCoords = await getLocation({ timeout: 3000 });
    } catch (_) {}

    const newJourney = storage.createJourney({
      destination: destination.trim(),
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: contact.phone,
      notes: vehicleNotes.trim(),
      expectedArrivalTime: expectedArrival,
      coords: currentCoords || undefined
    });

    setDestination("");
    setVehicleNotes("");
    setFormError("");
    loadData();
  };

  const handleCheckIn = (id) => {
    storage.checkInJourney(id);
    loadData();
  };

  const handleCancel = (id) => {
    if (window.confirm("Are you sure you want to cancel this journey tracking?")) {
      storage.cancelJourney(id);
      loadData();
    }
  };

  const openAllyView = (journey) => {
    setPreviewJourney(journey);
    setShowAllyModal(true);
  };

  const generateShareableText = (journey, explicitCoords) => {
    let text = `🚗 [SafeSignal Safe Journey Tracker]\nI have started my journey to: ${journey.destination}.\nExpected Arrival: ${new Date(journey.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.\nTransit Notes: ${journey.notes || "None specified"}.\nStatus: ${journey.status}.`;
    
    const loc = explicitCoords || journey.coords || getLastKnownLocation();
    if (loc && loc.latitude && loc.longitude) {
      const lat = Number(loc.latitude).toFixed(6);
      const lng = Number(loc.longitude).toFixed(6);
      text += `\n\n📍 Departure GPS Coordinates:\nhttps://maps.google.com/?q=${lat},${lng}`;
    }

    text += `\n\nIf I do not check in by expected time, please call me or dial 112 immediately!`;
    return text;
  };

  const handleCopyAllyLink = async (journey) => {
    let loc = journey.coords || getLastKnownLocation();
    if (!loc) {
      loc = await getLocation({ timeout: 2500 });
    }
    const text = generateShareableText(journey, loc);
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareWhatsAppJourney = async (journey) => {
    let loc = journey.coords || getLastKnownLocation();
    if (!loc) {
      loc = await getLocation({ timeout: 2500 });
    }
    const text = generateShareableText(journey, loc);
    const link = buildWhatsAppLink(journey.contactPhone, text);
    window.open(link, "_blank");
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-plum-700 mb-1">
            <Navigation className="w-5 h-5" />
            <h2 className="text-xl font-extrabold text-plum-950">Safe Journey & Trusted Ally</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Log your transit details, set expected arrival, and share live status with trusted contacts. SafeSignal automatically detects overdue journeys when opened.
          </p>
        </div>

        <div className="shrink-0">
          <div className="p-2.5 rounded-xl bg-surface-subtle border border-surface-border text-[11px] text-slate-600 max-w-xs">
            <span className="font-bold text-slate-800">Browser Prototype Notice: </span>
            Overdue status is calculated on application launch or refresh. No background battery drain.
          </div>
        </div>
      </div>

      {/* ACTIVE JOURNEY CARD */}
      {activeJourney && (
        <div className={`p-6 rounded-3xl border shadow-soft ${
          activeJourney.status === "Overdue"
            ? "bg-coral-50/90 border-coral-400"
            : "bg-gradient-to-br from-lavender-50 to-plum-50 border-plum-200"
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  activeJourney.status === "Overdue"
                    ? "bg-coral-600 text-white animate-bounce"
                    : "bg-plum-800 text-white"
                }`}>
                  {activeJourney.status === "Overdue" ? "OVERDUE — ACTION REQUIRED" : "ACTIVE JOURNEY IN PROGRESS"}
                </span>

                <span className="text-xs text-slate-500 font-medium">
                  Started {new Date(activeJourney.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-plum-950 flex items-center space-x-2">
                  <MapPin className="w-6 h-6 text-coral-500 shrink-0" />
                  <span>{activeJourney.destination}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white/80 p-3 rounded-xl border border-surface-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Trusted Ally</span>
                  <span className="font-bold text-slate-800">{activeJourney.contactName}</span>
                  <span className="text-slate-500 block">{activeJourney.contactPhone}</span>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-surface-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Expected Arrival</span>
                  <span className={`font-bold ${activeJourney.status === "Overdue" ? "text-coral-600 font-mono" : "text-slate-800"}`}>
                    {new Date(activeJourney.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-slate-500 block">
                    {activeJourney.status === "Overdue" ? "Time exceeded without check-in!" : "On schedule"}
                  </span>
                </div>
              </div>

              {activeJourney.notes && (
                <div className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-surface-border flex items-center space-x-2">
                  <Car className="w-4 h-4 text-plum-700 shrink-0" />
                  <span><strong>Transit Notes:</strong> {activeJourney.notes}</span>
                </div>
              )}
            </div>

            {/* Actions for Active Journey */}
            <div className="flex flex-col gap-2.5 shrink-0 sm:w-64">
              <button
                type="button"
                onClick={() => handleCheckIn(activeJourney.id)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-soft transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Safe (Check In)</span>
              </button>

              <button
                type="button"
                onClick={() => openAllyView(activeJourney)}
                className="w-full py-2.5 px-4 bg-white hover:bg-surface-subtle text-plum-900 border border-plum-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4 text-plum-600" />
                <span>Trusted Ally Share View</span>
              </button>

              {activeJourney.status === "Overdue" && (
                <button
                  type="button"
                  onClick={onOpenSOS}
                  className="w-full py-2.5 px-4 bg-coral-500 hover:bg-coral-600 text-white rounded-xl text-xs font-black shadow-coral-glow transition-all flex items-center justify-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Send Overdue SOS</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCancel(activeJourney.id)}
                className="w-full py-2 px-3 text-slate-500 hover:text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel Journey
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE NEW JOURNEY FORM */}
      {!activeJourney && (
        <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-surface-border pb-3">
            <Car className="w-5 h-5 text-plum-700" />
            <h3 className="font-extrabold text-base text-plum-950">Start a New Safe Journey</h3>
          </div>

          {formError && (
            <div className="p-3 bg-coral-50 border border-coral-200 text-coral-700 text-xs rounded-xl font-medium">
              {formError}
            </div>
          )}

          <form onSubmit={handleStartJourney} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Address / Landmark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. University Library, Hostel Block 4, Home"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-sm bg-surface-subtle border border-surface-border rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-plum-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Trusted Ally to Monitor *
                </label>
                {contacts.length === 0 ? (
                  <p className="text-xs text-amber-600 py-2">No trusted contacts found. Please add contacts first.</p>
                ) : (
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full text-sm bg-surface-subtle border border-surface-border rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-plum-400 focus:outline-none"
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.relationship}) — {c.phone}
                      </option>
                    ))}
                  </select>
                )}
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Transit Time (Minutes)
                </label>
                <div className="flex items-center space-x-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setExpectedMinutes(mins)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        expectedMinutes === mins
                          ? "bg-plum-800 text-white border-plum-800"
                          : "bg-surface-subtle text-slate-600 border-surface-border hover:bg-slate-100"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={expectedMinutes}
                    onChange={(e) => setExpectedMinutes(Number(e.target.value))}
                    className="w-20 text-xs bg-surface-subtle border border-surface-border rounded-lg px-2.5 py-1.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-plum-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">mins</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle Details & Cab Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uber Dzire KA-01-MJ-2024, Driver: Rajesh"
                  value={vehicleNotes}
                  onChange={(e) => setVehicleNotes(e.target.value)}
                  className="w-full text-sm bg-surface-subtle border border-surface-border rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-plum-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="py-3 px-6 bg-plum-800 hover:bg-plum-900 text-white text-xs font-bold rounded-xl shadow-soft transition-all"
              >
                Start Safe Journey Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* JOURNEY HISTORY */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-slate-500" />
            <h3 className="font-extrabold text-base text-plum-950">Journey History</h3>
          </div>
          <span className="text-xs text-slate-400">{journeys.length} total logged</span>
        </div>

        {journeys.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No past journey logs found.</p>
        ) : (
          <div className="divide-y divide-surface-border">
            {journeys.map((j) => (
              <div key={j.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      j.status === "Checked In"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : j.status === "Overdue"
                        ? "bg-coral-100 text-coral-800 border border-coral-200"
                        : j.status === "Active"
                        ? "bg-plum-100 text-plum-900 border border-plum-200"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {j.status}
                    </span>
                    <span className="font-bold text-xs text-slate-800">{j.destination}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Ally: <span className="text-slate-700 font-medium">{j.contactName}</span> • Started {new Date(j.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => openAllyView(j)}
                    className="px-2.5 py-1.5 text-xs text-plum-700 hover:bg-lavender-50 rounded-lg border border-lavender-200 transition-colors flex items-center space-x-1"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Ally View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TRUSTED ALLY PREVIEW MODAL */}
      {showAllyModal && previewJourney && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-plum-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-lavender-200 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-plum-700" />
                <h4 className="font-extrabold text-base text-plum-950">Trusted Ally Journey Card</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAllyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              This preview displays exactly what your contact sees if you share this journey tracking status.
            </p>

            {/* Simulated Shared Card */}
            <div className="p-4 bg-surface-subtle rounded-2xl border border-surface-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">SafeSignal Live Status</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  previewJourney.status === "Checked In"
                    ? "bg-emerald-100 text-emerald-800"
                    : previewJourney.status === "Overdue"
                    ? "bg-coral-100 text-coral-800"
                    : "bg-plum-100 text-plum-800"
                }`}>
                  {previewJourney.status}
                </span>
              </div>

              <div className="text-sm font-bold text-slate-800">
                Destination: {previewJourney.destination}
              </div>

              <div className="text-xs text-slate-600">
                <strong>Expected Arrival: </strong>
                {new Date(previewJourney.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              {previewJourney.notes && (
                <div className="text-xs text-slate-500">
                  <strong>Notes: </strong> {previewJourney.notes}
                </div>
              )}
            </div>

            {/* Sharing actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleCopyAllyLink(previewJourney)}
                className="w-full py-2.5 px-4 bg-plum-800 hover:bg-plum-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Status Copied to Clipboard!" : "Copy Status Summary"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareWhatsAppJourney(previewJourney)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <span>Share via WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
