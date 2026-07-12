import { createSignal, Show, For } from 'solid-js';
import { db } from '../../store/db';
import { getTranslations, type Locale } from '../../i18n';
import {
  estimateOffsetFromLongitude,
  formatUtcOffset,
  getEffectiveTimezoneOffset,
  inferTimeZoneId,
  todayDateInput,
} from '../../utils/dateTime';

interface Props {
  locale: Locale;
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

export default function OnboardingForm(props: Props) {
  const t = () => getTranslations(props.locale);
  const txt = () => t().onboarding;

  const [name, setName] = createSignal('');
  const [date, setDate] = createSignal('');
  const [time, setTime] = createSignal('12:00');
  const [unknownTime, setUnknownTime] = createSignal(false);
  const [gender, setGender] = createSignal<'M' | 'F' | 'O' | ''>('');
  const [city, setCity] = createSignal('');
  const [searchResults, setSearchResults] = createSignal<GeoResult[]>([]);
  const [selectedCity, setSelectedCity] = createSignal<GeoResult | null>(null);
  const [searching, setSearching] = createSignal(false);
  const [error, setError] = createSignal('');
  const [saving, setSaving] = createSignal(false);

  let searchTimeout: ReturnType<typeof setTimeout>;

  const handleCityInput = (value: string) => {
    setCity(value);
    setSelectedCity(null);
    clearTimeout(searchTimeout);
    if (value.length < 3) { setSearchResults([]); return; }
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

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    if (!date()) { setError(txt().errorDate); return; }
    if (!unknownTime() && !time()) { setError(txt().errorTime); return; }
    if (!selectedCity()) { setError(txt().errorCity); return; }

    setSaving(true);
    const cityData = selectedCity()!;
    const birthTime = unknownTime() ? '12:00' : time();
    const effectiveTimezone = getEffectiveTimezoneOffset(date(), birthTime, cityData.timezone, cityData.timeZoneId);

    try {
      await db.profiles.add({
        name: name() || cityData.name.split(',')[0],
        date: date(),
        time: birthTime,
        lat: cityData.lat,
        lng: cityData.lng,
        city: cityData.name,
        country: cityData.country,
        timezone: effectiveTimezone,
        timeZoneId: cityData.timeZoneId,
        gender: gender() as 'M' | 'F' | 'O' | undefined || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Redirect to natal chart
      window.location.href = `${import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}/${props.locale}/chart/natal`;
    } catch (err) {
      console.error('Save error:', err);
      setSaving(false);
    }
  };

  return (
    <div class="min-h-screen flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-lg">
        {/* Header */}
        <div class="text-center mb-10">
          <div class="text-4xl text-gold mb-4">✦</div>
          <h1 class="text-3xl sm:text-4xl font-serif font-bold text-cream">
            {txt().title}
          </h1>
          <p class="mt-3 text-muted text-lg">
            {txt().subtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} class="glass rounded-2xl p-6 sm:p-8 shadow-card space-y-5">
          {/* Nome */}
          <div>
            <label class="block text-sm font-medium text-cream-dark mb-1.5">{txt().name}</label>
            <input
              type="text"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              placeholder={txt().namePlaceholder}
              class="w-full px-4 py-3 rounded-lg border border-base-400 bg-base-200 text-cream placeholder-muted text-base focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-colors"
              autofocus
            />
          </div>

          {/* Data + Hora */}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-cream-dark mb-1.5">{txt().date} *</label>
              <input
                type="date"
                value={date()}
                onInput={(e) => setDate(e.currentTarget.value)}
                required
                class="w-full px-4 py-3 rounded-lg border border-base-400 bg-base-200 text-cream text-base focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-cream-dark mb-1.5">{txt().time} *</label>
              <input
                type="time"
                value={time()}
                onInput={(e) => setTime(e.currentTarget.value)}
                disabled={unknownTime()}
                class={`w-full px-4 py-3 rounded-lg border border-base-400 bg-base-200 text-cream text-base focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-colors ${unknownTime() ? 'opacity-40 cursor-not-allowed' : ''}`}
              />
              <label class="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unknownTime()}
                  onChange={(e) => setUnknownTime(e.currentTarget.checked)}
                  class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold focus:ring-gold/40"
                />
                <span class="text-xs text-muted">{txt().unknownTime}</span>
              </label>
              <Show when={unknownTime()}>
                <p class="text-[11px] text-muted/70 mt-1">{txt().unknownTimeNote}</p>
              </Show>
            </div>
          </div>

          {/* Cidade */}
          <div class="relative">
            <label class="block text-sm font-medium text-cream-dark mb-1.5">{txt().city} *</label>
            <input
              type="text"
              value={city()}
              onInput={(e) => handleCityInput(e.currentTarget.value)}
              placeholder={txt().cityPlaceholder}
              autocomplete="off"
              class="w-full px-4 py-3 rounded-lg border border-base-400 bg-base-200 text-cream placeholder-muted text-base focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-colors"
            />

            <Show when={searchResults().length > 0}>
              <div class="absolute z-20 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-dark max-h-48 overflow-y-auto">
                <For each={searchResults()}>
                  {(result) => (
                    <button
                      type="button"
                      onClick={() => selectCity(result)}
                      class="w-full text-left px-4 py-3 text-sm hover:bg-base-200 text-cream-dark transition-colors"
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
              <div class="absolute right-4 top-10 text-xs text-muted">{txt().searching}</div>
            </Show>

            <Show when={selectedCity()}>
              <div class="mt-1.5 text-xs text-gold">
                ✓ {selectedCity()!.lat.toFixed(4)}°, {selectedCity()!.lng.toFixed(4)}° | {formatUtcOffset(selectedCity()!.timezone)}
                {selectedCity()!.timeZoneId ? ` · ${selectedCity()!.timeZoneId}` : ''}
              </div>
            </Show>
          </div>

          {/* Gender */}
          <div>
            <label class="block text-sm font-medium text-cream-dark mb-1.5">{txt().gender}</label>
            <div class="flex gap-3">
              <For each={['M', 'F', 'O'] as const}>
                {(g) => (
                  <button
                    type="button"
                    onClick={() => setGender(gender() === g ? '' : g)}
                    class={`px-4 py-2 text-sm rounded-lg border transition-all ${
                      gender() === g
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-base-400 bg-base-200 text-muted hover:border-base-300 hover:text-cream-dark'
                    }`}
                  >
                    {g === 'M' ? txt().genderM : g === 'F' ? txt().genderF : txt().genderO}
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* Error */}
          <Show when={error()}>
            <div class="text-sm text-red-400 bg-red-900/10 border border-red-800/30 rounded-lg p-3">{error()}</div>
          </Show>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving()}
            class="w-full px-4 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-bold text-lg rounded-lg transition-all hover:shadow-gold-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {saving() ? '...' : txt().submit}
          </button>

          {/* Privacy note */}
          <p class="text-center text-xs text-muted">
            🔒 {txt().privacy}
          </p>
        </form>
      </div>
    </div>
  );
}
