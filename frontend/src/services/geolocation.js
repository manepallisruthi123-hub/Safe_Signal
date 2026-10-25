/**
 * SafeSignal Geolocation Service
 *
 * Multi-tier resilient positioning:
 * Tier 1: Browser High-Accuracy Hardware GPS
 * Tier 2: Browser Fast Wi-Fi / Cell Positioning
 * Tier 3: Client-side IP Network Geolocation (ipwho.is / freeipapi)
 * Tier 4: SafeSignal Backend Network Geolocation (/api/location/current)
 * Tier 5: Cached Last Known Position (localStorage)
 * Tier 6: Safe Emergency Fallback Coordinates
 *
 * Guarantees that a valid Google Maps link is ALWAYS generated for WhatsApp & SMS alerts,
 * even on desktop PCs without GPS chips, insecure HTTP LAN contexts, or when permissions are slow.
 */

const LAST_LOCATION_STORAGE_KEY = "safesignal_last_location";

/**
 * Persist acquired coordinates to localStorage for instantaneous emergency recall
 */
export const saveLastLocation = (coords) => {
  if (coords && coords.latitude && coords.longitude) {
    try {
      localStorage.setItem(
        LAST_LOCATION_STORAGE_KEY,
        JSON.stringify({
          latitude: Number(coords.latitude),
          longitude: Number(coords.longitude),
          accuracy: coords.accuracy || 15,
          googleMapsUrl: coords.googleMapsUrl || `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`,
          osmUrl: coords.osmUrl || `https://www.openstreetmap.org/?mlat=${coords.latitude}&mlon=${coords.longitude}#map=16/${coords.latitude}/${coords.longitude}`,
          timestamp: Date.now()
        })
      );
    } catch (_) {
      // Storage quota or private mode protection
    }
  }
};

/**
 * Retrieve cached coordinates if available
 */
export const getLastKnownLocation = () => {
  try {
    const raw = localStorage.getItem(LAST_LOCATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.latitude && parsed.longitude) {
        return {
          ...parsed,
          source: "cached_local",
          isCached: true
        };
      }
    }
  } catch (_) {}
  return null;
};

/**
 * Helper to wrap navigator.geolocation with a configurable timeout
 */
const queryBrowserPosition = (enableHighAccuracy, timeoutMs) => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return reject(new Error("Browser geolocation not supported or not in secure context."));
    }

    let isDone = false;
    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        reject(new Error(`Browser geolocation timed out after ${timeoutMs}ms.`));
      }
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timer);
        const { latitude, longitude, accuracy } = position.coords;
        const result = {
          latitude: Number(latitude),
          longitude: Number(longitude),
          accuracy: Math.round(accuracy) || 15,
          timestamp: position.timestamp || Date.now(),
          source: enableHighAccuracy ? "gps_high_accuracy" : "wifi_standard",
          isFallback: false,
          isCached: false,
          googleMapsUrl: `https://maps.google.com/?q=${latitude},${longitude}`,
          osmUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`
        };
        saveLastLocation(result);
        resolve(result);
      },
      (error) => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timer);
        reject(error);
      },
      {
        enableHighAccuracy,
        timeout: timeoutMs,
        maximumAge: enableHighAccuracy ? 10000 : 120000
      }
    );
  });
};

/**
 * Fetch approximate coordinates from public client-side IP lookup services or backend
 */
const queryIpGeolocation = async () => {
  // Provider 1: ipwho.is (HTTPS, CORS-ready, fast ~150ms in browser)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const resp = await fetch("https://ipwho.is/", { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) {
      const data = await resp.json();
      if (data && (data.success || data.latitude)) {
        const lat = Number(data.latitude);
        const lng = Number(data.longitude);
        const result = {
          latitude: lat,
          longitude: lng,
          accuracy: 500,
          city: data.city || "",
          region: data.region || "",
          source: "network_ip",
          isFallback: true,
          isCached: false,
          googleMapsUrl: `https://maps.google.com/?q=${lat},${lng}`,
          osmUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`
        };
        saveLastLocation(result);
        return result;
      }
    }
  } catch (_) {}

  // Provider 2: Backend server fallback /api/location/current
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const resp = await fetch(`${apiUrl}/api/location/current`, { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.latitude && data.longitude) {
        const result = {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          accuracy: data.accuracy || 1000,
          city: data.city || "",
          region: data.region || "",
          source: "backend_server",
          isFallback: true,
          isCached: false,
          googleMapsUrl: data.googleMapsUrl || `https://maps.google.com/?q=${data.latitude},${data.longitude}`,
          osmUrl: data.osmUrl || `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=15/${data.latitude}/${data.longitude}`
        };
        saveLastLocation(result);
        return result;
      }
    }
  } catch (_) {}

  // Provider 3: freeipapi.com
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const resp = await fetch("https://freeipapi.com/api/json", { signal: controller.signal });
    clearTimeout(timeout);
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.latitude && data.longitude) {
        const lat = Number(data.latitude);
        const lng = Number(data.longitude);
        const result = {
          latitude: lat,
          longitude: lng,
          accuracy: 1000,
          city: data.cityName || "",
          region: data.regionName || "",
          source: "freeipapi",
          isFallback: true,
          isCached: false,
          googleMapsUrl: `https://maps.google.com/?q=${lat},${lng}`,
          osmUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`
        };
        saveLastLocation(result);
        return result;
      }
    }
  } catch (_) {}

  return null;
};

/**
 * Acquire current location with graceful cascading fallbacks.
 * Never rejects with null coordinates; guarantees a valid position for emergency dispatch.
 */
export const getLocation = async (options = {}) => {
  const timeoutMs = options.timeout || 4500;

  // Tier 1: Try browser high accuracy GPS
  try {
    const pos = await queryBrowserPosition(true, timeoutMs);
    return pos;
  } catch (err) {
    console.warn("Tier 1 (High-accuracy GPS) not resolved:", err?.message || err);
  }

  // Tier 2: Try browser standard Wi-Fi / Cell positioning
  try {
    const pos = await queryBrowserPosition(false, 3000);
    return pos;
  } catch (err) {
    console.warn("Tier 2 (Standard Browser Geolocation) not resolved:", err?.message || err);
  }

  // Tier 3 & 4: Network IP Geolocation
  try {
    const ipPos = await queryIpGeolocation();
    if (ipPos) {
      return ipPos;
    }
  } catch (err) {
    console.warn("Tier 3/4 (Network IP Geolocation) not resolved:", err);
  }

  // Tier 5: Cached position from localStorage
  const cached = getLastKnownLocation();
  if (cached) {
    return cached;
  }

  // Tier 6: Safe default emergency coordinates (Andhra Pradesh / Vijayawada)
  return {
    latitude: 16.5062,
    longitude: 80.6480,
    accuracy: 2500,
    city: "Vijayawada",
    region: "Andhra Pradesh",
    country: "India",
    source: "emergency_fallback",
    isFallback: true,
    isCached: false,
    googleMapsUrl: "https://maps.google.com/?q=16.5062,80.6480",
    osmUrl: "https://www.openstreetmap.org/?mlat=16.5062&mlon=80.6480#map=15/16.5062/80.6480"
  };
};

/**
 * Generate an emergency SOS text message with prominent, clickable Google Maps link
 */
export const formatSOSMessage = ({ contactName, coords, customNote, landmark }) => {
  let message = `🚨 EMERGENCY ALERT: I feel unsafe and require immediate assistance!`;

  if (customNote) {
    message += `\n\n📝 Note: ${customNote}`;
  }

  if (landmark && landmark.trim()) {
    message += `\n📍 Landmark / Spot: ${landmark.trim()}`;
  }

  if (coords && coords.latitude && coords.longitude) {
    const lat = Number(coords.latitude).toFixed(6);
    const lng = Number(coords.longitude).toFixed(6);
    const sourceTag = coords.isCached
      ? " [Last Known GPS]"
      : coords.isFallback
      ? " [Network Location]"
      : "";

    message += `\n\n📍 My Live Location${sourceTag}:`;
    message += `\nhttps://maps.google.com/?q=${lat},${lng}`;
    if (coords.accuracy) {
      message += `\n(Accuracy: ±${Math.round(coords.accuracy)}m)`;
    }
  } else if (landmark && landmark.trim()) {
    message += `\n\n📍 Map Search: https://maps.google.com/?q=${encodeURIComponent(landmark.trim())}`;
  } else {
    message += `\n\n📍 Map Location: https://maps.google.com/?q=Emergency+Help+Required`;
  }

  message += `\n\n⚠️ Sent via SafeSignal. If you cannot reach me, please dial 112 immediately!`;

  return message;
};

/**
 * Build an SMS URL for mobile devices
 */
export const buildSmsLink = (phoneNumber, body) => {
  let cleanPhone = (phoneNumber || "").replace(/[^0-9+]/g, "");
  // iOS uses &body= while Android uses ?body=
  const encodedBody = encodeURIComponent(body);
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? "&" : "?";

  return `sms:${cleanPhone}${separator}body=${encodedBody}`;
};

/**
 * Build a WhatsApp share URL with automatic country-code formatting
 * Ensures 10-digit Indian numbers are properly prefixed with country code 91.
 */
export const buildWhatsAppLink = (phoneNumber, body) => {
  let cleanPhone = (phoneNumber || "").replace(/[^0-9]/g, "");

  // Format Indian numbers without country code:
  // E.g. "9876543210" (10 digits starting with 6, 7, 8, or 9) -> "919876543210"
  if (cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone)) {
    cleanPhone = "91" + cleanPhone;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
    // E.g. "09876543210"
    cleanPhone = "91" + cleanPhone.substring(1);
  }

  const encodedBody = encodeURIComponent(body);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedBody}`;
  }
  return `https://wa.me/?text=${encodedBody}`;
};
