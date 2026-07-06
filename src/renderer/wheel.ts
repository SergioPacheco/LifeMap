// ============================================================
// WHEEL.TS — Professional SVG Astrological Wheel Renderer
// Layout: Astro.com style (3 rings)
// Outer: Zodiac signs | Middle: Planets | Inner: Houses | Center: Aspects
// ============================================================

import type { NatalChart, Positions, Aspect, AspectType } from '../engine/types';
import { getSignIndex, getDegreeInSign, norm, formatDegMin } from '../engine/calculations';
import { getAspectColor } from '../engine/aspects';

const NS = 'http://www.w3.org/2000/svg';
const CX = 350, CY = 350;

// Ring radii (from outside in) — Astro.com proportions
const R_OUTER = 330;          // Outer edge
const R_SIGN_IN = 278;       // Inner edge of sign ring
const R_PLANET_ORBIT = 235;  // Where planet symbols sit
const R_HOUSE_OUT = 195;     // Outer edge of house lines (where lines start)
const R_HOUSE_IN = 50;       // Inner circle (very small — just for aspect endpoints)

// Element colors (Astro.com)
const ELEMENT_COLORS = ['#ff4444','#44cc44','#6688ff','#ff8844','#ff4444','#44cc44','#6688ff','#ff8844','#ff4444','#44cc44','#6688ff','#ff8844'];

// Planet colors
const PLANET_COLORS: Record<string, string> = {
  sun: '#e8a830', moon: '#c8c0b4', mercury: '#d4a853', venus: '#44cc44', mars: '#ff4444',
  jupiter: '#aa66dd', saturn: '#c8c0b4', uranus: '#44aaff', neptune: '#44ccaa',
  pluto: '#cc4444', northNode: '#aaa', southNode: '#888', lilith: '#bbb', chiron: '#d4a853',
};

// Planet symbols
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', southNode: '☋', lilith: '⚸', chiron: 'K',
};

// Sign symbols
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

// Aspect styles (Astro.com: red=tense, blue=harmonic, thick lines)
const ASPECT_LINE: Record<AspectType, { color: string; width: number; dash: string }> = {
  conjunction: { color: '#cc0000', width: 2, dash: '' },
  sextile: { color: '#0000cc', width: 1, dash: '4,3' },
  square: { color: '#cc0000', width: 1.5, dash: '' },
  trine: { color: '#0000cc', width: 2, dash: '' },
  opposition: { color: '#cc0000', width: 1.5, dash: '6,3' },
};

// ============================================================
// MAIN RENDER
// ============================================================

export function renderWheel(chart: NatalChart): string {
  const asc = chart.houses.ascendant;
  const w = 700, h = 700;

  let svg = `<svg xmlns="${NS}" viewBox="0 0 ${w} ${h}" width="100%" height="100%" style="font-family: serif;">`;

  // 1. Background circles
  svg += drawBackgrounds();

  // 1b. House colored segments (visual highlight of the 12 houses)
  svg += drawHouseSegments(chart.houses.cusps, asc);

  // 2. Zodiac sign ring (outer) — 12 signs starting from Aries (0°)
  svg += drawZodiacRing(asc);

  // 3. House lines (inner area)
  svg += drawHouseLines(chart.houses.cusps, asc);

  // 4. Aspect lines (center)
  svg += drawAspects(chart.aspects, chart.positions, asc);

  // 5. Planets (between sign ring and houses)
  svg += drawPlanets(chart.positions, asc, chart.retrogrades);

  // 6. Axis labels (AC, DC, MC, IC)
  svg += drawAxisLabels(chart.houses, asc);

  svg += '</svg>';
  return svg;
}

// ============================================================
// POLAR FUNCTION — Astrological convention
// 0° (ASC) = LEFT, counter-clockwise (zodiacal order)
// ============================================================

function pol(r: number, angleDeg: number): { x: number; y: number } {
  // 0° = left, 90° = bottom, 180° = right, 270° = top
  const rad = angleDeg * Math.PI / 180;
  return {
    x: CX - r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

// ============================================================
// 1. BACKGROUNDS
// ============================================================

function drawBackgrounds(): string {
  let s = '';
  s += `<circle cx="${CX}" cy="${CY}" r="${R_OUTER}" fill="#1a1a2e" stroke="#3a3a5e" stroke-width="2"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="${R_SIGN_IN}" fill="#151525" stroke="#3a3a5e" stroke-width="1.5"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="${R_HOUSE_OUT}" fill="#1a1a2e" stroke="#2a2a4e" stroke-width="0.8"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="${R_HOUSE_IN}" fill="#252540" stroke="#3a3a5e" stroke-width="0.5"/>`;
  return s;
}

// ============================================================
// 1b. HOUSE COLORED SEGMENTS (between house outer and sign inner)
// Each house gets a colored background based on its ruling element
// ============================================================

// House element mapping: House 1=Fire, 2=Earth, 3=Air, 4=Water, repeating
const HOUSE_ELEMENT_COLORS = [
  'rgba(255, 68, 68, 0.12)',   // House 1 — Fire (Áries)
  'rgba(68, 204, 68, 0.10)',   // House 2 — Earth (Touro)
  'rgba(102, 136, 255, 0.10)', // House 3 — Air (Gêmeos)
  'rgba(255, 136, 68, 0.10)',  // House 4 — Water (Câncer)
  'rgba(255, 68, 68, 0.12)',   // House 5 — Fire (Leão)
  'rgba(68, 204, 68, 0.10)',   // House 6 — Earth (Virgem)
  'rgba(102, 136, 255, 0.10)', // House 7 — Air (Libra)
  'rgba(255, 136, 68, 0.10)',  // House 8 — Water (Escorpião)
  'rgba(255, 68, 68, 0.12)',   // House 9 — Fire (Sagitário)
  'rgba(68, 204, 68, 0.10)',   // House 10 — Earth (Capricórnio)
  'rgba(102, 136, 255, 0.10)', // House 11 — Air (Aquário)
  'rgba(255, 136, 68, 0.10)',  // House 12 — Water (Peixes)
];

const HOUSE_BORDER_COLORS = [
  'rgba(255, 68, 68, 0.35)',
  'rgba(68, 204, 68, 0.30)',
  'rgba(102, 136, 255, 0.30)',
  'rgba(255, 136, 68, 0.30)',
  'rgba(255, 68, 68, 0.35)',
  'rgba(68, 204, 68, 0.30)',
  'rgba(102, 136, 255, 0.30)',
  'rgba(255, 136, 68, 0.30)',
  'rgba(255, 68, 68, 0.35)',
  'rgba(68, 204, 68, 0.30)',
  'rgba(102, 136, 255, 0.30)',
  'rgba(255, 136, 68, 0.30)',
];

function drawHouseSegments(cusps: number[], asc: number): string {
  let s = '';

  for (let i = 0; i < 12; i++) {
    const startAngle = cusps[i] - asc;
    const endAngle = cusps[(i + 1) % 12] - asc;

    // Draw colored arc segment for this house
    s += arcSegment(
      R_HOUSE_IN, R_HOUSE_OUT,
      startAngle, endAngle,
      HOUSE_ELEMENT_COLORS[i],
      HOUSE_BORDER_COLORS[i],
      0.5
    );
  }

  return s;
}

// ============================================================
// 2. ZODIAC RING (outer ring with 12 signs)
// ============================================================

function drawZodiacRing(asc: number): string {
  let s = '';

  const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
  const ELEMENT_NAMES = ['Fogo','Terra','Ar','Água','Fogo','Terra','Ar','Água','Fogo','Terra','Ar','Água'];

  // Zodiac always has 12 signs of 30° each, starting from 0° Aries.
  // The wheel rotates so that ASC is on the left (0° visual = ASC longitude).
  // Sign i occupies absolute degrees [i*30, (i+1)*30].
  // Visual angle = absolute_degree - asc.

  for (let i = 0; i < 12; i++) {
    // Absolute zodiac positions: sign i goes from i*30 to (i+1)*30
    const signStart = i * 30;       // e.g., Aries=0°, Taurus=30°, etc.
    const signEnd = (i + 1) * 30;

    // Convert to visual angles (relative to ASC which is at 0° visual = left)
    const startAngle = signStart - asc;
    const endAngle = signEnd - asc;
    const color = ELEMENT_COLORS[i];

    // Colored segment background — stronger fill for clear division
    s += arcSegment(R_SIGN_IN, R_OUTER, startAngle, endAngle, color + '25', color + '50', 0.8);

    // Sign divider line (bold separator between signs)
    const p1 = pol(R_SIGN_IN, startAngle);
    const p2 = pol(R_OUTER, startAngle);
    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#5a5a7e" stroke-width="1"/>`;

    // Sign symbol centered in segment — with tooltip
    const midAngle = startAngle + 15;
    const midR = (R_OUTER + R_SIGN_IN) / 2;
    const p = pol(midR, midAngle);

    s += `<g class="sign-symbol" style="cursor:pointer">`;
    s += `<title>${SIGN_NAMES[i]} (${ELEMENT_NAMES[i]})</title>`;
    s += `<text x="${p.x}" y="${p.y + 6}" text-anchor="middle" font-size="18" font-weight="bold" fill="${color}" font-family="serif">${SIGN_SYMBOLS[i]}</text>`;
    s += `</g>`;

    // Small ticks every 5° within the sign
    for (let t = 1; t < 6; t++) {
      const tickAngle = startAngle + t * 5;
      const t1 = pol(R_SIGN_IN, tickAngle);
      const t2 = pol(R_SIGN_IN + 5, tickAngle);
      s += `<line x1="${t1.x}" y1="${t1.y}" x2="${t2.x}" y2="${t2.y}" stroke="#4a4a6e" stroke-width="0.4"/>`;
    }
  }

  return s;
}

// ============================================================
// 3. HOUSE LINES
// ============================================================

function drawHouseLines(cusps: number[], asc: number): string {
  let s = '';

  const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

  for (let i = 0; i < 12; i++) {
    const angle = cusps[i] - asc;
    const isAxis = (i === 0 || i === 3 || i === 6 || i === 9);

    if (isAxis) {
      // Thick axis lines from center to sign ring (gold on dark)
      const p1 = pol(R_HOUSE_IN, angle);
      const p2 = pol(R_SIGN_IN, angle);
      s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#d4a853" stroke-width="2"/>`;
    } else {
      // Normal house lines from center to house outer ring
      const p1 = pol(R_HOUSE_IN, angle);
      const p2 = pol(R_HOUSE_OUT, angle);
      s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#4a4a6e" stroke-width="0.7"/>`;
    }

    // House number — inside center area, just after the cusp line (like professional charts)
    const ROMAN = ['1','2','3','4','5','6','7','8','9','10','11','12'];
    const nextAngle = cusps[(i + 1) % 12] - asc;
    // Position: slightly after the cusp start (15% into the house sector)
    let labelAngle = angle + ((((nextAngle - angle) % 360) + 360) % 360) * 0.15;
    // Place inside the inner circle area (where aspects are drawn)
    const numR = R_HOUSE_IN + 18;
    const numP = pol(numR, labelAngle);

    // Tooltip with house cusp sign
    const cuspSign = getSignIndex(cusps[i]);
    const cuspDeg = getDegreeInSign(cusps[i]);
    const tooltip = `Casa ${i + 1} — cúspide em ${SIGN_NAMES[cuspSign]} ${Math.floor(cuspDeg)}°`;

    s += `<g style="cursor:pointer">`;
    s += `<title>${tooltip}</title>`;
    s += `<text x="${numP.x}" y="${numP.y + 3}" text-anchor="middle" font-size="9" fill="#7a7a90" font-family="sans-serif">${ROMAN[i]}</text>`;
    s += `</g>`;
  }

  return s;
}

// ============================================================
// 4. ASPECT LINES (inside house circle)
// ============================================================

function drawAspects(aspects: Aspect[], positions: Positions, asc: number): string {
  let s = '';

  // Only show the top 12 most exact aspects (like Astro.com)
  const topAspects = aspects
    .filter(a => a.exactness > 0.4)
    .slice(0, 12);

  for (const asp of topAspects) {
    const lon1 = positions[asp.planet1]?.longitude;
    const lon2 = positions[asp.planet2]?.longitude;
    if (lon1 === undefined || lon2 === undefined) continue;

    const a1 = lon1 - asc;
    const a2 = lon2 - asc;
    // Aspect lines go from planet position to planet position (inside house area)
    const p1 = pol(R_HOUSE_OUT - 5, a1);
    const p2 = pol(R_HOUSE_OUT - 5, a2);

    const style = ASPECT_LINE[asp.type] || { color: '#999', width: 1, dash: '' };

    s += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${style.color}" stroke-width="${style.width}"${style.dash ? ` stroke-dasharray="${style.dash}"` : ''}/>`;
  }

  return s;
}

// ============================================================
// 5. PLANETS (between sign ring and house area)
// ============================================================

function drawPlanets(positions: Positions, asc: number, retrogrades?: Record<string, boolean>): string {
  let s = '';

  // Collect and sort planets by angle
  const items = Object.entries(positions)
    .filter(([id]) => PLANET_SYMBOLS[id])
    .map(([id, pos]) => ({
      id,
      angle: pos.longitude - asc,
      lon: pos.longitude,
      retro: pos.isRetrograde || (retrogrades && retrogrades[id]) || false,
    }))
    .sort((a, b) => ((a.angle % 360 + 360) % 360) - ((b.angle % 360 + 360) % 360));

  // Spread overlapping planets
  const MIN_SEP = 10;
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 1; i < items.length; i++) {
      let diff = ((items[i].angle - items[i - 1].angle) % 360 + 360) % 360;
      if (diff < MIN_SEP && diff > 0) {
        items[i].angle += (MIN_SEP - diff) / 2;
        items[i - 1].angle -= (MIN_SEP - diff) / 2;
      }
    }
  }

  for (const item of items) {
    const color = PLANET_COLORS[item.id] || '#c8c0b4';
    const symbol = PLANET_SYMBOLS[item.id];

    const PLANET_NAMES_MAP: Record<string, string> = {
      sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
      jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
      northNode: 'Nodo Norte', southNode: 'Nodo Sul', lilith: 'Lilith', chiron: 'Quíron',
    };
    const SIGN_NAMES_MAP = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

    const planetName = PLANET_NAMES_MAP[item.id] || item.id;
    const signIdx = getSignIndex(item.lon);
    const signName = SIGN_NAMES_MAP[signIdx];
    const degInSign = getDegreeInSign(item.lon);
    const deg = Math.floor(degInSign);
    const min = Math.floor((degInSign - deg) * 60);

    // Planet symbol position
    const p = pol(R_PLANET_ORBIT, item.angle);

    // Tooltip: "Sol em Leão 15°23'"
    const tooltip = `${planetName} em ${signName} ${deg}°${min < 10 ? '0' : ''}${min}'${item.retro ? ' (Retrógrado)' : ''}`;

    // Group with tooltip
    s += `<g style="cursor:pointer">`;
    s += `<title>${tooltip}</title>`;
    s += `<circle cx="${p.x}" cy="${p.y}" r="13" fill="#252540" stroke="${color}" stroke-width="1.8"/>`;
    s += `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle" font-size="15" font-weight="bold" fill="${color}" font-family="serif">${symbol}</text>`;
    s += `</g>`;

    // Degree label below
    let label = `${deg}°${min < 10 ? '0' : ''}${min}'`;
    if (item.retro) label += '℞';

    const degP = pol(R_PLANET_ORBIT - 20, item.angle);
    const labelColor = item.retro ? '#ff4444' : '#8a8a9a';
    s += `<text x="${degP.x}" y="${degP.y + 3}" text-anchor="middle" font-size="8" fill="${labelColor}" font-family="monospace">${label}</text>`;
  }

  return s;
}

// ============================================================
// 6. AXIS LABELS (AC, DC, MC, IC with degrees)
// ============================================================

function drawAxisLabels(houses: { cusps: number[]; ascendant: number; midheaven: number }, asc: number): string {
  let s = '';

  // AC — left
  const acDeg = formatDegMin(getDegreeInSign(asc));
  s += `<text x="${CX - R_SIGN_IN - 25}" y="${CY + 5}" text-anchor="end" font-size="12" font-weight="bold" fill="#d4a853" font-family="sans-serif">AC</text>`;
  s += `<text x="${CX - R_SIGN_IN - 25}" y="${CY + 17}" text-anchor="end" font-size="8" fill="#8a8a9a" font-family="monospace">${acDeg}</text>`;

  // DC — right
  const dcDeg = formatDegMin(getDegreeInSign(norm(asc + 180)));
  s += `<text x="${CX + R_SIGN_IN + 8}" y="${CY + 5}" text-anchor="start" font-size="12" font-weight="bold" fill="#d4a853" font-family="sans-serif">DC</text>`;
  s += `<text x="${CX + R_SIGN_IN + 8}" y="${CY + 17}" text-anchor="start" font-size="8" fill="#8a8a9a" font-family="monospace">${dcDeg}</text>`;

  // MC — top (use actual MC angle)
  const mcAngle = houses.midheaven - asc;
  const mcP = pol(R_SIGN_IN + 20, mcAngle);
  const mcDeg = formatDegMin(getDegreeInSign(houses.midheaven));
  s += `<text x="${mcP.x}" y="${mcP.y - 5}" text-anchor="middle" font-size="12" font-weight="bold" fill="#d4a853" font-family="sans-serif">MC</text>`;
  s += `<text x="${mcP.x + 20}" y="${mcP.y - 5}" text-anchor="start" font-size="8" fill="#8a8a9a" font-family="monospace">${mcDeg}</text>`;

  // IC — bottom
  const icAngle = norm(houses.midheaven + 180) - asc;
  const icP = pol(R_SIGN_IN + 20, icAngle);
  const icDeg = formatDegMin(getDegreeInSign(norm(houses.midheaven + 180)));
  s += `<text x="${icP.x}" y="${icP.y + 15}" text-anchor="middle" font-size="12" font-weight="bold" fill="#d4a853" font-family="sans-serif">IC</text>`;
  s += `<text x="${icP.x + 20}" y="${icP.y + 15}" text-anchor="start" font-size="8" fill="#8a8a9a" font-family="monospace">${icDeg}</text>`;

  return s;
}

// ============================================================
// SVG HELPERS
// ============================================================

function arcSegment(innerR: number, outerR: number, startA: number, endA: number, fill: string, stroke: string, strokeW: number): string {
  // Normalize the angular span — ensure we always draw the shortest correct arc
  let span = ((endA - startA) % 360 + 360) % 360;
  if (span === 0) span = 360;
  const largeArc = span > 180 ? 1 : 0;

  const s1 = pol(outerR, startA);
  const e1 = pol(outerR, startA + span);
  const s2 = pol(innerR, startA + span);
  const e2 = pol(innerR, startA);

  // SVG arc: sweep=1 for clockwise visual (matches our pol function)
  const path = `M ${s1.x} ${s1.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${e2.x} ${e2.y} Z`;
  return `<path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"/>`;
}
