import { createSignal, onMount, For, Show } from 'solid-js';
import { calculatePositions, initSweph, getSignIndex, getDegreeInSign, formatDegMin } from '../../engine/index';
import { getTranslations, type Locale } from '../../i18n';

const PLANET_IDS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northNode', 'chiron'];
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', chiron: '⚷',
};
const PLANET_COLORS: Record<string, string> = {
  sun: '#f0b840', moon: '#c0c8d8', mercury: '#80d090', venus: '#f0a0c0',
  mars: '#ff6050', jupiter: '#b080e0', saturn: '#90a8c0', uranus: '#60d8f0',
  neptune: '#7090ff', pluto: '#d06080', northNode: '#a0a0b0', chiron: '#c0a0e0',
};
const PLANET_NAMES_SHORT: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mer', venus: 'Vên', mars: 'Mar',
  jupiter: 'Júp', saturn: 'Sat', uranus: 'Ura', neptune: 'Net', pluto: 'Plu',
  northNode: 'NN', chiron: 'Qui',
};
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_KEYS = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'] as const;

interface EphRow {
  date: string;
  positions: Record<string, { sign: number; deg: number; retro: boolean }>;
}

interface Props {
  locale?: string;
}

export default function EphemerisApp(props: Props) {
  const locale = () => (props.locale || 'pt') as Locale;
  const t = () => getTranslations(locale());

  const [year, setYear] = createSignal(new Date().getFullYear());
  const [month, setMonth] = createSignal(new Date().getMonth() + 1);
  const [rows, setRows] = createSignal<EphRow[]>([]);
  const [loading, setLoading] = createSignal(false);

  onMount(async () => {
    await initSweph();
    calculate();
  });

  const calculate = () => {
    setLoading(true);
    const results: EphRow[] = [];
    const daysInMonth = new Date(year(), month(), 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year(), month() - 1, day, 12, 0, 0));
      const positions = calculatePositions(date);
      const row: EphRow = { date: `${day}`, positions: {} };

      for (const pid of PLANET_IDS) {
        const pos = positions[pid];
        if (pos) {
          row.positions[pid] = {
            sign: getSignIndex(pos.longitude),
            deg: getDegreeInSign(pos.longitude),
            retro: pos.isRetrograde || false,
          };
        }
      }
      results.push(row);
    }
    setRows(results);
    setLoading(false);
  };

  return (
    <div class="space-y-4">
      {/* Header */}
      <div class="mb-2">
        <h1 class="text-2xl font-serif font-bold text-cream">{t().ephemerisPage.title}</h1>
        <p class="text-muted mt-1 text-sm leading-relaxed max-w-3xl">
          {t().ephemerisPage.description}
        </p>
      </div>

      {/* Controls */}
      <div class="glass rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div class="flex items-center gap-2">
          <button onClick={() => { setYear(year() - 1); calculate(); }} class="px-2 py-1 text-sm bg-base-200 rounded">←</button>
          <span class="text-sm font-medium w-12 text-center">{year()}</span>
          <button onClick={() => { setYear(year() + 1); calculate(); }} class="px-2 py-1 text-sm bg-base-200 rounded">→</button>
        </div>
        <div class="flex gap-1 flex-wrap">
          <For each={t().ephemerisPage.months}>
            {(m, i) => (
              <button
                onClick={() => { setMonth(i() + 1); calculate(); }}
                class={`px-2 py-1 text-xs rounded ${month() === i() + 1 ? 'bg-brand-600 text-white' : 'bg-base-200 text-cream-dark'}`}
              >
                {m}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Table */}
      <Show when={!loading()} fallback={<div class="text-center py-8 text-muted">{t().ephemerisPage.loading}</div>}>
        <div class="glass rounded-2xl border-glow shadow-sm overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-base-300 bg-base-100">
                <th class="px-2 py-2 text-left font-medium text-muted">{t().ephemerisPage.day}</th>
                <For each={PLANET_IDS}>
                  {(pid) => (
                    <th class="px-1 py-2 text-center" title={pid}>
                      <div class="flex flex-col items-center gap-0.5">
                        <span class="text-lg leading-none" style={{ color: PLANET_COLORS[pid] }}>{PLANET_SYMBOLS[pid]}</span>
                        <span class="text-[9px] text-muted font-normal">{PLANET_NAMES_SHORT[pid]}</span>
                      </div>
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={rows()}>
                {(row) => (
                  <tr class="border-b border-base-300/50/50 hover:bg-base-200/30">
                    <td class="px-2 py-1 font-medium text-cream-dark">{row.date}</td>
                    <For each={PLANET_IDS}>
                      {(pid) => {
                        const data = row.positions[pid];
                        if (!data) return <td></td>;
                        return (
                          <td class={`px-1 py-1.5 text-center font-mono ${data.retro ? 'text-red-400' : 'text-cream-dark'}`}>
                            <span class="text-xs" style={{ color: PLANET_COLORS[pid], opacity: '0.8' }}>{SIGN_SYMBOLS[data.sign]}</span>
                            <span class="text-[11px]">{Math.floor(data.deg)}°</span>
                            {data.retro ? <span class="text-red-400 text-[9px] font-bold ml-0.5">℞</span> : ''}
                          </td>
                        );
                      }}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>

      {/* Legend */}
      <div class="glass rounded-xl p-4 text-xs text-muted space-y-2">
        <p class="font-medium text-cream-dark text-sm">{t().ephemerisPage.howToRead}</p>
        <div class="flex flex-wrap gap-x-6 gap-y-1">
          <For each={SIGN_KEYS}>
            {(key, i) => (
              <span>{SIGN_SYMBOLS[i()]} {t().signs[key]}</span>
            )}
          </For>
        </div>
        <div class="flex flex-wrap gap-x-6 gap-y-1 pt-1 border-t border-base-300/50">
          <span><span class="text-red-500">r</span> = {t().ephemerisPage.retrograde}</span>
          <span>° = {t().ephemerisPage.degreeInSign}</span>
          <span>☊ = {t().ephemerisPage.northNode}</span>
          <span>⚷ = {t().ephemerisPage.chiron}</span>
        </div>
        <p class="pt-1 border-t border-base-300/50 text-[11px]">
          {t().ephemerisPage.source}
        </p>
      </div>
    </div>
  );
}
