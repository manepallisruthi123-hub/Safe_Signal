from app.services.analyzer import analyze_cyber_harassment_text

def test_threat_detection():
    text = "I know your home address and I will hurt you if you ignore me."
    res = analyze_cyber_harassment_text(text)
    assert res["category"] in ["High Concern", "Moderate Concern"]
    types = [s["type"] for s in res["signals"]]
    assert any("Threat" in t or "Stalking" in t for t in types)

def test_extortion_detection():
    text = "Pay up 50000 rupees or I will expose your photos online."
    res = analyze_cyber_harassment_text(text)
    assert res["category"] == "High Concern"
    assert res["severityScore"] >= 5

def test_normal_text():
    text = "Good luck with your exams tomorrow! Call me once you finish."
    res = analyze_cyber_harassment_text(text)
    assert res["category"] == "Low Concern"
    assert res["severityScore"] == 0
    assert len(res["signals"]) == 0
