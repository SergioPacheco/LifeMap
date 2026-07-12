// ============================================================
// ECLIPSES.TS — Eclipses Solares e Lunares + Impacto Pessoal
// Referência: Celeste Teal "Eclipses", Café Astrology
//
// Regras de interpretação:
// - Eclipse Solar = Lua Nova potenciada → novos começos, sementes de 18 meses
// - Eclipse Lunar = Lua Cheia potenciada → revelações, liberação, culminação
// - Impacto pessoal: aspecto (conj/opp/sq) a planetas/ângulos natais (orbe 3-5°)
// - Eixo nodal: mais intenso quando no eixo nodal natal
// - Duração do efeito: 6 meses antes a 6 meses depois
// - Casa natal onde cai = área de vida ativada
// ============================================================

import type { NatalChart } from '../types';
import type { CalendarConfig, CalendarEvent } from './types';
import { getSignIndex, norm } from '../calculations';
import { getHouseForLongitude } from '../houses';

// ============================================================
// ECLIPSE DATA 2024-2028 (pré-calculado — graus zodiacais)
// Fonte: NASA + Café Astrology + BigBeautifulSky
// ============================================================

interface EclipseData {
  date: string;          // YYYY-MM-DD
  type: 'solar-total' | 'solar-annular' | 'solar-partial' | 'lunar-total' | 'lunar-partial' | 'lunar-penumbral';
  degree: number;        // Longitude zodiacal (0-360)
  sign: number;          // Signo (0-11)
  degreeInSign: number;  // Grau dentro do signo
}

// Eclipses 2024-2028 com graus zodiacais
const ECLIPSE_DATABASE: EclipseData[] = [
  // 2024
  { date: '2024-03-25', type: 'lunar-penumbral', degree: 185.2, sign: 6, degreeInSign: 5 },  // 5° Libra
  { date: '2024-04-08', type: 'solar-total', degree: 19.2, sign: 0, degreeInSign: 19 },       // 19° Áries
  { date: '2024-09-18', type: 'lunar-partial', degree: 355.7, sign: 11, degreeInSign: 25 },   // 25° Peixes
  { date: '2024-10-02', type: 'solar-annular', degree: 190.1, sign: 6, degreeInSign: 10 },    // 10° Libra

  // 2025
  { date: '2025-03-14', type: 'lunar-total', degree: 173.0, sign: 5, degreeInSign: 23 },      // 23° Virgem
  { date: '2025-03-29', type: 'solar-partial', degree: 8.5, sign: 0, degreeInSign: 8 },       // 8° Áries
  { date: '2025-09-07', type: 'lunar-total', degree: 165.0, sign: 5, degreeInSign: 15 },      // 15° Peixes (Virgem opp)
  { date: '2025-09-21', type: 'solar-partial', degree: 178.5, sign: 5, degreeInSign: 28 },    // 28° Virgem

  // 2026
  { date: '2026-02-17', type: 'solar-annular', degree: 328.8, sign: 10, degreeInSign: 28 },   // 28° Aquário
  { date: '2026-03-03', type: 'lunar-total', degree: 162.5, sign: 5, degreeInSign: 12 },      // 12° Virgem
  { date: '2026-08-12', type: 'solar-total', degree: 139.8, sign: 4, degreeInSign: 19 },      // 19° Leão
  { date: '2026-08-28', type: 'lunar-partial', degree: 334.9, sign: 11, degreeInSign: 4 },    // 4° Peixes

  // 2027
  { date: '2027-02-06', type: 'solar-annular', degree: 317.6, sign: 10, degreeInSign: 17 },   // 17° Aquário
  { date: '2027-02-20', type: 'lunar-penumbral', degree: 152.3, sign: 4, degreeInSign: 2 },   // 2° Leão
  { date: '2027-07-18', type: 'lunar-penumbral', degree: 295.8, sign: 9, degreeInSign: 25 },  // 25° Capricórnio
  { date: '2027-08-02', type: 'solar-total', degree: 129.5, sign: 4, degreeInSign: 9 },       // 9° Leão
  { date: '2027-08-17', type: 'lunar-penumbral', degree: 324.2, sign: 10, degreeInSign: 24 }, // 24° Aquário

  // 2028
  { date: '2028-01-12', type: 'lunar-partial', degree: 291.8, sign: 9, degreeInSign: 21 },    // 21° Câncer
  { date: '2028-01-26', type: 'solar-annular', degree: 306.3, sign: 10, degreeInSign: 6 },    // 6° Aquário
  { date: '2028-07-06', type: 'lunar-partial', degree: 104.5, sign: 3, degreeInSign: 14 },    // 14° Câncer
  { date: '2028-07-22', type: 'solar-total', degree: 119.7, sign: 3, degreeInSign: 29 },      // 29° Câncer
  { date: '2028-12-31', type: 'lunar-total', degree: 280.5, sign: 3, degreeInSign: 10 },      // 10° Câncer
];

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

// ============================================================
// MAIN: Get eclipse events for a month with personal impact
// ============================================================

export function getEclipseEvents(
  natal: NatalChart,
  year: number,
  month: number,
  cfg: CalendarConfig
): CalendarEvent[] {
  if (!cfg.eclipses.show) return [];

  const events: CalendarEvent[] = [];
  const orb = cfg.eclipses.personalOrb;

  // Find eclipses in this month (or within pre-effect range)
  for (const eclipse of ECLIPSE_DATABASE) {
    const [eYear, eMonth, eDay] = eclipse.date.split('-').map(Number);
    const eclipseDate = new Date(eYear, eMonth - 1, eDay);

    // Check if eclipse falls within month (or pre-effect window)
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const preEffectStart = new Date(eclipseDate.getTime() - cfg.eclipses.preEffectDays * 86400000);

    const isInMonth = eclipseDate >= monthStart && eclipseDate <= monthEnd;
    const isPreEffect = cfg.eclipses.showPreEffect && preEffectStart <= monthEnd && eclipseDate >= monthStart;

    if (!isInMonth && !isPreEffect) continue;

    // Calculate personal impact
    const impact = calculatePersonalImpact(eclipse, natal, orb);
    const house = getHouseForLongitude(eclipse.degree, natal.houses.cusps);
    const isSolar = eclipse.type.startsWith('solar');

    const typeLabel = isSolar ? 'Eclipse Solar' : 'Eclipse Lunar';
    const typeEmoji = isSolar ? '🌑' : '🌕';
    const signName = SIGN_NAMES[eclipse.sign];

    let summary = `${typeLabel} em ${eclipse.degreeInSign}° ${signName} — Casa ${house} do seu mapa.`;
    if (isSolar) {
      summary += ' Novos começos poderosos nesta área de vida. Sementes plantadas agora frutificam em até 18 meses.';
    } else {
      summary += ' Culminação e revelação. O que estava oculto vem à luz. Momento de liberar o que não serve mais.';
    }

    let importance = 7;
    let detail = '';

    if (impact.touchedPoints.length > 0) {
      importance = 10; // Eclipse pessoal = máxima importância
      const points = impact.touchedPoints.map(p => p.label).join(', ');
      detail = `⚡ ECLIPSE PESSOAL: ativa diretamente ${points} no seu mapa natal. Este é um dos trânsitos mais significativos do ano — mudanças profundas e irreversíveis nesta área de vida.`;
      summary = `${typeEmoji} ${typeLabel} PESSOAL em ${eclipse.degreeInSign}° ${signName} — ativa ${points}. ${isSolar ? 'Reinício poderoso.' : 'Culminação decisiva.'}`;
    }

    events.push({
      type: isSolar ? 'eclipse-solar' : 'eclipse-lunar',
      date: eclipseDate,
      eclipseType: eclipse.type,
      eclipseDegree: eclipse.degree,
      eclipseNatalAspect: impact.touchedPoints.length > 0 ? impact.touchedPoints[0].point : undefined,
      moonSign: eclipse.sign,
      moonHouseNatal: house,
      themes: getEclipseThemes(house, isSolar),
      importance,
      energy: 'neutral',
      title: `${typeEmoji} ${typeLabel} em ${signName} (${eclipse.degreeInSign}°)`,
      summary,
      detail: detail || undefined,
      advice: isSolar
        ? 'Defina intenções claras. Novos começos são potencializados.'
        : 'Libere o que já cumpriu seu propósito. Encerre ciclos.',
    });
  }

  return events;
}

// ============================================================
// Calculate if eclipse touches natal points
// ============================================================

interface PersonalImpact {
  isPersonal: boolean;
  touchedPoints: { point: string; label: string; aspect: string; orb: number }[];
}

function calculatePersonalImpact(eclipse: EclipseData, natal: NatalChart, maxOrb: number): PersonalImpact {
  const touchedPoints: PersonalImpact['touchedPoints'] = [];

  const POINT_LABELS: Record<string, string> = {
    sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
    jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
    northNode: 'Nodo Norte', chiron: 'Quíron', asc: 'Ascendente', mc: 'Meio do Céu',
  };

  // Check all natal planets + angles
  const pointsToCheck: Record<string, number> = {};

  for (const [id, pos] of Object.entries(natal.positions)) {
    if (POINT_LABELS[id]) {
      pointsToCheck[id] = pos.longitude;
    }
  }
  pointsToCheck['asc'] = natal.houses.ascendant;
  pointsToCheck['mc'] = natal.houses.midheaven;

  for (const [point, lon] of Object.entries(pointsToCheck)) {
    // Conjunction
    const conjOrb = angDiff(eclipse.degree, lon);
    if (conjOrb <= maxOrb) {
      touchedPoints.push({ point, label: POINT_LABELS[point] || point, aspect: 'conjunção', orb: conjOrb });
    }

    // Opposition
    const oppOrb = angDiff(eclipse.degree, norm(lon + 180));
    if (oppOrb <= maxOrb) {
      touchedPoints.push({ point, label: POINT_LABELS[point] || point, aspect: 'oposição', orb: oppOrb });
    }

    // Square
    const sq1 = angDiff(eclipse.degree, norm(lon + 90));
    const sq2 = angDiff(eclipse.degree, norm(lon - 90));
    const sqOrb = Math.min(sq1, sq2);
    if (sqOrb <= maxOrb) {
      touchedPoints.push({ point, label: POINT_LABELS[point] || point, aspect: 'quadratura', orb: sqOrb });
    }
  }

  // Sort by orb (tighter = more impactful)
  touchedPoints.sort((a, b) => a.orb - b.orb);

  return {
    isPersonal: touchedPoints.length > 0,
    touchedPoints,
  };
}

// ============================================================
// HELPERS
// ============================================================

function angDiff(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function getEclipseThemes(house: number, isSolar: boolean): any[] {
  const HOUSE_THEMES: Record<number, string[]> = {
    1: ['health'], 2: ['finances'], 3: ['communication'], 4: ['family'],
    5: ['love', 'creativity'], 6: ['health', 'career'], 7: ['love'],
    8: ['transformation', 'finances'], 9: ['travel', 'spirituality'],
    10: ['career'], 11: ['freedom'], 12: ['spirituality'],
  };
  const themes = HOUSE_THEMES[house] || [];
  if (isSolar) themes.push('creativity');
  return [...new Set(themes)] as any[];
}
