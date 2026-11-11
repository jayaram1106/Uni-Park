import { SavedParkingLocation } from '../types/parking';

const STORAGE_KEY = 'unipark_saved_location';
export const FOURTEEN_HOURS_MS = 14 * 60 * 60 * 1000; // 50,400,000 ms

/**
 * Retrieve saved parking location from LocalStorage.
 * Automatically checks for 14-hour expiry.
 */
export function getSavedLocation(): SavedParkingLocation | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: SavedParkingLocation = JSON.parse(raw);
    const now = Date.now();

    // Check if expired (exceeded 14 hours)
    if (now >= data.expiresAt) {
      clearSavedLocation();
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error reading saved parking location:', err);
    return null;
  }
}

/**
 * Save new parking location with a 14-hour lifespan
 */
export function saveLocation(
  spotInfo: Omit<SavedParkingLocation, 'savedAt' | 'expiresAt'> & {
    savedAt?: number;
    expiresAt?: number;
  }
): SavedParkingLocation {
  const now = spotInfo.savedAt || Date.now();
  const expiresAt = spotInfo.expiresAt || now + FOURTEEN_HOURS_MS;

  const fullRecord: SavedParkingLocation = {
    ...spotInfo,
    savedAt: now,
    expiresAt,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullRecord));
  } catch (err) {
    console.error('Error saving parking location to LocalStorage:', err);
  }

  return fullRecord;
}

/**
 * Explicitly clear saved parking location
 */
export function clearSavedLocation(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing saved parking location:', err);
  }
}

/**
 * Calculate countdown statistics for remaining parking memory
 */
export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  totalSecondsRemaining: number;
  totalSecondsInitial: number;
  progressPercent: number; // 100% when freshly saved, dropping to 0% at expiry
  isExpired: boolean;
}

export function calculateCountdown(savedAt: number, expiresAt: number): CountdownState {
  const now = Date.now();
  const diffMs = expiresAt - now;

  if (diffMs <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: '00h 00m 00s',
      totalSecondsRemaining: 0,
      totalSecondsInitial: Math.floor((expiresAt - savedAt) / 1000),
      progressPercent: 0,
      isExpired: true,
    };
  }

  const totalSecs = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  const totalLifespanSecs = Math.max(1, Math.floor((expiresAt - savedAt) / 1000));
  const progressPercent = Math.min(100, Math.max(0, (totalSecs / totalLifespanSecs) * 100));

  return {
    hours,
    minutes,
    seconds,
    formatted,
    totalSecondsRemaining: totalSecs,
    totalSecondsInitial: totalLifespanSecs,
    progressPercent,
    isExpired: false,
  };
}

/**
 * PRESENTATION HELPER:
 * Adjusts expiration timestamp so the presenter can show what happens near expiry or on expiry.
 */
export function simulateTimeRemaining(minutesRemaining: number): SavedParkingLocation | null {
  const current = getSavedLocation();
  if (!current) return null;

  const now = Date.now();
  const newExpiresAt = now + minutesRemaining * 60 * 1000;
  
  const updated: SavedParkingLocation = {
    ...current,
    expiresAt: newExpiresAt,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error simulating time:', err);
  }

  return updated;
}
