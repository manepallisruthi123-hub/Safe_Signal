// Sample initial data for SafeSignal demo mode

export const INITIAL_CONTACTS = [
  {
    id: "contact-1",
    name: "Pooja Sharma",
    phone: "+919876543210",
    relationship: "Sister",
    isPrimary: true,
  },
  {
    id: "contact-2",
    name: "Ananya Deshmukh",
    phone: "+919123456789",
    relationship: "College Roommate",
    isPrimary: false,
  },
  {
    id: "contact-3",
    name: "Vikram Mehta",
    phone: "+919811122233",
    relationship: "Parent / Guardian",
    isPrimary: false,
  }
];

export const INITIAL_JOURNEYS = [
  {
    id: "journey-demo-1",
    destination: "Hostel Block B, University Campus",
    contactId: "contact-1",
    contactName: "Pooja Sharma",
    contactPhone: "+919876543210",
    notes: "Cab: White Dzire KA-01-MJ-2024. Driver: Ramesh.",
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    expectedArrivalTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: "Checked In", // "Active", "Checked In", "Overdue", "Cancelled"
    checkedInTime: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    startLocation: { lat: 12.9716, lng: 77.5946, label: "Metro Station Exit Gate 3" }
  }
];

export const SAMPLE_HARASSMENT_TEXTS = [
  {
    label: "Severe Threat & Blackmail (High Concern)",
    text: "I know where your college is and what time you leave classes. If you don't send ₹50,000 or talk to me, I will leak your photos everywhere tomorrow morning."
  },
  {
    label: "Persistent Stalking & Harassment (Moderate Concern)",
    text: "Why are you ignoring my 40 messages? You think you can block me? I will create 10 more fake accounts. I saw you at the cafeteria today wearing the blue kurta."
  },
  {
    label: "Benign / Normal Message (Low Concern)",
    text: "Hey! Just wanted to check if you reached home safely from the library? Let me know once you reach so we can finish the lab report."
  }
];

export const OFFICIAL_HELPLINES = [
  {
    name: "National Emergency Helpline",
    number: "112",
    desc: "Single pan-India emergency number for Police, Fire, and Medical assistance",
    type: "Police & Emergency",
    color: "coral"
  },
  {
    name: "Women Helpline (WCD)",
    number: "181",
    desc: "24/7 toll-free support for women facing distress, harassment, or domestic violence",
    type: "Women's Safety",
    color: "plum"
  },
  {
    name: "National Cybercrime Helpline",
    number: "1930",
    desc: "Direct reporting for online harassment, sextortion, impersonation, and cyber fraud",
    type: "Cybercrime",
    color: "lavender"
  },
  {
    name: "National Commission for Women",
    number: "7827170170",
    desc: "24/7 WhatsApp & Calling Helpline for immediate women's distress intervention",
    type: "NCW Support",
    color: "plum"
  },
  {
    name: "Railway Passenger Helpline",
    number: "139",
    desc: "RailMadad 24/7 assistance & Meri Saheli female squads for train travel safety",
    type: "Transit Safety",
    color: "lavender"
  }
];
