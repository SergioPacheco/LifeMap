import { createSignal, onMount, For, Show } from 'solid-js';
import { getTranslations, languages, localePath, setPreferredLocale, switchLocalePath, type Locale } from '../../i18n';
import { db, type Profile } from '../../store/db';
import BrandLogo from './BrandLogo';

interface Props {
  locale: Locale;
}

const MENU_LABELS = {
  lunarReturn: {
    pt: 'Revolução Lunar',
    en: 'Lunar Return',
    es: 'Retorno lunar',
    fr: 'Retour lunaire',
    de: 'Mondrückkehr',
    it: 'Ritorno lunare',
    nl: 'Maansreturn',
    tr: 'Ay dönüşü',
    ru: 'Лунное возвращение',
    zh: '月返盘',
    ja: '月回帰',
  },
  relocated: {
    pt: 'Mapa Relocado',
    en: 'Relocated Chart',
    es: 'Carta relocalizada',
    fr: 'Carte relocalisée',
    de: 'Relokalisierte Karte',
    it: 'Carta rilocata',
    nl: 'Verplaatste kaart',
    tr: 'Yer değiştirilmiş harita',
    ru: 'Релокационная карта',
    zh: '迁移星盘',
    ja: 'リロケーションチャート',
  },
  astrocartography: {
    pt: 'Astrocartografia',
    en: 'Astrocartography',
    es: 'Astrocartografía',
    fr: 'Astrocartographie',
    de: 'Astrokartografie',
    it: 'Astrocartografia',
    nl: 'Astrocartografie',
    tr: 'Astrokartografi',
    ru: 'Астрокартография',
    zh: '占星地图',
    ja: 'アストロカートグラフィー',
  },
  childChart: {
    pt: 'Mapa Infantil',
    en: 'Child Chart',
    es: 'Carta infantil',
    fr: 'Carte enfant',
    de: 'Kinderhoroskop',
    it: 'Carta infantile',
    nl: 'Kinderhoroscoop',
    tr: 'Çocuk haritası',
    ru: 'Детская карта',
    zh: '儿童星盘',
    ja: '子どもチャート',
  },
  calendarAstro: {
    pt: 'Calendário Astrológico',
    en: 'Astrological Calendar',
    es: 'Calendario astrológico',
    fr: 'Calendrier astrologique',
    de: 'Astrologischer Kalender',
    it: 'Calendario astrologico',
    nl: 'Astrologische kalender',
    tr: 'Astrolojik takvim',
    ru: 'Астрологический календарь',
    zh: '占星日历',
    ja: '占星カレンダー',
  },
} as const;

export default function Header(props: Props) {
  const t = () => getTranslations(props.locale);
  const menuLabel = (key: keyof typeof MENU_LABELS) =>
    MENU_LABELS[key][props.locale] ?? MENU_LABELS[key].en;
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [langOpen, setLangOpen] = createSignal(false);
  const [profileOpen, setProfileOpen] = createSignal(false);
  const [profiles, setProfiles] = createSignal<Profile[]>([]);
  const [activeProfile, setActiveProfile] = createSignal<string>('');
  const [cartCount, setCartCount] = createSignal(0);
  const [activeDropdown, setActiveDropdown] = createSignal<string | null>(null);
  const [mobileSection, setMobileSection] = createSignal<string | null>(null);

  onMount(async () => {
    try {
      const all = await db.profiles.toArray();
      all.sort((a, b) => (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0));
      setProfiles(all);
      if (all.length > 0) setActiveProfile(all[0].name);
    } catch { /* ignore */ }

    // Close dropdowns on click outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-dropdown')) {
        setActiveDropdown(null);
      }
      if (!target.closest('.profile-dropdown')) {
        setProfileOpen(false);
      }
      if (!target.closest('.lang-dropdown')) {
        setLangOpen(false);
      }
    });
  });

  const selectProfile = (profile: Profile) => {
    setActiveProfile(profile.name);
    setProfileOpen(false);
    window.dispatchEvent(new CustomEvent('lifemap:profile-change', { detail: profile }));
  };

  const deleteProfile = async (e: Event, profile: Profile) => {
    e.stopPropagation();
    if (!confirm(`Excluir perfil "${profile.name}"?`)) return;
    await db.profiles.delete(profile.id!);
    const all = await db.profiles.toArray();
    all.sort((a, b) => (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0));
    setProfiles(all);
    if (profile.name === activeProfile()) {
      setActiveProfile(all.length > 0 ? all[0].name : '');
      if (all.length > 0) {
        window.dispatchEvent(new CustomEvent('lifemap:profile-change', { detail: all[0] }));
      }
    }
  };

  // ─── MEGA-MENU STRUCTURE ───
  // 4 clean groups: Mapas, Horóscopo, Ferramentas, Aprender
  const megaMenu = () => [
    {
      id: 'charts',
      label: t().nav.charts,
      icon: '🗺️',
      items: [
        { icon: '☀️', label: t().nav.natal, href: localePath('/chart/natal', props.locale) },
        { icon: '🔄', label: t().nav.transits, href: localePath('/chart/transits', props.locale) },
        { icon: '💕', label: t().nav.synastry, href: localePath('/chart/synastry', props.locale) },
        { icon: '🌅', label: t().nav.solarReturn, href: localePath('/chart/solar-return', props.locale) },
        { icon: '⏩', label: t().nav.progressions, href: localePath('/chart/progressions', props.locale) },
        { icon: '♾️', label: t().nav.composite, href: localePath('/chart/composite', props.locale) },
        { icon: '🔀', label: 'Davison', href: localePath('/chart/davison', props.locale) },
        { icon: '📍', label: menuLabel('relocated'), href: localePath('/chart/relocated', props.locale) },
        { icon: '🗺️', label: menuLabel('astrocartography'), href: localePath('/chart/astrocartography', props.locale) },
        { icon: '🌙', label: menuLabel('lunarReturn'), href: localePath('/chart/lunar-return', props.locale) },
        { icon: '👶', label: menuLabel('childChart'), href: localePath('/chart/child', props.locale) },
      ],
    },
    {
      id: 'horoscope',
      label: t().nav.horoscope,
      icon: '✨',
      items: [
        { icon: '⭐', label: t().nav.dailyHoroscope, href: localePath('/horoscope/daily', props.locale) },
        { icon: '❤️', label: t().nav.loveHoroscope, href: localePath('/horoscope/love', props.locale) },
        { icon: '🔮', label: t().nav.weeklyHoroscope, href: localePath('/horoscope/weekly', props.locale) },
        { icon: '🌟', label: t().nav.celestialEvents, href: localePath('/horoscope/events', props.locale) },
        { icon: '💑', label: t().nav.lovers || 'Compatibilidade', href: localePath('/horoscope/lovers', props.locale) },
      ],
    },
    {
      id: 'tools',
      label: t().nav.tools,
      icon: '🛠️',
      items: [
        { icon: '📆', label: menuLabel('calendarAstro'), href: localePath('/tools/calendar', props.locale) },
        { icon: '📅', label: t().nav.ephemeris, href: localePath('/tools/ephemeris', props.locale) },
        { icon: '🌗', label: t().nav.moonPhases, href: localePath('/tools/moon-phases', props.locale) },
        { icon: '🔙', label: t().nav.retrograde, href: localePath('/tools/retrogrades', props.locale) },
        { icon: '🌐', label: t().nav.currentPlanets, href: localePath('/tools/current-planets', props.locale) },
        { icon: '🎨', label: t().nav.colorOracle || 'Color Oracle', href: localePath('/tools/color-oracle', props.locale) },
        { icon: '⏱️', label: t().nav.bestTime || 'Melhor Momento', href: localePath('/tools/best-time', props.locale) },
      ],
    },
    {
      id: 'learn',
      label: t().nav.learn,
      icon: '📚',
      items: [
        { icon: '🪐', label: t().nav.learnPlanets || 'Planetas', href: localePath('/learn/planets', props.locale) },
        { icon: '♈', label: t().nav.learnSigns || 'Signos', href: localePath('/learn/signs', props.locale) },
        { icon: '🏠', label: t().nav.learnHouses || 'Casas', href: localePath('/learn/houses', props.locale) },
        { icon: '🔗', label: t().nav.learnAspects || 'Aspectos', href: localePath('/learn/aspects', props.locale) },
        { icon: '🔄', label: t().nav.learnCycles || 'Ciclos Planetários', href: localePath('/learn/planetary-cycles', props.locale) },
        { icon: '💫', label: t().nav.learnChiron || 'Quíron', href: localePath('/learn/chiron', props.locale) },
      ],
    },
  ];

  const toggleDropdown = (id: string, e: Event) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown() === id ? null : id);
  };

  const toggleMobileSection = (id: string) => {
    setMobileSection(mobileSection() === id ? null : id);
  };

  return (
    <header class="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-14">
          {/* Logo */}
          <a href={localePath('/', props.locale)} class="flex items-center gap-2 flex-shrink-0">
            <BrandLogo pro />
          </a>

          {/* Desktop Nav — Mega Menu */}
          <nav class="hidden lg:flex items-center gap-1">
            <For each={megaMenu()}>
              {(group) => (
                <div class="nav-dropdown relative">
                  <button
                    onClick={(e) => toggleDropdown(group.id, e)}
                    class={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeDropdown() === group.id
                        ? 'text-gold bg-gold/5'
                        : 'text-cream-dark hover:text-cream hover:bg-base-100'
                    }`}
                  >
                    <span class="text-sm">{group.icon}</span>
                    <span>{group.label}</span>
                    <svg class={`w-3 h-3 opacity-50 transition-transform ${activeDropdown() === group.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  <Show when={activeDropdown() === group.id}>
                    <div class="absolute left-0 top-full mt-1 z-50 animate-fade-in">
                      <div class="bg-base-50 border border-base-300 rounded-xl shadow-card p-2 min-w-[220px]">
                        <For each={group.items}>
                          {(item) => (
                            <a
                              href={item.href}
                              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream-dark hover:bg-base-200 hover:text-gold transition-colors group"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <span class="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
                              <div class="font-medium">{item.label}</div>
                            </a>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>
                </div>
              )}
            </For>

            {/* Reports — standalone link with gold accent */}
            <a
              href={localePath('/reports', props.locale)}
              class="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gold-muted hover:text-gold rounded-lg hover:bg-gold/5 transition-colors"
            >
              <span class="text-xs">📄</span>
              <span>{t().nav.reports}</span>
            </a>
          </nav>

          {/* Right side: Profile + Language + Cart + Mobile toggle */}
          <div class="flex items-center gap-2">
            {/* Profile Switcher */}
            <Show when={profiles().length > 0}>
              <div class="profile-dropdown relative">
                  <button
                    onClick={() => { setProfileOpen(!profileOpen()); setLangOpen(false); setActiveDropdown(null); }}
                    class="flex items-center gap-1 px-2 py-1.5 text-sm text-muted hover:text-cream rounded-lg hover:bg-base-100 transition-colors"
                  title={t().common.selectProfile}
                  >
                  <svg class="w-4 h-4 text-gold-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="hidden sm:inline text-xs font-medium text-cream-dark max-w-[60px] truncate">{activeProfile() || '—'}</span>
                </button>

                <Show when={profileOpen()}>
                  <div class="absolute right-0 mt-2 w-56 bg-base-50 rounded-xl shadow-card border border-base-300 py-1 z-50 max-h-64 overflow-y-auto animate-fade-in">
                    <div class="px-3 py-2 text-[10px] text-muted uppercase font-semibold tracking-wider border-b border-base-300/50">
                      {t().common.profiles}
                    </div>
                    <For each={profiles()}>
                      {(profile) => (
                        <div class={`flex items-center hover:bg-base-200 transition-colors ${
                          profile.name === activeProfile() ? 'text-gold' : 'text-cream-dark'
                        }`}>
                          <button
                            onClick={() => selectProfile(profile)}
                            class="flex-1 text-left flex items-center gap-2 px-3 py-2 text-sm"
                          >
                            <span class="text-xs">{profile.name === activeProfile() ? '●' : '○'}</span>
                            <div class="flex-1 min-w-0">
                              <div class="text-xs font-medium truncate">{profile.name || '—'}</div>
                              <div class="text-[10px] text-muted">{profile.date} • {profile.city}</div>
                            </div>
                          </button>
                          <button
                            onClick={(e) => deleteProfile(e, profile)}
                            class="p-1.5 mr-2 text-muted hover:text-red-400 transition-colors rounded hover:bg-base-300/30"
                            title={t().common.delete}
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </For>
                    <div class="border-t border-base-300/50 mt-1 pt-1">
                      <a href={localePath('/onboarding', props.locale)} class="flex items-center gap-2 px-3 py-2 text-xs text-gold-muted hover:text-gold hover:bg-base-200 transition-colors rounded-lg mx-1">
                        <span>+</span>
                        <span>{t().common.newProfile}</span>
                      </a>
                    </div>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Language Switcher */}
            <div class="lang-dropdown relative">
              <button
                onClick={() => { setLangOpen(!langOpen()); setProfileOpen(false); setActiveDropdown(null); }}
                class="flex items-center gap-1 px-2 py-1.5 text-sm text-muted hover:text-cream rounded-lg hover:bg-base-100 transition-colors"
                aria-label={t().common.language}
              >
                <span class="text-sm">{languages[props.locale].flag}</span>
                <span class="hidden sm:inline uppercase text-[10px] font-medium">{props.locale}</span>
              </button>

              <Show when={langOpen()}>
                <div class="absolute right-0 mt-2 w-44 bg-base-50 rounded-xl shadow-card border border-base-300 py-1 z-50 max-h-80 overflow-y-auto animate-fade-in">
                  <For each={Object.entries(languages)}>
                    {([code, lang]) => (
                      <a
                        href={switchLocalePath(code as Locale)}
                        onClick={() => setPreferredLocale(code as Locale)}
                        class={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-base-200 transition-colors ${
                          code === props.locale ? 'text-gold font-medium' : 'text-cream-dark'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span class="text-xs">{lang.label}</span>
                      </a>
                    )}
                  </For>
                </div>
              </Show>
            </div>

            {/* Cart */}
            <a
              href={localePath('/cart', props.locale)}
              class="relative p-2 text-muted hover:text-gold transition-colors rounded-lg hover:bg-base-100"
              aria-label={t().nav.cart}
            >
              <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <Show when={cartCount() > 0}>
                <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount()}
                </span>
              </Show>
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => { setMenuOpen(!menuOpen()); setActiveDropdown(null); }}
              class="lg:hidden p-2 text-muted hover:text-cream rounded-lg hover:bg-base-100 transition-colors"
              aria-label="Menu"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <Show when={!menuOpen()} fallback={
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                }>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </Show>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — Accordion style */}
      <Show when={menuOpen()}>
        <div class="lg:hidden bg-base-50 border-t border-base-300/50 max-h-[70vh] overflow-y-auto animate-fade-in">
          <div class="px-4 py-3 space-y-1">
            <For each={megaMenu()}>
              {(group) => (
                <div class="border-b border-base-300/30 last:border-0">
                  <button
                    onClick={() => toggleMobileSection(group.id)}
                    class="w-full flex items-center justify-between py-3 text-sm font-medium text-cream"
                  >
                    <span class="flex items-center gap-2">
                      <span>{group.icon}</span>
                      <span>{group.label}</span>
                    </span>
                    <svg class={`w-4 h-4 text-muted transition-transform ${mobileSection() === group.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  <Show when={mobileSection() === group.id}>
                    <div class="pb-3 pl-6 grid grid-cols-2 gap-1">
                      <For each={group.items}>
                        {(item) => (
                          <a
                            href={item.href}
                            class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cream-dark hover:bg-base-200 hover:text-gold transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </a>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              )}
            </For>

            {/* Reports link */}
            <a
              href={localePath('/reports', props.locale)}
              class="flex items-center gap-2 py-3 text-sm font-medium text-gold"
              onClick={() => setMenuOpen(false)}
            >
              <span>📄</span>
              <span>{t().nav.reports}</span>
            </a>
          </div>
        </div>
      </Show>

      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }
      `}</style>
    </header>
  );
}
