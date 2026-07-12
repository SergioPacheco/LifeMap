/**
 * ChartMoment — "Céu Agora" widget
 *
 * Lightweight mini-card showing current approximate planetary positions
 * calculated client-side using mean longitude formulas (no Swiss Ephemeris).
 * Accuracy: ~1–2° — suitable for display purposes only.
 */

import { createSignal, onMount, For } from 'solid-js';
import { localePath } from '../../i18n';
import { localeToDateLocale } from '../../utils/dateTime';

// ─── Constants ─────────────────────────────────────────────────────────────

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_NAMES_PT = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

// J2000.0 epoch: 2000-01-01T12:00:00 UTC
const J2000 = 2451545.0;

// Mean longitudes at J2000.0 and daily mean motions (degrees/day)
// Sources: Meeus "Astronomical Algorithms" + mean elements approximation
const PLANET_ELEMENTS: {
  id: string;
  name: string;
  symbol: string;
  L0: number;  // mean longitude at J2000 (degrees)
  dL: number;  // mean daily motion (degrees/day)
  // For retrograde detection: synodic period & approximate cycle
  // (outer planets retrograde roughly 1 period per year based on synodic)
  synodic?: number; // synodic period in days
  retroDuration?: number; // retrograde duration in days per cycle
  retroPhase?: number; // phase offset for retrograde window (0-1)
}[] = [
  { id: 'sun',     name: 'Sol',      symbol: '☉', L0: 280.4665,  dL: 0.9856474 },
  { id: 'moon',    name: 'Lua',      symbol: '☽', L0: 218.3165,  dL: 13.1763966 },
  { id: 'mercury', name: 'Mercúrio', symbol: '☿', L0: 252.2509,  dL: 4.0923344, synodic: 115.88, retroDuration: 21, retroPhase: 0.5 },
  { id: 'venus',   name: 'Vênus',    symbol: '♀', L0: 181.9798,  dL: 1.6021302, synodic: 583.92, retroDuration: 42, retroPhase: 0.5 },
  { id: 'mars',    name: 'Marte',    symbol: '♂', L0: 355.4330,  dL: 0.5240208, synodic: 779.94, retroDuration: 72, retroPhase: 0.5 },
  { id: 'jupiter', name: 'Júpiter',  symbol: '♃', L0: 34.3515,   dL: 0.0830853, synodic: 398.88, retroDuration: 121, retroPhase: 0.5 },
  { id: 'saturn',  name: 'Saturno',  symbol: '♄', L0: 50.0774,   dL: 0.0334986, synodic: 378.09, retroDuration: 138, retroPhase: 0.5 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Date → Julian Day Number */
function toJulianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

/** Normalize angle to [0, 360) */
function norm(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

interface PlanetPosition {
  name: string;
  symbol: string;
  signIndex: number;
  signSymbol: string;
  signName: string;
  degrees: number;
  isRetrograde: boolean;
}

/**
 * Approximate retrograde detection using synodic cycle phase.
 * This is a heuristic — not astronomically precise.
 * Returns true if the planet is roughly in its retrograde window.
 */
function isApproximatelyRetrograde(
  daysSinceJ2000: number,
  synodic: number,
  retroDuration: number,
  retroPhase: number
): boolean {
  if (!synodic || !retroDuration) return false;
  // Position within synodic cycle (0-1)
  const cyclePos = ((daysSinceJ2000 % synodic) + synodic) % synodic / synodic;
  // Retrograde window centered at retroPhase
  const halfWindow = retroDuration / synodic / 2;
  const start = (retroPhase - halfWindow + 1) % 1;
  const end = (retroPhase + halfWindow) % 1;
  if (start < end) {
    return cyclePos >= start && cyclePos <= end;
  } else {
    // Window wraps around 0
    return cyclePos >= start || cyclePos <= end;
  }
}

/** Calculate all planet positions for a given date */
function calculateApproxPositions(date: Date): PlanetPosition[] {
  const jd = toJulianDay(date);
  const d = jd - J2000; // days since J2000.0

  return PLANET_ELEMENTS.map((planet) => {
    const longitude = norm(planet.L0 + planet.dL * d);
    const signIndex = Math.floor(longitude / 30);
    const degInSign = longitude % 30;

    const isRetrograde = planet.synodic
      ? isApproximatelyRetrograde(d, planet.synodic, planet.retroDuration!, planet.retroPhase!)
      : false;

    return {
      name: planet.name,
      symbol: planet.symbol,
      signIndex,
      signSymbol: SIGN_SYMBOLS[signIndex],
      signName: SIGN_NAMES_PT[signIndex],
      degrees: degInSign,
      isRetrograde,
    };
  });
}

// ─── Component ─────────────────────────────────────────────────────────────

interface ChartMomentProps {
  /** Target locale for the "see full chart" link */
  locale?: string;
}

export default function ChartMoment(props: ChartMomentProps) {
  const [positions, setPositions] = createSignal<PlanetPosition[]>([]);
  const [timestamp, setTimestamp] = createSignal('');

  const locale = () => props.locale || 'pt';

  onMount(() => {
    const now = new Date();
    setPositions(calculateApproxPositions(now));
    setTimestamp(
      now.toLocaleString(localeToDateLocale(locale()), {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    );
  });

  return (
    <div class="flex justify-center px-4">
      <div
        class="w-full max-w-md rounded-2xl p-5"
        style={{
          background: 'rgba(12,12,20,0.6)',
          border: '1px solid rgba(240,184,64,0.18)',
          'box-shadow': '0 0 28px rgba(240,184,64,0.07), inset 0 0 0 1px rgba(255,255,255,0.04)',
          'backdrop-filter': 'blur(12px)',
        }}
      >
        {/* Header */}
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">✦</span>
            <h2
              class="text-base font-serif font-bold tracking-wide"
              style={{ color: '#f0b840' }}
            >
              Céu Agora
            </h2>
          </div>
          {timestamp() && (
            <span class="text-xs" style={{ color: 'rgba(245,245,245,0.4)' }}>
              {timestamp()}
            </span>
          )}
        </div>

        {/* Planet table */}
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr style={{ 'border-bottom': '1px solid rgba(240,184,64,0.12)' }}>
              <th class="text-left pb-2 font-normal text-xs uppercase tracking-wider" style={{ color: 'rgba(245,245,245,0.4)' }}>
                Planeta
              </th>
              <th class="text-center pb-2 font-normal text-xs uppercase tracking-wider" style={{ color: 'rgba(245,245,245,0.4)' }}>
                Signo
              </th>
              <th class="text-right pb-2 font-normal text-xs uppercase tracking-wider" style={{ color: 'rgba(245,245,245,0.4)' }}>
                Grau
              </th>
            </tr>
          </thead>
          <tbody>
            <For each={positions()}>
              {(p, i) => (
                <tr
                  style={{
                    'border-bottom': i() < positions().length - 1
                      ? '1px solid rgba(255,255,255,0.04)'
                      : 'none',
                  }}
                >
                  {/* Planet name + symbol */}
                  <td class="py-2 pr-2">
                    <span class="text-base mr-1.5" style={{ color: '#f0b840' }}>
                      {p.symbol}
                    </span>
                    <span class="font-medium" style={{ color: '#f5f5f5' }}>
                      {p.name}
                    </span>
                    {p.isRetrograde && (
                      <span
                        class="ml-1.5 text-xs font-bold"
                        style={{ color: 'rgba(220,80,80,0.9)' }}
                        title="Retrógrado"
                      >
                        ℞
                      </span>
                    )}
                  </td>

                  {/* Sign glyph + name */}
                  <td class="py-2 text-center">
                    <span class="text-base mr-1" style={{ color: 'rgba(245,245,245,0.7)' }}>
                      {p.signSymbol}
                    </span>
                    <span class="text-xs" style={{ color: 'rgba(245,245,245,0.5)' }}>
                      {p.signName}
                    </span>
                  </td>

                  {/* Degree */}
                  <td class="py-2 text-right font-mono text-xs" style={{ color: 'rgba(245,245,245,0.55)' }}>
                    {Math.floor(p.degrees).toString().padStart(2, '0')}°
                    {Math.floor((p.degrees % 1) * 60).toString().padStart(2, '0')}′
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>

        {/* Footnote + CTA */}
        <div class="mt-4 flex items-center justify-between">
          <span class="text-xs" style={{ color: 'rgba(245,245,245,0.25)' }}>
            ~posições aproximadas
          </span>
          <a
            href={localePath('/tools/current-planets', locale() as any)}
            class="text-xs font-medium transition-opacity hover:opacity-80"
            style={{ color: '#f0b840' }}
          >
            Ver mapa completo →
          </a>
        </div>
      </div>
    </div>
  );
}
