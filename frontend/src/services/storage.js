import { INITIAL_CONTACTS, INITIAL_JOURNEYS } from "./mockData";

const KEYS = {
  CONTACTS: "safesignal_contacts",
  JOURNEYS: "safesignal_journeys",
  INCIDENTS: "safesignal_incidents",
  DEEPFAKE_REPORTS: "safesignal_deepfake_reports",
  SETTINGS: "safesignal_settings",
};

let _activeUserEmail = null;

// Initialize active user from localStorage if present
try {
  const storedUser = localStorage.getItem("safesignal_auth_user");
  if (storedUser) {
    _activeUserEmail = JSON.parse(storedUser).email;
  }
} catch {}

export const storage = {
  setActiveUserEmail(email) {
    _activeUserEmail = email ? email.toLowerCase().trim() : null;
  },

  getUserScopedKey(baseKey) {
    if (_activeUserEmail) {
      return `${baseKey}_${_activeUserEmail}`;
    }
    return baseKey;
  },

  // Contacts
  getContacts() {
    const key = this.getUserScopedKey(KEYS.CONTACTS);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(INITIAL_CONTACTS));
      return INITIAL_CONTACTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CONTACTS;
    }
  },

  saveContacts(contacts) {
    const key = this.getUserScopedKey(KEYS.CONTACTS);
    localStorage.setItem(key, JSON.stringify(contacts));
  },

  addContact(contact) {
    const contacts = this.getContacts();
    const newContact = {
      ...contact,
      id: "contact-" + Date.now(),
      isPrimary: contacts.length === 0 ? true : !!contact.isPrimary
    };
    if (newContact.isPrimary) {
      contacts.forEach(c => c.isPrimary = false);
    }
    contacts.push(newContact);
    this.saveContacts(contacts);
    return newContact;
  },

  updateContact(id, updated) {
    const contacts = this.getContacts();
    const idx = contacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      if (updated.isPrimary) {
        contacts.forEach(c => c.isPrimary = false);
      }
      contacts[idx] = { ...contacts[idx], ...updated };
      this.saveContacts(contacts);
    }
    return contacts;
  },

  deleteContact(id) {
    const contacts = this.getContacts().filter(c => c.id !== id);
    if (contacts.length > 0 && !contacts.some(c => c.isPrimary)) {
      contacts[0].isPrimary = true;
    }
    this.saveContacts(contacts);
    return contacts;
  },

  getPrimaryContact() {
    const contacts = this.getContacts();
    return contacts.find(c => c.isPrimary) || contacts[0] || null;
  },

  // Journeys
  getJourneys() {
    const key = this.getUserScopedKey(KEYS.JOURNEYS);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(INITIAL_JOURNEYS));
      return INITIAL_JOURNEYS;
    }
    try {
      const list = JSON.parse(raw);
      // Recalculate overdue on retrieval
      const now = Date.now();
      return list.map(j => {
        if (j.status === "Active" && new Date(j.expectedArrivalTime).getTime() < now) {
          return { ...j, status: "Overdue" };
        }
        return j;
      });
    } catch {
      return INITIAL_JOURNEYS;
    }
  },

  saveJourneys(journeys) {
    const key = this.getUserScopedKey(KEYS.JOURNEYS);
    localStorage.setItem(key, JSON.stringify(journeys));
  },

  createJourney(journeyData) {
    const journeys = this.getJourneys();
    const newJourney = {
      id: "journey-" + Date.now(),
      status: "Active",
      startTime: new Date().toISOString(),
      ...journeyData
    };
    journeys.unshift(newJourney);
    this.saveJourneys(journeys);
    return newJourney;
  },

  getActiveJourney() {
    const journeys = this.getJourneys();
    return journeys.find(j => j.status === "Active" || j.status === "Overdue") || null;
  },

  checkInJourney(id) {
    const journeys = this.getJourneys();
    const journey = journeys.find(j => j.id === id);
    if (journey) {
      journey.status = "Checked In";
      journey.checkedInTime = new Date().toISOString();
      this.saveJourneys(journeys);
    }
    return journey;
  },

  cancelJourney(id) {
    const journeys = this.getJourneys();
    const journey = journeys.find(j => j.id === id);
    if (journey) {
      journey.status = "Cancelled";
      journey.cancelledTime = new Date().toISOString();
      this.saveJourneys(journeys);
    }
    return journey;
  },

  // Incident Records
  getIncidents() {
    const key = this.getUserScopedKey(KEYS.INCIDENTS);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  },

  saveIncident(incident) {
    const list = this.getIncidents();
    const record = {
      id: "inc-" + Date.now(),
      createdAt: new Date().toISOString(),
      ...incident
    };
    list.unshift(record);
    const key = this.getUserScopedKey(KEYS.INCIDENTS);
    localStorage.setItem(key, JSON.stringify(list));
    return record;
  },

  // Deepfake Intake Reports
  getDeepfakeReports() {
    const key = this.getUserScopedKey(KEYS.DEEPFAKE_REPORTS);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  },

  saveDeepfakeReport(report) {
    const list = this.getDeepfakeReports();
    const record = {
      id: "df-" + Date.now(),
      createdAt: new Date().toISOString(),
      ...report
    };
    list.unshift(record);
    const key = this.getUserScopedKey(KEYS.DEEPFAKE_REPORTS);
    localStorage.setItem(key, JSON.stringify(list));
    return record;
  },

  // Global Settings (backend URL, fallback mode)
  getSettings() {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    const defaults = {
      demoMode: true,
      backendUrl: "http://localhost:8000",
      useFallbackWhenOffline: true,
      theme: "light",
      hasSeenPrivacyNotice: true,
    };
    if (!raw) return defaults;
    try {
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return defaults;
    }
  },

  saveSettings(newSettings) {
    const current = this.getSettings();
    const merged = { ...current, ...newSettings };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(merged));
    return merged;
  },

  // Reset demo data for active user
  resetAllData() {
    const userContactsKey = this.getUserScopedKey(KEYS.CONTACTS);
    const userJourneysKey = this.getUserScopedKey(KEYS.JOURNEYS);
    const userIncidentsKey = this.getUserScopedKey(KEYS.INCIDENTS);
    const userDeepfakeKey = this.getUserScopedKey(KEYS.DEEPFAKE_REPORTS);

    localStorage.removeItem(userContactsKey);
    localStorage.removeItem(userJourneysKey);
    localStorage.removeItem(userIncidentsKey);
    localStorage.removeItem(userDeepfakeKey);

    // Also remove global defaults if no active user
    localStorage.removeItem(KEYS.CONTACTS);
    localStorage.removeItem(KEYS.JOURNEYS);
    localStorage.removeItem(KEYS.INCIDENTS);
    localStorage.removeItem(KEYS.DEEPFAKE_REPORTS);
  }
};
