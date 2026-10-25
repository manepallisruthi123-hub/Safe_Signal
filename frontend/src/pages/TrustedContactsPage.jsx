import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  CheckCircle,
  Star,
  PhoneCall,
  MessageCircle,
  Send,
  AlertCircle
} from "lucide-react";
import { storage } from "../services/storage";
import { buildSmsLink, buildWhatsAppLink } from "../services/geolocation";

export function TrustedContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91");
  const [relationship, setRelationship] = useState("Sister");
  const [isPrimary, setIsPrimary] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    setContacts(storage.getContacts());
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter contact name.");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setError("Please enter a valid phone number with country code.");
      return;
    }

    if (editingId) {
      storage.updateContact(editingId, {
        name: name.trim(),
        phone: phone.trim(),
        relationship,
        isPrimary
      });
      setEditingId(null);
    } else {
      storage.addContact({
        name: name.trim(),
        phone: phone.trim(),
        relationship,
        isPrimary
      });
    }

    // Reset
    setName("");
    setPhone("+91");
    setRelationship("Sister");
    setIsPrimary(false);
    setShowAddForm(false);
    setError("");
    loadContacts();
  };

  const handleStartEdit = (contact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship);
    setIsPrimary(!!contact.isPrimary);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Remove this trusted contact?")) {
      storage.deleteContact(id);
      loadContacts();
    }
  };

  const handleSetPrimary = (id) => {
    storage.updateContact(id, { isPrimary: true });
    loadContacts();
  };

  const handleSendTest = (contact) => {
    const testMsg = `Hi ${contact.name}! This is a test check-in from SafeSignal to confirm you are designated as my trusted emergency safety ally.`;
    const link = buildSmsLink(contact.phone, testMsg);
    window.location.href = link;
  };

  const handleSendTestWhatsApp = (contact) => {
    const testMsg = `Hi ${contact.name}! This is a test check-in from SafeSignal to confirm you are designated as my trusted emergency safety ally.`;
    const link = buildWhatsAppLink(contact.phone, testMsg);
    window.open(link, "_blank");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-plum-700 mb-1">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-extrabold text-plum-950">Trusted Contacts & Safety Allies</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Designate emergency allies who will receive your GPS coordinates during SOS events or be assigned to monitor safe journey sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setName("");
            setPhone("+91");
            setShowAddForm(!showAddForm);
          }}
          className="px-4 py-2.5 bg-plum-800 hover:bg-plum-900 text-white rounded-xl text-xs font-bold shadow-soft transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showAddForm ? "Close Form" : "Add New Ally"}</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-3xl border border-lavender-200 shadow-soft space-y-4 animate-in fade-in duration-200">
          <h3 className="font-extrabold text-sm text-plum-950">
            {editingId ? "Edit Safety Contact" : "Add Trusted Safety Ally"}
          </h3>

          {error && (
            <div className="p-3 bg-coral-50 border border-coral-200 text-coral-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveContact} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pooja Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (with Country Code) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full text-xs bg-surface-subtle border border-surface-border rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
                >
                  <option value="Sister">Sister</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Brother">Brother</option>
                  <option value="Friend">Friend</option>
                  <option value="College Roommate">College Roommate</option>
                  <option value="Partner / Spouse">Partner / Spouse</option>
                  <option value="Mentor / Faculty">Mentor / Faculty</option>
                  <option value="Other Ally">Other Ally</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded border-slate-300 text-plum-700 focus:ring-plum-400 w-4 h-4"
              />
              <label htmlFor="isPrimary" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Set as Primary Emergency Contact (first contact dialed during SOS events)
              </label>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-plum-800 hover:bg-plum-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                {editingId ? "Save Changes" : "Save Contact"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2.5 px-4 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c) => (
          <div
            key={c.id}
            className={`p-5 bg-white rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
              c.isPrimary
                ? "border-plum-300 shadow-soft bg-gradient-to-b from-lavender-50/40 to-white"
                : "border-surface-border shadow-soft-sm"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-plum-800 uppercase px-2 py-0.5 rounded-full bg-lavender-100 border border-lavender-200">
                  {c.relationship}
                </span>

                {c.isPrimary && (
                  <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Primary</span>
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-base text-plum-950">{c.name}</h4>
                <div className="text-xs font-mono text-slate-600 mt-0.5">{c.phone}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => handleSendTest(c)}
                  className="px-2 py-1.5 bg-surface-subtle hover:bg-lavender-50 text-plum-900 rounded-lg text-xs font-semibold border border-surface-border transition-colors flex items-center space-x-1"
                  title="Send Test SMS check-in"
                >
                  <Send className="w-3 h-3" />
                  <span>SMS</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendTestWhatsApp(c)}
                  className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors flex items-center space-x-1"
                  title="Send Test WhatsApp check-in"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>

                {!c.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(c.id)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                    title="Make Primary Contact"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleStartEdit(c)}
                  className="p-1.5 text-slate-400 hover:text-plum-700 rounded-lg transition-colors"
                  title="Edit Contact"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 text-slate-400 hover:text-coral-600 rounded-lg transition-colors"
                  title="Delete Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
