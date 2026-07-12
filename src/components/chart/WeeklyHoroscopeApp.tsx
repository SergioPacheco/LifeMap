import { createSignal, onMount, Show, For } from 'solid-js';

import { calculateNatalChart, initSweph } from '../../engine/index';
import { generateDailyHoroscope, type DailyHoroscope } from '../../engine/daily-horoscope';
import type { NatalChart } from '../../engine/types';
import type { Profile } from '../../store/db';
import { db } from '../../store/db';

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const DAYS_PT = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

interface DayData {
  date: string;
  dayName: string;
  horoscope: DailyHoroscope;
}

export default function WeeklyHoroscopeApp() {
  const [natal, setNatal] = createSignal<NatalChart | null>(null);
  const [days, setDays] = createSignal<DayData[]>([]);
  const [profileName, setProfileName] = createSignal('');
  const [weekStart, setWeekStart] = createSignal('');

  onMount(async () => {
    await initSweph();
    try { const p = await db.profiles.orderBy('id').reverse().limit(1).toArray(); if (p.length > 0) handleProfileSelect(p[0]); } catch {}
    window.addEventListener('lifemap:profile-change', (e: any) => { if (e.detail) handleProfileSelect(e.detail); });
  });

  const handleProfileSelect = (profile: Profile) => {
    const chart = calculateNatalChart({
      name: profile.name, date: profile.date, time: profile.time,
      lat: profile.lat, lng: profile.lng, timezone: profile.timezone,
      city: profile.city, country: profile.country,
    });
    setNatal(chart);
    setProfileName(profile.name);
    generateWeek(chart, new Date());
  };

  const generateWeek = (chart: NatalChart, startDate: Date) => {
    // Find Monday of this week
    const day = startDate.getDay();
    const monday = new Date(startDate);
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    setWeekStart(monday.toISOString().split('T')[0]);

    const results: DayData[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const horoscope = generateDailyHoroscope(chart, d);
      results.push({
        date: dateStr,
        dayName: DAYS_PT[d.getDay()],
        horoscope,
      });
    }
    setDays(results);
  };

  const navigateWeek = (direction: number) => {
    if (!natal()) return;
    const current = new Date(weekStart());
    current.setDate(current.getDate() + (direction * 7));
    generateWeek(natal()!, current);
  };

  return (
    <div class="space-y-6">
      {/* Profile + Navigation */}
      <div class="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div class="flex-1 min-w-0">
          <Show when={natal()}>
            <span class="text-sm text-cream font-medium">{(natal() as any)?.meta?.name || 'Perfil'}</span>
          </Show>
        </div>
        <Show when={natal()}>
          <div class="flex items-center gap-2">
            <button onClick={() => navigateWeek(-1)} class="px-3 py-1 text-sm bg-base-200 rounded">← Semana</button>
            <button onClick={() => generateWeek(natal()!, new Date())} class="px-3 py-1 text-sm bg-gold/10 text-gold rounded">Esta semana</button>
            <button onClick={() => navigateWeek(1)} class="px-3 py-1 text-sm bg-base-200 rounded">Semana →</button>
          </div>
        </Show>
      </div>

      {/* Weekly grid */}
      <Show when={days().length > 0} fallback={
        <div class="glass rounded-2xl p-8 text-center text-muted">
          <div class="text-5xl mb-3">📅</div>
          <p>Selecione um perfil para ver o horóscopo semanal</p>
        </div>
      }>
        <div class="space-y-3">
          <For each={days()}>
            {(day) => {
              const isToday = day.date === new Date().toISOString().split('T')[0];
              const highCount = day.horoscope.transits.filter(t => t.intensity === 'high').length;

              return (
                <div class={`bg-base-50 rounded-xl border ${isToday ? 'border-brand-400 ring-2 ring-gold/30' : 'border-base-300'} p-4 shadow-sm`}>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3">
                      <span class={`text-sm font-bold ${isToday ? 'text-brand-600' : 'text-cream'}`}>
                        {day.dayName}
                      </span>
                      <span class="text-xs text-muted">{day.date}</span>
                      {isToday && <span class="text-[10px] px-2 py-0.5 bg-brand-600 text-white rounded-full">HOJE</span>}
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm">{SIGN_SYMBOLS[day.horoscope.moonSign]}</span>
                      <span class="text-xs text-muted">Lua em {SIGN_NAMES[day.horoscope.moonSign]}</span>
                      {highCount > 0 && <span class="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded">{highCount} forte{highCount > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  <p class="text-sm text-cream-dark">
                    {day.horoscope.summary}
                  </p>
                  <div class="flex gap-4 mt-2 text-xs text-muted">
                    <span>♡ {day.horoscope.love.substring(0, 60)}...</span>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </Show>
    </div>
  );
}
