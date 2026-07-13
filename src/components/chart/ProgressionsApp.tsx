import { createSignal, onMount, Show } from 'solid-js';
import PlanetTable from '../chart/PlanetTable';
import { calculateNatalChart, initSweph } from '../../engine/index';
import { calculateProgressions, calculateProgressedToNatalAspects } from '../../engine/progressions';
import { renderWheel } from '../../renderer/wheel';
import { getAspectSymbol, getAspectColor } from '../../engine/aspects';
import type { NatalChart, ProgressedChart, BirthData } from '../../engine/types';
import type { Profile } from '../../store/db';
import { db } from '../../store/db';
import { birthDataFromProfile } from '../../utils/profile';
import { dateInputToNoonDate, todayDateInput } from '../../utils/dateTime';
import type { Locale } from '../../i18n';

interface Props {
  locale: Locale;
}

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
};

const TEXT = {
  pt: {
    progressTo: 'Progredir até',
    age: 'Idade',
    targetDate: 'Data-alvo',
    activeAspects: 'Aspectos Prog → Natal',
    loading: 'Carregando progressões...',
    selectProfile: 'Selecione um perfil no menu superior (👤)',
    title: 'Progressões Secundárias',
  },
  en: {
    progressTo: 'Progress to',
    age: 'Age',
    targetDate: 'Target date',
    activeAspects: 'Prog → Natal Aspects',
    loading: 'Loading progressions...',
    selectProfile: 'Select a profile from the top menu (👤)',
    title: 'Secondary Progressions',
  },
} as const;

export default function ProgressionsApp(props: Props) {
  const text = TEXT[props.locale as keyof typeof TEXT] ?? TEXT.en;
  const [natal, setNatal] = createSignal<NatalChart | null>(null);
  const [progressed, setProgressed] = createSignal<ProgressedChart | null>(null);
  const [birthData, setBirthData] = createSignal<BirthData | null>(null);
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [targetDate, setTargetDate] = createSignal(todayDateInput());
  const [profileName, setProfileName] = createSignal('');
  const [p2nAspects, setP2nAspects] = createSignal<any[]>([]);
  const [error, setError] = createSignal('');

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
    try {
      setError('');
      const bd = birthDataFromProfile(profile);
      const chart = calculateNatalChart(bd);
      const profileDate = todayDateInput(profile.timeZoneId);
      setNatal(chart);
      setBirthData(bd);
      setProfileName(profile.name);
      setTargetDate(profileDate);
      calculate(chart, bd, profileDate);
    } catch (e: any) {
      console.error('Progressions error:', e);
      setError(e?.message || 'Erro ao calcular progressões');
    }
  };

  const calculate = (chart: NatalChart, bd: BirthData, dateStr: string) => {
    try {
      setError('');
      const date = dateInputToNoonDate(dateStr, chart.meta.timeZoneId, chart.meta.timezone);
      const prog = calculateProgressions(chart, bd, date);
      setProgressed(prog);
      setWheelSvg(renderWheel(prog as any));
      const aspects = calculateProgressedToNatalAspects(prog, chart);
      setP2nAspects(aspects);
    } catch (e: any) {
      console.error('Progressions calculation error:', e);
      setError(e?.message || 'Erro ao calcular progressões');
    }
  };

  const handleDateChange = (dateStr: string) => {
    setTargetDate(dateStr);
    if (natal() && birthData()) calculate(natal()!, birthData()!, dateStr);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div class="lg:col-span-1 lg:sticky lg:top-20 flex flex-col gap-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-hidden">
        <Show when={natal()}>
          <div class="glass rounded-2xl p-4">
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">{text.progressTo}</h3>
            <input
              type="date" value={targetDate()}
              onInput={(e) => handleDateChange(e.currentTarget.value)}
              class="w-full px-3 py-2 rounded-lg border border-base-400 bg-base-200 text-cream text-sm"
            />
            <Show when={progressed()}>
              <p class="text-xs text-muted mt-2">{text.age}: {progressed()!.age} years</p>
              <p class="text-xs text-muted">{text.targetDate}: {targetDate()}</p>
            </Show>
          </div>

          {/* Progressed to Natal aspects */}
          <Show when={p2nAspects().length > 0}>
            <div class="glass rounded-2xl p-4 flex-1 flex flex-col">
              <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">
                {text.activeAspects} ({p2nAspects().length})
              </h3>
              <div class="space-y-1 flex-1 overflow-y-auto text-xs">
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
            <Show when={error()}>
              <div class="p-3 mb-4 bg-red-900/20 border border-red-800/30 rounded-lg text-sm text-red-400">
                {error()}
              </div>
            </Show>
            <div class="text-5xl mb-3">⟳</div>
            <p>{text.loading}</p>
            <p class="text-xs mt-2">{text.selectProfile}</p>
          </div>
        }>
          <div class="glass rounded-2xl p-4">
            <div class="text-center text-sm text-muted mb-2">
              {text.title} — <strong>{profileName()}</strong> — {text.age} {progressed()!.age}
            </div>
            <div class="w-full max-w-[600px] mx-auto" innerHTML={wheelSvg()} />
          </div>
          <PlanetTable chart={progressed() as any} />
        </Show>
      </div>
    </div>
  );
}
