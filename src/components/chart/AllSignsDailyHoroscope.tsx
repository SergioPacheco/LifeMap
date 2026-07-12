import { createSignal, onMount, For, Show } from 'solid-js';
import { initSweph } from '../../engine/index';
import { calculatePositions, getSignIndex, norm } from '../../engine/calculations';
import { generateDailyHoroscope, type DailyHoroscope } from '../../engine/daily-horoscope';
import { getTranslations, type Locale } from '../../i18n';
import type { NatalChart, Positions, HouseData } from '../../engine/types';

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const SIGN_KEYS = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];

// Element colors for visual grouping
const ELEMENT_COLORS: Record<number, string> = {
  0: 'from-red-900/20 to-red-950/10 border-red-700/30',     // Fire: Aries
  1: 'from-green-900/20 to-green-950/10 border-green-700/30', // Earth: Taurus
  2: 'from-sky-900/20 to-sky-950/10 border-sky-700/30',      // Air: Gemini
  3: 'from-blue-900/20 to-blue-950/10 border-blue-700/30',   // Water: Cancer
  4: 'from-red-900/20 to-red-950/10 border-red-700/30',     // Fire: Leo
  5: 'from-green-900/20 to-green-950/10 border-green-700/30', // Earth: Virgo
  6: 'from-sky-900/20 to-sky-950/10 border-sky-700/30',      // Air: Libra
  7: 'from-blue-900/20 to-blue-950/10 border-blue-700/30',   // Water: Scorpio
  8: 'from-red-900/20 to-red-950/10 border-red-700/30',     // Fire: Sagittarius
  9: 'from-green-900/20 to-green-950/10 border-green-700/30', // Earth: Capricorn
  10: 'from-sky-900/20 to-sky-950/10 border-sky-700/30',     // Air: Aquarius
  11: 'from-blue-900/20 to-blue-950/10 border-blue-700/30',  // Water: Pisces
};

interface Props {
  locale: Locale;
}

/**
 * Build a synthetic NatalChart for a sun sign.
 * Places the Sun at 15° of the sign with Whole Sign houses (ASC = 0° of sign).
 */
function buildSyntheticChart(signIndex: number, date: Date): NatalChart {
  const sunLon = signIndex * 30 + 15; // Sun at mid-sign
  const ascendant = signIndex * 30;    // ASC at 0° of sign

  // Whole sign houses: each starts at 0° of consecutive signs
  const cusps = Array.from({ length: 12 }, (_, i) => norm((signIndex + i) * 30));

  // Use real transit positions for all other planets (they are the same for everyone)
  const transitPositions = calculatePositions(date);

  // Override sun with sign's representative position
  const positions: Positions = {
    ...transitPositions,
    sun: { longitude: sunLon, latitude: 0, speed: 1 },
  };

  const houses: HouseData = {
    cusps,
    ascendant,
    midheaven: norm(ascendant + 270), // Approximate MC
    system: 'whole-sign',
  };

  // Calculate planet houses based on whole sign
  const planetHouses: Record<string, number> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    for (let i = 0; i < 12; i++) {
      const start = cusps[i];
      const end = cusps[(i + 1) % 12];
      const lon = pos.longitude;
      if (start < end) {
        if (lon >= start && lon < end) { planetHouses[planet] = i + 1; break; }
      } else {
        if (lon >= start || lon < end) { planetHouses[planet] = i + 1; break; }
      }
    }
  }

  return {
    type: 'natal',
    date,
    positions,
    houses,
    aspects: [],
    planetHouses,
    dignities: {},
    meta: { lat: 0, lng: 0, timezone: 'UTC', houseSystem: 'whole-sign', name: '' },
  };
}

export default function AllSignsDailyHoroscope(props: Props) {
  const [horoscopes, setHoroscopes] = createSignal<Array<{ sign: number; data: DailyHoroscope }>>([]);
  const [loading, setLoading] = createSignal(true);
  const [moonSign, setMoonSign] = createSignal(0);
  const [expandedSign, setExpandedSign] = createSignal<number | null>(null);

  const t = () => getTranslations(props.locale);
  const signNames = () => t().dashboard.signNames as string[];

  onMount(async () => {
    await initSweph();
    generateAll();
  });

  const generateAll = () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const results: Array<{ sign: number; data: DailyHoroscope }> = [];

    for (let i = 0; i < 12; i++) {
      const chart = buildSyntheticChart(i, today);
      const horoscope = generateDailyHoroscope(chart, today);
      results.push({ sign: i, data: horoscope });
    }

    setMoonSign(results[0]?.data.moonSign ?? 0);
    setHoroscopes(results);
    setLoading(false);
  };

  const toggleSign = (index: number) => {
    setExpandedSign(expandedSign() === index ? null : index);
  };

  return (
    <div class="space-y-8">
      {/* Header */}
      <div class="text-center">
        <h1 class="text-3xl sm:text-4xl font-serif font-bold text-cream-light">
          {t().nav.dailyHoroscope}
        </h1>
        <p class="text-cream-dark mt-2">
          {new Date().toLocaleDateString(props.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Moon info */}
        <Show when={!loading()}>
          <div class="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full glass text-sm">
            <span class="text-lg">☽</span>
            <span class="text-cream-dark">
              {t().dashboard.moonIn} <strong class="text-cream">{signNames()[moonSign()]}</strong>
            </span>
            <span class="text-lg">{SIGN_SYMBOLS[moonSign()]}</span>
          </div>
        </Show>
      </div>

      {/* Loading state */}
      <Show when={loading()}>
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
        </div>
      </Show>

      {/* Signs grid */}
      <Show when={!loading()}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <For each={horoscopes()}>
            {(item) => {
              const isExpanded = () => expandedSign() === item.sign;
              return (
                <div
                  class={`rounded-2xl border bg-gradient-to-br p-5 cursor-pointer transition-all hover:scale-[1.01] ${ELEMENT_COLORS[item.sign]} ${
                    isExpanded() ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''
                  }`}
                  onClick={() => toggleSign(item.sign)}
                >
                  {/* Sign header */}
                  <div class="flex items-center gap-3 mb-3">
                    <span class="text-3xl">{SIGN_SYMBOLS[item.sign]}</span>
                    <div>
                      <h2 class="text-lg font-serif font-semibold text-cream-light">
                        {signNames()[item.sign]}
                      </h2>
                      <p class="text-xs text-muted">
                        {SIGN_KEYS[item.sign]}
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <p class="text-sm text-cream-dark leading-relaxed">
                    {item.data.summary}
                  </p>

                  {/* Expanded detail */}
                  <Show when={isExpanded()}>
                    <div class="mt-4 pt-4 border-t border-white/10 space-y-4">
                      {/* Categories */}
                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div class="p-3 rounded-lg bg-pink-900/10 border border-pink-800/20">
                          <h4 class="text-xs font-semibold text-pink-300 uppercase mb-1">♡ {t().dashboard.love}</h4>
                          <p class="text-xs text-cream-dark">{item.data.love}</p>
                        </div>
                        <div class="p-3 rounded-lg bg-blue-900/10 border border-blue-800/20">
                          <h4 class="text-xs font-semibold text-blue-300 uppercase mb-1">♄ {t().dashboard.career}</h4>
                          <p class="text-xs text-cream-dark">{item.data.career}</p>
                        </div>
                        <div class="p-3 rounded-lg bg-green-900/10 border border-green-800/20">
                          <h4 class="text-xs font-semibold text-green-300 uppercase mb-1">♂ {t().dashboard.health}</h4>
                          <p class="text-xs text-cream-dark">{item.data.health}</p>
                        </div>
                      </div>

                      {/* Active transits */}
                      <Show when={item.data.transits.length > 0}>
                        <div>
                          <h4 class="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                            {item.data.transits.length} trânsitos ativos
                          </h4>
                          <div class="space-y-1">
                            <For each={item.data.transits.slice(0, 5)}>
                              {(transit) => (
                                <p class={`text-xs px-2 py-1 rounded ${
                                  transit.intensity === 'high' ? 'bg-red-900/20 text-red-200' :
                                  transit.intensity === 'medium' ? 'bg-yellow-900/20 text-yellow-200' :
                                  'bg-base-200/50 text-muted'
                                }`}>
                                  {transit.interpretation}
                                </p>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                    </div>
                  </Show>

                  {/* Expand hint */}
                  <div class="mt-3 text-center">
                    <span class="text-xs text-muted">
                      {isExpanded() ? '▲' : '▼'}
                    </span>
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
