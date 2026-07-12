import { Show, For } from 'solid-js';
import type { NatalChart, DignityType } from '../../engine/types';
import { getSignIndex, getDegreeInSign } from '../../engine/calculations';

interface Props {
  chart: NatalChart | null;
}

const SIGN_NAMES = [
  'Áries','Touro','Gêmeos','Câncer','Leão','Virgem',
  'Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes',
];

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', southNode: '☋', lilith: '⚸', chiron: '⚷',
};

const DIGNITY_LABELS: Record<DignityType, string> = {
  domicile:   'Dom.',
  exaltation: 'Exalt.',
  detriment:  'Detr.',
  fall:       'Queda',
};

/** Format lat/lng as astro.com style: e.g. 53w01 or 24s11 */
function formatCoord(value: number, posDir: string, negDir: string): string {
  const abs   = Math.abs(value);
  const deg   = Math.floor(abs);
  const min   = Math.floor((abs - deg) * 60);
  const dir   = value >= 0 ? posDir : negDir;
  return `${deg}${dir}${min < 10 ? '0' : ''}${min}`;
}

/** Format a Date to "DD.MM.YYYY HH:mm" */
function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Get sign name + integer degree for a given longitude */
function signDeg(longitude: number): string {
  const si  = getSignIndex(longitude);
  const deg = Math.floor(getDegreeInSign(longitude));
  return `${SIGN_NAMES[si]} ${deg}°`;
}

/** House system display labels */
const HOUSE_SYSTEM_LABELS: Record<string, string> = {
  placidus:      'Placidus',
  koch:          'Koch',
  equal:         'Igual',
  'whole-sign':  'Signo Inteiro',
  campanus:      'Campanus',
  regiomontanus: 'Regiomontano',
};

export default function ChartHeader(props: Props) {
  return (
    <Show when={props.chart !== null}>
      {(() => {
        const c = () => props.chart!;
        const coordStr = () => `${formatCoord(c().meta.lat, 'n', 's')}, ${formatCoord(c().meta.lng, 'e', 'w')}`;
        const ascLon = () => c().houses.ascendant;
        const sunLon = () => c().positions.sun?.longitude ?? 0;
        const moonLon = () => c().positions.moon?.longitude ?? 0;
        const houseLabel = () => HOUSE_SYSTEM_LABELS[c().meta.houseSystem] ?? c().meta.houseSystem;
        const dateStr = () => formatDate(c().date);
        const dignityEntries = () => Object.entries(c().dignities ?? {}) as [string, DignityType][];

        return (
          <div class="glass rounded-xl px-4 py-2 text-xs text-cream-dark flex flex-wrap items-center gap-x-4 gap-y-1 leading-snug">

            {/* Name */}
            <Show when={c().meta.name}>
              <span class="font-semibold text-cream">{c().meta.name}</span>
              <span class="text-base-300 select-none">·</span>
            </Show>

            {/* Date */}
            <span class="text-muted">{dateStr()}</span>

            {/* City */}
            <Show when={c().meta.city}>
              <span class="text-base-300 select-none">·</span>
              <span class="text-muted">{c().meta.city}</span>
            </Show>

            {/* Coordinates */}
            <span class="text-base-300 select-none">·</span>
            <span class="font-mono text-muted">{coordStr()}</span>

            {/* House system */}
            <span class="text-base-300 select-none">·</span>
            <span class="text-muted">{houseLabel()}</span>

            {/* Separator */}
            <span class="text-base-300 select-none hidden sm:inline">|</span>

            {/* ASC */}
            <span>
              <span class="text-muted mr-0.5">ASC</span>
              <span class="text-cream font-medium">{signDeg(ascLon())}</span>
            </span>

            {/* Sun */}
            <span>
              <span class="mr-0.5">{PLANET_SYMBOLS.sun}</span>
              <span class="text-cream font-medium">{signDeg(sunLon())}</span>
            </span>

            {/* Moon */}
            <span>
              <span class="mr-0.5">{PLANET_SYMBOLS.moon}</span>
              <span class="text-cream font-medium">{signDeg(moonLon())}</span>
            </span>

            {/* Dignity badges — only when present */}
            <Show when={dignityEntries().length > 0}>
              <span class="text-base-300 select-none hidden sm:inline">|</span>
              <For each={dignityEntries()}>
                {([planet, dtype]) => {
                  const isPositive = dtype === 'domicile' || dtype === 'exaltation';
                  return (
                    <span
                      class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border"
                      classList={{
                        'text-yellow-400 border-yellow-700/40 bg-yellow-900/20': isPositive,
                        'text-red-400   border-red-700/40   bg-red-900/20':      !isPositive,
                      }}
                    >
                      {PLANET_SYMBOLS[planet] ?? planet}
                      <span class="opacity-80">{DIGNITY_LABELS[dtype]}</span>
                    </span>
                  );
                }}
              </For>
            </Show>

          </div>
        );
      })()}
    </Show>
  );
}
