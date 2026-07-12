// ============================================================
// CalendarGrid.tsx — Grid mensal com células por dia
// ============================================================

import { For, Show, createMemo } from 'solid-js';
import type { DayData, DayEnergy } from '../../../engine/calendar/types';
import { THEME_INFO } from '../../../engine/calendar/theme-mapper';

interface Props {
  days: DayData[];
  year: number;
  month: number;
  selectedDay: DayData | null;
  onSelectDay: (day: DayData) => void;
  firstDayOfWeek: 0 | 1;
}

const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const ENERGY_COLORS: Record<DayEnergy, string> = {
  favorable: 'border-green-500/30 bg-green-500/[0.05]',
  neutral: 'border-base-400/50 bg-base-200/30',
  tense: 'border-red-500/30 bg-red-500/[0.05]',
  special: 'border-gold/40 bg-gold/[0.05]',
};

const ENERGY_DOT: Record<DayEnergy, string> = {
  favorable: 'bg-green-400',
  neutral: 'bg-gray-500',
  tense: 'bg-red-400',
  special: 'bg-gold',
};

const MOON_PHASE_ICONS: Record<string, string> = {
  'new': '🌑', 'waxing-crescent': '🌒', 'first-quarter': '🌓', 'waxing-gibbous': '🌔',
  'full': '🌕', 'waning-gibbous': '🌖', 'last-quarter': '🌗', 'waning-crescent': '🌘',
};

export function CalendarGrid(props: Props) {
  const today = new Date();
  const isToday = (day: DayData) =>
    day.date.getDate() === today.getDate() &&
    day.date.getMonth() === today.getMonth() &&
    day.date.getFullYear() === today.getFullYear();

  // Calculate padding days for the first week (REACTIVE)
  const offset = createMemo(() => {
    const firstDay = new Date(props.year, props.month, 1).getDay();
    return (firstDay - props.firstDayOfWeek + 7) % 7;
  });

  // Ordered day names based on firstDayOfWeek (REACTIVE)
  const orderedDays = createMemo(() => {
    const days = [...DAY_NAMES_SHORT];
    if (props.firstDayOfWeek === 1) {
      days.push(days.shift()!); // Move Dom to end
    }
    return days;
  });

  return (
    <div class="glass rounded-2xl p-4">
      {/* Day name headers */}
      <div class="grid grid-cols-7 gap-1 mb-2">
        <For each={orderedDays()}>
          {(name) => (
            <div class="text-center text-xs font-medium text-muted py-1">{name}</div>
          )}
        </For>
      </div>

      {/* Grid of days */}
      <div class="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        <For each={Array(offset()).fill(null)}>
          {() => <div class="aspect-square" />}
        </For>

        {/* Day cells */}
        <For each={props.days}>
          {(day) => (
            <button
              onClick={() => props.onSelectDay(day)}
              class={`
                aspect-square p-1 rounded-lg border transition-all cursor-pointer
                hover:border-gold/50 hover:shadow-sm
                ${ENERGY_COLORS[day.energy]}
                ${isToday(day) ? 'ring-2 ring-gold/50' : ''}
                ${props.selectedDay?.date.getDate() === day.date.getDate() ? 'ring-2 ring-gold border-gold/60' : ''}
              `}
            >
              <div class="h-full flex flex-col justify-between">
                {/* Top: day number + energy dot */}
                <div class="flex items-center justify-between">
                  <span class={`text-xs font-medium ${isToday(day) ? 'text-gold' : 'text-cream'}`}>
                    {day.date.getDate()}
                  </span>
                  <div class={`w-1.5 h-1.5 rounded-full ${ENERGY_DOT[day.energy]}`} />
                </div>

                {/* Middle: moon phase + event icons */}
                <div class="flex flex-wrap gap-0.5 justify-center">
                  {/* Moon phase icon */}
                  <Show when={day.events.find(e => e.type === 'moon-phase')}>
                    <span class="text-[10px]">
                      {MOON_PHASE_ICONS[day.events.find(e => e.type === 'moon-phase')?.moonPhase || ''] || ''}
                    </span>
                  </Show>

                  {/* VoC indicator */}
                  <Show when={day.isVoidOfCourse}>
                    <span class="text-[8px] text-yellow-500" title="Lua Vazia de Curso">V</span>
                  </Show>

                  {/* Retrograde indicator */}
                  <Show when={day.events.some(e => e.type === 'retrograde-start')}>
                    <span class="text-[9px] text-red-400">℞</span>
                  </Show>
                </div>

                {/* Bottom: theme badges (max 2) */}
                <div class="flex gap-0.5 justify-center">
                  <For each={day.themes.slice(0, 2)}>
                    {(theme) => (
                      <span
                        class="text-[8px]"
                        title={THEME_INFO[theme]?.label}
                      >
                        {THEME_INFO[theme]?.icon || ''}
                      </span>
                    )}
                  </For>
                  <Show when={day.events.length > 3}>
                    <span class="text-[8px] text-muted">+{day.events.length - 3}</span>
                  </Show>
                </div>
              </div>
            </button>
          )}
        </For>
      </div>

      {/* Legend */}
      <div class="mt-3 pt-3 border-t border-base-300/50 flex flex-wrap gap-3 text-[10px] text-muted">
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-400"></span> Favorável</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-gray-500"></span> Neutro</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-400"></span> Tenso</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-gold"></span> Especial</span>
        <span>V = Lua Vazia</span>
        <span>℞ = Retrógrado</span>
      </div>
    </div>
  );
}
