import { createSignal, onMount, Show, For } from 'solid-js';
import PlanetTable from '../chart/PlanetTable';
import { calculateNatalChart, initSweph, getSignIndex } from '../../engine/index';
import { calculateFullHouses, getHouseForLongitude } from '../../engine/houses';
import { renderWheel } from '../../renderer/wheel';
import type { NatalChart } from '../../engine/types';
import type { Locale } from '../../i18n';
import { db, type Profile } from '../../store/db';
import { birthDataFromProfile } from '../../utils/profile';
import { estimateOffsetFromLongitude, formatUtcOffset, getEffectiveTimezoneOffset, inferTimeZoneId, todayDateInput } from '../../utils/dateTime';

// ============================================================
// TYPES
// ============================================================

interface GeoResult {
  name: string;
  lat: number;
  lng: number;
  country: string;
  timezone: number;
  timeZoneId?: string;
}

interface Props {
  locale: Locale;
}

const TEXT = {
  pt: {
    chooseCity: 'Selecione uma cidade da lista para relocar.',
    relocateError: 'Erro ao recalcular as casas. Tente novamente.',
    loadProfileFirst: 'Faça o onboarding para criar um perfil natal primeiro.',
  },
  en: {
    chooseCity: 'Select a city from the list to relocate.',
    relocateError: 'Error recalculating houses. Please try again.',
    loadProfileFirst: 'Complete onboarding to create a natal profile first.',
  },
} as const;

// ============================================================
// CONSTANTS
// ============================================================

const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  northNode: 'Nodo Norte', southNode: 'Nodo Sul', lilith: 'Lilith', chiron: 'Quíron',
};
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', southNode: '☋', lilith: '⚸', chiron: '⚷',
};
const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function RelocatedApp(props: Props) {
  const text = TEXT[props.locale as keyof typeof TEXT] ?? TEXT.en;
  const [natalChart, setNatalChart] = createSignal<NatalChart | null>(null);
  const [relocatedChart, setRelocatedChart] = createSignal<NatalChart | null>(null);
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [profileName, setProfileName] = createSignal('');
  const [natalCity, setNatalCity] = createSignal('');

  // City search
  const [cityQuery, setCityQuery] = createSignal('');
  const [searchResults, setSearchResults] = createSignal<GeoResult[]>([]);
  const [selectedCity, setSelectedCity] = createSignal<GeoResult | null>(null);
  const [searching, setSearching] = createSignal(false);

  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  let searchTimeout: ReturnType<typeof setTimeout>;

  // ─── Init ───────────────────────────────────────────────
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

  // ─── Load natal profile ──────────────────────────────────
  const handleProfileSelect = (profile: Profile) => {
    const chart = calculateNatalChart(birthDataFromProfile(profile));
    setNatalChart(chart);
    setProfileName(profile.name);
    setNatalCity(profile.city || '');

    // Reset relocation
    setRelocatedChart(null);
    setWheelSvg('');
    setSelectedCity(null);
    setCityQuery('');
    setSearchResults([]);
    setError('');
  };

  // ─── City search ─────────────────────────────────────────
  const handleCityInput = (value: string) => {
    setCityQuery(value);
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

        return {
          name: [
            item.address?.city || item.address?.town || item.address?.village || item.name,
            state,
            country,
          ].filter(Boolean).join(', '),
          lat,
          lng,
          country,
          timezone: getEffectiveTimezoneOffset(todayDateInput(timeZoneId), '12:00', fallbackOffset, timeZoneId),
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
    setCityQuery(result.name);
    setSearchResults([]);
  };

  // ─── Recalculate houses ───────────────────────────────────
  const handleRelocate = () => {
    const natal = natalChart();
    const city = selectedCity();
    if (!natal || !city) {
        setError(text.chooseCity);
      return;
    }
    setLoading(true);
    setError('');

    try {
      const houseSystem = natal.meta.houseSystem;
      const newHouses = calculateFullHouses(natal.date, city.lat, city.lng, houseSystem);

      // Recalculate planet houses with new cusps
      const newPlanetHouses: Record<string, number> = {};
      for (const [planet, pos] of Object.entries(natal.positions)) {
        newPlanetHouses[planet] = getHouseForLongitude(pos.longitude, newHouses.cusps);
      }

      // Build relocated chart — same planets, new houses
      const relocated: NatalChart = {
        ...natal,
        houses: newHouses,
        planetHouses: newPlanetHouses,
        meta: {
          ...natal.meta,
          city: city.name,
          lat: city.lat,
          lng: city.lng,
        },
      };

      setRelocatedChart(relocated);
      setWheelSvg(renderWheel(relocated));
    } catch (e) {
      console.error('Relocation error:', e);
      setError(text.relocateError);
    } finally {
      setLoading(false);
    }
  };

  // ─── Comparison helpers ───────────────────────────────────
  const getChangedPlanets = () => {
    const natal = natalChart();
    const reloc = relocatedChart();
    if (!natal || !reloc) return [];

    const changes: Array<{ planet: string; natalHouse: number; relocHouse: number }> = [];
    for (const planet of Object.keys(natal.planetHouses)) {
      const natalH = natal.planetHouses[planet];
      const relocH = reloc.planetHouses[planet];
      if (natalH !== relocH) {
        changes.push({ planet, natalHouse: natalH, relocHouse: relocH });
      }
    }
    return changes;
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ─── Left Panel ─────────────────────────── */}
      <div class="lg:col-span-1 space-y-4">

        {/* Profile info */}
        <Show when={natalChart()} fallback={
          <div class="glass rounded-2xl p-6 text-center text-muted">
            <div class="text-4xl mb-3">📍</div>
            <p class="text-sm">{text.loadProfileFirst}</p>
          </div>
        }>
          <div class="glass rounded-2xl p-4 border border-base-300">
            <div class="text-[10px] uppercase tracking-wider text-muted font-semibold mb-2">Mapa Base</div>
            <div class="text-sm font-semibold text-cream">{profileName() || 'Perfil'}</div>
            <div class="text-xs text-muted mt-0.5">{natalCity() || 'Cidade natal não informada'}</div>
          </div>
        </Show>

        {/* City search */}
        <Show when={natalChart()}>
          <div class="glass rounded-2xl p-5 border border-base-300">
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-4">
              📍 Nova Localização
            </h3>

            <div class="relative">
              <label class="block text-xs font-medium text-cream-dark mb-1.5">Buscar cidade</label>
              <input
                type="text"
                value={cityQuery()}
                onInput={(e) => handleCityInput(e.currentTarget.value)}
                placeholder="Digite o nome da cidade..."
                autocomplete="off"
                class="w-full px-4 py-2.5 rounded-lg border border-base-400 bg-base-200 text-cream placeholder-muted text-sm focus:ring-2 focus:ring-gold/40 focus:border-gold/60 transition-colors"
              />

              {/* Searching indicator */}
              <Show when={searching()}>
                <div class="absolute right-3 top-9 text-xs text-muted animate-pulse">Buscando...</div>
              </Show>

              {/* Dropdown results */}
              <Show when={searchResults().length > 0}>
                <div class="absolute z-20 w-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-dark max-h-48 overflow-y-auto">
                  <For each={searchResults()}>
                    {(result) => (
                      <button
                        type="button"
                        onClick={() => selectCity(result)}
                        class="w-full text-left px-4 py-2.5 text-sm hover:bg-base-200 text-cream-dark transition-colors border-b border-base-300/30 last:border-0"
                      >
                        <div class="font-medium">{result.name}</div>
                        <div class="text-xs text-muted">
                          {result.lat.toFixed(2)}°, {result.lng.toFixed(2)}° | {formatUtcOffset(result.timezone)}
                        </div>
                      </button>
                    )}
                  </For>
                </div>
              </Show>

              {/* Selected city confirmation */}
              <Show when={selectedCity()}>
                <div class="mt-1.5 text-xs text-gold">
                  ✓ {selectedCity()!.lat.toFixed(4)}°, {selectedCity()!.lng.toFixed(4)}° | {formatUtcOffset(selectedCity()!.timezone)}
                </div>
              </Show>
            </div>

            {/* Error */}
            <Show when={error()}>
              <div class="mt-3 text-xs text-red-400">{error()}</div>
            </Show>

            {/* Calculate button */}
            <button
              onClick={handleRelocate}
              disabled={!selectedCity() || loading()}
              class="mt-4 w-full px-4 py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-semibold rounded-lg transition-all hover:shadow-gold hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
            >
              <Show when={loading()} fallback="Recalcular Casas">
                <span class="flex items-center justify-center gap-2">
                  <span class="animate-spin">✦</span> Calculando...
                </span>
              </Show>
            </button>
          </div>

          {/* Planet table for relocated */}
          <Show when={relocatedChart()}>
            <PlanetTable chart={relocatedChart()} locale={props.locale} />
          </Show>
        </Show>
      </div>

      {/* ─── Right Panel ─────────────────────────── */}
      <div class="lg:col-span-2 space-y-6">

        {/* Empty state — waiting for selection */}
        <Show when={!relocatedChart() && natalChart()}>
          <div class="glass rounded-2xl p-12 text-center border border-base-300">
            <div class="text-5xl mb-4">🌍</div>
            <h3 class="text-lg font-serif font-semibold text-cream mb-2">Onde você estaria?</h3>
            <p class="text-sm text-muted max-w-md mx-auto leading-relaxed">
              Selecione uma cidade no painel esquerdo para ver como suas casas mudariam se você tivesse nascido lá.
            </p>
          </div>
        </Show>

        {/* Relocated wheel */}
        <Show when={relocatedChart() && wheelSvg()}>
          <div class="glass rounded-2xl p-4 border border-base-300">
            <div class="text-center text-sm text-muted mb-3">
              Mapa Relocado — <strong class="text-cream">{relocatedChart()!.meta.city}</strong>
              <span class="text-xs ml-2 opacity-60">
                ({relocatedChart()!.meta.lat.toFixed(2)}°, {relocatedChart()!.meta.lng.toFixed(2)}°)
              </span>
            </div>
            <div class="w-full max-w-[600px] mx-auto" innerHTML={wheelSvg()} />
          </div>
        </Show>

        {/* House comparison */}
        <Show when={relocatedChart()}>
          <HouseComparison
            natal={natalChart()!}
            relocated={relocatedChart()!}
            changes={getChangedPlanets()}
          />
        </Show>

        {/* Tips */}
        <Show when={relocatedChart()}>
          <div class="glass rounded-xl p-5 border border-base-300">
            <h3 class="text-sm font-semibold text-cream mb-2 flex items-center gap-2">
              <span class="text-gold">💡</span> Como ler o Mapa Relocado
            </h3>
            <ul class="space-y-1.5 text-xs text-cream-dark">
              <li>• Planetas que <strong class="text-cream">se movem para casa 1, 7, 10</strong> ficam mais visíveis e expressivos nesse local</li>
              <li>• Sol na Casa 10 em uma cidade = local favorável para <strong class="text-cream">carreira e reconhecimento</strong></li>
              <li>• Lua na Casa 4 = cidade que te dá <strong class="text-cream">sensação de lar</strong></li>
              <li>• Júpiter na Casa 2 ou 8 = local favorável para <strong class="text-cream">finanças</strong></li>
              <li>• Saturno angular (casas 1, 4, 7, 10) = local que <strong class="text-cream">desafia e fortalece</strong></li>
            </ul>
          </div>
        </Show>
      </div>
    </div>
  );
}

// ============================================================
// HOUSE COMPARISON PANEL
// ============================================================

interface ComparisonProps {
  natal: NatalChart;
  relocated: NatalChart;
  changes: Array<{ planet: string; natalHouse: number; relocHouse: number }>;
}

function HouseComparison(props: ComparisonProps) {
  const allPlanets = () => Object.keys(props.natal.planetHouses).filter(p => PLANET_NAMES[p]);

  return (
    <div class="glass rounded-2xl p-5 border border-base-300">
      <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-4 flex items-center gap-2">
        <span class="text-gold">⇄</span> Comparação de Casas
      </h3>

      {/* Summary of changes */}
      <Show when={props.changes.length > 0} fallback={
        <div class="text-center py-4 text-sm text-muted">
          Nenhuma casa mudou. As localizações são astrologicamente similares.
        </div>
      }>
        <div class="mb-4 p-3 bg-gold/5 rounded-lg border border-gold/20">
          <div class="text-xs text-gold font-medium mb-1">
            {props.changes.length} planeta{props.changes.length !== 1 ? 's mudaram' : ' mudou'} de casa
          </div>
          <div class="text-xs text-muted">
            Planetas que mudaram: {props.changes.map(c => PLANET_SYMBOLS[c.planet] || c.planet).join(' ')}
          </div>
        </div>
      </Show>

      {/* Full table */}
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-base-300">
            <th class="text-left py-2 text-muted uppercase font-semibold">Planeta</th>
            <th class="text-center py-2 text-muted uppercase font-semibold">Natal</th>
            <th class="text-center py-2 text-muted uppercase font-semibold">Relocado</th>
            <th class="text-left py-2 text-muted uppercase font-semibold">Mudança</th>
          </tr>
        </thead>
        <tbody>
          <For each={allPlanets()}>
            {(planet) => {
              const natalH = props.natal.planetHouses[planet];
              const relocH = props.relocated.planetHouses[planet];
              const changed = natalH !== relocH;

              return (
                <tr class={`border-b border-base-300/40 transition-colors ${changed ? 'bg-gold/5' : 'hover:bg-base-200/30'}`}>
                  <td class="py-2 font-medium text-cream">
                    <span class="mr-1">{PLANET_SYMBOLS[planet]}</span>
                    {PLANET_NAMES[planet]}
                  </td>
                  <td class="py-2 text-center text-muted">{natalH}</td>
                  <td class={`py-2 text-center font-semibold ${changed ? 'text-gold' : 'text-muted'}`}>
                    {relocH}
                  </td>
                  <td class="py-2">
                    <Show when={changed}>
                      <span class="text-gold text-[10px]">
                        Casa {natalH} → Casa {relocH}
                      </span>
                    </Show>
                  </td>
                </tr>
              );
            }}
          </For>
        </tbody>
      </table>

      {/* Notable changes narrative */}
      <Show when={props.changes.length > 0}>
        <div class="mt-4 space-y-2">
          <div class="text-[10px] uppercase text-muted font-semibold tracking-wider mb-2">Destaques</div>
          <For each={props.changes}>
            {(change) => (
              <div class="flex items-start gap-2 text-xs text-cream-dark leading-relaxed">
                <span class="text-gold mt-0.5 flex-shrink-0">
                  {PLANET_SYMBOLS[change.planet]}
                </span>
                <span>
                  <strong class="text-cream">No natal: {PLANET_NAMES[change.planet]} Casa {change.natalHouse}</strong>
                  {' → '}
                  <strong class="text-gold">Relocado: {PLANET_NAMES[change.planet]} Casa {change.relocHouse}</strong>
                </span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
