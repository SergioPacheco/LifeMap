// ============================================================
// FilterBar.tsx — Barra de filtros por tipo, tema e energia
// ============================================================

import { For } from 'solid-js';
import type { Theme } from '../../../engine/calendar/types';
import { THEME_INFO } from '../../../engine/calendar/theme-mapper';

interface Props {
  activeTypes: Set<string>;
  activeThemes: Set<Theme>;
  energyFilter: Set<string>;
  onToggleType: (type: string) => void;
  onToggleTheme: (theme: Theme) => void;
  onToggleEnergy: (energy: string) => void;
}

const EVENT_TYPES = [
  { id: 'transit-aspect', label: 'Trânsitos', icon: '🪐' },
  { id: 'moon-phase', label: 'Lua', icon: '☽' },
  { id: 'moon-ingress', label: 'Ingressos ☽', icon: '→' },
  { id: 'planet-ingress', label: 'Ingressos', icon: '➡️' },
  { id: 'void-of-course', label: 'Lua Vazia', icon: '⏸️' },
  { id: 'retrograde-start', label: 'Retrógrados', icon: '℞' },
  { id: 'retrograde-end', label: 'Diretos', icon: 'D' },
];

const ENERGY_OPTIONS = [
  { id: 'favorable', label: 'Favoráveis', color: 'bg-green-500' },
  { id: 'neutral', label: 'Neutros', color: 'bg-gray-500' },
  { id: 'tense', label: 'Tensos', color: 'bg-red-500' },
  { id: 'special', label: 'Especiais', color: 'bg-gold' },
];

const THEMES: Theme[] = ['love', 'career', 'finances', 'health', 'spirituality', 'family', 'creativity', 'communication'];

export function FilterBar(props: Props) {
  return (
    <div class="glass rounded-2xl p-4 space-y-3">
      {/* Event type filters */}
      <div class="flex flex-wrap gap-1.5">
        <span class="text-[10px] text-muted uppercase font-semibold mr-2 self-center">Tipo:</span>
        <For each={EVENT_TYPES}>
          {(type) => (
            <button
              onClick={() => props.onToggleType(type.id)}
              class={`
                px-2 py-1 rounded-md text-[11px] border transition-colors
                ${props.activeTypes.has(type.id)
                  ? 'bg-base-100 border-gold/40 text-cream'
                  : 'bg-transparent border-base-400/50 text-muted hover:text-cream hover:border-base-300'
                }
              `}
            >
              {type.icon} {type.label}
            </button>
          )}
        </For>
      </div>

      {/* Theme filters */}
      <div class="flex flex-wrap gap-1.5">
        <span class="text-[10px] text-muted uppercase font-semibold mr-2 self-center">Tema:</span>
        <For each={THEMES}>
          {(theme) => (
            <button
              onClick={() => props.onToggleTheme(theme)}
              class={`
                px-2 py-1 rounded-md text-[11px] border transition-colors
                ${props.activeThemes.has(theme)
                  ? 'border-opacity-60 text-cream'
                  : 'bg-transparent border-base-400/50 text-muted hover:text-cream'
                }
              `}
              style={props.activeThemes.has(theme) ? `border-color: ${THEME_INFO[theme]?.color}60; background: ${THEME_INFO[theme]?.color}15;` : ''}
            >
              {THEME_INFO[theme]?.icon} {THEME_INFO[theme]?.label}
            </button>
          )}
        </For>
      </div>

      {/* Energy filters */}
      <div class="flex flex-wrap gap-1.5">
        <span class="text-[10px] text-muted uppercase font-semibold mr-2 self-center">Energia:</span>
        <For each={ENERGY_OPTIONS}>
          {(opt) => (
            <button
              onClick={() => props.onToggleEnergy(opt.id)}
              class={`
                flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border transition-colors
                ${props.energyFilter.has(opt.id)
                  ? 'bg-base-100 border-gold/40 text-cream'
                  : 'bg-transparent border-base-400/50 text-muted hover:text-cream'
                }
              `}
            >
              <span class={`w-2 h-2 rounded-full ${opt.color}`} />
              {opt.label}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
