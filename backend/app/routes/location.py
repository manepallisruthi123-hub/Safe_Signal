import logging
from typing import Optional
from fastapi import APIRouter, Request
import httpx

logger = logging.getLogger("safesignal.location")
router = APIRouter(prefix="/api/location", tags=["Location"])

# Sensible default coordinates for India demo (Vijayawada / Andhra Pradesh / Hyderabad)
DEFAULT_COORDS = {
    "latitude": 16.5062,
    "longitude": 80.6480,
    "accuracy": 1500,
    "city": "Vijayawada",
    "region": "Andhra Pradesh",
    "country": "India",
    "source": "server_default",
    "googleMapsUrl": "https://maps.google.com/?q=16.5062,80.6480",
    "osmUrl": "https://www.openstreetmap.org/?mlat=16.5062&mlon=80.6480#map=15/16.5062/80.6480"
}

@router.get("/current")
async def get_current_location(request: Request):
    """
    Returns approximate geographic coordinates based on client network IP or public IP lookup.
    Used as an emergency fallback when client browser hardware GPS is unavailable or blocked.
    """
    client_ip: Optional[str] = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "")
    if client_ip and "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    # Try resolving via public IP lookup if host has outbound network access
    try:
        url = "https://ipwho.is/"
        if client_ip and client_ip not in ("127.0.0.1", "localhost", "::1") and not client_ip.startswith("192.168.") and not client_ip.startswith("10."):
            url += client_ip

        async with httpx.AsyncClient(timeout=2.5) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("success", False) or "latitude" in data:
                    lat = float(data.get("latitude"))
                    lng = float(data.get("longitude"))
                    return {
                        "latitude": lat,
                        "longitude": lng,
                        "accuracy": 1000,
                        "city": data.get("city", "Unknown City"),
                        "region": data.get("region", "Unknown Region"),
                        "country": data.get("country", "India"),
                        "source": "ip_network",
                        "googleMapsUrl": f"https://maps.google.com/?q={lat},{lng}",
                        "osmUrl": f"https://www.openstreetmap.org/?mlat={lat}&mlon={lng}#map=15/{lat}/{lng}"
                    }
    except Exception as e:
        logger.debug(f"IP location lookup skipped/failed: {e}")

    return DEFAULT_COORDS
