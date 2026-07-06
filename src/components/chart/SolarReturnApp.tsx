import { createSignal, onMount, Show } from 'solid-js';
import ProfileSelector from '../forms/ProfileSelector';
import PlanetTable from '../chart/PlanetTable';
import { calculateNatalChart, calculateSolarReturn, initSweph } from '../../engine/index';
import { renderWheel } from '../../renderer/wheel';
import type { NatalChart, SolarReturnChart } from '../../engine/types';
import type { Profile } from '../../store/db';

export default function SolarReturnApp() {
  const [natalChart, setNatalChart] = createSignal<NatalChart | null>(null);
  const [srChart, setSrChart] = createSignal<any>(null);
  const [year, setYear] = createSignal(new Date().getFullYear());
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [profileName, setProfileName] = createSignal('');

  onMount(async () => { await initSweph(); });

  const handleProfileSelect = (profile: Profile) => {
    const chart = calculateNatalChart({
      name: profile.name, date: profile.date, time: profile.time,
      lat: profile.lat, lng: profile.lng, timezone: profile.timezone,
      city: profile.city, country: profile.country,
    });
    setNatalChart(chart);
    setProfileName(profile.name);
    calculateSR(chart, year(), profile.lat, profile.lng, profile.timezone);
  };

  const calculateSR = (natal: NatalChart, yr: number, lat: number, lng: number, tz: number) => {
    const sr = calculateSolarReturn(natal, yr, lat, lng, tz);
    setSrChart(sr);
    setWheelSvg(renderWheel(sr));
  };

  const handleYearChange = (yr: number) => {
    setYear(yr);
    if (natalChart()) {
      const meta = natalChart()!.meta;
      calculateSR(natalChart()!, yr, meta.lat, meta.lng, meta.timezone);
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 space-y-4">
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">Perfil</h3>
          <ProfileSelector onSelect={handleProfileSelect} locale="pt" />
        </div>

        <Show when={natalChart()}>
          <div class="glass rounded-2xl p-4">
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">Ano</h3>
            <div class="flex items-center gap-2">
              <button onClick={() => handleYearChange(year() - 1)} class="px-3 py-1 text-sm bg-base-200 rounded">←</button>
              <input
                type="number" value={year()} min={1900} max={2100}
                onInput={(e) => handleYearChange(parseInt(e.currentTarget.value))}
                class="w-24 text-center px-2 py-1 rounded border border-base-400 bg-base-200 text-cream text-sm"
              />
              <button onClick={() => handleYearChange(year() + 1)} class="px-3 py-1 text-sm bg-base-200 rounded">→</button>
            </div>
            <Show when={srChart()}>
              <p class="text-xs text-muted mt-2">
                Retorno Solar: {srChart().date.toISOString().split('T')[0]}
              </p>
            </Show>
          </div>
        </Show>

        <Show when={srChart()}>
          <PlanetTable chart={srChart()} />
        </Show>
      </div>

      <div class="lg:col-span-2">
        <Show when={srChart()} fallback={
          <div class="glass rounded-2xl p-8 text-center text-muted">
            <div class="text-5xl mb-3">☀</div>
            <p>Selecione um perfil para calcular a Revolução Solar</p>
          </div>
        }>
          <div class="glass rounded-2xl p-4">
            <div class="text-center text-sm text-muted mb-2">
              Revolução Solar {year()} — <strong>{profileName()}</strong>
            </div>
            <div class="w-full max-w-[600px] mx-auto" innerHTML={wheelSvg()} />
          </div>
        </Show>
      </div>
    </div>
  );
}
