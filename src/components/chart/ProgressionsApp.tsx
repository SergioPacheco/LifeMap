import { createSignal, onMount, Show } from 'solid-js';
import PlanetTable from '../chart/PlanetTable';
import { calculateNatalChart, initSweph } from '../../engine/index';
import { calculateProgressions, calculateProgressedToNatalAspects } from '../../engine/progressions';
import { renderWheel } from '../../renderer/wheel';
import { getAspectSymbol, getAspectColor } from '../../engine/aspects';
import type { NatalChart, ProgressedChart, BirthData } from '../../engine/types';
import type { Profile } from '../../store/db';
import { db } from '../../store/db';

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
};

export default function ProgressionsApp() {
  const [natal, setNatal] = createSignal<NatalChart | null>(null);
  const [progressed, setProgressed] = createSignal<ProgressedChart | null>(null);
  const [birthData, setBirthData] = createSignal<BirthData | null>(null);
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [targetDate, setTargetDate] = createSignal(new Date().toISOString().split('T')[0]);
  const [profileName, setProfileName] = createSignal('');
  const [p2nAspects, setP2nAspects] = createSignal<any[]>([]);

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
    const bd: BirthData = {
      name: profile.name, date: profile.date, time: profile.time,
      lat: profile.lat, lng: profile.lng, timezone: profile.timezone,
      city: profile.city, country: profile.country,
    };
    const chart = calculateNatalChart(bd);
    setNatal(chart);
    setBirthData(bd);
    setProfileName(profile.name);
    calculate(chart, bd, targetDate());
  };

  const calculate = (chart: NatalChart, bd: BirthData, dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00Z');
    const prog = calculateProgressions(chart, bd, date);
    setProgressed(prog);
    setWheelSvg(renderWheel(prog as any));
    const aspects = calculateProgressedToNatalAspects(prog, chart);
    setP2nAspects(aspects);
  };

  const handleDateChange = (dateStr: string) => {
    setTargetDate(dateStr);
    if (natal() && birthData()) calculate(natal()!, birthData()!, dateStr);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 space-y-4">
        <Show when={natal()}>
          <div class="glass rounded-2xl p-4">
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">Progredir até</h3>
            <input
              type="date" value={targetDate()}
              onInput={(e) => handleDateChange(e.currentTarget.value)}
              class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-200 text-cream text-sm"
            />
            <Show when={progressed()}>
              <p class="text-xs text-muted mt-2">Idade: {progressed()!.age} anos</p>
              <p class="text-xs text-muted">Data progredida: {progressed()!.date.toISOString().split('T')[0]}</p>
            </Show>
          </div>

          {/* Progressed to Natal aspects */}
          <Show when={p2nAspects().length > 0}>
            <div class="glass rounded-2xl p-4">
              <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">
                Aspectos Prog → Natal ({p2nAspects().length})
              </h3>
              <div class="space-y-1 max-h-48 overflow-y-auto text-xs">
                {p2nAspects().map((asp: any) => (
                  <div class="flex items-center gap-1 py-0.5">
                    <span>{PLANET_SYMBOLS[asp.planet1] || asp.planet1}</span>
                    <span style={{ color: getAspectColor(asp.type) }}>{getAspectSymbol(asp.type)}</span>
                    <span>{PLANET_SYMBOLS[asp.planet2] || asp.planet2}</span>
                    <span class="text-muted ml-auto">{asp.orb}°</span>
                  </div>
                ))}
              </div>
            </div>
          </Show>
        </Show>
      </div>

      <div class="lg:col-span-2 space-y-6">
        <Show when={progressed()} fallback={
          <div class="glass rounded-2xl p-8 text-center text-muted">
            <div class="text-5xl mb-3">⟳</div>
            <p>Selecione um perfil para calcular as progressões</p>
          </div>
        }>
          <div class="glass rounded-2xl p-4">
            <div class="text-center text-sm text-muted mb-2">
              Progressões Secundárias — <strong>{profileName()}</strong> — Idade {progressed()!.age}
            </div>
            <div class="w-full max-w-[600px] mx-auto" innerHTML={wheelSvg()} />
          </div>
          <PlanetTable chart={progressed() as any} />
        </Show>
      </div>
    </div>
  );
}
