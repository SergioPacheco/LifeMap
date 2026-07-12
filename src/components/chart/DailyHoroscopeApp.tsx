import { createSignal, onMount, Show, For } from 'solid-js';

import { calculateNatalChart, initSweph } from '../../engine/index';
import { generateDailyHoroscope, type DailyHoroscope, type DailyTransit } from '../../engine/daily-horoscope';
import { getAspectSymbol, getAspectColor } from '../../engine/aspects';
import type { NatalChart } from '../../engine/types';
import type { Profile } from '../../store/db';
import { db } from '../../store/db';

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
};
const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

interface Props {
  mode: 'general' | 'love';
}

export default function DailyHoroscopeApp(props: Props) {
  const [natal, setNatal] = createSignal<NatalChart | null>(null);
  const [horoscope, setHoroscope] = createSignal<DailyHoroscope | null>(null);
  const [date, setDate] = createSignal(new Date().toISOString().split('T')[0]);
  const [profileName, setProfileName] = createSignal('');

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
    generate(chart, date());
  };

  const generate = (chart: NatalChart, dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00Z');
    const result = generateDailyHoroscope(chart, d);
    setHoroscope(result);
  };

  const handleDateChange = (dateStr: string) => {
    setDate(dateStr);
    if (natal()) generate(natal()!, dateStr);
  };

  const filteredTransits = () => {
    if (!horoscope()) return [];
    if (props.mode === 'love') return horoscope()!.transits.filter(t => t.category === 'love');
    return horoscope()!.transits;
  };

  const mainText = () => {
    if (!horoscope()) return '';
    return props.mode === 'love' ? horoscope()!.love : horoscope()!.summary;
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left sidebar */}
      <div class="lg:col-span-1 space-y-4">

        <Show when={natal()}>
          <div class="glass rounded-2xl p-4">
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">Data</h3>
            <input
              type="date" value={date()}
              onInput={(e) => handleDateChange(e.currentTarget.value)}
              class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-200 text-cream text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold/60"
            />
            <div class="flex gap-2 mt-2">
              <button onClick={() => handleDateChange(new Date().toISOString().split('T')[0])} class="px-3 py-1 text-xs bg-gold/10 text-gold border border-gold/20 rounded hover:bg-gold/20 transition-colors">Hoje</button>
              <button onClick={() => {
                const d = new Date(date()); d.setDate(d.getDate() + 1);
                handleDateChange(d.toISOString().split('T')[0]);
              }} class="px-3 py-1 text-xs bg-base-200 text-cream-dark border border-base-400 rounded hover:bg-base-100 transition-colors">Amanhã</button>
            </div>
          </div>

          {/* Moon info */}
          <Show when={horoscope()}>
            <div class="bg-gradient-to-br from-dark-50 to-dark-100 rounded-xl border border-base-300 p-4 text-center">
              <p class="text-xs text-muted uppercase tracking-wider">Lua hoje</p>
              <p class="text-2xl mt-1">{SIGN_SYMBOLS[horoscope()!.moonSign]}</p>
              <p class="text-sm font-medium text-cream">Lua em {SIGN_NAMES[horoscope()!.moonSign]}</p>
            </div>
          </Show>
        </Show>
      </div>

      {/* Main content */}
      <div class="lg:col-span-2 space-y-6">
        <Show when={!natal()}>
          <div class="glass rounded-2xl p-8 text-center text-muted">
            <div class="text-5xl mb-3">{props.mode === 'love' ? '♡' : '✦'}</div>
            <p>Selecione um perfil para ver seu horóscopo personalizado</p>
          </div>
        </Show>

        <Show when={horoscope()}>
          {/* Main summary */}
          <div class="glass rounded-2xl p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="text-3xl text-gold">{props.mode === 'love' ? '♡' : '✦'}</div>
              <div>
                <h2 class="text-lg font-serif font-semibold text-cream">
                  {props.mode === 'love' ? 'Horóscopo do Amor' : 'Horóscopo do Dia'}
                </h2>
                <p class="text-sm text-muted">{profileName()} — {date()}</p>
              </div>
            </div>
            <p class="text-cream-dark leading-relaxed text-black">
              {mainText()}
            </p>

            {/* Sub-sections for general mode */}
            <Show when={props.mode === 'general'}>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div class="p-3 bg-pink-900/10 rounded-lg border border-pink-800/30">
                  <h4 class="text-xs font-semibold text-pink-300 uppercase mb-1">♡ Amor</h4>
                  <p class="text-xs text-muted">{horoscope()!.love}</p>
                </div>
                <div class="p-3 bg-blue-900/10 rounded-lg border border-blue-800/30">
                  <h4 class="text-xs font-semibold text-blue-300 uppercase mb-1">♄ Carreira</h4>
                  <p class="text-xs text-muted">{horoscope()!.career}</p>
                </div>
                <div class="p-3 bg-green-900/10 rounded-lg border border-green-800/30">
                  <h4 class="text-xs font-semibold text-green-300 uppercase mb-1">♂ Saúde</h4>
                  <p class="text-xs text-muted">{horoscope()!.health}</p>
                </div>
              </div>
            </Show>
          </div>

          {/* Active transits */}
          <div class="glass rounded-2xl p-6">
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-4">
              Trânsitos Ativos ({filteredTransits().length})
            </h3>
            <div class="space-y-3">
              <For each={filteredTransits()}>
                {(transit) => (
                  <div class={`p-3 rounded-lg border-l-4 ${
                    transit.intensity === 'high' ? 'border-red-400 bg-red-900/10' :
                    transit.intensity === 'medium' ? 'border-yellow-400 bg-yellow-900/10' :
                    'border-base-400 bg-base-200/50'
                  }`}>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-lg">{PLANET_SYMBOLS[transit.transitPlanet]}</span>
                      <span style={{ color: getAspectColor(transit.aspectType) }} class="font-bold">
                        {getAspectSymbol(transit.aspectType)}
                      </span>
                      <span class="text-lg">{PLANET_SYMBOLS[transit.natalPlanet]}</span>
                      <span class="text-xs text-muted ml-2">orbe {transit.orb}° — Casa {transit.transitHouse}</span>
                      <span class={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ml-auto ${
                        transit.intensity === 'high' ? 'bg-red-900/30 text-red-300' :
                        transit.intensity === 'medium' ? 'bg-yellow-900/30 text-yellow-300' :
                        'bg-base-300 text-muted'
                      }`}>
                        {transit.intensity === 'high' ? 'forte' : transit.intensity === 'medium' ? 'médio' : 'leve'}
                      </span>
                    </div>
                    <p class="text-sm text-cream-dark">{transit.interpretation}</p>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
