# SafeSignal — AI-Powered Unified Women's Safety Platform
### Built for recHERsion'26 Hackathon

[![Live Frontend](https://img.shields.io/badge/Vercel-Live%20Frontend-black?logo=vercel)](https://safe-signal-livid.vercel.app)
[![Live Backend](https://img.shields.io/badge/Render-Live%20FastAPI%20Backend-46e3b7?logo=render)](https://safe-signal-backend-gf5t.onrender.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/manepallisruthi123-hub/Safe_Signal)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **"Safety is not just an SOS button. It is a complete workflow: Identify a threat → Understand the situation → Get trustworthy guidance → Take an actionable next step → Reach trusted support."**

---

## 🌐 Live Deployments

* **Frontend Web App (Vercel)**: [https://safe-signal-livid.vercel.app](https://safe-signal-livid.vercel.app)
* **Backend API (Render)**: [https://safe-signal-backend-gf5t.onrender.com](https://safe-signal-backend-gf5t.onrender.com)
* **Interactive API Documentation (Swagger)**: [https://safe-signal-backend-gf5t.onrender.com/docs](https://safe-signal-backend-gf5t.onrender.com/docs)
* **API Health Check**: [https://safe-signal-backend-gf5t.onrender.com/health](https://safe-signal-backend-gf5t.onrender.com/health)

---

## 1. Product Overview & Key Capabilities

Most existing women's safety applications focus almost exclusively on a basic panic button. However, women and girls facing distress often experience a complex spectrum of threats—from suspicious cab deviations and physical intimidation to digital stalking, non-consensual image manipulation (deepfakes/NCII), and online blackmail.

**SafeSignal** unites both **physical safety** and **digital safety** into a single, cohesive, privacy-first platform:

1. **Physical Safety & Emergency SOS Dispatch**:
   * Two-step confirmed emergency trigger with a 3-second abort grace period.
   * **Multi-Tier Geolocation Engine**: Cascades from hardware satellite GPS to browser Wi-Fi triangulation, client-side IP lookup, and server fallback. Coordinates are guaranteed never to be unavailable.
   * Formats a prominent, clickable Google Maps link (`https://maps.google.com/?q=lat,lng`) directly in the message body.
   * Automatically formats Indian mobile numbers with `+91` country code prefix for reliable WhatsApp (`wa.me`) and SMS composer routing.
   * Direct calling integration with National Emergency **112**.

2. **Safe Journey & Trusted Ally**:
   * Real-time transit monitoring with destination, arrival countdown timer, and vehicle notes (cab registration, driver name).
   * Automatically detects and flags overdue journeys.
   * Generates departure GPS location links for WhatsApp and SMS sharing.
   * Features a dedicated **Trusted Ally View** displaying exact status details to trusted contacts.

3. **Cyber Harassment & Threat Text Analyzer**:
   * Heuristic and AI-driven analysis of abusive DMs, threatening emails, and blackmail comments.
   * Evaluates severity against Indian legal frameworks (**Bharatiya Nyaya Sanhita 2023** and **IT Act 2000**).
   * Generates actionable signal breakdowns, evidence preservation checklists (uncompressed screenshots, message headers, timestamps), and step-by-step reporting guides.

4. **Deepfake & Non-Consensual Image Abuse (NCII) Support**:
   * Empathetic, guided intake for victims of morphed imagery, face-swaps, and cyber extortion.
   * Direct integration guidance for **StopNCII.org** (on-device cryptographic perceptual hashing) and **Take It Down** (NCMEC tool for minors under 18).
   * Generates legally compliant **IT Rules 2021 Rule 3(2)(b) 24-Hour Mandatory Grievance Officer Takedown Notices**.

5. **AI Safety Assistant (RAG Pipeline)**:
   * **Retrieval-Augmented Generation (RAG)** grounded on 17 curated, verified Indian legal and emergency documents.
   * Powered by Google Gemini 1.5/2.5 Flash with fallback to a deterministic semantic synthesis engine.
   * Cites verified official authorities, official portals, and emergency helplines.

6. **Unified Safety Action Planner**:
   * Situation selector providing customized 6-step protocols (Immediate Step, Safety Guidance, Evidence Checklist, Reporting Options, Official Portals, and Follow-up).

7. **Authentication & User Privacy**:
   * **Real Google Sign-In & One Tap** via Google Identity Services (GIS SDK) and server-side token verification.
   * Local session persistence with complete user data isolation.

---

## 2. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + Vite)                       │
│    Tailwind CSS (Deep Plum, Lavender, Coral) • Responsive PWA UI      │
│      Google Identity Services • Multi-Tier Geolocation Engine          │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼ (REST HTTPS / JSON)             ▼ (Local-First Storage)
┌──────────────────────────────────────────┐  ┌──────────────────────────┐
│          FASTAPI BACKEND API             │  │   LOCALSTORAGE ENGINE    │
│  - GET  /health                          │  │  - User Isolated Data    │
│  - GET  /api/location/current            │  │  - Trusted Allies        │
│  - POST /api/assistant (RAG)             │  │  - Active Journeys       │
│  - POST /api/analyze-text (Heuristic/AI) │  │  - Cached Coordinates    │
│  - POST /api/action-plan                 │  │  - Incident Dossiers     │
│  - POST /api/auth/google                 │  └──────────────────────────┘
│  - GET  /api/resources                   │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        RAG RETRIEVAL PIPELINE                          │
│  - Vector Space: Sublinear TF-IDF + Cosine Similarity (< 35MB RAM)     │
│  - Verified Corpus: 17 Official Legal, Emergency & Cyber Documents     │
│  - Synthesis Engine: Google Gemini 1.5/2.5 Flash (Grounded Generation) │
│  - Fallback Engine: Deterministic Legal Protocol Synthesizer           │
└────────────────────────────────────────────────────────────────────────┘
```

### Safety & Privacy Guarantees
- **Explicit Consent**: GPS coordinates are acquired **strictly upon user action**; no continuous background tracking or silent monitoring.
- **Zero Image Uploads**: SafeSignal **never** asks users to upload or transmit intimate images. Guidance utilizes on-device perceptual hashing (StopNCII.org) and text incident notes.
- **Transparent Communication**: SafeSignal clearly indicates when SMS or WhatsApp messaging composers are opened, requiring user confirmation before sending.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS 3.4, Lucide React Icons |
| **Authentication** | Google Identity Services (GIS SDK), OAuth 2.0 Web Client, PyJWT, Bcrypt |
| **Backend** | Python 3.12, FastAPI, Uvicorn, Pydantic v2, SQLite, HTTPX |
| **AI & RAG** | Scikit-Learn (TF-IDF vector space), NumPy, Google Gemini 1.5/2.5 Flash (`google-generativeai`) |
| **Geolocation** | HTML5 Geolocation API, Client-Side IP Lookup (`ipwho.is`), Dynamic Google Maps queries |
| **Hosting & CI/CD** | Vercel (Frontend), Render (FastAPI Web Service), GitHub |

---

## 4. Curated Knowledge Base Corpus

The RAG engine is indexed against 17 verified official Indian safety records across five primary domains:

1. **Indian Emergency Resources**: ERSS 112, Women Helpline 181, National Commission for Women (NCW) WhatsApp helpline, Railway Protection Force (Meri Saheli 139).
2. **Cybercrime Reporting**: National Cyber Crime Reporting Portal (`cybercrime.gov.in`), Helpline 1930, Anonymous vs. Tracked reporting options.
3. **Legal Remedies & Penalties**: Information Technology Act 2000 (Sections 66E, 67, 67A), Bharatiya Nyaya Sanhita 2023 (Sections 351, 354D stalking, 509 insulting modesty).
4. **Deepfakes & Non-Consensual Imagery**: Take It Down (minors), StopNCII.org (adults), IT Rules 2021 Rule 3(2)(b) 24-hour intermediary removal obligations.
5. **Transit & Physical Safety**: Cab/auto safety protocols, child-lock verification, railway coach emergency talkback systems.

---

## 5. Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Package Managers**: `npm` and `pip`

### Step 1: Clone the Repository
```bash
git clone https://github.com/manepallisruthi123-hub/Safe_Signal.git
cd Safe_Signal
```

### Step 2: Configure Environment Variables
Copy the template files:
```bash
# In the root directory:
cp .env.example .env

# In frontend directory:
cp frontend/.env.example frontend/.env
```

*(Optional)* Add your `GEMINI_API_KEY` in `.env` for generative AI responses. If omitted, the deterministic RAG fallback functions immediately.

### Step 3: Run the Backend
```bash
cd backend
pip install -r requirements.txt
python run_server.py
```
* Backend will be available at: `http://localhost:8000`
* Swagger API Documentation: `http://localhost:8000/docs`

### Step 4: Run the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
* Frontend will be available at: `http://localhost:5173`

---

## 6. Automated Testing

### Backend Unit & Integration Tests (Pytest)
```bash
cd backend
python -m pytest tests/ -v
```
Verifies:
* RAG knowledge base document integrity and semantic vector retrieval
* Cyber harassment heuristic risk scoring and regex matchers
* Emergency action planner generation
* Authentication endpoints and token verification

### Frontend Production Build
```bash
cd frontend
npm run build
```
Validates complete JSX compilation, asset bundling, and TypeScript/ESLint rules with zero errors.

---

## 7. Verified Emergency Helplines (India)

| Service | Helpline Number | Authority / Portal |
| :--- | :--- | :--- |
| **National Emergency (Police, Fire, Ambulance)** | **112** | Ministry of Home Affairs ([112.gov.in](https://112.gov.in)) |
| **National Cybercrime Helpline** | **1930** | Indian Cyber Crime Coordination Centre ([cybercrime.gov.in](https://cybercrime.gov.in)) |
| **Women in Distress Helpline** | **181** | Ministry of Women & Child Development |
| **NCW Women Helpline (Call / WhatsApp)** | **7827170170** | National Commission for Women ([ncw.nic.in](https://ncw.nic.in)) |
| **Railway Passenger Safety (Meri Saheli)** | **139** | RailMadad / RPF ([railmadad.indianrailways.gov.in](https://railmadad.indianrailways.gov.in)) |
| **Childline (POCSO / Minors)** | **1098** | CHILDLINE India Foundation |

---

## 8. Deployment Architecture

### Frontend on Vercel
* **Framework**: Vite
* **Root Directory**: `frontend`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **SPA Routing**: Handled via `frontend/vercel.json` rewrite rules.

### Backend on Render
* **Runtime**: Python 3.12
* **Root Directory**: `backend`
* **Build Command**: `pip install -r requirements.txt`
* **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
* **Memory Optimization**: Sublinear TF-IDF vector space uses **< 35MB RAM**, comfortably fitting within Render's 512MB free tier.

---

## 9. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

*Developed for the **recHERsion'26 Hackathon**.*
