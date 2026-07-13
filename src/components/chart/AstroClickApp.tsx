import { createSignal, onMount, Show } from 'solid-js';

import { calculateNatalChart, initSweph, getSignIndex, getDegreeInSign } from '../../engine/index';
import { renderWheel } from '../../renderer/wheel';
import type { NatalChart } from '../../engine/types';
import type { Profile } from '../../store/db';
import { db } from '../../store/db';
import { birthDataFromProfile } from '../../utils/profile';
import type { Locale } from '../../i18n';
import { getInterpretations } from '../../engine/interpretations';
import {
  ASTROCLICK_PLANET_IDS,
  getAstroClickPlanetMeaning,
  getAstroClickText,
  type AstroClickPlanetId,
} from '../../i18n/astroclick';

interface Props {
  locale: Locale;
}

export default function AstroClickApp(props: Props) {
  const text = () => getAstroClickText(props.locale);
  const interp = () => getInterpretations(props.locale);
  const [natal, setNatal] = createSignal<NatalChart | null>(null);
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [selectedPlanet, setSelectedPlanet] = createSignal<string | null>(null);
  const [interpretation, setInterpretation] = createSignal<{ title: string; meaning: string; question: string; sign: string; house: number } | null>(null);

  onMount(async () => {
    await initSweph();
    // Add click listener for planets
    document.addEventListener('click', handlePlanetClick);
    // Auto-load profile
    try {
      const profiles = await db.profiles.orderBy('id').reverse().limit(1).toArray();
      if (profiles.length > 0) handleProfileSelect(profiles[0]);
    } catch {}
    window.addEventListener('lifemap:profile-change', (e: any) => {
      if (e.detail) handleProfileSelect(e.detail);
    });
  });

  const handleProfileSelect = (profile: Profile) => {
    const chart = calculateNatalChart(birthDataFromProfile(profile));
    setNatal(chart);
    setWheelSvg(renderWheel(chart));
    setSelectedPlanet(null);
    setInterpretation(null);
  };

  const handlePlanetClick = (e: MouseEvent) => {
    const target = e.target as Element;
    const planetEl = target.closest('[data-planet]') || target.closest('.planet-symbol');
    if (!planetEl) return;

    const planetId = planetEl.getAttribute('data-planet');
    if (!planetId || !natal()) return;

    setSelectedPlanet(planetId);

    const pos = natal()!.positions[planetId];
    if (!pos) return;

    const signIdx = getSignIndex(pos.longitude);
    const house = natal()!.planetHouses[planetId] || 1;
    const localizedPlanetId = planetId as AstroClickPlanetId;
    const planetIndex = ASTROCLICK_PLANET_IDS.indexOf(localizedPlanetId);

    if (planetIndex >= 0) {
      setInterpretation({
        title: `${interp().PLANET_NAMES[localizedPlanetId]} — ${text().themes[planetIndex]}`,
        meaning: getAstroClickPlanetMeaning(props.locale, localizedPlanetId),
        question: `${text().reflect}: "${text().questions[planetIndex]}"`,
        sign: interp().SIGN_NAMES[signIdx],
        house,
      });
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Interpretation */}
      <div class="lg:col-span-1 space-y-4">
        <Show when={natal() && !interpretation()}>
          <div class="bg-gold/5 rounded-xl border border-gold/20 p-6 text-center">
            <div class="text-3xl mb-2">👆</div>
            <p class="text-sm text-gold font-medium">
              {text().clickToInterpret}
            </p>
          </div>
        </Show>

        <Show when={interpretation()}>
          <div class="bg-base-50 rounded-xl border border-gold/30 p-6 shadow-lg ring-2 ring-gold/30">
            <h3 class="text-lg font-serif font-bold text-gold">
              {interpretation()!.title}
            </h3>
            <p class="text-xs text-muted mt-1">
              {text().inSign} {interpretation()!.sign} — {text().house} {interpretation()!.house}
            </p>
            <p class="mt-4 text-sm text-cream-dark leading-relaxed">
              {interpretation()!.meaning}
            </p>
            <p class="mt-3 text-sm text-gold italic">
              {interpretation()!.question}
            </p>
          </div>
        </Show>
      </div>

      {/* Right: Interactive wheel */}
      <div class="lg:col-span-2">
        <Show when={natal()} fallback={
          <div class="glass rounded-2xl p-8 text-center text-muted">
            <div class="text-5xl mb-3">🎯</div>
            <p>{text().selectProfile}</p>
            <p class="text-xs mt-2">{text().clickForInterpretations}</p>
          </div>
        }>
          <div class="glass rounded-2xl p-4">
            <div class="text-center text-xs text-muted mb-2">
              {text().explore} • {text().selectedPlanet}: <strong class="text-brand-600">{selectedPlanet() ? interp().PLANET_NAMES[selectedPlanet()!] : text().none}</strong>
            </div>
            <div class="w-full max-w-[600px] mx-auto cursor-pointer" innerHTML={wheelSvg()} />
          </div>
        </Show>
      </div>
    </div>
  );
}
