// ============================================================
// ASTROLOGICAL ENGINE — Type Definitions
// ============================================================

export type PlanetId =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto';

export type ExtraPointId = 'northNode' | 'southNode' | 'lilith' | 'chiron';

export type CelestialId = PlanetId | ExtraPointId;

export type SignId =
  | 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo'
  | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
export type AspectNature = 'harmonic' | 'tense' | 'neutral';

export type HouseSystem = 'placidus' | 'koch' | 'equal' | 'whole-sign' | 'campanus' | 'regiomontanus';

export type DignityType = 'domicile' | 'exaltation' | 'detriment' | 'fall';

export type ChartType = 'natal' | 'transit' | 'synastry' | 'solar-return' | 'progressions' | 'composite';

// ============================================================
// POSITIONS & CHART DATA
// ============================================================

export interface CelestialPosition {
  longitude: number;      // 0-360°
  latitude?: number;      // Ecliptic latitude
  speed?: number;         // Daily motion (°/day)
  isRetrograde: boolean;
}

export type Positions = Record<string, CelestialPosition>;

export interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  angle: number;          // Target angle (0, 60, 90, 120, 180)
  orb: number;            // Actual orb
  exactness: number;      // 0-1 (1 = exact)
  applying: boolean;
  nature: AspectNature;
}

export interface HouseData {
  cusps: number[];        // 12 cusp longitudes
  ascendant: number;
  midheaven: number;
  system: HouseSystem;
}

export interface NatalChart {
  type: 'natal';
  date: Date;
  positions: Positions;
  houses: HouseData;
  aspects: Aspect[];
  planetHouses: Record<string, number>;
  dignities: Record<string, DignityType>;
  meta: ChartMeta;
}

export interface TransitChart {
  type: 'transit';
  date: Date;
  positions: Positions;
  natalPositions: Positions;
  aspects: Aspect[];
  transitHouses: Record<string, number>;
}

export interface SynastryChart {
  type: 'synastry';
  chartA: NatalChart;
  chartB: NatalChart;
  aspects: Aspect[];
}

export interface CompositeChart {
  type: 'composite';
  positions: Positions;
  houses: HouseData;
  aspects: Aspect[];
  planetHouses: Record<string, number>;
}

export interface SolarReturnChart {
  type: 'solar-return';
  date: Date;
  year: number;
  positions: Positions;
  houses: HouseData;
  aspects: Aspect[];
  planetHouses: Record<string, number>;
  meta: ChartMeta;
}

export interface ProgressedChart {
  type: 'progressions';
  date: Date;
  age: number;
  positions: Positions;
  houses: HouseData;
  aspects: Aspect[];
}

export interface ChartMeta {
  lat: number;
  lng: number;
  timezone: number;
  houseSystem: HouseSystem;
  name?: string;
  city?: string;
}

// ============================================================
// BIRTH DATA INPUT
// ============================================================

export interface BirthData {
  name?: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  lat: number;
  lng: number;
  timezone: number;       // UTC offset in hours
  city?: string;
  country?: string;
}

// ============================================================
// ENGINE OPTIONS
// ============================================================

export interface CalculationOptions {
  houseSystem?: HouseSystem;
  includeExtraPoints?: boolean;  // northNode, lilith, chiron
  includeAsteroids?: boolean;    // ceres, vesta, pallas, juno
  aspectOrbs?: Partial<Record<AspectType, number>>;
}

export const DEFAULT_OPTIONS: CalculationOptions = {
  houseSystem: 'placidus',
  includeExtraPoints: true,
  includeAsteroids: false,
  aspectOrbs: {
    conjunction: 8,
    sextile: 5,
    square: 7,
    trine: 7,
    opposition: 8,
  },
};
