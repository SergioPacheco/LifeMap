import { createSignal, onMount, Show, For } from 'solid-js';
import { calculatePositions, calculateNatalChart, initSweph, getSignIndex } from '../../engine/index';
import { calculateFullHouses, getHouseForLongitude } from '../../engine/houses';
import { calculateAspects } from '../../engine/aspects';
import { renderWheel } from '../../renderer/wheel';
import PlanetTable from './PlanetTable';
import { db, type Profile } from '../../store/db';
import { birthDataFromProfile } from '../../utils/profile';
import { isValidTimeZone, localeToDateLocale, pad2, zonedDateTimeToUtc } from '../../utils/dateTime';
import type { Locale } from '../../i18n';

// ============================================================
// TYPES
// ============================================================

interface LunarReturnResult {
  date: Date;
  positions: any;
  houses: any;
  aspects: any;
  planetHouses: Record<string, number>;
}

// ============================================================
// CONSTANTS
// ============================================================

const SIGN_NAMES = [
  'Áries','Touro','Gêmeos','Câncer','Leão','Virgem',
  'Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'
];

const MOON_SIGN_THEME: string[] = [
  'Lua retorna em Áries — mês de ação direta, iniciativa e impulsividade emocional. Energia alta, menos paciência. Ótimo para começar algo novo, sem medo.',
  'Lua retorna em Touro — mês de conforto, prazer sensorial e estabilidade emocional. Foco em segurança, rotinas e o que nutre o corpo e a alma.',
  'Lua retorna em Gêmeos — mês de muita conversa, informação e conexões superficiais mas estimulantes. A mente dita as emoções.',
  'Lua retorna em Câncer — mês de máxima sensibilidade, intuição e necessidade de ninho. Casa, família e memória afetiva em foco.',
  'Lua retorna em Leão — mês de expressão emocional intensa, criatividade e necessidade de reconhecimento. Romance e alegria em destaque.',
  'Lua retorna em Virgem — mês de análise emocional, atenção aos detalhes e cuidado com o corpo. Emoções processadas pela utilidade.',
  'Lua retorna em Libra — mês voltado para relacionamentos e equilíbrio interior. Necessidade de harmonia e conexão genuína.',
  'Lua retorna em Escorpião — mês intenso de profundidade emocional, intuição aguçada e confronto com sombras. Transformação através da honestidade.',
  'Lua retorna em Sagitário — mês de otimismo, liberdade emocional e sede de significado. Filosofia e aventura nutrem a alma.',
  'Lua retorna em Capricórnio — mês de disciplina emocional e foco em metas concretas. Sentimentos contidos mas produtivos.',
  'Lua retorna em Aquário — mês de desapego, originalidade e conexão com o coletivo. Emoções processadas pelo intelecto e por causas.',
  'Lua retorna em Peixes — mês de alta sensibilidade, espiritualidade e porosidade emocional. Intuição máxima, mas fronteiras frágeis.',
];

const LR_ASC_INTERP: string[] = [
  'ASC em Áries: você entra neste mês com energia e impaciência. Impulso para agir rápido é forte — canalizar isso evita conflitos desnecessários.',
  'ASC em Touro: você entra neste mês buscando solidez. Conforto, rotina e beleza são seus aliados. Resistência a mudanças pode ser um desafio.',
  'ASC em Gêmeos: você entra neste mês curioso e comunicativo. Múltiplos projetos, conversas e informações chegam ao mesmo tempo.',
  'ASC em Câncer: você entra neste mês mais sensível e protetora. Home office, família e cuidado são temas recorrentes.',
  'ASC em Leão: você entra neste mês radiante. Autoexpressão, criatividade e desejo de brilhar são marcas do período.',
  'ASC em Virgem: você entra neste mês analítica e organizada. Saúde, serviço e aprimoramento pessoal ganham foco.',
  'ASC em Libra: você entra neste mês sociável e equilibrada. Relacionamentos e estética tomam a linha de frente.',
  'ASC em Escorpião: você entra neste mês com intensidade e perspicácia. O que está oculto vem à tona — boa época para investigar e transformar.',
  'ASC em Sagitário: você entra neste mês otimista e expansiva. Desejo de liberdade, estudo ou viagem é forte.',
  'ASC em Capricórnio: você entra neste mês focada em resultados. Ambição e disciplina são seus instrumentos principais.',
  'ASC em Aquário: você entra neste mês inovadora e independente. Ideias originais e grupos ou amizades ganham importância.',
  'ASC em Peixes: você entra neste mês sensível e intuitiva. Sonhos, arte e recolhimento são nutritivos; cuidado com o que drena.',
];

const LR_MOON_HOUSE: string[] = [
  'Lua de RL na Casa 1: suas emoções estão no centro de tudo. Mês de introspecção e reorganização do eu. Como você se sente determina tudo.',
  'Lua de RL na Casa 2: segurança emocional ligada ao dinheiro e conforto. Finanças e autoestima oscilam juntas neste período.',
  'Lua de RL na Casa 3: emoções se expressam pela comunicação. Conversas com irmãos, amigos próximos e vizinhos ganham peso afetivo.',
  'Lua de RL na Casa 4: mês muito doméstico e introspectivo. Família e lar são o centro emocional. Possível mudança ou resolução de questões domésticas.',
  'Lua de RL na Casa 5: emoções no romance, criatividade e filhos. Mês de prazer, expressão artística e paixões intensas.',
  'Lua de RL na Casa 6: emoções impactam diretamente a saúde e o trabalho. Ambiente profissional carregado emocionalmente — cuidar de si é prioridade.',
  'Lua de RL na Casa 7: necessidade emocional de parceria e conexão. Relacionamento é o espelho e a fonte de nutrição neste mês.',
  'Lua de RL na Casa 8: mês de emoções profundas e transformadoras. Intimidade, ciclos que fecham e questões de confiança estão em pauta.',
  'Lua de RL na Casa 9: necessidade emocional de expansão — estudo, viagem ou busca de sentido nutrem a alma neste período.',
  'Lua de RL na Casa 10: vida pública e carreira emocionalmente carregadas. Visibilidade e reconhecimento impactam o humor.',
  'Lua de RL na Casa 11: emoções se processam em grupo. Amizades profundas e pertencimento coletivo trazem alimento emocional.',
  'Lua de RL na Casa 12: mês de vida interior intensa. Sonhos, solidão produtiva e processamento de ciclos inconscientes. Retiro beneficia.',
];

const LR_SUN_HOUSE: string[] = [
  'Sol de RL na Casa 1: o foco do mês é você — identidade, aparência e presença pessoal. Ótimo para projetos que exigem protagonismo.',
  'Sol de RL na Casa 2: foco em dinheiro, valores pessoais e autossuficiência. Decisões financeiras importantes.',
  'Sol de RL na Casa 3: foco em comunicação, aprendizado e conexões locais. Mês movimentado mentalmente.',
  'Sol de RL na Casa 4: foco em lar, família e raízes. Vida interior e doméstica em primeiro plano.',
  'Sol de RL na Casa 5: foco em criatividade, romance e autoexpressão. Mês de diversão e inspiração.',
  'Sol de RL na Casa 6: foco em saúde, trabalho e rotinas. Bom para reorganizar hábitos e cuidar do corpo.',
  'Sol de RL na Casa 7: foco em relacionamentos e parcerias. Acordos, contratos e conexões significativas em pauta.',
  'Sol de RL na Casa 8: foco em transformação, recursos compartilhados e intimidade profunda.',
  'Sol de RL na Casa 9: foco em expansão — viagens, filosofia, estudos e novos horizontes.',
  'Sol de RL na Casa 10: foco em carreira e reputação. Mês de visibilidade e conquistas profissionais.',
  'Sol de RL na Casa 11: foco em amizades, grupos e projetos futuros. Networking e causas coletivas.',
  'Sol de RL na Casa 12: foco em recolhimento e processamento interno. Mês de descanso espiritual e reflexão.',
];

const SATURN_HOUSE: string[] = [
  'Saturno na Casa 1: atenção à saúde e presença. Mês de autoimposição de limites ou cobrança externa da sua postura.',
  'Saturno na Casa 2: cuidado com gastos impulsivos. Disciplina financeira traz resultados duradouros.',
  'Saturno na Casa 3: comunicação exige mais cuidado e precisão. Possível dificuldade com irmãos ou vizinhos.',
  'Saturno na Casa 4: foco na estrutura do lar e família. Responsabilidades domésticas mais pesadas — mas construtivas.',
  'Saturno na Casa 5: criatividade exige mais esforço. Romance pode demandar seriedade ou comprometimento real.',
  'Saturno na Casa 6: saúde e trabalho pedem disciplina. Bom para criar rotinas sólidas e duradouras.',
  'Saturno na Casa 7: relacionamentos exigem maturidade e comprometimento real. Evitar soluções de curto prazo.',
  'Saturno na Casa 8: transformações profundas que exigem paciência. Questões de herança, dívidas ou intimidade ganham seriedade.',
  'Saturno na Casa 9: expansão exige planejamento. Estudos e viagens com estrutura e propósito.',
  'Saturno na Casa 10: carreira em foco com cobranças. Excelente para trabalho duro que gera reconhecimento real.',
  'Saturno na Casa 11: amizades e grupos com expectativas. Cuidado com decepções coletivas — qualidade sobre quantidade.',
  'Saturno na Casa 12: processos internos demandam disciplina. Recolhimento, meditação e fechamento de ciclos são favorecidos.',
];

// ============================================================
// LUNAR RETURN CALCULATION
// ============================================================

function calculateLunarReturn(
  natalMoonLon: number,
  year: number,
  month: number,
  lat: number,
  lng: number,
  timezone: number,
  timeZoneId?: string
): LunarReturnResult | null {
  // Moon orbital period ~27.32 days, speed ~13.17°/day
  // Start search from first day of requested month
  const monthStart = `${year}-${pad2(month + 1)}-01`;
  const searchStart = zonedDateTimeToUtc(monthStart, '00:00', timeZoneId, timezone);
  const searchEnd = new Date(searchStart.getTime() + 36 * 86400000);

  let bestDate: Date = searchStart;
  let bestDiff = 999;

  // Coarse search: day by day
  let cursor = searchStart.getTime();
  while (cursor <= searchEnd.getTime()) {
    const testDate = new Date(cursor);
    const pos = calculatePositions(testDate);
    const moonLon = pos.moon.longitude;
    const diff = Math.abs(moonLon - natalMoonLon);
    const actualDiff = diff > 180 ? 360 - diff : diff;
    if (actualDiff < bestDiff) {
      bestDiff = actualDiff;
      bestDate = testDate;
    }
    cursor += 86400000; // +1 day
  }

  if (bestDiff > 20) {
    // Moon not found in this month — try next cycle starting ~27 days from month start
    const altStart = new Date(searchStart.getTime() + 15 * 86400000);
    cursor = altStart.getTime();
    const altEnd = altStart.getTime() + 20 * 86400000;
    while (cursor <= altEnd) {
      const testDate = new Date(cursor);
      const pos = calculatePositions(testDate);
      const moonLon = pos.moon.longitude;
      const diff = Math.abs(moonLon - natalMoonLon);
      const actualDiff = diff > 180 ? 360 - diff : diff;
      if (actualDiff < bestDiff) {
        bestDiff = actualDiff;
        bestDate = testDate;
      }
      cursor += 86400000;
    }
  }

  // Fine search: hour by hour around the best day
  const fineStart = new Date(bestDate.getTime() - 86400000);
  const fineEnd = new Date(bestDate.getTime() + 86400000);
  bestDiff = 999;

  cursor = fineStart.getTime();
  while (cursor <= fineEnd.getTime()) {
    const testDate = new Date(cursor);
    const pos = calculatePositions(testDate);
    const moonLon = pos.moon.longitude;
    const diff = Math.abs(moonLon - natalMoonLon);
    const actualDiff = diff > 180 ? 360 - diff : diff;
    if (actualDiff < bestDiff) {
      bestDiff = actualDiff;
      bestDate = testDate;
    }
    cursor += 3600000; // +1 hour
  }

  // Very fine: minute by minute ±1h around best hour
  const minuteStart = new Date(bestDate.getTime() - 3600000);
  const minuteEnd = new Date(bestDate.getTime() + 3600000);
  bestDiff = 999;

  cursor = minuteStart.getTime();
  while (cursor <= minuteEnd.getTime()) {
    const testDate = new Date(cursor);
    const pos = calculatePositions(testDate);
    const moonLon = pos.moon.longitude;
    const diff = Math.abs(moonLon - natalMoonLon);
    const actualDiff = diff > 180 ? 360 - diff : diff;
    if (actualDiff < bestDiff) {
      bestDiff = actualDiff;
      bestDate = testDate;
    }
    cursor += 60000; // +1 minute
  }

  const positions = calculatePositions(bestDate);
  const houses = calculateFullHouses(bestDate, lat, lng, 'placidus');
  const aspects = calculateAspects(positions, positions, true);

  const planetHouses: Record<string, number> = {};
  for (const [planet, pos] of Object.entries(positions as any)) {
    planetHouses[planet] = getHouseForLongitude((pos as any).longitude, houses.cusps);
  }

  return { date: bestDate, positions, houses, aspects, planetHouses };
}

// ============================================================
// INTERPRETATION COMPONENT
// ============================================================

function LRInterpretation(props: { lr: LunarReturnResult; natalMoonLon: number }) {
  const lr = () => props.lr;
  if (!lr()) return null;

  const moonSignIdx = () => getSignIndex(lr().positions?.moon?.longitude || 0);
  const ascSignIdx = () => getSignIndex(lr().houses?.ascendant || 0);
  const moonHouse = () => lr().planetHouses?.moon || 1;
  const sunHouse = () => lr().planetHouses?.sun || 1;
  const saturnHouse = () => lr().planetHouses?.saturn || 1;
  const natalMoonSign = () => getSignIndex(props.natalMoonLon);

  return (
    <div class="space-y-5">
      {/* Tema emocional do mês */}
      <div class="border-l-4 border-blue-400/50 pl-4 py-2">
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-900/20 text-blue-300">
          Tema Emocional do Mês
        </span>
        <h4 class="text-sm font-semibold text-cream mt-1.5 mb-1">
          ☽ Lua retorna em {SIGN_NAMES[moonSignIdx()]}
        </h4>
        <p class="text-sm text-cream-dark leading-relaxed">
          {MOON_SIGN_THEME[moonSignIdx()]}
        </p>
        <p class="text-xs text-muted mt-1.5">
          Sua Lua natal está em {SIGN_NAMES[natalMoonSign()]} — agora ela volta para casa, trazendo consciência renovada das suas necessidades emocionais mais profundas.
        </p>
      </div>

      {/* Tom do mês — ASC */}
      <div class="border-l-4 border-gold/40 pl-4 py-2">
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gold/10 text-gold">
          Tom do Mês
        </span>
        <h4 class="text-sm font-semibold text-cream mt-1.5 mb-1">
          Ascendente de RL em {SIGN_NAMES[ascSignIdx()]}
        </h4>
        <p class="text-sm text-cream-dark leading-relaxed">
          {LR_ASC_INTERP[ascSignIdx()]}
        </p>
      </div>

      {/* Casa da Lua */}
      <div class="border-l-4 border-indigo-400/40 pl-4 py-2">
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-900/20 text-indigo-300">
          Onde as Emoções Operam
        </span>
        <h4 class="text-sm font-semibold text-cream mt-1.5 mb-1">
          ☽ Lua na Casa {moonHouse()}
        </h4>
        <p class="text-sm text-cream-dark leading-relaxed">
          {LR_MOON_HOUSE[moonHouse() - 1]}
        </p>
      </div>

      {/* Casa do Sol */}
      <div class="border-l-4 border-yellow-500/40 pl-4 py-2">
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-yellow-900/20 text-yellow-300">
          Foco Principal
        </span>
        <h4 class="text-sm font-semibold text-cream mt-1.5 mb-1">
          ☉ Sol na Casa {sunHouse()}
        </h4>
        <p class="text-sm text-cream-dark leading-relaxed">
          {LR_SUN_HOUSE[sunHouse() - 1]}
        </p>
      </div>

      {/* Saturno */}
      <div class="border-l-4 border-slate-400/40 pl-4 py-2">
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900/30 text-slate-300">
          Onde Estruturar
        </span>
        <h4 class="text-sm font-semibold text-cream mt-1.5 mb-1">
          ♄ Saturno na Casa {saturnHouse()}
        </h4>
        <p class="text-sm text-cream-dark leading-relaxed">
          {SATURN_HOUSE[saturnHouse() - 1]}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

interface Props { locale?: Locale }

export default function LunarReturnApp(props: Props) {
  const now = new Date();
  const [natalChart, setNatalChart] = createSignal<any>(null);
  const [lrChart, setLrChart] = createSignal<LunarReturnResult | null>(null);
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [profileName, setProfileName] = createSignal('');
  const [profileMeta, setProfileMeta] = createSignal<{ lat: number; lng: number; timezone: number; timeZoneId?: string } | null>(null);
  const [targetMonth, setTargetMonth] = createSignal(now.getMonth());
  const [targetYear, setTargetYear] = createSignal(now.getFullYear());
  const [loading, setLoading] = createSignal(false);
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
      const chart = calculateNatalChart(birthDataFromProfile(profile));
      setNatalChart(chart);
      setProfileName(profile.name);
      setProfileMeta({ lat: profile.lat, lng: profile.lng, timezone: profile.timezone, timeZoneId: profile.timeZoneId });
      calculateLR(chart, profile.lat, profile.lng, targetYear(), targetMonth());
    } catch (e: any) {
      setError(e?.message || 'Erro ao calcular');
    }
  };

  const calculateLR = (natal: any, lat: number, lng: number, year: number, month: number) => {
    setLoading(true);
    setError('');
    // Use setTimeout to let the UI update before heavy computation
    setTimeout(() => {
      try {
        const natalMoonLon = natal.positions.moon.longitude;
        const meta = profileMeta();
        const result = calculateLunarReturn(natalMoonLon, year, month, lat, lng, meta?.timezone ?? 0, meta?.timeZoneId);
        if (result) {
          setLrChart(result);
          setWheelSvg(renderWheel(result as any));
        } else {
          setError('Não foi possível encontrar a Revolução Lunar neste mês.');
        }
      } catch (e: any) {
        setError(e?.message || 'Erro no cálculo da Revolução Lunar');
      } finally {
        setLoading(false);
      }
    }, 10);
  };

  const handleMonthChange = (month: number, year: number) => {
    setTargetMonth(month);
    setTargetYear(year);
    if (natalChart() && profileMeta()) {
      const { lat, lng } = profileMeta()!;
      calculateLR(natalChart(), lat, lng, year, month);
    }
  };

  const prevMonth = () => {
    const m = targetMonth() === 0 ? 11 : targetMonth() - 1;
    const y = targetMonth() === 0 ? targetYear() - 1 : targetYear();
    handleMonthChange(m, y);
  };

  const nextMonth = () => {
    const m = targetMonth() === 11 ? 0 : targetMonth() + 1;
    const y = targetMonth() === 11 ? targetYear() + 1 : targetYear();
    handleMonthChange(m, y);
  };

  const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  const formatDate = (d: Date) => {
    const meta = profileMeta();
    const locale = localeToDateLocale('pt');
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', day: '2-digit', month: 'long',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    };

    if (isValidTimeZone(meta?.timeZoneId)) {
      return d.toLocaleString(locale, { ...options, timeZone: meta?.timeZoneId });
    }

    const localDate = new Date(d.getTime() + (meta?.timezone ?? 0) * 3600000);
    return localDate.toLocaleString(locale, { ...options, timeZone: 'UTC' });
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar */}
      <div class="lg:col-span-1 space-y-4">
        {/* Month selector */}
        <Show when={natalChart()}>
          <div class="glass rounded-2xl p-4">
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">Mês de Busca</h3>
            <div class="flex items-center gap-2 mb-3">
              <button
                onClick={prevMonth}
                class="px-3 py-1.5 text-sm bg-base-200 rounded-lg hover:bg-base-300 transition-colors text-cream"
              >←</button>
              <div class="flex-1 text-center">
                <span class="text-cream font-medium">{MONTH_NAMES[targetMonth()]} {targetYear()}</span>
              </div>
              <button
                onClick={nextMonth}
                class="px-3 py-1.5 text-sm bg-base-200 rounded-lg hover:bg-base-300 transition-colors text-cream"
              >→</button>
            </div>

            <Show when={loading()}>
              <div class="flex items-center gap-2 text-xs text-muted mt-2">
                <span class="animate-spin inline-block">⟳</span>
                <span>Calculando...</span>
              </div>
            </Show>

            <Show when={lrChart() && !loading()}>
              <div class="mt-3 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <p class="text-xs text-blue-300 font-medium mb-1">🌙 Revolução Lunar encontrada</p>
                <p class="text-xs text-cream-dark leading-relaxed">
                  {formatDate(lrChart()!.date)}
                </p>
                <p class="text-[10px] text-muted mt-1">
                  Lua natal: {SIGN_NAMES[getSignIndex(natalChart().positions.moon.longitude)]}
                </p>
              </div>
            </Show>

            <Show when={error()}>
              <p class="text-xs text-red-400 mt-2">{error()}</p>
            </Show>
          </div>
        </Show>

        {/* Planet Table */}
        <Show when={lrChart() && !loading()}>
          <PlanetTable chart={lrChart() as any} locale={props.locale} />
        </Show>
      </div>

      {/* Main content */}
      <div class="lg:col-span-2">
        <Show when={lrChart() && !loading()} fallback={
          <div class="glass rounded-2xl p-8 text-center text-muted">
            <Show when={loading()}>
              <div class="text-5xl mb-3 animate-pulse">🌙</div>
              <p>Calculando Revolução Lunar...</p>
            </Show>
            <Show when={!loading() && !natalChart()}>
              <div class="text-5xl mb-3">🌙</div>
              <p>Selecione um perfil para calcular a Revolução Lunar</p>
              <p class="text-xs mt-2">Use o menu de perfil no topo da página (👤)</p>
            </Show>
          </div>
        }>
          {/* Wheel */}
          <div class="glass rounded-2xl p-4">
            <div class="text-center text-sm text-muted mb-2">
              Revolução Lunar — <strong class="text-cream">{profileName()}</strong> —{' '}
              <strong class="text-blue-300">{MONTH_NAMES[targetMonth()]} {targetYear()}</strong>
            </div>
            <div
              class="w-full max-w-[600px] mx-auto"
              innerHTML={wheelSvg()}
            />
          </div>

          {/* Interpretation */}
          <div class="glass rounded-2xl p-6 mt-6">
            <h3 class="text-lg font-serif font-semibold text-cream mb-1">
              🌙 Leitura — Revolução Lunar
            </h3>
            <p class="text-xs text-muted mb-5">
              Este é o mapa do momento em que a Lua retorna ao seu grau natal — um novo ciclo emocional de ~27 dias começa aqui.
            </p>
            <Show when={natalChart()}>
              <LRInterpretation
                lr={lrChart()!}
                natalMoonLon={natalChart().positions.moon.longitude}
              />
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
}
