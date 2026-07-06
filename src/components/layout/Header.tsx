import { createSignal, For, Show } from 'solid-js';
import { getTranslations, languages, localePath, switchLocalePath, type Locale } from '../../i18n';

interface Props {
  locale: Locale;
}

export default function Header(props: Props) {
  const t = () => getTranslations(props.locale);
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [langOpen, setLangOpen] = createSignal(false);
  const [cartCount, setCartCount] = createSignal(0);

  const navItems = () => [
    { label: t().nav.charts, href: localePath('/chart/natal', props.locale), children: [
      { label: t().nav.natal, href: localePath('/chart/natal', props.locale) },
      { label: t().nav.transits, href: localePath('/chart/transits', props.locale) },
      { label: t().nav.synastry, href: localePath('/chart/synastry', props.locale) },
      { label: t().nav.solarReturn, href: localePath('/chart/solar-return', props.locale) },
      { label: t().nav.progressions, href: localePath('/chart/progressions', props.locale) },
    ]},
    { label: t().nav.tools, href: localePath('/tools/ephemeris', props.locale), children: [
      { label: t().nav.ephemeris, href: localePath('/tools/ephemeris', props.locale) },
      { label: t().nav.moonPhases, href: localePath('/tools/moon-phases', props.locale) },
      { label: t().nav.retrograde, href: localePath('/tools/retrogrades', props.locale) },
    ]},
    { label: t().nav.reports, href: localePath('/reports', props.locale) },
    { label: t().nav.learn, href: localePath('/learn', props.locale) },
  ];

  return (
    <header class="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="flex items-center justify-between h-16">
          {/* Logo */}
          <a href={localePath('/', props.locale)} class="flex items-center gap-2">
            <span class="text-2xl text-gold">✦</span>
            <span class="font-serif text-xl font-bold text-gold">
              LifeMap
            </span>
            <span class="text-xs font-medium text-gold-muted uppercase tracking-wider">
              Pro
            </span>
          </a>

          {/* Desktop Nav */}
          <nav class="hidden lg:flex items-center gap-6">
            <For each={navItems()}>
              {(item) => (
                <a href={item.href} class="text-sm font-medium text-cream-dark hover:text-gold transition-colors">
                  {item.label}
                </a>
              )}
            </For>
          </nav>

          {/* Right side: Language + Cart + Mobile toggle */}
          <div class="flex items-center gap-3">
            {/* Language Switcher */}
            <div class="relative">
              <button
                onClick={() => setLangOpen(!langOpen())}
                class="flex items-center gap-1 px-2 py-1 text-sm text-muted hover:text-cream rounded transition-colors"
                aria-label={t().common.language}
              >
                <span>{languages[props.locale].flag}</span>
                <span class="hidden sm:inline uppercase text-xs font-medium">{props.locale}</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <Show when={langOpen()}>
                <div class="absolute right-0 mt-2 w-48 bg-base-50 rounded-lg shadow-dark border border-base-300 py-1 z-50">
                  <For each={Object.entries(languages)}>
                    {([code, lang]) => (
                      <a
                        href={switchLocalePath(code as Locale)}
                        class={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-base-200 transition-colors ${
                          code === props.locale ? 'text-gold font-medium' : 'text-cream-dark'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </a>
                    )}
                  </For>
                </div>
              </Show>
            </div>

            {/* Cart */}
            <a
              href={localePath('/cart', props.locale)}
              class="relative p-2 text-muted hover:text-gold transition-colors"
              aria-label={t().nav.cart}
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <Show when={cartCount() > 0}>
                <span class="absolute -top-1 -right-1 w-4 h-4 bg-gold text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount()}
                </span>
              </Show>
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen())}
              class="lg:hidden p-2 text-muted hover:text-cream"
              aria-label="Menu"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Mobile menu */}
      <Show when={menuOpen()}>
        <div class="lg:hidden bg-base-50 border-t border-base-300/50 px-4 py-4">
          <For each={navItems()}>
            {(item) => (
              <div class="py-2">
                <a href={item.href} class="block text-sm font-medium text-cream py-1 hover:text-gold transition-colors">
                  {item.label}
                </a>
                <Show when={item.children}>
                  <div class="pl-4">
                    <For each={item.children}>
                      {(child) => (
                        <a href={child.href} class="block text-sm text-muted py-1 hover:text-gold transition-colors">
                          {child.label}
                        </a>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </header>
  );
}
