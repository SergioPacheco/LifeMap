import { createSignal, onMount, For, Show } from 'solid-js';
import { calculatePositions, initSweph, getSignIndex, getDegreeInSign, formatDegMin } from '../../engine/index';

const PLANET_IDS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northNode', 'chiron'];
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', chiron: '⚷',
};
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

interface EphRow {
  date: string;
  positions: Record<string, { sign: number; deg: number; retro: boolean }>;
}

export default function EphemerisApp() {
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

  const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  return (
    <div class="space-y-4">
      {/* Header */}
      <div class="mb-2">
        <h1 class="text-2xl font-serif font-bold text-cream">Efemérides Planetárias</h1>
        <p class="text-muted mt-1 text-sm leading-relaxed max-w-3xl">
          Posição exata dos planetas para cada dia do mês. Use para consultar trânsitos, verificar ingressos em signos, 
          identificar períodos retrógrados (℞) e planejar ações com base no movimento celeste.
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
          <For each={MONTHS_PT}>
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
      <Show when={!loading()} fallback={<div class="text-center py-8 text-muted">Calculando efemérides...</div>}>
        <div class="glass rounded-2xl border-glow shadow-sm overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-base-300 bg-base-100">
                <th class="px-2 py-2 text-left font-medium text-muted">Dia</th>
                <For each={PLANET_IDS}>
                  {(pid) => (
                    <th class="px-1 py-2 text-center font-medium text-muted" title={pid}>
                      {PLANET_SYMBOLS[pid]}
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
                          <td class={`px-1 py-1 text-center font-mono ${data.retro ? 'text-red-600' : 'text-muted'}`}>
                            <span class="text-[10px]">{SIGN_SYMBOLS[data.sign]}</span>
                            {Math.floor(data.deg)}°
                            {data.retro ? <span class="text-red-500 text-[8px]">r</span> : ''}
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
        <p class="font-medium text-cream-dark text-sm">Como ler a tabela</p>
        <div class="flex flex-wrap gap-x-6 gap-y-1">
          <span>♈ Áries</span><span>♉ Touro</span><span>♊ Gêmeos</span><span>♋ Câncer</span>
          <span>♌ Leão</span><span>♍ Virgem</span><span>♎ Libra</span><span>♏ Escorpião</span>
          <span>♐ Sagitário</span><span>♑ Capricórnio</span><span>♒ Aquário</span><span>♓ Peixes</span>
        </div>
        <div class="flex flex-wrap gap-x-6 gap-y-1 pt-1 border-t border-base-300/50">
          <span><span class="text-red-500">r</span> = Retrógrado</span>
          <span>°  = Grau no signo (0°–29°)</span>
          <span>☊ = Nodo Norte (ponto kármico)</span>
          <span>⚷ = Quíron (curador ferido)</span>
        </div>
        <p class="pt-1 border-t border-base-300/50 text-[11px]">
          Posições calculadas para o meio-dia (12h UTC) de cada dia. Fonte: Swiss Ephemeris (precisão de arco-segundo).
        </p>
      </div>
    </div>
  );
}
