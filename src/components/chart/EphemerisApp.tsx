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
// Cores por ELEMENTO do signo — alto contraste em fundo escuro
const SIGN_ELEMENT_COLORS = ['#ff6b6b','#66d96e','#6ba3ff','#ffaa55','#ff6b6b','#66d96e','#6ba3ff','#ffaa55','#ff6b6b','#66d96e','#6ba3ff','#ffaa55'];
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
        <h1 class="text-2xl sm:text-3xl font-serif font-bold text-cream">{t().ephemerisPage.title}</h1>
        <p class="text-muted mt-2 text-sm leading-relaxed max-w-3xl">
          {t().ephemerisPage.description}
        </p>
      </div>

      {/* Explicação — Para que serve */}
      <details class="mb-6 group">
        <summary class="cursor-pointer flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-light transition-colors">
          <svg class="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
          Para que serve esta tabela?
        </summary>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="glass rounded-xl p-5 border border-base-300">
            <h3 class="text-sm font-semibold text-cream mb-3 flex items-center gap-2">
              <span class="text-gold">📅</span> O que é uma Efeméride?
            </h3>
            <p class="text-xs text-cream-dark leading-relaxed">
              Uma efeméride é um <strong class="text-cream">almanaque astronômico</strong> que mostra a posição exata de cada planeta para cada dia do mês.
              É a ferramenta fundamental do astrólogo — equivale a um "GPS do céu".
            </p>
          </div>

          <div class="glass rounded-xl p-5 border border-base-300">
            <h3 class="text-sm font-semibold text-cream mb-3 flex items-center gap-2">
              <span class="text-gold">🔍</span> Para que usar?
            </h3>
            <ul class="space-y-1.5 text-xs text-cream-dark">
              <li>• <strong class="text-cream">Verificar trânsitos</strong> — quando um planeta entra em um novo signo</li>
              <li>• <strong class="text-cream">Identificar retrógrados</strong> — marcados com ℞ (planeta "anda para trás")</li>
              <li>• <strong class="text-cream">Planejar datas</strong> — escolher dias com configurações favoráveis</li>
              <li>• <strong class="text-cream">Estudar padrões</strong> — como a Lua muda de signo a cada ~2.5 dias</li>
            </ul>
          </div>

          <div class="glass rounded-xl p-5 border border-base-300">
            <h3 class="text-sm font-semibold text-cream mb-3 flex items-center gap-2">
              <span class="text-gold">📖</span> Como ler a tabela
            </h3>
            <p class="text-xs text-cream-dark leading-relaxed mb-2">
              Cada célula mostra: <strong class="text-cream">signo</strong> (glifo grande colorido) + <strong class="text-cream">grau</strong> (número abaixo, 0°–29°).
            </p>
            <p class="text-xs text-cream-dark leading-relaxed">
              <strong class="text-cream">Exemplo:</strong> ♋ 15° = o planeta está a 15 graus de Câncer naquele dia.
              Quando o grau vai de 29° para 0° no dia seguinte com signo diferente, houve um <strong class="text-cream">ingresso</strong> (mudança de signo).
            </p>
          </div>

          <div class="glass rounded-xl p-5 border border-base-300">
            <h3 class="text-sm font-semibold text-cream mb-3 flex items-center gap-2">
              <span class="text-gold">⚡</span> Destaques para observar
            </h3>
            <ul class="space-y-1.5 text-xs text-cream-dark">
              <li>• <span class="text-red-400 font-bold">℞</span> = <strong class="text-cream">Retrógrado</strong> — planeta "revisando" temas (comunicação, amor, ação)</li>
              <li>• <strong class="text-cream">Lua</strong> muda de signo rápido (~cada 2 dias) — afeta o humor coletivo</li>
              <li>• <strong class="text-cream">Mercúrio ℞</strong> = rever comunicações, evitar contratos novos</li>
              <li>• <strong class="text-cream">Vênus ℞</strong> = rever relacionamentos e valores</li>
            </ul>
          </div>
        </div>
      </details>

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
          <table class="w-full">
            <thead>
              <tr class="border-b border-base-300 bg-base-100">
                <th class="px-3 py-3 text-left font-medium text-muted text-xs">{t().ephemerisPage.day}</th>
                <For each={PLANET_IDS}>
                  {(pid) => (
                    <th class="px-2 py-3 text-center" title={pid}>
                      <div class="flex flex-col items-center gap-0.5">
                        <span class="text-xl leading-none" style={{ color: PLANET_COLORS[pid] }}>{PLANET_SYMBOLS[pid]}</span>
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
                  <tr class="border-b border-base-300/30 hover:bg-base-200/30">
                    <td class="px-3 py-2 font-bold text-sm text-cream">{row.date}</td>
                    <For each={PLANET_IDS}>
                      {(pid) => {
                        const data = row.positions[pid];
                        if (!data) return <td></td>;
                        return (
                          <td class="px-1 py-2 text-center">
                            <div class="flex flex-col items-center gap-0">
                              <span class="text-base leading-none" style={{ color: SIGN_ELEMENT_COLORS[data.sign] }}>{SIGN_SYMBOLS[data.sign]}</span>
                              <span class={`text-[11px] font-mono ${data.retro ? 'text-red-400' : 'text-cream-dark'}`}>
                                {Math.floor(data.deg)}°{data.retro ? <span class="text-red-400 font-bold">℞</span> : ''}
                              </span>
                            </div>
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
      <div class="glass rounded-xl p-5 text-muted space-y-3">
        <p class="font-semibold text-cream text-sm">Legenda dos Signos</p>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          <For each={SIGN_KEYS}>
            {(key, i) => (
              <div class="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-base-200/50">
                <span class="text-lg">{SIGN_SYMBOLS[i()]}</span>
                <span class="text-xs text-cream-dark">{t().signs[key]}</span>
              </div>
            )}
          </For>
        </div>
        <div class="flex flex-wrap gap-x-6 gap-y-1 pt-2 border-t border-base-300/50 text-xs">
          <span class="flex items-center gap-1"><span class="text-red-400 font-bold text-sm">℞</span> = {t().ephemerisPage.retrograde}</span>
          <span>° = {t().ephemerisPage.degreeInSign}</span>
          <span class="flex items-center gap-1"><span class="text-base">☊</span> = {t().ephemerisPage.northNode}</span>
          <span class="flex items-center gap-1"><span class="text-base">⚷</span> = {t().ephemerisPage.chiron}</span>
        </div>
        <p class="pt-2 border-t border-base-300/50 text-[11px]">
          {t().ephemerisPage.source}
        </p>
      </div>
    </div>
  );
}
