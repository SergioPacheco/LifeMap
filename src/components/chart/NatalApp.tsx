import { createSignal, Show, onMount } from 'solid-js';
import NatalWheel from '../chart/NatalWheel';
import PlanetTable from '../chart/PlanetTable';
import InterpretationPanel from '../chart/InterpretationPanel';
import BirthDataForm from '../forms/BirthDataForm';
import { type ChartOptions, DEFAULT_OPTIONS } from '../forms/BirthDataForm';
import { saveProfile } from '../forms/ProfileSelector';
import { calculateNatalChart, calculateTransits, initSweph, getActiveEngine } from '../../engine/index';
import { renderBiWheel } from '../../renderer/wheel';
import type { BirthData, NatalChart, TransitChart } from '../../engine/types';
import { db, type Profile } from '../../store/db';

interface Props {
  locale: string;
}

export default function NatalApp(props: Props) {
  const [chart, setChart] = createSignal<NatalChart | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [engineInfo, setEngineInfo] = createSignal('');
  const [lastBirthData, setLastBirthData] = createSignal<BirthData | null>(null);
  const [formData, setFormData] = createSignal<BirthData | null>(null);
  const [showTransits, setShowTransits] = createSignal(false);
  const [transitSvg, setTransitSvg] = createSignal('');

  onMount(async () => {
    const ready = await initSweph();
    setEngineInfo(ready ? '✦ Swiss Ephemeris' : '◇ Astronomy Engine');

    // Auto-load last profile if coming from onboarding or has saved profiles
    try {
      const profiles = await db.profiles.orderBy('id').reverse().limit(1).toArray();
      if (profiles.length > 0) {
        const p = profiles[0];
        handleProfileSelect(p);
      }
    } catch (e) {
      console.warn('Could not auto-load profile:', e);
    }

    // Listen for profile changes from Header
    window.addEventListener('lifemap:profile-change', (e: any) => {
      if (e.detail) handleProfileSelect(e.detail);
    });
  });

  const handleCalculate = async (data: BirthData, options?: ChartOptions) => {
    setLoading(true);
    setError('');
    setLastBirthData(data);

    try {
      const opts = options || DEFAULT_OPTIONS;
      const result = calculateNatalChart(data, {
        houseSystem: opts.houseSystem || 'placidus',
        includeExtraPoints: opts.includeExtraPoints !== false,
        includeAsteroids: opts.includeAsteroids || false,
        aspectOrbs: opts.aspectOrbs,
      });
      setChart(result);
      setEngineInfo(`✦ ${getActiveEngine() === 'swisseph' ? 'Swiss Ephemeris' : 'Astronomy Engine'}`);

      if (data.name || data.city) {
        await saveProfile({
          name: data.name || data.city || 'Sem nome',
          date: data.date,
          time: data.time,
          lat: data.lat,
          lng: data.lng,
          city: data.city || '',
          country: data.country || '',
          timezone: data.timezone,
        });
      }
    } catch (e) {
      console.error('Calculation error:', e);
      setError('Erro ao calcular o mapa. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    const data: BirthData = {
      name: profile.name,
      date: profile.date,
      time: profile.time,
      lat: profile.lat,
      lng: profile.lng,
      timezone: profile.timezone,
      city: profile.city,
      country: profile.country,
    };
    setFormData(data);
    setShowTransits(false);
    setTransitSvg('');
    handleCalculate(data);
  };

  const handleNewProfile = () => {
    setFormData({
      name: '',
      date: '',
      time: '12:00',
      lat: 0,
      lng: 0,
      timezone: -3,
      city: '',
      country: '',
    });
    setChart(null);
    setShowTransits(false);
    setTransitSvg('');
  };

  const toggleTransits = (enabled: boolean) => {
    setShowTransits(enabled);
    if (enabled && chart()) {
      const today = new Date();
      const transit = calculateTransits(today, chart()!);
      const svg = renderBiWheel(chart()!, transit.positions, transit.aspects);
      setTransitSvg(svg);
    } else {
      setTransitSvg('');
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left: Form + Profiles */}
      <div class="lg:col-span-1 lg:sticky lg:top-20 flex flex-col gap-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-hidden">
        <BirthDataForm onCalculate={handleCalculate} locale={props.locale} initialData={formData()} />

        {/* Engine info badge */}
        <Show when={engineInfo()}>
          <div class="text-xs text-center text-muted">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-base-200 border border-base-300">
              {engineInfo()}
            </span>
          </div>
        </Show>
      </div>

      {/* Right: Chart + Table */}
      <div class="lg:col-span-2 space-y-6">
        <Show when={error()}>
          <div class="p-3 bg-red-900/20 border border-red-800/30 rounded-lg text-sm text-red-400">
            {error()}
          </div>
        </Show>

        <Show when={loading()}>
          <div class="text-center py-8 text-muted">
            <div class="animate-spin text-3xl mb-2 text-gold">✦</div>
            <p class="text-sm">Calculando posições astronômicas...</p>
          </div>
        </Show>

        {/* Show natal-only wheel when transits OFF, bi-wheel when ON */}
        <Show when={!showTransits()}>
          <NatalWheel chart={chart()} />
        </Show>

        {/* Transit toggle */}
        <Show when={chart()}>
          <div class="flex items-center gap-3 px-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTransits()}
                onChange={(e) => toggleTransits(e.currentTarget.checked)}
                class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold focus:ring-gold/40"
              />
              <span class="text-sm text-cream-dark">Mostrar trânsitos de hoje</span>
            </label>
            <Show when={showTransits()}>
              <span class="text-xs text-muted">({new Date().toLocaleDateString('pt-BR')})</span>
            </Show>
          </div>
        </Show>

        {/* Bi-wheel when transits enabled */}
        <Show when={showTransits() && transitSvg()}>
          <div class="glass rounded-2xl p-4">
            <div class="text-xs text-center text-muted mb-2">
              ● Natal (interno) &nbsp; ○ Trânsitos de hoje (externo)
            </div>
            <div class="w-full max-w-[600px] mx-auto" innerHTML={transitSvg()} />
          </div>
        </Show>

        <Show when={chart()}>
          <PlanetTable chart={chart()} />
          <InterpretationPanel chart={chart()} />
        </Show>
      </div>
    </div>
  );
}
