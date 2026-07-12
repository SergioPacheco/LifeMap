// ============================================================
// YearInsights.tsx — Painel de Insights Anuais (abaixo da view ano)
// Resumo do ano: melhores meses, temas dominantes, retornos, eclipses, profecção
// ============================================================

import { For, Show, createMemo } from 'solid-js';
import type { NatalChart } from '../../../engine/types';
import type { CalendarConfig, DayEnergy, ProfectionData } from '../../../engine/calendar/types';
import { THEME_INFO } from '../../../engine/calendar/theme-mapper';
import { PROFECTION_HOUSE_THEMES, getProfectionForDate } from '../../../engine/calendar/profection';
import { calendarDateAtLocalTime, getCalendarTimeContext } from '../../../engine/calendar/calendar-date';

interface MonthSummary {
  month: number;
  favorable: number;
  tense: number;
  special: number;
  total: number;
}

interface Props {
  year: number;
  months: { month: number; days: { energy: DayEnergy; date: number }[] }[];
  natal: NatalChart;
  config: CalendarConfig;
}

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MONTH_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const PLANET_LABELS: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  chiron: 'Quíron', northNode: 'Nodo Norte',
};

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

// Eclipses hardcoded for display
const ECLIPSES_BY_YEAR: Record<number, { month: number; type: string; sign: string; degree: number }[]> = {
  2025: [
    { month: 2, type: 'Lunar Total', sign: 'Virgem', degree: 23 },
    { month: 2, type: 'Solar Parcial', sign: 'Áries', degree: 8 },
    { month: 8, type: 'Lunar Total', sign: 'Peixes', degree: 15 },
    { month: 8, type: 'Solar Parcial', sign: 'Virgem', degree: 28 },
  ],
  2026: [
    { month: 1, type: 'Solar Anular', sign: 'Aquário', degree: 28 },
    { month: 2, type: 'Lunar Total', sign: 'Virgem', degree: 12 },
    { month: 7, type: 'Solar Total', sign: 'Leão', degree: 19 },
    { month: 7, type: 'Lunar Parcial', sign: 'Peixes', degree: 4 },
  ],
  2027: [
    { month: 1, type: 'Solar Anular', sign: 'Aquário', degree: 17 },
    { month: 1, type: 'Lunar Penumbral', sign: 'Virgem', degree: 2 },
    { month: 7, type: 'Solar Total', sign: 'Leão', degree: 9 },
    { month: 7, type: 'Lunar Penumbral', sign: 'Aquário', degree: 24 },
  ],
  2028: [
    { month: 0, type: 'Lunar Parcial', sign: 'Câncer', degree: 21 },
    { month: 0, type: 'Solar Anular', sign: 'Aquário', degree: 6 },
    { month: 6, type: 'Lunar Parcial', sign: 'Capricórnio', degree: 14 },
    { month: 6, type: 'Solar Total', sign: 'Câncer', degree: 29 },
    { month: 11, type: 'Lunar Total', sign: 'Câncer', degree: 10 },
  ],
};

export function YearInsights(props: Props) {
  // Month summaries
  const monthSummaries = createMemo((): MonthSummary[] => {
    return props.months.map(m => {
      const favorable = m.days.filter(d => d.energy === 'favorable').length;
      const tense = m.days.filter(d => d.energy === 'tense').length;
      const special = m.days.filter(d => d.energy === 'special').length;
      return { month: m.month, favorable, tense, special, total: m.days.length };
    });
  });

  // Best months (most favorable days)
  const bestMonths = createMemo(() =>
    [...monthSummaries()].sort((a, b) => b.favorable - a.favorable).slice(0, 3)
  );

  // Challenging months (most tense days)
  const challengingMonths = createMemo(() =>
    [...monthSummaries()].sort((a, b) => b.tense - a.tense).slice(0, 3)
  );

  // Year totals
  const yearTotals = createMemo(() => {
    const totals = { favorable: 0, tense: 0, special: 0, neutral: 0 };
    for (const m of monthSummaries()) {
      totals.favorable += m.favorable;
      totals.tense += m.tense;
      totals.special += m.special;
      totals.neutral += m.total - m.favorable - m.tense - m.special;
    }
    return totals;
  });

  // Profection
  const profection = createMemo(() =>
    getProfectionForDate(props.natal, calendarDateAtLocalTime(props.year, 6, 1, 12, 0, getCalendarTimeContext(props.natal)), props.config)
  );

  // Eclipses for this year
  const eclipses = createMemo(() => ECLIPSES_BY_YEAR[props.year] || []);

  return (
    <div class="space-y-6">
      {/* Resumo Geral do Ano */}
      <div class="glass rounded-2xl p-5">
        <h3 class="font-serif font-bold text-cream mb-4 flex items-center gap-2">
          <span class="text-gold">✦</span> Resumo de {props.year}
        </h3>

        {/* Totals bar */}
        <div class="flex items-center gap-1 h-4 rounded-full overflow-hidden mb-4">
          <div class="h-full bg-green-500 rounded-l-full" style={`width: ${(yearTotals().favorable / 365) * 100}%`} />
          <div class="h-full bg-gray-600" style={`width: ${(yearTotals().neutral / 365) * 100}%`} />
          <div class="h-full bg-red-500" style={`width: ${(yearTotals().tense / 365) * 100}%`} />
          <div class="h-full bg-yellow-500 rounded-r-full" style={`width: ${(yearTotals().special / 365) * 100}%`} />
        </div>

        <div class="grid grid-cols-4 gap-3 text-center text-xs">
          <div>
            <div class="text-lg font-bold text-green-400">{yearTotals().favorable}</div>
            <div class="text-muted">Favoráveis</div>
          </div>
          <div>
            <div class="text-lg font-bold text-gray-400">{yearTotals().neutral}</div>
            <div class="text-muted">Neutros</div>
          </div>
          <div>
            <div class="text-lg font-bold text-red-400">{yearTotals().tense}</div>
            <div class="text-muted">Tensos</div>
          </div>
          <div>
            <div class="text-lg font-bold text-yellow-400">{yearTotals().special}</div>
            <div class="text-muted">Especiais</div>
          </div>
        </div>
      </div>

      {/* Melhores e Piores Meses */}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="glass rounded-2xl p-5">
          <h4 class="text-sm font-semibold text-green-400 mb-3">🟢 Melhores Meses</h4>
          <div class="space-y-2">
            <For each={bestMonths()}>
              {(m) => (
                <div class="flex items-center justify-between">
                  <span class="text-sm text-cream">{MONTH_NAMES[m.month]}</span>
                  <span class="text-xs text-green-400 font-medium">{m.favorable} dias favoráveis</span>
                </div>
              )}
            </For>
          </div>
          <p class="text-[10px] text-muted mt-3 italic">
            Priorize decisões importantes, inícios e lançamentos nesses meses.
          </p>
        </div>

        <div class="glass rounded-2xl p-5">
          <h4 class="text-sm font-semibold text-red-400 mb-3">🔴 Meses Mais Desafiadores</h4>
          <div class="space-y-2">
            <For each={challengingMonths()}>
              {(m) => (
                <div class="flex items-center justify-between">
                  <span class="text-sm text-cream">{MONTH_NAMES[m.month]}</span>
                  <span class="text-xs text-red-400 font-medium">{m.tense} dias tensos</span>
                </div>
              )}
            </For>
          </div>
          <p class="text-[10px] text-muted mt-3 italic">
            Nesses meses, prefira consolidar, revisar e evitar grandes riscos.
          </p>
        </div>
      </div>

      {/* Energy by Month (mini chart) */}
      <div class="glass rounded-2xl p-5">
        <h4 class="text-sm font-semibold text-cream mb-3">📊 Energia Mês a Mês</h4>
        <div class="flex items-end gap-1 h-24">
          <For each={monthSummaries()}>
            {(m) => {
              const maxDays = 31;
              const favH = (m.favorable / maxDays) * 100;
              const tensH = (m.tense / maxDays) * 100;
              return (
                <div class="flex-1 flex flex-col items-center gap-0.5">
                  <div class="w-full flex flex-col gap-px" style="height: 80px;">
                    <div class="w-full bg-green-500/80 rounded-t-sm" style={`height: ${favH}%`} />
                    <div class="w-full bg-red-500/80 rounded-b-sm" style={`height: ${tensH}%`} />
                  </div>
                  <span class="text-[8px] text-muted">{MONTH_SHORT[m.month]}</span>
                </div>
              );
            }}
          </For>
        </div>
        <div class="flex justify-center gap-4 mt-2 text-[9px] text-muted">
          <span class="flex items-center gap-1"><span class="w-2 h-2 bg-green-500 rounded-sm"></span> Favoráveis</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 bg-red-500 rounded-sm"></span> Tensos</span>
        </div>
      </div>

      {/* Eclipses do Ano */}
      <Show when={eclipses().length > 0}>
        <div class="glass rounded-2xl p-5">
          <h4 class="text-sm font-semibold text-cream mb-3">🌑 Eclipses de {props.year}</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <For each={eclipses()}>
              {(ecl) => (
                <div class="p-3 rounded-lg bg-base-200/50 border border-base-300/50">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{ecl.type.includes('Solar') ? '🌑' : '🌕'}</span>
                    <div>
                      <p class="text-xs font-medium text-cream">{ecl.type}</p>
                      <p class="text-[10px] text-muted">{MONTH_NAMES[ecl.month]} • {ecl.degree}° {ecl.sign}</p>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
          <p class="text-[10px] text-muted mt-3 italic">
            Eclipses marcam viradas de ciclo. Observe quais áreas do seu mapa são ativadas.
          </p>
        </div>
      </Show>

      {/* Profecção do Ano */}
      <Show when={profection()}>
        {(() => {
          const p = profection()!;
          const houseInfo = PROFECTION_HOUSE_THEMES[p.house];
          return (
            <div class="glass rounded-2xl p-5">
              <h4 class="text-sm font-semibold text-cream mb-3">📅 Profecção Anual — {props.year}</h4>
              <div class="flex items-center gap-4 mb-3">
                <div class="text-center px-5 py-3 rounded-xl bg-purple-900/20 border border-purple-700/30">
                  <div class="text-3xl font-bold text-purple-300">{p.house}</div>
                  <div class="text-[10px] text-muted">Casa</div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-cream">{houseInfo?.theme || `Casa ${p.house}`}</p>
                  <p class="text-xs text-muted mt-0.5">{houseInfo?.focus}</p>
                  <p class="text-xs text-cream-dark mt-1">
                    <strong>Senhor do Ano:</strong> {PLANET_LABELS[p.lord] || p.lord} em {SIGN_NAMES[p.lordNatalSign]}
                  </p>
                </div>
              </div>
              <Show when={houseInfo}>
                <div class="flex flex-wrap gap-2 mt-2">
                  <For each={houseInfo!.keywords}>
                    {(kw) => (
                      <span class="px-2 py-0.5 text-[10px] rounded-full bg-purple-900/20 border border-purple-700/20 text-purple-300">
                        {kw}
                      </span>
                    )}
                  </For>
                </div>
              </Show>
              <p class="text-[11px] text-muted mt-3 italic leading-relaxed">
                O ano inteiro tem foco especial em temas da Casa {p.house}. Trânsitos que ativam {PLANET_LABELS[p.lord] || p.lord} (seu Senhor do Ano) terão impacto amplificado.
              </p>
            </div>
          );
        })()}
      </Show>

      {/* Dica geral */}
      <div class="glass rounded-2xl p-5 border-gold/20">
        <p class="text-sm text-cream-dark leading-relaxed">
          <span class="text-gold font-medium">✦ Dica do Ano:</span>{' '}
          <Show when={yearTotals().favorable > yearTotals().tense}>
            Ano predominantemente favorável ({yearTotals().favorable} dias positivos vs {yearTotals().tense} desafiadores). Aproveite o momentum para iniciar projetos de longo prazo nos meses melhores e usar os meses tensos para revisão e ajuste.
          </Show>
          <Show when={yearTotals().favorable <= yearTotals().tense}>
            Ano que exige maturidade e estratégia ({yearTotals().tense} dias desafiadores vs {yearTotals().favorable} favoráveis). Concentre iniciativas importantes nos meses verdes e use os meses vermelhos para fortalecer fundações, não para arriscar.
          </Show>
        </p>
      </div>
    </div>
  );
}
