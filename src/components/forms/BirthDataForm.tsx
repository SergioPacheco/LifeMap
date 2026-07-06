import { createSignal, Show, For } from 'solid-js';
import type { BirthData } from '../../engine/types';

interface Props {
  onCalculate: (data: BirthData) => void;
  locale: string;
}

interface GeoResult {
  name: string;
  lat: number;
  lng: number;
  country: string;
  state?: string;
  timezone: number;
}

export default function BirthDataForm(props: Props) {
  const [name, setName] = createSignal('');
  const [date, setDate] = createSignal('');
  const [time, setTime] = createSignal('12:00');
  const [unknownTime, setUnknownTime] = createSignal(false);
  const [city, setCity] = createSignal('');
  const [searchResults, setSearchResults] = createSignal<GeoResult[]>([]);
  const [selectedCity, setSelectedCity] = createSignal<GeoResult | null>(null);
  const [searching, setSearching] = createSignal(false);
  const [error, setError] = createSignal('');

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

      const results: GeoResult[] = data.map((item: any) => ({
        name: [item.address?.city || item.address?.town || item.address?.village || item.name, item.address?.state, item.address?.country].filter(Boolean).join(', '),
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        country: item.address?.country || '',
        state: item.address?.state || '',
        timezone: estimateTimezone(parseFloat(item.lon)),
      }));

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

    if (!date()) { setError('Informe a data de nascimento'); return; }
    if (!unknownTime() && !time()) { setError('Informe a hora de nascimento'); return; }
    if (!selectedCity()) { setError('Selecione uma cidade da lista'); return; }

    const cityData = selectedCity()!;
    props.onCalculate({
      name: name(),
      date: date(),
      time: unknownTime() ? '12:00' : time(),
      lat: cityData.lat,
      lng: cityData.lng,
      timezone: cityData.timezone,
      city: cityData.name,
      country: cityData.country,
    });
  };

  return (
    <form onSubmit={handleSubmit} class="glass rounded-2xl p-6 sm:p-8 shadow-card">
      <h3 class="text-lg font-serif font-bold text-cream mb-6">
        Dados de Nascimento
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Nome */}
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-cream-dark mb-1.5">Nome (opcional)</label>
          <input
            type="text"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            placeholder="Seu nome"
            class="w-full px-4 py-2.5 rounded-lg border border-base-400 bg-base-200 text-cream placeholder-muted text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-colors"
          />
        </div>

        {/* Data */}
        <div>
          <label class="block text-sm font-medium text-cream-dark mb-1.5">Data *</label>
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
          <label class="block text-sm font-medium text-cream-dark mb-1.5">Hora *</label>
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
            <span class="text-xs text-muted">Não sei a hora exata</span>
          </label>
        </div>

        {/* Cidade */}
        <div class="sm:col-span-2 relative">
          <label class="block text-sm font-medium text-cream-dark mb-1.5">Cidade *</label>
          <input
            type="text"
            value={city()}
            onInput={(e) => handleCityInput(e.currentTarget.value)}
            placeholder="Digite a cidade de nascimento..."
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
                    <div class="text-xs text-muted">{result.lat.toFixed(2)}°, {result.lng.toFixed(2)}° | UTC{result.timezone >= 0 ? '+' : ''}{result.timezone}</div>
                  </button>
                )}
              </For>
            </div>
          </Show>

          <Show when={searching()}>
            <div class="absolute right-4 top-9 text-xs text-muted">Buscando...</div>
          </Show>

          <Show when={selectedCity()}>
            <div class="mt-1.5 text-xs text-gold">
              ✓ {selectedCity()!.lat.toFixed(4)}°, {selectedCity()!.lng.toFixed(4)}° | UTC{selectedCity()!.timezone >= 0 ? '+' : ''}{selectedCity()!.timezone}
            </div>
          </Show>
        </div>
      </div>

      {/* Error */}
      <Show when={error()}>
        <div class="mt-4 text-sm text-red-400">{error()}</div>
      </Show>

      {/* Submit */}
      <button
        type="submit"
        class="mt-6 w-full px-4 py-3.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-semibold rounded-lg transition-all hover:shadow-gold hover:scale-[1.01] active:scale-[0.99]"
      >
        Calcular Mapa Natal
      </button>
    </form>
  );
}

// ============================================================
// HELPERS
// ============================================================

function estimateTimezone(longitude: number): number {
  return Math.round(longitude / 15);
}
