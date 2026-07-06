import { Show, For } from 'solid-js';
import { generateSynastryReport, type SynastryReport } from '../../engine/synastry-interpretation';
import type { SynastryChart } from '../../engine/types';

interface Props {
  synastry: SynastryChart | null;
  nameA: string;
  nameB: string;
}

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊',
};

const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  northNode: 'Nodo Norte',
};

export default function SynastryInterpretation(props: Props) {
  const report = () => {
    if (!props.synastry) return null;
    return generateSynastryReport(props.synastry, props.nameA, props.nameB);
  };

  return (
    <Show when={report()}>
      <div class="space-y-6">
        {/* Compatibility Score */}
        <div class="glass rounded-2xl p-6">
          <h3 class="text-lg font-serif font-semibold text-cream mb-4">
            ♡ Compatibilidade
          </h3>

          {/* Overall score */}
          <div class="flex items-center gap-4 mb-6">
            <div class="w-20 h-20 rounded-full border-4 border-gold flex items-center justify-center">
              <span class="text-2xl font-bold text-gold">{report()!.compatibility.overall}%</span>
            </div>
            <p class="text-cream-dark text-sm flex-1">{report()!.compatibility.description}</p>
          </div>

          {/* Sub-scores */}
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ScoreBar label="Atração" value={report()!.compatibility.attraction} />
            <ScoreBar label="Emoção" value={report()!.compatibility.emotion} />
            <ScoreBar label="Comunicação" value={report()!.compatibility.communication} />
            <ScoreBar label="Valores" value={report()!.compatibility.values} />
            <ScoreBar label="Crescimento" value={report()!.compatibility.growth} />
            <ScoreBar label="Desafios" value={report()!.compatibility.challenges} />
          </div>
        </div>

        {/* Overview */}
        <div class="glass rounded-2xl p-6">
          <h3 class="text-lg font-serif font-semibold text-cream mb-3">Visão Geral</h3>
          <p class="text-cream-dark leading-relaxed">{report()!.overview}</p>
        </div>

        {/* Themes */}
        <For each={report()!.themes}>
          {(theme) => (
            <div class="glass rounded-2xl p-6">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-xl">{theme.icon}</span>
                <h3 class="text-base font-semibold text-cream">{theme.title}</h3>
                <span class="ml-auto text-sm font-mono text-gold">{theme.score}/10</span>
              </div>
              <p class="text-cream-dark text-sm leading-relaxed">{theme.text}</p>
            </div>
          )}
        </For>

        {/* Key Aspects */}
        <div class="glass rounded-2xl p-6">
          <h3 class="text-lg font-serif font-semibold text-cream mb-4">Aspectos-Chave</h3>
          <div class="space-y-4">
            <For each={report()!.keyAspects.slice(0, 8)}>
              {(asp) => (
                <div class={`border-l-4 pl-4 py-2 ${
                  asp.nature === 'harmonious' ? 'border-green-500' :
                  asp.nature === 'challenging' ? 'border-red-400' :
                  'border-gold'
                }`}>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-medium text-cream">
                      {PLANET_SYMBOLS[asp.planet1]} {PLANET_NAMES[asp.planet1] || asp.planet1}
                      {' '}
                      <span class={
                        asp.nature === 'harmonious' ? 'text-green-400' :
                        asp.nature === 'challenging' ? 'text-red-400' :
                        'text-gold'
                      }>
                        {asp.type === 'conjunction' ? '☌' : asp.type === 'trine' ? '△' : asp.type === 'sextile' ? '⚹' : asp.type === 'square' ? '□' : '☍'}
                      </span>
                      {' '}
                      {PLANET_SYMBOLS[asp.planet2]} {PLANET_NAMES[asp.planet2] || asp.planet2}
                    </span>
                    <span class={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                      asp.nature === 'harmonious' ? 'bg-green-900/30 text-green-300' :
                      asp.nature === 'challenging' ? 'bg-red-900/30 text-red-300' :
                      'bg-gold/10 text-gold'
                    }`}>
                      {asp.nature === 'harmonious' ? 'harmônico' : asp.nature === 'challenging' ? 'desafiador' : 'intenso'}
                    </span>
                  </div>
                  <p class="text-sm text-muted leading-relaxed">{asp.text}</p>
                </div>
              )}
            </For>
          </div>
        </div>

        {/* CTA Premium */}
        <div class="bg-gold/5 rounded-2xl border border-gold/20 p-6 text-center">
          <p class="text-gold font-medium">✨ Relatório Completo de Relacionamento</p>
          <p class="text-xs text-muted mt-1">
            25-35 páginas com sinastria detalhada, mapa composto, pontos de atração e tensão,
            compatibilidade por área de vida e conselhos práticos em PDF.
          </p>
          <a
            href={`${import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}/pt/reports`}
            class="inline-block mt-3 px-5 py-2 bg-gradient-to-r from-gold-dark to-gold text-black text-sm font-semibold rounded-lg hover:shadow-gold transition-all"
          >
            Ver Relatórios Premium
          </a>
        </div>
      </div>
    </Show>
  );
}

// ============================================================
// HELPER COMPONENT
// ============================================================

function ScoreBar(props: { label: string; value: number }) {
  const color = () => props.value >= 70 ? 'bg-green-500' : props.value >= 45 ? 'bg-gold' : 'bg-red-400';

  return (
    <div>
      <div class="flex justify-between text-xs mb-1">
        <span class="text-muted">{props.label}</span>
        <span class="text-cream-dark font-mono">{props.value}%</span>
      </div>
      <div class="h-1.5 bg-base-300 rounded-full overflow-hidden">
        <div class={`h-full rounded-full transition-all ${color()}`} style={{ width: `${props.value}%` }} />
      </div>
    </div>
  );
}
