import { ParkingRowInfo, ParkingSpot } from '../types/parking';

export const PARKING_ROWS: ParkingRowInfo[] = [
  {
    row: 'A',
    level: 'Level G (Ground Floor)',
    zone: 'North Concourse · Main Entrance',
    spotCount: 30,
    color: '#2563EB', // Blue
    accessibleSpots: [1, 2],
    evSpots: [5, 6],
  },
  {
    row: 'B',
    level: 'Level G (Ground Floor)',
    zone: 'North Concourse · Welcome Pavilion',
    spotCount: 30,
    color: '#0284C7', // Sky
    accessibleSpots: [1, 2],
    evSpots: [3, 4],
  },
  {
    row: 'C',
    level: 'Level G (Ground Floor)',
    zone: 'North Concourse · Visitor Express',
    spotCount: 30,
    color: '#0D9488', // Teal
    accessibleSpots: [],
    evSpots: [7, 8],
  },
  {
    row: 'D',
    level: 'Level 1 (First Deck)',
    zone: 'East Wing · Engineering Complex',
    spotCount: 30,
    color: '#4F46E5', // Indigo
    accessibleSpots: [1],
    evSpots: [15, 16],
  },
  {
    row: 'E',
    level: 'Level 1 (First Deck)',
    zone: 'East Wing · Science & Tech Quad',
    spotCount: 30,
    color: '#7C3AED', // Violet
    accessibleSpots: [],
    evSpots: [10, 11],
  },
  {
    row: 'F',
    level: 'Level 1 (First Deck)',
    zone: 'East Wing · Research Labs',
    spotCount: 30,
    color: '#9333EA', // Purple
    accessibleSpots: [],
    evSpots: [],
  },
  {
    row: 'G',
    level: 'Level 2 (Second Deck)',
    zone: 'West Wing · University Library',
    spotCount: 30,
    color: '#059669', // Emerald
    accessibleSpots: [1],
    evSpots: [5, 6],
  },
  {
    row: 'H',
    level: 'Level 2 (Second Deck)',
    zone: 'West Wing · Student Activity Center',
    spotCount: 30,
    color: '#16A34A', // Green
    accessibleSpots: [],
    evSpots: [],
  },
  {
    row: 'I',
    level: 'Level 2 (Second Deck)',
    zone: 'West Wing · Dining & Marketplace',
    spotCount: 30,
    color: '#65A30D', // Lime
    accessibleSpots: [],
    evSpots: [12, 13],
  },
  {
    row: 'J',
    level: 'Level 3 (Rooftop Deck)',
    zone: 'South Deck · Sports Arena & Gym',
    spotCount: 30,
    color: '#D97706', // Amber
    accessibleSpots: [1],
    evSpots: [],
  },
  {
    row: 'K',
    level: 'Level 3 (Rooftop Deck)',
    zone: 'South Deck · University Auditorium',
    spotCount: 30,
    color: '#EA580C', // Orange
    accessibleSpots: [],
    evSpots: [18, 19],
  },
  {
    row: 'L',
    level: 'Level 3 (Rooftop Deck)',
    zone: 'South Deck · Stadium & Event Field',
    spotCount: 30,
    color: '#DC2626', // Red
    accessibleSpots: [],
    evSpots: [],
  },
];

/**
 * Generate spot details dynamically from spotId string like 'A1' or 'L30'
 */
export function getSpotDetails(spotId: string): ParkingSpot | null {
  if (!spotId) return null;
  const match = spotId.trim().toUpperCase().match(/^([A-L])([1-9]|[12][0-9]|30)$/);
  if (!match) return null;

  const rowLetter = match[1];
  const spotNum = parseInt(match[2], 10);
  const rowInfo = PARKING_ROWS.find(r => r.row === rowLetter);

  if (!rowInfo) return null;

  const pillarNum = Math.ceil(spotNum / 5);
  const walkingMinutes = rowLetter <= 'C' ? '1 min' : rowLetter <= 'F' ? '2 mins' : rowLetter <= 'I' ? '3 mins' : '4 mins';

  return {
    id: `${rowLetter}${spotNum}`,
    row: rowLetter,
    number: spotNum,
    level: rowInfo.level,
    zone: rowInfo.zone,
    nearestPillar: `Pillar ${rowLetter}-${pillarNum}`,
    walkingTime: `${walkingMinutes} from Central Elevator Core`,
    isAccessible: rowInfo.accessibleSpots.includes(spotNum),
    isEvCharging: rowInfo.evSpots.includes(spotNum),
  };
}

/**
 * Check if a spot string is valid (e.g. 'A1', 'a1', 'L30')
 */
export function isValidSpotId(spotId: string): boolean {
  return getSpotDetails(spotId) !== null;
}

/**
 * Normalizes input e.g. " a1 " -> "A1"
 */
export function normalizeSpotId(input: string): string | null {
  const spot = getSpotDetails(input);
  return spot ? spot.id : null;
}

/**
 * Curated list of popular demonstration parking spots
 */
export const SAMPLE_DEMO_SPOTS = ['A1', 'A4', 'B12', 'C07', 'E15', 'G08', 'J02', 'L30'];
