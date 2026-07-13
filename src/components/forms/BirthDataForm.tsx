import { createSignal, createEffect, Show, For } from 'solid-js';
import type { BirthData, CalculationOptions, HouseSystem, AspectType } from '../../engine/types';
import {
  estimateOffsetFromLongitude,
  formatUtcOffset,
  getEffectiveTimezoneOffset,
  inferTimeZoneId,
  todayDateInput,
} from '../../utils/dateTime';
import { getTranslations, type Locale } from '../../i18n';
import { getBirthFormText } from '../../i18n/birth-form';

export interface ChartOptions extends CalculationOptions {
  nodeType: 'true' | 'mean';
  showVertex: boolean;
  showPartOfFortune: boolean;
  showTransitsToday: boolean;
  orbsPreset: 'default' | 'tight' | 'wide';
}

export const DEFAULT_OPTIONS: ChartOptions = {
  houseSystem: 'placidus',
  includeExtraPoints: true,
  includeAsteroids: false,
  nodeType: 'true',
  showVertex: false,
  showPartOfFortune: false,
  showTransitsToday: false,
  orbsPreset: 'default',
  aspectOrbs: {
    conjunction: 8,
    sextile: 5,
    square: 7,
    trine: 7,
    opposition: 8,
  },
};

const ORBS_PRESETS: Record<string, Record<AspectType, number>> = {
  default: { conjunction: 8, sextile: 5, square: 7, trine: 7, opposition: 8 },
  tight: { conjunction: 6, sextile: 3, square: 5, trine: 5, opposition: 6 },
  wide: { conjunction: 10, sextile: 7, square: 9, trine: 9, opposition: 10 },
};

interface Props {
  onCalculate: (data: BirthData, options?: ChartOptions) => void;
  locale: Locale;
  initialData?: BirthData | null;
}

interface GeoResult {
  name: string;
  lat: number;
  lng: number;
  country: string;
  state?: string;
  timezone: number;
  timeZoneId?: string;
  countryCode?: string;
}

export default function BirthDataForm(props: Props) {
  const t = () => getTranslations(props.locale);
  const text = () => getBirthFormText(props.locale);
  const [name, setName] = createSignal('');
  const [date, setDate] = createSignal('');
  const [time, setTime] = createSignal('12:00');
  const [unknownTime, setUnknownTime] = createSignal(false);
  const [city, setCity] = createSignal('');
  const [searchResults, setSearchResults] = createSignal<GeoResult[]>([]);
  const [selectedCity, setSelectedCity] = createSignal<GeoResult | null>(null);
  const [searching, setSearching] = createSignal(false);
  const [error, setError] = createSignal('');
  const [showAdvanced, setShowAdvanced] = createSignal(false);

  // Populate form when initialData changes (e.g., profile selected)
  createEffect(() => {
    const data = props.initialData;
    if (data) {
      setName(data.name || '');
      setDate(data.date || '');
      setTime(data.time || '12:00');
      setCity(data.city || '');
      setSelectedCity(data.lat ? {
        name: data.city || '',
        lat: data.lat,
        lng: data.lng,
        country: data.country || '',
        timezone: data.timezone,
        timeZoneId: data.timeZoneId,
      } : null);
      setSearchResults([]);
      setError('');
    }
  });

  // Advanced options state
  const [houseSystem, setHouseSystem] = createSignal<HouseSystem>(DEFAULT_OPTIONS.houseSystem!);
  const [includeAsteroids, setIncludeAsteroids] = createSignal(DEFAULT_OPTIONS.includeAsteroids!);
  const [nodeType, setNodeType] = createSignal<'true' | 'mean'>(DEFAULT_OPTIONS.nodeType);
  const [showVertex, setShowVertex] = createSignal(DEFAULT_OPTIONS.showVertex);
  const [showPartOfFortune, setShowPartOfFortune] = createSignal(DEFAULT_OPTIONS.showPartOfFortune);
  const [showTransitsToday, setShowTransitsToday] = createSignal(DEFAULT_OPTIONS.showTransitsToday);
  const [orbsPreset, setOrbsPreset] = createSignal(DEFAULT_OPTIONS.orbsPreset);

  const resetOptions = () => {
    setHouseSystem(DEFAULT_OPTIONS.houseSystem!);
    setIncludeAsteroids(DEFAULT_OPTIONS.includeAsteroids!);
    setNodeType(DEFAULT_OPTIONS.nodeType);
    setShowVertex(DEFAULT_OPTIONS.showVertex);
    setShowPartOfFortune(DEFAULT_OPTIONS.showPartOfFortune);
    setShowTransitsToday(DEFAULT_OPTIONS.showTransitsToday);
    setOrbsPreset(DEFAULT_OPTIONS.orbsPreset);
  };

  const getChartOptions = (): ChartOptions => ({
    houseSystem: houseSystem(),
    includeExtraPoints: true,
    includeAsteroids: includeAsteroids(),
    nodeType: nodeType(),
    showVertex: showVertex(),
    showPartOfFortune: showPartOfFortune(),
    showTransitsToday: showTransitsToday(),
    orbsPreset: orbsPreset(),
    aspectOrbs: ORBS_PRESETS[orbsPreset()],
  });

  let searchTimeout: ReturnType<typeof setTimeout>;

  const handleCityInput = (value: string) => {
    setCity(value);
    setSelectedCity(null);
    clearTimeout(searchTimeout);

    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeout = setTimeout(() => searchCity(value), 400);
  };

  const searchCity = async (query: string) => {
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();

      const results: GeoResult[] = data.map((item: any) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const country = item.address?.country || '';
        const state = item.address?.state || '';
        const countryCode = item.address?.country_code || '';
        const timeZoneId = inferTimeZoneId({ lat, lng, country, state, countryCode });
        const fallbackOffset = estimateOffsetFromLongitude(lng);
        const offset = getEffectiveTimezoneOffset(date() || todayDateInput(timeZoneId), time() || '12:00', fallbackOffset, timeZoneId);

        return {
          name: [item.address?.city || item.address?.town || item.address?.village || item.name, state, country].filter(Boolean).join(', '),
          lat,
          lng,
          country,
          state,
          countryCode,
          timezone: offset,
          timeZoneId,
        };
      });

      setSearchResults(results);
    } catch (e) {
      console.error('Geocoding error:', e);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectCity = (result: GeoResult) => {
    setSelectedCity(result);
    setCity(result.name);
    setSearchResults([]);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setError('');

    if (!date()) { setError(t().onboarding.errorDate); return; }
    if (!unknownTime() && !time()) { setError(t().onboarding.errorTime); return; }
    if (!selectedCity()) { setError(t().onboarding.errorCity); return; }

    const cityData = selectedCity()!;
    const effectiveTimezone = getEffectiveTimezoneOffset(
      date(),
      unknownTime() ? '12:00' : time(),
      cityData.timezone,
      cityData.timeZoneId
    );
    props.onCalculate({
      name: name(),
      date: date(),
      time: unknownTime() ? '12:00' : time(),
      lat: cityData.lat,
      lng: cityData.lng,
      timezone: effectiveTimezone,
      timeZoneId: cityData.timeZoneId,
      city: cityData.name,
      country: cityData.country,
    }, getChartOptions());
  };

  return (
    <form onSubmit={handleSubmit} class="glass rounded-2xl p-6 sm:p-8 shadow-card">
      <h3 class="text-lg font-serif font-bold text-cream mb-6">
        {t().chart.birthData}
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Nome */}
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-cream-dark mb-1.5">{t().chart.name} ({text().optional})</label>
          <input
            type="text"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder={t().onboarding.namePlaceholder}
            class="w-full px-4 py-2.5 rounded-lg border border-base-400 bg-base-200 text-cream placeholder-muted text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-colors"
          />
        </div>

        {/* Data */}
        <div>
          <label class="block text-sm font-medium text-cream-dark mb-1.5">{t().chart.date} *</label>
          <input
            type="date"
            value={date()}
            onInput={(e) => setDate(e.currentTarget.value)}
            required
            class="w-full px-4 py-2.5 rounded-lg border border-base-400 bg-base-200 text-cream text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-colors"
          />
        </div>

        {/* Hora */}
        <div>
          <label class="block text-sm font-medium text-cream-dark mb-1.5">{t().chart.time} *</label>
          <input
            type="time"
            value={time()}
            onInput={(e) => setTime(e.currentTarget.value)}
            required={!unknownTime()}
            disabled={unknownTime()}
            class={`w-full px-4 py-2.5 rounded-lg border border-base-400 bg-base-200 text-cream text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-colors ${unknownTime() ? 'opacity-40 cursor-not-allowed' : ''}`}
          />
          <label class="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={unknownTime()}
              onChange={(e) => setUnknownTime(e.currentTarget.checked)}
              class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold focus:ring-gold/40"
            />
            <span class="text-xs text-muted">{t().onboarding.unknownTime}</span>
          </label>
        </div>

        {/* Cidade */}
        <div class="sm:col-span-2 relative">
          <label class="block text-sm font-medium text-cream-dark mb-1.5">{t().chart.city} *</label>
          <input
            type="text"
            value={city()}
            onInput={(e) => handleCityInput(e.currentTarget.value)}
            placeholder={t().onboarding.cityPlaceholder}
            autocomplete="off"
            class="w-full px-4 py-2.5 rounded-lg border border-base-400 bg-base-200 text-cream placeholder-muted text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-colors"
          />

          {/* Search results dropdown */}
          <Show when={searchResults().length > 0}>
            <div class="absolute z-20 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-dark max-h-48 overflow-y-auto">
              <For each={searchResults()}>
                {(result) => (
                  <button
                    type="button"
                    onClick={() => selectCity(result)}
                    class="w-full text-left px-4 py-2.5 text-sm hover:bg-base-200 text-cream-dark transition-colors"
                  >
                    <div class="font-medium">{result.name}</div>
                    <div class="text-xs text-muted">
                      {result.lat.toFixed(2)}°, {result.lng.toFixed(2)}° | {formatUtcOffset(result.timezone)}
                      {result.timeZoneId ? ` · ${result.timeZoneId}` : ''}
                    </div>
                  </button>
                )}
              </For>
            </div>
          </Show>

          <Show when={searching()}>
            <div class="absolute right-4 top-9 text-xs text-muted">{t().onboarding.searching}</div>
          </Show>

          <Show when={selectedCity()}>
            <div class="mt-1.5 text-xs text-gold">
              ✓ {selectedCity()!.lat.toFixed(4)}°, {selectedCity()!.lng.toFixed(4)}° | {formatUtcOffset(selectedCity()!.timezone)}
              {selectedCity()!.timeZoneId ? ` · ${selectedCity()!.timeZoneId}` : ''}
            </div>
          </Show>
        </div>
      </div>

      {/* Error */}
      <Show when={error()}>
        <div class="mt-4 text-sm text-red-400">{error()}</div>
      </Show>

      {/* Advanced Options Toggle */}
      <div class="mt-6 border-t border-base-300 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced())}
          class="flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors w-full"
        >
          <span class={`transition-transform ${showAdvanced() ? 'rotate-90' : ''}`}>▶</span>
          <span class="font-medium">{text().advanced}</span>
          <span class="text-xs ml-auto opacity-60">
            {houseSystem() !== 'placidus' || includeAsteroids() || orbsPreset() !== 'default' ? `● ${text().customized}` : ''}
          </span>
        </button>

        <Show when={showAdvanced()}>
          <div class="mt-4 space-y-4 animate-fadeIn">
            {/* House System */}
            <div>
              <label class="block text-xs font-medium text-cream-dark mb-1.5">{t().chart.houseSystem}</label>
              <select
                value={houseSystem()}
                onChange={(e) => setHouseSystem(e.currentTarget.value as HouseSystem)}
                class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-200 text-cream text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold/60"
              >
                <option value="placidus">{t().chart.placidus}</option>
                <option value="koch">{t().chart.koch}</option>
                <option value="whole-sign">{t().chart.wholeSign}</option>
                <option value="equal">{t().chart.equal} (Asc)</option>
                <option value="campanus">Campanus</option>
                <option value="regiomontanus">Regiomontanus</option>
              </select>
            </div>

            {/* Asteroids */}
            <div>
              <label class="block text-xs font-medium text-cream-dark mb-1.5">{text().extraBodies}</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAsteroids()}
                    onChange={(e) => setIncludeAsteroids(e.currentTarget.checked)}
                    class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold focus:ring-gold/40"
                  />
                  <span class="text-sm text-cream-dark">{text().asteroids}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVertex()}
                    onChange={(e) => setShowVertex(e.currentTarget.checked)}
                    class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold focus:ring-gold/40"
                  />
                  <span class="text-sm text-cream-dark">Vertex</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPartOfFortune()}
                    onChange={(e) => setShowPartOfFortune(e.currentTarget.checked)}
                    class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold focus:ring-gold/40"
                  />
                  <span class="text-sm text-cream-dark">{text().partOfFortune}</span>
                </label>
              </div>
            </div>

            {/* Show Transits */}
            <div>
              <label class="block text-xs font-medium text-cream-dark mb-1.5">{text().visualization}</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTransitsToday()}
                    onChange={(e) => setShowTransitsToday(e.currentTarget.checked)}
                    class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold focus:ring-gold/40"
                  />
                  <span class="text-sm text-cream-dark">↻ {text().showTodayTransits}</span>
                </label>
                <p class="text-[10px] text-muted pl-6">{text().transitsNote}</p>
              </div>
            </div>

            {/* Node Type */}
            <div>
              <label class="block text-xs font-medium text-cream-dark mb-1.5">{text().lunarNode}</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="nodeType"
                    value="true"
                    checked={nodeType() === 'true'}
                    onChange={() => setNodeType('true')}
                    class="w-4 h-4 border-base-400 bg-base-200 text-gold focus:ring-gold/40"
                  />
                  <span class="text-sm text-cream-dark">{text().trueNode}</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="nodeType"
                    value="mean"
                    checked={nodeType() === 'mean'}
                    onChange={() => setNodeType('mean')}
                    class="w-4 h-4 border-base-400 bg-base-200 text-gold focus:ring-gold/40"
                  />
                  <span class="text-sm text-cream-dark">{text().meanNode}</span>
                </label>
              </div>
            </div>

            {/* Orbs */}
            <div>
              <label class="block text-xs font-medium text-cream-dark mb-1.5">{text().aspectOrbs}</label>
              <select
                value={orbsPreset()}
                onChange={(e) => setOrbsPreset(e.currentTarget.value as 'default' | 'tight' | 'wide')}
                class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-200 text-cream text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold/60"
              >
                <option value="default">{text().presetDefault} (8° ☌ / 7° □△ / 5° ✶)</option>
                <option value="tight">{text().presetTight} (6° ☌ / 5° □△ / 3° ✶)</option>
                <option value="wide">{text().presetWide} (10° ☌ / 9° □△ / 7° ✶)</option>
              </select>
              <p class="mt-1 text-[10px] text-muted">{text().largerOrbs}</p>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={resetOptions}
              class="w-full mt-2 px-3 py-2 text-xs text-muted hover:text-cream border border-base-400 hover:border-gold/40 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>↺</span> {text().reset}
            </button>
          </div>
        </Show>
      </div>

      {/* Submit */}
      <button
        type="submit"
        class="mt-6 w-full px-4 py-3.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-semibold rounded-lg transition-all hover:shadow-gold hover:scale-[1.01] active:scale-[0.99]"
      >
        {t().chart.calculate}
      </button>
    </form>
  );
}
