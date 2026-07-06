import { createSignal, onMount, For, Show } from 'solid-js';
import { calculatePositions, initSweph, getSignIndex, getDegreeInSign, formatDegMin, angularDifference } from '../../engine/index';
import type { Positions } from '../../engine/types';

const PLANET_DATA = [
  { id: 'sun', name: 'Sol', symbol: '☉' },
  { id: 'moon', name: 'Lua', symbol: '☽' },
  { id: 'mercury', name: 'Mercúrio', symbol: '☿' },
  { id: 'venus', name: 'Vênus', symbol: '♀' },
  { id: 'mars', name: 'Marte', symbol: '♂' },
  { id: 'jupiter', name: 'Júpiter', symbol: '♃' },
  { id: 'saturn', name: 'Saturno', symbol: '♄' },
];
const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const ASPECT_NAMES: Record<string, string> = { conjunction: 'Conjunção', sextile: 'Sextil', square: 'Quadratura', trine: 'Trígono', opposition: 'Oposição' };
const ASPECT_SYMBOLS: Record<string, string> = { conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍' };

interface CelestialEvent {
  type: 'ingress' | 'aspect' | 'moon-phase' | 'retrograde';
  description: string;
  icon: string;
  time?: string;
}

export default function CelestialEventsApp() {
  const [events, setEvents] = createSignal<CelestialEvent[]>([]);
  const [date, setDate] = createSignal(new Date().toISOString().split('T')[0]);

  onMount(async () => {
    await initSweph();
    calculateEvents(date());
  });

  const calculateEvents = (dateStr: string) => {
    const today = new Date(dateStr + 'T12:00:00Z');
    const yesterday = new Date(today.getTime() - 86400000);
    const tomorrow = new Date(today.getTime() + 86400000);

    const posToday = calculatePositions(today);
    const posYesterday = calculatePositions(yesterday);
    const posTomorrow = calculatePositions(tomorrow);

    const evts: CelestialEvent[] = [];

    // Detect sign ingresses (planet changed sign since yesterday)
    for (const p of PLANET_DATA) {
      const signToday = getSignIndex(posToday[p.id]?.longitude || 0);
      const signYesterday = getSignIndex(posYesterday[p.id]?.longitude || 0);
      if (signToday !== signYesterday) {
        evts.push({
          type: 'ingress',
          description: `${p.symbol} ${p.name} entra em ${SIGN_SYMBOLS[signToday]} ${SIGN_NAMES[signToday]}`,
          icon: p.symbol,
        });
      }
    }

    // Detect exact aspects between planets today (orb < 1°)
    const ASPECTS = [
      { angle: 0, name: 'conjunction', symbol: '☌' },
      { angle: 60, name: 'sextile', symbol: '⚹' },
      { angle: 90, name: 'square', symbol: '□' },
      { angle: 120, name: 'trine', symbol: '△' },
      { angle: 180, name: 'opposition', symbol: '☍' },
    ];

    for (let i = 0; i < PLANET_DATA.length; i++) {
      for (let j = i + 1; j < PLANET_DATA.length; j++) {
        const p1 = PLANET_DATA[i];
        const p2 = PLANET_DATA[j];
        const lon1 = posToday[p1.id]?.longitude || 0;
        const lon2 = posToday[p2.id]?.longitude || 0;
        const diff = angularDifference(lon1, lon2);

        for (const asp of ASPECTS) {
          const orb = Math.abs(diff - asp.angle);
          if (orb < 1.5) {
            evts.push({
              type: 'aspect',
              description: `${p1.symbol} ${p1.name} ${asp.symbol} ${p2.symbol} ${p2.name} (${ASPECT_NAMES[asp.name]}, orbe ${orb.toFixed(1)}°)`,
              icon: asp.symbol,
            });
            break;
          }
        }
      }
    }

    // Moon phase detection
    const sunLon = posToday.sun?.longitude || 0;
    const moonLon = posToday.moon?.longitude || 0;
    const phase = angularDifference(sunLon, moonLon);
    const phaseYesterday = angularDifference(posYesterday.sun?.longitude || 0, posYesterday.moon?.longitude || 0);

    if (phase < 10 && phaseYesterday > 350) {
      evts.push({ type: 'moon-phase', description: '🌑 Lua Nova', icon: '🌑' });
    } else if (Math.abs(phase - 90) < 5 && Math.abs(phaseYesterday - 90) > 5) {
      evts.push({ type: 'moon-phase', description: '🌓 Quarto Crescente', icon: '🌓' });
    } else if (Math.abs(phase - 180) < 5 && Math.abs(phaseYesterday - 180) > 5) {
      evts.push({ type: 'moon-phase', description: '🌕 Lua Cheia', icon: '🌕' });
    } else if (Math.abs(phase - 270) < 5 && Math.abs(phaseYesterday - 270) > 5) {
      evts.push({ type: 'moon-phase', description: '🌗 Quarto Minguante', icon: '🌗' });
    }

    // Retrograde stations
    for (const p of PLANET_DATA) {
      if (p.id === 'sun' || p.id === 'moon') continue;
      const retroToday = posToday[p.id]?.isRetrograde;
      const retroYesterday = posYesterday[p.id]?.isRetrograde;
      if (retroToday && !retroYesterday) {
        evts.push({ type: 'retrograde', description: `${p.symbol} ${p.name} fica RETRÓGRADO`, icon: '⟲' });
      }
      if (!retroToday && retroYesterday) {
        evts.push({ type: 'retrograde', description: `${p.symbol} ${p.name} fica DIRETO`, icon: '⟳' });
      }
    }

    setEvents(evts);
  };

  const handleDateChange = (dateStr: string) => {
    setDate(dateStr);
    calculateEvents(dateStr);
  };

  return (
    <div class="space-y-4">
      <div class="glass rounded-2xl p-4 flex items-center gap-4">
        <input
          type="date" value={date()}
          onInput={(e) => handleDateChange(e.currentTarget.value)}
          class="px-3 py-2 rounded-lg border border-base-400 bg-base-200 text-cream text-sm"
        />
        <button onClick={() => handleDateChange(new Date().toISOString().split('T')[0])} class="px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg">Hoje</button>
      </div>

      <Show when={events().length > 0} fallback={
        <div class="glass rounded-2xl p-6 text-center text-muted">
          <p>Nenhum evento celeste significativo neste dia.</p>
        </div>
      }>
        <div class="space-y-2">
          <For each={events()}>
            {(evt) => (
              <div class={`bg-base-50 rounded-xl border p-4 shadow-sm flex items-center gap-3 ${
                evt.type === 'ingress' ? 'border-green-800' :
                evt.type === 'aspect' ? 'border-blue-800' :
                evt.type === 'moon-phase' ? 'border-purple-800' :
                'border-red-800'
              }`}>
                <span class="text-2xl">{evt.icon}</span>
                <div>
                  <p class="text-sm font-medium text-cream">{evt.description}</p>
                  <p class="text-xs text-muted uppercase">
                    {evt.type === 'ingress' ? 'Ingresso' : evt.type === 'aspect' ? 'Aspecto exato' : evt.type === 'moon-phase' ? 'Fase lunar' : 'Estação'}
                  </p>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
