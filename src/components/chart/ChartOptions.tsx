import { createSignal, For, Show } from 'solid-js';
import type { HouseSystem, CalculationOptions } from '../../engine/types';

interface Props {
  onChange: (options: CalculationOptions) => void;
}

const HOUSE_SYSTEMS: { id: HouseSystem; label: string }[] = [
  { id: 'placidus', label: 'Placidus' },
  { id: 'koch', label: 'Koch' },
  { id: 'equal', label: 'Casas Iguais' },
  { id: 'whole-sign', label: 'Signo Inteiro' },
  { id: 'campanus', label: 'Campanus' },
  { id: 'regiomontanus', label: 'Regiomontanus' },
];

export default function ChartOptions(props: Props) {
  const [expanded, setExpanded] = createSignal(false);
  const [houseSystem, setHouseSystem] = createSignal<HouseSystem>('placidus');
  const [includeExtras, setIncludeExtras] = createSignal(true);
  const [includeAsteroids, setIncludeAsteroids] = createSignal(false);
  const [trueNode, setTrueNode] = createSignal(true);

  const emitChange = () => {
    props.onChange({
      houseSystem: houseSystem(),
      includeExtraPoints: includeExtras(),
      includeAsteroids: includeAsteroids(),
    });
  };

  return (
    <div class="glass rounded-2xl border-glow shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded())}
        class="w-full flex items-center justify-between p-3 text-sm text-cream-dark hover:bg-base-200"
      >
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Opções Avançadas
        </span>
        <svg class={`w-4 h-4 transition-transform ${expanded() ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Show when={expanded()}>
        <div class="p-4 border-t border-base-300 space-y-4">
          {/* House System */}
          <div>
            <label class="block text-xs font-medium text-muted mb-1">Sistema de Casas</label>
            <select
              value={houseSystem()}
              onChange={(e) => { setHouseSystem(e.currentTarget.value as HouseSystem); emitChange(); }}
              class="w-full px-3 py-2 text-sm rounded-lg border border-base-400 bg-base-200 text-cream"
            >
              <For each={HOUSE_SYSTEMS}>
                {(sys) => <option value={sys.id}>{sys.label}</option>}
              </For>
            </select>
          </div>

          {/* Checkboxes */}
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm text-cream-dark">
              <input
                type="checkbox"
                checked={includeExtras()}
                onChange={(e) => { setIncludeExtras(e.currentTarget.checked); emitChange(); }}
                class="rounded border-base-400 text-brand-600"
              />
              Nodo Norte, Lilith, Quíron
            </label>

            <label class="flex items-center gap-2 text-sm text-cream-dark">
              <input
                type="checkbox"
                checked={includeAsteroids()}
                onChange={(e) => { setIncludeAsteroids(e.currentTarget.checked); emitChange(); }}
                class="rounded border-base-400 text-brand-600"
              />
              Asteroides (Ceres, Vesta, Pallas, Juno)
            </label>

            <label class="flex items-center gap-2 text-sm text-cream-dark">
              <input
                type="checkbox"
                checked={trueNode()}
                onChange={(e) => { setTrueNode(e.currentTarget.checked); emitChange(); }}
                class="rounded border-base-400 text-brand-600"
              />
              Nodo Verdadeiro (vs Nodo Médio)
            </label>
          </div>
        </div>
      </Show>
    </div>
  );
}
