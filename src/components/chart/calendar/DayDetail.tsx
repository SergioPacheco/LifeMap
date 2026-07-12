// ============================================================
// DayDetail.tsx — Painel expandido com interpretação do dia
// ============================================================

import { For, Show } from 'solid-js';
import type { DayData, CalendarEvent, ProfectionData, DayEnergy } from '../../../engine/calendar/types';
import { THEME_INFO } from '../../../engine/calendar/theme-mapper';
import { formatCalendarTime } from '../../../engine/calendar/calendar-date';

interface Props {
  day: DayData;
  profection?: ProfectionData | null;
  timeZoneId?: string;
  timezone: number;
}

const ENERGY_LABELS: Record<DayEnergy, { label: string; color: string; icon: string }> = {
  favorable: { label: 'Favorável', color: 'text-green-400', icon: '🟢' },
  neutral: { label: 'Neutro', color: 'text-gray-400', icon: '🟡' },
  tense: { label: 'Tenso', color: 'text-red-400', icon: '🔴' },
  special: { label: 'Especial', color: 'text-gold', icon: '⭐' },
};

const EVENT_TYPE_ICONS: Record<string, string> = {
  'transit-aspect': '🪐',
  'moon-phase': '☽',
  'moon-ingress': '☽',
  'planet-ingress': '➡️',
  'void-of-course': '⏸️',
  'retrograde-start': '℞',
  'retrograde-end': 'D',
  'station': '⏹️',
  'eclipse-solar': '🌑',
  'eclipse-lunar': '🌕',
  'planetary-return': '↺',
  'profection': '📅',
};

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function DayDetail(props: Props) {
  const energyInfo = () => ENERGY_LABELS[props.day.energy];

  const formatDate = () => {
    const [, month, day] = props.day.dateKey.split('-').map(Number);
    return `${DAY_NAMES[props.day.dayOfWeek]}, ${day} de ${MONTH_NAMES[month - 1]}`;
  };

  // Group events by type for better display
  const transitEvents = () => props.day.events.filter(e => e.type === 'transit-aspect');
  const moonEvents = () => props.day.events.filter(e => e.type === 'moon-phase' || e.type === 'moon-ingress');
  const otherEvents = () => props.day.events.filter(e =>
    !['transit-aspect', 'moon-phase', 'moon-ingress'].includes(e.type));

  return (
    <div class="glass rounded-2xl p-5 space-y-4 sticky top-20">
      {/* Header */}
      <div class="border-b border-base-300/50 pb-3">
        <h3 class="font-serif font-bold text-cream">{formatDate()}</h3>
        <div class="flex items-center gap-2 mt-1">
          <span>{energyInfo().icon}</span>
          <span class={`text-sm font-medium ${energyInfo().color}`}>{energyInfo().label}</span>
          <span class="text-xs text-muted">(score: {props.day.energyScore.toFixed(1)})</span>
        </div>
        <Show when={props.day.tip}>
          <p class="text-xs text-cream-dark mt-2 italic">💡 {props.day.tip}</p>
        </Show>
      </div>

      {/* Themes active today */}
      <Show when={props.day.themes.length > 0}>
        <div class="flex flex-wrap gap-2">
          <For each={props.day.themes}>
            {(theme) => (
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
                style={`color: ${THEME_INFO[theme]?.color}; border-color: ${THEME_INFO[theme]?.color}40; background: ${THEME_INFO[theme]?.color}10;`}
              >
                {THEME_INFO[theme]?.icon} {THEME_INFO[theme]?.label}
              </span>
            )}
          </For>
        </div>
      </Show>

      {/* Moon events */}
      <Show when={moonEvents().length > 0}>
        <div class="space-y-2">
          <h4 class="text-xs font-semibold text-muted uppercase tracking-wider">☽ Lua</h4>
          <For each={moonEvents()}>
            {(event) => <EventCard event={event} />}
          </For>
        </div>
      </Show>

      {/* Transit aspects */}
      <Show when={transitEvents().length > 0}>
        <div class="space-y-2">
          <h4 class="text-xs font-semibold text-muted uppercase tracking-wider">🪐 Trânsitos Pessoais</h4>
          <For each={transitEvents()}>
            {(event) => <EventCard event={event} />}
          </For>
        </div>
      </Show>

      {/* Other events */}
      <Show when={otherEvents().length > 0}>
        <div class="space-y-2">
          <h4 class="text-xs font-semibold text-muted uppercase tracking-wider">📌 Outros Eventos</h4>
          <For each={otherEvents()}>
            {(event) => <EventCard event={event} />}
          </For>
        </div>
      </Show>

      {/* Void of Course periods */}
      <Show when={props.day.voidPeriods.length > 0}>
        <div class="p-3 rounded-lg bg-yellow-900/10 border border-yellow-700/20">
          <h4 class="text-xs font-semibold text-yellow-500 mb-1">⏸️ Lua Vazia de Curso</h4>
          <For each={props.day.voidPeriods}>
            {(vp) => (
              <p class="text-xs text-muted">
                {formatCalendarTime(vp.start, { timeZoneId: props.timeZoneId, timezone: props.timezone })}
                {' → '}
                {formatCalendarTime(vp.end, { timeZoneId: props.timeZoneId, timezone: props.timezone })}
              </p>
            )}
          </For>
          <p class="text-[10px] text-muted mt-1">Evite iniciar atividades importantes.</p>
        </div>
      </Show>

      {/* Profection info */}
      <Show when={props.profection}>
        <div class="p-3 rounded-lg bg-purple-900/10 border border-purple-700/20">
          <h4 class="text-xs font-semibold text-purple-400 mb-1">📅 Profecção Anual</h4>
          <p class="text-xs text-cream-dark">Casa {props.profection!.house} — Senhor: {props.profection!.lord}</p>
        </div>
      </Show>

      {/* Empty day */}
      <Show when={props.day.events.length === 0}>
        <div class="text-center py-4">
          <p class="text-sm text-muted">Sem eventos significativos neste dia.</p>
          <p class="text-xs text-muted mt-1">Dia tranquilo — siga sua rotina.</p>
        </div>
      </Show>
    </div>
  );
}

// ============================================================
// EventCard — Card individual de um evento
// ============================================================

function EventCard(props: { event: CalendarEvent }) {
  const e = props.event;

  const energyBorder = () => {
    if (e.energy === 'positive') return 'border-l-green-500';
    if (e.energy === 'negative') return 'border-l-red-500';
    return 'border-l-gray-500';
  };

  const applyingIcon = () => {
    if (e.isApplying === true) return '↗'; // Getting stronger
    if (e.isApplying === false) return '↘'; // Dissipating
    return '';
  };

  return (
    <div class={`p-2.5 rounded-lg bg-base-200/50 border-l-2 ${energyBorder()}`}>
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1">
          <p class="text-xs font-medium text-cream">
            {e.title}
            <Show when={e.natalHouse}>
              <span class="text-muted ml-1">(Casa {e.natalHouse})</span>
            </Show>
          </p>
          <Show when={e.summary}>
            <p class="text-[11px] text-muted mt-0.5 leading-relaxed">{e.summary}</p>
          </Show>
          <Show when={e.advice}>
            <p class="text-[10px] text-gold mt-1 italic">💡 {e.advice}</p>
          </Show>
        </div>
        <div class="flex flex-col items-end gap-0.5">
          <Show when={e.orb !== undefined}>
            <span class="text-[9px] text-muted whitespace-nowrap">
              {applyingIcon()} {e.orb!.toFixed(1)}°
            </span>
          </Show>
          <Show when={e.isApplying !== undefined}>
            <span class={`text-[8px] ${e.isApplying ? 'text-green-400' : 'text-gray-500'}`}>
              {e.isApplying ? 'aplicando' : 'separando'}
            </span>
          </Show>
        </div>
      </div>

      {/* Theme badges */}
      <Show when={e.themes.length > 0}>
        <div class="flex gap-1 mt-1.5">
          <For each={e.themes.slice(0, 3)}>
            {(theme) => (
              <span class="text-[9px]" title={THEME_INFO[theme]?.label}>{THEME_INFO[theme]?.icon}</span>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
