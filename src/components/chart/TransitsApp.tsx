import { createSignal, onMount, Show, For } from 'solid-js';
import ProfileSelector from '../forms/ProfileSelector';
import { calculateNatalChart, calculateTransits, initSweph } from '../../engine/index';
import { renderBiWheel } from '../../renderer/wheel';
import type { NatalChart, TransitChart, BirthData } from '../../engine/types';
import type { Profile } from '../../store/db';
import { db } from '../../store/db';
import { getSignIndex, getDegreeInSign, formatDegMin } from '../../engine/calculations';
import { getAspectColor, getAspectSymbol } from '../../engine/aspects';
import { getHouseForLongitude } from '../../engine/houses';
import { getTransitTextWithFallback } from '../../engine/calendar/calendar-texts';
import { THEME_INFO, mapEventThemes } from '../../engine/calendar/theme-mapper';
import type { Theme } from '../../engine/calendar/types';
import { birthDataFromProfile } from '../../utils/profile';
import { addDaysToDateInput, addMonthsToDateInput, dateInputToNoonDate, todayDateInput } from '../../utils/dateTime';
import type { Locale } from '../../i18n';

interface Props {
  locale: Locale;
}

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

const TEXT = {
  pt: {
    selectProfile: 'Selecione um perfil no menu superior (👤) para ver os trânsitos.',
    loading: 'Carregando perfil...',
    title: 'Data dos Trânsitos',
    today: 'Hoje',
    activeAspects: 'Aspectos Ativos',
    dayLabel: 'Trânsitos de',
    dayFor: 'para',
    summaryTitle: 'Resumo do dia',
    activeThemes: 'Áreas ativadas:',
    favorable: 'Dia Favorável',
    challenging: 'Dia Tenso',
    neutral: 'Dia Neutro',
    calculating: 'Calculando...',
  },
  en: {
    selectProfile: 'Select a profile from the top menu (👤) to see transits.',
    loading: 'Loading profile...',
    title: 'Transit Date',
    today: 'Today',
    activeAspects: 'Active Aspects',
    dayLabel: 'Transits for',
    dayFor: 'for',
    summaryTitle: 'Day summary',
    activeThemes: 'Activated areas:',
    favorable: 'Favorable Day',
    challenging: 'Tense Day',
    neutral: 'Neutral Day',
    calculating: 'Calculating...',
  },
} as const;

export default function TransitsApp(props: Props) {
  const text = TEXT[props.locale as keyof typeof TEXT] ?? TEXT.en;
  const [natalChart, setNatalChart] = createSignal<NatalChart | null>(null);
  const [transits, setTransits] = createSignal<TransitChart | null>(null);
  const [transitDate, setTransitDate] = createSignal(todayDateInput());
  const [wheelSvg, setWheelSvg] = createSignal('');

  onMount(async () => {
    await initSweph();

    // Auto-load last profile
    try {
      const profiles = await db.profiles.orderBy('id').reverse().limit(1).toArray();
      if (profiles.length > 0) {
        handleProfileSelect(profiles[0]);
      }
    } catch { /* ignore */ }

    // Listen for profile changes from Header
    window.addEventListener('lifemap:profile-change', (e: any) => {
      if (e.detail) handleProfileSelect(e.detail);
    });
  });

  const handleProfileSelect = (profile: Profile) => {
    const chart = calculateNatalChart(birthDataFromProfile(profile));
    const dateForProfile = todayDateInput(profile.timeZoneId);
    setNatalChart(chart);
    setTransitDate(dateForProfile);
    calculateTransitsForDate(chart, dateForProfile);
  };

  const calculateTransitsForDate = (natal: NatalChart, dateStr: string) => {
    const tDate = dateInputToNoonDate(dateStr, natal.meta.timeZoneId, natal.meta.timezone);
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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left: Date + Aspects */}
      <div class="lg:col-span-1 lg:sticky lg:top-20 flex flex-col gap-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-hidden">
        <Show when={!natalChart()}>
          <div class="glass rounded-2xl p-4 text-center">
            <p class="text-xs text-muted">{text.selectProfile}</p>
          </div>
        </Show>

        <Show when={natalChart()}>
          <div class="glass rounded-2xl p-4">
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">
              {text.title}
            </h3>
            <input
              type="date"
              value={transitDate()}
              onInput={(e) => handleDateChange(e.currentTarget.value)}
              class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-200 text-cream text-sm"
            />
            <div class="flex gap-2 mt-2">
              <button
                onClick={() => handleDateChange(todayDateInput(natalChart()?.meta.timeZoneId))}
                class="px-3 py-1 text-xs bg-gold/10 text-gold rounded"
              >
                {text.today}
              </button>
              <button
                onClick={() => {
                  handleDateChange(addDaysToDateInput(transitDate(), 1));
                }}
                class="px-3 py-1 text-xs bg-base-200 text-cream-dark rounded"
              >
                +1 dia
              </button>
              <button
                onClick={() => {
                  handleDateChange(addMonthsToDateInput(transitDate(), 1));
                }}
                class="px-3 py-1 text-xs bg-base-200 text-cream-dark rounded"
              >
                +1 mês
              </button>
            </div>
          </div>

          {/* Transit aspects list */}
          <Show when={transits()}>
            <div class="glass rounded-2xl p-4 flex-1 flex flex-col">
              <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">
                {text.activeAspects} ({transits()!.aspects.length})
              </h3>
              <div class="space-y-1 flex-1 overflow-y-auto">
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
            <p>{text.loading}</p>
            <p class="text-xs mt-2">{text.selectProfile}</p>
          </div>
        }>
          <div class="glass rounded-2xl p-4">
            <div class="text-center text-sm text-muted mb-2">
              {text.dayLabel} <strong>{transitDate()}</strong> {text.dayFor} <strong>{natalChart()!.meta.name || 'Natal'}</strong>
            </div>
            <div class="w-full max-w-[600px] mx-auto" innerHTML={wheelSvg()} />
          </div>

          {/* Interpretação dos Trânsitos */}
          <Show when={transits()}>
            <TransitInterpretation transits={transits()!} natal={natalChart()!} date={transitDate()} labels={text} />
          </Show>
        </Show>
      </div>
    </div>
  );
}

// ============================================================
// TransitInterpretation — Painel de interpretação abaixo do bi-wheel
// ============================================================

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

const ASPECT_NATURE: Record<string, 'positive' | 'negative' | 'neutral'> = {
  conjunction: 'neutral', sextile: 'positive', square: 'negative',
  trine: 'positive', opposition: 'negative',
};

const ASPECT_NAMES: Record<string, string> = {
  conjunction: 'Conjunção', sextile: 'Sextil', square: 'Quadratura',
  trine: 'Trígono', opposition: 'Oposição',
};

function TransitInterpretation(props: { transits: TransitChart; natal: NatalChart; date: string; labels: { favorable: string; challenging: string; neutral: string; summaryTitle: string } }) {
  // Get top aspects sorted by exactness (tightest orb = most active)
  const topAspects = () => {
    return [...props.transits.aspects]
      .sort((a, b) => a.orb - b.orb)
      .slice(0, 8);
  };

  // Determine overall energy
  const dayEnergy = () => {
    let score = 0;
    for (const asp of topAspects()) {
      const nature = ASPECT_NATURE[asp.type] || 'neutral';
      if (nature === 'positive') score += (1 / Math.max(0.5, asp.orb));
      else if (nature === 'negative') score -= (1 / Math.max(0.5, asp.orb));
    }
    if (score > 1.5) return { label: props.labels.favorable, color: 'text-green-400', icon: '🟢', desc: 'Harmonious transits dominate. Energy flows more easily.' };
    if (score < -1.5) return { label: props.labels.challenging, color: 'text-red-400', icon: '🔴', desc: 'Active tension. Move carefully and channel the energy.' };
    return { label: props.labels.neutral, color: 'text-yellow-400', icon: '🟡', desc: 'Mixed energy. Observe before acting.' };
  };

  // Active themes
  const activeThemes = () => {
    const themeCount: Record<string, number> = {};
    for (const asp of topAspects()) {
      const house = props.transits.transitHouses[asp.planet1] || 1;
      // Simple theme mapping from planet
      const planetThemes: Record<string, Theme[]> = {
        venus: ['love', 'finances'], mars: ['health', 'career'],
        jupiter: ['finances', 'travel'], saturn: ['career'],
        sun: ['career', 'creativity'], moon: ['family', 'health'],
        mercury: ['communication'], uranus: ['freedom'],
        neptune: ['spirituality'], pluto: ['transformation'],
      };
      const themes = planetThemes[asp.planet1] || [];
      for (const t of themes) themeCount[t] = (themeCount[t] || 0) + 1;
    }
    return Object.entries(themeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([t]) => t as Theme);
  };

  return (
    <div class="space-y-4 mt-6">
      {/* Resumo do dia */}
      <div class="glass rounded-2xl p-5">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-2xl">{dayEnergy().icon}</span>
          <div>
            <h3 class={`font-serif font-bold ${dayEnergy().color}`}>{dayEnergy().label}</h3>
            <p class="text-xs text-muted">{dayEnergy().desc}</p>
          </div>
        </div>

        {/* Active themes */}
        <Show when={activeThemes().length > 0}>
          <div class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-base-300/50">
            <span class="text-[10px] text-muted uppercase self-center">Activated areas:</span>
            <For each={activeThemes()}>
              {(theme) => (
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border"
                  style={`color: ${THEME_INFO[theme]?.color}; border-color: ${THEME_INFO[theme]?.color}40; background: ${THEME_INFO[theme]?.color}10;`}
                >
                  {THEME_INFO[theme]?.icon} {THEME_INFO[theme]?.label}
                </span>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Interpretação dos aspectos principais */}
      <div class="glass rounded-2xl p-5">
        <h3 class="font-serif font-bold text-cream mb-4">✦ {props.labels.summaryTitle}</h3>

        <div class="space-y-4">
          <For each={topAspects()}>
            {(asp) => {
              const text = getTransitTextWithFallback(asp.planet1, asp.planet2, asp.type);
              const nature = ASPECT_NATURE[asp.type] || 'neutral';
              const borderColor = nature === 'positive' ? 'border-l-green-500' : nature === 'negative' ? 'border-l-red-500' : 'border-l-gray-500';
              const house = props.transits.transitHouses[asp.planet1] || 0;
              const transitSign = props.transits.positions[asp.planet1] ? getSignIndex(props.transits.positions[asp.planet1].longitude) : 0;
              const isRetro = props.transits.positions[asp.planet1]?.isRetrograde;

              return (
                <div class={`p-4 rounded-xl bg-base-200/40 border-l-3 ${borderColor}`}>
                  {/* Header */}
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span style={{ color: getAspectColor(asp.type) }} class="text-lg">
                        {PLANET_SYMBOLS[asp.planet1]}
                      </span>
                      <span class="text-sm font-medium text-cream">
                        {PLANET_NAMES[asp.planet1]} {ASPECT_NAMES[asp.type] || asp.type} {PLANET_NAMES[asp.planet2]} natal
                      </span>
                      {isRetro && <span class="text-[10px] text-red-400">℞</span>}
                    </div>
                    <div class="text-right">
                      <span class="text-xs text-muted font-mono">orbe {asp.orb.toFixed(1)}°</span>
                      <Show when={house > 0}>
                        <span class="text-[10px] text-muted block">Casa {house}</span>
                      </Show>
                    </div>
                  </div>

                  {/* Position info */}
                  <p class="text-[10px] text-muted mb-2">
                    {PLANET_NAMES[asp.planet1]} em {SIGN_NAMES[transitSign]} • Casa {house} do mapa natal
                  </p>

                  {/* Interpretation */}
                  <p class="text-sm text-cream-dark leading-relaxed">{text.summary}</p>

                  {/* Advice */}
                  <Show when={text.advice}>
                    <p class="text-xs text-gold mt-2 italic">💡 {text.advice}</p>
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </div>

      {/* Dica geral */}
      <div class="glass rounded-2xl p-4 border-gold/20">
        <p class="text-xs text-cream-dark leading-relaxed">
          <span class="text-gold font-medium">✦ Como usar:</span>{' '}
          Os trânsitos mostram a "meteorologia cósmica" do dia em relação ao seu mapa natal.
          Aspectos harmoniosos (trígono △, sextil ✶) indicam facilidade; tensos (quadratura □, oposição ☍) pedem ajuste.
          Planetas lentos (Saturno, Urano, Netuno, Plutão) marcam ciclos de meses; rápidos (Sol, Lua, Mercúrio) duram horas a dias.
        </p>
      </div>
    </div>
  );
}
