// ============================================================
// MonthInsights.tsx — Painel de Insights Mensais (abaixo do calendário)
// Resumo temático, melhores dias, alertas, dicas práticas
// ============================================================

import { For, Show, createMemo } from 'solid-js';
import type { MonthData, DayData, Theme, ProfectionData, RetroPeriod } from '../../../engine/calendar/types';
import { THEME_INFO } from '../../../engine/calendar/theme-mapper';
import { PROFECTION_HOUSE_THEMES } from '../../../engine/calendar/profection';

interface Props {
  monthData: MonthData;
  profection?: ProfectionData | null;
}

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

const PLANET_LABELS: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  chiron: 'Quíron', northNode: 'Nodo Norte',
};

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

export function MonthInsights(props: Props) {
  // Best days per theme
  const bestDaysByTheme = createMemo(() => {
    const themes: Record<Theme, number[]> = {} as any;

    for (const day of props.monthData.days) {
      if (day.energy !== 'favorable' && day.energyScore < 1) continue;

      for (const theme of day.themes) {
        if (!themes[theme]) themes[theme] = [];
        if (themes[theme].length < 3) {
          themes[theme].push(day.dayNumber);
        }
      }
    }

    return themes;
  });

  // Theme forecasts
  const themeForecasts = createMemo(() => {
    const forecasts: { theme: Theme; score: number; bestDays: number[]; summary: string }[] = [];

    const themeScores: Record<string, { positive: number; negative: number; total: number }> = {};

    for (const day of props.monthData.days) {
      for (const event of day.events) {
        if (event.type !== 'transit-aspect') continue;
        for (const theme of event.themes) {
          if (!themeScores[theme]) themeScores[theme] = { positive: 0, negative: 0, total: 0 };
          if (event.energy === 'positive') themeScores[theme].positive++;
          else if (event.energy === 'negative') themeScores[theme].negative++;
          themeScores[theme].total++;
        }
      }
    }

    for (const [theme, scores] of Object.entries(themeScores)) {
      if (scores.total < 2) continue;
      const net = scores.positive - scores.negative;
      const ratio = scores.positive / Math.max(1, scores.total);

      let summary: string;
      if (ratio >= 0.65) summary = 'Mês favorável — energia positiva predominante. Aproveite para avançar.';
      else if (ratio >= 0.45) summary = 'Mês misto — momentos de oportunidade e desafio se alternam. Escolha bem os dias.';
      else summary = 'Mês desafiador — paciência necessária. Reavalie e ajuste antes de agir.';

      forecasts.push({
        theme: theme as Theme,
        score: net,
        bestDays: bestDaysByTheme()[theme as Theme] || [],
        summary,
      });
    }

    return forecasts.sort((a, b) => b.score - a.score).slice(0, 6);
  });

  // Retro alerts
  const retroAlerts = createMemo(() => {
    return props.monthData.retroPeriods.map(r => ({
      planet: PLANET_LABELS[r.planet] || r.planet,
      sign: SIGN_NAMES[r.sign],
      message: getRetroMessage(r),
    }));
  });

  // Actionable tips
  const monthTips = createMemo(() => {
    const tips: string[] = [];
    const m = props.monthData;

    if (m.summary.bestDays.length > 0) {
      tips.push(`🟢 Melhores dias do mês: ${m.summary.bestDays.join(', ')}. Priorize decisões e inícios nesses dias.`);
    }
    if (m.summary.challengingDays.length > 0) {
      tips.push(`🔴 Dias mais tensos: ${m.summary.challengingDays.join(', ')}. Evite decisões impulsivas e conflitos.`);
    }

    const hasRetroMercury = m.retroPeriods.some(r => r.planet === 'mercury');
    if (hasRetroMercury) {
      tips.push('☿℞ Mercúrio retrógrado este mês: revise contratos, backup de dados, evite compras de eletrônicos.');
    }

    if (m.eclipses.length > 0) {
      tips.push('🌑 Eclipse(s) este mês: momento de viradas significativas. Não force — observe o que se revela.');
    }

    const profHouse = props.profection?.house;
    if (profHouse) {
      const houseTheme = PROFECTION_HOUSE_THEMES[profHouse];
      if (houseTheme) {
        tips.push(`📅 Profecção anual: Casa ${profHouse} (${houseTheme.theme}). Foco especial em: ${houseTheme.keywords.join(', ')}.`);
      }
    }

    return tips;
  });

  return (
    <div class="space-y-6">
      {/* Dicas Práticas do Mês */}
      <div class="glass rounded-2xl p-5">
        <h3 class="font-serif font-bold text-cream mb-4 flex items-center gap-2">
          <span class="text-gold">✦</span> Insights de {MONTH_NAMES[props.monthData.month]}
        </h3>

        <div class="space-y-2.5">
          <For each={monthTips()}>
            {(tip) => (
              <p class="text-sm text-cream-dark leading-relaxed">{tip}</p>
            )}
          </For>
        </div>
      </div>

      {/* Previsão por Tema */}
      <Show when={themeForecasts().length > 0}>
        <div class="glass rounded-2xl p-5">
          <h3 class="font-serif font-bold text-cream mb-4">Previsão por Área de Vida</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={themeForecasts()}>
              {(forecast) => {
                const info = THEME_INFO[forecast.theme];
                if (!info) return null;

                const barWidth = Math.min(100, Math.max(10, 50 + forecast.score * 10));
                const barColor = forecast.score >= 2 ? '#22c55e' : forecast.score <= -2 ? '#ef4444' : '#eab308';

                return (
                  <div class="p-4 rounded-xl bg-base-200/50 border border-base-300/50">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-lg">{info.icon}</span>
                      <span class="text-sm font-medium text-cream">{info.label}</span>
                    </div>

                    {/* Score bar */}
                    <div class="w-full h-1.5 bg-base-300 rounded-full mb-2 overflow-hidden">
                      <div class="h-full rounded-full transition-all" style={`width: ${barWidth}%; background: ${barColor};`} />
                    </div>

                    <p class="text-[11px] text-muted leading-relaxed mb-2">{forecast.summary}</p>

                    <Show when={forecast.bestDays.length > 0}>
                      <p class="text-[10px] text-gold">
                        ⭐ Melhores dias: {forecast.bestDays.join(', ')}
                      </p>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </Show>

      {/* Alertas de Retrógrados */}
      <Show when={retroAlerts().length > 0}>
        <div class="glass rounded-2xl p-5">
          <h3 class="font-serif font-bold text-cream mb-3">℞ Planetas Retrógrados</h3>
          <div class="space-y-3">
            <For each={retroAlerts()}>
              {(alert) => (
                <div class="flex items-start gap-3 p-3 rounded-lg bg-red-900/10 border border-red-800/20">
                  <span class="text-red-400 text-lg">℞</span>
                  <div>
                    <p class="text-sm font-medium text-cream">{alert.planet} em {alert.sign}</p>
                    <p class="text-xs text-muted mt-0.5">{alert.message}</p>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Profecção do Ano */}
      <Show when={props.profection}>
        <div class="glass rounded-2xl p-5">
          <h3 class="font-serif font-bold text-cream mb-3">📅 Seu Ano de Profecção</h3>
          {(() => {
            const p = props.profection!;
            const houseInfo = PROFECTION_HOUSE_THEMES[p.house];
            return (
              <div class="space-y-3">
                <div class="flex items-center gap-4">
                  <div class="text-center px-4 py-2 rounded-xl bg-purple-900/20 border border-purple-700/30">
                    <div class="text-2xl font-bold text-purple-300">{p.house}</div>
                    <div class="text-[10px] text-muted">Casa</div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-cream">{houseInfo?.theme || `Casa ${p.house}`}</p>
                    <p class="text-xs text-muted">{houseInfo?.focus}</p>
                  </div>
                </div>

                <div class="text-xs text-cream-dark space-y-1">
                  <p><strong>Senhor do Ano:</strong> {PLANET_LABELS[p.lord] || p.lord} em {SIGN_NAMES[p.lordNatalSign]} (Casa {p.lordNatalHouse})</p>
                  <p><strong>Idade:</strong> {p.age} anos (ciclo de 12 → Casa {p.house})</p>
                  <Show when={houseInfo}>
                    <p><strong>Palavras-chave:</strong> {houseInfo!.keywords.join(', ')}</p>
                  </Show>
                </div>

                <p class="text-[11px] text-muted italic leading-relaxed">
                  Trânsitos que ativam {PLANET_LABELS[p.lord] || p.lord} ou a Casa {p.house} terão impacto amplificado este ano.
                </p>
              </div>
            );
          })()}
        </div>
      </Show>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function getRetroMessage(retro: RetroPeriod): string {
  const messages: Record<string, string> = {
    mercury: 'Revisão de comunicações, contratos e tecnologia. Evite assinar documentos importantes. Reencontros e re-negociações possíveis.',
    venus: 'Reavaliação de valores, amor e finanças. Relacionamentos passados podem ressurgir. Evite procedimentos estéticos.',
    mars: 'Energia internalizada. Frustração se não canalizada em revisão de projetos. Evite confrontos diretos e cirurgias.',
    jupiter: 'Reavaliação de crenças e expansão. Oportunidades precisam de análise mais profunda antes de aceitar.',
    saturn: 'Revisão de estruturas e responsabilidades. Compromissos antigos pedem ajuste. Maturidade através da reflexão.',
    uranus: 'Revolução interna. Mudanças que pareciam urgentes podem ser reconsideradas. Inovação pede gestação.',
    neptune: 'Clareza espiritual. Ilusões se dissipam com o tempo. Criatividade voltada para dentro.',
    pluto: 'Transformação profunda em câmara lenta. Poder pessoal em revisão. Padrões inconscientes emergem.',
    chiron: 'Revisão de antigas feridas. Oportunidade de cura profunda. O que dói pede atenção.',
  };
  return messages[retro.planet] || 'Revisão e introspecção nas áreas regidas por este planeta.';
}
