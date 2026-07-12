// ============================================================
// AstroCalendarApp.tsx — Calendário Astrológico Personalizado
// Container principal: perfil, navegação, filtros, grid/detalhe
// ============================================================

import { createSignal, createMemo, onMount, Show, For } from 'solid-js';
import { CalendarGrid } from './calendar/CalendarGrid';
import { CalendarList } from './calendar/CalendarList';
import { CalendarYear } from './calendar/CalendarYear';
import { YearInsights } from './calendar/YearInsights';
import { DayDetail } from './calendar/DayDetail';
import { FilterBar } from './calendar/FilterBar';
import { CalendarSettings } from './calendar/CalendarSettings';
import { MonthInsights } from './calendar/MonthInsights';
import { calculateMonth, classifyDayEnergy } from '../../engine/calendar';
import { calculateNatalChart, initSweph } from '../../engine/index';
import { DEFAULT_CALENDAR_CONFIG } from '../../engine/calendar/types';
import type { CalendarConfig, MonthData, DayData, Theme, CalendarEvent } from '../../engine/calendar/types';
import type { NatalChart, BirthData } from '../../engine/types';
import type { Profile } from '../../store/db';
import { db } from '../../store/db';
import { birthDataFromProfile } from '../../utils/profile';
import { todayDateInput } from '../../utils/dateTime';
import { calendarDateKeyForInstant, getCalendarTimeContext } from '../../engine/calendar/calendar-date';

interface Props {
  locale: string;
}

export default function AstroCalendarApp(props: Props) {
  const [natal, setNatal] = createSignal<NatalChart | null>(null);
  const [profileName, setProfileName] = createSignal('');
  const [year, setYear] = createSignal(new Date().getFullYear());
  const [month, setMonth] = createSignal(new Date().getMonth());
  const [monthData, setMonthData] = createSignal<MonthData | null>(null);
  const [selectedDay, setSelectedDay] = createSignal<DayData | null>(null);
  const [view, setView] = createSignal<'month' | 'year' | 'list'>('month');
  const [loading, setLoading] = createSignal(false);
  const [config, setConfig] = createSignal<CalendarConfig>(DEFAULT_CALENDAR_CONFIG);
  const [showSettings, setShowSettings] = createSignal(false);
  const [todayKey, setTodayKey] = createSignal(todayDateInput());

  // Performance: cache calculated months
  const monthCache = new Map<string, MonthData>();
  const [yearMonths, setYearMonths] = createSignal<{ month: number; days: { energy: any; date: number }[] }[]>([]);

  // Filters
  const [activeTypes, setActiveTypes] = createSignal<Set<string>>(new Set([
    'transit-aspect', 'moon-phase', 'moon-ingress', 'planet-ingress', 'retrograde-start', 'retrograde-end', 'void-of-course',
    'eclipse-solar', 'eclipse-lunar', 'planetary-return'
  ]));
  const [activeThemes, setActiveThemes] = createSignal<Set<Theme>>(new Set([
    'love', 'career', 'finances', 'health', 'spirituality', 'family', 'creativity', 'communication',
    'transformation', 'freedom', 'travel', 'sexuality'
  ]));
  const [energyFilter, setEnergyFilter] = createSignal<Set<string>>(new Set(['favorable', 'neutral', 'tense', 'special']));

  onMount(async () => {
    await initSweph();
    // Auto-load last profile
    try {
      const profiles = await db.profiles.orderBy('id').reverse().limit(1).toArray();
      if (profiles.length > 0) {
        loadProfile(profiles[0]);
      }
    } catch (e) {
      console.warn('Could not auto-load profile:', e);
    }

    // Listen for profile changes from Header
    window.addEventListener('lifemap:profile-change', (e: any) => {
      if (e.detail) loadProfile(e.detail);
    });
  });

  const loadProfile = (profile: Profile) => {
    setProfileName(profile.name);
    const data: BirthData = birthDataFromProfile(profile);

    const chart = calculateNatalChart(data);
    monthCache.clear();
    setYearMonths([]);
    setNatal(chart);
    // Calculate current month and auto-select today
    goToday();
  };

  const recalculate = (chart?: NatalChart) => {
    const n = chart || natal();
    if (!n) return;
    // Clear cache when config changes or profile changes
    monthCache.clear();
    recalculateWithValues(year(), month());
  };

  const goToday = () => {
    const n = natal();
    const today = n ? calendarDateKeyForInstant(new Date(), getCalendarTimeContext(n)) : todayDateInput();
    setTodayKey(today);
    const [newYear, monthNumber] = today.split('-').map(Number);
    const newMonth = monthNumber - 1;
    setYear(newYear);
    setMonth(newMonth);

    if (!n) return;

    const cacheKey = `${newYear}-${newMonth}-${profileName()}`;

    const selectToday = (data: MonthData) => {
      const todayData = data.days.find(d => d.dateKey === today);
      setSelectedDay(todayData || null);
      // Scroll to selected day if grid is rendered
      setTimeout(() => {
        const el = document.querySelector('[data-today="true"]');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    };

    if (monthCache.has(cacheKey)) {
      const data = monthCache.get(cacheKey)!;
      setMonthData(data);
      selectToday(data);
    } else {
      setLoading(true);
      setTimeout(() => {
        try {
          const data = calculateMonth(n, newYear, newMonth, config());
          monthCache.set(cacheKey, data);
          setMonthData(data);
          selectToday(data);
        } catch (e) {
          console.error('Calendar calculation error:', e);
        } finally {
          setLoading(false);
        }
      }, 10);
    }
  };

  const prevMonth = () => {
    let newMonth = month() - 1;
    let newYear = year();
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setMonth(newMonth);
    setYear(newYear);
    recalculateWithValues(newYear, newMonth);
  };

  const nextMonth = () => {
    let newMonth = month() + 1;
    let newYear = year();
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setMonth(newMonth);
    setYear(newYear);
    recalculateWithValues(newYear, newMonth);
  };

  const recalculateWithValues = (y: number, m: number) => {
    const n = natal();
    if (!n) return;

    const cacheKey = `${y}-${m}-${profileName()}`;
    if (monthCache.has(cacheKey)) {
      setMonthData(monthCache.get(cacheKey)!);
      setSelectedDay(null);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const data = calculateMonth(n, y, m, config());
        monthCache.set(cacheKey, data);
        setMonthData(data);
        setSelectedDay(null);
      } catch (e) {
        console.error('Calendar calculation error:', e);
      } finally {
        setLoading(false);
      }
    }, 10);
  };

  const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  // Filter days based on active filters
  const filteredDays = createMemo(() => {
    const data = monthData();
    if (!data) return [];

    const themes = activeThemes();
    const types = activeTypes();
    const hasAnyTheme = themes.size > 0;

    return data.days.map(day => ({
      ...day,
      events: day.events.filter(event => {
        // Filter by event type
        if (!types.has(event.type)) return false;

        // Filter by theme:
        // - If no themes selected → hide everything
        // - If event has themes → at least one must match
        // - If event has NO themes (moon phase, ingress) → show only if themes filter is not restrictive
        if (!hasAnyTheme) return false;
        if (event.themes.length > 0 && !event.themes.some(t => themes.has(t))) return false;

        return true;
      }),
    })).map(day => {
      const classification = classifyDayEnergy(day.events, config());
      const voidEvents = day.events.filter(event => event.type === 'void-of-course' && event.startTime && event.endTime);
      return {
        ...day,
        energy: classification.energy,
        energyScore: classification.score,
        tip: classification.tip,
        themes: aggregateThemes(day.events),
        isVoidOfCourse: voidEvents.length > 0,
        voidPeriods: voidEvents.map(event => ({ start: event.startTime!, end: event.endTime! })),
      };
    }).filter(day => energyFilter().has(day.energy));
  });

  const selectedVisibleDay = createMemo(() => {
    const selected = selectedDay();
    if (!selected) return null;
    return filteredDays().find(day => day.dateKey === selected.dateKey) || null;
  });

  return (
    <div class="max-w-7xl mx-auto space-y-6">
      {/* Header: Profile + Navigation */}
      <div class="glass rounded-2xl p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Month navigation */}
          <div class="flex items-center gap-3">
            <button onClick={prevMonth} class="p-2 rounded-lg hover:bg-base-200 text-muted hover:text-cream transition-colors" title="Mês anterior">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>

            <div class="text-center min-w-[160px]">
              <h2 class="text-lg font-serif font-bold text-cream">{MONTH_NAMES[month()]} {year()}</h2>
              <Show when={profileName()}>
                <p class="text-xs text-muted">Perfil: {profileName()}</p>
              </Show>
            </div>

            <button onClick={nextMonth} class="p-2 rounded-lg hover:bg-base-200 text-muted hover:text-cream transition-colors" title="Próximo mês">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* View toggle + Today + Settings */}
          <div class="flex items-center gap-2">
            <button onClick={goToday} class="px-3 py-1.5 text-xs rounded-lg border border-base-400 text-muted hover:text-cream hover:border-gold/40 transition-colors">
              Hoje
            </button>
            <button onClick={() => setShowSettings(true)} class="p-1.5 rounded-lg border border-base-400 text-muted hover:text-cream hover:border-gold/40 transition-colors" title="Configurações">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
            <div class="flex rounded-lg border border-base-400 overflow-hidden">
              <button
                onClick={() => setView('month')}
                class={`px-3 py-1.5 text-xs transition-colors ${view() === 'month' ? 'bg-gold/20 text-gold' : 'text-muted hover:text-cream'}`}
              >
                Mês
              </button>
              <button
                onClick={() => setView('year')}
                class={`px-3 py-1.5 text-xs transition-colors ${view() === 'year' ? 'bg-gold/20 text-gold' : 'text-muted hover:text-cream'}`}
              >
                Ano
              </button>
              <button
                onClick={() => setView('list')}
                class={`px-3 py-1.5 text-xs transition-colors ${view() === 'list' ? 'bg-gold/20 text-gold' : 'text-muted hover:text-cream'}`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        activeTypes={activeTypes()}
        activeThemes={activeThemes()}
        energyFilter={energyFilter()}
        onToggleType={(type) => {
          const next = new Set(activeTypes());
          next.has(type) ? next.delete(type) : next.add(type);
          setActiveTypes(next);
        }}
        onToggleTheme={(theme) => {
          const next = new Set(activeThemes());
          next.has(theme) ? next.delete(theme) : next.add(theme);
          setActiveThemes(next);
        }}
        onToggleEnergy={(energy) => {
          const next = new Set(energyFilter());
          next.has(energy) ? next.delete(energy) : next.add(energy);
          setEnergyFilter(next);
        }}
      />

      {/* Loading */}
      <Show when={loading()}>
        <div class="text-center py-8">
          <div class="animate-spin text-3xl text-gold">✦</div>
          <p class="text-sm text-muted mt-2">Calculando eventos do mês...</p>
        </div>
      </Show>

      {/* No profile selected */}
      <Show when={!natal() && !loading()}>
        <div class="glass rounded-2xl p-12 text-center">
          <div class="text-5xl mb-4">📅</div>
          <h3 class="text-lg font-medium text-cream mb-2">Selecione um perfil</h3>
          <p class="text-sm text-muted">Escolha um perfil salvo para gerar seu calendário astrológico personalizado.</p>
        </div>
      </Show>

      {/* Month summary */}
      <Show when={monthData() && !loading()}>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="glass rounded-xl p-3 text-center">
            <div class="text-lg font-bold text-green-400">{monthData()!.summary.bestDays.length}</div>
            <div class="text-xs text-muted">Dias favoráveis</div>
          </div>
          <div class="glass rounded-xl p-3 text-center">
            <div class="text-lg font-bold text-red-400">{monthData()!.summary.challengingDays.length}</div>
            <div class="text-xs text-muted">Dias tensos</div>
          </div>
          <div class="glass rounded-xl p-3 text-center">
            <div class="text-lg font-bold text-gold">{monthData()!.summary.specialDays.length}</div>
            <div class="text-xs text-muted">Dias especiais</div>
          </div>
          <div class="glass rounded-xl p-3 text-center">
            <div class="text-lg font-bold text-purple-400">{monthData()!.retroPeriods.length}</div>
            <div class="text-xs text-muted">Retrógrados</div>
          </div>
        </div>
      </Show>

      {/* Year view (full width) */}
      <Show when={view() === 'year' && natal() && !loading()}>
        <CalendarYear
          year={year()}
          natal={natal()!}
          config={config()}
          onSelectMonth={(m) => { setMonth(m); setView('month'); recalculateWithValues(year(), m); }}
          onYearDataReady={(data) => setYearMonths(data)}
        />

        {/* Year Insights (below year calendar) */}
        <Show when={yearMonths().length === 12}>
          <YearInsights
            year={year()}
            months={yearMonths()}
            natal={natal()!}
            config={config()}
          />
        </Show>
      </Show>

      {/* Calendar grid or list (month/list views) */}
      <Show when={view() !== 'year' && monthData() && !loading()}>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main view: 2/3 */}
          <div class="lg:col-span-2 space-y-6">
            <Show when={view() === 'month'}>
              <CalendarGrid
                days={filteredDays()}
                year={year()}
                month={month()}
                selectedDay={selectedVisibleDay()}
                onSelectDay={(day) => setSelectedDay(day)}
                firstDayOfWeek={config().ui.firstDayOfWeek}
                todayDateKey={todayKey()}
              />
            </Show>
            <Show when={view() === 'list'}>
              <CalendarList
                days={filteredDays()}
                onSelectDay={(day) => setSelectedDay(day)}
              />
            </Show>

            {/* Month Insights — inside the 2/3 column, below the grid */}
            <MonthInsights monthData={monthData()!} profection={monthData()?.profection} />
          </div>

          {/* Day detail: 1/3 */}
          <div class="lg:col-span-1">
            <Show when={selectedVisibleDay()} fallback={
              <div class="glass rounded-2xl p-6 text-center">
                <div class="text-3xl mb-3">👆</div>
                <p class="text-sm text-muted">Clique em um dia para ver os detalhes</p>
              </div>
            }>
              <DayDetail
                day={selectedVisibleDay()!}
                profection={monthData()?.profection}
                timeZoneId={monthData()?.timeZoneId}
                timezone={monthData()?.timezone ?? 0}
              />
            </Show>
          </div>
        </div>
      </Show>
      {/* Settings Modal */}
      <Show when={showSettings()}>
        <CalendarSettings
          config={config()}
          onSave={(newConfig) => { setConfig(newConfig); recalculate(); }}
          onClose={() => setShowSettings(false)}
        />
      </Show>
    </div>
  );
}

function aggregateThemes(events: CalendarEvent[]): Theme[] {
  const themeCount: Record<string, number> = {};
  for (const event of events) {
    for (const theme of event.themes) {
      themeCount[theme] = (themeCount[theme] || 0) + event.importance;
    }
  }
  return Object.entries(themeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([theme]) => theme as Theme);
}
