import { createSignal, onMount, For } from 'solid-js';
import { calculatePositions, initSweph, getSignIndex, angularDifference } from '../../engine/index';

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

interface MoonDay {
  day: number;
  sign: number;
  signChanged: boolean;
  phaseEmoji: string;
  phaseName: string;
  illumination: number;
  isNewMoon: boolean;
  isFullMoon: boolean;
  isQuarter: boolean;
}

export default function MoonPhasesApp() {
  const [year, setYear] = createSignal(new Date().getFullYear());
  const [month, setMonth] = createSignal(new Date().getMonth() + 1);
  const [days, setDays] = createSignal<MoonDay[]>([]);

  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  onMount(async () => { await initSweph(); calculate(); });

  const calculate = () => {
    const results: MoonDay[] = [];
    const daysInMonth = new Date(year(), month(), 0).getDate();
    let prevSign = -1;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year(), month() - 1, day, 12));
      const pos = calculatePositions(date);

      const moonLon = pos.moon?.longitude || 0;
      const sunLon = pos.sun?.longitude || 0;
      const sign = getSignIndex(moonLon);
      const signChanged = prevSign !== -1 && sign !== prevSign;
      prevSign = sign;

      // Phase angle (Sun-Moon elongation)
      let elongation = moonLon - sunLon;
      if (elongation < 0) elongation += 360;

      const phaseData = getPhaseData(elongation);
      const illumination = Math.round((1 - Math.cos(elongation * Math.PI / 180)) / 2 * 100);

      results.push({
        day,
        sign,
        signChanged,
        phaseEmoji: phaseData.emoji,
        phaseName: phaseData.name,
        illumination,
        isNewMoon: elongation < 12 || elongation > 348,
        isFullMoon: Math.abs(elongation - 180) < 12,
        isQuarter: Math.abs(elongation - 90) < 8 || Math.abs(elongation - 270) < 8,
      });
    }
    setDays(results);
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
      </div>

      {/* Calendar grid */}
      <div class="glass rounded-2xl border-glow shadow-sm overflow-hidden">
        <div class="grid grid-cols-7 gap-px bg-base-300">
          {/* Header */}
          {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => (
            <div class="bg-base-100 px-2 py-2 text-center text-xs font-medium text-muted">{d}</div>
          ))}

          {/* Empty cells for offset */}
          {(() => {
            const firstDay = new Date(year(), month() - 1, 1).getDay();
            const offset = firstDay === 0 ? 6 : firstDay - 1;
            return Array(offset).fill(null).map(() => (
              <div class="bg-base-50 p-2"></div>
            ));
          })()}

          {/* Day cells */}
          <For each={days()}>
            {(d) => (
              <div class={`bg-base-50 p-2 min-h-[70px] ${
                d.isNewMoon ? 'ring-2 ring-purple-600' :
                d.isFullMoon ? 'ring-2 ring-yellow-600' : ''
              }`}>
                <div class="flex justify-between items-start">
                  <span class="text-xs font-bold text-cream-dark">{d.day}</span>
                  <span class="text-lg">{d.phaseEmoji}</span>
                </div>
                <div class="mt-1">
                  <span class="text-xs" title={SIGN_NAMES[d.sign]}>{SIGN_SYMBOLS[d.sign]}</span>
                  {d.signChanged && <span class="text-[8px] text-brand-600 ml-0.5">●</span>}
                </div>
                <div class="text-[9px] text-muted mt-0.5">{d.illumination}%</div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* Legend */}
      <div class="flex flex-wrap gap-4 text-xs text-muted px-2">
        <span>🌑 Lua Nova</span>
        <span>🌓 Quarto Crescente</span>
        <span>🌕 Lua Cheia</span>
        <span>🌗 Quarto Minguante</span>
        <span><span class="text-brand-600">●</span> Mudança de signo</span>
      </div>
    </div>
  );
}

function getPhaseData(elongation: number): { emoji: string; name: string } {
  if (elongation < 22.5 || elongation > 337.5) return { emoji: '🌑', name: 'Nova' };
  if (elongation < 67.5) return { emoji: '🌒', name: 'Crescente' };
  if (elongation < 112.5) return { emoji: '🌓', name: 'Quarto Cr.' };
  if (elongation < 157.5) return { emoji: '🌔', name: 'Gibosa Cr.' };
  if (elongation < 202.5) return { emoji: '🌕', name: 'Cheia' };
  if (elongation < 247.5) return { emoji: '🌖', name: 'Gibosa Mn.' };
  if (elongation < 292.5) return { emoji: '🌗', name: 'Quarto Mn.' };
  return { emoji: '🌘', name: 'Minguante' };
}
