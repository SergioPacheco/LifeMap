// ============================================================
// INTERPRETATIONS — English (en)
// Labels and names in English; interpretive texts fall back to PT
// until full EN translations are available
// ============================================================

// For now, re-export PT interpretive texts (content is universal/symbolic)
// TODO: Replace with proper English translations
import { SUN_IN_HOUSE, MOON_IN_HOUSE, MERCURY_IN_HOUSE } from './pt';
import { VENUS_IN_HOUSE, MARS_IN_HOUSE, NORTH_NODE_HOUSE, NORTH_NODE_IN_SIGN } from '../interpret';
import { JUPITER_IN_HOUSE, SATURN_IN_HOUSE, URANUS_IN_HOUSE, NEPTUNE_IN_HOUSE, PLUTO_IN_HOUSE } from '../outer-planets';
import { CHIRON_IN_HOUSE, CHIRON_IN_SIGN } from '../chiron';

export { SUN_IN_HOUSE, MOON_IN_HOUSE, MERCURY_IN_HOUSE };
export { VENUS_IN_HOUSE, MARS_IN_HOUSE };
export { JUPITER_IN_HOUSE, SATURN_IN_HOUSE, URANUS_IN_HOUSE, NEPTUNE_IN_HOUSE, PLUTO_IN_HOUSE };
export { CHIRON_IN_HOUSE, CHIRON_IN_SIGN };
export { NORTH_NODE_HOUSE, NORTH_NODE_IN_SIGN };

// ============================================================
// NAMES AND LABELS — English
// ============================================================
export const SIGN_NAMES: string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const PLANET_NAMES: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
  northNode: 'North Node', chiron: 'Chiron', lilith: 'Lilith',
};

export const MONTHS: string[] = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const SECTION_TITLES = {
  sun: (house: number, sign: string) => `☉ Sun in House ${house} in ${sign}`,
  moon: (house: number, sign: string) => `☽ Moon in House ${house} in ${sign}`,
  mercury: (house: number, sign: string) => `☿ Mercury in House ${house} in ${sign}`,
  venus: (house: number, sign: string) => `♀ Venus in House ${house} in ${sign}`,
  mars: (house: number, sign: string) => `♂ Mars in House ${house} in ${sign}`,
  jupiter: (house: number, sign: string) => `♃ Jupiter in House ${house} in ${sign}`,
  saturn: (house: number, sign: string) => `♄ Saturn in House ${house} in ${sign}`,
  uranus: (house: number, sign: string) => `♅ Uranus in House ${house} in ${sign}`,
  neptune: (house: number, sign: string) => `♆ Neptune in House ${house} in ${sign}`,
  pluto: (house: number, sign: string) => `♇ Pluto in House ${house} in ${sign}`,
  northNode: (house: number, sign: string) => `☊ North Node in House ${house} in ${sign}`,
  chiron: (house: number, sign: string) => `⚷ Chiron in House ${house} in ${sign}`,
  ascendant: (sign: string) => `Ascendant in ${sign}`,
};

export const PLANET_SUBTITLES: Record<string, string> = {
  sun: 'Your solar essence — identity, purpose and vital energy',
  moon: 'Your emotional world — needs, instincts and inner security',
  mercury: 'Your mind and communication — how you think, learn and express',
  venus: 'Your love language — what you attract, value and desire in relationships',
  mars: 'Your drive and action — how you pursue goals, assert yourself and desire',
  jupiter: 'Your path of expansion — where abundance, wisdom and growth flow naturally',
  saturn: 'Your mastery zone — where discipline, structure and lasting achievement are forged',
  uranus: 'Your inner revolution — where you break patterns and express originality',
  neptune: 'Your spiritual portal — where you dissolve boundaries and connect with the transcendent',
  pluto: 'Your transformative power — where death and rebirth operate at the deepest level',
  northNode: 'Your evolutionary purpose — the direction your soul moves toward in this life',
  chiron: 'Your sacred wound — the pain that becomes a gift of healing when integrated',
};

export const LABELS = {
  reportTitle: 'Complete Natal Report',
  reportSubtitle: 'Deep Interpretation',
  positions: 'Planetary Positions',
  houses: 'House Cusps',
  overview: 'Overview',
  potentials: 'Your 5 Greatest Potentials',
  challenges: 'Your 5 Main Challenges',
  conclusion: 'Conclusion',
  advice: 'Practical Advice',
  elements: 'Elements & Modalities',
  dignities: 'Essential Dignities',
  aspects: 'Major Aspects',
  themes: 'Thematic Synthesis',
  quote: '"The stars incline, they do not determine." — astrological maxim',
  sampleNote: 'This was a free sample!',
  sampleFull: 'The complete report contains 20-30 pages with detailed interpretation of all planets, houses, aspects and forecasts.',
  buyNow: 'Full version:',
  buyInstant: 'Buy now and download instantly — 100% in your browser.',
  natalChart: 'Your Natal Chart',
  retrograde: '(retrograde)',
  // Annual
  annualTitle: 'Annual Forecast',
  annualSubtitle: 'Transits and trends',
  profection: 'Annual Profection — Theme of the Year',
  houseInFocus: 'in Focus',
  rulerOfYear: 'Ruler of the Year',
  eclipses: 'Eclipses of the Year',
  jupiterExpansion: 'The Expansion of the Year',
  saturnLesson: 'The Lesson of the Year',
  conclusionAnnual: 'Conclusion — Your Year in Perspective',
  // Relationship
  relationshipTitle: 'Relationship Report',
  compatibility: 'Compatibility',
  emotionalConnection: 'Emotional Connection',
  attractionChemistry: 'Attraction & Chemistry',
  communication: 'Communication',
  commitmentLimits: 'Commitment and Limits — Saturn',
  growthPotential: 'Growth Potential',
  challengesTension: 'Points of Tension',
  // Psychological
  psychTitle: 'Deep Psychological Analysis',
  egoStructure: 'Ego Structure — Sun and Ascendant',
  emotionalWorld: 'Emotional World — Moon',
  mentalProcesses: 'Mental Processes — Mercury',
  lovePatterns: 'Love Patterns — Venus',
  vitalForce: 'Vital Force — Mars',
  shadow: 'Shadow — Pluto',
  wound: 'Core Wound — Chiron',
  unconscious: 'Unconscious — 12th House and Neptune',
  familyPatterns: 'Family Patterns — Moon, 4th House and Saturn',
  defenseMechanisms: 'Defense Mechanisms — Saturn and Tense Aspects',
  integrationPath: 'Integration Path — North Node',
  // Career
  careerTitle: 'Career & Vocation',
  midheaven: 'Midheaven',
  house10: '10th House — Vocation and Recognition',
  house6: '6th House — Routine and Work',
  house2: '2nd House — Resources and Talents',
  // Seven Sins
  sinsTitle: 'The Seven Sins',
  pride: 'Pride — Sun',
  lust: 'Lust — Venus and Mars',
  greed: 'Greed — Saturn',
  gluttony: 'Gluttony — Jupiter',
  wrath: 'Wrath — Mars',
  envy: 'Envy — Pluto',
  sloth: 'Sloth — Neptune',
};

export const TRANSITIONS = {
  afterOverview: 'With this foundation in mind, let us explore how it unfolds in each area of life.',
  afterPersonalPlanets: 'The aspects between planets reveal how these energies interact — where there is flow and where there is tension.',
  afterAspects: 'From these interactions emerge patterns — central themes that define your life experience.',
  beforeConclusion: 'Bringing everything together, your chart tells a coherent story — and it is time to synthesize.',
};
