import { createSignal, Show, For, onMount, createMemo } from 'solid-js';
import BirthDataForm from '../forms/BirthDataForm';
import { type ChartOptions, DEFAULT_OPTIONS } from '../forms/BirthDataForm';
import { saveProfile } from '../forms/ProfileSelector';
import PlanetTable from '../chart/PlanetTable';
import { calculateNatalChart, initSweph, getSignIndex } from '../../engine/index';
import { renderWheel } from '../../renderer/wheel';
import type { BirthData, NatalChart } from '../../engine/types';
import { db, type Profile } from '../../store/db';

interface Props {
  locale: string;
}

// ============================================================
// SIGN NAMES
// ============================================================
const SIGN_NAMES = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
];
const SIGN_EMOJIS = ['🔥', '🌿', '💨', '🌊', '🔥', '🌿', '💨', '🌊', '🔥', '🌿', '💨', '🌊'];

// ============================================================
// CHILD TEXTS — 5 planets × 12 signs = 60 texts
// Foco: linguagem positiva para pais lerem sobre filhos (2-12 anos)
// NUNCA: problema, difícil, negativo, agressivo, preguiçoso
// SEMPRE: potencial, talento, necessita, pode desenvolver, tende a
// ============================================================

type Planet = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars';

interface PlanetInfo {
  key: Planet;
  symbol: string;
  emoji: string;
  label: string;
  theme: string;
  color: string;
}

const PLANETS: PlanetInfo[] = [
  { key: 'sun',     symbol: '☉', emoji: '☀️', label: 'Sol',      theme: 'Como a criança brilha',                   color: '#f5c842' },
  { key: 'moon',    symbol: '☽', emoji: '🌙', label: 'Lua',      theme: 'O que ela precisa para se sentir segura', color: '#a8b8d8' },
  { key: 'mercury', symbol: '☿', emoji: '💭', label: 'Mercúrio', theme: 'Como ela aprende melhor',                  color: '#82c4f0' },
  { key: 'venus',   symbol: '♀', emoji: '🌸', label: 'Vênus',   theme: 'O que ela ama e valoriza',                color: '#f0a8c8' },
  { key: 'mars',    symbol: '♂', emoji: '⚡', label: 'Marte',   theme: 'Como ela expressa vontade e energia',     color: '#f07050' },
];

const CHILD_TEXTS: Record<Planet, string[]> = {
  // ── SOL ── "Como a criança brilha"
  sun: [
    // 0 Áries
    'Tende a brilhar quando lidera e inicia coisas novas com entusiasmo. Seu potencial está em ser pioneira — apoie sua coragem e incentive a experimentar sem medo.',
    // 1 Touro
    'Pode desenvolver um talento especial para a beleza, a música e tudo que agrada os sentidos. Necessita de rotina amorosa e tempo para explorar no próprio ritmo.',
    // 2 Gêmeos
    'Brilha com palavras, curiosidade e conexão com pessoas. Tende a aprender melhor quando pode conversar e explorar muitos assuntos — sua mente é um presente.',
    // 3 Câncer
    'Brilha no cuidado, na empatia e na criação de laços profundos. Pode desenvolver grande intuição e memória afetiva — o lar é seu maior apoio.',
    // 4 Leão
    'Tende a brilhar quando tem espaço para se expressar com criatividade e alegria. Seu potencial está em inspirar os outros — valorize cada conquista com entusiasmo.',
    // 5 Virgem
    'Pode desenvolver atenção e cuidado extraordinários nos detalhes. Brilha quando ajuda e organiza — seu potencial está em aprimorar e servir com amor.',
    // 6 Libra
    'Tende a brilhar em ambientes harmoniosos, cultivando amizades e beleza. Pode desenvolver senso estético refinado e habilidade natural para mediar conflitos.',
    // 7 Escorpião
    'Brilha com intensidade, lealdade e profundidade emocional. Seu potencial está em transformar desafios em força — apoie sua curiosidade pelo que está além da superfície.',
    // 8 Sagitário
    'Pode desenvolver um espírito explorador e grande entusiasmo pelo aprendizado. Brilha quando tem liberdade para descobrir o mundo com aventura e otimismo.',
    // 9 Capricórnio
    'Tende a brilhar com responsabilidade e determinação além da idade. Seu potencial está em construir metas com paciência — reconheça cada passo do caminho.',
    // 10 Aquário
    'Brilha com originalidade e pensamento único. Pode desenvolver o talento de enxergar o que outros não veem — apoie suas ideias criativas e seu senso de justiça.',
    // 11 Peixes
    'Tende a brilhar com imaginação, compaixão e sensibilidade artística. Seu potencial está em conectar mundos visíveis e invisíveis — nutra seus sonhos com carinho.',
  ],

  // ── LUA ── "O que ela precisa para se sentir segura"
  moon: [
    // 0 Áries
    'Necessita de liberdade para agir e um espaço onde possa se mover com energia. Sente-se segura quando tem autonomia e seus impulsos são acolhidos com calma.',
    // 1 Touro
    'Necessita de rotina previsível, contato físico e conforto sensorial. Sente-se segura quando o ambiente é estável e há abraços, comida gostosa e familiaridade.',
    // 2 Gêmeos
    'Necessita de diálogo, escuta ativa e estimulação mental para se sentir bem. Sente-se segura quando pode expressar seus pensamentos e fazer perguntas livremente.',
    // 3 Câncer
    'Necessita de colo, lar seguro e muito amor expresso em palavras e gestos. Sua sensibilidade é um dom — sente-se bem quando o ambiente familiar é acolhedor.',
    // 4 Leão
    'Necessita de atenção genuína, reconhecimento e espaço para se destacar. Sente-se segura quando seu brilho é celebrado com amor e entusiasmo sincero.',
    // 5 Virgem
    'Necessita de ordem, rotinas claras e previsibilidade para se sentir tranquila. Sente-se bem quando entende o que está acontecendo e pode colaborar com cuidado.',
    // 6 Libra
    'Necessita de harmonia, gentileza e relacionamentos sem conflitos bruscos. Sente-se segura em ambientes bonitos e equilibrados, cercada de afeto tranquilo.',
    // 7 Escorpião
    'Necessita de vínculos profundos e confiança total para se abrir. Sente-se segura quando sabe que pode contar com as pessoas próximas de forma incondicional.',
    // 8 Sagitário
    'Necessita de espaço, liberdade e aventuras para se sentir feliz. Sente-se bem quando pode explorar o mundo sem muitas restrições e aprender com alegria.',
    // 9 Capricórnio
    'Necessita de estrutura, responsabilidade gradual e exemplos confiáveis. Sente-se segura quando há clareza sobre o que se espera dela e há consistência.',
    // 10 Aquário
    'Necessita de liberdade para ser diferente e espaço para suas ideias únicas. Sente-se bem quando é aceita como é, sem pressão para se encaixar em padrões.',
    // 11 Peixes
    'Necessita de tranquilidade, música, arte e momentos de sonho para recarregar. Sente-se segura quando o ambiente é gentil, criativo e cheio de imaginação.',
  ],

  // ── MERCÚRIO ── "Como ela aprende melhor"
  mercury: [
    // 0 Áries
    'Aprende melhor com ação direta, desafios rápidos e competições lúdicas. Tende a absorver o conhecimento fazendo — dê tarefas práticas e celebre a rapidez.',
    // 1 Touro
    'Aprende no próprio ritmo, com repetição e experiências sensoriais. Pode desenvolver memória sólida e método — dê tempo para que as ideias se firmem.',
    // 2 Gêmeos
    'Aprende com conversas, jogos de palavras e exploração de múltiplos assuntos. Seu potencial está na versatilidade — estimule a curiosidade e aceite os saltos de tema.',
    // 3 Câncer
    'Aprende melhor em ambiente acolhedor e com temas que tocam o coração. Pode desenvolver memória afetiva excepcional — conecte o aprendizado a histórias e emoções.',
    // 4 Leão
    'Aprende com entusiasmo quando o conteúdo é apresentado de forma dramática e divertida. Pode desenvolver talento para contar histórias — deixe-a ensinar também.',
    // 5 Virgem
    'Aprende com atenção ao detalhe, análise e organização. Tende a ser cuidadosa e metódica — ofereça listas, esquemas e a chance de revisar e melhorar.',
    // 6 Libra
    'Aprende melhor em ambientes harmoniosos e em parceria. Tende a refletir antes de responder — valorize o processo de pensar junto e discutir com gentileza.',
    // 7 Escorpião
    'Aprende quando há profundidade e conexão com o porquê das coisas. Pode desenvolver capacidade investigativa — estimule perguntas profundas e pesquisas curiosas.',
    // 8 Sagitário
    'Aprende com entusiasmo quando o conhecimento amplia horizontes. Tende a querer o panorama geral antes dos detalhes — mostre como cada coisa se conecta ao todo.',
    // 9 Capricórnio
    'Aprende com método, estrutura e metas claras. Pode desenvolver disciplina intelectual sólida — valorize o esforço gradual e mostre o progresso ao longo do tempo.',
    // 10 Aquário
    'Aprende de forma original, muitas vezes saltando etapas de maneiras surpreendentes. Seu potencial está em pensar diferente — incentive o questionamento criativo.',
    // 11 Peixes
    'Aprende com imagens, músicas, histórias e conexão emocional com o conteúdo. Pode desenvolver intuição e criatividade únicas — use arte e fantasia como pontes.',
  ],

  // ── VÊNUS ── "O que ela ama e valoriza"
  venus: [
    // 0 Áries
    'Ama a aventura, a espontaneidade e ser a primeira a experimentar algo novo. Tende a valorizar a energia, a coragem e os relacionamentos diretos e sinceros.',
    // 1 Touro
    'Ama o conforto, as texturas agradáveis, a música e tudo que é bonito e delicioso. Pode desenvolver gosto refinado e apreço profundo pela beleza simples do mundo.',
    // 2 Gêmeos
    'Ama a conversa, os jogos de palavras, a leveza e a variedade. Tende a valorizar amigos divertidos e relacionamentos onde há troca intelectual e humor.',
    // 3 Câncer
    'Ama o cuidado, a comida feita com amor, as fotos e as memórias. Tende a valorizar o lar, a família e os vínculos afetivos — pequenos gestos de carinho significam muito.',
    // 4 Leão
    'Ama o brilho, as artes, o palco e ser reconhecida. Tende a valorizar a generosidade, a alegria compartilhada e tudo que traz beleza e celebração à vida.',
    // 5 Virgem
    'Ama ajudar, organizar e criar coisas úteis e bem feitas. Tende a valorizar a saúde, a limpeza e os detalhes cuidados — sente prazer genuíno em servir com amor.',
    // 6 Libra
    'Ama a beleza, a harmonia e os relacionamentos equilibrados. Pode desenvolver talento artístico e senso de justiça — valoriza a elegância e a gentileza.',
    // 7 Escorpião
    'Ama a intensidade, os mistérios e as conexões profundas e verdadeiras. Tende a valorizar a lealdade acima de tudo e a transformação que vem do amor genuíno.',
    // 8 Sagitário
    'Ama a aventura, as viagens, as histórias de longe e os animais. Tende a valorizar a liberdade, o otimismo e os relacionamentos que trazem crescimento e alegria.',
    // 9 Capricórnio
    'Ama as tradições, as conquistas e o reconhecimento pelo esforço. Tende a valorizar a solidez, a confiança e as relações que crescem com o tempo.',
    // 10 Aquário
    'Ama o inusitado, as amizades diversas e as causas importantes. Tende a valorizar a originalidade, a liberdade de ser diferente e as ideias que mudam o mundo.',
    // 11 Peixes
    'Ama a música, as histórias mágicas, a arte e os momentos de sonho. Tende a valorizar a compaixão, a beleza delicada e os vínculos cheios de imaginação.',
  ],

  // ── MARTE ── "Como ela expressa vontade e energia"
  mars: [
    // 0 Áries
    'Expressa energia com impulso e entusiasmo contagiante. Pode desenvolver liderança natural — canalize sua vontade em projetos com início, meio e fim claros.',
    // 1 Touro
    'Expressa vontade de forma firme, persistente e determinada. Tende a demorar para começar, mas quando inicia, conclui com cuidado — apoie sua constância.',
    // 2 Gêmeos
    'Expressa energia com movimento, conversa e multitarefas. Pode desenvolver agilidade mental e física — precisa de variedade para manter o entusiasmo aceso.',
    // 3 Câncer
    'Expressa vontade através do cuidado e da proteção dos entes queridos. Tende a agir motivada pelos sentimentos — ajude-a a nomear emoções e canalizá-las.',
    // 4 Leão
    'Expressa energia com criatividade, jogo dramático e vontade de impressionar. Pode desenvolver liderança inspiradora — celebre sua generosidade e entusiasmo.',
    // 5 Virgem
    'Expressa vontade através do trabalho meticuloso e da busca pela perfeição amorosa. Tende a ajudar com ação concreta — valorize cada detalhe que ela cuida.',
    // 6 Libra
    'Expressa energia de forma gentil, negociada e colaborativa. Pode desenvolver a habilidade de conquistar objetivos sem conflito — é uma qualidade especial.',
    // 7 Escorpião
    'Expressa vontade com foco intenso e determinação que não desiste facilmente. Pode desenvolver força interior extraordinária — canalize em projetos com propósito.',
    // 8 Sagitário
    'Expressa energia com alegria, entusiasmo e vontade de explorar o mundo. Tende a se mover muito — esportes ao ar livre e aventuras alimentam seu potencial.',
    // 9 Capricórnio
    'Expressa vontade com paciência estratégica e metas concretas. Pode desenvolver capacidade de trabalho consistente — reconheça cada etapa alcançada.',
    // 10 Aquário
    'Expressa energia de forma original, muitas vezes surpreendendo com soluções inesperadas. Pode desenvolver criatividade motora única — incentive a experimentação.',
    // 11 Peixes
    'Expressa vontade de forma fluida, intuitiva e inspirada. Pode desenvolver talentos artísticos e expressivos notáveis — deixe-a criar livremente no próprio tempo.',
  ],
};

// ============================================================
// COMPONENT
// ============================================================

export default function ChildChartApp(props: Props) {
  const [chart, setChart] = createSignal<NatalChart | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [formData, setFormData] = createSignal<BirthData | null>(null);
  const [activeTab, setActiveTab] = createSignal<Planet>('sun');
  const [svgHtml, setSvgHtml] = createSignal('');

  onMount(async () => {
    await initSweph();

    try {
      const profiles = await db.profiles.orderBy('id').reverse().limit(1).toArray();
      if (profiles.length > 0) {
        const p = profiles[0];
        handleProfileSelect(p);
      }
    } catch (e) {
      console.warn('Could not auto-load profile:', e);
    }

    window.addEventListener('lifemap:profile-change', (e: any) => {
      if (e.detail) handleProfileSelect(e.detail);
    });
  });

  const handleCalculate = async (data: BirthData, options?: ChartOptions) => {
    setLoading(true);
    setError('');

    try {
      const opts = options || DEFAULT_OPTIONS;
      const result = calculateNatalChart(data, {
        houseSystem: opts.houseSystem || 'placidus',
        includeExtraPoints: opts.includeExtraPoints !== false,
        includeAsteroids: opts.includeAsteroids || false,
        aspectOrbs: opts.aspectOrbs,
      });
      setChart(result);
      setSvgHtml(renderWheel(result));

      if (data.name || data.city) {
        await saveProfile({
          name: data.name || data.city || 'Sem nome',
          date: data.date,
          time: data.time,
          lat: data.lat,
          lng: data.lng,
          city: data.city || '',
          country: data.country || '',
          timezone: data.timezone,
        });
      }
    } catch (e) {
      console.error('Calculation error:', e);
      setError('Erro ao calcular o mapa. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSelect = (profile: Profile) => {
    const data: BirthData = {
      name: profile.name,
      date: profile.date,
      time: profile.time,
      lat: profile.lat,
      lng: profile.lng,
      timezone: profile.timezone,
      city: profile.city,
      country: profile.country,
    };
    setFormData(data);
    handleCalculate(data);
  };

  // Get child interpretation for a planet in its sign
  const getChildText = (planet: Planet, longitude: number): string => {
    const signIdx = getSignIndex(longitude);
    return CHILD_TEXTS[planet][signIdx] ?? '';
  };

  const currentPlanetInfo = createMemo(() => PLANETS.find(p => p.key === activeTab())!);

  const activePlanetSignName = createMemo(() => {
    const c = chart();
    if (!c) return '';
    const pos = c.positions[activeTab()];
    if (!pos) return '';
    return SIGN_NAMES[getSignIndex(pos.longitude)];
  });

  const activePlanetSignEmoji = createMemo(() => {
    const c = chart();
    if (!c) return '';
    const pos = c.positions[activeTab()];
    if (!pos) return '';
    return SIGN_EMOJIS[getSignIndex(pos.longitude)];
  });

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left: Form */}
      <div class="lg:col-span-1 lg:sticky lg:top-20 flex flex-col gap-4">
        <BirthDataForm onCalculate={handleCalculate} locale={props.locale} initialData={formData()} />
      </div>

      {/* Right: Chart + Interpretation */}
      <div class="lg:col-span-2 space-y-6">
        <Show when={error()}>
          <div class="p-3 bg-red-900/20 border border-red-800/30 rounded-lg text-sm text-red-400">
            {error()}
          </div>
        </Show>

        <Show when={loading()}>
          <div class="text-center py-8 text-muted">
            <div class="animate-spin text-3xl mb-2 text-gold">✦</div>
            <p class="text-sm">Calculando posições astronômicas...</p>
          </div>
        </Show>

        {/* Wheel */}
        <Show when={chart()}>
          {/* Chart name banner */}
          <div class="glass rounded-2xl p-4 border border-gold/20 flex items-center gap-3">
            <span class="text-3xl">👶</span>
            <div>
              <div class="font-serif text-lg text-gold font-bold">
                {chart()?.meta?.name || 'Mapa Infantil'}
              </div>
              <div class="text-xs text-muted">
                {chart()?.meta?.city && <span>{chart()!.meta.city} · </span>}
                {chart()?.date && new Date(chart()!.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Wheel SVG */}
          <div class="glass rounded-2xl p-4">
            <div class="w-full max-w-[600px] mx-auto" innerHTML={svgHtml()} />
          </div>

          {/* ── CHILD INTERPRETATION TABS ── */}
          <div class="glass rounded-2xl p-4 border border-base-300">
            <div class="mb-4">
              <h2 class="text-base font-serif font-semibold text-cream flex items-center gap-2">
                🌟 Interpretação Infantil
              </h2>
              <p class="text-xs text-muted mt-1">Clique em cada planeta para ver a interpretação</p>
            </div>

            {/* Planet Tabs */}
            <div class="flex gap-2 flex-wrap mb-5">
              <For each={PLANETS}>
                {(planet) => {
                  const pos = chart()?.positions[planet.key];
                  const signIdx = pos ? getSignIndex(pos.longitude) : -1;
                  const signName = signIdx >= 0 ? SIGN_NAMES[signIdx] : '';
                  return (
                    <button
                      onClick={() => setActiveTab(planet.key)}
                      class={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                        activeTab() === planet.key
                          ? 'border-gold/50 bg-gold/10 text-gold shadow-sm'
                          : 'border-base-300 text-muted hover:text-cream hover:bg-base-200'
                      }`}
                    >
                      <span class="text-base">{planet.emoji}</span>
                      <div class="text-left">
                        <div class="text-xs font-semibold">{planet.label}</div>
                        <Show when={signName}>
                          <div class="text-[10px] opacity-70">{signName}</div>
                        </Show>
                      </div>
                    </button>
                  );
                }}
              </For>
            </div>

            {/* Active Planet Interpretation Card */}
            <Show when={chart()?.positions[activeTab()]}>
              {(() => {
                const planet = () => currentPlanetInfo();
                const text = () => getChildText(planet().key, chart()!.positions[planet().key]!.longitude);
                const signName = () => activePlanetSignName();
                const signEmoji = () => activePlanetSignEmoji();

                return (
                  <div
                    class="rounded-2xl p-5 border transition-all"
                    style={{ 'border-color': planet().color + '40', 'background': planet().color + '0a' }}
                  >
                    {/* Planet + Sign header */}
                    <div class="flex items-center gap-3 mb-4">
                      <div
                        class="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm"
                        style={{ background: planet().color + '20', border: `2px solid ${planet().color}50` }}
                      >
                        {planet().emoji}
                      </div>
                      <div>
                        <div class="font-serif font-bold text-cream text-base">
                          {planet().label} em {signName()} {signEmoji()}
                        </div>
                        <div class="text-xs mt-0.5" style={{ color: planet().color }}>
                          {planet().symbol} {planet().theme}
                        </div>
                      </div>
                    </div>

                    {/* Interpretation text */}
                    <p class="text-sm text-cream-dark leading-relaxed">
                      {text()}
                    </p>
                  </div>
                );
              })()}
            </Show>
          </div>

          {/* All planets quick summary */}
          <div class="glass rounded-2xl p-4 border border-base-300">
            <h3 class="text-sm font-semibold text-cream mb-3 flex items-center gap-2">
              🌈 Resumo dos Talentos
            </h3>
            <div class="space-y-3">
              <For each={PLANETS}>
                {(planet) => {
                  const pos = chart()?.positions[planet.key];
                  if (!pos) return null;
                  const signIdx = getSignIndex(pos.longitude);
                  const signName = SIGN_NAMES[signIdx];
                  const signEmoji = SIGN_EMOJIS[signIdx];
                  const text = CHILD_TEXTS[planet.key][signIdx];
                  // Show only first sentence of the text
                  const firstSentence = text?.split('.')[0] + '.' || '';

                  return (
                    <div class="flex items-start gap-3 py-2 border-b border-base-300/40 last:border-0">
                      <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                        style={{ background: planet.color + '20', color: planet.color }}
                      >
                        {planet.emoji}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-semibold text-cream mb-0.5">
                          {planet.label} em {signName} {signEmoji}
                        </div>
                        <p class="text-xs text-cream-dark leading-relaxed">{firstSentence}</p>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>

          {/* Planet Table */}
          <PlanetTable chart={chart()} />
        </Show>

        {/* Empty state */}
        <Show when={!chart() && !loading()}>
          <div class="glass rounded-2xl p-12 text-center border border-base-300">
            <div class="text-6xl mb-4">👶</div>
            <h3 class="font-serif text-lg text-cream mb-2">Mapa Infantil</h3>
            <p class="text-sm text-muted max-w-sm mx-auto">
              Preencha os dados de nascimento da criança para revelar seus talentos, necessidades e potenciais únicos. ✨
            </p>
          </div>
        </Show>
      </div>
    </div>
  );
}
