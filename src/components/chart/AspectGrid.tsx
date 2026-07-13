import { Show, For, createMemo } from 'solid-js';
import type { NatalChart, Aspect, AspectType } from '../../engine/types';
import type { Locale } from '../../i18n';
import { getInterpretations } from '../../engine/interpretations';
import { getChartUi } from '../../i18n/chart-ui';

interface Props {
  chart: NatalChart | null;
  locale?: Locale;
}

// Planets to display (in order)
const PLANET_IDS = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
  'chiron', 'northNode',
] as const;

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  chiron: '⚷',
  northNode: '☊',
};

const ASPECT_SYMBOLS: Record<AspectType, string> = {
  conjunction: '☌',
  sextile: '✶',
  square: '□',
  trine: '△',
  opposition: '☍',
};

const ASPECT_COLORS: Record<AspectType, string> = {
  conjunction: '#44aa44',
  sextile: '#3366cc',
  square: '#cc3333',
  trine: '#3366cc',
  opposition: '#cc3333',
};

export default function AspectGrid(props: Props) {
  const text = () => getChartUi(props.locale);
  const planetNames = () => getInterpretations(props.locale).PLANET_NAMES;
  // Build a lookup map: "planet1|planet2" -> Aspect (normalized so planet1 < planet2 by index)
  const aspectMap = createMemo(() => {
    if (!props.chart) return new Map<string, Aspect>();

    const map = new Map<string, Aspect>();
    const indexOf = (id: string) => PLANET_IDS.indexOf(id as typeof PLANET_IDS[number]);

    for (const aspect of props.chart.aspects) {
      const i1 = indexOf(aspect.planet1);
      const i2 = indexOf(aspect.planet2);

      // Only include aspects between planets in our display list
      if (i1 === -1 || i2 === -1) continue;

      // Normalize key: lower index first
      const [a, b] = i1 < i2 ? [aspect.planet1, aspect.planet2] : [aspect.planet2, aspect.planet1];
      map.set(`${a}|${b}`, aspect);
    }

    return map;
  });

  // Get aspect between two planets (col is always < row index = lower triangle)
  const getAspect = (rowId: string, colId: string): Aspect | undefined => {
    const i1 = PLANET_IDS.indexOf(rowId as typeof PLANET_IDS[number]);
    const i2 = PLANET_IDS.indexOf(colId as typeof PLANET_IDS[number]);
    const [a, b] = i1 > i2 ? [colId, rowId] : [rowId, colId];
    return aspectMap().get(`${a}|${b}`);
  };

  // Build visible planets (only those present in chart positions)
  const visiblePlanets = createMemo(() => {
    if (!props.chart) return [];
    return PLANET_IDS.filter(id => id in props.chart!.positions);
  });

  return (
    <Show when={props.chart}>
      <div
        class="rounded-2xl p-4 shadow-dark"
        style={{
          background: 'rgba(13, 13, 20, 0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          'backdrop-filter': 'blur(12px)',
        }}
      >
        <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">
          {text().aspectGrid}
        </h3>

        <div class="overflow-x-auto">
          <table
            style={{
              'border-collapse': 'collapse',
              'min-width': 'max-content',
            }}
          >
            <thead>
              <tr>
                {/* Top-left corner spacer */}
                <th style={{ width: '28px', height: '28px' }} />

                {/* Column headers: planets 0..N-2 (all except last) */}
                <For each={visiblePlanets().slice(0, -1)}>
                  {(colId) => (
                    <th
                      title={planetNames()[colId]}
                      style={{
                        width: '26px',
                        height: '26px',
                        'font-size': '14px',
                        'text-align': 'center',
                        color: 'rgba(240,220,160,0.7)',
                        'font-weight': 'normal',
                        padding: '0',
                      }}
                    >
                      {PLANET_SYMBOLS[colId]}
                    </th>
                  )}
                </For>
              </tr>
            </thead>

            <tbody>
              {/* Row i (starting from planet[1]) — only lower triangle */}
              <For each={visiblePlanets().slice(1)}>
                {(rowId) => {
                  const rowIndexInFull = () => visiblePlanets().indexOf(rowId);
                  // Columns: planets 0 .. rowIndex-1 (strictly left of diagonal)
                  const cols = () => visiblePlanets().slice(0, rowIndexInFull());

                  return (
                    <tr>
                      {/* Row header: planet symbol */}
                      <td
                        title={planetNames()[rowId]}
                        style={{
                          'font-size': '14px',
                          'text-align': 'right',
                          'padding-right': '4px',
                          color: 'rgba(240,220,160,0.7)',
                          'white-space': 'nowrap',
                          'vertical-align': 'middle',
                          height: '26px',
                        }}
                      >
                        {PLANET_SYMBOLS[rowId]}
                      </td>

                      {/* Aspect cells */}
                      <For each={cols()}>
                        {(colId) => {
                          const aspect = getAspect(rowId, colId);
                          const orb = aspect ? aspect.orb.toFixed(1) : '';
                          const title = aspect
                            ? `${planetNames()[colId]} ${ASPECT_SYMBOLS[aspect.type]} ${planetNames()[rowId]} ${orb}°`
                            : `${planetNames()[colId]} — ${planetNames()[rowId]}`;

                          return (
                            <td
                              title={title}
                              style={{
                                width: '26px',
                                height: '26px',
                                'text-align': 'center',
                                'vertical-align': 'middle',
                                padding: '0',
                                'font-size': '13px',
                                cursor: aspect ? 'default' : undefined,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                'border-radius': '2px',
                                color: aspect ? ASPECT_COLORS[aspect.type] : 'transparent',
                                'font-weight': aspect ? 'bold' : 'normal',
                                'line-height': '1',
                              }}
                            >
                              {aspect ? ASPECT_SYMBOLS[aspect.type] : ''}
                            </td>
                          );
                        }}
                      </For>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div
          class="mt-3 flex flex-wrap gap-3"
          style={{ 'font-size': '11px', color: 'rgba(200,180,120,0.6)' }}
        >
          <For each={Object.entries(ASPECT_SYMBOLS) as [AspectType, string][]}>
            {([type, symbol]) => (
              <span style={{ display: 'inline-flex', 'align-items': 'center', gap: '3px' }}>
                <span style={{ color: ASPECT_COLORS[type], 'font-size': '13px', 'font-weight': 'bold' }}>
                  {symbol}
                </span>
                <span>{text().aspects[type]}</span>
              </span>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}
