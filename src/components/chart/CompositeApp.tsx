import { createSignal, onMount, Show } from 'solid-js';
import ProfileSelector from '../forms/ProfileSelector';
import PlanetTable from '../chart/PlanetTable';
import { calculateNatalChart, calculateComposite, initSweph } from '../../engine/index';
import { renderWheel } from '../../renderer/wheel';
import type { NatalChart, CompositeChart } from '../../engine/types';
import type { Profile } from '../../store/db';

export default function CompositeApp() {
  const [chartA, setChartA] = createSignal<NatalChart | null>(null);
  const [chartB, setChartB] = createSignal<NatalChart | null>(null);
  const [composite, setComposite] = createSignal<CompositeChart | null>(null);
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [nameA, setNameA] = createSignal('');
  const [nameB, setNameB] = createSignal('');

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
    if (chartB()) compute(chart, chartB()!);
  };

  const handleSelectB = (profile: Profile) => {
    const chart = profileToChart(profile);
    setChartB(chart);
    setNameB(profile.name);
    if (chartA()) compute(chartA()!, chart);
  };

  const compute = (a: NatalChart, b: NatalChart) => {
    const result = calculateComposite(a, b);
    setComposite(result);
    setWheelSvg(renderWheel(result as any));
  };

  return (
    <div class="space-y-6">
      {/* Profile selectors */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-brand-600 mb-2">Pessoa A</h3>
          <ProfileSelector onSelect={handleSelectA} locale="pt" />
          <Show when={nameA()}><p class="text-xs text-green-600 mt-2">✓ {nameA()}</p></Show>
        </div>
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-purple-600 mb-2">Pessoa B</h3>
          <ProfileSelector onSelect={handleSelectB} locale="pt" />
          <Show when={nameB()}><p class="text-xs text-green-600 mt-2">✓ {nameB()}</p></Show>
        </div>
      </div>

      {/* Composite chart */}
      <Show when={composite()} fallback={
        <div class="glass rounded-2xl p-8 text-center text-muted">
          <div class="text-5xl mb-3">⊕</div>
          <p>Selecione dois perfis para gerar o Mapa Composto</p>
          <p class="text-xs mt-2">O composto representa a "entidade" do relacionamento — o ponto médio entre os dois mapas.</p>
        </div>
      }>
        <div class="glass rounded-2xl p-4">
          <div class="text-center text-sm text-muted mb-2">
            Mapa Composto: <strong>{nameA()}</strong> + <strong>{nameB()}</strong>
          </div>
          <div class="w-full max-w-[600px] mx-auto" innerHTML={wheelSvg()} />
        </div>
        <PlanetTable chart={composite() as any} />
      </Show>
    </div>
  );
}
