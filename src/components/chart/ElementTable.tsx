import { Show, For, createMemo } from 'solid-js';
import type { NatalChart } from '../../engine/types';
import { getSignIndex } from '../../engine/calculations';

// ============================================================
// Props
// ============================================================

interface Props {
  chart: NatalChart | null;
}

// ============================================================
// Constants
// ============================================================

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  AC: 'AC', MC: 'MC',
};

// Sign index 0=Áries … 11=Peixes
const SIGN_ELEMENTS: ('fire' | 'earth' | 'air' | 'water')[] = [
  'fire',  // 0 Áries
  'earth', // 1 Touro
  'air',   // 2 Gêmeos
  'water', // 3 Câncer
  'fire',  // 4 Leão
  'earth', // 5 Virgem
  'air',   // 6 Libra
  'water', // 7 Escorpião
  'fire',  // 8 Sagitário
  'earth', // 9 Capricórnio
  'air',   // 10 Aquário
  'water', // 11 Peixes
];

const SIGN_MODALITIES: ('cardinal' | 'fixed' | 'mutable')[] = [
  'cardinal', // 0 Áries
  'fixed',    // 1 Touro
  'mutable',  // 2 Gêmeos
  'cardinal', // 3 Câncer
  'fixed',    // 4 Leão
  'mutable',  // 5 Virgem
  'cardinal', // 6 Libra
  'fixed',    // 7 Escorpião
  'mutable',  // 8 Sagitário
  'cardinal', // 9 Capricórnio
  'fixed',    // 10 Aquário
  'mutable',  // 11 Peixes
];

type ElementId = 'fire' | 'earth' | 'air' | 'water';
type ModalityId = 'cardinal' | 'fixed' | 'mutable';

const ELEMENTS: ElementId[] = ['fire', 'earth', 'air', 'water'];
const MODALITIES: ModalityId[] = ['cardinal', 'fixed', 'mutable'];

const ELEMENT_LABELS: Record<ElementId, string> = {
  fire: 'Fogo', earth: 'Terra', air: 'Ar', water: 'Água',
};
const MODALITY_LABELS: Record<ModalityId, string> = {
  cardinal: 'Cardinal', fixed: 'Fixo', mutable: 'Mutável',
};

const ELEMENT_COLORS: Record<ElementId, string> = {
  fire: '#e05555',
  earth: '#55aa55',
  air: '#5588dd',
  water: '#dd8844',
};

const ELEMENT_BG: Record<ElementId, string> = {
  fire: 'rgba(224,85,85,0.08)',
  earth: 'rgba(85,170,85,0.08)',
  air: 'rgba(85,136,221,0.08)',
  water: 'rgba(221,136,68,0.08)',
};

// ============================================================
// Planets to include (main + AC/MC as special points)
// ============================================================
const PLANET_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const;

// ============================================================
// Component
// ============================================================

export default function ElementTable(props: Props) {
  // Build the distribution grid: grid[element][modality] = string[]
  const distribution = createMemo(() => {
    const chart = props.chart;
    if (!chart) return null;

    // Initialize empty grid
    const grid: Record<ElementId, Record<ModalityId, string[]>> = {
      fire:  { cardinal: [], fixed: [], mutable: [] },
      earth: { cardinal: [], fixed: [], mutable: [] },
      air:   { cardinal: [], fixed: [], mutable: [] },
      water: { cardinal: [], fixed: [], mutable: [] },
    };

    // Main planets from positions
    for (const key of PLANET_KEYS) {
      const pos = chart.positions[key];
      if (!pos) continue;
      const si = getSignIndex(pos.longitude);
      const el = SIGN_ELEMENTS[si];
      const mod = SIGN_MODALITIES[si];
      grid[el][mod].push(PLANET_SYMBOLS[key]);
    }

    // ASC — from houses.ascendant
    if (chart.houses?.ascendant != null) {
      const si = getSignIndex(chart.houses.ascendant);
      const el = SIGN_ELEMENTS[si];
      const mod = SIGN_MODALITIES[si];
      grid[el][mod].push('AC');
    }

    // MC — from houses.midheaven
    if (chart.houses?.midheaven != null) {
      const si = getSignIndex(chart.houses.midheaven);
      const el = SIGN_ELEMENTS[si];
      const mod = SIGN_MODALITIES[si];
      grid[el][mod].push('MC');
    }

    // Row totals
    const rowTotals: Record<ElementId, number> = {
      fire: 0, earth: 0, air: 0, water: 0,
    };
    for (const el of ELEMENTS) {
      for (const mod of MODALITIES) {
        rowTotals[el] += grid[el][mod].length;
      }
    }

    // Column totals
    const colTotals: Record<ModalityId, number> = {
      cardinal: 0, fixed: 0, mutable: 0,
    };
    for (const mod of MODALITIES) {
      for (const el of ELEMENTS) {
        colTotals[mod] += grid[el][mod].length;
      }
    }

    const grandTotal = Object.values(rowTotals).reduce((a, b) => a + b, 0);

    // Sort elements by count descending for the proportion bar
    const sortedElements = [...ELEMENTS].sort((a, b) => rowTotals[b] - rowTotals[a]);

    return { grid, rowTotals, colTotals, grandTotal, sortedElements };
  });

  return (
    <Show when={props.chart && distribution()}>
      {(_) => {
        const d = distribution()!;

        return (
          <div
            class="glass rounded-2xl p-4 shadow-dark max-w-md"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">
              Elementos &amp; Modalidades
            </h3>

            {/* ── Grid ── */}
            <div class="overflow-x-auto">
              <table class="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th class="py-1 px-2 text-left text-muted font-medium" />
                    <For each={MODALITIES}>
                      {(mod) => (
                        <th class="py-1 px-2 text-center text-muted font-medium uppercase tracking-wide">
                          {MODALITY_LABELS[mod]}
                        </th>
                      )}
                    </For>
                    <th class="py-1 px-2 text-center text-muted font-medium uppercase tracking-wide">Σ</th>
                  </tr>
                </thead>
                <tbody>
                  <For each={ELEMENTS}>
                    {(el) => (
                      <tr
                        style={{
                          'border-left': `3px solid ${ELEMENT_COLORS[el]}`,
                          background: ELEMENT_BG[el],
                        }}
                      >
                        {/* Element label */}
                        <td
                          class="py-2 pl-2 pr-3 font-semibold whitespace-nowrap"
                          style={{ color: ELEMENT_COLORS[el] }}
                        >
                          {ELEMENT_LABELS[el]}
                        </td>

                        {/* Cells */}
                        <For each={MODALITIES}>
                          {(mod) => {
                            const symbols = d.grid[el][mod];
                            return (
                              <td
                                class="py-2 px-2 text-center align-middle"
                                style={{
                                  'border-left': '1px solid rgba(255,255,255,0.06)',
                                  'min-width': '4.5rem',
                                }}
                              >
                                <Show
                                  when={symbols.length > 0}
                                  fallback={<span class="text-muted opacity-40">—</span>}
                                >
                                  <span
                                    class="flex flex-wrap justify-center gap-0.5 leading-tight"
                                    title={symbols.join(' ')}
                                  >
                                    <For each={symbols}>
                                      {(sym) => (
                                        <span
                                          class="inline-block font-medium"
                                          style={{ color: ELEMENT_COLORS[el] }}
                                        >
                                          {sym}
                                        </span>
                                      )}
                                    </For>
                                  </span>
                                </Show>
                              </td>
                            );
                          }}
                        </For>

                        {/* Row total */}
                        <td
                          class="py-2 px-2 text-center font-bold"
                          style={{
                            color: ELEMENT_COLORS[el],
                            'border-left': '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          {d.rowTotals[el]}
                        </td>
                      </tr>
                    )}
                  </For>

                  {/* Column totals row */}
                  <tr style={{ 'border-top': '1px solid rgba(255,255,255,0.12)' }}>
                    <td class="py-1.5 pl-2 text-muted font-medium text-xs uppercase">Σ</td>
                    <For each={MODALITIES}>
                      {(mod) => (
                        <td
                          class="py-1.5 px-2 text-center font-bold text-cream-dark"
                          style={{ 'border-left': '1px solid rgba(255,255,255,0.06)' }}
                        >
                          {d.colTotals[mod]}
                        </td>
                      )}
                    </For>
                    <td
                      class="py-1.5 px-2 text-center font-bold text-cream"
                      style={{ 'border-left': '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {d.grandTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── Proportion bar ── */}
            <div class="mt-4 space-y-1.5">
              {/* Stacked bar */}
              <div class="flex rounded overflow-hidden h-2.5">
                <For each={d.sortedElements}>
                  {(el) => {
                    const pct = d.grandTotal > 0 ? (d.rowTotals[el] / d.grandTotal) * 100 : 0;
                    return (
                      <Show when={pct > 0}>
                        <div
                          title={`${ELEMENT_LABELS[el]}: ${Math.round(pct)}%`}
                          style={{
                            width: `${pct}%`,
                            background: ELEMENT_COLORS[el],
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </Show>
                    );
                  }}
                </For>
              </div>

              {/* Legend */}
              <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <For each={d.sortedElements}>
                  {(el) => {
                    const pct = d.grandTotal > 0
                      ? Math.round((d.rowTotals[el] / d.grandTotal) * 100)
                      : 0;
                    return (
                      <Show when={d.rowTotals[el] > 0}>
                        <span class="flex items-center gap-1">
                          <span
                            class="inline-block w-2 h-2 rounded-sm flex-shrink-0"
                            style={{ background: ELEMENT_COLORS[el] }}
                          />
                          <span style={{ color: ELEMENT_COLORS[el] }} class="font-medium">
                            {pct}% {ELEMENT_LABELS[el]}
                          </span>
                        </span>
                      </Show>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        );
      }}
    </Show>
  );
}
