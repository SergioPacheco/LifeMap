// ============================================================
// INTERPRETATIONS — Português (pt)
// Repositório completo de textos interpretativos
// Fonte única de verdade para o relatório natal em PT
// ============================================================

// Re-export dos textos existentes (evita duplicação)
import { VENUS_IN_HOUSE as _VENUS, MARS_IN_HOUSE as _MARS, NORTH_NODE_HOUSE as _NN_HOUSE, NORTH_NODE_IN_SIGN as _NN_SIGN } from '../interpret';
import { JUPITER_IN_HOUSE as _JUPITER, SATURN_IN_HOUSE as _SATURN, URANUS_IN_HOUSE as _URANUS, NEPTUNE_IN_HOUSE as _NEPTUNE, PLUTO_IN_HOUSE as _PLUTO } from '../outer-planets';
import { CHIRON_IN_HOUSE as _CHIRON, CHIRON_IN_SIGN as _CHIRON_SIGN } from '../chiron';

// ============================================================
// SOL NAS CASAS
// ============================================================
export const SUN_IN_HOUSE: string[] = [
  /* Casa 1  */ 'Seu brilho pessoal está na forma como você se apresenta ao mundo. Você veio para ser visto, para marcar presença. A casa 1 pede que você honre sua individualidade — quando você se permite ser quem é, sem máscaras, as coisas fluem. Seu desafio é não depender da aprovação alheia para brilhar.',
  /* Casa 2  */ 'Sua identidade está profundamente ligada àquilo que você constrói e valoriza. Você brilha quando desenvolve seus talentos e os transforma em algo concreto. Segurança material não é vaidade para você — é expressão do seu valor. O desafio é não se definir apenas pelo que possui.',
  /* Casa 3  */ 'Você nasceu para comunicar, ensinar, conectar ideias. Seu brilho está na leveza, na curiosidade, na capacidade de traduzir coisas complexas em algo acessível. Se você trabalha num lugar onde não pode expressar sua opinião ou criar, algo estará faltando. Quando você honra essa qualidade comunicativa, a abundância vem.',
  /* Casa 4  */ 'Sua identidade está enraizada na família, no lar, nas suas bases emocionais. Você brilha quando cria um espaço seguro — para si e para os outros. Pode ser a pessoa que sustenta emocionalmente uma família ou comunidade. O desafio é não se perder nas necessidades dos outros a ponto de esquecer de si.',
  /* Casa 5  */ 'Você nasceu para criar, se expressar, brilhar! A casa 5 é o palco natural do Sol. Criatividade, romance, filhos, diversão — tudo isso te energiza. Quando você se permite ser lúdico e autêntico, você irradia. O desafio é não buscar validação constante nem confundir ego com essência.',
  /* Casa 6  */ 'Sua identidade se expressa no serviço, na rotina, no aprimoramento constante. Você brilha quando é útil, quando resolve problemas, quando cuida dos detalhes que ninguém vê. Saúde e trabalho são áreas sagradas para você. O desafio é não se anular em nome da produtividade.',
  /* Casa 7  */ 'Seu brilho se revela nos relacionamentos. Você se descobre através do outro — parceiros, sócios, acordos. Isso não significa dependência: significa que o espelho do relacionamento te ajuda a enxergar quem você é. O desafio é não se perder no outro nem projetar sua identidade em parceiros.',
  /* Casa 8  */ 'Sua identidade passa por transformações profundas ao longo da vida. Você brilha em situações de crise, quando tudo parece desmoronar e você renasce. Temas como sexualidade, poder, recursos compartilhados são centrais. O desafio é não se apegar ao controle nem temer a vulnerabilidade.',
  /* Casa 9  */ 'Você nasceu para expandir horizontes — estudos profundos, viagens que mudam sua perspectiva, filosofias de vida. Seu brilho está em ser um eterno estudante e, eventualmente, um mestre que compartilha sabedoria. O desafio é não se perder em teorias sem aplicação prática.',
  /* Casa 10 */ 'Sua identidade está fortemente ligada à sua carreira e imagem pública. Você veio para construir algo no mundo, para ser reconhecido pelo que realiza com maestria. Não é vaidade — é propósito. O desafio é equilibrar vida pessoal com a pressão por resultados externos.',
  /* Casa 11 */ 'Seu brilho está em causas coletivas, amizades, projetos para o futuro. Você se energiza em grupos, quando trabalha por algo maior que você mesmo. Inovação e originalidade te definem. O desafio é não se distanciar emocionalmente das pessoas mais próximas.',
  /* Casa 12 */ 'Sua identidade tem uma dimensão espiritual profunda. Você brilha nos bastidores, na solidão criativa, na conexão com algo maior. Pode ser difícil se mostrar ao mundo porque seu brilho é sutil, interior. O desafio é não se sabotar nem fugir da vida prática.',
];

// ============================================================
// LUA NAS CASAS
// ============================================================
export const MOON_IN_HOUSE: string[] = [
  /* Casa 1  */ 'Suas emoções estão escritas no seu rosto — você é transparente, as pessoas sentem o que você sente. Precisa de liberdade para ser emocional sem julgamento. Seu corpo reage diretamente ao seu estado emocional.',
  /* Casa 2  */ 'Você se sente seguro quando tem estabilidade financeira. Não é ganância — é que dinheiro representa segurança emocional para você. Pode ter altos e baixos financeiros que refletem seus ciclos emocionais.',
  /* Casa 3  */ 'Você processa emoções conversando, escrevendo, movimentando a mente. Precisa de estímulo intelectual para se sentir bem. O ambiente dos irmãos e vizinhança marcou suas emoções na infância.',
  /* Casa 4  */ 'Esta é a posição mais natural da Lua. Família e lar são sagrados para você. Precisa de um espaço físico que sinta como "seu" para se recarregar. As emoções da sua mãe (ou figura materna) impactaram profundamente quem você é.',
  /* Casa 5  */ 'Você se nutre emocionalmente quando se diverte, cria algo ou está apaixonado. Precisa de expressão criativa como válvula emocional. Com filhos, a relação é intensa e profundamente emocional.',
  /* Casa 6  */ 'Sua saúde física é diretamente impactada pelas suas emoções. Quando algo emocional não vai bem, o corpo sinaliza. Precisa de uma rotina que inclua autocuidado para se sentir centrado.',
  /* Casa 7  */ 'Você se sente emocionalmente completo em relacionamentos. Precisa de parceria para se sentir seguro — e atrai parceiros que espelham seu lado emocional (inclusive as sombras). O desafio é não terceirizar seu bem-estar emocional.',
  /* Casa 8  */ 'Suas emoções são intensas, profundas, às vezes avassaladoras. Você sente tudo com muita intensidade e tem facilidade para perceber o que os outros escondem. Pode ter dificuldade de se abrir, mas quando confia alguém, é com alma.',
  /* Casa 9  */ 'Você se nutre emocionalmente quando está aprendendo, viajando ou explorando novas perspectivas. Precisa de espaço e liberdade para crescer. Pode ter dificuldade com rotina e com conexões emocionais "normais" — prefere profundidade filosófica.',
  /* Casa 10 */ 'Suas emoções estão ligadas à carreira e reconhecimento público. Pode sentir que precisa "ser alguém" para merecer amor. A relação com a mãe pode ter sido marcada por expectativas de desempenho.',
  /* Casa 11 */ 'Você se nutre em amizades e causas coletivas. Precisa de pertencimento a um grupo que compartilhe seus ideais. Pode ter dificuldade com intimidade um-a-um, preferindo relações mais amplas.',
  /* Casa 12 */ 'Suas emoções têm uma qualidade oceânica — profundas, às vezes confusas, com fronteiras difusas. Precisa de solidão para processar o que sente. Tem forte intuição e empatia, mas precisa aprender a se proteger emocionalmente.',
];

// ============================================================
// MERCÚRIO NAS CASAS
// ============================================================
export { MERCURY_IN_HOUSE } from './pt-mercury';

// ============================================================
// VÊNUS, MARTE, EXTERIORES, QUÍRON, NODO (re-export dos fontes existentes)
// ============================================================
export const VENUS_IN_HOUSE = _VENUS;
export const MARS_IN_HOUSE = _MARS;
export const JUPITER_IN_HOUSE = _JUPITER;
export const SATURN_IN_HOUSE = _SATURN;
export const URANUS_IN_HOUSE = _URANUS;
export const NEPTUNE_IN_HOUSE = _NEPTUNE;
export const PLUTO_IN_HOUSE = _PLUTO;
export const CHIRON_IN_HOUSE = _CHIRON;
export const CHIRON_IN_SIGN = _CHIRON_SIGN;
export const NORTH_NODE_HOUSE = _NN_HOUSE;
export const NORTH_NODE_IN_SIGN = _NN_SIGN;

// ============================================================
// NOMES E LABELS
// ============================================================
export const SIGN_NAMES: string[] = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
];

export const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  northNode: 'Nodo Norte', chiron: 'Quíron', lilith: 'Lilith',
};

export const MONTHS: string[] = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

export const SECTION_TITLES = {
  sun: (house: number, sign: string) => `☉ Sol na Casa ${house} em ${sign}`,
  moon: (house: number, sign: string) => `☽ Lua na Casa ${house} em ${sign}`,
  mercury: (house: number, sign: string) => `☿ Mercúrio na Casa ${house} em ${sign}`,
  venus: (house: number, sign: string) => `♀ Vênus na Casa ${house} em ${sign}`,
  mars: (house: number, sign: string) => `♂ Marte na Casa ${house} em ${sign}`,
  jupiter: (house: number, sign: string) => `♃ Júpiter na Casa ${house} em ${sign}`,
  saturn: (house: number, sign: string) => `♄ Saturno na Casa ${house} em ${sign}`,
  uranus: (house: number, sign: string) => `♅ Urano na Casa ${house} em ${sign}`,
  neptune: (house: number, sign: string) => `♆ Netuno na Casa ${house} em ${sign}`,
  pluto: (house: number, sign: string) => `♇ Plutão na Casa ${house} em ${sign}`,
  northNode: (house: number, sign: string) => `☊ Nodo Norte na Casa ${house} em ${sign}`,
  chiron: (house: number, sign: string) => `⚷ Quíron na Casa ${house} em ${sign}`,
  ascendant: (sign: string) => `Ascendente em ${sign}`,
};

export const PLANET_SUBTITLES: Record<string, string> = {
  sun: 'Sua essência solar — identidade, propósito e energia vital',
  moon: 'Seu mundo emocional — necessidades, instintos e segurança interior',
  mercury: 'Sua mente e comunicação — como você pensa, aprende e se expressa',
  venus: 'Sua linguagem do amor — o que você atrai, valoriza e deseja nos relacionamentos',
  mars: 'Seu impulso e ação — como você persegue objetivos, se impõe e deseja',
  jupiter: 'Seu caminho de expansão — onde abundância, sabedoria e crescimento fluem naturalmente',
  saturn: 'Sua zona de maestria — onde disciplina, estrutura e conquista duradoura são forjadas',
  uranus: 'Sua revolução interior — onde você rompe padrões e expressa originalidade',
  neptune: 'Seu portal espiritual — onde dissolve fronteiras e conecta com o transcendente',
  pluto: 'Seu poder transformador — onde morte e renascimento operam no nível mais profundo',
  northNode: 'Seu propósito evolutivo — a direção para a qual sua alma se move nesta vida',
  chiron: 'Sua ferida sagrada — a dor que se torna dom de cura quando integrada',
};

// ============================================================
// LABELS DO RELATÓRIO
// ============================================================
export const LABELS = {
  reportTitle: 'Relatório Natal Completo',
  reportSubtitle: 'Interpretação Profunda',
  positions: 'Posições Planetárias',
  houses: 'Cúspides das Casas',
  overview: 'Visão Geral',
  potentials: 'Seus 5 Maiores Potenciais',
  challenges: 'Seus 5 Principais Desafios',
  conclusion: 'Conclusão',
  advice: 'Conselho Prático',
  elements: 'Elementos e Modalidades',
  dignities: 'Dignidades Essenciais',
  aspects: 'Aspectos Principais',
  themes: 'Síntese por Tema',
  quote: '"O astro inclina, não obriga." — máxima da astrologia humanista',
  sampleNote: 'Esta foi uma amostra gratuita!',
  sampleFull: 'O relatório completo contém 20-30 páginas com interpretação detalhada de todos os planetas, casas, aspectos e previsões.',
  buyNow: 'Versão completa:',
  buyInstant: 'Compre agora e baixe instantaneamente — 100% no navegador.',
  natalChart: 'Seu Mapa Natal',
  retrograde: '(retrógrado)',
  // Annual
  annualTitle: 'Previsão Anual',
  annualSubtitle: 'Trânsitos e tendências',
  profection: 'Profecção Anual — Tema do Ano',
  houseInFocus: 'em Foco',
  rulerOfYear: 'Regente do Ano',
  eclipses: 'Eclipses do Ano',
  jupiterExpansion: 'A Expansão do Ano',
  saturnLesson: 'A Lição do Ano',
  conclusionAnnual: 'Conclusão — Seu Ano em Perspectiva',
  // Relationship
  relationshipTitle: 'Relatório de Relacionamento',
  compatibility: 'Compatibilidade',
  emotionalConnection: 'Conexão Emocional',
  attractionChemistry: 'Atração e Química',
  communication: 'Comunicação',
  commitmentLimits: 'Comprometimento e Limites — Saturno',
  growthPotential: 'Potencial de Crescimento',
  challengesTension: 'Pontos de Tensão',
  // Psychological
  psychTitle: 'Análise Psicológica Profunda',
  egoStructure: 'Estrutura do Ego — Sol e Ascendente',
  emotionalWorld: 'Mundo Emocional — Lua',
  mentalProcesses: 'Processos Mentais — Mercúrio',
  lovePatterns: 'Padrões de Amor — Vênus',
  vitalForce: 'Força Vital — Marte',
  shadow: 'Sombra — Plutão',
  wound: 'Ferida Central — Quíron',
  unconscious: 'Inconsciente — Casa 12 e Netuno',
  familyPatterns: 'Padrões Familiares — Lua, Casa 4 e Saturno',
  defenseMechanisms: 'Mecanismos de Defesa — Saturno e Aspectos Tensos',
  integrationPath: 'Caminho de Integração — Nodo Norte',
  // Career
  careerTitle: 'Carreira e Vocação',
  midheaven: 'Meio do Céu',
  house10: 'Casa 10 — Vocação e Reconhecimento',
  house6: 'Casa 6 — Rotina e Trabalho',
  house2: 'Casa 2 — Recursos e Talentos',
  // Seven Sins
  sinsTitle: 'Os Sete Pecados',
  pride: 'Orgulho — Sol',
  lust: 'Luxúria — Vênus e Marte',
  greed: 'Avareza — Saturno',
  gluttony: 'Gula — Júpiter',
  wrath: 'Ira — Marte',
  envy: 'Inveja — Plutão',
  sloth: 'Preguiça — Netuno',
};

// ============================================================
// CONECTORES NARRATIVOS
// ============================================================
export const TRANSITIONS = {
  afterOverview: 'Essa base de identidade se manifesta de formas concretas quando olhamos os planetas em suas casas.',
  afterPersonalPlanets: 'Os aspectos entre os planetas revelam como essas energias conversam entre si — onde há fluidez e onde há tensão.',
  afterAspects: 'Dessas interações emergem padrões — temas centrais que definem sua experiência de vida.',
  beforeConclusion: 'Reunindo tudo o que vimos, sua carta conta uma história coerente — e é hora de sintetizar.',
};
