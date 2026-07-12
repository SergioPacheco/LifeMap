import { Show, For } from 'solid-js';
import type { NatalChart } from '../../engine/types';
import { getSignIndex, getDegreeInSign, formatDegMin } from '../../engine/calculations';

interface Props {
  chart: NatalChart | null;
}

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  northNode: 'Nodo Norte', southNode: 'Nodo Sul', lilith: 'Lilith', chiron: 'Quíron',
  ceres: 'Ceres', vesta: 'Vesta', pallas: 'Pallas', juno: 'Juno',
  vertex: 'Vertex', partOfFortune: 'Parte da Fortuna',
};
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', southNode: '☋', lilith: '⚸', chiron: '⚷',
  ceres: '⚳', vesta: '⚶', pallas: '⚴', juno: '⚵',
  vertex: 'Vx', partOfFortune: '⊕',
};
const SIGN_ELEMENT_COLOR = ['#ff6b6b','#66d96e','#6ba3ff','#ffaa55','#ff6b6b','#66d96e','#6ba3ff','#ffaa55','#ff6b6b','#66d96e','#6ba3ff','#ffaa55'];

export default function PlanetTable(props: Props) {
  return (
    <Show when={props.chart}>
      <div class="glass rounded-2xl p-4 shadow-dark">
        <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">
          Posições Planetárias
        </h3>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-base-300">
              <th class="text-left py-2 text-xs font-medium text-muted uppercase">Planeta</th>
              <th class="text-left py-2 text-xs font-medium text-muted uppercase">Signo</th>
              <th class="text-left py-2 text-xs font-medium text-muted uppercase">Grau</th>
              <th class="text-center py-2 text-xs font-medium text-muted uppercase">Casa</th>
              <th class="text-center py-2 text-xs font-medium text-muted uppercase">R</th>
            </tr>
          </thead>
          <tbody>
            <For each={Object.entries(props.chart!.positions).filter(([id]) => PLANET_NAMES[id])}>
              {([id, pos]) => {
                const si = getSignIndex(pos.longitude);
                const deg = getDegreeInSign(pos.longitude);
                const house = props.chart!.planetHouses?.[id];
                const isRetro = pos.isRetrograde;

                return (
                  <tr class="border-b border-base-300/50 hover:bg-base-200/50 transition-colors">
                    <td class="py-1.5 font-medium text-cream">
                      <span class="mr-1">{PLANET_SYMBOLS[id]}</span>
                      {PLANET_NAMES[id]}
                    </td>
                    <td class="py-1.5" style={{ color: SIGN_ELEMENT_COLOR[si] }}>
                      {SIGN_SYMBOLS[si]} {SIGN_NAMES[si]}
                    </td>
                    <td class="py-1.5 font-mono text-xs text-cream-dark">
                      {formatDegMin(deg)}
                    </td>
                    <td class="py-1.5 text-center text-muted">
                      {house ?? '—'}
                    </td>
                    <td class="py-1.5 text-center">
                      <Show when={isRetro}>
                        <span class="text-red-400 font-bold text-xs">R</span>
                      </Show>
                    </td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>
    </Show>
  );
}
