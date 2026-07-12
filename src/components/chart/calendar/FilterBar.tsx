// ============================================================
// FilterBar.tsx — Barra de filtros por tipo, tema e energia
// ============================================================

import { For } from 'solid-js';
import type { Theme } from '../../../engine/calendar/types';
import { THEME_INFO } from '../../../engine/calendar/theme-mapper';

interface Props {
  activeTypes: Set<string>;
  activeThemes: Set<Theme>;
  energyFilter: Set<string>;
  onToggleType: (type: string) => void;
  onToggleTheme: (theme: Theme) => void;
  onToggleEnergy: (energy: string) => void;
}

const EVENT_TYPES = [
  { id: 'transit-aspect', label: 'Trânsitos', icon: '🪐', desc: 'Aspectos dos planetas em movimento ao seu mapa natal — a influência mais personalizada' },
  { id: 'moon-phase', label: 'Lua', icon: '☽', desc: 'Fases da Lua (Nova, Cheia, Quartos) — ciclos emocionais e de manifestação' },
  { id: 'moon-ingress', label: 'Lua em signo', icon: '→', desc: 'Mudança da Lua de signo (~cada 2.5 dias) — tom emocional do dia' },
  { id: 'planet-ingress', label: 'Ingressos', icon: '➡️', desc: 'Planeta muda de signo — mudança de energia coletiva (raro = mais impactante)' },
  { id: 'void-of-course', label: 'Lua Vazia', icon: '⏸️', desc: 'Período sem aspectos lunares — evitar iniciar atividades importantes' },
  { id: 'retrograde-start', label: 'Retrógrados', icon: '℞', desc: 'Planeta inverte direção aparente — revisão, atrasos e introspecção' },
  { id: 'retrograde-end', label: 'Diretos', icon: 'D', desc: 'Planeta retoma movimento direto — projetos desbloqueia, avanço retomado' },
  { id: 'eclipse-solar', label: 'Eclipse Solar', icon: '🌑', desc: 'Eclipse solar — virada coletiva com impacto pessoal se tocar seu mapa' },
  { id: 'eclipse-lunar', label: 'Eclipse Lunar', icon: '🌕', desc: 'Eclipse lunar — culminações e revelações no eixo ativado do mapa' },
  { id: 'planetary-return', label: 'Retornos', icon: '↺', desc: 'Retornos e fases de ciclos planetários importantes' },
];

const ENERGY_OPTIONS = [
  { id: 'favorable', label: 'Favoráveis', color: 'bg-green-500', desc: 'Dias com trânsitos predominantemente harmoniosos (trígonos, sextis)' },
  { id: 'neutral', label: 'Neutros', color: 'bg-gray-500', desc: 'Dias equilibrados — nem especialmente bons nem desafiadores' },
  { id: 'tense', label: 'Tensos', color: 'bg-red-500', desc: 'Dias com quadraturas/oposições dominantes — requerem cautela' },
  { id: 'special', label: 'Especiais', color: 'bg-gold', desc: 'Eclipses, retornos planetários — momentos de virada' },
];

const THEMES: Theme[] = ['love', 'career', 'finances', 'health', 'spirituality', 'family', 'creativity', 'communication', 'transformation', 'freedom', 'travel', 'sexuality'];

const THEME_DESCRIPTIONS: Record<string, string> = {
  love: 'Relacionamentos, romance, parcerias — ativado por Vênus, Casa 5, Casa 7',
  career: 'Trabalho, vocação, reputação — ativado por Saturno, MC, Casa 10',
  finances: 'Dinheiro, recursos, investimentos — ativado por Júpiter, Vênus, Casa 2/8',
  health: 'Corpo, energia, bem-estar, rotina — ativado por Marte, Lua, Casa 1/6',
  spirituality: 'Intuição, meditação, propósito — ativado por Netuno, Nodos, Casa 12',
  family: 'Lar, raízes, pais, segurança emocional — ativado por Lua, Casa 4',
  creativity: 'Arte, prazer, autoexpressão, filhos — ativado por Vênus, Sol, Casa 5',
  communication: 'Estudos, escrita, viagens, contratos — ativado por Mercúrio, Casa 3/9',
  transformation: 'Transformação profunda, crises e renascimento — ativado por Plutão e Casa 8',
  freedom: 'Mudanças, independência e redes — ativado por Urano, Aquário e Casa 11',
  travel: 'Viagens, estudos superiores e expansão — ativado por Júpiter, Sagitário e Casa 9',
  sexuality: 'Desejo, intimidade e energia vital — ativado por Marte, Plutão e Casa 8',
};

export function FilterBar(props: Props) {
  return (
    <div class="glass rounded-2xl p-4 space-y-3">
      {/* Event type filters */}
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-muted uppercase font-semibold">Tipo de Evento:</span>
          <span class="text-[9px] text-muted italic">(o que aparece no calendário)</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <For each={EVENT_TYPES}>
            {(type) => (
              <button
                onClick={() => props.onToggleType(type.id)}
                title={type.desc}
                class={`
                  px-2 py-1 rounded-md text-[11px] border transition-colors
                  ${props.activeTypes.has(type.id)
                    ? 'bg-base-100 border-gold/40 text-cream'
                    : 'bg-transparent border-base-400/50 text-muted hover:text-cream hover:border-base-300'
                  }
                `}
              >
                {type.icon} {type.label}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Theme filters */}
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-muted uppercase font-semibold">Área de Vida:</span>
          <span class="text-[9px] text-muted italic">(filtra eventos por tema — desselecione para ocultar)</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <For each={THEMES}>
            {(theme) => (
              <button
                onClick={() => props.onToggleTheme(theme)}
                title={THEME_DESCRIPTIONS[theme] || ''}
                class={`
                  px-2 py-1 rounded-md text-[11px] border transition-colors
                  ${props.activeThemes.has(theme)
                    ? 'border-opacity-60 text-cream'
                    : 'bg-transparent border-base-400/50 text-muted hover:text-cream'
                  }
                `}
                style={props.activeThemes.has(theme) ? `border-color: ${THEME_INFO[theme]?.color}60; background: ${THEME_INFO[theme]?.color}15;` : ''}
              >
                {THEME_INFO[theme]?.icon} {THEME_INFO[theme]?.label}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Energy filters */}
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-muted uppercase font-semibold">Energia do Dia:</span>
          <span class="text-[9px] text-muted italic">(mostra/oculta dias inteiros pelo tom energético)</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <For each={ENERGY_OPTIONS}>
            {(opt) => (
              <button
                onClick={() => props.onToggleEnergy(opt.id)}
                title={opt.desc}
                class={`
                  flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border transition-colors
                  ${props.energyFilter.has(opt.id)
                    ? 'bg-base-100 border-gold/40 text-cream'
                    : 'bg-transparent border-base-400/50 text-muted hover:text-cream'
                  }
                `}
              >
                <span class={`w-2 h-2 rounded-full ${opt.color}`} />
                {opt.label}
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
