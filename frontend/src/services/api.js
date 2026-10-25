import { storage } from "./storage";

const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) return envUrl.trim().replace(/\/+$/, "");
  const saved = storage.getSettings()?.backendUrl;
  if (saved && saved.trim()) return saved.trim().replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location && window.location.hostname) {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(window.location.hostname)) {
      return `http://${window.location.hostname}:8000`;
    }
    // Deployed production domain (e.g. Vercel) with no backend configured yet
    return "https://safe-signal-backend-gf5t.onrender.com";
  }
  return "https://safe-signal-backend-gf5t.onrender.com";
};

// Built-in curated resources for client-side fallback
const FALLBACK_RESOURCES = [
  {
    title: "National Cyber Crime Reporting Portal (cybercrime.gov.in)",
    category: "Official Reporting Portal",
    url: "https://cybercrime.gov.in",
    description: "Official Govt of India portal with specialized reporting for crimes against women and children. Offers anonymous and tracked options.",
    source: "Ministry of Home Affairs, Govt of India",
    verifiedDate: "2026-02-15"
  },
  {
    title: "National Emergency Helpline (112)",
    category: "Emergency Helpline",
    url: "https://112.gov.in",
    description: "Pan-India 24/7 single emergency number for police, medical, and fire rescue.",
    source: "Emergency Response Support System (ERSS)",
    verifiedDate: "2026-02-15"
  },
  {
    title: "Women Helpline (181)",
    category: "Women's Safety",
    url: "https://wcd.nic.in/schemes/women-helpline-scheme",
    description: "Toll-free 24-hour support for women facing distress, violence, or legal aid needs.",
    source: "Ministry of Women and Child Development",
    verifiedDate: "2026-02-15"
  },
  {
    title: "National Cyber Crime Helpline (1930)",
    category: "Cyber Helpline",
    url: "https://cybercrime.gov.in",
    description: "24/7 helpline for cyber blackmail, financial cyber fraud, and online abuse.",
    source: "Indian Cyber Crime Coordination Centre (I4C)",
    verifiedDate: "2026-02-15"
  },
  {
    title: "StopNCII.org (Non-Consensual Intimate Image Prevention)",
    category: "Tech Prevention Tool",
    url: "https://stopncii.org",
    description: "Create cryptographic hashes on-device to prevent intimate images from being uploaded or shared across Meta, TikTok, and partner platforms.",
    source: "SWGfL / Revenge Porn Helpline",
    verifiedDate: "2026-02-15"
  },
  {
    title: "National Commission for Women (NCW) WhatsApp Helpline",
    category: "NCW Support",
    url: "https://ncw.nic.in",
    description: "Direct WhatsApp helpline at 7827170170 for women in distress across India.",
    source: "National Commission for Women",
    verifiedDate: "2026-02-15"
  }
];

// Client-side heuristic analyzer for cyber harassment fallback
const analyzeHarassmentOffline = (text) => {
  const lower = text.toLowerCase();
  
  const signals = [];
  let severityScore = 0; // 0 to 10

  // 1. Physical threat / violence
  const threatKeywords = ["kill", "murder", "beat", "acid", "die", "destroy you", "hurt you", "ruin your life", "watch your back", "know where you live"];
  const matchedThreats = threatKeywords.filter(k => lower.includes(k));
  if (matchedThreats.length > 0) {
    signals.push({
      type: "Direct Threat / Intimidation",
      description: `Detected threatening phrase(s): ${matchedThreats.map(m => `"${m}"`).join(", ")}. Criminal offense under Section 351 BNS 2023.`,
      severity: "High"
    });
    severityScore += 5;
  }

  // 2. Blackmail / Extortion / Image leak
  const extortionKeywords = ["leak", "expose", "upload your photos", "send money", "pay me", "morphed", "nude", "ruin your reputation", "tell your parents", "tell your college"];
  const matchedExtortion = extortionKeywords.filter(k => lower.includes(k));
  if (matchedExtortion.length > 0) {
    signals.push({
      type: "Blackmail / NCII Extortion Risk",
      description: `Detected blackmail or image leak threats: ${matchedExtortion.map(m => `"${m}"`).join(", ")}. Strict offense under Sections 66E/67A IT Act & BNS.`,
      severity: "High"
    });
    severityScore += 5;
  }

  // 3. Stalking / Monitoring
  const stalkingKeywords = ["saw you at", "following you", "wearing", "ignoring me", "block me", "fake accounts", "i will find you", "tracking you"];
  const matchedStalking = stalkingKeywords.filter(k => lower.includes(k));
  if (matchedStalking.length > 0) {
    signals.push({
      type: "Persistent Stalking / Location Surveillance",
      description: `Signals indicate repeated unwanted contact or physical observation: ${matchedStalking.map(m => `"${m}"`).join(", ")}. Violates Section 78 BNS 2023.`,
      severity: "Moderate"
    });
    severityScore += 3;
  }

  // 4. Abusive / vulgar language
  const abusiveKeywords = ["slut", "bitch", "whore", "idiot", "shameless", "disgusting", "cheap", "characterless"];
  const matchedAbusive = abusiveKeywords.filter(k => lower.includes(k));
  if (matchedAbusive.length > 0) {
    signals.push({
      type: "Outraging Modesty / Abusive Content",
      description: `Detected derogatory slurs targeting dignity: ${matchedAbusive.map(m => `"${m}"`).join(", ")}. Covered under Section 79 BNS 2023.`,
      severity: "Moderate"
    });
    severityScore += 2;
  }

  let category = "Low Concern";
  let guidance = "The input text does not display strong indicators of overt digital threats or harassment. However, if this message makes you feel uncomfortable or unsafe, trust your instincts.";

  if (severityScore >= 5) {
    category = "High Concern";
    guidance = "CRITICAL: Strong indicators of direct intimidation, extortion, or safety threats detected. Do NOT delete the messages, do NOT pay any money, and preserve full uncropped screenshots immediately.";
  } else if (severityScore >= 2) {
    category = "Moderate Concern";
    guidance = "ATTENTION: Indicators of persistent harassment, abusive language, or stalking behavior detected. Maintain evidence and consider restricting or blocking the sender.";
  }

  return {
    category,
    severityScore: Math.min(severityScore, 10),
    signals,
    guidance,
    recommendedActions: [
      "Take uncropped screenshots showing date, timestamp, and sender's username/handle",
      "Do NOT engage in arguments or send retaliatory messages",
      severityScore >= 5 ? "File an urgent complaint on cybercrime.gov.in or call 1930" : "Report the message or profile directly to the social media platform",
      "Block or restrict the user after securing evidence",
      "Inform a trusted friend, family member, or campus authority"
    ],
    isDeterministicFallback: true,
    disclaimer: "Preliminary heuristic analysis. This is an informational assessment tool, not a legal verdict or diagnostic determination."
  };
};

export const api = {
  // Check backend health
  async checkHealth() {
    try {
      const res = await fetch(`${getBackendUrl()}/health`, { method: "GET", signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        return await res.json();
      }
      return { status: "offline", detail: "Backend responded with error" };
    } catch {
      return { status: "offline", detail: "Backend unreachable, running in client fallback mode" };
    }
  },

  // Get Gemini API configuration status
  async getGeminiStatus() {
    try {
      const res = await fetch(`${getBackendUrl()}/api/settings/gemini-status`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline fallback
    }
    return { gemini_enabled: false, model: "gemini-1.5-flash", message: "Operating in local deterministic fallback mode." };
  },

  // Configure Gemini API key
  async setGeminiKey(apiKey) {
    try {
      const res = await fetch(`${getBackendUrl()}/api/settings/gemini-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey }),
        signal: AbortSignal.timeout(12000)
      });
      if (res.ok) {
        return { success: true, data: await res.json() };
      }
      const err = await res.json();
      return { success: false, error: err.detail || "Verification failed." };
    } catch (e) {
      return { success: false, error: e.message || "Could not reach backend." };
    }
  },

  // Remove Gemini API key
  async removeGeminiKey() {
    try {
      const res = await fetch(`${getBackendUrl()}/api/settings/gemini-key`, {
        method: "DELETE",
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { gemini_enabled: false };
  },

  // Get Google OAuth credentials status
  async getGoogleOAuthStatus() {
    try {
      const res = await fetch(`${getBackendUrl()}/api/settings/google-oauth`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return {
      google_oauth_configured: !!(import.meta.env.VITE_GOOGLE_CLIENT_ID),
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
      has_client_secret: false,
      message: "Client-side credentials mode."
    };
  },

  // Configure Google OAuth credentials
  async configureGoogleOAuth(clientId, clientSecret = "") {
    try {
      const res = await fetch(`${getBackendUrl()}/api/settings/google-oauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        return { success: true, data: await res.json() };
      }
      const err = await res.json();
      return { success: false, error: err.detail || "Configuration failed." };
    } catch (e) {
      return { success: false, error: e.message || "Could not reach backend." };
    }
  },

  // Remove Google OAuth credentials
  async removeGoogleOAuth() {
    try {
      const res = await fetch(`${getBackendUrl()}/api/settings/google-oauth`, {
        method: "DELETE",
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return { google_oauth_configured: false };
  },

  // Get resources
  async getResources() {
    try {
      const res = await fetch(`${getBackendUrl()}/api/resources`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return { resources: FALLBACK_RESOURCES, isFallback: true };
  },

  // Analyze harassment text
  async analyzeHarassment(text) {
    try {
      const res = await fetch(`${getBackendUrl()}/api/analyze-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return analyzeHarassmentOffline(text);
  },

  // Generate action plan
  async generateActionPlan(situation, details) {
    try {
      const res = await fetch(`${getBackendUrl()}/api/action-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, details }),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return this.generateOfflineActionPlan(situation, details);
  },

  // Query AI safety assistant (RAG)
  async queryAssistant(query, history = []) {
    try {
      const res = await fetch(`${getBackendUrl()}/api/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, history }),
        signal: AbortSignal.timeout(7000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline fallback
    }
    return this.generateOfflineAssistantResponse(query);
  },

  // Offline deterministic fallback for Action Plan
  generateOfflineActionPlan(situation, details) {
    const plans = {
      physical_danger: {
        title: "Immediate Physical Danger Protocol",
        immediateStep: "Move toward a well-lit public space, shop, security desk, or crowd. Call National Emergency 112 immediately.",
        safetyGuidance: "Do not attempt to confront an aggressor alone. Keep your phone in hand with SafeSignal SOS ready. Announce loudly that you are on call with police/family if approached.",
        evidenceChecklist: [
          "Note physical description, clothes, vehicle make and license plate if safe to do so",
          "Identify any CCTV cameras nearby that might have captured the incident",
          "Save exact time and location coordinates"
        ],
        reportingOptions: [
          "Call 112 (Police & Emergency Response)",
          "Call 181 (Women Helpline)",
          "Inform your primary trusted contact via SafeSignal SOS"
        ],
        relevantResources: [
          { name: "Emergency Response Support System (112)", url: "https://112.gov.in" },
          { name: "Women Helpline (181)", url: "https://wcd.nic.in" }
        ],
        followUpSteps: [
          "Visit the nearest police station or women's help desk to register a Zero FIR if needed",
          "Inform campus/workplace security if incident occurred near premises",
          "Seek medical care immediately if physical touch or injury occurred"
        ]
      },
      unsafe_journey: {
        title: "Unsafe Journey & Suspicious Transit Protocol",
        immediateStep: "Check that the child lock is disengaged. Call your trusted contact immediately on speaker phone and state your current location clearly.",
        safetyGuidance: "If the driver deviates from the designated GPS map, speak assertively: 'Why are we off-route? My family is tracking this ride live.' If driver refuses to correct course, insist on stopping at a crowded spot.",
        evidenceChecklist: [
          "Screenshot the ride-booking app screen showing driver name, photo, and vehicle plate",
          "Share real-time GPS coordinates via SafeSignal or WhatsApp live location",
          "Save the ride receipt or driver ID details"
        ],
        reportingOptions: [
          "Trigger in-app emergency button in Uber/Ola or transit app",
          "Dial 112 or Railways 139 if on a train",
          "Alert SafeSignal trusted contacts"
        ],
        relevantResources: [
          { name: "Delhi Police Transit Advisory", url: "https://delhipolice.gov.in" },
          { name: "RailMadad (139)", url: "https://railmadad.indianrailways.gov.in" }
        ],
        followUpSteps: [
          "File an urgent complaint within the ride hailing app to ban the driver",
          "Report the vehicle registration to local traffic or cyber police"
        ]
      },
      online_harassment: {
        title: "Cyber Harassment & Stalking Action Plan",
        immediateStep: "Do NOT respond, engage in arguments, or delete the chat thread. Take full uncropped screenshots displaying timestamps and usernames.",
        safetyGuidance: "Perpetrators often escalate when provoked. Documenting a continuous chain of unwanted messages establishes stalking under Section 78 BNS 2023.",
        evidenceChecklist: [
          "Capture full browser or phone screen showing date, time, battery/network bar",
          "Copy sender's exact profile URL (not just display name)",
          "Export unedited chat history without deleting anything",
          "Record URLs of any defamatory posts or comments"
        ],
        reportingOptions: [
          "Report account through platform safety forms (Instagram, X, WhatsApp)",
          "File an online complaint on cybercrime.gov.in (Report Cybercrime Against Women/Child)",
          "Contact National Cybercrime Helpline 1930"
        ],
        relevantResources: [
          { name: "National Cyber Crime Reporting Portal", url: "https://cybercrime.gov.in" },
          { name: "NCW 24/7 Helpline (7827170170)", url: "https://ncw.nic.in" }
        ],
        followUpSteps: [
          "Block the sender across all channels once evidence is secured",
          "Update your privacy settings to private and enable two-factor authentication",
          "Seek support from college Internal Complaints Committee (ICC) if sender is a peer"
        ]
      },
      deepfake_image_abuse: {
        title: "Suspected Deepfake, Morphed Image & NCII Action Plan",
        immediateStep: "DO NOT pay blackmailers or delete proof. Visit StopNCII.org to generate digital hashes directly on your device to block propagation across platforms.",
        safetyGuidance: "You did nothing wrong. Under Rule 3(2)(b) of the IT Rules 2021, platforms in India are legally mandated to remove non-consensual nudity or morphed images within 24 hours of notification.",
        evidenceChecklist: [
          "Record the exact post URL and profile URL where the image is hosted",
          "Take screenshots of the blackmail or extortion messages with dates/times",
          "DO NOT forward or re-upload the intimate/morphed files anywhere",
          "Note timestamps and account IDs"
        ],
        reportingOptions: [
          "Submit hashes to StopNCII.org (or TakeItDown.ncmec.org if under 18)",
          "Send 24-hr takedown notice to platform's Resident Grievance Officer in India",
          "Register complaint on cybercrime.gov.in under 'Crime Related to Women/Child'",
          "Call 1930 Cyber Helpline"
        ],
        relevantResources: [
          { name: "StopNCII.org", url: "https://stopncii.org" },
          { name: "Take It Down (for Minors)", url: "https://takeitdown.ncmec.org" },
          { name: "Cybercrime Portal India", url: "https://cybercrime.gov.in" }
        ],
        followUpSteps: [
          "Follow up on cybercrime.gov.in acknowledgement ID with cyber cell",
          "Inform a trusted friend, family member, or mental health counselor for emotional safety"
        ]
      },
      impersonation: {
        title: "Online Impersonation & Fake Profile Protocol",
        immediateStep: "Alert your friends and contacts on your authentic profile that an impersonator account is active. Do not interact directly with the fake profile.",
        safetyGuidance: "Impersonation to harm reputation or commit fraud violates Section 66D IT Act and Section 336 BNS 2023. Prompt reporting prevents misuse of your identity.",
        evidenceChecklist: [
          "Copy exact link to the fake profile (e.g. instagram.com/fake_handle)",
          "Screenshot profile bio, stolen photos, and any DM conversations sent to others",
          "Gather proof of your authentic account"
        ],
        reportingOptions: [
          "Use platform impersonation form (e.g., Instagram 'Pretending to be me')",
          "Report on cybercrime.gov.in under Identity Theft / Impersonation",
          "Email platform's India Grievance Officer"
        ],
        relevantResources: [
          { name: "Instagram Impersonation Center", url: "https://help.instagram.com/contact/636276399721841" },
          { name: "National Cyber Crime Reporting Portal", url: "https://cybercrime.gov.in" }
        ],
        followUpSteps: [
          "Request 4-5 trusted friends to report the profile for impersonation",
          "Keep copies of the platform complaint submission confirmation"
        ]
      }
    };

    const key = situation in plans ? situation : "online_harassment";
    return {
      ...plans[key],
      situationKey: key,
      isDeterministicFallback: true,
      timestamp: new Date().toISOString()
    };
  },

  // Offline deterministic fallback for Assistant with real sources
  generateOfflineAssistantResponse(query) {
    const q = (query || "").toLowerCase();
    let text = "";
    let sources = [];

    if (q.includes("threat") || q.includes("blackmail") || q.includes("extort")) {
      text = "If someone is threatening or blackmailing you online, remember these vital principles:\n\n1. **Do NOT pay extortion demands**: Paying does not stop threats; it often triggers demands for larger sums.\n2. **Preserve evidence**: Take full uncropped screenshots including timestamps, phone numbers, and profile URLs. Do not delete the message thread.\n3. **Legal Protection**: Blackmail and extortion are severe criminal offenses under Section 351 of the Bharatiya Nyaya Sanhita (BNS) 2023 and Section 66E/67A of the IT Act.\n4. **Action Steps**: Call the National Cyber Crime Helpline at **1930** immediately, and file a formal report on **cybercrime.gov.in** under 'Report Cyber Crime Related to Women/Child'.";
      sources = [
        {
          title: "National Cyber Crime Reporting Portal (cybercrime.gov.in)",
          url: "https://cybercrime.gov.in",
          sourceType: "Official Government",
          verifiedDate: "2026-02-15"
        },
        {
          title: "Indian Cyber Crime Coordination Centre (I4C) Helpline 1930",
          url: "https://cybercrime.gov.in",
          sourceType: "Official Government",
          verifiedDate: "2026-02-15"
        }
      ];
    } else if (q.includes("photo") || q.includes("morphed") || q.includes("deepfake") || q.includes("nude") || q.includes("intimate")) {
      text = "If someone is threatening to leak or has circulated morphed images or intimate photos:\n\n1. **StopNCII.org**: Use StopNCII.org to generate unique digital fingerprints (hashes) right on your browser. Tech platforms (Instagram, Facebook, TikTok) use these hashes to automatically block uploads without ever seeing your actual image.\n2. **Minors (Under 18)**: If you or the person depicted is under 18, use **Take It Down** (takeitdown.ncmec.org).\n3. **24-Hour Removal Mandate**: Under Rule 3(2)(b) of India's IT Rules 2021, social media platforms are legally required to remove non-consensual sexual or morphed content within **24 hours** of receiving a complaint.\n4. **Do NOT share the images**: Never re-upload the intimate images when asking for help. Only provide the post URLs and account handles to authorities.";
      sources = [
        {
          title: "StopNCII.org - SWGfL Non-Consensual Image Prevention",
          url: "https://stopncii.org",
          sourceType: "Official Prevention Platform",
          verifiedDate: "2026-02-15"
        },
        {
          title: "MeitY IT Rules 2021 (Rule 3(2)(b) 24-Hour Mandate)",
          url: "https://www.meity.gov.in",
          sourceType: "Official Government Regulation",
          verifiedDate: "2026-02-15"
        }
      ];
    } else if (q.includes("cab") || q.includes("journey") || q.includes("travel") || q.includes("car") || q.includes("driver") || q.includes("metro") || q.includes("train")) {
      text = "For transit and physical travel safety in India:\n\n1. **Verify Before Boarding**: Always verify the driver photo, vehicle make, and license plate number against the cab app.\n2. **Check Child Lock**: Test the rear door lock as soon as you sit to ensure you can open the door from the inside at any time.\n3. **Speak Assertively**: If the driver deviates from the designated GPS map, speak clearly: 'Why are you taking this route? My family is tracking this ride live.'\n4. **Emergency Contacts**: In any emergency, dial **112** (Pan-India Emergency) or use the vehicle/app SOS button. For Indian Railways, call **139** (RailMadad) for immediate RPF support.";
      sources = [
        {
          title: "Emergency Response Support System (ERSS 112)",
          url: "https://112.gov.in",
          sourceType: "Official Government",
          verifiedDate: "2026-02-15"
        },
        {
          title: "Indian Railways RailMadad (139) & Meri Saheli",
          url: "https://railmadad.indianrailways.gov.in",
          sourceType: "Official Government",
          verifiedDate: "2026-02-15"
        }
      ];
    } else if (q.includes("impersonat") || q.includes("fake account") || q.includes("pretend")) {
      text = "To tackle an impersonation account on social media:\n\n1. **Alert Contacts**: Post a story/status on your authentic account warning friends that a fake profile is impersonating you.\n2. **Report Through Official Forms**: Use platform-specific impersonation reporting forms (such as Instagram's impersonation link or WhatsApp grievance) and upload a government photo ID if prompted by the platform to verify identity.\n3. **Legal Section**: Creating fake accounts to impersonate an individual violates Section 66D of the IT Act (Cheating by personation) and Section 336 of the BNS 2023.\n4. **Cybercrime Portal**: Report the incident on cybercrime.gov.in with the exact profile URL and screenshots.";
      sources = [
        {
          title: "Instagram Impersonation Reporting Help Center",
          url: "https://help.instagram.com/contact/636276399721841",
          sourceType: "Official Platform",
          verifiedDate: "2026-02-15"
        },
        {
          title: "National Cyber Crime Reporting Portal",
          url: "https://cybercrime.gov.in",
          sourceType: "Official Government",
          verifiedDate: "2026-02-15"
        }
      ];
    } else {
      text = "SafeSignal is here to guide you with verified safety procedures in India:\n\n- **Immediate Physical Threat**: Dial **112** (Emergency) or **181** (Women Helpline).\n- **Cyber Harassment & Fraud**: Call **1930** or visit **cybercrime.gov.in**.\n- **Morphed Images & NCII**: Visit **StopNCII.org** to prevent image propagation.\n- **Campus & Workplace Harassment**: File a complaint with your college or workplace Internal Complaints Committee (ICC) under the PoSH Act 2013.\n\nFeel free to ask a specific question regarding digital or physical safety guidance.";
      sources = [
        {
          title: "National Cyber Crime Reporting Portal",
          url: "https://cybercrime.gov.in",
          sourceType: "Official Government",
          verifiedDate: "2026-02-15"
        },
        {
          title: "National Commission for Women (NCW)",
          url: "https://ncw.nic.in",
          sourceType: "Official Government",
          verifiedDate: "2026-02-15"
        }
      ];
    }

    return {
      answer: text,
      sources,
      isGrounded: true,
      isDeterministicFallback: true,
      model: "SafeSignal Verified Knowledge Base (Deterministic Retrieval Fallback)",
      disclaimer: "Information retrieved from curated Indian safety authorities. SafeSignal provides informational guidance, not legal counsel or real-time emergency dispatch."
    };
  }
};
