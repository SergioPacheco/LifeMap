import { createSignal, onMount, Show, For } from 'solid-js';
import ProfileSelector from '../forms/ProfileSelector';
import { calculateNatalChart, calculateTransits, initSweph } from '../../engine/index';
import { renderWheel, renderBiWheel } from '../../renderer/wheel';
import type { NatalChart, TransitChart, BirthData } from '../../engine/types';
import type { Profile } from '../../store/db';
import { getSignIndex, getDegreeInSign, formatDegMin } from '../../engine/calculations';
import { getAspectColor, getAspectSymbol } from '../../engine/aspects';

const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  northNode: 'Nodo N.', chiron: 'Quíron',
};
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', chiron: '⚷',
};
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

export default function TransitsApp() {
  const [natalChart, setNatalChart] = createSignal<NatalChart | null>(null);
  const [transits, setTransits] = createSignal<TransitChart | null>(null);
  const [transitDate, setTransitDate] = createSignal(new Date().toISOString().split('T')[0]);
  const [wheelSvg, setWheelSvg] = createSignal('');

  onMount(async () => {
    await initSweph();
  });

  const handleProfileSelect = (profile: Profile) => {
    const chart = calculateNatalChart({
      name: profile.name,
      date: profile.date,
      time: profile.time,
      lat: profile.lat,
      lng: profile.lng,
      timezone: profile.timezone,
      city: profile.city,
      country: profile.country,
    });
    setNatalChart(chart);
    calculateTransitsForDate(chart, transitDate());
  };

  const calculateTransitsForDate = (natal: NatalChart, dateStr: string) => {
    const tDate = new Date(dateStr + 'T12:00:00Z');
    const transit = calculateTransits(tDate, natal);
    setTransits(transit);

    // Render bi-wheel: natal (inner) + transits (outer)
    const svg = renderBiWheel(natal, transit.positions, transit.aspects);
    setWheelSvg(svg);
  };

  const handleDateChange = (dateStr: string) => {
    setTransitDate(dateStr);
    if (natalChart()) {
      calculateTransitsForDate(natalChart()!, dateStr);
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Profile + Date + Aspects */}
      <div class="lg:col-span-1 space-y-4">
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">
            Selecione um perfil
          </h3>
          <ProfileSelector onSelect={handleProfileSelect} locale="pt" />
          <p class="text-xs text-muted mt-2">Primeiro calcule um mapa natal, depois volte aqui.</p>
        </div>

        <Show when={natalChart()}>
          <div class="glass rounded-2xl p-4">
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">
              Data dos Trânsitos
            </h3>
            <input
              type="date"
              value={transitDate()}
              onInput={(e) => handleDateChange(e.currentTarget.value)}
              class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-200 text-cream text-sm"
            />
            <div class="flex gap-2 mt-2">
              <button
                onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                class="px-3 py-1 text-xs bg-gold/10 text-gold rounded"
              >
                Hoje
              </button>
              <button
                onClick={() => {
                  const d = new Date(transitDate());
                  d.setDate(d.getDate() + 1);
                  handleDateChange(d.toISOString().split('T')[0]);
                }}
                class="px-3 py-1 text-xs bg-base-200 text-cream-dark rounded"
              >
                +1 dia
              </button>
              <button
                onClick={() => {
                  const d = new Date(transitDate());
                  d.setMonth(d.getMonth() + 1);
                  handleDateChange(d.toISOString().split('T')[0]);
                }}
                class="px-3 py-1 text-xs bg-base-200 text-cream-dark rounded"
              >
                +1 mês
              </button>
            </div>
          </div>

          {/* Transit aspects list */}
          <Show when={transits()}>
            <div class="glass rounded-2xl p-4">
              <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">
                Aspectos Ativos ({transits()!.aspects.length})
              </h3>
              <div class="space-y-1 max-h-80 overflow-y-auto">
                <For each={transits()!.aspects.slice(0, 20)}>
                  {(asp) => (
                    <div class="flex items-center justify-between text-xs py-1 border-b border-base-300/50/50">
                      <span>
                        <span style={{ color: getAspectColor(asp.type) }}>
                          {PLANET_SYMBOLS[asp.planet1] || asp.planet1}
                        </span>
                        {' '}
                        <span style={{ color: getAspectColor(asp.type) }}>
                          {getAspectSymbol(asp.type)}
                        </span>
                        {' '}
                        <span>{PLANET_SYMBOLS[asp.planet2] || asp.planet2}</span>
                        <span class="text-muted ml-1">
                          {PLANET_NAMES[asp.planet1]} {getAspectSymbol(asp.type)} {PLANET_NAMES[asp.planet2]}
                        </span>
                      </span>
                      <span class="text-muted font-mono">{asp.orb}°</span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </Show>
      </div>

      {/* Right: Chart */}
      <div class="lg:col-span-2">
        <Show when={natalChart()} fallback={
          <div class="glass rounded-2xl p-8 text-center text-muted">
            <div class="text-5xl mb-3">↻</div>
            <p>Selecione um perfil salvo para ver os trânsitos</p>
            <p class="text-xs mt-2">Calcule primeiro um mapa natal na página "Mapa Natal"</p>
          </div>
        }>
          <div class="glass rounded-2xl p-4">
            <div class="text-center text-sm text-muted mb-2">
              Trânsitos de <strong>{transitDate()}</strong> para <strong>{natalChart()!.meta.name || 'Natal'}</strong>
            </div>
            <div class="w-full max-w-[600px] mx-auto" innerHTML={wheelSvg()} />
          </div>
        </Show>
      </div>
    </div>
  );
}
