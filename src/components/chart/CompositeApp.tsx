import { createSignal, onMount, Show, For } from 'solid-js';
import ProfileSelector from '../forms/ProfileSelector';
import PlanetTable from '../chart/PlanetTable';
import AspectGrid from '../chart/AspectGrid';
import ElementTable from '../chart/ElementTable';
import { calculateNatalChart, calculateComposite, initSweph, getSignIndex, getDegreeInSign } from '../../engine/index';
import { renderWheel } from '../../renderer/wheel';
import { getAspectSymbol, getAspectColor } from '../../engine/aspects';
import type { NatalChart, CompositeChart, Aspect } from '../../engine/types';
import type { Profile } from '../../store/db';

// ─── Planet names & symbols ────────────────────────────────
const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  northNode: 'Nodo Norte', chiron: 'Quíron',
};
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', chiron: '⚷',
};
const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const HOUSE_THEMES: Record<number, string> = {
  1: 'identidade do casal e como o mundo os vê juntos',
  2: 'valores compartilhados, finanças e segurança material do casal',
  3: 'comunicação, aprendizado e vida cotidiana juntos',
  4: 'lar, família, raízes emocionais da relação',
  5: 'criatividade, diversão, romance e filhos',
  6: 'rotina diária, saúde e trabalho conjunto',
  7: 'compromisso formal, equilíbrio e parceria igualitária',
  8: 'intimidade profunda, transformação e recursos compartilhados',
  9: 'expansão, viagens, filosofia e crescimento espiritual juntos',
  10: 'reputação do casal, objetivos de longo prazo e legado',
  11: 'amizade, causas sociais e projetos futuros em comum',
  12: 'espiritualidade, sacrifícios mútuos e conexão invisível',
};

// ─── Interpretations for composite ────────────────────────────
const SUN_IN_SIGN: Record<number, string> = {
  0: 'O propósito da relação é ação conjunta — vocês se energizam mutuamente para iniciar projetos. O perigo é a competição; o presente é a coragem compartilhada.',
  1: 'A relação busca estabilidade, prazer e construção material. Vocês se sentem seguros juntos. O perigo é a estagnação; o presente é a durabilidade.',
  2: 'A relação é movida por comunicação e curiosidade. Vocês se estimulam intelectualmente. O perigo é a superficialidade; o presente é a versatilidade.',
  3: 'A relação tem uma dimensão emocional e nutritiva profunda. Vocês criam um "lar emocional" juntos. O perigo é a dependência; o presente é o acolhimento.',
  4: 'A relação irradia criatividade, diversão e visibilidade. Vocês se sentem maiores juntos. O perigo é o drama; o presente é a expressão autêntica.',
  5: 'A relação funciona como parceria prática — vocês se organizam e se aprimoram mutuamente. O perigo é a crítica excessiva; o presente é o refinamento.',
  6: 'A relação é definida pelo equilíbrio e pela harmonia. Vocês buscam justiça entre si. O perigo é evitar conflitos a todo custo; o presente é a elegância relacional.',
  7: 'A relação é intensa, transformadora e profundamente íntima. Vocês acessam partes ocultas um do outro. O perigo é o controle; o presente é a renovação.',
  8: 'A relação expande horizontes — vocês crescem juntos através de viagens, filosofia e busca de significado. O perigo é a inquietude; o presente é a sabedoria.',
  9: 'A relação é comprometida, estruturada e voltada para construção de longo prazo. Vocês amadurecem juntos. O perigo é a rigidez; o presente é o legado.',
  10: 'A relação é inovadora, livre e focada no futuro. Vocês se inspiram a ser mais autênticos. O perigo é o desapego excessivo; o presente é a liberdade criativa.',
  11: 'A relação tem uma dimensão espiritual, artística e transcendente. Vocês se dissolvem nas fronteiras do eu. O perigo é a ilusão; o presente é a compaixão infinita.',
};

const MOON_IN_SIGN: Record<number, string> = {
  0: 'O clima emocional do casal é intenso e impulsivo — vocês reagem rápido um ao outro. Precisam de ação para se sentir conectados.',
  1: 'O clima emocional é tranquilo e sensorial — vocês se nutrem com conforto, comida, toque e estabilidade.',
  2: 'O clima emocional é leve e verbal — vocês processam sentimentos pela conversa. Precisam de variedade.',
  3: 'O clima emocional é profundamente nutritivo — vocês criam um casulo protetor juntos. Muito apego possível.',
  4: 'O clima emocional é caloroso e expressivo — vocês precisam de admiração mútua e celebração.',
  5: 'O clima emocional é contido e prático — vocês cuidam um do outro com atos, não grandes declarações.',
  6: 'O clima emocional é harmonioso e diplomático — vocês evitam conflitos e buscam equilíbrio constante.',
  7: 'O clima emocional é intenso e magnético — emoções profundas, ciúme possível, mas conexão visceral.',
  8: 'O clima emocional é otimista e expansivo — vocês se animam mutuamente e riem juntos com facilidade.',
  9: 'O clima emocional é sóbrio e maduro — vocês respeitam o espaço do outro. Pode faltar demonstração.',
  10: 'O clima emocional é imprevisível e estimulante — vocês surpreendem um ao outro. Liberdade emocional.',
  11: 'O clima emocional é sutil e empático — vocês se sentem sem precisar de palavras. Conexão etérea.',
};

function interpretComposite(chart: CompositeChart, nameA: string, nameB: string) {
  const sunSign = getSignIndex(chart.positions.sun.longitude);
  const moonSign = getSignIndex(chart.positions.moon.longitude);
  const venusSign = getSignIndex(chart.positions.venus.longitude);
  const marsSign = getSignIndex(chart.positions.mars.longitude);
  const saturnSign = getSignIndex(chart.positions.saturn.longitude);

  const sunHouse = chart.planetHouses['sun'] || 1;
  const moonHouse = chart.planetHouses['moon'] || 1;
  const venusHouse = chart.planetHouses['venus'] || 1;
  const saturnHouse = chart.planetHouses['saturn'] || 1;

  const sections = [];

  // Sol composto
  sections.push({
    icon: '☉',
    title: `Sol Composto em ${SIGN_NAMES[sunSign]} — Casa ${sunHouse}`,
    subtitle: 'O propósito central da relação',
    text: SUN_IN_SIGN[sunSign] + ` Com o Sol na Casa ${sunHouse}, o tema central da relação está ligado a ${HOUSE_THEMES[sunHouse]}.`,
    color: '#f0b840',
  });

  // Lua composta
  sections.push({
    icon: '☽',
    title: `Lua Composta em ${SIGN_NAMES[moonSign]} — Casa ${moonHouse}`,
    subtitle: 'O clima emocional quando estão juntos',
    text: MOON_IN_SIGN[moonSign] + ` Na Casa ${moonHouse}, as emoções compartilhadas se expressam na esfera de ${HOUSE_THEMES[moonHouse]}.`,
    color: '#c0c8d8',
  });

  // Vênus composta
  sections.push({
    icon: '♀',
    title: `Vênus Composta em ${SIGN_NAMES[venusSign]} — Casa ${venusHouse}`,
    subtitle: 'Como o amor se expressa entre vocês',
    text: `O amor nesta relação se expressa com a qualidade de ${SIGN_NAMES[venusSign]} — ${getVenusText(venusSign)}. Na Casa ${venusHouse}, o afeto circula na área de ${HOUSE_THEMES[venusHouse]}.`,
    color: '#f0a0c0',
  });

  // Saturno composto
  sections.push({
    icon: '♄',
    title: `Saturno Composto em ${SIGN_NAMES[saturnSign]} — Casa ${saturnHouse}`,
    subtitle: 'Onde há trabalho, compromisso e maturidade',
    text: `Saturno na Casa ${saturnHouse} indica que o casal é convocado a construir com seriedade na área de ${HOUSE_THEMES[saturnHouse]}. Este é o ponto de maior responsabilidade — e de maior conquista quando há dedicação. Não é onde a relação é "leve", mas onde ela pode ser duradoura.`,
    color: '#90a8c0',
  });

  return sections;
}

function getVenusText(sign: number): string {
  const texts = [
    'com intensidade, paixão e iniciativa — vocês se apaixonam rápido e valorizam a conquista',
    'com sensualidade, constância e presença física — vocês precisam de toque e estabilidade',
    'com leveza, humor e comunicação — vocês se amam com palavras e diversão',
    'com cuidado, proteção e ternura — vocês se amam maternando/paternando',
    'com grandeza, generosidade e celebração — vocês se amam com admiração e presentes',
    'com atenção aos detalhes, cuidado prático e atos de serviço',
    'com elegância, harmonia e busca constante de equilíbrio e beleza',
    'com intensidade, profundidade e entrega total — tudo ou nada',
    'com liberdade, aventura e crescimento mútuo — vocês se amam expandindo juntos',
    'com compromisso, lealdade e construção paciente — amor que resiste ao tempo',
    'com originalidade, amizade e respeito à individualidade',
    'com empatia, sonho e conexão espiritual — vocês se amam na dimensão do invisível',
  ];
  return texts[sign] || 'de forma única e significativa';
}

export default function CompositeApp() {
  const [chartA, setChartA] = createSignal<NatalChart | null>(null);
  const [chartB, setChartB] = createSignal<NatalChart | null>(null);
  const [composite, setComposite] = createSignal<CompositeChart | null>(null);
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [nameA, setNameA] = createSignal('');
  const [nameB, setNameB] = createSignal('');
  const [interpretation, setInterpretation] = createSignal<any[]>([]);

  onMount(async () => { await initSweph(); });

  const profileToChart = (profile: Profile): NatalChart => {
    return calculateNatalChart({
      name: profile.name, date: profile.date, time: profile.time,
      lat: profile.lat, lng: profile.lng, timezone: profile.timezone,
      city: profile.city, country: profile.country,
    });
  };

  const handleSelectA = (profile: Profile) => {
    const chart = profileToChart(profile);
    setChartA(chart);
    setNameA(profile.name);
    if (chartB()) compute(chart, chartB()!);
  };

  const handleSelectB = (profile: Profile) => {
    const chart = profileToChart(profile);
    setChartB(chart);
    setNameB(profile.name);
    if (chartA()) compute(chartA()!, chart);
  };

  const compute = (a: NatalChart, b: NatalChart) => {
    const result = calculateComposite(a, b);
    setComposite(result);
    setWheelSvg(renderWheel(result as any));
    setInterpretation(interpretComposite(result, nameA(), nameB()));
  };

  return (
    <div class="space-y-6">
      {/* Profile selectors */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-gold mb-2">Pessoa A</h3>
          <ProfileSelector onSelect={handleSelectA} locale="pt" />
          <Show when={nameA()}><p class="text-xs text-green-400 mt-2">✓ {nameA()}</p></Show>
        </div>
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-purple-400 mb-2">Pessoa B</h3>
          <ProfileSelector onSelect={handleSelectB} locale="pt" />
          <Show when={nameB()}><p class="text-xs text-green-400 mt-2">✓ {nameB()}</p></Show>
        </div>
      </div>

      {/* Composite chart */}
      <Show when={composite()} fallback={
        <div class="glass rounded-2xl p-8 text-center text-muted">
          <div class="text-5xl mb-3">∞</div>
          <p>Selecione dois perfis para gerar o Mapa Composto</p>
          <p class="text-xs mt-2 max-w-md mx-auto">O composto calcula o ponto médio entre cada planeta dos dois mapas — revelando o "DNA" do relacionamento como entidade própria.</p>
        </div>
      }>
        {/* Chart wheel */}
        <div class="glass rounded-2xl p-4">
          <div class="text-center text-sm text-muted mb-2">
            Mapa Composto: <strong class="text-cream">{nameA()}</strong> <span class="text-gold">∞</span> <strong class="text-cream">{nameB()}</strong>
          </div>
          <div class="w-full max-w-[600px] mx-auto" innerHTML={wheelSvg()} />
        </div>

        {/* Interpretation */}
        <div class="space-y-4">
          <h2 class="text-xl font-serif font-bold text-cream flex items-center gap-2">
            <span class="text-gold">✦</span> Interpretação do Composto
          </h2>
          <p class="text-sm text-muted">O que este mapa revela sobre a relação entre <strong class="text-cream">{nameA()}</strong> e <strong class="text-cream">{nameB()}</strong>:</p>

          <For each={interpretation()}>
            {(section) => (
              <div class="glass rounded-xl p-5 border border-base-300 hover:border-gold/20 transition-colors">
                <div class="flex items-start gap-3">
                  <span class="text-2xl flex-shrink-0" style={{ color: section.color }}>{section.icon}</span>
                  <div class="flex-1">
                    <h3 class="font-semibold text-cream text-sm mb-0.5">{section.title}</h3>
                    <p class="text-xs text-gold-muted mb-2">{section.subtitle}</p>
                    <p class="text-sm text-cream-dark leading-relaxed">{section.text}</p>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Key Aspects */}
        <Show when={composite()!.aspects.length > 0}>
          <div class="glass rounded-xl p-5 border border-base-300">
            <h3 class="text-sm font-semibold text-cream mb-3 flex items-center gap-2">
              <span class="text-gold">🔗</span> Aspectos-chave do Composto
            </h3>
            <p class="text-xs text-muted mb-3">Conexões internas da relação — mostram onde há fluxo e onde há tensão na dinâmica do casal.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <For each={composite()!.aspects.slice(0, 10)}>
                {(asp: Aspect) => (
                  <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200/50">
                    <span class="text-base">{PLANET_SYMBOLS[asp.planet1] || asp.planet1}</span>
                    <span class="text-sm font-bold" style={{ color: getAspectColor(asp.type) }}>{getAspectSymbol(asp.type)}</span>
                    <span class="text-base">{PLANET_SYMBOLS[asp.planet2] || asp.planet2}</span>
                    <span class="text-[10px] text-muted ml-auto">
                      {PLANET_NAMES[asp.planet1]} {getAspectSymbol(asp.type)} {PLANET_NAMES[asp.planet2]}
                    </span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>

        {/* Planet positions table */}
        <PlanetTable chart={composite() as any} />

        {/* Aspect Grid + Element Table */}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AspectGrid chart={composite() as any} />
          <ElementTable chart={composite() as any} />
        </div>
      </Show>
    </div>
  );
}
