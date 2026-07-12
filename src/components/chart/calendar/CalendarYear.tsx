// ============================================================
// CalendarYear.tsx — Visão anual com 12 mini-calendários
// Cada mês mostra energia dos dias com dots coloridos
// Click no mês → navega para aquele mês na view mensal
//
// PERFORMANCE: calcula progressivamente (1 mês por frame)
// com config simplificada (sem VoC, sem eclipses)
// ============================================================

import { For, Show, createSignal, createEffect, onCleanup } from 'solid-js';
import type { NatalChart } from '../../../engine/types';
import type { CalendarConfig, DayEnergy } from '../../../engine/calendar/types';
import { calculateMonth } from '../../../engine/calendar';
import { calendarDateKeyForInstant, getCalendarTimeContext } from '../../../engine/calendar/calendar-date';

interface Props {
  year: number;
  natal: NatalChart;
  config: CalendarConfig;
  onSelectMonth: (month: number) => void;
  onYearDataReady?: (months: { month: number; days: { energy: DayEnergy; date: number }[] }[]) => void;
}

const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const DAY_HEADERS = ['S','T','Q','Q','S','S','D'];

const ENERGY_COLORS: Record<DayEnergy, string> = {
  favorable: '#22c55e',
  neutral: '#4b5563',
  tense: '#ef4444',
  special: '#eab308',
};

interface MiniMonthData {
  month: number;
  days: { energy: DayEnergy; date: number }[];
  loaded: boolean;
}

export function CalendarYear(props: Props) {
  const [months, setMonths] = createSignal<MiniMonthData[]>(
    Array.from({ length: 12 }, (_, i) => ({ month: i, days: [], loaded: false }))
  );
  const [progress, setProgress] = createSignal(0);
  const todayParts = () => calendarDateKeyForInstant(new Date(), getCalendarTimeContext(props.natal)).split('-').map(Number);

  // Calculate progressively: 1 month per animation frame
  createEffect(() => {
    const targetYear = props.year;
    const targetNatal = props.natal;
    const targetConfig = props.config;
    let cancelled = false;
    let currentMonth = 0;
    setProgress(0);
    setMonths(Array.from({ length: 12 }, (_, i) => ({ month: i, days: [], loaded: false })));

    const calcNext = () => {
      if (cancelled || currentMonth >= 12) return;

      try {
        const data = calculateMonth(targetNatal, targetYear, currentMonth, {
          ...targetConfig,
          moon: { ...targetConfig.moon, showVoidOfCourse: false, showIngresses: false },
          eclipses: { ...targetConfig.eclipses, show: false },
          retrogrades: { ...targetConfig.retrogrades, showStations: false },
          returns: { saturn: false, jupiter: false, mars: false, venus: false, approachOrb: 3 },
          profection: { ...targetConfig.profection, show: false },
        });
        setMonths(prev => {
          const next = [...prev];
          next[currentMonth] = {
            month: currentMonth,
            days: data.days.map(d => ({ energy: d.energy, date: d.dayNumber })),
            loaded: true,
          };
          return next;
        });
      } catch {
        setMonths(prev => {
          const next = [...prev];
          next[currentMonth] = { month: currentMonth, days: [], loaded: true };
          return next;
        });
      }

      currentMonth++;
      setProgress(currentMonth);

      if (currentMonth < 12) {
        requestAnimationFrame(calcNext);
      } else {
        // All months calculated — notify parent
        props.onYearDataReady?.(months().filter(m => m.loaded).map(m => ({ month: m.month, days: m.days })));
      }
    };

    onCleanup(() => { cancelled = true; });
    requestAnimationFrame(calcNext);
  });

  return (
    <div class="glass rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-serif font-bold text-cream">{props.year}</h3>
        <Show when={progress() < 12}>
          <span class="text-xs text-muted flex items-center gap-2">
            <span class="animate-spin text-gold">✦</span>
            Calculando {progress()}/12...
          </span>
        </Show>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <For each={months()}>
          {(monthData) => (
            <MiniMonth
              year={props.year}
              month={monthData.month}
              days={monthData.days}
              loaded={monthData.loaded}
              todayYear={todayParts()[0]}
              todayMonth={todayParts()[1] - 1}
              todayDay={todayParts()[2]}
              onClick={() => props.onSelectMonth(monthData.month)}
            />
          )}
        </For>
      </div>

      {/* Legend */}
      <div class="mt-4 pt-3 border-t border-base-300/50 flex justify-center gap-4 text-[10px] text-muted">
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500"></span> Favorável</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-gray-500"></span> Neutro</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Tenso</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-500"></span> Especial</span>
      </div>
    </div>
  );
}

// ============================================================
// MiniMonth — mini-calendário de um mês
// ============================================================

function MiniMonth(props: {
  year: number;
  month: number;
  days: { energy: DayEnergy; date: number }[];
  loaded: boolean;
  todayYear: number;
  todayMonth: number;
  todayDay: number;
  onClick: () => void;
}) {
  const firstDayOfWeek = new Date(Date.UTC(props.year, props.month, 1, 12)).getUTCDay();
  const offset = (firstDayOfWeek - 1 + 7) % 7;

  const isCurrentMonth = props.todayYear === props.year && props.todayMonth === props.month;

  const energyCounts = () => {
    const counts = { favorable: 0, tense: 0 };
    for (const day of props.days) {
      if (day.energy === 'favorable') counts.favorable++;
      else if (day.energy === 'tense') counts.tense++;
    }
    return counts;
  };

  return (
    <button
      onClick={props.onClick}
      class={`p-3 rounded-xl border transition-all hover:border-gold/40 cursor-pointer ${
        isCurrentMonth ? 'border-gold/50 bg-gold/[0.05]' : 'border-base-300/50 bg-base-200/30'
      }`}
    >
      <div class="flex items-center justify-between mb-2">
        <span class={`text-xs font-semibold ${isCurrentMonth ? 'text-gold' : 'text-cream'}`}>
          {MONTH_NAMES[props.month]}
        </span>
        <Show when={props.loaded}>
          <div class="flex gap-1 text-[8px]">
            <Show when={energyCounts().favorable > 0}>
              <span class="text-green-400">{energyCounts().favorable}●</span>
            </Show>
            <Show when={energyCounts().tense > 0}>
              <span class="text-red-400">{energyCounts().tense}●</span>
            </Show>
          </div>
        </Show>
      </div>

      <Show when={props.loaded} fallback={
        <div class="h-16 flex items-center justify-center">
          <span class="text-[10px] text-muted animate-pulse">...</span>
        </div>
      }>
        {/* Day headers */}
        <div class="grid grid-cols-7 gap-px mb-0.5">
          <For each={DAY_HEADERS}>
            {(d) => <span class="text-[7px] text-muted text-center">{d}</span>}
          </For>
        </div>

        {/* Day dots */}
        <div class="grid grid-cols-7 gap-px">
          <For each={Array(offset).fill(null)}>
            {() => <div class="w-2.5 h-2.5" />}
          </For>
          <For each={props.days}>
            {(day) => {
              const isToday = isCurrentMonth && day.date === props.todayDay;
              return (
                <div
                  class={`w-2.5 h-2.5 rounded-full ${isToday ? 'ring-1 ring-gold' : ''}`}
                  style={`background: ${ENERGY_COLORS[day.energy]}`}
                />
              );
            }}
          </For>
        </div>
      </Show>
    </button>
  );
}
