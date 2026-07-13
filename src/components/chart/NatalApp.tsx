import { createSignal, Show, onMount } from 'solid-js';
import NatalWheel from '../chart/NatalWheel';
import PlanetTable from '../chart/PlanetTable';
import InterpretationPanel from '../chart/InterpretationPanel';
import ChartHeader from '../chart/ChartHeader';
import AspectGrid from '../chart/AspectGrid';
import ElementTable from '../chart/ElementTable';
import BirthDataForm from '../forms/BirthDataForm';
import { type ChartOptions, DEFAULT_OPTIONS } from '../forms/BirthDataForm';
import { saveProfile } from '../forms/ProfileSelector';
import { calculateNatalChart, calculateTransits, initSweph, getActiveEngine } from '../../engine/index';
import { renderBiWheel } from '../../renderer/wheel';
import type { BirthData, NatalChart, TransitChart } from '../../engine/types';
import { db, type Profile } from '../../store/db';
import { birthDataFromProfile } from '../../utils/profile';
import { localeToDateLocale } from '../../utils/dateTime';
import type { Locale } from '../../i18n';
import { getChartUi } from '../../i18n/chart-ui';

interface Props {
  locale: Locale;
}

export default function NatalApp(props: Props) {
  const text = () => getChartUi(props.locale).natal;
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

      // Handle transits toggle from extended options
      if (opts.showTransitsToday) {
        toggleTransits(true);
      } else {
        setShowTransits(false);
        setTransitSvg('');
      }

      if (data.name || data.city) {
        await saveProfile({
          name: data.name || data.city || text().unnamed,
          date: data.date,
          time: data.time,
          lat: data.lat,
          lng: data.lng,
          city: data.city || '',
          country: data.country || '',
          timezone: data.timezone,
          timeZoneId: data.timeZoneId,
        });
      }
    } catch (e) {
      console.error('Calculation error:', e);
      setError(text().calculateError);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    const data: BirthData = birthDataFromProfile(profile);
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
      timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
            <p class="text-sm">{text().calculatingPositions}</p>
          </div>
        </Show>

        {/* Show natal-only wheel when transits OFF, bi-wheel when ON */}
        <Show when={chart()}>
          <ChartHeader chart={chart()} locale={props.locale} />
        </Show>

        <Show when={!showTransits()}>
          <NatalWheel chart={chart()} locale={props.locale} />
        </Show>

        {/* Bi-wheel when transits enabled */}
        <Show when={showTransits() && transitSvg()}>
          <div class="glass rounded-2xl p-4">
            <div class="text-xs text-center text-muted mb-2">
              ● {text().natalInner} &nbsp; ○ {text().todayTransitsOuter} — {new Date().toLocaleDateString(localeToDateLocale(props.locale))}
            </div>
            <div class="w-full max-w-[600px] mx-auto" innerHTML={transitSvg()} />
          </div>
        </Show>

        <Show when={chart()}>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AspectGrid chart={chart()} locale={props.locale} />
            <ElementTable chart={chart()} locale={props.locale} />
          </div>
          <PlanetTable chart={chart()} locale={props.locale} />
          <InterpretationPanel chart={chart()} locale={props.locale} />
        </Show>
      </div>
    </div>
  );
}
