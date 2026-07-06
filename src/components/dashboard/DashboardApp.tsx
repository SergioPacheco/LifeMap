import { createSignal, onMount, Show, For } from 'solid-js';
import { db, type Profile } from '../../store/db';
import { calculateNatalChart, initSweph, getActiveEngine } from '../../engine/index';
import { generateDailyHoroscope, type DailyHoroscope } from '../../engine/daily-horoscope';
import { renderWheel } from '../../renderer/wheel';
import { localePath, getTranslations, type Locale } from '../../i18n';
import type { NatalChart } from '../../engine/types';

interface Props {
  locale: Locale;
}

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_NAMES_PT = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const SIGN_NAMES_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const TEXTS = {
  pt: {
    greeting: 'Olá',
    dailyTitle: 'Seu dia',
    moonToday: 'Lua hoje',
    quickLinks: 'Atalhos',
    natal: 'Mapa Natal',
    transits: 'Trânsitos',
    synastry: 'Sinastria',
    reports: 'Relatórios',
    horoscope: 'Horóscopo',
    tools: 'Ferramentas',
    switchProfile: 'Trocar perfil',
    addProfile: '+ Novo perfil',
    engine: 'Engine',
    signNames: SIGN_NAMES_PT,
  },
  en: {
    greeting: 'Hello',
    dailyTitle: 'Your day',
    moonToday: 'Moon today',
    quickLinks: 'Quick links',
    natal: 'Natal Chart',
    transits: 'Transits',
    synastry: 'Synastry',
    reports: 'Reports',
    horoscope: 'Horoscope',
    tools: 'Tools',
    switchProfile: 'Switch profile',
    addProfile: '+ New profile',
    engine: 'Engine',
    signNames: SIGN_NAMES_EN,
  },
};

export default function DashboardApp(props: Props) {
  const txt = () => TEXTS[props.locale as keyof typeof TEXTS] || TEXTS.en;

  const [profile, setProfile] = createSignal<Profile | null>(null);
  const [profiles, setProfiles] = createSignal<Profile[]>([]);
  const [chart, setChart] = createSignal<NatalChart | null>(null);
  const [horoscope, setHoroscope] = createSignal<DailyHoroscope | null>(null);
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [showProfileList, setShowProfileList] = createSignal(false);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    await initSweph();

    try {
      const allProfiles = await db.profiles.toArray();
      allProfiles.sort((a, b) => (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0));
      setProfiles(allProfiles);

      if (allProfiles.length > 0) {
        await selectProfile(allProfiles[0]);
      }
    } catch (e) {
      console.warn('[Dashboard] Error loading profiles:', e);
    }

    setLoading(false);
  });

  const selectProfile = async (p: Profile) => {
    setProfile(p);
    setShowProfileList(false);

    const natalChart = calculateNatalChart({
      name: p.name,
      date: p.date,
      time: p.time,
      lat: p.lat,
      lng: p.lng,
      timezone: p.timezone,
      city: p.city,
      country: p.country,
    });

    setChart(natalChart);
    setWheelSvg(renderWheel(natalChart));

    // Generate daily horoscope
    const today = new Date();
    const daily = generateDailyHoroscope(natalChart, today);
    setHoroscope(daily);
  };

  const quickLinks = () => [
    { label: txt().natal, href: localePath('/chart/natal', props.locale as Locale), icon: '☉' },
    { label: txt().transits, href: localePath('/chart/transits', props.locale as Locale), icon: '↻' },
    { label: txt().horoscope, href: localePath('/horoscope/daily', props.locale as Locale), icon: '✦' },
    { label: txt().synastry, href: localePath('/chart/synastry', props.locale as Locale), icon: '♡' },
    { label: txt().reports, href: localePath('/reports', props.locale as Locale), icon: '📄' },
    { label: txt().tools, href: localePath('/tools/ephemeris', props.locale as Locale), icon: '📅' },
  ];

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Show when={loading()}>
        <div class="flex items-center justify-center py-20">
          <div class="text-gold text-3xl animate-spin">✦</div>
        </div>
      </Show>

      <Show when={!loading() && profile()}>
        {/* Header with profile */}
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl sm:text-3xl font-serif font-bold text-cream">
              {txt().greeting}, <span class="text-gold">{profile()!.name}</span>
            </h1>
            <p class="text-sm text-muted mt-1">
              {new Date().toLocaleDateString(props.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Profile switcher */}
          <div class="relative">
            <button
              onClick={() => setShowProfileList(!showProfileList())}
              class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-base-300 bg-base-50 text-cream-dark hover:border-gold/30 transition-colors"
            >
              <svg class="w-4 h-4 text-gold-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {txt().switchProfile}
            </button>

            <Show when={showProfileList()}>
              <div class="absolute right-0 mt-1 w-64 bg-base-100 border border-base-300 rounded-lg shadow-dark z-30 overflow-hidden">
                <For each={profiles()}>
                  {(p) => (
                    <button
                      onClick={() => selectProfile(p)}
                      class={`w-full text-left px-4 py-3 text-sm hover:bg-base-200 transition-colors border-b border-base-300/50 last:border-0 ${
                        p.id === profile()!.id ? 'text-gold bg-gold/5' : 'text-cream-dark'
                      }`}
                    >
                      <div class="font-medium">{p.name}</div>
                      <div class="text-xs text-muted">{p.city}</div>
                    </button>
                  )}
                </For>
                <a
                  href={localePath('/onboarding', props.locale as Locale)}
                  class="block px-4 py-3 text-sm text-gold hover:bg-base-200 transition-colors border-t border-base-300"
                >
                  {txt().addProfile}
                </a>
              </div>
            </Show>
          </div>
        </div>

        {/* Main grid */}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Daily horoscope */}
          <div class="lg:col-span-2 space-y-6">
            {/* Daily summary */}
            <Show when={horoscope()}>
              <div class="glass rounded-2xl p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="text-2xl text-gold">✦</div>
                  <h2 class="text-lg font-serif font-semibold text-cream">{txt().dailyTitle}</h2>
                </div>
                <p class="text-cream-dark leading-relaxed">
                  {horoscope()!.summary}
                </p>

                {/* Categories */}
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                  <div class="p-3 bg-pink-900/10 rounded-lg border border-pink-800/30">
                    <h4 class="text-xs font-semibold text-pink-300 uppercase mb-1">♡ {getTranslations(props.locale).dashboard.love}</h4>
                    <p class="text-xs text-muted leading-relaxed">{horoscope()!.love}</p>
                  </div>
                  <div class="p-3 bg-blue-900/10 rounded-lg border border-blue-800/30">
                    <h4 class="text-xs font-semibold text-blue-300 uppercase mb-1">♄ {getTranslations(props.locale).dashboard.career}</h4>
                    <p class="text-xs text-muted leading-relaxed">{horoscope()!.career}</p>
                  </div>
                  <div class="p-3 bg-green-900/10 rounded-lg border border-green-800/30">
                    <h4 class="text-xs font-semibold text-green-300 uppercase mb-1">♂ {getTranslations(props.locale).dashboard.health}</h4>
                    <p class="text-xs text-muted leading-relaxed">{horoscope()!.health}</p>
                  </div>
                </div>

                {/* Moon info */}
                <div class="flex items-center gap-3 mt-5 pt-4 border-t border-base-300/50">
                  <span class="text-2xl">{SIGN_SYMBOLS[horoscope()!.moonSign]}</span>
                  <div>
                    <p class="text-xs text-muted uppercase tracking-wider">{txt().moonToday}</p>
                    <p class="text-sm font-medium text-cream">
                      {getTranslations(props.locale).dashboard.moonIn} {txt().signNames[horoscope()!.moonSign]}
                    </p>
                  </div>
                </div>
              </div>
            </Show>

            {/* Quick links */}
            <div>
              <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">{txt().quickLinks}</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <For each={quickLinks()}>
                  {(link) => (
                    <a
                      href={link.href}
                      class="group p-4 glass rounded-2xl border-glow hover:border-gold/40 hover:shadow-gold transition-all text-center"
                    >
                      <div class="text-2xl mb-1">{link.icon}</div>
                      <span class="text-sm text-cream-dark group-hover:text-gold transition-colors">{link.label}</span>
                    </a>
                  )}
                </For>
              </div>
            </div>
          </div>

          {/* Right: Mini chart */}
          <div class="space-y-4">
            <div class="glass rounded-2xl p-4">
              <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3 text-center">
                {txt().natal}
              </h3>
              <div class="aspect-square" innerHTML={wheelSvg()} />
              <a
                href={localePath('/chart/natal', props.locale as Locale)}
                class="mt-3 block text-center text-xs text-gold hover:underline"
              >
                {getTranslations(props.locale).dashboard.viewFullChart}
              </a>
            </div>

            {/* Engine badge */}
            <div class="text-xs text-center text-muted">
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-base-200 border border-base-300">
                ✦ {getActiveEngine() === 'swisseph' ? 'Swiss Ephemeris' : 'Astronomy Engine'}
              </span>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
