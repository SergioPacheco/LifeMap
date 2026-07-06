// ============================================================
// INTERPRET.TS — Interpretation Engine
// Abordagem: Planeta na CASA primeiro (prático), depois signo como tempero
// Baseado em astrologia humanística: autoconhecimento e potencial
// ============================================================

import { getSignIndex } from '../engine/calculations';
import type { NatalChart } from '../engine/types';
import { CHIRON_IN_HOUSE, CHIRON_IN_SIGN } from '../engine/chiron';

// ============================================================
// PLANET IN HOUSE — Interpretações narrativas e práticas
// Foco: o que o planeta PEDE na área de vida (casa)
// ============================================================

const SUN_IN_HOUSE: string[] = [
  /* Casa 1 */ 'Seu brilho pessoal está na forma como você se apresenta ao mundo. Você veio para ser visto, para marcar presença. A casa 1 pede que você honre sua individualidade — quando você se permite ser quem é, sem máscaras, as coisas fluem. Seu desafio é não depender da aprovação alheia para brilhar.',
  /* Casa 2 */ 'Sua identidade está profundamente ligada àquilo que você constrói e valoriza. Você brilha quando desenvolve seus talentos e os transforma em algo concreto. Segurança material não é vaidade para você — é expressão do seu valor. O desafio é não se definir apenas pelo que possui.',
  /* Casa 3 */ 'Você nasceu para comunicar, ensinar, conectar ideias. Seu brilho está na leveza, na curiosidade, na capacidade de traduzir coisas complexas em algo acessível. Se você trabalha num lugar onde não pode expressar sua opinião ou criar, algo estará faltando. Quando você honra essa qualidade comunicativa, a abundância vem.',
  /* Casa 4 */ 'Sua identidade está enraizada na família, no lar, nas suas bases emocionais. Você brilha quando cria um espaço seguro — para si e para os outros. Pode ser a pessoa que sustenta emocionalmente uma família ou comunidade. O desafio é não se perder nas necessidades dos outros a ponto de esquecer de si.',
  /* Casa 5 */ 'Você nasceu para criar, se expressar, brilhar! A casa 5 é o palco natural do Sol. Criatividade, romance, filhos, diversão — tudo isso te energiza. Quando você se permite ser lúdico e autêntico, você irradia. O desafio é não buscar validação constante nem confundir ego com essência.',
  /* Casa 6 */ 'Sua identidade se expressa no serviço, na rotina, no aprimoramento constante. Você brilha quando é útil, quando resolve problemas, quando cuida dos detalhes que ninguém vê. Saúde e trabalho são áreas sagradas para você. O desafio é não se anular em nome da produtividade.',
  /* Casa 7 */ 'Seu brilho se revela nos relacionamentos. Você se descobre através do outro — parceiros, sócios, acordos. Isso não significa dependência: significa que o espelho do relacionamento te ajuda a enxergar quem você é. O desafio é não se perder no outro nem projetar sua identidade em parceiros.',
  /* Casa 8 */ 'Sua identidade passa por transformações profundas ao longo da vida. Você brilha em situações de crise, quando tudo parece desmoronar e você renasce. Temas como sexualidade, poder, recursos compartilhados são centrais. O desafio é não se apegar ao controle nem temer a vulnerabilidade.',
  /* Casa 9 */ 'Você nasceu para expandir horizontes — estudos profundos, viagens que mudam sua perspectiva, filosofias de vida. Seu brilho está em ser um eterno estudante e, eventualmente, um mestre que compartilha sabedoria. O desafio é não se perder em teorias sem aplicação prática.',
  /* Casa 10 */ 'Sua identidade está fortemente ligada à sua carreira e imagem pública. Você veio para construir algo no mundo, para ser reconhecido pelo que realiza com maestria. Não é vaidade — é propósito. O desafio é equilibrar vida pessoal com a pressão por resultados externos.',
  /* Casa 11 */ 'Seu brilho está em causas coletivas, amizades, projetos para o futuro. Você se energiza em grupos, quando trabalha por algo maior que você mesmo. Inovação e originalidade te definem. O desafio é não se distanciar emocionalmente das pessoas mais próximas.',
  /* Casa 12 */ 'Sua identidade tem uma dimensão espiritual profunda. Você brilha nos bastidores, na solidão criativa, na conexão com algo maior. Pode ser difícil se mostrar ao mundo porque seu brilho é sutil, interior. O desafio é não se sabotar nem fugir da vida prática.',
];

const MOON_IN_HOUSE: string[] = [
  /* Casa 1 */ 'Suas emoções estão escritas no seu rosto — você é transparente, as pessoas sentem o que você sente. Precisa de liberdade para ser emocional sem julgamento. Seu corpo reage diretamente ao seu estado emocional.',
  /* Casa 2 */ 'Você se sente seguro quando tem estabilidade financeira. Não é ganância — é que dinheiro representa segurança emocional para você. Pode ter altos e baixos financeiros que refletem seus ciclos emocionais.',
  /* Casa 3 */ 'Você processa emoções conversando, escrevendo, movimentando a mente. Precisa de estímulo intelectual para se sentir bem. O ambiente dos irmãos e vizinhança marcou suas emoções na infância.',
  /* Casa 4 */ 'Esta é a posição mais natural da Lua. Família e lar são sagrados para você. Precisa de um espaço físico que sinta como "seu" para se recarregar. As emoções da sua mãe (ou figura materna) impactaram profundamente quem você é.',
  /* Casa 5 */ 'Você se nutre emocionalmente quando se diverte, cria algo ou está apaixonado. Precisa de expressão criativa como válvula emocional. Com filhos, a relação é intensa e profundamente emocional.',
  /* Casa 6 */ 'Sua saúde física é diretamente impactada pelas suas emoções. Quando algo emocional não vai bem, o corpo sinaliza. Precisa de uma rotina que inclua autocuidado para se sentir centrado.',
  /* Casa 7 */ 'Você se sente emocionalmente completo em relacionamentos. Precisa de parceria para se sentir seguro — e atrai parceiros que espelham seu lado emocional (inclusive as sombras). O desafio é não terceirizar seu bem-estar emocional.',
  /* Casa 8 */ 'Suas emoções são intensas, profundas, às vezes avassaladoras. Você sente tudo com muita intensidade e tem facilidade para perceber o que os outros escondem. Pode ter dificuldade de se abrir, mas quando confia alguém, é com alma.',
  /* Casa 9 */ 'Você se nutre emocionalmente quando está aprendendo, viajando ou explorando novas perspectivas. Precisa de espaço e liberdade para crescer. Pode ter dificuldade com rotina e com conexões emocionais "normais" — prefere profundidade filosófica.',
  /* Casa 10 */ 'Suas emoções estão ligadas à carreira e reconhecimento público. Pode sentir que precisa "ser alguém" para merecer amor. A relação com a mãe pode ter sido marcada por expectativas de desempenho.',
  /* Casa 11 */ 'Você se nutre em amizades e causas coletivas. Precisa de pertencimento a um grupo que compartilhe seus ideais. Pode ter dificuldade com intimidade um-a-um, preferindo relações mais amplas.',
  /* Casa 12 */ 'Suas emoções têm uma qualidade oceânica — profundas, às vezes confusas, com fronteiras difusas. Precisa de solidão para processar o que sente. Tem forte intuição e empatia, mas precisa aprender a se proteger emocionalmente.',
];

const MERCURY_IN_HOUSE: string[] = [
  /* Casa 1 */ 'Sua mente é rápida e você pensa em voz alta. As pessoas te percebem como alguém inteligente e comunicativo logo de cara.',
  /* Casa 2 */ 'Sua mente está voltada para questões práticas e financeiras. Pode ganhar dinheiro com comunicação, escrita ou comércio.',
  /* Casa 3 */ 'Posição natural de Mercúrio — comunicação fluida, curiosidade insaciável, facilidade com idiomas e aprendizado.',
  /* Casa 4 */ 'Mente ligada à família e memórias. Pode ser a pessoa que guarda as histórias da família ou trabalha de casa.',
  /* Casa 5 */ 'Mente criativa e lúdica. Expressa ideias de forma divertida. Pode se comunicar bem com crianças ou através de arte.',
  /* Casa 6 */ 'Mente analítica e organizada. Excelente para resolver problemas práticos, saúde e rotinas eficientes.',
  /* Casa 7 */ 'Mente que funciona melhor em diálogo. Precisa do outro para pensar e processar ideias. Bom para mediação e negociação.',
  /* Casa 8 */ 'Mente investigativa e psicológica. Interesse por mistérios, temas tabu, psicologia profunda.',
  /* Casa 9 */ 'Mente filosófica e expansiva. Interesse por culturas estrangeiras, estudos superiores, sentido da vida.',
  /* Casa 10 */ 'Comunicação como ferramenta de carreira. Pode se destacar profissionalmente pela inteligência e articulação.',
  /* Casa 11 */ 'Mente voltada para o futuro e causas coletivas. Pensa de forma inovadora e se comunica bem em grupos.',
  /* Casa 12 */ 'Mente contemplativa e intuitiva. Pode ter insights através de sonhos ou meditação. Dificuldade em verbalizar o que sente.',
];

const VENUS_IN_HOUSE: string[] = [
  /* Casa 1 */ 'Charme natural e presença agradável. Atrai as pessoas pela aparência e pelo jeito harmonioso de ser.',
  /* Casa 2 */ 'Amor por conforto material e coisas belas. Pode ter talento para finanças ou para criar ambientes esteticamente agradáveis.',
  /* Casa 3 */ 'Comunicação sedutora e agradável. Aprecia conversas leves, arte literária e relações com irmãos/vizinhos.',
  /* Casa 4 */ 'Amor pelo lar e pela família. Cria espaços bonitos e acolhedores. Pode ter tido uma infância afetivamente rica.',
  /* Casa 5 */ 'Amor romântico intenso e prazeroso. Grande capacidade criativa. Aprecia arte, diversão e expressão pessoal.',
  /* Casa 6 */ 'Expressa amor através do cuidado prático e do serviço. Pode ter romances no trabalho. Aprecia rotinas agradáveis.',
  /* Casa 7 */ 'Posição natural — parceria é essencial. Atrai relacionamentos com facilidade e valoriza harmonia a dois.',
  /* Casa 8 */ 'Amor intenso e transformador. Relacionamentos profundos que mexem com a alma. Pode envolver temas de poder e sexualidade.',
  /* Casa 9 */ 'Amor por viagens, cultura e expansão. Pode se apaixonar por estrangeiros ou por pessoas de filosofias diferentes.',
  /* Casa 10 */ 'Relacionamentos ligados à carreira. Pode ser visto publicamente como alguém charmoso. Amor por status e reconhecimento.',
  /* Casa 11 */ 'Amor nasce da amizade. Valoriza liberdade nos relacionamentos e conexões com pessoas de mente aberta.',
  /* Casa 12 */ 'Amor secreto, espiritual ou platônico. Pode ter dificuldade em manifestar afeto abertamente. Amor como experiência transcendente.',
];

const MARS_IN_HOUSE: string[] = [
  /* Casa 1 */ 'Energia física forte e atitude assertiva. Você vai atrás do que quer sem hesitar. Pode parecer agressivo sem intenção.',
  /* Casa 2 */ 'Luta pelos seus recursos e valores. Determinação para ganhar dinheiro e defender o que é seu.',
  /* Casa 3 */ 'Comunicação direta e às vezes cortante. Mente competitiva. Pode ter conflitos com irmãos ou vizinhos.',
  /* Casa 4 */ 'Energia voltada para proteger o lar. Pode ter tido um ambiente doméstico agitado. Trabalha duro pelo conforto da família.',
  /* Casa 5 */ 'Energia criativa e competitiva. Paixão intensa nos romances. Pode se destacar em esportes ou artes.',
  /* Casa 6 */ 'Trabalhador incansável. Energia voltada para produtividade e resolução de problemas. Cuidado com estresse.',
  /* Casa 7 */ 'Atrai parceiros assertivos ou conflituosos. Relacionamentos são arena de crescimento. Pode ser competitivo a dois.',
  /* Casa 8 */ 'Posição intensa — instinto de sobrevivência forte. Capacidade de renascer das cinzas. Sexualidade como força vital.',
  /* Casa 9 */ 'Energia direcionada para aventura e expansão. Defende suas crenças com paixão. Pode viajar de forma ousada.',
  /* Casa 10 */ 'Ambição profissional forte. Energia direcionada para conquista pública. Pode ter conflitos com autoridade antes de se tornar uma.',
  /* Casa 11 */ 'Luta por causas sociais e coletivas. Energia voltada para inovação e grupos. Pode ser líder de movimentos.',
  /* Casa 12 */ 'Energia sutil e introspectiva. Age nos bastidores. Pode ter raiva reprimida que precisa ser canalizada em práticas espirituais ou artísticas.',
];

// ============================================================
// PLANET IN SIGN — Complemento (o "tempero" na expressão)
// ============================================================

const SUN_SIGN_FLAVOR: string[] = [
  'E faz isso com coragem e iniciativa — não espera permissão para agir.',
  'E faz isso com paciência e persistência — constrói devagar mas solidamente.',
  'E faz isso com leveza e curiosidade — transita entre assuntos com agilidade.',
  'E faz isso com sensibilidade e cuidado — nutre e protege o que ama.',
  'E faz isso com expressividade e generosidade — não consegue brilhar discretamente.',
  'E faz isso com precisão e dedicação — busca aperfeiçoamento constante.',
  'E faz isso com diplomacia e charme — busca equilíbrio em tudo.',
  'E faz isso com intensidade e profundidade — tudo ou nada, sem meios-termos.',
  'E faz isso com entusiasmo e visão — sempre mirando o horizonte.',
  'E faz isso com disciplina e ambição — joga no longo prazo.',
  'E faz isso de forma original e independente — questiona tudo que é convencional.',
  'E faz isso com compaixão e intuição — sente as coisas antes de entendê-las.',
];

const MERCURY_SIGN_FLAVOR: string[] = [
  /* Áries     */ 'Pensa rápido, fala antes de processar. Comunicação direta e assertiva — vai direto ao ponto.',
  /* Touro     */ 'Pensa devagar e com profundidade. Comunicação concreta, confiável e de poucas palavras — mas cada uma vale.',
  /* Gêmeos    */ 'Mente ágil e curiosa, natural de Gêmeos. Transita entre assuntos com leveza e faz conexões que outros não veem.',
  /* Câncer    */ 'Pensa com o coração. Comunica com sensibilidade e memória afetiva — suas palavras nutrem e protegem.',
  /* Leão      */ 'Pensa de forma criativa e narrativa. Comunicação expressiva, carismática — sabe contar histórias que encantam.',
  /* Virgem    */ 'Mente analítica e precisa, natural de Virgem. Processa detalhes que outros ignoram e comunica com clareza cirúrgica.',
  /* Libra     */ 'Pensa pesando todos os lados antes de concluir. Comunicação diplomática e equilibrada — tem dom para mediar.',
  /* Escorpião */ 'Mente investigativa e penetrante. Percebe o que não é dito e comunica com profundidade — às vezes, com ironia afiada.',
  /* Sagitário */ 'Pensa em grandes conceitos e filosofias. Comunicação expansiva e entusiasmada — inspira com visão de futuro.',
  /* Capricórnio */ 'Mente estruturada e estratégica. Comunica com autoridade e objetividade — cada palavra tem propósito.',
  /* Aquário   */ 'Pensa de forma original e não-linear. Comunicação inovadora, às vezes à frente do tempo — provoca reflexão.',
  /* Peixes    */ 'Mente intuitiva e imaginativa. Comunica com metáforas, imagens e sentimentos — captura o que as palavras normalmente não alcançam.',
];

const VENUS_SIGN_FLAVOR: string[] = [
  /* Áries     */ 'Ama com paixão e iniciativa — vai atrás de quem deseja sem rodeios. Prefere parceiros que a desafiem.',
  /* Touro     */ 'Ama com lealdade e sensorialidade. Preza estabilidade, toque e prazer — demora para se abrir, mas quando ama, é para valer.',
  /* Gêmeos    */ 'Ama com curiosidade e leveza. Precisa de diálogo e variedade para se manter encantado — conecta pelo intelecto.',
  /* Câncer    */ 'Ama com profundidade emocional e cuidado. Nutre e protege quem ama — precisa de segurança para se abrir completamente.',
  /* Leão      */ 'Ama com generosidade e dramaticidade. Expressa afeto de forma grandiosamente — precisa de reciprocidade e admiração.',
  /* Virgem    */ 'Ama através do serviço e da atenção aos detalhes. Demonstra amor cuidando — às vezes esquece de dizer com palavras.',
  /* Libra     */ 'Ama com charme e busca de harmonia — natural de Libra. Valoriza beleza, equilíbrio e parceria verdadeira.',
  /* Escorpião */ 'Ama com intensidade absoluta. Tudo ou nada — quando se entrega, é com toda a alma, e espera o mesmo de volta.',
  /* Sagitário */ 'Ama com liberdade e entusiasmo. Precisa de aventura e expansão no amor — sufoca com rotina ou controle.',
  /* Capricórnio */ 'Ama com seriedade e responsabilidade. Constrói relacionamentos duradouros — demonstra amor através de atos concretos.',
  /* Aquário   */ 'Ama com amizade e originalidade. Precisa de liberdade e espaço intelectual — o amor nasce da conexão mental.',
  /* Peixes    */ 'Ama com devoção e romantismo profundo. Enxerga o melhor no outro — precisa aprender a não se perder no amor.',
];

const MARS_SIGN_FLAVOR: string[] = [
  /* Áries     */ 'Age com impulso e coragem — energia máxima em seu domicílio natural. Quando quer algo, vai atrás sem hesitar.',
  /* Touro     */ 'Age com determinação lenta e irresistível. Demora para começar, mas uma vez em movimento, nada o para.',
  /* Gêmeos    */ 'Age com agilidade e diversidade. Prefere múltiplos projetos simultâneos — a energia se renova com variedade.',
  /* Câncer    */ 'Age movido pela proteção emocional. A motivação nasce de sentimentos profundos — briga pelo que ama.',
  /* Leão      */ 'Age com paixão, orgulho e teatralidade. Precisa de palco para a sua força — a visibilidade energiza.',
  /* Virgem    */ 'Age com precisão e método. Direciona a energia para resolver problemas — eficiência é a forma de guerrear.',
  /* Libra     */ 'Age com diplomacia, mas pode ser indeciso. A energia se ativa na busca por justiça e equilíbrio.',
  /* Escorpião */ 'Age com intensidade estratégica. Energia focada, poderosa e difícil de deter — sabe quando e como agir.',
  /* Sagitário */ 'Age com entusiasmo e aventura. Direciona a energia para expansão — a motivação nasce da visão de futuro.',
  /* Capricórnio */ 'Age com disciplina e visão de longo prazo. Exaltado aqui — canaliza a força para conquistas duradouras.',
  /* Aquário   */ 'Age de forma inovadora e às vezes imprevisível. Direciona energia para causas coletivas e rupturas necessárias.',
  /* Peixes    */ 'Age de forma sutil e intuitiva. A energia flui pelos bastidores — pode precisar de práticas conscientes para não dispersar a força.',
];

const MOON_SIGN_FLAVOR: string[] = [
  'Emocionalmente, reage com impulso e precisa de ação para se acalmar.',
  'Emocionalmente, busca estabilidade e se acalma com conforto sensorial.',
  'Emocionalmente, processa sentimentos falando ou escrevendo.',
  'Emocionalmente, é profundamente conectado à família e memórias.',
  'Emocionalmente, precisa de expressão dramática e reconhecimento afetivo.',
  'Emocionalmente, analisa o que sente antes de se permitir sentir.',
  'Emocionalmente, busca harmonia e evita conflitos (às vezes se anulando).',
  'Emocionalmente, sente tudo com intensidade absoluta — sem meio-termo.',
  'Emocionalmente, precisa de liberdade e perspectiva ampla para se sentir bem.',
  'Emocionalmente, é contido e precisa sentir que "merece" ser cuidado.',
  'Emocionalmente, se distancia para observar antes de se envolver.',
  'Emocionalmente, absorve o ambiente como uma esponja — precisa de limites.',
];

// ============================================================
// ASCENDANT INTERPRETATION
// ============================================================

const ASCENDANT_TEXT: string[] = [
  /* Áries */ 'Seu ascendente em Áries faz com que as pessoas te percebam como alguém corajoso, direto e enérgico. Sua primeira reação diante do mundo é agir. Você projeta independência e iniciativa — mas isso pode assustar quem espera diplomacia.',
  /* Touro */ 'Seu ascendente em Touro projeta calma, estabilidade e sensualidade. As pessoas te veem como alguém confiável e com os pés no chão. Sua primeira reação é observar antes de agir — você não se apressa.',
  /* Gêmeos */ 'Seu ascendente em Gêmeos faz com que pareça comunicativo, curioso e adaptável. As pessoas te percebem como alguém inteligente e versátil. Sua primeira reação é questionar, dialogar, buscar informação.',
  /* Câncer */ 'Seu ascendente em Câncer projeta cuidado, sensibilidade e acolhimento. As pessoas sentem que podem confiar em você. Sua primeira reação é proteger — a si mesmo e aos outros.',
  /* Leão */ 'Seu ascendente em Leão projeta presença, carisma e autoconfiança. As pessoas te notam quando você entra num ambiente. Sua primeira reação é se expressar e marcar território.',
  /* Virgem */ 'Seu ascendente em Virgem projeta competência, discrição e atenção aos detalhes. As pessoas te veem como alguém confiável e útil. Sua primeira reação é analisar e organizar.',
  /* Libra */ 'Seu ascendente em Libra projeta charme, equilíbrio e elegância. As pessoas te percebem como alguém agradável e justo. Sua primeira reação é buscar harmonia e considerar o outro.',
  /* Escorpião */ 'Seu ascendente em Escorpião projeta intensidade, mistério e magnetismo. As pessoas sentem sua presença mesmo quando você está em silêncio. Sua primeira reação é observar profundamente antes de se revelar.',
  /* Sagitário */ 'Seu ascendente em Sagitário projeta otimismo, entusiasmo e liberdade. As pessoas te percebem como alguém aventureiro e bem-humorado. Sua primeira reação é expandir, explorar, buscar sentido.',
  /* Capricórnio */ 'Seu ascendente em Capricórnio projeta seriedade, competência e maturidade. As pessoas te veem como alguém responsável e ambicioso. Sua primeira reação é planejar e estruturar.',
  /* Aquário */ 'Seu ascendente em Aquário projeta originalidade, independência e pensamento futurista. As pessoas te percebem como alguém diferente e intelectual. Sua primeira reação é questionar a norma.',
  /* Peixes */ 'Seu ascendente em Peixes projeta sensibilidade, empatia e uma aura etérea. As pessoas sentem que você os compreende profundamente. Sua primeira reação é absorver o ambiente — o que pode ser tanto dom quanto desafio.',
];

// ============================================================
// NODES INTERPRETATION (Eixo Nódulo Sul → Nódulo Norte)
// ============================================================

const NORTH_NODE_HOUSE: string[] = [
  /* Casa 1 */ 'Nodo Norte na Casa 1: Você já domina o "nós" (parceria, diplomacia) e agora veio aprender a ser independente, a se colocar em primeiro lugar sem culpa. Sua missão é desenvolver identidade própria.',
  /* Casa 2 */ 'Nodo Norte na Casa 2: Você já domina transformações e recursos dos outros. Agora veio aprender a construir sua própria segurança, seus próprios valores. Autossuficiência é o caminho.',
  /* Casa 3 */ 'Nodo Norte na Casa 3: Você já tem a sabedoria dos estudos profundos (casa 9) e agora veio aprender a comunicar com leveza, a ensinar de forma acessível, a ouvir mais do que pregar.',
  /* Casa 4 */ 'Nodo Norte na Casa 4: Você já domina a vida pública e a carreira. Agora veio aprender a nutrir suas bases emocionais, cuidar da família e criar raízes verdadeiras.',
  /* Casa 5 */ 'Nodo Norte na Casa 5: Você já pertence a grupos e causas coletivas. Agora veio aprender a brilhar individualmente, a criar, a se divertir sem culpa. Expressão pessoal é o caminho.',
  /* Casa 6 */ 'Nodo Norte na Casa 6: Você já domina o mundo espiritual e a solitude. Agora veio aprender a servir no cotidiano, organizar a vida prática e cuidar do corpo.',
  /* Casa 7 */ 'Nodo Norte na Casa 7: Você já é independente e auto-suficiente. Agora veio aprender a abrir espaço para o outro, a negociar, a construir parcerias verdadeiras.',
  /* Casa 8 */ 'Nodo Norte na Casa 8: Você já domina o conforto material e a estabilidade. Agora veio aprender a se transformar, a se entregar, a lidar com poder e vulnerabilidade.',
  /* Casa 9 */ 'Nodo Norte na Casa 9: Você já domina a comunicação e o conhecimento superficial. Agora veio aprender a se aprofundar, expandir horizontes, criar sua própria filosofia de vida.',
  /* Casa 10 */ 'Nodo Norte na Casa 10: Você já domina o lar e as emoções. Agora veio aprender a construir algo no mundo, a assumir responsabilidade pública e deixar um legado.',
  /* Casa 11 */ 'Nodo Norte na Casa 11: Você já brilha individualmente. Agora veio aprender a trabalhar por causas maiores, a integrar grupos e pensar no coletivo.',
  /* Casa 12 */ 'Nodo Norte na Casa 12: Você já domina a organização e o serviço prático. Agora veio aprender a soltar o controle, confiar na intuição e conectar-se com algo transcendente.',
];

// ============================================================
// EXPORT
// ============================================================

export interface InterpretationSection {
  title: string;
  planet: string;
  symbol: string;
  text: string;
  sign: string;
  house: number;
  category?: 'identity' | 'emotion' | 'mind' | 'love' | 'action' | 'direction' | 'mask';
}

/**
 * Generate natal interpretation following the approach:
 * 1. Ascendant (first impression / mask)
 * 2. Sun in House (identity + purpose) + sign as flavor
 * 3. Moon in House (emotional needs) + sign as flavor
 * 4. Mercury, Venus, Mars in House
 * 5. North Node (life direction)
 */
export function generateNatalInterpretation(chart: NatalChart): InterpretationSection[] {
  const sections: InterpretationSection[] = [];

  const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

  // --- 1. ASCENDANT ---
  const ascSign = getSignIndex(chart.houses.ascendant);
  sections.push({
    title: `Ascendente em ${SIGN_NAMES[ascSign]}`,
    planet: 'ascendant',
    symbol: 'AC',
    text: ASCENDANT_TEXT[ascSign] || '',
    sign: SIGN_NAMES[ascSign],
    house: 1,
    category: 'mask',
  });

  // --- 2. SUN ---
  const sunPos = chart.positions.sun;
  if (sunPos) {
    const sunSign = getSignIndex(sunPos.longitude);
    const sunHouse = chart.planetHouses.sun || 1;
    const houseText = SUN_IN_HOUSE[sunHouse - 1] || '';
    const flavorText = SUN_SIGN_FLAVOR[sunSign] || '';

    sections.push({
      title: `☉ Sol na Casa ${sunHouse} em ${SIGN_NAMES[sunSign]}`,
      planet: 'sun',
      symbol: '☉',
      text: `${houseText} ${flavorText}`,
      sign: SIGN_NAMES[sunSign],
      house: sunHouse,
      category: 'identity',
    });
  }

  // --- 3. MOON ---
  const moonPos = chart.positions.moon;
  if (moonPos) {
    const moonSign = getSignIndex(moonPos.longitude);
    const moonHouse = chart.planetHouses.moon || 1;
    const houseText = MOON_IN_HOUSE[moonHouse - 1] || '';
    const flavorText = MOON_SIGN_FLAVOR[moonSign] || '';

    sections.push({
      title: `☽ Lua na Casa ${moonHouse} em ${SIGN_NAMES[moonSign]}`,
      planet: 'moon',
      symbol: '☽',
      text: `${houseText} ${flavorText}`,
      sign: SIGN_NAMES[moonSign],
      house: moonHouse,
      category: 'emotion',
    });
  }

  // --- 4. MERCURY ---
  const mercPos = chart.positions.mercury;
  if (mercPos) {
    const mercSign = getSignIndex(mercPos.longitude);
    const mercHouse = chart.planetHouses.mercury || 1;
    const flavorText = MERCURY_SIGN_FLAVOR[mercSign] || '';
    sections.push({
      title: `☿ Mercúrio na Casa ${mercHouse} em ${SIGN_NAMES[mercSign]}`,
      planet: 'mercury',
      symbol: '☿',
      text: `${MERCURY_IN_HOUSE[mercHouse - 1] || ''} ${flavorText}`,
      sign: SIGN_NAMES[mercSign],
      house: mercHouse,
      category: 'mind',
    });
  }

  // --- 5. VENUS ---
  const venusPos = chart.positions.venus;
  if (venusPos) {
    const venusSign = getSignIndex(venusPos.longitude);
    const venusHouse = chart.planetHouses.venus || 1;
    const venusFlavorText = VENUS_SIGN_FLAVOR[venusSign] || '';
    sections.push({
      title: `♀ Vênus na Casa ${venusHouse} em ${SIGN_NAMES[venusSign]}`,
      planet: 'venus',
      symbol: '♀',
      text: `${VENUS_IN_HOUSE[venusHouse - 1] || ''} ${venusFlavorText}`,
      sign: SIGN_NAMES[venusSign],
      house: venusHouse,
      category: 'love',
    });
  }

  // --- 6. MARS ---
  const marsPos = chart.positions.mars;
  if (marsPos) {
    const marsSign = getSignIndex(marsPos.longitude);
    const marsHouse = chart.planetHouses.mars || 1;
    const marsFlavorText = MARS_SIGN_FLAVOR[marsSign] || '';
    sections.push({
      title: `♂ Marte na Casa ${marsHouse} em ${SIGN_NAMES[marsSign]}`,
      planet: 'mars',
      symbol: '♂',
      text: `${MARS_IN_HOUSE[marsHouse - 1] || ''} ${marsFlavorText}`,
      sign: SIGN_NAMES[marsSign],
      house: marsHouse,
      category: 'action',
    });
  }

  // --- 7. NORTH NODE (if available) ---
  const nnPos = chart.positions.northNode;
  if (nnPos) {
    const nnSign = getSignIndex(nnPos.longitude);
    const nnHouse = chart.planetHouses.northNode || 1;
    sections.push({
      title: `☊ Nodo Norte na Casa ${nnHouse}`,
      planet: 'northNode',
      symbol: '☊',
      text: NORTH_NODE_HOUSE[nnHouse - 1] || '',
      sign: SIGN_NAMES[nnSign],
      house: nnHouse,
      category: 'direction',
    });
  }

  // --- 8. CHIRON (if available) ---
  const chironPos = chart.positions.chiron;
  if (chironPos) {
    const chironSign = getSignIndex(chironPos.longitude);
    const chironHouse = chart.planetHouses.chiron || 1;
    const houseText = CHIRON_IN_HOUSE[chironHouse - 1] || '';
    const signText = CHIRON_IN_SIGN[chironSign] || '';
    sections.push({
      title: `⚷ Quíron na Casa ${chironHouse} em ${SIGN_NAMES[chironSign]}`,
      planet: 'chiron',
      symbol: '⚷',
      text: `${houseText} ${signText}`,
      sign: SIGN_NAMES[chironSign],
      house: chironHouse,
      category: 'direction',
    });
  }

  return sections;
}
