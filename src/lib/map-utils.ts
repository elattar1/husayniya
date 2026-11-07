/**
 * Map and Location Utilities for Husayniya Platform
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export const DEFAULT_HUSAYNIYA_CENTER: Coordinates = {
  lat: 30.8656,
  lng: 31.9192,
};

export const HUSAYNIYA_LANDMARKS = [
  { name: "وسط البلد - ميدان الساعة", lat: 30.866, lng: 31.9195 },
  { name: "مستشفى الحسينية المركزي", lat: 30.8647, lng: 31.9215 },
  { name: "مجلس مدينة الحسينية", lat: 30.8672, lng: 31.9184 },
  { name: "شارع المركز ومجمع المحاكم", lat: 30.868, lng: 31.917 },
  { name: "شارع المدارس ومدرسة السادات", lat: 30.8625, lng: 31.924 },
  { name: "كوبري البحر وترعة السماعنة", lat: 30.863, lng: 31.922 },
  { name: "مساكن الساحات وموقف الحسينية", lat: 30.871, lng: 31.916 },
];

/**
 * Extracts latitude and longitude from text if present.
 * Supports invisible comments <!-- GPS:lat,lng --> as well as (lat, lng) patterns.
 */
export function extractCoordinates(text?: string | null): Coordinates | null {
  if (!text) return null;
  // Pattern 1: HTML comment comment format <!-- GPS:30.8656,31.9192 -->
  const gpsMatch = text.match(/<!--\s*GPS:\s*([0-9]{1,2}\.[0-9]{3,8})\s*,\s*([0-9]{1,2}\.[0-9]{3,8})\s*-->/i);
  if (gpsMatch) {
    const lat = parseFloat(gpsMatch[1]);
    const lng = parseFloat(gpsMatch[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }

  // Pattern 2: (lat, lng) or [lat, lng]
  const match = text.match(/(?:📍|\(|\[|q=)?\s*([0-9]{1,2}\.[0-9]{3,8})\s*,\s*([0-9]{1,2}\.[0-9]{3,8})/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return null;
}

/**
 * Attaches map coordinates to an address string silently inside an HTML comment
 * so it stays hidden from customer view while persisting in the database.
 */
export function formatAddressWithCoordinates(baseAddress: string, coords: Coordinates): string {
  const clean = cleanDisplayAddress(baseAddress);
  const formattedCoords = `<!-- GPS:${coords.lat.toFixed(6)},${coords.lng.toFixed(6)} -->`;
  return clean ? `${clean} ${formattedCoords}` : formattedCoords;
}

/**
 * Removes hidden GPS comments and raw coordinate suffixes for human-friendly text display.
 */
export function cleanDisplayAddress(address?: string | null): string {
  if (!address) return "";
  return address
    .replace(/<!--\s*GPS:[\s\S]*?-->/gi, "")
    .replace(/<!--\s*CHAT_V1:[\s\S]*?-->/gi, "")
    .replace(/\s*(?:📍|\(|\[)?\s*[0-9]{1,2}\.[0-9]{3,8}\s*,\s*[0-9]{1,2}\.[0-9]{3,8}(?:\)|\])?/g, "")
    .trim();
}

/**
 * Creates a Google Maps turn-by-turn navigation / directions link for the delivery driver.
 * On mobile devices, this directly launches the Google Maps App in Driving Navigation mode.
 */
export function getGoogleNavigationUrl(customerAddress: string, storeAddress?: string | null): string {
  const coords = extractCoordinates(customerAddress);
  const destination = coords
    ? `${coords.lat},${coords.lng}`
    : encodeURIComponent(cleanDisplayAddress(customerAddress) + " الحسينية الشرقية");

  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

/**
 * Creates a Google Maps pin view URL.
 */
export function getGoogleMapsPinUrl(customerAddress: string): string {
  const coords = extractCoordinates(customerAddress);
  if (coords) {
    return `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=17`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanDisplayAddress(customerAddress) + " الحسينية الشرقية")}`;
}
