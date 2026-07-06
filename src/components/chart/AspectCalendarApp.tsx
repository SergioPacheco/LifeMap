import { createSignal, onMount, For, Show } from 'solid-js';
import { calculatePositions, initSweph, angularDifference } from '../../engine/index';

const PLANETS = [
  { id: 'sun', symbol: '☉' }, { id: 'moon', symbol: '☽' },
  { id: 'mercury', symbol: '☿' }, { id: 'venus', symbol: '♀' },
  { id: 'mars', symbol: '♂' }, { id: 'jupiter', symbol: '♃' },
  { id: 'saturn', symbol: '♄' },
];
const ASPECTS = [
  { angle: 0, symbol: '☌', name: 'Conj', color: '#cc0000' },
  { angle: 60, symbol: '⚹', name: 'Sext', color: '#0000cc' },
  { angle: 90, symbol: '□', name: 'Quad', color: '#cc0000' },
  { angle: 120, symbol: '△', name: 'Tríg', color: '#0000cc' },
  { angle: 180, symbol: '☍', name: 'Opos', color: '#cc0000' },
];

interface AspectEvent {
  day: number;
  p1: string;
  p2: string;
  aspect: string;
  aspectSymbol: string;
  color: string;
  orb: number;
}

export default function AspectCalendarApp() {
  const [year, setYear] = createSignal(new Date().getFullYear());
  const [month, setMonth] = createSignal(new Date().getMonth() + 1);
  const [events, setEvents] = createSignal<AspectEvent[]>([]);

  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  onMount(async () => { await initSweph(); calculate(); });

  const calculate = () => {
    const results: AspectEvent[] = [];
    const daysInMonth = new Date(year(), month(), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year(), month() - 1, day, 12));
      const pos = calculatePositions(date);

      // Check aspects between all planet pairs (excluding Moon for less noise)
      for (let i = 0; i < PLANETS.length; i++) {
        for (let j = i + 1; j < PLANETS.length; j++) {
          if (PLANETS[i].id === 'moon' || PLANETS[j].id === 'moon') continue;

          const lon1 = pos[PLANETS[i].id]?.longitude || 0;
          const lon2 = pos[PLANETS[j].id]?.longitude || 0;
          const diff = angularDifference(lon1, lon2);

          for (const asp of ASPECTS) {
            const orb = Math.abs(diff - asp.angle);
            if (orb < 1.0) { // Very tight orb = exact today
              results.push({
                day,
                p1: PLANETS[i].symbol,
                p2: PLANETS[j].symbol,
                aspect: asp.name,
                aspectSymbol: asp.symbol,
                color: asp.color,
                orb: +orb.toFixed(2),
              });
              break;
            }
          }
        }
      }
    }
    setEvents(results);
  };

  return (
    <div class="space-y-4">
      {/* Controls */}
      <div class="glass rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div class="flex items-center gap-2">
          <button onClick={() => { setYear(year() - 1); calculate(); }} class="px-2 py-1 text-sm bg-base-200 rounded">←</button>
          <span class="font-bold">{year()}</span>
          <button onClick={() => { setYear(year() + 1); calculate(); }} class="px-2 py-1 text-sm bg-base-200 rounded">→</button>
        </div>
        <div class="flex gap-1 flex-wrap">
          <For each={MONTHS}>
            {(m, i) => (
              <button
                onClick={() => { setMonth(i() + 1); calculate(); }}
                class={`px-2 py-1 text-xs rounded ${month() === i() + 1 ? 'bg-brand-600 text-white' : 'bg-base-200 text-cream-dark'}`}
              >{m}</button>
            )}
          </For>
        </div>
        <span class="text-sm text-muted">{events().length} aspectos exatos</span>
      </div>

      {/* Events list */}
      <div class="glass rounded-2xl border-glow shadow-sm overflow-hidden">
        <Show when={events().length > 0} fallback={
          <div class="p-8 text-center text-muted">Nenhum aspecto exato neste mês (orbe &lt; 1°)</div>
        }>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-base-300 bg-base-100">
                <th class="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Dia</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Aspecto</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-muted uppercase">Tipo</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-muted uppercase">Orbe</th>
              </tr>
            </thead>
            <tbody>
              <For each={events()}>
                {(evt) => (
                  <tr class="border-b border-base-300/50/50">
                    <td class="px-4 py-2 font-mono font-bold">{evt.day}</td>
                    <td class="px-4 py-2">
                      <span class="text-lg">{evt.p1}</span>
                      <span class="mx-1 font-bold" style={{ color: evt.color }}>{evt.aspectSymbol}</span>
                      <span class="text-lg">{evt.p2}</span>
                    </td>
                    <td class="px-4 py-2 text-center text-xs" style={{ color: evt.color }}>{evt.aspect}</td>
                    <td class="px-4 py-2 text-center font-mono text-xs text-muted">{evt.orb}°</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </div>
    </div>
  );
}
