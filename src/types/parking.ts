/**
 * UniPark - Core Type Definitions
 */

export interface ParkingSpot {
  id: string; // e.g., 'A1', 'B15', 'L30'
  row: string; // 'A' through 'L'
  number: number; // 1 through 30
  level: string; // e.g., 'Level G (Ground Floor)', 'Level 1'
  zone: string; // e.g., 'North Concourse', 'Campus Center Deck'
  nearestPillar: string; // e.g., 'Pillar A-1', 'Pillar C-3'
  walkingTime: string; // e.g., '1 min to Main Entrance'
  isAccessible?: boolean;
  isEvCharging?: boolean;
}

export interface ParkingRowInfo {
  row: string;
  level: string;
  zone: string;
  spotCount: number;
  color: string;
  accessibleSpots: number[];
  evSpots: number[];
}

export interface SavedParkingLocation {
  spotId: string;
  row: string;
  number: number;
  level: string;
  zone: string;
  nearestPillar: string;
  walkingTime: string;
  vehiclePlate?: string;
  notes?: string;
  savedAt: number; // timestamp in milliseconds
  expiresAt: number; // timestamp in milliseconds (savedAt + 14 hours)
  source: 'qr_camera' | 'qr_demo' | 'manual_map' | 'url_parameter';
}

export type ViewState = 
  | 'home' 
  | 'scanner' 
  | 'map' 
  | 'confirm' 
  | 'generator';
