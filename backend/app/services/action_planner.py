from datetime import datetime
from typing import Dict, Any

def generate_action_plan(situation: str, details: str = "") -> Dict[str, Any]:
    """
    Generate an authoritative, structured 6-step Safety Action Plan
    grounded in Indian safety helplines and legal frameworks.
    """
    plans = {
        "physical_danger": {
            "title": "Immediate Physical Danger Protocol",
            "immediateStep": "Move immediately toward a well-lit public space, security booth, metro station, or crowded shop. Dial National Emergency 112 without delay.",
            "safetyGuidance": "Do not attempt to confront an aggressor alone. Keep your phone in hand with SafeSignal SOS ready. Announce loudly that you are on call with police/family if approached.",
            "evidenceChecklist": [
                "Note physical description, clothes, vehicle make and license plate if safe to do so",
                "Identify any CCTV cameras nearby that might have captured the incident",
                "Save exact time and location coordinates"
            ],
            "reportingOptions": [
                "Call 112 (Police & Emergency Response)",
                "Call 181 (Women Helpline)",
                "Inform your primary trusted contact via SafeSignal SOS"
            ],
            "relevantResources": [
                { "name": "Emergency Response Support System (112)", "url": "https://112.gov.in" },
                { "name": "Women Helpline (181)", "url": "https://wcd.nic.in" }
            ],
            "followUpSteps": [
                "Visit the nearest police station or women's help desk to register a Zero FIR if needed",
                "Inform campus/workplace security if incident occurred near premises",
                "Seek medical care immediately if physical touch or injury occurred"
            ]
        },
        "unsafe_journey": {
            "title": "Unsafe Journey & Suspicious Transit Protocol",
            "immediateStep": "Check that the rear child lock is disengaged. Call your trusted contact immediately on speaker phone and state your current location clearly.",
            "safetyGuidance": "If the driver deviates from the designated GPS route, speak assertively: 'Why are we off-route? My family is tracking this ride live.' If the driver refuses to correct course, insist on stopping at a crowded spot.",
            "evidenceChecklist": [
                "Screenshot the ride-booking app screen showing driver name, photo, and vehicle plate",
                "Share real-time GPS coordinates via SafeSignal or WhatsApp live location",
                "Save the ride receipt or driver ID details"
            ],
            "reportingOptions": [
                "Trigger in-app emergency button in Uber/Ola or transit app",
                "Dial 112 or Railways 139 if on a train",
                "Alert SafeSignal trusted contacts"
            ],
            "relevantResources": [
                { "name": "Delhi Police Transit Advisory", "url": "https://delhipolice.gov.in" },
                { "name": "RailMadad (139)", "url": "https://railmadad.indianrailways.gov.in" }
            ],
            "followUpSteps": [
                "File an urgent complaint within the ride hailing app to ban the driver",
                "Report the vehicle registration to local traffic or cyber police"
            ]
        },
        "online_harassment": {
            "title": "Cyber Harassment & Stalking Action Plan",
            "immediateStep": "Do NOT respond, engage in arguments, or delete the chat thread. Take full uncropped screenshots displaying timestamps and usernames.",
            "safetyGuidance": "Perpetrators often escalate when provoked. Documenting a continuous chain of unwanted messages establishes stalking under Section 78 BNS 2023.",
            "evidenceChecklist": [
                "Capture full browser or phone screen showing date, time, battery/network bar",
                "Copy sender's exact profile URL (not just display name)",
                "Export unedited chat history without deleting anything",
                "Record URLs of any defamatory posts or comments"
            ],
            "reportingOptions": [
                "Report account through platform safety forms (Instagram, X, WhatsApp)",
                "File an online complaint on cybercrime.gov.in (Report Cybercrime Against Women/Child)",
                "Contact National Cybercrime Helpline 1930"
            ],
            "relevantResources": [
                { "name": "National Cyber Crime Reporting Portal", "url": "https://cybercrime.gov.in" },
                { "name": "NCW 24/7 Helpline (7827170170)", "url": "https://ncw.nic.in" }
            ],
            "followUpSteps": [
                "Block the sender across all channels once evidence is secured",
                "Update your privacy settings to private and enable two-factor authentication",
                "Seek support from college Internal Complaints Committee (ICC) if sender is a peer"
            ]
        },
        "deepfake_image_abuse": {
            "title": "Suspected Deepfake, Morphed Image & NCII Action Plan",
            "immediateStep": "DO NOT pay blackmailers or delete proof. Visit StopNCII.org to generate digital hashes directly on your device to block propagation across platforms.",
            "safetyGuidance": "You did nothing wrong. Under Rule 3(2)(b) of the IT Rules 2021, platforms in India are legally mandated to remove non-consensual nudity or morphed images within 24 hours of notification.",
            "evidenceChecklist": [
                "Record the exact post URL and profile URL where the image is hosted",
                "Take screenshots of the blackmail or extortion messages with dates/times",
                "DO NOT forward or re-upload the intimate/morphed files anywhere",
                "Note timestamps and account IDs"
            ],
            "reportingOptions": [
                "Submit hashes to StopNCII.org (or TakeItDown.ncmec.org if under 18)",
                "Send 24-hr takedown notice to platform's Resident Grievance Officer in India",
                "Register complaint on cybercrime.gov.in under 'Crime Related to Women/Child'",
                "Call 1930 Cyber Helpline"
            ],
            "relevantResources": [
                { "name": "StopNCII.org", "url": "https://stopncii.org" },
                { "name": "Take It Down (for Minors)", "url": "https://takeitdown.ncmec.org" },
                { "name": "Cybercrime Portal India", "url": "https://cybercrime.gov.in" }
            ],
            "followUpSteps": [
                "Follow up on cybercrime.gov.in acknowledgement ID with cyber cell",
                "Inform a trusted friend, family member, or mental health counselor for emotional safety"
            ]
        },
        "impersonation": {
            "title": "Online Impersonation & Fake Profile Protocol",
            "immediateStep": "Alert your friends and contacts on your authentic profile that an impersonator account is active. Do not interact directly with the fake profile.",
            "safetyGuidance": "Impersonation to harm reputation or commit fraud violates Section 66D IT Act and Section 336 BNS 2023. Prompt reporting prevents misuse of your identity.",
            "evidenceChecklist": [
                "Copy exact link to the fake profile (e.g. instagram.com/fake_handle)",
                "Screenshot profile bio, stolen photos, and any DM conversations sent to others",
                "Gather proof of your authentic account"
            ],
            "reportingOptions": [
                "Use platform impersonation form (e.g., Instagram 'Pretending to be me')",
                "Report on cybercrime.gov.in under Identity Theft / Impersonation",
                "Email platform's India Grievance Officer"
            ],
            "relevantResources": [
                { "name": "Instagram Impersonation Center", "url": "https://help.instagram.com/contact/636276399721841" },
                { "name": "National Cyber Crime Reporting Portal", "url": "https://cybercrime.gov.in" }
            ],
            "followUpSteps": [
                "Request 4-5 trusted friends to report the profile for impersonation",
                "Keep copies of the platform complaint submission confirmation"
            ]
        }
    }

    key = situation if situation in plans else "online_harassment"
    selected = plans[key]

    return {
        **selected,
        "situationKey": key,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
