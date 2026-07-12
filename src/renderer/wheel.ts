// ============================================================
// WHEEL.TS — Readable astrological wheel
// Dark LifeMap theme with Astro.com-inspired geometry and sizing
// Layout: Sign ring (outer) → House ring with planets → Aspect center
// ============================================================

import type { NatalChart, Positions, Aspect, AspectType } from '../engine/types';
import { getSignIndex, getDegreeInSign, norm } from '../engine/calculations';

const NS = 'http://www.w3.org/2000/svg';
const CX = 350, CY = 350;

// Ring radii — clean proportions
const R_OUTER = 330;         // Outer edge
const R_SIGN_IN = 286;       // Inner edge of sign ring
const R_HOUSE_OUT = 286;     // = sign ring inner (house ring starts here)
const R_PLANET = 252;        // Planet symbols start here, then stack inward
const R_HOUSE_IN = 116;      // Inner edge of house ring
const R_CENTER = 116;        // Aspect lines inside here

// Colors — high-contrast LifeMap dark theme
const COL = {
  bg: '#0d0d14',
  signRing: '#161622',
  houseBg: '#1a1a28',
  centerBg: '#101018',
  line: '#4a4a63',
  lineLight: '#56566d',
  axis: '#d8d2c0',
  axisLabel: '#f4efe3',
  text: '#f4efe3',
  textDim: '#c9c2ae',
  labelBlue: '#66a6ff',
  retroRed: '#ff5a5a',
  signFire: '#ff5a45',
  signEarth: '#70d66a',
  signAir: '#f0b344',
  signWater: '#5fa8ff',
};

const SIGN_SYMBOLS = ['♈︎','♉︎','♊︎','♋︎','♌︎','♍︎','♎︎','♏︎','♐︎','♑︎','♒︎','♓︎'];
const SIGN_COLORS = [COL.signFire, COL.signEarth, COL.signAir, COL.signWater, COL.signFire, COL.signEarth, COL.signAir, COL.signWater, COL.signFire, COL.signEarth, COL.signAir, COL.signWater];

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', southNode: '☋', lilith: '⚸', chiron: '⚷',
  ceres: '⚳', vesta: '⚶', pallas: '⚴', juno: '⚵',
  vertex: 'Vx', partOfFortune: '⊕',
};

const PLANET_COLORS: Record<string, string> = {
  sun: '#f1c95b', moon: '#f3f0e6', mercury: '#d8a63a', venus: '#62d96f', mars: '#ff5a5a',
  jupiter: '#b783ff', saturn: '#c9c2ae', uranus: '#58b7ff', neptune: '#4ed0bf',
  pluto: '#ff6b6b', northNode: '#f3f0e6', southNode: '#9d9686', lilith: '#f3f0e6', chiron: '#d8a63a',
  ceres: '#9fda5a', vesta: '#ffad42', pallas: '#62c7ff', juno: '#f07ab2',
  vertex: '#b783ff', partOfFortune: '#f1c95b',
};

const ASPECT_STYLES: Record<AspectType, { color: string; width: number; dash: string }> = {
  conjunction: { color: '#4bd06d', width: 1.7, dash: '' },
  sextile: { color: '#438cff', width: 1.1, dash: '' },
  square: { color: '#ff4b4b', width: 1.5, dash: '' },
  trine: { color: '#438cff', width: 1.5, dash: '' },
  opposition: { color: '#ff4b4b', width: 1.3, dash: '' },
};

const OMITTED_WHEEL_POINTS = new Set(['southNode']);

// ============================================================
// MAIN RENDER
// ============================================================

export function renderWheel(chart: NatalChart): string {
  const asc = chart.houses.ascendant;
  let svg = `<svg xmlns="${NS}" viewBox="0 0 700 700" width="100%" height="100%" style="font-family: Arial, Helvetica, sans-serif;">`;

  // Background
  svg += `<rect x="0" y="0" width="700" height="700" fill="${COL.bg}"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_OUTER + 10}" fill="${COL.bg}"/>`;

  // Sign ring background
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_OUTER}" fill="${COL.signRing}" stroke="${COL.line}" stroke-width="1.2"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_SIGN_IN}" fill="${COL.houseBg}" stroke="${COL.line}" stroke-width="1"/>`;

  // Inner circle
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_HOUSE_IN}" fill="${COL.centerBg}" stroke="${COL.line}" stroke-width="0.9"/>`;

  // Sign ring: 12 divisions with symbols
  svg += drawSigns(asc);

  // House lines + numbers
  svg += drawHouses(chart.houses.cusps, asc);

  // Aspect lines (center)
  svg += drawAspects(chart.aspects, chart.positions, asc);

  // Planets
  svg += drawPlanets(chart.positions, asc);

  // Axis labels
  svg += drawAxes(chart.houses, asc);

  svg += '</svg>';
  return svg;
}

// ============================================================
// POLAR
// ============================================================

function pol(r: number, angleDeg: number): { x: number; y: number } {
  const rad = angleDeg * Math.PI / 180;
  return { x: CX - r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

// ============================================================
// SIGNS — simple divider lines + symbols
// ============================================================

function drawSigns(asc: number): string {
  let s = '';

  const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
  const SIGN_ELEMENTS = ['Fogo','Terra','Ar','Água','Fogo','Terra','Ar','Água','Fogo','Terra','Ar','Água'];
  const SIGN_MODALITIES = ['Cardinal','Fixo','Mutável','Cardinal','Fixo','Mutável','Cardinal','Fixo','Mutável','Cardinal','Fixo','Mutável'];
  const SIGN_RULERS = ['Marte','Vênus','Mercúrio','Lua','Sol','Mercúrio','Vênus','Plutão','Júpiter','Saturno','Urano','Netuno'];

  for (let i = 0; i < 12; i++) {
    const startAngle = i * 30 - asc;

    // Divider line
    const p1 = pol(R_SIGN_IN, startAngle);
    const p2 = pol(R_OUTER, startAngle);
    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${COL.line}" stroke-width="0.9"/>`;

    // Symbol centered in segment — with tooltip
    const midAngle = startAngle + 15;
    const midR = (R_OUTER + R_SIGN_IN) / 2;
    const p = pol(midR, midAngle);
    const color = SIGN_COLORS[i];
    const tooltip = `${SIGN_NAMES[i]} — ${SIGN_ELEMENTS[i]} / ${SIGN_MODALITIES[i]} — Regente: ${SIGN_RULERS[i]}`;

    s += `<g style="cursor:pointer">`;
    s += `<title>${tooltip}</title>`;
    s += `<text x="${p.x}" y="${p.y + 10}" text-anchor="middle" font-size="34" font-weight="700" fill="${color}" font-family="DejaVu Sans, Noto Sans Symbols 2, serif">${SIGN_SYMBOLS[i]}</text>`;
    s += `</g>`;

    // DEGREE RULER — 30 ticks per sign (inside edge of sign ring)
    // Long tick every 10°, medium every 5°, short every 1°
    for (let d = 1; d < 30; d++) {
      const tickAngle = startAngle + d;
      const isLong = d % 10 === 0;  // 10°, 20°
      const isMed = d % 5 === 0;    // 5°, 15°, 25°

      // Inner ruler (on R_SIGN_IN edge — pointing inward into house ring)
      const tickLen = isLong ? 8 : isMed ? 5.5 : 2.5;
      const t1 = pol(R_SIGN_IN, tickAngle);
      const t2 = pol(R_SIGN_IN - tickLen, tickAngle);
      s += `<line x1="${t1.x}" y1="${t1.y}" x2="${t2.x}" y2="${t2.y}" stroke="${COL.line}" stroke-width="${isLong ? 0.8 : 0.35}"/>`;

      // Outer ruler (on R_OUTER edge — pointing outward)
      const t3 = pol(R_OUTER, tickAngle);
      const t4 = pol(R_OUTER + tickLen * 0.7, tickAngle);
      s += `<line x1="${t3.x}" y1="${t3.y}" x2="${t4.x}" y2="${t4.y}" stroke="${COL.line}" stroke-width="${isLong ? 0.8 : 0.35}"/>`;
    }
  }

  return s;
}

// ============================================================
// HOUSES — lines from inner to outer + numbers
// ============================================================

function drawHouses(cusps: number[], asc: number): string {
  let s = '';

  const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
  const HOUSE_THEMES = [
    'Identidade, aparência, novos começos',
    'Dinheiro, valores, autoestima',
    'Comunicação, irmãos, aprendizado',
    'Lar, família, raízes',
    'Criatividade, romance, filhos',
    'Trabalho, saúde, rotina',
    'Relacionamentos, parcerias',
    'Transformação, sexualidade, crises',
    'Expansão, viagens, filosofia',
    'Carreira, vocação, reputação',
    'Amigos, grupos, futuro',
    'Espiritualidade, inconsciente, retiro',
  ];

  for (let i = 0; i < 12; i++) {
    const angle = cusps[i] - asc;
    const isAxis = i === 0 || i === 3 || i === 6 || i === 9;

    // House cusp line
    const p1 = pol(R_HOUSE_IN, angle);
    const p2 = pol(R_HOUSE_OUT, angle);
    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${isAxis ? COL.axis : COL.line}" stroke-width="${isAxis ? 2 : 0.75}"/>`;

    // House number — centered in sector, near inner ring, with tooltip
    const nextAngle = cusps[(i + 1) % 12] - asc;
    const sectorMid = angle + ((((nextAngle - angle) % 360) + 360) % 360) * 0.5;
    const numP = pol(R_HOUSE_IN + 24, sectorMid);

    const cuspSign = SIGN_NAMES[getSignIndex(cusps[i])];
    const cuspDeg = Math.floor(getDegreeInSign(cusps[i]));
    const houseTooltip = `Casa ${i + 1} — ${HOUSE_THEMES[i]}\nCúspide: ${cuspDeg}° ${cuspSign}`;

    s += `<g style="cursor:pointer">`;
    s += `<title>${houseTooltip}</title>`;
    s += `<text x="${numP.x}" y="${numP.y + 5}" text-anchor="middle" font-size="15" fill="${COL.textDim}" font-family="Arial, Helvetica, sans-serif">${i + 1}</text>`;
    s += `</g>`;

    // DEGREE RULER on inner circle edge (R_HOUSE_IN) — ticks pointing inward
    // Calculate sector span in degrees
    const sectorSpan = ((((nextAngle - angle) % 360) + 360) % 360) || 30;
    const ticksPerHouse = Math.min(30, Math.round(sectorSpan)); // 1 tick per degree up to 30
    for (let d = 1; d < ticksPerHouse; d++) {
      const tickAngle = angle + (sectorSpan * d / ticksPerHouse);
      const isLong = (d * 30 / ticksPerHouse) % 10 < 1;  // approximate 10° marks
      const isMed = (d * 30 / ticksPerHouse) % 5 < 1;    // approximate 5° marks

      const tickLen = isLong ? 5 : isMed ? 3.5 : 2;
      const t1 = pol(R_HOUSE_IN, tickAngle);
      const t2 = pol(R_HOUSE_IN + tickLen, tickAngle);
      s += `<line x1="${t1.x}" y1="${t1.y}" x2="${t2.x}" y2="${t2.y}" stroke="${COL.lineLight}" stroke-width="0.35"/>`;
    }
  }

  return s;
}

// ============================================================
// ASPECTS — thin lines inside center circle
// ============================================================

function drawAspects(aspects: Aspect[], positions: Positions, asc: number): string {
  let s = '';

  const topAspects = aspects
    .filter(a => a.exactness > 0.25)
    .slice(0, 24);

  for (const asp of topAspects) {
    const lon1 = positions[asp.planet1]?.longitude;
    const lon2 = positions[asp.planet2]?.longitude;
    if (lon1 === undefined || lon2 === undefined) continue;

    const p1 = pol(R_CENTER - 3, lon1 - asc);
    const p2 = pol(R_CENTER - 3, lon2 - asc);
    const style = ASPECT_STYLES[asp.type] || { color: '#666', width: 0.8, dash: '' };

    const ASPECT_NAMES: Record<string, string> = {
      conjunction: 'Conjunção (0°)', sextile: 'Sextil (60°)', square: 'Quadratura (90°)',
      trine: 'Trígono (120°)', opposition: 'Oposição (180°)',
    };
    const PLANET_LABELS: Record<string, string> = {
      sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
      jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
      northNode: 'Nodo Norte', chiron: 'Quíron',
    };
    const aspName = ASPECT_NAMES[asp.type] || asp.type;
    const p1Name = PLANET_LABELS[asp.planet1] || asp.planet1;
    const p2Name = PLANET_LABELS[asp.planet2] || asp.planet2;
    const aspTooltip = `${p1Name} ${aspName} ${p2Name} — orbe: ${asp.orb.toFixed(1)}°`;

    s += `<g style="cursor:pointer">`;
    s += `<title>${aspTooltip}</title>`;
    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${style.color}" stroke-width="${style.width}" opacity="0.82"${style.dash ? ` stroke-dasharray="${style.dash}"` : ''}/>`;
    s += `</g>`;
  }

  return s;
}

// ============================================================
// PLANETS — symbols + degree labels, inside house ring
// ============================================================

function drawPlanets(positions: Positions, asc: number): string {
  let s = '';

  const PLANET_NAMES_MAP: Record<string, string> = {
    sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
    jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
    northNode: 'Nodo Norte', chiron: 'Quíron', ceres: 'Ceres', vesta: 'Vesta', pallas: 'Pallas', juno: 'Juno',
  };
  const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

  const items = Object.entries(positions)
    .filter(([id]) => PLANET_SYMBOLS[id] && !OMITTED_WHEEL_POINTS.has(id))
    .map(([id, pos]) => ({
      id,
      angle: norm(pos.longitude - asc),
      lon: pos.longitude,
      retro: pos.isRetrograde || false,
      slot: 0,
    }))
    .sort((a, b) => a.angle - b.angle);

  assignRadialSlots(items, 17);

  for (const item of items) {
    const color = PLANET_COLORS[item.id] || '#aaa';
    const symbol = PLANET_SYMBOLS[item.id];
    const isExtra = ['ceres', 'vesta', 'pallas', 'juno', 'vertex', 'partOfFortune', 'lilith'].includes(item.id);
    const symbolSize = isExtra ? 20 : 27;
    const baseOrbit = isExtra ? R_PLANET - 18 : R_PLANET;
    const orbit = Math.max(R_HOUSE_IN + 42, baseOrbit - item.slot * 38);

    const p = pol(orbit, item.angle);
    const signIdx = getSignIndex(item.lon);
    const degInSign = getDegreeInSign(item.lon);
    const deg = Math.floor(degInSign);
    const min = Math.floor((degInSign - deg) * 60);
    const planetName = PLANET_NAMES_MAP[item.id] || item.id;
    const tooltip = `${planetName} em ${SIGN_NAMES[signIdx]} ${deg}°${min < 10 ? '0' : ''}${min}'${item.retro ? ' ℞' : ''}`;

    // Leader line from the exact zodiac position to the readable planet slot.
    const exactP = pol(R_SIGN_IN - 4, item.angle);
    const tickP = pol(R_SIGN_IN - 18, item.angle);
    const planetEdge = pol(orbit + 12, item.angle);
    s += `<line x1="${exactP.x}" y1="${exactP.y}" x2="${tickP.x}" y2="${tickP.y}" stroke="${color}" stroke-width="1.1"/>`;
    s += `<line x1="${tickP.x}" y1="${tickP.y}" x2="${planetEdge.x}" y2="${planetEdge.y}" stroke="${COL.lineLight}" stroke-width="0.65"/>`;

    // Planet symbol with a light stroke so house lines do not cut through it.
    s += `<g style="cursor:pointer">`;
    s += `<title>${tooltip}</title>`;
    s += `<text x="${p.x}" y="${p.y + symbolSize * 0.34}" text-anchor="middle" font-size="${symbolSize}" font-weight="700" fill="${color}" stroke="${COL.houseBg}" stroke-width="3" paint-order="stroke" font-family="serif">${symbol}</text>`;
    s += `</g>`;

    // Degree label, always dark/blue on the light chart background.
    const degP = pol(Math.max(R_HOUSE_IN + 18, orbit - 31), item.angle);
    const label = `${deg}°${min < 10 ? '0' : ''}${min}'${item.retro ? '℞' : ''}`;
    s += `<text x="${degP.x}" y="${degP.y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${item.retro ? COL.retroRed : COL.labelBlue}" stroke="${COL.houseBg}" stroke-width="2.5" paint-order="stroke" font-family="Arial, Helvetica, sans-serif">${label}</text>`;
  }

  return s;
}

function assignRadialSlots<T extends { angle: number; slot: number }>(items: T[], minSeparation: number): void {
  const ordered = rotateAfterLargestGap(items);
  let previousAngle: number | null = null;
  let slot = 0;

  for (const item of ordered) {
    if (previousAngle != null && forwardAngle(previousAngle, item.angle) < minSeparation) {
      slot += 1;
    } else {
      slot = 0;
    }
    item.slot = slot;
    previousAngle = item.angle;
  }
}

function rotateAfterLargestGap<T extends { angle: number }>(items: T[]): T[] {
  if (items.length <= 1) return [...items];
  const sorted = [...items].sort((a, b) => a.angle - b.angle);
  let start = 0;
  let maxGap = -1;

  for (let i = 0; i < sorted.length; i++) {
    const next = (i + 1) % sorted.length;
    const gap = forwardAngle(sorted[i].angle, sorted[next].angle);
    if (gap > maxGap) {
      maxGap = gap;
      start = next;
    }
  }

  return [...sorted.slice(start), ...sorted.slice(0, start)];
}

function forwardAngle(from: number, to: number): number {
  return (to - from + 360) % 360;
}

// ============================================================
// AXIS LABELS — AC, DC, MC, IC
// ============================================================

function drawAxes(houses: { cusps: number[]; ascendant: number; midheaven: number }, asc: number): string {
  let s = '';

  const signNames = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

  // AC — left
  const acSign = signNames[getSignIndex(asc)];
  const acDeg = Math.floor(getDegreeInSign(asc));
  s += `<text x="${CX - R_OUTER - 17}" y="${CY + 4}" text-anchor="start" font-size="17" font-weight="700" fill="${COL.axisLabel}" font-family="Arial, Helvetica, sans-serif">AC</text>`;
  s += `<text x="${CX - R_OUTER - 17}" y="${CY + 20}" text-anchor="start" font-size="11" font-weight="700" fill="${COL.textDim}" font-family="Arial, Helvetica, sans-serif">${acDeg}°${acSign}</text>`;

  // DC — right
  const dcLon = norm(asc + 180);
  const dcSign = signNames[getSignIndex(dcLon)];
  const dcDeg = Math.floor(getDegreeInSign(dcLon));
  s += `<text x="${CX + R_OUTER + 17}" y="${CY + 4}" text-anchor="end" font-size="17" font-weight="700" fill="${COL.axisLabel}" font-family="Arial, Helvetica, sans-serif">DC</text>`;
  s += `<text x="${CX + R_OUTER + 17}" y="${CY + 20}" text-anchor="end" font-size="11" font-weight="700" fill="${COL.textDim}" font-family="Arial, Helvetica, sans-serif">${dcDeg}°${dcSign}</text>`;

  // MC — top
  const mcAngle = houses.midheaven - asc;
  const mcP = pol(R_OUTER + 3, mcAngle);
  const mcSign = signNames[getSignIndex(houses.midheaven)];
  const mcDeg = Math.floor(getDegreeInSign(houses.midheaven));
  s += `<text x="${mcP.x}" y="${mcP.y}" text-anchor="middle" font-size="18" font-weight="700" fill="${COL.axisLabel}" font-family="Arial, Helvetica, sans-serif">MC</text>`;
  s += `<text x="${mcP.x}" y="${mcP.y + 17}" text-anchor="middle" font-size="12" font-weight="700" fill="${COL.textDim}" font-family="Arial, Helvetica, sans-serif">${mcDeg}°${mcSign}</text>`;

  // IC — bottom
  const icLon = norm(houses.midheaven + 180);
  const icAngle = icLon - asc;
  const icP = pol(R_OUTER + 3, icAngle);
  const icSign = signNames[getSignIndex(icLon)];
  const icDeg = Math.floor(getDegreeInSign(icLon));
  s += `<text x="${icP.x}" y="${icP.y}" text-anchor="middle" font-size="18" font-weight="700" fill="${COL.axisLabel}" font-family="Arial, Helvetica, sans-serif">IC</text>`;
  s += `<text x="${icP.x}" y="${icP.y + 17}" text-anchor="middle" font-size="12" font-weight="700" fill="${COL.textDim}" font-family="Arial, Helvetica, sans-serif">${icDeg}°${icSign}</text>`;

  return s;
}

// ============================================================
// BI-WHEEL: Natal (inner) + Transits (outer)
// ============================================================

const R_TRANSIT_ORBIT = 365;

export function renderBiWheel(natal: NatalChart, transitPositions: Positions, transitAspects: Aspect[]): string {
  const asc = natal.houses.ascendant;

  let svg = `<svg xmlns="${NS}" viewBox="-40 -40 780 780" width="100%" height="100%" style="font-family: Arial, Helvetica, sans-serif;">`;

  // Background
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_TRANSIT_ORBIT + 20}" fill="${COL.bg}"/>`;

  // Outer ring for transits
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_TRANSIT_ORBIT + 15}" fill="none" stroke="${COL.lineLight}" stroke-width="0.5"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_OUTER + 3}" fill="none" stroke="${COL.lineLight}" stroke-width="0.5" stroke-dasharray="2,2"/>`;

  // Main chart rings
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_OUTER}" fill="${COL.signRing}" stroke="${COL.line}" stroke-width="1.5"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_SIGN_IN}" fill="${COL.houseBg}" stroke="${COL.line}" stroke-width="1"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_HOUSE_IN}" fill="${COL.centerBg}" stroke="${COL.line}" stroke-width="0.8"/>`;

  // Signs
  svg += drawSigns(asc);

  // Houses
  svg += drawHouses(natal.houses.cusps, asc);

  // Transit-to-natal aspect lines
  svg += drawTransitAspectLines(transitAspects, natal.positions, transitPositions, asc);

  // Natal planets
  svg += drawPlanets(natal.positions, asc);

  // Transit planets (outer)
  svg += drawTransitPlanetsOuter(transitPositions, asc);

  // Axes
  svg += drawAxes(natal.houses, asc);

  // Legend
  svg += `<text x="10" y="${700 - 50}" font-size="10" font-weight="700" fill="${COL.textDim}" font-family="Arial, Helvetica, sans-serif">● Natal   ○ Trânsitos</text>`;

  svg += '</svg>';
  return svg;
}

// Transit planets — outside the zodiac ring
function drawTransitPlanetsOuter(positions: Positions, asc: number): string {
  let s = '';

  const items = Object.entries(positions)
    .filter(([id]) => PLANET_SYMBOLS[id] && !['southNode', 'lilith', 'ceres', 'vesta', 'pallas', 'juno', 'vertex', 'partOfFortune'].includes(id))
    .map(([id, pos]) => ({
      id,
      angle: pos.longitude - asc,
      lon: pos.longitude,
      retro: pos.isRetrograde || false,
    }))
    .sort((a, b) => ((a.angle % 360 + 360) % 360) - ((b.angle % 360 + 360) % 360));

  // Spread
  const MIN_SEP = 9;
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 1; i < items.length; i++) {
      const diff = ((items[i].angle - items[i - 1].angle) % 360 + 360) % 360;
      if (diff < MIN_SEP && diff > 0) {
        items[i].angle += (MIN_SEP - diff) / 2;
        items[i - 1].angle -= (MIN_SEP - diff) / 2;
      }
    }
  }

  for (const item of items) {
    const color = PLANET_COLORS[item.id] || '#999';
    const symbol = PLANET_SYMBOLS[item.id];
    const p = pol(R_TRANSIT_ORBIT, item.angle);

    // Build tooltip
    const PLANET_NAMES: Record<string, string> = {
      sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
      jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
      northNode: 'Nodo Norte', chiron: 'Quíron',
    };
    const SIGN_NAMES_TR = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
    const signIdx = getSignIndex(item.lon);
    const degInSign = getDegreeInSign(item.lon);
    const deg = Math.floor(degInSign);
    const min = Math.floor((degInSign - deg) * 60);
    const planetName = PLANET_NAMES[item.id] || item.id;
    const tooltip = `Trânsito: ${planetName} em ${SIGN_NAMES_TR[signIdx]} ${deg}°${min < 10 ? '0' : ''}${min}'${item.retro ? ' ℞ (retrógrado)' : ''}`;

    // Hollow circle + symbol (transit style) with tooltip
    s += `<g style="cursor:pointer">`;
    s += `<title>${tooltip}</title>`;
    s += `<circle cx="${p.x}" cy="${p.y}" r="9" fill="none" stroke="${color}" stroke-width="1.5"/>`;
    s += `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" fill="${color}" font-family="serif">${symbol}</text>`;
    if (item.retro) {
      s += `<text x="${p.x + 10}" y="${p.y - 5}" font-size="6" fill="#cc4444" font-family="sans-serif">℞</text>`;
    }
    s += `</g>`;
  }

  return s;
}

// Transit aspect lines
function drawTransitAspectLines(aspects: Aspect[], natalPositions: Positions, transitPositions: Positions, asc: number): string {
  let s = '';

  const topAspects = aspects.filter(a => a.exactness > 0.5).slice(0, 8);

  for (const asp of topAspects) {
    const lon1 = transitPositions[asp.planet1]?.longitude;
    const lon2 = natalPositions[asp.planet2]?.longitude;
    if (lon1 === undefined || lon2 === undefined) continue;

    const p1 = pol(R_CENTER - 3, lon1 - asc);
    const p2 = pol(R_CENTER - 3, lon2 - asc);
    const style = ASPECT_STYLES[asp.type] || { color: '#666', width: 0.8, dash: '' };

    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${style.color}" stroke-width="${style.width}" opacity="0.5"${style.dash ? ` stroke-dasharray="${style.dash}"` : ''}/>`;
  }

  return s;
}
