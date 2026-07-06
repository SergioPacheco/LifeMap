import { createSignal, createEffect, Show, For } from 'solid-js';
import type { BirthData, CalculationOptions, HouseSystem, AspectType } from '../../engine/types';

export interface ChartOptions extends CalculationOptions {
  nodeType: 'true' | 'mean';
  showVertex: boolean;
  showPartOfFortune: boolean;
  orbsPreset: 'default' | 'tight' | 'wide';
}

export const DEFAULT_OPTIONS: ChartOptions = {
  houseSystem: 'placidus',
  includeExtraPoints: true,
  includeAsteroids: false,
  nodeType: 'true',
  showVertex: false,
  showPartOfFortune: false,
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
  locale: string;
  initialData?: BirthData | null;
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
  const [orbsPreset, setOrbsPreset] = createSignal(DEFAULT_OPTIONS.orbsPreset);

  const resetOptions = () => {
    setHouseSystem(DEFAULT_OPTIONS.houseSystem!);
    setIncludeAsteroids(DEFAULT_OPTIONS.includeAsteroids!);
    setNodeType(DEFAULT_OPTIONS.nodeType);
    setShowVertex(DEFAULT_OPTIONS.showVertex);
    setShowPartOfFortune(DEFAULT_OPTIONS.showPartOfFortune);
    setOrbsPreset(DEFAULT_OPTIONS.orbsPreset);
  };

  const getChartOptions = (): ChartOptions => ({
    houseSystem: houseSystem(),
    includeExtraPoints: true,
    includeAsteroids: includeAsteroids(),
    nodeType: nodeType(),
    showVertex: showVertex(),
    showPartOfFortune: showPartOfFortune(),
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
    }, getChartOptions());
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

      {/* Advanced Options Toggle */}
      <div class="mt-6 border-t border-base-300 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced())}
          class="flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors w-full"
        >
          <span class={`transition-transform ${showAdvanced() ? 'rotate-90' : ''}`}>▶</span>
          <span class="font-medium">Seleção Estendida</span>
          <span class="text-xs ml-auto opacity-60">
            {houseSystem() !== 'placidus' || includeAsteroids() || orbsPreset() !== 'default' ? '● Customizado' : ''}
          </span>
        </button>

        <Show when={showAdvanced()}>
          <div class="mt-4 space-y-4 animate-fadeIn">
            {/* House System */}
            <div>
              <label class="block text-xs font-medium text-cream-dark mb-1.5">Sistema de Casas</label>
              <select
                value={houseSystem()}
                onChange={(e) => setHouseSystem(e.currentTarget.value as HouseSystem)}
                class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-200 text-cream text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold/60"
              >
                <option value="placidus">Plácido</option>
                <option value="koch">Koch</option>
                <option value="whole-sign">Signos Inteiros</option>
                <option value="equal">Casas Iguais (Asc)</option>
                <option value="campanus">Campanus</option>
                <option value="regiomontanus">Regiomontanus</option>
              </select>
            </div>

            {/* Asteroids */}
            <div>
              <label class="block text-xs font-medium text-cream-dark mb-1.5">Corpos Extras</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAsteroids()}
                    onChange={(e) => setIncludeAsteroids(e.currentTarget.checked)}
                    class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold focus:ring-gold/40"
                  />
                  <span class="text-sm text-cream-dark">Asteroides (Ceres, Vesta, Pallas, Juno)</span>
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
                  <span class="text-sm text-cream-dark">Parte da Fortuna</span>
                </label>
              </div>
            </div>

            {/* Node Type */}
            <div>
              <label class="block text-xs font-medium text-cream-dark mb-1.5">Nodo Lunar</label>
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
                  <span class="text-sm text-cream-dark">Nodo Verdadeiro</span>
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
                  <span class="text-sm text-cream-dark">Nodo Médio</span>
                </label>
              </div>
            </div>

            {/* Orbs */}
            <div>
              <label class="block text-xs font-medium text-cream-dark mb-1.5">Orbes de Aspecto</label>
              <select
                value={orbsPreset()}
                onChange={(e) => setOrbsPreset(e.currentTarget.value as 'default' | 'tight' | 'wide')}
                class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-200 text-cream text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold/60"
              >
                <option value="default">Padrão (8° conj / 7° □△ / 5° ✶)</option>
                <option value="tight">Apertado (6° conj / 5° □△ / 3° ✶)</option>
                <option value="wide">Largo (10° conj / 9° □△ / 7° ✶)</option>
              </select>
              <p class="mt-1 text-[10px] text-muted">Orbes maiores = mais aspectos detectados</p>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={resetOptions}
              class="w-full mt-2 px-3 py-2 text-xs text-muted hover:text-cream border border-base-400 hover:border-gold/40 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>↺</span> Resetar para configuração padrão
            </button>
          </div>
        </Show>
      </div>

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
