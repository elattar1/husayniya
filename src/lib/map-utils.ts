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
 * Looks for patterns like:
 * - (30.8656, 31.9192)
 * - [30.8656, 31.9192]
 * - 📍 30.8656, 31.9192
 */
export function extractCoordinates(text?: string | null): Coordinates | null {
  if (!text) return null;
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
 * Attaches map coordinates to an address string so it persists in existing database columns.
 */
export function formatAddressWithCoordinates(baseAddress: string, coords: Coordinates): string {
  const clean = cleanDisplayAddress(baseAddress);
  const formattedCoords = `(${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`;
  return clean ? `${clean} ${formattedCoords}` : `الحسينية ${formattedCoords}`;
}

/**
 * Removes raw coordinate suffixes for human-friendly text display.
 */
export function cleanDisplayAddress(address?: string | null): string {
  if (!address) return "";
  return address
    .replace(/\s*(?:📍|\(|\[)?\s*[0-9]{1,2}\.[0-9]{3,8}\s*,\s*[0-9]{1,2}\.[0-9]{3,8}(?:\)|\])?/g, "")
    .replace(/<!-- CHAT_V1: [\s\S]*? -->/, "")
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

  // If store address is provided, set as origin if user wants
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  return url;
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
