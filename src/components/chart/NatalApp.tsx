import { createSignal, Show, onMount } from 'solid-js';
import NatalWheel from '../chart/NatalWheel';
import PlanetTable from '../chart/PlanetTable';
import InterpretationPanel from '../chart/InterpretationPanel';
import BirthDataForm from '../forms/BirthDataForm';
import { type ChartOptions, DEFAULT_OPTIONS } from '../forms/BirthDataForm';
import ProfileSelector, { saveProfile } from '../forms/ProfileSelector';
import { calculateNatalChart, initSweph, getActiveEngine } from '../../engine/index';
import type { BirthData, NatalChart } from '../../engine/types';
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

  onMount(async () => {
    const ready = await initSweph();
    setEngineInfo(ready ? '✦ Swiss Ephemeris' : '◇ Astronomy Engine');

    // Auto-load last profile if coming from onboarding or has saved profiles
    try {
      const profiles = await db.profiles.orderBy('id').reverse().limit(1).toArray();
      if (profiles.length > 0) {
        const p = profiles[0];
        handleCalculate({
          name: p.name,
          date: p.date,
          time: p.time,
          lat: p.lat,
          lng: p.lng,
          timezone: p.timezone,
          city: p.city,
          country: p.country,
        });
      }
    } catch (e) {
      console.warn('Could not auto-load profile:', e);
    }
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
    handleCalculate({
      name: profile.name,
      date: profile.date,
      time: profile.time,
      lat: profile.lat,
      lng: profile.lng,
      timezone: profile.timezone,
      city: profile.city,
      country: profile.country,
    });
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Form + Profiles */}
      <div class="lg:col-span-1 space-y-4">
        <ProfileSelector onSelect={handleProfileSelect} locale={props.locale} />
        <BirthDataForm onCalculate={handleCalculate} locale={props.locale} />

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

        <NatalWheel chart={chart()} />

        <Show when={chart()}>
          <PlanetTable chart={chart()} />
          <InterpretationPanel chart={chart()} />
        </Show>
      </div>
    </div>
  );
}
