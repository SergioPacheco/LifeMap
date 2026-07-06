// ============================================================
// WHEEL.TS — Clean Astrological Wheel (Astro.com Classic Style)
// Simple, readable, professional — white/beige background, thin black lines
// Layout: Sign ring (outer) → House ring with planets → Aspect center
// ============================================================

import type { NatalChart, Positions, Aspect, AspectType } from '../engine/types';
import { getSignIndex, getDegreeInSign, norm, formatDegMin } from '../engine/calculations';
import { getAspectColor } from '../engine/aspects';

const NS = 'http://www.w3.org/2000/svg';
const CX = 350, CY = 350;

// Ring radii — clean proportions
const R_OUTER = 330;         // Outer edge
const R_SIGN_IN = 285;      // Inner edge of sign ring
const R_HOUSE_OUT = 285;    // = sign ring inner (house ring starts here)
const R_PLANET = 225;       // Planets orbit here (inside house ring)
const R_HOUSE_IN = 130;     // Inner edge of house ring
const R_CENTER = 130;       // Aspect lines inside here

// Colors — clean dark theme
const COL = {
  bg: '#0d0d14',
  ringBg: '#161622',
  houseBg: '#1a1a28',
  line: '#3a3a50',
  lineLight: '#2a2a3e',
  axis: '#888',
  axisLabel: '#ccc',
  text: '#bbb',
  textDim: '#666',
  signFire: '#e05555',
  signEarth: '#55aa55',
  signAir: '#5588dd',
  signWater: '#dd8844',
};

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_COLORS = [COL.signFire, COL.signEarth, COL.signAir, COL.signWater, COL.signFire, COL.signEarth, COL.signAir, COL.signWater, COL.signFire, COL.signEarth, COL.signAir, COL.signWater];

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', southNode: '☋', lilith: '⚸', chiron: '⚷',
  ceres: '⚳', vesta: '⚶', pallas: '⚴', juno: '⚵',
  vertex: 'Vx', partOfFortune: '⊕',
};

const PLANET_COLORS: Record<string, string> = {
  sun: '#e8a830', moon: '#aaa', mercury: '#cc9933', venus: '#44bb44', mars: '#dd3333',
  jupiter: '#9966cc', saturn: '#888', uranus: '#44aaff', neptune: '#44bbaa',
  pluto: '#aa3333', northNode: '#999', southNode: '#777', lilith: '#999', chiron: '#cc9933',
  ceres: '#77aa44', vesta: '#dd8800', pallas: '#4499cc', juno: '#cc4488',
  vertex: '#9977cc', partOfFortune: '#ccaa33',
};

const ASPECT_STYLES: Record<AspectType, { color: string; width: number; dash: string }> = {
  conjunction: { color: '#44aa44', width: 1.5, dash: '' },
  sextile: { color: '#3366cc', width: 0.8, dash: '3,3' },
  square: { color: '#cc3333', width: 1.2, dash: '' },
  trine: { color: '#3366cc', width: 1.2, dash: '' },
  opposition: { color: '#cc3333', width: 1, dash: '5,3' },
};

// ============================================================
// MAIN RENDER
// ============================================================

export function renderWheel(chart: NatalChart): string {
  const asc = chart.houses.ascendant;
  let svg = `<svg xmlns="${NS}" viewBox="0 0 700 700" width="100%" height="100%" style="font-family: 'Times New Roman', serif;">`;

  // Background
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_OUTER + 5}" fill="${COL.bg}"/>`;

  // Sign ring background
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_OUTER}" fill="${COL.ringBg}" stroke="${COL.line}" stroke-width="1.5"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_SIGN_IN}" fill="${COL.houseBg}" stroke="${COL.line}" stroke-width="1"/>`;

  // Inner circle
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_HOUSE_IN}" fill="${COL.ringBg}" stroke="${COL.line}" stroke-width="0.8"/>`;

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
    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${COL.line}" stroke-width="0.8"/>`;

    // Symbol centered in segment — with tooltip
    const midAngle = startAngle + 15;
    const midR = (R_OUTER + R_SIGN_IN) / 2;
    const p = pol(midR, midAngle);
    const color = SIGN_COLORS[i];
    const tooltip = `${SIGN_NAMES[i]} — ${SIGN_ELEMENTS[i]} / ${SIGN_MODALITIES[i]} — Regente: ${SIGN_RULERS[i]}`;

    s += `<g style="cursor:pointer">`;
    s += `<title>${tooltip}</title>`;
    s += `<text x="${p.x}" y="${p.y + 6}" text-anchor="middle" font-size="16" fill="${color}" font-family="serif">${SIGN_SYMBOLS[i]}</text>`;
    s += `</g>`;

    // DEGREE RULER — 30 ticks per sign (inside edge of sign ring)
    // Long tick every 10°, medium every 5°, short every 1°
    for (let d = 1; d < 30; d++) {
      const tickAngle = startAngle + d;
      const isLong = d % 10 === 0;  // 10°, 20°
      const isMed = d % 5 === 0;    // 5°, 15°, 25°

      // Inner ruler (on R_SIGN_IN edge — pointing inward into house ring)
      const tickLen = isLong ? 7 : isMed ? 5 : 2.5;
      const t1 = pol(R_SIGN_IN, tickAngle);
      const t2 = pol(R_SIGN_IN - tickLen, tickAngle);
      s += `<line x1="${t1.x}" y1="${t1.y}" x2="${t2.x}" y2="${t2.y}" stroke="${COL.line}" stroke-width="${isLong ? 0.7 : 0.3}"/>`;

      // Outer ruler (on R_OUTER edge — pointing outward)
      const t3 = pol(R_OUTER, tickAngle);
      const t4 = pol(R_OUTER + tickLen * 0.7, tickAngle);
      s += `<line x1="${t3.x}" y1="${t3.y}" x2="${t4.x}" y2="${t4.y}" stroke="${COL.line}" stroke-width="${isLong ? 0.7 : 0.3}"/>`;
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
    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${isAxis ? COL.axis : COL.line}" stroke-width="${isAxis ? 1.5 : 0.6}"/>`;

    // House number — centered in sector, near inner ring, with tooltip
    const nextAngle = cusps[(i + 1) % 12] - asc;
    const sectorMid = angle + ((((nextAngle - angle) % 360) + 360) % 360) * 0.5;
    const numP = pol(R_HOUSE_IN + 20, sectorMid);

    const cuspSign = SIGN_NAMES[getSignIndex(cusps[i])];
    const cuspDeg = Math.floor(getDegreeInSign(cusps[i]));
    const houseTooltip = `Casa ${i + 1} — ${HOUSE_THEMES[i]}\nCúspide: ${cuspDeg}° ${cuspSign}`;

    s += `<g style="cursor:pointer">`;
    s += `<title>${houseTooltip}</title>`;
    s += `<text x="${numP.x}" y="${numP.y + 4}" text-anchor="middle" font-size="10" fill="${COL.textDim}" font-family="sans-serif">${i + 1}</text>`;
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
      s += `<line x1="${t1.x}" y1="${t1.y}" x2="${t2.x}" y2="${t2.y}" stroke="${COL.lineLight}" stroke-width="0.3"/>`;
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
    .filter(a => a.exactness > 0.45)
    .slice(0, 10);

  for (const asp of topAspects) {
    const lon1 = positions[asp.planet1]?.longitude;
    const lon2 = positions[asp.planet2]?.longitude;
    if (lon1 === undefined || lon2 === undefined) continue;

    const p1 = pol(R_HOUSE_IN - 3, lon1 - asc);
    const p2 = pol(R_HOUSE_IN - 3, lon2 - asc);
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
    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${style.color}" stroke-width="${style.width}" opacity="0.7"${style.dash ? ` stroke-dasharray="${style.dash}"` : ''}/>`;
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

  // Collect planets
  const items = Object.entries(positions)
    .filter(([id]) => PLANET_SYMBOLS[id])
    .map(([id, pos]) => ({
      id,
      angle: pos.longitude - asc,
      lon: pos.longitude,
      retro: pos.isRetrograde || false,
    }))
    .sort((a, b) => ((a.angle % 360 + 360) % 360) - ((b.angle % 360 + 360) % 360));

  // Spread overlapping
  const MIN_SEP = 12;
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
    const color = PLANET_COLORS[item.id] || '#aaa';
    const symbol = PLANET_SYMBOLS[item.id];
    const isExtra = ['ceres', 'vesta', 'pallas', 'juno', 'vertex', 'partOfFortune'].includes(item.id);
    const orbit = isExtra ? R_PLANET - 25 : R_PLANET;

    const p = pol(orbit, item.angle);
    const signIdx = getSignIndex(item.lon);
    const degInSign = getDegreeInSign(item.lon);
    const deg = Math.floor(degInSign);
    const min = Math.floor((degInSign - deg) * 60);
    const planetName = PLANET_NAMES_MAP[item.id] || item.id;
    const tooltip = `${planetName} em ${SIGN_NAMES[signIdx]} ${deg}°${min < 10 ? '0' : ''}${min}'${item.retro ? ' ℞' : ''}`;

    // Planet symbol (no circle background — cleaner)
    s += `<g style="cursor:pointer">`;
    s += `<title>${tooltip}</title>`;
    s += `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle" font-size="${isExtra ? 12 : 16}" fill="${color}" font-family="serif">${symbol}</text>`;
    s += `</g>`;

    // Degree label (small, gray)
    const degP = pol(orbit - 18, item.angle);
    const label = `${deg}°${min < 10 ? '0' : ''}${min}'${item.retro ? '℞' : ''}`;
    s += `<text x="${degP.x}" y="${degP.y + 3}" text-anchor="middle" font-size="7" fill="${item.retro ? '#cc4444' : COL.textDim}" font-family="monospace">${label}</text>`;

    // Pointer line from planet to exact zodiac position
    const exactP = pol(R_SIGN_IN + 2, item.lon - asc);
    const planetEdge = pol(orbit + 10, item.angle);
    s += `<line x1="${planetEdge.x}" y1="${planetEdge.y}" x2="${exactP.x}" y2="${exactP.y}" stroke="${COL.lineLight}" stroke-width="0.4"/>`;
  }

  return s;
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
  s += `<text x="${CX - R_HOUSE_OUT - 8}" y="${CY + 4}" text-anchor="end" font-size="11" font-weight="bold" fill="${COL.axisLabel}" font-family="sans-serif">AC</text>`;
  s += `<text x="${CX - R_HOUSE_OUT - 8}" y="${CY + 15}" text-anchor="end" font-size="8" fill="${COL.textDim}" font-family="monospace">${acDeg}°${acSign}</text>`;

  // DC — right
  const dcLon = norm(asc + 180);
  const dcSign = signNames[getSignIndex(dcLon)];
  const dcDeg = Math.floor(getDegreeInSign(dcLon));
  s += `<text x="${CX + R_HOUSE_OUT + 8}" y="${CY + 4}" text-anchor="start" font-size="11" font-weight="bold" fill="${COL.axisLabel}" font-family="sans-serif">DC</text>`;
  s += `<text x="${CX + R_HOUSE_OUT + 8}" y="${CY + 15}" text-anchor="start" font-size="8" fill="${COL.textDim}" font-family="monospace">${dcDeg}°${dcSign}</text>`;

  // MC — top
  const mcAngle = houses.midheaven - asc;
  const mcP = pol(R_HOUSE_OUT + 15, mcAngle);
  const mcSign = signNames[getSignIndex(houses.midheaven)];
  const mcDeg = Math.floor(getDegreeInSign(houses.midheaven));
  s += `<text x="${mcP.x}" y="${mcP.y}" text-anchor="middle" font-size="11" font-weight="bold" fill="${COL.axisLabel}" font-family="sans-serif">MC</text>`;
  s += `<text x="${mcP.x}" y="${mcP.y + 11}" text-anchor="middle" font-size="8" fill="${COL.textDim}" font-family="monospace">${mcDeg}°${mcSign}</text>`;

  // IC — bottom
  const icLon = norm(houses.midheaven + 180);
  const icAngle = icLon - asc;
  const icP = pol(R_HOUSE_OUT + 15, icAngle);
  const icSign = signNames[getSignIndex(icLon)];
  const icDeg = Math.floor(getDegreeInSign(icLon));
  s += `<text x="${icP.x}" y="${icP.y}" text-anchor="middle" font-size="11" font-weight="bold" fill="${COL.axisLabel}" font-family="sans-serif">IC</text>`;
  s += `<text x="${icP.x}" y="${icP.y + 11}" text-anchor="middle" font-size="8" fill="${COL.textDim}" font-family="monospace">${icDeg}°${icSign}</text>`;

  return s;
}

// ============================================================
// BI-WHEEL: Natal (inner) + Transits (outer)
// ============================================================

const R_TRANSIT_ORBIT = 365;

export function renderBiWheel(natal: NatalChart, transitPositions: Positions, transitAspects: Aspect[]): string {
  const asc = natal.houses.ascendant;

  let svg = `<svg xmlns="${NS}" viewBox="-40 -40 780 780" width="100%" height="100%" style="font-family: 'Times New Roman', serif;">`;

  // Background
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_TRANSIT_ORBIT + 20}" fill="${COL.bg}"/>`;

  // Outer ring for transits
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_TRANSIT_ORBIT + 15}" fill="none" stroke="${COL.lineLight}" stroke-width="0.5"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_OUTER + 3}" fill="none" stroke="${COL.lineLight}" stroke-width="0.5" stroke-dasharray="2,2"/>`;

  // Main chart rings
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_OUTER}" fill="${COL.ringBg}" stroke="${COL.line}" stroke-width="1.5"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_SIGN_IN}" fill="${COL.houseBg}" stroke="${COL.line}" stroke-width="1"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R_HOUSE_IN}" fill="${COL.ringBg}" stroke="${COL.line}" stroke-width="0.8"/>`;

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
  svg += `<text x="10" y="${700 - 50}" font-size="8" fill="${COL.textDim}" font-family="sans-serif">● Natal   ○ Trânsitos</text>`;

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

    // Hollow circle + symbol (transit style)
    s += `<circle cx="${p.x}" cy="${p.y}" r="9" fill="none" stroke="${color}" stroke-width="1.5"/>`;
    s += `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" font-size="11" fill="${color}" font-family="serif">${symbol}</text>`;

    if (item.retro) {
      s += `<text x="${p.x + 10}" y="${p.y - 5}" font-size="6" fill="#cc4444" font-family="sans-serif">℞</text>`;
    }
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

    const p1 = pol(R_HOUSE_IN - 3, lon1 - asc);
    const p2 = pol(R_HOUSE_IN - 3, lon2 - asc);
    const style = ASPECT_STYLES[asp.type] || { color: '#666', width: 0.8, dash: '' };

    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${style.color}" stroke-width="${style.width}" opacity="0.5"${style.dash ? ` stroke-dasharray="${style.dash}"` : ''}/>`;
  }

  return s;
}
