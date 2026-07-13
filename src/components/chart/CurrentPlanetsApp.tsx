import { createSignal, onMount, For } from 'solid-js';
import { calculatePositions, initSweph, getSignIndex, getDegreeInSign, formatDegMin } from '../../engine/index';
import * as Astronomy from 'astronomy-engine';
import { localeToDateLocale } from '../../utils/dateTime';
import { getTranslations, type Locale } from '../../i18n';
import { getInterpretations } from '../../engine/interpretations';
import { getCurrentPlanetsText, getToolsUi } from '../../i18n/tools-ui';

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

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const ELEMENT_COLORS = ['#cc0000','#006600','#0000cc','#cc6600','#cc0000','#006600','#0000cc','#cc6600','#cc0000','#006600','#0000cc','#cc6600'];

interface PlanetRow {
  id: string; name: string; symbol: string;
  sign: number; deg: number; retro: boolean; longitude: number;
}

interface Props {
  locale: Locale;
}

export default function CurrentPlanetsApp(props: Props) {
  const text = () => getCurrentPlanetsText(props.locale);
  const phases = () => getToolsUi(props.locale).moon.phases;
  const t = () => getTranslations(props.locale);
  const interp = () => getInterpretations(props.locale);
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
          name: interp().PLANET_NAMES[p.id] || p.name,
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
      const phaseName = getMoonPhaseName(phase, phases());
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
        <p class="text-sm text-muted">{text().realtime}</p>
        <p class="text-lg font-mono text-cream">{now().toLocaleString(localeToDateLocale(props.locale))}</p>
      </div>

      {/* Moon Phase */}
      <div class="bg-gradient-to-r from-dark-50 to-dark-100 rounded-xl border border-base-300 p-6 shadow-sm text-center">
        <div class="text-5xl mb-2">{moonPhase().emoji}</div>
        <h3 class="text-lg font-semibold text-cream">{moonPhase().phase}</h3>
        <p class="text-sm text-muted">{text().illumination}: {moonPhase().illumination}%</p>
      </div>

      {/* Planets table */}
      <div class="glass rounded-2xl border-glow shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-base-300 bg-base-100">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t().chart.planet}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{t().chart.sign}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{text().position}</th>
              <th class="px-4 py-3 text-center text-xs font-medium text-muted uppercase">{text().longitude}</th>
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
                    <span class="text-sm">{interp().SIGN_NAMES[p.sign]}</span>
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
function getMoonPhaseName(phase: number, names: readonly string[]): string {
  if (phase < 22.5) return names[0];
  if (phase < 67.5) return names[1];
  if (phase < 112.5) return names[2];
  if (phase < 157.5) return names[3];
  if (phase < 202.5) return names[4];
  if (phase < 247.5) return names[5];
  if (phase < 292.5) return names[6];
  if (phase < 337.5) return names[7];
  return names[0];
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
