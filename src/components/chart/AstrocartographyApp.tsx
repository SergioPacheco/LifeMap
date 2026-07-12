// ============================================================
// ASTROCARTOGRAPHY APP — Simplified City Analysis
// Shows which cities activate beneficial/challenging planets
// ============================================================

import { createSignal, onMount, For, Show, createMemo } from 'solid-js';
import { initSweph } from '../../engine/index';
import { calculateFullHouses } from '../../engine/houses';
import { buildUTCDate, calculatePositions } from '../../engine/calculations';
import { db, type Profile } from '../../store/db';

// ============================================================
// CONSTANTS
// ============================================================

const CITIES = [
  { name: 'Nova York',     lat: 40.71,   lng: -74.01,  flag: '🗽', country: 'EUA' },
  { name: 'Londres',       lat: 51.51,   lng: -0.13,   flag: '🇬🇧', country: 'Reino Unido' },
  { name: 'Paris',         lat: 48.86,   lng: 2.35,    flag: '🗼', country: 'França' },
  { name: 'Tóquio',        lat: 35.68,   lng: 139.69,  flag: '🏯', country: 'Japão' },
  { name: 'Sydney',        lat: -33.87,  lng: 151.21,  flag: '🦘', country: 'Austrália' },
  { name: 'Berlim',        lat: 52.52,   lng: 13.40,   flag: '🇩🇪', country: 'Alemanha' },
  { name: 'Roma',          lat: 41.90,   lng: 12.49,   flag: '🏛️', country: 'Itália' },
  { name: 'Madrid',        lat: 40.42,   lng: -3.70,   flag: '🇪🇸', country: 'Espanha' },
  { name: 'Buenos Aires',  lat: -34.60,  lng: -58.38,  flag: '🇦🇷', country: 'Argentina' },
  { name: 'São Paulo',     lat: -23.55,  lng: -46.63,  flag: '🇧🇷', country: 'Brasil' },
  { name: 'Cidade do México', lat: 19.43, lng: -99.13, flag: '🌮', country: 'México' },
  { name: 'Dubai',         lat: 25.20,   lng: 55.27,   flag: '🏙️', country: 'Emirados' },
  { name: 'Mumbai',        lat: 19.08,   lng: 72.88,   flag: '🇮🇳', country: 'Índia' },
  { name: 'Bangkok',       lat: 13.75,   lng: 100.52,  flag: '🇹🇭', country: 'Tailândia' },
  { name: 'Toronto',       lat: 43.65,   lng: -79.38,  flag: '🍁', country: 'Canadá' },
  { name: 'Lisboa',        lat: 38.72,   lng: -9.14,   flag: '🇵🇹', country: 'Portugal' },
  { name: 'Amsterdã',      lat: 52.37,   lng: 4.90,    flag: '🌷', country: 'Holanda' },
  { name: 'Cairo',         lat: 30.04,   lng: 31.24,   flag: '🏺', country: 'Egito' },
  { name: 'Cidade do Cabo', lat: -33.93, lng: 18.42,   flag: '🦁', country: 'África do Sul' },
  { name: 'Singapura',     lat: 1.35,    lng: 103.82,  flag: '🇸🇬', country: 'Singapura' },
];

const PLANET_SYMBOLS: Record<string, string> = {
  sun:     '☉',
  moon:    '☽',
  mercury: '☿',
  venus:   '♀',
  mars:    '♂',
  jupiter: '♃',
  saturn:  '♄',
  uranus:  '♅',
  neptune: '♆',
  pluto:   '♇',
  chiron:  '⚷',
};

const PLANET_NAMES: Record<string, string> = {
  sun:     'Sol',
  moon:    'Lua',
  mercury: 'Mercúrio',
  venus:   'Vênus',
  mars:    'Marte',
  jupiter: 'Júpiter',
  saturn:  'Saturno',
  uranus:  'Urano',
  neptune: 'Netuno',
  pluto:   'Plutão',
  chiron:  'Quíron',
};

const BENEFICS = new Set(['sun', 'moon', 'venus', 'jupiter']);
const MALEFICS = new Set(['saturn', 'pluto', 'mars']);
const ANGULAR_HOUSES = new Set([1, 4, 7, 10]);
const ORB = 5; // degrees from cusp

// House theme descriptions
const ANGULAR_MEANINGS: Record<number, string> = {
  1: 'Casa 1 — Identidade, presença, começos',
  4: 'Casa 4 — Lar, raízes, vida privada',
  7: 'Casa 7 — Parcerias, contratos, outros',
  10: 'Casa 10 — Carreira, reputação, público',
};

// ============================================================
// TYPES
// ============================================================

interface AngularPlanet {
  planet: string;
  house: number;
  degreesFromCusp: number;
}

interface CityResult {
  city: typeof CITIES[0];
  angularPlanets: AngularPlanet[];
  beneficsAngular: string[];
  maleficsAngular: string[];
  score: number;
  category: 'favorable' | 'challenging' | 'mixed' | 'neutral';
}

// ============================================================
// CALCULATION HELPERS
// ============================================================

/**
 * Angular distance between two longitudes (0-180)
 */
function angularDist(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * Check if a planet longitude is within ORB of a house cusp
 */
function isNearCusp(planetLon: number, cusp: number, orb: number): boolean {
  return angularDist(planetLon, cusp) <= orb;
}

/**
 * Calculate which planets are angular for a given city/birth time
 */
function getAngularPlanets(
  positions: Record<string, { longitude: number }>,
  cusps: number[]
): AngularPlanet[] {
  const result: AngularPlanet[] = [];

  for (const [planet, pos] of Object.entries(positions)) {
    if (!PLANET_SYMBOLS[planet]) continue; // skip unknown

    for (const house of [1, 4, 7, 10] as const) {
      const cuspIndex = house - 1;
      const cuspLon = cusps[cuspIndex];
      const dist = angularDist(pos.longitude, cuspLon);
      if (dist <= ORB) {
        result.push({ planet, house, degreesFromCusp: dist });
        break; // a planet can only be near one angular cusp
      }
    }
  }

  return result;
}

/**
 * Classify a city result based on which planets are angular
 */
function classifyCity(angularPlanets: AngularPlanet[]): Pick<CityResult, 'beneficsAngular' | 'maleficsAngular' | 'score' | 'category'> {
  const beneficsAngular = angularPlanets
    .filter(p => BENEFICS.has(p.planet))
    .map(p => p.planet);
  const maleficsAngular = angularPlanets
    .filter(p => MALEFICS.has(p.planet))
    .map(p => p.planet);

  // Scoring: benefics +2, malefics -2, others 0
  const score = beneficsAngular.length * 2 - maleficsAngular.length * 2;

  let category: CityResult['category'] = 'neutral';
  if (beneficsAngular.length > 0 && maleficsAngular.length === 0) category = 'favorable';
  else if (maleficsAngular.length > 0 && beneficsAngular.length === 0) category = 'challenging';
  else if (beneficsAngular.length > 0 && maleficsAngular.length > 0) category = 'mixed';

  return { beneficsAngular, maleficsAngular, score, category };
}

// ============================================================
// COMPONENT
// ============================================================

export default function AstrocartographyApp() {
  const [profile, setProfile] = createSignal<Profile | null>(null);
  const [cityResults, setCityResults] = createSignal<CityResult[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [filterCategory, setFilterCategory] = createSignal<'all' | 'favorable' | 'challenging' | 'mixed'>('all');
  const [searchQuery, setSearchQuery] = createSignal('');
  const [customCity, setCustomCity] = createSignal('');
  const [customResults, setCustomResults] = createSignal<CityResult[]>([]);
  const [searchLoading, setSearchLoading] = createSignal(false);
  const [searchError, setSearchError] = createSignal('');

  onMount(async () => {
    await initSweph();
    try {
      const profiles = await db.profiles.orderBy('id').reverse().limit(1).toArray();
      if (profiles.length > 0) loadProfile(profiles[0]);
    } catch {}
    window.addEventListener('lifemap:profile-change', (e: any) => {
      if (e.detail) loadProfile(e.detail);
    });
  });

  const loadProfile = (p: Profile) => {
    setProfile(p);
    setError('');
    calculateAllCities(p);
  };

  const calculateAllCities = (p: Profile) => {
    setLoading(true);
    try {
      const utcDate = buildUTCDate(p.date, p.time, p.timezone, p.timeZoneId);
      const positions = calculatePositions(utcDate);

      const results: CityResult[] = CITIES.map(city => {
        const houses = calculateFullHouses(utcDate, city.lat, city.lng, 'placidus');
        const angularPlanets = getAngularPlanets(positions, houses.cusps);
        const { beneficsAngular, maleficsAngular, score, category } = classifyCity(angularPlanets);
        return { city, angularPlanets, beneficsAngular, maleficsAngular, score, category };
      });

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);
      setCityResults(results);
    } catch (e) {
      console.error(e);
      setError('Erro ao calcular posições. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const searchCustomCity = async () => {
    const query = customCity().trim();
    if (!query || !profile()) return;
    setSearchLoading(true);
    setSearchError('');
    setCustomResults([]);

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=3`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'pt' } });
      const data = await res.json();

      if (!data || data.length === 0) {
        setSearchError('Cidade não encontrada. Tente outro nome.');
        return;
      }

      const p = profile()!;
      const utcDate = buildUTCDate(p.date, p.time, p.timezone, p.timeZoneId);
      const positions = calculatePositions(utcDate);

      const results: CityResult[] = data.slice(0, 3).map((place: any) => {
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        const cityData = {
          name: place.display_name.split(',')[0],
          lat,
          lng,
          flag: '📍',
          country: place.display_name.split(',').slice(-1)[0].trim(),
        };
        const houses = calculateFullHouses(utcDate, lat, lng, 'placidus');
        const angularPlanets = getAngularPlanets(positions, houses.cusps);
        const { beneficsAngular, maleficsAngular, score, category } = classifyCity(angularPlanets);
        return { city: cityData, angularPlanets, beneficsAngular, maleficsAngular, score, category };
      });

      setCustomResults(results);
    } catch {
      setSearchError('Erro ao buscar cidade. Verifique a conexão.');
    } finally {
      setSearchLoading(false);
    }
  };

  const filteredResults = createMemo(() => {
    let results = cityResults();
    const cat = filterCategory();
    const q = searchQuery().toLowerCase().trim();

    if (cat !== 'all') results = results.filter(r => r.category === cat);
    if (q) results = results.filter(r => r.city.name.toLowerCase().includes(q));
    return results;
  });

  const counts = createMemo(() => {
    const all = cityResults();
    return {
      favorable: all.filter(r => r.category === 'favorable').length,
      challenging: all.filter(r => r.category === 'challenging').length,
      mixed: all.filter(r => r.category === 'mixed').length,
      neutral: all.filter(r => r.category === 'neutral').length,
    };
  });

  return (
    <div class="space-y-6">
      {/* No profile state */}
      <Show when={!profile() && !loading()}>
        <div class="glass rounded-2xl p-12 text-center">
          <div class="text-5xl mb-4">🗺️</div>
          <h2 class="text-xl font-serif text-cream mb-2">Nenhum perfil encontrado</h2>
          <p class="text-muted text-sm mb-4">Crie um perfil com seus dados de nascimento para ver a análise de cidades.</p>
          <a href="../chart/natal" class="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 text-gold rounded-lg text-sm hover:bg-gold/30 transition-colors">
            ✦ Criar perfil
          </a>
        </div>
      </Show>

      {/* Loading */}
      <Show when={loading()}>
        <div class="glass rounded-2xl p-12 text-center">
          <div class="animate-spin text-4xl text-gold mb-3">✦</div>
          <p class="text-muted text-sm">Calculando posições para 20 cidades...</p>
        </div>
      </Show>

      {/* Error */}
      <Show when={error()}>
        <div class="p-4 bg-red-900/20 border border-red-800/30 rounded-xl text-sm text-red-400">
          {error()}
        </div>
      </Show>

      {/* Main content */}
      <Show when={profile() && !loading() && cityResults().length > 0}>
        {/* Profile indicator */}
        <div class="glass rounded-xl p-4 flex items-center gap-3">
          <span class="text-2xl">🗺️</span>
          <div>
            <p class="text-xs text-muted uppercase tracking-wider">Mapa natal de</p>
            <p class="text-cream font-semibold">{profile()?.name}</p>
          </div>
          <div class="ml-auto text-xs text-muted">
            {profile()?.date} — {profile()?.city}
          </div>
        </div>

        {/* Legend */}
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="glass rounded-xl p-3 border border-emerald-500/20 text-center">
            <div class="text-2xl font-bold text-emerald-400">{counts().favorable}</div>
            <div class="text-xs text-muted mt-1">Favoráveis</div>
            <div class="text-[10px] text-emerald-500 mt-0.5">♃♀☉☽ angulares</div>
          </div>
          <div class="glass rounded-xl p-3 border border-red-500/20 text-center">
            <div class="text-2xl font-bold text-red-400">{counts().challenging}</div>
            <div class="text-xs text-muted mt-1">Desafiadoras</div>
            <div class="text-[10px] text-red-500 mt-0.5">♄♇♂ angulares</div>
          </div>
          <div class="glass rounded-xl p-3 border border-amber-500/20 text-center">
            <div class="text-2xl font-bold text-amber-400">{counts().mixed}</div>
            <div class="text-xs text-muted mt-1">Mistas</div>
            <div class="text-[10px] text-amber-500 mt-0.5">benéficos + maléficos</div>
          </div>
          <div class="glass rounded-xl p-3 border border-base-400/20 text-center">
            <div class="text-2xl font-bold text-muted">{counts().neutral}</div>
            <div class="text-xs text-muted mt-1">Neutras</div>
            <div class="text-[10px] text-muted mt-0.5">outros planetas</div>
          </div>
        </div>

        {/* Filters */}
        <div class="flex flex-wrap gap-2 items-center">
          <div class="flex gap-1.5 flex-wrap">
            {(['all', 'favorable', 'challenging', 'mixed'] as const).map(cat => (
              <button
                onClick={() => setFilterCategory(cat)}
                class={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  filterCategory() === cat
                    ? cat === 'favorable' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : cat === 'challenging' ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : cat === 'mixed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-gold/20 text-gold border border-gold/40'
                    : 'bg-base-200 text-muted border border-base-300 hover:text-cream'
                }`}
              >
                {cat === 'all' ? 'Todas' : cat === 'favorable' ? '✅ Favoráveis' : cat === 'challenging' ? '⚠️ Desafiadoras' : '⚡ Mistas'}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Filtrar por cidade..."
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            class="ml-auto px-3 py-1.5 text-xs rounded-lg bg-base-200 border border-base-300 text-cream placeholder-muted focus:outline-none focus:border-gold/40"
          />
        </div>

        {/* City Grid */}
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <For each={filteredResults()}>
            {(result) => <CityCard result={result} />}
          </For>
        </div>

        <Show when={filteredResults().length === 0}>
          <div class="text-center py-8 text-muted text-sm">
            Nenhuma cidade encontrada com os filtros selecionados.
          </div>
        </Show>

        {/* Custom City Search */}
        <div class="glass rounded-2xl p-6 border border-gold/10">
          <h3 class="text-sm font-semibold text-cream mb-1 flex items-center gap-2">
            <span>📍</span> Buscar Cidade Personalizada
          </h3>
          <p class="text-xs text-muted mb-4">
            Busque qualquer cidade do mundo para ver como seu mapa se expressa lá.
          </p>
          <div class="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Florianópolis, Lisboa, Bali..."
              value={customCity()}
              onInput={(e) => setCustomCity(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCustomCity()}
              class="flex-1 px-3 py-2 text-sm rounded-lg bg-base-200 border border-base-300 text-cream placeholder-muted focus:outline-none focus:border-gold/40"
            />
            <button
              onClick={searchCustomCity}
              disabled={searchLoading() || !customCity().trim()}
              class="px-4 py-2 text-sm bg-gold/20 text-gold rounded-lg font-medium hover:bg-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searchLoading() ? '...' : 'Buscar'}
            </button>
          </div>
          <Show when={searchError()}>
            <p class="text-xs text-red-400 mt-2">{searchError()}</p>
          </Show>

          <Show when={customResults().length > 0}>
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <For each={customResults()}>
                {(result) => <CityCard result={result} />}
              </For>
            </div>
          </Show>
        </div>

        {/* Methodology note */}
        <div class="glass rounded-xl p-4 border border-base-300">
          <p class="text-xs text-muted leading-relaxed">
            <strong class="text-cream">Metodologia:</strong> Para cada cidade, as cúspides das casas são recalculadas mantendo o mesmo horário de nascimento.
            Planetas com ±{ORB}° de uma cúspide angular (casas 1, 4, 7, 10) são considerados angulares.
            <strong class="text-cream"> Favoráveis</strong> = Júpiter, Vênus, Sol ou Lua angulares (sem maléficos).
            <strong class="text-cream"> Desafiadoras</strong> = Saturno, Plutão ou Marte angulares (sem benéficos).
            Esta é uma análise simplificada — a Astrocartografia completa usa linhas ACG sobre mapa-múndi.
          </p>
        </div>
      </Show>
    </div>
  );
}

// ============================================================
// CITY CARD COMPONENT
// ============================================================

function CityCard(props: { result: CityResult }) {
  const r = () => props.result;

  const borderColor = () => {
    switch (r().category) {
      case 'favorable': return 'border-emerald-500/30';
      case 'challenging': return 'border-red-500/30';
      case 'mixed': return 'border-amber-500/30';
      default: return 'border-base-300/50';
    }
  };

  const headerBg = () => {
    switch (r().category) {
      case 'favorable': return 'bg-emerald-500/10';
      case 'challenging': return 'bg-red-500/10';
      case 'mixed': return 'bg-amber-500/10';
      default: return 'bg-base-200/50';
    }
  };

  const categoryLabel = () => {
    switch (r().category) {
      case 'favorable': return { text: 'Favorável', color: 'text-emerald-400', bg: 'bg-emerald-500/15' };
      case 'challenging': return { text: 'Desafiadora', color: 'text-red-400', bg: 'bg-red-500/15' };
      case 'mixed': return { text: 'Mista', color: 'text-amber-400', bg: 'bg-amber-500/15' };
      default: return { text: 'Neutra', color: 'text-muted', bg: 'bg-base-200' };
    }
  };

  return (
    <div class={`glass rounded-xl border ${borderColor()} overflow-hidden transition-all hover:scale-[1.01]`}>
      {/* Card Header */}
      <div class={`${headerBg()} px-4 py-3 flex items-center justify-between`}>
        <div class="flex items-center gap-2">
          <span class="text-xl">{r().city.flag}</span>
          <div>
            <div class="text-sm font-semibold text-cream leading-tight">{r().city.name}</div>
            <div class="text-[11px] text-muted">{r().city.country}</div>
          </div>
        </div>
        <div>
          <span class={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryLabel().bg} ${categoryLabel().color}`}>
            {categoryLabel().text}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div class="px-4 py-3 space-y-2.5">
        {/* Angular Planets */}
        <Show when={r().angularPlanets.length > 0} fallback={
          <p class="text-xs text-muted italic">Nenhum planeta angular (orbe ±5°)</p>
        }>
          <div class="space-y-1.5">
            <For each={r().angularPlanets}>
              {(ap) => {
                const isBenefic = BENEFICS.has(ap.planet);
                const isMalefic = MALEFICS.has(ap.planet);
                return (
                  <div class="flex items-center gap-2">
                    <span class={`text-sm w-5 text-center ${isBenefic ? 'text-emerald-400' : isMalefic ? 'text-red-400' : 'text-blue-300'}`}>
                      {PLANET_SYMBOLS[ap.planet]}
                    </span>
                    <span class={`text-xs font-medium ${isBenefic ? 'text-emerald-300' : isMalefic ? 'text-red-300' : 'text-blue-200'}`}>
                      {PLANET_NAMES[ap.planet]}
                    </span>
                    <span class="text-[10px] text-muted ml-auto">
                      Casa {ap.house} ({ap.degreesFromCusp.toFixed(1)}°)
                    </span>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>

        {/* Angular House Meaning */}
        <Show when={r().angularPlanets.length > 0}>
          <div class="pt-1 border-t border-base-300/40">
            <p class="text-[10px] text-muted">
              {r().angularPlanets.length === 1
                ? ANGULAR_MEANINGS[r().angularPlanets[0].house]
                : `${r().angularPlanets.length} planetas angulares`
              }
            </p>
          </div>
        </Show>

        {/* Benefic badges */}
        <Show when={r().beneficsAngular.length > 0}>
          <div class="flex flex-wrap gap-1">
            <For each={r().beneficsAngular}>
              {(planet) => (
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  {PLANET_SYMBOLS[planet]} {PLANET_NAMES[planet]}
                </span>
              )}
            </For>
          </div>
        </Show>

        {/* Malefic badges */}
        <Show when={r().maleficsAngular.length > 0}>
          <div class="flex flex-wrap gap-1">
            <For each={r().maleficsAngular}>
              {(planet) => (
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/20">
                  {PLANET_SYMBOLS[planet]} {PLANET_NAMES[planet]}
                </span>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
