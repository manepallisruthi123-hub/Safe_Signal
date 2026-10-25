# SafeSignal — AI-Powered Unified Women's Safety Platform
### Built for recHERsion'26 Hackathon

> **"Safety is not just an SOS button. It is a complete workflow: Identify a threat → Understand the situation → Get trustworthy guidance → Take an actionable next step → Reach trusted support."**

---

## 1. Product Overview & Key Differentiators

Most existing women's safety applications focus almost exclusively on a basic panic button. However, women and girls facing distress often experience a complex spectrum of threats—from suspicious cab deviations and physical intimidation to digital stalking, non-consensual image manipulation (deepfakes/NCII), and online blackmail.

**SafeSignal** unites both **physical safety** and **digital safety** into a single, cohesive, privacy-first platform:

1. **Physical Safety & SOS:** A 2-step confirmed emergency trigger that captures GPS coordinates with explicit user consent, formats Google Maps & OpenStreetMap links, and prepares immediate SMS and WhatsApp alerts.
2. **Safe Journey & Trusted Ally:** Real-time transit monitoring with destination, arrival countdown, vehicle notes (cab registration, driver name), overdue detection, and a dedicated **Trusted Ally View** for contacts.
3. **Cyber Harassment & Threat Analyzer:** Analyzes suspicious messages, DMs, and blackmail comments against Indian legal frameworks (Bharatiya Nyaya Sanhita 2023 & IT Act 2000), offering transparent threat signals and evidence preservation checklists.
4. **Suspected Deepfake & Image-Abuse Support:** Empathetic, guided intake for morphed images and intimate imagery. Integrates with **StopNCII.org** on-device hashing, Take It Down (for minors), and generates **IT Rules 2021 Rule 3(2)(b) 24-Hour Mandatory Legal Takedown Notices**.
5. **AI Safety Assistant (RAG Pipeline):** Retrieval-Augmented Generation indexing curated Indian safety documentation with FAISS vector retrieval, displaying clickable official citations and verification dates.
6. **Unified Safety Action Plan:** An end-to-end situation selector providing an immediate 6-step protocol (Immediate step, Safety guidance, Evidence checklist, Helpline options, Official portals, and Follow-up).

---

## 2. Architecture & Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + Vite)                       │
│   Tailwind CSS (Deep Plum, Soft Lavender, Restrained Coral, Off-White) │
│       Mobile-First UI • Lucide Icons • On-Demand Geolocation          │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼ (REST HTTP / JSON)              ▼ (Browser Storage)
┌──────────────────────────────────────────┐  ┌──────────────────────────┐
│          FASTAPI BACKEND API             │  │   LOCALSTORAGE ENGINE    │
│  - GET  /health                          │  │  - Trusted Contacts      │
│  - POST /api/assistant (RAG)             │  │  - Active Journeys       │
│  - POST /api/analyze-text (Heuristic/AI) │  │  - Saved Case Dossiers   │
│  - POST /api/action-plan                 │  │  - Demo State Flags      │
│  - GET  /api/resources                   │  └──────────────────────────┘
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        RAG RETRIEVAL PIPELINE                          │
│  - Vector Index: FAISS Flat Inner-Product (Cosine Normalized)          │
│  - Embeddings: sentence-transformers/all-MiniLM-L6-v2                  │
│  - Knowledge Base: Official Indian Cybercrime, NCW, 112, IT Rules 2021 │
│  - Generative Engine: Gemini 1.5 Flash (with Grounded Fallback Engine) │
└────────────────────────────────────────────────────────────────────────┘
```

### Safety & Privacy Guarantees
- **No Silent Tracking:** GPS coordinates are acquired **strictly** upon user action and never continuously logged in the background.
- **Zero Media Uploads:** SafeSignal **never** asks users to upload or share intimate images. It uses cryptographic on-device hashing standards (StopNCII.org) and text incident notes.
- **Honest Action Reporting:** SafeSignal never fakes SMS dispatch or automated police calls. It explicitly shows whether an SMS composer was opened or copied.

---

## 3. Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v3, Lucide React icons.
- **Backend:** Python 3.12, FastAPI, Uvicorn, Pydantic v2.
- **AI & RAG:** FAISS (CPU), Sentence Transformers (`all-MiniLM-L6-v2`), Google Generative AI (Gemini 1.5 Flash), NumPy, Scikit-Learn.
- **Testing:** Pytest, FastAPI TestClient, Vite Build verification.

---

## 4. Prerequisites

- **Node.js:** v18.0.0 or higher (Tested on v24.14.0)
- **Python:** v3.10 or higher (Tested on v3.12.9)
- **Package Managers:** npm and pip

---

## 5. Installation & Startup Instructions

### Step 1: Clone or Navigate to the Repository
```powershell
git clone https://github.com/manepallisruthi123-hub/Safe_Signal.git
cd Safe_Signal
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
*(Optional)* Add your `GEMINI_API_KEY` in `.env` if you wish to use generative AI synthesis. If left blank, SafeSignal's built-in deterministic RAG fallback engine functions seamlessly!

### Step 3: Install & Start the Backend
Open a terminal for the backend:
```powershell
cd backend
pip install -r requirements.txt
$env:PYTHONPATH="."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will start at: `http://localhost:8000`
- Swagger Interactive Documentation: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/health`

### Step 4: Install & Start the Frontend
Open a separate terminal for the frontend:
```powershell
cd frontend
npm install
npm run dev
```
The SafeSignal web application will launch at: `http://localhost:5173`

---

## 6. How Demo Mode Works

SafeSignal was designed to be demonstrable out-of-the-box without requiring paid API tokens or cloud database provisioning:
- **Pre-populated Seed Contacts:** Includes trusted contacts (Pooja Sharma, Ananya Deshmukh, Vikram Mehta) for testing SOS and journey flows.
- **Sample Cyber Harassment Incidents:** Includes sample text presets (Severe Blackmail, Persistent Stalking, Benign message) for instant 1-click evaluation.
- **Grounded RAG Retrieval:** If no Gemini API key is configured, the system retrieves relevant documents from the Indian legal and emergency knowledge base and provides a structured, cited response with official source URLs.
- **One-Click Reset:** The top demo banner features a "Reset Demo Data" button that clears all local modifications and restores clean hackathon seed data.

---

## 7. Automated Testing Instructions

### Running Backend Tests (Pytest)
```powershell
cd backend
$env:PYTHONPATH="."
python -m pytest -v
```
This runs automated tests covering:
- API health and root endpoints
- Cyber harassment heuristic scoring and pattern signals
- 6-step Action Plan generation
- RAG document loading and source citation accuracy

### Running Frontend Build Verification
```powershell
cd frontend
npm run build
```
This compiles the complete React production bundle and confirms zero JSX or import errors.

---

## 8. Verified Indian Helplines & Legal Citations

| Service | Helpline Number | Authority / Portal |
| :--- | :--- | :--- |
| **National Emergency (Police, Fire, Ambulance)** | **112** | Ministry of Home Affairs (https://112.gov.in) |
| **National Cybercrime Helpline** | **1930** | Indian Cyber Crime Coordination Centre (I4C) (https://cybercrime.gov.in) |
| **Women in Distress Helpline** | **181** | Ministry of Women & Child Development |
| **NCW WhatsApp & Call Helpline** | **7827170170** | National Commission for Women (https://ncw.nic.in) |
| **Railway Passenger Safety (Meri Saheli)** | **139** | RailMadad / Railway Protection Force (https://railmadad.indianrailways.gov.in) |
| **Childline (POCSO / Minors)** | **1098** | CHILDLINE India Foundation |

---

## 9. Deployment Instructions

### Frontend (Vercel / Netlify)
1. Link your repository or upload the `frontend` folder.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable: `VITE_BACKEND_URL=https://your-backend-domain.com`

### Backend (Render / Railway / AWS EC2)
1. Deploy `backend` directory.
2. Build command: `pip install -r requirements.txt`
3. Start command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set environment variables: `CORS_ORIGINS=*`, `GEMINI_API_KEY=your_key`

---

## 10. Known Limitations & Next Steps

1. **Browser Background Execution:** Modern web browsers restrict background execution when tabs are closed. Overdue calculations currently trigger when the app is active or refreshed. For production, a native PWA or Android/iOS companion with Web Push Notifications is planned.
2. **Direct Carrier SMS Gateway:** In demo mode, SMS alerts use standard `sms:` URI schemes to open the device composer. In production, an integrated Twilio / Karix SMS API gateway will provide server-side dispatch.
3. **Multilingual Support:** Planned expansion into 10 Indian regional languages (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, etc.) for broader accessibility among rural and collegiate demographics.

---

*Developed with pride for **recHERsion'26 Hackathon**.*
