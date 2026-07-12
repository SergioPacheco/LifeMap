// ============================================================
// CalendarList.tsx — Vista lista cronológica do mês
// ============================================================

import { For, Show } from 'solid-js';
import type { DayData, DayEnergy } from '../../../engine/calendar/types';
import { THEME_INFO } from '../../../engine/calendar/theme-mapper';

interface Props {
  days: DayData[];
  onSelectDay: (day: DayData) => void;
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const ENERGY_STYLES: Record<DayEnergy, { dot: string; bg: string }> = {
  favorable: { dot: 'bg-green-400', bg: 'border-green-500/20' },
  neutral: { dot: 'bg-gray-500', bg: 'border-base-400/50' },
  tense: { dot: 'bg-red-400', bg: 'border-red-500/20' },
  special: { dot: 'bg-gold', bg: 'border-gold/30' },
};

export function CalendarList(props: Props) {
  // Only show days with events
  const daysWithEvents = () => props.days.filter(d => d.events.length > 0);

  return (
    <div class="glass rounded-2xl p-4 space-y-2 max-h-[600px] overflow-y-auto">
      <Show when={daysWithEvents().length === 0}>
        <div class="text-center py-8 text-muted text-sm">
          Nenhum evento visível com os filtros atuais.
        </div>
      </Show>

      <For each={daysWithEvents()}>
        {(day) => (
          <button
            onClick={() => props.onSelectDay(day)}
            class={`w-full text-left p-3 rounded-lg border transition-all hover:border-gold/40 ${ENERGY_STYLES[day.energy].bg}`}
          >
            {/* Day header */}
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class={`w-2 h-2 rounded-full ${ENERGY_STYLES[day.energy].dot}`} />
                <span class="text-sm font-medium text-cream">
                  {day.date.getDate()} — {DAY_NAMES[day.dayOfWeek]}
                </span>
              </div>
              <div class="flex gap-1">
                <For each={day.themes.slice(0, 3)}>
                  {(theme) => (
                    <span class="text-[10px]">{THEME_INFO[theme]?.icon}</span>
                  )}
                </For>
              </div>
            </div>

            {/* Events summary */}
            <div class="space-y-1">
              <For each={day.events.slice(0, 4)}>
                {(event) => (
                  <div class="flex items-center gap-2">
                    <span class={`w-1 h-1 rounded-full ${event.energy === 'positive' ? 'bg-green-400' : event.energy === 'negative' ? 'bg-red-400' : 'bg-gray-500'}`} />
                    <span class="text-xs text-muted truncate">{event.title}</span>
                  </div>
                )}
              </For>
              <Show when={day.events.length > 4}>
                <span class="text-[10px] text-muted">+{day.events.length - 4} mais</span>
              </Show>
            </div>

            {/* Tip */}
            <Show when={day.tip}>
              <p class="text-[10px] text-gold mt-1.5 italic">💡 {day.tip}</p>
            </Show>
          </button>
        )}
      </For>
    </div>
  );
}
