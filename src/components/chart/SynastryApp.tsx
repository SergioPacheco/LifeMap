import { createSignal, onMount, Show, For } from 'solid-js';
import ProfileSelector from '../forms/ProfileSelector';
import SynastryInterpretation from '../chart/SynastryInterpretation';
import { calculateNatalChart, calculateSynastry, initSweph } from '../../engine/index';
import { renderWheel } from '../../renderer/wheel';
import { getAspectColor, getAspectSymbol } from '../../engine/aspects';
import type { NatalChart, SynastryChart } from '../../engine/types';
import type { Profile } from '../../store/db';

const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  northNode: 'Nodo N.', chiron: 'Quíron',
};
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', chiron: '⚷',
};

export default function SynastryApp() {
  const [chartA, setChartA] = createSignal<NatalChart | null>(null);
  const [chartB, setChartB] = createSignal<NatalChart | null>(null);
  const [synastry, setSynastry] = createSignal<SynastryChart | null>(null);
  const [nameA, setNameA] = createSignal('');
  const [nameB, setNameB] = createSignal('');
  const [wheelA, setWheelA] = createSignal('');
  const [wheelB, setWheelB] = createSignal('');

  onMount(async () => { await initSweph(); });

  const profileToChart = (profile: Profile): NatalChart => {
    return calculateNatalChart({
      name: profile.name, date: profile.date, time: profile.time,
      lat: profile.lat, lng: profile.lng, timezone: profile.timezone,
      city: profile.city, country: profile.country,
    });
  };

  const handleSelectA = (profile: Profile) => {
    const chart = profileToChart(profile);
    setChartA(chart);
    setNameA(profile.name);
    setWheelA(renderWheel(chart));
    if (chartB()) computeSynastry(chart, chartB()!);
  };

  const handleSelectB = (profile: Profile) => {
    const chart = profileToChart(profile);
    setChartB(chart);
    setNameB(profile.name);
    setWheelB(renderWheel(chart));
    if (chartA()) computeSynastry(chartA()!, chart);
  };

  const computeSynastry = (a: NatalChart, b: NatalChart) => {
    const result = calculateSynastry(a, b);
    setSynastry(result);
  };

  return (
    <div class="space-y-6">
      {/* Profile selectors */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-brand-600 mb-2">Pessoa A</h3>
          <ProfileSelector onSelect={handleSelectA} locale="pt" />
          <Show when={nameA()}>
            <p class="text-xs text-green-600 mt-2">✓ {nameA()}</p>
          </Show>
        </div>
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-purple-600 mb-2">Pessoa B</h3>
          <ProfileSelector onSelect={handleSelectB} locale="pt" />
          <Show when={nameB()}>
            <p class="text-xs text-green-600 mt-2">✓ {nameB()}</p>
          </Show>
        </div>
      </div>

      {/* Charts side by side */}
      <Show when={chartA() || chartB()}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Show when={chartA()}>
            <div class="glass rounded-2xl p-4">
              <h3 class="text-center text-sm font-medium text-cream-dark mb-2">{nameA()}</h3>
              <div class="w-full max-w-[400px] mx-auto" innerHTML={wheelA()} />
            </div>
          </Show>
          <Show when={chartB()}>
            <div class="glass rounded-2xl p-4">
              <h3 class="text-center text-sm font-medium text-cream-dark mb-2">{nameB()}</h3>
              <div class="w-full max-w-[400px] mx-auto" innerHTML={wheelB()} />
            </div>
          </Show>
        </div>
      </Show>

      {/* Synastry aspects */}
      <Show when={synastry()}>
        <div class="glass rounded-2xl p-6">
          <h3 class="text-lg font-semibold text-cream mb-4">
            Aspectos entre {nameA()} e {nameB()} ({synastry()!.aspects.length} encontrados)
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <For each={synastry()!.aspects.slice(0, 30)}>
              {(asp) => (
                <div class="flex items-center justify-between text-sm py-1.5 px-3 rounded border border-base-300/50">
                  <span>
                    <span class="text-brand-600">{PLANET_SYMBOLS[asp.planet1]}</span>
                    {' '}
                    <span style={{ color: getAspectColor(asp.type) }} class="font-bold">
                      {getAspectSymbol(asp.type)}
                    </span>
                    {' '}
                    <span class="text-purple-600">{PLANET_SYMBOLS[asp.planet2]}</span>
                    <span class="text-muted text-xs ml-2">
                      {PLANET_NAMES[asp.planet1]} — {PLANET_NAMES[asp.planet2]}
                    </span>
                  </span>
                  <span class="text-xs font-mono text-muted">{asp.orb}°</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Interpretation */}
      <Show when={synastry()}>
        <SynastryInterpretation synastry={synastry()} nameA={nameA()} nameB={nameB()} />
      </Show>

      <Show when={!chartA() && !chartB()}>
        <div class="glass rounded-2xl p-8 text-center text-muted">
          <div class="text-5xl mb-3">♡</div>
          <p>Selecione dois perfis para comparar a sinastria</p>
          <p class="text-xs mt-2">Calcule os mapas natais primeiro na página "Mapa Natal"</p>
        </div>
      </Show>
    </div>
  );
}
