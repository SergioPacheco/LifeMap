// ============================================================
// CalendarYear.tsx — Visão anual com 12 mini-calendários
// Cada mês mostra energia dos dias com dots coloridos
// Click no mês → navega para aquele mês na view mensal
// ============================================================

import { For, Show, createMemo } from 'solid-js';
import type { NatalChart } from '../../../engine/types';
import type { CalendarConfig, DayEnergy } from '../../../engine/calendar/types';
import { calculateMonth } from '../../../engine/calendar';

interface Props {
  year: number;
  natal: NatalChart;
  config: CalendarConfig;
  onSelectMonth: (month: number) => void;
}

const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const DAY_HEADERS = ['S','T','Q','Q','S','S','D']; // Seg-Dom

const ENERGY_COLORS: Record<DayEnergy, string> = {
  favorable: '#22c55e',
  neutral: '#4b5563',
  tense: '#ef4444',
  special: '#eab308',
};

export function CalendarYear(props: Props) {
  // Calculate all 12 months (with caching built into month-calculator)
  const yearData = createMemo(() => {
    const months: { month: number; days: { energy: DayEnergy; date: number }[] }[] = [];

    for (let m = 0; m < 12; m++) {
      try {
        const data = calculateMonth(props.natal, props.year, m, props.config);
        months.push({
          month: m,
          days: data.days.map(d => ({ energy: d.energy, date: d.date.getDate() })),
        });
      } catch {
        months.push({ month: m, days: [] });
      }
    }

    return months;
  });

  return (
    <div class="glass rounded-2xl p-5">
      <h3 class="font-serif font-bold text-cream text-center mb-4">{props.year}</h3>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <For each={yearData()}>
          {(monthData) => (
            <MiniMonth
              year={props.year}
              month={monthData.month}
              days={monthData.days}
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
// MiniMonth — mini-calendário de um mês (compact)
// ============================================================

function MiniMonth(props: {
  year: number;
  month: number;
  days: { energy: DayEnergy; date: number }[];
  onClick: () => void;
}) {
  const firstDayOfWeek = new Date(props.year, props.month, 1).getDay();
  // Adjust for Monday start: (getDay() - 1 + 7) % 7
  const offset = (firstDayOfWeek - 1 + 7) % 7;

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === props.year && today.getMonth() === props.month;

  // Count energies for summary
  const energyCounts = () => {
    const counts = { favorable: 0, tense: 0, special: 0 };
    for (const day of props.days) {
      if (day.energy === 'favorable') counts.favorable++;
      else if (day.energy === 'tense') counts.tense++;
      else if (day.energy === 'special') counts.special++;
    }
    return counts;
  };

  return (
    <button
      onClick={props.onClick}
      class={`p-3 rounded-xl border transition-all hover:border-gold/40 hover:shadow-sm cursor-pointer ${
        isCurrentMonth ? 'border-gold/50 bg-gold/[0.05]' : 'border-base-300/50 bg-base-200/30'
      }`}
    >
      {/* Month name */}
      <div class="flex items-center justify-between mb-2">
        <span class={`text-xs font-semibold ${isCurrentMonth ? 'text-gold' : 'text-cream'}`}>
          {MONTH_NAMES[props.month]}
        </span>
        <div class="flex gap-1">
          <Show when={energyCounts().favorable > 0}>
            <span class="text-[8px] text-green-400">{energyCounts().favorable}🟢</span>
          </Show>
          <Show when={energyCounts().tense > 0}>
            <span class="text-[8px] text-red-400">{energyCounts().tense}🔴</span>
          </Show>
        </div>
      </div>

      {/* Day headers */}
      <div class="grid grid-cols-7 gap-px mb-0.5">
        <For each={DAY_HEADERS}>
          {(d) => <span class="text-[7px] text-muted text-center">{d}</span>}
        </For>
      </div>

      {/* Day dots */}
      <div class="grid grid-cols-7 gap-px">
        {/* Offset */}
        <For each={Array(offset).fill(null)}>
          {() => <div class="w-2.5 h-2.5" />}
        </For>

        {/* Days */}
        <For each={props.days}>
          {(day) => {
            const isToday = isCurrentMonth && day.date === today.getDate();
            return (
              <div
                class={`w-2.5 h-2.5 rounded-full ${isToday ? 'ring-1 ring-gold' : ''}`}
                style={`background: ${ENERGY_COLORS[day.energy]}`}
                title={`${day.date} — ${day.energy}`}
              />
            );
          }}
        </For>
      </div>
    </button>
  );
}
