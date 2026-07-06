import { createSignal, onMount, For } from 'solid-js';
import { calculatePositions, initSweph, getSignIndex, getDegreeInSign, formatDegMin } from '../../engine/index';
import * as Astronomy from 'astronomy-engine';

const PLANET_DATA: { id: string; name: string; symbol: string }[] = [
  { id: 'sun', name: 'Sol', symbol: '☉' },
  { id: 'moon', name: 'Lua', symbol: '☽' },
  { id: 'mercury', name: 'Mercúrio', symbol: '☿' },
  { id: 'venus', name: 'Vênus', symbol: '♀' },
  { id: 'mars', name: 'Marte', symbol: '♂' },
  { id: 'jupiter', name: 'Júpiter', symbol: '♃' },
  { id: 'saturn', name: 'Saturno', symbol: '♄' },
  { id: 'uranus', name: 'Urano', symbol: '♅' },
  { id: 'neptune', name: 'Netuno', symbol: '♆' },
  { id: 'pluto', name: 'Plutão', symbol: '♇' },
  { id: 'northNode', name: 'Nodo Norte', symbol: '☊' },
  { id: 'chiron', name: 'Quíron', symbol: '⚷' },
];

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const ELEMENT_COLORS = ['#cc0000','#006600','#0000cc','#cc6600','#cc0000','#006600','#0000cc','#cc6600','#cc0000','#006600','#0000cc','#cc6600'];

interface PlanetRow {
  id: string; name: string; symbol: string;
  sign: number; deg: number; retro: boolean; longitude: number;
}

export default function CurrentPlanetsApp() {
  const [planets, setPlanets] = createSignal<PlanetRow[]>([]);
  const [now, setNow] = createSignal(new Date());
  const [moonPhase, setMoonPhase] = createSignal({ phase: '', illumination: 0, emoji: '🌑' });

  onMount(async () => {
    await initSweph();
    update();
    // Update every minute
    setInterval(update, 60000);
  });

  const update = () => {
    const date = new Date();
    setNow(date);
    const positions = calculatePositions(date);
    const rows: PlanetRow[] = [];

    for (const p of PLANET_DATA) {
      const pos = positions[p.id];
      if (pos) {
        rows.push({
          ...p,
          sign: getSignIndex(pos.longitude),
          deg: getDegreeInSign(pos.longitude),
          retro: pos.isRetrograde || false,
          longitude: pos.longitude,
        });
      }
    }
    setPlanets(rows);

    // Moon phase calculation
    try {
      const astroTime = new Astronomy.AstroTime(date);
      const phase = Astronomy.MoonPhase(astroTime);
      const illum = Astronomy.Illumination('Moon' as Astronomy.Body, astroTime);
      const phaseName = getMoonPhaseName(phase);
      const emoji = getMoonPhaseEmoji(phase);
      setMoonPhase({ phase: phaseName, illumination: Math.round(illum.phase_fraction * 100), emoji });
    } catch (e) {
      // Fallback
    }
  };

  return (
    <div class="space-y-6">
      {/* Header with time */}
      <div class="glass rounded-2xl p-4 text-center">
        <p class="text-sm text-muted">Posições em tempo real</p>
        <p class="text-lg font-mono text-cream">{now().toLocaleString('pt-BR')}</p>
      </div>

      {/* Moon Phase */}
      <div class="bg-gradient-to-r from-dark-50 to-dark-100 rounded-xl border border-base-300 p-6 shadow-sm text-center">
        <div class="text-5xl mb-2">{moonPhase().emoji}</div>
        <h3 class="text-lg font-semibold text-cream">{moonPhase().phase}</h3>
        <p class="text-sm text-muted">Iluminação: {moonPhase().illumination}%</p>
      </div>

      {/* Planets table */}
      <div class="glass rounded-2xl border-glow shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-base-300 bg-base-100">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Planeta</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Signo</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Posição</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-muted uppercase">Longitude</th>
            </tr>
          </thead>
          <tbody>
            <For each={planets()}>
              {(p) => (
                <tr class="border-b border-base-300/50/50 hover:bg-base-200/30">
                  <td class="px-4 py-2.5">
                    <span class="text-lg mr-2">{p.symbol}</span>
                    <span class="text-sm font-medium text-cream">{p.name}</span>
                    {p.retro && <span class="ml-2 text-xs text-red-600 font-bold">R</span>}
                  </td>
                  <td class="px-4 py-2.5" style={{ color: ELEMENT_COLORS[p.sign] }}>
                    <span class="text-lg mr-1">{SIGN_SYMBOLS[p.sign]}</span>
                    <span class="text-sm">{SIGN_NAMES[p.sign]}</span>
                  </td>
                  <td class="px-4 py-2.5 font-mono text-sm text-muted">
                    {formatDegMin(p.deg)}
                  </td>
                  <td class="px-4 py-2.5 text-center font-mono text-xs text-muted">
                    {p.longitude.toFixed(4)}°
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Moon phase helpers
function getMoonPhaseName(phase: number): string {
  if (phase < 22.5) return 'Lua Nova';
  if (phase < 67.5) return 'Lua Crescente';
  if (phase < 112.5) return 'Quarto Crescente';
  if (phase < 157.5) return 'Gibosa Crescente';
  if (phase < 202.5) return 'Lua Cheia';
  if (phase < 247.5) return 'Gibosa Minguante';
  if (phase < 292.5) return 'Quarto Minguante';
  if (phase < 337.5) return 'Lua Minguante';
  return 'Lua Nova';
}

function getMoonPhaseEmoji(phase: number): string {
  if (phase < 22.5) return '🌑';
  if (phase < 67.5) return '🌒';
  if (phase < 112.5) return '🌓';
  if (phase < 157.5) return '🌔';
  if (phase < 202.5) return '🌕';
  if (phase < 247.5) return '🌖';
  if (phase < 292.5) return '🌗';
  if (phase < 337.5) return '🌘';
  return '🌑';
}
