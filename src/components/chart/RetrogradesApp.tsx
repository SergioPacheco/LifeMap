import { createSignal, onMount, For, Show } from 'solid-js';
import { getSignIndex, norm } from '../../engine/astro-utils';
import * as Astronomy from 'astronomy-engine';
import type { Locale } from '../../i18n';
import { getInterpretations } from '../../engine/interpretations';
import { getToolsUi } from '../../i18n/tools-ui';
import { localeToDateLocale } from '../../utils/dateTime';

const PLANETS = [
  { id: 'mercury', name: 'Mercury', symbol: '☿', color: '#d4a853' },
  { id: 'venus', name: 'Venus', symbol: '♀', color: '#44cc44' },
  { id: 'mars', name: 'Mars', symbol: '♂', color: '#ff4444' },
  { id: 'jupiter', name: 'Jupiter', symbol: '♃', color: '#aa66dd' },
  { id: 'saturn', name: 'Saturn', symbol: '♄', color: '#c8c0b4' },
  { id: 'uranus', name: 'Uranus', symbol: '♅', color: '#44aaff' },
  { id: 'neptune', name: 'Neptune', symbol: '♆', color: '#44ccaa' },
  { id: 'pluto', name: 'Pluto', symbol: '♇', color: '#cc4444' },
];
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

interface RetroPeriod {
  planet: string;
  symbol: string;
  color: string;
  startDate: string;
  endDate: string;
  startSign: number;
  endSign: number;
  days: number;
}

interface Props { locale: Locale }

export default function RetrogradesApp(props: Props) {
  const text = () => getToolsUi(props.locale).retrogrades;
  const interp = () => getInterpretations(props.locale);
  const dateLocale = localeToDateLocale(props.locale);
  const [year, setYear] = createSignal(new Date().getFullYear());
  const [periods, setPeriods] = createSignal<RetroPeriod[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [progress, setProgress] = createSignal(0);

  onMount(async () => {
    await calculate();
  });

  /**
   * Get ecliptic longitude of a planet using Astronomy Engine directly.
   * This bypasses SwissEph WASM which may not return speed data in browser.
   */
  const lonCache = new Map<string, number>();

  const getLon = (planetId: string, date: Date): number => {
    const key = `${planetId}_${date.toISOString().split('T')[0]}`;
    if (lonCache.has(key)) return lonCache.get(key)!;

    const astroTime = new Astronomy.AstroTime(date);
    let lon = 0;

    if (planetId === 'moon') {
      const moonEcl = Astronomy.EclipticGeoMoon(astroTime);
      lon = norm(moonEcl.lon);
    } else {
      const bodyMap: Record<string, Astronomy.Body> = {
        mercury: Astronomy.Body.Mercury,
        venus: Astronomy.Body.Venus,
        mars: Astronomy.Body.Mars,
        jupiter: Astronomy.Body.Jupiter,
        saturn: Astronomy.Body.Saturn,
        uranus: Astronomy.Body.Uranus,
        neptune: Astronomy.Body.Neptune,
        pluto: Astronomy.Body.Pluto,
      };
      const body = bodyMap[planetId];
      if (!body) return 0;

      const equ = Astronomy.GeoVector(body, astroTime, true);
      const ecl = Astronomy.Ecliptic(equ);
      lon = norm(ecl.elon);
    }

    lonCache.set(key, lon);
    return lon;
  };

  /**
   * Detect retrograde by comparing longitude over 2 days.
   */
  const checkRetro = (planetId: string, date: Date): boolean => {
    const d1 = new Date(date.getTime() - 86400000);
    const d2 = new Date(date.getTime() + 86400000);
    const lon1 = getLon(planetId, d1);
    const lon2 = getLon(planetId, d2);

    let diff = lon2 - lon1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff < 0;
  };

  const calculate = async () => {
    setLoading(true);
    setError('');
    setProgress(0);
    setPeriods([]);
    lonCache.clear(); // Clear cache for new year

    try {
      const results: RetroPeriod[] = [];
      const yr = year();
      const totalPlanets = PLANETS.length;

      for (let pi = 0; pi < totalPlanets; pi++) {
        const planet = PLANETS[pi];
        setProgress(Math.round((pi / totalPlanets) * 100));

        // Yield to UI every planet to avoid freezing
        await new Promise(resolve => setTimeout(resolve, 0));

        let inRetro = false;
        let startDate = '';
        let startSign = 0;

        // Scan day by day for accurate detection
        for (let day = 0; day < 366; day++) {
          const date = new Date(Date.UTC(yr, 0, 1 + day));
          if (date.getFullYear() !== yr) break;

          // Use longitude comparison (not engine's isRetrograde flag)
          const retro = checkRetro(planet.id, date);
          const lon = getLon(planet.id, date);
          const sign = getSignIndex(lon);

          if (retro && !inRetro) {
            inRetro = true;
            startDate = date.toISOString().split('T')[0];
            startSign = sign;
          } else if (!retro && inRetro) {
            inRetro = false;
            const endDate = date.toISOString().split('T')[0];
            const start = new Date(startDate);
            const days = Math.round((date.getTime() - start.getTime()) / 86400000);

            results.push({
              planet: planet.id,
              symbol: planet.symbol,
              color: planet.color,
              startDate,
              endDate,
              startSign,
              endSign: sign,
              days,
            });
            startDate = '';
          }
        }

        // If still retrograde at year end
        if (inRetro) {
          const endOfYear = new Date(Date.UTC(yr, 11, 31));
          results.push({
            planet: planet.id,
            symbol: planet.symbol,
            color: planet.color,
            startDate,
            endDate: `${yr}-12-31`,
            startSign,
            endSign: getSignIndex(getLon(planet.id, endOfYear)),
            days: Math.round((endOfYear.getTime() - new Date(startDate).getTime()) / 86400000),
          });
        }
      }

      setPeriods(results.sort((a, b) => a.startDate.localeCompare(b.startDate)));
      setProgress(100);
    } catch (e: any) {
      console.error('[Retrogrades] Error:', e);
      setError(e.message || text().error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${dateStr}T12:00:00Z`));
  };

  const changeYear = async (delta: number) => {
    setYear(year() + delta);
    await calculate();
  };

  return (
    <div class="space-y-4">
      {/* Year selector */}
      <div class="glass rounded-2xl p-4 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => changeYear(-1)}
          class="px-3 py-1.5 text-sm font-medium bg-base-200 hover:bg-base-300 text-cream rounded-lg transition-colors"
        >
          ← {text().previous}
        </button>
        <span class="text-xl font-bold text-gold">{year()}</span>
        <button
          onClick={() => changeYear(1)}
          class="px-3 py-1.5 text-sm font-medium bg-base-200 hover:bg-base-300 text-cream rounded-lg transition-colors"
        >
          {text().next} →
        </button>
        <Show when={!loading()}>
          <span class="text-sm text-muted ml-auto">
            {periods().length} {text().found}
          </span>
        </Show>
      </div>

      {/* Loading state */}
      <Show when={loading()}>
        <div class="glass rounded-2xl p-8 text-center">
          <div class="animate-spin text-4xl mb-4">⏳</div>
          <p class="text-cream-dark font-medium mb-2">{text().calculating} {year()}...</p>
          <div class="w-48 mx-auto bg-base-300 rounded-full h-2 overflow-hidden">
            <div
              class="h-full bg-gold rounded-full transition-all duration-300"
              style={{ width: `${progress()}%` }}
            />
          </div>
          <p class="text-xs text-muted mt-2">{progress()}%</p>
        </div>
      </Show>

      {/* Error state */}
      <Show when={error()}>
        <div class="glass rounded-2xl p-6 border border-red-500/30 text-center">
          <p class="text-red-400">⚠️ {error()}</p>
          <button
            onClick={() => calculate()}
            class="mt-3 px-4 py-2 text-sm bg-base-200 rounded-lg hover:bg-base-300 text-cream transition-colors"
          >
            {text().retry}
          </button>
        </div>
      </Show>

      {/* Results table */}
      <Show when={!loading() && !error() && periods().length > 0}>
        <div class="glass rounded-2xl border-glow overflow-hidden">
          {/* Timeline visualization */}
          <div class="p-4 border-b border-base-300">
            <h3 class="text-sm font-medium text-muted uppercase tracking-wider mb-3">{text().timeline}</h3>
            <div class="space-y-1.5">
              <For each={PLANETS}>
                {(planet) => {
                  const planetPeriods = () => periods().filter(p => p.planet === planet.id);
                  return (
                    <div class="flex items-center gap-2">
                      <span class="w-6 text-center" style={{ color: planet.color }}>{planet.symbol}</span>
                      <div class="flex-1 h-4 bg-base-200 rounded relative overflow-hidden">
                        <For each={planetPeriods()}>
                          {(p) => {
                            const startDay = dayOfYear(p.startDate);
                            const endDay = dayOfYear(p.endDate);
                            const left = (startDay / 365) * 100;
                            const width = ((endDay - startDay) / 365) * 100;
                            return (
                              <div
                                class="absolute top-0 h-full rounded opacity-70"
                                style={{
                                  left: `${left}%`,
                                  width: `${Math.max(width, 1)}%`,
                                  'background-color': planet.color,
                                }}
                                title={`${interp().PLANET_NAMES[planet.id]}: ${formatDate(p.startDate)} → ${formatDate(p.endDate)} (${p.days} ${text().days.toLowerCase()})`}
                              />
                            );
                          }}
                        </For>
                      </div>
                    </div>
                  );
                }}
              </For>
              {/* Month markers */}
              <div class="flex items-center gap-2">
                <span class="w-6" />
                <div class="flex-1 flex justify-between text-[9px] text-muted px-1">
                  {Array.from({ length: 12 }, (_, i) => <span>{new Intl.DateTimeFormat(dateLocale, { month: 'short' }).format(new Date(2024, i, 1))}</span>)}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-base-300 bg-base-100/50">
                  <th class="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{text().planet}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{text().start}</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-muted uppercase">{text().end}</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-muted uppercase">{text().signs}</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-muted uppercase">{text().days}</th>
                </tr>
              </thead>
              <tbody>
                <For each={periods()}>
                  {(p) => (
                    <tr class="border-b border-base-300/50 hover:bg-base-200/20 transition-colors">
                      <td class="px-4 py-2.5">
                        <span class="text-lg mr-1.5" style={{ color: p.color }}>{p.symbol}</span>
                        <span class="font-medium text-cream" style={{ color: p.color }}>{interp().PLANET_NAMES[p.planet]}</span>
                      </td>
                      <td class="px-4 py-2.5 font-mono text-xs text-cream-dark">{formatDate(p.startDate)}</td>
                      <td class="px-4 py-2.5 font-mono text-xs text-cream-dark">{formatDate(p.endDate)}</td>
                      <td class="px-4 py-2.5 text-center">
                        <span title={interp().SIGN_NAMES[p.startSign]}>{SIGN_SYMBOLS[p.startSign]}</span>
                        <span class="text-muted mx-1">→</span>
                        <span title={interp().SIGN_NAMES[p.endSign]}>{SIGN_SYMBOLS[p.endSign]}</span>
                      </td>
                      <td class="px-4 py-2.5 text-center text-muted font-medium">{p.days}{text().daySuffix}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </Show>

      {/* Empty state */}
      <Show when={!loading() && !error() && periods().length === 0}>
        <div class="glass rounded-2xl p-8 text-center">
          <p class="text-cream-dark">{text().none} {year()}.</p>
        </div>
      </Show>
    </div>
  );
}

/** Get day of year (1-365) from date string YYYY-MM-DD */
function dayOfYear(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00Z');
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.floor((d.getTime() - start.getTime()) / 86400000) + 1;
}
