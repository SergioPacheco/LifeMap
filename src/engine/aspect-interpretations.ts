// ============================================================
// ASPECT-INTERPRETATIONS.TS — Interpretação de aspectos natais
// Formato: [planeta1][planeta2][tipo_aspecto] → texto
// ============================================================

import type { AspectType } from './types';

// ============================================================
// TIPOS DE ASPECTO — significados base
// ============================================================

export const ASPECT_NATURE: Record<AspectType, { nature: 'hard' | 'soft' | 'neutral'; keyword: string; description: string }> = {
  conjunction: { nature: 'neutral', keyword: 'fusão', description: 'As duas energias se fundem — intensificação total, para o bem ou para o desafio.' },
  sextile: { nature: 'soft', keyword: 'oportunidade', description: 'Fluidez que precisa de iniciativa — a porta está aberta, mas você precisa entrar.' },
  square: { nature: 'hard', keyword: 'tensão criativa', description: 'Atrito que exige ação — a fonte de maior crescimento, mas também de maior frustração.' },
  trine: { nature: 'soft', keyword: 'facilidade', description: 'Fluxo natural — talento inato que pode ser subestimado por vir fácil demais.' },
  opposition: { nature: 'hard', keyword: 'polaridade', description: 'Duas forças opostas que pedem integração — balancear sem negar nenhum lado.' },
};

// ============================================================
// INTERPRETAÇÕES POR PAR DE PLANETAS + ASPECTO
// Formato: key = "planet1-planet2" → { hard, soft, conjunction }
// ============================================================

interface AspectInterp {
  conjunction: string;
  soft: string;  // trine + sextile
  hard: string;  // square + opposition
}

export const PLANET_ASPECTS: Record<string, AspectInterp> = {
  // --- SOL ---
  'sun-moon': {
    conjunction: 'Identidade e emoções fundidas — singleness of purpose. O que você quer e o que precisa estão alinhados. Pode ter dificuldade em enxergar perspectivas diferentes da sua.',
    soft: 'Harmonia entre vontade e necessidades emocionais. Você se sente confortável consigo mesmo. Facilidade em saber o que quer e como se nutrir.',
    hard: 'Tensão entre identidade (Sol) e necessidades emocionais (Lua). O que você quer racionalmente pode conflitar com o que precisa emocionalmente. Pais podem ter sido modelos conflitantes.',
  },
  'sun-mercury': {
    conjunction: 'Mente e identidade fundidas — você pensa sobre si mesmo e se expressa com naturalidade. Comunicação é parte central de quem você é.',
    soft: 'Facilidade em articular quem você é e o que pensa. Comunicação fluida e congruente com sua identidade.',
    hard: 'Raramente ocorre (Mercúrio nunca está mais que 28° do Sol). Se presente, indica tensão entre pensamento e vontade.',
  },
  'sun-venus': {
    conjunction: 'Charme natural — sua identidade tem uma qualidade agradável, artística e relacional. Você atrai com facilidade. Amor e identidade se fundem.',
    soft: 'Facilidade em relacionamentos e expressão artística. Você agrada naturalmente e tem bom gosto estético. Talentos para diplomacia.',
    hard: 'Raramente ocorre (Vênus nunca está mais que 48° do Sol). Se presente, tensão entre amor-próprio e necessidade de aprovação.',
  },
  'sun-mars': {
    conjunction: 'Energia e vontade fundidas — ação direta, coragem, competitividade. Você faz acontecer, mas pode ser impaciente ou agressivo sem perceber.',
    soft: 'Energia física e vontade trabalham em harmonia. Você age com confiança e determinação saudável. Liderança natural.',
    hard: 'Tensão entre o que quer (Sol) e como age (Marte). Pode haver impulsividade, raiva reprimida ou conflitos com figuras de autoridade masculinas. A lição é canalizar essa energia em ação construtiva.',
  },
  'sun-jupiter': {
    conjunction: 'Otimismo e expansão fundidos à identidade. Confiança abundante, generosidade natural. Cuidado com excesso de promessas ou arrogância.',
    soft: 'Sorte natural, otimismo saudável, oportunidades que aparecem. Você cresce com facilidade quando se permite expandir.',
    hard: 'Excesso — pode prometer demais, gastar demais, acreditar demais em si sem base real. A lição é expansão com responsabilidade.',
  },
  'sun-saturn': {
    conjunction: 'Identidade marcada por disciplina, responsabilidade precoce e seriedade. Pode ter se sentido limitado na infância. Com maturidade, vira autoridade sólida.',
    soft: 'Disciplina e ambição apoiam sua identidade. Você constrói com paciência e colhe resultados duradouros. Maturidade é aliada.',
    hard: 'Tensão entre quem você é e o que sente que "deveria ser". Autocrítica severa, sensação de não ser suficiente. Pai rígido ou ausente. A lição: você não precisa de permissão para brilhar.',
  },
  'sun-uranus': {
    conjunction: 'Identidade radicalmente original — você precisa ser diferente e se recusa a se enquadrar. Pode chocar ou inspirar.',
    soft: 'Originalidade e liberdade apoiam sua identidade. Você inova com naturalidade e atrai oportunidades inusitadas.',
    hard: 'Tensão entre pertencer e ser único. Rebeldia, dificuldade com autoridade, rupturas súbitas na vida. A lição é ser livre sem destruir.',
  },
  'sun-neptune': {
    conjunction: 'Identidade nebulosa — artista, visionário ou escapista. Pode ter dificuldade em se definir. Criatividade e espiritualidade como expressão do eu.',
    soft: 'Sensibilidade artística e intuição natural apoiam quem você é. Facilidade com música, imagem, espiritualidade.',
    hard: 'Identidade confusa — quem sou eu? Pode se perder em ilusões, vícios ou sacrifício. A lição é sonhar com os pés no chão.',
  },
  'sun-pluto': {
    conjunction: 'Identidade intensa e magnética. Você passa por transformações profundas de ego ao longo da vida. Presença poderosa.',
    soft: 'Capacidade de se reinventar e usar poder pessoal com sabedoria. Liderança transformadora.',
    hard: 'Lutas de poder — com autoridades, com o pai, consigo mesmo. Pode manipular ou ser manipulado. A lição é empoderamento sem controle.',
  },

  // --- LUA ---
  'moon-mercury': {
    conjunction: 'Mente e emoções fundidas — você pensa com o coração e racionaliza sentimentos. Boa memória emocional.',
    soft: 'Facilidade em expressar sentimentos e processar emoções pela conversa ou escrita. Inteligência emocional natural.',
    hard: 'Tensão entre razão e emoção. Pode racionalizar demais o que sente ou ser invadido por emoções quando tenta pensar claramente.',
  },
  'moon-venus': {
    conjunction: 'Afeto e emoções fundidos — pessoa amorosa, acolhedora, que cria beleza ao redor. Necessidade de harmonia emocional.',
    soft: 'Facilidade em atrair amor e criar ambientes agradáveis. Você se nutre em relacionamentos e beleza.',
    hard: 'Tensão entre necessidade emocional e forma de amar. Pode se acomodar demais por medo de conflito ou confundir amor com dependência.',
  },
  'moon-mars': {
    conjunction: 'Emoções e ação fundidas — reações intensas, instintivas, às vezes explosivas. Protetor feroz dos que ama.',
    soft: 'Coragem emocional — você age em nome do que sente e protege quem ama com determinação saudável.',
    hard: 'Raiva emocional — reações desproporcionais, impaciência com vulnerabilidade. Pode ter tido uma mãe combativa ou um ambiente doméstico tenso.',
  },
  'moon-jupiter': {
    conjunction: 'Generosidade emocional — otimismo, fé natural, capacidade de nutrir em grande escala. Exagero emocional.',
    soft: 'Felicidade emocional natural. Você encontra sentido e abundância no cuidado e na família.',
    hard: 'Exagero emocional — promete demais, espera demais, pode usar comida/compras para preencher vazio emocional.',
  },
  'moon-saturn': {
    conjunction: 'Emoções contidas — pode ter aprendido cedo que chorar não é seguro. Responsabilidade emocional pesada. Com maturidade, vira força interior.',
    soft: 'Estabilidade emocional. Você lida com sentimentos de forma madura e constrói relações emocionais sólidas.',
    hard: 'Frieza emocional aparente que esconde necessidades profundas de segurança. Mãe ausente ou rígida. Medo de ser vulnerável. A lição é permitir-se sentir.',
  },
  'moon-uranus': {
    conjunction: 'Necessidade emocional de liberdade — inquietude interior, mudanças emocionais súbitas. Pode ter tido uma mãe não convencional.',
    soft: 'Intuição elétrica e capacidade de inovar emocionalmente. Você processa sentimentos de forma original.',
    hard: 'Instabilidade emocional — oscilações, dificuldade com intimidade constante, medo de ser engolido. Precisa de espaço dentro do afeto.',
  },
  'moon-neptune': {
    conjunction: 'Sensibilidade oceânica — empatia extrema, intuição psíquica, dificuldade com fronteiras emocionais. Artista nato.',
    soft: 'Intuição e compaixão naturais. Você se conecta com o sofrimento alheio e canaliza em arte ou cura.',
    hard: 'Confusão emocional — dificuldade em separar seus sentimentos dos alheios. Pode idealizar figuras maternas ou escapar pela fantasia.',
  },
  'moon-pluto': {
    conjunction: 'Emoções intensas e profundas — tudo que sente é absoluto. Pode ter passado por crises emocionais transformadoras.',
    soft: 'Profundidade emocional como força — você entende as camadas ocultas dos sentimentos e se regenera com facilidade.',
    hard: 'Intensidade emocional que pode se tornar manipulação ou obsessão. Mãe controladora ou dinâmica familiar com segredos. A cura vem ao soltar o controle.',
  },

  // --- VENUS-MARS (amor-ação) ---
  'venus-mars': {
    conjunction: 'Desejo e afeto fundidos — atração magnética, sexualidade expressiva, paixão intensa. Você sabe o que quer no amor e vai atrás.',
    soft: 'Harmonia entre dar e receber no amor. Sexualidade saudável e integrada. Atração e afeto trabalham juntos.',
    hard: 'Tensão entre o que deseja e o que atrai — pode querer tipos que não são bons para você, ou ter conflito entre independência e parceria. A lição é integrar ternura e paixão.',
  },
  'venus-saturn': {
    conjunction: 'Amor sério e comprometido — pode demorar para se abrir, mas quando ama é para sempre. Medo de rejeição.',
    soft: 'Relações maduras e duradouras. Você leva amor a sério e constrói parcerias sólidas com paciência.',
    hard: 'Medo de não ser amável, dificuldade em se abrir, relações com pessoas mais velhas ou inacessíveis. A lição é que você merece amor sem precisar "provar" nada.',
  },
  'venus-neptune': {
    conjunction: 'Amor idealizado — romântico, artístico, às vezes ilusório. Dificuldade em ver o outro como é. Amor como experiência espiritual.',
    soft: 'Romantismo saudável, sensibilidade artística refinada. Você ama com profundidade e beleza.',
    hard: 'Ilusão no amor — pode atrair parceiros que precisam de resgate ou se perder em fantasias românticas. A lição é amar sem projetar.',
  },
  'venus-pluto': {
    conjunction: 'Amor intenso e transformador — relações profundas que mudam sua vida. Possessividade e magnetismo andam juntos.',
    soft: 'Capacidade de amar profundamente e se transformar através de relações. Atração magnética natural.',
    hard: 'Dinâmicas de poder no amor — ciúme, controle, medo de perda. Atração por relações proibidas ou intensas demais. A cura vem ao amar sem possuir.',
  },

  // --- MARS-SATURN (ação-limite) ---
  'mars-saturn': {
    conjunction: 'Determinação de aço — quando decide algo, vai até o fim. Pode haver frustração com lentidão ou bloqueio. Disciplina marcial.',
    soft: 'Ação estratégica e paciente. Você combina energia com estrutura — execução disciplinada e resultados concretos.',
    hard: 'Raiva reprimida ou energia bloqueada. Pode sentir que tudo que faz encontra obstáculo. A lição é paciência estratégica — o timing de Saturno não é o de Marte.',
  },

  // --- JUPITER-SATURN (expansão-contração) ---
  'jupiter-saturn': {
    conjunction: 'Tensão produtiva entre expansão e contração. Grandes ambições que exigem trabalho real. Ciclo de 20 anos na sociedade.',
    soft: 'Equilíbrio entre otimismo e realismo. Você sonha grande E executa. Sucesso sustentável.',
    hard: 'Oscilação entre esperança e pessimismo, entre arriscar e se proteger. A lição é encontrar o meio-termo entre fé e disciplina.',
  },

  // --- MERCURY COM EXTERIORES ---
  'mercury-jupiter': {
    conjunction: 'Mente expansiva — você pensa grande, comunica com entusiasmo e tem facilidade para estudos superiores.',
    soft: 'Pensamento otimista e visão ampla. Facilidade com idiomas, filosofia e ensino.',
    hard: 'Pode prometer mais do que entrega mentalmente, dispersar em muitos interesses ou exagerar em argumentos.',
  },
  'mercury-saturn': {
    conjunction: 'Mente séria e estruturada — pensamento profundo mas pode ser pessimista ou lento para se expressar.',
    soft: 'Pensamento disciplinado e organizado. Comunicação precisa e responsável. Bom para escrita técnica.',
    hard: 'Dificuldade de expressão, medo de falar errado, bloqueio comunicativo. Com maturidade, vira comunicação autoridade.',
  },
  'mercury-uranus': {
    conjunction: 'Mente brilhante e elétrica — insights súbitos, pensamento original, pode ser genial ou caótico.',
    soft: 'Intuição intelectual forte. Facilidade com tecnologia, ciência e ideias revolucionárias.',
    hard: 'Mente inquieta e rebelde — dificuldade em seguir raciocínios lineares. Nervosismo mental. Pode parecer excêntrico.',
  },
  'mercury-neptune': {
    conjunction: 'Mente poética e intuitiva — grande imaginação, mas pode ter dificuldade com fatos concretos.',
    soft: 'Criatividade verbal, sensibilidade artística, comunicação inspiradora. Bom para música e poesia.',
    hard: 'Confusão mental, dificuldade de foco, pode mentir sem perceber ou acreditar em informações falsas. A lição é discernimento.',
  },
  'mercury-pluto': {
    conjunction: 'Mente investigativa e penetrante — você vai além da superfície. Palavras com poder de transformação.',
    soft: 'Capacidade de pesquisa profunda, psicologia, comunicação que transforma. Bom para investigação.',
    hard: 'Obsessão mental, pensamentos sombrios, comunicação manipuladora. A lição é usar o poder da palavra para curar, não controlar.',
  },

  // --- MARS COM EXTERIORES ---
  'mars-jupiter': {
    conjunction: 'Energia abundante e entusiástica — ação grandiosa, generosidade no esforço. Pode exagerar no impulso.',
    soft: 'Ação otimista e expansiva. Sucesso em empreendimentos, esporte e aventura.',
    hard: 'Impulsividade exagerada, excesso de confiança na ação. Pode se meter em situações maiores do que pode resolver.',
  },
  'mars-uranus': {
    conjunction: 'Ação explosiva e imprevisível — impulsos súbitos, necessidade de liberdade total, possível rebeldia.',
    soft: 'Energia inovadora e corajosa. Age de forma original e surpreende. Bom para empreendedorismo radical.',
    hard: 'Impulsividade perigosa, acidentes, rupturas súbitas. A lição é canalizar a energia rebelde em inovação construtiva.',
  },
  'mars-neptune': {
    conjunction: 'Ação inspirada ou confusa — pode ser o artista apaixonado ou o guerreiro sem direção.',
    soft: 'Energia direcionada por intuição e compaixão. Ação a serviço de ideais elevados.',
    hard: 'Energia dispersa, ação sem foco, pode usar escapismos como "combustível". A lição é agir com inspiração mas sem ilusão.',
  },
  'mars-pluto': {
    conjunction: 'Poder e determinação extremos — quando quer algo, move montanhas. Pode ser obsessivo ou destrutivo.',
    soft: 'Força de transformação — capacidade de regeneração, resistência extraordinária. Poder usado com sabedoria.',
    hard: 'Raiva destrutiva, compulsividade, dinâmicas de poder. Pode atrair situações de violência ou coerção. A cura é empoderamento consciente.',
  },

  // --- SATURN COM EXTERIORES ---
  'saturn-uranus': {
    conjunction: 'Tensão entre tradição e inovação — estrutura que precisa se adaptar ou rachar.',
    soft: 'Capacidade de inovar dentro de estruturas. Reforma ao invés de revolução. Mudança responsável.',
    hard: 'Conflito entre segurança e liberdade. Sensação de estar preso em estruturas que não suporta mais. Rupturas periódicas.',
  },
  'saturn-neptune': {
    conjunction: 'Sonhos que precisam de forma — materializar ideais, espiritualidade com disciplina.',
    soft: 'Capacidade de dar forma concreta a visões e inspirações. Artista disciplinado ou místico prático.',
    hard: 'Desilusão, medo do desconhecido, depressão existencial. A lição é ter fé sem ingenuidade e estrutura sem rigidez.',
  },
  'saturn-pluto': {
    conjunction: 'Poder e controle profundos — capacidade de resistir a qualquer coisa. Pode haver experiências extremas de restrição.',
    soft: 'Determinação inabalável. Capacidade de transformar através de disciplina e paciência. Resiliência profunda.',
    hard: 'Opressão, lutas de poder com autoridades, medo existencial. Pode vivenciar perda de poder para depois reconstruir com mais força.',
  },

  // --- URANUS-NEPTUNE-PLUTO (geracionais) ---
  'uranus-neptune': {
    conjunction: 'Geração com sensibilidade espiritual aliada a insights futuristas (nascidos ~1990-1996).',
    soft: 'Intuição e originalidade se apoiam — visões do futuro com sensibilidade compassiva.',
    hard: 'Tensão entre idealismo e rebeldia. Geração que questiona tanto tradição quanto espiritualidade superficial.',
  },
  'uranus-pluto': {
    conjunction: 'Geração de transformação radical (nascidos ~1963-1968). Revolução profunda e irreversível.',
    soft: 'Capacidade de usar crises como catalisador de inovação. Transformação que liberta.',
    hard: 'Tensão entre desejo de mudança e forças de poder. Geração que vive revoluções sociais e pessoais intensas.',
  },
  'neptune-pluto': {
    conjunction: 'Aspecto geracional muito lento (~ciclo de 492 anos). Define épocas civilizacionais inteiras.',
    soft: 'Transformação espiritual coletiva fluindo na direção da evolução da consciência.',
    hard: 'Crises espirituais e de poder que afetam gerações inteiras — dissolução de estruturas obsoletas.',
  },
};

// ============================================================
// FUNÇÃO: Buscar interpretação de aspecto
// ============================================================

export function getAspectInterpretation(planet1: string, planet2: string, aspectType: AspectType): string {
  // Normalizar ordem (busca bilateral)
  const key1 = `${planet1}-${planet2}`;
  const key2 = `${planet2}-${planet1}`;
  const entry = PLANET_ASPECTS[key1] || PLANET_ASPECTS[key2];

  if (!entry) return '';

  const nature = ASPECT_NATURE[aspectType];
  if (!nature) return '';

  if (aspectType === 'conjunction') return entry.conjunction;
  if (nature.nature === 'soft') return entry.soft;
  if (nature.nature === 'hard') return entry.hard;

  return entry.conjunction; // fallback
}
