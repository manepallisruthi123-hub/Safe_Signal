import re
from typing import Dict, Any, List

def analyze_cyber_harassment_text(text: str) -> Dict[str, Any]:
    """
    Transparent rule-based heuristic analyzer for cyber harassment, threats, and blackmail.
    Identifies high-risk signals and returns actionable safety advice under Indian law.
    """
    cleaned = text.lower().strip()
    signals: List[Dict[str, str]] = []
    severity_score = 0

    # 1. Direct Physical Threats & Violence
    threat_patterns = [
        (r'\b(kill|murder|beat|hurt|destroy|ruin your life)\b', "Direct Threat of Violence", "Detected language threatening physical harm or life. Offense under Section 351 BNS 2023.", 5),
        (r'\b(acid|attack|stab|die)\b', "Severe Violent Intimidation", "Detected extreme threats targeting bodily integrity. Critical offense under Indian Penal Law.", 6),
        (r'\b(watch your back|know where you live|find you|come to your house|show up at your)\b', "Physical Proximity & Stalking Threat", "Indicates perpetrator claims knowledge of victim's physical whereabouts.", 4)
    ]

    for pattern, name, desc, weight in threat_patterns:
        if re.search(pattern, cleaned):
            signals.append({
                "type": name,
                "description": desc,
                "severity": "High"
            })
            severity_score += weight
            break

    # 2. Blackmail, NCII & Extortion
    extortion_patterns = [
        (r'\b(leak|expose|upload|send|circulate)\b.*\b(photo|photos|video|nude|morphed|private|pic|pics)\b', "Non-Consensual Image Leak Threat", "Threatens unauthorized distribution of private/morphed imagery. Strict offense under Sections 66E & 67A IT Act.", 5),
        (r'\b(send money|pay me|pay up|transfer|rupee|cash|bitcoin|50000|10000)\b', "Financial Extortion / Blackmail", "Demand for financial ransom coupled with threats. Offense under Section 308 BNS 2023 (Extortion).", 5),
        (r'\b(tell your parents|tell your family|post on facebook|tag your college)\b', "Reputational Coercion", "Blackmail intended to cause public humiliation or panic among family/institution.", 4)
    ]

    for pattern, name, desc, weight in extortion_patterns:
        if re.search(pattern, cleaned):
            signals.append({
                "type": name,
                "description": desc,
                "severity": "High"
            })
            severity_score += weight
            break

    # 3. Persistent Stalking & Harassment
    stalking_patterns = [
        (r'\b(saw you at|following you|spotted you at|watching you at|saw you wearing)\b', "Surveillance & Physical Monitoring", "Signals physical surveillance or tracking. Offense under Section 78 BNS 2023 (Stalking).", 3),
        (r'\b(block me|fake account|fake accounts|create another|ignore me|answer my calls)\b', "Evasion of Blocking / Persistent Harassment", "Shows deliberate intent to bypass blocking mechanisms and maintain unwanted contact.", 3)
    ]

    for pattern, name, desc, weight in stalking_patterns:
        if re.search(pattern, cleaned):
            signals.append({
                "type": name,
                "description": desc,
                "severity": "Moderate"
            })
            severity_score += weight
            break

    # 4. Derogatory slurs / Modesty Outrage
    slur_pattern = r'\b(slut|bitch|whore|idiot|shameless|characterless|cheap|prostitute)\b'
    if re.search(slur_pattern, cleaned):
        signals.append({
            "type": "Derogatory Language Targeting Dignity",
            "description": "Insulting words or slurs intended to outrage modesty. Covered under Section 79 BNS 2023.",
            "severity": "Moderate"
        })
        severity_score += 2

    # Categorization
    if severity_score >= 5:
        category = "High Concern"
        guidance = "CRITICAL: The analyzed text contains strong indicators of direct intimidation, extortion, or safety threats. Do NOT delete messages, do NOT pay money, and preserve full uncropped screenshots immediately."
    elif severity_score >= 2:
        category = "Moderate Concern"
        guidance = "ATTENTION: Indicators of persistent harassment, abusive language, or stalking behavior detected. Maintain documentation and consider restricting or blocking the sender."
    else:
        category = "Low Concern"
        guidance = "The text does not show overt indicators of severe digital harassment or threats. If you still feel uncomfortable, trust your intuition and block the sender."

    return {
        "category": category,
        "severityScore": min(severity_score, 10),
        "signals": signals,
        "guidance": guidance,
        "recommendedActions": [
            "Capture uncropped screenshots with date, time, battery bar, and username visible",
            "Preserve the direct profile URL and post permalink",
            "Do NOT engage in arguments or send retaliatory messages",
            "Report the profile using in-app platform tools (Instagram, WhatsApp, X)",
            "If extortion or threats of violence exist, report to 1930 or cybercrime.gov.in"
        ],
        "isDeterministicFallback": True,
        "disclaimer": "Preliminary heuristic assessment for informational safety guidance. Not a legal judgment or definitive court determination."
    }
