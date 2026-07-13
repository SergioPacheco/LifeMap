import { createSignal, onMount, Show, For } from 'solid-js';
import PlanetTable from '../chart/PlanetTable';
import AspectGrid from '../chart/AspectGrid';
import ElementTable from '../chart/ElementTable';
import { calculateNatalChart, calculateSolarReturn, initSweph } from '../../engine/index';
import { renderWheel } from '../../renderer/wheel';
import { getSignIndex } from '../../engine/calculations';
import type { NatalChart, SolarReturnChart } from '../../engine/types';
import type { Profile } from '../../store/db';
import { db } from '../../store/db';
import { birthDataFromProfile } from '../../utils/profile';
import { isValidTimeZone, localeToDateLocale } from '../../utils/dateTime';
import type { Locale } from '../../i18n';
import { getInterpretations } from '../../engine/interpretations';
import {
  formatSolarReturnText,
  getSolarReturnMoonHouse,
  getSolarReturnSunHouse,
  getSolarReturnText,
} from '../../i18n/solar-return';

interface Props { locale: Locale }

export default function SolarReturnApp(props: Props) {
  const text = () => getSolarReturnText(props.locale);
  const [natalChart, setNatalChart] = createSignal<NatalChart | null>(null);
  const [srChart, setSrChart] = createSignal<any>(null);
  const [year, setYear] = createSignal(new Date().getFullYear());
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [profileName, setProfileName] = createSignal('');

  onMount(async () => {
    await initSweph();
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
    setNatalChart(chart);
    setProfileName(profile.name);
    calculateSR(chart, year(), profile.lat, profile.lng, profile.timezone, profile.timeZoneId);
  };

  const calculateSR = (natal: NatalChart, yr: number, lat: number, lng: number, tz: number, timeZoneId?: string) => {
    const sr = calculateSolarReturn(natal, yr, lat, lng, tz, timeZoneId);
    setSrChart(sr);
    setWheelSvg(renderWheel(sr as any));
  };

  const handleYearChange = (yr: number) => {
    setYear(yr);
    if (natalChart()) {
      const meta = natalChart()!.meta;
      calculateSR(natalChart()!, yr, meta.lat, meta.lng, meta.timezone, meta.timeZoneId);
    }
  };

  const formatReturnDate = (chart: SolarReturnChart): string => {
    const locale = localeToDateLocale(props.locale);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    if (isValidTimeZone(chart.meta.timeZoneId)) {
      return chart.date.toLocaleString(locale, { ...options, timeZone: chart.meta.timeZoneId });
    }

    const localDate = new Date(chart.date.getTime() + chart.meta.timezone * 3600000);
    return localDate.toLocaleString(locale, { ...options, timeZone: 'UTC' });
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 space-y-4">
        <Show when={natalChart()}>
          <div class="glass rounded-2xl p-4">
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">{text().year}</h3>
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
                {formatSolarReturnText(text().returnDate, { date: formatReturnDate(srChart()) })}
              </p>
            </Show>
          </div>
        </Show>

        <Show when={srChart()}>
          <PlanetTable chart={srChart()} locale={props.locale} />
        </Show>
      </div>

      <div class="lg:col-span-2">
        <Show when={srChart()} fallback={
          <div class="glass rounded-2xl p-8 text-center text-muted">
            <div class="text-5xl mb-3">☀</div>
            <p>{text().selectProfile}</p>
          </div>
        }>
          <div class="glass rounded-2xl p-4">
            <div class="text-center text-sm text-muted mb-2">
              {formatSolarReturnText(text().chartTitle, { year: year(), name: profileName() })}
            </div>
            <div class="w-full max-w-[600px] mx-auto" innerHTML={wheelSvg()} />
          </div>

          {/* Interpretation Panel */}
          <div class="glass rounded-2xl p-6 mt-6">
            <h3 class="text-lg font-serif font-semibold text-cream mb-2">
              {formatSolarReturnText(text().interpretationTitle, { year: year() })}
            </h3>
            <p class="text-xs text-muted mb-5">
              {text().interpretationDescription}
            </p>

            <div class="space-y-4">
              <SRInterpretation chart={srChart()} year={year()} locale={props.locale} />
            </div>
          </div>

          {/* Aspect Grid + Element Table */}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <AspectGrid chart={srChart()} locale={props.locale} />
            <ElementTable chart={srChart()} locale={props.locale} />
          </div>
        </Show>
      </div>
    </div>
  );
}

// ============================================================
// SR Interpretation — Interpretação da Revolução Solar
// ============================================================

function SRInterpretation(props: { chart: any; year: number; locale: Locale }) {
  const text = () => getSolarReturnText(props.locale);
  const interp = () => getInterpretations(props.locale);
  const chart = () => props.chart;
  if (!chart()) return null;

  const ascSign = () => getSignIndex(chart().houses?.ascendant || 0);
  const sunHouse = () => chart().planetHouses?.sun || 1;
  const moonHouse = () => chart().planetHouses?.moon || 1;
  const moonSign = () => getSignIndex(chart().positions?.moon?.longitude || 0);

  return (
    <div class="space-y-5">
      {/* ASC do Retorno */}
      <div class="border-l-4 border-gold/40 pl-4 py-2">
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gold/10 text-gold">
          {text().yearTheme}
        </span>
        <h4 class="text-sm font-semibold text-cream mt-1.5 mb-1">
          {formatSolarReturnText(text().ascendantTitle, { sign: interp().SIGN_NAMES[ascSign()] })}
        </h4>
        <p class="text-sm text-cream-dark leading-relaxed">
          {text().ascInterpretations[ascSign()]}
        </p>
      </div>

      {/* Sol do Retorno */}
      <div class="border-l-4 border-yellow-500/40 pl-4 py-2">
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-yellow-900/20 text-yellow-300">
          {text().mainFocus}
        </span>
        <h4 class="text-sm font-semibold text-cream mt-1.5 mb-1">
          {formatSolarReturnText(text().sunTitle, { house: sunHouse() })}
        </h4>
        <p class="text-sm text-cream-dark leading-relaxed">
          {getSolarReturnSunHouse(props.locale, sunHouse())}
        </p>
      </div>

      {/* Lua do Retorno */}
      <div class="border-l-4 border-blue-500/40 pl-4 py-2">
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-900/20 text-blue-300">
          {text().emotionalNeed}
        </span>
        <h4 class="text-sm font-semibold text-cream mt-1.5 mb-1">
          {formatSolarReturnText(text().moonTitle, { sign: interp().SIGN_NAMES[moonSign()], house: moonHouse() })}
        </h4>
        <p class="text-sm text-cream-dark leading-relaxed">
          {getSolarReturnMoonHouse(props.locale, moonHouse())}
        </p>
      </div>

      {/* CTA */}
      <div class="mt-6 p-4 bg-gold/5 rounded-lg border border-gold/20">
        <p class="text-sm text-gold font-medium">
          {text().ctaTitle}
        </p>
        <p class="text-xs text-muted mt-1">
          {text().ctaDescription}
        </p>
      </div>
    </div>
  );
}
