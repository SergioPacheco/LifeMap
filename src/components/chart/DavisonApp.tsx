import { createSignal, onMount, Show, For } from 'solid-js';
import ProfileSelector from '../forms/ProfileSelector';
import PlanetTable from '../chart/PlanetTable';
import { buildUTCDate, calculateNatalChart, initSweph, getSignIndex } from '../../engine/index';
import { renderWheel } from '../../renderer/wheel';
import type { NatalChart } from '../../engine/types';
import type { Profile } from '../../store/db';
import { getOffsetHoursForInstant, inferTimeZoneId } from '../../utils/dateTime';

// ─── Helpers ───────────────────────────────────────────────
function formatDate(d: Date): string { return d.toISOString().split('T')[0]; }
function formatTime(d: Date): string {
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
}

function formatLocalDateTimeForOffset(utcMs: number, offset: number): { date: string; time: string } {
  const local = new Date(utcMs + offset * 3600000);
  return { date: formatDate(local), time: formatTime(local) };
}

// ─── Constants ─────────────────────────────────────────────
const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

const HOUSE_THEMES: Record<number, string> = {
  1: 'a identidade do casal e como se apresentam ao mundo juntos',
  2: 'valores compartilhados e segurança material do relacionamento',
  3: 'comunicação, aprendizado e trocas cotidianas',
  4: 'lar, família e raízes emocionais da relação',
  5: 'criatividade, romance, diversão e expressão conjunta',
  6: 'rotina, saúde e serviço mútuo',
  7: 'compromisso formal e equilíbrio na parceria',
  8: 'intimidade profunda, transformação e recursos compartilhados',
  9: 'expansão, filosofia e crescimento espiritual juntos',
  10: 'propósito público e legado do casal',
  11: 'amizade, comunidade e projetos futuros',
  12: 'espiritualidade, sacrifício e conexão transcendente',
};

// ─── Sun interpretations (propósito da relação por casa) ───
const SUN_IN_HOUSE: Record<number, string> = {
  1: 'O propósito central desta relação é a criação de uma identidade conjunta forte. O casal se energiza através da presença um do outro — juntos, se sentem mais vivos e inteiros. O desafio é manter individualidade dentro da fusão.',
  2: 'A relação encontra seu propósito na construção de segurança e valores compartilhados. Fidelidade, estabilidade e prazer material fazem parte do DNA do casal. O amor se concretiza através de atos práticos e presença constante.',
  3: 'Esta relação floresce através da comunicação, troca intelectual e curiosidade mútua. Vocês se stimulam com conversas, ideias e aprendizado. O risco é a superficialidade; o presente é a leveza e a versatilidade.',
  4: 'O propósito é criar um lar emocional profundo — um refugio do mundo. Esta relação tem raízes fortes e uma dimensão ancestral. O amor se expressa no cuidado, na proteção e na criação de memórias familiares.',
  5: 'A relação existe para criar, celebrar e expressar. Criatividade, romance e alegria são o combustível. Vocês se sentem maiores quando estão juntos. O risco é o drama; o presente é uma vida com mais brilho.',
  6: 'Esta relação encontra propósito no serviço mútuo e no aprimoramento constante. Vocês se ajudam a crescer e a funcionar melhor. O amor é prático, dedicado e atencioso aos detalhes.',
  7: 'Esta relação existe para ensinar sobre equilíbrio, reciprocidade e parceria igualitária. Compromisso e justiça são pilares. Vocês se espelham um no outro e crescem através da negociação honesta.',
  8: 'O propósito desta relação é a transformação profunda. Vocês se encontraram para se renovar e acessar partes ocultas de si mesmos. Intensidade, intimidade e partilha total são o caminho.',
  9: 'Esta relação existe para expandir horizontes — viagens, filosofia, espiritualidade e busca de significado são o combustível. Juntos, vocês crescem além de suas crenças individuais.',
  10: 'O propósito é construir algo visível e duradouro. Esta relação tem um aspecto público ou uma missão compartilhada. O amor maduro e comprometido é a base de um legado conjunto.',
  11: 'Esta relação existe para inovar, libertar e construir visões de futuro. Amizade profunda é a base. Vocês se inspiram a ser mais autênticos e a contribuir com algo maior do que si mesmos.',
  12: 'O propósito desta relação transcende o cotidiano — há uma conexão espiritual, kármica ou profundamente invisível. Vocês se curam através um do outro. O amor é silencioso, etéreo e sem fronteiras.',
};

// ─── Moon interpretations (clima emocional por casa) ───────
const MOON_IN_HOUSE: Record<number, string> = {
  1: 'O clima emocional é imediato e transparente — sentimentos são expressos abertamente. Há sensibilidade alta às reações um do outro. O casal se nutre através da presença física.',
  2: 'O clima emocional é tranquilo e seguro. Vocês se nutrem com constância, conforto e gestos de cuidado material. Estabilidade é a linguagem emocional desta relação.',
  3: 'Emoções são processadas através de palavras. Vocês se sentem bem quando conversam, trocam e compartilham pensamentos. Variedade e leveza alimentam a conexão emocional.',
  4: 'O lar emocional é profundo e nutritivo. Vocês criam um mundo íntimo só de vocês. A sensibilidade é alta, especialmente em temas familiares e de segurança.',
  5: 'O clima emocional é caloroso, expressivo e festivo. Vocês precisam de admiração mútua e momentos de celebração. A criança interior de cada um é ativada na relação.',
  6: 'O clima emocional é cuidadoso e prático. Vocês se expressam através de atos de serviço — cozinhar, ajudar, resolver. O amor é concreto e cotidiano.',
  7: 'O clima emocional busca harmonia e equilíbrio constante. Há uma sensibilidade diplomática — conflitos diretos são evitados. O casal se sente bem quando há reciprocidade.',
  8: 'O clima emocional é intenso e profundo. Emoções não ficam na superfície — há uma corrente magnética entre vocês. Possibilidade de ciúme; certeza de conexão visceral.',
  9: 'O clima emocional é expansivo e otimista. Vocês se animam mutuamente com planos, sonhos e projetos grandes. A leveza filosófica alivia tensões.',
  10: 'O clima emocional é sóbrio e maduro. Há respeito pelo espaço do outro. O amor se confirma através de responsabilidade e cumprimento de compromissos.',
  11: 'O clima emocional é amigável, aberto e estimulante. Há liberdade emocional — vocês se surpreendem um ao outro. A amizade é o alicerce do amor.',
  12: 'O clima emocional é sutil e empático. Vocês se sentem sem precisar de palavras. Há uma conexão etérea que vai além do racional.',
};

// ─── Venus interpretations (amor por signo) ────────────────
const VENUS_IN_SIGN: Record<number, string> = {
  0:  'com intensidade e paixão — conquista e iniciativa alimentam o amor',
  1:  'com sensualidade e constância — toque, conforto e gestos físicos',
  2:  'com leveza, humor e cumplicidade intelectual',
  3:  'com ternura e cuidado profundo — amor que nutre e protege',
  4:  'com generosidade, celebração e admiração mútua',
  5:  'com atenção e atos de serviço — amor nos detalhes práticos',
  6:  'com elegância e busca de harmonia — equilíbrio como forma de amor',
  7:  'com intensidade e entrega total — amor que transforma',
  8:  'com liberdade e aventura — amor que expande horizontes',
  9:  'com lealdade e construção paciente — amor que resiste ao tempo',
  10: 'com originalidade e amizade — respeito à individualidade como base',
  11: 'com empatia e sonho — amor na dimensão do invisível e espiritual',
};

// ─── Interpretation logic ──────────────────────────────────
function interpretDavison(chart: NatalChart, nameA: string, nameB: string) {
  const sunSign  = getSignIndex(chart.positions.sun.longitude);
  const moonSign = getSignIndex(chart.positions.moon.longitude);
  const venusSign = getSignIndex(chart.positions.venus.longitude);

  const sunHouse   = chart.planetHouses['sun']   || 1;
  const moonHouse  = chart.planetHouses['moon']  || 1;
  const venusHouse = chart.planetHouses['venus'] || 1;

  const midDateStr = formatDate(new Date(chart.date));

  return [
    {
      icon: '☉',
      title: `Sol Davison em ${SIGN_NAMES[sunSign]} — Casa ${sunHouse}`,
      subtitle: 'O propósito e a missão central desta relação',
      text: (SUN_IN_HOUSE[sunHouse] || `O propósito da relação se manifesta na área de ${HOUSE_THEMES[sunHouse]}.`) +
        ` Com energia de ${SIGN_NAMES[sunSign]}, este propósito se expressa com as qualidades deste signo.`,
      color: '#f0b840',
    },
    {
      icon: '☽',
      title: `Lua Davison em ${SIGN_NAMES[moonSign]} — Casa ${moonHouse}`,
      subtitle: 'O clima emocional e as necessidades de nutrição da relação',
      text: (MOON_IN_HOUSE[moonHouse] || `As emoções da relação circulam pela área de ${HOUSE_THEMES[moonHouse]}.`) +
        ` A qualidade lunar de ${SIGN_NAMES[moonSign]} colore a forma como o casal processa sentimentos.`,
      color: '#c0c8d8',
    },
    {
      icon: '♀',
      title: `Vênus Davison em ${SIGN_NAMES[venusSign]} — Casa ${venusHouse}`,
      subtitle: 'Como o amor, a atração e o prazer fluem entre vocês',
      text: `O amor nesta relação se expressa ${VENUS_IN_SIGN[venusSign] || 'de forma única e profunda'}. ` +
        `Na Casa ${venusHouse}, o afeto se manifesta na esfera de ${HOUSE_THEMES[venusHouse]}.`,
      color: '#f0a0c0',
    },
    {
      icon: '🕐',
      title: `Ponto de Encontro: ${midDateStr}`,
      subtitle: 'O momento temporal médio desta relação',
      text: `O Mapa Davison usa como referência o ponto médio entre as datas de nascimento de ${nameA} e ${nameB}. ` +
        `Este "momento de encontro" — ${midDateStr} — é quando o céu capturou a essência do que vocês constroem juntos. ` +
        `Diferente do Composto (que usa médias de longitudes), o Davison gera um mapa astronômico real desse instante.`,
      color: '#90a8c0',
    },
  ];
}

// ─── Component ─────────────────────────────────────────────
interface Props {
  locale?: string;
}

export default function DavisonApp(props: Props) {
  const [profileA, setProfileA] = createSignal<Profile | null>(null);
  const [profileB, setProfileB] = createSignal<Profile | null>(null);
  const [davisonChart, setDavisonChart] = createSignal<NatalChart | null>(null);
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [interpretation, setInterpretation] = createSignal<ReturnType<typeof interpretDavison>>([]);

  onMount(async () => { await initSweph(); });

  const handleSelectA = (profile: Profile) => {
    setProfileA(profile);
    if (profileB()) compute(profile, profileB()!);
  };

  const handleSelectB = (profile: Profile) => {
    setProfileB(profile);
    if (profileA()) compute(profileA()!, profile);
  };

  const compute = (a: Profile, b: Profile) => {
    const utcMsA = buildUTCDate(a.date, a.time || '12:00', a.timezone, a.timeZoneId).getTime();
    const utcMsB = buildUTCDate(b.date, b.time || '12:00', b.timezone, b.timeZoneId).getTime();

    // Midpoint in time
    const midUtcMs = (utcMsA + utcMsB) / 2;
    // Midpoint in space
    const midLat = (a.lat + b.lat) / 2;
    const midLng = (a.lng + b.lng) / 2;
    const midpointCountry = a.country && a.country === b.country ? a.country : undefined;
    const midpointTimeZoneId = inferTimeZoneId({ lat: midLat, lng: midLng, country: midpointCountry });
    const midUtcDate = new Date(midUtcMs);
    const midTimezone = midpointTimeZoneId
      ? getOffsetHoursForInstant(midUtcDate, midpointTimeZoneId)
      : Math.round(midLng / 15);
    const localMidpoint = formatLocalDateTimeForOffset(midUtcMs, midTimezone);

    const chart = calculateNatalChart({
      date: localMidpoint.date,
      time: localMidpoint.time,
      lat: midLat,
      lng: midLng,
      timezone: midTimezone,
      timeZoneId: midpointTimeZoneId,
      name: 'Davison',
      city: 'Midpoint',
    });

    setDavisonChart(chart);
    setWheelSvg(renderWheel(chart as any));
    setInterpretation(interpretDavison(chart, a.name, b.name));
  };

  return (
    <div class="space-y-6">
      {/* Profile selectors */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-gold mb-2">Pessoa A</h3>
          <ProfileSelector onSelect={handleSelectA} locale={props.locale || 'pt'} />
          <Show when={profileA()}>
            <p class="text-xs text-green-400 mt-2">✓ {profileA()!.name}</p>
          </Show>
        </div>
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-purple-400 mb-2">Pessoa B</h3>
          <ProfileSelector onSelect={handleSelectB} locale={props.locale || 'pt'} />
          <Show when={profileB()}>
            <p class="text-xs text-green-400 mt-2">✓ {profileB()!.name}</p>
          </Show>
        </div>
      </div>

      {/* Davison chart result */}
      <Show
        when={davisonChart()}
        fallback={
          <div class="glass rounded-2xl p-8 text-center text-muted">
            <div class="text-5xl mb-3">🔀</div>
            <p>Selecione dois perfis para gerar o Mapa Davison</p>
            <p class="text-xs mt-2 max-w-md mx-auto">
              O Davison calcula o ponto médio no <strong class="text-cream">tempo</strong> e no <strong class="text-cream">espaço</strong> entre os dois nascimentos — gerando um mapa astronômico real desse instante.
            </p>
          </div>
        }
      >
        {/* Chart title */}
        <div class="glass rounded-2xl p-4">
          <div class="text-center text-sm text-muted mb-2">
            Mapa Davison:{' '}
            <strong class="text-cream">{profileA()?.name}</strong>{' '}
            <span class="text-gold">🔀</span>{' '}
            <strong class="text-cream">{profileB()?.name}</strong>
          </div>
          <div class="w-full max-w-[600px] mx-auto" innerHTML={wheelSvg()} />
        </div>

        {/* Interpretation */}
        <div class="space-y-4">
          <h2 class="text-xl font-serif font-bold text-cream flex items-center gap-2">
            <span class="text-gold">✦</span> Interpretação do Mapa Davison
          </h2>
          <p class="text-sm text-muted">
            O que este mapa real revela sobre a relação entre{' '}
            <strong class="text-cream">{profileA()?.name}</strong> e{' '}
            <strong class="text-cream">{profileB()?.name}</strong>:
          </p>

          <For each={interpretation()}>
            {(section) => (
              <div class="glass rounded-xl p-5 border border-base-300 hover:border-gold/20 transition-colors">
                <div class="flex items-start gap-3">
                  <span class="text-2xl flex-shrink-0" style={{ color: section.color }}>
                    {section.icon}
                  </span>
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

        {/* Planet positions table */}
        <PlanetTable chart={davisonChart() as any} />
      </Show>
    </div>
  );
}
