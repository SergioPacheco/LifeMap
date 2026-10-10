// ============================================================
// INTERPRET.TS — Interpretation Engine
// Abordagem: Planeta na CASA primeiro (prático), depois signo como tempero
// Baseado em astrologia humanística: autoconhecimento e potencial
// ============================================================

import { getSignIndex } from '../engine/calculations';
import type { NatalChart } from '../engine/types';
import { CHIRON_IN_HOUSE, CHIRON_IN_SIGN } from '../engine/chiron';
import { getInterpretations } from './interpretations/index';
import type { InterpLocale } from './interpretations/index';

// ============================================================
// PLANET IN HOUSE — Interpretações narrativas e práticas
// Foco: o que o planeta PEDE na área de vida (casa)
//
// SUN_IN_HOUSE, MOON_IN_HOUSE e MERCURY_IN_HOUSE foram movidos
// para src/engine/interpretations/ e são carregados via getInterpretations().
// VENUS/MARS/NORTH_NODE vivem em interpretations/classic-houses.ts
// (módulo leaf, sem ciclo) e são reexportados abaixo.
// ============================================================

export {
  VENUS_IN_HOUSE,
  MARS_IN_HOUSE,
  NORTH_NODE_HOUSE,
  NORTH_NODE_IN_SIGN,
} from './interpretations/classic-houses';

// ============================================================
// PLANET IN SIGN — Complemento (o "tempero" na expressão)
// ============================================================

export const SUN_SIGN_FLAVOR: string[] = [
  /* Áries */     'E faz isso com a coragem do pioneiro — age antes que os outros terminem de pensar, inicia o que ninguém ousou começar e inspira pelo exemplo direto. Sua energia se renova cada manhã como se fosse o primeiro dia. O desafio é a impaciência: aprender que nem tudo que vale a pena responde ao seu tempo.',
  /* Touro */     'E faz isso com a perseverança do construtor — termina o que começa, constrói com as mãos e com o tempo, e valoriza o que é real e tangível. Há uma inteligência sensorial que percebe qualidade onde outros veem apenas forma. O desafio é a resistência à mudança: o conforto pode se tornar prisão.',
  /* Gêmeos */    'E faz isso com a curiosidade do mensageiro — transita entre assuntos, pessoas e mundos com agilidade única, conectando pontos que ninguém mais vê. Há um dom comunicativo natural que traduz o complexo em acessível. O desafio é a profundidade: saber um pouco sobre tudo pode impedir mergulhar fundo em algo.',
  /* Câncer */    'E faz isso com a sensibilidade do guardião — percebe o estado emocional dos outros com precisão instintiva e cria ambientes onde as pessoas se sentem seguras para ser quem são. Há uma inteligência emocional profunda que funciona como bússola. O desafio é o apego ao passado: memórias podem ter mais presença que o momento.',
  /* Leão */      'E faz isso com a generosidade do soberano — irradia calor, inspira confiança e lembra aos outros que a vida pode ser celebrada. Há um magnetismo natural que ilumina qualquer ambiente em que entra. A criatividade é uma necessidade vital, não um hobby. O desafio é o orgulho: a necessidade de reconhecimento pode obscurecer a essência genuína.',
  /* Virgem */    'E faz isso com a precisão do artesão — vê o que está faltando, o que pode ser melhorado, o que está desalinhado, e transforma conceitos abstratos em sistemas funcionais. Há uma ética de trabalho que gera excelência genuína. O desafio é a autocrítica: o mesmo olho que vê defeitos nos outros volta-se para dentro com severidade.',
  /* Libra */     'E faz isso com a diplomacia do mediador — percebe o desequilíbrio em qualquer situação e busca instintivamente a harmonia, a justiça e a beleza. Há um charme social que faz cada pessoa sentir-se ouvida e valorizada. O desafio é a indecisão: ver todos os lados com clareza pode tornar impossível escolher um deles.',
  /* Escorpião */ 'E faz isso com a intensidade do alquimista — vai onde os outros não têm coragem de ir, vê o que está oculto e não se contenta com superfícies. Há uma profundidade psicológica que detecta motivações invisíveis e verdades não ditas. O desafio é a desconfiança: o medo de ser vulnerável pode se expressar como necessidade de controle.',
  /* Sagitário */ 'E faz isso com o entusiasmo do explorador — encontra ângulo de expansão em qualquer situação, busca verdade com honestidade direta e compartilha sabedoria com generosidade. Há um otimismo irredutível que inspira os outros a também acreditar. O desafio é o excesso: "mais é mais" pode levar a promessas maiores que a capacidade de cumprir.',
  /* Capricórnio */ 'E faz isso com a disciplina do arquiteto — constrói não apenas para o momento, mas para durar gerações. Há uma ambição com substância: não apenas quer subir, quer que o que construiu permaneça. A reputação é um ativo de décadas de consistência. O desafio é a rigidez: a dificuldade em relaxar ou permitir prazer sem culpa.',
  /* Aquário */   'E faz isso de forma genuinamente original — questiona o que todos aceitam, percebe possibilidades que a maioria não está pronta para ver e se importa com a humanidade como coletivo. Há um pensamento visionário que naturalmente se adianta ao tempo. O desafio é a distância emocional: amar a humanidade pode coexistir com dificuldade de intimidade individual.',
  /* Peixes */    'E faz isso com a compaixão do visionário — sente o que os outros sentem como se fosse seu, acessa imagens e intuições que a razão não alcança e percebe a conexão invisível entre todas as coisas. Há uma criatividade e espiritualidade naturais que transcendem o ordinário. O desafio é a dissolução de limites: absorver demais do ambiente pode gerar confusão sobre o que é seu e o que é do outro.',
];

export const MERCURY_SIGN_FLAVOR: string[] = [
  /* Áries     */ 'Pensamento rápido, direto, sem rodeios. Toma decisões instantaneamente e se frustra com pessoas que "ficam em cima do muro". Excelente para lançar ideias novas e inspirar com entusiasmo — perde o fio quando o projeto exige paciência analítica. Comunicação por vezes brusca, mas sem segundas intenções.',
  /* Touro     */ 'Pensa de forma deliberada e sequencial — não é lento, é cuidadoso. Chega a conclusões sólidas que resistem ao tempo. Aprende melhor com exemplos concretos e aplicações práticas. Voz geralmente agradável, comunicação direta e com peso. Dificuldade em mudar de opinião uma vez que ela está formada.',
  /* Gêmeos    */ 'Mercúrio em seu domicílio — mente em alta velocidade, capaz de processar múltiplas informações simultaneamente. Linguagem vivaz, wit afiado, talento para argumentação. Pode falar pelos dois lados de uma questão com igual convicção. Excelente para jornalismo, ensino e escrita.',
  /* Câncer    */ 'Pensa com o coração tanto quanto com a mente. As palavras carregam emoção — e percebe a emoção por trás das palavras dos outros. Memória extraordinária para conversas e atmosferas. Pode demorar para responder, mas quando fala, o que diz fica. Comunicação por vezes indireta, mas profundamente honesta.',
  /* Leão      */ 'Pensa de forma criativa e grandiosa. Comunicação teatral, com estilo e presença que capturam a atenção. Excelente para apresentações, liderança e inspiração de grupos. Quando entusiasmado com uma ideia, a persuasão é irresistível. O desafio é ouvir perspectivas que contradizem a visão já formada.',
  /* Virgem    */ 'Mercúrio em exaltação — a mente mais precisa do zodíaco. Analisa, categoriza, encontra padrões que os outros não veem. Comunicação exata, com fatos e dados. Excelente para escrita técnica, pesquisa e ensino prático. Pode ser extremamente crítico na forma de se expressar, mesmo sem intenção de ferir.',
  /* Libra     */ 'Pensa em termos de relação — "de um lado... do outro lado". Comunicação diplomática, cuidadosa, que considera o impacto nas outras pessoas. Excelente mediador e negociador. Pode demorar a comunicar posições definitivas por medo de desagradar. Raciocina melhor em diálogo do que em isolamento.',
  /* Escorpião */ 'Pensa em camadas — sempre buscando o que está por baixo da superfície. Detecta incongruências, inconsistências e motivações ocultas com precisão perturbadora. Fala pouco, mas o que diz tem peso e profundidade. Excelente para pesquisa, psicologia e investigação. Pode ser mordaz quando provocado.',
  /* Sagitário */ 'Pensa em grandes sistemas, não em detalhes. Visão panorâmica, filosófica, orientada ao sentido e ao propósito. Comunicação entusiasmada e inspiradora que mobiliza. Pode ser impreciso nos detalhes ou falar antes de ter as informações completas. Excelente para ensino e discurso motivacional.',
  /* Capricórnio */ 'Pensa de forma estruturada, com metas e resultados em mente. Comunicação séria, concisa, com autoridade natural. Pesa as palavras antes de falar — não se interessa por conversa sem propósito. Excelente para planejamento, estratégia e administração. Humor seco e inteligente que poucos alcançam.',
  /* Aquário   */ 'Pensa em sistemas e padrões — vê conexões entre coisas aparentemente não relacionadas. Comunicação objetiva, às vezes brilhante, às vezes fria demais para quem espera calor humano. Excelente para inovação, ciência e pensamento estratégico. Pode apresentar ideias revolucionárias com uma calma desconcertante.',
  /* Peixes    */ 'Pensa em imagens, metáforas e sentimentos — não em conceitos lineares. Intuição como processo mental primário. Comunicação poética, impressionista, que captura verdades que a razão analítica não alcança. Pode ser difusa ou imprecisa, mas frequentemente está mais perto da essência do que a lógica permite.',
];

export const VENUS_SIGN_FLAVOR: string[] = [
  /* Áries     */ 'Ama a conquista, a novidade, o frescor. Flerta sendo direta e audaciosa — vai atrás de quem deseja sem rodeios. Precisa que o relacionamento permaneça emocionante; estagna em rotinas muito confortáveis. Atraído por quem tem energia, independência e não tem medo de desafiar. O amor é uma aventura, não um porto seguro.',
  /* Touro     */ 'Vênus em domicílio — amor expresso pela sua forma mais sensual e material. Ama através do toque, da comida, da presença física constante. Precisa de estabilidade e previsibilidade no relacionamento. Possessivo, mas também incrivelmente fiel e consistente. Atraído por beleza natural, qualidade e conforto. Demora para se abrir, mas quando ama, é para valer.',
  /* Gêmeos    */ 'Ama através das palavras, das ideias, das conversas intermináveis que varam a noite. Precisa de estimulação intelectual no relacionamento — tédio é fatal. Flerta com wit e leveza. Atraído por pessoas inteligentes, versáteis, com histórias para contar. Pode parecer frio para quem espera intensidade emocional, mas conecta pela mente com profundidade surpreendente.',
  /* Câncer    */ 'Ama com profundidade emocional e cuidado — nutre e protege quem ama com toda a alma. Precisa sentir-se segura antes de se abrir completamente. Atraída por pessoas que transmitem estabilidade e proteção. O relacionamento ideal é um refúgio do mundo. Muito sensível a rejeição; guarda mágoas por muito tempo, mas também guarda amor.',
  /* Leão      */ 'Ama com generosidade e grandeza — gestos românticos, declarações, presentes elaborados, atenção total. Precisa ser admirada e celebrada no relacionamento. Atraída por pessoas confiantes, generosas e que a fazem sentir especial. Extremamente leal quando seu amor é reconhecido. O relacionamento precisa ser uma fonte de alegria e brilho mútuo.',
  /* Virgem    */ 'Ama através do serviço e da atenção aos detalhes — aprende seus hábitos, prepara o que você precisa antes de pedir, está presente nos pequenos gestos. Pode ter dificuldade em se expressar romanticamente de forma grandiosa. Atraída por pessoas competentes, inteligentes e éticas. Amor discreto, mas profundamente confiável e presente.',
  /* Libra     */ 'Vênus em domicílio — amor expresso em sua forma mais elegante e relacional. Precisa de parceria harmoniosa, com respeito mútuo e beleza na interação. Atraída por pessoas que valorizam a estética, a justiça e a cortesia. Conflitos abertos são muito desconfortáveis. O melhor do amor para Vênus em Libra é a criação de uma vida bonita a dois.',
  /* Escorpião */ 'Amor total ou nada — não existe intensidade moderada aqui. Precisa de profundidade, fusão e honestidade absoluta. Atraída pelo mistério, pela complexidade e pela sensação de que há sempre mais para descobrir. Ciúme pode ser intenso, assim como a devoção. Quando encontra alguém seguro o suficiente para a vulnerabilidade, a entrega é incomparável.',
  /* Sagitário */ 'Ama com liberdade e alegria — o parceiro é um companheiro de aventura, não uma âncora. Precisa de espaço, variedade e crescimento mútuo no relacionamento. Atraída por pessoas com visão de mundo rica, senso de humor e disposição para explorar. Comprometimento sim, mas com leveza e sem grades. O amor deve expandir, nunca contrair.',
  /* Capricórnio */ 'Amor que se comprova com ações ao longo do tempo, não com declarações dramáticas. Leva relacionamentos a sério — não se envolve com leveza nem por capricho. Atraída por pessoas maduras, ambiciosas e confiáveis. Pode parecer fria no início, mas a devoção construída devagar é inabalável e profundamente comprometida.',
  /* Aquário   */ 'Ama com liberdade e amizade como base — o melhor relacionamento é aquele onde ambos mantêm sua individualidade intacta. Atraída por pessoas originais, inteligentes e não convencionais. Afeto expresso de formas inesperadas, fora do script. A conexão intelectual é tão importante quanto a emocional — talvez mais.',
  /* Peixes    */ 'Vênus em exaltação — amor em sua forma mais idealizada e transcendente. Ama com devoção, compaixão e disposição para o sacrifício. Atraída pela arte, pela espiritualidade e pela sensibilidade. O perigo é o romantismo idealista que ignora a realidade do parceiro. Quando integrada, esta é a Vênus que vê beleza onde ninguém mais vê.',
];

export const MARS_SIGN_FLAVOR: string[] = [
  /* Áries     */ 'Marte em dignidade aqui — sua posição de maior poder. Age por instinto, com velocidade e decisão. Energia altíssima para iniciar; nem sempre termina o que começa. Raiva flameja rápido e passa rápido — sem rancor. Atlético, competitivo, motivado por desafios. Prefere ação direta à estratégia elaborada.',
  /* Touro     */ 'Ritmo lento mas absolutamente inabalável — "devagar e sempre" como filosofia de ação. Difícil de provocar, mas quando a paciência acaba, a explosão é monumental e memorável. Orientado para resultados tangíveis; não desperdiça energia em batalhas que não valem a pena. Sensualidade forte na expressão da energia.',
  /* Gêmeos    */ 'Energia em rajadas — explosões de produtividade seguidas de dispersão. Age através das palavras: debate, argumentação e persuasão são suas armas mais eficazes. Fica energizado com variedade e novidade; paralisa na repetição. Bom em múltiplos projetos simultâneos, mas precisa aprender a concluir cada um deles.',
  /* Câncer    */ 'Ação motivada pela emoção e pela necessidade de proteção — "o melhor ataque é a defesa." Pode ser indireto na busca pelo que quer, raramente confrontando de frente. Energia variável conforme o humor e as fases emocionais. Quando ativado para proteger alguém que ama, pode surpreender com determinação inesperada.',
  /* Leão      */ 'Age com bravura e estilo — não apenas vence, quer vencer com classe e ser reconhecido pela vitória. Energia direcionada para projetos que deixam legado visível. Motivado por reconhecimento e impacto. Líder nato na ação que assume responsabilidades com orgulho. Pode se tornar dominador quando o ego entra em jogo.',
  /* Virgem    */ 'Energia direcionada com precisão cirúrgica — sem desperdício, sem movimentos desnecessários. Prefere trabalhar de forma sistemática e metódica, passo a passo. Motivado pela sensação de utilidade e eficiência. Excelente em execução de planos detalhados. Pode ser excessivamente crítico dos métodos dos outros.',
  /* Libra     */ 'Marte em detrimento — age melhor quando tem um parceiro ou quando age por uma causa de justiça. Usa diplomacia e persuasão como estratégia de ação em vez de força bruta. Conflito direto é extremamente desconfortável. Quando finalmente age, faz de forma calculada, equilibrada e irrefutável.',
  /* Escorpião */ 'Marte em domicílio tradicional — energia focada com precisão e profundidade estratégica. Age de forma deliberada, raramente impulsiva. Tem resistência extraordinária para objetivos de longo prazo que outros abandonariam. Motivado por transformação e poder verdadeiro. Adversários raramente percebem que estão sendo contornados.',
  /* Sagitário */ 'Age com entusiasmo e otimismo contagiante — motiva-se por ideais e pela visão de um futuro melhor. Energia abundante para novos projetos que expandem horizontes. Excelente para inspirar outros a agir juntos. Raiva raramente dura — se resolve com honestidade, humor e movimento para frente.',
  /* Capricórnio */ 'Marte em exaltação — a posição mais eficiente e estratégica para a ação. Age com planejamento, paciência e determinação que não cede. Não desperdiça energia em batalhas que não valem o esforço a longo prazo. Constrói o que quer com consistência disciplinada. Metas de décadas são sua especialidade.',
  /* Aquário   */ 'Age por ideais e causas coletivas — motivado pela inovação, reforma e ruptura do status quo. Prefere mudar sistemas inteiros do que batalhar individualmente. Pode ser imprevisível na forma de agir — sua estratégia raramente é óbvia para observadores externos. Energia mais eficiente em grupo do que sozinho.',
  /* Peixes    */ 'Age de forma indireta, fluida e adaptável — como água que contorna obstáculos. Motivado pela compaixão e pela visão espiritual. Pode ter dificuldade em sustentar energia em projetos puramente pragmáticos. Energia melhor usada em arte, cura, espiritualidade e serviço. Quando alinhado com uma causa maior, a persistência é surpreendente.',
];

export const MOON_SIGN_FLAVOR: string[] = [
  'Emocionalmente, reage com impulso imediato — precisa de ação e movimento para processar o que sente. Não suporta passividade diante do desconforto; a energia emocional precisa de canais diretos. Aprende a se acalmar não pela quietude, mas pela iniciativa.',
  'Emocionalmente, busca estabilidade e conforto sensorial acima de tudo. Se acalma com toque, comida, natureza e previsibilidade. Lento para processar mudanças emocionais, mas quando se ancora, a estabilidade que oferece aos outros é incomparável.',
  'Emocionalmente, processa sentimentos falando, escrevendo ou buscando informação. A mente precisa nomear o que sente antes de poder acolher. Pode parecer emocionalmente "leve", mas é porque transita entre estados com agilidade — não porque não sente profundamente.',
  'Emocionalmente, está profundamente conectado à família, às memórias e ao senso de pertencimento. Precisa de segurança emocional como alimento básico. Inteligência emocional profunda — percebe o estado interior das pessoas com precisão instintiva. A casa (interna e externa) é sagrada.',
  'Emocionalmente, precisa de expressão dramática, reconhecimento afetivo e senso de especialidade. Se nutre quando se sente visto, celebrado e admirado por quem ama. Generosidade emocional enorme quando se sente seguro. O coração precisa de palco — não por ego, mas por natureza.',
  'Emocionalmente, analisa o que sente antes de se permitir sentir completamente. A mesma mente que resolve problemas pode tornar-se uma máquina de autoexame que não descansa. Se nutre quando se sente útil e quando a vida está organizada. Precisa de reasseguramento de que emoções desordenadas são seguras.',
  'Emocionalmente, busca harmonia e evita conflitos — às vezes se anulando para preservar a paz exterior. Se nutre em ambientes bonitos, em companhia agradável e em relações equilibradas. O desafio é permitir-se sentir raiva e desconforto sem culpa — harmonia real inclui honestidade.',
  'Emocionalmente, sente tudo com intensidade absoluta — sem meio-termo, sem escape. Percebe o que os outros escondem e tem dificuldade de se abrir sem garantia de segurança total. Quando confia alguém, é com toda a alma. A profundidade emocional é tanto dom quanto desafio.',
  'Emocionalmente, precisa de liberdade, perspectiva ampla e espaço para expandir. Se nutre com viagens, filosofia, humor e visão de futuro. Pode ter dificuldade com conexões emocionais "normais" — prefere profundidade filosófica a intimidade rotineira.',
  'Emocionalmente, é contido e precisa sentir que "merece" ser cuidado — pode ter aprendido cedo que chorar não é seguro. Responsabilidade emocional pesada que amadurece com o tempo. Com os anos, a frieza inicial se transforma em profunda estabilidade emocional e força interior.',
  'Emocionalmente, se distancia para observar antes de se envolver — precisa de espaço e não se permite ser engolido por sentimentos. Necessidade de liberdade dentro do afeto. Processa emoções de forma original e nem sempre compartilha o que sente nos termos esperados.',
  'Emocionalmente, absorve o ambiente como uma esponja — sente o que os outros sentem como se fosse seu. Sensibilidade oceânica que precisa de limites para não se dissolver. Intuição profunda e empatia natural. Precisa de solidão regular para se recompor e distinguir seus sentimentos dos alheios.',
];

// ============================================================
// ASCENDANT INTERPRETATION
// ============================================================

export const ASCENDANT_TEXT: string[] = [
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

// (NORTH_NODE texts moved to interpretations/classic-houses.ts; re-exported above.)

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
 *
 * @param chart - The natal chart data
 * @param locale - Language for internationalised arrays ('pt' | 'en' | 'es'). Defaults to 'pt'.
 *                 Backward-compatible: calling without locale keeps the original Portuguese output.
 */
export function generateNatalInterpretation(chart: NatalChart, locale: InterpLocale = 'pt'): InterpretationSection[] {
  const sections: InterpretationSection[] = [];

  // Load internationalised texts for SUN, MOON and MERCURY
  const interp = getInterpretations(locale);
  const SIGN_NAMES = interp.SIGN_NAMES;
  const titles = interp.SECTION_TITLES;

  // --- 1. ASCENDANT ---
  const ascSign = getSignIndex(chart.houses.ascendant);
  sections.push({
    title: titles.ascendant(SIGN_NAMES[ascSign]),
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
    const houseText = interp.SUN_IN_HOUSE[sunHouse - 1] || '';
    const flavorText = SUN_SIGN_FLAVOR[sunSign] || '';

    sections.push({
      title: titles.sun(sunHouse, SIGN_NAMES[sunSign]),
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
    const houseText = interp.MOON_IN_HOUSE[moonHouse - 1] || '';
    const flavorText = MOON_SIGN_FLAVOR[moonSign] || '';

    sections.push({
      title: titles.moon(moonHouse, SIGN_NAMES[moonSign]),
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
      title: titles.mercury(mercHouse, SIGN_NAMES[mercSign]),
      planet: 'mercury',
      symbol: '☿',
      text: `${interp.MERCURY_IN_HOUSE[mercHouse - 1] || ''} ${flavorText}`,
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
      title: titles.venus(venusHouse, SIGN_NAMES[venusSign]),
      planet: 'venus',
      symbol: '♀',
      text: `${interp.VENUS_IN_HOUSE[venusHouse - 1] || ''} ${venusFlavorText}`,
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
      title: titles.mars(marsHouse, SIGN_NAMES[marsSign]),
      planet: 'mars',
      symbol: '♂',
      text: `${interp.MARS_IN_HOUSE[marsHouse - 1] || ''} ${marsFlavorText}`,
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
    const houseText = interp.NORTH_NODE_HOUSE[nnHouse - 1] || '';
    const signText = interp.NORTH_NODE_IN_SIGN[nnSign] || '';
    sections.push({
      title: titles.northNode(nnHouse, SIGN_NAMES[nnSign]),
      planet: 'northNode',
      symbol: '☊',
      text: `${houseText} ${signText}`,
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
    const houseText = interp.CHIRON_IN_HOUSE[chironHouse - 1] || '';
    const signText = interp.CHIRON_IN_SIGN[chironSign] || '';
    sections.push({
      title: titles.chiron(chironHouse, SIGN_NAMES[chironSign]),
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
