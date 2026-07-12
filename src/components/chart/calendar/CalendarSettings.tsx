// ============================================================
// CalendarSettings.tsx — Modal de Configurações Avançadas
// Permite ajustar orbes, planetas, temas, pesos e visualização
// ============================================================

import { createSignal, Show, For } from 'solid-js';
import type { CalendarConfig } from '../../../engine/calendar/types';
import { DEFAULT_CALENDAR_CONFIG } from '../../../engine/calendar/types';
import { THEME_INFO } from '../../../engine/calendar/theme-mapper';

interface Props {
  config: CalendarConfig;
  onSave: (config: CalendarConfig) => void;
  onClose: () => void;
}

export function CalendarSettings(props: Props) {
  const [config, setConfig] = createSignal<CalendarConfig>({ ...props.config });
  const [activeTab, setActiveTab] = createSignal<'aspects' | 'planets' | 'moon' | 'themes' | 'display'>('aspects');

  const update = (path: string, value: any) => {
    const cfg = { ...config() };
    const parts = path.split('.');
    let obj: any = cfg;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
    setConfig(cfg);
  };

  const save = () => {
    props.onSave(config());
    props.onClose();
  };

  const reset = () => {
    setConfig({ ...DEFAULT_CALENDAR_CONFIG });
  };

  const TABS = [
    { id: 'aspects', label: 'Aspectos', icon: '⚹' },
    { id: 'planets', label: 'Planetas', icon: '🪐' },
    { id: 'moon', label: 'Lua', icon: '☽' },
    { id: 'themes', label: 'Temas', icon: '🏷️' },
    { id: 'display', label: 'Exibição', icon: '👁️' },
  ];

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={props.onClose}>
      <div class="w-full max-w-lg max-h-[85vh] bg-base-100 border border-base-300 rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div class="flex items-center justify-between px-5 py-4 border-b border-base-300">
          <h3 class="font-serif font-bold text-cream">⚙️ Configurações do Calendário</h3>
          <button onClick={props.onClose} class="p-1 text-muted hover:text-cream">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div class="flex border-b border-base-300 px-5 gap-1 overflow-x-auto">
          <For each={TABS}>
            {(tab) => (
              <button
                onClick={() => setActiveTab(tab.id as any)}
                class={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab() === tab.id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-muted hover:text-cream'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            )}
          </For>
        </div>

        {/* Content */}
        <div class="p-5 overflow-y-auto max-h-[55vh] space-y-4">
          {/* Aspects Tab */}
          <Show when={activeTab() === 'aspects'}>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <label class="text-sm text-cream">Aspectos maiores</label>
                <input type="checkbox" checked={config().aspects.major} onChange={(e) => update('aspects.major', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm text-cream">Aspectos menores (30°, 45°, 135°, 150°)</label>
                <input type="checkbox" checked={config().aspects.minor} onChange={(e) => update('aspects.minor', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm text-cream">Bônus para aspecto aplicativo</label>
                <input type="checkbox" checked={config().aspects.applicationBonus} onChange={(e) => update('aspects.applicationBonus', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>

              <h4 class="text-xs font-semibold text-muted uppercase mt-4">Orbes (graus)</h4>
              <For each={Object.entries(config().aspects.orbs).filter(([k]) => ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(k))}>
                {([aspect, orb]) => (
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-cream-dark capitalize">{aspect}</span>
                    <div class="flex items-center gap-2">
                      <input
                        type="range" min="0.5" max="5" step="0.5" value={orb as number}
                        onInput={(e) => {
                          const orbs = { ...config().aspects.orbs, [aspect]: parseFloat(e.currentTarget.value) };
                          update('aspects.orbs', orbs);
                        }}
                        class="w-24 h-1 accent-gold"
                      />
                      <span class="text-xs text-muted w-8 text-right">{orb}°</span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>

          {/* Planets Tab */}
          <Show when={activeTab() === 'planets'}>
            <div class="space-y-3">
              <h4 class="text-xs font-semibold text-muted uppercase">Planetas em trânsito</h4>
              <div class="grid grid-cols-2 gap-2">
                <For each={['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'northNode']}>
                  {(planet) => {
                    const labels: Record<string, string> = { sun: '☉ Sol', moon: '☽ Lua', mercury: '☿ Mercúrio', venus: '♀ Vênus', mars: '♂ Marte', jupiter: '♃ Júpiter', saturn: '♄ Saturno', uranus: '♅ Urano', neptune: '♆ Netuno', pluto: '♇ Plutão', chiron: '⚷ Quíron', northNode: '☊ Nodo N.' };
                    return (
                      <label class="flex items-center gap-2 text-xs text-cream-dark cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config().planets.transiting.includes(planet)}
                          onChange={(e) => {
                            const list = e.currentTarget.checked
                              ? [...config().planets.transiting, planet]
                              : config().planets.transiting.filter(p => p !== planet);
                            update('planets.transiting', list);
                          }}
                          class="w-3.5 h-3.5 rounded border-base-400 bg-base-200 text-gold"
                        />
                        {labels[planet] || planet}
                      </label>
                    );
                  }}
                </For>
              </div>

              <div class="flex items-center justify-between mt-4">
                <label class="text-sm text-cream">Incluir ângulos (ASC/MC)</label>
                <input type="checkbox" checked={config().planets.includeAngles} onChange={(e) => update('planets.includeAngles', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>
            </div>
          </Show>

          {/* Moon Tab */}
          <Show when={activeTab() === 'moon'}>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-sm text-cream">Mostrar fases da Lua</label>
                <input type="checkbox" checked={config().moon.showPhases} onChange={(e) => update('moon.showPhases', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm text-cream">Mostrar ingressos lunares</label>
                <input type="checkbox" checked={config().moon.showIngresses} onChange={(e) => update('moon.showIngresses', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm text-cream">Lua Vazia de Curso</label>
                <input type="checkbox" checked={config().moon.showVoidOfCourse} onChange={(e) => update('moon.showVoidOfCourse', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>

              <div class="flex items-center justify-between">
                <label class="text-xs text-cream-dark">Duração mínima VoC (min)</label>
                <input type="number" min="0" max="240" value={config().moon.vocMinDuration}
                  onInput={(e) => update('moon.vocMinDuration', parseInt(e.currentTarget.value) || 0)}
                  class="w-16 px-2 py-1 text-xs rounded border border-base-400 bg-base-200 text-cream"
                />
              </div>

              <div class="flex items-center justify-between">
                <label class="text-xs text-cream-dark">Sistema VoC</label>
                <select value={config().moon.vocAspects}
                  onChange={(e) => update('moon.vocAspects', e.currentTarget.value)}
                  class="px-2 py-1 text-xs rounded border border-base-400 bg-base-200 text-cream"
                >
                  <option value="traditional">Tradicional (5 aspectos)</option>
                  <option value="modern">Moderno (incluir menores)</option>
                </select>
              </div>

              <div class="flex items-center justify-between">
                <label class="text-xs text-cream-dark">Planetas VoC</label>
                <select value={config().moon.vocPlanets}
                  onChange={(e) => update('moon.vocPlanets', e.currentTarget.value)}
                  class="px-2 py-1 text-xs rounded border border-base-400 bg-base-200 text-cream"
                >
                  <option value="traditional">Até Saturno (tradicionais)</option>
                  <option value="modern">Até Plutão (modernos)</option>
                </select>
              </div>
            </div>
          </Show>

          {/* Themes Tab */}
          <Show when={activeTab() === 'themes'}>
            <div class="space-y-3">
              <p class="text-xs text-muted">Selecione quais temas exibir no calendário:</p>
              <div class="grid grid-cols-2 gap-2">
                <For each={Object.entries(THEME_INFO)}>
                  {([theme, info]) => (
                    <label class="flex items-center gap-2 text-xs cursor-pointer" style={`color: ${info.color}`}>
                      <input
                        type="checkbox"
                        checked={config().themes.enabled.includes(theme)}
                        onChange={(e) => {
                          const list = e.currentTarget.checked
                            ? [...config().themes.enabled, theme]
                            : config().themes.enabled.filter(t => t !== theme);
                          update('themes.enabled', list);
                        }}
                        class="w-3.5 h-3.5 rounded border-base-400 bg-base-200"
                      />
                      {info.icon} {info.label}
                    </label>
                  )}
                </For>
              </div>

              <div class="flex items-center justify-between mt-4">
                <label class="text-sm text-cream">Usar regentes de casa</label>
                <input type="checkbox" checked={config().themes.useHouseRulers} onChange={(e) => update('themes.useHouseRulers', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>

              <div class="flex items-center justify-between">
                <label class="text-xs text-cream-dark">Sistema de regências</label>
                <select value={config().profection.rulers}
                  onChange={(e) => update('profection.rulers', e.currentTarget.value)}
                  class="px-2 py-1 text-xs rounded border border-base-400 bg-base-200 text-cream"
                >
                  <option value="traditional">Tradicional</option>
                  <option value="modern">Moderno</option>
                </select>
              </div>
            </div>
          </Show>

          {/* Display Tab */}
          <Show when={activeTab() === 'display'}>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-xs text-cream-dark">Primeiro dia da semana</label>
                <select value={config().ui.firstDayOfWeek}
                  onChange={(e) => update('ui.firstDayOfWeek', parseInt(e.currentTarget.value))}
                  class="px-2 py-1 text-xs rounded border border-base-400 bg-base-200 text-cream"
                >
                  <option value="0">Domingo</option>
                  <option value="1">Segunda-feira</option>
                </select>
              </div>

              <div class="flex items-center justify-between">
                <label class="text-xs text-cream-dark">Eventos por célula (grid)</label>
                <input type="number" min="2" max="8" value={config().ui.maxEventsPerCell}
                  onInput={(e) => update('ui.maxEventsPerCell', parseInt(e.currentTarget.value) || 4)}
                  class="w-16 px-2 py-1 text-xs rounded border border-base-400 bg-base-200 text-cream"
                />
              </div>

              <div class="flex items-center justify-between">
                <label class="text-sm text-cream">Modo compacto</label>
                <input type="checkbox" checked={config().ui.compactMode} onChange={(e) => update('ui.compactMode', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>

              <h4 class="text-xs font-semibold text-muted uppercase mt-4">Camadas adicionais</h4>
              <div class="flex items-center justify-between">
                <label class="text-sm text-cream">Eclipses</label>
                <input type="checkbox" checked={config().eclipses.show} onChange={(e) => update('eclipses.show', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm text-cream">Retrógrados</label>
                <input type="checkbox" checked={config().retrogrades.show} onChange={(e) => update('retrogrades.show', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm text-cream">Profecção anual</label>
                <input type="checkbox" checked={config().profection.show} onChange={(e) => update('profection.show', e.currentTarget.checked)} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm text-cream">Retornos planetários (♄ ♃)</label>
                <input type="checkbox" checked={config().returns.saturn} onChange={(e) => { update('returns.saturn', e.currentTarget.checked); update('returns.jupiter', e.currentTarget.checked); }} class="w-4 h-4 rounded border-base-400 bg-base-200 text-gold" />
              </div>
            </div>
          </Show>
        </div>

        {/* Footer */}
        <div class="flex items-center justify-between px-5 py-4 border-t border-base-300">
          <button onClick={reset} class="px-3 py-1.5 text-xs text-muted hover:text-cream transition-colors">
            Restaurar padrão
          </button>
          <div class="flex gap-2">
            <button onClick={props.onClose} class="px-4 py-2 text-sm text-muted hover:text-cream rounded-lg border border-base-400 transition-colors">
              Cancelar
            </button>
            <button onClick={save} class="px-4 py-2 text-sm font-medium bg-gold/20 text-gold rounded-lg border border-gold/40 hover:bg-gold/30 transition-colors">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
