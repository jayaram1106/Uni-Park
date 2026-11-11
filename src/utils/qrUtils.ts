import QRCode from 'qrcode';
import { isValidSpotId, normalizeSpotId } from './parkingData';

/**
 * Extracts a valid parking spot ID from a scanned QR text or URL.
 * Handles:
 *  - Full URLs: "https://domain.com/?spot=A1"
 *  - Fragment URLs: "https://domain.com/#spot=B12"
 *  - Direct text: "A1", "a1", "Spot: C5", "Row A Spot 1"
 */
export function extractSpotFromInput(rawInput: string): string | null {
  if (!rawInput) return null;
  const trimmed = rawInput.trim();

  // Try URL parsing
  try {
    const url = new URL(trimmed);
    const spotParam = url.searchParams.get('spot');
    if (spotParam && isValidSpotId(spotParam)) {
      return normalizeSpotId(spotParam);
    }

    // Check hash param e.g. #spot=A1
    if (url.hash) {
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
      const hashSpot = hashParams.get('spot');
      if (hashSpot && isValidSpotId(hashSpot)) {
        return normalizeSpotId(hashSpot);
      }
    }
  } catch {
    // Not a valid full URL, fallback to text matching
  }

  // Check query-string format like "?spot=A1"
  if (trimmed.includes('spot=')) {
    const match = trimmed.match(/spot=([a-zA-Z0-9]+)/i);
    if (match && isValidSpotId(match[1])) {
      return normalizeSpotId(match[1]);
    }
  }

  // Check if the trimmed input itself is a valid spot ID (e.g. "A1", "B15")
  if (isValidSpotId(trimmed)) {
    return normalizeSpotId(trimmed);
  }

  // Regex fallback: look for letter A-L followed by 1-30 in the text
  const matchSpot = trimmed.match(/\b([A-La-l])[-_ ]?([1-9]|[12][0-9]|30)\b/);
  if (matchSpot) {
    const candidate = `${matchSpot[1].toUpperCase()}${matchSpot[2]}`;
    if (isValidSpotId(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Builds the full URL for a spot QR code based on the current app URL or origin
 */
export function generateSpotUrl(spotId: string): string {
  if (typeof window === 'undefined') {
    return `https://unipark.local/?spot=${spotId}`;
  }

  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?spot=${spotId}`;
}

/**
 * Generates a high-resolution QR code data URL (PNG)
 */
export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0F172A', // Slate 900
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error resistance
    });
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    throw err;
  }
}
